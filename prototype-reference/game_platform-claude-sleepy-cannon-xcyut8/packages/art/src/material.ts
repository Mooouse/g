// Materials: fill a shape as a lit volume, the way an illustrator shades — one light direction for the whole scene,
// then base, form shadow, core shadow, bounce light from the ground, highlight, specular, rim (back) light, ambient
// occlusion at the edges, and an outline in a darker, hue-shifted base (never black). Styles: matte, toon, glossy,
// metal, brushed, chrome, glass, emissive. Plus the light outside a shape: glow (additive), contact and soft shadows,
// inner shadow.
//
// Cost: a handful of gradients per call — bake it (makeSprite, SpriteCache, Baked) for anything drawn every frame;
// call it directly only for a few big shapes. shadowBlur is used only in softShadow / innerShadow: bake those.

import { canvas2d, bakeGen, type Ctx } from './bake.ts';
import { alpha, shade } from './color.ts';

export type Style = 'matte' | 'toon' | 'glossy' | 'metal' | 'brushed' | 'chrome' | 'glass' | 'emissive';

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Material {
  style?: Style;
  /** The direction TOWARD the key light in radians, canvas axes (y down). Default −2.3: up and to the left */
  light?: number;
  /** Outline width in px (default 0: none); its colour is the base's deepest hue-shifted shade unless outlineColor */
  outline?: number;
  outlineColor?: string;
  /** The back light on the side away from the key light (default a pale sky colour; false: none) */
  rim?: string | false;
  /** Light bounced from the ground into the underside (default a warm tint of the base; false: none) */
  bounce?: string | false;
  /** Specular strength 0…1 (default by style) */
  gloss?: number;
  /** Ambient occlusion at the edges on the shadow side, 0…1 (default 0.6) */
  ao?: number;
  /** Hue shift of the shading: 0 plain lightness, 1 the default (shadows cool, lights warm) */
  shift?: number;
  /** Glass and emissive: how see-through the body is (default 0.3 glass, 1 otherwise) */
  opacity?: number;
}

export const DEFAULT_LIGHT = -2.3;

export interface Tones {
  deep: string;
  core: string;
  shadow: string;
  base: string;
  light: string;
  high: string;
  spec: string;
}

const toneCache = new Map<string, Tones>();

/** The hue-shifted tones of a base colour: what every style shades with (cached) */
export function tones(base: string, shift = 1): Tones {
  const k = `${base}|${shift}`;
  let t = toneCache.get(k);
  if (!t) {
    t = {
      deep: shade(base, -0.82, shift),
      core: shade(base, -0.6, shift),
      shadow: shade(base, -0.38, shift),
      base,
      light: shade(base, 0.25, shift),
      high: shade(base, 0.55, shift),
      spec: shade(base, 0.9, shift),
    };
    if (toneCache.size > 512) toneCache.clear();
    toneCache.set(k, t);
  }
  return t;
}

/** The outline colour for a base: its deepest shade, hue-shifted — reads as an edge, never as a black line */
export const outlineOf = (base: string, shift = 1): string => tones(base, shift).deep;

const GLOSS: Record<Style, number> = { matte: 0.15, toon: 0.7, glossy: 0.9, metal: 0.6, brushed: 0.45, chrome: 1, glass: 1, emissive: 0 };

/** Fill `path` (inside `box`) as a lit volume of colour `base` */
export function paint(ctx: Ctx, path: Path2D, box: Box, base: string, m: Material = {}): void {
  const style = m.style ?? 'matte';
  const a = m.light ?? DEFAULT_LIGHT;
  const lx = Math.cos(a);
  const ly = Math.sin(a);
  const { x, y, w, h } = box;
  const cx = x + w / 2;
  const cy = y + h / 2;
  const R = Math.max(w, h) / 2;
  const t = tones(base, m.shift ?? 1);
  const gloss = m.gloss ?? GLOSS[style];
  const g0 = ctx.globalAlpha;
  // Points on the light side and the shadow side of the box
  const Lx = cx + lx * R;
  const Ly = cy + ly * R;
  const Sx = cx - lx * R;
  const Sy = cy - ly * R;

  ctx.save();
  // 1. The body: base, form shadow and core shadow in one gradient from the light
  let fill: CanvasGradient;
  if (style === 'emissive') {
    fill = ctx.createRadialGradient(cx + lx * R * 0.15, cy + ly * R * 0.15, 0, cx, cy, R * 1.05);
    fill.addColorStop(0, t.spec);
    fill.addColorStop(0.35, t.high);
    fill.addColorStop(0.75, base);
    fill.addColorStop(1, t.shadow);
  } else if (style === 'metal' || style === 'brushed' || style === 'chrome') {
    // An environment reflection: bands across the light direction (sky above, a dark horizon, the warm ground)
    fill = ctx.createLinearGradient(Lx, Ly, Sx, Sy);
    const chrome = style === 'chrome';
    fill.addColorStop(0, chrome ? t.spec : t.high);
    fill.addColorStop(0.22, t.light);
    fill.addColorStop(0.48, chrome ? t.core : t.base);
    fill.addColorStop(chrome ? 0.52 : 0.6, chrome ? t.deep : t.shadow);
    fill.addColorStop(0.78, t.base);
    fill.addColorStop(1, t.shadow);
  } else {
    fill = ctx.createRadialGradient(cx + lx * R * 0.5, cy + ly * R * 0.5, R * 0.05, cx + lx * R * 0.2, cy + ly * R * 0.2, R * 1.45);
    if (style === 'toon') {
      fill.addColorStop(0, t.light);
      fill.addColorStop(0.36, t.light);
      fill.addColorStop(0.361, base);
      fill.addColorStop(0.7, base);
      fill.addColorStop(0.701, t.shadow);
      fill.addColorStop(1, t.shadow);
    } else {
      fill.addColorStop(0, t.light);
      fill.addColorStop(0.32, base);
      fill.addColorStop(0.72, t.shadow);
      fill.addColorStop(1, t.core);
    }
  }
  ctx.globalAlpha = g0 * (m.opacity ?? (style === 'glass' ? 0.3 : 1));
  ctx.fillStyle = fill;
  ctx.fill(path);
  ctx.globalAlpha = g0;
  ctx.clip(path);

  if (style === 'brushed') {
    // Fine brush lines across the plate
    ctx.globalAlpha = g0 * 0.07;
    ctx.fillStyle = t.spec;
    for (let i = 0, n = Math.ceil(h / 2.2); i < n; i++) if ((i * 7919) % 5 < 2) ctx.fillRect(x, y + i * 2.2, w, 0.8);
    ctx.globalAlpha = g0;
  }

  if (style !== 'emissive') {
    // 2. Bounce light: the ground lights the underside a little (it sells the volume more than any highlight)
    if (m.bounce !== false) {
      const b = ctx.createRadialGradient(cx, y + h * 1.08, 0, cx, y + h * 1.08, Math.max(w * 0.62, h * 0.5));
      const bc = m.bounce ?? t.light;
      b.addColorStop(0, alpha(bc, style === 'glass' ? 0.25 : 0.42));
      b.addColorStop(1, alpha(bc, 0));
      ctx.fillStyle = b;
      ctx.fillRect(x, y, w, h);
    }
    // 3. Ambient occlusion: the edges on the shadow side darken (a gradient stroke, half of it inside the clip)
    const ao = m.ao ?? 0.6;
    if (ao > 0) {
      const g = ctx.createLinearGradient(Lx, Ly, Sx, Sy);
      g.addColorStop(0, alpha(t.deep, 0));
      g.addColorStop(0.55, alpha(t.deep, 0.25 * ao));
      g.addColorStop(1, alpha(t.deep, 0.75 * ao));
      ctx.strokeStyle = g;
      ctx.lineWidth = R * 0.28;
      ctx.stroke(path);
    }
    // 4. Rim (back) light on the side away from the key light
    if (m.rim !== false) {
      const rc = m.rim ?? '#bfe6ff';
      const g = ctx.createLinearGradient(Sx, Sy, cx, cy);
      g.addColorStop(0, alpha(rc, style === 'matte' ? 0.55 : 0.85));
      g.addColorStop(0.35, alpha(rc, 0));
      ctx.strokeStyle = g;
      ctx.lineWidth = Math.max(1.5, R * (style === 'glass' ? 0.14 : 0.09));
      ctx.stroke(path);
    }
    // 5. Highlight and specular on the light side
    if (gloss > 0) {
      const hx = cx + lx * R * 0.52;
      const hy = cy + ly * R * 0.52;
      ctx.translate(hx, hy);
      ctx.rotate(a + Math.PI / 2);
      if (style === 'toon') {
        ctx.globalAlpha = g0 * 0.85 * gloss;
        ctx.fillStyle = t.spec;
        ctx.beginPath();
        ctx.ellipse(0, 0, R * 0.26, R * 0.11, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.scale(1, 0.55);
        const s = ctx.createRadialGradient(0, 0, 0, 0, 0, R * 0.6);
        s.addColorStop(0, alpha(t.spec, 0.55 * gloss));
        s.addColorStop(1, alpha(t.spec, 0));
        ctx.fillStyle = s;
        ctx.fillRect(-R, -R, R * 2, R * 2);
        if (gloss > 0.5) {
          // The sharp specular: a small bright core
          const r = R * (style === 'chrome' || style === 'glass' ? 0.2 : 0.14);
          const p = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
          p.addColorStop(0, alpha('#ffffff', 0.95 * gloss));
          p.addColorStop(0.45, alpha('#ffffff', 0.55 * gloss));
          p.addColorStop(1, alpha('#ffffff', 0));
          ctx.fillStyle = p;
          ctx.fillRect(-r, -r, r * 2, r * 2);
        }
      }
    }
  }
  ctx.restore();
  if (style === 'glass') {
    // Glass: a bright refracted edge on the shadow side, inside the body
    ctx.save();
    ctx.clip(path);
    const g = ctx.createLinearGradient(Sx, Sy, cx, cy);
    g.addColorStop(0, alpha(t.spec, 0.55));
    g.addColorStop(0.25, alpha(t.spec, 0));
    ctx.fillStyle = g;
    ctx.fill(path);
    ctx.restore();
  }
  // 6. The outline: the base's deepest shade, hue-shifted
  if (m.outline) {
    ctx.save();
    ctx.lineJoin = 'round';
    ctx.lineWidth = m.outline;
    ctx.strokeStyle = m.outlineColor ?? t.deep;
    ctx.stroke(path);
    ctx.restore();
  }
}

// --- Light outside a shape ------------------------------------------------------------------------------------------

const GLOW_R = 64;
const glows = new Map<string, { gen: number; c: HTMLCanvasElement }>();
const shadows = new Map<string, { gen: number; c: HTMLCanvasElement }>();

/** A soft radial falloff sprite per colour, baked once at 128 px (glow is blurry: no density needed) */
export function glowSprite(color: string, falloff: 'glow' | 'shadow' = 'glow'): HTMLCanvasElement {
  const m = falloff === 'glow' ? glows : shadows;
  const hit = m.get(color);
  if (hit && hit.gen === bakeGen()) return hit.c;
  const [c, g] = canvas2d(GLOW_R * 2, GLOW_R * 2);
  const r = g.createRadialGradient(GLOW_R, GLOW_R, 0, GLOW_R, GLOW_R, GLOW_R);
  const stops: [number, number][] = falloff === 'glow' ? [[0, 1], [0.12, 0.75], [0.3, 0.36], [0.55, 0.12], [0.8, 0.03], [1, 0]] : [[0, 0.9], [0.45, 0.6], [0.75, 0.22], [1, 0]];
  for (const [o, al] of stops) r.addColorStop(o, alpha(color, al));
  g.fillStyle = r;
  g.fillRect(0, 0, GLOW_R * 2, GLOW_R * 2);
  if (m.size > 128) m.clear();
  m.set(color, { gen: bakeGen(), c });
  return c;
}

// Soft sprites at the size they are drawn. A glow blitted from the 128 px sprite is scaled and lands on fractional
// pixels: a filtered blit, ≈ 3.5× the cost of the same glow pre-sized and put on whole device pixels on a software
// rasterizer (60 glows of 40–130 px, 'lighter': 10.1 → 2.9 ms in headless Chromium at 1280×720). So the size (device px)
// is bucketed — exact up to 24 px, then steps of 2^(1/16) ≈ 4 % — and each bucket baked once, LRU under a byte cap.
// A soft edge hides the ≤ 2 % size step and the ≤ ½ px snap.

export type Falloff = 'glow' | 'shadow' | 'disc';

const SIZED_MAX = 512;
const SIZED_CAP = 16 * 1024 * 1024;
const sized = new Map<string, { gen: number; c: HTMLCanvasElement; bytes: number }>();
let sizedBytes = 0;

/** A device-px size on the bucket grid (exact up to 24 px, then ≈ 4 % steps) */
export function sizeBucket(d: number): number {
  if (d <= 24) return Math.max(1, Math.round(d));
  return Math.round(2 ** (Math.round(Math.log2(d) * 16) / 16));
}

const STOPS: Record<Exclude<Falloff, 'disc'>, [number, number][]> = {
  glow: [[0, 1], [0.12, 0.75], [0.3, 0.36], [0.55, 0.12], [0.8, 0.03], [1, 0]],
  shadow: [[0, 0.9], [0.45, 0.6], [0.75, 0.22], [1, 0]],
};

/** A radial sprite (glow, shadow or the particles' disc) baked at exactly dw×dh device px (bucketed sizes: sizeBucket) */
export function sizedSprite(color: string, falloff: Falloff, dw: number, dh: number): HTMLCanvasElement {
  const key = `${falloff}|${color}|${dw}|${dh}`;
  const hit = sized.get(key);
  if (hit && hit.gen === bakeGen()) {
    sized.delete(key);
    sized.set(key, hit);
    return hit.c;
  }
  if (hit) {
    sized.delete(key);
    sizedBytes -= hit.bytes;
  }
  const [c, g] = canvas2d(dw, dh);
  const D = Math.max(dw, dh);
  g.scale(dw / D, dh / D);
  if (falloff === 'disc') {
    // As the 32 px disc: a radius of 15/16 of the half-size
    g.fillStyle = color;
    g.beginPath();
    g.arc(D / 2, D / 2, (D / 2) * (15 / 16), 0, Math.PI * 2);
    g.fill();
  } else {
    const r = g.createRadialGradient(D / 2, D / 2, 0, D / 2, D / 2, D / 2);
    for (const [o, al] of STOPS[falloff]) r.addColorStop(o, alpha(color, al));
    g.fillStyle = r;
    g.fillRect(0, 0, D, D);
  }
  const bytes = dw * dh * 4;
  sized.set(key, { gen: bakeGen(), c, bytes });
  sizedBytes += bytes;
  for (const [k, e] of sized) {
    if (sizedBytes <= SIZED_CAP || k === key) break;
    sized.delete(k);
    sizedBytes -= e.bytes;
  }
  return c;
}

/**
 * Blit a radial sprite over the box (x − rx, y − ry, 2rx, 2ry) in the current transform's units: pre-sized and on whole
 * device pixels (the fast copy) when the transform keeps its shape — axis-aligned or mirrored; for a circle also rotated
 * or squashed by ≤ 6 % (a soft round thing looks the same turned) — else the 128 px sprite scaled (huge glows, a skewed
 * ellipse). The caller sets the blend and alpha.
 */
export function radialBlit(ctx: Ctx, x: number, y: number, rx: number, ry: number, color: string, falloff: Falloff): void {
  const m = ctx.getTransform();
  let kx = 0;
  let ky = 0;
  if (m.b === 0 && m.c === 0) {
    kx = Math.abs(m.a);
    ky = Math.abs(m.d);
  } else if (rx === ry) {
    const sa = Math.hypot(m.a, m.b);
    const sb = Math.hypot(m.c, m.d);
    if (Math.abs(sa - sb) <= 0.06 * Math.max(sa, sb) && Math.abs(m.a * m.c + m.b * m.d) <= 0.06 * sa * sb) kx = ky = (sa + sb) / 2;
  }
  if (kx > 0 && ky > 0) {
    const dw = sizeBucket(rx * 2 * kx);
    const dh = sizeBucket(ry * 2 * ky);
    if (dw <= SIZED_MAX && dh <= SIZED_MAX) {
      const c = sizedSprite(color, falloff, dw, dh);
      const cx = m.a * x + m.c * y + m.e;
      const cy = m.b * x + m.d * y + m.f;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(c, Math.round(cx - dw / 2), Math.round(cy - dh / 2));
      ctx.setTransform(m);
      return;
    }
  }
  if (falloff === 'disc') {
    // Rotated or huge: the shape scaled as before (a disc is never huge in practice)
    ctx.drawImage(sizedSprite(color, 'disc', 32, 32), x - rx, y - ry, rx * 2, ry * 2);
  } else ctx.drawImage(glowSprite(color, falloff), x - rx, y - ry, rx * 2, ry * 2);
}

/** Additive glow (bloom) of radius r around (x, y): lamps, energy, eyes, pickups. Cheap: one blit of a pre-sized sprite */
export function glow(ctx: Ctx, x: number, y: number, r: number, color: string, strength = 1): void {
  if (strength <= 0 || r <= 0) return;
  const a0 = ctx.globalAlpha;
  const b0 = ctx.globalCompositeOperation;
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = a0 * Math.min(1, strength);
  radialBlit(ctx, x, y, r, r, color, 'glow');
  ctx.globalAlpha = a0;
  ctx.globalCompositeOperation = b0;
}

/** The dark, soft ellipse where a thing meets the ground — every character and prop needs one */
export function contactShadow(ctx: Ctx, x: number, y: number, rx: number, ry = rx * 0.28, color = '#0a1230', strength = 0.6): void {
  if (!(rx > 0 && ry > 0)) return;
  const a0 = ctx.globalAlpha;
  ctx.globalAlpha = a0 * strength;
  radialBlit(ctx, x, y, rx, ry, color, 'shadow');
  ctx.globalAlpha = a0;
}

/**
 * Set the context's shadow from sizes in the drawing's units (CSS px). The canvas takes shadowBlur and shadowOffset in
 * device px, untouched by the transform: scaled here, so a shadow baked at density 2 looks like the one at 1.
 */
function setShadow(ctx: Ctx, blur: number, dx: number, dy: number): void {
  const m = ctx.getTransform();
  ctx.shadowBlur = blur * Math.hypot(m.a, m.b);
  ctx.shadowOffsetX = m.a * dx + m.c * dy;
  ctx.shadowOffsetY = m.b * dx + m.d * dy;
}

/** A blurred drop shadow of the path (shadowBlur: inside a bake only); blur and offsets in CSS px at any density */
export function softShadow(ctx: Ctx, path: Path2D, o: { dx?: number; dy?: number; blur?: number; color?: string } = {}): void {
  ctx.save();
  ctx.shadowColor = o.color ?? 'rgba(6, 10, 30, 0.55)';
  setShadow(ctx, o.blur ?? 12, o.dx ?? 0, o.dy ?? 6);
  ctx.fillStyle = ctx.shadowColor;
  ctx.fill(path);
  ctx.restore();
}

/** A shadow cast inside the shape by its own edge (sockets, screens, pressed buttons) — shadowBlur: bake it; sizes in CSS px at any density */
export function innerShadow(ctx: Ctx, path: Path2D, box: Box, o: { dx?: number; dy?: number; blur?: number; color?: string } = {}): void {
  ctx.save();
  ctx.clip(path);
  const ring = new Path2D();
  const p = (o.blur ?? 10) * 3 + 20;
  ring.rect(box.x - p, box.y - p, box.w + p * 2, box.h + p * 2);
  ring.addPath(path);
  ctx.shadowColor = o.color ?? 'rgba(4, 8, 24, 0.8)';
  setShadow(ctx, o.blur ?? 10, o.dx ?? 0, o.dy ?? 4);
  ctx.fillStyle = '#000';
  ctx.fill(ring, 'evenodd');
  ctx.restore();
}
