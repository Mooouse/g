// Sprites from code: a procedural drawing baked once at the pixel density (gradients, shadows, glow and all), then drawn
// every frame with one drawImage — positioned by its pivot, rotated, scaled, flashed white on a hit, tinted. Frame
// animations are pre-rendered into one sheet; panels stretch by 9-slice. SpriteCache keeps the sprites a game makes on
// the fly (one per colour, size, pose angle…) under a memory cap, least recently used out first.
//
// What re-bakes by itself after a density change or a lost context (the bake generation moved): SpriteCache entries,
// silhouette() (and so the hit flash). What doesn't — it is a canvas the game holds: makeSprite(), a SpriteSheet,
// tint(). Make those through keepBaked() (bake.ts), or key them with bakeGen() in a SpriteCache.

import { bakeGen, canvas2d, density, type Ctx } from './bake.ts';

export interface Sprite {
  canvas: HTMLCanvasElement;
  /** Size in CSS px (the canvas, or its `src` region, is w·scale × h·scale device px) */
  w: number;
  h: number;
  /** The pivot in CSS px from the sprite's top-left: drawSprite puts it at (x, y), rotation turns around it */
  ax: number;
  ay: number;
  scale: number;
  /** The sprite's region of `canvas` in device px [x, y, w, h] — a SpriteSheet frame; none: the whole canvas */
  src?: [number, number, number, number];
}

/** The sprite's region of its canvas, device px */
export const srcRect = (s: Sprite): [number, number, number, number] => s.src ?? [0, 0, s.canvas.width, s.canvas.height];

/** Blit a sprite's region (all of it, or a sheet frame) to a w×h CSS px box at (x, y) */
function blit(ctx: Ctx, s: Sprite, canvas: HTMLCanvasElement, x: number, y: number): void {
  if (s.src && canvas === s.canvas) ctx.drawImage(canvas, s.src[0], s.src[1], s.src[2], s.src[3], x, y, s.w, s.h);
  else ctx.drawImage(canvas, x, y, s.w, s.h);
}

export interface SpriteOptions {
  /** The pivot as a share of the size: [0.5, 0.5] the centre (default), [0.5, 1] the feet */
  anchor?: [number, number];
  /** Extra room on every side (CSS px) for glow and shadows outside the drawing's box */
  pad?: number;
  /** Device px per CSS px (default the density) */
  scale?: number;
}

/** Bake a drawing into a sprite: `draw` gets a context whose origin is the pivot (so draw around 0, 0) */
export function makeSprite(w: number, h: number, draw: (ctx: Ctx, w: number, h: number) => void, opts: SpriteOptions = {}): Sprite {
  const pad = opts.pad ?? 0;
  const scale = opts.scale ?? density();
  const [ax, ay] = opts.anchor ?? [0.5, 0.5];
  const W = w + pad * 2;
  const H = h + pad * 2;
  const [c, ctx] = canvas2d(W * scale, H * scale);
  ctx.scale(scale, scale);
  ctx.translate(pad + w * ax, pad + h * ay);
  draw(ctx, w, h);
  return { canvas: c, w: W, h: H, ax: pad + w * ax, ay: pad + h * ay, scale };
}

export interface DrawOptions {
  rot?: number;
  /** Scale (sx, sy: squash and stretch) */
  sx?: number;
  sy?: number;
  alpha?: number;
  /** globalCompositeOperation, e.g. 'lighter' for glow */
  blend?: GlobalCompositeOperation;
  /** 0…1: blend toward a white (or `flashColor`) silhouette — the hit flash */
  flash?: number;
  /**
   * Put the sprite on whole device pixels (only without rotation and scale). A blit at a fractional position is filtered:
   * ≈ 8× the cost of a plain copy on a software rasterizer — snap big, static sprites (a deck, a backdrop)
   */
  snap?: boolean;
  flashColor?: string;
}

/** Draw a sprite with its pivot at (x, y) */
export function drawSprite(ctx: Ctx, s: Sprite, x: number, y: number, o: DrawOptions = {}): void {
  const { rot = 0, sx = 1, sy = 1, alpha = 1, blend, flash = 0 } = o;
  if (alpha <= 0) return;
  const a0 = ctx.globalAlpha;
  const b0 = ctx.globalCompositeOperation;
  ctx.globalAlpha = a0 * alpha;
  if (blend) ctx.globalCompositeOperation = blend;
  const simple = rot === 0 && sx === 1 && sy === 1;
  let exact = false;
  if (simple && o.snap) {
    const m = ctx.getTransform();
    if (m.b === 0 && m.c === 0 && Math.abs(m.a - s.scale) < 1e-6 && Math.abs(m.d - s.scale) < 1e-6) {
      // Drawn at the scale it was baked at: its pixels 1:1 on whole device pixels — a plain copy. (Its CSS size times the
      // scale is fractional when the bake rounded up, and a blit a fraction off its size is a filtered one)
      exact = true;
      const [sxp, syp, sw, sh] = srcRect(s);
      const X = Math.round(m.a * (x - s.ax) + m.e);
      const Y = Math.round(m.d * (y - s.ay) + m.f);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(s.canvas, sxp, syp, sw, sh, X, Y, sw, sh);
      if (flash > 0) {
        const f = silhouette(s, o.flashColor ?? '#ffffff');
        ctx.globalAlpha = a0 * alpha * Math.min(1, flash);
        ctx.drawImage(f.canvas, X, Y);
      }
      ctx.setTransform(m);
    } else {
      x = (Math.round(m.a * (x - s.ax) + m.e) - m.e) / m.a + s.ax;
      y = (Math.round(m.d * (y - s.ay) + m.f) - m.f) / m.d + s.ay;
    }
  }
  if (exact) {
    ctx.globalAlpha = a0;
    ctx.globalCompositeOperation = b0;
    return;
  }
  if (simple) blit(ctx, s, s.canvas, x - s.ax, y - s.ay);
  else {
    ctx.save();
    ctx.translate(x, y);
    if (rot) ctx.rotate(rot);
    ctx.scale(sx, sy);
    blit(ctx, s, s.canvas, -s.ax, -s.ay);
    ctx.restore();
  }
  if (flash > 0) {
    const f = silhouette(s, o.flashColor ?? '#ffffff');
    ctx.globalAlpha = a0 * alpha * Math.min(1, flash);
    if (simple) blit(ctx, f, f.canvas, x - s.ax, y - s.ay);
    else {
      ctx.save();
      ctx.translate(x, y);
      if (rot) ctx.rotate(rot);
      ctx.scale(sx, sy);
      blit(ctx, f, f.canvas, -s.ax, -s.ay);
      ctx.restore();
    }
  }
  ctx.globalAlpha = a0;
  ctx.globalCompositeOperation = b0;
}

const silhouettes = new WeakMap<HTMLCanvasElement, Map<string, { gen: number; s: Sprite }>>();

/** A copy of the sprite's region on a canvas of its own (a sheet frame becomes a sprite with no `src`) */
function own(s: Sprite): [HTMLCanvasElement, Ctx, Sprite] {
  const [sx, sy, sw, sh] = srcRect(s);
  const [c, ctx] = canvas2d(sw, sh);
  ctx.drawImage(s.canvas, sx, sy, sw, sh, 0, 0, sw, sh);
  return [c, ctx, { canvas: c, w: s.w, h: s.h, ax: s.ax, ay: s.ay, scale: s.scale }];
}

/** The sprite's shape filled with one colour (hit flash, a tint, a shadow): baked once per colour (and frame), re-baked after invalidateBakes() */
export function silhouette(s: Sprite, color: string): Sprite {
  let m = silhouettes.get(s.canvas);
  if (!m) silhouettes.set(s.canvas, (m = new Map()));
  const key = s.src ? `${color}@${s.src.join(',')}` : color;
  const hit = m.get(key);
  if (hit && hit.gen === bakeGen()) return hit.s;
  const [c, ctx, out] = own(s);
  ctx.globalCompositeOperation = 'source-in';
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, c.width, c.height);
  m.set(key, { gen: bakeGen(), s: out });
  return out;
}

/**
 * A tinted copy: the sprite blended `amount` toward `color` over its own shape (a team colour, a frozen enemy). A new
 * canvas the caller keeps: not re-baked after invalidateBakes() — make it in a SpriteCache or keepBaked()
 */
export function tint(s: Sprite, color: string, amount = 0.5): Sprite {
  const [, ctx, out] = own(s);
  ctx.globalAlpha = amount;
  ctx.drawImage(silhouette(s, color).canvas, 0, 0);
  return out;
}

/**
 * Pre-rendered frames in one sheet (one canvas, one texture for an engine): a walk cycle, a spinning coin, an
 * explosion — drawn by `draw(ctx, i, n)` around the pivot like makeSprite. Each frame is a Sprite with its `src` cell:
 * drawSprite, silhouette, tint and nineSlice take it. Baked once: after a density change or a lost context make it
 * again (keepBaked(), or `gen` against bakeGen()).
 */
export class SpriteSheet {
  readonly canvas: HTMLCanvasElement;
  readonly frames: Sprite[] = [];
  readonly n: number;
  /** The bake generation it was made at: !== bakeGen() → stale */
  readonly gen = bakeGen();
  constructor(n: number, w: number, h: number, draw: (ctx: Ctx, frame: number, n: number) => void, opts: SpriteOptions & { cols?: number } = {}) {
    this.n = n;
    const pad = opts.pad ?? 0;
    const scale = opts.scale ?? density();
    const [ax, ay] = opts.anchor ?? [0.5, 0.5];
    const W = w + pad * 2;
    const H = h + pad * 2;
    const cols = opts.cols ?? Math.ceil(Math.sqrt(n));
    const fw = Math.ceil(W * scale);
    const fh = Math.ceil(H * scale);
    const [c, ctx] = canvas2d(fw * cols, fh * Math.ceil(n / cols));
    this.canvas = c;
    for (let i = 0; i < n; i++) {
      const cx = (i % cols) * fw;
      const cy = Math.floor(i / cols) * fh;
      ctx.save();
      ctx.beginPath();
      ctx.rect(cx, cy, fw, fh);
      ctx.clip();
      ctx.translate(cx, cy);
      ctx.scale(scale, scale);
      ctx.translate(pad + w * ax, pad + h * ay);
      draw(ctx, i, n);
      ctx.restore();
      // Each frame a sprite of its cell in the sheet's canvas
      this.frames.push({ canvas: c, w: W, h: H, ax: pad + w * ax, ay: pad + h * ay, scale, src: [cx, cy, fw, fh] });
    }
  }
  /** A frame's cell in the sheet's canvas, device px: [x, y, w, h] (an engine's frame rectangle) */
  rect(frame: number): [number, number, number, number] {
    return [...srcRect(this.frames[frame])];
  }
  /** The frame at time t (seconds) at `fps`, looping or held on the last */
  at(t: number, fps: number, loop = true): number {
    const f = Math.floor(t * fps);
    return loop ? ((f % this.n) + this.n) % this.n : Math.min(this.n - 1, Math.max(0, f));
  }
  /** Draw frame `frame` with its pivot at (x, y): drawSprite's options (rot, sx, sy, alpha, blend, flash, snap) */
  draw(ctx: Ctx, frame: number, x: number, y: number, o: DrawOptions = {}): void {
    drawSprite(ctx, this.frames[frame], x, y, o);
  }
}

/** Draw a sprite stretched to w×h keeping its corners (inset CSS px on each side): panels, buttons, bars */
export function nineSlice(ctx: Ctx, s: Sprite, x: number, y: number, w: number, h: number, inset: number): void {
  const k = s.scale;
  const i = inset;
  const ip = inset * k;
  const [ox, oy, sw, sh] = srcRect(s);
  const xs = [ox, ox + ip, ox + sw - ip, ox + sw];
  const ys = [oy, oy + ip, oy + sh - ip, oy + sh];
  const dx = [x, x + i, x + w - i, x + w];
  const dy = [y, y + i, y + h - i, y + h];
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 3; c++) {
      const W = dx[c + 1] - dx[c];
      const H = dy[r + 1] - dy[r];
      if (W > 0 && H > 0) ctx.drawImage(s.canvas, xs[c], ys[r], xs[c + 1] - xs[c], ys[r + 1] - ys[r], dx[c], dy[r], W, H);
    }
}

/**
 * Sprites made on the fly, keyed by what they show ('slime:teal:64:pose3'): baked on the first get, kept while used,
 * dropped least-recently-used first when the cache passes its memory cap (device px × 4 bytes), and re-baked after a
 * density change or a lost context. A sprite bigger than half the cap is baked but not kept (it would push everything
 * else out, and itself next frame): check `fits()` first and draw such a thing directly or in pieces (nineSlice).
 */
export class SpriteCache {
  private map = new Map<string, { s: Sprite; bytes: number; gen: number }>();
  private readonly cap: number;
  bytes = 0;
  hits = 0;
  misses = 0;
  evictions = 0;
  /** Sprites too big to keep (over half the cap), baked and handed out without caching */
  uncached = 0;
  /** maxBytes: default 32 MB (a low-end phone's comfortable texture memory for one game) */
  constructor(opts: { maxBytes?: number } = {}) {
    this.cap = opts.maxBytes ?? 32 * 1024 * 1024;
  }
  get size(): number {
    return this.map.size;
  }
  /** The memory cap in bytes */
  get maxBytes(): number {
    return this.cap;
  }
  /** Device bytes a w×h CSS px sprite with these options takes */
  static bytes(w: number, h: number, opts: SpriteOptions = {}): number {
    const pad = opts.pad ?? 0;
    const scale = opts.scale ?? density();
    return Math.max(1, Math.ceil((w + pad * 2) * scale)) * Math.max(1, Math.ceil((h + pad * 2) * scale)) * 4;
  }
  /** Would get() keep this sprite? (no when it is over half the cap) */
  fits(w: number, h: number, opts?: SpriteOptions): boolean {
    return SpriteCache.bytes(w, h, opts) <= this.cap / 2;
  }
  get(key: string, w: number, h: number, draw: (ctx: Ctx, w: number, h: number) => void, opts?: SpriteOptions): Sprite {
    const e = this.map.get(key);
    if (e && e.gen === bakeGen()) {
      // Most recently used goes to the end of the Map's order
      this.map.delete(key);
      this.map.set(key, e);
      this.hits++;
      return e.s;
    }
    if (e) this.drop(key);
    this.misses++;
    const s = makeSprite(w, h, draw, opts);
    const bytes = s.canvas.width * s.canvas.height * 4;
    if (bytes > this.cap / 2) {
      this.uncached++;
      return s;
    }
    this.map.set(key, { s, bytes, gen: bakeGen() });
    this.bytes += bytes;
    for (const k of this.map.keys()) {
      if (this.bytes <= this.cap || k === key) break;
      this.drop(k);
      this.evictions++;
    }
    return s;
  }
  private drop(key: string): void {
    const e = this.map.get(key);
    if (!e) return;
    this.bytes -= e.bytes;
    // The canvas is left to the GC (not zeroed): a sprite the game still holds from this frame must keep drawing
    this.map.delete(key);
  }
  clear(): void {
    for (const k of [...this.map.keys()]) this.drop(k);
  }
}
