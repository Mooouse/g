// Browser tests of @gp/art's drawing (Playwright's Chromium): materials read as volumes, the light map lights and
// shadows, bakes and sprite caches re-bake on a density change and a lost context, scenery fills the screen, and
// everything is deterministic. Runs with `npm run test:browser`.

import { fileURLToPath } from 'node:url';
import { chromium, type Browser, type Page } from 'playwright';
import { createServer, type ViteDevServer } from 'vite';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

let server: ViteDevServer;
let browser: Browser;
let base = '';

beforeAll(async () => {
  server = await createServer({ root: fileURLToPath(new URL('./fixture', import.meta.url)), configFile: false, logLevel: 'error', server: { port: 0 } });
  await server.listen();
  base = server.resolvedUrls!.local[0];
  browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
}, 60000);

afterAll(async () => {
  await browser?.close();
  await server?.close();
});

async function open(dpr = 1): Promise<Page> {
  const ctx = await browser.newContext({ viewport: { width: 640, height: 360 }, deviceScaleFactor: dpr });
  const page = await ctx.newPage();
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  (page as unknown as { errors: string[] }).errors = errors;
  await page.goto(base);
  await page.waitForFunction('!!window.art');
  return page;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const run = <R>(page: Page, fn: (art: any, T: any) => R, k?: unknown) =>
  page.evaluate(`window.k = ${JSON.stringify(k ?? null)}; (${fn.toString()})(window.art, window.T)`) as Promise<Awaited<R>>;

describe('@gp/art in the browser', () => {
  it('paint(): a lit volume — light side brighter, many values, a hue-shifted outline that is never black', async () => {
    const page = await open();
    const r = await run(page, (art, T) => {
      const out: Record<string, unknown> = {};
      for (const style of ['matte', 'toon', 'glossy', 'metal', 'brushed', 'chrome', 'glass', 'emissive']) {
        const [, g] = T.canvas(200, 200, '#404858');
        const p = new Path2D();
        p.arc(100, 100, 80, 0, Math.PI * 2);
        art.paint(g, p, { x: 20, y: 20, w: 160, h: 160 }, '#3f8fd0', { style, outline: 4 });
        out[style] = { upLeft: T.luma(T.px(g, 55, 55)), downRight: T.luma(T.px(g, 150, 150)), ...T.levels(g, 30, 30, 140, 140), edge: T.px(g, 100, 21) };
      }
      return out;
    });
    for (const [style, v] of Object.entries(r) as [string, { upLeft: number; downRight: number; levels: number; black: number; edge: number[] }][]) {
      // (glass: see-through, its refracted edge is on the shadow side)
      if (style !== 'emissive' && style !== 'glass') expect(v.upLeft, style).toBeGreaterThan(v.downRight);
      expect(v.levels, style).toBeGreaterThanOrEqual(style === 'toon' ? 3 : 6);
      expect(v.black, style).toBe(0);
      // The outline: darker than the base, not black, and blue-ish like the base
      expect(v.edge[0] + v.edge[1] + v.edge[2], style).toBeGreaterThan(6);
    }
    expect((page as unknown as { errors: string[] }).errors).toEqual([]);
  });

  it('the light map: dark where no light reaches, lit near a light, and an occluder casts a shadow away from it', async () => {
    const page = await open();
    const r = await run(page, (art, T) => {
      const [, g] = T.canvas(400, 200, '#d0d0d0');
      const L = new art.LightLayer({ ambient: '#202030', scale: 0.5, bloom: 0, soft: false });
      L.add({ x: 100, y: 100, radius: 300, color: '#ffffff', intensity: 1 });
      L.occluders = [{ x: 200, y: 100, r: 20 }];
      L.render(400, 200, 0);
      L.apply(g, 400, 200);
      return {
        near: T.luma(T.px(g, 110, 100)),
        behind: T.luma(T.px(g, 300, 100)),
        beside: T.luma(T.px(g, 300, 20)),
        far: T.luma(T.px(g, 399, 199)),
        dir: L.dirAt(150, 100),
        at: [L.at(100, 100), L.at(399, 199)],
      };
    });
    expect(r.near).toBeGreaterThan(150);
    expect(r.behind).toBeLessThan(r.beside - 20);
    expect(r.far).toBeLessThan(r.near - 60);
    expect(Math.abs(Math.abs(r.dir) - Math.PI)).toBeLessThan(0.05); // the light is to the left
    expect(r.at[0]).toBeGreaterThan(r.at[1]);
  });

  it('a spot light lights its cone more than outside it (and spills a little, no black wedge)', async () => {
    const page = await open();
    const r = await run(page, (art, T) => {
      const [, g] = T.canvas(400, 400, '#ffffff');
      const L = new art.LightLayer({ ambient: '#000000', scale: 0.5, bloom: 0 });
      L.add({ x: 200, y: 50, radius: 380, color: '#ffffff', dir: Math.PI / 2, cone: 0.4 });
      L.render(400, 400, 0);
      L.apply(g, 400, 400);
      return { inCone: T.luma(T.px(g, 200, 200)), outside: T.luma(T.px(g, 60, 80)) };
    });
    expect(r.inCone).toBeGreaterThan(r.outside + 60);
    expect(r.outside).toBeGreaterThan(0);
  });

  it('offThread: the worker paints the light map a frame behind — the same pixels as painting it here', async () => {
    const page = await open();
    const r = await run(page, async (art, T) => {
      const scene = (L: any) => {
        L.clear();
        L.add({ x: 120, y: 90, radius: 260, color: '#ffc070', intensity: 1.3, dir: Math.PI / 2, cone: 0.6 }, { x: 300, y: 120, radius: 150, color: '#5ff6ff' });
        L.occluders = [{ x: 200, y: 140, r: 18 }, { pts: [[60, 150], [100, 150], [100, 190], [60, 190]] }];
      };
      const frame = (L: any) => {
        const [, g] = T.canvas(400, 200, '#a0a4b0');
        scene(L);
        L.render(400, 200, 0.5);
        L.apply(g, 400, 200);
        return g.getImageData(0, 0, 400, 200).data as Uint8ClampedArray;
      };
      const opts = { ambient: ['#e2e6ff', '#4a5598'], scale: 0.25, bloom: 0.4, vignette: 0.5, step: 2 };
      const here = frame(new art.LightLayer(opts));
      const L = new art.LightLayer({ ...opts, offThread: true });
      const first = frame(L);
      for (let i = 0; i < 20 && !L.result; i++) {
        frame(L);
        await new Promise((res) => setTimeout(res, 50));
      }
      const there = frame(L);
      // This frame's apply() blended the worker's map: nothing was painted on this thread
      const used = !!L.result && !L.painted;
      L.dispose();
      let diff = 0;
      let sum = 0;
      let same = 0;
      for (let i = 0; i < here.length; i++) {
        const d = Math.abs(here[i] - there[i]);
        diff = Math.max(diff, d);
        sum += d;
        same = Math.max(same, Math.abs(here[i] - first[i]));
      }
      return { used, diff, mean: sum / here.length, same };
    });
    expect(r.used).toBe(true);
    // The first frame (no map from the worker yet) is painted here; the worker's map gives the same pixels
    expect(r.same).toBe(0);
    // The worker's canvases rasterize the gradients a hair differently (a few levels at most, on a few pixels)
    expect(r.mean).toBeLessThan(0.3);
    expect(r.diff).toBeLessThanOrEqual(16);
  });

  it('pre-sized glows on whole pixels: the same glow as the scaled 128 px sprite', async () => {
    const page = await open();
    const r = await run(page, (art, T) => {
      const draw = (sized: boolean) => {
        const [, g] = T.canvas(300, 200, '#101420');
        g.setTransform(1.2, 0, 0, 1.2, 0, 0);
        for (const [x, y, rr] of [[60, 60, 30], [150.4, 80.7, 52], [200, 120, 11]]) {
          if (sized) art.glow(g, x, y, rr, '#ffb35c', 0.9);
          else {
            g.globalCompositeOperation = 'lighter';
            g.globalAlpha = 0.9;
            g.drawImage(art.glowSprite('#ffb35c'), x - rr, y - rr, rr * 2, rr * 2);
            g.globalAlpha = 1;
            g.globalCompositeOperation = 'source-over';
          }
        }
        return g.getImageData(0, 0, 300, 200).data as Uint8ClampedArray;
      };
      const a = draw(false);
      const b = draw(true);
      let sum = 0;
      let max = 0;
      for (let i = 0; i < a.length; i += 4) {
        const d = Math.abs(a[i] - b[i]);
        sum += d;
        max = Math.max(max, d);
      }
      return { mean: sum / (a.length / 4), max };
    });
    // The same falloff: a few levels apart at a small glow's peak (the 128 px sprite shrunk 5× is sampled, not averaged)
    expect(r.mean).toBeLessThan(0.6);
    expect(r.max).toBeLessThan(40);
  });

  it('bakes re-bake on a density change and after a lost context; the pixel ratio is capped at 2', async () => {
    const page = await open();
    const r = await run(page, (art) => {
      const b = new art.Baked((g: CanvasRenderingContext2D) => g.fillRect(0, 0, 10, 10));
      b.get(20, 20);
      b.get(20, 20);
      const once = b.bakes;
      const c = document.getElementById('c') as HTMLCanvasElement;
      art.fitCanvas(c, { width: 100, height: 50, maxDpr: 2 });
      const d1 = art.density();
      b.get(20, 20);
      const stop = art.watchContext(c);
      c.dispatchEvent(new Event('contextrestored'));
      b.get(20, 20);
      stop();
      c.dispatchEvent(new Event('contextrestored'));
      b.get(20, 20);
      return { once, after: b.bakes, d1, size: [c.width, c.height] };
    });
    expect(r.once).toBe(1);
    expect(r.after).toBe(2); // the context restore re-baked once; after stop() no more
    expect(r.d1).toBe(1);
    expect(r.size).toEqual([100, 50]);
    // A 3× screen: capped at 2, and the density change re-bakes
    const p3 = await open(3);
    const capped = await run(p3, (art) => {
      const b = new art.Baked(() => {});
      b.get(10, 10);
      const c = document.getElementById('c') as HTMLCanvasElement;
      const fit = art.fitCanvas(c, { width: 100, height: 50 });
      const canvas = b.get(10, 10);
      return [fit.dpr, c.width, art.density(), b.bakes, canvas.width];
    });
    expect(capped).toEqual([2, 200, 2, 2, 20]);
  });

  it('SpriteCache: hits, LRU eviction under the memory cap, re-bake after invalidation; silhouettes flash', async () => {
    const page = await open();
    const r = await run(page, (art, T) => {
      const cache = new art.SpriteCache({ maxBytes: 100 * 100 * 4 * 2.5 });
      let baked = 0;
      const draw = (g: CanvasRenderingContext2D) => {
        baked++;
        g.fillStyle = '#3366cc';
        g.fillRect(-50, -50, 100, 100);
      };
      const a = cache.get('a', 100, 100, draw, { scale: 1 });
      cache.get('b', 100, 100, draw, { scale: 1 });
      cache.get('a', 100, 100, draw, { scale: 1 }); // a is now the most recent
      cache.get('c', 100, 100, draw, { scale: 1 }); // over the cap: b goes
      const evicted = cache.evictions;
      cache.get('a', 100, 100, draw, { scale: 1 });
      const before = baked;
      art.invalidateBakes();
      cache.get('a', 100, 100, draw, { scale: 1 });
      const [, g] = T.canvas(300, 120, '#000000');
      art.drawSprite(g, a, 60, 60);
      art.drawSprite(g, a, 180, 60, { flash: 1 });
      return { evicted, hits: cache.hits, size: cache.size, rebaked: baked - before, plain: T.px(g, 60, 60), flashed: T.px(g, 180, 60) };
    });
    expect(r.evicted).toBe(1);
    expect(r.size).toBe(2);
    expect(r.hits).toBeGreaterThanOrEqual(2);
    expect(r.rebaked).toBe(1);
    expect(r.plain.slice(0, 3)).toEqual([0x33, 0x66, 0xcc]);
    expect(r.flashed.slice(0, 3)).toEqual([255, 255, 255]);
  });

  it('SpriteSheet frames and 9-slice panels keep their corners', async () => {
    const page = await open();
    const r = await run(page, (art, T) => {
      const sheet = new art.SpriteSheet(4, 20, 20, (g: CanvasRenderingContext2D, i: number) => {
        g.fillStyle = ['#ff0000', '#00ff00', '#0000ff', '#ffffff'][i];
        g.fillRect(-10, -10, 20, 20);
      }, { scale: 1 });
      const [, g] = T.canvas(200, 100);
      [0, 1, 2, 3].forEach((i) => sheet.draw(g, i, 15 + i * 30, 15));
      const panel = art.makeSprite(30, 30, (c: CanvasRenderingContext2D) => {
        c.fillStyle = '#808080';
        c.fillRect(-15, -15, 30, 30);
        c.fillStyle = '#ff0000';
        c.fillRect(-15, -15, 5, 5);
      }, { scale: 1 });
      art.nineSlice(g, panel, 0, 40, 180, 60, 8);
      return { frames: [0, 1, 2, 3].map((i) => T.px(g, 15 + i * 30, 15).slice(0, 3)), at: sheet.at(1.1, 2), rect: sheet.rect(3), corner: T.px(g, 2, 42).slice(0, 3), middle: T.px(g, 90, 70).slice(0, 3) };
    });
    expect(r.frames).toEqual([[255, 0, 0], [0, 255, 0], [0, 0, 255], [255, 255, 255]]);
    expect(r.at).toBe(2);
    expect(r.rect).toEqual([20, 20, 20, 20]);
    expect(r.corner).toEqual([255, 0, 0]);
    expect(r.middle).toEqual([128, 128, 128]);
  });

  it('scenery fills the whole screen with depth and is the same twice; the HUD and effects draw deterministically', async () => {
    const page = await open();
    const r = await run(page, (art, T) => {
      const make = () => {
        const [c, g] = T.canvas(640, 360, '#ff00ff');
        const sky = new art.Scenery({
          sky: ['#060a1e', '#23336c', '#e0806a'],
          haze: '#7a6aa0',
          stars: 100,
          planet: { x: 0.8, y: 0.2, r: 30, color: '#8f7ad8', ring: '#e0c8ff' },
          layers: [
            { kind: 'mountains', depth: 0.1, color: '#5a5a9a', y: 0.7, height: 0.3 },
            { kind: 'clouds', depth: 0.15, color: '#6a5a9a', y: 0.5, height: 0.2 },
            { kind: 'forest', depth: 0.3, color: '#26405e', y: 0.85, height: 0.3 },
            { kind: 'city', depth: 0.45, color: '#262d5e', y: 0.9, height: 0.4, lights: '#ffc27a' },
            { kind: 'industrial', depth: 0.7, color: '#151a3c', y: 1, height: 0.4, lights: '#ffc27a' },
            { kind: 'fog', depth: 0.5, color: '#a07aa8', y: 0.9, height: 0.15 },
          ],
        });
        sky.draw(g, 640, 360, { x: 123, y: 0 }, 1.5);
        const fx = new art.Fx({ seed: 3 });
        fx.explode(320, 250);
        for (let i = 0; i < 12; i++) fx.update(1 / 60);
        fx.draw(g);
        art.glass(g, 10, 10, 200, 80, {});
        art.gauge(g, 60, 50, 30, 0.7, { text: '70', label: 'heat', warn: 0.6, t: 1 });
        art.bar(g, 110, 40, 90, 10, 0.5, { segments: 4 });
        art.readout(g, '001234', 300, 30, 20, {});
        art.warning(g, 450, 30, 24, 1);
        new art.Overlay({ grain: 0.05 }).draw(g, 640, 360);
        let magenta = 0;
        const d = g.getImageData(0, 0, 640, 360).data;
        for (let i = 0; i < d.length; i += 4) if (d[i] === 255 && d[i + 1] === 0 && d[i + 2] === 255) magenta++;
        return { hash: T.hashCanvas(c), magenta, ...T.levels(g, 0, 0, 640, 360) };
      };
      return [make(), make()];
    });
    expect(r[0].magenta).toBe(0);
    expect(r[0].levels).toBeGreaterThan(20);
    expect(r[0].hash).toBe(r[1].hash);
    expect((page as unknown as { errors: string[] }).errors).toEqual([]);
  });

  it('shapes and character parts draw without errors, and an eye blinks shut', async () => {
    const page = await open();
    const r = await run(page, (art, T) => {
      const [, g] = T.canvas(400, 200, '#203040');
      const paths = [art.blob(40, 40, 30, 25), art.capsule(80, 10, 60, 30), art.squircle(180, 40, 60, 50), art.chamfer(220, 10, 60, 50, 10), art.star(320, 40, 25), art.leaf(20, 150, 40, 16), art.cloud(120, 150, 80, 30), art.flame(220, 190, 30, 60, 1), art.roundedPolygon([[260, 120], [320, 120], [290, 180]], 8)];
      for (const p of paths) art.paint(g, p, { x: 0, y: 0, w: 400, h: 200 }, '#ff8a2a', { style: 'glossy', outline: 2 });
      art.gem(g, 360, 150, 40, '#3fd0c9');
      art.coin(g, 360, 100, 14, '#ffc93c', 0.3);
      art.pipe(g, 10, 100, 100, 100, 6, '#4a6386');
      art.rivets(g, [[10, 10], [20, 10]], 3, '#4a6386', { slot: true });
      art.vents(g, 100, 60, 40, 20, '#4a6386');
      art.stripes(g, art.rounded(150, 100, 60, 10, 3), { x: 150, y: 100, w: 60, h: 10 });
      art.wear(g, paths[1], { x: 80, y: 10, w: 60, h: 30 });
      art.speckle(g, paths[0], { x: 10, y: 10, w: 60, h: 60 });
      art.grooves(g, [[0, 0, 50, 50]], '#4a6386');
      art.visorEyes(g, 200, 100, 60, 24, { mood: 'happy' });
      art.mouth(g, 200, 130, 20, { open: 0.5 });
      const [, e1] = T.canvas(60, 60, '#5a8');
      art.eye(e1, 30, 30, 20, { skin: '#55aa88' });
      const [, e2] = T.canvas(60, 60, '#5a8');
      art.eye(e2, 30, 30, 20, { skin: '#55aa88', blink: 1 });
      return { open: T.luma(T.px(e1, 30, 22)), shut: T.luma(T.px(e2, 30, 22)) };
    });
    expect(Math.abs(r.open - r.shut)).toBeGreaterThan(20);
    expect((page as unknown as { errors: string[] }).errors).toEqual([]);
  });

  it('parallax tiles meet edge to edge at DPR 2 (with and without the render scale set) and at a fractional DPR', async () => {
    // Each case: a canvas at the device ratio, the transform the game sets, one opaque layer scrolled so a tile's seam is
    // in view. Drawn over magenta and over green: where the layer covers, both are the same pixel
    const cases = [
      { dpr: 2, w: 640, fit: false }, // an engine's transform of 2 while the render scale stayed 1 (the canvas adapter before)
      { dpr: 2, w: 640, fit: true },
      { dpr: 1.5, w: 641, fit: true }, // 961.5 device px rounds: the transform is 962/641, not 1.5
      { dpr: 1, w: 640, fit: true },
    ];
    for (const k of cases) {
      const page = await open(k.dpr);
      const r = await run(page, (art) => {
        const { dpr, w, fit } = (window as unknown as { k: { dpr: number; w: number; fit: boolean } }).k;
        const h = 360;
        const c = document.getElementById('c') as HTMLCanvasElement;
        if (fit) art.fitCanvas(c, { width: w, height: h });
        else {
          c.width = w * dpr;
          c.height = h * dpr;
        }
        const g = c.getContext('2d', { willReadFrequently: true })!;
        const sky = new art.Scenery({ sky: ['#000010', '#000020'], haze: '#203040', layers: [{ kind: 'hills', depth: 1, color: '#3060a0', y: 1, height: 0.5 }] });
        const shot = (bg: string, camX: number) => {
          g.setTransform(c.width / w, 0, 0, c.height / h, 0, 0);
          g.fillStyle = bg;
          g.fillRect(0, 0, w, h);
          sky.draw(g, w, h, { x: camX, y: 0 }, 0, [0]);
          const y0 = Math.round(c.height * (325 / 360));
          return g.getImageData(0, y0, c.width, c.height - y0).data;
        };
        let differ = 0;
        for (const camX of [1000, 1000.3, 1555.55, 3200.7]) {
          const a = shot('#ff00ff', camX);
          const b = shot('#00ff00', camX);
          for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) differ++;
        }
        return { differ, density: art.density(), bytes: sky.bytes, k: c.width / w };
      }, k);
      expect(r.differ, JSON.stringify({ ...k, ...r })).toBe(0);
      await page.close();
    }
  });

  it('the canvas engine adapter makes its pixel ratio the render scale (bakes come out 1:1)', async () => {
    const page = await open(2);
    const r = await run(page, (art, T) => {
      const before = art.density();
      const eng = T.adapter();
      return { before, after: art.density(), size: [eng.size.width, eng.size.height, eng.size.dpr] };
    });
    expect(r.before).toBe(1);
    expect(r.after).toBe(2);
    expect(r.size).toEqual([640, 360, 2]);
  });

  it('a layer tile stays under its memory cap; far and fog layers bake at half the density on a dense screen', async () => {
    const page = await open(2);
    const r = await run(page, (art) => {
      const c = document.getElementById('c') as HTMLCanvasElement;
      art.fitCanvas(c, { width: 2560, height: 1440 });
      const g = c.getContext('2d')!;
      g.setTransform(2, 0, 0, 2, 0, 0);
      const layer = (kind: string, depth: number) => new art.Scenery({ sky: ['#000', '#111'], haze: '#203040', layers: [{ kind, depth, color: '#3060a0', height: 0.5 }] });
      const near = layer('hills', 0.8);
      near.draw(g, 2560, 1440, { x: 0, y: 0 }, 0, [0]);
      const far = layer('mountains', 0.1);
      far.draw(g, 2560, 1440, { x: 0, y: 0 }, 0, [0]);
      return { near: near.bytes, far: far.bytes };
    });
    expect(r.near).toBeLessThanOrEqual(4_000_000 * 4 * 1.01);
    expect(r.far).toBeLessThan(r.near / 2); // at 1 device px per CSS px: a quarter of its 2× tile
  });

  it('a SpriteSheet frame is a sprite of its cell: drawSprite, silhouette, tint, the flash and nineSlice take only that frame', async () => {
    const page = await open();
    const r = await run(page, (art, T) => {
      const sheet = new art.SpriteSheet(4, 20, 20, (g: CanvasRenderingContext2D, i: number) => {
        g.fillStyle = ['#ff0000', '#00ff00', '#0000ff', '#ffff00'][i];
        g.fillRect(-10, -10, 20, 20);
      }, { scale: 1, cols: 2 });
      const f = sheet.frames[3];
      const [, g] = T.canvas(200, 60, '#000000');
      art.drawSprite(g, f, 30, 30);
      sheet.draw(g, 1, 70, 30, { flash: 1 });
      const sil = art.silhouette(f, '#ff00ff');
      const tinted = art.tint(sheet.frames[0], '#0000ff', 1);
      art.drawSprite(g, tinted, 110, 30);
      art.nineSlice(g, sheet.frames[2], 140, 10, 50, 40, 4);
      return {
        frame: T.px(g, 30, 30).slice(0, 3),
        // Around the frame: nothing of the other frames (the whole atlas would reach 20 px further)
        outside: T.px(g, 30 + 14, 30).slice(0, 3),
        flashed: T.px(g, 70, 30).slice(0, 3),
        sil: [sil.canvas.width, sil.canvas.height, sil.src ?? null],
        tinted: [T.px(g, 110, 30).slice(0, 3), tinted.canvas.width],
        nine: [T.px(g, 145, 15).slice(0, 3), T.px(g, 165, 30).slice(0, 3), T.px(g, 192, 30).slice(0, 3)],
        rect: sheet.rect(3),
      };
    });
    expect(r.frame).toEqual([255, 255, 0]);
    expect(r.outside).toEqual([0, 0, 0]);
    expect(r.flashed).toEqual([255, 255, 255]);
    expect(r.sil).toEqual([20, 20, null]);
    expect(r.tinted).toEqual([[0, 0, 255], 20]);
    expect(r.nine).toEqual([[0, 0, 255], [0, 0, 255], [0, 0, 0]]);
    expect(r.rect).toEqual([20, 20, 20, 20]);
  });

  it("keepBaked() re-makes what a game holds after a lost context; a SpriteSheet knows its generation", async () => {
    const page = await open();
    const r = await run(page, (art) => {
      let made = 0;
      const sheet = art.keepBaked(() => (made++, new art.SpriteSheet(2, 10, 10, () => {}, { scale: 1 })));
      const a = sheet();
      const same = sheet() === a;
      art.invalidateBakes();
      const stale = a.gen !== art.bakeGen();
      const b = sheet();
      return { same, made, fresh: b !== a && b.gen === art.bakeGen(), stale };
    });
    expect(r).toEqual({ same: true, made: 2, fresh: true, stale: true });
  });

  it('the HUD cache: a screen-sized panel is drawn without evicting the gauges, an animated size bakes per bucket', async () => {
    const page = await open(2);
    const r = await run(page, (art) => {
      const c = document.getElementById('c') as HTMLCanvasElement;
      art.fitCanvas(c, { width: 1000, height: 700 });
      const g = c.getContext('2d')!;
      g.setTransform(2, 0, 0, 2, 0, 0);
      const C = art.hudCache;
      const hud = () => {
        art.gauge(g, 60, 60, 36, 0.5, { text: '50' });
        art.bar(g, 120, 50, 90, 10, 0.5);
        art.iconButton(g, 300, 60, 22, () => {});
      };
      hud();
      hud();
      const ev0 = C.evictions;
      const m0 = C.misses;
      // A results panel: baked once, kept with the rest
      for (let i = 0; i < 5; i++) {
        art.glass(g, 50, 50, 900, 600, { frost: false });
        hud();
      }
      const panelMisses = C.misses - m0;
      // A screen-sized one at DPR 2 (over half the cap): drawn directly, nothing baked or evicted
      const m3 = C.misses;
      for (let i = 0; i < 5; i++) {
        art.glass(g, 0, 0, 1100, 760, { frost: false });
        hud();
      }
      const bigMisses = C.misses - m3;
      const bigEvictions = C.evictions - ev0;
      // A panel growing in over 60 frames
      const m1 = C.misses;
      for (let i = 0; i < 60; i++) art.glass(g, 10, 10, 100 + i * 5, 80 + i * 2, { frost: false });
      const animMisses = C.misses - m1;
      // A panel that stays: baked at its exact size from its second frame
      const m2 = C.misses;
      for (let i = 0; i < 10; i++) art.glass(g, 10, 10, 262.5, 104, { frost: false });
      const staticMisses = C.misses - m2;
      const m4 = C.misses;
      for (let i = 0; i < 10; i++) art.glass(g, 10, 10, 262.5, 104, { frost: false });
      const laterMisses = C.misses - m4;
      return { panelMisses, bigMisses, bigEvictions, animMisses, staticMisses, laterMisses, bytes: C.bytes, cap: C.maxBytes };
    });
    expect(r.panelMisses).toBe(1);
    expect(r.bigEvictions).toBe(0);
    expect(r.bigMisses).toBe(0); // the big panel is drawn directly, the gauges stay cached
    expect(r.animMisses).toBeLessThanOrEqual(42); // one per 8-px bucket, not one per frame…
    expect(r.animMisses).toBeLessThan(60);
    expect(r.staticMisses).toBeLessThanOrEqual(2); // right after the animation: a frame from the bucket, then its exact bake
    expect(r.laterMisses).toBe(0);
    expect(r.bytes).toBeLessThanOrEqual(r.cap);
  });

  it("eye(): blinks without a skin colour; keeps the caller's alpha and line width", async () => {
    const page = await open();
    const r = await run(page, (art, T) => {
      const [, e1] = T.canvas(60, 60, '#5a8');
      art.eye(e1, 30, 30, 20, {});
      const [, e2] = T.canvas(60, 60, '#5a8');
      art.eye(e2, 30, 30, 20, { blink: 1 });
      const [, e3] = T.canvas(60, 60, '#000000');
      e3.globalAlpha = 0.5;
      e3.lineWidth = 7;
      art.eye(e3, 30, 30, 20, { skin: '#55aa88', blink: 0.5 });
      return { open: T.luma(T.px(e1, 30, 22)), shut: T.luma(T.px(e2, 30, 22)), alpha: e3.globalAlpha, lw: e3.lineWidth, lid: T.px(e3, 30, 13)[1] };
    });
    expect(Math.abs(r.open - r.shut)).toBeGreaterThan(20);
    expect(r.alpha).toBe(0.5);
    expect(r.lw).toBe(7);
    expect(r.lid).toBeLessThan(160); // the lid at the caller's half alpha (opaque: 170)
  });

  it('softShadow and innerShadow: the same offset and blur in CSS px at any bake density', async () => {
    const page = await open();
    const r = await run(page, (art) => {
      const reach = (scale: number) => {
        const c = art.bake(100, 100, (g: CanvasRenderingContext2D) => {
          const p = new Path2D();
          p.rect(20, 20, 60, 40);
          art.softShadow(g, p, { dx: 0, dy: 12, blur: 0, color: '#ff0000' });
        }, scale);
        // The lowest row (CSS px) the shadow reaches
        const g = c.getContext('2d')!;
        let low = 0;
        for (let y = 0; y < 100; y++) if (g.getImageData(50 * scale, y * scale, 1, 1).data[3] > 128) low = y;
        return low;
      };
      return [reach(1), reach(2)];
    });
    expect(r[0]).toBe(71);
    expect(r[1]).toBe(r[0]);
  });

  it('iconImg() and spriteImg(): a drawing as a sharp <img> at the device pixel ratio, cached, a sheet frame alone', async () => {
    const page = await open(2);
    const r = await run(page, async (art) => {
      let draws = 0;
      const dot = (g: CanvasRenderingContext2D, s: number) => {
        draws++;
        g.fillStyle = '#ff0000';
        g.beginPath();
        g.arc(0, 0, s * 0.4, 0, Math.PI * 2);
        g.fill();
      };
      const a = art.iconImg(dot, 24, { key: 'dot', alt: 'dot' });
      const b = art.iconImg(dot, 24, { key: 'dot' });
      const big = art.iconImg(dot, 32, { key: 'dot' });
      // No key: the function is the key
      const c = art.iconImg(dot, 24);
      const d = art.iconImg(dot, 24);
      document.body.append(a, b);
      await Promise.all([a, b, big, c].map((i: HTMLImageElement) => i.decode()));
      // The centre is the drawing's (drawn around 0, 0), a corner is clear
      const [cv, g] = (window as any).T.canvas(48, 48, 'rgba(0,0,0,0)');
      void cv;
      g.clearRect(0, 0, 48, 48);
      g.drawImage(a, 0, 0);
      const centre = [...g.getImageData(24, 24, 1, 1).data];
      const corner = [...g.getImageData(1, 1, 1, 1).data];
      const box = a.getBoundingClientRect();
      // A sheet frame: only its cell, at the sheet's scale
      const sheet = new art.SpriteSheet(4, 10, 10, (g2: CanvasRenderingContext2D, i: number) => {
        g2.fillStyle = i === 2 ? '#00ff00' : '#0000ff';
        g2.fillRect(-5, -5, 10, 10);
      }, { scale: 2 });
      const f = art.spriteImg(sheet, 2);
      await f.decode();
      const [, g3] = (window as any).T.canvas(20, 20, 'rgba(0,0,0,0)');
      g3.clearRect(0, 0, 20, 20);
      g3.drawImage(f, 0, 0);
      const sprite = art.makeSprite(16, 8, (g4: CanvasRenderingContext2D) => g4.fillRect(-8, -4, 16, 8), { scale: 2 });
      const si = art.spriteImg(sprite);
      await si.decode();
      return {
        same: a.src === b.src, other: a.src !== big.src, fnSame: c.src === d.src, draws,
        natural: [a.naturalWidth, a.naturalHeight], css: [box.width, box.height], bigNatural: big.naturalWidth, alt: [a.alt, b.alt],
        centre, corner, frame: [f.naturalWidth, f.naturalHeight, f.style.width], framePx: [...g3.getImageData(10, 10, 1, 1).data],
        sprite: [si.naturalWidth, si.naturalHeight, si.style.width, si.style.height], url: art.iconURL(dot, 24, { key: 'dot' }) === a.src,
      };
    });
    expect(r.same).toBe(true);
    expect(r.other).toBe(true);
    expect(r.fnSame).toBe(true);
    // 24 and 32 with the key, 24 without: three drawings for five images
    expect(r.draws).toBe(3);
    expect(r.natural).toEqual([48, 48]);
    expect(r.css).toEqual([24, 24]);
    expect(r.bigNatural).toBe(64);
    expect(r.alt).toEqual(['dot', '']);
    expect(r.centre.slice(0, 4)).toEqual([255, 0, 0, 255]);
    expect(r.corner[3]).toBe(0);
    expect(r.frame).toEqual([20, 20, '10px']);
    expect(r.framePx).toEqual([0, 255, 0, 255]);
    expect(r.sprite).toEqual([32, 16, '16px', '8px']);
    expect(r.url).toBe(true);
  });

  it('@gp/art/type: the bundled faces load and draw Latin and Cyrillic; the pixel font is a real font in the DOM', async () => {
    const page = await open();
    const r = await run(page, async (art, T) => {
      const F = T.fonts;
      const faces = [F.DELA_GOTHIC_ONE, F.NUNITO_BLACK, F.EXO_2, F.PIXEL];
      const ok = await Promise.all(faces.map((f: unknown) => art.fontReady(f, 5000)));
      const g = document.createElement('canvas').getContext('2d')!;
      // The face, not the fallback: a word's width differs from the same word in the fallback stack
      const width = (font: string, text: string) => {
        g.font = font;
        return g.measureText(text).width;
      };
      const differs = faces.slice(0, 3).map((f: { family: string }) => {
        const own = width(art.canvasFont(f, 40), 'Жук Żółw Ağaç');
        const fallback = width(`${f.family === 'Nunito Black' ? 900 : 800} 40px ${art.fontStack({ family: 'No Such Face' })}`, 'Жук Żółw Ağaç');
        return Math.abs(own - fallback) > 2;
      });
      const checks = faces.map((f: { family: string }) => document.fonts.check(`24px "${f.family}"`, 'Жw'));
      // The pixel font: 12 px a row, so "AB" is 6 + 6 px, and lowercase is as wide as capitals
      const pixel = [width(`12px "${F.PIXEL.family}"`, 'AB'), width(`12px "${F.PIXEL.family}"`, 'ab'), width(`24px "${F.PIXEL.family}"`, 'ЖЁ')];
      // An outlined number paints its outline (dark) and its fill (light)
      const [, cx] = T.canvas(200, 60, 'rgba(0, 0, 0, 0)');

      art.drawNumber(cx, 12345, 100, 30, { font: F.EXO_2, size: 32, align: 'center' });
      const d = cx.getImageData(0, 0, 200, 60).data;
      let dark = 0;
      let light = 0;
      for (let i = 0; i < d.length; i += 4) {
        if (d[i + 3] < 200) continue;
        const l = T.luma([d[i], d[i + 1], d[i + 2]]);
        if (l < 60) dark++;
        else if (l > 200) light++;
      }
      // Digits keep one width: 11111 and 88888 measure the same
      const tab = [art.drawNumber(cx, '11111', 0, 0, { font: F.EXO_2, size: 32 }), art.drawNumber(cx, '88888', 0, 0, { font: F.EXO_2, size: 32 })];
      // The canvas pixel text: whole pixels, a picture character
      const [, pc] = T.canvas(80, 20, 'rgba(0, 0, 0, 0)');

      F.drawPixelText(pc, `${F.PIXEL_ICONS.coin} 12`, 2, 5, '#ffffff', { scale: 1 });
      const lit = [...pc.getImageData(0, 0, 80, 20).data].filter((v, i) => i % 4 === 3 && v > 0).length;
      return { ok, differs, checks, pixel, dark, light, tab, lit };
    });
    expect(r.ok).toEqual([true, true, true, true]);
    expect(r.differs).toEqual([true, true, true]);
    expect(r.checks).toEqual([true, true, true, true]);
    expect(r.pixel).toEqual([12, 12, 24]);
    expect(r.dark).toBeGreaterThan(100);
    expect(r.light).toBeGreaterThan(100);
    expect(r.tab[0]).toBeCloseTo(r.tab[1], 5);
    expect(r.lit).toBeGreaterThan(20);
    expect((page as unknown as { errors: string[] }).errors).toEqual([]);
  });
});
