// Color math in a perceptual space (OKLab / OKLCH, Björn Ottosson 2020): even lightness steps, mixes that don't go grey
// in the middle, and hue-shifted shading — shadows lean cool (blue-violet), lights lean warm (yellow), as painters and
// pixel artists shade. Pure: no DOM, runs in Node (palette checks, tests).

/** [r, g, b, a]: 0–255 channels, alpha 0–1 */
export type Rgba = [number, number, number, number];
/** [L 0–1, C ≈0–0.37, h degrees] */
export type Lch = [number, number, number];

const clamp = (x: number, a = 0, b = 1) => (x < a ? a : x > b ? b : x);

/** The named colours parse() knows (CSS names; a palette should use its own hex values) */
export const NAMED: Record<string, Rgba> = {
  transparent: [0, 0, 0, 0],
  white: [255, 255, 255, 1],
  black: [0, 0, 0, 1],
  red: [255, 0, 0, 1],
  lime: [0, 255, 0, 1],
  green: [0, 128, 0, 1],
  blue: [0, 0, 255, 1],
  yellow: [255, 255, 0, 1],
  cyan: [0, 255, 255, 1],
  aqua: [0, 255, 255, 1],
  magenta: [255, 0, 255, 1],
  fuchsia: [255, 0, 255, 1],
  orange: [255, 165, 0, 1],
  purple: [128, 0, 128, 1],
  pink: [255, 192, 203, 1],
  gray: [128, 128, 128, 1],
  grey: [128, 128, 128, 1],
  silver: [192, 192, 192, 1],
  gold: [255, 215, 0, 1],
  navy: [0, 0, 128, 1],
  teal: [0, 128, 128, 1],
};

/** A number with an optional unit: '50%' → 0.5 × pct, '0.5' → 0.5 */
const num = (v: string, pct: number): number => (v.endsWith('%') ? (parseFloat(v) / 100) * pct : parseFloat(v));

function hueDeg(v: string): number {
  const n = parseFloat(v);
  if (v.endsWith('turn')) return n * 360;
  if (v.endsWith('grad')) return n * 0.9;
  if (v.endsWith('rad') && !v.endsWith('grad')) return (n * 180) / Math.PI;
  return n;
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = ((h % 360) + 360) % 360;
  s = clamp(s);
  l = clamp(l);
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => 255 * (l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1)));
  return [f(0), f(8), f(4)];
}

/** '#rgb', '#rgba', '#rrggbb', '#rrggbbaa', 'rgb()' / 'rgba()' / 'hsl()' / 'hsla()' (commas or spaces, `/ alpha`, % values), a NAMED colour → [r, g, b, a]; null if it isn't one */
export function tryParse(input: string): Rgba | null {
  const s = String(input).trim().toLowerCase();
  if (s[0] === '#') {
    let h = s.slice(1);
    if (!/^[0-9a-f]+$/.test(h) || ![3, 4, 6, 8].includes(h.length)) return null;
    if (h.length <= 4) h = [...h].map((c) => c + c).join('');
    const n = parseInt(h.slice(0, 6), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255, h.length === 8 ? parseInt(h.slice(6), 16) / 255 : 1];
  }
  const named = NAMED[s];
  if (named) return [...named];
  const m = s.match(/^(rgba?|hsla?)\(([^)]*)\)$/);
  if (!m) return null;
  const parts = m[2].split(/[\s,/]+/).filter(Boolean);
  if (parts.length < 3 || parts.length > 4) return null;
  const a = parts[3] === undefined ? 1 : clamp(num(parts[3], 1));
  let rgb: [number, number, number];
  if (m[1][0] === 'r') rgb = [num(parts[0], 255), num(parts[1], 255), num(parts[2], 255)];
  else rgb = hslToRgb(hueDeg(parts[0]), num(parts[1], 1) / (parts[1].endsWith('%') ? 1 : 100), num(parts[2], 1) / (parts[2].endsWith('%') ? 1 : 100));
  const out: Rgba = [clamp(rgb[0], 0, 255), clamp(rgb[1], 0, 255), clamp(rgb[2], 0, 255), a];
  return out.every((v) => Number.isFinite(v)) ? out : null;
}

const parsed = new Map<string, Rgba>();
const warned = new Set<string>();
/** What a colour parse() can't read becomes (a mid grey: visible, not alarming) */
const FALLBACK: Rgba = [128, 128, 128, 1];

/**
 * A CSS colour → [r, g, b, a] (the forms tryParse reads). Never throws — it runs in the frame loop: what it can't read
 * becomes a mid grey, with one console.warn per colour. Memoised (a palette's colours are parsed once, not per frame).
 */
export function parse(css: string): Rgba {
  const hit = parsed.get(css);
  if (hit) return [hit[0], hit[1], hit[2], hit[3]];
  let c = tryParse(css);
  if (!c) {
    if (warned.size < 32 && !warned.has(css)) {
      warned.add(css);
      console.warn(`@gp/art: not a colour: ${JSON.stringify(css)} (drawn grey). Use #hex, rgb(), hsl() or a basic name`);
    }
    c = [...FALLBACK];
  }
  if (parsed.size > 2048) parsed.clear();
  parsed.set(css, c);
  return [c[0], c[1], c[2], c[3]];
}

const h2 = (n: number) => Math.round(clamp(n, 0, 255)).toString(16).padStart(2, '0');

/** [r, g, b, a] → '#rrggbb' (alpha 1) or 'rgba(…)' */
export function css(c: Rgba | [number, number, number]): string {
  const a = c[3] ?? 1;
  if (a >= 1) return `#${h2(c[0])}${h2(c[1])}${h2(c[2])}`;
  return `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${+clamp(a).toFixed(3)})`;
}

const toLin = (v: number) => ((v /= 255) <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const fromLin = (v: number) => 255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);

/** sRGB → OKLab [L, a, b] */
export function oklab(c: string | Rgba): [number, number, number] {
  const [r0, g0, b0] = typeof c === 'string' ? parse(c) : c;
  const r = toLin(r0);
  const g = toLin(g0);
  const b = toLin(b0);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

/** OKLab → linear-free sRGB channels (may fall outside 0–255: see inGamut) */
function labToRgb(L: number, A: number, B: number): [number, number, number] {
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

const inGamut = (rgb: number[]) => rgb.every((v) => v >= -1e-4 && v <= 1.0001);

/** sRGB → OKLCH [L, C, h°] */
export function oklch(c: string | Rgba): Lch {
  const [L, a, b] = oklab(c);
  const h = (Math.atan2(b, a) * 180) / Math.PI;
  return [L, Math.hypot(a, b), h < 0 ? h + 360 : h];
}

/** OKLCH → '#rrggbb' (alpha → rgba), chroma reduced until the color fits sRGB (hue and lightness kept) */
export function fromOklch(L: number, C: number, h: number, alpha = 1): string {
  L = clamp(L);
  const hr = (h * Math.PI) / 180;
  let c = Math.max(0, C);
  let rgb = labToRgb(L, c * Math.cos(hr), c * Math.sin(hr));
  if (!inGamut(rgb)) {
    let lo = 0;
    let hi = c;
    for (let i = 0; i < 14; i++) {
      c = (lo + hi) / 2;
      rgb = labToRgb(L, c * Math.cos(hr), c * Math.sin(hr));
      if (inGamut(rgb)) lo = c;
      else hi = c;
    }
    rgb = labToRgb(L, lo * Math.cos(hr), lo * Math.sin(hr));
  }
  return css([fromLin(clamp(rgb[0])), fromLin(clamp(rgb[1])), fromLin(clamp(rgb[2])), alpha]);
}

/** A small memo for the colour maths drawn every frame (mix, shade: an OKLCH gamut bisection each): bounded, cleared when full */
const memo = new Map<string, string>();
function memoised(key: string, f: () => string): string {
  const hit = memo.get(key);
  if (hit !== undefined) return hit;
  const v = f();
  if (memo.size > 4096) memo.clear();
  memo.set(key, v);
  return v;
}

/** Mix two colors in OKLab (t = 0 → a, 1 → b); alpha mixes linearly */
export function mix(a: string, b: string, t: number): string {
  return memoised(`m${a}|${b}|${t}`, () => mixNow(a, b, t));
}

function mixNow(a: string, b: string, t: number): string {
  const pa = parse(a);
  const pb = parse(b);
  const la = oklab(pa);
  const lb = oklab(pb);
  const L = la[0] + (lb[0] - la[0]) * t;
  const A = la[1] + (lb[1] - la[1]) * t;
  const B = la[2] + (lb[2] - la[2]) * t;
  const rgb = labToRgb(L, A, B);
  return css([fromLin(clamp(rgb[0])), fromLin(clamp(rgb[1])), fromLin(clamp(rgb[2])), pa[3] + (pb[3] - pa[3]) * t]);
}

/** The same color at another opacity */
export function alpha(c: string, a: number): string {
  const p = parse(c);
  return css([p[0], p[1], p[2], a]);
}

/** WCAG relative luminance 0–1 */
export function luminance(c: string): number {
  const [r, g, b] = parse(c);
  return 0.2126 * toLin(r) + 0.7152 * toLin(g) + 0.0722 * toLin(b);
}

/** WCAG contrast ratio 1–21 */
export function contrast(a: string, b: string): number {
  const x = luminance(a);
  const y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

/** Perceptual lightness (OKLab L, 0–1): what the grayscale check compares */
export const lightness = (c: string): number => oklab(c)[0];

/** The color in grayscale (its OKLab lightness): squint at a palette with it */
export const gray = (c: string): string => fromOklch(lightness(c), 0, 0, parse(c)[3]);

/** Where shadows and lights lean (OKLCH hue): cool blue-violet and warm yellow-orange */
export const COOL_HUE = 275;
export const WARM_HUE = 80;

function towards(h: number, target: number, amt: number): number {
  const d = ((target - h + 540) % 360) - 180;
  return (h + d * clamp(amt) + 360) % 360;
}

/**
 * A hue-shifted shade: t < 0 darker (toward a cool hue, a bit more saturated in the mid-shadow, never grey or black),
 * t > 0 lighter (toward a warm hue, desaturated near white). t in −1…1; −1 is the deepest shadow, +1 nearly white.
 * `shift` scales the hue turn (0: plain lightness steps, 1: the default, 30° at the ends).
 */
export function shade(c: string, t: number, shift = 1): string {
  return memoised(`s${c}|${t}|${shift}`, () => shadeNow(c, t, shift));
}

function shadeNow(c: string, t: number, shift: number): string {
  const [L, C, h] = oklch(c);
  const a = parse(c)[3];
  const k = Math.abs(clamp(t, -1, 1));
  // A grey base turns with the light too: give it a little chroma to carry the hue
  const C0 = Math.max(C, 0.02 * shift);
  if (t < 0) {
    const L1 = L - (L - 0.08) * k * 0.92;
    const C1 = C0 * (1 + 0.35 * k - 0.55 * k * k) + 0.025 * k * shift;
    return fromOklch(L1, C1, towards(h, COOL_HUE, 0.33 * k * shift * (C < 0.03 ? 3 : 1)), a);
  }
  const L1 = L + (0.985 - L) * k;
  const C1 = C0 * (1 - 0.75 * k * k) + 0.015 * k * shift;
  return fromOklch(L1, C1, towards(h, WARM_HUE, 0.28 * k * shift * (C < 0.03 ? 3 : 1)), a);
}

/** n hue-shifted steps from deep shadow to highlight, the base in the middle (pixel-art ramps: 5 or 7) */
export function ramp(base: string, n = 5, spread = 0.8, shift = 1): string[] {
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0 : ((i / (n - 1)) * 2 - 1) * spread;
    out.push(t === 0 ? css(parse(base)) : shade(base, t, shift));
  }
  return out;
}
