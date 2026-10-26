// A field of moving tap targets: spawning, moving (via a trajectory), hit testing, popping.
// Shared by every scene that has targets on screen (a round, a playable menu background).

import { drawEmoji, drawText, Particles, rng, shade, type App, type Theme } from '@gp/core';
import type { Moving, Trajectory } from '../trajectories/types.ts';

/** What is drawn on a target and what happens when it pops */
export interface TargetContent {
  /** Text on the target */
  label?: string;
  /** Emoji on the target */
  emoji?: string;
  /** What pops up where the target burst */
  popText?: string;
  popEmoji?: string;
  /** Color of the pop-up text (e.g. the target's color in a Colors mode) */
  popColor?: string;
  /** What to say */
  say?: string;
}

export interface Target extends Moving {
  color: string;
  content: TargetContent | null;
  /** Target kind for mechanics that have several (tap-score: normal, golden, spiky); none for tap-collect */
  kind?: string;
}

export interface FieldHooks {
  /** Kind and speed factor of a new target */
  pickKind?: () => { kind: string; speed: number };
  /** A target left the screen without being popped */
  onGone?: (t: Target) => void;
}

export interface TargetSize {
  /** Radius as a share of the screen's short side */
  radius: number;
  /** Limits in CSS px (≈ dp) */
  min: number;
  max: number;
}

export interface FieldConfig {
  /** Max targets on screen at once */
  maxOnScreen: number;
  /** Pause between spawns, s (random within the range) */
  spawnEvery: readonly [number, number];
  target: TargetSize;
}

export class TargetField {
  readonly items: Target[] = [];
  readonly particles = new Particles();
  private spawnTimer = 0.2;
  private lastColor = '';
  private lastW = 0;
  private lastH = 0;
  /** Speed-up (at the end of a round the remaining targets leave faster) */
  speedup = 1;
  /** Spawn-rate factor (> 1 — targets appear more often) */
  spawnFactor = 1;

  constructor(
    private readonly app: App,
    private readonly cfg: FieldConfig,
    private readonly theme: Theme,
    private readonly trajectory: Trajectory,
    private readonly makeContent: (color: string) => TargetContent | null = () => null,
    private readonly hooks: FieldHooks = {},
  ) {}

  /** Target radius for the current screen */
  baseRadius(): number {
    const t = this.cfg.target;
    return Math.min(t.max, Math.max(t.min, this.app.u * t.radius));
  }

  /** Fill the screen right away (a menu shouldn't look empty) */
  prefill(count: number, fromY = 0.2, toY = 0.95): void {
    for (let i = 0; i < count; i++) this.spawn(rng.range(fromY, toY) * this.app.h);
  }

  spawn(atY?: number): void {
    const { w, h } = this.app;
    const r = this.baseRadius();
    const margin = r * 1.25 + this.app.u * 0.02;
    const minX = margin + this.app.inset.left;
    const maxX = Math.max(minX, w - margin - this.app.inset.right);
    // Of several random x values, pick the one farthest from targets still near the entry edge
    let best = rng.range(minX, maxX);
    let bestD = -1;
    for (let i = 0; i < 6; i++) {
      const x = rng.range(minX, maxX);
      let d = Infinity;
      for (const b of this.items) if (b.y > h * 0.55) d = Math.min(d, Math.abs(b.x - x));
      if (d > bestD) {
        bestD = d;
        best = x;
      }
    }
    const palette = this.theme.palette;
    let ci = rng.int(palette.length);
    if (palette[ci] === this.lastColor) ci = (ci + 1) % palette.length;
    const color = palette[ci];
    this.lastColor = color;
    const k = rng.range(0.92, 1.08);
    const y = atY ?? this.trajectory.spawnY(h, r, k, this.theme);
    const kind = this.hooks.pickKind?.();
    this.items.push({
      x: best,
      y,
      k,
      color: kind?.kind === 'golden' ? '#ffc21a' : kind?.kind === 'spiky' ? '#5b6474' : color,
      speed: this.trajectory.speed(h, r) * (kind?.speed ?? 1),
      phase: rng.random() * Math.PI * 2,
      content: this.makeContent(color),
      kind: kind?.kind,
    });
  }

  /** Target center including the sway */
  drawX(b: Target): number {
    return b.x + this.trajectory.swayX(b, this.app.time, this.baseRadius());
  }

  update(dt: number, spawning: boolean): void {
    const { w, h } = this.app;
    // Screen rotation: move targets proportionally so none end up off screen
    if (this.lastW && (w !== this.lastW || h !== this.lastH)) {
      const r = this.baseRadius();
      for (const b of this.items) {
        b.x = Math.min(w - r * 1.3, Math.max(r * 1.3, (b.x * w) / this.lastW));
        b.y = (b.y * h) / this.lastH;
        b.speed = (b.speed * h) / this.lastH;
      }
    }
    this.lastW = w;
    this.lastH = h;

    if (spawning) {
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0 && this.items.length < this.cfg.maxOnScreen) {
        this.spawn();
        this.spawnTimer = rng.range(this.cfg.spawnEvery[0], this.cfg.spawnEvery[1]) / this.spawnFactor;
      }
    }
    const r = this.baseRadius();
    for (let i = this.items.length - 1; i >= 0; i--) {
      const b = this.items[i];
      this.trajectory.step(b, dt, this.speedup);
      if (this.trajectory.gone(b, h, r, this.theme)) {
        this.items.splice(i, 1); // left the screen — just disappears
        this.hooks.onGone?.(b);
      }
    }
    this.particles.update(dt, h);
  }

  /** The topmost (last drawn) target under the finger */
  hit(x: number, y: number): Target | null {
    const r = this.baseRadius();
    const aspect = this.theme.targetAspect;
    for (let i = this.items.length - 1; i >= 0; i--) {
      const b = this.items[i];
      const rr = r * b.k * 1.2; // generous: a small finger rarely hits precisely
      const dx = (x - this.drawX(b)) / rr;
      const dy = (y - b.y) / (rr * aspect);
      if (dx * dx + dy * dy <= 1) return b;
    }
    return null;
  }

  /** Pop: remove the target, confetti, sound. Returns false if the target is already gone */
  pop(b: Target): boolean {
    const i = this.items.indexOf(b);
    if (i < 0) return false;
    this.items.splice(i, 1);
    const r = this.baseRadius() * b.k;
    this.particles.confetti(this.drawX(b), b.y, [b.color, b.color, ...this.theme.palette], 36, r * 4);
    this.theme.popSound(this.app.audio);
    return true;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const r0 = this.baseRadius();
    const t = this.app.time;
    for (const b of this.items) {
      const r = r0 * b.k;
      const x = this.drawX(b);
      if (b.kind === 'spiky') drawSpikes(ctx, x, b.y, r, t);
      this.theme.drawTarget(ctx, x, b.y, r, b.color, t);
      if (b.kind === 'golden') drawGoldenMark(ctx, x, b.y, r, t);
      else if (b.kind === 'spiky') drawEmoji(ctx, '✖', x, b.y - r * 0.05, r * 0.8);
      const c = b.content;
      if (c?.label) drawText(ctx, c.label, x, b.y - r * 0.05, r * (c.label.length > 1 ? 0.85 : 1.05), '#ffffff', shade(b.color, -0.45));
      else if (c?.emoji) drawEmoji(ctx, c.emoji, x, b.y - r * 0.05, r * 1.05);
    }
    this.particles.draw(ctx);
  }
}

/** Spikes around a bad target: it differs by shape, not only by color */
function drawSpikes(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, t: number): void {
  const n = 12;
  ctx.fillStyle = '#39404d';
  ctx.beginPath();
  for (let i = 0; i < n * 2; i++) {
    const a = (i / (n * 2)) * Math.PI * 2 + t * 0.6;
    const rr = i % 2 === 0 ? r * 1.35 : r * 0.95;
    const px = x + Math.cos(a) * rr;
    const py = y + Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

/** A soft gold ring and a star on a golden target (no flashing: a slow pulse) */
function drawGoldenMark(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, t: number): void {
  ctx.strokeStyle = 'rgba(255, 236, 150, 0.9)';
  ctx.lineWidth = Math.max(2, r * 0.12);
  ctx.beginPath();
  ctx.arc(x, y, r * (1.25 + Math.sin(t * 3) * 0.05), 0, Math.PI * 2);
  ctx.stroke();
  drawEmoji(ctx, '⭐', x, y - r * 0.05, r * 0.9);
}
