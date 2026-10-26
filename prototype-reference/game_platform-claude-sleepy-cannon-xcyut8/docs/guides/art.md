# Art: drawing games that look finished (`@gp/art`)

Every game on the platform is drawn in code. Until now that meant flat circles and boxes: CrazyGames rejected three of our
games for "the overall quality", our covers' click-through was 0.6–1.2 % (the portal's target is 2–4 %), and a reviewer
of Kettlebot spelled out what players see — brown, dirty palettes, thick black outlines, flat panels, big empty spaces,
a robot that looks like a toy. **`@gp/art`** is the platform's drawing module for `kit: code` games (Canvas 2D): the
rules below, as code — palettes with roles, lit materials, 2D lights and shadows, baked sprites, rigs and procedural
animation, effects, a camera with feel, backgrounds with depth, a glass HUD and an auto-quality that keeps it smooth.

![Forge Night: the @gp/art showcase at 1280×720](art/forge-night-desktop.png)

*Forge Night (`docs/examples/art`, a `kit: code` game QA checks and builds like any other): a rigged robot and a jelly
creature idling (breathing, blinking, springy antenna and feelers, eyes that follow the action) under lamps with soft
shadows, on a seven-layer parallax dusk with depth fog; welding sparks, steam, heat haze, an explosion with a shockwave,
debris, smoke, a light flash and camera shake; a glass HUD with gauges and an outlined score in a bundled game face (`@gp/art/type`). The phone layout:
[art/forge-night-phone.png](art/forge-night-phone.png). Everything is code: no image files.*

**Two ways to make the pictures, on top of the same code.** Draw them in code with `@gp/art` (this page's rules and
recipes), or have an image model paint them at build time with **`gp art`** ([§ 5](#5-generated-art-gp-art)): a style
board, then sprites cut out to transparency and backgrounds in that style, bundled as WebP. The owner compared our code
art with games made in Google AI Studio, whose painted images look far more finished; generated art closes that gap. Either
way the life stays in code — lights, effects, rigs, the camera and the HUD from `@gp/art` on top of the images.

```sh
npm run gp -- dev docs/examples/art            # play it; ?at=4.72 renders the frame above, ?meter shows the frame time
npm run gp -- init ../my-game-repo --id my-game  # the Canvas skeleton draws with @gp/art already (games/<id>/art.ts)
```

## 1. The rules (what a reviewer sees)

`gp review` gives the second agent this list as its art checklist; `gp qa` measures rule 12 (depth) on every play
screenshot — how much of the frame is one colour, how many lightness levels it uses, how much of it is featureless (a
hint in the report, never a failure: `look: depth in the play frame`). The other rules are the reviewer's eye.

1. **One palette with roles.** Every colour has a job: the far backdrop (`bgDeep`), the backdrop (`bg`), the midground
   (`mid`), surfaces, text (`ink`), the hero (`accent`, `accent2`), danger, emissive light (`glow`), the key light's
   tint (`light`) and the shadow tint (`shadow`). Pick a mood from `PALETTES` (`neon`, `forge`, `pastel`, `crypt`,
   `candy`, `meadow`, `reef`, `dune`, `haunt`) or write your own and run `checkPalette()` on it. Colours are `#hex`,
   `rgb()` / `hsl()` (commas or spaces, `/ alpha`, % values) or a basic CSS name (`NAMED`); one `@gp/art` can't read
   draws grey with a console warning, never a throw in the frame loop (`tryParse()` returns null for it).
2. **Value first, hue second.** Squint, or look at the frame in grayscale (`gray()`): the hero and the danger must read
   against the background by lightness alone (`checkPalette` wants ΔL ≥ 0.12), text needs 4.5:1. No brown-grey: a
   colour of low chroma in the yellow-red hues reads as dirt (`checkPalette` flags it as muddy).
3. **One light direction for the whole scene.** Choose where the key light is (default: up-left, `DEFAULT_LIGHT`) and
   shade every sprite from it. With a `LightLayer`, ask it: `lights.dirAt(x, y)` is the direction of the strongest light at
   a point — bake the sprite for that direction (Forge Night bakes its robot in 8 directions and picks one per frame).
4. **Hue-shifted shading, at least three values per material.** Shadows go cooler (toward blue-violet) and a bit more
   saturated, lights warmer (toward yellow) and paler — `shade(c, t)` and `ramp(c, n)` work in OKLCH so the steps are even.
   Never shade by mixing in black or white. `paint()` does it for you: base, form shadow, core shadow, bounce light from
   the ground, rim light from behind, highlight, specular, ambient occlusion at the edges.
5. **Outlines in a darker shade of the base, never black.** `paint({ outline: 2 })` strokes in the base's deepest
   hue-shifted tone (`outlineOf`). Thin: 1.5–3 px at the sprite's size. A thick black outline is what makes code art look
   like clip art.
6. **Shadows under everything.** Every character and prop that stands somewhere gets a `contactShadow()` (soft, dark,
   tinted with the palette's `shadow`), squashed and lighter when it jumps. Lights cast shadows where it matters
   (`LightLayer.occluders`).
7. **Silhouettes first.** Fill the sprite with one colour: can you tell what it is, which way it faces, what it does?
   Characters are big shapes with a few small ones (eyes, antenna) — not many equal pieces.
8. **Always alive.** No character stands still: breathing (`breathe`), a hover or bob (`bob`), a sway (`sway`), a blink
   at seeded, irregular moments (`Blinker`), eyes that look at the action (`lookAt` → `eye({ look })`), springy parts that
   lag and swing (`Wobble`, `Spring`).
9. **The animation principles that matter for code games:** squash and stretch with the volume kept (`stretch` from the
   velocity, `squash` on a landing, `Jelly` on a hit); anticipation and overshoot (`anticipate`, `ease.outBack`);
   follow-through and secondary motion (springs on antennas, ears, cables, hair); arcs (move on curves, not straight
   lines); easing on everything (`ease`, `Tweens`, `approach`).
10. **Juice on every action.** A tap, a hit, a pickup, a death: particles (`fx.emit`), a sound, a light flash
    (`fx.light`), a shake or a kick (`camera.addTrauma`, `camera.kick`), a hit-stop on big hits (`fx.hitStop`), a squash
    (`Jelly`), a number that pops (`fx.text`). One of these is feedback; three at once is juice.
11. **Camera feel.** Follow with a dead zone and smoothing, look ahead of the motion, stay inside the level, shake from
    trauma (smooth noise that decays — never random jitter), punch on hits. `Camera` does all of it.
12. **Backgrounds with depth, no empty space.** A gradient sky, then layers from far to near: each farther one lighter,
    bluer (closer to the haze colour) and lower in contrast, fog pooling between them, the near ones darkest. Something
    small moves (a beacon, drifting fog, a twinkling star). Frame the action with a dark foreground (a railing, cables).
    `gp qa` reports a play frame that is mostly one colour, uses few lightness levels or is mostly featureless.
13. **A designed HUD.** Translucent dark panels with a thin light edge and a glowing accent (`glass`), circular gauges,
    bars with a gloss line, digital readouts — not flat opaque boxes. Text stays ≥ 12 px at 821×462 (the QA rule).
14. **One style everywhere:** the play screen, the menus, the covers (`host.qa({ cover })`: [covers.md](covers.md)) and the video use the same palette, light
    and line weight.

## 2. Recipes

### A lit robot in 20 lines

```ts
import { paint, contactShadow, glow } from '@gp/art/material';
import { squircle, capsule, visorEyes } from '@gp/art/shapes';
import { SpriteCache, drawSprite } from '@gp/art/sprite';
import { Blinker, breathe, bob } from '@gp/art/rig';

const sprites = new SpriteCache();
const blink = new Blinker(7);                                         // seeded: QA screenshots repeat
const body = () => sprites.get('robot:body', 90, 110, (g) => {       // baked once (re-baked on a density change)
  paint(g, capsule(-30, -10, 60, 60), { x: -30, y: -10, w: 60, h: 60 }, '#e9eef7', { style: 'glossy', outline: 2 });
  const head = squircle(0, -40, 88, 64, 3.6);
  paint(g, head, { x: -44, y: -72, w: 88, h: 64 }, '#e9eef7', { style: 'glossy', outline: 2 });
  paint(g, squircle(0, -36, 70, 40, 3.4), { x: -35, y: -56, w: 70, h: 40 }, '#203a7a', { style: 'glass', opacity: 0.6 });
}, { pad: 10 });

function drawRobot(g: CanvasRenderingContext2D, x: number, y: number, t: number, dt: number) {
  const b = breathe(t, 0.3, 0.02);
  const hover = bob(t, 0.55, 6);
  contactShadow(g, x, y + 70, 50 - hover, 12);                         // on the ground, smaller as it rises
  drawSprite(g, body(), x, y + hover, { sx: b.sx, sy: b.sy });
  visorEyes(g, x, y + hover - 36, 64, 26, { blink: blink.update(dt), mood: 'happy' });
  glow(g, x, y + hover + 52, 40, '#ff8a2a');                           // the thruster's light
}
```

A part-based character (arms that swing, a head that leans, an antenna on a spring) is a `Rig` of parts, each drawing a
baked sprite around its pivot; `rig.pose` sets the offsets every frame and `rig.worldOf('armR', x, y)` gives where a
part's point is (the torch tip for the sparks). Forge Night's robot is that: [scene.ts](../examples/art/scene.ts).

### A parallax industrial background

```ts
import { Scenery } from '@gp/art/scenery';

const sky = new Scenery({
  sky: ['#050a1e', '#0d1a40', '#23336c', '#6b4a86', '#e0806a'],   // top → horizon
  haze: '#7a6aa0',                                                 // far layers fade into it
  stars: 260, planet: { x: 0.78, y: 0.2, r: 70, color: '#8f7ad8', ring: '#e0c8ff' },
  sun: { x: 0.3, y: 0.66, r: 26, color: '#ffb27a', glow: 2.2 }, rays: { color: '#ffd0a0', strength: 0.18 },
  layers: [                                                        // far → near; depth = the parallax factor
    { kind: 'mountains', depth: 0.06, color: '#5a5a9a', y: 0.7, height: 0.3 },
    { kind: 'fog', depth: 0.14, color: '#d896a0', y: 0.75, height: 0.16, drift: 6, opacity: 0.7 },
    { kind: 'city', depth: 0.2, color: '#3c3a78', y: 0.76, height: 0.3, lights: '#ffb36a' },
    { kind: 'industrial', depth: 0.38, color: '#262d5e', y: 0.79, height: 0.42, lights: '#ffc27a' },
    { kind: 'industrial', depth: 0.62, color: '#151a3c', y: 0.83, height: 0.5, lights: '#ffcf8a' },
  ],
});
// every frame, first: the camera's x scrolls each layer by its depth
sky.draw(ctx, w, h, { x: camera.x * camera.zoom, y: 0 }, t, undefined, quality.current.detail);
```

Layer kinds: `hills`, `mountains` (snow and slope shading), `forest`, `city` (lit windows, beacons), `industrial`
(chimneys, tanks, lattice towers with blinking beacons, gantries, pipes), `dunes`, `clouds` (`light` and `rim` for a
sunset from below), `fog` (drifting). Each is baked once as a seamless tile at the screen's density and blitted 1:1 on
whole pixels; under any other transform (a fractional pixel ratio, a zoom) the copies are stretched edge to edge, so
there is never a gap between them. On a screen denser than 1, far (`depth` < 0.25) and fog layers are baked at half the
density (`farScale`), and no tile takes more than 4 M device px (`maxTilePixels`, ≈ 16 MB; `scenery.bytes` says what
they take). `planet()`, `fogBand()` and `Overlay` (vignette, film grain) are there for skies of your own.

### An explosion with light and shake

```ts
import { Fx } from '@gp/art/fx';
import { Camera } from '@gp/art/camera';
import { LightLayer } from '@gp/art/light';

const fx = new Fx({ seed: 7 });                    // pooled, capped (max 1500), seeded
const camera = new Camera({ smooth: 0.45, lookAhead: 0.35 });
const lights = new LightLayer({ ambient: ['#e2e6ff', '#4a5598'], bloom: 0.4, vignette: 0.6 });

function boom(x: number, y: number) {
  camera.addTrauma(fx.explode(x, y));               // fireball, sparks, smoke, debris, two rings, a light, a flash, a hit-stop
  camera.kick(0, 6);
  fx.text(x, y - 60, '+250', { color: '#ffe08a', size: 30 });
}
// update: fx.update(dt); if (!fx.frozen()) sim.step(dt); camera.update(dt)
// draw:   world → lights.add(...fx.lights()); lights.render(w, h, t, camera); lights.apply(ctx, w, h)
//         → camera.begin(ctx); fx.draw(ctx); camera.end(ctx) → fx.drawScreen(ctx, w, h) → HUD
```

Presets: `sparks`, `embers`, `smoke`, `steam`, `dust`, `debris`, `confetti`, `magic`, `coins`, `fire` — or a spec of
your own (`emit({ n, speed, angle, spread, life, size, grow, gravity, drag, color, fadeTo, shape, … }, x, y)`).
Also `fx.ring` (shockwave), `fx.arc` (electric arc), `fx.light` (a dynamic light that fades), `fx.flash` (screen flash),
`fx.hitStop`, `Trail` (a ribbon behind a dash or a swing) and `shimmer()` (heat haze over a vent: it reads the canvas,
so a few small regions only). Draw the effects **after** the light map: what emits light must not be darkened by it.

**Clear the effects when the loop stops.** A results screen, a menu or a book drawn over a still frame re-draws the
last frame's flash, lights and arcs with `'lighter'` on every repaint, and the screen burns to white (Sigil Clash 1.0.0).
Call `fx.clear()` (and `lights.clear()`) when a run ends, and draw a still screen without the effect layers; keep them on a
pause, so they come back after Resume. `fx.busy` counts everything alive (particles, rings, texts, arcs, lights) — the
screen flash is not in it yet.

### A glass HUD gauge

```ts
import { glass, gauge, bar, readout, warning } from '@gp/art/hud';

glass(ctx, 12, 12, 262, 104, { r: 16, edge: '#5ff6ff' });                // after the scene: the frost blurs what is under it
gauge(ctx, 64, 64, 36, heat, { color: '#ffb23a', text: `${Math.round(heat * 100)}`, label: 'heat', warn: 0.85, t });
bar(ctx, 202, 54, 70, 10, power, { color: '#3fd0c9', segments: 5 });
readout(ctx, String(score).padStart(6, '0'), w - 170, 48, 26, { color: '#ffc65c' });
if (heat > 0.85) warning(ctx, w - 204, 36, 26, t);
```

Canvas HUD is invisible to `gp qa`'s DOM checks: declare what a player reads or taps in `host.qa({ canvasUi })`. Buttons
are better in the DOM (QA checks their size and position); style them to match (Forge Night's `main.ts` does).

The panels, gauge faces, bar tracks and buttons are baked into one 24 MB cache (`hudCache`). A size that stays is baked
exactly; sizes that change call after call (a panel growing in) are drawn from 8-px buckets, so an animation bakes a
few times, not every frame; a panel over half the cap (screen-sized at DPR 2) is drawn directly instead of baked.

### Camera follow

```ts
const camera = new Camera({ deadZone: [60, 40], smooth: 0.45, lookAhead: 0.35, bounds: { x: -1500, y: -1400, w: 3000, h: 1700 } });
camera.setView(w, h).snap(hero.x, hero.y);           // on resize, and at a level start
// every step:
camera.follow(hero.x, hero.y, hero.vx, hero.vy).update(dt);
// draw:
camera.begin(ctx);  /* the world */  camera.end(ctx);
const [wx, wy] = camera.toWorld(e.clientX, e.clientY);   // a tap in the world
if (camera.visible(x, y, w, h)) drawThing();             // culling
camera.zoomAt(1.1, e.clientX, e.clientY);                // the wheel or a pinch, about the cursor
```

`toScreen(x, y, parallax)` and `begin(ctx, parallax)` take a depth factor for layers of your own (0 fixed to the screen,
1 the world). Shake: `addTrauma(0.25)` for a hit, `0.6` for an explosion — the shake grows with trauma², so small hits
barely move it.

### Light and shadows

```ts
const lights = new LightLayer({ ambient: ['#e2e6ff', '#9aa6e0', '#4a5598'], scale: 0.25, bloom: 0.4, vignette: 0.6 });
lights.clear();
lights.add({ x: lamp.x, y: lamp.y, radius: 440, color: '#ffc070', dir: Math.PI / 2, cone: 0.75, flicker: 0.08, seed: 1 });
lights.add({ x: hero.x, y: hero.y, radius: 160, color: '#5ff6ff', intensity: 0.55, shadows: false });
lights.occluders = [{ x: crate.x, y: crate.y, r: 30 }, { pts: [[x0, y0], [x1, y0], [x1, y1], [x0, y1]] }];
lights.render(w, h, t, camera);      // world positions through the camera
lights.apply(ctx, w, h);             // multiplies the scene by the map, adds the bloom
const dir = lights.dirAt(...camera.toScreen(hero.x, hero.y));   // shade the hero's sprite from there
```

The ambient is the colour where no light reaches; a list of colours runs from the top of the view down, so the sky stays
bright while the ground goes dark. A spot light spills a little outside its cone (`spill`, default 0.18): no black
wedges. Lights hotter than 1 burn toward white.

### Sprites, sheets and the cache

- `makeSprite(w, h, draw, { anchor, pad })`: a drawing baked at the density, its pivot at `anchor` (draw around 0, 0).
  `drawSprite(ctx, s, x, y, { rot, sx, sy, alpha, blend, flash, snap })`: `flash: 1` is the white hit flash (a baked
  silhouette), `snap: true` puts a big static sprite on whole device pixels (a plain copy instead of a filtered one).
- `SpriteCache.get(key, w, h, draw, opts)`: everything made on the fly (a colour, a size, a light direction), kept under a
  memory cap (default 32 MB), least recently used out first, re-baked after a density change or a lost context. A sprite
  over half the cap is baked but not kept (`cache.fits(w, h, opts)` says so first: draw it directly or by `nineSlice`).
- `SpriteSheet(n, w, h, draw)`: pre-rendered frames in one canvas (Forge Night's jelly wobble: 12 frames) — `sheet.at(t,
  fps)` picks the frame, `sheet.draw(ctx, i, x, y, { sx, sy, flash })` draws it. Each of `sheet.frames` is a Sprite with
  its cell in `src`: `drawSprite`, `silhouette`, `tint` and `nineSlice` draw that frame, not the whole sheet.
- `nineSlice(ctx, s, x, y, w, h, inset)`: a panel stretched with its corners kept. `tint()` and `silhouette()` for team
  colours and shadows.

**What re-bakes by itself** after a density change or a lost context (`invalidateBakes()`): `Baked`, `SpriteCache`
entries, `silhouette()` and the hit flash, the glow and contact-shadow sprites, the particle discs, the scenery's tiles,
sky and overlay, and the HUD. **What doesn't** — a canvas the game holds: `bake()`, `makeSprite()`, a `SpriteSheet` and
`tint()` results. Make those through `keepBaked()` (it re-makes them on the next use after an invalidation), or key them
with `bakeGen()` in a SpriteCache, or compare `sheet.gen` with `bakeGen()`:

```ts
import { keepBaked } from '@gp/art/bake';
const walk = keepBaked(() => new SpriteSheet(8, 64, 64, drawWalkFrame, { anchor: [0.5, 1] }));
walk().draw(ctx, walk().at(t, 12), x, y);          // the same sheet every frame, a new one after a lost context
```

### Drawn icons on DOM screens (`@gp/art/dom`)

A shop card, a results line, a tab or a button is DOM; its icon is drawn in code like the rest. Don't paint it on a
canvas and convert it by hand: `iconImg(draw, size, opts)` returns an `<img>` of `size` CSS px drawn at the screen's
density (sharp on a phone: the render scale, or `devicePixelRatio` when the game has no canvas of its own, at most
`MAX_DPR`), and `spriteImg(sprite, frame?)` does the same for a baked `Sprite` or one frame of a `SpriteSheet`.

```ts
import { iconImg, iconURL, spriteImg } from '@gp/art/dom';
const coin = (g: CanvasRenderingContext2D, s: number) => {      // centred at (0, 0) in an s×s box, as iconButton's icon
  g.fillStyle = '#ffd23f'; g.beginPath(); g.arc(0, 0, s * 0.42, 0, Math.PI * 2); g.fill();
};
price.prepend(iconImg(coin, 20, { key: 'coin' }));            // 40 device px at DPR 2, alt '' (decorative)
card.append(spriteImg(carSheet, 3, { alt: host.t('car.van') })); // only frame 3's cell
tab.style.backgroundImage = `url(${iconURL(coin, 28, { key: 'coin' })})`;   // for CSS
```

- **Cached**: the same `key` (or the same function when there is no key), size, `pad` and density give the same data
  URL, so 40 cards draw the icon once. Give a `key` when `draw` is an arrow made anew on every call. Sprites are cached
  per canvas and frame. Each call returns a new `<img>` (an element can be in one place only).
- `height` for a box that isn't square (`size` is then the width), `pad` for a glow outside the box, `scale` to force
  a density, `alt` and `className` for the element.
- An `<img>` on the page keeps its picture (a data URL survives a lost canvas context); after a density change the next
  call draws a sharp one — make the icons when you build the screen, not once at boot.

For the everyday marks — close, check, lock, chevrons, play, settings, sound, coin, gem, heart, gift, chest, trophy,
clock … — don't draw your own: **`@gp/core/icons`** has ~75 on one 24-unit grid as inline SVG (`icon('coin', { style:
'solid', color: '#ffc93c' })`), a data URL (`iconUrl`) or on the canvas (`drawIcon(ctx, 'heart', x, y, 32, o)`), and
the platform's own screens use the same set ([code-games.md](code-games.md#platform-screens-in-the-games-look-screentheme-drawn-icons-game-type)).
Draw with `iconImg` what is the game's own: its items, heroes, parts.

**Motion helpers on the game's clock**: `Jelly`, `Spring`, `Wobble`, `Blinker`, `Pulse` and `Recoil` move only in
`update(dt)` — call it in the game's step and read `value` where you draw (`jelly.update(0)` in draw never moves).

### Game type (`@gp/art/type`)

The system's fonts (system-ui, Segoe, Roboto, Georgia) are what makes a finished-looking game read as a web app. The
platform bundles three display faces and a pixel font; each face is its own module, so **only the faces a game imports
land in its upload** (Forge Night imports two: +41 KB, 113 KB gzipped in all).

| Module | Face | Look, for | WOFF2 | Licence |
|---|---|---|---|---|
| `@gp/art/type/dela-gothic-one` → `DELA_GOTHIC_ONE` | Dela Gothic One | heavy display with round corners: titles, buttons, banners, scores (arcade, action, casual) | 17 KB | SIL OFL 1.1 |
| `@gp/art/type/nunito-black` → `NUNITO_BLACK` | Nunito Black (900) | a friendly rounded sans: UI text, cards, buttons (casual, idle, puzzle, cozy) | 22 KB | SIL OFL 1.1 |
| `@gp/art/type/exo-2` → `EXO_2` | Exo 2 ExtraBold (800) | technical, slightly squared: HUDs, readouts, labels (sci-fi, shooters, racing) | 23 KB | SIL OFL 1.1 |
| `@gp/art/type/pixel` → `PIXEL` | GP Pixel | pixel capitals 5×7 for pixel-art games; sharp at 12, 24, 36 px | made in code, ≈ 8 KB of JS | our own |

Every face covers the ten portal languages (en es pt-BR fr de ru tr it pl id): each file is cut to `GAME_CHARSET` — Basic
Latin, Latin-1, Latin Extended-A (Polish, Turkish), Romanian, Cyrillic with Ukrainian, punctuation, € ₽ ₺ № ≈ — and
anything else (CJK, emoji) falls back to the platform's `FONT_FALLBACK`. The licences are in `packages/art/fonts/OFL-*.txt`
(none has a Reserved Font Name, so the cut files keep their names; the copyright and licence are in each file too);
`tools/subset-fonts.sh` rebuilds them from the Google Fonts sources.

```ts
import { drawNumber, drawText, fontReady, numberCss, useFont } from '@gp/art/type';
import { DELA_GOTHIC_ONE } from '@gp/art/type/dela-gothic-one';
import { EXO_2 } from '@gp/art/type/exo-2';

const display = useFont(DELA_GOTHIC_ONE);     // registers the face once (FontFace) → '"Dela Gothic One", <fallbacks>'
style.textContent = `#ui h1, #ui button { font-family: ${display}; } ${numberCss({ font: EXO_2, color: '#ffe0a3' })}`;
screenTheme({ …, font: useFont(EXO_2), display });   // the platform's screens in the same type (@gp/core)
await fontReady(EXO_2);                       // before canvas text: a canvas never swaps a face in by itself
drawNumber(ctx, score, w - 16, 28, { font: EXO_2, size: 28, align: 'right', fill: ['#fff7dc', '#ffc65c', '#ff9a2e'] });
drawText(ctx, 'WAVE 3', w / 2, 80, { font: DELA_GOTHIC_ONE, size: 48, align: 'center', fill: ['#ffffff', '#7fe0ff'] });
```

- **`useFont(face)`** returns the CSS family with the fallbacks and starts loading; DOM text swaps the face in when it
  arrives. **`fontReady(face, ms?)`** resolves `true` when it can draw (canvas text drawn before is the fallback's).
  `canvasFont(face, size)` is a canvas font string at the face's weight.
- **`drawText()`** is game lettering: a thick round outline in a deep, hue-shifted shade of the fill (never black: rule
  5), a vertical gradient fill, a drop shadow, an optional glow. **`drawNumber()`** is the outlined HUD number: the same,
  with every digit in one width, so a counting score doesn't shake. **`numberCss()`** is the DOM's version (a
  `.gp-num` rule: the face, tabular digits, an outline ring and a drop shadow from `text-shadow`).
- **The pixel font** works on both: `useFont(PIXEL)` builds a TrueType font from its glyphs at start (no file) for the
  DOM; `drawPixelText(ctx, text, x, y, color, { scale, outline, shadow })` blits the same glyphs into a low-resolution
  canvas. Lowercase reads as capitals (an arcade font); `PIXEL_ICONS` are pixel pictures (coin, heart, star, lock …) in
  the private use area, for a string in the same font: `` `${PIXEL_ICONS.coin} 150` ``. From Swarm Smash's font.ts.

## 3. Performance

Measured in headless Chromium 141 (software rasterizer, the machine `gp qa` runs on — a blocklisted GPU is the same),
Forge Night with every system on, an explosion every 1.5 s, the time including the canvas's rasterization (`__artBench`
in dev; it never yields, so the light map is painted on the main thread there — in play it is painted in a worker):

| View | Best quality (level 0) | AutoQuality (settles at) | `gp qa` frame rate |
|---|---|---|---|
| 1280×720, DPR 1 | 19.9 ms a frame | 18.3 ms (p50 16.4, level 3) | 56–56.5 fps, main thread 15.6–16.5 ms |
| 360×800, DPR 2 | 27.6 ms | 23.8 ms (p50 22.3, level 3) | — |
| 360×800, DPR 1 | 9.9 ms | 7.6 ms (p50 6.9, level 1) | 59–59.5 fps, main thread 10.1–11.5 ms |

Re-measured 2026-10-10 on a QA machine ≈ 1.9× slower than the first measurement (12.3 ms at level 3 then): there the
same code took 38.0 ms at level 0 and failed the frame-rate check at 1280×720 (43 fps, main thread 22.3 ms). It was
borderline from the start, not a regression; the fixes below took level 0 from 38.0 to 19.9 ms on that machine.

A GPU-backed browser (most desktops and phones) is several times faster on the same frame; the table is the worst case,
and AutoQuality is what keeps it smooth there. What the measurements taught (the rules):

- **What a 1280×720 frame costs on the software rasterizer** (Forge Night, per frame): the canvas's hand-off to the
  compositor ≈ 2.7 ms whatever you draw (Chrome's `ProduceCanvasResource`), a full-screen 1:1 copy 0.7 ms, a 1:1
  `multiply` or `lighter` 1.3 ms, the same scaled 3× (nearest) 3.3 ms, a filtered scaled one ≈ 10 ms. A blit at a
  fractional position or under a zoom is filtered: **≈ 7–10× a whole-pixel copy**. Most of the rules below follow from that.
- **Glows, contact shadows and particles are pre-sized and put on whole pixels** — `glow()`, `contactShadow()` and
  `Fx` do it (`radialBlit`, `sizedSprite` in `@gp/art/material`): the size is bucketed (exact to 24 px, then 4 % steps),
  each bucket baked once, under a rotation too for a round glow (60 glows: 10.1 → 2.9 ms). Draw your own soft round
  things through `radialBlit` rather than `drawImage(glowSprite(…), x, y, w, h)`.
- **World sprites under a zoomed camera: bake at `density() × camera.zoom`, draw with `snap: true`** — then
  `drawSprite` copies the sprite's pixels 1:1 (even when its CSS size × scale isn't whole). Forge Night's lamps, crates
  and barrels went from 1.4 ms to 0.5. Put the zoom in the cache key. A wobble under a thousandth of a radian moves no
  pixel: draw it straight (`rot: 0`), or it is a filtered blit.
- **The camera's roll is dropped while it would move the view's corners less than ¼ px** (`Camera`): a rolled view makes
  every blit of the frame a filtered one (+3–5 ms at 1280×720) for a shake nobody sees. A visible roll still costs that:
  it is the explosion's moment.
- **Paint the light map off the main thread: `new LightLayer({ offThread: true })`** — a worker with OffscreenCanvas
  paints the map, both upscales and the bloom, and hands over maps of the canvas's own size; the main thread only blends
  them 1:1 (light: 8.6 → 2.3 ms of main thread at 1280×720). The map is a frame behind (nothing moves far enough in
  16 ms to show it) and falls back to painting on the main thread where a worker can't (no OffscreenCanvas 2D, a
  blocked `blob:` worker) and on any frame the worker's map doesn't fit. Set `offThread = false` for a still — a cover, a
  docs screenshot, a test — so the map is this frame's.
- **Bake ahead, before the run** (`scene.prewarm()` on Forge Night's title screen, a piece per idle callback): a sprite
  baked per light direction (8 buckets × the robot's parts, the creature's 12-frame sheet, the props) and an explosion's
  particle sizes, baked on first use instead, cost the first seconds of play several ms a frame — exactly when `gp qa`
  samples the frame rate and AutoQuality decides. Keep every variant you bake (a re-bake on each light change of a
  12-frame sheet cost ≈ 2 ms a frame while the robot walked under the lamps).
- **Bake everything that doesn't change**: gradients, shadowBlur, noise, a background layer, a panel — `Baked`,
  `makeSprite`, `SpriteCache`. Never `shadowBlur` or `ctx.filter` per frame (`softShadow`, `innerShadow` are for bakes;
  their blur and offsets are in CSS px, scaled to the bake's density, so a shadow looks the same at DPR 1 and 2).
- **Blit 1:1 on whole pixels.** On a software rasterizer a filtered blit (scaled, or at a fractional position) costs
  ≈ 8× a plain copy: a full-screen layer is 0.4 ms copied and 3.2 ms filtered. The scenery bakes its tiles at the
  density and snaps them; `drawSprite({ snap: true })` does it for big sprites; bake a world sprite at
  `density() × camera.zoom` (`makeSprite(…, { scale })`) to draw it 1:1.
- **Few full-screen passes.** The light map is small (a quarter of the CSS px) and upscaled in two steps — filtered to
  half the device pixels, then 2× unfiltered — because one filtered full-screen upscale costs as much as the whole rest
  of the light. Put the vignette in the light map (`vignette`), not in an extra pass. Film grain (`Overlay`) is a
  full-screen blend: only at the best quality.
- **Reading the canvas is expensive** (`glass` frost, `shimmer`): it forces the canvas to rasterize what is queued. A
  couple of small regions a frame; when AutoQuality's `detail` is false, pass `frost: false` to `glass()` and `detail`
  to `Scenery.draw`.
- **Slow on the software rasterizer, found by games** (Scrap Royale 1.0.0 failed the frame-rate check on these until it
  baked or dropped them): rotated blits of hundreds of sprites a frame (pre-rotate into a few angle steps in a
  `SpriteSheet`, or don't rotate debris); big additive glows (`globalCompositeOperation: 'lighter'` over large areas —
  bake the glow into the sprite); a bloom pass at full size (use the light map's, quarter size); a filtered
  `createPattern` over the whole screen (bake the tiled layer once and blit it 1:1). Check with `gp qa`'s
  `main thread … ms per frame` at 1280×720: over ≈ 17 ms on the software rasterizer is close to the 50 fps line
  (≈ 2.7 ms of it is the canvas's hand-off, whatever you draw).
  `gp qa` also measures each phone size with the CPU slowed down 4× (a mid-range phone; a hint, never a failure): the
  QA machine is several times faster than a phone, so a game smooth in QA can stutter there (Candle Crypt 1.4). The
  art showcase gives 21–25 fps there (18–19 before the fixes above); aim for ≥ 50.
  Full-screen passes cost even when the game's own code is cheap: Shade Clash ran 1.7 ms of JavaScript a frame and
  drew 34 fps at 1280×720 with a light map and two full-screen overlays; without them, 56–59 fps.
- **Auto quality**: `const q = new AutoQuality({ budget: 9 })`, then `q.frame(ms)` with the frame's work; read
  `q.current` — `particles` (multiplier for `fx.quality`), `bloom`, `lightScale`, `lightStep`, `grain`, `detail`. It
  steps down after half a second over budget and back up after 5 s of calm; a step up it has to take back soon doubles
  the calm the next one waits for (up to ≈ 5 min, `q.calm`), unless the work has dropped well below what it was then —
  so a level that doesn't fit isn't retried every few seconds. A settings toggle can pin a floor (`q.floor`).
- **The pixel ratio is capped at 2** (`fitCanvas`, `MAX_DPR`): a 3× phone renders 2.25× the pixels of 2× for nothing.
  Pick it once at start: it is not a quality level, because changing it mid-game resizes the canvas and re-bakes
  everything at once. The Canvas 2D engine adapter and `fitCanvas` make it the render scale (`density()`), so bakes
  come out 1:1.
- **Pools, not allocations, in the frame loop**: `Fx` reuses its particles; `Pool<T>` for your own objects. Hard caps
  everywhere (`Fx` max, `SpriteCache` maxBytes).
- **A lost context**: call `watchContext(canvas)` once. When Chrome restores a lost 2D context (memory pressure on a
  phone), every bake is re-made on its next use; WebGL engines get the host's `'context'` pause as before.
- **The dev meter**: `FrameMeter` (`begin()`/`end()`, `draw(ctx)`) — Forge Night shows it with `?meter`.

Size: everything in `@gp/art` is 30 KB gzipped (95 KB minified); a game pays only for what it imports (`sideEffects:
false`, one subpath per module). Each module with what it imports from the others, minified and gzipped: color 1.8 KB,
palette 2.3, noise 0.6, bake 0.8, material 4.1, light 4.5 (its worker included), shapes 7.4, sprite 2.1, hud 5.2, rig
2.5, tween 1.2, fx 7.0, camera 1.8, scenery 8.2, perf 1.2. The `gp init` skeleton's upload is 28 KB gzipped (@gp/art
39 KB of it minified); Forge Night's 56 KB (54 before the worker and the sized glows; ≈ 0.7 s to a tappable Play on the slow-phone profile).

## 4. Engines: a baked canvas is a texture

Everything `@gp/art` bakes is an `HTMLCanvasElement` — a texture source for every engine the platform has an adapter
for. Bake at the density you render at, and re-upload after `invalidateBakes()` (subscribe with `onInvalidate`).

```ts
// Pixi 8
import { Texture, Sprite } from 'pixi.js';
const tex = Texture.from(makeSprite(96, 96, drawGem, { pad: 8 }).canvas);
const sprite = new Sprite(tex);                    // tex.source.update() after you redraw the canvas

// Phaser 4
scene.textures.addCanvas('gem', makeSprite(96, 96, drawGem).canvas);
scene.add.image(x, y, 'gem');

// three
import { CanvasTexture, SRGBColorSpace } from 'three';
const tex = new CanvasTexture(bake(1024, 512, drawSky));   // bake() from @gp/art/bake
tex.colorSpace = SRGBColorSpace;                   // tex.needsUpdate = true after a redraw
```

A `SpriteSheet`'s canvas is one atlas: give the engine its frames by rectangle (`sheet.rect(i)`: x, y, w, h in device
px). Pixi's `generateTexture` textures come back empty after a lost WebGL context; canvases don't — re-upload them in
the engine's restore handler.

## 5. Generated art (`gp art`)

An image model paints the game's sprites and backgrounds once, at build time; they are bundled with the game like any
import (a `data:` URI in the one-file portal upload), so nothing is fetched at runtime — the portals forbid that. Why:
Google AI Studio's games look finished because Gemini paints raster art (its Nano Banana image models) and often draws in
3D with three.js; code-drawn shapes can't match a painted character. What it costs: ≈ $0.04 an image with
`gemini-2.5-flash-image` (≈ $0.13 with `gemini-3-pro-image-preview`), a few dollars a game, and upload size — budget for it.

**0. Start from the game design, not from a style.** Beautiful art and strong gameplay matter more than anything
else (the owner, 2026-10-10), and they work together: the look serves the play. Before the style, write down what the
art keeps of the game — its identity and what its play needs — in `art.keep`. **A game keeps its technique**: a pixel
game gets better pixel art, never a painted look (the owner, 2026-10-10, about Candle Crypt: «это пиксельная игра —
задача улучшения графики для неё увеличить качество пиксельных текстур, а не менять графику на такую; лучше очень
сильная пиксельная графика с большими спрайтами»). It keeps its identity too: the same palette and light (a dark crypt
lit by the hero's own candle), the same silhouettes, the same rules of reading — what must stand out at play size (the hero, the dangers, the
pickups, the telegraphs), the colour codes (danger, loot, rarity). Every request carries `keep`, and the reviewer checks
the art against it (`W_ART_KEEP` when it is empty).

**1. Write the art direction in game.yaml** (`gp explain art`):

```yaml
art:
  style: "chunky cartoon crypt, soft cel shading, warm candle rim light from the upper left, teal shadows, thin dark-teal outlines"
  keep: ["a dark crypt lit only by the hero's own candle", "violet stone, amber light", "danger reads red, loot gold", "enemies readable at 40 px"]
  model: gemini-2.5-flash-image          # default; gemini-3-pro-image-preview for the hardest assets
  assets:
    - id: knight
      kind: sprite
      prompt: "the candle knight, three-quarter view, idle, holding a lantern"
      size: 256
      frames: ["walking, left foot forward", "walking, feet together", "walking, right foot forward", "walking, feet together"]
    - { id: ghoul, kind: sprite, prompt: "a hunched wax ghoul, facing left", size: 220 }
    - { id: crypt, kind: background, prompt: "a crypt hall with arches fading into fog", size: [1280, 720] }
    - { id: floor, kind: tile, prompt: "worn crypt flagstones", size: 256 }
    - { id: cover, kind: keyart, prompt: "the candle knight raising its lantern against three ghouls", size: [1280, 720] }
```

The kinds: `sprite` (a character or a prop, cut out), `ui` and `icon` (cut out), `background` (opaque, full-bleed, a calm
middle for the play), `tile` (seamless), `keyart` (the cover illustration: the first sprite as the main character, big and
close, the top third calm for the title — draw it in `host.qa({ cover })`, [covers.md](covers.md)). A sprite's `frames` are
its animation, one pose each (a walk cycle 4–6, an attack 3–4, at most 12): each frame is painted **from the sprite itself**
(it goes along as the reference) so the character stays the same, and it is drawn at the sprite's scale, so a raised arm
doesn't shrink the body. Squash, bob, breathe and sway need no frames: they are free in code (`@gp/art/rig`).

**Cartoon, game-like — never photorealism.** Our games use stylized art: clean simplified shapes, bold readable
silhouettes, slightly exaggerated proportions, cel or soft-gradient shading, a saturated harmonious palette — the look of a
polished casual game, not a photograph. `gp art` sends that house style with every request (`HOUSE_STYLE` in
`packages/cli/src/art.ts`), and `gp validate` warns when the style or a prompt asks for realism ("photorealistic", "8k",
"cinematic lighting": `W_ART_REALISTIC`).

The `style` says which cartoon look, shared by every asset — write it like an art director: the shapes, the shading, the
outline, the palette, the light and its direction, what to avoid. One style, many assets: that is what makes a set look
like one game.

**2. Generate** — `gp art <id>` (`--provider mock` makes seeded placeholders with no network, to wire the game up first).

**Pixel art: `technique: pixel`.** For a pixel game, `size` is the sprite's grid (raise it: 32, 48 or 64 px read far
better than 16), `palette` is the game's own palette, and every image comes back as a lossless PNG at that grid, every
pixel one of the palette's colours (the model's picture is cut to the grid by the most common colour of each cell, no
blended edge). Draw it with `drawPixelSprite(ctx, img, x, y, scale)` from `@gp/art/assets` (a whole-number scale,
smoothing off). The model is asked for polished pixel art (`PIXEL_STYLE`); look at each sprite at its play size — a
crisp silhouette, 3–4 tone ramps, one light — and remake the ones that don't hold (`--only`).

```yaml
art:
  technique: pixel
  palette: ["#1a1020", "#fff3d6", "#ecd3a0", "#b8976a", "#ffa033", "#d4531c", "#ffe56e"]   # the game's own
  style: "dark crypt pixel art, warm candlelight against violet stone, 1-px dark outlines"
  keep: ["the living-candle heroes and their flame-test colours", "a crypt lit by the hero's own flame"]
  assets:
    - { id: wick, kind: sprite, prompt: "Wick, a living candle hero with an orange flame, facing right", size: 32, frames: ["walking, left foot", "walking, right foot"] }
    - { id: floor, kind: tile, prompt: "crypt flagstones", size: 32 }
```

**Bigger pixel art from a game's own sprites: `upscale`.** The pixel-art scalers keep the design exactly and need no
key: `gp assets compare <sprite.png> <game> --factor 2` runs nearest, Scale2x (EPX), xBR (Hyllian) and xBRZ (Zenju) —
and ESRGAN models with `--models a.pth,b.pth` when `GP_PYTHON` is a Python with torch and spandrel (models:
openmodeldb.info, tag pixel-art) — and writes them side by side in `qa/upscale-<name>.png`. Each result comes back to
whole pixels in `art.palette` (a smooth scaler runs at twice the factor, then each cell takes its most common colour),
and the small details — eyes, teeth, glints: interior pixels unlike their neighbours — are kept pixel for pixel. Then
`gp assets upscale <sprite.png> <game> --method xbrz` writes one, or an art asset does it at build time:
`{ id: wick, kind: sprite, prompt: "Wick", from: assets-src/old/wick.png, upscale: { method: xbrz, factor: 2 }, size: 32 }`.
On Candle Crypt (2026-10-10) xBRZ with the details kept held the design best: smoother silhouettes, the same faces;
Scale2x and xBR stay closer to the old stairs; the ESRGAN pixel-art models tried (Fatal-Pixels, NXbrz, Faithful,
FakeFaith) either blurred the faces or redrew the characters. A scaler smooths, it doesn't add detail: for new detail in
the same design, `redraw`.

**Better pixel art for a game that has some: `redraw`.** Keep the game's design (the owner, 2026-10-10: «сохраняй
предыдущий дизайн игры») — each of its sprites goes to the model as the design and comes back at the new size: export the
old sprite to a PNG (a code game's string-array sprites: a few lines that paint them into a canvas), then
`{ id: wick, kind: sprite, prompt: "Wick, the living candle", from: assets-src/old/wick.png, redraw: true, size: 32 }`.
The prompt asks for the same shapes, proportions, colours, outline and facing, only more detail; `technique: pixel`
snaps the answer to the palette. Look at old and new side by side: a redraw that changed the character is remade.
A pack from elsewhere (`gp assets`) is for a new game or a new kind of thing — never a swap of the game's own look.

Hand-drawn upscaling (Scale2x, an automatic re-shade) doesn't make strong pixel art: it is the same 16 px picture,
bigger (tried on Candle Crypt, 2026-10-10). Strong pixel art at a bigger size is drawn again — by the model with the
game's palette, or by a pixel artist.

**Existing assets: `gp assets`.** A free pack is often better than a new drawing. Find one (OpenGameArt, Kenney:
CC0 or public domain, usable without a credit), then `gp assets get <url> <game>` downloads it into `assets-src/` (a zip
is unpacked) and lists every image with its size; `gp assets sheet <image> <game> --grid 32` numbers a sheet's cells
in `qa/sheet-<name>.png`. An art asset takes a cell: `{ id: skeleton, kind: sprite, prompt: "…", from:
assets-src/…/sheet.png, cut: [x, y, w, h], flip: true, size: 32 }` — gp art cuts, mirrors, trims and fits it, and with
`technique: pixel` snaps every pixel to the game's palette, so a pack's sprites sit with the game's own. No key, no cost;
a changed source or cut is taken again.

**Finished pictures from the owner: `gp art import <dir>`** — cut off a plain studio background, trimmed, fitted, with
wheels split off and a paint mask for colour variants if asked: [§ 5.1](#51-importing-finished-pictures-gp-art-import).

**No key? Draw it yourself: `gp art <id> --provider svg`.** The game's agent draws every asset as a cartoon SVG in
`art/<id>.svg` (frames `art/<id>-1.svg` …, the same viewBox as the sprite so the scale holds) and gp art renders,
trims and bundles them exactly like a model's images, with provenance (`svg (drawn by the game's agent)`, the SVG's
hash: a changed drawing is rendered again). It costs nothing and needs no network. How to draw them so they look
finished: a bold dark outline on every shape (`stroke` 5–7 in a 256 viewBox, the darkest colour of the palette, round
joins), three values per material (base, a shadow side as one flat shape, a highlight or rim on the lit side), the
light from one side for the whole set, big readable shapes and faces (eyes with a highlight), a soft contact shadow
under each sprite, no thin details that vanish at play size. It suits a cartoon game, not a pixel one.

The key: an API key from aistudio.google.com → Get API key, **on a project with billing** — the free tier has no quota for
the image models (Google answers 429 `free_tier_requests, limit: 0`; `gp art` says so), and a Gemini app subscription
(Gemini Pro, Google AI Pro) does not pay for the API. Give it as GEMINI_API_KEY in the environment, or in a cloud
environment as a network secret: type Bearer, website `generativelanguage.googleapis.com`, custom header name
`x-goog-api-key`, **the prefix empty** (with "Bearer" there Google gets `Bearer AIza…` and answers "API key not valid"),
the value the key. A short rate limit is waited out; what was made before a failure is recorded, and the next run keeps it. It makes a style board first (`assets/style.webp`: the hero, a prop, a tile and a strip
of background in the style), then every missing asset with the board attached as a reference, so they match. Sprites,
`ui` and `icon` are asked for on a flat green key, cut out to transparency (the key is read from the corners, the green
fringe pulled back), trimmed and fitted into `size`; backgrounds and tiles are cropped to fill. Everything is WebP in
`games/<id>/assets/`, with:

- `assets/index.ts` — `export const ART = { knight, ghoul, crypt, floor, cover }` (ids in camelCase), the bundled URLs,
  and `FRAMES = { knight: [knightF1, …] }` for the animated sprites (files `knight-1.webp` …);
- `assets/provenance.yaml` — per file: the model, the full prompt, the style board it was made against, size, bytes,
  sha256 and date. `gp validate` checks it (`W_ART_PROVENANCE`) and that every asset exists (`W_ART_MISSING`);
- the model's raw outputs in `qa/art-raw/` (not committed), to re-process without paying again.

`--only knight,ghoul` remakes some, `--force` all, `--style` a new board; `--record` takes the hashes of images edited by
hand (marked `edited`); `--check` only checks. The run prints the cost first.

**3. Draw them, and keep the life in code:**

```ts
import { ART } from './assets/index.ts';
import { loadImages, drawImageSprite } from '@gp/art/assets';
import { breathe } from '@gp/art/rig';
import { contactShadow } from '@gp/art/material';

const img = await loadImages(ART);              // before the first frame: every image decoded
// each frame
ctx.drawImage(img.crypt, 0, 0, w, h);           // the painted background …
// … the code's lights, fog and particles (LightLayer, fx) go over it as in § 2
const b = breathe(t);                           // the sprite breathes, squashes and bobs like a code-drawn one
drawImageSprite(ctx, img.knight, x, groundY, 180, { sx: b.sx, sy: b.sy, anchorY: 1 });
contactShadow(ctx, x, groundY, 60);            // shadows and light from code, so it sits in the scene

// an animated sprite: its frames at one scale, feet down (a frame with a raised arm is taller, not smaller)
import { FRAMES } from './assets/index.ts';
import { loadFrames, frameAt } from '@gp/art/assets';
const frames = await loadFrames(FRAMES);
const k = 180 / img.knight.naturalHeight;
const f = moving ? frameAt(frames.knight, t, 8) : img.knight;
drawImageSprite(ctx, f, x, groundY, f.naturalHeight * k, { anchorY: 1, flip: facingLeft });
```

The images go into the build like any import: a one-file portal upload carries them as `data:` URIs (checked:
`gp build --target crazygames` of a game with 9 images, 46 KB of them embedded).

Pixi: `Texture.from(img.knight)`; Phaser: `scene.textures.addImage('knight', img.knight)`; three:
`new Texture(img.crypt)` with `colorSpace = SRGBColorSpace`.

**4. Look at it like a reviewer** (`gp review` hands the reviewer this list):

- cartoon, game-like art — not photorealistic; one style across every asset, at the size it is drawn in play and on a
  phone — not one painting and three clip-arts;
- clean edges on the cut-outs (no green fringe, no halo), nothing cropped, the subject facing the way the game needs;
- an animation that is one character: the same face, colours and size from frame to frame, the feet on the same line —
  a frame that drifts is remade (`gp art --only <id>` remakes the sprite and its frames);
- no text, letters, signatures, watermarks, extra fingers or melted details;
- the art's palette matches the HUD, the effects and the lights the code draws over it (rules 1–6 still hold);
- the size budget: WebP keeps a 256 px sprite at ≈ 10–40 KB and a 1280×720 background at ≈ 60–150 KB; raise
  `budget.gzipKB` on purpose if the set needs it;
- motion still comes from code — a painted sprite that never breathes, squashes or casts a shadow looks pasted on;
- the art keeps `art.keep`: the identity and what play needs read at play size.

**Too slow with the new art? Change the architecture, not the art** (the owner, 2026-10-10). Profile the frame; bake
what doesn't change, cache layers, draw the images once per frame from decoded bitmaps; if Canvas 2D still can't carry
the look, move the drawing to WebGL (Pixi, three: [code-games.md → Engines](code-games.md#engines)). `gp qa` says so
under a failed frame-rate check.

**The terms, and what to tell stores.** Google claims no ownership of Gemini outputs, but they are not exclusive (similar
images may be made for others) and may not be protected by copyright; use a paid API key (the free tier's prompts and
outputs may be used for training). Every image carries Google's invisible SynthID watermark. Players and some reviewers
dislike an obvious "AI look": art that is directed (one style, a deliberate palette, code-drawn light and motion on top)
reads as art; raw model output reads as slop. Poki forbids visible AI watermarks; where a store asks about AI content,
`provenance.yaml` is the answer. Generated art is a tool for the look, not for the game's originality: the concept, the
twist and the uniqueness checks are unchanged.

### 5.1 Importing finished pictures (`gp art import`)

When the owner supplies the art — painted cars, side view, each on a plain studio background — it goes into the game
the same way as generated art, with no key, no network and no image library (the pixels are worked on in plain
TypeScript; Playwright's Chromium decodes, resizes and encodes, as for `gp art`):

```
gp art import <dir> [game] [--size 512] [--kind sprite] [--tolerance 28] [--recolor] [--cleanup <file>] [--force]
```

Every PNG, JPEG or WebP in `<dir>` becomes one asset, its id the file name slugified (`Red Car (final).png` →
`red-car-final`). A sprite (`ui`, `icon` too) is cut out: the plain background is **flooded away from the borders** —
a pixel joins it when it is within `tolerance` (RGB distance, default 28) of the background it was reached from, so a
studio gradient or a soft floor shadow is followed while an edge stops it, and within `drift` (default 4 × tolerance) of
the border's colour. The backdrop seen *inside* the subject (between spokes, through a window) is never reached and
stays. The subject's edge pixels get a soft alpha (how much of the backdrop they are mixed with) and the backdrop's
colour is taken out of them, so a light studio leaves no halo on a dark game. Then it is trimmed and fitted into
`size` (the long side, default 512, never enlarged) and saved as WebP in `assets/`. `--kind background` (or `tile`,
`keyart`) keeps a picture opaque and crops it to fill `size` instead.

It writes what gp art writes: the asset in game.yaml `art.assets` as `source: import` (`gp art` never sends it to a
model, `--only` refuses it), `assets/index.ts`, and in `assets/provenance.yaml` `source: owner`, the original's file name
and sha256, the settings used and the date — `gp validate` checks it like a generated image (`W_ART_PROVENANCE`, and
`W_ART_MISSING` says to run `gp art import`). When game.yaml has no `art` yet, it adds one (`style` says the owner's
pictures set the look; write `art.keep`). Run it again after a change: an unchanged picture with unchanged settings is
kept, `--force` imports everything again. Keep the originals in the game (`assets-src/owner/`) so it can be.
Look at `qa/art-import.png` — every cut-out on a checkerboard and, beside it, put back together (the wheels in place,
the paint mask tinted another colour).

**`cleanup.json`** next to the pictures (or `--cleanup <file>`) fixes what the defaults don't, per picture (its file name
or id), over `defaults`; every box and circle is in the **original's pixels**, as an image viewer shows them:

```json
{
  "defaults": { "tolerance": 30 },
  "Red Car.jpg": {
    "id": "red-car",
    "crop": [40, 0, 1880, 1000],
    "patch": [[1290, 520, 40, 40]],
    "erase": [[30, 820, 260, 60]],
    "split": { "wheels": [[470, 640, 94], [1130, 640, 94]] },
    "recolor": { "tolerance": 14 }
  }
}
```

- `tolerance`, `drift`: raise for a noisy photo or a strong gradient, lower when the subject is nearly the backdrop's
  colour; `key: "#e8e8e8"` gives the backdrop's colour when the border's median is the wrong one (the subject touching an
  edge: it warns when under 60 % of the border is backdrop);
- `crop: [x, y, w, h]`: the part of the picture to keep, before anything else (the flood then starts at its borders);
- `patch: [[x, y, w, h], …]`: painted over from the pixels around the box before the cut-out — **a brand emblem or badge
  on the body** (a real car maker's logo has no place in our games);
- `erase: [[x, y, w, h], …]`: made transparent after the cut-out — a studio logo, a stand, the leftover of a dark floor
  shadow;
- `split.wheels: [[cx, cy, r], …]`: vehicles — each circle is cut out as a sprite of its own, `<id>-wheel-1` … (square,
  the wheel's centre at its centre, so it turns on the spot, at the body's scale), and taken out of the body with the
  same soft edge, so the body keeps empty arches. Give the circle to the tyre's outer edge, a pixel or two over;
- `recolor: true` (or `--recolor` for all): `<id>-paint`, a mask of the body's dominant hue (the peak of a hue
  histogram of its saturated pixels; `tolerance` in degrees, default 18) — grey where the paint is (its brightness),
  transparent elsewhere, the same size as the body. Glass, tyres, chrome and outlines stay out of it; glass of the same
  hue as the paint (a blue car's tinted windows) comes in — lower `recolor.tolerance`;
- `id`, `kind`, `size`, `prompt` per picture.

The parts are assets with `part: { of: <id>, at: [x, y] }`, where their centre sits in the body, in the body's pixels;
`assets/index.ts` exports them as `PARTS` (a part of an asset that isn't there: `E_ART_PART`). Drawing a car with its
wheels turning and in another paint:

```ts
import { ART, PARTS } from './assets/index.ts';
import { loadImages } from '@gp/art/assets';
const img = await loadImages(ART);

/** The paint mask × a colour: the shading kept, the mask's alpha kept (bake it once per colour, not every frame) */
function paint(mask: HTMLImageElement, color: string): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = mask.naturalWidth;
  c.height = mask.naturalHeight;
  const g = c.getContext('2d')!;
  g.drawImage(mask, 0, 0);
  g.globalCompositeOperation = 'multiply';
  g.fillStyle = color;
  g.fillRect(0, 0, c.width, c.height);
  g.globalCompositeOperation = 'destination-in';
  g.drawImage(mask, 0, 0);
  return c;
}
const green = paint(img.redCarPaint, '#2fbf5a');

// each frame: the car at (x, y) (its top-left), k = its drawn size ÷ its pixels, the wheels turned by the distance
ctx.drawImage(img.redCar, x, y, img.redCar.naturalWidth * k, img.redCar.naturalHeight * k);
ctx.drawImage(green, x, y, green.width * k, green.height * k);
for (const id of ['redCarWheel1', 'redCarWheel2'] as const) {
  const w = PARTS[id], wheel = img[id];
  ctx.save();
  ctx.translate(x + w.x * k, y + w.y * k);
  ctx.rotate(distance / (wheel.naturalWidth * k * 0.5));
  ctx.drawImage(wheel, (-wheel.naturalWidth * k) / 2, (-wheel.naturalHeight * k) / 2, wheel.naturalWidth * k, wheel.naturalHeight * k);
  ctx.restore();
}
```

The limits: it is made for a **plain** backdrop — a busy photo, a backdrop the colour of the subject (a white car on a
white studio) or a hard dark floor shadow needs `key`, `tolerance`, `crop` and `erase`, or a picture with its own
transparency (a PNG with alpha is taken as it is: its transparent pixels are backdrop). Wheels are where you say, not
found; the paint mask is one hue — a two-tone car repaints only its main colour; masking by hue can't tell paint from
same-hue glass or lights. Pixel art (`technique: pixel`) isn't imported: take it with an asset's `from`, which snaps it to
the palette. A picture taken out of the folder stays in game.yaml until you remove it; a wheel taken out of
`cleanup.json` is removed with its file. The art is still judged like any other (§ 5, step 4): one style across the set,
light and motion from code.

## 6. Where things are

| | |
|---|---|
| The package | `packages/art/src/` — `color`, `palette`, `noise`, `bake`, `material`, `light`, `shapes`, `sprite`, `hud`, `rig`, `tween`, `fx`, `camera`, `scenery`, `perf`, `assets`, `dom`, `type` (`@gp/art/<module>`; the faces `@gp/art/type/<face>`, their files and licences in `packages/art/fonts/`, rebuilt by `tools/subset-fonts.sh`) |
| Drawn icons | `@gp/core/icons` (`packages/core/src/icons.ts`); the platform screens' theme: `screenTheme()` (`packages/core/src/screen-theme.ts`) |
| Threat cues | `packages/art/src/threat.ts`, through `@gp/art/hud`: `HitArcs` (where a hit came from), `edgeArrow` / `screenOf` (a target off the screen), `DamageNumbers` (pooled, merged) — canvas `draw()` or DOM `mount()`; [code-games.md → Shooters and action](code-games.md#shooters-and-action-aim-enemies-bosses-the-announcer-threat-cues); tests in `packages/art/test/threat.test.ts` |
| Quality on a WebGL engine | `QualityLadder` in `@gp/core` (N levels of your own, judged on the frame interval) and `eng.setRenderScale` on the adapters — `AutoQuality` here is the Canvas 2D one ([code-games.md → Quality levels](code-games.md#quality-levels-and-pictures-of-the-engines-scenes)) |
| Generated art | `gp art` — `packages/cli/src/art.ts` (prompts, the Gemini provider, the cut-out in the browser, provenance); game.yaml `art` |
| The owner's pictures | `gp art import` — `packages/cli/src/art-import.ts` (the flood fill and soft edge, patch and erase, wheels, the paint mask, game.yaml and provenance); tests in `packages/cli/test/art-import.test.ts` |
| The showcase | `docs/examples/art/` (`scene.ts` is the picture, `main.ts` the host contract); `gp qa docs/examples/art` 131/131 |
| The skeleton's look | `templates/game-repo/games/__ID__/art.ts` (`gp init`): a PLACEHOLDER like the mechanic |
| The QA hint | `packages/qa/src/flat.ts` (`look: depth in the play frame` in `qa/report.md`) |
| The review checklist | `ART_CHECKLIST` in `packages/cli/src/review.ts` (`gp review` → `qa/review-brief.md`) |
| Tests | `packages/art/test` (colour parsing and maths, palettes, noise, camera and its kick at long frames, rig, tweens and punches, auto quality and its backoff, particles, trails, shadow geometry and occluder reach), `packages/art/test-browser` (materials, the light map and shadows, bakes and the cache across a density change and a lost context, `keepBaked`, sheets and their frames, 9-slice, the HUD cache, scenery coverage and determinism, tiles edge to edge at DPR 1, 1.5 and 2, the canvas adapter's render scale, tile memory, eyes, baked shadows at any density, `iconImg` / `spriteImg` at DPR 2 and their cache, the bundled faces loading and drawing Latin and Cyrillic, outlined tabular numbers, the pixel font as a real font); `packages/art/test/type.test.ts` (the faces' files, licences and sizes, `GAME_CHARSET` and the pixel font over the platform's words in the ten portal languages, the TrueType file) |
