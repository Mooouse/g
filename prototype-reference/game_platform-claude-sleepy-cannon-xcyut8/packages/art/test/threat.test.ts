import { describe, expect, it } from 'vitest';
import { DamageNumbers, HitArcs, drawEdgeArrow, edgeArrow, hitAngle, screenAngle, screenOf } from '../src/hud.ts';

/** A 2D context that records what was drawn */
function fakeCtx() {
  const calls: string[] = [];
  const ctx = new Proxy(
    {},
    {
      get: (_t, k) => (k === 'calls' ? calls : (...a: unknown[]) => void calls.push(`${String(k)}(${a.map((x) => (typeof x === 'number' ? x.toFixed(2) : String(x))).join(',')})`)),
      set: (_t, k, v) => (calls.push(`${String(k)}=${String(v)}`), true),
    },
  ) as unknown as CanvasRenderingContext2D & { calls: string[] };
  return ctx;
}

describe('hit arcs', () => {
  it('angles: 0 ahead, clockwise to the right, π behind — first person and top-down', () => {
    // Facing −z (yaw 0): a robot at +x is to the right, one at +z behind
    expect(hitAngle({ x: 0, z: 0 }, 0, { x: 5, z: 0 })).toBeCloseTo(Math.PI / 2);
    expect(Math.abs(hitAngle({ x: 0, z: 0 }, 0, { x: 0, z: 5 }))).toBeCloseTo(Math.PI);
    expect(hitAngle({ x: 0, z: 0 }, Math.PI / 2, { x: 5, z: 0 })).toBeCloseTo(0);
    expect(screenAngle(0, -1)).toBeCloseTo(0);
    expect(screenAngle(1, 0)).toBeCloseTo(Math.PI / 2);
  });

  it('a hit near a showing arc refreshes it instead of stacking; they fade and go after their life', () => {
    const a = new HitArcs({ life: 0.9 });
    a.hit(0.1);
    a.update(0.3);
    a.hit(0.2);
    expect(a.arcs.length).toBe(1);
    expect(a.arcs[0].t).toBe(0);
    expect(a.arcs[0].strength).toBeGreaterThan(1);
    a.hit(Math.PI);
    expect(a.arcs.length).toBe(2);
    a.update(0.05);
    expect(a.alpha(a.arcs[0])).toBeGreaterThan(0.4);
    a.update(0.9);
    expect(a.arcs.length).toBe(0);
    for (let i = 0; i < 10; i++) a.hit(i);
    expect(a.arcs.length).toBe(6);
  });

  it('draws each arc on the ring round the crosshair, centred on its angle (canvas 0 is +x)', () => {
    const a = new HitArcs();
    a.hit(0);
    a.update(0.05);
    const ctx = fakeCtx();
    a.draw(ctx, 100, 100, 50, { span: 1 });
    const arc = ctx.calls.find((c) => c.startsWith('arc('))!;
    // Ahead → the top of the ring: −π/2 ± 0.5
    expect(arc).toBe(`arc(100.00,100.00,50.00,${(-Math.PI / 2 - 0.5).toFixed(2)},${(-Math.PI / 2 + 0.5).toFixed(2)})`);
  });
});

describe('the off-screen arrow', () => {
  it('hidden while the target is on the (inset) screen; on the edge toward it when it is off', () => {
    expect(edgeArrow({ x: 400, y: 300 }, 800, 600).visible).toBe(false);
    const r = edgeArrow({ x: 2000, y: 300 }, 800, 600, { margin: 20 });
    expect(r).toMatchObject({ visible: true, x: 780, y: 300 });
    expect(r.angle).toBeCloseTo(0);
    // Up and to the left: on the top edge
    const tl = edgeArrow({ x: 300, y: -1000 }, 800, 600, { margin: 20 });
    expect(tl.y).toBeCloseTo(20);
    // An inset at the bottom (a HUD strip): the arrow stays above it
    expect(edgeArrow({ x: 400, y: 5000 }, 800, 600, { margin: 20, inset: { bottom: 100 } }).y).toBeCloseTo(480);
  });

  it('a target behind the camera points the other way, never shows as on screen', () => {
    // three's project() of a point behind: z > 1 and mirrored x/y — straight behind and a bit right comes out left
    const p = screenOf({ x: -0.1, y: 0, z: 1.02 }, 800, 600);
    expect(p.behind).toBe(true);
    const a = edgeArrow(p, 800, 600);
    expect(a.visible).toBe(true);
    expect(a.x).toBeGreaterThan(400);
    const front = screenOf({ x: 0.5, y: 0.5, z: 0.9 }, 800, 600);
    expect(front).toEqual({ x: 600, y: 150, behind: false });
    const ctx = fakeCtx();
    drawEdgeArrow(ctx, a);
    expect(ctx.calls).toContain('fill()');
    const none = fakeCtx();
    drawEdgeArrow(none, edgeArrow({ x: 1, y: 1 }, 2, 2, { margin: 0 }));
    expect(none.calls).toEqual([]);
  });
});

describe('damage numbers', () => {
  it('hits in one area (or on one target) merge into one number that pops again', () => {
    const n = new DamageNumbers({ merge: { radius: 40, window: 0.35 } });
    n.add(100, 100, 12);
    n.update(0.1);
    const m = n.add(120, 110, 8)!;
    expect(n.live.length).toBe(1);
    expect(m.text).toBe('20');
    expect(m.t).toBe(0);
    expect(m.hits).toBe(2);
    // Far away, another kind, or too late: a number of its own
    n.add(400, 100, 5);
    n.add(100, 100, 30, 'crit');
    n.update(0.4);
    n.add(100, 100, 1);
    expect(n.live.length).toBe(4);
    // By target key: merges at any distance, never with another target's
    const k = new DamageNumbers();
    k.add(0, 0, 3, 'hit', { key: 7 });
    k.add(500, 500, 4, 'hit', { key: 7 });
    k.add(0, 0, 4, 'hit', { key: 8 });
    expect(k.live.map((x) => x.text)).toEqual(['7', '4']);
  });

  it('crits-only and big-only filters; heals read +n; the pool reuses the oldest', () => {
    const c = new DamageNumbers({ only: 'crits' });
    expect(c.add(0, 0, 50)).toBeNull();
    expect(c.add(0, 0, 50, 'crit')).not.toBeNull();
    expect(c.add(0, 0, 5, 'heal')!.text).toBe('+5');
    expect(c.filtered).toBe(1);
    const b = new DamageNumbers({ only: 'big', bigAt: 20, merge: false });
    expect(b.add(0, 0, 19)).toBeNull();
    expect(b.add(0, 0, 20)).not.toBeNull();
    const p = new DamageNumbers({ max: 3, merge: false });
    for (let i = 0; i < 5; i++) p.add(i * 100, 0, i);
    expect(p.live.map((x) => x.value)).toEqual([2, 3, 4]);
  });

  it('rise, drift and fade on the game\'s clock; a world point is re-projected each update and dropped off screen', () => {
    const n = new DamageNumbers({ merge: false });
    const a = n.add(100, 100, 10, 'hit', { world: { id: 1 } })!;
    let at: { x: number; y: number } | null = { x: 300, y: 200 };
    n.update(0.2, () => at);
    expect(a.y).toBe(200);
    expect(a.rise).toBeGreaterThan(5);
    expect(n.look(a).alpha).toBe(1);
    n.update(0.35, () => at);
    expect(n.look(a).alpha).toBeLessThan(1);
    at = null;
    n.update(0.01, () => at);
    expect(n.live.length).toBe(0);
    // Deterministic: the same adds, the same drift
    const drift = () => {
      const d = new DamageNumbers({ merge: false });
      for (let i = 0; i < 5; i++) d.add(0, 0, i);
      return d.live.map((x) => x.vx);
    };
    expect(drift()).toEqual(drift());
  });

  it('draws outlined numbers on a canvas', () => {
    const n = new DamageNumbers();
    n.add(50, 60, 99, 'crit');
    const ctx = fakeCtx();
    n.draw(ctx);
    expect(ctx.calls.some((c) => c.startsWith('strokeText(99'))).toBe(true);
    expect(ctx.calls.some((c) => c.startsWith('fillText(99'))).toBe(true);
  });
});
