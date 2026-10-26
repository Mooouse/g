// Scene lighting in 2D: ambient darkness plus point and spot lights (coloured, flickering), with shadows cast by
// occluders, rendered into a small light map (a quarter of the screen's CSS px by default) that is upscaled and
// multiplied over the scene — then the lights' own glow added on top (bloom). Cheap: a few small gradients per frame
// and two full-screen blits, whatever the number of lights.
//
//   const lights = new LightLayer({ ambient: '#1b2244' });
//   lights.clear();                                     // each frame: the lights of this frame
//   lights.add({ x, y, radius: 220, color: '#ffb35c', flicker: 0.3 });
//   lights.occluders = [{ x: crate.x, y: crate.y, r: 30 }];
//   lights.render(w, h, t, camera);                     // positions in the world; camera maps them (or screen px without)
//   lights.apply(ctx, w, h);                            // after the scene, before the HUD
//
// `dirAt(x, y)` gives the direction toward the dominant light at a point: pass it to paint() (material.light) or pick a
// baked sprite pose by it, so sprites are shaded from where the light really is.

import { canvas2d, type Ctx } from './bake.ts';
import { alpha } from './color.ts';
import { DEFAULT_LIGHT } from './material.ts';
import { noise1 } from './noise.ts';

import type { Pt } from './shapes.ts';

export interface Light {
  x: number;
  y: number;
  radius: number;
  color: string;
  /** 0…∞ (default 1); above 1 burns toward white where the map saturates */
  intensity?: number;
  /** 0…1: how much it flickers (a candle 0.3, a broken lamp 0.8) */
  flicker?: number;
  seed?: number;
  /** A spot light: the direction it points (radians) and its half-angle */
  dir?: number;
  cone?: number;
  /** A spot's light outside its cone, as a share of its intensity (default 0.18: no hard black wedges) */
  spill?: number;
  /** Cast shadows from the occluders (default true) */
  shadows?: boolean;
}

/** Something that casts a shadow: a circle, or a convex or concave polygon (world coordinates, like the lights) */
export type Occluder = { x: number; y: number; r: number } | { pts: Pt[] };

/** What maps world positions to the screen: a Camera fits */
export interface View {
  toScreen(x: number, y: number): Pt;
  zoom: number;
}

export interface LightLayerOptions {
  /** The light where no lamp reaches: one colour, or colours from the top of the view down (a sky that stays bright) */
  ambient?: string | string[];
  /** Light-map resolution in device px per CSS px (default 0.25; AutoQuality lowers it on slow frames) */
  scale?: number;
  /** Blur the map once more (soft shadow edges, smoother falloff) */
  soft?: boolean;
  /** Strength of the additive glow of the lights over the scene, 0…1 (default 0.35; 0 off) */
  bloom?: number;
  /** The last upscale without filtering, in device px (default 2; 3 is cheaper and a little blocky on shadow edges) */
  step?: number;
  /** Darken the corners, 0…1 (default 0): free here, the map is multiplied anyway (an Overlay vignette is a blit more) */
  vignette?: number;
  vignetteColor?: string;
  /** Paint the light map in a worker, a frame behind (LightLayer.offThread; default false) */
  offThread?: boolean;
}

export class LightLayer {
  ambient: string | string[];
  scale: number;
  soft: boolean;
  bloom: number;
  vignette: number;
  vignetteColor: string;
  step: number;
  /**
   * Paint the light map on another core (a worker with OffscreenCanvas) while the main thread draws the scene: the map
   * apply() multiplies is then the one render() asked for a frame before. It falls back to painting here where workers
   * or OffscreenCanvas are missing, and on a frame the worker's map doesn't fit (the first one, a resize). Leave it false
   * for a still (a cover, a screenshot, a test): then the map is always this frame's
   */
  offThread: boolean;
  lights: Light[] = [];
  occluders: Occluder[] = [];
  /** The light-map canvases painted on this thread (map, lit, tmp, half, up, upLit) */
  private bufs: LightBuffers<HTMLCanvasElement> = {};
  private job: LightJob | null = null;
  /** This frame's map is painted on this thread already (off-thread mode leaves it to apply(), when it needs it) */
  private painted = false;
  private worker: Worker | null | undefined;
  private busy = false;
  private result: LightResult | null = null;
  private upW = 0;
  private upH = 0;
  /** The lights as drawn this frame, in light-map px (after flicker): dirAt / at read them */
  private drawn: { x: number; y: number; r: number; i: number }[] = [];
  private k = 1;
  constructor(o: LightLayerOptions = {}) {
    this.ambient = o.ambient ?? '#1b2244';
    this.scale = o.scale ?? 0.25;
    this.soft = o.soft ?? true;
    this.bloom = o.bloom ?? 0.35;
    this.vignette = o.vignette ?? 0;
    this.step = o.step ?? 2;
    this.vignetteColor = o.vignetteColor ?? '#000000';
    this.offThread = o.offThread ?? false;
  }
  add(...l: Light[]): this {
    this.lights.push(...l);
    return this;
  }
  clear(): this {
    this.lights.length = 0;
    return this;
  }
  /** The light map's canvas (black where no light; for an engine texture or a debug view) — the one painted on this thread */
  get canvas(): HTMLCanvasElement | null {
    return this.bufs.map?.[0] ?? null;
  }
  /** Stop the worker (a scene thrown away) */
  dispose(): void {
    this.worker?.terminate();
    this.worker = null;
    this.drop();
  }
  private drop(): void {
    this.result?.up.close();
    this.result?.upLit?.close();
    this.result = null;
  }

  /** Build the light map for a w×h CSS px view at time t (seconds: flicker) */
  render(w: number, h: number, t = 0, view?: View): void {
    const s = this.scale;
    const W = Math.max(1, Math.ceil(w * s));
    const H = Math.max(1, Math.ceil(h * s));
    this.k = s;
    const z = (view?.zoom ?? 1) * s;
    const P = (x: number, y: number): Pt => {
      const [sx, sy] = view ? view.toScreen(x, y) : [x, y];
      return [sx * s, sy * s];
    };
    const occ: Occ[] = this.occluders.map((o): Occ => ('pts' in o ? { pts: o.pts.map(([x, y]) => P(x, y)) } : { c: P(o.x, o.y), r: o.r * z }));
    const far = (W + H) * 2;
    this.drawn.length = 0;
    const lights: LightJob['lights'] = [];
    for (const L of this.lights) {
      let i = L.intensity ?? 1;
      if (L.flicker) {
        const sd = L.seed ?? 0;
        i *= 1 - L.flicker * (0.35 + 0.35 * noise1(t * 7 + sd * 13.7, sd) + 0.3 * noise1(t * 23 + sd, sd + 9)) * 0.8;
      }
      const [x, y] = P(L.x, L.y);
      const r = L.radius * z;
      if (i <= 0.002 || r < 0.5 || x + r < 0 || y + r < 0 || x - r > W || y - r > H) continue;
      this.drawn.push({ x, y, r, i });
      // Only the occluders inside this light's reach cast shadows from it (no shadow work for a lamp with none near)
      const near = L.shadows === false ? [] : occ.filter((o) => occluderNear(o, x, y, r));
      const c = L.color;
      const fill = (k: number, rr: number): LightFill => ({
        x,
        y,
        rr,
        stops: [
          [0, alpha(c, Math.min(1, i * k))],
          [0.25, alpha(c, Math.min(1, i * k * 0.62))],
          [0.6, alpha(c, Math.min(1, i * k * 0.2))],
          [1, alpha(c, 0)],
        ],
      });
      const spot = L.cone !== undefined && L.dir !== undefined;
      const fills = [fill(1, r)];
      // Hotter than the map holds: a second, tighter pass burns the centre toward white
      if (i > 1) fills.push(fill((i - 1) / i, r * 0.5));
      let polys: number[] | null = null;
      if (near.length) {
        const rec = new PolyRecorder();
        for (const o of near) shadowPolys(rec, x, y, o, far);
        polys = rec.out;
      }
      lights.push({
        spill: spot && (L.spill ?? 0.18) > 0 ? fill(L.spill ?? 0.18, r * 0.7) : null,
        cone: spot ? [x, y, r, L.dir! - L.cone!, L.dir! + L.cone!] : null,
        fills,
        polys,
      });
    }
    let vig: LightJob['vig'] = null;
    if (this.vignette > 0) {
      const R = Math.hypot(W, H) / 2;
      vig = {
        g: [W / 2, H * 0.45, R * 0.4, W / 2, H / 2, R],
        stops: [
          [0, alpha(this.vignetteColor, 0)],
          [0.7, alpha(this.vignetteColor, this.vignette * 0.4)],
          [1, alpha(this.vignetteColor, this.vignette)],
        ],
      };
    }
    const amb = this.ambient;
    const job: LightJob = { W, H, HW: 0, HH: 0, st: 1, soft: this.soft, bloom: this.bloom > 0, ambient: Array.isArray(amb) ? [...amb] : amb, vig, lights };
    this.job = job;
    this.painted = false;
    // Off the thread: the worker paints it with the upscale at the size the last apply() asked for
    if (this.offThread && this.post({ ...job, HW: this.upW, HH: this.upH, st: Math.max(1, Math.round(this.step)) })) return;
    // Here: the map now (the canvas getter, an engine texture), the upscale in apply() at the context's density
    paintLights(job, canvas2d, this.bufs);
    this.painted = true;
  }

  /** Hand the job to the worker (started on first use); false when there is none */
  private post(job: LightJob): boolean {
    if (this.worker === undefined) this.worker = startLightWorker((m) => this.receive(m), () => this.lost());
    if (!this.worker) return false;
    // Still painting the last one, or no size known yet: skip it (apply() keeps the last map, or paints here)
    if (this.busy || !(job.HW > 0)) return true;
    this.busy = true;
    this.worker.postMessage(job);
    return true;
  }
  private receive(m: LightResult): void {
    this.busy = false;
    this.drop();
    this.result = m;
  }
  private lost(): void {
    // The worker can't paint (no OffscreenCanvas 2D, a blocked blob: worker): paint here from now on
    this.worker?.terminate();
    this.worker = null;
    this.busy = false;
    this.drop();
  }

  /**
   * Multiply the light map over the scene drawn so far, then add the lights' glow (bloom). The map is upscaled in two
   * steps — smoothly to 1/`step` of the canvas's device pixels, then `step`× without filtering — because a filtered full-screen
   * upscale costs ≈ 5× a plain blit on a software rasterizer (headless Chromium, blocklisted GPUs).
   */
  apply(ctx: Ctx, w: number, h: number): void {
    const job = this.job;
    if (!job) return;
    const b0 = ctx.globalCompositeOperation;
    const a0 = ctx.globalAlpha;
    const s0 = ctx.imageSmoothingEnabled;
    const k = Math.hypot(ctx.getTransform().a, ctx.getTransform().b) || 1;
    const st = Math.max(1, Math.round(this.step));
    const HW = Math.max(1, Math.ceil((w * k) / st));
    const HH = Math.max(1, Math.ceil((h * k) / st));
    this.upW = HW;
    this.upH = HH;
    const bloom = this.bloom > 0;
    let up: CanvasImageSource;
    let upLit: CanvasImageSource | null;
    const r = this.result;
    const m = ctx.getTransform();
    if (this.offThread && this.worker && r && r.HW === HW && r.HH === HH && r.st === st && (!bloom || r.upLit)) {
      // The worker's maps, at the canvas's size: blended 1:1 on whole device pixels (or scaled, under a rotation)
      const one = m.b === 0 && m.c === 0 && Math.abs(m.a - m.d) < 1e-6;
      const blit = (src: ImageBitmap) => {
        if (one) {
          ctx.setTransform(1, 0, 0, 1, Math.round(m.e), Math.round(m.f));
          ctx.drawImage(src, 0, 0);
          ctx.setTransform(m);
        } else ctx.drawImage(src, 0, 0, (HW * st) / k, (HH * st) / k);
      };
      ctx.imageSmoothingEnabled = false;
      ctx.globalCompositeOperation = 'multiply';
      blit(r.up);
      if (bloom && r.upLit) {
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = a0 * this.bloom;
        blit(r.upLit);
      }
      ctx.imageSmoothingEnabled = s0;
      ctx.globalCompositeOperation = b0;
      ctx.globalAlpha = a0;
      return;
    } else {
      if (!this.painted) {
        paintLights(job, canvas2d, this.bufs);
        this.painted = true;
      }
      const out = paintLights({ ...job, HW, HH, st: 1 }, canvas2d, this.bufs, true);
      up = out.up!;
      upLit = out.upLit;
    }
    const dw = (HW * st) / k;
    const dh = (HH * st) / k;
    ctx.imageSmoothingEnabled = false;
    ctx.globalCompositeOperation = 'multiply';
    ctx.drawImage(up, 0, 0, dw, dh);
    if (bloom && upLit) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = a0 * this.bloom;
      ctx.drawImage(upLit, 0, 0, dw, dh);
    }
    ctx.imageSmoothingEnabled = s0;
    ctx.globalCompositeOperation = b0;
    ctx.globalAlpha = a0;
  }

  /** How strongly the lights reach a screen point (0 none; ~1 at a light's centre) — after render() */
  at(x: number, y: number): number {
    let sum = 0;
    for (const d of this.drawn) {
      const f = 1 - Math.hypot(x * this.k - d.x, y * this.k - d.y) / d.r;
      if (f > 0) sum += d.i * f * f;
    }
    return sum;
  }

  /** The direction toward the dominant light at a screen point (radians), `fallback` where no light reaches */
  dirAt(x: number, y: number, fallback = DEFAULT_LIGHT): number {
    let vx = 0;
    let vy = 0;
    for (const d of this.drawn) {
      const dx = d.x - x * this.k;
      const dy = d.y - y * this.k;
      const dist = Math.hypot(dx, dy) || 1;
      const f = 1 - dist / d.r;
      if (f > 0) {
        vx += (dx / dist) * d.i * f * f;
        vy += (dy / dist) * d.i * f * f;
      }
    }
    return vx || vy ? Math.atan2(vy, vx) : fallback;
  }
}

/** One radial fill of a light, in light-map px, its colour stops resolved */
interface LightFill {
  x: number;
  y: number;
  rr: number;
  stops: [number, string][];
}

/** A frame's light map as plain data: what paintLights() draws, on this thread or in the worker */
interface LightJob {
  W: number;
  H: number;
  /** The smooth upscale's size in px (0: none — apply() makes it at the context's density) */
  HW: number;
  HH: number;
  /** The worker also does the unfiltered step (×st, nearest) and hands over maps of the canvas's own size: the main thread
   * then blends them 1:1 (≈ 1.3 ms at 1280×720 on a software rasterizer, against ≈ 3.2 ms for a scaled blend) */
  st: number;
  soft: boolean;
  bloom: boolean;
  ambient: string | string[];
  vig: { g: [number, number, number, number, number, number]; stops: [number, string][] } | null;
  lights: {
    spill: LightFill | null;
    /** A spot's cone: x, y, r, from, to (radians) */
    cone: [number, number, number, number, number] | null;
    fills: LightFill[];
    /** The shadow polygons, flat: [n, x0, y0, … x(n−1), y(n−1)] per polygon; null: no shadows from this light */
    polys: number[] | null;
  }[];
}

interface LightResult {
  HW: number;
  HH: number;
  st: number;
  /** The map (and the bloom) at HW·st × HH·st: drawn 1:1 */
  up: ImageBitmap;
  upLit: ImageBitmap | null;
}

type LightCanvas = HTMLCanvasElement | OffscreenCanvas;
type LightCtx = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
type LightSlot = 'map' | 'lit' | 'tmp' | 'half' | 'up' | 'upLit' | 'full' | 'fullLit';
type LightBuffers<C extends LightCanvas> = Partial<Record<LightSlot, [C, LightCtx]>>;

/** shadowPolys() into a flat number list ([n, x0, y0, …] per polygon) */
class PolyRecorder {
  out: number[] = [];
  private at = -1;
  moveTo(x: number, y: number): void {
    this.at = this.out.length;
    this.out.push(1, x, y);
  }
  lineTo(x: number, y: number): void {
    this.out.push(x, y);
    this.out[this.at]++;
  }
  closePath(): void {}
}

/**
 * Paint a light job into the buffers: the lights (each through `tmp` when it casts shadows), the soft pass, ambient and
 * vignette into `map` — then, when the job has a size for it, the smooth upscale of `map` (and of `lit`, for the bloom).
 * `upOnly`: just the upscale, from the map painted before. SELF-CONTAINED — no imports, no outer names, no helpers: the
 * worker runs its source text (paintLights.toString())
 */
export function paintLights<C extends LightCanvas>(job: LightJob, make: (w: number, h: number) => [C, LightCtx], B: LightBuffers<C>, upOnly = false): { up: C | null; upLit: C | null } {
  const buf = (slot: LightSlot, w: number, h: number): [C, LightCtx] => {
    let b = B[slot];
    if (!b || b[0].width !== w || b[0].height !== h) B[slot] = b = make(w, h);
    return b;
  };
  const W = job.W;
  const H = job.H;
  const [mapC, m] = buf('map', W, H);
  const [litC, lit] = buf('lit', W, H);
  if (!upOnly) {
    lit.globalCompositeOperation = 'source-over';
    lit.fillStyle = '#000';
    lit.fillRect(0, 0, W, H);
    lit.globalCompositeOperation = 'lighter';
    const fill = (g: LightCtx, f: LightFill) => {
      const grad = g.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.rr);
      for (const [o, c] of f.stops) grad.addColorStop(o, c);
      g.fillStyle = grad;
      g.fillRect(f.x - f.rr, f.y - f.rr, f.rr * 2, f.rr * 2);
    };
    for (const L of job.lights) {
      const tmp = L.polys ? buf('tmp', W, H) : null;
      const g = tmp ? tmp[1] : lit;
      if (tmp) {
        g.globalCompositeOperation = 'source-over';
        g.clearRect(0, 0, W, H);
      }
      if (L.spill) fill(g, L.spill);
      g.save();
      if (L.cone) {
        const [x, y, r, a0, a1] = L.cone;
        g.beginPath();
        g.moveTo(x, y);
        g.arc(x, y, r, a0, a1);
        g.closePath();
        g.clip();
      }
      for (const f of L.fills) fill(g, f);
      g.restore();
      if (tmp && L.polys) {
        g.globalCompositeOperation = 'destination-out';
        g.fillStyle = '#000';
        g.beginPath();
        const p = L.polys;
        for (let i = 0; i < p.length; ) {
          const n = p[i++];
          for (let j = 0; j < n; j++, i += 2) {
            if (j) g.lineTo(p[i], p[i + 1]);
            else g.moveTo(p[i], p[i + 1]);
          }
          g.closePath();
        }
        g.fill();
        lit.drawImage(tmp[0], 0, 0);
      }
    }
    if (job.soft) {
      // Down to half and back: a cheap blur that softens shadow edges (the upscale on apply() blurs again)
      const [hc, hg] = buf('half', Math.ceil(W / 2), Math.ceil(H / 2));
      hg.clearRect(0, 0, hc.width, hc.height);
      hg.drawImage(litC, 0, 0, hc.width, hc.height);
      lit.globalCompositeOperation = 'copy';
      lit.drawImage(hc, 0, 0, W, H);
    }
    m.globalCompositeOperation = 'source-over';
    const amb = job.ambient;
    if (Array.isArray(amb)) {
      const g = m.createLinearGradient(0, 0, 0, H);
      amb.forEach((c, i) => g.addColorStop(i / Math.max(1, amb.length - 1), c));
      m.fillStyle = g;
    } else m.fillStyle = amb;
    m.fillRect(0, 0, W, H);
    m.globalCompositeOperation = 'lighter';
    m.drawImage(litC, 0, 0);
    if (job.vig) {
      m.globalCompositeOperation = 'source-over';
      const [x0, y0, r0, x1, y1, r1] = job.vig.g;
      const vg = m.createRadialGradient(x0, y0, r0, x1, y1, r1);
      for (const [o, c] of job.vig.stops) vg.addColorStop(o, c);
      m.fillStyle = vg;
      m.fillRect(0, 0, W, H);
    }
  }
  if (!(job.HW > 0 && job.HH > 0)) return { up: null, upLit: null };
  const up = (src: C, slot: 'up' | 'upLit') => {
    const [c, g] = buf(slot, job.HW, job.HH);
    g.imageSmoothingEnabled = true;
    g.globalCompositeOperation = 'copy';
    g.drawImage(src, 0, 0, job.HW, job.HH);
    if (!(job.st > 1)) return c;
    // The unfiltered step too (the worker): blocks of st×st device px, as apply() would draw them
    const [f, fg] = buf(slot === 'up' ? 'full' : 'fullLit', job.HW * job.st, job.HH * job.st);
    fg.imageSmoothingEnabled = false;
    fg.globalCompositeOperation = 'copy';
    fg.drawImage(c, 0, 0, f.width, f.height);
    return f;
  };
  return { up: up(mapC, 'up'), upLit: job.bloom ? up(litC, 'upLit') : null };
}

/** The worker running paintLights() on OffscreenCanvas; null where it can't (the map is then painted on this thread) */
function startLightWorker(onResult: (m: LightResult) => void, onLost: () => void): Worker | null {
  if (typeof Worker === 'undefined' || typeof OffscreenCanvas === 'undefined' || typeof Blob === 'undefined' || typeof URL === 'undefined') return null;
  if (!('transferToImageBitmap' in OffscreenCanvas.prototype)) return null;
  const src = [
    `const paintLights = ${paintLights.toString()};`,
    'const B = {};',
    "const make = (w, h) => { const c = new OffscreenCanvas(w, h); const g = c.getContext('2d'); if (!g) throw new Error('no OffscreenCanvas 2D'); return [c, g]; };",
    'onmessage = (e) => {',
    '  try {',
    '    const job = e.data;',
    '    const out = paintLights(job, make, B);',
    '    const up = out.up.transferToImageBitmap();',
    '    const upLit = out.upLit ? out.upLit.transferToImageBitmap() : null;',
    '    postMessage({ HW: job.HW, HH: job.HH, st: job.st, up, upLit }, upLit ? [up, upLit] : [up]);',
    '  } catch (err) {',
    '    postMessage({ error: String(err) });',
    '  }',
    '};',
  ].join('\n');
  let url = '';
  try {
    url = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
    const w = new Worker(url);
    w.onmessage = (e: MessageEvent) => {
      if (url) {
        URL.revokeObjectURL(url);
        url = '';
      }
      if (e.data?.error) onLost();
      else onResult(e.data as LightResult);
    };
    w.onerror = () => onLost();
    return w;
  } catch {
    if (url) URL.revokeObjectURL(url);
    return null;
  }
}

type Occ = { pts: Pt[] } | { c: Pt; r: number };

/** Distance from (x, y) to the segment a–b */
function segDist(x: number, y: number, a: Pt, b: Pt): number {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const l2 = dx * dx + dy * dy;
  const t = l2 ? Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / l2)) : 0;
  return Math.hypot(a[0] + dx * t - x, a[1] + dy * t - y);
}

/**
 * Does an occluder reach into a light of radius r at (x, y)? A circle by its centre and radius; a polygon by its edges
 * (a long wall passes near a lamp with both ends far away) or by holding the light (pure geometry: tested)
 */
export function occluderNear(o: Occ, x: number, y: number, r: number): boolean {
  if ('c' in o) return Math.hypot(o.c[0] - x, o.c[1] - y) < r + o.r;
  const p = o.pts;
  let inside = false;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
    if (segDist(x, y, p[j], p[i]) < r) return true;
    if (p[i][1] > y !== p[j][1] > y && x < ((p[j][0] - p[i][0]) * (y - p[i][1])) / (p[j][1] - p[i][1]) + p[i][0]) inside = !inside;
  }
  return inside;
}

/** Add the shadow polygons of one occluder seen from (lx, ly) to the current path (pure geometry: tested) */
export function shadowPolys(g: Pick<Ctx, 'moveTo' | 'lineTo' | 'closePath'>, lx: number, ly: number, o: Occ, far: number): number {
  const ext = (x: number, y: number): Pt => {
    const dx = x - lx;
    const dy = y - ly;
    const d = Math.hypot(dx, dy) || 1;
    return [x + (dx / d) * far, y + (dy / d) * far];
  };
  // Every polygon wound the same way, so the nonzero fill unites overlapping shadows instead of cancelling them
  const emit = (pts: Pt[]) => {
    let a = 0;
    for (let i = 0; i < pts.length; i++) a += pts[i][0] * pts[(i + 1) % pts.length][1] - pts[(i + 1) % pts.length][0] * pts[i][1];
    if (a < 0) pts.reverse();
    pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
    g.closePath();
  };
  const quad = (a: Pt, b: Pt) => emit([a, b, ext(b[0], b[1]), ext(a[0], a[1])]);
  if ('c' in o) {
    const [cx, cy] = o.c;
    const d = Math.hypot(cx - lx, cy - ly);
    if (d <= o.r) return 0;
    const phi = Math.atan2(ly - cy, lx - cx);
    const beta = Math.acos(o.r / d);
    const t1: Pt = [cx + Math.cos(phi + beta) * o.r, cy + Math.sin(phi + beta) * o.r];
    const t2: Pt = [cx + Math.cos(phi - beta) * o.r, cy + Math.sin(phi - beta) * o.r];
    quad(t1, t2);
    // The far half of the circle is in its own shadow too
    emit([t1, [cx - Math.cos(phi) * o.r, cy - Math.sin(phi) * o.r], t2]);
    return 1;
  }
  const p = o.pts;
  const n = p.length;
  let area = 0;
  for (let i = 0; i < n; i++) area += p[i][0] * p[(i + 1) % n][1] - p[(i + 1) % n][0] * p[i][1];
  const sgn = area > 0 ? 1 : -1;
  let quads = 0;
  for (let i = 0; i < n; i++) {
    const a = p[i];
    const b = p[(i + 1) % n];
    // Outward normal (canvas y down: for a clockwise-on-screen polygon, area > 0)
    const nx = (b[1] - a[1]) * sgn;
    const ny = -(b[0] - a[0]) * sgn;
    const mx = (a[0] + b[0]) / 2 - lx;
    const my = (a[1] + b[1]) / 2 - ly;
    if (nx * mx + ny * my > 0) {
      quad(a, b);
      quads++;
    }
  }
  return quads;
}
