// Forge Night — the @gp/art showcase scene: a hovering workshop robot and a jelly creature on a metal deck at dusk,
// an industrial skyline in parallax behind them, lamps and their shadows, sparks, steam and explosions.
// Everything is drawn in code; expensive parts are baked once (the scenery's tiles, the deck, the robot's parts per
// light direction, the creature's wobble cycle). main.ts owns the screens and the host; this file only the picture.

import { Camera } from '@gp/art/camera';
import { alpha, mix, shade } from '@gp/art/color';
import { Fx, burst, shimmer } from '@gp/art/fx';
import { bar, gauge, glass, warning } from '@gp/art/hud';
import { canvasFont, drawNumber } from '@gp/art/type';
import { EXO_2 } from '@gp/art/type/exo-2';
import { LightLayer, type Light, type Occluder } from '@gp/art/light';
import { contactShadow, glow, paint, type Material } from '@gp/art/material';
import { hash } from '@gp/art/noise';
import { PALETTES } from '@gp/art/palette';
import { AutoQuality } from '@gp/art/perf';
import { Blinker, Jelly, Pulse, Rig, Spring, Wobble, bob, breathe, lookAt, sway } from '@gp/art/rig';
import { Overlay, Scenery } from '@gp/art/scenery';
import { blob, capsule, chamfer, eye, grooves, mouth, pipe, rivets, rounded, squircle, stripes, vents, visorEyes, wear } from '@gp/art/shapes';
import { SpriteCache, SpriteSheet, drawSprite } from '@gp/art/sprite';
import { bakeGen, canvas2d, density, type Ctx } from '@gp/art/bake';
import { setRenderScale } from '@gp/core/draw';
import type { CoverArt, CoverLayout } from '@gp/core';


const P = PALETTES.forge;
/** The scene's own colours: the forge palette's roles, plus the characters' bodies */
const C = {
  shell: '#e9eef7',
  steel: '#4a6386',
  joint: '#2b3a55',
  visor: '#0b1533',
  eyes: '#5ff6ff',
  accent: P.accent,
  core: P.accent2,
  slime: '#36d6a8',
  slimeDeep: '#1b8f86',
  lamp: '#ffc070',
  danger: P.danger,
  deck: '#3b5578',
};

const DECK = { x0: -1500, x1: 1500 };
const BOUNDS = { x: -1500, y: -1400, w: 3000, h: 1700 };

interface Barrel {
  x: number;
  alive: boolean;
  respawn: number;
  wob: Spring;
}

export interface SceneState {
  t: number;
  robot: { x: number; vx: number; dir: number; hover: number; weld: number; weldOn: boolean; target: number };
  slime: { x: number; y: number; vy: number; hop: number; face: number };
  heat: number;
  power: number;
  score: number;
  shown: number;
  /** Explosions so far (the demo's beat) */
  booms: number;
}

export interface DrawOptions {
  /** false: the world without the robot and the creature (the cover draws them on their own layer) */
  characters?: boolean;
}

export interface Scene {
  state: SceneState;
  update(dt: number): void;
  draw(ctx: Ctx, w: number, h: number, hud: boolean, opts?: DrawOptions): void;
  /** The cover's key art in layers (host.qa({ cover })): the platform letters the title and lights the rim */
  cover(): CoverArt;
  /** A tap at a screen point: an explosion there (returns the points it is worth; main.ts adds them up in chains) */
  tap(sx: number, sy: number): number;
  /** Explode the nearest barrel (the demo and the timeline do it) */
  boom(): void;
  /**
   * Bake ahead, one piece per call (true while there is more): every light direction's parts of the robot, the creature's
   * sheet, the crates and barrels, and the sizes an explosion's particles take. Call it in idle time before the run (the
   * title screen): baked on first use instead, they cost the first seconds of play several ms a frame
   */
  prewarm(): boolean;
  /** Where the robot is on screen now, CSS px (host.qa({ hero }): gp qa checks it is no speck on a desktop screen) */
  heroRect(): { x: number; y: number; w: number; h: number };
  quality: AutoQuality;
  lights: LightLayer;
  fx: Fx;
  camera: Camera;
  resize(w: number, h: number): void;
}

export function createScene(seed = 1): Scene {
  const cache = new SpriteCache();
  const quality = new AutoQuality({ budget: 9 });
  const fx = new Fx({ seed, max: 1200 });
  const camera = new Camera({ smooth: 0.45, lookAhead: 0.35, deadZone: [60, 40], bounds: BOUNDS, seed: seed + 5, shake: { x: 18, y: 14, rot: 0.03 } });
  // The light map is painted in a worker while this thread draws the scene (a frame behind: nothing moves far enough in
  // 16 ms to show it); the cover and the docs' still frames switch that off (cover(), main.ts ?at)
  const lights = new LightLayer({ ambient: ['#e2e6ff', '#9aa6e0', '#4a5598', '#3a4078'], scale: 0.25, bloom: 0.4, vignette: 0.6, vignetteColor: '#050816', offThread: true });
  // The vignette is in the light map (free); the overlay adds only the film grain, at the best quality level
  const overlay = new Overlay({ vignette: 0, grain: 0 });
  const sky = new Scenery({
    sky: ['#050a1e', '#0d1a40', '#23336c', '#6b4a86', '#e0806a'],
    haze: '#7a6aa0',
    stars: 260,
    nebula: ['#3d2a8a', '#1d5a8a'],
    planet: { x: 0.78, y: 0.2, r: 70, color: '#8f7ad8', ring: '#e0c8ff' },
    rays: { color: '#ffd0a0', count: 6, strength: 0.18, x: 0.3, y: 0.62 },
    sun: { x: 0.3, y: 0.66, r: 26, color: '#ffb27a', glow: 2.2 },
    seed: seed + 2,
    layers: [
      { kind: 'mountains', depth: 0.06, color: '#5a5a9a', y: 0.7, height: 0.3, seed: seed + 3 },
      { kind: 'clouds', depth: 0.1, color: '#6a5a9a', y: 0.5, height: 0.22, seed: seed + 4, light: Math.PI / 2, rim: '#ffb08a' },
      { kind: 'fog', depth: 0.14, color: '#d896a0', y: 0.75, height: 0.16, drift: 6, opacity: 0.7, seed: seed + 5 },
      { kind: 'city', depth: 0.2, color: '#3c3a78', y: 0.76, height: 0.3, lights: '#ffb36a', seed: seed + 6 },
      { kind: 'industrial', depth: 0.38, color: '#262d5e', y: 0.79, height: 0.42, lights: '#ffc27a', seed: seed + 7 },
      { kind: 'fog', depth: 0.45, color: '#a07aa8', y: 0.82, height: 0.14, drift: 12, opacity: 0.55, seed: seed + 8 },
      { kind: 'industrial', depth: 0.62, color: '#151a3c', y: 0.83, height: 0.5, lights: '#ffcf8a', seed: seed + 9 },
    ],
  });
  let H = 600;
  let ground = 0;
  let frost = true;
  const S: SceneState = {
    t: 0,
    robot: { x: -120, vx: 0, dir: 1, hover: 0, weld: 0, weldOn: false, target: 260 },
    slime: { x: 90, y: 0, vy: 0, hop: 1.2, face: 1 },
    heat: 0.35,
    power: 0.82,
    score: 0,
    shown: 0,
    booms: 0,
  };
  const barrels: Barrel[] = [-520, 470, 980, -980].map((x) => ({ x, alive: true, respawn: 0, wob: new Spring(0, { freq: 3, damping: 0.25 }) }));
  const lamps = [-760, -260, 300, 820, -1250, 1300];
  const crates = [
    { x: -420, w: 70, h: 56 },
    { x: -360, w: 46, h: 40 },
    { x: 610, w: 80, h: 64 },
    { x: 1120, w: 60, h: 48 },
  ];
  const ventsAt = [-150, 380, 760, -660];

  // --- The robot: parts baked per light direction (8 buckets), drawn by a rig ---------------------------------------
  const antenna = new Wobble(2, { freq: 2.2, damping: 0.16 });
  const blinkR = new Blinker(seed + 11, { min: 2.5, max: 5 });
  const blinkS = new Blinker(seed + 12, { min: 2, max: 4.5 });
  const hitFlash = new Pulse(5);
  const jelly = new Jelly();
  const feelers = new Wobble(2, { freq: 2.8, damping: 0.2 });
  let lightBucket = 3;
  const bucketAngle = (b: number) => -Math.PI + (b + 0.5) * (Math.PI / 4);
  const M = (style: Material['style'], extra: Material = {}): Material => ({ style, light: bucketAngle(lightBucket), outline: 2, rim: '#9fd8ff', ...extra });

  const part = (name: string, w: number, h: number, fn: (g: Ctx) => void, anchor: [number, number] = [0.5, 0.5]) =>
    cache.get(`robot:${name}:${lightBucket}`, w, h, (g) => fn(g), { anchor, pad: 10 });

  const armSprite = () =>
    part('arm', 22, 54, (c) => {
      const p = capsule(-10, -6, 20, 50);
      paint(c, p, { x: -10, y: -6, w: 20, h: 50 }, C.shell, M('glossy'));
      const cuff = capsule(-11, 22, 22, 12);
      paint(c, cuff, { x: -11, y: 22, w: 22, h: 12 }, C.accent, M('toon', { outline: 1.5 }));
    }, [0.5, 0.1]);
  const jointSprite = () =>
    part('joint', 22, 22, (c) => {
      const p = new Path2D();
      p.arc(0, 0, 10, 0, Math.PI * 2);
      paint(c, p, { x: -10, y: -10, w: 20, h: 20 }, C.joint, M('metal'));
    });
  const robot = new Rig([
    {
      id: 'thruster',
      y: 44,
      z: 0,
      draw(g, _p, t) {
        const flick = 0.85 + 0.15 * Math.sin(t * 40) * Math.sin(t * 13);
        glow(g, 0, 10, 46 * flick, C.accent, 0.9);
        const f = new Path2D();
        f.ellipse(0, 12, 9 * flick, 22 * flick, 0, 0, Math.PI * 2);
        paint(g, f, { x: -10, y: -10, w: 20, h: 44 }, '#ffd27a', { style: 'emissive' });
        glow(g, 0, 4, 18, '#fff4d0', 0.9);
      },
    },
    {
      id: 'body',
      y: 0,
      z: 2,
      draw(g) {
        drawSprite(g, part('body', 84, 78, (c) => {
          const p = squircle(0, 0, 84, 78, 3.2);
          paint(c, p, { x: -42, y: -39, w: 84, h: 78 }, C.shell, M('glossy', { gloss: 0.8 }));
          // A belly plate, a seam and the core socket
          const plate = rounded(-26, -14, 52, 40, 12);
          paint(c, plate, { x: -26, y: -14, w: 52, h: 40 }, C.steel, M('brushed', { outline: 1.5 }));
          grooves(c, [[-42, -22, 42, -22]], C.shell, 1.4);
          rivets(c, [[-20, -8], [20, -8], [-20, 20], [20, 20]], 2.2, C.steel, { slot: true });
          const sock = new Path2D();
          sock.arc(0, 6, 12, 0, Math.PI * 2);
          c.fillStyle = shade(C.joint, -0.4);
          c.fill(sock);
          wear(c, p, { x: -42, y: -39, w: 84, h: 78 }, { seed: 4, amount: 0.8, color: 'rgba(80, 100, 140, 0.25)' });
        }), 0, 0);
        // The core: emissive, pulsing, drawn live
        const pulse = 0.7 + 0.3 * Math.sin(S.t * 3);
        const core = new Path2D();
        core.arc(0, 6, 8.5, 0, Math.PI * 2);
        paint(g, core, { x: -9, y: -3, w: 18, h: 18 }, C.core, { style: 'emissive' });
        glow(g, 0, 6, 26 * pulse, C.core, 0.8);
      },
    },
    {
      id: 'armL',
      parent: 'body',
      x: -40,
      y: -6,
      z: 1,
      draw(g) {
        drawSprite(g, armSprite(), 0, 0);
        drawSprite(g, jointSprite(), 0, 0);
      },
    },
    {
      id: 'armR',
      parent: 'body',
      x: 40,
      y: -6,
      z: 3,
      draw(g) {
        drawSprite(g, armSprite(), 0, 0);
        // The welding torch in the hand
        drawSprite(g, part('torch', 30, 20, (c) => {
          pipe(c, -8, 0, 14, 0, 4.5, C.joint, { flanges: false, light: bucketAngle(lightBucket) });
          const tip = rounded(10, -5, 9, 10, 2);
          paint(c, tip, { x: 10, y: -5, w: 9, h: 10 }, C.accent, M('metal', { outline: 1 }));
        }), 6, 46);
        drawSprite(g, jointSprite(), 0, 0);
      },
    },
    {
      id: 'head',
      parent: 'body',
      y: -50,
      z: 4,
      draw(g) {
        drawSprite(g, part('head', 96, 74, (c) => {
          // Ear pods behind the shell
          for (const s of [-1, 1]) {
            const pod = rounded(s * 46 - 8, -12, 16, 26, 7);
            paint(c, pod, { x: s * 46 - 8, y: -12, w: 16, h: 26 }, C.accent, M('glossy', { outline: 1.5 }));
          }
          const p = squircle(0, 0, 92, 70, 3.6);
          paint(c, p, { x: -46, y: -35, w: 92, h: 70 }, C.shell, M('glossy', { gloss: 1 }));
          const visor = squircle(0, 4, 74, 44, 3.4);
          c.fillStyle = C.visor;
          c.fill(visor);
          paint(c, visor, { x: -37, y: -18, w: 74, h: 44 }, '#203a7a', M('glass', { outline: 2, outlineColor: shade(C.steel, -0.6), opacity: 0.5 }));
          // A reflected window across the glass
          c.save();
          c.clip(visor);
          c.fillStyle = alpha('#ffffff', 0.12);
          c.beginPath();
          c.moveTo(-30, -18);
          c.lineTo(-12, -18);
          c.lineTo(-30, 26);
          c.lineTo(-44, 26);
          c.fill();
          c.restore();
        }), 0, 0);
        const look = lookAt(S.robot.x, -110, S.slime.x, S.slime.y - 30, 400);
        visorEyes(g, 0, 4, 70, 30, { color: hitFlash.value > 0.2 ? '#ffd27a' : C.eyes, blink: blinkR.value, look: [look[0] * (S.robot.dir), look[1]], mood: S.robot.weldOn ? 'angry' : S.heat > 0.8 ? 'wide' : 'happy', glow: 0.9 });
      },
    },
    {
      id: 'antenna',
      parent: 'head',
      y: -34,
      z: 5,
      draw(g) {
        const [a1, a2] = antennaAngles;
        g.lineCap = 'round';
        g.strokeStyle = shade(C.joint, 0.2);
        g.lineWidth = 3;
        const x1 = Math.sin(a1) * 18;
        const y1 = -Math.cos(a1) * 18;
        const x2 = x1 + Math.sin(a1 + a2) * 16;
        const y2 = y1 - Math.cos(a1 + a2) * 16;
        g.beginPath();
        g.moveTo(0, 0);
        g.quadraticCurveTo(x1 * 0.6, y1, x2, y2);
        g.stroke();
        const bulb = new Path2D();
        bulb.arc(x2, y2, 5.5, 0, Math.PI * 2);
        paint(g, bulb, { x: x2 - 6, y: y2 - 6, w: 12, h: 12 }, C.accent, { style: 'emissive' });
        glow(g, x2, y2, 22, C.accent, 0.7 + 0.3 * Math.sin(S.t * 5));
      },
    },
  ]);
  let antennaAngles = [0, 0];

  // --- The creature: a wobble cycle pre-rendered in a sheet, a live eye, springy feelers -----------------------------
  // One sheet per light direction (8 buckets, ≈ 0.7 MB each), kept: the light at the robot turns often while it walks under
  // the lamps, and re-baking 12 painted frames each time cost a few ms a frame. Re-made after a density change or a lost
  // context (a sheet is a canvas the game holds)
  const slimeSheets = new Map<number, SpriteSheet>();
  const slimeBody = () => {
    let slimeSheet = slimeSheets.get(lightBucket);
    if (slimeSheet && slimeSheet.gen !== bakeGen()) {
      slimeSheets.clear();
      slimeSheet = undefined;
    }
    if (!slimeSheet) {
      slimeSheet = new SpriteSheet(12, 112, 92, (c, i, n) => {
        const ph = (i / n) * Math.PI * 2;
        const p = blob(0, -40, 52, 40, { n: 14, wobble: 0.07, seed: 9, phase: ph });
        paint(c, p, { x: -54, y: -84, w: 108, h: 86 }, C.slime, { style: 'glossy', light: bucketAngle(lightBucket), outline: 2.2, rim: '#c8fff0', bounce: '#ffcf8a', gloss: 1 });
        // Bioluminescent freckles and a lighter belly
        c.save();
        c.clip(p);
        const belly = c.createRadialGradient(0, -4, 0, 0, -4, 40);
        belly.addColorStop(0, alpha('#e8fff5', 0.4));
        belly.addColorStop(1, alpha('#e8fff5', 0));
        c.fillStyle = belly;
        c.fillRect(-56, -90, 112, 96);
        for (let k = 0; k < 7; k++) {
          const a = hash(k, 3) * Math.PI * 2;
          const r = 22 + hash(k, 4) * 20;
          c.fillStyle = alpha('#bffff0', 0.75);
          c.beginPath();
          c.arc(Math.cos(a) * r * 1.1, -40 + Math.sin(a) * r * 0.75, 1.6 + hash(k, 5) * 2.2, 0, Math.PI * 2);
          c.fill();
        }
        c.restore();
      }, { pad: 10, anchor: [0.5, 1] });
      slimeSheets.set(lightBucket, slimeSheet);
    }
    return slimeSheet;
  };

  // --- The deck: one baked tile, repeated ---------------------------------------------------------------------------
  const deckTile = (tw: number, th: number) =>
    cache.get(`deck:${tw}:${Math.round(th)}:${camera.zoom.toFixed(3)}`, tw, th, (c) => {
      c.translate(-tw / 2, 0);
      // The walkway's top: brushed plate, lit from the lamps above
      const top = rounded(0, 0, tw, 26, 3);
      paint(c, top, { x: 0, y: 0, w: tw, h: 26 }, C.deck, { style: 'brushed', light: -Math.PI / 2, ao: 0.4, rim: false, bounce: false });
      stripes(c, rounded(0, 2, tw, 7, 2), { x: 0, y: 2, w: tw, h: 7 }, { color: alpha('#ffb020', 0.75), width: 9, gap: 9 });
      grooves(c, [[tw / 2, 10, tw / 2, 26], [0, 10, tw, 10]], C.deck, 1.2, -Math.PI / 2);
      // The front face, in shadow, with panels, vents and rivets
      const face = c.createLinearGradient(0, 26, 0, th);
      face.addColorStop(0, shade(C.deck, -0.35));
      face.addColorStop(0.4, shade(C.deck, -0.6));
      face.addColorStop(1, shade(C.deck, -0.85));
      c.fillStyle = face;
      c.fillRect(0, 26, tw, th - 26);
      c.fillStyle = alpha('#000010', 0.45);
      c.fillRect(0, 26, tw, 6);
      for (let i = 0; i < 2; i++) {
        const px = i * (tw / 2) + 14;
        const panel = chamfer(px, 44, tw / 2 - 28, Math.min(90, th - 60), 10);
        paint(c, panel, { x: px, y: 44, w: tw / 2 - 28, h: 90 }, shade(C.deck, -0.4), { style: 'metal', light: -Math.PI / 2, outline: 1.5, rim: false, bounce: false, ao: 0.8 });
        vents(c, px + 18, 62, 60, 36, shade(C.deck, -0.3), 4);
        rivets(c, [[px + 8, 52], [px + tw / 2 - 36, 52], [px + 8, 124], [px + tw / 2 - 36, 124]], 2.4, shade(C.deck, -0.2));
      }
      // Below the panels: a conduit run and a grating, so a tall phone screen has no empty floor
      if (th > 180) {
        pipe(c, 0, 158, tw, 158, 9, '#2c3d60', { flanges: false, light: -Math.PI / 2 });
        pipe(c, 0, 184, tw, 184, 5, '#3a2f50', { flanges: false, light: -Math.PI / 2 });
        for (let gx = 6; gx < tw; gx += 14) {
          c.fillStyle = alpha('#000010', 0.5);
          c.fillRect(gx, 204, 8, Math.max(0, th - 214));
          c.fillStyle = alpha('#9fb8ff', 0.06);
          c.fillRect(gx + 8, 204, 2, Math.max(0, th - 214));
        }
      }
      wear(c, top, { x: 0, y: 0, w: tw, h: 26 }, { seed: 2, amount: 1.4 });
    }, { anchor: [0.5, 0], pad: 0, scale: density() * camera.zoom });

  // Props: a crate, a barrel, a lamp post — baked per light bucket
  // Baked at the camera's zoom and drawn with snap: 1:1 on whole device pixels (a sprite scaled by the zoom, at a
  // fractional position, is a filtered blit: ≈ 8× the cost of a copy on a software rasterizer)
  const atZoom = () => ({ scale: density() * camera.zoom });
  const crateSprite = (w: number, h: number) =>
    cache.get(`crate:${w}x${h}:${lightBucket}:${camera.zoom}`, w, h, (c) => {
      const p = chamfer(-w / 2, -h, w, h, 6);
      paint(c, p, { x: -w / 2, y: -h, w, h }, '#4f6f96', { style: 'metal', light: bucketAngle(lightBucket), outline: 2, rim: '#9fd8ff' });
      c.strokeStyle = alpha(shade('#4f6f96', -0.7), 0.8);
      c.lineWidth = 2;
      c.strokeRect(-w / 2 + 7, -h + 7, w - 14, h - 14);
      c.beginPath();
      c.moveTo(-w / 2 + 7, -h + 7);
      c.lineTo(w / 2 - 7, -7);
      c.stroke();
      rivets(c, [[-w / 2 + 6, -h + 6], [w / 2 - 6, -h + 6], [-w / 2 + 6, -6], [w / 2 - 6, -6]], 2, '#4f6f96');
      wear(c, p, { x: -w / 2, y: -h, w, h }, { seed: w, amount: 1 });
    }, { anchor: [0.5, 1], pad: 6, ...atZoom() });
  const barrelSprite = () =>
    cache.get(`barrel:${lightBucket}:${camera.zoom}`, 44, 60, (c) => {
      const p = rounded(-22, -60, 44, 60, 9);
      paint(c, p, { x: -22, y: -60, w: 44, h: 60 }, C.danger, { style: 'glossy', light: bucketAngle(lightBucket), outline: 2, rim: '#ffd0c0' });
      for (const y of [-48, -14]) {
        const band = rounded(-23, y, 46, 7, 3);
        paint(c, band, { x: -23, y, w: 46, h: 7 }, '#3a4a6a', { style: 'metal', light: bucketAngle(lightBucket), outline: 1 });
      }
      // A hazard mark
      c.fillStyle = alpha('#ffe2a0', 0.9);
      c.beginPath();
      c.moveTo(0, -40);
      c.lineTo(9, -24);
      c.lineTo(-9, -24);
      c.closePath();
      c.fill();
      c.fillStyle = shade(C.danger, -0.6);
      c.fillRect(-1.2, -36, 2.4, 7);
    }, { anchor: [0.5, 1], pad: 6, ...atZoom() });
  const lampSprite = () =>
    cache.get(`lamp:${camera.zoom}`, 80, 250, (c) => {
      pipe(c, 0, 0, 0, -230, 5, '#34466a', { flanges: false, light: -2.6 });
      const arm = rounded(-2, -236, 46, 8, 4);
      paint(c, arm, { x: -2, y: -236, w: 46, h: 8 }, '#34466a', { style: 'metal', light: -Math.PI / 2, outline: 1.5 });
      const head = chamfer(26, -238, 34, 16, [2, 2, 8, 8]);
      paint(c, head, { x: 26, y: -238, w: 34, h: 16 }, '#2b3a55', { style: 'metal', light: -Math.PI / 2, outline: 1.5 });
      const base = chamfer(-14, -14, 28, 14, [6, 6, 0, 0]);
      paint(c, base, { x: -14, y: -14, w: 28, h: 14 }, '#2b3a55', { style: 'metal', outline: 1.5 });
    }, { anchor: [0.2, 1], pad: 8, ...atZoom() });

  // The foreground, out of focus: a railing strip baked at a low resolution (the blur is free)…
  const rail = () =>
    cache.get('rail', 1100, 120, (c) => {
      c.translate(-550, -120);
      for (let x = 20; x < 1100; x += 275) {
        const post = chamfer(x, 10, 22, 110, 4);
        paint(c, post, { x, y: 10, w: 22, h: 110 }, '#161c3c', { style: 'metal', light: -2.6, rim: '#ff9a6a', ao: 0.8, bounce: false });
      }
      pipe(c, 0, 24, 1100, 24, 9, '#1a2146', { flanges: false, light: -2.6 });
      pipe(c, 0, 66, 1100, 66, 6, '#141a38', { flanges: false, light: -2.6 });
    }, { anchor: [0.5, 1], pad: 0, scale: 0.4 });
  // …and that low-resolution strip blown up to the size it is drawn, once (the same soft pixels): a 1:1 blit each frame
  // instead of a filtered 3.75× upscale over the bottom of the screen
  const railAt = (fz: number) =>
    cache.get(`rail@${fz}`, 1100 * fz, 120 * fz, (c) => {
      c.imageSmoothingEnabled = true;
      c.drawImage(rail().canvas, -550 * fz, -120 * fz, 1100 * fz, 120 * fz);
    }, { anchor: [0.5, 1], pad: 0 });

  // --- Simulation ---------------------------------------------------------------------------------------------------
  let nextWeld = 2.2;
  let nextSteam = 0;
  let nextBoom = 4.5;
  function explodeAt(x: number, y: number, scale = 1): void {
    const trauma = fx.explode(x, y, { scale });
    camera.addTrauma(trauma);
    camera.kick(0, 6 * scale);
    hitFlash.hit(1);
    jelly.hit(0.35);
    antenna.hit(2.5);
    feelers.hit(3);
    S.heat = Math.min(1, S.heat + 0.18);
    S.booms++;
  }
  function boom(): void {
    // The barrel the robot is nearest to, alive
    // Never the one the creature stands next to (the blast would hide it)
    const live = barrels.filter((b) => b.alive && Math.abs(b.x - S.slime.x) > 140);
    if (!live.length) return;
    const b = live.reduce((a, c) => (Math.abs(c.x - S.robot.x) < Math.abs(a.x - S.robot.x) ? c : a));
    b.alive = false;
    b.respawn = 5;
    explodeAt(b.x, -30, 1.1);
    fx.text(b.x, -110, '+250', { color: '#ffe08a', size: 30 });
    S.score += 250;
  }
  function update(dt: number): void {
    const frozen = fx.frozen();
    fx.update(dt);
    if (frozen) dt *= fx.stopScale;
    S.t += dt;
    const t = S.t;
    const R = S.robot;
    // The robot patrols between work spots, welding at each
    if (!R.weldOn) {
      const d = R.target - R.x;
      R.vx += Math.sign(d) * 260 * dt;
      R.vx *= Math.exp(-2.2 * dt);
      if (Math.abs(d) < 30) {
        R.vx *= Math.exp(-6 * dt);
        if (t > nextWeld) {
          R.weldOn = true;
          R.weld = 0;
        }
      }
      if (Math.abs(R.vx) > 8) R.dir = R.vx > 0 ? 1 : -1;
    } else {
      R.weld += dt;
      R.vx *= Math.exp(-8 * dt);
      if (R.weld > 2.6) {
        R.weldOn = false;
        nextWeld = t + 3.2;
        const spots = [-640, -220, 260, 700];
        R.target = spots[(spots.indexOf(R.target) + 1 + spots.length) % spots.length] ?? 260;
      }
    }
    R.x += R.vx * dt;
    R.hover = bob(t, 0.55, 6);
    // The creature hops after the robot, keeping a friendly distance
    const Sl = S.slime;
    const want = R.x - R.dir * 150;
    Sl.hop -= dt;
    if (Sl.y >= 0 && Sl.hop <= 0 && Math.abs(want - Sl.x) > 40) {
      Sl.vy = -360;
      Sl.face = want > Sl.x ? 1 : -1;
      Sl.hop = 0.9 + hash(Math.floor(t), seed) * 0.6;
      jelly.hit(-0.3);
    }
    if (Sl.y < 0 || Sl.vy < 0) {
      Sl.vy += 1100 * dt;
      Sl.y += Sl.vy * dt;
      Sl.x += Sl.face * 150 * dt;
      if (Sl.y >= 0) {
        Sl.y = 0;
        Sl.vy = 0;
        jelly.hit(0.45);
        fx.emit('dust', Sl.x, -2, { scale: 0.7, n: 6 });
      }
    }
    // Secondary motion
    antennaAngles = antenna.update(dt, R.x + R.hover * 0.2, -R.vx * 0.0012);
    feelersA = feelers.update(dt, Sl.x, 0);
    blinkR.update(dt);
    blinkS.update(dt);
    hitFlash.update(dt);
    jelly.update(dt);
    // Welding: sparks from the torch, a hot white flicker
    if (R.weldOn && R.weld > 0.35) {
      const [tx, ty] = torchTip();
      if (hash(Math.floor(t * 60), seed) < 0.55) fx.emit('sparks', tx, ty, { n: 4, angle: R.dir > 0 ? -0.6 : Math.PI + 0.6, spread: 1.6, scale: 0.9 });
      S.heat = Math.min(1, S.heat + dt * 0.06);
    } else S.heat = Math.max(0.2, S.heat - dt * 0.04);
    S.power = 0.78 + 0.12 * Math.sin(t * 0.6);
    // Steam from the deck vents
    if (t > nextSteam) {
      nextSteam = t + 0.16;
      for (const vx of ventsAt) if (hash(Math.floor(t * 6) + vx, seed) < 0.4) fx.emit('steam', vx + (hash(Math.floor(t * 10), vx) - 0.5) * 20, -4, { n: 1, scale: 1.1 });
    }
    // The timeline: a barrel goes up now and then
    if (t > nextBoom) {
      nextBoom = t + 6.5;
      boom();
    }
    for (const b of barrels) {
      if (!b.alive && (b.respawn -= dt) <= 0) b.alive = true;
      b.wob.update(dt);
    }
    S.shown += (S.score - S.shown) * Math.min(1, dt * 8);
    // The deck sits at 80 % of the view's height: the camera's centre is that far above it
    camera.follow(R.x, -H * 0.3 / camera.zoom, R.vx, 0);
    camera.update(dt);
  }
  let feelersA = [0, 0];
  const torchTip = (): [number, number] => {
    const [x, y] = robot.worldOf('armR', 6 + 20, 46);
    return [S.robot.x + x * S.robot.dir, -110 + S.robot.hover + y];
  };

  function resize(w: number, h: number): void {
    H = h;
    camera.setView(w, h);
    // Fit the action: the deck at 80 % of the height, characters a comfortable size on a phone too
    camera.zoom = Math.max(0.55, Math.min(1.5, Math.min(w / 980, h / 600)));
    camera.snap(camera.x, -h * 0.3 / camera.zoom);
    ground = 0;
  }

  // --- Drawing ------------------------------------------------------------------------------------------------------
  /** The creature and the robot (world space, inside camera.begin): returns the welding light when the torch is lit */
  function drawCharacters(ctx: Ctx, o: { shadows?: boolean; slime?: boolean; look?: number[]; surprised?: boolean } = {}): Light | null {
    const t = S.t;
    const R = S.robot;
    const Sl = S.slime;
    if (o.slime !== false) {
      const air = Math.min(1, -Sl.y / 80);
      if (o.shadows !== false) contactShadow(ctx, Sl.x, 2, 46 * (1 - air * 0.4), 10 * (1 - air * 0.4), '#04081c', 0.75 * (1 - air * 0.5));
      const jl = jelly.value;
      const br = breathe(t, 0.45, 0.035);
      const sheet = slimeBody();
      const frame = sheet.at(t, 7);
      const stretchY = Sl.vy < 0 ? 1 + Math.min(0.25, -Sl.vy / 1400) : 1;
      const sx = br.sx * jl.sx / Math.sqrt(stretchY);
      const sy = br.sy * jl.sy * stretchY;
      sheet.draw(ctx, frame, Sl.x, Sl.y, { sx: sx * Sl.face, sy });
      // Feelers with glowing tips (secondary motion)
      ctx.save();
      ctx.translate(Sl.x, Sl.y);
      ctx.scale(sx, sy);
      for (const s of [-1, 1]) {
        const a = feelersA[0] * 1.2 + s * 0.35 + sway(t, 0.3, 0.08, s);
        const bx = s * 18;
        const by = -74;
        const tx = bx + Math.sin(a) * 26;
        const ty = by - Math.cos(a) * 26;
        ctx.strokeStyle = shade(C.slime, -0.25);
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(bx * 0.7, by + 10);
        ctx.quadraticCurveTo(bx + Math.sin(a) * 8, by - 10, tx, ty);
        ctx.stroke();
        glow(ctx, tx, ty, 16, '#9dffe0', 0.8);
        ctx.fillStyle = '#e8fff6';
        ctx.beginPath();
        ctx.arc(tx, ty, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
      // Its eye and mouth, live (they look at the action)
      const target = o.look ?? (R.weldOn ? torchTip() : [R.x, -130]);
      const lk = lookAt(Sl.x, Sl.y - 40, target[0]!, target[1]!, 260);
      eye(ctx, 4 * Sl.face, -50, 17, { look: lk, blink: blinkS.value, iris: '#ff9a3c', skin: C.slime, dilate: o.surprised ? 0.2 : R.weldOn ? 0.35 : 0.55 });
      mouth(ctx, 4 * Sl.face, -24, 18, { smile: o.surprised ? 0.2 : 0.7, open: o.surprised ? 0.85 : Sl.y < -5 ? 0.6 : 0.15 + 0.1 * Math.sin(t * 2), color: shade(C.slimeDeep, -0.5) });
      ctx.restore();
    }
    // The robot: shadow, rig (mirrored by its facing), squash from its speed
    const ry = -110 + R.hover;
    if (o.shadows !== false) contactShadow(ctx, R.x, 2, 54 - R.hover, 12, '#04081c', 0.65);
    const lean = Math.max(-0.18, Math.min(0.18, R.vx * 0.0011));
    robot.pose = {
      body: { rot: lean, sx: breathe(t, 0.3, 0.02).sx, sy: breathe(t, 0.3, 0.02).sy },
      head: { rot: sway(t, 0.22, 0.05) - lean * 0.5, y: Math.sin(t * 1.1) * 1.5 },
      armL: { rot: 0.18 + sway(t, 0.35, 0.12, 0.3) + lean },
      armR: { rot: R.weldOn ? -1.25 + Math.sin(t * 30) * 0.03 : -0.12 + sway(t, 0.35, 0.12, 0.7) + lean },
      thruster: { sy: 1 + Math.abs(R.vx) * 0.002 },
    };
    robot.draw(ctx, R.x, ry, { flip: R.dir < 0, t });
    if (hitFlash.value > 0.01) glow(ctx, R.x, ry - 20, 90, '#ffffff', hitFlash.value * 0.25);
    // Welding light at the torch tip
    let weld: Light | null = null;
    if (R.weldOn && R.weld > 0.35) {
      const [tx, ty] = torchTip();
      const fl = 0.6 + 0.4 * hash(Math.floor(t * 30), seed);
      glow(ctx, tx, ty, 34 * fl, '#bfe8ff', 1);
      glow(ctx, tx, ty, 12, '#ffffff', 1);
      weld = { x: tx, y: ty, radius: 300 * fl, color: '#a8dcff', intensity: 1.3, shadows: true };
      shimmer(ctx, tx - 30, ty - 70, 60, 60, t, 1.6, 8);
    }
    return weld;
  }

  function draw(ctx: Ctx, w: number, h: number, hud: boolean, opts: DrawOptions = {}): void {
    const t0 = performance.now();
    const t = S.t;
    const R = S.robot;
    const q = quality.current;
    fx.quality = q.particles;
    lights.scale = q.lightScale;
    lights.bloom = q.bloom ? 0.4 : 0;
    lights.step = q.lightStep;
    frost = q.detail;
    // 1. The background (screen space, parallax by the camera's x)
    sky.draw(ctx, w, h, { x: camera.x * camera.zoom, y: 0 }, t, undefined, q.detail);
    // 2. The world
    camera.begin(ctx);
    const view = camera.view(80);
    // Lamp posts behind the deck's edge
    const flat = !camera.roll;
    for (const lx of lamps) if (lx > view.x - 80 && lx < view.x + view.w + 80) drawSprite(ctx, lampSprite(), lx, 0, { snap: flat });
    // Pipes along the back of the walkway
    pipe(ctx, view.x - 20, -16, view.x + view.w + 20, -16, 6, '#3a4f78', { flanges: false, light: -Math.PI / 2 });
    // The deck
    const tw = 400;
    const th = Math.max(140, h / camera.zoom * 0.3 + 40);
    for (let x = Math.floor(view.x / tw) * tw; x < view.x + view.w + tw; x += tw) if (x >= DECK.x0 - tw && x <= DECK.x1) drawSprite(ctx, deckTile(tw, th), x + tw / 2, ground, { snap: !camera.roll });
    // Vents: a hot glow under the grate, heat haze over it
    for (const vx of ventsAt) {
      const hot = 0.6 + 0.4 * Math.sin(t * 2 + vx);
      ctx.fillStyle = mix('#ff5a1f', '#ffd27a', hot * 0.5);
      ctx.fillRect(vx - 22, -3, 44, 5);
      glow(ctx, vx, 0, 50, '#ff7a2a', 0.55 * hot);
    }
    // Crates and barrels with their contact shadows
    for (const c of crates) {
      contactShadow(ctx, c.x, 2, c.w * 0.7, 9, '#04081c', 0.7);
      drawSprite(ctx, crateSprite(c.w, c.h), c.x, 0, { snap: flat });
    }
    for (const b of barrels)
      if (b.alive) {
        contactShadow(ctx, b.x, 2, 30, 8, '#04081c', 0.7);
        // A wobble under a thousandth of a radian moves no pixel: drawn straight (and 1:1)
        const rot = Math.abs(b.wob.value * 0.05) < 0.001 ? 0 : b.wob.value * 0.05;
        drawSprite(ctx, barrelSprite(), b.x, 0, { rot, snap: flat });
      } else {
        // A scorch mark and embers where it stood
        contactShadow(ctx, b.x, 1, 48, 10, '#02040e', 0.85);
      }
    const weld = opts.characters === false ? null : drawCharacters(ctx);
    const Sl = S.slime;
    const ry = -110 + R.hover;
    camera.end(ctx);

    // 3. Light: lamps (spots with shadows), the characters' own glow, the vents, effects
    lights.clear();
    for (const lx of lamps) lights.add({ x: lx + 43, y: -226, radius: 440, color: C.lamp, intensity: 1.15, flicker: lx === 300 ? 0.55 : 0.08, seed: lx, dir: Math.PI / 2, cone: 0.75 });
    const near = opts.characters !== false;
    if (near) {
      lights.add({ x: R.x, y: ry - 50, radius: 160, color: C.eyes, intensity: 0.55, shadows: false });
      lights.add({ x: R.x, y: ry + 60, radius: 200, color: C.accent, intensity: 0.75, shadows: false });
      lights.add({ x: Sl.x, y: Sl.y - 40, radius: 170, color: '#5affc8', intensity: 0.55, shadows: false });
    }
    for (const vx of ventsAt) lights.add({ x: vx, y: 0, radius: 150, color: '#ff6a2a', intensity: 0.7, flicker: 0.3, seed: vx, shadows: false });
    if (weld) lights.add(weld);
    lights.add(...fx.lights());
    const occ: Occluder[] = crates.map((c) => ({ pts: [[c.x - c.w / 2, -c.h], [c.x + c.w / 2, -c.h], [c.x + c.w / 2, 0], [c.x - c.w / 2, 0]] }));
    if (near) occ.push({ x: R.x, y: ry, r: 40 }, { x: Sl.x, y: Sl.y - 30, r: 36 });
    for (const b of barrels) if (b.alive) occ.push({ pts: [[b.x - 22, -60], [b.x + 22, -60], [b.x + 22, 0], [b.x - 22, 0]] });
    lights.occluders = occ;
    lights.render(w, h, t, camera);
    lights.apply(ctx, w, h);
    // 4. What emits light is drawn after the light map, so the darkness never dims it: effects, heat haze
    camera.begin(ctx);
    for (const vx of ventsAt) if (camera.visible(vx - 30, -70, 60, 70)) shimmer(ctx, vx - 26, -64, 52, 60, t + vx, 1.4, 8);
    fx.draw(ctx);
    camera.end(ctx);
    // The light direction at the robot drives its baked parts' shading (8 buckets)
    const [rsx, rsy] = camera.toScreen(R.x, ry);
    const dir = lights.dirAt(rsx, rsy);
    lightBucket = Math.max(0, Math.min(7, Math.floor(((dir + Math.PI) / (Math.PI * 2)) * 8)));
    fx.drawScreen(ctx, w, h);
    overlay.draw(ctx, w, h, q.grain);

    // The foreground in front of everything (parallax 1.35): a railing low on screen and cables sagging from the top —
    // framing and depth, never over the characters
    const fz = camera.zoom * 1.25;
    const off = (((-camera.x * 1.35 * fz) % (1100 * fz)) - 1100 * fz) % (1100 * fz);
    for (let x = off; x < w + 1100 * fz; x += 1100 * fz) drawSprite(ctx, railAt(fz), x + 550 * fz, h + 40 * fz, { snap: true });
    ctx.strokeStyle = '#0c1028';
    ctx.lineCap = 'round';
    const coff = (((-camera.x * 1.3 * fz) % (900 * fz)) - 900 * fz) % (900 * fz);
    for (let x = coff; x < w + 900 * fz; x += 900 * fz)
      for (const [k, wd] of [[0, 7], [0.4, 4]]) {
        ctx.lineWidth = wd * fz;
        ctx.beginPath();
        ctx.moveTo(x - 40, -10);
        ctx.quadraticCurveTo(x + 250 * fz, h * (0.16 + k * 0.08), x + 560 * fz, -10);
        ctx.stroke();
      }
    // 5. The HUD (screen space)
    if (hud) drawHud(ctx, w, h, t);
    quality.frame(performance.now() - t0);
  }

  function drawHud(ctx: Ctx, w: number, _h: number, t: number): void {
    const small = w < 520;
    const pw = small ? 196 : 262;
    const ph = small ? 86 : 104;
    glass(ctx, 12, 12, pw, ph, { r: 16, edge: '#5ff6ff', frost });
    const r = small ? 28 : 36;
    gauge(ctx, 12 + 16 + r, 12 + ph / 2, r, S.heat, { color: '#ffb23a', text: `${Math.round(S.heat * 100)}`, label: 'heat', warn: 0.85, t });
    gauge(ctx, 12 + 16 + r * 3 + 12, 12 + ph / 2, r, S.power, { color: '#5ff6ff', text: `${Math.round(S.power * 100)}`, label: 'power' });
    if (!small) {
      // Game type, not the system's: the labels in Exo 2 (@gp/art/type)
      ctx.font = canvasFont(EXO_2, 12);
      ctx.fillStyle = alpha('#c9e6ff', 0.8);
      ctx.textAlign = 'left';
      ctx.fillText('CORE', 12 + 16 + r * 4 + 30, 12 + 30);
      bar(ctx, 12 + 16 + r * 4 + 30, 12 + 42, 70, 10, S.power, { color: '#3fd0c9', segments: 5 });
    }
    // The score: an outlined HUD number on its own panel (drawNumber: tabular digits, so it doesn't shake as it counts)
    const sw = small ? 128 : 170;
    glass(ctx, w - sw - 12, 12, sw, small ? 46 : 56, { r: 14, edge: '#ffb23a', bevel: true, frost });
    ctx.font = canvasFont(EXO_2, 10);
    ctx.textAlign = 'left';
    ctx.fillStyle = alpha('#ffe6b8', 0.75);
    ctx.fillText('SCORE', w - sw, small ? 23 : 25);
    drawNumber(ctx, String(Math.round(S.shown)).padStart(6, '0'), w - sw, small ? 38 : 44, {
      font: EXO_2,
      size: small ? 21 : 27,
      fill: ['#fff7dc', '#ffc65c', '#ff9a2e'],
      outline: '#3a1600',
      glow: alpha('#ff9a2e', 0.35),
    });
    if (S.heat > 0.85) warning(ctx, w - sw - 34, 36, 26, t);
  }

  /** The blast only: main.ts scores it (a chain of taps, played back beat by beat by the ScoreSequencer) */
  function tap(sx: number, sy: number): number {
    const [x, y] = camera.toWorld(sx, sy + 0);
    explodeAt(x, Math.min(-10, y), 0.8);
    return 100;
  }

  // --- The cover's key art (host.qa({ cover }), docs/guides/covers.md) ---------------------------------------------
  // Forced perspective: the robot and its friend close to the camera on their own layer, baked at the scale they are
  // drawn (crisp), the forge behind them at half that scale (more of the world in frame), a barrel going up at the
  // layout's focus, welding sparks in front. The platform adds the title, the rim light, the halo and the vignette.
  function cover(): CoverArt {
    const sparks = new Fx({ seed: seed + 40, max: 800 });
    let posed = '';
    /** The near group (the robot at x 0, the creature behind it) fitted into the hero zone */
    const frame = (L: CoverLayout) => {
      const close = L.variant === 'closeup';
      // Face the action: toward the focus, or toward the title's side in a composition where the focus is behind
      const dir = L.focus.x >= L.hero.x + L.hero.w / 2 ? 1 : -1;
      const gx = close ? [-118, 118] : dir > 0 ? [-215, 112] : [-112, 215];
      const gy = close ? [-262, -40] : [-262, 14];
      const z = Math.min(L.hero.w / (gx[1]! - gx[0]!), L.hero.h / (gy[1]! - gy[0]!));
      // Screen position of world (0, 0): the robot's x on the deck
      const ox = L.hero.x + L.hero.w / 2 - ((gx[0]! + gx[1]!) / 2) * z;
      const oy = L.hero.y + L.hero.h / 2 - ((gy[0]! + gy[1]!) / 2) * z;
      return { z, ox, oy, dir, close };
    };
    const pose = (L: CoverLayout) => {
      const key = `${L.w}x${L.h}:${L.variant}`;
      if (posed === key) return;
      posed = key;
      const f = frame(L);
      const R = S.robot;
      Object.assign(R, { x: 0, vx: 0, dir: f.dir, hover: 0, weld: 1.2, weldOn: true });
      Object.assign(S.slime, { x: -150 * f.dir, y: 0, vy: 0, face: f.dir });
      // The light comes from where the platform's rim light does: the baked parts are shaded for it
      lightBucket = Math.max(0, Math.min(7, Math.floor(((L.light + Math.PI) / (Math.PI * 2)) * 8)));
      quality.set(0);
      // A still: this frame's light map, painted here
      lights.offThread = false;
    };
    const toHero = (g: Ctx, L: CoverLayout) => {
      const f = frame(L);
      g.translate(f.ox, f.oy);
      g.scale(f.z, f.z);
    };
    return {
      rim: '#7fe8ff',
      title: { fill: ['#fffaf0', '#ffd27a', '#ff8a2a'], outline: '#1b1448', glow: '#ff9a3c' },
      scene(g, L) {
        pose(L);
        const f = frame(L);
        setRenderScale(1);
        const zs = f.z * 0.5;
        camera.bounds = null;
        camera.setView(L.w, L.h);
        camera.zoom = zs;
        // The deck and the robot's x where the near layer has them
        camera.snap(-(f.ox - L.w / 2) / zs, -(f.oy - L.h / 2) / zs);
        camera.trauma = 0;
        camera.sx = camera.sy = camera.roll = 0;
        // The action moment: a barrel goes up at the focus, caught a few frames in (the fireball at its biggest)
        // The action moment: a barrel going up at the focus (its light in the light map, the fireball over the scene)
        fx.clear();
        const [wx, wy] = camera.toWorld(L.focus.x, L.focus.y);
        fx.light(wx, wy, 620 / zs, '#ffa04a', { intensity: 1.8, life: 1 });
        fx.emit('sparks', wx, wy, { scale: 1.4, n: 50 });
        fx.emit('embers', wx, wy, { scale: 1.4, n: 30 });
        fx.emit('debris', wx, wy, { scale: 1.4, n: 16 });
        for (let i = 0; i < 8; i++) fx.update(1 / 60);
        draw(g, L.w, L.h, false, { characters: false });
        burst(g, L.focus.x, L.focus.y, (f.close ? 0.26 : L.shape === 'landscape' ? 0.3 : 0.24) * Math.min(L.w, L.h), { seed: 5 });
        // The near characters' shadows on the deck
        g.save();
        toHero(g, L);
        contactShadow(g, 0, 2, 60, 13, '#04081c', 0.7);
        if (!f.close) contactShadow(g, S.slime.x, 2, 48, 10, '#04081c', 0.75);
        g.restore();
      },
      hero(g, L) {
        pose(L);
        const f = frame(L);
        // The scene's draw re-aims the baked parts at its lights: the cover's light again
        lightBucket = Math.max(0, Math.min(7, Math.floor(((L.light + Math.PI) / (Math.PI * 2)) * 8)));
        // Baked at the scale it is drawn: a 4× blow-up of a 1× bake is the blurry cover CrazyGames sends back
        setRenderScale(Math.min(6, Math.max(1, Math.ceil(f.z))));
        g.save();
        toHero(g, L);
        drawCharacters(g, { shadows: false, slime: !f.close, look: [(L.focus.x - f.ox) / f.z, (L.focus.y - f.oy) / f.z], surprised: true });
        g.restore();
      },
      front(g, L) {
        pose(L);
        const R = S.robot;
        sparks.clear();
        for (let i = 0; i < 48; i++) {
          const [tx, ty] = torchTip();
          if (i % 2 === 0) sparks.emit('sparks', tx, ty, { n: 6, angle: R.dir > 0 ? -0.5 : Math.PI + 0.5, spread: 1.7, scale: 1.1 });
          sparks.update(1 / 60);
        }
        g.save();
        toHero(g, L);
        sparks.draw(g);
        g.restore();
      },
    };
  }

  resize(800, 600);
  camera.snap(S.robot.x, -H * 0.3 / camera.zoom);
  // --- Baking ahead (prewarm) -----------------------------------------------------------------------------------------
  let warmStep = 0;
  let scratch: [HTMLCanvasElement, Ctx] | null = null;
  function prewarm(): boolean {
    // A 1 px canvas: what is drawn is thrown away, what it bakes stays in the caches (the sprite cache, the sized glows)
    scratch ??= canvas2d(1, 1);
    const g = scratch[1];
    g.setTransform(density() * camera.zoom, 0, 0, density() * camera.zoom, 0, 0);
    if (warmStep < 8) {
      const keep = lightBucket;
      lightBucket = warmStep;
      slimeBody();
      drawCharacters(g);
      for (const c of crates) crateSprite(c.w, c.h);
      barrelSprite();
      lightBucket = keep;
    } else if (warmStep < 14) {
      // An explosion's particles, 0.2 s a step: their (colour, size) sprites baked at the camera's scale
      if (warmStep === 8) warm.explode(0, -30, { scale: 1 });
      for (let i = 0; i < 12; i++) {
        warm.update(DT_WARM);
        warm.draw(g);
      }
    }
    return ++warmStep < 14;
  }
  const warm = new Fx({ seed: seed + 60, max: 400 });
  const DT_WARM = 1 / 60;

  function heroRect(): { x: number; y: number; w: number; h: number } {
    // The rig's box around its root: the antenna's bulb above the head to the thruster's flame below the body
    const R = S.robot;
    const ry = -110 + R.hover;
    const [x0, y0] = camera.toScreen(R.x - 50, ry - 100);
    const [x1, y1] = camera.toScreen(R.x + 50, ry + 60);
    return { x: Math.min(x0, x1), y: Math.min(y0, y1), w: Math.abs(x1 - x0), h: Math.abs(y1 - y0) };
  }

  return { state: S, update, draw, tap, boom, quality, lights, fx, camera, resize, cover, prewarm, heroRect };
}

