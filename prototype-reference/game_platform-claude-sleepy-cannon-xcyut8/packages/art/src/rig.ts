// Characters that feel alive: a part-based rig (parents, pivots, z-order, poses and their blending) and the procedural
// motion that does most of the work — breathing, bob and sway, a seeded blink, look-at, squash and stretch from the
// velocity (volume kept), anticipation and overshoot, springs for secondary motion (antennas, ears, cables, hair),
// jelly, recoil and a hit flash. Pure math except Rig.draw (Node tests the rest).

import { hash } from './noise.ts';
import type { Ctx } from './bake.ts';

export interface PartPose {
  x?: number;
  y?: number;
  rot?: number;
  sx?: number;
  sy?: number;
  alpha?: number;
}

export type Pose = Record<string, PartPose>;

export interface PartDef {
  id: string;
  /** The parent part (none: the rig's root) */
  parent?: string;
  /** Where this part's pivot sits in its parent's space, at rest */
  x?: number;
  y?: number;
  /** Draw order (higher on top); default the order of definition */
  z?: number;
  /** Draw the part around its pivot (0, 0); `t` is the time the rig was drawn at */
  draw(ctx: Ctx, pose: Required<PartPose>, t: number): void;
}

const REST: Required<PartPose> = { x: 0, y: 0, rot: 0, sx: 1, sy: 1, alpha: 1 };

/** Blend two poses (t = 0 → a, 1 → b): parts missing on one side blend from rest */
export function blendPose(a: Pose, b: Pose, t: number): Pose {
  const out: Pose = {};
  for (const id of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const p = { ...REST, ...a[id] };
    const q = { ...REST, ...b[id] };
    out[id] = {
      x: p.x + (q.x - p.x) * t,
      y: p.y + (q.y - p.y) * t,
      rot: p.rot + (q.rot - p.rot) * t,
      sx: p.sx + (q.sx - p.sx) * t,
      sy: p.sy + (q.sy - p.sy) * t,
      alpha: p.alpha + (q.alpha - p.alpha) * t,
    };
  }
  return out;
}

/** Add pose b's offsets on top of a (an idle layer plus a hit reaction): positions and angles add, scales multiply */
export function addPose(a: Pose, b: Pose): Pose {
  const out: Pose = { ...a };
  for (const [id, q] of Object.entries(b)) {
    const p = { ...REST, ...a[id] };
    out[id] = { x: p.x + (q.x ?? 0), y: p.y + (q.y ?? 0), rot: p.rot + (q.rot ?? 0), sx: p.sx * (q.sx ?? 1), sy: p.sy * (q.sy ?? 1), alpha: p.alpha * (q.alpha ?? 1) };
  }
  return out;
}

/**
 * A rig of parts. Each frame: set `pose` (offsets from rest per part: idle motion, blended poses, springs), then
 * draw(ctx, x, y) — parents before children in the transform, all parts in z-order.
 */
export class Rig {
  readonly parts: PartDef[];
  pose: Pose = {};
  private order: PartDef[];
  private byId = new Map<string, PartDef>();
  constructor(parts: PartDef[]) {
    this.parts = parts;
    parts.forEach((p) => this.byId.set(p.id, p));
    for (const p of parts) if (p.parent && !this.byId.has(p.parent)) throw new Error(`@gp/art rig: part "${p.id}" has an unknown parent "${p.parent}"`);
    this.order = parts.map((p, i) => ({ p, i })).sort((a, b) => (a.p.z ?? a.i) - (b.p.z ?? b.i)).map((e) => e.p);
  }
  /** The chain from the root to the part */
  chain(id: string): PartDef[] {
    const out: PartDef[] = [];
    for (let p = this.byId.get(id); p; p = p.parent ? this.byId.get(p.parent) : undefined) out.unshift(p);
    return out;
  }
  /** A part's pivot in the rig's space (where to attach an effect: the antenna tip, the muzzle) */
  worldOf(id: string, lx = 0, ly = 0): [number, number] {
    let x = lx;
    let y = ly;
    const ch = this.chain(id);
    for (let i = ch.length - 1; i >= 0; i--) {
      const d = ch[i];
      const p = { ...REST, ...this.pose[d.id] };
      const c = Math.cos(p.rot);
      const s = Math.sin(p.rot);
      const ux = x * p.sx;
      const uy = y * p.sy;
      x = (d.x ?? 0) + p.x + ux * c - uy * s;
      y = (d.y ?? 0) + p.y + ux * s + uy * c;
    }
    return [x, y];
  }
  draw(ctx: Ctx, x: number, y: number, o: { scale?: number; flip?: boolean; t?: number } = {}): void {
    const sc = o.scale ?? 1;
    const t = o.t ?? 0;
    for (const part of this.order) {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(o.flip ? -sc : sc, sc);
      let pp = REST;
      for (const d of this.chain(part.id)) {
        pp = { ...REST, ...this.pose[d.id] };
        ctx.translate((d.x ?? 0) + pp.x, (d.y ?? 0) + pp.y);
        if (pp.rot) ctx.rotate(pp.rot);
        if (pp.sx !== 1 || pp.sy !== 1) ctx.scale(pp.sx, pp.sy);
      }
      if (pp.alpha < 1) ctx.globalAlpha *= Math.max(0, pp.alpha);
      part.draw(ctx, pp, t);
      ctx.restore();
    }
  }
}

// --- Springs: secondary motion ----------------------------------------------------------------------------------------

/**
 * A damped spring toward `target`. `freq` (Hz) is how fast it swings, `damping` the ratio: 1 critically damped (no
 * overshoot: a camera, a UI slide), 0.2–0.5 bouncy (antennas, ears, jelly). Semi-implicit and sub-stepped: stable at
 * any frame time.
 */
export class Spring {
  value: number;
  velocity = 0;
  target: number;
  freq: number;
  damping: number;
  constructor(value = 0, o: { freq?: number; damping?: number } = {}) {
    this.value = this.target = value;
    this.freq = o.freq ?? 3;
    this.damping = o.damping ?? 0.35;
  }
  update(dt: number): number {
    const w = this.freq * Math.PI * 2;
    const n = Math.max(1, Math.ceil(dt / (1 / 120)));
    const h = dt / n;
    for (let i = 0; i < n; i++) {
      this.velocity += (-w * w * (this.value - this.target) - 2 * this.damping * w * this.velocity) * h;
      this.value += this.velocity * h;
    }
    return this.value;
  }
  /** A push: added velocity (a hit, a jump) */
  impulse(v: number): this {
    this.velocity += v;
    return this;
  }
}

/**
 * A chain hanging from a moving anchor that lags and swings: an antenna, a tail, a cable. Feed it the anchor's motion
 * (acceleration makes it swing back); read the angles (radians, relative to straight up / the rest angle) per segment.
 */
export class Wobble {
  readonly springs: Spring[];
  private lastX = 0;
  private lastV = 0;
  private started = false;
  constructor(segments = 2, o: { freq?: number; damping?: number } = {}) {
    this.springs = Array.from({ length: segments }, (_, i) => new Spring(0, { freq: (o.freq ?? 2.6) * (1 + i * 0.35), damping: o.damping ?? 0.22 }));
  }
  /** x: the anchor's horizontal position this step (px); returns the segments' angles */
  update(dt: number, x: number, lean = 0): number[] {
    if (!this.started || dt <= 0) {
      this.started = true;
      this.lastX = x;
      return this.springs.map((s) => s.value);
    }
    const v = (x - this.lastX) / dt;
    const acc = (v - this.lastV) / dt;
    this.lastX = x;
    this.lastV = v;
    let prev = 0;
    return this.springs.map((s, i) => {
      // Inertia: acceleration pushes the tip the other way; each segment also follows the one before
      s.impulse(-acc * 0.00045 * (1 + i * 0.5) * dt * 60);
      s.target = lean + prev * 0.5;
      prev = s.update(dt);
      return prev;
    });
  }
  hit(v: number): void {
    this.springs.forEach((s, i) => s.impulse(v * (1 + i * 0.6)));
  }
}

// --- Procedural motion ----------------------------------------------------------------------------------------------

/** Breathing: a slow, volume-kept scale (sy up, sx down) — the cheapest "it's alive" */
export function breathe(t: number, rate = 0.3, amount = 0.025, phase = 0): { sx: number; sy: number } {
  const s = Math.sin((t * rate + phase) * Math.PI * 2);
  const sy = 1 + amount * s;
  return { sx: 1 / Math.sqrt(sy), sy };
}

/** A bob up and down (px): a hover, an idle float */
export const bob = (t: number, freq = 0.6, amp = 3, phase = 0): number => Math.sin((t * freq + phase) * Math.PI * 2) * amp;

/** A sway (radians): grass, a hanging sign, an idle lean */
export const sway = (t: number, freq = 0.25, amp = 0.05, phase = 0): number => Math.sin((t * freq + phase) * Math.PI * 2) * amp + Math.sin((t * freq * 2.3 + phase * 1.7) * Math.PI * 2) * amp * 0.3;

/**
 * Seeded blinks: closed 0…1 over time, at irregular intervals (2–5 s), now and then a double blink. Deterministic for
 * a seed, so QA screenshots repeat.
 */
export class Blinker {
  value = 0;
  private t = 0;
  private next: number;
  private n = 0;
  private dbl = false;
  private readonly seed: number;
  private readonly min: number;
  private readonly max: number;
  private readonly dur: number;
  constructor(seed = 1, o: { min?: number; max?: number; duration?: number } = {}) {
    this.seed = seed;
    this.min = o.min ?? 2;
    this.max = o.max ?? 5;
    this.dur = o.duration ?? 0.16;
    this.next = this.min * 0.5 + hash(0, seed) * (this.max - this.min);
  }
  update(dt: number): number {
    this.t += dt;
    const into = this.t - this.next;
    if (into >= this.dur) {
      this.n++;
      const again = !this.dbl && hash(this.n, this.seed + 3) < 0.2;
      this.dbl = again;
      this.next = this.t + (again ? 0.12 : this.min + hash(this.n, this.seed) * (this.max - this.min));
      this.value = 0;
    } else this.value = into < 0 ? 0 : Math.sin((into / this.dur) * Math.PI);
    return this.value;
  }
}

/** Where to look: the offset toward a point, −1…1 on each axis (eye(), visorEyes() take it) */
export function lookAt(fromX: number, fromY: number, toX: number, toY: number, reach = 200): [number, number] {
  const dx = (toX - fromX) / reach;
  const dy = (toY - fromY) / reach;
  const d = Math.hypot(dx, dy);
  return d > 1 ? [dx / d, dy / d] : [dx, dy];
}

/**
 * Squash and stretch from the velocity: longer along the motion, thinner across it, area kept (sx·sy = 1).
 * Apply as rotate(rot) · scale(sx, sy) · rotate(−rot). k: stretch per px/s; max: the cap.
 */
export function stretch(vx: number, vy: number, k = 0.0012, max = 0.35): { sx: number; sy: number; rot: number } {
  const v = Math.hypot(vx, vy);
  const s = 1 + Math.min(max, v * k);
  return { sx: s, sy: 1 / s, rot: v > 1e-6 ? Math.atan2(vy, vx) : 0 };
}

/** A landing or a hit squash: amount 0…1 → flatter and wider, area kept */
export function squash(amount: number): { sx: number; sy: number } {
  const sy = 1 - Math.max(-0.6, Math.min(0.6, amount)) * 0.5;
  return { sx: 1 / sy, sy };
}

/**
 * Anticipation → action → follow-through over t 0…1 for a move from 0 to 1: it first pulls back by `back`, then
 * overshoots by `over` and settles. Use for a jump, a punch, a UI pop.
 */
export function anticipate(t: number, back = 0.15, over = 0.1): number {
  t = Math.max(0, Math.min(1, t));
  if (t < 0.25) return -back * Math.sin((t / 0.25) * Math.PI * 0.5);
  if (t < 0.6) {
    const u = (t - 0.25) / 0.35;
    return -back + (1 + over + back) * (1 - (1 - u) * (1 - u));
  }
  const u = (t - 0.6) / 0.4;
  return 1 + over * Math.cos(u * Math.PI * 1.5) * (1 - u);
}

/** A value that jumps and decays to 0 (a hit flash, a muzzle light): hit(), update(dt), value */
export class Pulse {
  value = 0;
  private readonly rate: number;
  /** rate: how much it loses per second (default 6: a flash of ≈ 0.15 s) */
  constructor(rate = 6) {
    this.rate = rate;
  }
  hit(v = 1): this {
    this.value = Math.max(this.value, v);
    return this;
  }
  update(dt: number): number {
    this.value = Math.max(0, this.value - this.rate * dt);
    return this.value;
  }
}

/**
 * Jelly: a bouncy scale (hit it to wobble), area kept — slimes, buttons, pickups. Step it in the game's update
 * (`jelly.update(dt)`) and read `jelly.value` where it is drawn: update(0) moves nothing.
 */
export class Jelly {
  private s = new Spring(0, { freq: 4.5, damping: 0.18 });
  /** The scale after the last update() */
  value = { sx: 1, sy: 1 };
  hit(amount = 0.25): this {
    this.s.impulse(amount * 30);
    return this;
  }
  update(dt: number): { sx: number; sy: number } {
    const v = Math.max(-0.45, Math.min(0.45, this.s.update(dt)));
    this.value = { sx: 1 + v, sy: 1 / (1 + v) };
    return this.value;
  }
}

/** Recoil: kicked back by `amount` px when fired, springs forward without bouncing much (update(dt) in the step, `value` to draw) */
export class Recoil {
  private s = new Spring(0, { freq: 5, damping: 0.55 });
  fire(amount = 6): this {
    this.s.value -= amount;
    return this;
  }
  /** The offset after the last update() (px) */
  get value(): number {
    return this.s.value;
  }
  update(dt: number): number {
    return this.s.update(dt);
  }
}
