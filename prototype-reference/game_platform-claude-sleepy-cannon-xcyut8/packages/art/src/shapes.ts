// Shapes and details: Path2D builders for the silhouettes games need (organic blobs with a seeded wobble, capsules,
// squircles, bevelled sci-fi panels, gems, leaves, clouds, flames, bolts), character parts (eyes with iris, pupil,
// catch-lights, lids and a look; visor eyes; mouths) and the small details that make a surface read as a thing
// (rivets, panel lines, vents, hazard stripes, wear, speckle) — all clipped, all seeded.
// The point generators (blobPoints, boltPoints, superellipse) are pure: Node tests them.

import { type Box, type Material, DEFAULT_LIGHT, paint, tones, glow } from './material.ts';
import { alpha } from './color.ts';
import { hash } from './noise.ts';
import type { Ctx } from './bake.ts';

export type Pt = [number, number];
const TAU = Math.PI * 2;

/** Points around an ellipse with a seeded, closed wobble (no seam): the edge of a slime, a rock, a bush */
export function blobPoints(cx: number, cy: number, rx: number, ry: number, o: { n?: number; wobble?: number; seed?: number; phase?: number } = {}): Pt[] {
  const n = o.n ?? 12;
  const wob = o.wobble ?? 0.12;
  const seed = o.seed ?? 1;
  const ph = o.phase ?? 0;
  // Three harmonics with seeded phases and integer frequencies: periodic around the circle
  const p = [0, 1, 2].map((i) => hash(i, seed) * TAU);
  const out: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU;
    const k = 1 + wob * (0.55 * Math.sin(2 * a + p[0] + ph) + 0.3 * Math.sin(3 * a + p[1] - ph * 1.3) + 0.15 * Math.sin(5 * a + p[2] + ph * 0.7));
    out.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
  }
  return out;
}

/** A closed smooth curve through the points (Catmull-Rom as cubic Béziers) */
export function smoothPath(pts: Pt[], tension = 1, path = new Path2D()): Path2D {
  const n = pts.length;
  if (n < 3) return path;
  path.moveTo(pts[0][0], pts[0][1]);
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const t = tension / 6;
    path.bezierCurveTo(p1[0] + (p2[0] - p0[0]) * t, p1[1] + (p2[1] - p0[1]) * t, p2[0] - (p3[0] - p1[0]) * t, p2[1] - (p3[1] - p1[1]) * t, p2[0], p2[1]);
  }
  path.closePath();
  return path;
}

export const poly = (pts: Pt[], path = new Path2D()): Path2D => {
  pts.forEach(([x, y], i) => (i ? path.lineTo(x, y) : path.moveTo(x, y)));
  path.closePath();
  return path;
};

/** An organic blob: a slime, a bush, a rock (phase animates the wobble) */
export const blob = (cx: number, cy: number, rx: number, ry: number, o: { n?: number; wobble?: number; seed?: number; phase?: number } = {}): Path2D => smoothPath(blobPoints(cx, cy, rx, ry, o));

/** A rounded rectangle (radius clamped; a degenerate box gives an empty path, never a throw) */
export function rounded(x: number, y: number, w: number, h: number, r: number, path = new Path2D()): Path2D {
  if (!(w > 0 && h > 0)) return path;
  const q = Math.max(0, Math.min(r, w / 2, h / 2));
  path.moveTo(x + q, y);
  path.arcTo(x + w, y, x + w, y + h, q);
  path.arcTo(x + w, y + h, x, y + h, q);
  path.arcTo(x, y + h, x, y, q);
  path.arcTo(x, y, x + w, y, q);
  path.closePath();
  return path;
}

/** A pill: a rounded rectangle with fully round ends */
export const capsule = (x: number, y: number, w: number, h: number): Path2D => rounded(x, y, w, h, Math.min(w, h) / 2);

/** Points of a superellipse |x|^n + |y|^n = 1 (n = 4: the squircle of app icons and friendly robot heads) */
export function superellipse(cx: number, cy: number, w: number, h: number, n = 4, steps = 48): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * TAU;
    const c = Math.cos(a);
    const s = Math.sin(a);
    out.push([cx + (w / 2) * Math.sign(c) * Math.abs(c) ** (2 / n), cy + (h / 2) * Math.sign(s) * Math.abs(s) ** (2 / n)]);
  }
  return out;
}
export const squircle = (cx: number, cy: number, w: number, h: number, n = 4): Path2D => poly(superellipse(cx, cy, w, h, n));

/** A polygon with rounded corners (radius r at every vertex) */
export function roundedPolygon(pts: Pt[], r: number, path = new Path2D()): Path2D {
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const a = pts[(i - 1 + n) % n];
    const b = pts[i];
    const c = pts[(i + 1) % n];
    const m: Pt = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    if (i === 0) path.moveTo(m[0], m[1]);
    path.arcTo(b[0], b[1], c[0], c[1], r);
  }
  path.closePath();
  return path;
}

/** A bevelled sci-fi panel: corners cut at 45° (one size, or [top-left, top-right, bottom-right, bottom-left]) */
export function chamfer(x: number, y: number, w: number, h: number, c: number | [number, number, number, number], path = new Path2D()): Path2D {
  const [a, b, d, e] = (typeof c === 'number' ? [c, c, c, c] : c).map((v) => Math.max(0, Math.min(v, w / 2, h / 2)));
  return poly([[x + a, y], [x + w - b, y], [x + w, y + b], [x + w, y + h - d], [x + w - d, y + h], [x + e, y + h], [x, y + h - e], [x, y + a]], path);
}

/** A star with n points; inner radius as a share of r */
export function star(cx: number, cy: number, r: number, n = 5, inner = 0.48, rot = -Math.PI / 2): Path2D {
  const pts: Pt[] = [];
  for (let i = 0; i < n * 2; i++) {
    const a = rot + (i * Math.PI) / n;
    const rr = i % 2 ? r * inner : r;
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  return poly(pts);
}

/** A leaf from its stem at (x, y), pointing along `angle` */
export function leaf(x: number, y: number, len: number, width: number, angle = -Math.PI / 2): Path2D {
  const p = new Path2D();
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const P = (u: number, v: number): Pt => [x + c * u - s * v, y + s * u + c * v];
  const tip = P(len, 0);
  const a = P(len * 0.4, width / 2);
  const b = P(len * 0.4, -width / 2);
  p.moveTo(x, y);
  p.quadraticCurveTo(a[0], a[1], tip[0], tip[1]);
  p.quadraticCurveTo(b[0], b[1], x, y);
  p.closePath();
  return p;
}

/** Points of a cumulus cloud's outline: puffs on a soft base, one contour (no inner seams to catch a stroke) */
export function cloudPoints(cx: number, cy: number, w: number, h: number, seed = 1, n = 56): Pt[] {
  const puffs: [number, number, number][] = [];
  for (let i = 0; i < 5; i++) {
    const u = (i + 0.5) / 5;
    const r = h * (0.32 + 0.38 * Math.sin(u * Math.PI)) * (0.8 + 0.4 * hash(i, seed));
    puffs.push([cx - w / 2 + u * w, cy + h / 2 - r * 0.95, r]);
  }
  // The base: an ellipse along the bottom
  const bx = w / 2;
  const by = h * 0.28;
  const bcy = cy + h / 2 - by;
  const out: Pt[] = [];
  for (let k = 0; k < n; k++) {
    const a = (k / n) * Math.PI * 2;
    const dx = Math.cos(a);
    const dy = Math.sin(a);
    // The farthest point along the ray from the centre that is inside a puff or the base
    let far = 0;
    for (const [px, py, r] of puffs) {
      const ox = cx - px;
      const oy = cy - py;
      const b = ox * dx + oy * dy;
      const c = ox * ox + oy * oy - r * r;
      const disc = b * b - c;
      if (disc >= 0) far = Math.max(far, -b + Math.sqrt(disc));
    }
    const ex = dx / bx;
    const ey = dy / by;
    const oy = (cy - bcy) / by;
    const A = ex * ex + ey * ey;
    const B = 2 * oy * ey;
    const C = oy * oy - 1;
    const d2 = B * B - 4 * A * C;
    if (d2 >= 0) far = Math.max(far, (-B + Math.sqrt(d2)) / (2 * A));
    out.push([cx + dx * far, cy + dy * far]);
  }
  return out;
}

/** A cumulus cloud: puffs on a soft base, as one smooth contour */
export const cloud = (cx: number, cy: number, w: number, h: number, seed = 1): Path2D => smoothPath(cloudPoints(cx, cy, w, h, seed), 0.7);

/** A flame from its base at (x, y), h tall; t animates the flicker, seed varies it */
export function flame(x: number, y: number, w: number, h: number, t = 0, seed = 1): Path2D {
  const f = (k: number) => Math.sin(t * (7 + k * 3) + hash(k, seed) * TAU);
  const p = new Path2D();
  const tipX = x + w * 0.12 * f(1);
  const tipY = y - h * (0.92 + 0.08 * f(2));
  p.moveTo(x - w / 2, y - h * 0.18);
  p.bezierCurveTo(x - w / 2, y - h * 0.55, tipX - w * 0.12, tipY + h * 0.3, tipX, tipY);
  p.bezierCurveTo(tipX + w * 0.1, tipY + h * 0.35, x + w / 2, y - h * (0.5 + 0.05 * f(3)), x + w / 2, y - h * 0.18);
  p.bezierCurveTo(x + w / 2, y + h * 0.02, x - w / 2, y + h * 0.02, x - w / 2, y - h * 0.18);
  p.closePath();
  return p;
}

/**
 * A jagged lightning path from (x0, y0) to (x1, y1): seeded zigzag points. `jitter` is a share of the bolt's length
 * (default 0.12), not pixels: it is clamped to 0–0.5 (Sigil Clash passed 14 and drew bolts across the whole screen)
 */
export function boltPoints(x0: number, y0: number, x1: number, y1: number, o: { segments?: number; jitter?: number; seed?: number } = {}): Pt[] {
  const n = o.segments ?? 8;
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const j = Math.min(0.5, Math.max(0, o.jitter ?? 0.12)) * len;
  const out: Pt[] = [[x0, y0]];
  for (let i = 1; i < n; i++) {
    const u = i / n;
    const off = (hash(i, o.seed ?? 1) * 2 - 1) * j * Math.sin(u * Math.PI);
    out.push([x0 + dx * u + nx * off, y0 + dy * u + ny * off]);
  }
  out.push([x1, y1]);
  return out;
}

/** An open polyline path (bolts, cables) */
export function line(pts: Pt[]): Path2D {
  const p = new Path2D();
  pts.forEach(([x, y], i) => (i ? p.lineTo(x, y) : p.moveTo(x, y)));
  return p;
}

// --- Things drawn whole (a few gradients each: bake them for every frame) -------------------------------------------

/** A cut gem: a lit body and its facets */
export function gem(ctx: Ctx, cx: number, cy: number, size: number, color: string, light = DEFAULT_LIGHT): void {
  const w = size;
  const h = size * 0.9;
  const top = cy - h * 0.45;
  const mid = cy - h * 0.12;
  const pts: Pt[] = [[cx - w * 0.28, top], [cx + w * 0.28, top], [cx + w / 2, mid], [cx, cy + h * 0.55], [cx - w / 2, mid]];
  const body = poly(pts);
  paint(ctx, body, { x: cx - w / 2, y: top, w, h }, color, { style: 'glossy', light, ao: 0.3, outline: Math.max(1, size * 0.04) });
  const t = tones(color);
  ctx.save();
  ctx.clip(body);
  // Facets: a light table on top, darker pavilion facets below
  ctx.fillStyle = alpha(t.spec, 0.45);
  ctx.fill(poly([[cx - w * 0.14, top], [cx + w * 0.14, top], [cx + w * 0.22, mid], [cx - w * 0.22, mid]]));
  ctx.fillStyle = alpha(t.core, 0.45);
  ctx.fill(poly([[cx + w * 0.22, mid], [cx + w / 2, mid], [cx, cy + h * 0.55]]));
  ctx.fillStyle = alpha(t.light, 0.35);
  ctx.fill(poly([[cx - w / 2, mid], [cx - w * 0.22, mid], [cx, cy + h * 0.55]]));
  ctx.restore();
}

/** A coin; `turn` 0…1 spins it (its edge shows as it turns) */
export function coin(ctx: Ctx, cx: number, cy: number, r: number, color = '#ffc93c', turn = 0, light = DEFAULT_LIGHT): void {
  const sx = Math.max(0.08, Math.abs(Math.cos(turn * Math.PI)));
  const t = tones(color);
  const edge = r * 0.16 * (1 - sx);
  ctx.save();
  ctx.translate(cx, cy);
  if (edge > 0.3) {
    ctx.fillStyle = t.shadow;
    ctx.beginPath();
    ctx.ellipse(edge, 0, r * sx, r, 0, 0, TAU);
    ctx.fill();
  }
  ctx.scale(sx, 1);
  const face = new Path2D();
  face.arc(0, 0, r, 0, TAU);
  paint(ctx, face, { x: -r, y: -r, w: r * 2, h: r * 2 }, color, { style: 'metal', light, outline: Math.max(1, r * 0.08), rim: '#fff7d6' });
  const inner = new Path2D();
  inner.arc(0, 0, r * 0.68, 0, TAU);
  ctx.lineWidth = Math.max(1, r * 0.09);
  ctx.strokeStyle = alpha(t.core, 0.7);
  ctx.stroke(inner);
  ctx.strokeStyle = alpha(t.spec, 0.6);
  ctx.lineWidth = Math.max(0.5, r * 0.04);
  ctx.translate(-r * 0.03, -r * 0.03);
  ctx.stroke(inner);
  ctx.restore();
}

/** A pipe from (x0, y0) to (x1, y1), radius r: cylindrical shading across it, flanges at both ends */
export function pipe(ctx: Ctx, x0: number, y0: number, x1: number, y1: number, r: number, color: string, o: { flanges?: boolean; light?: number } = {}): void {
  const t = tones(color);
  const len = Math.hypot(x1 - x0, y1 - y0);
  const ang = Math.atan2(y1 - y0, x1 - x0);
  const light = o.light ?? DEFAULT_LIGHT;
  // Which side of the pipe faces the light
  const side = Math.sin(light - ang) < 0 ? -1 : 1;
  ctx.save();
  ctx.translate(x0, y0);
  ctx.rotate(ang);
  const g = ctx.createLinearGradient(0, -r * side, 0, r * side);
  g.addColorStop(0, t.high);
  g.addColorStop(0.25, t.light);
  g.addColorStop(0.55, color);
  g.addColorStop(0.85, t.core);
  g.addColorStop(1, t.shadow);
  ctx.fillStyle = g;
  ctx.fillRect(0, -r, len, r * 2);
  ctx.fillStyle = alpha(t.spec, 0.5);
  ctx.fillRect(0, -r * side * 0.62 - r * 0.06, len, r * 0.12);
  if (o.flanges !== false)
    for (const fx of [0, len - r * 0.7]) {
      ctx.fillStyle = g;
      ctx.fillRect(fx, -r * 1.3, r * 0.7, r * 2.6);
      ctx.fillStyle = alpha(t.deep, 0.6);
      ctx.fillRect(fx + r * 0.6, -r * 1.3, r * 0.1, r * 2.6);
    }
  ctx.restore();
}

// --- Character parts --------------------------------------------------------------------------------------------------

export interface EyeOptions {
  /** Where it looks: −1…1 on each axis (lookAt gives it) */
  look?: Pt;
  /** 0 open … 1 shut */
  blink?: number;
  iris?: string;
  sclera?: string;
  pupil?: string;
  /** The lid colour (the skin; default a shade of the sclera, drawn only while it blinks or a lid is lowered); the upper lid also lowers by `lid` 0…1 (sleepy, angry) */
  skin?: string;
  lid?: number;
  /** Pupil size as a share of the iris (dilated 0.65, tense 0.35) */
  dilate?: number;
  light?: number;
}

/** A cartoon eye: sclera, an iris with depth, a pupil, two catch-lights (they sell "alive"), lids that blink */
export function eye(ctx: Ctx, x: number, y: number, r: number, o: EyeOptions = {}): void {
  const [lx, ly] = o.look ?? [0, 0];
  const blink = Math.min(1, Math.max(0, o.blink ?? 0));
  const light = o.light ?? DEFAULT_LIGHT;
  const iris = o.iris ?? '#3fb6ff';
  const ball = new Path2D();
  ball.ellipse(x, y, r, r * 1.08, 0, 0, TAU);
  const a0 = ctx.globalAlpha;
  ctx.save();
  // The sclera is never pure white: a soft shading toward the lid
  const sg = ctx.createRadialGradient(x + Math.cos(light) * r * 0.3, y + Math.sin(light) * r * 0.3, r * 0.1, x, y, r * 1.1);
  sg.addColorStop(0, o.sclera ?? '#ffffff');
  sg.addColorStop(1, alpha(tones(o.sclera ?? '#f2f5ff').shadow, 1));
  ctx.fillStyle = sg;
  ctx.fill(ball);
  ctx.clip(ball);
  const ix = x + lx * r * 0.38;
  const iy = y + ly * r * 0.34;
  const ir = r * 0.62;
  const ti = tones(iris);
  const ig = ctx.createRadialGradient(ix, iy + ir * 0.35, 0, ix, iy, ir);
  ig.addColorStop(0, ti.high);
  ig.addColorStop(0.55, iris);
  ig.addColorStop(1, ti.core);
  ctx.fillStyle = ig;
  ctx.beginPath();
  ctx.arc(ix, iy, ir, 0, TAU);
  ctx.fill();
  ctx.fillStyle = o.pupil ?? alpha(ti.deep, 1);
  ctx.beginPath();
  ctx.arc(ix + lx * r * 0.05, iy + ly * r * 0.05, ir * (o.dilate ?? 0.5), 0, TAU);
  ctx.fill();
  // Catch-lights: a big one toward the light, a small one opposite
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(ix + Math.cos(light) * ir * 0.42, iy + Math.sin(light) * ir * 0.42, ir * 0.3, 0, TAU);
  ctx.fill();
  ctx.globalAlpha = a0 * 0.8;
  ctx.beginPath();
  ctx.arc(ix - Math.cos(light) * ir * 0.38, iy - Math.sin(light) * ir * 0.38, ir * 0.13, 0, TAU);
  ctx.fill();
  ctx.globalAlpha = a0;
  // The upper lid's shadow on the ball, then the lids. Without a skin colour the lids only show when they move in (a
  // blink, a lowered lid), in a shade of the sclera: an eye without one still blinks
  const lid = Math.max(0, Math.min(1, o.lid ?? 0));
  const top = y - r * 1.1 + (r * 2.2) * Math.max(blink * 0.55, lid * 0.45);
  const bot = y + r * 1.1 - r * 2.2 * blink * 0.45;
  const skin = o.skin ?? (blink > 0 || lid > 0 ? tones(o.sclera ?? '#f2f5ff').shadow : undefined);
  if (skin) {
    const ts = tones(skin);
    ctx.fillStyle = alpha(ts.core, 0.35);
    ctx.fillRect(x - r * 1.2, top, r * 2.4, r * 0.28);
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.ellipse(x, top - r * 0.9, r * 1.4, r, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = ts.shadow;
    ctx.beginPath();
    ctx.ellipse(x, bot + r * 0.9, r * 1.4, r, 0, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
  ctx.save();
  ctx.lineWidth = Math.max(1, r * 0.1);
  ctx.strokeStyle = alpha(tones(o.skin ?? iris).deep, 0.85);
  ctx.stroke(ball);
  ctx.restore();
}

/** Robot screen eyes on a visor: two glowing shapes with a mood, a look and a blink (a scanline sheen) */
export function visorEyes(ctx: Ctx, x: number, y: number, w: number, h: number, o: { color?: string; look?: Pt; blink?: number; mood?: 'neutral' | 'happy' | 'angry' | 'sad' | 'wide'; glow?: number } = {}): void {
  const c = o.color ?? '#5ff6ff';
  const [lx, ly] = o.look ?? [0, 0];
  const open = 1 - Math.min(1, Math.max(0, o.blink ?? 0)) * 0.9;
  const mood = o.mood ?? 'neutral';
  const ew = w * 0.26;
  const eh = h * 0.62 * open * (mood === 'wide' ? 1.15 : 1);
  ctx.save();
  for (const s of [-1, 1]) {
    const ex = x + s * w * 0.22 + lx * w * 0.1;
    const ey = y + ly * h * 0.18;
    glow(ctx, ex, ey, ew * 1.5, c, (o.glow ?? 1) * 0.7);
    ctx.fillStyle = c;
    const p = new Path2D();
    if (mood === 'happy') {
      // ^ ^: an arc
      p.ellipse(ex, ey + eh * 0.25, ew / 2, Math.max(1, eh * 0.55), 0, Math.PI, TAU);
      p.ellipse(ex, ey + eh * 0.42, ew / 2.6, Math.max(0.5, eh * 0.32), 0, TAU, Math.PI, true);
    } else rounded(ex - ew / 2, ey - eh / 2, ew, Math.max(1.5, eh), Math.min(ew, eh) * 0.45, p);
    ctx.fill(p);
    if (mood === 'angry' || mood === 'sad') {
      // A brow cut across the top
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      const k = mood === 'angry' ? s : -s;
      ctx.moveTo(ex - ew, ey - eh / 2 - ew * 0.2 - k * ew * 0.35);
      ctx.lineTo(ex + ew, ey - eh / 2 - ew * 0.2 + k * ew * 0.35);
      ctx.lineTo(ex + ew, ey - eh);
      ctx.lineTo(ex - ew, ey - eh);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
    }
    // A white-hot core
    ctx.fillStyle = alpha('#ffffff', 0.55);
    ctx.fillRect(ex - ew * 0.22, ey - eh * 0.3, ew * 0.44, Math.max(0.5, eh * 0.18));
  }
  ctx.restore();
}

/** A mouth: smile −1 (frown) … 1 (grin), open 0…1 */
export function mouth(ctx: Ctx, x: number, y: number, w: number, o: { smile?: number; open?: number; color?: string; inside?: string } = {}): void {
  const s = o.smile ?? 0.6;
  const op = o.open ?? 0;
  const c = o.color ?? '#2a1030';
  ctx.save();
  ctx.lineCap = 'round';
  if (op > 0.05) {
    const p = new Path2D();
    p.moveTo(x - w / 2, y - s * w * 0.1);
    p.quadraticCurveTo(x, y + s * w * 0.4 + op * w * 0.45, x + w / 2, y - s * w * 0.1);
    p.quadraticCurveTo(x, y + s * w * 0.12, x - w / 2, y - s * w * 0.1);
    ctx.fillStyle = o.inside ?? '#4a1530';
    ctx.fill(p);
    ctx.save();
    ctx.clip(p);
    ctx.fillStyle = '#ff6f8e';
    ctx.beginPath();
    ctx.ellipse(x, y + s * w * 0.3 + op * w * 0.4, w * 0.24, w * 0.16, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
    ctx.strokeStyle = c;
    ctx.lineWidth = Math.max(1, w * 0.07);
    ctx.stroke(p);
  } else {
    ctx.strokeStyle = c;
    ctx.lineWidth = Math.max(1.2, w * 0.09);
    ctx.beginPath();
    ctx.moveTo(x - w / 2, y);
    ctx.quadraticCurveTo(x, y + s * w * 0.35, x + w / 2, y);
    ctx.stroke();
  }
  ctx.restore();
}

// --- Surface details ------------------------------------------------------------------------------------------------

/** Rivets or screws (slot: true) at the points: a lit dome each */
export function rivets(ctx: Ctx, pts: Pt[], r: number, base: string, o: { slot?: boolean; light?: number } = {}): void {
  const t = tones(base);
  const a = o.light ?? DEFAULT_LIGHT;
  const dx = Math.cos(a) * r * 0.35;
  const dy = Math.sin(a) * r * 0.35;
  for (const [x, y] of pts) {
    ctx.fillStyle = alpha(t.deep, 0.5);
    ctx.beginPath();
    ctx.arc(x - dx * 0.6, y - dy * 0.6, r * 1.05, 0, TAU);
    ctx.fill();
    const g = ctx.createRadialGradient(x + dx, y + dy, 0, x, y, r);
    g.addColorStop(0, t.spec);
    g.addColorStop(0.5, t.light);
    g.addColorStop(1, t.shadow);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
    if (o.slot) {
      ctx.strokeStyle = t.core;
      ctx.lineWidth = Math.max(0.6, r * 0.25);
      ctx.beginPath();
      ctx.moveTo(x - r * 0.6, y + r * 0.2);
      ctx.lineTo(x + r * 0.6, y - r * 0.2);
      ctx.stroke();
    }
  }
}

/** Engraved panel lines: a dark groove with a lit lip on the side toward the light */
export function grooves(ctx: Ctx, lines: [number, number, number, number][], base: string, width = 1.2, light = DEFAULT_LIGHT): void {
  const t = tones(base);
  const ox = -Math.cos(light) * width * 0.8;
  const oy = -Math.sin(light) * width * 0.8;
  ctx.lineCap = 'round';
  for (const [pass, col] of [[1, alpha(t.spec, 0.35)], [0, alpha(t.deep, 0.75)]] as const) {
    ctx.strokeStyle = col;
    ctx.lineWidth = width;
    ctx.beginPath();
    for (const [x0, y0, x1, y1] of lines) {
      ctx.moveTo(x0 + ox * pass, y0 + oy * pass);
      ctx.lineTo(x1 + ox * pass, y1 + oy * pass);
    }
    ctx.stroke();
  }
}

/** Vent slots in a box: n rounded slits with depth */
export function vents(ctx: Ctx, x: number, y: number, w: number, h: number, base: string, n = 4, o: { glow?: string } = {}): void {
  const t = tones(base);
  const gap = h / n;
  for (let i = 0; i < n; i++) {
    const sy = y + i * gap + gap * 0.22;
    const sh = gap * 0.56;
    const p = rounded(x, sy, w, sh, sh / 2);
    ctx.fillStyle = o.glow ?? t.deep;
    ctx.fill(p);
    ctx.fillStyle = alpha(o.glow ? '#ffffff' : t.core, o.glow ? 0.35 : 0.9);
    ctx.fillRect(x + sh / 2, sy + (o.glow ? sh * 0.3 : 0), w - sh, sh * 0.35);
    ctx.fillStyle = alpha(t.spec, 0.3);
    ctx.fillRect(x + sh / 2, sy + sh, w - sh, Math.max(0.6, sh * 0.15));
  }
}

/** Diagonal stripes clipped to a shape (hazard tape, a racing stripe) */
export function stripes(ctx: Ctx, path: Path2D, box: Box, o: { color?: string; width?: number; gap?: number; angle?: number } = {}): void {
  const wd = o.width ?? 8;
  const gap = o.gap ?? wd;
  const a = o.angle ?? Math.PI / 4;
  ctx.save();
  ctx.clip(path);
  ctx.translate(box.x + box.w / 2, box.y + box.h / 2);
  ctx.rotate(a);
  ctx.fillStyle = o.color ?? 'rgba(16, 20, 40, 0.8)';
  const R = Math.hypot(box.w, box.h) / 2 + wd;
  for (let s = -R; s < R; s += wd + gap) ctx.fillRect(s, -R, wd, R * 2);
  ctx.restore();
}

/** Seeded specks clipped to a shape: dust, pores, a stone's grain, freckles (`size` px, `n` of them) */
export function speckle(ctx: Ctx, path: Path2D, box: Box, o: { n?: number; color?: string; size?: number; seed?: number; alpha?: number } = {}): void {
  const n = o.n ?? 40;
  const s = o.size ?? 1.5;
  ctx.save();
  ctx.clip(path);
  ctx.fillStyle = o.color ?? '#000000';
  for (let i = 0; i < n; i++) {
    const x = box.x + hash(i * 3, o.seed ?? 7) * box.w;
    const y = box.y + hash(i * 3 + 1, o.seed ?? 7) * box.h;
    ctx.globalAlpha = (o.alpha ?? 0.25) * (0.4 + 0.6 * hash(i * 3 + 2, o.seed ?? 7));
    ctx.beginPath();
    ctx.arc(x, y, s * (0.5 + hash(i, (o.seed ?? 7) + 1)), 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

/** Wear: seeded scratches and chipped paint near the edges, clipped (metal that has worked) */
export function wear(ctx: Ctx, path: Path2D, box: Box, o: { seed?: number; amount?: number; color?: string } = {}): void {
  const seed = o.seed ?? 3;
  const n = Math.round(14 * (o.amount ?? 1));
  ctx.save();
  ctx.clip(path);
  ctx.strokeStyle = o.color ?? 'rgba(255, 255, 255, 0.22)';
  ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const edge = hash(i, seed) < 0.6;
    const u = hash(i + 100, seed);
    const v = edge ? (hash(i + 200, seed) < 0.5 ? 0.06 : 0.94) : hash(i + 300, seed);
    const x = box.x + u * box.w;
    const y = box.y + v * box.h;
    const l = (3 + 9 * hash(i + 400, seed)) * Math.max(0.5, box.w / 120);
    const a = hash(i + 500, seed) * Math.PI;
    ctx.lineWidth = 0.6 + hash(i + 600, seed);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
    ctx.stroke();
  }
  ctx.restore();
}

/** paint() with the box taken from a rect: the common case of a lit panel */
export function litRect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number, base: string, m: Material = {}): Path2D {
  const p = rounded(x, y, w, h, r);
  paint(ctx, p, { x, y, w, h }, base, m);
  return p;
}
