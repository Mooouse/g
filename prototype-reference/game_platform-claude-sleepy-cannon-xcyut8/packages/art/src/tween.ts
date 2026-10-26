// Easing and tweens for juice: a pop-in, a bounce, a shake, a number that counts up — on the game's clock (update(dt)
// from the loop), never a setTimeout: so they stop with the host's pause and repeat with the seed.

import { easeOutBack } from '@gp/core/draw';

export type Ease = (t: number) => number;

const c01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);

/** The easing set. outBack is @gp/core's (the kits' springy appear) */
export const ease = {
  linear: (t: number) => c01(t),
  inQuad: (t: number) => c01(t) ** 2,
  outQuad: (t: number) => 1 - (1 - c01(t)) ** 2,
  inOutQuad: (t: number) => ((t = c01(t)) < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2),
  inCubic: (t: number) => c01(t) ** 3,
  outCubic: (t: number) => 1 - (1 - c01(t)) ** 3,
  inOutCubic: (t: number) => ((t = c01(t)) < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2),
  outExpo: (t: number) => ((t = c01(t)) >= 1 ? 1 : 1 - 2 ** (-10 * t)),
  smooth: (t: number) => (t = c01(t)) * t * (3 - 2 * t),
  inBack: (t: number) => ((t = c01(t)), 2.70158 * t * t * t - 1.70158 * t * t),
  outBack: easeOutBack,
  outElastic: (t: number) => ((t = c01(t)) === 0 || t === 1 ? t : 2 ** (-10 * t) * Math.sin(((t * 10 - 0.75) * 2 * Math.PI) / 3) + 1),
  outBounce: (t: number) => {
    t = c01(t);
    const n = 7.5625;
    const d = 2.75;
    if (t < 1 / d) return n * t * t;
    if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75;
    if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375;
    return n * (t -= 2.625 / d) * t + 0.984375;
  },
} satisfies Record<string, Ease>;

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/** Frame-rate independent exponential approach: move `rate` of the way per second (smooth UI values, a needle) */
export const approach = (cur: number, target: number, rate: number, dt: number): number => target + (cur - target) * Math.exp(-rate * dt);

interface Job {
  obj: Record<string, number>;
  from: Record<string, number>;
  to: Record<string, number>;
  dur: number;
  t: number;
  delay: number;
  ease: Ease;
  yoyo: boolean;
  done?: () => void;
  /** Where a yoyo comes back to (default `from`): a punch's rest, which a second punch reuses */
  rest?: Record<string, number>;
}

export interface TweenOptions<T> {
  ease?: Ease;
  delay?: number;
  /** There and back: ends where it started (a punch, a blink) */
  yoyo?: boolean;
  /** The start values (default: the values when it starts, after the delay) */
  from?: Partial<Record<keyof T, number>>;
  /** Called when it finishes; not when a newer tween of the same properties replaced it (nor on clear()) */
  done?: () => void;
}

/**
 * Tweens on the game's clock. `to(obj, { scale: 1 }, 0.3, { ease: ease.outBack })` animates numbers of any object;
 * `after(0.5, fn)` calls fn later on the same clock; update(dt) each frame (not while paused). A new tween of a property
 * replaces the running one: that one stops animating it, and a tween left with nothing to animate is dropped without
 * its `done`.
 */
export class Tweens {
  private jobs: Job[] = [];
  private timers: { at: number; fn: () => void }[] = [];
  private clock = 0;
  get count(): number {
    return this.jobs.length + this.timers.length;
  }
  to<T extends object>(obj: T, props: Partial<Record<keyof T, number>>, dur: number, o: TweenOptions<T> = {}): this {
    this.add(obj, props, dur, o);
    return this;
  }
  private add<T extends object>(obj: T, props: Partial<Record<keyof T, number>>, dur: number, o: TweenOptions<T>, rest?: Record<string, number>): void {
    const target = obj as unknown as Record<string, number>;
    const to = { ...(props as Record<string, number>) };
    // A new tween of the same property replaces the old one; a tween left with nothing to do is gone (no done)
    this.jobs = this.jobs.filter((j) => {
      if (j.obj !== target) return true;
      for (const k of Object.keys(to)) delete j.to[k];
      return Object.keys(j.to).length > 0;
    });
    this.jobs.push({ obj: target, from: { ...((o.from ?? {}) as Record<string, number>) }, to, dur: Math.max(1e-4, dur), t: 0, delay: o.delay ?? 0, ease: o.ease ?? ease.outCubic, yoyo: !!o.yoyo, done: o.done, rest });
  }
  after(sec: number, fn: () => void): this {
    this.timers.push({ at: this.clock + sec, fn });
    return this;
  }
  update(dt: number): void {
    this.clock += dt;
    const live: Job[] = [];
    // A done() may start new tweens: they join after this frame's jobs
    const jobs = this.jobs;
    this.jobs = [];
    const finished: Job[] = [];
    for (const j of jobs) {
      if (!Object.keys(j.to).length) continue;
      let d = dt;
      if (j.delay > 0) {
        j.delay -= d;
        if (j.delay > 0) {
          live.push(j);
          continue;
        }
        d = -j.delay;
        j.delay = 0;
      }
      if (j.t === 0) for (const k of Object.keys(j.to)) if (j.from[k] === undefined) j.from[k] = j.obj[k];
      j.t += d;
      const u = Math.min(1, j.t / j.dur);
      // A yoyo goes there and back: up from `from`, down to `rest` (a punch's rest; else back to `from`)
      const back = j.yoyo && u >= 0.5;
      const e = j.ease(j.yoyo ? (back ? 2 - u * 2 : u * 2) : u);
      const base = back && j.rest ? j.rest : j.from;
      for (const k of Object.keys(j.to)) j.obj[k] = (base[k] ?? j.from[k]) + (j.to[k] - (base[k] ?? j.from[k])) * e;
      if (j.t >= j.dur) {
        if (j.yoyo) for (const k of Object.keys(j.to)) j.obj[k] = j.rest?.[k] ?? j.from[k];
        finished.push(j);
      } else live.push(j);
    }
    this.jobs = live.concat(this.jobs);
    for (const j of finished) j.done?.();
    const due = this.timers.filter((x) => x.at <= this.clock);
    this.timers = this.timers.filter((x) => x.at > this.clock);
    for (const x of due) x.fn();
  }
  clear(): void {
    this.jobs.length = 0;
    this.timers.length = 0;
  }
  /** Pop in from 0 with overshoot (a button, a reward, a panel) */
  popIn(obj: { scale: number }, dur = 0.35, delay = 0): this {
    obj.scale = 0;
    return this.to(obj, { scale: 1 }, dur, { ease: ease.outBack, delay });
  }
  /**
   * A quick scale punch and back to rest (a counter that changed, a tap). The rest is `rest`, else the one a running
   * punch springs back to, else where a running tween of `scale` is going, else the scale now — so punches in quick
   * succession never leave it stuck big.
   */
  punch(obj: { scale: number }, amount = 0.25, dur = 0.25, rest?: number): this {
    const target = obj as unknown as Record<string, number>;
    let base = rest;
    if (base === undefined)
      for (const j of this.jobs) {
        if (j.obj !== target || !('scale' in j.to)) continue;
        base = j.rest ? (j.rest.scale ?? obj.scale) : j.yoyo ? (j.from.scale ?? obj.scale) : j.to.scale;
      }
    base ??= obj.scale;
    // Up from where it is now (no jump), back down to the rest
    this.add(obj, { scale: base * (1 + amount) }, dur, { ease: ease.outQuad, yoyo: true }, { scale: base });
    return this;
  }
}

/** A decaying shake offset for UI (a wrong answer's panel): t seconds since it started → px */
export const shakeX = (t: number, dur = 0.4, amp = 8, freq = 22): number => (t >= dur || t < 0 ? 0 : Math.sin(t * freq * Math.PI * 2) * amp * (1 - t / dur) ** 2);
