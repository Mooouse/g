// Backgrounds with depth: a gradient sky (sun or moon glow, stars, nebulae, planets), parallax layers of procedural
// silhouettes — hills, mountains with snow, forest, city, industrial machinery, dunes, clouds, drifting fog — with
// atmospheric perspective (the farther, the closer to the haze colour, the lower the contrast), fog pooling at each
// layer's foot, god rays, a vignette and baked film grain. Every layer is baked once as a seamless tile at the density
// and scrolled by its depth; only small things animate (beacons blink, fog drifts, stars twinkle, rays breathe).
// No empty screen: the layers fill it from the horizon down.

import { Baked, bake, bakeGen, density, type Ctx } from './bake.ts';
import { alpha, mix, shade } from './color.ts';
import { glow, paint } from './material.ts';
import { fbm1, hash } from './noise.ts';
import { cloud as cloudPath } from './shapes.ts';

export type LayerKind = 'hills' | 'mountains' | 'forest' | 'city' | 'industrial' | 'dunes' | 'clouds' | 'fog';

export interface LayerSpec {
  kind: LayerKind;
  /** 0 the horizon … 1 the foreground: the parallax factor, and how much haze it gets (none at 1) */
  depth: number;
  /** The silhouette's own colour (the haze is mixed in by depth) */
  color: string;
  /** Where its foot is, as a share of the view height (1: the bottom of the screen) */
  y?: number;
  /** Its tallest point as a share of the view height */
  height?: number;
  seed?: number;
  /** Lit windows and beacons (city, industrial) */
  lights?: string;
  /** Fog drift in px/s (fog layers) */
  drift?: number;
  /** How opaque the fog is, 0…1 */
  opacity?: number;
  /** Clouds: the direction toward their light (radians; default from above) and their rim colour */
  light?: number;
  rim?: string;
}

export interface SceneryOptions {
  /** The sky from the top down: two or more colours */
  sky: string[];
  /** The atmosphere: what far layers fade into */
  haze: string;
  layers: LayerSpec[];
  /** A sun or a moon: its position as shares of the view, radius in px */
  sun?: { x: number; y: number; r: number; color: string; glow?: number };
  stars?: number;
  /** Nebula colours (space and night skies) */
  nebula?: string[];
  /** A planet in the sky: shares of the view, radius in px */
  planet?: { x: number; y: number; r: number; color: string; ring?: string };
  /** God rays from the sun (or from {x, y} shares) */
  rays?: { color: string; count?: number; strength?: number; x?: number; y?: number };
  /** Width of one seamless tile in CSS px (default 1600) */
  tile?: number;
  seed?: number;
  /**
   * Far (depth < 0.25) and fog layers are hazy and soft: on a screen denser than 1 they are baked at this share of the
   * density (default 0.5, never under 1 device px per CSS px) — a quarter of the memory, no visible loss
   */
  farScale?: number;
  /** The most device pixels one layer's tile may take (default 4 M ≈ 16 MB): a bigger tile is baked at a lower scale */
  maxTilePixels?: number;
}

interface Tile {
  canvas: HTMLCanvasElement;
  w: number;
  h: number;
  top: number;
  beacons: [number, number][];
  /** Device px per CSS px it was baked at */
  scale: number;
  /** The colour under a layer that doesn't reach the bottom (its foot), computed once */
  foot: string;
}

/** A layer's tile height in CSS px for a view vh high (its silhouette plus the room above it) */
function tileHeight(L: LayerSpec, vh: number): number {
  const h = Math.max(8, (L.height ?? 0.3) * vh);
  return h + (L.kind === 'fog' ? h * 0.3 : 6);
}

/** A seamless ridge: n samples across the tile, periodic */
function ridge(tw: number, seed: number, cells: number, octaves: number, sharp = 0): (x: number) => number {
  return (x: number) => {
    const u = (x / tw) * cells;
    let v = fbm1(u, octaves, seed, cells);
    if (sharp) v = v * (1 - sharp) + (1 - Math.abs(v) * 2) * sharp;
    return v;
  };
}

/** Draw `fn` at x and wrapped copies, so objects near the tile's edges continue on the other side */
function wrapX(tw: number, x: number, w: number, fn: (x: number) => void): void {
  fn(x);
  if (x + w > tw) fn(x - tw);
  if (x - w < 0) fn(x + tw);
}

function fillRidge(g: Ctx, tw: number, th: number, top: number, f: (x: number) => number, amp: number): Path2D {
  const p = new Path2D();
  p.moveTo(0, th);
  for (let x = 0; x <= tw; x += 4) p.lineTo(x, top + amp * (0.5 - 0.5 * f(x)));
  p.lineTo(tw, th);
  p.closePath();
  g.fill(p);
  return p;
}

/** Bake one layer's tile at `scale` device px per CSS px: the silhouette, its rim light, its windows, the fog at its foot */
function bakeLayer(L: LayerSpec, o: SceneryOptions, tw: number, vh: number, scale: number): Tile {
  const seed = L.seed ?? 1;
  const top = 0;
  const h = Math.max(8, (L.height ?? 0.3) * vh);
  const pad = L.kind === 'fog' ? h * 0.3 : 6;
  const th = h + pad;
  const haze = o.haze;
  // Atmospheric perspective: far layers take the haze's colour and lose contrast
  const k = Math.max(0, Math.min(1, 1 - L.depth));
  const col = mix(L.color, haze, k * 0.82);
  const dark = mix(shade(L.color, -0.35), haze, k * 0.75);
  const lightC = L.lights ? mix(L.lights, haze, k * 0.5) : null;
  const beacons: [number, number][] = [];
  const c = bake(tw, th, (g) => {
    const grad = g.createLinearGradient(0, 0, 0, th);
    grad.addColorStop(0, mix(col, shade(col, 0.4), 0.35));
    grad.addColorStop(0.45, col);
    grad.addColorStop(1, dark);
    g.fillStyle = grad;
    switch (L.kind) {
      case 'hills':
      case 'dunes': {
        const f = ridge(tw, seed, L.kind === 'dunes' ? 3 : 4, L.kind === 'dunes' ? 2 : 3);
        const p = fillRidge(g, tw, th, top + pad, f, h * 0.75);
        // A soft light on the crests
        g.save();
        g.clip(p);
        g.globalAlpha = 0.35;
        g.strokeStyle = shade(col, 0.45);
        g.lineWidth = 3;
        g.stroke(p);
        g.restore();
        break;
      }
      case 'mountains': {
        const f = ridge(tw, seed, 5, 5, 0.55);
        const p = fillRidge(g, tw, th, top + pad, f, h * 0.95);
        g.save();
        g.clip(p);
        // Snow caps and the lit side of each peak: a lighter ridge offset down
        g.fillStyle = alpha(mix(shade(col, 0.6), haze, k * 0.4), 0.55);
        const q = new Path2D();
        q.moveTo(0, 0);
        for (let x = 0; x <= tw; x += 4) q.lineTo(x, pad + h * 0.95 * (0.5 - 0.5 * f(x)) + h * 0.12 + h * 0.08 * f(x * 3.1));
        q.lineTo(tw, 0);
        q.closePath();
        g.fill(q);
        // Slope shading: darker where the ridge falls to the right (light from the left)
        for (let x = 0; x < tw; x += 6) {
          const d = f(x + 6) - f(x);
          if (d < 0) {
            g.fillStyle = alpha(shade(col, -0.5), Math.min(0.35, -d * 6));
            g.fillRect(x, 0, 6, th);
          }
        }
        g.restore();
        break;
      }
      case 'forest': {
        const f = ridge(tw, seed, 4, 3);
        fillRidge(g, tw, th, top + pad + h * 0.45, f, h * 0.3);
        const n = Math.round(tw / 14);
        for (let i = 0; i < n; i++) {
          const x = hash(i, seed) * tw;
          const base = pad + h * 0.45 + h * 0.3 * (0.5 - 0.5 * f(x)) + 6;
          const ht = h * (0.25 + 0.4 * hash(i + 999, seed));
          const wd = ht * (0.32 + 0.12 * hash(i + 77, seed));
          wrapX(tw, x, wd, (xx) => {
            g.beginPath();
            for (let s = 0; s < 3; s++) {
              const y0 = base - ht * (s * 0.28);
              const ww = wd * (1 - s * 0.24);
              g.moveTo(xx - ww / 2, y0);
              g.lineTo(xx, y0 - ht * 0.48);
              g.lineTo(xx + ww / 2, y0);
            }
            g.fill();
            g.fillRect(xx - wd * 0.05, base - 2, wd * 0.1, 8);
          });
        }
        break;
      }
      case 'city':
      case 'industrial': {
        const ind = L.kind === 'industrial';
        g.fillRect(0, th - h * 0.12, tw, h * 0.12);
        let x = 0;
        let i = 0;
        while (x < tw) {
          const r = (j: number) => hash(i * 17 + j, seed);
          const bw = (ind ? 40 : 30) + r(1) * (ind ? 90 : 70);
          const bh = h * (0.25 + 0.7 * r(2) ** 1.3);
          const kind = ind ? Math.floor(r(3) * 5) : r(3) < 0.15 ? 9 : 0;
          const bx = x;
          const draw = (xx: number) => {
            const y0 = th - bh;
            if (!ind || kind === 0) {
              g.fillRect(xx, y0, bw, bh);
              if (kind === 9) g.fillRect(xx + bw * 0.45, y0 - bh * 0.25, bw * 0.1, bh * 0.25);
            } else if (kind === 1) {
              // A chimney with bands
              const cw = bw * 0.28;
              g.fillRect(xx + bw * 0.36, th - bh * 1.25, cw, bh * 1.25);
              g.fillRect(xx, th - bh * 0.4, bw, bh * 0.4);
            } else if (kind === 2) {
              // A tank: a cylinder with a dome
              g.beginPath();
              g.ellipse(xx + bw / 2, th - bh * 0.62, bw / 2, bh * 0.16, 0, Math.PI, 0);
              g.rect(xx, th - bh * 0.62, bw, bh * 0.62);
              g.fill();
            } else if (kind === 3) {
              // A lattice tower
              g.save();
              g.strokeStyle = g.fillStyle as string;
              g.lineWidth = 2.2;
              const tx = xx + bw / 2;
              const tt = th - bh * 1.15;
              g.beginPath();
              g.moveTo(tx - bw * 0.3, th);
              g.lineTo(tx - 2, tt);
              g.moveTo(tx + bw * 0.3, th);
              g.lineTo(tx + 2, tt);
              const steps = 7;
              for (let s = 0; s < steps; s++) {
                const ya = th - (s / steps) * (th - tt);
                const yb = th - ((s + 1) / steps) * (th - tt);
                const wa = bw * 0.3 * (1 - s / steps) + 2;
                const wb = bw * 0.3 * (1 - (s + 1) / steps) + 2;
                g.moveTo(tx - wa, ya);
                g.lineTo(tx + wb, yb);
                g.moveTo(tx + wa, ya);
                g.lineTo(tx - wb, yb);
              }
              g.stroke();
              g.restore();
              beacons.push([tx, tt - 3]);
            } else {
              // A block with a gantry and pipes
              g.fillRect(xx, th - bh * 0.7, bw, bh * 0.7);
              g.fillRect(xx - bw * 0.2, th - bh * 0.85, bw * 1.4, 5);
              g.fillRect(xx + bw * 0.1, th - bh * 0.85, 4, bh * 0.15);
            }
          };
          wrapX(tw, bx, bw, draw);
          // Lit windows: a seeded share on
          if (lightC && (!ind || kind === 0 || kind === 4)) {
            const y0 = th - bh * (ind ? 0.7 : 1);
            g.save();
            g.fillStyle = lightC;
            for (let wy = y0 + 8; wy < th - 10; wy += 9)
              for (let wx = bx + 5; wx < bx + bw - 6; wx += 8) if (hash(Math.round(wx * 31 + wy * 7), seed) < 0.22) wrapX(tw, wx, 4, (q) => g.fillRect(q, wy, 3.5, 4.5));
            g.restore();
          }
          if (!ind && kind === 9) beacons.push([bx + bw / 2, th - bh * 1.25 - 2]);
          if (ind && kind === 1 && r(9) < 0.6) beacons.push([bx + bw * 0.5, th - bh * 1.25 - 3]);
          x += bw + (ind ? 4 + r(5) * 26 : 2 + r(5) * 8);
          i++;
        }
        // Pipes running between the machines
        if (ind) {
          g.save();
          g.strokeStyle = g.fillStyle as string;
          for (let pi = 0; pi < 3; pi++) {
            const py = th - h * (0.18 + 0.12 * pi);
            g.lineWidth = 3 + pi;
            g.beginPath();
            g.moveTo(0, py);
            g.lineTo(tw, py);
            g.stroke();
          }
          g.restore();
        }
        break;
      }
      case 'clouds': {
        const n = Math.round(tw / 240);
        for (let i = 0; i < n; i++) {
          const cw = 140 + hash(i, seed) * 220;
          const x = hash(i + 50, seed) * tw;
          const y = pad + h * (0.2 + 0.6 * hash(i + 90, seed));
          // Each cloud a little nearer or farther (its own value), so overlapping ones stay apart
          const cc = mix(col, haze, hash(i + 130, seed) * 0.35);
          wrapX(tw, x, cw, (xx) => {
            const p = cloudPath(xx, y, cw, cw * 0.32, seed + i);
            paint(g, p, { x: xx - cw / 2, y: y - cw * 0.3, w: cw, h: cw * 0.5 }, cc, { style: 'matte', light: L.light ?? -Math.PI / 2, rim: L.rim ?? alpha(shade(cc, 0.7), 0.8), ao: 0.35, bounce: L.rim ?? false });
          });
        }
        break;
      }
      case 'fog': {
        // Soft blobs: a band of fog that tiles seamlessly
        const n = Math.round(tw / 70);
        for (let i = 0; i < n; i++) {
          const x = hash(i, seed) * tw;
          const y = pad + h * (0.25 + 0.5 * hash(i + 40, seed));
          const r = h * (0.35 + 0.4 * hash(i + 80, seed));
          wrapX(tw, x, r, (xx) => {
            const rg = g.createRadialGradient(xx, y, 0, xx, y, r);
            rg.addColorStop(0, alpha(col, 0.32));
            rg.addColorStop(1, alpha(col, 0));
            g.fillStyle = rg;
            g.fillRect(xx - r, y - r, r * 2, r * 2);
          });
        }
        break;
      }
    }
    // Fog pooling at the foot of every far layer: the layers separate in depth
    if (L.kind !== 'fog' && L.kind !== 'clouds' && k > 0.05) {
      g.globalCompositeOperation = 'source-atop';
      const fg = g.createLinearGradient(0, th - h * 0.55, 0, th);
      fg.addColorStop(0, alpha(haze, 0));
      fg.addColorStop(1, alpha(haze, 0.25 + 0.5 * k));
      g.fillStyle = fg;
      g.fillRect(0, 0, tw, th);
      g.globalCompositeOperation = 'source-over';
    }
  }, scale);
  return { canvas: c, w: tw, h: th, top: pad, beacons, scale, foot: mix(shade(L.color, -0.35), o.haze, Math.max(0, 1 - L.depth) * 0.75) };
}

/**
 * Where to blit a layer's tile across a view `w` CSS px wide, scrolled by `scroll` CSS px: [x, width] in CSS px per
 * copy, edge to edge with no gap. When the tile's scale is the transform's (within 0.4 %: a fractional device pixel
 * ratio rounds the canvas), each copy is a plain 1:1 blit on whole device pixels, the copies a tile's device width
 * apart; otherwise each is stretched to tile.w with its edges on whole device pixels, so neighbours meet exactly.
 */
export function placeTiles(m: { a: number; b: number; c: number; d: number; e: number }, tile: { w: number; scale: number; canvas: { width: number } }, scroll: number, w: number): { plain: boolean; at: [number, number][] } {
  const kx = m.a || 1;
  const at: [number, number][] = [];
  const plain = m.b === 0 && m.c === 0 && Math.abs(kx / tile.scale - 1) < 0.004 && Math.abs((m.d || 1) / tile.scale - 1) < 0.004;
  if (plain) {
    // In device px: the period is the tile's own width, the scroll moves by the tile's px
    const P = tile.canvas.width;
    let off = -((scroll * tile.scale) % P);
    if (off > 0) off -= P;
    const x0 = Math.round(m.e + off);
    const end = m.e + w * kx;
    for (let x = x0; x < end; x += P) at.push([(x - m.e) / kx, P / kx]);
    return { plain, at };
  }
  let off = -(scroll % tile.w);
  if (off > 0) off -= tile.w;
  for (let x = off; x < w; x += tile.w) {
    const a = Math.round(x * kx + m.e);
    const b = Math.round((x + tile.w) * kx + m.e);
    at.push([(a - m.e) / kx, (b - a) / kx]);
  }
  return { plain, at };
}

export class Scenery {
  readonly o: SceneryOptions;
  private sky: Baked;
  private tiles = new Map<number, { key: string; tile: Tile }>();
  private rays: Baked;
  constructor(o: SceneryOptions) {
    this.o = o;
    this.sky = new Baked((g, w, h) => drawSky(g, w, h, o));
    this.rays = new Baked((g, w, h) => {
      const r = o.rays!;
      const sx = (r.x ?? o.sun?.x ?? 0.7) * w;
      const sy = (r.y ?? o.sun?.y ?? 0.1) * h;
      const n = r.count ?? 7;
      const len = Math.hypot(w, h);
      for (let i = 0; i < n; i++) {
        const a = Math.PI * 0.5 + (hash(i, o.seed ?? 3) - 0.5) * 1.6;
        const wd = 0.03 + 0.06 * hash(i + 9, o.seed ?? 3);
        const gr = g.createRadialGradient(sx, sy, 0, sx, sy, len * 0.9);
        gr.addColorStop(0, alpha(r.color, 0.5));
        gr.addColorStop(1, alpha(r.color, 0));
        g.fillStyle = gr;
        g.beginPath();
        g.moveTo(sx, sy);
        g.lineTo(sx + Math.cos(a - wd) * len, sy + Math.sin(a - wd) * len);
        g.lineTo(sx + Math.cos(a + wd) * len, sy + Math.sin(a + wd) * len);
        g.fill();
      }
    });
  }
  private tile(i: number, w: number, h: number): Tile {
    const L = this.o.layers[i];
    const tw = Math.max(this.o.tile ?? 1600, Math.ceil(w));
    const d = density();
    const key = `${tw}x${Math.round(h)}@${d}#${bakeGen()}`;
    const hit = this.tiles.get(i);
    if (hit && hit.key === key && hit.tile.canvas.width > 0) return hit.tile;
    // At the density exactly: drawn 1:1 on whole pixels, a layer is a plain copy (a scaled one is filtered: ≈ 8× slower
    // on a software rasterizer). Far and fog layers at a lower one on a dense screen, every tile under the memory cap
    let scale = d;
    if (d > 1 && (L.kind === 'fog' || L.depth < 0.25)) scale = Math.max(1, d * (this.o.farScale ?? 0.5));
    const px = tw * tileHeight(L, h);
    const cap = this.o.maxTilePixels ?? 4_000_000;
    if (px * scale * scale > cap) scale = Math.sqrt(cap / px);
    const tile = bakeLayer(L, this.o, tw, h, scale);
    this.tiles.set(i, { key, tile });
    return tile;
  }
  /** Device bytes the baked layer tiles take now (the memory cap's measure; tests, the dev meter) */
  get bytes(): number {
    let b = 0;
    for (const { tile } of this.tiles.values()) b += tile.canvas.width * tile.canvas.height * 4;
    return b;
  }
  /** Re-bake the layers on their next draw (after a palette change) */
  invalidate(): void {
    this.tiles.clear();
  }
  /**
   * Draw the whole background for a w×h CSS px view. `cam` is the camera's centre in the world (or {x: 0, y: 0}); t the
   * time in seconds (for what animates). `layers`: draw only these layer indices (to put the action between them; −1 is
   * the sky). `detail` false skips the small animated extras (rays, twinkling stars, beacons): AutoQuality's `detail`.
   */
  draw(ctx: Ctx, w: number, h: number, cam: { x: number; y: number }, t = 0, layers?: number[], detail = true): void {
    const o = this.o;
    if (!layers || layers.includes(-1)) {
      this.sky.draw(ctx, 0, 0, w, h);
      // Twinkling stars over the baked ones
      if (o.stars && detail) {
        const a0 = ctx.globalAlpha;
        for (let i = 0; i < 14; i++) {
          const tw = 0.5 + 0.5 * Math.sin(t * (1.3 + hash(i + 7, 5)) + i * 2.1);
          glow(ctx, hash(i, 11) * w, hash(i, 12) * h * 0.55, 3 + 3 * tw, '#dfe8ff', 0.45 * tw);
        }
        ctx.globalAlpha = a0;
      }
      if (o.rays && detail) {
        const a0 = ctx.globalAlpha;
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = a0 * (o.rays.strength ?? 0.5) * (0.8 + 0.2 * Math.sin(t * 0.7));
        this.rays.draw(ctx, 0, 0, w, h);
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = a0;
      }
    }
    const m = ctx.getTransform();
    o.layers.forEach((L, i) => {
      if (layers && !layers.includes(i)) return;
      const tile = this.tile(i, w, h);
      const footY = (L.y ?? 1) * h - tile.h + cam.y * -L.depth * 0.15;
      const a0 = ctx.globalAlpha;
      if (L.kind === 'fog') ctx.globalAlpha = a0 * (L.opacity ?? 0.8);
      const xs = placeTiles(m, tile, (cam.x * L.depth + (L.drift ?? 0) * t), w);
      // The vertical edges on whole device pixels too: the tile's own height when it is a plain copy, else stretched
      const ky = m.d || 1;
      const fy = (Math.round(footY * ky + m.f) - m.f) / ky;
      const fh = xs.plain ? tile.canvas.height / ky : (Math.round((footY + tile.h) * ky + m.f) - m.f) / ky - fy;
      for (const [x, cw] of xs.at) ctx.drawImage(tile.canvas, x, fy, cw, fh);
      ctx.globalAlpha = a0;
      // Below a layer that doesn't reach the bottom: its foot colour continues (no gap under the hills)
      if ((L.y ?? 1) < 1 && L.kind !== 'fog' && L.kind !== 'clouds') {
        ctx.fillStyle = tile.foot;
        ctx.fillRect(0, fy + fh - 1, w, h - fy - fh + 1);
      }
      if (detail && tile.beacons.length && L.lights) {
        const k = fh / tile.h;
        for (const [bx, by] of tile.beacons) {
          const on = 0.5 + 0.5 * Math.sin(t * 2.4 + bx * 0.13);
          for (const [x, cw] of xs.at) {
            const px = x + bx * (cw / tile.w);
            if (px > -20 && px < w + 20) glow(ctx, px, fy + by * k, 9 + 5 * L.depth, '#ff4b3e', 0.35 + 0.65 * on);
          }
        }
      }
    });
  }
}

function drawSky(g: Ctx, w: number, h: number, o: SceneryOptions): void {
  const gr = g.createLinearGradient(0, 0, 0, h);
  o.sky.forEach((c, i) => gr.addColorStop(i / Math.max(1, o.sky.length - 1), c));
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
  const seed = o.seed ?? 3;
  if (o.nebula)
    o.nebula.forEach((c, i) => {
      for (let j = 0; j < 4; j++) {
        const x = hash(i * 9 + j, seed) * w;
        const y = hash(i * 9 + j + 4, seed) * h * 0.6;
        const r = Math.max(w, h) * (0.15 + 0.2 * hash(i * 9 + j + 8, seed));
        const rg = g.createRadialGradient(x, y, 0, x, y, r);
        rg.addColorStop(0, alpha(c, 0.22));
        rg.addColorStop(1, alpha(c, 0));
        g.globalCompositeOperation = 'lighter';
        g.fillStyle = rg;
        g.fillRect(x - r, y - r, r * 2, r * 2);
        g.globalCompositeOperation = 'source-over';
      }
    });
  if (o.stars) {
    for (let i = 0; i < o.stars; i++) {
      const x = hash(i, seed + 1) * w;
      const y = hash(i, seed + 2) * h * 0.7;
      const s = hash(i, seed + 3);
      g.globalAlpha = (0.25 + 0.75 * s) * (1 - y / (h * 0.75));
      g.fillStyle = s > 0.92 ? '#fff4d6' : '#dfe8ff';
      g.fillRect(x, y, s > 0.8 ? 2 : 1.2, s > 0.8 ? 2 : 1.2);
    }
    g.globalAlpha = 1;
  }
  if (o.sun) {
    const s = o.sun;
    const x = s.x * w;
    const y = s.y * h;
    const rg = g.createRadialGradient(x, y, 0, x, y, s.r * 6 * (s.glow ?? 1));
    rg.addColorStop(0, alpha(s.color, 0.55));
    rg.addColorStop(0.25, alpha(s.color, 0.18));
    rg.addColorStop(1, alpha(s.color, 0));
    g.fillStyle = rg;
    g.fillRect(0, 0, w, h);
    const disc = g.createRadialGradient(x, y, 0, x, y, s.r);
    disc.addColorStop(0, shade(s.color, 0.8));
    disc.addColorStop(0.8, shade(s.color, 0.4));
    disc.addColorStop(1, alpha(s.color, 0.6));
    g.fillStyle = disc;
    g.beginPath();
    g.arc(x, y, s.r, 0, Math.PI * 2);
    g.fill();
  }
  if (o.planet) planet(g, o.planet.x * w, o.planet.y * h, o.planet.r, o.planet.color, { ring: o.planet.ring, haze: o.haze });
}

/** A planet: a lit sphere with an atmosphere glow on its rim, a terminator, bands and an optional ring */
export function planet(g: Ctx, x: number, y: number, r: number, color: string, o: { ring?: string; haze?: string; light?: number } = {}): void {
  const light = o.light ?? -2.5;
  const ring = o.ring;
  const drawRing = (front: boolean) => {
    if (!ring) return;
    g.save();
    g.translate(x, y);
    g.rotate(-0.35);
    g.scale(1, 0.26);
    g.beginPath();
    g.arc(0, 0, r * 1.9, front ? 0 : Math.PI, front ? Math.PI : Math.PI * 2);
    g.strokeStyle = alpha(ring, 0.55);
    g.lineWidth = r * 0.28;
    g.stroke();
    g.strokeStyle = alpha(shade(ring, 0.5), 0.35);
    g.lineWidth = r * 0.06;
    g.stroke();
    g.restore();
  };
  drawRing(false);
  const at = g.createRadialGradient(x, y, r * 0.9, x, y, r * 1.35);
  at.addColorStop(0, alpha(shade(color, 0.5), 0.45));
  at.addColorStop(1, alpha(color, 0));
  g.fillStyle = at;
  g.fillRect(x - r * 1.4, y - r * 1.4, r * 2.8, r * 2.8);
  const body = new Path2D();
  body.arc(x, y, r, 0, Math.PI * 2);
  paint(g, body, { x: x - r, y: y - r, w: r * 2, h: r * 2 }, color, { style: 'matte', light, rim: shade(color, 0.7), ao: 0.9, bounce: false });
  g.save();
  g.clip(body);
  for (let i = 0; i < 5; i++) {
    g.fillStyle = alpha(i % 2 ? shade(color, 0.25) : shade(color, -0.25), 0.18);
    g.fillRect(x - r, y - r + (i + 0.5) * r * 0.36 + Math.sin(i * 1.7) * r * 0.05, r * 2, r * 0.12);
  }
  g.restore();
  drawRing(true);
}

/** A vignette and film grain in one overlay: bake once per size, draw last (grain moves every frame, seeded) */
export class Overlay {
  private vig: Baked;
  private grain: CanvasPattern | null = null;
  private grainKey = '';
  vignette: number;
  grainAmount: number;
  color: string;
  private frame = 0;
  constructor(o: { vignette?: number; grain?: number; color?: string } = {}) {
    this.vignette = o.vignette ?? 0.55;
    this.grainAmount = o.grain ?? 0.06;
    this.color = o.color ?? '#05071a';
    this.vig = new Baked((g, w, h) => {
      const r = Math.hypot(w, h) / 2;
      const rg = g.createRadialGradient(w / 2, h * 0.45, r * 0.35, w / 2, h / 2, r);
      rg.addColorStop(0, alpha(this.color, 0));
      rg.addColorStop(0.65, alpha(this.color, this.vignette * 0.35));
      rg.addColorStop(1, alpha(this.color, this.vignette));
      g.fillStyle = rg;
      g.fillRect(0, 0, w, h);
    });
  }
  draw(ctx: Ctx, w: number, h: number, grain = true): void {
    if (this.vignette > 0) this.vig.draw(ctx, 0, 0, w, h, this.vignette);
    if (!grain || this.grainAmount <= 0) return;
    const key = `${this.grainAmount}#${bakeGen()}`;
    if (!this.grain || this.grainKey !== key) {
      const c = bake(128, 128, (g) => {
        const img = g.getImageData(0, 0, 128, 128);
        for (let i = 0; i < img.data.length; i += 4) {
          const v = hash(i, 77) * 255;
          img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
          img.data[i + 3] = 255 * this.grainAmount * (0.4 + 0.6 * hash(i, 78));
        }
        g.putImageData(img, 0, 0);
      }, 1);
      this.grain = ctx.createPattern(c, 'repeat');
      this.grainKey = key;
    }
    if (!this.grain) return;
    this.frame++;
    const ox = Math.floor(hash(this.frame, 5) * 128);
    const oy = Math.floor(hash(this.frame, 6) * 128);
    const b0 = ctx.globalCompositeOperation;
    ctx.globalCompositeOperation = 'overlay';
    ctx.save();
    ctx.translate(-ox, -oy);
    ctx.fillStyle = this.grain;
    ctx.fillRect(ox, oy, w, h);
    ctx.restore();
    ctx.globalCompositeOperation = b0;
  }
}

/** A horizontal band of fog (gradient both ways): between layers, over water */
export function fogBand(ctx: Ctx, y: number, h: number, w: number, color: string, strength = 0.5): void {
  const g = ctx.createLinearGradient(0, y - h / 2, 0, y + h / 2);
  g.addColorStop(0, alpha(color, 0));
  g.addColorStop(0.5, alpha(color, strength));
  g.addColorStop(1, alpha(color, 0));
  ctx.fillStyle = g;
  ctx.fillRect(0, y - h / 2, w, h);
}
