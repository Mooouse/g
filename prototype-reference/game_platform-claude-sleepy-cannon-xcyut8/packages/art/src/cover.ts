// Covers: the platform's half of a portal cover (`gp covers`, docs/guides/covers.md). The game draws the key art in
// layers (host.qa({ cover: { scene, hero, front } })); this module lays the cover out per size and composition, lights
// the hero's rim, darkens behind the title, adds the vignette and letters the title — big, thick-outlined, extruded,
// with a gradient, a gloss, a slight tilt and arc, a drop shadow and a glow — fitted to its zone at every size.
// `coverLayout`, `splitTitle` and `fitTitle` are pure (Node tests them); the rest draws on Canvas 2D.

import type { CoverArt, CoverLayout, CoverRect, CoverTitleStyle, CoverVariant } from '@gp/core';
import { alpha, lightness, mix, shade } from './color.ts';
import type { Palette } from './palette.ts';

export type { CoverArt, CoverLayout, CoverRect, CoverTitleStyle, CoverVariant };

/** The compositions `gp covers --variants` renders, in order (the first is the cover; the others are A/B alternatives) */
export const COVER_VARIANTS: readonly CoverVariant[] = ['hero', 'action', 'closeup'];

export const coverShape = (w: number, h: number): CoverLayout['shape'] => (w / h >= 1.25 ? 'landscape' : h / w >= 1.25 ? 'portrait' : 'square');

type Zone = [x0: number, y0: number, x1: number, y1: number];
interface ZoneSet {
  hero: Zone;
  title: Zone;
  focus: [number, number];
  /** Where the rim light comes from (rad, screen space: 0 = right, -π/2 = up) */
  light: number;
}

// The zones as fractions of the cover. The title zones keep a 4–6 % margin from every edge (rounded tile corners and the
// portal's hover overlays); hero zones may bleed past the edge — a crop reads as close, a margin reads as small.
const ZONES: Record<CoverLayout['shape'], Record<CoverVariant, ZoneSet>> = {
  landscape: {
    hero: { hero: [0.0, 0.04, 0.56, 0.98], title: [0.53, 0.1, 0.96, 0.8], focus: [0.45, 0.36], light: -Math.PI / 4 },
    action: { hero: [0.14, 0.26, 0.86, 1.06], title: [0.08, 0.04, 0.92, 0.34], focus: [0.5, 0.62], light: -Math.PI / 2 },
    closeup: { hero: [0.3, -0.12, 1.08, 1.16], title: [0.04, 0.56, 0.6, 0.94], focus: [0.2, 0.28], light: (-3 * Math.PI) / 4 },
  },
  portrait: {
    hero: { hero: [0.02, 0.3, 0.98, 0.98], title: [0.05, 0.03, 0.95, 0.3], focus: [0.66, 0.5], light: -Math.PI / 2 },
    action: { hero: [0.02, 0.04, 0.98, 0.7], title: [0.06, 0.7, 0.94, 0.94], focus: [0.5, 0.36], light: -Math.PI / 3 },
    closeup: { hero: [-0.12, -0.04, 1.12, 0.8], title: [0.06, 0.74, 0.94, 0.96], focus: [0.5, 0.26], light: (-2 * Math.PI) / 3 },
  },
  square: {
    hero: { hero: [0.04, 0.3, 0.96, 0.98], title: [0.06, 0.04, 0.94, 0.32], focus: [0.68, 0.52], light: -Math.PI / 2 },
    action: { hero: [0.04, 0.02, 0.96, 0.66], title: [0.06, 0.64, 0.94, 0.94], focus: [0.5, 0.34], light: -Math.PI / 3 },
    closeup: { hero: [0.3, -0.06, 1.2, 1.0], title: [0.04, 0.6, 0.66, 0.95], focus: [0.24, 0.3], light: (-3 * Math.PI) / 4 },
  },
};

/** The cover's zones for one size and composition (pure) */
export function coverLayout(w: number, h: number, variant: CoverVariant = 'hero'): CoverLayout {
  const shape = coverShape(w, h);
  const z = ZONES[shape][variant];
  const rect = ([x0, y0, x1, y1]: Zone): CoverRect => ({ x: x0 * w, y: y0 * h, w: (x1 - x0) * w, h: (y1 - y0) * h });
  return { w, h, shape, variant, hero: rect(z.hero), title: rect(z.title), focus: { x: z.focus[0] * w, y: z.focus[1] * h }, unit: Math.min(w, h) / 1080, light: z.light };
}

// --- The title fitter (pure) ---------------------------------------------------------------------------------------

/** Every way to break the words into `k` lines in order */
function* breaks(words: string[], k: number, from = 0): Generator<string[]> {
  if (k === 1) {
    yield [words.slice(from).join(' ')];
    return;
  }
  for (let i = from + 1; i <= words.length - k + 1; i++) for (const rest of breaks(words, k - 1, i)) yield [words.slice(from, i).join(' '), ...rest];
}

/** The most even split of the title into `k` lines (the widest line as narrow as it can be) */
export function splitTitle(text: string, k: number, measure: (s: string) => number): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [''];
  const n = Math.max(1, Math.min(k, words.length));
  let best: string[] = [words.join(' ')];
  let bestW = Infinity;
  for (const lines of breaks(words, n)) {
    const wMax = Math.max(...lines.map(measure));
    if (wMax < bestW - 1e-9) {
      bestW = wMax;
      best = lines;
    }
  }
  return best;
}

export interface TitleMetrics {
  /** Width of a string at font size 1 (em) */
  measure(s: string): number;
  /** The letters' height above the baseline and below it, em (from the font: e.g. measureText at 100 px / 100) */
  ascent: number;
  descent: number;
}

export interface FitOptions {
  /** The outline's width on each side of a letter, em (default 0.09) */
  outline?: number;
  /** The extrusion's depth below the letters, em (default 0.07) */
  extrude?: number;
  /** Line spacing, em (default 0.92) */
  lineHeight?: number;
  /** Tilt (rad, default 0) and arc (em, default 0): they widen the box the title needs */
  tilt?: number;
  arc?: number;
  /** At most this many lines (default 3) */
  maxLines?: number;
  /** One line reads faster: a split must give letters this much bigger to win (default 1.12) */
  lineBias?: number;
}

export interface TitleFit {
  lines: string[];
  /** Font size, px */
  size: number;
  /** The title's outer box before the tilt, px (outline and extrusion included) */
  width: number;
  height: number;
  /** How much of the zone's width and height the tilted title fills (0–1) */
  fillW: number;
  fillH: number;
}

/**
 * The biggest title that fits the box: every line count from 1 to maxLines (the most even split for each), the size
 * that fits width and height with the outline, extrusion, arc and tilt, and the line count that gives the biggest
 * letters — a split has to win by `lineBias`, so a title stays on one line unless breaking it really helps (pure)
 */
export function fitTitle(text: string, box: { w: number; h: number }, m: TitleMetrics, o: FitOptions = {}): TitleFit {
  const outline = o.outline ?? 0.09;
  const extrude = o.extrude ?? 0.07;
  const lh = o.lineHeight ?? 0.92;
  const tilt = Math.abs(o.tilt ?? 0);
  const arc = Math.abs(o.arc ?? 0);
  const bias = o.lineBias ?? 1.12;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const maxLines = Math.max(1, Math.min(o.maxLines ?? 3, words || 1));
  const cos = Math.cos(tilt);
  const sin = Math.sin(tilt);
  let best: TitleFit | null = null;
  let bestScore = 0;
  for (let k = 1; k <= maxLines; k++) {
    const lines = splitTitle(text, k, m.measure);
    const wEm = Math.max(...lines.map(m.measure)) + 2 * outline;
    const hEm = (lines.length - 1) * lh + m.ascent + m.descent + 2 * outline + extrude + arc;
    // The tilted box: W' = W cos + H sin, H' = W sin + H cos (both linear in the size)
    const size = Math.max(1, Math.min(box.w / (wEm * cos + hEm * sin), box.h / (wEm * sin + hEm * cos)));
    const score = size / bias ** (lines.length - 1);
    if (!best || score > bestScore) {
      bestScore = score;
      const W = wEm * size;
      const H = hEm * size;
      best = { lines, size, width: W, height: H, fillW: (W * cos + H * sin) / box.w, fillH: (W * sin + H * cos) / box.h };
    }
  }
  return best!;
}

// --- The title's look ----------------------------------------------------------------------------------------------

/** The platform's display face for titles (Lilita One, SIL Open Font License: packages/art/fonts/OFL-LilitaOne.txt) */
export const COVER_FONT = 'GP Cover Display';
const FONT_URL = new URL('../fonts/lilita-one-latin.woff2', import.meta.url).href;

export interface ResolvedTitleStyle {
  text: string;
  font: string;
  weight: number | string;
  fill: string[];
  outline: string;
  extrude: string;
  glow: string;
  tilt: number;
  arc: number;
  upper: boolean;
}

/** The default lettering: warm gold to orange, a deep violet outline (never black), a golden glow */
export const DEFAULT_TITLE: Omit<ResolvedTitleStyle, 'text'> = {
  font: COVER_FONT,
  weight: 400,
  fill: ['#fffbe8', '#ffd84a', '#ff8a1f'],
  outline: '#2a0d3d',
  extrude: '#160622',
  glow: '#ffae3c',
  tilt: -0.05,
  arc: 0.06,
  upper: true,
};

/** A title style from a palette's roles: the fill from light to the hero's accent, the outline from the shadow tint */
export function titleStyleFrom(p: Palette): CoverTitleStyle {
  const deep = shade(mix(p.shadow, p.accent, 0.25), -0.55);
  return { fill: ['#ffffff', mix(p.light, p.accent, 0.35), p.accent], outline: deep, extrude: shade(deep, -0.5), glow: p.glow };
}

export function resolveTitle(title: string, s: CoverTitleStyle = {}): ResolvedTitleStyle {
  const own = !!s.font && s.font !== COVER_FONT;
  const outline = s.outline ?? DEFAULT_TITLE.outline;
  return {
    text: s.text ?? title,
    font: s.font ?? COVER_FONT,
    weight: s.weight ?? (own ? 900 : DEFAULT_TITLE.weight),
    fill: s.fill?.length ? s.fill : DEFAULT_TITLE.fill,
    outline,
    extrude: s.extrude ?? (s.outline ? shade(outline, -0.5) : DEFAULT_TITLE.extrude),
    glow: s.glow ?? DEFAULT_TITLE.glow,
    tilt: s.tilt ?? DEFAULT_TITLE.tilt,
    arc: s.arc ?? DEFAULT_TITLE.arc,
    upper: s.upper ?? !own,
  };
}

let fontLoad: Promise<void> | null = null;
/** Load the platform's display face (once), or wait for the game's own family */
export async function loadTitleFont(family: string, weight: number | string = 400): Promise<void> {
  if (typeof document === 'undefined') return;
  if (family === COVER_FONT) {
    fontLoad ??= new FontFace(COVER_FONT, `url(${FONT_URL})`)
      .load()
      .then((f) => void document.fonts.add(f))
      .catch(() => undefined);
    await fontLoad;
  } else await document.fonts.load(`${weight} 100px ${family}`).catch(() => undefined);
}

const canvas = (w: number, h: number): HTMLCanvasElement => Object.assign(document.createElement('canvas'), { width: Math.max(1, Math.round(w)), height: Math.max(1, Math.round(h)) });

export interface DrawnTitle {
  fit: TitleFit;
  lines: string[];
  /** Font size and cap height, px */
  size: number;
  cap: number;
  /** The title alone (fill, outline, extrusion) on a transparent layer of the cover's size, and its letters' fill only */
  layer: HTMLCanvasElement;
  fillMask: HTMLCanvasElement;
}

/**
 * Letter the title into `box` on `g` (a canvas of the cover's size): the fit, then the extrusion, the thick outline, the
 * gradient fill and the gloss on a layer, drawn with a glow and a drop shadow. Returns the layer and the letters' mask
 * (what `gp covers --check` measures the title with)
 */
export function drawTitle(g: CanvasRenderingContext2D, box: CoverRect, style: ResolvedTitleStyle): DrawnTitle {
  const W = g.canvas.width;
  const H = g.canvas.height;
  const text = style.upper ? style.text.toUpperCase() : style.text;
  const font = (px: number) => `${style.weight} ${px}px ${style.font === COVER_FONT ? `"${COVER_FONT}"` : style.font}, "Arial Black", Impact, sans-serif`;
  const probe = canvas(4, 4).getContext('2d')!;
  probe.font = font(100);
  const width = (s: string) => probe.measureText(s).width / 100;
  const tm = probe.measureText(text.replace(/\s+/g, ''));
  const ascent = Math.max(0.5, (tm.actualBoundingBoxAscent || 72) / 100);
  const descent = Math.max(0, (tm.actualBoundingBoxDescent || 0) / 100);
  const fitOpts = { tilt: style.tilt, arc: style.arc };
  const fit = fitTitle(text, box, { measure: width, ascent, descent }, fitOpts);
  const s = fit.size;
  const outlinePx = 0.09 * s;
  const extrudePx = 0.07 * s;
  const lh = 0.92 * s;
  const cap = ascent * s;
  // The block's letters, centred in the box: line i's baseline
  const blockH = (fit.lines.length - 1) * lh + cap + descent * s;
  const cx = box.x + box.w / 2;
  const cy = box.y + box.h / 2 - extrudePx / 2;
  type Glyph = { ch: string; x: number; y: number; rot: number; line: number };
  const glyphs: Glyph[] = [];
  fit.lines.forEach((line, i) => {
    const base = -blockH / 2 + cap + i * lh;
    const lw = width(line) * s;
    for (let j = 0; j < line.length; j++) {
      const ch = line[j]!;
      if (ch === ' ') continue;
      const pre = width(line.slice(0, j)) * s;
      const cw = width(ch) * s;
      const u = lw > 0 ? (pre + cw / 2) / lw : 0.5;
      const v = 2 * u - 1;
      // The arc: the line's middle rises by `arc` em, each letter turned along the curve
      const dy = -style.arc * s * (1 - v * v);
      const slope = lw > 0 ? (style.arc * s * 4 * v) / lw : 0;
      glyphs.push({ ch, x: -lw / 2 + pre + cw / 2, y: base + dy, rot: Math.atan(slope), line: i });
    }
  });
  const each = (c: CanvasRenderingContext2D, dx: number, dy: number, fn: (c: CanvasRenderingContext2D, gl: Glyph) => void) => {
    for (const gl of glyphs) {
      c.save();
      c.translate(cx, cy);
      c.rotate(style.tilt);
      c.translate(gl.x + dx, gl.y + dy);
      c.rotate(gl.rot);
      fn(c, gl);
      c.restore();
    }
  };
  const setup = (c: CanvasRenderingContext2D) => {
    c.font = font(s);
    c.textAlign = 'center';
    c.textBaseline = 'alphabetic';
    c.lineJoin = 'round';
    c.miterLimit = 2;
  };
  const layer = canvas(W, H);
  const L = layer.getContext('2d')!;
  setup(L);
  // 1. The extrusion: the outlined letters stacked downward in the deepest shade (a solid 3D block)
  const steps = Math.max(2, Math.min(14, Math.ceil(extrudePx / 1.5)));
  L.fillStyle = style.extrude;
  L.strokeStyle = style.extrude;
  L.lineWidth = outlinePx * 2;
  for (let k = steps; k >= 1; k--)
    each(L, 0, (extrudePx * k) / steps, (c, gl) => {
      c.strokeText(gl.ch, 0, 0);
      c.fillText(gl.ch, 0, 0);
    });
  // 2. The thick outline
  L.strokeStyle = style.outline;
  L.lineWidth = outlinePx * 2;
  each(L, 0, 0, (c, gl) => c.strokeText(gl.ch, 0, 0));
  // 3. The fill: a vertical gradient per letter, light at the top, saturated at the baseline
  const fillMask = canvas(W, H);
  const F = fillMask.getContext('2d')!;
  setup(F);
  const grad = (c: CanvasRenderingContext2D) => {
    const gr = c.createLinearGradient(0, -cap, 0, descent * s * 0.4);
    style.fill.forEach((col, i) => gr.addColorStop(style.fill.length === 1 ? 0 : i / (style.fill.length - 1), col));
    return gr;
  };
  each(L, 0, 0, (c, gl) => {
    c.fillStyle = grad(c);
    c.fillText(gl.ch, 0, 0);
  });
  F.fillStyle = '#fff';
  each(F, 0, 0, (c, gl) => c.fillText(gl.ch, 0, 0));
  // 4. The gloss: a white band over the letters' top 40 %, clipped to the letters
  const gloss = canvas(W, H);
  const G = gloss.getContext('2d')!;
  G.drawImage(fillMask, 0, 0);
  G.globalCompositeOperation = 'source-in';
  fit.lines.forEach((_, i) => {
    G.save();
    G.translate(cx, cy);
    G.rotate(style.tilt);
    const top = -blockH / 2 + i * lh - style.arc * s;
    const gr = G.createLinearGradient(0, top, 0, top + cap * 0.62 + style.arc * s);
    gr.addColorStop(0, 'rgba(255,255,255,0.75)');
    gr.addColorStop(0.55, 'rgba(255,255,255,0.28)');
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    G.fillStyle = gr;
    G.fillRect(-W, top - outlinePx, W * 2, cap * 0.62 + style.arc * s + outlinePx);
    G.restore();
  });
  L.drawImage(gloss, 0, 0);
  // 5. Onto the cover: a wide soft glow, then a drop shadow under the block
  g.save();
  g.shadowColor = alpha(style.glow, 0.7);
  g.shadowBlur = 0.35 * s;
  g.drawImage(layer, 0, 0);
  g.shadowColor = alpha(shade(style.extrude, -0.5), 0.75);
  g.shadowBlur = 0.12 * s;
  g.shadowOffsetY = 0.06 * s;
  g.drawImage(layer, 0, 0);
  g.restore();
  return { fit, lines: fit.lines, size: s, cap, layer, fillMask };
}

// --- The composer --------------------------------------------------------------------------------------------------

export interface ComposeOptions {
  w: number;
  h: number;
  variant?: CoverVariant;
  /** The game's title (style.text overrides it) */
  title: string;
}

export interface ComposedCover {
  canvas: HTMLCanvasElement;
  layout: CoverLayout;
  title: DrawnTitle;
  /** The hero alone (null: the game drew no hero layer) */
  heroLayer: HTMLCanvasElement | null;
  style: ResolvedTitleStyle;
}

/** Mean OKLab lightness of a zone of a canvas (sampled small) */
function zoneLightness(c: HTMLCanvasElement, r: CoverRect): number {
  const s = canvas(24, 24);
  const g = s.getContext('2d')!;
  g.drawImage(c, r.x, r.y, r.w, r.h, 0, 0, 24, 24);
  const d = g.getImageData(0, 0, 24, 24).data;
  let sum = 0;
  let n = 0;
  for (let i = 0; i < d.length; i += 4) {
    const a = d[i + 3]! / 255;
    if (a < 0.05) continue;
    sum += lightness(`rgb(${d[i]}, ${d[i + 1]}, ${d[i + 2]})`);
    n++;
  }
  return n ? sum / n : 0;
}

/**
 * The whole cover: the game's layers (scene, hero, front) composed with the platform's grade, the glow behind the hero,
 * its rim light and halo, the scrim behind the title, the vignette and the lettered title. The canvas is the cover
 */
export async function composeCover(art: CoverArt, o: ComposeOptions): Promise<ComposedCover> {
  const { w, h } = o;
  const layout = coverLayout(w, h, o.variant ?? 'hero');
  const style = resolveTitle(o.title, art.title);
  await loadTitleFont(style.font, style.weight);
  const rim = art.rim ?? style.glow;
  const layer = () => {
    const c = canvas(w, h);
    return { c, g: c.getContext('2d')! };
  };
  const scene = layer();
  await art.scene(scene.g, layout);
  const hero = art.hero ? layer() : null;
  if (hero) await art.hero!(hero.g, layout);
  const front = art.front ? layer() : null;
  if (front) await art.front!(front.g, layout);

  const out = layer();
  const g = out.g;
  // 0. Never a transparent hole: the deepest tone under everything
  g.fillStyle = style.extrude;
  g.fillRect(0, 0, w, h);
  // 1. The scene, graded: a little more saturation and contrast than the game (a cover competes with 50 others)
  g.filter = 'saturate(1.15) contrast(1.06)';
  g.drawImage(scene.c, 0, 0);
  g.filter = 'none';
  // 2. The scrim: the title's zone darkened in proportion to how bright the scene is there, so the outline always reads
  const t = layout.title;
  const lit = zoneLightness(scene.c, t);
  const scrim = g.createRadialGradient(t.x + t.w / 2, t.y + t.h / 2, 0, t.x + t.w / 2, t.y + t.h / 2, Math.max(t.w, t.h) * 0.62);
  const sa = Math.min(0.62, 0.22 + Math.max(0, lit - 0.35) * 0.9);
  scrim.addColorStop(0, alpha(style.extrude, sa));
  scrim.addColorStop(0.7, alpha(style.extrude, sa * 0.55));
  scrim.addColorStop(1, alpha(style.extrude, 0));
  g.fillStyle = scrim;
  g.fillRect(0, 0, w, h);
  // 3. The hero: a glow behind it, a dark separation shadow, a halo of the rim colour, the hero, its rim light
  if (hero) {
    const hb = layout.hero;
    const hx = hb.x + hb.w / 2;
    const hy = hb.y + hb.h * 0.45;
    const back = g.createRadialGradient(hx, hy, 0, hx, hy, Math.max(hb.w, hb.h) * 0.62);
    back.addColorStop(0, alpha(rim, 0.38));
    back.addColorStop(0.5, alpha(rim, 0.14));
    back.addColorStop(1, alpha(rim, 0));
    g.save();
    g.globalCompositeOperation = 'screen';
    g.fillStyle = back;
    g.fillRect(0, 0, w, h);
    g.restore();
    const u = layout.unit;
    // The silhouette in one colour (for the halo and the rim)
    const sil = (color: string) => {
      const l = layer();
      l.g.drawImage(hero.c, 0, 0);
      l.g.globalCompositeOperation = 'source-in';
      l.g.fillStyle = color;
      l.g.fillRect(0, 0, w, h);
      return l.c;
    };
    // Separation: a dark soft shadow under the hero, so it stands off any background
    g.save();
    g.filter = `blur(${Math.round(14 * u)}px)`;
    g.globalAlpha = 0.55;
    g.drawImage(sil(shade(style.extrude, -0.3)), 0, Math.round(10 * u));
    g.restore();
    // The silhouette grown by r px (drawn at 16 offsets round a circle: a cheap dilation)
    const grown = (color: string, r: number) => {
      const one = sil(color);
      const l = layer();
      for (let k = 0; k < 16; k++) l.g.drawImage(one, Math.cos((k / 16) * Math.PI * 2) * r, Math.sin((k / 16) * Math.PI * 2) * r);
      l.g.drawImage(one, 0, 0);
      return l.c;
    };
    // The halo: the grown silhouette in the rim colour, blurred — the glow that lifts the hero off the scene
    g.save();
    g.filter = `blur(${Math.round(16 * u)}px)`;
    g.globalAlpha = 0.8;
    g.drawImage(grown(rim, 16 * u), 0, 0);
    g.restore();
    // The sticker outline: a thick dark line round the whole figure, ≈ 1.5 px at thumbnail size, so the shape reads
    // against any background (the title's outline colour: one line weight for the cover)
    g.drawImage(grown(style.outline, Math.max(2, 8 * u)), 0, 0);
    // The rim light: a crescent on the side the light comes from, laid over the hero only
    const stack = layer();
    stack.g.drawImage(hero.c, 0, 0);
    const crescent = layer();
    crescent.g.drawImage(sil(mix(rim, '#ffffff', 0.45)), 0, 0);
    crescent.g.globalCompositeOperation = 'destination-out';
    const d = Math.max(2, 7 * u);
    crescent.g.drawImage(hero.c, -Math.cos(layout.light) * d, -Math.sin(layout.light) * d);
    stack.g.globalCompositeOperation = 'source-atop';
    stack.g.globalAlpha = 0.9;
    stack.g.drawImage(crescent.c, 0, 0);
    g.drawImage(stack.c, 0, 0);
  }
  // 4. The front layer
  if (front) g.drawImage(front.c, 0, 0);
  // 5. The vignette: the corners into the deepest tone (the eye goes to the middle and the title)
  const diag = Math.hypot(w, h) / 2;
  const vg = g.createRadialGradient(w / 2, h / 2, diag * 0.5, w / 2, h / 2, diag);
  vg.addColorStop(0, alpha(style.extrude, 0));
  vg.addColorStop(1, alpha(style.extrude, 0.55));
  g.fillStyle = vg;
  g.fillRect(0, 0, w, h);
  // 6. The title, last: nothing covers it
  const title = drawTitle(g, t, style);
  return { canvas: out.c, layout, title, heroLayer: hero?.c ?? null, style };
}

/** A layer's alpha at thumbnail size, as 0/1 per pixel (what the checker measures the title and the hero with) */
export function maskAt(c: HTMLCanvasElement, tw: number, th: number): Uint8Array {
  const s = canvas(tw, th);
  const g = s.getContext('2d')!;
  g.imageSmoothingQuality = 'high';
  g.drawImage(c, 0, 0, tw, th);
  const d = g.getImageData(0, 0, tw, th).data;
  const m = new Uint8Array(tw * th);
  for (let i = 0; i < m.length; i++) m[i] = d[i * 4 + 3]! >= 128 ? 1 : 0;
  return m;
}
