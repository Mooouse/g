# MUSIC CRATES

A new HTML5 merge-and-smash music game inspired by the publicly described gameplay of [Beat Grid by AxelSonic](https://axelsonic.itch.io/beat-grid). Uses **original implementation, graphics, sounds and title** — no third-party source code or licensed assets are copied.

## Play
GitHub Pages: **https://mooouse.github.io/g/** (after a successful Pages workflow)

### Core loop
- Tap instruments to make music and damage surrounding wooden boxes.
- Combine two matching instruments with consecutive taps or drag one onto the other. Higher tiers hit harder and unlock new timbres.
- Crates lose health and break, dropping money and sometimes extra instruments.
- Rare golden crates hold a surprise and extra resources.
- Instruments also hit nearby boxes automatically over time, creating a hands-on idle progression. Drag onto an unlocked free square to extend coverage.
- Use your earnings to buy instruments and boost attack strength, attack speed and loot rewards.
- Clear all boxes to advance through procedurally generated levels with increasing HP and board size.
- Keep your highest unlocked instrument tier between levels.

### Included
- 16 illustrated musical instrument tiers, procedural musical synthesizer, ambient rhythm and volume controls.
- Small 3-step contextual tutorial, English/Russian/Spanish, responsive phone/tablet/desktop UI, persistent progress.
- CrazyGames SDK v3 with loading/gameplay events and platform data fallback to browser storage.

### Development
No dependencies. Open `index.html` in a browser, or serve via `python3 -m http.server 8000`.

Validate:
```sh
node --check instruments.js
node --check game.js
node tests/smoke.cjs
```

GitHub Pages publishing uses `.github/workflows/pages.yml`. Ensure **Settings → Pages → Build and deployment → GitHub Actions** is enabled.

## User-supplied project reference
`game_platform-claude-sleepy-cannon-xcyut8 (2).zip` is preserved unchanged. It contains a game-creation platform, not the original Beat Grid game. The game code above is separate.

### Intellectual property
This project recreates common gameplay mechanics rather than copying the proprietary executable, art, soundtrack, branding or source of Beat Grid. Approval or a license from its author would be required to redistribute those original assets.
