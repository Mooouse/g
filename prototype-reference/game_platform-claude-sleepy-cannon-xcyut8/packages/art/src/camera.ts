// A 2D camera with feel: it follows a target through a dead zone with critically damped smoothing, looks ahead of
// the target's motion, stays inside the level's bounds, zooms about a point (pinch and scroll wheel), shakes from
// trauma (smooth seeded noise, decaying — never white-noise jitter) and kicks on hits. Parallax layers scroll by their
// depth factor; world↔screen transforms; a culling test. Pure math (Node tests it) plus begin/end on a context.

import { noise1 } from './noise.ts';
import type { Ctx } from './bake.ts';

let motionQuery: MediaQueryList | null | undefined;
/**
 * The player asked for less motion (prefers-reduced-motion: reduce): the Camera doesn't shake or kick and Fx draws no
 * full-screen flash (WCAG 2.3.3; `gp qa`'s feel section plays the demo with it on and warns when the frame still jolts)
 */
export function reducedMotion(): boolean {
  if (motionQuery === undefined) motionQuery = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null;
  return !!motionQuery?.matches;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface CameraOptions {
  /** The view in CSS px */
  width?: number;
  height?: number;
  /** Half-size of the dead zone around the centre in CSS px: the target moves freely inside it */
  deadZone?: [number, number];
  /** Seconds the follow takes to close most of the gap (critically damped; 0 = locked) */
  smooth?: number;
  /** Seconds of the target's velocity to look ahead by */
  lookAhead?: number;
  /** The world rectangle the view must stay inside (null: none) */
  bounds?: Rect | null;
  zoom?: number;
  minZoom?: number;
  maxZoom?: number;
  /** Shake at full trauma: px on each axis and radians of roll */
  shake?: { x: number; y: number; rot: number; freq?: number };
  /** Trauma lost per second (default 1.4: a full shake lasts ≈ 0.7 s) */
  decay?: number;
  seed?: number;
}

/** Critically damped follow of one axis (Game Programming Gems 4 "SmoothDamp"): no overshoot, frame-rate independent */
export function smoothDamp(cur: number, target: number, vel: { v: number }, smooth: number, dt: number): number {
  if (smooth <= 0 || dt <= 0) {
    vel.v = 0;
    return dt <= 0 ? cur : target;
  }
  const omega = 2 / smooth;
  const x = omega * dt;
  const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
  const change = cur - target;
  const temp = (vel.v + omega * change) * dt;
  vel.v = (vel.v - omega * temp) * exp;
  return target + (change + temp) * exp;
}

export class Camera {
  /** The view's centre in the world */
  x = 0;
  y = 0;
  zoom: number;
  w: number;
  h: number;
  deadZone: [number, number];
  smooth: number;
  lookAhead: number;
  bounds: Rect | null;
  minZoom: number;
  maxZoom: number;
  shakeMax: { x: number; y: number; rot: number; freq: number };
  decay: number;
  /** 0…1; shake grows with trauma² (small hits barely move it, big ones do) */
  trauma = 0;
  /** The current shake offset (px) and roll (rad), applied by begin() */
  sx = 0;
  sy = 0;
  roll = 0;
  private kx = 0;
  private ky = 0;
  private kvx = 0;
  private kvy = 0;
  private tx = 0;
  private ty = 0;
  private bx = 0;
  private by = 0;
  private bv = { v: 0 };
  private bw = { v: 0 };
  private lx = 0;
  private ly = 0;
  private lv = { v: 0 };
  private lw = { v: 0 };
  private lax = 0;
  private lay = 0;
  private t = 0;
  private seed: number;
  constructor(o: CameraOptions = {}) {
    this.w = o.width ?? 800;
    this.h = o.height ?? 600;
    this.deadZone = o.deadZone ?? [40, 30];
    this.smooth = o.smooth ?? 0.25;
    this.lookAhead = o.lookAhead ?? 0.3;
    this.bounds = o.bounds ?? null;
    this.zoom = o.zoom ?? 1;
    this.minZoom = o.minZoom ?? 0.5;
    this.maxZoom = o.maxZoom ?? 3;
    this.shakeMax = { freq: 18, ...(o.shake ?? { x: 14, y: 12, rot: 0.035 }) };
    this.decay = o.decay ?? 1.4;
    this.seed = o.seed ?? 1;
  }
  setView(w: number, h: number): this {
    this.w = w;
    this.h = h;
    return this;
  }
  /** Jump to a point now (a level start, a respawn): no smoothing */
  snap(x: number, y: number): this {
    this.x = this.tx = this.bx = x;
    this.y = this.ty = this.by = y;
    this.bv.v = this.bw.v = this.lv.v = this.lw.v = 0;
    this.lax = this.lay = this.lx = this.ly = 0;
    this.clamp();
    return this;
  }
  /** The target this frame (and its velocity, for the look-ahead) */
  follow(x: number, y: number, vx = 0, vy = 0): this {
    const [dw, dh] = this.deadZone;
    const z = this.zoom;
    // Move the goal only as far as the target leaves the dead zone
    if (x > this.tx + dw / z) this.tx = x - dw / z;
    else if (x < this.tx - dw / z) this.tx = x + dw / z;
    if (y > this.ty + dh / z) this.ty = y - dh / z;
    else if (y < this.ty - dh / z) this.ty = y + dh / z;
    this.lax = vx * this.lookAhead;
    this.lay = vy * this.lookAhead;
    return this;
  }
  /** Add trauma 0…1 (a hit 0.25, an explosion 0.6) */
  addTrauma(amount: number): this {
    this.trauma = Math.min(1, this.trauma + amount);
    return this;
  }
  /** A kick: the view is punched by (dx, dy) px and springs back (recoil, a heavy landing) */
  kick(dx: number, dy: number): this {
    this.kvx += dx * 30;
    this.kvy += dy * 30;
    return this;
  }
  /** Zoom by `factor` keeping the screen point (sx, sy) over the same world point (pinch centre, mouse) */
  zoomAt(factor: number, sx = this.w / 2, sy = this.h / 2): this {
    const [wx, wy] = this.toWorld(sx, sy);
    this.zoom = Math.min(this.maxZoom, Math.max(this.minZoom, this.zoom * factor));
    const [wx2, wy2] = this.toWorld(sx, sy);
    this.x += wx - wx2;
    this.y += wy - wy2;
    this.tx += wx - wx2;
    this.ty += wy - wy2;
    this.bx += wx - wx2;
    this.by += wy - wy2;
    this.clamp();
    return this;
  }
  update(dt: number): this {
    this.t += dt;
    // The base follows the dead-zone goal; the look-ahead eases on its own, slower (it should not swing on every turn)
    this.bx = smoothDamp(this.bx, this.tx, this.bv, this.smooth, dt);
    this.by = smoothDamp(this.by, this.ty, this.bw, this.smooth, dt);
    this.lx = smoothDamp(this.lx, this.lax, this.lv, this.smooth * 2, dt);
    this.ly = smoothDamp(this.ly, this.lay, this.lw, this.smooth * 2, dt);
    this.x = this.bx + this.lx;
    this.y = this.by + this.ly;
    this.clamp();
    // At a bound the base stops there too, so the view leaves the edge as soon as the target turns back
    this.bx = this.x - this.lx;
    this.by = this.y - this.ly;
    // Kick: a stiff spring back to 0, sub-stepped (h ≤ 1/120 s) like Spring.update: one step of a frame's length
    // diverges from dt ≈ 0.06 s, and the engine driver hands out up to 0.1 s after a hitch
    const k = 320;
    const d = 2 * Math.sqrt(k) * 0.7;
    const n = dt > 0 ? Math.ceil(dt * 120) : 0;
    const h = n ? dt / n : 0;
    for (let i = 0; i < n; i++) {
      this.kvx += (-k * this.kx - d * this.kvx) * h;
      this.kvy += (-k * this.ky - d * this.kvy) * h;
      this.kx += this.kvx * h;
      this.ky += this.kvy * h;
    }
    // Shake from trauma: smooth noise per axis (none, and no kick, for a player who asked for reduced motion)
    const still = reducedMotion();
    const s = still ? 0 : this.trauma * this.trauma;
    const f = this.shakeMax.freq;
    this.sx = this.shakeMax.x * s * noise1(this.t * f, this.seed) + (still ? 0 : this.kx);
    this.sy = this.shakeMax.y * s * noise1(this.t * f, this.seed + 1) + (still ? 0 : this.ky);
    this.roll = this.shakeMax.rot * s * noise1(this.t * f * 0.7, this.seed + 2);
    // A roll that moves the view's corners by less than ¼ px shows nothing, but a rotated view makes every blit of the
    // frame a filtered one (≈ 3–5 ms a frame at 1280×720 on a software rasterizer): none until it shows
    if (Math.abs(this.roll) * Math.hypot(this.w, this.h) * 0.5 < 0.25) this.roll = 0;
    this.trauma = Math.max(0, this.trauma - this.decay * dt);
    return this;
  }
  /** Keep the view inside the bounds (centred when the bounds are smaller than the view) */
  private clamp(): void {
    const b = this.bounds;
    if (!b) return;
    const hw = this.w / 2 / this.zoom;
    const hh = this.h / 2 / this.zoom;
    this.x = b.w <= hw * 2 ? b.x + b.w / 2 : Math.min(b.x + b.w - hw, Math.max(b.x + hw, this.x));
    this.y = b.h <= hh * 2 ? b.y + b.h / 2 : Math.min(b.y + b.h - hh, Math.max(b.y + hh, this.y));
  }
  /** World → screen (CSS px); parallax < 1 for a layer farther away (0: fixed to the screen), shake included */
  toScreen(x: number, y: number, parallax = 1): [number, number] {
    const z = 1 + (this.zoom - 1) * parallax;
    const dx = (x - this.x * parallax) * z;
    const dy = (y - this.y * parallax) * z;
    const c = Math.cos(this.roll);
    const s = Math.sin(this.roll);
    return [this.w / 2 + this.sx + dx * c - dy * s, this.h / 2 + this.sy + dx * s + dy * c];
  }
  /** Screen → world (a tap, the mouse), the inverse of toScreen for parallax 1 */
  toWorld(sx: number, sy: number): [number, number] {
    const dx = sx - this.w / 2 - this.sx;
    const dy = sy - this.h / 2 - this.sy;
    const c = Math.cos(-this.roll);
    const s = Math.sin(-this.roll);
    return [this.x + (dx * c - dy * s) / this.zoom, this.y + (dx * s + dy * c) / this.zoom];
  }
  /** The world rectangle on screen (for parallax 1), with a margin */
  view(margin = 0): Rect {
    const hw = this.w / 2 / this.zoom + margin;
    const hh = this.h / 2 / this.zoom + margin;
    return { x: this.x - hw, y: this.y - hh, w: hw * 2, h: hh * 2 };
  }
  /** Is a world rectangle (or a circle: w = h = 2r around x, y with r) on screen? Skip drawing what isn't */
  visible(x: number, y: number, w: number, h: number, margin = 32): boolean {
    const v = this.view(margin + Math.abs(this.sx) + Math.abs(this.sy));
    return x + w >= v.x && y + h >= v.y && x <= v.x + v.w && y <= v.y + v.h;
  }
  /** Apply the camera to a context (save first); parallax as in toScreen. end() restores */
  begin(ctx: Ctx, parallax = 1): void {
    const z = 1 + (this.zoom - 1) * parallax;
    ctx.save();
    ctx.translate(this.w / 2 + this.sx, this.h / 2 + this.sy);
    if (this.roll) ctx.rotate(this.roll);
    ctx.scale(z, z);
    ctx.translate(-this.x * parallax, -this.y * parallax);
  }
  end(ctx: Ctx): void {
    ctx.restore();
  }
}
