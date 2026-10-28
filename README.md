# Melody Scanner

## Motion effects — Mo.js 1.7.1

We use the **real** [Mo.js library](https://mojs.github.io/) (`@mojs/core@1.7.1`), **not** an imitation. Its official UMD bundle and MIT license are checked into [vendor/mojs/](vendor/mojs/) for consistent CrazyGames/browser loading without relying on a third-party runtime CDN.

- [`mojs-game-fx.js`](mojs-game-fx.js) creates real `mojs.Burst` and `mojs.Shape` animations for instrument mergers, swap confirmations, loot reveals, broken blocks, and level completion.
- Effects render into a noninteractive overlay mapped to the responsive game Canvas, so drag-and-drop remains reliable and no effects leave trails.
- Emissions are throttled, reused in small per-type pools (no unbounded DOM allocations), and suppressed when `prefers-reduced-motion: reduce` or the tab is hidden.
- Old `concert-fx.js` imitation was removed; CSS and screenshots remain the same concert theme.

Checks:
```sh
node --check mojs-game-fx.js
node tests/mojs-fx.cjs
# Real Chrome integration: tests/mojs-browser.html
```

The Mo.js project and library are MIT-licensed (license preserved in `vendor/mojs/LICENSE.md`).

## Concert Edition — visual redesign and roulette (October 2026)

The game now uses a concert-stage identity: dark stage backdrop, spotlights, silhouette crowd, glossy HUD and slot grid, themed block armor, and a new title menu and quick first-play tutorial. The original approved PixelLab instrument sprites are retained as individual PNGs. The studio/store mockup was **not** implemented; no instrument shop or individual paid upgrades are exposed.

### Random instrument roulette

Click **КРУТИТЬ РУЛЕТКУ** for **5 charge** to animate a reel. The player cannot know the prize until it stops. It can give an instrument from **any of the four families**, already at levels 1–6.

| Level / rarity | Base chance |
|---|---:|
| Common — L1 | 58% |
| Uncommon — L2 | 25% |
| Rare — L3 | 11% |
| Epic — L4 | 4.5% |
| Legendary — L5 | 1.3% |
| Mythic — L6 | 0.2% |

The game normalizes these odds over **instruments that currently fit**. No charge is taken if the board has no valid prize position. The awarded object is guaranteed to exist when the animation finishes; no purchases, future-item previews, or monetized spins.

- Same-family equal-level merging and animated drag/swap remain.
- Upgraded drops always use the appropriate family-specific art and footprint.
- Scanner gameplay pauses while the reel rolls, so no time is unfairly lost.
- Guitar samples now use gentler filtering and lower levels instead of excessive waveshaper distortion.
- [Automated roulette QA](tests/roulette.cjs), [full gameplay QA](tests/smoke.cjs).
- Desktop and mobile screenshots are kept at [docs/qa-screenshots](docs/qa-screenshots).



## Recorded instrument audio (October 2026)

The scanner now plays **18 bundled recordings** of real instruments via `sample-audio.js`, rather than the previous one-size-fits-all oscillator patches. Piano/keyboard, ukulele, electric guitar, and acoustic drum kit have distinct sound banks. Levels 1–6 have progressive articulation (single notes, strums, chords, guitar amplifier drive, and real drum patterns) while retaining the approved 24 instrument sprites.

Audio loads from `assets/audio/` on the game's own origin (no sound CDN or build dependency), begins downloading during boot, and unlocks only after user interaction to respect browser autoplay policies. A short synthesized fallback plays if a sample cannot be decoded. Background accompaniment is kept quieter than the instruments. Sound effects and the portal mute setting are handled separately.

Sound recordings and redistribution licenses: [AUDIO_CREDITS.md](AUDIO_CREDITS.md). Drum samples require attribution: **Drum samples provided by DrumGizmo.org.**

### Audio verification

```sh
node --check sample-audio.js
node tests/audio.cjs
node tests/smoke.cjs
```



## Individually generated image assets

Instead of the previous procedural shapes in JavaScript, the game now reads **19 independent RGBA pixel-art PNGs** from `assets/pixel/` (7 musical instruments, background/board, enemies, scanner, charge button, visual effects and HUD icons). The instrument sprites are now remastered from the user's previously approved glossy art in `assets/approved/` using `tools/remaster_pixel_assets.py`: source silhouette and hardware detail are preserved, then sampled to the native pixel grid with limited palettes and 1-pixel crisp outlines. `tools/paint_assets.py` creates the separate base files for the other UI pieces; the remaster script additionally polishes the background and metal targets. GitHub Actions builds all 19 assets using `.github/workflows/build-pixel-assets.yml`.

The renderer loads real image files through `art.js`, scales them using `imageSmoothingEnabled=false`, and keeps the 2.5-MP canvas budget plus cached static scenery and 40-FPS paint cap. The old, previously approved glossy WebP art remains unmodified at `assets/approved/` as an archive.

The user specifically requested **immediate integration without preview/approval messages** during this current full-game pixel-art remake. Image reviews may resume only at the user's request.


## Pixel-art edition (October 2026)

The entire playable presentation now uses a **native-grid pixel-art** direction: seven instrument sprites remastered from approved artwork and saved as separate 64px-native PNG files, pixelated 1×1/1×2/2×2 sprite dimensions, sharp nearest-neighbor rendering, pastel-violet pixel-textured background, squared board tiles and damage blocks, stepped pixel scanner, pixel-styled buttons/settings and monospace labels. Existing physics, scoring, merges, audio and CrazyGames hooks remain.

The prior approved glossy illustrations are backed up unchanged at `assets/approved/*.webp`; they are no longer used by the gameplay renderer. Current instrument sprites are independent RGBA PNG files produced by an image-to-pixel-art remaster of approved source drawings; they are not generated by PixelLab. No procedural SVG instrument shapes are used by the gameplay. See `PIXEL_ART_STYLE_GUIDE.md`.

**Performance:** capped 2.5-million-pixel backing canvas, pre-rendered static layer and up to 40 FPS redraws prevent the earlier HiDPI slowdown.


An original HTML5 arcade game rebuilt around the gameplay shown in the supplied **40.9-second, 1920×1080** Beat Grid reference video, rather than the earlier dashboard-style prototypes.

**Play on GitHub Pages:** https://mooouse.github.io/g/

## Core mechanics
- A full-screen musical **13×6 tile grid** with detailed metallic damage blocks of different shapes and values, and a massive red/gold **100K target**.
- A neon vertical **playhead scanner** sweeps across the grid. When it passes a musical instrument, that instrument plays the corresponding recorded instrument sound and damages a corresponding block.
- Musical instruments range from small keyboards and ukuleles to guitars, synthesizers and harps. They occupy **1×1, 2×1, 1×2 and 2×2** tiles.
- Drag two matching instruments together, or select the same tier twice, to **merge** them into a more powerful instrument.
- The lower green button creates new instruments when enough charge is available. Charge builds from scanning and damaging metal targets.
- Steel blocks lose hit points (10, 20, 40, 50, 600, 800, 1K, 2K, 3K, 4K, 5K, 7K, 9K), revealing more tiles. The huge boss has 100K HP.
- Countdown timer, money, sound upgrades, fast scanner upgrades, income boost, visual note effects and recorded instrument playback.
- Uses native canvas 2D rendering, carefully cropped instrument sprites from the user-provided gameplay reference video with SVG fallbacks, zero build dependencies, CrazyGames SDK v3, local save, Russian/English/Spanish settings, desktop and portrait layouts.
- Press **Space** to generate an instrument, **Enter** to restart after a round, click the top-left icons for upgrades/settings.
- Restarting a timed-out round retains accumulated money, items and HP already taken from the blocks.

## Why it looks different from previous prototypes
The game **does not** display a peripheral shop panel or a conventional merge inventory screen. Settings are available by moving the pointer into the upper-left corner or pressing **S**, upgrades by **U**, pause by **P**. The playfield is the entire viewport. In the provided reference video, the scanner moves through a pastel purple/gold board, instruments occupy individual or multiple grid cells, damage appears as floating numbers/music notes, and a large 100K gold target dominates the upper-right. The game's layout was built around those details.

The game code, recorded instrument playback, and game systems are independently implemented. The sprite atlas in `sprites/video-instruments.webp` contains cropped visual references from the gameplay recording the user provided. For public distribution or commercial release, confirm you have the appropriate rights to use any original Beat Grid artwork, or replace that atlas with appropriately licensed art.

## Development
```sh
python3 -m http.server 8000
# http://localhost:8000
node --check art.js
node --check game.js
node tests/smoke.cjs
```

Deployment: [GitHub Actions](.github/workflows/pages.yml). Configure **Settings → Pages → Source → GitHub Actions** in the repository.

The user-supplied `game_platform-claude-sleepy-cannon-xcyut8 (2).zip` is preserved, unchanged, as project reference. It is a general development platform, not the original Beat Grid game.
