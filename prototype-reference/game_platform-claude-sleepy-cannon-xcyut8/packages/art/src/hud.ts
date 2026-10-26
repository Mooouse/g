// A HUD that looks designed, not boxed: glass panels (the scene blurred behind a dark translucent body, a thin light
// edge, a glowing accent), circular gauges, progress bars, digital readouts, a warning indicator and round icon
// buttons. Static parts are baked (a SpriteCache), so a frame costs a few blits and a couple of arcs.
// Canvas HUD is invisible to gp qa's DOM checks: declare what a player reads or taps in host.qa({ canvasUi }).

import { canvas2d, type Ctx } from './bake.ts';
import { alpha, shade } from './color.ts';
import { glow } from './material.ts';
import { chamfer, rounded } from './shapes.ts';
import { SpriteCache, drawSprite, type Sprite, type SpriteOptions } from './sprite.ts';

/** The HUD's baked parts: 24 MB holds a full HUD and two screen-sized panels at DPR 2; anything over half of it is drawn directly */
const cache = new SpriteCache({ maxBytes: 24 * 1024 * 1024 });
/** The HUD's sprite cache: its hits, misses, evictions and bytes (the dev meter, tests) */
export const hudCache: SpriteCache = cache;
/** The sizes each part was asked for, and per part (its look without the size) when a new size last came */
const seen = new Set<string>();
const looks = new Map<string, { calls: number; lastNew: number }>();
const BUCKET = 8;
/** A new size within this many calls of the part's previous new size: it is changing (an animation) */
const CHANGING = 8;

/**
 * A HUD part baked for a w×h CSS px box. A size asked for before, or the first new one in a while (a panel that stays),
 * is baked exactly; new sizes coming one after another (a panel growing in, a bar stretching) are drawn from the next
 * 8-px bucket, stretched — so an animated size bakes once per bucket, not once per frame, and doesn't push the static
 * parts out of the cache. Deterministic: the same calls draw the same pixels.
 */
function part(sig: string, w: number, h: number, draw: (g: Ctx, w: number, h: number) => void, opts: SpriteOptions): { s: Sprite; sx: number; sy: number } {
  const W = Math.max(1, Math.round(w));
  const H = Math.max(1, Math.round(h));
  const exact = `${sig}:${W}x${H}`;
  let look = looks.get(sig);
  if (!look) {
    if (looks.size > 256) looks.clear();
    looks.set(sig, (look = { calls: 0, lastNew: -Infinity }));
  }
  look.calls++;
  let stays = seen.has(exact);
  if (!stays) {
    stays = look.calls - look.lastNew > CHANGING;
    look.lastNew = look.calls;
    if (seen.size > 1024) seen.clear();
    seen.add(exact);
  }
  const pad = (opts.pad ?? 0) * 2;
  // Baked at the size first asked for under this key (a fractional size stays 1:1), stretched by what it differs
  const fit = (s: Sprite) => ({ s, sx: w / (s.w - pad), sy: h / (s.h - pad) });
  if (stays) return fit(cache.get(exact, w, h, draw, opts));
  const bw = Math.ceil(W / BUCKET) * BUCKET;
  const bh = Math.ceil(H / BUCKET) * BUCKET;
  return fit(cache.get(`${sig}:${bw}x${bh}~`, bw, bh, draw, opts));
}

/** Draw a part centred at (x, y), stretched to its box (1:1 when it was baked exactly) */
function drawPart(ctx: Ctx, p: { s: Sprite; sx: number; sy: number }, x: number, y: number, k = 1): void {
  const sx = p.sx * k;
  const sy = p.sy * k;
  drawSprite(ctx, p.s, x, y, Math.abs(sx - 1) < 1e-6 && Math.abs(sy - 1) < 1e-6 ? undefined : { sx, sy });
}
export const MONO = 'ui-monospace, "SF Mono", Menlo, Consolas, "Roboto Mono", monospace';

export interface GlassOptions {
  r?: number;
  /** The body's tint (dark, translucent) */
  tint?: string;
  /** The accent glow on the edge (a colour) or none */
  edge?: string | null;
  /** Blur what is under the panel (the canvas drawn so far): the frosted look. Default true */
  frost?: boolean;
  /** Bevelled sci-fi corners instead of round ones */
  bevel?: boolean;
}

let blurBuf: [HTMLCanvasElement, Ctx] | null = null;

/** The glass body at (0, 0), w×h: the tinted gradient, a sheen, the light edges and the accent */
function glassBody(g: Ctx, w: number, h: number, r: number, tint: string, edge: string | null, bevel: boolean): void {
  g.save();
  const p = bevel ? chamfer(0, 0, w, h, [r, r * 0.4, r, r * 0.4]) : rounded(0, 0, w, h, r);
  const body = g.createLinearGradient(0, 0, 0, h);
  body.addColorStop(0, alpha(shade(tint, 0.18), 0.62));
  body.addColorStop(1, alpha(tint, 0.8));
  g.fillStyle = body;
  g.fill(p);
  g.save();
  g.clip(p);
  // A sheen across the top third
  const sh = g.createLinearGradient(0, 0, w * 0.4, h);
  sh.addColorStop(0, alpha('#ffffff', 0.1));
  sh.addColorStop(0.45, alpha('#ffffff', 0.02));
  sh.addColorStop(0.46, alpha('#ffffff', 0));
  g.fillStyle = sh;
  g.fillRect(0, 0, w, h);
  // A light top edge, inside
  g.strokeStyle = alpha('#ffffff', 0.28);
  g.lineWidth = 2;
  g.translate(0, 1);
  g.stroke(p);
  g.restore();
  g.strokeStyle = alpha('#c9e6ff', 0.22);
  g.lineWidth = 1;
  g.stroke(p);
  if (edge) {
    // The accent: a glowing line on the left edge and corner ticks
    g.save();
    g.clip(p);
    const eg = g.createLinearGradient(0, 0, 0, h);
    eg.addColorStop(0, alpha(edge, 0));
    eg.addColorStop(0.5, alpha(edge, 0.95));
    eg.addColorStop(1, alpha(edge, 0));
    g.fillStyle = eg;
    g.fillRect(0, h * 0.15, 3, h * 0.7);
    g.restore();
    g.strokeStyle = alpha(edge, 0.85);
    g.lineWidth = 1.5;
    g.beginPath();
    g.moveTo(w - 14, 1);
    g.lineTo(w - 3, 1);
    g.moveTo(w - 1, 4);
    g.lineTo(w - 1, 14);
    g.stroke();
  }
  g.restore();
}

/** A glass panel at (x, y), w×h CSS px. Draw the scene first: the frost samples it */
export function glass(ctx: Ctx, x: number, y: number, w: number, h: number, o: GlassOptions = {}): void {
  if (!(w > 2 && h > 2)) return;
  const r = o.r ?? 14;
  const tint = o.tint ?? '#0b1430';
  const edge = o.edge === undefined ? '#5ff6ff' : o.edge;
  const path = o.bevel ? chamfer(x, y, w, h, [r, r * 0.4, r, r * 0.4]) : rounded(x, y, w, h, r);
  if (o.frost !== false) {
    // A cheap frosted blur: the region down to 1/10 and back up, smoothed
    const m = ctx.getTransform();
    const bw = Math.max(2, Math.ceil(w / 10));
    const bh = Math.max(2, Math.ceil(h / 10));
    if (!blurBuf || blurBuf[0].width < bw || blurBuf[0].height < bh) blurBuf = canvas2d(Math.max(bw, 64), Math.max(bh, 64));
    const [bc, bg] = blurBuf;
    bg.clearRect(0, 0, bw, bh);
    bg.imageSmoothingEnabled = true;
    bg.drawImage(ctx.canvas, x * m.a + m.e, y * m.d + m.f, w * m.a, h * m.d, 0, 0, bw, bh);
    ctx.save();
    ctx.clip(path);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(bc, 0, 0, bw, bh, x, y, w, h);
    ctx.restore();
  }
  const body = (g: Ctx, w: number, h: number) => glassBody(g, w, h, r, tint, edge, !!o.bevel);
  if (cache.fits(w, h, { pad: 4 })) {
    const p = part(`glass:${r}:${tint}:${edge}:${!!o.bevel}`, w, h, (g, bw, bh) => {
      g.translate(-bw / 2, -bh / 2);
      body(g, bw, bh);
    }, { pad: 4 });
    drawPart(ctx, p, x + w / 2, y + h / 2);
  } else {
    // A screen-sized panel: drawn as it is (a few fills) rather than a bake that would empty the cache every frame
    ctx.save();
    ctx.translate(x, y);
    body(ctx, w, h);
    ctx.restore();
  }
  if (edge) glow(ctx, x + 1.5, y + h / 2, Math.min(h * 0.45, 60), edge, 0.35);
}

export interface GaugeOptions {
  color?: string;
  track?: string;
  /** Text in the middle (the value, a unit) */
  text?: string;
  label?: string;
  /** Above this share the gauge turns `warnColor` and pulses (with t) */
  warn?: number;
  warnColor?: string;
  t?: number;
  /** The arc's span (radians, default 270°) */
  span?: number;
}

/** A circular gauge: ticks, a track, the value arc with a glow and a bright cap, the value in the middle */
export function gauge(ctx: Ctx, cx: number, cy: number, r: number, value: number, o: GaugeOptions = {}): void {
  const v = Math.max(0, Math.min(1, value));
  const span = o.span ?? Math.PI * 1.5;
  const a0 = Math.PI / 2 + (Math.PI * 2 - span) / 2;
  const hot = o.warn !== undefined && v >= o.warn;
  const pulse = hot ? 0.6 + 0.4 * Math.sin((o.t ?? 0) * 10) : 1;
  const color = hot ? (o.warnColor ?? '#ff4b3e') : (o.color ?? '#5ff6ff');
  const face = part(`gauge:${o.track ?? ''}:${span.toFixed(2)}`, r * 2, r * 2, (g, d) => {
    const r = d / 2;
    const bg = g.createRadialGradient(0, -r * 0.3, r * 0.1, 0, 0, r);
    bg.addColorStop(0, alpha('#1a2a52', 0.92));
    bg.addColorStop(1, alpha('#070c22', 0.95));
    g.fillStyle = bg;
    g.beginPath();
    g.arc(0, 0, r, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = alpha('#c9e6ff', 0.25);
    g.lineWidth = 1;
    g.stroke();
    g.strokeStyle = o.track ?? alpha('#000814', 0.75);
    g.lineCap = 'round';
    g.lineWidth = r * 0.16;
    g.beginPath();
    g.arc(0, 0, r * 0.76, a0, a0 + span);
    g.stroke();
    g.strokeStyle = alpha('#c9e6ff', 0.4);
    g.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const a = a0 + (span * i) / 10;
      const r1 = r * (i % 5 ? 0.9 : 0.86);
      g.beginPath();
      g.moveTo(Math.cos(a) * r1, Math.sin(a) * r1);
      g.lineTo(Math.cos(a) * r * 0.95, Math.sin(a) * r * 0.95);
      g.stroke();
    }
  }, { pad: 2 });
  drawPart(ctx, face, cx, cy);
  if (v > 0.001) {
    const end = a0 + span * v;
    ctx.save();
    ctx.lineCap = 'round';
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = alpha(color, 0.28 * pulse);
    ctx.lineWidth = r * 0.34;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.76, a0, end);
    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
    const g = ctx.createLinearGradient(cx - r, cy + r, cx + r, cy - r);
    g.addColorStop(0, shade(color, -0.3));
    g.addColorStop(1, shade(color, 0.35));
    ctx.strokeStyle = g;
    ctx.lineWidth = r * 0.14;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.76, a0, end);
    ctx.stroke();
    ctx.restore();
    glow(ctx, cx + Math.cos(end) * r * 0.76, cy + Math.sin(end) * r * 0.76, r * 0.42, color, 0.9 * pulse);
  }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (o.text) {
    ctx.font = `700 ${Math.round(r * 0.46)}px ${MONO}`;
    ctx.fillStyle = shade(color, 0.6);
    ctx.fillText(o.text, cx, cy + (o.label ? -r * 0.06 : 0));
  }
  if (o.label) {
    ctx.font = `700 ${Math.max(9, Math.round(r * 0.22))}px system-ui, sans-serif`;
    ctx.fillStyle = alpha('#c9e6ff', 0.75);
    ctx.fillText(o.label.toUpperCase(), cx, cy + r * 0.36);
  }
}

/** A progress bar: an inset track, a gradient fill with a gloss line, segments, a glow at the head */
export function bar(ctx: Ctx, x: number, y: number, w: number, h: number, value: number, o: { color?: string; back?: string; segments?: number } = {}): void {
  const v = Math.max(0, Math.min(1, value));
  const color = o.color ?? '#5ff6ff';
  const track = part(`bar:${o.back ?? ''}:${o.segments ?? 0}`, w, h, (g, w, h) => {
    g.translate(-w / 2, -h / 2);
    const p = rounded(0, 0, w, h, h / 2);
    g.fillStyle = o.back ?? alpha('#030716', 0.78);
    g.fill(p);
    g.save();
    g.clip(p);
    g.fillStyle = alpha('#000000', 0.5);
    g.fillRect(0, 0, w, h * 0.3);
    g.restore();
    g.strokeStyle = alpha('#c9e6ff', 0.25);
    g.lineWidth = 1;
    g.stroke(p);
  }, { pad: 2 });
  drawPart(ctx, track, x + w / 2, y + h / 2);
  if (v <= 0.001) return;
  const fw = Math.max(h, w * v);
  const p = rounded(x + 1.5, y + 1.5, fw - 3, h - 3, (h - 3) / 2);
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, shade(color, 0.35));
  g.addColorStop(0.5, color);
  g.addColorStop(1, shade(color, -0.35));
  ctx.fillStyle = g;
  ctx.fill(p);
  ctx.fillStyle = alpha('#ffffff', 0.35);
  ctx.fillRect(x + h / 2, y + h * 0.22, Math.max(0, fw - h), Math.max(1, h * 0.14));
  if (o.segments) {
    ctx.fillStyle = alpha('#030716', 0.55);
    for (let i = 1; i < o.segments; i++) ctx.fillRect(x + (w * i) / o.segments - 1, y + 1, 2, h - 2);
  }
  glow(ctx, x + fw - h / 2, y + h / 2, h * 1.6, color, 0.7);
}

/** A digital readout: glowing digits over their faint unlit "8"s (an LCD) */
export function readout(ctx: Ctx, text: string, x: number, y: number, size: number, o: { color?: string; align?: CanvasTextAlign; ghost?: boolean } = {}): void {
  const color = o.color ?? '#7dfcff';
  ctx.font = `700 ${Math.round(size)}px ${MONO}`;
  ctx.textAlign = o.align ?? 'left';
  ctx.textBaseline = 'middle';
  if (o.ghost !== false) {
    ctx.fillStyle = alpha(color, 0.08);
    ctx.fillText(text.replace(/[0-9]/g, '8'), x, y);
  }
  const b0 = ctx.globalCompositeOperation;
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineWidth = size * 0.22;
  ctx.lineJoin = 'round';
  ctx.strokeStyle = alpha(color, 0.18);
  ctx.strokeText(text, x, y);
  ctx.globalCompositeOperation = b0;
  ctx.fillStyle = shade(color, 0.5);
  ctx.fillText(text, x, y);
}

/** A warning sign that pulses (t: seconds): a triangle with "!" and a glow */
export function warning(ctx: Ctx, x: number, y: number, size: number, t: number, color = '#ffb020'): void {
  const p = 0.55 + 0.45 * Math.sin(t * 8);
  glow(ctx, x, y, size * 1.3, color, 0.6 * p);
  const tri = new Path2D();
  tri.moveTo(x, y - size * 0.55);
  tri.lineTo(x + size * 0.58, y + size * 0.45);
  tri.lineTo(x - size * 0.58, y + size * 0.45);
  tri.closePath();
  ctx.lineJoin = 'round';
  ctx.fillStyle = alpha(shade(color, -0.6), 0.85);
  ctx.fill(tri);
  ctx.strokeStyle = alpha(color, 0.5 + 0.5 * p);
  ctx.lineWidth = Math.max(1.5, size * 0.09);
  ctx.stroke(tri);
  ctx.fillStyle = shade(color, 0.4);
  ctx.font = `900 ${Math.round(size * 0.6)}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('!', x, y + size * 0.08);
}

/** A round glass icon button; `icon` draws itself centred at (0, 0) in a box of size s */
export function iconButton(ctx: Ctx, x: number, y: number, r: number, icon: (ctx: Ctx, s: number) => void, o: { color?: string; pressed?: boolean; active?: boolean } = {}): void {
  const color = o.color ?? '#5ff6ff';
  const s = part(`btn:${color}`, r * 2, r * 2, (g, d) => {
    const r = d / 2;
    const bg = g.createLinearGradient(0, -r, 0, r);
    bg.addColorStop(0, alpha('#2a3d70', 0.9));
    bg.addColorStop(1, alpha('#0a1230', 0.92));
    g.fillStyle = bg;
    g.beginPath();
    g.arc(0, 0, r, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = alpha(color, 0.75);
    g.lineWidth = 1.5;
    g.stroke();
    g.strokeStyle = alpha('#ffffff', 0.3);
    g.lineWidth = 1.5;
    g.beginPath();
    g.arc(0, 0, r - 3, Math.PI * 1.1, Math.PI * 1.9);
    g.stroke();
  }, { pad: 2 });
  const k = o.pressed ? 0.92 : 1;
  if (o.active) glow(ctx, x, y, r * 1.8, color, 0.5);
  drawPart(ctx, s, x, y, k);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(k, k);
  ctx.fillStyle = shade(color, 0.5);
  ctx.strokeStyle = shade(color, 0.5);
  icon(ctx, r * 1.05);
  ctx.restore();
}

// Threat cues: hit arcs, the off-screen arrow, damage numbers (threat.ts)
export * from './threat.ts';
