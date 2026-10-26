import { describe, expect, it } from 'vitest';
import { Fx, PRESETS, Trail } from '../src/fx.ts';
import { occluderNear, shadowPolys } from '../src/light.ts';
import { blobPoints, boltPoints, superellipse } from '../src/shapes.ts';

describe('fx (simulation)', () => {
  it('emits the presets, steps them, and frees them at the end of their life', () => {
    const fx = new Fx({ seed: 1 });
    for (const name of Object.keys(PRESETS) as (keyof typeof PRESETS)[]) expect(fx.emit(name, 0, 0)).toBe(PRESETS[name].n);
    expect(fx.count).toBeGreaterThan(100);
    for (let i = 0; i < 60 * 4; i++) fx.update(1 / 60);
    expect(fx.count).toBe(0);
  });
  it('is the same for the same seed (QA screenshots repeat)', () => {
    const snap = (seed: number) => {
      const fx = new Fx({ seed });
      fx.explode(10, 20);
      for (let i = 0; i < 20; i++) fx.update(1 / 60);
      return JSON.stringify((fx as unknown as { pool: unknown[] }).pool.slice(0, fx.count));
    };
    expect(snap(5)).toBe(snap(5));
    expect(snap(5)).not.toBe(snap(6));
  });
  it('holds its cap and scales with quality', () => {
    const fx = new Fx({ max: 50 });
    for (let i = 0; i < 10; i++) fx.emit('sparks', 0, 0);
    expect(fx.count).toBe(50);
    const lo = new Fx();
    lo.quality = 0.25;
    expect(lo.emit('confetti', 0, 0)).toBe(10);
  });
  it('an explosion brings a light that fades, a hit-stop and trauma for the camera', () => {
    const fx = new Fx();
    const trauma = fx.explode(0, 0, { scale: 1 });
    expect(trauma).toBeGreaterThan(0.3);
    expect(fx.frozen()).toBe(true);
    const i0 = fx.lights()[0].intensity!;
    fx.update(0.2);
    expect(fx.frozen()).toBe(false);
    expect(fx.lights()[0].intensity!).toBeLessThan(i0);
    for (let i = 0; i < 60; i++) fx.update(1 / 60);
    expect(fx.lights()).toEqual([]);
    expect(fx.busy).toBeGreaterThan(0); // smoke still rising
    fx.clear();
    expect(fx.busy).toBe(0);
  });
  it('hit-stop slows the effects while it lasts', () => {
    const a = new Fx({ seed: 2 });
    const b = new Fx({ seed: 2 });
    a.emit('sparks', 0, 0);
    b.emit('sparks', 0, 0);
    b.hitStop(1);
    a.update(0.1);
    b.update(0.1);
    const pa = (a as unknown as { pool: { x: number }[] }).pool[0].x;
    const pb = (b as unknown as { pool: { x: number }[] }).pool[0].x;
    expect(Math.abs(pb)).toBeLessThan(Math.abs(pa) * 0.2);
  });
});

describe('trail', () => {
  it('keeps at most `max` points, and a clock that stands still adds none', () => {
    const t = new Trail({ life: 1, max: 32 });
    for (let i = 0; i < 500; i++) t.push(i, 0, 0);
    expect(t.length).toBe(1);
    for (let i = 0; i < 500; i++) t.push(i, 0, 1 / 1000);
    expect(t.length).toBe(32);
    const d = new Trail({ life: 0.25 });
    for (let i = 0; i < 120; i++) d.push(i, 0, 1 / 60);
    expect(d.length).toBeLessThanOrEqual(17);
  });
});

describe('geometry', () => {
  it('an occluder is near a light when any of its edges is, not only its corners', () => {
    // A long wall under a lamp: both ends 500 px away, its middle 40 px from the light
    const wall = { pts: [[-500, 40], [500, 40], [500, 60], [-500, 60]] as [number, number][] };
    expect(occluderNear(wall, 0, 0, 100)).toBe(true);
    expect(occluderNear(wall, 0, -200, 100)).toBe(false);
    // The light inside a big polygon
    expect(occluderNear({ pts: [[-1000, -1000], [1000, -1000], [1000, 1000], [-1000, 1000]] }, 0, 0, 50)).toBe(true);
    expect(occluderNear({ c: [130, 0], r: 40 }, 0, 0, 100)).toBe(true);
    expect(occluderNear({ c: [150, 0], r: 40 }, 0, 0, 100)).toBe(false);
  });
  /** A recorder for the path calls: polygons as point lists */
  const recorder = () => {
    const polys: [number, number][][] = [];
    return {
      polys,
      g: { moveTo: (x: number, y: number) => polys.push([[x, y]]), lineTo: (x: number, y: number) => polys.at(-1)!.push([x, y]), closePath: () => {} },
    };
  };
  const area = (p: [number, number][]) => p.reduce((s, [x, y], i) => s + x * p[(i + 1) % p.length][1] - p[(i + 1) % p.length][0] * y, 0);
  it('a box lit from the left casts its shadow to the right, from its back faces only', () => {
    const r = recorder();
    const n = shadowPolys(r.g, 0, 50, { pts: [[100, 40], [120, 40], [120, 60], [100, 60]] }, 1000);
    expect(n).toBe(3); // top, right and bottom faces look away from the light
    const xs = r.polys.flat().map(([x]) => x);
    expect(Math.min(...xs)).toBeGreaterThanOrEqual(100);
    expect(Math.max(...xs)).toBeGreaterThan(900);
    // All wound the same way: the nonzero fill unites them
    const signs = new Set(r.polys.map((p) => Math.sign(area(p))));
    expect(signs.size).toBe(1);
  });
  it('a circle casts a wedge from its tangents, none from a light inside it', () => {
    const r = recorder();
    expect(shadowPolys(r.g, 0, 0, { c: [100, 0], r: 10 }, 500)).toBe(1);
    const far = r.polys[0].filter(([x]) => x > 400);
    expect(far.length).toBe(2);
    expect(far[0][1] * far[1][1]).toBeLessThan(0); // one above, one below the axis
    expect(shadowPolys(recorder().g, 100, 0, { c: [100, 0], r: 10 }, 500)).toBe(0);
  });
  it('blob points close without a seam and wobble around their radius', () => {
    const p = blobPoints(0, 0, 50, 40, { n: 24, wobble: 0.15, seed: 3 });
    expect(p).toHaveLength(24);
    for (const [x, y] of p) {
      const k = Math.hypot(x / 50, y / 40);
      expect(k).toBeGreaterThan(0.8);
      expect(k).toBeLessThan(1.2);
    }
    expect(blobPoints(0, 0, 50, 40, { seed: 3 })).toEqual(blobPoints(0, 0, 50, 40, { seed: 3 }));
    expect(blobPoints(0, 0, 50, 40, { seed: 3 })).not.toEqual(blobPoints(0, 0, 50, 40, { seed: 4 }));
  });
  it('a bolt goes from end to end, jagged in between; a squircle stays in its box', () => {
    const b = boltPoints(0, 0, 100, 0, { segments: 8, seed: 2 });
    expect(b[0]).toEqual([0, 0]);
    expect(b.at(-1)).toEqual([100, 0]);
    expect(b.some(([, y]) => Math.abs(y) > 1)).toBe(true);
    for (const [x, y] of superellipse(0, 0, 80, 60, 4)) {
      expect(Math.abs(x)).toBeLessThanOrEqual(40.0001);
      expect(Math.abs(y)).toBeLessThanOrEqual(30.0001);
    }
  });
});

describe('boltPoints jitter', () => {
  it('is a share of the length, clamped to half of it (pixels by mistake stay on the bolt)', async () => {
    const { boltPoints } = await import('../src/shapes.ts');
    const far = (pts: [number, number][]) => Math.max(...pts.map(([, y]) => Math.abs(y)));
    expect(far(boltPoints(0, 0, 100, 0, { jitter: 14, seed: 3 }) as [number, number][])).toBeLessThanOrEqual(50);
    expect(far(boltPoints(0, 0, 100, 0, { jitter: 0.1, seed: 3 }) as [number, number][])).toBeLessThanOrEqual(10);
  });
});

