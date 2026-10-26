// The platform's pixel font, "GP Pixel": capitals 5×7 on a 12-row em (2 rows of accents above, 2 of descenders below),
// drawn here as rows of '#', for all ten portal languages (en es pt-BR fr de ru tr it pl id: Latin with every accent
// they use, ß Ł Œ Æ, Turkish İ ı Ğ Ş, the whole Russian and Ukrainian alphabet) — lowercase reads as capitals, the way
// arcade fonts do. Two uses of the same glyphs:
// - the DOM: a real TrueType font built from them in code (buildPixelTtf) and added with FontFace — useFont(PIXEL)
//   and every screen reads in pixels; sharp at font sizes in whole multiples of 12 px (PIXEL.pixelEm);
// - the canvas: drawPixelText() blits the glyphs 1:1 into a low-resolution frame (crisp at any whole scale).
// No font file and no licence of anyone else's: our own code (generalised from Swarm Smash, QmaCyber/game20, font.ts),
// a few KB in the bundle. PIXEL_ICONS are pixel pictures in the private use area for text in the same font.

import type { GameFont } from '../type.ts';

type Rows = readonly string[];
interface Glyph {
  rows: Rows;
  /** Two rows under the baseline (Ц Щ Д Ą Ç , ;) */
  desc?: Rows;
  /** Two rows above the capitals (accents); composed glyphs get them from MARKS */
  above?: Rows;
}

const G: Record<string, Glyph> = {};
const def = (chars: string, rows: Rows, extra: Partial<Glyph> = {}) => {
  for (const c of chars) G[c] = { rows, ...extra };
};

// --- Latin capitals
def('A', ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#']);
def('B', ['####.', '#...#', '#...#', '####.', '#...#', '#...#', '####.']);
def('C', ['.###.', '#...#', '#....', '#....', '#....', '#...#', '.###.']);
def('D', ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.']);
def('E', ['#####', '#....', '#....', '####.', '#....', '#....', '#####']);
def('F', ['#####', '#....', '#....', '####.', '#....', '#....', '#....']);
def('G', ['.###.', '#...#', '#....', '#.###', '#...#', '#...#', '.####']);
def('H', ['#...#', '#...#', '#...#', '#####', '#...#', '#...#', '#...#']);
def('I', ['###', '.#.', '.#.', '.#.', '.#.', '.#.', '###']);
def('J', ['..###', '...#.', '...#.', '...#.', '#..#.', '#..#.', '.##..']);
def('K', ['#...#', '#..#.', '#.#..', '##...', '#.#..', '#..#.', '#...#']);
def('L', ['#....', '#....', '#....', '#....', '#....', '#....', '#####']);
def('M', ['#...#', '##.##', '#.#.#', '#.#.#', '#...#', '#...#', '#...#']);
def('N', ['#...#', '##..#', '#.#.#', '#..##', '#...#', '#...#', '#...#']);
def('O', ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.']);
def('P', ['####.', '#...#', '#...#', '####.', '#....', '#....', '#....']);
def('Q', ['.###.', '#...#', '#...#', '#...#', '#.#.#', '#..#.', '.##.#']);
def('R', ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#']);
def('S', ['.####', '#....', '#....', '.###.', '....#', '....#', '####.']);
def('T', ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..']);
def('U', ['#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.']);
def('V', ['#...#', '#...#', '#...#', '#...#', '.#.#.', '.#.#.', '..#..']);
def('W', ['#...#', '#...#', '#...#', '#.#.#', '#.#.#', '##.##', '#...#']);
def('X', ['#...#', '#...#', '.#.#.', '..#..', '.#.#.', '#...#', '#...#']);
def('Y', ['#...#', '#...#', '.#.#.', '..#..', '..#..', '..#..', '..#..']);
def('Z', ['#####', '....#', '...#.', '..#..', '.#...', '#....', '#####']);
def('ß', ['.##..', '#..#.', '#..#.', '#.##.', '#...#', '#...#', '#.##.']);
def('Ł', ['.#...', '.#...', '.#.#.', '.##..', '##...', '.#...', '.####']);
def('Æ', ['.####', '#.#..', '#.#..', '#####', '#.#..', '#.#..', '#.###']);
def('Œ', ['.####', '#.#..', '#.#..', '#.###', '#.#..', '#.#..', '.####']);
def('Ø', ['.###.', '#..##', '#.#.#', '#.#.#', '#.#.#', '##..#', '.###.']);

// --- Digits
def('0', ['.###.', '#...#', '#..##', '#.#.#', '##..#', '#...#', '.###.']);
def('1', ['.#.', '##.', '.#.', '.#.', '.#.', '.#.', '###']);
def('2', ['.###.', '#...#', '....#', '...#.', '..#..', '.#...', '#####']);
def('3', ['####.', '....#', '....#', '.###.', '....#', '....#', '####.']);
def('4', ['...#.', '..##.', '.#.#.', '#..#.', '#####', '...#.', '...#.']);
def('5', ['#####', '#....', '####.', '....#', '....#', '#...#', '.###.']);
def('6', ['.###.', '#....', '#....', '####.', '#...#', '#...#', '.###.']);
def('7', ['#####', '....#', '...#.', '..#..', '.#...', '.#...', '.#...']);
def('8', ['.###.', '#...#', '#...#', '.###.', '#...#', '#...#', '.###.']);
def('9', ['.###.', '#...#', '#...#', '.####', '....#', '....#', '.###.']);

// --- Cyrillic capitals (the shapes Latin shares are mapped below)
def('Б', ['#####', '#....', '#....', '####.', '#...#', '#...#', '####.']);
def('Г', ['#####', '#....', '#....', '#....', '#....', '#....', '#....']);
def('Ґ', ['....#', '#####', '#....', '#....', '#....', '#....', '#....']);
def('Д', ['..##.', '.#.#.', '.#.#.', '.#.#.', '.#.#.', '#####', '#...#']);
def('Ж', ['#.#.#', '#.#.#', '.###.', '..#..', '.###.', '#.#.#', '#.#.#']);
def('З', ['.###.', '#...#', '....#', '..##.', '....#', '#...#', '.###.']);
def('И', ['#...#', '#...#', '#..##', '#.#.#', '##..#', '#...#', '#...#']);
def('Л', ['..###', '.#..#', '.#..#', '.#..#', '.#..#', '.#..#', '#...#']);
def('П', ['#####', '#...#', '#...#', '#...#', '#...#', '#...#', '#...#']);
def('У', ['#...#', '#...#', '#...#', '.####', '....#', '....#', '.###.']);
def('Ф', ['..#..', '.###.', '#.#.#', '#.#.#', '.###.', '..#..', '..#..']);
def('Ц', ['#..#.', '#..#.', '#..#.', '#..#.', '#..#.', '#..#.', '#####'], { desc: ['....#', '.....'] });
def('Ч', ['#...#', '#...#', '#...#', '.####', '....#', '....#', '....#']);
def('Ш', ['#...#', '#...#', '#.#.#', '#.#.#', '#.#.#', '#.#.#', '#####']);
def('Щ', ['#...#.', '#...#.', '#.#.#.', '#.#.#.', '#.#.#.', '#.#.#.', '######'], { desc: ['.....#', '......'] });
def('Ъ', ['##...', '.#...', '.#...', '.###.', '.#..#', '.#..#', '.###.']);
def('Ы', ['#...#', '#...#', '#...#', '###.#', '#.#.#', '#.#.#', '###.#']);
def('Ь', ['#....', '#....', '#....', '####.', '#...#', '#...#', '####.']);
def('Э', ['.###.', '#...#', '....#', '..###', '....#', '#...#', '.###.']);
def('Ю', ['#..#.', '#.#.#', '#.#.#', '###.#', '#.#.#', '#.#.#', '#..#.']);
def('Я', ['.####', '#...#', '#...#', '.####', '..#.#', '.#..#', '#...#']);
def('Є', ['.###.', '#...#', '#....', '###..', '#....', '#...#', '.###.']);

// --- Punctuation and signs
def(' ', ['...', '...', '...', '...', '...', '...', '...']);
def('.', ['.', '.', '.', '.', '.', '.', '#']);
def(',', ['.', '.', '.', '.', '.', '.', '#'], { desc: ['#', '.'] });
def(':', ['.', '.', '#', '.', '.', '.', '#']);
def(';', ['.', '.', '#', '.', '.', '.', '#'], { desc: ['#', '.'] });
def('!', ['#', '#', '#', '#', '#', '.', '#']);
def('¡', ['#', '.', '#', '#', '#', '#', '#']);
def('?', ['.###.', '#...#', '....#', '...#.', '..#..', '.....', '..#..']);
def('¿', ['..#..', '.....', '..#..', '.#...', '#....', '#...#', '.###.']);
def("'’‘", ['#', '#', '.', '.', '.', '.', '.']);
def('"“”„', ['#.#', '#.#', '...', '...', '...', '...', '...']);
def('-', ['...', '...', '...', '###', '...', '...', '...']);
def('–—−', ['.....', '.....', '.....', '#####', '.....', '.....', '.....']);
def('_', ['....', '....', '....', '....', '....', '....', '####']);
def('+', ['.....', '..#..', '..#..', '#####', '..#..', '..#..', '.....']);
def('=', ['....', '....', '####', '....', '####', '....', '....']);
def('/', ['....#', '....#', '...#.', '..#..', '.#...', '#....', '#....']);
def('\\', ['#....', '#....', '.#...', '..#..', '...#.', '....#', '....#']);
def('(', ['.#', '#.', '#.', '#.', '#.', '#.', '.#']);
def(')', ['#.', '.#', '.#', '.#', '.#', '.#', '#.']);
def('[', ['##', '#.', '#.', '#.', '#.', '#.', '##']);
def(']', ['##', '.#', '.#', '.#', '.#', '.#', '##']);
def('%', ['##..#', '##..#', '...#.', '..#..', '.#...', '#..##', '#..##']);
def('×', ['.....', '.....', '#...#', '.#.#.', '..#..', '.#.#.', '#...#']);
def('·•', ['..', '..', '..', '##', '##', '..', '..']);
def('#', ['.#.#.', '.#.#.', '#####', '.#.#.', '#####', '.#.#.', '.#.#.']);
def('&', ['.##..', '#..#.', '#.#..', '.#...', '#.#.#', '#..#.', '.##.#']);
def('<', ['...#', '..#.', '.#..', '#...', '.#..', '..#.', '...#']);
def('>', ['#...', '.#..', '..#.', '...#', '..#.', '.#..', '#...']);
def('«', ['.....', '..#.#', '.#.#.', '#.#..', '.#.#.', '..#.#', '.....']);
def('»', ['.....', '#.#..', '.#.#.', '..#.#', '.#.#.', '#.#..', '.....']);
def('…', ['.....', '.....', '.....', '.....', '.....', '.....', '#.#.#']);
def('*', ['.....', '#.#.#', '.###.', '#####', '.###.', '#.#.#', '.....']);
def('$', ['..#..', '.####', '#.#..', '.###.', '..#.#', '####.', '..#..']);
def('€', ['..###', '.#...', '####.', '.#...', '####.', '.#...', '..###']);
def('@', ['.###.', '#...#', '#.###', '#.#.#', '#.###', '#....', '.####']);
def('№', ['#..#...', '##.#...', '#.##.#.', '#..#.#.', '#..#...', '#..#.##', '#..#...']);
def('°', ['.#.', '#.#', '.#.', '...', '...', '...', '...']);
def('→', ['.......', '....#..', '.....#.', '#######', '.....#.', '....#..', '.......']);
def('←', ['.......', '..#....', '.#.....', '#######', '.#.....', '..#....', '.......']);
def('↑', ['..#..', '.###.', '#.#.#', '..#..', '..#..', '..#..', '..#..']);
def('↓', ['..#..', '..#..', '..#..', '..#..', '#.#.#', '.###.', '..#..']);
def('≈', ['.....', '.....', '.#..#', '#.##.', '.#..#', '#.##.', '.....']);

// --- Pixel pictures for text in this font, in the private use area (coloured by the text around them)
const PICTURES: Record<string, Rows> = {
  coin: ['.###.', '#.#.#', '#.#.#', '#.#.#', '#.#.#', '#.#.#', '.###.'],
  gem: ['.###.', '#...#', '#####', '.#.#.', '.#.#.', '..#..', '.....'],
  bolt: ['...##', '..##.', '.##..', '#####', '..##.', '.##..', '##...'],
  heart: ['.......', '.##.##.', '#######', '#######', '.#####.', '..###..', '...#...'],
  shield: ['#####', '#####', '#####', '#####', '.###.', '.###.', '..#..'],
  star: ['...#...', '..###..', '#######', '.#####.', '..###..', '.##.##.', '.#...#.'],
  lock: ['.###.', '#...#', '#...#', '#####', '##.##', '##.##', '#####'],
  check: ['.....', '....#', '...#.', '#.#..', '.#...', '.....', '.....'],
  close: ['.....', '#...#', '.#.#.', '..#..', '.#.#.', '#...#', '.....'],
  gear: ['..#..', '#####', '##.##', '#...#', '##.##', '#####', '..#..'],
  skull: ['.###.', '#####', '#.#.#', '#####', '.###.', '.#.#.', '.....'],
  target: ['..#..', '.#.#.', '#...#', '##.##', '#...#', '.#.#.', '..#..'],
  play: ['#....', '##...', '###..', '####.', '###..', '##...', '#....'],
  up: ['..#..', '.###.', '#####', '..#..', '..#..', '..#..', '.....'],
  down: ['.......', '.......', '#######', '.#####.', '..###..', '...#...', '.......'],
  left: ['....#', '...##', '..###', '.####', '..###', '...##', '....#'],
  right: ['#....', '##...', '###..', '####.', '###..', '##...', '#....'],
  clock: ['.###.', '#.#.#', '#.#.#', '#.###', '#...#', '#...#', '.###.'],
};
/** The pictures' characters: `${PIXEL_ICONS.coin} 150` in a string drawn with the pixel font (canvas or DOM) */
export const PIXEL_ICONS = Object.fromEntries(Object.keys(PICTURES).map((k, i) => [k, String.fromCharCode(0xe000 + i)])) as Record<keyof typeof PICTURES, string>;
for (const [k, rows] of Object.entries(PICTURES)) def(PIXEL_ICONS[k as keyof typeof PICTURES], rows);

// --- Composed letters: a base and a mark (above, or below in the descender)
const MARKS: Record<string, Rows> = {
  acute: ['..#', '.#.'],
  grave: ['#..', '.#.'],
  circ: ['.#.', '#.#'],
  diaer: ['...', '#.#'],
  tilde: ['.#.#', '#.#.'],
  ring: ['.#.', '#.#'],
  dot: ['.', '#'],
  breve: ['#.#', '.#.'],
  caron: ['#.#', '.#.'],
};
const BELOW: Record<string, Rows> = { cedilla: ['.#.', '#..'], ogonek: ['...#', '....#'], comma: ['.#.', '#..'] };
const compose = (pairs: [string, string, string][]) => {
  for (const [ch, base, mark] of pairs) {
    const b = G[base];
    if (MARKS[mark]) G[ch] = { rows: b.rows, desc: b.desc, above: MARKS[mark] };
    else G[ch] = { rows: b.rows, desc: BELOW[mark] };
  }
};
compose([
  ['À', 'A', 'grave'], ['Á', 'A', 'acute'], ['Â', 'A', 'circ'], ['Ã', 'A', 'tilde'], ['Ä', 'A', 'diaer'], ['Å', 'A', 'ring'], ['Ą', 'A', 'ogonek'], ['Ă', 'A', 'breve'],
  ['Ç', 'C', 'cedilla'], ['Ć', 'C', 'acute'], ['Č', 'C', 'caron'],
  ['È', 'E', 'grave'], ['É', 'E', 'acute'], ['Ê', 'E', 'circ'], ['Ë', 'E', 'diaer'], ['Ę', 'E', 'ogonek'], ['Ě', 'E', 'caron'],
  ['Ğ', 'G', 'breve'],
  ['Ì', 'I', 'grave'], ['Í', 'I', 'acute'], ['Î', 'I', 'circ'], ['Ï', 'I', 'diaer'], ['İ', 'I', 'dot'],
  ['Ñ', 'N', 'tilde'], ['Ń', 'N', 'acute'], ['Ň', 'N', 'caron'],
  ['Ò', 'O', 'grave'], ['Ó', 'O', 'acute'], ['Ô', 'O', 'circ'], ['Õ', 'O', 'tilde'], ['Ö', 'O', 'diaer'],
  ['Ř', 'R', 'caron'],
  ['Ś', 'S', 'acute'], ['Ş', 'S', 'cedilla'], ['Š', 'S', 'caron'], ['Ș', 'S', 'comma'],
  ['Ț', 'T', 'comma'],
  ['Ù', 'U', 'grave'], ['Ú', 'U', 'acute'], ['Û', 'U', 'circ'], ['Ü', 'U', 'diaer'], ['Ů', 'U', 'ring'],
  ['Ÿ', 'Y', 'diaer'], ['Ý', 'Y', 'acute'],
  ['Ź', 'Z', 'acute'], ['Ż', 'Z', 'dot'], ['Ž', 'Z', 'caron'],
  ['Ё', 'E', 'diaer'], ['Й', 'И', 'breve'], ['Ї', 'I', 'diaer'], ['Ў', 'У', 'breve'],
]);
// Cyrillic letters that look like Latin ones
for (const [cy, la] of [['А', 'A'], ['В', 'B'], ['Е', 'E'], ['К', 'K'], ['М', 'M'], ['Н', 'H'], ['О', 'O'], ['Р', 'P'], ['С', 'C'], ['Т', 'T'], ['Х', 'X'], ['І', 'I'], ['Ѕ', 'S'], ['Ј', 'J']] as const)
  G[cy] = G[la];

/** A character's glyph: its own, or its capital's (lowercase reads as capitals), or none */
function glyphFor(ch: string): Glyph | undefined {
  if (G[ch]) return G[ch];
  if (ch === 'ı' || ch === 'i') return G.I;
  if (ch === 'ß') return G['ß'];
  const up = ch.toUpperCase();
  if (up.length === 1 && G[up]) return G[up];
  return undefined;
}

/** A glyph's width in pixels (the advance adds one column of space) */
const widthOf = (g: Glyph) => Math.max(g.rows[0].length, ...(g.above ?? []).map((r) => r.length));
/** Rows in the em: 2 for accents, 7 for the capitals, 1 under them, 2 for descenders */
export const PIXEL_ROWS = 12;

// --- Canvas text: glyphs blitted into a low-resolution frame

export interface PixelGlyph {
  w: number;
  /** Lit pixels as [x, y] with y from the top of the em (accents at 0–1, capitals at 3–9, descenders 10–11) */
  px: [number, number][];
}
const cache = new Map<string, PixelGlyph | null>();
/** One PixelGlyph per drawing: "a" and "A", "О" and "O" share theirs (and one glyph in the TrueType font) */
const byDef = new Map<Glyph, PixelGlyph>();

/** The pixels of a character (null: the font doesn't have it; drawPixelText draws "?") */
export function pixelGlyph(ch: string): PixelGlyph | null {
  if (cache.has(ch)) return cache.get(ch)!;
  const g = glyphFor(ch);
  let out: PixelGlyph | null = g ? (byDef.get(g) ?? null) : null;
  if (g && !out) {
    const w = widthOf(g);
    const px: [number, number][] = [];
    const put = (rows: Rows | undefined, y0: number) => {
      if (!rows) return;
      rows.forEach((r, y) => {
        const off = Math.floor((w - r.length) / 2);
        for (let x = 0; x < r.length; x++) if (r[x] === '#') px.push([x + off, y0 + y]);
      });
    };
    put(g.above, 0);
    put(g.rows, 3);
    put(g.desc, 10);
    out = { w, px };
    byDef.set(g, out);
  }
  cache.set(ch, out);
  return out;
}

/** Whether the font draws `ch` (its own glyph, or its capital's) */
export const hasPixelGlyph = (ch: string): boolean => pixelGlyph(ch) !== null;

/** Width in pixels of a line of text at a scale */
export function pixelTextWidth(text: string, scale = 1): number {
  let w = 0;
  for (const ch of text) {
    const g = pixelGlyph(ch) ?? pixelGlyph('?')!;
    w += (g.w + 1) * scale;
  }
  return Math.max(0, w - scale);
}

export interface PixelTextOptions {
  /** Whole canvas pixels per font pixel (default 1) */
  scale?: number;
  align?: 'left' | 'center' | 'right';
  /** The same text one pixel down first: a pixel drop shadow */
  shadow?: string;
  /** A one-pixel ring around the letters */
  outline?: string;
}

/**
 * Draw text on a canvas at whole pixels: (x, y) is the top of the capitals (the em's row 3). Returns the width drawn.
 * For a crisp look, draw into a low-resolution canvas (or at a whole scale) with imageSmoothingEnabled off
 */
export function drawPixelText(g: CanvasRenderingContext2D, text: string, x: number, y: number, color: string, o: PixelTextOptions = {}): number {
  const s = Math.max(1, Math.round(o.scale ?? 1));
  const w = pixelTextWidth(text, s);
  const cx = Math.round(o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x);
  const top = Math.round(y) - 3 * s;
  const pass = (dx: number, dy: number, col: string) => {
    g.fillStyle = col;
    let px0 = cx;
    for (const ch of text) {
      const gl = pixelGlyph(ch) ?? pixelGlyph('?')!;
      for (const [gx, gy] of gl.px) g.fillRect(px0 + gx * s + dx, top + gy * s + dy, s, s);
      px0 += (gl.w + 1) * s;
    }
  };
  if (o.outline) for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]]) pass(dx * s, dy * s, o.outline);
  if (o.shadow) pass(0, s, o.shadow);
  pass(0, 0, color);
  return w;
}

// --- The TrueType font for the DOM (built once, ≈ 20 KB in memory, nothing fetched)

class Bin {
  b: number[] = [];
  u8(v: number) {
    this.b.push(v & 255);
    return this;
  }
  u16(v: number) {
    this.b.push((v >> 8) & 255, v & 255);
    return this;
  }
  i16(v: number) {
    return this.u16(v < 0 ? v + 65536 : v);
  }
  u32(v: number) {
    this.b.push((v >>> 24) & 255, (v >>> 16) & 255, (v >>> 8) & 255, v & 255);
    return this;
  }
  tag(t: string) {
    for (let i = 0; i < 4; i++) this.u8(t.charCodeAt(i));
    return this;
  }
  pad() {
    while (this.b.length % 4) this.b.push(0);
    return this;
  }
}
const sum32 = (b: number[]) => {
  let s = 0;
  for (let i = 0; i < b.length; i += 4) s = (s + (((b[i] << 24) | ((b[i + 1] ?? 0) << 16) | ((b[i + 2] ?? 0) << 8) | (b[i + 3] ?? 0)) >>> 0)) >>> 0;
  return s;
};

/** Every character the font draws, lowercase included (mapped to its capital), sorted by code */
export function pixelCharset(): string[] {
  const set = new Set<string>(Object.keys(G));
  for (const ch of Object.keys(G)) {
    const lo = ch.toLowerCase();
    if (lo.length === 1 && lo !== ch) set.add(lo);
  }
  for (const ch of ['ı', 'i', 'ß', ' ']) set.add(ch);
  return [...set].filter((c) => c.length === 1 && c.charCodeAt(0) <= 0xffff).sort((a, b) => a.charCodeAt(0) - b.charCodeAt(0));
}

/**
 * Build the TrueType font: one contour per run of lit pixels (merged down rows of the same span), 100 units a pixel,
 * em 1200 (12 rows). Tables: cmap (format 4), glyf, head, hhea, hmtx, loca, maxp, name, OS/2, post.
 */
export function buildPixelTtf(family = PIXEL_FAMILY): ArrayBuffer {
  const U = 100;
  const chars = pixelCharset();
  type Gl = { adv: number; rects: [number, number, number, number][] };
  const glyphs: Gl[] = [{ adv: 6 * U, rects: [[0, 0, 5 * U, 7 * U]] }]; // .notdef: a block
  const gid = new Map<string, number>();
  const byGlyph = new Map<PixelGlyph, number>();
  for (const ch of chars) {
    const pg = pixelGlyph(ch);
    if (!pg) continue;
    if (byGlyph.has(pg)) {
      gid.set(ch, byGlyph.get(pg)!);
      continue;
    }
    // Rows of runs → rectangles (font units, y up from the baseline: em row r → baseline - (r - 9))
    const grid = new Map<number, Set<number>>();
    for (const [x, y] of pg.px) {
      if (!grid.has(y)) grid.set(y, new Set());
      grid.get(y)!.add(x);
    }
    const runs: { y: number; x0: number; x1: number }[] = [];
    for (const [y, xs] of [...grid].sort((a, b) => a[0] - b[0])) {
      const sorted = [...xs].sort((a, b) => a - b);
      let s = sorted[0];
      let p = s;
      for (let i = 1; i <= sorted.length; i++) {
        const x = sorted[i];
        if (x === p + 1) p = x;
        else {
          runs.push({ y, x0: s, x1: p + 1 });
          s = x;
          p = x;
        }
      }
    }
    // Merge a run with the same span on the next row into one taller rectangle
    const rects: { x0: number; x1: number; y0: number; y1: number }[] = [];
    for (const r of runs) {
      const prev = rects.find((q) => q.x0 === r.x0 && q.x1 === r.x1 && q.y1 === r.y);
      if (prev) prev.y1 = r.y + 1;
      else rects.push({ x0: r.x0, x1: r.x1, y0: r.y, y1: r.y + 1 });
    }
    // (x0, yBottom, x1, yTop): row 9 spans 0…100, row 3 spans 600…700, row 0 900…1000, row 10 −100…0
    const g: Gl = { adv: (pg.w + 1) * U, rects: rects.map((q) => [q.x0 * U, (9 - (q.y1 - 1)) * U, q.x1 * U, (9 - q.y0 + 1) * U]) };
    byGlyph.set(pg, glyphs.length);
    gid.set(ch, glyphs.length);
    glyphs.push(g);
  }

  // glyf + loca
  const glyf = new Bin();
  const loca: number[] = [];
  let maxPoints = 0;
  let maxContours = 0;
  let xMin = 0;
  let yMin = 0;
  let xMax = 0;
  let yMax = 0;
  for (const g of glyphs) {
    loca.push(glyf.b.length);
    if (!g.rects.length) continue;
    const bx0 = Math.min(...g.rects.map((r) => r[0]));
    const by0 = Math.min(...g.rects.map((r) => r[1]));
    const bx1 = Math.max(...g.rects.map((r) => r[2]));
    const by1 = Math.max(...g.rects.map((r) => r[3]));
    xMin = Math.min(xMin, bx0);
    yMin = Math.min(yMin, by0);
    xMax = Math.max(xMax, bx1);
    yMax = Math.max(yMax, by1);
    glyf.i16(g.rects.length).i16(bx0).i16(by0).i16(bx1).i16(by1);
    for (let i = 0; i < g.rects.length; i++) glyf.u16(i * 4 + 3);
    glyf.u16(0); // no instructions
    const n = g.rects.length * 4;
    maxPoints = Math.max(maxPoints, n);
    maxContours = Math.max(maxContours, g.rects.length);
    for (let i = 0; i < n; i++) glyf.u8(1); // on-curve, both coordinates as shorts
    // Clockwise outer contours: (x0,y0) → (x0,y1) → (x1,y1) → (x1,y0)
    const pts: [number, number][] = [];
    for (const [x0, y0, x1, y1] of g.rects) pts.push([x0, y0], [x0, y1], [x1, y1], [x1, y0]);
    let px = 0;
    for (const [x] of pts) {
      glyf.i16(x - px);
      px = x;
    }
    let py = 0;
    for (const [, y] of pts) {
      glyf.i16(y - py);
      py = y;
    }
    glyf.pad();
  }
  loca.push(glyf.b.length);
  const locaT = new Bin();
  for (const o of loca) locaT.u32(o);

  const numGlyphs = glyphs.length;
  const head = new Bin()
    .u32(0x00010000).u32(0x00010000).u32(0).u32(0x5f0f3cf5).u16(0x000b).u16(1200)
    .u32(0).u32(0).u32(0).u32(0)
    .i16(xMin).i16(yMin).i16(xMax).i16(yMax).u16(0).u16(8).i16(2).i16(1).i16(0);
  const advMax = Math.max(...glyphs.map((g) => g.adv));
  const hhea = new Bin()
    .u32(0x00010000).i16(1000).i16(-200).i16(0).u16(advMax).i16(0).i16(0).i16(xMax).i16(1).i16(0).i16(0)
    .i16(0).i16(0).i16(0).i16(0).i16(0).u16(numGlyphs);
  const hmtx = new Bin();
  for (const g of glyphs) hmtx.u16(g.adv).i16(g.rects.length ? Math.min(...g.rects.map((r) => r[0])) : 0);
  const maxp = new Bin()
    .u32(0x00010000).u16(numGlyphs).u16(maxPoints).u16(maxContours).u16(0).u16(0).u16(2).u16(0).u16(0).u16(0).u16(0).u16(0).u16(0).u16(0).u16(0);
  const post = new Bin().u32(0x00030000).u32(0).i16(-100).i16(100).u32(1).u32(0).u32(0).u32(0).u32(0);

  // cmap format 4: one segment per run of consecutive codes mapping to consecutive glyphs (idRangeOffset 0)
  const codes = [...gid.keys()].map((c) => c.charCodeAt(0)).sort((a, b) => a - b);
  const segs: { start: number; end: number; delta: number }[] = [];
  for (const c of codes) {
    const g = gid.get(String.fromCharCode(c))!;
    const last = segs[segs.length - 1];
    if (last && c === last.end + 1 && g === ((c + last.delta) & 0xffff)) last.end = c;
    else segs.push({ start: c, end: c, delta: (g - c) & 0xffff });
  }
  segs.push({ start: 0xffff, end: 0xffff, delta: 1 });
  const segX2 = segs.length * 2;
  const log2 = Math.floor(Math.log2(segs.length));
  const sr = 2 * 2 ** log2;
  const sub = new Bin().u16(4).u16(16 + segs.length * 8).u16(0).u16(segX2).u16(sr).u16(log2).u16(segX2 - sr);
  for (const s of segs) sub.u16(s.end);
  sub.u16(0);
  for (const s of segs) sub.u16(s.start);
  for (const s of segs) sub.u16(s.delta);
  for (let i = 0; i < segs.length; i++) sub.u16(0);
  const cmap = new Bin().u16(0).u16(1).u16(3).u16(1).u32(12);
  cmap.b.push(...sub.b);

  const names: [number, string][] = [[1, family], [2, 'Regular'], [3, `${family} Regular`], [4, family], [5, 'Version 1.0'], [6, family.replace(/\s/g, '')]];
  const name = new Bin().u16(0).u16(names.length).u16(6 + names.length * 12);
  const strs = new Bin();
  for (const [id, s] of names) {
    name.u16(3).u16(1).u16(0x409).u16(id).u16(s.length * 2).u16(strs.b.length);
    for (const ch of s) strs.u16(ch.charCodeAt(0));
  }
  name.b.push(...strs.b);

  const first = codes[0];
  const lastCode = codes[codes.length - 1];
  const os2 = new Bin()
    .u16(4).i16(500).u16(400).u16(5).u16(0)
    .i16(650).i16(600).i16(0).i16(75).i16(650).i16(600).i16(0).i16(350).i16(50).i16(250)
    .i16(0);
  for (let i = 0; i < 10; i++) os2.u8(i === 0 ? 2 : 0); // panose
  os2.u32(0x00000003).u32(0x00000200).u32(0).u32(0x10000000) // Latin, Latin-1, Latin ext, Cyrillic; private use
    .tag('QMA ').u16(0x0040).u16(first).u16(Math.min(lastCode, 0xffff))
    .i16(1000).i16(-200).i16(0).u16(1000).u16(200).u32(0x00000001 | 0x4).u32(0)
    .i16(700).i16(700).u16(32).u16(32).u16(0);

  const tables: [string, Bin][] = [
    ['OS/2', os2], ['cmap', cmap], ['glyf', glyf], ['head', head], ['hhea', hhea], ['hmtx', hmtx], ['loca', locaT], ['maxp', maxp], ['name', name], ['post', post],
  ];
  tables.sort((a, b) => (a[0] < b[0] ? -1 : 1));
  const n = tables.length;
  const e = Math.floor(Math.log2(n));
  const out = new Bin().u32(0x00010000).u16(n).u16(16 * 2 ** e).u16(e).u16(n * 16 - 16 * 2 ** e);
  let offset = 12 + n * 16;
  const bodies: number[][] = [];
  let headOffset = 0;
  for (const [tag, t] of tables) {
    const len = t.b.length;
    const padded = [...t.b];
    while (padded.length % 4) padded.push(0);
    out.tag(tag).u32(sum32(padded)).u32(offset).u32(len);
    if (tag === 'head') headOffset = offset;
    bodies.push(padded);
    offset += padded.length;
  }
  for (const b of bodies) out.b.push(...b);
  const adj = (0xb1b0afba - sum32(out.b)) >>> 0;
  out.b[headOffset + 8] = (adj >>> 24) & 255;
  out.b[headOffset + 9] = (adj >>> 16) & 255;
  out.b[headOffset + 10] = (adj >>> 8) & 255;
  out.b[headOffset + 11] = adj & 255;
  return new Uint8Array(out.b).buffer;
}

export const PIXEL_FAMILY = 'GP Pixel';

/** The pixel font for the DOM: useFont(PIXEL) builds and registers it; sharp at 12, 24, 36 … px */
export const PIXEL: GameFont = {
  family: PIXEL_FAMILY,
  source: () => buildPixelTtf(PIXEL_FAMILY),
  weight: '100 900',
  drawWeight: 400,
  what: 'pixel capitals 5×7 for all ten portal languages: sharp at 12, 24, 36 px (pixel-art games)',
  licence: 'our own code',
  pixel: true,
  pixelEm: 12,
};
