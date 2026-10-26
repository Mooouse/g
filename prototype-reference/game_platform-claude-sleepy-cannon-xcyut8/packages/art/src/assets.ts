// Generated art (gp art): load the game's images before the first frame. assets/index.ts exports ART, a map of id → the
// bundled URL (a data: URI in a one-file portal upload); `await loadImages(ART)` decodes them all, so the first frame never
// draws an empty sprite; animated sprites are in FRAMES: `await loadFrames(FRAMES)`, then `frameAt(frames.hero, t)`. Draw
// them with drawImage (Canvas 2D), Texture.from (Pixi), this.textures.addImage (Phaser) or a THREE.Texture. Keep the life in code on top: @gp/art light, fx, rig and camera (docs/guides/art.md#5-generated-art-gp-art).

/** Decode every image of a { id: url } map; resolves when all are ready (a failed one rejects with its id) */
export async function loadImages<K extends string>(urls: Readonly<Record<K, string>>): Promise<Record<K, HTMLImageElement>> {
  const entries = await Promise.all(
    (Object.entries(urls) as [K, string][]).map(async ([id, url]) => {
      const img = new Image();
      img.decoding = 'async';
      img.src = url;
      try {
        await img.decode();
      } catch {
        throw new Error(`@gp/art/assets: the image "${id}" could not be decoded`);
      }
      return [id, img] as const;
    }),
  );
  return Object.fromEntries(entries) as Record<K, HTMLImageElement>;
}

/** Decode every animation of a { id: [url, …] } map (assets/index.ts FRAMES) */
export async function loadFrames<K extends string>(frames: Readonly<Record<K, readonly string[]>>): Promise<Record<K, HTMLImageElement[]>> {
  const entries = await Promise.all(
    (Object.entries(frames) as [K, readonly string[]][]).map(async ([id, urls]) => {
      const imgs = await loadImages(Object.fromEntries(urls.map((u, i) => [`${id}-${i + 1}`, u])) as Record<string, string>);
      return [id, urls.map((_, i) => imgs[`${id}-${i + 1}`]!)] as const;
    }),
  );
  return Object.fromEntries(entries) as Record<K, HTMLImageElement[]>;
}

/**
 * The frame to draw at time `t` (seconds) at `fps` frames a second: looping, or held on the last one (`loop: false`, an
 * attack or a death played from t = 0). The frames share their sprite's scale, not its bounds (a raised arm makes one
 * taller), so draw each at its own height times one factor, feet down:
 * `const k = 120 / img.hero.naturalHeight; const f = frameAt(frames.hero, t); drawImageSprite(ctx, f, x, y, f.naturalHeight * k, { anchorY: 1 })`.
 * A jump's height, a lunge's reach: move the sprite in code.
 */
export function frameAt<T>(frames: readonly T[], t: number, fps = 8, loop = true): T {
  if (!frames.length) throw new Error('@gp/art/assets: frameAt needs at least one frame');
  const i = Math.floor(Math.max(0, t) * fps);
  return frames[loop ? i % frames.length : Math.min(i, frames.length - 1)]!;
}

/**
 * Pixel art (game.yaml art.technique: pixel): drawn at a whole-number `scale` with smoothing off and snapped to whole
 * pixels, so every art pixel stays a crisp square. (x, y) is the feet (anchorY 1, the default) or the centre (0.5).
 */
export function drawPixelSprite(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | HTMLCanvasElement,
  x: number,
  y: number,
  scale: number,
  o: { flip?: boolean; alpha?: number; anchorY?: number } = {},
): void {
  const k = Math.max(1, Math.round(scale));
  const w = img.width * k, h = img.height * k;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  if (o.alpha !== undefined) ctx.globalAlpha *= o.alpha;
  const left = Math.round(x - w / 2), top = Math.round(y - h * (o.anchorY ?? 1));
  if (o.flip) {
    ctx.translate(left + w, top);
    ctx.scale(-1, 1);
    ctx.drawImage(img, 0, 0, w, h);
  } else ctx.drawImage(img, left, top, w, h);
  ctx.restore();
}

/**
 * Draw an image centred at (x, y), `height` px tall (the width follows its aspect), with an optional squash/stretch and
 * rotation — a generated sprite gets the same life as a code-drawn one (breathe, bob, squash from @gp/art/rig).
 */
export function drawImageSprite(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  height: number,
  o: { sx?: number; sy?: number; rot?: number; alpha?: number; flip?: boolean; anchorY?: number } = {},
): void {
  const h = height;
  const w = (img.naturalWidth / img.naturalHeight) * h;
  ctx.save();
  ctx.translate(x, y);
  if (o.rot) ctx.rotate(o.rot);
  ctx.scale((o.flip ? -1 : 1) * (o.sx ?? 1), o.sy ?? 1);
  if (o.alpha !== undefined) ctx.globalAlpha *= o.alpha;
  // anchorY 0.5: centred; 1: the feet at y (a character standing on the ground)
  ctx.drawImage(img, -w / 2, -h * (o.anchorY ?? 0.5), w, h);
  ctx.restore();
}
