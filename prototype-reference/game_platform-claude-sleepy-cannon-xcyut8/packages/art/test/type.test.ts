// @gp/art/type: the bundled faces (files, licences, sizes), the character set they are cut to, and the pixel font —
// every letter of the platform's own words in the ten portal languages, and a TrueType file the browser can read.

import { describe, expect, it } from 'vitest';
import { PLATFORM_STRINGS } from '@gp/core';
import { GAME_CHARSET, canvasFont, inGameCharset, useFont } from '../src/type.ts';
import { DELA_GOTHIC_ONE } from '../src/type/dela-gothic-one.ts';
import { EXO_2 } from '../src/type/exo-2.ts';
import { NUNITO_BLACK } from '../src/type/nunito-black.ts';
import { PIXEL, PIXEL_ICONS, buildPixelTtf, drawPixelText, hasPixelGlyph, pixelCharset, pixelTextWidth } from '../src/type/pixel.ts';

const PORTAL_LANGUAGES = ['en', 'es', 'pt-BR', 'fr', 'de', 'ru', 'tr', 'it', 'pl', 'id'];

// The files as Vite reads them (the test runs in Node, typed as browser code): the fonts as data URLs, the texts raw
const FILES = import.meta.glob('../fonts/*.woff2', { query: '?inline', import: 'default', eager: true }) as Record<string, string>;
const LICENCES = import.meta.glob('../fonts/OFL-*.txt', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const SCRIPT = (import.meta.glob('../../../tools/subset-fonts.sh', { query: '?raw', import: 'default', eager: true }) as Record<string, string>)['../../../tools/subset-fonts.sh'];
/** The bytes of a data URL */
const bytesOf = (url: string) => Uint8Array.from(atob(url.slice(url.indexOf(',') + 1)), (c) => c.charCodeAt(0));

/** Every string of the platform's own words in a language (plural forms too) */
function platformText(lang: string): string {
  const out: string[] = [];
  const walk = (v: unknown) => {
    if (typeof v === 'string') out.push(v);
    else if (v && typeof v === 'object') for (const x of Object.values(v)) walk(x);
  };
  for (const entry of Object.values(PLATFORM_STRINGS)) walk((entry as Record<string, unknown>)[lang]);
  // The placeholders are not drawn
  return out.join(' ').replace(/\{[a-z]+\}/gi, '');
}

/** What a font may leave to the spaces it has: no-break and thin spaces read as a space */
const SPACES = /[\s   ]/u;

describe('the bundled faces', () => {
  for (const font of [DELA_GOTHIC_ONE, NUNITO_BLACK, EXO_2]) {
    it(`${font.family}: a small WOFF2 next to its OFL licence`, () => {
      const name = (font.source as string).match(/fonts\/([^/?#]+\.woff2)/)?.[1];
      const url = FILES[`../fonts/${name}`];
      expect(url, name).toBeDefined();
      const bytes = bytesOf(url);
      expect(String.fromCharCode(...bytes.subarray(0, 4))).toBe('wOF2');
      expect(bytes.length).toBeLessThan(32 * 1024);
      expect(font.licence).toBe('OFL-1.1');
      const licence = LICENCES[`../fonts/${font.licenceFile!.split('/').pop()}`];
      expect(licence).toContain('SIL OPEN FONT LICENSE Version 1.1');
      // No Reserved Font Name: a subset may keep its name
      expect(licence.split('\n')[0]).not.toMatch(/Reserved Font Name/i);
    });
  }

  it('GAME_CHARSET has every letter of the platform’s words in the ten portal languages', () => {
    for (const lang of PORTAL_LANGUAGES) {
      const missing = [...new Set(platformText(lang))].filter((c) => !inGameCharset(c) && !SPACES.test(c));
      expect(missing, lang).toEqual([]);
    }
    expect(inGameCharset('Ж')).toBe(true);
    expect(inGameCharset('ğ')).toBe(true);
    expect(inGameCharset('ł')).toBe(true);
    expect(inGameCharset('日')).toBe(false);
    // The script that cuts the files uses the same list
    expect(SCRIPT).toContain(`UNICODES='${GAME_CHARSET.replace(/, /g, ',')}'`);
  });

  it('useFont returns the family with the fallbacks after it; canvasFont asks for the drawn weight', () => {
    expect(useFont(DELA_GOTHIC_ONE)).toMatch(/^"Dela Gothic One", /);
    expect(canvasFont(NUNITO_BLACK, 24)).toMatch(/^900 24px "Nunito Black", /);
    expect(canvasFont('"Mine"', 12, 600)).toBe('600 12px "Mine"');
  });
});

describe('the pixel font', () => {
  it('draws every letter of the platform’s words in the ten portal languages (lowercase as capitals)', () => {
    for (const lang of PORTAL_LANGUAGES) {
      const missing = [...new Set(platformText(lang))].filter((c) => !hasPixelGlyph(c) && !SPACES.test(c));
      expect(missing, lang).toEqual([]);
    }
    for (const word of ['Żółć', 'Ağaç İĞNE ışık', 'Ещё объём', 'Straße', 'Œuvre', '¿Qué?', 'Ação']) for (const c of word) if (c !== ' ') expect(hasPixelGlyph(c), `${word}: ${c}`).toBe(true);
  });

  it('measures and blits at whole pixels; the pictures are characters of the same font', () => {
    expect(pixelTextWidth('AB')).toBe(5 + 1 + 5);
    expect(pixelTextWidth('AB', 3)).toBe(33);
    const rects: number[][] = [];
    const ctx = { fillStyle: '', fillRect: (...r: number[]) => rects.push(r) } as unknown as CanvasRenderingContext2D;
    const w = drawPixelText(ctx, `${PIXEL_ICONS.coin}1`, 10.4, 20.6, '#fff', { scale: 2 });
    expect(w).toBe(pixelTextWidth(`${PIXEL_ICONS.coin}1`, 2));
    expect(rects.every((r) => r.every((v) => Number.isInteger(v)))).toBe(true);
    expect(pixelCharset()).toContain(PIXEL_ICONS.heart);
  });

  it('builds a TrueType file: the table directory, a cmap with the letters, the checksum adjustment', () => {
    const ttf = new DataView(buildPixelTtf('Test Pixel'));
    expect(ttf.getUint32(0)).toBe(0x00010000);
    const n = ttf.getUint16(4);
    const tags: string[] = [];
    let sum = 0;
    for (let i = 0; i < n; i++) tags.push(String.fromCharCode(...[0, 1, 2, 3].map((k) => ttf.getUint8(12 + i * 16 + k))));
    expect(tags).toEqual([...tags].sort());
    for (const t of ['OS/2', 'cmap', 'glyf', 'head', 'hhea', 'hmtx', 'loca', 'maxp', 'name', 'post']) expect(tags).toContain(t);
    // The whole file sums to 0xB1B0AFBA (what head.checkSumAdjustment is for)
    for (let i = 0; i + 3 < ttf.byteLength; i += 4) sum = (sum + ttf.getUint32(i)) >>> 0;
    expect(sum).toBe(0xb1b0afba);
    expect(ttf.byteLength).toBeLessThan(64 * 1024);
    expect(PIXEL.pixelEm).toBe(12);
    expect(typeof PIXEL.source).toBe('function');
  });
});
