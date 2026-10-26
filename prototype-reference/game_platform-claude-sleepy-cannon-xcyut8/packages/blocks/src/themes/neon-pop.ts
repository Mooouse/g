// Theme "neon-pop": a dark night gradient with drifting light dots; glowing neon orbs as tap targets.
// Glow is baked into cached sprites (no shadowBlur per frame), so it stays cheap on weak devices.

import { offscreen, onRenderScaleChange, rng, shade, type Theme } from '@gp/core';
import { NEON_POP_META } from './neon-pop.meta.ts';

const sprites = new Map<string, HTMLCanvasElement>();
let bg: { w: number; h: number; canvas: HTMLCanvasElement } | null = null;
onRenderScaleChange((dprChanged) => {
  if (dprChanged) sprites.clear();
  bg = null;
});

interface Dot {
  x: number;
  y: number;
  s: number;
  v: number;
}
const dots: Dot[] = Array.from({ length: 40 }, () => ({ x: rng.random(), y: rng.random(), s: 0.4 + rng.random() * 0.9, v: 0.004 + rng.random() * 0.01 }));

function buildBackground(w: number, h: number): HTMLCanvasElement {
  const [c, g] = offscreen(w, h);
  const grad = g.createLinearGradient(0, 0, w * 0.3, h);
  grad.addColorStop(0, '#1b1446');
  grad.addColorStop(0.55, '#140f2e');
  grad.addColorStop(1, '#0b1a2e');
  g.fillStyle = grad;
  g.fillRect(0, 0, w, h);
  // Two big soft color clouds
  const u = Math.min(w, h);
  for (const [x, y, col] of [
    [w * 0.15, h * 0.2, 'rgba(167, 139, 250, 0.18)'],
    [w * 0.85, h * 0.75, 'rgba(34, 211, 238, 0.14)'],
  ] as const) {
    const r = g.createRadialGradient(x, y, 0, x, y, u * 0.7);
    r.addColorStop(0, col);
    r.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = r;
    g.fillRect(0, 0, w, h);
  }
  return c;
}

function drawBackground(ctx: CanvasRenderingContext2D, w: number, h: number, time: number): void {
  if (!bg || bg.w !== w || bg.h !== h) bg = { w, h, canvas: buildBackground(w, h) };
  ctx.drawImage(bg.canvas, 0, 0, w, h);
  const u = Math.min(w, h);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  for (const d of dots) {
    const y = (((d.y - time * d.v) % 1) + 1) % 1;
    ctx.globalAlpha = 0.25 + 0.35 * d.s;
    ctx.beginPath();
    ctx.arc(d.x * w, y * h, u * 0.004 * d.s, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function buildOrb(color: string, r: number): HTMLCanvasElement {
  const size = r * 3.2;
  const [c, g] = offscreen(size, size);
  const cx = size / 2;
  // Outer glow
  const glow = g.createRadialGradient(cx, cx, r * 0.6, cx, cx, r * 1.55);
  glow.addColorStop(0, color + 'aa');
  glow.addColorStop(1, color + '00');
  g.fillStyle = glow;
  g.fillRect(0, 0, size, size);
  // Body
  const body = g.createRadialGradient(cx - r * 0.3, cx - r * 0.35, r * 0.1, cx, cx, r);
  body.addColorStop(0, shade(color, 0.6));
  body.addColorStop(0.5, color);
  body.addColorStop(1, shade(color, -0.35));
  g.fillStyle = body;
  g.beginPath();
  g.arc(cx, cx, r, 0, Math.PI * 2);
  g.fill();
  // Rim and highlight
  g.strokeStyle = 'rgba(255, 255, 255, 0.55)';
  g.lineWidth = Math.max(1.5, r * 0.06);
  g.stroke();
  g.fillStyle = 'rgba(255, 255, 255, 0.5)';
  g.beginPath();
  g.ellipse(cx - r * 0.35, cx - r * 0.4, r * 0.18, r * 0.1, -0.6, 0, Math.PI * 2);
  g.fill();
  return c;
}

function drawOrb(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string): void {
  const rr = Math.round(r);
  const key = `${color}|${rr}`;
  let s = sprites.get(key);
  if (!s) {
    s = buildOrb(color, rr);
    sprites.set(key, s);
  }
  const size = rr * 3.2;
  ctx.drawImage(s, x - size / 2, y - size / 2, size, size);
}

export const neonPop: Theme = {
  id: NEON_POP_META.id,
  palette: NEON_POP_META.palette,
  background: NEON_POP_META.background,
  ui: {
    button: '#ffffff',
    buttonShadow: 'rgba(0, 0, 0, 0.35)',
    icon: '#7c3aed',
    textOutline: '#2e1065',
    lock: 'rgba(255, 255, 255, 0.45)',
    cardColors: NEON_POP_META.cardColors,
    slotEmpty: 'rgba(255, 255, 255, 0.12)',
  },
  drawBackground,
  drawTarget: (ctx, x, y, r, color) => drawOrb(ctx, x, y, r, color),
  targetAspect: NEON_POP_META.targetAspect,
  targetTail: NEON_POP_META.targetTail,
  popSound: (audio) => audio.pop(1.05 + rng.random() * 0.25),
};
