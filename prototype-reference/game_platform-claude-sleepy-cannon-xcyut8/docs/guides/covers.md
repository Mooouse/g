# Covers that get clicked (`gp covers`)

A portal player sees a game first as a tile about 200 px wide among fifty others, and decides in half a second. Our
first five CrazyGames games got these click-through rates in their first Basic Launch days (the owner's developer
dashboard, 2026-10-02): **Spin Brawl 1.2 %, Hang the Moon 0.9 %, Dread Throne 0.7 %, Starsilk 0.7 %, Nimbus Drift
0.6 %**. The target is 2–4 % ([forums research](../research/forums-2026-09.md): Larss went from a grid that read as
"just a grid" at 200×112 to "something to decode in half a second"). Their covers were screenshots of the play screen
with the title over them: small heroes on big dark or flat areas, no action, titles drawn by each game at its own size.

The cover system splits the work. **The game draws the key art** — its world, its hero big, one action moment — in
layers, through a cover hook. **The platform composes the cover**: it lays out each size, lights the hero's rim, gives it
an outline and a halo, darkens behind the title, adds a vignette and letters the title (big, outlined, extruded,
gradient, tilted, fitted to its zone). Then **it checks the cover at 200 px wide** and shows it to you the way players
see it.

![Forge Night's covers at 200 px wide, as on the portal's grid; below, in grayscale](covers/forge-night-preview.png)

*Forge Night (`docs/examples/art`): the three CrazyGames covers at the size players see them, from `gp covers`
(`store/cover-preview-200.png`). Before the cover system the same game's covers were its play screen with a DOM title
(below): a hero 40 px tall at this size, a thin title, and nothing happening.*

![Forge Night's covers before: the play screen with a title](covers/forge-night-before.png)

```sh
npm run gp -- covers docs/examples/art              # the three covers, the check, the 200 px preview
npm run gp -- covers docs/examples/art --variants 3 # + two other compositions for an A/B test (store/variants/)
npm run gp -- covers docs/examples/art --check      # score the covers already in store/ (no render)
```

## The rules

What makes a game tile get clicked, as rules the composer follows and the check measures. Sources: CrazyGames' cover
requirements ([docs.crazygames.com/requirements/game-covers](https://docs.crazygames.com/requirements/game-covers/),
quoted in [crazygames-requirements-2026-09.md §9](../research/crazygames-requirements-2026-09.md)); the Larss devlog in
[forums-2026-09.md](../research/forums-2026-09.md); WCAG 2.2 contrast (3:1 for large text); Hasler & Süsstrunk,
*Measuring colourfulness in natural images* (SPIE 5007, 2003); and the common practice of store and video thumbnails
(a face with an emotion, few big words, strong contrast), which we follow without a single study to cite.

1. **One big, readable title.** It spans ≥ 40 % of the landscape cover's width (≥ 55 % of the portrait and square ones),
   with letters ≥ 13 px tall at 200 px wide; a thick dark outline, a 3D block, a glow: contrast ≥ 4.5 : 1 against what
   is around the letters. **At most 3 words** on the cover (`cover.title.text` can be a shorter form of the name). The
   game's name on the cover is required: "Put the name of your game directly on the cover" (CrazyGames).
2. **The title is the only text.** No "New", "Play", "Play now", no score, no UI, no tips (CrazyGames sends those back).
3. **A hero close-up with a clear emotion or action.** The character fills its zone — a crop off the edge reads as
   close, a margin reads as small (≥ 15 % of the cover's area); its face says something (surprise, effort, joy).
   "Don't just take a screenshot of the game … use the main character" (CrazyGames).
4. **One focal action moment:** an explosion, a hit, a catch, a spell — big shapes, not particles mid-flight (they blur
   into a smudge at 200 px: `burst()` in `@gp/art/fx` draws one that reads).
5. **Saturated colour with strong value contrast.** Colourfulness ≥ 55 (Hasler–Süsstrunk: "quite colourful"); lightness
   from deep shadows to bright highlights (a 5–95 % spread ≥ 0.6 in OKLab); a warm hero on a cool scene, or the other way.
   Check it in grayscale: the preview's second row.
6. **A rim, an outline and a glow separate the hero from the background.** The platform draws them; the check measures the
   contrast across the hero's outline (ΔE ≥ 30).
7. **No empty or near-black areas, no clutter.** Under 20 % near-black (it vanishes on a dark portal page), under 25 %
   flat blocks (an empty sky), between 6 % and 32 % edge pixels (nothing to decode ↔ too many small things). "Keep it
   simple: over-cluttered covers are hard to scan, especially on small screens" (CrazyGames).
8. **No border, no logos, nothing blurry.** The art fills the cover to the edges; the hero is baked at the size it is
   drawn (a 1× sprite blown up 4× is the "blurry" CrazyGames rejects).
9. **One look across the three sizes** (CrazyGames: "consistent visuals and aesthetics"): the same composition, palette,
   hero and lettering in 1920×1080, 800×1200 and 800×800, each laid out for its shape, the title inside a 4–6 % margin.

## The cover hook

A `kit: code` game registers its key art with the QA driver, in dev builds only (it stays out of the upload):

```ts
host.qa({
  play, end, demo, screens,
  cover: import.meta.env.DEV ? art.cover() : undefined,
});
```

`cover` is a `CoverArt` (`@gp/core`): up to three layers, each a function that draws on a transparent canvas of the
cover's size (CSS px = pixels), plus the title's look.

```ts
import type { CoverArt, CoverLayout } from '@gp/core';
import { burst } from '@gp/art/fx';

const cover: CoverArt = {
  // The world behind the hero, filling the whole cover; the action moment at L.focus
  scene(g, L) {
    sky.draw(g, L.w, L.h, { x: 0, y: 0 }, 2.5);
    burst(g, L.focus.x, L.focus.y, 0.24 * Math.min(L.w, L.h));
  },
  // The hero alone, big, filling L.hero — the platform outlines it, lights its rim and measures it
  hero(g, L) { drawHero(g, L.hero, { mood: 'surprised' }); },
  // Optional: in front of everything but the title (sparks, debris)
  front(g, L) { sparks.draw(g); },
  // Optional: the lettering (defaults below) and the rim colour
  title: { text: 'Forge Night', fill: ['#fffaf0', '#ffd27a', '#ff8a2a'], outline: '#1b1448', glow: '#ff9a3c' },
  rim: '#7fe8ff',
};
```

**The layout** (`CoverLayout`) tells each layer where things go, per size and composition: `w`, `h`, `shape`
(landscape / portrait / square), `variant`, `hero` (the box to fill), `title` (the box the platform letters — keep it
calm), `focus` (where the action goes: next to the hero, away from the title), `unit` (the shorter side / 1080) and
`light` (the direction the rim light comes from: shade the hero to match). The zones are in `coverLayout()`
(packages/art/src/cover.ts) and the same for every game: the covers of all our games line up.

- **Crisp, not blurry:** bake the hero at the scale you draw it. `@gp/art` bakes at the render scale
  (`setRenderScale(n)` from `@gp/core/draw` re-bakes everything at `n`): Forge Night's robot is drawn ≈ 4× its play size
  on the cover and baked at 4×.
- **Forced perspective** works: the hero layer can be at a bigger scale than the scene behind it (Forge Night: the world
  at half the hero's scale, so more of the forge is in frame).
- **A WebGL game** (Pixi, Phaser, three) renders its frame on its own canvas and copies it: `g.drawImage(myCanvas, 0, 0,
  L.w, L.h)` — a layer may be async (`await` a frame).
- **The title's look:** `fill` (2–3 colours, top to bottom), `outline` (a very dark shade of the hero's colour, never
  black), `extrude`, `glow`, `tilt` (rad, default −0.05), `arc` (em, default 0.06), `upper`, and `font` + `weight` for a
  family the game ships (load it with `FontFace` before the hook runs). The default face is Lilita One (SIL Open Font
  License, `packages/art/fonts/`): heavy, rounded, readable at 13 px. `titleStyleFrom(palette)` (`@gp/art/cover`)
  derives a style from a palette's roles.
- **No hook?** `gp covers` falls back to the game's own `?cover` frame (`body[data-cover=ready]`) or its first screen, and
  scores the picture only (the title can't be measured without the composer: the report says so).

`gp video` opens on the same composed cover (the portal wants the static cover as the video's first frame).

## The check

`gp covers` (and `gp submission`) score every cover at 200 px wide, the way the browser scales an image for a tile.
A score under **70** is a warning, never a failure: these are proxies for click-through, not a prediction of it. A
cover without the composer's masks (no hook) is always a warning: the picture alone can't see a small title or hero.

| Measure | How | Bad → good | Weight |
|---|---|---|---|
| Title width | the lettering's box / the cover's width (the composer's mask) | landscape 25 → 40 %, portrait and square 35 → 55 % | 12 |
| Letter height | cap height at 200 px | 7 → 13 px | 10 |
| Title contrast | WCAG ratio, the letters' median luminance against the 1–2 px band around them (the outline, or the scene) | 2 → 4.5 : 1 | 13 |
| Words | words on the cover | 5 → 3 | 5 |
| Hero vs. background | ΔE ×100 (OKLab) across the hero's outline: 2 px inside against the most different of 1–3 px outside, median along the silhouette; without a hero layer, the 90th percentile of every pixel's ΔE from the frame's edge (estimated) | 10 → 30 | 12 |
| Hero size | the hero layer's share of the cover | 5 → 15 % | 8 |
| Colourfulness | Hasler–Süsstrunk M | 25 → 55 | 12 |
| Value contrast | OKLab lightness, 95th − 5th percentile | 0.30 → 0.60 | 8 |
| Near-black area | pixels with OKLab L < 0.22 | 50 → 20 % | 7 |
| Empty (flat) area | 10×10 px blocks with no lightness or colour variation | 60 → 25 % | 6 |
| Detail | Sobel edge pixels on lightness | 2 → 6 % … 32 → 45 % (too few: nothing to decode; too many: clutter) | 7 |
| No border | sides with a flat band of one colour that ends in a clear change | 3+ sides: 0 | 6 |

The output: each cover's score with ⚠ and a concrete fix on every weak measure, `store/cover-check.md` (the same, for the
reviewer and the owner), `store/cover-preview-200.png` (the three covers at 200 px, in colour and grayscale) and
`store/cover-thumbnail-200x112.png`. `store/covers.json` keeps the composer's masks, so `--check` can measure the title
later — while the PNG is the one it wrote. The code: `packages/cli/src/cover-check.ts` (pure, tested on synthetic
images in `packages/cli/test/cover-check.test.ts`).

**Our games' current covers, scored.** They have no hook, so the title and the hero can't be measured: these are the
picture's scores only, and a cover scored on the picture alone is always a warning. Forge Night's old covers show why:
94 / 88 / 93 on the picture, with a title and a hero too small to read. The landscape cover is the one on the desktop
grid.

| Game | CTR (Basic Launch) | Landscape | Portrait | Square | What the check says |
|---|---|---|---|---|---|
| Starsilk | 0.7 % | 23 | 24 | 30 | 55–73 % near-black, 59–68 % flat, value spread 0.19–0.27, colourfulness 20–29 |
| Spin Brawl | 1.2 % | 49 | 78 | 81 | 38–44 % near-black, 65–70 % flat; the landscape cover's subject is weak |
| Hang the Moon | 0.9 % | 66 | 52 | 62 | 52–69 % flat (an empty night sky) |
| Dread Throne | 0.7 % | 64 | 63 | 60 | 53–59 % near-black, colourfulness 32–34 |
| Nimbus Drift | 0.6 % | 68 | 66 | 79 | value spread 0.34–0.37, 40–51 % flat; a white title on a pale sky (the check can't see it without the hook) |
| Forge Night, before (the play screen + a DOM title) | — | 94 | 88 | 93 | nothing on the picture: the small title and hero are what's wrong |
| **Forge Night with the hook** (all measures) | — | **94** | **98** | **98** | the `action` set 95 / 96 / 97, the `closeup` set 97 / 100 / 98 |

![Starsilk's covers at 200 px: 73 % near-black](covers/starsilk-before.png)

Five games are too few to fit the score to click-through, and the order doesn't match (Spin Brawl's landscape cover
scores lowest and was clicked most: it is a multiplayer `.io` game, a genre players look for). Read the score as "what
is wrong with this picture at 200 px", not as a forecast. And the showcase's 94–100 says the composer follows the rules
the check measures — not that players will click it: the check and the composer were written together. Record each
game's CTR when the portal shows it, so the thresholds can be fitted later.

## A/B testing covers

`gp covers --variants 3` renders three compositions with the same art:

- **`hero`** (the cover: `store/`): the hero big on one side, the title on the other (landscape); the title on top,
  the hero below (portrait, square).
- **`action`** (`store/variants/action/`): the title across the top, the action under it — the moment over the face.
- **`closeup`** (`store/variants/closeup/`): the hero's face filling the frame, bleeding off the edge, the title at
  the bottom.

![Forge Night, the close-up composition](covers/forge-night-closeup.png)

![Forge Night, the action composition](covers/forge-night-action.png)

Each set has its own preview strip and scores (the table at the top of `cover-check.md` compares them). On CrazyGames
the covers can be replaced after the launch, from the game's page in the developer portal (the cover fields of an
update); the portal notes that "there is often a spike in sessions when covers for older games are updated" and asks
not to update too often. The portal has no A/B switch that we know of, so test one change at a time: keep a set for
at least 7 days, note the CTR from the dashboard, upload the next set for as many days, keep the winner, and write both
numbers in the game's `publisher/results.yaml` notes. Not verified by us: the exact steps of the portal's update form
(check them in the developer portal the first time).

## For the reviewer

`gp review` lists `cover-preview-200.png` and the covers with the question to ask; the quality checklist's cover line
says what `gp covers` measured. What the check can't see, a reviewer must: does the cover say what the game is (genre,
the twist), is the hero the game's hero, is the action the game's action, is the title the game's name.
