import { describe, expect, it } from 'vitest';
import { Camera, smoothDamp } from '../src/camera.ts';
import { fbm1, hash, noise1, noise1p, noise2 } from '../src/noise.ts';
import { AutoQuality, Pool, QUALITY_LEVELS } from '../src/perf.ts';
import { Blinker, Jelly, Pulse, Recoil, Rig, Spring, Wobble, addPose, anticipate, blendPose, breathe, lookAt, squash, stretch } from '../src/rig.ts';
import { Tweens, approach, ease, shakeX } from '../src/tween.ts';

const run = (n: number, fn: (dt: number) => void, dt = 1 / 60) => {
  for (let i = 0; i < n; i++) fn(dt);
};

describe('noise', () => {
  it('is deterministic, bounded and smooth', () => {
    expect(hash(5, 1)).toBe(hash(5, 1));
    expect(hash(5, 1)).not.toBe(hash(5, 2));
    for (let x = 0; x < 20; x += 0.13) {
      expect(Math.abs(noise1(x, 3))).toBeLessThanOrEqual(1);
      expect(Math.abs(noise2(x, x * 0.7, 3))).toBeLessThanOrEqual(1);
      expect(Math.abs(noise1(x + 0.001, 3) - noise1(x, 3))).toBeLessThan(0.01);
    }
  });
  it('periodic noise wraps seamlessly (tiles without a seam)', () => {
    for (const x of [0, 0.3, 1.7]) expect(noise1p(x, 6, 9)).toBeCloseTo(noise1p(x + 6, 6, 9), 10);
    expect(fbm1(0.2, 4, 1, 5)).toBeCloseTo(fbm1(5.2, 4, 1, 5), 10);
  });
});

describe('camera', () => {
  it('smoothDamp closes the gap without overshoot, at any frame rate', () => {
    for (const dt of [1 / 30, 1 / 60, 1 / 144]) {
      const v = { v: 0 };
      let x = 0;
      let max = 0;
      for (let t = 0; t < 2; t += dt) {
        x = smoothDamp(x, 100, v, 0.3, dt);
        max = Math.max(max, x);
      }
      expect(x).toBeGreaterThan(99);
      expect(max).toBeLessThanOrEqual(100.0001);
    }
  });
  it('follows through a dead zone, looks ahead, stays inside its bounds', () => {
    const c = new Camera({ width: 800, height: 600, deadZone: [50, 40], smooth: 0.2, lookAhead: 0.5, bounds: { x: -1000, y: -1000, w: 2000, h: 2000 } }).snap(0, 0);
    c.follow(30, 0);
    run(60, (dt) => c.update(dt));
    expect(c.x).toBeCloseTo(0, 5); // inside the dead zone: no move
    c.follow(300, 0, 200, 0);
    run(120, (dt) => c.update(dt));
    expect(c.x).toBeGreaterThan(300 - 50); // caught up to the dead zone's edge…
    expect(c.x).toBeGreaterThan(300); // …and looks ahead of a moving target
    c.follow(5000, 0);
    run(240, (dt) => c.update(dt));
    expect(c.x).toBeCloseTo(1000 - 400, 3); // clamped: the view's right edge on the bound
  });
  it('world ↔ screen round-trips, with zoom and shake', () => {
    const c = new Camera({ width: 640, height: 360 }).snap(100, 50);
    c.zoom = 1.7;
    c.addTrauma(0.8);
    c.update(1 / 60);
    const [sx, sy] = c.toScreen(123, -45);
    const [wx, wy] = c.toWorld(sx, sy);
    expect(wx).toBeCloseTo(123, 6);
    expect(wy).toBeCloseTo(-45, 6);
    expect(c.toScreen(c.x, c.y, 1)[0]).toBeCloseTo(320 + c.sx, 6);
    // A far layer (parallax 0) doesn't move with the camera
    expect(c.toScreen(0, 0, 0)[0]).toBeCloseTo(320 + c.sx, 6);
  });
  it('zoomAt keeps the point under the cursor', () => {
    const c = new Camera({ width: 800, height: 600 }).snap(0, 0);
    const before = c.toWorld(700, 100);
    c.zoomAt(1.5, 700, 100);
    const after = c.toWorld(700, 100);
    expect(after[0]).toBeCloseTo(before[0], 6);
    expect(after[1]).toBeCloseTo(before[1], 6);
    expect(c.zoom).toBeCloseTo(1.5);
  });
  it('trauma shakes smoothly, decays to rest, and is the same for the same seed', () => {
    const shake = (seed: number) => {
      const c = new Camera({ seed }).snap(0, 0).addTrauma(1);
      const xs: number[] = [];
      run(90, (dt) => xs.push(c.update(dt).sx));
      return { xs, c };
    };
    const a = shake(3);
    expect(a.xs).toEqual(shake(3).xs);
    expect(a.xs).not.toEqual(shake(4).xs);
    expect(Math.max(...a.xs.map(Math.abs))).toBeGreaterThan(3);
    // Smooth: neighbouring frames move a little, not a jump across the range
    for (let i = 1; i < 20; i++) expect(Math.abs(a.xs[i] - a.xs[i - 1])).toBeLessThan(8);
    expect(a.c.trauma).toBe(0);
    expect(Math.abs(a.xs.at(-1)!)).toBeLessThan(0.01);
  });
  it('a kick springs back to rest', () => {
    const c = new Camera().snap(0, 0).kick(0, 10);
    const ys: number[] = [];
    run(120, (dt) => ys.push(c.update(dt).sy));
    expect(Math.max(...ys)).toBeGreaterThan(2);
    expect(Math.abs(ys.at(-1)!)).toBeLessThan(0.05);
  });
  it('a kick stays bounded and settles at long frames (the driver hands out up to 0.1 s after a hitch)', () => {
    const peak = (dt: number) => {
      const c = new Camera().snap(0, 0).kick(0, 6);
      let max = 0;
      run(Math.round(12 / dt), () => (max = Math.max(max, Math.abs(c.update(dt).sy))), dt);
      return { max, last: Math.abs(c.sy) };
    };
    const slow = peak(0.1);
    expect(Number.isFinite(slow.max)).toBe(true);
    expect(slow.max).toBeLessThan(20);
    expect(slow.last).toBeLessThan(1e-3);
    // The same kick at 10 fps and at 60 fps: about the same size (sub-stepped, not one Euler step per frame)
    const fast = peak(1 / 60);
    expect(Math.abs(slow.max - fast.max)).toBeLessThan(fast.max * 0.6);
    const c = new Camera().snap(0, 0).kick(0, 6);
    run(120, () => c.update(0.1), 0.1);
    expect(Math.abs(c.sy)).toBeLessThan(1e-3);
  });
  it('culls what is off screen', () => {
    const c = new Camera({ width: 800, height: 600 }).snap(0, 0);
    expect(c.visible(-10, -10, 20, 20)).toBe(true);
    expect(c.visible(2000, 0, 10, 10)).toBe(false);
  });
});

describe('rig and motion', () => {
  it('springs settle at the target; critically damped ones never overshoot', () => {
    const s = new Spring(0, { freq: 3, damping: 1 });
    s.target = 1;
    let max = 0;
    run(240, (dt) => (max = Math.max(max, s.update(dt))));
    expect(s.value).toBeCloseTo(1, 3);
    expect(max).toBeLessThanOrEqual(1.0001);
    const b = new Spring(0, { freq: 3, damping: 0.2 });
    b.target = 1;
    let bmax = 0;
    run(240, (dt) => (bmax = Math.max(bmax, b.update(dt))));
    expect(bmax).toBeGreaterThan(1.2);
    // Stable with a long frame
    const l = new Spring(0, { freq: 8, damping: 0.3 });
    l.target = 1;
    l.update(0.5);
    expect(Number.isFinite(l.value)).toBe(true);
    expect(Math.abs(l.value)).toBeLessThan(3);
  });
  it('breathe and squash keep the area; stretch runs along the motion', () => {
    for (const t of [0, 0.4, 1.3]) {
      const b = breathe(t, 0.3, 0.05);
      expect(b.sx * b.sx * b.sy).toBeCloseTo(1, 6); // sx = 1/√sy: the volume of a body seen from the side
    }
    const q = squash(0.4);
    expect(q.sx * q.sy).toBeCloseTo(1, 6);
    expect(q.sy).toBeLessThan(1);
    const s = stretch(300, 0);
    expect(s.sx * s.sy).toBeCloseTo(1, 6);
    expect(s.sx).toBeGreaterThan(1);
    expect(s.rot).toBeCloseTo(0);
    expect(stretch(0, -100).rot).toBeCloseTo(-Math.PI / 2);
    expect(stretch(1e6, 0).sx).toBeCloseTo(1.35);
  });
  it('blinks at seeded, irregular moments', () => {
    const blinks = (seed: number) => {
      const b = new Blinker(seed);
      const at: number[] = [];
      let was = 0;
      for (let i = 0; i < 60 * 30; i++) {
        const v = b.update(1 / 60);
        if (v > 0 && was === 0) at.push(i);
        was = v;
      }
      return at;
    };
    const a = blinks(1);
    expect(a).toEqual(blinks(1));
    expect(a.length).toBeGreaterThan(5);
    expect(a.length).toBeLessThan(20);
    const gaps = a.slice(1).map((x, i) => x - a[i]);
    expect(new Set(gaps).size).toBeGreaterThan(2);
  });
  it('lookAt is clamped to the unit circle; anticipate pulls back, overshoots and lands on 1', () => {
    const [x, y] = lookAt(0, 0, 1000, 1000, 100);
    expect(Math.hypot(x, y)).toBeCloseTo(1);
    expect(lookAt(0, 0, 50, 0, 100)).toEqual([0.5, 0]);
    expect(anticipate(0.2)).toBeLessThan(0);
    expect(Math.max(...[0.6, 0.65, 0.7].map((t) => anticipate(t)))).toBeGreaterThan(1);
    expect(anticipate(1)).toBeCloseTo(1, 6);
  });
  it('pulses decay, jelly and recoil come back to rest, a wobble swings back after a move', () => {
    const p = new Pulse(5).hit(1);
    run(30, (dt) => p.update(dt));
    expect(p.value).toBe(0);
    const j = new Jelly().hit(0.4);
    let jv = { sx: 1, sy: 1 };
    expect(j.update(0)).toEqual({ sx: 1, sy: 1 }); // update(0) moves nothing: step it with the frame's dt
    run(10, (dt) => (jv = j.update(dt)));
    expect(jv.sx).not.toBeCloseTo(1, 2);
    expect(j.value).toEqual(jv); // what draw() reads
    expect(jv.sx * jv.sy).toBeCloseTo(1, 6);
    run(400, (dt) => (jv = j.update(dt)));
    expect(jv.sx).toBeCloseTo(1, 2);
    const r = new Recoil().fire(8);
    expect(r.update(1 / 60)).toBeLessThan(-5);
    run(300, (dt) => r.update(dt));
    expect(Math.abs(r.update(1 / 60))).toBeLessThan(0.05);
    expect(r.value).toBe(r.update(0));
    const w = new Wobble(2);
    let ang: number[] = [];
    for (let i = 0; i < 30; i++) ang = w.update(1 / 60, i * 10);
    for (let i = 0; i < 20; i++) ang = w.update(1 / 60, 290);
    expect(Math.abs(ang[1])).toBeGreaterThan(0.01);
  });
  it('blends and adds poses; the rig places parts through their parents', () => {
    const a = { arm: { rot: 0 } };
    const b = { arm: { rot: 1, x: 10 } };
    expect(blendPose(a, b, 0.25).arm).toMatchObject({ rot: 0.25, x: 2.5, sx: 1 });
    expect(addPose({ arm: { rot: 0.5, sx: 2 } }, { arm: { rot: 0.25, sx: 1.5 } }).arm).toMatchObject({ rot: 0.75, sx: 3 });
    const rig = new Rig([
      { id: 'body', draw: () => {} },
      { id: 'arm', parent: 'body', x: 10, y: 0, draw: () => {} },
      { id: 'hand', parent: 'arm', x: 0, y: 20, draw: () => {} },
    ]);
    expect(rig.worldOf('hand')).toEqual([10, 20]);
    rig.pose = { arm: { rot: Math.PI / 2 } };
    const [hx, hy] = rig.worldOf('hand');
    expect(hx).toBeCloseTo(-10);
    expect(hy).toBeCloseTo(0);
    expect(() => new Rig([{ id: 'x', parent: 'nope', draw: () => {} }])).toThrow(/unknown parent/);
  });
});

describe('tweens and easing', () => {
  it('every ease starts at 0 and ends at 1', () => {
    for (const [name, f] of Object.entries(ease)) {
      expect(f(0), name).toBeCloseTo(0, 6);
      expect(f(1), name).toBeCloseTo(1, 6);
    }
    expect(Math.max(...[0.5, 0.7, 0.8].map(ease.outBack))).toBeGreaterThan(1);
  });
  it('tweens on the game clock, with delay, yoyo, replacement and timers', () => {
    const tw = new Tweens();
    const o = { scale: 1, x: 0 };
    const log: string[] = [];
    tw.to(o, { x: 100 }, 1, { ease: ease.linear, delay: 0.5, done: () => log.push('x') });
    tw.after(0.25, () => log.push('timer'));
    run(30, (dt) => tw.update(dt), 1 / 60);
    expect(o.x).toBe(0);
    expect(log).toEqual(['timer']);
    run(60, (dt) => tw.update(dt), 1 / 60);
    expect(o.x).toBeGreaterThan(95);
    run(10, (dt) => tw.update(dt), 1 / 60);
    expect(o.x).toBe(100);
    expect(log).toEqual(['timer', 'x']);
    tw.punch(o, 0.5, 0.2);
    run(6, (dt) => tw.update(dt), 1 / 60);
    expect(o.scale).toBeGreaterThan(1);
    run(30, (dt) => tw.update(dt), 1 / 60);
    expect(o.scale).toBe(1);
    tw.popIn(o);
    expect(o.scale).toBe(0);
    run(60, (dt) => tw.update(dt), 1 / 60);
    expect(o.scale).toBeCloseTo(1);
    expect(tw.count).toBe(0);
  });
  it('punches in quick succession come back to the rest, not to a mid-punch value', () => {
    const tw = new Tweens();
    const o = { scale: 1 };
    tw.punch(o);
    run(3, (dt) => tw.update(dt), 1 / 60);
    const mid = o.scale;
    expect(mid).toBeGreaterThan(1.05);
    tw.punch(o); // the second starts where the first is (no jump) and goes back to 1
    tw.update(1 / 60);
    expect(o.scale).toBeGreaterThanOrEqual(mid - 1e-9);
    run(3, (dt) => tw.update(dt), 1 / 60);
    tw.punch(o);
    run(60, (dt) => tw.update(dt), 1 / 60);
    expect(o.scale).toBe(1);
    expect(tw.count).toBe(0);
    // A punch while a tween of scale runs comes back to where that tween was going; an explicit rest wins
    const p = { scale: 0 };
    tw.popIn(p, 0.3);
    run(5, (dt) => tw.update(dt), 1 / 60);
    tw.punch(p, 0.2);
    run(60, (dt) => tw.update(dt), 1 / 60);
    expect(p.scale).toBe(1);
    tw.punch(p, 0.2, 0.25, 2);
    run(60, (dt) => tw.update(dt), 1 / 60);
    expect(p.scale).toBe(2);
  });
  it('a replaced tween stops without its done; a partly replaced one finishes the rest and calls it', () => {
    const tw = new Tweens();
    const o = { x: 0, y: 0 };
    const log: string[] = [];
    tw.to(o, { x: 10 }, 0.5, { done: () => log.push('first') });
    run(6, (dt) => tw.update(dt), 1 / 60);
    tw.to(o, { x: 5 }, 0.2, { done: () => log.push('second') });
    expect(tw.count).toBe(1);
    run(60, (dt) => tw.update(dt), 1 / 60);
    expect(o.x).toBe(5);
    expect(log).toEqual(['second']);
    tw.to(o, { x: 1, y: 1 }, 0.3, { done: () => log.push('xy') });
    tw.to(o, { x: 2 }, 0.1);
    run(60, (dt) => tw.update(dt), 1 / 60);
    expect(o).toEqual({ x: 2, y: 1 });
    expect(log).toEqual(['second', 'xy']);
    // done() may start the next tween
    tw.to(o, { x: 0 }, 0.1, { done: () => tw.to(o, { y: 0 }, 0.1) });
    run(30, (dt) => tw.update(dt), 1 / 60);
    expect(o).toEqual({ x: 0, y: 0 });
  });
  it('approach is frame-rate independent; a UI shake decays to 0', () => {
    let a = 0;
    let b = 0;
    run(60, (dt) => (a = approach(a, 1, 5, dt)), 1 / 60);
    run(144, (dt) => (b = approach(b, 1, 5, dt)), 1 / 144);
    expect(a).toBeCloseTo(b, 6);
    expect(shakeX(0.5)).toBe(0);
    expect(Math.abs(shakeX(0.01))).toBeGreaterThan(0);
  });
});

describe('performance helpers', () => {
  it('auto quality steps down after sustained slow frames and back up after a long calm', () => {
    const changes: number[] = [];
    const q = new AutoQuality({ budget: 10, onChange: (_l, i) => changes.push(i) });
    run(40, () => q.frame(4));
    expect(q.level).toBe(0);
    run(200, () => q.frame(25));
    expect(q.level).toBeGreaterThanOrEqual(2);
    expect(q.particles).toBeLessThan(1);
    expect(q.bloom).toBe(false);
    const low = q.level;
    run(30, () => q.frame(2));
    expect(q.level).toBe(low); // not at once: no flapping
    run(2000, () => q.frame(2));
    expect(q.level).toBe(0);
    expect(changes.length).toBeGreaterThanOrEqual(4);
    // One spike doesn't move it
    const s = new AutoQuality();
    run(100, () => s.frame(3));
    s.frame(200);
    run(5, () => s.frame(3));
    expect(s.level).toBe(0);
    expect(QUALITY_LEVELS.every((l, i) => i === 0 || l.particles <= QUALITY_LEVELS[i - 1].particles)).toBe(true);
  });
  it("auto quality doesn't flap when a step costs 2.3×: a failed step up doubles the wait for the next", () => {
    // Level 0 is just over budget, level 1 well under half of it: without a backoff it went up and down 19 times a minute
    let changes = 0;
    const q = new AutoQuality({ budget: 10, onChange: () => changes++ });
    const cost = () => 11 / 2.3 ** q.level;
    run(3600, () => q.frame(cost()));
    expect(changes).toBeLessThanOrEqual(7);
    expect(q.calm).toBeGreaterThan(300);
    run(36000, () => q.frame(cost())); // ten more minutes
    expect(changes).toBeLessThanOrEqual(20);
    // The load goes away for good: it still comes back up to the best level, and the wait resets once a step up holds
    run(6000, () => q.frame(3));
    expect(q.level).toBe(0);
    run(2000, () => q.frame(3));
    expect(q.calm).toBe(300);
    // A level change by hand starts the backoff over
    const m = new AutoQuality({ budget: 10 });
    m.calm = 4800;
    m.set(2);
    expect([m.level, m.calm]).toEqual([2, 300]);
  });
  it('pools reuse objects', () => {
    const p = new Pool(() => ({ n: 0 }), (o) => (o.n = 0));
    const a = p.get();
    a.n = 5;
    p.release(a);
    const b = p.get();
    expect(b).toBe(a);
    expect(b.n).toBe(0);
    expect(p.made).toBe(1);
  });
});
