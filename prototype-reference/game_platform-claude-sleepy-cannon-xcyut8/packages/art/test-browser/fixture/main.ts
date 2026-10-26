// Exposes @gp/art to the browser test (art.test.ts) with a few pixel helpers, and the Canvas 2D engine adapter on a host
import { GameHost } from '@gp/core';
import { canvasAdapter } from '@gp/core/engines/canvas';
import * as art from '../../src/index.ts';
import { DELA_GOTHIC_ONE } from '../../src/type/dela-gothic-one.ts';
import { EXO_2 } from '../../src/type/exo-2.ts';
import { NUNITO_BLACK } from '../../src/type/nunito-black.ts';
import { PIXEL, PIXEL_ICONS, drawPixelText } from '../../src/type/pixel.ts';

const px = (ctx: CanvasRenderingContext2D, x: number, y: number) => [...ctx.getImageData(x, y, 1, 1).data];
const luma = (p: number[]) => 0.2126 * p[0] + 0.7152 * p[1] + 0.0722 * p[2];
/** Distinct quantized gray levels and the darkest pixel among non-transparent pixels in a rect */
function levels(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const d = ctx.getImageData(x, y, w, h).data;
  const set = new Set<number>();
  let darkest = 255;
  let black = 0;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 250) continue;
    const l = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
    set.add(Math.round(l / 8));
    darkest = Math.min(darkest, l);
    if (d[i] + d[i + 1] + d[i + 2] < 6) black++;
  }
  return { levels: set.size, darkest, black };
}
function hashCanvas(c: HTMLCanvasElement): string {
  const d = c.getContext('2d')!.getImageData(0, 0, c.width, c.height).data;
  let h = 2166136261;
  for (let i = 0; i < d.length; i++) h = Math.imul(h ^ d[i], 16777619);
  return (h >>> 0).toString(16);
}
function canvas(w: number, h: number, bg = '#000000'): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d', { willReadFrequently: true })!;
  g.fillStyle = bg;
  g.fillRect(0, 0, w, h);
  return [c, g];
}
/** The platform's Canvas 2D adapter on a canvas of its own (sized from the window at creation) */
function adapter() {
  const c = document.createElement('canvas');
  document.body.append(c);
  const host = new GameHost({
    saveKey: 'art-fixture',
    minTouchPx: 48,
    locale: 'en-US',
    ads: { policy: { noAdsAfterLaunchSec: 0, firstAdAfterRound: 0, everyRounds: 1, minIntervalSec: 0, maxAdWaitSec: 10, testAdCloseSec: 1 }, rewarded: true, admob: null },
    portal: null,
    keepEventLog: false,
    canvas: c,
    title: 'Art Fixture',
  });
  return canvasAdapter(host, c);
}
const fonts = { DELA_GOTHIC_ONE, NUNITO_BLACK, EXO_2, PIXEL, PIXEL_ICONS, drawPixelText };
Object.assign(window, { art, T: { px, luma, levels, hashCanvas, canvas, adapter, fonts } });
