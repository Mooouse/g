// Game type: bundled display faces instead of the system's (a reviewer reads Georgia, Segoe or system-ui as "a web
// app": Velvet Ledger, Frankengun), the platform's pixel font for all ten portal languages, and outlined numbers for
// the HUD. A face is its own module — only the faces a game imports land in its upload:
//
//   import { useFont, fontReady, drawNumber } from '@gp/art/type';
//   import { DELA_GOTHIC_ONE } from '@gp/art/type/dela-gothic-one';     // ≈ 17 KB: heavy, round-cornered display
//   import { NUNITO_BLACK } from '@gp/art/type/nunito-black';           // ≈ 22 KB: a friendly rounded sans
//   import { EXO_2 } from '@gp/art/type/exo-2';                         // ≈ 24 KB: technical, for sci-fi and HUDs
//   import { PIXEL } from '@gp/art/type/pixel';                         // made in code: capitals 5×7, ten languages
//
//   const display = useFont(DELA_GOTHIC_ONE);    // registers the face (once) and returns its CSS family with fallbacks
//   style.textContent = `#ui h1, #ui button { font-family: ${display}; }`;
//   screenTheme({ …, display });                 // @gp/core: the platform's screens wear it too
//   await fontReady(DELA_GOTHIC_ONE);            // before canvas text: the canvas never swaps a face in by itself
//   drawNumber(ctx, score, w - 16, 28, { font: EXO_2, size: 30, align: 'right', fill: ['#fff6d8', '#ffb84a'] });
//
// Every bundled face is cut to the letters of the ten languages (Latin, Latin-1, Latin Extended-A — Polish, Turkish —
// Cyrillic, the common punctuation and currency signs: GAME_CHARSET); anything else (CJK, emoji) falls back to the
// platform's FONT_FALLBACK, which useFont() puts after it. SIL Open Font License 1.1: packages/art/fonts/OFL-*.txt,
// the copyright and licence also inside each file. tools/subset-fonts.sh rebuilds them from the Google Fonts sources.

import { FONT_FALLBACK } from '@gp/core';
import { alpha, shade } from './color.ts';

export interface GameFont {
  /** The CSS family it registers as ("Dela Gothic One") */
  family: string;
  /** Its file: a URL (bundled: new URL('../../fonts/x.woff2', import.meta.url).href) or the bytes, made in code */
  source: string | (() => ArrayBuffer);
  /** FontFace weight: a range ('100 900') means one drawn weight serves them all, never a faked bold */
  weight?: string;
  style?: string;
  /** The weight to ask for in a canvas font string */
  drawWeight: number;
  /** What it looks like and is for (gp catalog, the docs) */
  what: string;
  /** Its licence (SPDX) and the licence file in packages/art/fonts */
  licence: string;
  licenceFile?: string;
  /** Pixel art: sizes in whole multiples of `pixelEm`, no smoothing */
  pixel?: boolean;
  /** For a pixel font, the font size at which one font pixel is one CSS px */
  pixelEm?: number;
}

/**
 * The characters every bundled face carries (the ten portal languages and more): tools/subset-fonts.sh cuts the files
 * to this list. As unicode ranges, for `--unicodes` and FontFace's unicodeRange
 */
export const GAME_CHARSET =
  'U+0020-007E, U+00A0-00FF, U+0100-017F, U+0218-021B, U+02C6, U+02DA, U+02DC, U+0400-045F, U+0490-0491, U+2000-206F, U+20AC, U+20BA, U+20BD, U+2116, U+2122, U+2190-2193, U+2212, U+221E, U+2248, U+2260, U+2264-2265';

/** Whether a character is in GAME_CHARSET (a check for a game's own strings) */
export function inGameCharset(ch: string): boolean {
  const c = ch.codePointAt(0) ?? 0;
  for (const part of GAME_CHARSET.split(',')) {
    const [a, b] = part.trim().slice(2).split('-').map((h) => parseInt(h, 16));
    if (c >= a && c <= (b ?? a)) return true;
  }
  return false;
}

const loads = new Map<string, Promise<boolean>>();
/** Families whose face is loaded and can draw on a canvas now */
const ready = new Set<string>();

/** The family as CSS: quoted, with the platform's fallbacks after it (CJK, emoji, whatever the face lacks) */
export const fontStack = (font: GameFont): string => `"${font.family}", ${FONT_FALLBACK}`;

/**
 * Register the face (once per page: a FontFace added to document.fonts, loading starts now) and return its CSS family
 * with the fallbacks. Safe in Node and without FontFace (the fallbacks then draw). DOM text swaps the face in when it
 * arrives; canvas text should wait for fontReady()
 */
export function useFont(font: GameFont): string {
  if (!loads.has(font.family)) loads.set(font.family, register(font));
  return fontStack(font);
}

async function register(font: GameFont): Promise<boolean> {
  if (typeof FontFace === 'undefined' || typeof document === 'undefined' || !document.fonts) return false;
  try {
    const src = typeof font.source === 'string' ? `url(${font.source}) format('woff2')` : font.source();
    const face = new FontFace(font.family, src, { weight: font.weight ?? 'normal', style: font.style ?? 'normal', display: 'swap' });
    document.fonts.add(face);
    await face.load();
    ready.add(font.family);
    return true;
  } catch (e) {
    console.warn(`[type] the font ${font.family} could not load: the fallback draws`, e);
    return false;
  }
}

/** Resolves true when the face can draw (registering it if needed), false when it failed or took over `timeoutMs` */
export function fontReady(font: GameFont, timeoutMs = 3000): Promise<boolean> {
  useFont(font);
  const load = loads.get(font.family)!;
  return Promise.race([load, new Promise<boolean>((r) => setTimeout(() => r(false), timeoutMs))]);
}

/** Whether the face has loaded (canvas text drawn now uses it) */
export const fontLoaded = (font: GameFont): boolean => ready.has(font.family);

/** A canvas font string: `${weight} ${size}px "Family", fallbacks` (the face registered on first use) */
export function canvasFont(font: GameFont | string, size: number, weight?: number | string): string {
  if (typeof font === 'string') return `${weight ?? 700} ${size}px ${font}`;
  useFont(font);
  return `${weight ?? font.drawWeight} ${size}px ${fontStack(font)}`;
}

export interface TextOptions {
  /** A face (registered on first use) or a CSS family string (default: the platform's fallbacks) */
  font?: GameFont | string;
  /** Font size in px (default 24) */
  size?: number;
  weight?: number | string;
  /** The fill: a colour, or colours top to bottom (a gradient across the letters' height) */
  fill?: string | readonly string[];
  /** The outline (default a deep hue-shifted shade of the fill — never black); null for none */
  outline?: string | null;
  /** Outline width as a share of the size (default 0.16) */
  outlineWidth?: number;
  /** A soft drop shadow under it: a colour, or null (default a dark tint of the outline) */
  shadow?: string | null;
  /** A glow behind it in this colour (default none) */
  glow?: string;
  align?: CanvasTextAlign;
  /** Where y is (default 'middle') */
  baseline?: CanvasTextBaseline;
  /** Extra space between letters, px */
  letterSpacing?: number;
}

const firstColor = (f: string | readonly string[]) => (typeof f === 'string' ? f : (f[0] ?? '#ffffff'));
const deepest = (f: string | readonly string[]) => (typeof f === 'string' ? f : (f[f.length - 1] ?? '#ffffff'));

/** Where the text's box is for the gradient: its top and bottom around y for the baseline */
function verticalBox(y: number, size: number, baseline: CanvasTextBaseline): [number, number] {
  if (baseline === 'top' || baseline === 'hanging') return [y, y + size];
  if (baseline === 'bottom' || baseline === 'ideographic') return [y - size, y];
  if (baseline === 'alphabetic') return [y - size * 0.78, y + size * 0.12];
  return [y - size * 0.5, y + size * 0.5];
}

/**
 * Game lettering on a canvas: a thick rounded outline in a deep shade of the fill, the fill (a colour or a vertical
 * gradient), a drop shadow, an optional glow. Returns the width drawn (px). For titles, banners, floating numbers
 */
export function drawText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, o: TextOptions = {}): number {
  const size = o.size ?? 24;
  const fill = o.fill ?? '#ffffff';
  const baseline = o.baseline ?? 'middle';
  ctx.save();
  ctx.font = o.font ? canvasFont(o.font, size, o.weight) : `${o.weight ?? 800} ${size}px ${FONT_FALLBACK}`;
  ctx.textAlign = o.align ?? 'left';
  ctx.textBaseline = baseline;
  if (o.letterSpacing) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${o.letterSpacing}px`;
  const outline = o.outline === null ? null : (o.outline ?? shade(deepest(fill), -0.82));
  const lw = size * (o.outlineWidth ?? 0.16);
  const shadow = o.shadow === null ? null : (o.shadow ?? alpha(shade(outline ?? deepest(fill), -0.4), 0.55));
  ctx.lineJoin = 'round';
  ctx.miterLimit = 2;
  if (o.glow) {
    ctx.shadowColor = o.glow;
    ctx.shadowBlur = size * 0.5;
    ctx.fillStyle = o.glow;
    ctx.fillText(text, x, y);
    ctx.shadowBlur = 0;
  }
  if (shadow) {
    ctx.fillStyle = shadow;
    ctx.strokeStyle = shadow;
    ctx.lineWidth = lw;
    const dy = Math.max(1, size * 0.07);
    if (outline) ctx.strokeText(text, x, y + dy);
    ctx.fillText(text, x, y + dy);
  }
  if (outline) {
    ctx.strokeStyle = outline;
    ctx.lineWidth = lw;
    ctx.strokeText(text, x, y);
  }
  if (typeof fill === 'string' || fill.length < 2) ctx.fillStyle = firstColor(fill);
  else {
    const [top, bottom] = verticalBox(y, size, baseline);
    const g = ctx.createLinearGradient(0, top, 0, bottom);
    fill.forEach((c, i) => g.addColorStop(i / (fill.length - 1), c));
    ctx.fillStyle = g;
  }
  ctx.fillText(text, x, y);
  const w = ctx.measureText(text).width;
  ctx.restore();
  return w;
}

export interface NumberOptions extends TextOptions {
  /** Every digit in the same width, so a counting number doesn't shake (default true) */
  tabular?: boolean;
  /** How a number reads (default: thousands grouped with a thin space, "12 345") */
  format?: (n: number) => string;
}

/** Digit widths per canvas font: the widest digit's advance */
const digitW = new Map<string, number>();

const groupThousands = (n: number) => {
  const s = String(Math.round(n));
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, '\u2009');
};

/**
 * An outlined HUD number (the score, coins, a damage pop): game lettering whose digits keep one width, so it reads at a
 * glance while it counts. `value` is a number (formatted) or the text to draw. Returns the width drawn
 */
export function drawNumber(ctx: CanvasRenderingContext2D, value: number | string, x: number, y: number, o: NumberOptions = {}): number {
  const text = typeof value === 'number' ? (o.format ?? groupThousands)(value) : value;
  const fill = o.fill ?? NUMBER_FILL;
  if (o.tabular === false) return drawText(ctx, text, x, y, { ...o, fill });
  const size = o.size ?? 24;
  ctx.save();
  const font = o.font ? canvasFont(o.font, size, o.weight) : `${o.weight ?? 800} ${size}px ${FONT_FALLBACK}`;
  ctx.font = font;
  // The widest digit's advance, per font — measured again once the face has arrived (before, it is the fallback's)
  const key = `${font}|${typeof o.font === 'object' && fontLoaded(o.font) ? 1 : 0}`;
  let dw = digitW.get(key);
  if (dw === undefined) {
    dw = Math.max(...'0123456789'.split('').map((d) => ctx.measureText(d).width));
    digitW.set(key, dw);
  }
  const chars = [...text];
  const cells = chars.map((ch) => (ch >= '0' && ch <= '9' ? dw : ctx.measureText(ch).width));
  const gap = o.letterSpacing ?? 0;
  const total = cells.reduce((a, b) => a + b, 0) + gap * Math.max(0, cells.length - 1);
  ctx.restore();
  const align = o.align ?? 'left';
  const x0 = align === 'center' ? x - total / 2 : align === 'right' || align === 'end' ? x - total : x;
  const outline = o.outline === null ? null : (o.outline ?? shade(deepest(fill), -0.82));
  const shadow = o.shadow === null ? null : (o.shadow ?? alpha(shade(outline ?? deepest(fill), -0.4), 0.55));
  // Each character centred in its cell; the outlines and the shadow of all first, then the fills, so one letter's
  // outline never cuts into the next one's fill
  const pass = (only: Partial<TextOptions>) => {
    let px = x0;
    chars.forEach((ch, i) => {
      drawText(ctx, ch, px + cells[i] / 2, y, { ...o, ...only, align: 'center', letterSpacing: 0 });
      px += cells[i] + gap;
    });
  };
  pass({ fill: 'rgba(0, 0, 0, 0)', outline, shadow });
  pass({ fill, outline: null, shadow: null, glow: undefined });
  return total;
}

/** The default fill of a HUD number: white to warm gold */
export const NUMBER_FILL: readonly string[] = ['#ffffff', '#ffd76a'];

/**
 * CSS for outlined numbers in the DOM (a coin counter, a results score): the face, tabular digits, an outline ring
 * and a drop shadow from text-shadow (drawn the same in every browser). `.gp-num` by default:
 * style.textContent += numberCss({ font: EXO_2, color: '#ffe08a' })
 */
export function numberCss(o: { font?: GameFont | string; color?: string; outline?: string; width?: number; selector?: string } = {}): string {
  const color = o.color ?? '#ffffff';
  const outline = o.outline ?? shade(color, -0.65);
  const w = o.width ?? 2;
  const ring: string[] = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    ring.push(`${(Math.cos(a) * w).toFixed(2)}px ${(Math.sin(a) * w).toFixed(2)}px 0 ${outline}`);
  }
  ring.push(`0 ${w + 1.5}px 0 ${outline}`, `0 ${w + 3}px 6px ${alpha('#000000', 0.35)}`);
  const family = o.font ? (typeof o.font === 'string' ? o.font : useFont(o.font)) : 'inherit';
  return `${o.selector ?? '.gp-num'} { font-family: ${family}; font-variant-numeric: tabular-nums; color: ${color}; text-shadow: ${ring.join(', ')}; letter-spacing: 0.02em; }`;
}
