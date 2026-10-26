import { describe, expect, it, vi } from 'vitest';
import { alpha, contrast, css, fromOklch, gray, lightness, mix, oklch, parse, ramp, shade, tryParse } from '../src/color.ts';
import { PALETTES, checkPalette, type Palette } from '../src/palette.ts';

describe('color', () => {
  it('parses and prints hex, short hex and rgba', () => {
    expect(parse('#fff')).toEqual([255, 255, 255, 1]);
    expect(parse('#10203040')[3]).toBeCloseTo(0x40 / 255);
    expect(parse('rgba(1, 2, 3, 0.5)')).toEqual([1, 2, 3, 0.5]);
    expect(css([255, 128, 0, 1])).toBe('#ff8000');
    expect(alpha('#ff8000', 0.25)).toBe('rgba(255,128,0,0.25)');
  });
  it('reads named colours, hsl() and % alpha, and never throws in the frame loop (grey, one warning)', () => {
    expect(parse('white')).toEqual([255, 255, 255, 1]);
    expect(parse('transparent')[3]).toBe(0);
    expect(parse(' Black ')).toEqual([0, 0, 0, 1]);
    expect(parse('rgb(255 0 0 / 50%)')).toEqual([255, 0, 0, 0.5]);
    expect(parse('rgba(255, 0, 0, 50%)')[3]).toBe(0.5);
    expect(parse('rgb(100%, 0%, 50%)')).toEqual([255, 0, 127.5, 1]);
    expect(parse('#f008')[3]).toBeCloseTo(0x88 / 255);
    const hsl = parse('hsl(120, 100%, 25%)');
    expect(hsl.slice(0, 3).map(Math.round)).toEqual([0, 128, 0]);
    expect(parse('hsla(0.5turn 100% 50% / 0.25)').map(Math.round)).toEqual([0, 255, 255, 0]);
    expect(parse('hsl(240 100 50)').slice(0, 3).map(Math.round)).toEqual([0, 0, 255]);
    expect(tryParse('tomato')).toBeNull();
    expect(tryParse('#12')).toBeNull();
    expect(tryParse('rgb(1, 2)')).toBeNull();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(parse('tomato')).toEqual([128, 128, 128, 1]);
    expect(parse('tomato')).toEqual([128, 128, 128, 1]);
    expect(() => alpha('not-a-colour', 0.5)).not.toThrow();
    expect(warn).toHaveBeenCalledTimes(2); // once per colour
    warn.mockRestore();
    // The memo hands out copies: changing a result doesn't change the next one
    const p = parse('#123456');
    p[0] = 0;
    expect(parse('#123456')[0]).toBe(0x12);
    expect(shade('#ff8a2a', -0.4)).toBe(shade('#ff8a2a', -0.4));
  });
  it('round-trips through OKLCH within a unit', () => {
    for (const c of ['#ff8a2a', '#3fd0c9', '#172b3d', '#ffffff', '#000000', '#8a63ff']) {
      const [L, C, h] = oklch(c);
      const back = parse(fromOklch(L, C, h));
      parse(c).slice(0, 3).forEach((v, i) => expect(Math.abs(v - back[i])).toBeLessThanOrEqual(1));
    }
  });
  it('mixes in OKLab: the midpoint of two saturated hues keeps its chroma (no grey middle)', () => {
    const m = mix('#ff0000', '#0000ff', 0.5);
    expect(oklch(m)[1]).toBeGreaterThan(0.12);
    expect(mix('#123456', '#abcdef', 0)).toBe('#123456');
    expect(mix('#123456', '#abcdef', 1)).toBe('#abcdef');
  });
  it('shades with a hue shift: shadows cooler and darker, lights warmer and lighter, never pure black', () => {
    const base = '#ff8a2a';
    const [L0, , h0] = oklch(base);
    const dark = shade(base, -1);
    const light = shade(base, 1);
    expect(lightness(dark)).toBeLessThan(L0);
    expect(lightness(dark)).toBeGreaterThan(0.05);
    expect(dark).not.toBe('#000000');
    expect(lightness(light)).toBeGreaterThan(L0);
    // Orange's shadow turns toward red/purple (a lower or wrapped hue), its light toward yellow
    const hd = oklch(shade(base, -0.6))[2];
    const turn = ((hd - h0 + 540) % 360) - 180;
    expect(turn).toBeLessThan(-5);
    // A grey base still gets a cool shadow (it carries a hue)
    expect(oklch(shade('#808080', -0.6))[1]).toBeGreaterThan(0.02);
  });
  it('ramps go monotonically from dark to light with the base in the middle', () => {
    const r = ramp('#3f5d73', 7);
    expect(r[3]).toBe('#3f5d73');
    for (let i = 1; i < r.length; i++) expect(lightness(r[i])).toBeGreaterThan(lightness(r[i - 1]));
  });
  it('contrast and grayscale', () => {
    expect(contrast('#000000', '#ffffff')).toBeCloseTo(21, 0);
    expect(contrast('#777777', '#777777')).toBeCloseTo(1);
    const [, C] = oklch(gray('#ff8a2a'));
    expect(C).toBeLessThan(0.01);
  });
});

describe('palettes', () => {
  it.each(Object.values(PALETTES))('$name passes its own check (roles read apart in grayscale, nothing muddy)', (p) => {
    expect(checkPalette(p)).toEqual([]);
  });
  it('has the moods the guide promises', () => {
    expect(Object.keys(PALETTES).sort()).toEqual(['candy', 'crypt', 'dune', 'forge', 'haunt', 'meadow', 'neon', 'pastel', 'reef']);
  });
  it('flags what a reviewer would see: unreadable text, a hero lost in the scene, a muddy brown, a black shadow', () => {
    const bad: Palette = { ...PALETTES.forge, ink: '#2a3a4a', accent: '#1a3040', surface: '#5a4a3a', shadow: '#000000' };
    const msgs = checkPalette(bad).map((i) => i.message).join('\n');
    expect(msgs).toMatch(/text on bg/);
    expect(msgs).toMatch(/accent melts into bg/);
    expect(msgs).toMatch(/muddy/);
    expect(msgs).toMatch(/shadow is black/);
    expect(checkPalette({ ...PALETTES.forge, danger: PALETTES.forge.accent }).some((i) => i.roles.includes('danger') && i.level === 'error')).toBe(true);
  });
});
