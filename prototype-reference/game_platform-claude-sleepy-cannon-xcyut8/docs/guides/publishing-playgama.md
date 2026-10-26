# Publishing on Playgama (one upload, 20+ platforms)

Playgama takes an HTML5 game once and distributes it, non-exclusively, to its own portal and partner platforms: YouTube
Playables, MSN, Yandex Games, Facebook, Discord, Telegram, Xiaomi, Huawei, Samsung, GameSnacks, Y8, Lagged and more —
you choose the platforms in the cabinet. Revenue share (2026): 70 % of net up to $1,000, 80 % above, 90 % above $3,000.
CrazyGames does not require exclusivity, so a CrazyGames game can go to Playgama as it is.

## Build

```bash
gp build <game> --target playgama        # in a game repository: scripts/gp.sh build --target playgama
```

The same game, with Playgama Bridge instead of the CrazyGames SDK, in `games/<id>/upload-playgama/`:
`<id>-playgama.zip` (index.html + `playgama-bridge-config.json`) — the file to upload. Only portal games (`channel: crazygames`).

What the platform does for you through Bridge (`PlaygamaPortal` in packages/core/src/portal.ts):

| Game (host) | Bridge |
|---|---|
| loading done (first screen ready) | `platform.sendMessage('game_ready')` — dismisses the platform's loader |
| `host.gameplay(true/false)` | `gameplay_started` / `gameplay_stopped` |
| `host.adBreak()` | `advertisement.showInterstitial()` (Bridge's own cooldown, 60 s by default, applies too) |
| `host.rewarded()` | `showRewarded()` — the reward only on `rewarded` then `closed`; `rewardedAvailable` is false on platforms without rewarded ads |
| the portal's mute | `audio_state_changed` → `host.portalMuted`, the host's sound off |
| the platform pauses the game | `pause_state_changed` → the host's `hidden` pause (your pause screen) |
| the player's language | `platform.language` → the game's language when it has it |
| saves (`host.load`/`host.save`, the language choice) | Bridge Storage (cloud saves where the platform has them): all keys loaded in one `storage.get` at start, every save written through with `storage.set` — the checklist forbids localStorage. A game that writes localStorage itself must use `host.save` instead |

The Bridge script loads from `https://bridge.playgama.com/v2/stable/playgama-bridge.js`, so only the current platform's
adapter is downloaded. Outside a platform Bridge runs in its mock mode: the game plays, ads return their defaults.

Interstitials: Playgama's certification fails a build whose interstitial never fires in a short session, so a
Playgama build shows one at every natural break from the first, at most one a minute (`PLAYGAMA_AD_POLICY` in
packages/cli/src/vite-plugin.ts; the CrazyGames build keeps its channel's limits).

Before the owner certifies a build in Playgama's QA Tool, run `gp playgama-check <game>`: the Playgama build with a
recording fake Bridge, the demo bot playing — the Bridge first, storage in one call, game_ready, gameplay events, an
interstitial at a break within 90 s, a rewarded ad closed early giving nothing, pause and audio events, no
localStorage, no external hosts, and what the QA Tool's recorder films. Its report is games/<id>/qa/playgama-check.md.

**What the QA Tool sees.** Its recorder films and screenshots the page's *first `<canvas>*` (Bridge:
`document.querySelector('canvas')`), not the page — the DOM in `#ui` (menus, the result screen, an ad button and its
"no reward" message) isn't in it. Candle Crypt 1.5 gave nothing for an ad closed early, and still failed "Reward was
granted despite the ad being closed before completion": the QA Tool saw the dungeon before the ad and the same dungeon
after. So the Playgama portal installs a mirror on the QA Tool's first recorder message (`@gp/core` recorder.ts): a canvas
first in the document that copies the game's canvases each frame and paints the DOM over them (boxes, borders, text,
images; no z-index, gradients beyond the first colour, shadows or pseudo-elements). Nothing changes for players: no
recorder message, no mirror. `gp playgama-check` saves what it films in `qa/playgama-recorder.png` — look at it: what
isn't there, the QA Tool doesn't see (an inline `<svg>` or a CSS-only shape, for example).

**Sign-in (the QA Tool's Authorization step).** Playgama has player accounts; its QA Tool warns "No sign-in option
found" when a game offers none, and "Login button visible for an authorized user" when it keeps offering it after the
player signed in — the certification passes, but the game can't be published until both are clear (2026-10-10). The
platform does it: on a Playgama build, where `bridge.player.isAuthorizationSupported`, the host puts a small "Sign in"
(10 languages) in the bottom-left corner of the menus, hidden while a run plays and gone once signed in; signing in
reloads the game so its saves come from the account. It never lies on the game's own DOM controls: when it would, it
moves to the next free corner (bottom right, top left, top right), and with none free it hides on that screen
(2026-10-10: it covered Rivet Clash's "Build & fight" at 360×800). Buttons drawn on a canvas it can't see — such a game
places its own. A game that wants it elsewhere places its own —
`signInButton({ host, className })` from `@gp/core` (data-gp="sign-in"), and the corner one stays away. Launching never
requires it (the checklist's item 20). `host.account` says `{ supported, authorized, name }`, `host.signIn()` starts it.
`gp playgama-check` checks it: offered on the menu, on none of the game's controls at 360×800 and 1280×720, gone after
signing in.

## Upload

developer.playgama.com → create the game → upload the zip, the covers (`gp covers`: the form's three slots take exactly `cover-1920x1080.png`,
`cover-1080x1920.png` and `cover-800x800.png` — all three are required) and the description (listing.md from
`gp submission`) → Playgama tests it (≈ 24 h) → choose the platforms. Playgama also has an MCP server for the cabinet
(`https://developer.playgama.com/api/mcp`): the owner connects it to an agent session to upload builds and covers by API.
Never put the owner's login in a game repository or a script.

## Not yet

- No `gp qa` against a fake Bridge (the CrazyGames build is what `gp qa` plays; the adapter has unit tests and was
  checked in a browser against a fake Bridge: game_ready, gameplay events, language, pause).
- Bridge's IAP, leaderboards, banners: not wired. Analytics: the Bridge has no custom-event API; its telemetry reads the
  `gameplay_started` / `gameplay_stopped` the host sends. The host's own first-minute funnel stays on its event bus, and a
  paid sandbox test before CrazyGames is the owner's decision ([first-minute.md → the funnel](first-minute.md#2-the-funnel-funnel-events)).
- `playgama-bridge-config.json` is empty (Bridge's defaults); its config editor adds placements and per-platform settings.
