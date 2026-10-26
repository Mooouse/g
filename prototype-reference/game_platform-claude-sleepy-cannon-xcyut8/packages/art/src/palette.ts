// Palettes with roles: every color in a game has a job, and the jobs that must read apart (text on its background,
// the hero on the scene, danger against the hero) are checked in grayscale — value first, hue second. Pure (Node too).

import { contrast, lightness, oklch } from './color.ts';

export interface Palette {
  name: string;
  /** The farthest, darkest backdrop (the top of the sky, deep space, the back of a cave) */
  bgDeep: string;
  /** The backdrop behind the action */
  bg: string;
  /** Midground: far silhouettes, props behind the action */
  mid: string;
  /** Panels, ground, the surfaces UI sits on */
  surface: string;
  /** Text and icons */
  ink: string;
  /** The hero's color: the one thing the eye goes to */
  accent: string;
  accent2: string;
  /** Enemies, hazards, damage */
  danger: string;
  /** Emissive light: lamps, energy, pickups */
  glow: string;
  /** The key light's tint (warm) */
  light: string;
  /** The shadow tint (cool): contact shadows, fog in the shade */
  shadow: string;
}

export type PaletteName = 'neon' | 'forge' | 'pastel' | 'crypt' | 'candy' | 'meadow' | 'reef' | 'dune' | 'haunt';

const P = (name: string, c: string): Palette => {
  const [bgDeep, bg, mid, surface, ink, accent, accent2, danger, glow, light, shadow] = c.split(' ').map((x) => `#${x}`);
  return { name, bgDeep, bg, mid, surface, ink, accent, accent2, danger, glow, light, shadow };
};

/** Nine curated moods. Each passes checkPalette (a test keeps it so) */
export const PALETTES: Record<PaletteName, Palette> = {
  /** Sci-fi neon: night city, synthwave, cyber arenas */
  neon: P('neon', '0b0a1f 1b1645 3b2c7e 2a2f6b f2f4ff 29e6ff ff4fd8 ff3b5c 9dfcff fff1c9 170b3b'),
  /** Sci-fi industrial: steel blue, hot orange, teal coolant — workshops, factories, robots (no brown) */
  forge: P('forge', '0c1622 172b3d 2f4d63 3f5d73 eef5fa ff8a2a 3fd0c9 ff4b3e ffc65c ffe6b8 0a1230'),
  /** Cozy pastel: light sky, candy-soft shapes, dark ink */
  pastel: P('pastel', '8ea6e6 d4e3ff a6bff0 fff6ec 352c52 8a63ff 2fb894 ff4d5e fff3a8 fffaf0 5a5490'),
  /** Dark fantasy: violet night, candlelight, spectral green */
  crypt: P('crypt', '0c0a14 1e1932 3c3054 4a3f63 efe6ff b26cff 44e0a8 ff4560 ffd27a ffd9a0 0d0820'),
  /** Candy arcade: purple stage, sunny yellow, cyan pop */
  candy: P('candy', '230b40 46187a 7330ab 5c2a94 ffffff ffd23f 3fe0ff ff3d7f fff27a fff7d6 1f0a3d'),
  /** Nature: blue sky, green hills, warm sun */
  meadow: P('meadow', '3d7cc4 86c3ee 4f9e5c f4f1de 1f3326 e8513c ffc93c 8a2bd6 fff2a8 fff6d8 2c3f7a'),
  /** Ocean: deep blue, teal water, coral */
  reef: P('reef', '041d38 0b4a6e 137a8c 1d6f86 eafcff ffd166 ff7a59 ff3e6c 7cf7e6 e9fff6 031a3a'),
  /** Desert / warm dusk: violet sky, sunset orange, turquoise */
  dune: P('dune', '5e2f73 e9825c c95a4c ffe2b5 35192f 0e7c8a ffd34e b8234f fff0b0 fff2d2 4b2466'),
  /** Spooky: green-black night, pumpkin, slime */
  haunt: P('haunt', '090e13 14262a 25443f 2e3d47 e8fff4 ff8c1a 9dff6a ff3355 c8ff8a e0ffe8 08101e'),
};

export const palette = (name: PaletteName): Palette => PALETTES[name];

export interface PaletteIssue {
  level: 'error' | 'warn';
  roles: (keyof Palette)[];
  message: string;
}

const hueGap = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180);

/**
 * What a reviewer would see: text that doesn't read, a hero lost in the scene, danger that looks like the hero, a flat
 * backdrop without depth, and muddy (brown-grey) or grey colors where the game needs color. Empty when the palette is fine.
 */
export function checkPalette(p: Palette): PaletteIssue[] {
  const out: PaletteIssue[] = [];
  const L = (k: keyof Palette) => lightness(p[k]);
  const dL = (a: keyof Palette, b: keyof Palette) => Math.abs(L(a) - L(b));
  const issue = (level: PaletteIssue['level'], roles: (keyof Palette)[], message: string) => out.push({ level, roles, message });
  for (const on of ['bg', 'surface'] as const) {
    const c = contrast(p.ink, p[on]);
    if (c < 4.5) issue('error', ['ink', on], `text on ${on}: contrast ${c.toFixed(1)}:1, needs 4.5:1`);
  }
  for (const k of ['accent', 'danger'] as const)
    if (dL(k, 'bg') < 0.12) issue('error', [k, 'bg'], `${k} melts into bg in grayscale (ΔL ${dL(k, 'bg').toFixed(2)}, needs 0.12)`);
  for (const [a, b] of [['accent', 'accent2'], ['accent', 'danger']] as const) {
    const [La, Ca, ha] = oklch(p[a]);
    const [Lb, Cb, hb] = oklch(p[b]);
    if (hueGap(ha, hb) < 25 && Math.abs(La - Lb) < 0.12 && Math.abs(Ca - Cb) < 0.08) issue('error', [a, b], `${a} and ${b} look alike (hue ${hueGap(ha, hb).toFixed(0)}° apart, ΔL ${Math.abs(La - Lb).toFixed(2)})`);
  }
  if (dL('bgDeep', 'bg') < 0.04) issue('warn', ['bgDeep', 'bg'], 'bgDeep and bg have the same value: the backdrop gets no depth');
  if (dL('mid', 'bg') < 0.05) issue('warn', ['mid', 'bg'], 'mid and bg have the same value: midground silhouettes vanish');
  if (L('glow') < 0.75) issue('warn', ['glow'], `glow is too dark to read as light (L ${L('glow').toFixed(2)}, needs 0.75)`);
  for (const k of ['bg', 'mid', 'surface', 'accent', 'accent2', 'danger'] as const) {
    const [l, c, h] = oklch(p[k]);
    if (c < 0.075 && h > 25 && h < 105 && l > 0.2 && l < 0.7) issue('warn', [k], `${k} ${p[k]} is muddy (a brown-grey): reviewers read it as dirty — more chroma or another hue`);
    else if (c < 0.06 && (k === 'accent' || k === 'accent2' || k === 'danger')) issue('warn', [k], `${k} ${p[k]} is nearly grey: it can't carry the eye`);
  }
  if (L('shadow') < 0.04 || oklch(p.shadow)[1] < 0.02) issue('warn', ['shadow'], 'shadow is black or grey: tint it (cool blue-violet) so shading keeps its color');
  return out;
}
