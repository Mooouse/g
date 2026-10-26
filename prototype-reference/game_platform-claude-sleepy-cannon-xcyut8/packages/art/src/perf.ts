// Staying smooth on a low-end phone: measure the frame's work, step quality down when it runs slow and back up when
// there is room (hysteresis and a backoff, so it doesn't flap), and hand the levels to the effects (particle counts,
// bloom, the light map's resolution, grain, the small extras). Plus object pools and a tiny dev meter.
//
// The pixel ratio is not one of the levels: changing it mid-game resizes the canvas and re-bakes every sprite, layer
// and panel at once (a hitch of its own). Pick it once at start (capDpr / fitCanvas, at most MAX_DPR = 2).
//
//   const q = new AutoQuality();
//   frame: const t0 = performance.now(); update(); draw(); q.frame(performance.now() - t0);
//   fx.quality = q.particles; lights.scale = q.lightScale; lights.bloom = q.bloom ? 0.35 : 0;
//
// A WebGL game (three, Pixi, Phaser) is limited by GPU time this work doesn't show: QualityLadder in @gp/core (levels of
// your own, judged on the frame interval, a start by device) with the adapters' setRenderScale.
//
// Rules (docs/guides/art.md → Performance): bake what doesn't change; no shadowBlur or ctx.filter per frame; a DPR cap
// of 2; a few full-screen blits per frame, not dozens; pools, not new objects in the loop.

export interface QualityLevel {
  /** Multiplier for particle counts */
  particles: number;
  bloom: boolean;
  /** LightLayer.scale */
  lightScale: number;
  grain: boolean;
  /** LightLayer.step: the unfiltered part of the light map's upscale */
  lightStep: number;
  /** Small animated extras (god rays, twinkling stars, beacons, frosted glass): Scenery.draw's `detail`, glass()'s `frost` */
  detail: boolean;
}

/** From the best (0) to the cheapest (3) */
export const QUALITY_LEVELS: QualityLevel[] = [
  { particles: 1, bloom: true, lightScale: 0.25, grain: true, lightStep: 2, detail: true },
  { particles: 0.7, bloom: false, lightScale: 0.22, grain: false, lightStep: 2, detail: true },
  { particles: 0.45, bloom: false, lightScale: 0.18, grain: false, lightStep: 3, detail: false },
  { particles: 0.25, bloom: false, lightScale: 0.18, grain: false, lightStep: 3, detail: false },
];

/** Frames of calm before a step up (5 s at 60 fps); doubled after every step up that had to be taken back */
const CALM = 300;
/** A step down this soon after a step up (frames) means the step up failed */
const FAILED_WITHIN = 600;
/** The calm needed never grows past this (≈ 5 min: one retry of a level that keeps failing, not a flap); it resets after a step up held HELD frames (30 s) */
const CALM_MAX = CALM * 64;
const HELD = 1800;

export class AutoQuality {
  /** The current level index into QUALITY_LEVELS (0 best) */
  level: number;
  /** The frame-work budget in ms: above it for a while → a level down (default 10 ms of a 16.7 ms frame) */
  budget: number;
  /** Smoothed work per frame, ms */
  avg = 0;
  /** Frames of calm the next step up waits for (5 s; doubles after each failed step up, up to ≈ 5 min) */
  calm = CALM;
  private slow = 0;
  private fast = 0;
  private frames = 0;
  private sinceUp = Infinity;
  /** The work (ms) at the last step up, and at the last one that failed: much lighter than that is a new situation */
  private upAvg = 0;
  private failAvg = 0;
  private readonly onChange?: (level: QualityLevel, index: number) => void;
  /** Never above this level (a settings toggle "low graphics") */
  floor = 0;
  constructor(o: { budget?: number; start?: number; onChange?: (level: QualityLevel, index: number) => void } = {}) {
    this.budget = o.budget ?? 10;
    this.level = o.start ?? 0;
    this.onChange = o.onChange;
  }
  get current(): QualityLevel {
    return QUALITY_LEVELS[this.level];
  }
  get particles(): number {
    return this.current.particles;
  }
  get bloom(): boolean {
    return this.current.bloom;
  }
  get lightScale(): number {
    return this.current.lightScale;
  }
  get grain(): boolean {
    return this.current.grain;
  }
  /** Record one frame's work (ms of update + draw, not the time between frames) */
  frame(ms: number): void {
    this.frames++;
    // A frame of 4× the average (a GC, a tab switch) counts as 2× only
    const x = this.avg ? Math.min(ms, this.avg * 2 + 2) : ms;
    this.avg = this.avg ? this.avg * 0.9 + x * 0.1 : x;
    // A step up that held for 30 s worked: the next one waits the normal time again
    if (++this.sinceUp > HELD && this.sinceUp !== Infinity) this.calm = CALM;
    if (this.frames < 20) return;
    if (this.avg > this.budget) {
      this.fast = 0;
      if (++this.slow > 30 && this.level < QUALITY_LEVELS.length - 1) {
        // Taken back soon after a step up: that level doesn't fit, wait twice as long before trying it again
        if (this.sinceUp < FAILED_WITHIN) {
          this.calm = Math.min(CALM_MAX, this.calm * 2);
          this.failAvg = this.upAvg;
        }
        this.sinceUp = Infinity;
        this.go(this.level + 1);
      }
    } else if (this.avg < this.budget * 0.5) {
      this.slow = 0;
      // Up again only after a long calm (5 s at 60 fps): stepping up costs a frame of bakes. After failed tries the wait
      // is longer — unless the work is now well below what it was then (a lighter scene: try again at the normal pace)
      const wait = this.avg < this.failAvg * 0.75 ? CALM : this.calm;
      if (++this.fast > wait && this.level > this.floor) {
        this.upAvg = this.avg;
        this.go(this.level - 1);
        this.sinceUp = 0;
      }
    } else this.slow = this.fast = 0;
  }
  /** Go to a level now (a settings toggle; the backoff starts over) */
  set(level: number): void {
    this.calm = CALM;
    this.sinceUp = Infinity;
    this.failAvg = 0;
    this.go(level);
  }
  private go(level: number): void {
    const l = Math.max(this.floor, Math.min(QUALITY_LEVELS.length - 1, level));
    this.slow = this.fast = 0;
    if (l === this.level) return;
    this.level = l;
    this.onChange?.(QUALITY_LEVELS[l], l);
  }
}

/** Reusable objects: get() a reset one, release() it back — no garbage in the frame loop */
export class Pool<T> {
  private free: T[] = [];
  private readonly make: () => T;
  private readonly reset?: (x: T) => void;
  made = 0;
  constructor(make: () => T, reset?: (x: T) => void) {
    this.make = make;
    this.reset = reset;
  }
  get(): T {
    const x = this.free.pop();
    if (x) {
      this.reset?.(x);
      return x;
    }
    this.made++;
    return this.make();
  }
  release(x: T): void {
    this.free.push(x);
  }
  get idle(): number {
    return this.free.length;
  }
}

/** A dev meter: frame time (work) and fps over the last second, drawn small in a corner */
export class FrameMeter {
  private times: number[] = [];
  private work: number[] = [];
  private t0 = 0;
  begin(): void {
    this.t0 = performance.now();
  }
  end(): void {
    const now = performance.now();
    this.work.push(now - this.t0);
    this.times.push(now);
    while (this.times.length && now - this.times[0] > 1000) {
      this.times.shift();
      this.work.shift();
    }
  }
  get fps(): number {
    return this.times.length;
  }
  /** Average work per frame (ms) over the last second */
  get ms(): number {
    return this.work.length ? this.work.reduce((a, b) => a + b, 0) / this.work.length : 0;
  }
  /** The 95th-percentile work (ms): the hitches */
  get p95(): number {
    if (!this.work.length) return 0;
    const s = [...this.work].sort((a, b) => a - b);
    return s[Math.min(s.length - 1, Math.floor(s.length * 0.95))];
  }
  draw(ctx: CanvasRenderingContext2D, x = 8, y = 8, extra = ''): void {
    const text = `${this.fps} fps · ${this.ms.toFixed(1)} ms · p95 ${this.p95.toFixed(1)}${extra ? ` · ${extra}` : ''}`;
    ctx.font = '600 11px ui-monospace, monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    const w = ctx.measureText(text).width + 10;
    ctx.fillStyle = 'rgba(4, 8, 24, 0.7)';
    ctx.fillRect(x, y, w, 18);
    ctx.fillStyle = this.ms > 12 ? '#ff6b5e' : this.ms > 8 ? '#ffd166' : '#7dfcae';
    ctx.fillText(text, x + 5, y + 3);
  }
}

/** The device pixel ratio to render at, capped (2 by default): pick it once at start, not per quality level */
export const capDpr = (max = 2): number => Math.max(0.5, Math.min(max, globalThis.devicePixelRatio || 1));
