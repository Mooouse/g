// Theme "sky-balloons": blue sky, clouds, hills; a glossy balloon on a string as the tap target.
// Heavy parts (the sky, balloon bodies) are cached in offscreen canvases and rebuilt when the pixel density changes.

import { offscreen, onRenderScaleChange, shade, type Theme } from '@gp/core';
import { rng } from '@gp/core';
import { SKY_BALLOONS_META } from './sky-balloons.meta.ts';

const spriteCache = new Map<string, HTMLCanvasElement>();
onRenderScaleChange((dprChanged) => {
  if (dprChanged) spriteCache.clear();
  skyCache = null;
});

// --- Background ---------------------------------------------------------------------------------

let skyCache: { w: number; h: number; canvas: HTMLCanvasElement } | null = null;

interface Cloud {
  y: number;
  speed: number;
  scale: number;
  offset: number;
}
const clouds: Cloud[] = [
  { y: 0.12, speed: 0.012, scale: 1.0, offset: 0.1 },
  { y: 0.3, speed: 0.008, scale: 0.75, offset: 0.62 },
  { y: 0.48, speed: 0.015, scale: 0.9, offset: 0.35 },
  { y: 0.66, speed: 0.01, scale: 0.65, offset: 0.85 },
];

function buildSky(w: number, h: number): HTMLCanvasElement {
  const [c, ctx] = offscreen(w, h);
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#5cb9f2');
  g.addColorStop(0.7, '#b9e5ff');
  g.addColorStop(1, '#dcf3ff');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  // Soft sun
  const u = Math.min(w, h);
  const sx = w * 0.86;
  const sy = h * 0.08;
  const sun = ctx.createRadialGradient(sx, sy, 0, sx, sy, u * 0.28);
  sun.addColorStop(0, 'rgba(255, 250, 210, 0.9)');
  sun.addColorStop(0.35, 'rgba(255, 245, 190, 0.35)');
  sun.addColorStop(1, 'rgba(255, 245, 190, 0)');
  ctx.fillStyle = sun;
  ctx.fillRect(0, 0, w, h);
  // Hills at the bottom
  const hillTop = h - Math.max(u * 0.14, 40);
  ctx.fillStyle = '#8fd46a';
  ctx.beginPath();
  ctx.moveTo(0, h);
  ctx.lineTo(0, hillTop + u * 0.05);
  ctx.quadraticCurveTo(w * 0.25, hillTop - u * 0.06, w * 0.55, hillTop + u * 0.03);
  ctx.quadraticCurveTo(w * 0.8, hillTop + u * 0.09, w, hillTop - u * 0.01);
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#74c457';
  ctx.beginPath();
  ctx.moveTo(0, h);
  ctx.lineTo(0, hillTop + u * 0.12);
  ctx.quadraticCurveTo(w * 0.4, hillTop + u * 0.02, w * 0.7, hillTop + u * 0.1);
  ctx.quadraticCurveTo(w * 0.88, hillTop + u * 0.14, w, hillTop + u * 0.08);
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fill();
  return c;
}

function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, s: number): void {
  ctx.beginPath();
  ctx.arc(x, y, s * 0.5, 0, Math.PI * 2);
  ctx.arc(x + s * 0.55, y - s * 0.2, s * 0.6, 0, Math.PI * 2);
  ctx.arc(x + s * 1.15, y, s * 0.48, 0, Math.PI * 2);
  ctx.arc(x + s * 0.55, y + s * 0.15, s * 0.5, 0, Math.PI * 2);
  ctx.fill();
}

function drawSkyBackground(ctx: CanvasRenderingContext2D, w: number, h: number, time: number): void {
  if (!skyCache || skyCache.w !== w || skyCache.h !== h) skyCache = { w, h, canvas: buildSky(w, h) };
  ctx.drawImage(skyCache.canvas, 0, 0, w, h);
  const u = Math.min(w, h);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  for (const c of clouds) {
    const s = u * 0.13 * c.scale;
    const span = w + s * 3;
    const x = ((c.offset + time * c.speed) % 1) * span - s * 1.8;
    drawCloud(ctx, x, h * c.y, s);
  }
}

// --- Balloon ---------------------------------------------------------------------------------

const BALLOON_ASPECT = SKY_BALLOONS_META.targetAspect;

function balloonPath(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number): void {
  const ry = r * BALLOON_ASPECT;
  ctx.beginPath();
  ctx.moveTo(cx, cy - ry);
  ctx.bezierCurveTo(cx + r * 1.36, cy - ry, cx + r * 1.12, cy + ry * 0.62, cx, cy + ry);
  ctx.bezierCurveTo(cx - r * 1.12, cy + ry * 0.62, cx - r * 1.36, cy - ry, cx, cy - ry);
  ctx.closePath();
}

function buildBalloon(color: string, r: number): HTMLCanvasElement {
  const ry = r * BALLOON_ASPECT;
  const w = r * 2.6;
  const h = ry * 2 + r * 0.4;
  const [c, ctx] = offscreen(w, h);
  const cx = w / 2;
  const cy = ry + r * 0.08;
  const g = ctx.createRadialGradient(cx - r * 0.35, cy - ry * 0.45, r * 0.1, cx, cy, r * 1.25);
  g.addColorStop(0, shade(color, 0.45));
  g.addColorStop(0.45, color);
  g.addColorStop(1, shade(color, -0.28));
  balloonPath(ctx, cx, cy, r);
  ctx.fillStyle = g;
  ctx.fill();
  // Highlight
  ctx.save();
  ctx.translate(cx - r * 0.42, cy - ry * 0.42);
  ctx.rotate(-0.5);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 0.13, r * 0.26, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // Knot
  ctx.fillStyle = shade(color, -0.2);
  ctx.beginPath();
  ctx.moveTo(cx, cy + ry - r * 0.02);
  ctx.lineTo(cx + r * 0.13, cy + ry + r * 0.16);
  ctx.lineTo(cx - r * 0.13, cy + ry + r * 0.16);
  ctx.closePath();
  ctx.fill();
  return c;
}

/** Balloon with a string. (x, y) — center of the balloon body */
function drawBalloon(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, time: number): void {
  const rr = Math.round(r);
  const key = `${color}|${rr}`;
  let sprite = spriteCache.get(key);
  if (!sprite) {
    sprite = buildBalloon(color, rr);
    spriteCache.set(key, sprite);
  }
  const ry = r * BALLOON_ASPECT;
  const knotY = y + ry + r * 0.15;
  // String
  const sway = Math.sin(time * 2.2 + x * 0.05) * r * 0.25;
  ctx.strokeStyle = 'rgba(80, 100, 130, 0.55)';
  ctx.lineWidth = Math.max(1.5, r * 0.035);
  ctx.beginPath();
  ctx.moveTo(x, knotY);
  ctx.quadraticCurveTo(x + sway, knotY + r * 0.7, x - sway * 0.4, knotY + r * 1.4);
  ctx.stroke();
  const w = rr * 2.6;
  const h = rr * BALLOON_ASPECT * 2 + rr * 0.4;
  ctx.drawImage(sprite, x - w / 2, y - rr * BALLOON_ASPECT - rr * 0.08, w, h);
}

export const skyBalloons: Theme = {
  id: SKY_BALLOONS_META.id,
  palette: SKY_BALLOONS_META.palette,
  background: SKY_BALLOONS_META.background,
  ui: {
    button: '#ffffff',
    buttonShadow: 'rgba(20, 70, 130, 0.22)',
    icon: '#2f7bd9',
    textOutline: '#2a5d9c',
    lock: 'rgba(90, 100, 115, 0.55)',
    cardColors: SKY_BALLOONS_META.cardColors,
    slotEmpty: 'rgba(255, 255, 255, 0.45)',
  },
  drawBackground: drawSkyBackground,
  drawTarget: drawBalloon,
  targetAspect: SKY_BALLOONS_META.targetAspect,
  targetTail: SKY_BALLOONS_META.targetTail,
  popSound: (audio) => audio.pop(0.9 + rng.random() * 0.25),
};
