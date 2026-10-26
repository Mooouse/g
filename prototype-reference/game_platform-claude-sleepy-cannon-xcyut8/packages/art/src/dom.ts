// Drawn pictures in the DOM: an icon or a sprite the game draws in code, as an <img> (or a data URL for CSS) for its DOM
// screens — a shop card, a results line, a button, a tab. What games did by hand (Dominorum's suit marks, Idle Garage
// Evolution's car icons): paint on an offscreen canvas, toDataURL(), size the <img> — and forgot the pixel density
// (blurry on a phone) or redrew it for every card.
//
//   const coin = (g, s) => { g.fillStyle = '#ffd23f'; g.beginPath(); g.arc(0, 0, s * 0.45, 0, Math.PI * 2); g.fill(); };
//   price.prepend(iconImg(coin, 20, { key: 'coin', alt: '' }));   // 20 CSS px, drawn at the screen's density, cached
//   card.append(spriteImg(walk.frames[0]));                        // a baked Sprite or a SpriteSheet frame
//
// `draw(ctx, size)` draws centred at (0, 0) in a box of `size` CSS px — the same as iconButton()'s icon, so one function
// serves the canvas HUD and the DOM. The picture is drawn at the density (the platform's render scale, or the device
// pixel ratio when the game has no canvas of its own; at most MAX_DPR) and kept as a data URL: the same key, size and
// density give the same string, so a list of 40 cards draws its icon once. Each call returns a new <img> (an element
// can be in one place only). An <img> on the page keeps its picture: a data URL survives a lost canvas context, and
// after a density change the next call draws a sharp one.

import { MAX_DPR, density, type Ctx } from './bake.ts';
import { srcRect, type Sprite, type SpriteSheet } from './sprite.ts';

export interface IconOptions {
  /** What the picture is, for the cache ('coin', 'suit:hearts'): give it when `draw` is made anew on every call */
  key?: string;
  /** Height in CSS px when it differs from the width (`size` is then the width) */
  height?: number;
  /** Extra room on every side (CSS px) for a glow or a shadow outside the box; the <img> is that much bigger */
  pad?: number;
  /** Device px per CSS px (default: the render scale, or devicePixelRatio when no canvas set one; capped at MAX_DPR) */
  scale?: number;
  /** The <img>'s alt text (default '': a decorative picture next to its words) */
  alt?: string;
  /** A class for the <img> */
  className?: string;
}

/** The cached data URLs, most recently used last: 400 pictures (a few MB of strings at most) */
const MAX_URLS = 400;
const urls = new Map<string, string>();
/** Keys for draw functions passed without a `key`: one id per function */
const fnIds = new WeakMap<object, number>();
let nextFn = 0;
/** The data URLs of sprites, per canvas (a SpriteSheet's frames share one) */
const spriteUrls = new WeakMap<HTMLCanvasElement, Map<string, string>>();

/** Device px per CSS px for DOM pictures: the render scale a canvas game set, else the device's own, at most MAX_DPR */
export function domScale(): number {
  const d = density();
  const device = Math.min(MAX_DPR, Math.max(1, globalThis.devicePixelRatio || 1));
  // The render scale stays 1 in a game that never sized a canvas (a DOM-only screen): the device knows better then
  return d === 1 ? device : Math.min(MAX_DPR, d);
}

function remember(key: string, make: () => string): string {
  const hit = urls.get(key);
  if (hit !== undefined) {
    urls.delete(key);
    urls.set(key, hit);
    return hit;
  }
  const url = make();
  urls.set(key, url);
  if (urls.size > MAX_URLS) urls.delete(urls.keys().next().value!);
  return url;
}

function img(url: string, w: number, h: number, o: { alt?: string; className?: string }): HTMLImageElement {
  const im = new Image(Math.round(w), Math.round(h));
  im.src = url;
  im.alt = o.alt ?? '';
  im.draggable = false;
  im.decoding = 'sync';
  im.style.width = `${w}px`;
  im.style.height = `${h}px`;
  if (o.className) im.className = o.className;
  return im;
}

/**
 * The data URL (PNG) of a drawing: `draw(ctx, size, height)` centred at (0, 0) in a size×height CSS px box. For CSS
 * (`background-image: url(…)`), a favicon, or anywhere a URL goes. Cached by `key` (or by the function), size and density
 */
export function iconURL(draw: (ctx: Ctx, size: number, height: number) => void, size: number, opts: IconOptions = {}): string {
  const h = opts.height ?? size;
  const pad = opts.pad ?? 0;
  const scale = opts.scale ?? domScale();
  let id = opts.key;
  if (id === undefined) {
    let n = fnIds.get(draw);
    if (n === undefined) fnIds.set(draw, (n = nextFn++));
    id = `#fn${n}`;
  }
  return remember(`${id}|${size}x${h}|${pad}|${scale}`, () => {
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.ceil((size + pad * 2) * scale));
    c.height = Math.max(1, Math.ceil((h + pad * 2) * scale));
    const g = c.getContext('2d')!;
    g.scale(scale, scale);
    g.translate(pad + size / 2, pad + h / 2);
    draw(g, size, h);
    return c.toDataURL('image/png');
  });
}

/** A drawing as an <img> of size×height CSS px (+ pad), sharp at the screen's density; see iconURL for the cache */
export function iconImg(draw: (ctx: Ctx, size: number, height: number) => void, size: number, opts: IconOptions = {}): HTMLImageElement {
  const h = opts.height ?? size;
  const pad = opts.pad ?? 0;
  return img(iconURL(draw, size, opts), size + pad * 2, h + pad * 2, opts);
}

/** The data URL (PNG) of a baked Sprite, or of one frame of a SpriteSheet (frame 0 by default) */
export function spriteURL(sprite: Sprite | SpriteSheet, frame = 0): string {
  const s = 'frames' in sprite ? sprite.frames[Math.max(0, Math.min(sprite.frames.length - 1, frame))] : sprite;
  const [x, y, w, h] = srcRect(s);
  let per = spriteUrls.get(s.canvas);
  if (!per) spriteUrls.set(s.canvas, (per = new Map()));
  const k = `${x},${y},${w},${h}`;
  let url = per.get(k);
  if (url === undefined) {
    if (x === 0 && y === 0 && w === s.canvas.width && h === s.canvas.height) url = s.canvas.toDataURL('image/png');
    else {
      const c = document.createElement('canvas');
      c.width = Math.max(1, w);
      c.height = Math.max(1, h);
      c.getContext('2d')!.drawImage(s.canvas, x, y, w, h, 0, 0, w, h);
      url = c.toDataURL('image/png');
    }
    per.set(k, url);
  }
  return url;
}

/**
 * A baked Sprite (makeSprite, a SpriteCache entry, tint, silhouette) or a SpriteSheet frame as an <img> of the sprite's
 * CSS size (its pad included), at the density it was baked at. The sprite's canvas is read once per frame (cached with
 * it): a sprite re-baked after a density change is a new canvas, and gives a new picture
 */
export function spriteImg(sprite: Sprite | SpriteSheet, frame = 0, opts: { alt?: string; className?: string } = {}): HTMLImageElement {
  const s = 'frames' in sprite ? sprite.frames[Math.max(0, Math.min(sprite.frames.length - 1, frame))] : sprite;
  return img(spriteURL(sprite, frame), s.w, s.h, opts);
}

/** Forget the cached icon URLs (tests; a game that drew thousands of one-off pictures) */
export function clearIconCache(): void {
  urls.clear();
}
