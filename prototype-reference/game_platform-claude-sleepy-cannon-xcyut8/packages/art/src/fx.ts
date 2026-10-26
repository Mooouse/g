// Effects: a pooled particle system with presets (sparks, embers, smoke, steam, dust, debris, confetti, magic,
// coins, fire), shockwave rings, electric arcs, floating score text with a pop, a screen flash, dynamic lights for the
// LightLayer, hit-stop, ribbons (Trail) and a cheap heat shimmer. No allocation per particle after warm-up, a hard
// cap, quality scaling (AutoQuality), seeded (QA screenshots repeat), stepped by update(dt) on the game's clock.
// Supersedes @gp/core's Particles (confetti for the kids kit), which stays as it is.

import { seededRng, type SeededRng } from '@gp/core/rng';
import { canvas2d, bakeGen, type Ctx } from './bake.ts';
import { reducedMotion } from './camera.ts';
import { alpha, mix, shade } from './color.ts';
import type { Light } from './light.ts';
import { outlineOf, radialBlit } from './material.ts';
import { hash } from './noise.ts';
import { blob, boltPoints } from './shapes.ts';

export type Shape = 'glow' | 'dot' | 'spark' | 'smoke' | 'shard' | 'confetti';

export interface Emit {
  n: number;
  /** px/s */
  speed: [number, number];
  /** The direction (radians, canvas axes: −π/2 is up) and the spread around it (default all around) */
  angle?: number;
  spread?: number;
  /** seconds */
  life: [number, number];
  /** px (radius for glow/dot/smoke, width for sparks, size for shards) */
  size: [number, number];
  /** The size at the end of life as a multiple (smoke grows: 3; sparks shrink: 0.3) */
  grow?: number;
  /** px/s² (negative rises: smoke, steam) */
  gravity?: number;
  /** Velocity lost per second, 0…∞ */
  drag?: number;
  color: string | string[];
  /** Toward this colour over its life (embers: yellow → deep red) */
  fadeTo?: string;
  shape: Shape;
  /** Additive blending (light: sparks, glow, magic). Default by shape */
  additive?: boolean;
  /** Spin, radians per second (shards, confetti) */
  spin?: number;
  /** Spark trail length in seconds of its velocity */
  stretch?: number;
  /** Start spread around the point, px */
  jitter?: number;
  /** Peak opacity */
  opacity?: number;
}

/** The presets: emit('sparks', x, y) — or a spec of your own; scale with { scale } */
export const PRESETS = {
  sparks: { n: 22, speed: [180, 520], life: [0.25, 0.6], size: [1.2, 2.4], grow: 0.4, gravity: 900, drag: 1.5, color: ['#fff6c8', '#ffd36a', '#ffa23a'], shape: 'spark', stretch: 0.035 },
  embers: { n: 14, speed: [20, 90], angle: -Math.PI / 2, spread: 1.4, life: [0.8, 1.8], size: [1.5, 3], grow: 0.5, gravity: -60, drag: 0.8, color: '#ffd36a', fadeTo: '#ff3b1f', shape: 'glow', jitter: 10 },
  smoke: { n: 10, speed: [15, 60], angle: -Math.PI / 2, spread: 1.2, life: [1.2, 2.4], size: [10, 18], grow: 3, gravity: -40, drag: 1.2, color: ['#2e3350', '#3d4262', '#24283f'], shape: 'smoke', jitter: 8, opacity: 0.72 },
  steam: { n: 8, speed: [40, 110], angle: -Math.PI / 2, spread: 0.5, life: [0.8, 1.6], size: [6, 10], grow: 3.4, gravity: -70, drag: 1.6, color: '#e8f4ff', shape: 'smoke', jitter: 4, opacity: 0.35 },
  dust: { n: 12, speed: [30, 120], angle: -Math.PI / 2, spread: 2.6, life: [0.4, 0.9], size: [4, 8], grow: 2.2, gravity: 120, drag: 3, color: '#b9a98f', shape: 'smoke', opacity: 0.5 },
  debris: { n: 12, speed: [200, 520], angle: -Math.PI / 2, spread: 2.4, life: [0.6, 1.2], size: [3, 7], grow: 1, gravity: 1100, drag: 0.6, color: ['#3b4a63', '#56637d', '#ff8a2a'], shape: 'shard', spin: 14 },
  confetti: { n: 40, speed: [200, 480], angle: -Math.PI / 2, spread: 1.6, life: [1.2, 2.2], size: [4, 7], gravity: 520, drag: 1.8, color: ['#ff4fd8', '#29e6ff', '#ffd23f', '#7cff6b', '#ffffff'], shape: 'confetti', spin: 12 },
  magic: { n: 18, speed: [30, 140], life: [0.5, 1.2], size: [1.5, 3.5], grow: 0.2, gravity: -30, drag: 1.5, color: ['#d6b8ff', '#9dfcff', '#ffffff'], shape: 'glow', jitter: 14 },
  coins: { n: 10, speed: [180, 360], angle: -Math.PI / 2, spread: 1.2, life: [0.7, 1.1], size: [3, 5], grow: 0.6, gravity: 900, drag: 0.8, color: ['#ffe27a', '#ffc93c'], shape: 'glow' },
  fire: { n: 24, speed: [60, 320], life: [0.3, 0.7], size: [8, 16], grow: 0.4, gravity: -220, drag: 3.2, color: '#ffc061', fadeTo: '#c42a0a', shape: 'glow', opacity: 0.45 },
} satisfies Record<string, Emit>;

export type Preset = keyof typeof PRESETS;

interface P {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  grow: number;
  rot: number;
  vr: number;
  g: number;
  drag: number;
  colors: string[];
  shape: Shape;
  add: boolean;
  stretch: number;
  op: number;
}

interface Ring {
  x: number;
  y: number;
  r0: number;
  r1: number;
  t: number;
  life: number;
  color: string;
  width: number;
}
interface Text {
  x: number;
  y: number;
  s: string;
  /** The game's font family (default system-ui) */
  font?: string;
  /** Wider than this, the text shrinks to fit (px; a narrow phone) */
  maxWidth?: number;
  t: number;
  life: number;
  color: string;
  size: number;
}
interface Arc {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  t: number;
  life: number;
  color: string;
  width: number;
  seed: number;
}
interface DynLight extends Light {
  t: number;
  life: number;
  i0: number;
}

const ramps = new Map<string, string[]>();
function colorsOf(c: string, to?: string): string[] {
  if (!to) return [c];
  const k = `${c}>${to}`;
  let r = ramps.get(k);
  if (!r) {
    r = [0, 1, 2, 3, 4, 5].map((i) => mix(c, to, i / 5));
    ramps.set(k, r);
  }
  return r;
}

const discs = new Map<string, { gen: number; c: HTMLCanvasElement }>();
/** A hard disc per colour (32 px), for dots: one drawImage instead of a path per particle */
function disc(color: string): HTMLCanvasElement {
  const hit = discs.get(color);
  if (hit && hit.gen === bakeGen()) return hit.c;
  const [c, g] = canvas2d(32, 32);
  g.fillStyle = color;
  g.beginPath();
  g.arc(16, 16, 15, 0, Math.PI * 2);
  g.fill();
  discs.set(color, { gen: bakeGen(), c });
  return c;
}

export interface FxOptions {
  /** The hard cap on particles (default 1500); past it the oldest are reused */
  max?: number;
  seed?: number;
}

export class Fx {
  readonly max: number;
  /** 0…1: scales how many particles every emit makes (AutoQuality sets it) */
  quality = 1;
  /** Hit-stop: while > 0, update() advances effects at `stopScale` (the game should freeze its own sim too: frozen()) */
  stop = 0;
  stopScale = 0.05;
  private pool: P[] = [];
  private alive = 0;
  private next = 0;
  private rings: Ring[] = [];
  private texts: Text[] = [];
  private arcs: Arc[] = [];
  private dyn: DynLight[] = [];
  private flashA = 0;
  private flashC = '#ffffff';
  private flashRate = 4;
  private rng: SeededRng;
  private t = 0;
  constructor(o: FxOptions = {}) {
    this.max = o.max ?? 1500;
    this.rng = seededRng(o.seed ?? 1);
  }
  /** Live particles */
  get count(): number {
    return this.alive;
  }
  /** Everything at once: particles, rings, texts, arcs, lights */
  get busy(): number {
    return this.alive + this.rings.length + this.texts.length + this.arcs.length + this.dyn.length;
  }
  reseed(seed: number): void {
    this.rng = seededRng(seed);
  }
  private slot(): P {
    if (this.alive < this.pool.length) return this.pool[this.alive++];
    if (this.pool.length < this.max) {
      const p = {} as P;
      this.pool.push(p);
      this.alive++;
      return p;
    }
    // Full: reuse round-robin (new effects stay visible; the cap holds)
    this.next = (this.next + 1) % this.max;
    return this.pool[this.next];
  }
  /** Emit a preset or a spec at (x, y); scale multiplies speed, size and count's spread; returns how many */
  emit(spec: Preset | Emit, x: number, y: number, o: { angle?: number; spread?: number; scale?: number; color?: string | string[]; n?: number } = {}): number {
    const e: Emit = typeof spec === 'string' ? PRESETS[spec] : spec;
    const r = this.rng;
    const sc = o.scale ?? 1;
    const n = Math.max(1, Math.round((o.n ?? e.n) * this.quality));
    const ang = o.angle ?? e.angle ?? 0;
    const spread = o.spread ?? e.spread ?? Math.PI * 2;
    const cols = o.color ?? e.color;
    const list = Array.isArray(cols) ? cols : [cols];
    const add = e.additive ?? (e.shape === 'glow' || e.shape === 'spark');
    for (let i = 0; i < n; i++) {
      const p = this.slot();
      const a = ang + (r() - 0.5) * spread;
      const v = (e.speed[0] + r() * (e.speed[1] - e.speed[0])) * sc;
      const j = (e.jitter ?? 0) * sc;
      p.x = x + (r() - 0.5) * 2 * j;
      p.y = y + (r() - 0.5) * 2 * j;
      p.vx = Math.cos(a) * v;
      p.vy = Math.sin(a) * v;
      p.life = 0;
      p.max = e.life[0] + r() * (e.life[1] - e.life[0]);
      p.size = (e.size[0] + r() * (e.size[1] - e.size[0])) * sc;
      p.grow = e.grow ?? 1;
      p.rot = r() * Math.PI * 2;
      p.vr = (r() - 0.5) * 2 * (e.spin ?? 0);
      p.g = (e.gravity ?? 0) * sc;
      p.drag = e.drag ?? 0;
      p.colors = colorsOf(list[(r() * list.length) | 0], e.fadeTo);
      p.shape = e.shape;
      p.add = add;
      p.stretch = e.stretch ?? 0;
      p.op = e.opacity ?? 1;
    }
    return n;
  }
  /** A shockwave ring growing from r0 to r1 px */
  ring(x: number, y: number, o: { r0?: number; r1?: number; life?: number; color?: string; width?: number } = {}): void {
    this.rings.push({ x, y, r0: o.r0 ?? 8, r1: o.r1 ?? 120, t: 0, life: o.life ?? 0.45, color: o.color ?? '#ffe6b0', width: o.width ?? 10 });
  }
  /** Floating text that pops in and rises: a score, damage, "Combo!" */
  text(x: number, y: number, s: string, o: { color?: string; size?: number; life?: number; font?: string; maxWidth?: number } = {}): void {
    this.texts.push({ x, y, s, t: 0, life: o.life ?? 0.9, color: o.color ?? '#fff3c4', size: o.size ?? 22, font: o.font, maxWidth: o.maxWidth });
  }
  /** An electric arc between two points, re-jagged every 50 ms */
  arc(x0: number, y0: number, x1: number, y1: number, o: { color?: string; life?: number; width?: number } = {}): void {
    this.arcs.push({ x0, y0, x1, y1, t: 0, life: o.life ?? 0.25, color: o.color ?? '#9dfcff', width: o.width ?? 2, seed: (this.rng() * 1e6) | 0 });
  }
  /** A dynamic light that fades out (a muzzle flash, an explosion): read them with lights() into a LightLayer */
  light(x: number, y: number, radius: number, color: string, o: { intensity?: number; life?: number } = {}): void {
    const i = o.intensity ?? 1.4;
    this.dyn.push({ x, y, radius, color, intensity: i, i0: i, t: 0, life: o.life ?? 0.35, shadows: false });
  }
  /** The dynamic lights now (fading) */
  lights(): Light[] {
    return this.dyn;
  }
  /** A full-screen flash (drawScreen draws it): strength 0…1, fading `rate` per second. None under prefers-reduced-motion */
  flash(color = '#ffffff', strength = 0.6, rate = 4): void {
    if (reducedMotion()) return;
    this.flashC = color;
    this.flashA = Math.max(this.flashA, strength);
    this.flashRate = rate;
  }
  /** Freeze the action for a beat on a big hit (≈ 0.05–0.12 s): the game skips its sim while frozen() */
  hitStop(sec = 0.08): void {
    this.stop = Math.max(this.stop, sec);
  }
  frozen(): boolean {
    return this.stop > 0;
  }
  /** An explosion: fireball, sparks, smoke, debris, a shockwave, a light and a flash. Returns trauma for the camera */
  explode(x: number, y: number, o: { scale?: number; color?: string } = {}): number {
    const s = o.scale ?? 1;
    this.emit('fire', x, y, { scale: s, n: 30 });
    this.emit('sparks', x, y, { scale: s, n: 30 });
    this.emit('smoke', x, y - 10 * s, { scale: s * 1.5, n: 18, spread: Math.PI * 1.2 });
    this.emit('debris', x, y, { scale: s });
    this.emit('embers', x, y, { scale: s, n: 16 });
    this.ring(x, y, { r0: 10 * s, r1: 160 * s, width: 9 * s, color: o.color ?? '#ffc477' });
    this.ring(x, y, { r0: 4 * s, r1: 90 * s, life: 0.28, width: 4 * s, color: '#fff4dc' });
    // The core: one big, short flash
    this.emit({ n: 1, speed: [0, 0], life: [0.16, 0.16], size: [16, 16], grow: 2, color: '#ffd890', fadeTo: '#ff5a14', shape: 'glow', opacity: 0.6 }, x, y, { scale: s });
    this.light(x, y, 340 * s, o.color ?? '#ffa04a', { intensity: 1.6, life: 0.6 });
    this.flash('#ffe2b0', 0.16 * Math.min(1, s), 3);
    this.hitStop(0.06);
    return Math.min(1, 0.55 * s);
  }
  update(dt: number): void {
    if (this.stop > 0) {
      this.stop = Math.max(0, this.stop - dt);
      dt *= this.stopScale;
    }
    this.t += dt;
    const pool = this.pool;
    let n = this.alive;
    for (let i = 0; i < n; ) {
      const p = pool[i];
      p.life += dt;
      if (p.life >= p.max) {
        // Swap-remove: the last live particle takes this slot
        n--;
        pool[i] = pool[n];
        pool[n] = p;
        continue;
      }
      const k = p.drag ? Math.max(0, 1 - p.drag * dt) : 1;
      p.vx *= k;
      p.vy = p.vy * k + p.g * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      i++;
    }
    this.alive = n;
    if (this.next >= n) this.next = 0;
    const keep = <T extends { t: number; life: number }>(l: T[]) => {
      let j = 0;
      for (const x of l) if ((x.t += dt) < x.life) l[j++] = x;
      l.length = j;
    };
    keep(this.rings);
    keep(this.texts);
    keep(this.arcs);
    keep(this.dyn);
    for (const d of this.dyn) d.intensity = d.i0 * (1 - d.t / d.life) ** 2;
    this.flashA = Math.max(0, this.flashA - this.flashRate * dt);
  }
  /** Draw the particles, rings, arcs and texts (in world space: inside camera.begin/end) */
  draw(ctx: Ctx): void {
    const b0 = ctx.globalCompositeOperation;
    const a0 = ctx.globalAlpha;
    const tm = ctx.getTransform();
    const scale = Math.hypot(tm.a, tm.b);
    // Normal-blended first (smoke under the light), additive after
    for (const pass of [false, true]) {
      ctx.globalCompositeOperation = pass ? 'lighter' : 'source-over';
      for (let i = 0; i < this.alive; i++) {
        const p = this.pool[i];
        if (p.add !== pass) continue;
        const u = p.life / p.max;
        const fade = u < 0.1 && p.shape === 'smoke' ? u / 0.1 : Math.min(1, (1 - u) / 0.4);
        const s = p.size * (1 + (p.grow - 1) * u);
        const col = p.colors[Math.min(p.colors.length - 1, (u * p.colors.length) | 0)];
        ctx.globalAlpha = a0 * fade * p.op;
        switch (p.shape) {
          // Pre-sized, on whole device pixels (radialBlit): a scaled blit at a fractional position is filtered, ≈ 3.5×
          // the cost; a dot under ~8 device px stays smooth (sub-pixel motion), its area is too small to matter
          case 'glow':
            radialBlit(ctx, p.x, p.y, s * 2.5, s * 2.5, col, 'glow');
            break;
          case 'dot':
            if (s * 2 * scale >= 8) radialBlit(ctx, p.x, p.y, s, s, col, 'disc');
            else ctx.drawImage(disc(col), p.x - s, p.y - s, s * 2, s * 2);
            break;
          case 'smoke':
            radialBlit(ctx, p.x, p.y, s, s, col, 'shadow');
            break;
          case 'spark': {
            ctx.strokeStyle = col;
            ctx.lineWidth = s;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x - p.vx * p.stretch, p.y - p.vy * p.stretch);
            ctx.stroke();
            break;
          }
          case 'shard':
          case 'confetti': {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            ctx.fillStyle = col;
            if (p.shape === 'confetti') {
              const w = s * Math.abs(Math.cos(p.rot * 1.7)) + 0.5;
              ctx.fillRect(-w / 2, -s * 0.3, w, s * 0.6);
            } else {
              ctx.beginPath();
              ctx.moveTo(-s, -s * 0.5);
              ctx.lineTo(s, -s * 0.2);
              ctx.lineTo(-s * 0.2, s * 0.7);
              ctx.closePath();
              ctx.fill();
              ctx.strokeStyle = outlineOf(col);
              ctx.lineWidth = 0.8;
              ctx.stroke();
            }
            ctx.restore();
            break;
          }
        }
      }
    }
    ctx.globalCompositeOperation = 'lighter';
    for (const r of this.rings) {
      const u = r.t / r.life;
      const e = 1 - (1 - u) ** 3;
      ctx.globalAlpha = a0 * (1 - u) ** 1.5;
      ctx.strokeStyle = r.color;
      ctx.lineWidth = Math.max(0.5, r.width * (1 - u));
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.r0 + (r.r1 - r.r0) * e, 0, Math.PI * 2);
      ctx.stroke();
    }
    for (const a of this.arcs) {
      const pts = boltPoints(a.x0, a.y0, a.x1, a.y1, { segments: 9, jitter: 0.14, seed: a.seed + Math.floor(a.t / 0.05) });
      ctx.globalAlpha = a0 * (1 - a.t / a.life);
      for (const [w, c] of [[a.width * 4, alpha(a.color, 0.35)], [a.width, '#ffffff']] as const) {
        ctx.strokeStyle = c;
        ctx.lineWidth = w;
        ctx.lineJoin = 'round';
        ctx.beginPath();
        pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        ctx.stroke();
      }
    }
    ctx.globalCompositeOperation = 'source-over';
    for (const tx of this.texts) {
      const u = tx.t / tx.life;
      const pop = u < 0.18 ? 0.4 + 0.75 * Math.sin((u / 0.18) * Math.PI * 0.5) * (1.15 - 0.15 * (u / 0.18)) : 1;
      const size = tx.size * pop;
      ctx.globalAlpha = a0 * Math.min(1, (1 - u) / 0.3);
      const family = tx.font ?? 'system-ui, sans-serif';
      ctx.font = `900 ${Math.round(size)}px ${family}`;
      // Too wide for its room (a long "Masterpiece!" in German on a 360 px phone): the same text, smaller
      if (tx.maxWidth) {
        const w = ctx.measureText(tx.s).width;
        if (w > tx.maxWidth) ctx.font = `900 ${Math.max(8, Math.floor(size * (tx.maxWidth / w)))}px ${family}`;
      }
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const y = tx.y - 40 * (1 - (1 - u) ** 2);
      ctx.lineJoin = 'round';
      ctx.lineWidth = Math.max(2, size * 0.18);
      ctx.strokeStyle = outlineOf(tx.color);
      ctx.strokeText(tx.s, tx.x, y);
      ctx.fillStyle = tx.color;
      ctx.fillText(tx.s, tx.x, y);
    }
    ctx.globalAlpha = a0;
    ctx.globalCompositeOperation = b0;
  }
  /** The screen flash (in screen space, after the camera and the lights) */
  drawScreen(ctx: Ctx, w: number, h: number): void {
    if (this.flashA <= 0.002) return;
    const a0 = ctx.globalAlpha;
    const b0 = ctx.globalCompositeOperation;
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = a0 * this.flashA;
    ctx.fillStyle = this.flashC;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = a0;
    ctx.globalCompositeOperation = b0;
  }
  clear(): void {
    this.alive = 0;
    this.rings.length = this.texts.length = this.arcs.length = this.dyn.length = 0;
    this.flashA = 0;
    this.stop = 0;
  }
}

/** A ribbon behind a moving thing (a sword swing, a dash, a comet): push its position every frame */
export class Trail {
  private pts: { x: number; y: number; t: number }[] = [];
  private t = 0;
  readonly life: number;
  /** The most points it keeps (oldest out first): a paused clock (dt 0) or a very high frame rate can't grow it */
  readonly max: number;
  width: number;
  color: string;
  additive: boolean;
  constructor(o: { life?: number; width?: number; color?: string; additive?: boolean; max?: number } = {}) {
    this.life = o.life ?? 0.25;
    this.max = Math.max(2, o.max ?? 64);
    this.width = o.width ?? 10;
    this.color = o.color ?? '#9dfcff';
    this.additive = o.additive ?? true;
  }
  /** Points in the ribbon now */
  get length(): number {
    return this.pts.length;
  }
  push(x: number, y: number, dt: number): void {
    this.t += dt;
    const last = this.pts[this.pts.length - 1];
    // The clock didn't move (a pause, a hit-stop): move the newest point instead of adding one
    if (last && dt <= 0) {
      last.x = x;
      last.y = y;
    } else this.pts.push({ x, y, t: this.t });
    while (this.pts.length && (this.t - this.pts[0].t > this.life || this.pts.length > this.max)) this.pts.shift();
  }
  draw(ctx: Ctx): void {
    const p = this.pts;
    if (p.length < 2) return;
    const b0 = ctx.globalCompositeOperation;
    if (this.additive) ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = this.color;
    // A tapered strip: each segment's width grows with its age's inverse
    ctx.beginPath();
    const side = (i: number, s: number) => {
      const a = p[Math.max(0, i - 1)];
      const b = p[Math.min(p.length - 1, i + 1)];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const d = Math.hypot(dx, dy) || 1;
      const w = (this.width / 2) * (1 - (this.t - p[i].t) / this.life);
      return [p[i].x + (-dy / d) * w * s, p[i].y + (dx / d) * w * s] as const;
    };
    for (let i = 0; i < p.length; i++) {
      const [x, y] = side(i, 1);
      if (i) ctx.lineTo(x, y);
      else ctx.moveTo(x, y);
    }
    for (let i = p.length - 1; i >= 0; i--) ctx.lineTo(...side(i, -1));
    ctx.closePath();
    const g = ctx.createLinearGradient(p[0].x, p[0].y, p[p.length - 1].x, p[p.length - 1].y);
    g.addColorStop(0, alpha(this.color, 0));
    g.addColorStop(1, alpha(this.color, 0.85));
    ctx.fillStyle = g;
    ctx.fill();
    ctx.globalCompositeOperation = b0;
  }
}

let shimBuf: [HTMLCanvasElement, Ctx] | null = null;

/**
 * Heat shimmer: the canvas region (x, y, w, h in the current transform's units) copied once, then redrawn in thin
 * strips, each shifted sideways by a travelling wave. Reading the canvas costs a copy of it in Chrome: keep it to a few
 * small regions per frame (a vent, an exhaust); draw it after what it distorts.
 */
export function shimmer(ctx: Ctx, x: number, y: number, w: number, h: number, t: number, amp = 2, strips = 10): void {
  const m = ctx.getTransform();
  const sx = Math.hypot(m.a, m.b);
  const sy = Math.hypot(m.c, m.d);
  const pw = Math.ceil(w * sx);
  const ph = Math.ceil(h * sy);
  if (pw < 2 || ph < 2) return;
  if (!shimBuf || shimBuf[0].width < pw || shimBuf[0].height < ph) shimBuf = canvas2d(Math.max(pw, 128), Math.max(ph, 128));
  const [bc, bg] = shimBuf;
  bg.clearRect(0, 0, pw, ph);
  bg.drawImage(ctx.canvas, x * m.a + y * m.c + m.e, x * m.b + y * m.d + m.f, pw, ph, 0, 0, pw, ph);
  const sh = h / strips;
  const a0 = ctx.globalAlpha;
  ctx.globalAlpha = a0 * 0.85;
  for (let i = 0; i < strips; i++) {
    const off = Math.sin(t * 9 + i * 0.9) * amp * (1 - i / strips);
    ctx.drawImage(bc, 0, i * sh * sy, pw, sh * sy, x + off, y + i * sh, w, sh);
  }
  ctx.globalAlpha = a0;
}

// --- The action moment --------------------------------------------------------------------------------------------

export interface BurstOptions {
  /** Back to front: smoke, outer fire, inner fire, the hot core */
  colors?: { smoke?: string; fire?: string; hot?: string; core?: string };
  /** Rays out of the core (default 12; 0: none) */
  rays?: number;
  seed?: number;
}

/**
 * A key-art explosion (a hit, a blast, a magic burst with other colours): smoke puffs, two rings of fire puffs, a white-hot
 * core, rays and a glow — big shapes that read at thumbnail size, where particles mid-flight blur into a smudge. `r` is
 * the fireball's radius, px. Drawn at once (no particles): a cover's action moment (docs/guides/covers.md), a boss's death frame
 */
export function burst(g: CanvasRenderingContext2D, x: number, y: number, r: number, o: BurstOptions = {}): void {
  const c = { smoke: '#2a2348', fire: '#ff6a1a', hot: '#ffc23a', core: '#fff8dc', ...o.colors };
  const seed = o.seed ?? 3;
  const rays = o.rays ?? 12;
  g.save();
  // The light it throws
  const halo = g.createRadialGradient(x, y, r * 0.2, x, y, r * 2.1);
  halo.addColorStop(0, alpha(c.hot, 0.55));
  halo.addColorStop(0.45, alpha(c.fire, 0.22));
  halo.addColorStop(1, alpha(c.fire, 0));
  g.globalCompositeOperation = 'lighter';
  g.fillStyle = halo;
  g.fillRect(x - r * 2.2, y - r * 2.2, r * 4.4, r * 4.4);
  g.globalCompositeOperation = 'source-over';
  // Smoke behind, mostly above (it rises)
  for (let i = 0; i < 9; i++) {
    const a = -Math.PI / 2 + (hash(i, seed) - 0.5) * Math.PI * 1.7;
    const d = r * (0.62 + 0.25 * hash(i, seed + 1));
    const s = r * (0.34 + 0.16 * hash(i, seed + 2));
    const px = x + Math.cos(a) * d;
    const py = y + Math.sin(a) * d * 0.85;
    const gr = g.createRadialGradient(px - s * 0.3, py - s * 0.35, s * 0.1, px, py, s);
    gr.addColorStop(0, shade(c.smoke, 0.35));
    gr.addColorStop(1, c.smoke);
    g.fillStyle = gr;
    g.fill(blob(px, py, s, s * 0.9, { n: 9, wobble: 0.12, seed: seed + i }));
  }
  // Rays
  if (rays > 0) {
    g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < rays; i++) {
      const a = (i / rays) * Math.PI * 2 + hash(i, seed + 7) * 0.4;
      const len = r * (1.25 + 0.6 * hash(i, seed + 8));
      const wd = 0.09 + 0.05 * hash(i, seed + 9);
      const gr = g.createLinearGradient(x, y, x + Math.cos(a) * len, y + Math.sin(a) * len);
      gr.addColorStop(0, alpha(c.core, 0.7));
      gr.addColorStop(1, alpha(c.hot, 0));
      g.fillStyle = gr;
      g.beginPath();
      g.moveTo(x + Math.cos(a - wd) * r * 0.2, y + Math.sin(a - wd) * r * 0.2);
      g.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
      g.lineTo(x + Math.cos(a + wd) * r * 0.2, y + Math.sin(a + wd) * r * 0.2);
      g.fill();
    }
    g.globalCompositeOperation = 'source-over';
  }
  // Fire: an outer ring of puffs, an inner one, each lit from the core
  const ring = (n: number, dist: number, size: number, col: string, k: number) => {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + hash(i, seed + k) * 0.5;
      const d = r * dist * (0.8 + 0.4 * hash(i, seed + k + 1));
      const s = r * size * (0.8 + 0.4 * hash(i, seed + k + 2));
      const px = x + Math.cos(a) * d;
      const py = y + Math.sin(a) * d;
      const gr = g.createRadialGradient(x + (px - x) * 0.6, y + (py - y) * 0.6, s * 0.1, px, py, s);
      gr.addColorStop(0, mix(col, c.core, 0.45));
      gr.addColorStop(0.7, col);
      gr.addColorStop(1, shade(col, -0.25));
      g.fillStyle = gr;
      g.fill(blob(px, py, s, s, { n: 8, wobble: 0.14, seed: seed + k + i }));
    }
  };
  ring(11, 0.55, 0.36, c.fire, 20);
  ring(8, 0.28, 0.32, c.hot, 40);
  const core = g.createRadialGradient(x, y, 0, x, y, r * 0.5);
  core.addColorStop(0, '#ffffff');
  core.addColorStop(0.45, c.core);
  core.addColorStop(1, alpha(c.hot, 0));
  g.fillStyle = core;
  g.beginPath();
  g.arc(x, y, r * 0.5, 0, Math.PI * 2);
  g.fill();
  g.restore();
}
