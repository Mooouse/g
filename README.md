# BEATBOUND — Sonic Merge

**A new musical merge puzzle** built as a responsive HTML5 game. This repository was rebuilt from scratch; the earlier Melody Forge source was removed.

## Play
GitHub Pages: **https://mooouse.github.io/g/** (after the Pages Actions deployment succeeds).

The board is an 8-step sequencer. Each instrument plays a note and damages crystals in its local area when its beat arrives. Every crystal must be destroyed to finish a level. More advanced instruments have stronger soundwaves, a wider range, and a new musical timbre.

- **Click / tap an instrument** to select and hear it; tap a second one of the same tier to merge.
- **Drag and drop** an instrument onto another matching instrument to merge; drop it on a free unlocked tile to relocate it.
- **Click SOUND BURST** after selecting an instrument for a stronger instant attack (consumes energy).
- **Buy fresh instruments** and invest earned Sound Coins into attack power, maximum energy, or recovery.
- **Keep progressing:** map size and crystal toughness increase, while highest unlocked instrument tiers carry between levels.
- **16 original instrument illustrations** drawn in SVG and accompanied by unique Web Audio synthesizer patches.
- **Automatic beat-synced background soundtrack** mixing drums, bass, melody, and instrument voices.
- **English / Russian / Spanish**, volume sliders, non-blocking in-game tutorial, save data.
- **CrazyGames SDK v3** integration with graceful standalone fallback for GitHub Pages.

## Quick start
Serve these files as-is. No build process and no libraries:

```sh
python3 -m http.server 8000
# then visit http://localhost:8000
```

Test syntax and gameplay:

```sh
node --check visuals.js
node --check audio.js
node --check app.js
node tests/smoke.cjs
```

## GitHub Pages
The workflow `.github/workflows/pages.yml` tests and deploys automatically on `main`. In repository **Settings → Pages** the source must be set to **GitHub Actions**.

## CrazyGames
The v3 SDK runs on CrazyGames, with loading/gameplay events and optional platform Data storage. Outside the platform, the game uses localStorage. The game does not request advertisements. Submission and platform moderation are separate from GitHub Pages testing.

## Uploaded development reference
The archive `game_platform-claude-sleepy-cannon-xcyut8 (2).zip` is the user's supplied multi-package **game development platform**, not the game source. Its guidance on first-minute gameplay, quality, portal submission, localization, and QA was studied. The original ZIP is retained in the repository for the owner. The actual game is a new standalone project, not copied platform runtime.

Inspired by the idea of musical grid play; all implementation, illustration designs, and generated audio are newly created.
