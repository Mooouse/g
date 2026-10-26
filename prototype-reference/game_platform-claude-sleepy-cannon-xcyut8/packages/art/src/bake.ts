// Baking: expensive drawing (gradients, shadowBlur, noise, a whole background) done once into an offscreen canvas at the
// screen's pixel density, then blitted every frame. Builds on @gp/core's render scale (renderScale / setRenderScale /
// onRenderScaleChange / offscreen): one density for the whole page, so the kits' themes and @gp/art re-bake together.
//
// Every bake is stale when the density changes (a window dragged to another monitor, a zoom) or the canvas loses its
// context (a GPU reset or memory pressure on a phone: Chrome fires `contextlost` / `contextrestored` on 2D canvases too,
// and offscreen canvases may come back blank). Then `invalidateBakes()` bumps the bake generation and every cache built
// on it (Baked, SpriteCache, silhouette(), the glow sprites, the scenery's tiles and overlay, the HUD) re-bakes on its
// next use. A canvas the game holds itself — bake(), makeSprite(), a SpriteSheet, tint() — does not: make it through
// keepBaked() (or key it with bakeGen() in a SpriteCache), and re-upload engine textures from onInvalidate().

import { onRenderScaleChange, renderScale, setRenderScale } from '@gp/core/draw';

export type Ctx = CanvasRenderingContext2D;
export type DrawFn = (ctx: Ctx, w: number, h: number) => void;

/** The device-pixel-ratio cap: past 2 a phone pays 2.25× the pixels of 2 for no visible gain */
export const MAX_DPR = 2;

let gen = 0;
const stale = new Set<() => void>();

/** Mark every bake stale (they re-bake on their next use) */
export function invalidateBakes(): void {
  gen++;
  for (const f of stale) f();
}

/** The bake generation: a cache compares it with the one it baked at */
export const bakeGen = (): number => gen;

/** Called after every invalidation; returns the unsubscribe */
export function onInvalidate(fn: () => void): () => void {
  stale.add(fn);
  return () => void stale.delete(fn);
}

onRenderScaleChange((dprChanged) => {
  if (dprChanged) invalidateBakes();
});

/** The pixel density bakes are made at (the platform's render scale) */
export const density = (): number => renderScale();

/**
 * Size a canvas to the window (or the given CSS size) at the capped device pixel ratio and make that the platform's
 * render scale: when it changes, every bake re-bakes. Returns the size in CSS px and the ratio used.
 */
export function fitCanvas(canvas: HTMLCanvasElement, opts: { maxDpr?: number; width?: number; height?: number } = {}): { w: number; h: number; dpr: number } {
  const dpr = Math.max(0.5, Math.min(opts.maxDpr ?? MAX_DPR, globalThis.devicePixelRatio || 1));
  const w = opts.width ?? innerWidth;
  const h = opts.height ?? innerHeight;
  canvas.width = Math.max(1, Math.round(w * dpr));
  canvas.height = Math.max(1, Math.round(h * dpr));
  setRenderScale(dpr);
  return { w, h, dpr };
}

/**
 * Re-bake everything when the canvas's 2D context comes back after a loss (and once more when it is lost, so nothing
 * draws from a blank cache meanwhile). WebGL engines get the same from the host's pause ('context'). Returns the stop.
 */
export function watchContext(canvas: HTMLCanvasElement): () => void {
  const on = () => invalidateBakes();
  canvas.addEventListener('contextlost', on);
  canvas.addEventListener('contextrestored', on);
  return () => {
    canvas.removeEventListener('contextlost', on);
    canvas.removeEventListener('contextrestored', on);
  };
}

/** A blank canvas of exactly these device pixels, and its context */
export function canvas2d(wpx: number, hpx: number): [HTMLCanvasElement, Ctx] {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.ceil(wpx));
  c.height = Math.max(1, Math.ceil(hpx));
  return [c, c.getContext('2d')!];
}

/**
 * Draw once into an offscreen canvas of w×h CSS px at `scale` device px per CSS px (default: the density). The canvas is
 * the caller's: not re-baked after a density change or a lost context (Baked or keepBaked() do that)
 */
export function bake(w: number, h: number, draw: DrawFn, scale = density()): HTMLCanvasElement {
  const [c, ctx] = canvas2d(w * scale, h * scale);
  ctx.scale(scale, scale);
  draw(ctx, w, h);
  return c;
}

/**
 * A drawing kept baked: `get(w, h, key)` re-bakes only when the size, the key (anything that changes the picture,
 * compared with ===) or the bake generation changed. A static background layer, a panel, a title.
 */
/**
 * Keep something baked fresh: `const sheet = keepBaked(() => new SpriteSheet(…))`, then `sheet()` wherever it is used —
 * the same object until the bake generation moves (a density change, a lost context), then made again on the next call.
 * For a makeSprite(), a SpriteSheet, a tint() or a bake() the game holds.
 */
export function keepBaked<T>(make: () => T): () => T {
  let made = -1;
  let v: T;
  return () => {
    if (made !== gen) {
      v = make();
      made = gen;
    }
    return v;
  };
}

export class Baked {
  private c: HTMLCanvasElement | null = null;
  private bw = -1;
  private bh = -1;
  private bd = -1;
  private bg = -1;
  private k: unknown;
  private readonly fn: DrawFn;
  /** How many times it was baked (tests, the dev meter) */
  bakes = 0;
  constructor(draw: DrawFn) {
    this.fn = draw;
  }
  get(w: number, h: number, key?: unknown): HTMLCanvasElement {
    // Numbers compared, no signature string built per frame
    const d = density();
    if (!this.c || w !== this.bw || h !== this.bh || d !== this.bd || gen !== this.bg || key !== this.k) {
      this.c = bake(w, h, this.fn);
      this.bw = w;
      this.bh = h;
      this.bd = d;
      this.bg = gen;
      this.k = key;
      this.bakes++;
    }
    return this.c;
  }
  /** Blit it at (x, y), w×h CSS px */
  draw(ctx: Ctx, x: number, y: number, w: number, h: number, key?: unknown): void {
    ctx.drawImage(this.get(w, h, key), x, y, w, h);
  }
}
