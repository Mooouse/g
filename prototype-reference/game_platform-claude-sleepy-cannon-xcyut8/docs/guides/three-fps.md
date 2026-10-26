# First-person 3D games on three.js

What our first first-person game taught: [Frankengun](https://github.com/QmaCyber/game22) (game22, 1.0.0, 2026-10-18),
a roguelite arena shooter on three.js 0.186 with every model built from voxels in code. QA 308/308, a second agent's
quality review with 7 `[blocking]` findings fixed, 634 KB gzipped. The patterns below are taken from its code and
generalised; the numbers are its own. The retro: [retro-frankengun.md](../team/retro-frankengun.md).

Read [code-games.md → Engines](code-games.md#engines) first: the three adapter (`@gp/core/engines/three`) already owns
the loop, the pause, the resize, the sound and a lost context. This page is what a first-person game needs on top.

## 0. What it costs before you write a line

- **Load.** Frankengun's upload: 1.7 MB raw, **634 KB gzipped, ≈ 4.8 s** to a tappable Play on the slow-phone profile
  (download 3.3 s + start 1.5 s). The split from `upload/size.json`: the game 868 KB raw (320 KB of it embedded audio:
  voice lines and effects), three 442 KB, `@gp/core` 107 KB, yuka 62 KB, camera-controls 46 KB. That is over the
  channel's 400 KB, so game.yaml raises it on purpose — `budget: { gzipKB: 1200 }` — and `gp forecast` counts the
  slower load ([the size and load budget](code-games.md#the-size-and-load-budget)).
- **No model files.** Its first version loaded GLB packs (1.6 MB); building the robots, the gun and the props from
  voxels in code (§4) dropped them and gave the game its own look. Each library is a line in the split: decide whether
  steering (yuka) or the title's camera moves (camera-controls) are worth 50–60 KB each.
- **WebGL2 only** (three r163+): blocklisted GPUs and old phones get the player's "can't run" (`I_ENGINE_WEBGL2`). QA
  checks that message ([what gp qa checks](code-games.md#what-gp-qa-checks-underneath-the-engine)).
- **Time.** The look, the controls and the frame rate took as much work as the rules: ≈ 14,500 lines of game code
  (sim.ts 3,154, main.ts 2,516, view/ ≈ 4,800).

## 1. The view: the adapter, your own draw

The adapter's `eng.scene` / `eng.camera` render a plain frame. With a post pass (bloom), leave them unset and draw
yourself at the end of `onFrame`:

```ts
import { threeAdapter } from '@gp/core/engines/three';
import { ACESFilmicToneMapping, PerspectiveCamera, Scene, SRGBColorSpace, Vector2, WebGLRenderer } from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

const eng = threeAdapter(host, canvas, { WebGLRenderer }, { background: '#07040f', step: DT, renderer: { powerPreference: 'high-performance' } });
const renderer = eng.renderer;
renderer.toneMapping = ACESFilmicToneMapping;
renderer.outputColorSpace = SRGBColorSpace;
const scene = new Scene();
const camera = new PerspectiveCamera(74, eng.size.width / eng.size.height, 0.04, 260);
scene.add(camera);                                   // the gun in hand is the camera's child (§3)
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new Vector2(256, 256), 0.6, 0.4, 0.82);   // strength, radius, threshold
composer.addPass(bloom);
composer.addPass(new OutputPass());                  // tone mapping and colour space after the bloom

eng.onStep(() => { if (state === 'play') step(run, readInput()); });     // the sim: pure, fixed step, seeded
eng.onFrame(() => { moveViewsTo(run); quality.bloom ? composer.render() : renderer.render(scene, camera); });
const sync = () => eng.setRunning(state === 'play' || state === 'title' || state === 'bench');
```

- The title can be a live 3D backdrop (Frankengun flies a camera between broadcast shots of the arena) — then declare
  `host.qa({ …, idleAnimation: true })`; the pause screen and an ad still stand still, and every still screen gets one
  `eng.renderOnce()` ([Still screens](code-games.md#still-screens)).
- Keep the sim free of three: positions, hits and line of sight are plain numbers in `sim.ts`, so the balance bots play
  whole 20-wave runs in Node (seconds each, 120 seeds for a difficulty number) and the view only shows what the sim decided.
- No MSAA in the game (`antialias: true` cost software WebGL 40 % of its frame rate); a render target with
  `{ samples: 4 }` for the cover and the thumbnails only.

## 2. Controls

**`LookInput` from `@gp/core` is all of this section as a block** (`new LookInput({ host, canvas, parent: ui, buttons })`,
`aimAssist` for the touch pull, `input.autoFire` for its switch — [code-games.md → Shooters and action](code-games.md#shooters-and-action-aim-enemies-bosses-the-announcer-threat-cues);
its browser test plays every point below). What it does, as Frankengun learnt it by hand:

### Desktop: pointer lock and "click to aim"

The mouse aims only under pointer lock, and the lock needs a user gesture. What worked:

```ts
canvas.addEventListener('mousedown', (e) => {
  if (!active || touch) return;
  if (e.button === 0) fireMouse = true;              // the click that takes the lock also fires
  if (document.pointerLockElement !== canvas) { lock(); dragLook = true; }
});
function lock(): void {
  try {
    const p = canvas.requestPointerLock() as unknown as Promise<void> | undefined;
    p?.catch?.(() => {});                              // refused (an iframe without permission, too soon after an exit)
  } catch { /* the drag-to-look fallback below still works */ }
}
addEventListener('mousemove', (e) => {
  if (!active || touch) return;
  const locked = document.pointerLockElement === canvas;
  if (!locked && !(dragLook && e.buttons)) return;   // no lock: look while a button is held
  const mx = Math.max(-200, Math.min(200, e.movementX));   // some browsers send one huge jump on lock
  const my = Math.max(-200, Math.min(200, e.movementY));
  yaw += mx * sens;
  pitch = Math.max(-1.25, Math.min(1.25, pitch - my * sens));
});
document.addEventListener('pointerlockchange', () => {
  if (document.pointerLockElement === canvas) onLock();   // remove the "click to aim" layer HERE
  else if (active && !touch) pauseGame();                  // Esc, alt-tab, the portal: losing the lock pauses
});
```

- **Pause on P, never on Esc.** Esc is the browser's (it exits the lock) and CrazyGames'; losing the lock pauses
  instead. Say so in `listing.controls`.
- **"Click to aim" is removed on `pointerlockchange`, not in its own `mousedown`.** The lock is granted asynchronously,
  and once it is, mouse events go to the locked canvas — the overlay's handler never fires (the code review found the
  pill stuck over the crosshair for a whole wave after every Resume).
- **Ask for the lock inside the click that resumes**: Resume and Next wave call `lock()` in their own click handler
  before `play()`.
- **Hold the wave clock and the spawns until the first click or key** on a desktop first run: in Frankengun the clock
  ran 4 s while "Click to aim" was still on screen (a reviewer's `[nice]`).
- `setActive(false)` on every non-play screen clears held keys, fire, the stick and the look pointers; `blur` clears
  keys. Physical key codes (`KeyW`) give ZQSD on AZERTY for free.

### Phones: twin-stick, aim assist, auto-fire

- **A floating stick under the left thumb**: its base appears where the thumb lands (radius 52 px), the knob follows,
  `setPointerCapture` keeps it when the thumb strays. **Drag anywhere on the right half to look** (sensitivity ×1.6 of
  the mouse's). The Fire button is also a look surface, so one thumb aims while it fires.
- **Drawn from the first frame of a run** (`data-gp-touch` on each zone; the stick base and the buttons visible before
  any touch) — QA's first-minute section checks it ([first-minute.md](first-minute.md)).
- **Aim assist and auto-fire on touch only**: each step, find the enemy nearest the crosshair inside a small cone, with a
  line of sight; turn toward it by at most a little per step, and fire while it is near the centre. A settings switch
  turns auto-fire off.

```ts
import { aimAssist } from '@gp/core';
import { forward, yawPitch } from '@gp/core/aim';
// the nearest live enemy within 0.16 rad of the crosshair, 30 m, line of sight free; at most 0.012 rad a step (Frankengun's 0.02 × 0.6)
const a = input.touch ? aimAssist(eye, forward(input.yaw, input.pitch), live, { cone: 0.16, range: 30, strength: 0.6, maxTurn: 0.012, fireCone: 0.12, visible: (e) => lineFree(run, eye, e) }) : null;
if (a) ({ yaw: input.yaw, pitch: input.pitch } = yawPitch(a.dir));   // a soft pull, never a snap
if (a?.onTarget && input.autoFire) fire = true;
step(run, { …, fire, assist: input.touch ? 0.05 : 0.015 });          // the sim's own bullet magnetism, wider on touch
```

- Haptics on a hit, a heavy landing and an ability (`navigator.vibrate`, behind a settings switch).
- The control hints are learned by doing (`hints().done(k)` from the controls' first move, first look, first dash) and
  go for good after the first minute of play.

## 3. The camera: field of view and the thing in hand

**Portrait: compute the field of view from a horizontal angle.** three's `fov` is vertical; Frankengun's 82° vertical view on a
360×800 phone showed only ≈ 43° across, and robots hit you from outside the screen (a `[blocking]` finding). Keep the
vertical angle in landscape; in portrait derive it from ≈ 68° across, capped. `gp qa` checks it: at 360×800 the camera
(the adapter's `eng.camera`, or `host.qa({ camera })`) must see at least 60° across (`E_QA_PORTRAIT_FOV`):

```ts
camera.aspect = width / height;
const H = (68 * Math.PI) / 180;                       // the horizontal view a portrait phone keeps
baseFov = camera.aspect < 1 ? Math.min(110, (2 * Math.atan(Math.tan(H / 2) / camera.aspect) * 180) / Math.PI) : 74;
camera.fov = baseFov;
camera.updateProjectionMatrix();
```

**The thing in hand stays inside the frustum.** The gun is a child of the camera; on a narrow screen its x comes from the
view's half-width at its depth, not a constant (in portrait a fixed offset put it off the right edge):

```ts
const halfW = Math.tan((camera.fov * Math.PI) / 360) * camera.aspect * depth;   // depth: how far ahead it hangs (0.38 m)
gunRoot.position.x = Math.min(0.16, halfW * 0.55);
```

- Its life: sway against the turn (eased, clamped ±0.04), a bob with the steps, a recoil kick per shot (the form's
  own: a sniper's slam, a laser's hum), a reload dip, a muzzle flash with a short point light.
- A dash kicks the field of view 11° wider and eases it back (`baseFov + 11 * sin(k * π/2)`), with speed lines.
- A camera shake is a damped sine added to the camera position, not a random jitter.
- A part that snaps onto the gun pops in white for a moment: the twist is something the player sees in hand.

## 4. Voxel models in code

A model is a few **parts** (torso, head, arms, legs, the gun), each a set of coloured cubes around its **pivot**: the
parts move (the procedural animation) and come off (a severed limb, a robot bursting into scrap).

```ts
const v = new Vox('trooper', [S('#c9ccd6'), S('#2a2d38'), S('#ff2bd6', 1), S('#21e6ff', 1)]);   // S(colour, glow)
v.part('torso', null, [0, 10, 0]).box([-3, 8, -2], [3, 14, 2], 0).box([-3, 12, 2], [3, 12, 2], 2);
v.part('head', 'torso', [0, 15, 0]).ball([0, 17, 0], 2.2, 0).box2([1, 17, 2], [1, 17, 2], 3);   // box2: mirrored eyes
v.part('armR', 'torso', [4, 13, 0]).box([4, 7, -1], [5, 13, 1], 0).cyl('z', [5, 7, 0], 1, -6, 0, 1);
const model = v.build();
```

**One geometry per part**, built once: only the faces no cube of the same part hides; each corner shaded by the cubes
around it (ambient occlusion baked into the vertex colour, the quad's diagonal flipped toward the brighter corners);
**greedy meshing** — faces of one colour with an even occlusion merge into rectangles (the robots: 41.6k → 20.5k
triangles); a `glow` attribute (0 paint … 1 a light) for the emissive, and a `cell` attribute (a point half a cube
inside) so the shader can scorch the model cube by cube. A far copy takes `{ flat: true }` (no occlusion: every face of
a colour merges) and `{ noBottom: true }` (no faces nobody sees).

**One material for everything**: `MeshLambertMaterial` (cheap on phones and on software WebGL) with `vertexColors` and
an `onBeforeCompile` patch — the glow as emissive, a fresnel rim in the thing's colour, a white hit flash, damage that
darkens cubes with white-hot cracks at its edge, a dissolve on death, the near-camera dissolve (§7). Set
`customProgramCacheKey` so the patched program is compiled once.

**One instanced draw per kind and part.** Each enemy kind's parts are `InstancedMesh`es (capacity per kind: 6 for a
boss, 56 for a regular, 110 for a swarm); each frame writes every live robot's part matrices (`setMatrixAt` of the
pose's turn and offset) and per-instance effects (`iFx`: flash, damage, heat, fade) and sets `count`. A torn limb stays
an instance of its part's mesh while it tumbles and lies glowing on the floor; a destroyed robot bursts into an instanced
pool of loose cubes. `frustumCulled = false` on the instanced meshes (their bounds change every frame).

**A crowd is one draw animated on the GPU**: ≈ 1,800 voxel fans in one `InstancedMesh`, a phase and a shirt colour per
instance (`InstancedBufferAttribute`), the bob, the raised arms and a stadium wave in the vertex shader from three
uniforms (time, excitement, the wave's angle). Shuffle the seats once, so a quality level that draws fewer
(`mesh.count`) keeps the stands evenly filled.

**Pictures for DOM screens from the same models.** The armory's guns, the chassis select and the results' gun are the
voxel models rendered once off screen to a PNG and cached — no image files, and the screens match the game. The adapter
does the render target, the read-back, the row flip and putting the renderer back (`eng.snapshot`); `fitToRect` frames
the model (Frankengun's cover set the camera's distance and `setViewOffset` by hand to put the gun in the hero area):

```ts
const eng = threeAdapter(host, canvas, { WebGLRenderer, WebGLRenderTarget, Color });
const s = new Scene();                                 // its own light; the model in it
const cam = new OrthographicCamera();
fitToRect(cam, new Box3().setFromObject(model), { x: 0, y: 0, w: 240, h: 120 }, { width: 240, height: 120 }, { direction: { x: -1, y: -0.2, z: -0.3 } });
thumbs.set(id, eng.snapshot(240, 120, () => ({ scene: s, camera: cam })).toDataURL('image/png'));   // MSAA ×4, transparent
```

## 5. The draw-call and triangle budget

**Measure in a dev build.** `stats-gl` (a dev dependency, imported only under `import.meta.env.DEV` behind `?stats`)
shows fps, GPU time and draw calls. To count a whole frame with a composer, three's per-render reset must be off — each
pass is a `render()` call, and with `autoReset` on you read only the last pass:

```ts
renderer.info.autoReset = false;
// per frame: renderer.info.reset(); draw(); then renderer.info.render.calls, .triangles; renderer.info.memory.geometries, .textures
```

What moved Frankengun's numbers (a fight: **271 → 209 draw calls, −40 % triangles**):

| Change | Why it helps |
|---|---|
| Robots don't cast real shadows; each gets a blob (one instanced draw of soft quads under all of them) | every shadow caster is drawn again in the shadow pass: a crowd of robots costs as much there as on screen. Only a boss, the cover and the props cast |
| The shadow map redrawn every third frame (`shadowMap.autoUpdate = false`, `needsUpdate = true` on every third) | what casts is slow-moving; the pass is a full scene draw |
| Fans flat (no corner shading, so faces merge) and soleless, 85 % of the seats filled | 1 of 1,800 fans 30 m away needs neither |
| Greedy meshing in the voxel builder | robots 41.6k → 20.5k triangles |
| The cheapest levels: the stands unlit (`MeshBasicMaterial` a shade darker), no fans; the fireworks' points drawn only while one flies; light pools, banners and halos off | a software renderer's frame: 35k → 16k triangles, ≈ 3 ms less lighting the stands, 5 ms less for idle points |

**Dispose what you rebuild.** `renderer.info.memory.geometries` and `.textures` must stay flat across waves. The code
review found per-enemy clones whose bone textures were never freed, a material per enemy shot and per pickup, and a gun
rebuilt on every pickup without disposing the old parts: share one material per kind, pool, and dispose the old
subtree's generated geometries and materials before `group.clear()` (never the shared model geometry).

## 6. Light that stays readable: the glare audit

Bloom plus emissive surfaces plus additive effects near the lens turn the screen white exactly when the player needs
to see — standing in a charging zone, killing a boss, in a blast. Frankengun's audit took screenshots at fixed moments
with the quality pinned (`?q=1` in dev: bloom on) and counted the blown-out pixels per moment. A dev hook that counts them
in the frame just drawn (call it right after the draw, in the same task):

```ts
function glare(gl: WebGL2RenderingContext): number {
  const w = gl.drawingBufferWidth, h = gl.drawingBufferHeight;
  const px = new Uint8Array(w * h * 4);
  gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, px);
  let n = 0;
  for (let i = 0; i < px.length; i += 4) if (px[i] > 250 && px[i + 1] > 250 && px[i + 2] > 250) n++;
  return n / (w * h);                                   // the share of white pixels
}
```

The moments to check: standing in every zone that glows, a boss's death, a blast at your face, beside each hazard, the
busiest fight. What it found and the fixes, as rules:

- **No full glow on a big surface under the player's feet.** The shrine's centre was a white disc at glow 1: through
  the bloom it whited the screen while you charged it → its centre glows faintly in the place's colour (glow 0.2), the
  charge ring dimmed.
- **Columns and walls of light fade with the camera's distance.** A hazard pad's flare and the shrine's beam drop to a
  trace when you stand in them (`opacity × clamp((d − r/2) / 4, 0.3, 1)`).
- **Additive sprites are capped in screen size and fade in the last 1.5 m before the lens**: in the point shader,
  `gl_PointSize = min(size * scale / -mv.z, maxPx)` and `alpha *= smoothstep(0.35, 1.6, -mv.z)`.
- **A blast you stand in is dimmed** by how close the camera is to its centre (down to 15 %): the ring still says
  "explosion".
- The bloom at half resolution with a high threshold (0.82), so only real lights bloom.

## 7. Near-camera dissolve

In first person a pillar, a robot or a crate at your face walls the screen off, and the near plane cuts it open. The
world's material discards fragments closer than ≈ 1.6 m in a screen-space dither that thins out smoothly; the gun's own
material passes 0 and never dissolves:

```glsl
// fragment, at the top of main(); vViewPosition is three's view-space position (minus)
if (uNearFade > 0.0) {
  float nk = clamp((length(vViewPosition) - 0.35) / (uNearFade - 0.35), 0.0, 1.0);
  float ign = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));   // interleaved gradient noise
  if (ign > nk * nk * (3.0 - 2.0 * nk)) discard;
}
```

No transparency, no sorting: it stays in the opaque pass.

## 8. X-ray outline for bosses

A boss in a crowd of small robots and pillars is lost behind them. A second `InstancedMesh` per boss part shares the
part's geometry **and its `instanceMatrix`** and draws with the depth test reversed, between the scene and the boss:
it shows only where something stands in front of the boss.

```ts
const ghost = new ShaderMaterial({
  uniforms: { uColor: { value: new Color(bossColor).multiplyScalar(1.4) } },
  vertexShader: `varying float vRim;
void main() {
  vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
  vec3 n = normalize(mat3(modelMatrix * instanceMatrix) * normal);
  vRim = 1.0 - abs(dot(n, normalize(cameraPosition - wp.xyz)));
  gl_Position = projectionMatrix * viewMatrix * wp;
}`,
  fragmentShader: `uniform vec3 uColor; varying float vRim;
void main() { gl_FragColor = vec4(uColor * (smoothstep(0.6, 1.0, vRim) * 0.8 + 0.12), 1.0); }`,
  transparent: false,            // in the opaque pass, ordered by renderOrder
  depthFunc: GreaterDepth,       // only behind what is already drawn
  depthWrite: false,
  blending: AdditiveBlending,
});
bossPart.renderOrder = 20;       // the scene (0), then the x-ray (10), then the boss over it
const xray = new InstancedMesh(bossPart.geometry, ghost, cap);
xray.instanceMatrix = bossPart.instanceMatrix;
xray.renderOrder = 10;
```

Each frame set `xray.count` to the live bosses only (torn-off limbs get no outline). An off-screen arrow at the edge
points to a boss you can't see at all: `edgeArrow(screenOf(bossAt.project(camera), w, h), w, h, { inset: { bottom: gridH } })`
from `@gp/art/hud` (a boss behind you comes out mirrored from three's projection; `screenOf` turns it round, so the
arrow points the right way and never says "on screen"), drawn with `drawEdgeArrow` or by your DOM arrow at `{ x, y, angle }`.

## 9. Quality levels on phones

`AutoQuality` in `@gp/art/perf` is the Canvas 2D version (four levels of particles, light map and grain, judged on the
frame's work). A three game's ladder is `QualityLadder` (`@gp/core`): your levels, a start by `deviceTier()`, judged on
the frame interval with doubling hysteresis, `?q=` in dev — and the render scale through `eng.setRenderScale(scale,
{ dprMax })` ([code-games.md → Quality levels](code-games.md#quality-levels-and-pictures-of-the-engines-scenes)).
Frankengun's levels, and its start written by hand (the block's `deviceTier` and `startLevel` give the same 6 / 3 / 1):

```ts
export const QUALITY = [            // from the best (0) to the cheapest
  { scale: 1,    dprMax: 2,    bloom: true,  shadows: true,  shadowMap: 2048, particles: 1,    detail: 1 },
  { scale: 1,    dprMax: 1.5,  bloom: true,  shadows: true,  shadowMap: 1024, particles: 1,    detail: 1 },
  { scale: 1,    dprMax: 1.25, bloom: false, shadows: true,  shadowMap: 1024, particles: 0.8,  detail: 0.8 },
  { scale: 0.85, dprMax: 1,    bloom: false, shadows: false, shadowMap: 512,  particles: 0.6,  detail: 0.7 },
  { scale: 0.65, dprMax: 1,    bloom: false, shadows: false, shadowMap: 512,  particles: 0.45, detail: 0.5 },
  { scale: 0.5,  dprMax: 1,    bloom: false, shadows: false, shadowMap: 512,  particles: 0.35, detail: 0.35 },
  { scale: 0.32, dprMax: 1,    bloom: false, shadows: false, shadowMap: 512,  particles: 0.25, detail: 0.2 },
];
// the start level from the device: a software renderer at the cheapest, a phone in the middle, a desktop at 1
const dbg = gl.getExtension('WEBGL_debug_renderer_info');
const gpu = String(dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : '');
let level = /swiftshader|llvmpipe|software|basic render/i.test(gpu) ? 6 : matchMedia('(pointer: coarse)').matches ? 3 : 1;
```

- **Judge the interval between frames, not the CPU work**: a WebGL frame's GPU time doesn't show in the CPU time of
  your update and draw. A smoothed interval above ≈ 21 ms for 45 frames steps down; below ≈ 14 ms for a calm stretch
  steps up, and the calm needed doubles after each step down (5 s → at most 60 s), so it doesn't flap.
- A step sets `eng.setRenderScale(scale, { dprMax })` (the adapter sets the renderer's pixel ratio and size and calls
  your `onResize`: there `composer.setPixelRatio(eng.size.dpr)` and `setSize`), the bloom's resolution, the sun's shadow
  map (dispose the old map), the particle and detail shares.
- Below a render scale of 0.6 the adapter sets `image-rendering: pixelated` on the canvas: a filtered full-screen upscale
  cost a software compositor ≈ 10 ms.
- A settings choice: "Low" sets a floor (never better than level 4), "High" starts at 0.
- Dev: `?q=<level>` pins a level (glare audits, screenshots); the cover and `gp video` (the virtual clock,
  `'__gpAdvance' in window`) pin the best look, since time doesn't run out there.
- The reviewer's `[nice]` on 1.0: QA measured 38–49 fps at 4× CPU on the phone sizes — start a phone one level lower.

## 10. What `gp qa`'s software GPU can and can't measure

QA's headless Chromium renders WebGL on a software rasterizer (SwiftShader). A game that detects it starts at its
cheapest level — so QA plays that level.

| QA measures | QA can't measure |
|---|---|
| the main thread's CPU per frame: the sim, the scene graph, building matrices, **draw-call submission** (fewer draw calls show up here) | GPU fill rate and overdraw, bloom, shadow maps and shaders on a real GPU |
| the frame rate at the level a software renderer gets, ≥ 50 fps idle-machine and the first 30 s at 4× CPU ([first-minute.md](first-minute.md)) | a real phone's frame rate, thermal throttling over a 30-minute run |
| still screens, one AudioContext, a lost WebGL context, no WebGL2 → "can't run" | pointer lock inside the portal's iframe; how the twin-stick feels |
| screenshots at every size (the flat-frame hint, every declared screen), the twist and its words | the look at the best level: QA's frames are the cheapest level's (low scale, no bloom, no shadows) — look at the cover and `gp video` frames, or pin `?q=1` yourself |
| the touch controls drawn at the first frame, no loss in 12 s untouched | whether a new player with random thumbs survives the first minute: play it yourself (§11) |

The reviewer's and the maker's interactive sessions in the same headless browser ran at a few fps at the higher
levels: judge pacing and fairness from the bot (`balance()`) and the sim's clock, not from a slow browser. Say what
wasn't measured in REPORT.md (AGENTS.md §2.7).

## 11. A first run a new player survives

First-person on a phone is the hardest first minute we have. Frankengun's first review died 35 s into wave 1 with
random thumbs; the fixes were:

- **A rookie factor on the first run** (`save.runs === 0`): the robots hit at 45 % for the first two waves
  (`ROOKIE = { waves: 2, dmg: 0.45 }` in data.ts, one multiplier in the sim's damage-to-player). Afterwards three fresh
  runs survived wave 1 untouched or with random thumbs; QA's touch bot ended wave 1 at 65/100 HP (was 20/100).
- **A cue for every hit**: a red arc on a ring round the crosshair toward the attacker (behind you: at the bottom), not
  only an arrow for the boss — `HitArcs` in `@gp/art/hud` (`arcs.hit(hitAngle(eye, yaw, attacker))`, `mount(ui)` or
  `draw(ctx, …)`; hits from one side refresh one arc), and `DamageNumbers` for what each hit did (pooled, merged per
  target or area, `only: 'big'` on a busy phone screen).
- **The first kill always drops the twist** (a gun part) with a three-word hint, and `host.twist()` fires when it snaps on.

The lessons behind these, and the others the review found (drawn icons, themed platform screens, side systems after
two runs, the twist on the cover, a skilled bot for difficulty, late-run variety): `gp lessons`.

## 12. The libraries it used, and how each obeys the platform

Frankengun's `games/frankengun/package.json`: `three` 0.186.1, `yuka` 0.7.8, `camera-controls` 3.1.2; dev only:
`stats-gl` 4.2.3, `@types/three`, `@types/yuka`. Its own `docs/concept.md` still says yuka, camera-controls and stats-gl
were "not taken": they were adopted the same morning (the code is the truth, not the note). Each one is a line in the
upload's split (§0), so each must pay for itself.

| Library | What it does in Frankengun | How it fits the platform's rules |
|---|---|---|
| **three** addons (`three/examples/jsm/…`) | `EffectComposer` + `RenderPass` + `UnrealBloomPass` + `OutputPass` (the bloom, §1); `mergeGeometries` from `BufferGeometryUtils` (the stands, shadows, rings: one mesh each) | tree-shaken: only the imported addons land in the upload; the adapter (`@gp/core/engines/three`) owns the loop, pause, resize and a lost context — the game draws the composer in `onFrame` |
| **yuka** (game AI: steering behaviours) — now **`@gp/core/steer`** (≈ 1 KB gzipped, the same forces without the library) | the robots' steering in `steer.ts`: obstacle avoidance round the cover, separation, pursuit of where the player is going, offset pursuit to a slot of their own round the player (a pack surrounds instead of queueing; slots by the golden angle of the id), gunners `Arrive` at a flank point on the side the player isn't looking at | **force only**: module-level scratch `Vehicle`s take the robot's position and steered velocity each step, the behaviours return a force, the *sim* integrates it. No `EntityManager`, no yuka `Time`, nothing kept in yuka between steps, rotations reset every step, nothing random — so a seeded run replays exactly and the balance bot plays whole runs in Node (the sim stays three-free). 62 KB raw |
| **camera-controls** (yomotsu) | the title's "TV director": damped flights between six broadcast shots of the arena, a new shot every 6.5 s, a slow drift inside a shot (`view/director.ts`) | not connected to input or the page (no `connect()`): the run's first-person camera is the sim's, not this. `CameraControls.install({ THREE: { Vector2, Vector3, … } })` with only the classes it needs; `update(dt)` from the adapter's frame, so it stops with the host's pause. 46 KB raw |
| **stats-gl** (dev only) | fps, GPU time and draw calls in a panel with `?stats` | `import.meta.env.DEV` + a dynamic `import('stats-gl')`: never in the build players get; the frame rate that counts is `gp qa`'s at 4× CPU |

What it wrote itself rather than took: the voxel builder with hidden-face culling and greedy meshing (§4), the crowd on
the GPU, the quality ladder (§9; now `QualityLadder` and the adapters' render scale), the glare and render audits (§5,
§6), the adaptive music (now `createSceneMusic` in `@gp/core/sound`), the season, contracts and weekly event (now
`seasonPass` / `weeklyEvent` in `@gp/core`), the controls (now `LookInput` + `aimAssist`), the announcer's queue (now
`callouts()` in `@gp/core`: ranks, cooldowns, stale lines, streaks, held for the voice, the music ducked), the hit arcs,
boss arrow and damage numbers (now in `@gp/art/hud`) and the thumbnails (now `eng.snapshot` + `fitToRect`).

**Sound and voice, made offline** (`games/frankengun/assets/provenance.yaml`): effects from four Kenney CC0 packs, trimmed
and re-encoded to mono MP3 48 kbps with ffmpeg; the host's announcer lines generated once with Gemini TTS from the
`say.*` strings, then made robotic with an ffmpeg chain (pitch −6 %, high-pass, chorus, light bit-crush, arena echo,
−14 LUFS, mono MP3 32 kbps); three lines where the TTS quota ran out from ffmpeg's built-in flite through the same chain.
Every file has its source, licence and hash in provenance.yaml. Embedded audio was 320 KB of the upload: budget it.

**Choosing a library for a code game** — the questions Frankengun answered for each:
1. Does it need its own loop, clock or random numbers? Then use it as a pure function the sim calls (yuka's forces) or
   only in the view, stepped from `onFrame` (camera-controls); never let it schedule frames or own the game's state.
2. Can the sim stay deterministic and engine-free with it? The balance bot and run seeds depend on it.
3. What does it add to the upload (the split in `upload/size.json`) and is that worth more than 30 lines of your own?
4. Dev-only tools behind `import.meta.env.DEV` and a dynamic import.

## Checklist

- [ ] the budget raised on purpose in game.yaml, the split read; models built in code, no model packs
- [ ] the sim pure and three-free; the bot plays whole runs in Node
- [ ] `LookInput`: click takes the lock and fires, the prompt removed on `pointerlockchange`, lock lost → pause, P pauses (not Esc), drag-to-look when refused, the clock held until `onFirstInput`
- [ ] touch: the floating stick and the look half drawn from the first frame, Fire also aims, `aimAssist` and auto-fire (switchable)
- [ ] portrait: the field of view from ≈ 68° across; the held thing inside the frustum at every aspect
- [ ] one instanced draw per kind and part; robots without a shadow pass; `renderer.info` read with `autoReset` off; memory flat across waves
- [ ] the glare audit at the bright moments; additive sprites capped and faded at the lens
- [ ] the world dissolves near the camera; a boss shows through what stands in front of it
- [ ] `QualityLadder` with `eng.setRenderScale`, started by `deviceTier()`, judged on the frame interval, pinnable in dev (`?q=`)
- [ ] each library used as a pure function or a view stepped from `onFrame`; dev tools behind `import.meta.env.DEV`
- [ ] a rookie first run, `HitArcs`, `edgeArrow` to the boss; REPORT.md says which frame rates came from a software GPU
