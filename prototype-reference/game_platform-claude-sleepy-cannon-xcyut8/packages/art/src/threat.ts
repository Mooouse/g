// Threat cues on the HUD (re-exported by @gp/art/hud): where a hit came from, where a target off the screen is, and
// how much each hit did. Frankengun's (game22): a red arc on a ring round the crosshair toward the attacker (behind you:
// at the bottom) — after its first review died 35 s into wave 1 not knowing what hit it; an arrow on the screen's edge
// toward a boss the camera lost; DOM damage numbers from a pool. Each cue keeps its state here (pure, stepped by your
// dt, so the pause holds it) and draws on a canvas or into the DOM — a three game's HUD is DOM, a Canvas 2D game's isn't.
//
//   const arcs = new HitArcs();              on a hit: arcs.hit(hitAngle(player, yaw, attacker));
//   const nums = new DamageNumbers({ merge: { radius: 40, window: 0.35 }, only: touch ? 'big' : 'all' });
//   nums.mount(ui);                          (DOM; or nums.draw(ctx) on the canvas)  on a hit: nums.add(x, y, dmg, crit ? 'crit' : 'hit', { key: enemy.id });
//   frame: arcs.update(dt); nums.update(dt); arcs.draw(ctx, cx, cy, r) or arcs.sync(); const a = edgeArrow(screenOf(ndc, w, h), w, h);
//
// Angles: 0 is ahead (the top of the ring), positive clockwise (to the right), ±π behind (the bottom).

import type { Ctx } from './bake.ts';

const wrap = (a: number): number => Math.atan2(Math.sin(a), Math.cos(a));

/** First person on a floor (x, z; forward −z, yaw to the right): the angle of `from` round the view, for a hit arc */
export function hitAngle(eye: { x: number; z: number }, yaw: number, from: { x: number; z: number }): number {
  return wrap(Math.atan2(from.x - eye.x, -(from.z - eye.z)) - yaw);
}

/** Top-down on the screen (y down): the angle of a point round the hero, for a hit arc (0 up, clockwise) */
export const screenAngle = (dx: number, dy: number): number => Math.atan2(dx, -dy);

// --- Hit arcs ---------------------------------------------------------------------------------------------------------

export interface HitArc {
  angle: number;
  /** Seconds since it came (or was refreshed) */
  t: number;
  /** 0…1+: how hard (the arc's opacity and thickness) */
  strength: number;
}

export interface HitArcsOptions {
  /** Seconds an arc shows (default 0.9) */
  life?: number;
  /** A hit within this angle of a showing arc refreshes it instead of adding one (default 0.35 rad) */
  merge?: number;
  /** At most this many at once (default 6; the oldest goes) */
  max?: number;
}

/** Red arcs round the crosshair toward where hits came from */
export class HitArcs {
  readonly arcs: HitArc[] = [];
  readonly life: number;
  private readonly mergeA: number;
  private readonly max: number;
  private els: HTMLElement[] = [];
  private layer: HTMLElement | null = null;

  constructor(o: HitArcsOptions = {}) {
    this.life = o.life ?? 0.9;
    this.mergeA = o.merge ?? 0.35;
    this.max = o.max ?? 6;
  }

  /** A hit from this angle (0 ahead, clockwise, π behind) */
  hit(angle: number, strength = 1): void {
    const a = wrap(angle);
    const near = this.arcs.find((x) => Math.abs(wrap(x.angle - a)) < this.mergeA);
    if (near) {
      near.angle = a;
      near.t = 0;
      near.strength = Math.min(1.6, Math.max(near.strength, strength) + 0.15);
      return;
    }
    this.arcs.push({ angle: a, t: 0, strength });
    if (this.arcs.length > this.max) this.arcs.shift();
  }

  /** Step them (the game's clock: they stand still on the pause screen); the DOM layer follows */
  update(dt: number): void {
    for (const a of this.arcs) a.t += dt;
    for (let i = this.arcs.length - 1; i >= 0; i--) if (this.arcs[i].t >= this.life) this.arcs.splice(i, 1);
    this.sync();
  }

  /** How visible an arc is now (0…1) */
  alpha(a: HitArc): number {
    const k = a.t / this.life;
    return Math.max(0, Math.min(1, a.strength)) * (k < 0.1 ? k / 0.1 : 1 - (k - 0.1) / 0.9);
  }

  clear(): void {
    this.arcs.length = 0;
    this.sync();
  }

  /** On a canvas: arcs of `span` radians on a ring of radius r round (cx, cy) */
  draw(ctx: Ctx, cx: number, cy: number, r: number, o: { color?: string; width?: number; span?: number } = {}): void {
    if (!this.arcs.length) return;
    const span = o.span ?? 0.9;
    ctx.save();
    ctx.lineCap = 'round';
    ctx.strokeStyle = o.color ?? '#ff2b4a';
    ctx.shadowColor = o.color ?? '#ff2b4a';
    for (const a of this.arcs) {
      const al = this.alpha(a);
      if (al <= 0.01) continue;
      ctx.globalAlpha = al;
      ctx.lineWidth = (o.width ?? 8) * (0.7 + 0.3 * Math.min(1.6, a.strength));
      // Canvas angles: 0 is +x, clockwise on screen; ours: 0 is up
      const c = a.angle - Math.PI / 2;
      ctx.beginPath();
      ctx.arc(cx, cy, r, c - span / 2, c + span / 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  /** In the DOM: a pooled ring of arcs centred on the screen (the crosshair), `size` its diameter (CSS) */
  mount(parent: HTMLElement, o: { size?: string; color?: string; width?: number } = {}): HTMLElement {
    css();
    const layer = document.createElement('div');
    layer.className = 'gp-hitarcs';
    layer.style.setProperty('--gp-arc-size', o.size ?? 'min(46vw, 46vh)');
    layer.style.setProperty('--gp-arc-color', o.color ?? '#ff2b4a');
    layer.style.setProperty('--gp-arc-width', `${o.width ?? 10}px`);
    this.els = Array.from({ length: this.max }, () => {
      const e = document.createElement('div');
      e.className = 'gp-hitarc';
      layer.append(e);
      return e;
    });
    parent.append(layer);
    this.layer = layer;
    this.sync();
    return layer;
  }

  /** The DOM arcs follow the state (update() calls it) */
  sync(): void {
    if (!this.layer) return;
    this.els.forEach((e, i) => {
      const a = this.arcs[i];
      if (!a) {
        if (e.style.display !== 'none') e.style.display = 'none';
        return;
      }
      e.style.display = '';
      e.style.opacity = this.alpha(a).toFixed(3);
      e.style.transform = `translate(-50%, -50%) rotate(${a.angle.toFixed(4)}rad)`;
    });
  }
}

// --- The off-screen arrow ---------------------------------------------------------------------------------------------

/** three's projected point (Vector3.project(camera): NDC, z > 1 behind) → CSS px on a w×h screen; `behind` mirrored out */
export function screenOf(ndc: { x: number; y: number; z: number }, w: number, h: number): { x: number; y: number; behind: boolean } {
  const behind = ndc.z > 1;
  // Behind the camera the projection comes out mirrored: turn it round and push it off the screen
  const k = behind ? -1e3 : 1;
  return { x: ((ndc.x * k + 1) / 2) * w, y: ((1 - ndc.y * k) / 2) * h, behind };
}

export interface EdgeArrow {
  /** The target is off the screen (or behind): show the arrow */
  visible: boolean;
  /** Where the arrow goes (CSS px), on the inset edge */
  x: number;
  y: number;
  /** Where it points (radians, canvas convention: 0 → +x, clockwise) */
  angle: number;
}

/**
 * An arrow on the screen's edge toward a target the camera can't see: its screen point (CSS px; `screenOf()` for a 3D
 * one), the screen's size, and how far in from each edge it sits (`margin`; `inset` for a HUD strip: the gun grid at the
 * bottom). Inside the inset screen and in front: not visible
 */
export function edgeArrow(p: { x: number; y: number; behind?: boolean }, w: number, h: number, o: { margin?: number; inset?: { top?: number; right?: number; bottom?: number; left?: number } } = {}): EdgeArrow {
  const m = o.margin ?? 28;
  const L = m + (o.inset?.left ?? 0);
  const R = w - m - (o.inset?.right ?? 0);
  const T = m + (o.inset?.top ?? 0);
  const B = h - m - (o.inset?.bottom ?? 0);
  const inside = !p.behind && p.x >= L && p.x <= R && p.y >= T && p.y <= B;
  const cx = (L + R) / 2;
  const cy = (T + B) / 2;
  let dx = p.x - cx;
  let dy = p.y - cy;
  if (Math.abs(dx) < 1e-6 && Math.abs(dy) < 1e-6) dy = 1; // dead behind: at the bottom
  const angle = Math.atan2(dy, dx);
  // From the centre toward it, to the inset rectangle's edge
  const k = Math.min(dx ? (dx > 0 ? R - cx : L - cx) / dx : Infinity, dy ? (dy > 0 ? B - cy : T - cy) / dy : Infinity);
  dx *= k;
  dy *= k;
  return { visible: !inside, x: cx + dx, y: cy + dy, angle };
}

/** A chevron arrow at `a` (an edgeArrow), drawn on a canvas */
export function drawEdgeArrow(ctx: Ctx, a: EdgeArrow, o: { size?: number; color?: string; outline?: string } = {}): void {
  if (!a.visible) return;
  const s = o.size ?? 18;
  ctx.save();
  ctx.translate(a.x, a.y);
  ctx.rotate(a.angle);
  ctx.beginPath();
  ctx.moveTo(s, 0);
  ctx.lineTo(-s * 0.6, -s * 0.75);
  ctx.lineTo(-s * 0.25, 0);
  ctx.lineTo(-s * 0.6, s * 0.75);
  ctx.closePath();
  ctx.fillStyle = o.color ?? '#ffd23f';
  ctx.strokeStyle = o.outline ?? 'rgba(0,0,0,0.6)';
  ctx.lineWidth = Math.max(1.5, s * 0.12);
  ctx.lineJoin = 'round';
  ctx.stroke();
  ctx.fill();
  ctx.restore();
}

// --- Damage numbers ---------------------------------------------------------------------------------------------------

export type NumberKind = 'hit' | 'crit' | 'heal' | 'dot' | 'info';

export interface DamageNumber {
  x: number;
  y: number;
  value: number;
  text: string;
  kind: NumberKind;
  /** Seconds since it came (or merged a hit) */
  t: number;
  life: number;
  /** The drift sideways (px/s), from a seeded spread: no Math.random */
  vx: number;
  /** Rise so far (px) */
  rise: number;
  key?: string | number;
  color?: string;
  /** A world point to follow (the game's project() places it every update) */
  world?: unknown;
  /** Hits merged into it */
  hits: number;
}

export interface DamageNumbersOptions {
  /** The pool: at most this many on screen (default 28; the oldest is reused) */
  max?: number;
  /** Seconds each kind shows (default hit 0.7, crit 0.95, heal 0.9, dot 0.6, info 1.4) */
  life?: Partial<Record<NumberKind, number>>;
  /** Merge a hit into a showing number of the same kind (and key, if given) within `radius` px and `window` s; false: never */
  merge?: { radius?: number; window?: number } | false;
  /** 'all' (default), 'crits' (crits and heals and info only), 'big' (crits, and hits of at least `bigAt`) */
  only?: 'all' | 'crits' | 'big';
  bigAt?: number;
  /** Rise speed, px/s (default 46) */
  rise?: number;
  /** How a value reads (default: rounded, a + for heals) */
  format?: (value: number, kind: NumberKind) => string;
}

const LIFE: Record<NumberKind, number> = { hit: 0.7, crit: 0.95, heal: 0.9, dot: 0.6, info: 1.4 };

/** A pooled layer of damage numbers that merge per area (or per target), drawn on a canvas or kept in the DOM */
export class DamageNumbers {
  readonly live: DamageNumber[] = [];
  /** Numbers dropped by `only` (a test, a meter) */
  filtered = 0;
  private readonly o: DamageNumbersOptions;
  private seq = 0;
  private els: HTMLElement[] = [];
  private layer: HTMLElement | null = null;

  constructor(o: DamageNumbersOptions = {}) {
    this.o = o;
  }

  private fmt(v: number, kind: NumberKind): string {
    if (this.o.format) return this.o.format(v, kind);
    const n = Math.round(v);
    return kind === 'heal' ? `+${n}` : String(n);
  }

  /** A hit of `value` at (x, y) CSS px; `key`: merge only with the same target's; `world`: follow it with update(dt, project) */
  add(x: number, y: number, value: number, kind: NumberKind = 'hit', o: { text?: string; color?: string; key?: string | number; world?: unknown } = {}): DamageNumber | null {
    const only = this.o.only ?? 'all';
    const big = this.o.bigAt ?? 0;
    if ((only === 'crits' && (kind === 'hit' || kind === 'dot')) || (only === 'big' && (kind === 'hit' || kind === 'dot') && value < big)) {
      this.filtered++;
      return null;
    }
    const m = this.o.merge === false ? null : { radius: this.o.merge?.radius ?? 40, window: this.o.merge?.window ?? 0.35 };
    if (m && o.text === undefined) {
      const r2 = m.radius * m.radius;
      const near = this.live.find((n) => n.kind === kind && n.t < m.window && n.key === o.key && (o.key !== undefined || (n.x - x) ** 2 + (n.y - y) ** 2 < r2));
      if (near) {
        near.value += value;
        near.text = this.fmt(near.value, kind);
        near.t = 0;
        near.hits++;
        if (o.world !== undefined) near.world = o.world;
        return near;
      }
    }
    const max = this.o.max ?? 28;
    if (this.live.length >= max) this.live.shift();
    // A seeded drift (the golden ratio's sequence): numbers fan out the same way every run
    const k = ((this.seq++ * 0.618034) % 1) - 0.5;
    const n: DamageNumber = { x, y, value, text: o.text ?? this.fmt(value, kind), kind, t: 0, life: this.o.life?.[kind] ?? LIFE[kind], vx: k * 30, rise: 0, hits: 1, ...(o.key !== undefined ? { key: o.key } : {}), ...(o.color ? { color: o.color } : {}), ...(o.world !== undefined ? { world: o.world } : {}) };
    this.live.push(n);
    return n;
  }

  /** Step them (the game's clock); `project` places the ones that follow a world point (null: it went off screen) */
  update(dt: number, project?: (world: unknown) => { x: number; y: number } | null): void {
    const rise = this.o.rise ?? 46;
    for (let i = this.live.length - 1; i >= 0; i--) {
      const n = this.live[i];
      n.t += dt;
      if (n.t >= n.life) {
        this.live.splice(i, 1);
        continue;
      }
      n.rise += rise * dt * (1 - n.t / n.life);
      n.x += n.vx * dt;
      if (project && n.world !== undefined) {
        const p = project(n.world);
        if (!p) {
          this.live.splice(i, 1);
          continue;
        }
        n.x = p.x + n.vx * n.t;
        n.y = p.y;
      }
    }
    this.sync();
  }

  /** The pop of a new or merged number (1.35 → 1) and its fade (the last 30 %) */
  look(n: DamageNumber): { scale: number; alpha: number } {
    const k = n.t / n.life;
    const pop = n.t < 0.12 ? 1.35 - (n.t / 0.12) * 0.35 : 1;
    return { scale: pop * (n.kind === 'crit' ? 1.3 : n.kind === 'dot' ? 0.75 : 1), alpha: k > 0.7 ? 1 - (k - 0.7) / 0.3 : 1 };
  }

  clear(): void {
    this.live.length = 0;
    this.sync();
  }

  /** On a canvas (CSS px transform): outlined numbers */
  draw(ctx: Ctx, o: { font?: string; size?: number; colors?: Partial<Record<NumberKind, string>> } = {}): void {
    if (!this.live.length) return;
    const colors: Record<NumberKind, string> = { hit: '#ffffff', crit: '#ffd23f', heal: '#7dfcae', dot: '#ffb38a', info: '#bff3ff', ...o.colors };
    const size = o.size ?? 20;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    for (const n of this.live) {
      const l = this.look(n);
      ctx.globalAlpha = l.alpha;
      ctx.font = `900 ${Math.round(size * l.scale)}px ${o.font ?? 'system-ui, sans-serif'}`;
      ctx.lineWidth = Math.max(2, size * 0.18);
      ctx.strokeStyle = 'rgba(0,0,0,0.75)';
      ctx.strokeText(n.text, n.x, n.y - n.rise);
      ctx.fillStyle = n.color ?? colors[n.kind];
      ctx.fillText(n.text, n.x, n.y - n.rise);
    }
    ctx.restore();
  }

  /** In the DOM: a pooled layer of `div.gp-dmg.<kind>` (style them; defaults are crisp outlined numbers) */
  mount(parent: HTMLElement): HTMLElement {
    css();
    const layer = document.createElement('div');
    layer.className = 'gp-dmg-layer';
    this.els = Array.from({ length: this.o.max ?? 28 }, () => {
      const e = document.createElement('div');
      e.className = 'gp-dmg';
      e.style.display = 'none';
      layer.append(e);
      return e;
    });
    parent.append(layer);
    this.layer = layer;
    return layer;
  }

  /** The DOM pool follows the state (update() calls it) */
  sync(): void {
    if (!this.layer) return;
    this.els.forEach((e, i) => {
      const n = this.live[i];
      if (!n) {
        if (e.style.display !== 'none') e.style.display = 'none';
        return;
      }
      const l = this.look(n);
      if (e.textContent !== n.text) e.textContent = n.text;
      const cls = `gp-dmg ${n.kind}`;
      if (e.className !== cls) e.className = cls;
      e.style.display = '';
      e.style.color = n.color ?? '';
      e.style.opacity = l.alpha.toFixed(3);
      e.style.transform = `translate(${n.x.toFixed(1)}px, ${(n.y - n.rise).toFixed(1)}px) translate(-50%, -50%) scale(${l.scale.toFixed(3)})`;
    });
  }
}

let cssDone = false;
function css(): void {
  if (cssDone || typeof document === 'undefined') return;
  cssDone = true;
  const s = document.createElement('style');
  s.id = 'gp-threat-css';
  s.textContent = `
.gp-hitarcs { position: fixed; left: 50%; top: 50%; width: 0; height: 0; pointer-events: none; z-index: 3; }
.gp-hitarc { position: absolute; left: 0; top: 0; width: var(--gp-arc-size); height: var(--gp-arc-size); border-radius: 50%;
  border: var(--gp-arc-width) solid transparent; border-top-color: var(--gp-arc-color); box-sizing: border-box;
  filter: drop-shadow(0 0 8px var(--gp-arc-color)); }
.gp-dmg-layer { position: fixed; inset: 0; pointer-events: none; overflow: hidden; z-index: 3; }
.gp-dmg { position: absolute; left: 0; top: 0; font: 900 20px system-ui, sans-serif; color: #fff; white-space: nowrap;
  text-shadow: 0 0 2px #000, 0 2px 0 #000, 0 0 6px rgba(0,0,0,0.6); will-change: transform, opacity; }
.gp-dmg.crit { color: #ffd23f; font-size: 26px; }
.gp-dmg.heal { color: #7dfcae; }
.gp-dmg.dot { color: #ffb38a; font-size: 15px; }
.gp-dmg.info { color: #bff3ff; font-size: 16px; }`;
  document.head.append(s);
}
