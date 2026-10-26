# Melody Scanner

An original HTML5 arcade game rebuilt around the gameplay shown in the supplied **40.9-second, 1920×1080** Beat Grid reference video, rather than the earlier dashboard-style prototypes.

**Play on GitHub Pages:** https://mooouse.github.io/g/

## Core mechanics
- A full-screen musical **13×6 tile grid** with detailed metallic damage blocks of different shapes and values, and a massive red/gold **100K target**.
- A neon vertical **playhead scanner** sweeps across the grid. When it passes a musical instrument, that instrument plays a synthesized note and damages a corresponding block.
- Musical instruments range from small keyboards and ukuleles to guitars, synthesizers and harps. They occupy **1×1, 2×1, 1×2 and 2×2** tiles.
- Drag two matching instruments together, or select the same tier twice, to **merge** them into a more powerful instrument.
- The lower green button creates new instruments when enough charge is available. Charge builds from scanning and damaging metal targets.
- Steel blocks lose hit points (10, 20, 40, 50, 600, 800, 1K, 2K, 3K, 4K, 5K, 7K, 9K), revealing more tiles. The huge boss has 100K HP.
- Countdown timer, money, sound upgrades, fast scanner upgrades, income boost, visual note effects and sound synthesizers.
- Uses native canvas 2D rendering and original SVG art, zero build dependencies, CrazyGames SDK v3, local save, Russian/English/Spanish settings, desktop and portrait layouts.
- Press **Space** to generate an instrument, **Enter** to restart after a round, click the top-left icons for upgrades/settings.
- Restarting a timed-out round retains accumulated money, items and HP already taken from the blocks.

## Why it looks different from previous prototypes
The game **does not** display a peripheral shop panel or a conventional merge inventory screen. The playfield is the entire viewport. In the provided reference video, the scanner moves through a pastel purple/gold board, instruments occupy individual or multiple grid cells, damage appears as floating numbers/music notes, and a large 100K gold target dominates the upper-right. The game's layout was built around those details.

This is a **new independent implementation**, not a redistribution of Beat Grid's original copyrighted code, images, sounds, or branding.

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
