// The cover composer's pure half: the layout's zones per size and composition, the title's line breaks and its fit

import { describe, expect, it } from 'vitest';
import { COVER_VARIANTS, coverLayout, coverShape, fitTitle, resolveTitle, splitTitle, titleStyleFrom } from '../src/cover.ts';
import { PALETTES } from '../src/palette.ts';

// A monospace stand-in for a font: every character 0.6 em wide
const mono = { measure: (s: string) => s.length * 0.6, ascent: 0.72, descent: 0 };
const SIZES = [
  [1920, 1080],
  [800, 1200],
  [800, 800],
] as const;

describe('coverLayout', () => {
  it('knows the three CrazyGames shapes', () => {
    expect(coverShape(1920, 1080)).toBe('landscape');
    expect(coverShape(800, 1200)).toBe('portrait');
    expect(coverShape(800, 800)).toBe('square');
    expect(coverShape(1024, 500)).toBe('landscape');
  });
  for (const [w, h] of SIZES)
    for (const v of COVER_VARIANTS)
      it(`${w}×${h} ${v}: the title zone is inside the cover with a margin, big, and the hero zone is bigger`, () => {
        const L = coverLayout(w, h, v);
        const t = L.title;
        expect(t.x).toBeGreaterThanOrEqual(w * 0.03);
        expect(t.y).toBeGreaterThanOrEqual(h * 0.02);
        expect(t.x + t.w).toBeLessThanOrEqual(w * 0.97);
        expect(t.y + t.h).toBeLessThanOrEqual(h * 0.97);
        // A big title: its zone spans at least 40 % of the width (the rule: the title fills 30–40 % or more)
        expect(t.w / w).toBeGreaterThanOrEqual(0.4);
        expect(L.hero.w * L.hero.h).toBeGreaterThan(t.w * t.h);
        expect(L.focus.x).toBeGreaterThan(0);
        expect(L.focus.x).toBeLessThan(w);
        expect(L.unit).toBeCloseTo(Math.min(w, h) / 1080);
        expect(L.variant).toBe(v);
      });
  it('the three compositions differ', () => {
    const [a, b, c] = COVER_VARIANTS.map((v) => coverLayout(1920, 1080, v).title);
    expect(a).not.toEqual(b);
    expect(b).not.toEqual(c);
  });
});

describe('splitTitle', () => {
  it('keeps one word on one line', () => {
    expect(splitTitle('Starsilk', 2, mono.measure)).toEqual(['Starsilk']);
  });
  it('breaks into the most even lines, words in order', () => {
    expect(splitTitle('Hang the Moon', 3, mono.measure)).toEqual(['Hang', 'the', 'Moon']);
    expect(splitTitle('Hang the Moon', 2, mono.measure).map((l) => l.length)).toEqual([4, 8]);
    expect(splitTitle('A Very Long Title', 2, mono.measure)).toEqual(['A Very', 'Long Title']);
    expect(splitTitle('One Two Three', 3, mono.measure)).toEqual(['One', 'Two', 'Three']);
  });
});

describe('fitTitle', () => {
  it('fits the box with the outline, extrusion and tilt included', () => {
    for (const tilt of [0, -0.05, 0.12]) {
      const box = { w: 800, h: 300 };
      const f = fitTitle('Forge Night', box, mono, { tilt, arc: 0.06 });
      expect(f.fillW).toBeLessThanOrEqual(1 + 1e-9);
      expect(f.fillH).toBeLessThanOrEqual(1 + 1e-9);
      // ...and fills it in one direction at least
      expect(Math.max(f.fillW, f.fillH)).toBeGreaterThan(0.99);
    }
  });
  it('one line in a wide zone, two in a tall one', () => {
    expect(fitTitle('Forge Night', { w: 1600, h: 200 }, mono).lines).toEqual(['Forge Night']);
    expect(fitTitle('Forge Night', { w: 500, h: 500 }, mono).lines).toEqual(['Forge', 'Night']);
  });
  it('a split must win by the bias: nearly equal sizes stay on one line', () => {
    const box = { w: 700, h: 200 };
    const one = fitTitle('Forge Night', box, mono, { maxLines: 1 }).size;
    const two = fitTitle('Forge Night', box, mono, { lineBias: 1e-6 }).size;
    expect(two).toBeGreaterThan(one);
    expect(fitTitle('Forge Night', box, mono, { lineBias: (two / one) * 1.01 }).lines).toHaveLength(1);
    expect(fitTitle('Forge Night', box, mono, { lineBias: (two / one) * 0.99 }).lines).toHaveLength(2);
    // The default bias keeps a 3 % gain on one line
    expect(fitTitle('Forge Night', box, mono).lines).toHaveLength(1);
  });
  it('bigger letters for a shorter title in the same zone', () => {
    const box = { w: 900, h: 260 };
    expect(fitTitle('Kettlebot', box, mono).size).toBeGreaterThan(fitTitle('The Kettlebot Adventure', box, mono).size);
  });
});

describe('title styles', () => {
  it('defaults: the platform face, upper case, a gradient and a dark outline', () => {
    const s = resolveTitle('Forge Night');
    expect(s.text).toBe('Forge Night');
    expect(s.upper).toBe(true);
    expect(s.fill.length).toBeGreaterThanOrEqual(2);
    expect(s.outline).not.toBe('#000000');
  });
  it('a game font of its own keeps its case and gets a heavy weight', () => {
    const s = resolveTitle('Dread Throne', { font: "'Cinzel Decorative'", text: 'Dread Throne' });
    expect(s.upper).toBe(false);
    expect(s.weight).toBe(900);
  });
  it('a style from a palette uses its roles', () => {
    const p = PALETTES.forge;
    const s = titleStyleFrom(p);
    expect(s.fill?.at(-1)).toBe(p.accent);
    expect(s.glow).toBe(p.glow);
  });
});
