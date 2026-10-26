# 🎵 Melody Forge

A premium-feeling, responsive musical merge game for desktop, tablet and phone. Built in **plain HTML5 / CSS / JavaScript**, with no build dependencies.

## Play

**GitHub Pages:** https://mooouse.github.io/g/ *(becomes active after GitHub Pages is enabled in the repository settings)*

### How to play
1. Tap an instrument, then another one of the same tier to **merge** them into a new instrument.
2. Select an instrument and press **Play a Note** (or tap it twice). Its distinctive musical voice damages crystals in the surrounding cells. Higher tiers have more power and range.
3. Select an instrument and tap a **free unlocked tile** to move it so its notes can reach the next crystals.
4. Clear every crystal to win the level. Your highest-tier instrument carries over to the next composition.
5. Earn Gold Notes, summon new instruments, and upgrade sound power, energy capacity, and regeneration speed.

### Included
- **12 hand-crafted illustrated instruments**, each with its own synthesized timbre
- Procedurally generated stages; board sizes and crystal health grow with progression
- Generative ambient music with a Web Audio synthesizer and volume slider
- First-launch guided tutorial and accessible on-screen instructions
- English / Русский / Español, changeable at any time
- Persistent collection, upgrades, currency, and level progress
- CrazyGames SDK **v3** with gameplay events, data-module save when available, and local fallback on GitHub Pages
- Mobile-friendly touch controls and responsive layouts
- No third-party game assets or runtime dependencies

## Enable GitHub Pages (one-time)
1. Open [Settings → Pages](https://github.com/Mooouse/g/settings/pages).
2. Under **Build and deployment → Source**, select **GitHub Actions**.
3. The checked-in workflow at `.github/workflows/pages.yml` deploys automatically on each push to `main`.
4. After the first successful deployment, use https://mooouse.github.io/g/.

## Development and verification
Open `index.html` in a browser or serve the repository directory with any static HTTP server, for example:

```bash
python3 -m http.server 8000
```

Check the JavaScript and smoke-test the core gameplay:

```bash
node --check art.js
node --check game.js
node tests/smoke.cjs
```

The GitHub Pages deployment workflow runs these tests before publishing.

## CrazyGames
The official HTML5 v3 SDK is loaded from `https://sdk.crazygames.com/crazygames-sdk-v3.js`. The game initializes the SDK, handles gameplay start/stop, data-module saves (with local fallback when not on CrazyGames), and marks loading as complete. Publishing to the CrazyGames catalog is a separate submission process from GitHub Pages.

No advertisements or monetization are enabled by default.
