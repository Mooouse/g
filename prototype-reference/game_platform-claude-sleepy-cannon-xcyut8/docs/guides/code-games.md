# Games with their own code (`kit: code`)

The other kits build a game from blocks in `game.yaml`. When the brief needs a mechanic the catalog doesn't have
(a survivors-like, a puzzle with levels, a physics toy), write the game in TypeScript **and stay on the platform**.
The platform still does what is easy to get wrong by hand, and it checks it:

| The platform does | How |
|---|---|
| Channel and audience rules | `game.yaml` is validated as for every game: channel, audience, ad limits (only stricter), rewarded ads only where allowed |
| Portal SDK (CrazyGames v3) | loaded and started for you; `loadingStart/Stop` around your `start()`; `gameplayStart/Stop` deduplicated and held back while the tab is hidden or an ad plays |
| Midgame ads | `host.adBreak()` shows one only if the channel's limits allow (CrazyGames requires the first after the tutorial or 3–5 min of play, then at most one per 3 min; the platform: not in the first 3 minutes, the first at the end of run 3 or after 5 minutes of the session, whichever comes first, then at most every 3 min) |
| Rewarded ads | `host.rewarded()` refuses an ad that doesn't follow the player's tap; you get `true` only for a finished ad; `rewardedAvailable` turns false once ads are off for the session (Basic Launch, an ad blocker) or after two failed ads in a row; `rewardedButton()` is the ready button |
| Sound during ads | everything you connect to `host.audio.out` is suspended while an ad plays or the tab is hidden |
| Music and ambience | `@gp/core/sound`: a mixer (music, ambient, sfx buses with their sliders), procedural music themes from a mood and a seed, adaptive music with scenes, stages and an intensity for action games (`createSceneMusic`), ambient layers (wind, rain, water, surf, fire, hum, birds, crickets, drips, crackle, thunder) — no files, all through the host ([Music and ambience](#music-and-ambience)) |
| A lost WebGL context | on `#game`, for every engine: the game is paused (`'context'`) until the browser gives the context back; if it never will, a "reload the page" screen ([Pause](#pause-hidden-tab-ad-lost-webgl-context)) |
| An engine (Pixi, Phaser, three) | through its adapter, `@gp/core/engines/<name>`: created stopped, runs only in play and while the host isn't paused, resizes from the window, sound through the host, the WebGL context restored, a render scale for quality levels, pictures of its scenes (`snapshot`); `gp init --engine`, the version checked by `gp validate` ([Engines](#engines)) |
| A shooter's controls and enemies | `TwinStick` / `LookInput` (pointer lock, a touch twin-stick, the host's pause), `aimAssist`, `@gp/core/steer`, `BossPatterns`, `callouts`, hit arcs and damage numbers in `@gp/art/hud` ([Shooters and action](#shooters-and-action-aim-enemies-bosses-the-announcer-threat-cues)) |
| A browser that can't run it | a `start()` that throws or rejects (no WebGL, WebGL2 or WebAssembly) gets a plain "*Title* can't run in this browser (*reason*)" screen, and loading still ends |
| Saves | `host.load(defaults)` / `host.save(data)`: the portal's cloud storage on CrazyGames, localStorage elsewhere; a broken or old save gets defaults where it doesn't fit (an array keeps the elements of any kind its default holds: slots `Array(12).fill(null)` keep their strings and objects; a map keyed by ids whose default entries share one shape, `sites: { shed: { cars: 0 } }`, keeps every stored entry; other fields not in the defaults are dropped, so a map with entries of no fixed shape starts as `{}`) |
| Repeatable runs | `host.rng` is seeded by `?seed=<n>` in dev builds |
| QA | `gp qa`: 3 screen sizes, touch sizes, portal call order, gameplay events, hidden tab, save, ads rules, frame rate, console errors, the engine underneath (still screens stand still, one AudioContext, a lost WebGL context, Tab out of the canvas) — and the **production build** against a fake SDK, also without WebGL2 and without WebGL |
| Packaging | `gp build --target crazygames`: the upload as one `index.html`, checked (limits, relative paths, no test code, SDK present); `gp submission`: everything the portal form asks for |
| The look of the platform's screens | `screenTheme({ bg, panel, ink, accent, font, … })` dresses every platform screen (results, shop, streak, season, map, dialogue, hints) in your colours and font; drawn icons in `@gp/core/icons`, game fonts in `@gp/art/type` ([the look](#platform-screens-in-the-games-look-screentheme-drawn-icons-game-type)) |

**Don't leave the platform to make a game "your way".** Petri Panic did (QmaCyber/game2) and rebuilt the portal adapter,
ad pacing, saves, input, sound muting, browser QA and packaging by hand — about 950 lines, and its QA was the only check
of them. With `kit: code` that is one import, and `gp qa` checks it.

## Start

```sh
npm run gp -- init ../my-game-repo --id my-game --title "My Game"   # a new game repository from the platform's template
                                 # (+ --engine pixi|phaser|three when the genre needs an engine: see Engines;
                                 #  + --physics when physics is the mechanic: see Physics)
cd ../my-game-repo && scripts/setup.sh
scripts/gp.sh forecast --idea --genre puzzle --session 15 --breaks 6 --rewarded hint,undo --pitch "…"   # step 1: each idea's money
scripts/gp.sh validate           # writes nothing; refuses the TODO concept and money design until you write them
scripts/gp.sh forecast           # what the design in game.yaml can earn (qa/forecast.md)
scripts/gp.sh dev                # test ads, portal stub, ?seed=1, ?ads=fail; prints its pid
scripts/gp.sh dev --stop         # stop it (never `pkill -f vite`: in a cloud session it kills your own shell)
scripts/gp.sh qa                 # the full check, a few minutes
scripts/gp.sh review             # the quality brief for a second agent; it writes quality.md (no [blocking] left)
scripts/gp.sh submission         # the upload, covers, videos, listing.md and quality.md, checked
```

A quick experiment inside the platform instead: `npm run gp -- new my-game --from docs/examples/code/game.yaml` (it starts
the concept and listing as TODO too). More: [A game in its own repository](#a-game-in-its-own-repository).

`games/my-game/game.yaml`:

```yaml
spec: 0
id: my-game
title: "My Game"
audience: general       # kit: code is for 13+ (children need the kids kit's rules)
channel: crazygames     # or web (no ads there: drop monetization); Android is not available for kit: code yet
kit: code
entry: main.ts          # your module, relative to this folder
background: "#0f2230"   # page color until you draw
monetization:
  ads: { rewarded: true }   # default where the channel allows it
concept:                  # required on CrazyGames: written BEFORE you build (gp explain concept)
  pitch: "Swing a lantern on a rope to light the path for a sleepwalker."
  closest: ["Cut the Rope", "Rope Hero", "Night Walk"]   # search the portal: genre AND theme
  different: "You never control the walker: you only move the light, and the walker steps only where it falls."
money:                    # where it earns, decided with the concept (gp forecast; game-design.md → Design for money)
  genre: puzzle
  session: { minutes: 15, breaks: 6, breaksAt: "a night ends → Next night; the walker falls → Try again" }
  rewarded:
    - { placement: relight, kind: continue, gives: "Relight the lantern where the walker fell" }
  returns: { kind: meta, what: "new lanterns to unlock, each lighting the path its own way" }
listing:                  # the portal form's texts (gp submission)
  description: "Lantern Walk is a night puzzle: you never steer the sleepwalker, you swing the lantern, and the walker steps only where its light falls. Guide them home past ponds and dogs."
  controls: "Mouse or touch: swing the lantern. Keyboard: arrows, P pauses."
```

There is no `round` and no `theme`: your code has the mechanics and the look. Write `concept` first: CrazyGames rejected
Petri Panic, a finished and well-tested game, because "the concept is quite close to existing titles" (a live game,
Cell Survivor, had the same genre *and* theme). See [game-design.md → Originality](game-design.md#originality-what-portals-reject).

## The contract

`main.ts` exports one function. Loading ends (the portal's `loadingStop`) when it returns or its promise resolves — or
when it throws or rejects: then the player shows "*Title* can't run in this browser (*the error's message*)." over
everything (`data-gp="cant-run"`), with one console warning and no unhandled rejection. So an engine that can't start
(three without WebGL2, Rapier without WebAssembly) just throws an `Error` with a reason a player can read; don't catch it
to show a blank page:

```ts
import { MoveInput, type GameContext } from '@gp/core';

export default function start({ host, canvas, ui, game }: GameContext): void {
  const save = host.load({ best: 0, coins: 0, upgrades: {} as Record<string, number> });
  // draw on `canvas` (full window), build menus in `ui` (an empty full-window layer)
}
```

| `host.` | When to call it |
|---|---|
| `gameplay(true / false)` | `true` when a run starts or resumes after your pause screen; `false` on your pause, death, results, menus. Repeats are fine |
| `roundEnd(result)` | once per run, when it's over (counts for the ad limits, tells QA) |
| `adBreak()` | on the way into the next run: "Play again", "Next level". Await it, then go on. Never during play, on a timer, or on a navigational button (Menu, Home, Settings, Shop — CrazyGames forbids it) |
| `rewardedAvailable` | show "watch an ad" buttons only when `true`; read it each time such a screen opens — it turns `false` once ads are off for the session (Basic Launch, an ad blocker) or after two failed ads in a row |
| `rewarded('placement')` | right in the button's click handler; give the reward only when it returns `true`. On `false` say so on the button ("No ad available right now") and keep the player's other choices — `rewardedButton()` does all of this |
| `adPending` | an ad is on its way or on screen: a second `adBreak()`/`rewarded()` returns at once (false) — a double click gets one ad and one reward. Meanwhile `#ui` and the canvas are `inert` (the host does it; `host.inertDuringAds(el)` for a screen elsewhere), and a reward handler still checks the run is on — `rewardedOffer()` does both |
| `portalMuted` | the player muted the game in the portal (CrazyGames `settings.muteAudio`): `host.audio` is already silent; mute sounds you play another way |
| `happytime()` | a moment worth celebrating: stage cleared, new best |
| `twist(event)` | the moment your twist happens (`concept.twist.event`): `gp qa` checks the demo bot meets it within `concept.twist.within` s, `gp uniqueness` scores it ([uniqueness.md](uniqueness.md)) |
| `load(defaults)` / `save(data)` | at start / after a run, a purchase in your shop, a settings change. A missing field gets its default, so a save-format number to migrate on must default to `0` (`{ v: 0, … }`), and the game sets the current `v` when it saves: a default of the current version makes every old save look new and the migration never runs (Firefly Rush 2.0.0) |
| `paused`, `pauseReasons`, `onPause(fn)`, `onResume(fn)` | the tab is hidden, an ad plays or the WebGL context is lost: stop your clock. `onPause((reason, reasons) => …)` comes once for **each** reason, `onResume` once when all are gone ([Pause](#pause-hidden-tab-ad-lost-webgl-context)) |
| `audio` | `{ ctx, out }` after the player's first tap (null before): connect every sound to `out` |
| `rng` | `random()`, `range(a, b)`, `int(n)`, `pick(list)` — use it for all of a run's randomness (`?seed` repeats it). A source of its own — a bot's campaign, a level or a day generated from a seed, the cover — is `seededRng(seed)` from `@gp/core` (or `@gp/core/rng` in Node): the same methods, callable as `r()` for the progression blocks, never touching `host.rng` (eight games pasted this mulberry32; it gives their sequence) |
| `minTouchPx` | the audience's smallest touch target (48 px for 13+): size your buttons with it |
| `t(key, params?)`, `lang`, `i18n`, `setLanguage(code)`, `onLanguage(fn)` | every text a player reads, in the player's language: `host.t('best', { n })` from `strings/<code>.yaml` (the platform's own words: `gp.play`, `gp.menu` …); `languagePicker({ host, onChange })` on the title saves the player's choice; re-render in `onLanguage` ([i18n.md](i18n.md)) |
| `firstVisit` | `true` when there was no save at start: a new player — boot them straight into a safe first run, the title after it ([the first minute](#the-first-minute)) |
| `screen(name)`, `fail(data?)`, `playedSec` | `screen('title')` etc. on every screen and `fail()` the moment the player fails: the first-minute funnel (`'funnel'` events, [first-minute.md](first-minute.md#2-the-funnel-funnel-events)) |
| `saveRun(data)`, `loadRun(defaults)`, `clearRun()` | the run in progress, saved on every important change and resumed after a reload, in the host's (cloud) storage; cleared when the run is over |
| `qa({ play, end, lose?, grant?, demo?, canvasUi?, idleAnimation? })` | lets `gp qa` drive the game (see below); `grant(n)` gives the progression's currency so QA can buy — and must `host.save()` it (QA reloads the page first); `demo()` lets a bot play the run that just started (`gp video` films it); `canvasUi()` says what you draw on the canvas that a player reads or taps, `idleAnimation: true` that your title animates on purpose ([the engine checks](#what-gp-qa-checks-underneath-the-engine)) |

### Pause: hidden tab, ad, lost WebGL context

The host pauses the game for three reasons, `PauseReason`: `'hidden'` (the tab), `'ad'` (an ad is on its way or on
screen) and `'context'` (the WebGL context of `#game` is lost: a GPU reset or memory pressure on a phone). They can
overlap — a player switches tabs while an ad plays — so the host keeps a set:

- `host.onPause((reason, reasons) => …)` is called once for each **new** reason, with all the reasons now in force: a tab
  hidden during an ad calls it with `'ad'` and then with `'hidden'`. It can come twice before a resume, so keep it
  idempotent. Show your pause screen on `'hidden'` and `'context'` (`if (reason !== 'ad') pauseGame()`); under an ad the
  ad is the screen. A one-argument listener, `onPause((reason) => …)`, works as before.
- `host.onResume(fn)` is called once, when the **last** reason is gone: the ad is over and the tab is back and the context
  is back. `host.adPending` is already `false` there, so a screen that disabled its buttons under the ad can enable them in
  `onResume`. Redraw in it if your loop stood still.
- `host.paused` is true while any reason is in force, and `host.pauseReasons` says which. Check it where your run steps,
  so nothing moves while it is true — also after a reward or your own Resume button: a run they restart while
  `host.paused` stands still until `onResume` (the engine lab's shell restarted a run in a hidden tab when the ad ended).

**A lost WebGL context.** The host listens to `webglcontextlost` / `webglcontextrestored` on `#game`, for every engine,
from before your `start()`:

- lost → `onPause('context')`, gameplay stops, `host.paused` stays true until the context is back (your Resume must not
  start the run: nothing can be drawn);
- the context comes back only if something called `preventDefault()` on the loss event. Engines that can rebuild do it
  themselves (Phaser, Pixi, three); a plain WebGL game does it in its own listener and re-creates its buffers, textures
  and programs on the restore. If nothing did, the browser never restores it, and the host shows a "*Title*: the
  graphics stopped working. Reload the page to go on." screen (`data-gp="reload"`) — Kaplay can't rebuild, so its games
  get it;
- restored → the host waits until every listener of the event has run (the engine re-creates its GPU state in its own),
  clears `'context'`, and `onResume` comes (when nothing else holds the game paused): **redraw there** — after a restore
  the canvas is blank until you draw. Textures the engine can't re-upload by itself (Pixi's `generateTexture`) are yours
  to re-create in your own `webglcontextrestored` listener.

Canvas 2D games need nothing here. Try it in the dev build's console:
`c = document.getElementById('game'); x = (c.getContext('webgl2') ?? c.getContext('webgl')).getExtension('WEBGL_lose_context'); x.loseContext()`,
then `x.restoreContext()`; `__gp.host.events.log` shows `context:lost`, then `context:restored` or `context:gone`.

### Still screens

The loop runs only while a run is on and the host isn't paused. On the title, the pause screen and under an ad nothing
runs: each screen is drawn once. `gp qa` counts requestAnimationFrame callbacks and canvas frames there (at most 3 in
1.5 s, [the engine checks](#what-gp-qa-checks-underneath-the-engine)); Candle Crypt, Dread Throne and Starsilk failed it
(their loop ran on the title and under ads, Dread's and Starsilk's on the pause screen too).

**With an engine adapter** (`@gp/core/engines/<name>`) it is one line, called on every change of screen. The adapter
listens to `host.onPause` / `onResume` itself and redraws the still frame after a pause:

```ts
const sync = () => eng.setRunning(state === 'play');   // the gp init --engine skeleton's sync()
function showTitle() { state = 'title'; host.gameplay(false); sync(); … }
function play()      { state = 'play';  host.gameplay(true);  sync(); … }
```

A still screen that needs a new frame (the title's scene, a resize while standing still): `eng.renderOnce()`. Never
start the engine's own loop (`app.ticker`, `renderer.setAnimationLoop`, `game.loop.wake()`).

**With a loop of your own** (Canvas 2D): request the next frame only while `running()`, and call `wake()` after every
change of screen, a resize and in `onResume` (the `gp init` skeleton):

```ts
const running = () => state === 'play' && !host.paused;
const frame = (ts: number) => {
  raf = 0;
  const dt = last ? Math.min(0.05, (ts - last) / 1000) : 0;
  last = ts;
  update(dt);
  draw();
  if (running() && !raf) raf = requestAnimationFrame(frame);    // not unconditionally (that loop never dies), and not when update() already woke it (two loops)
};
function wake() {                                       // start the loop in play (no time jump), else draw the screen once
  if (!running()) draw();
  else if (!raf) { last = 0; raf = requestAnimationFrame(frame); }
}
host.onPause((reason) => { if (reason !== 'ad') pauseGame(); });   // the frame after it sees host.paused and stops
host.onResume(() => wake());
window.addEventListener('resize', () => { resize(); wake(); });
```

**A title that animates on purpose** (Echoflies' fireflies) says so: `host.qa({ play, end, …, idleAnimation: true })`.
Then `gp qa` reports the title's frames as INFO instead of failing; the pause screen and an ad must still stand still, so
the animation's loop stops under `host.paused` too.

`MoveInput` (from `@gp/core`) is steering for "move the hero" games: WASD/arrows plus a floating joystick for touch and mouse drag
(a shooter's aim, look and fire on top of it: `TwinStick` / `LookInput`, [Shooters and action](#shooters-and-action-aim-enemies-bosses-the-announcer-threat-cues)).
It reads `e.code` (physical keys), so WASD is ZQSD on a French keyboard by itself; do the same for your own keys. Pause on
**P** (and on a hidden tab), not Esc: on CrazyGames Esc leaves fullscreen and is a restricted key, so a quality reviewer
flags it even as a second pause key (Almus Gate).

`rewardedButton({ host, placement, label, onReward })` (from `@gp/core`) is the "watch an ad for a reward" button done right:
null when no ad can be offered, disabled while the ad runs, "No ad available right now" when it fails, `data-gp-rewarded`
for QA, no ad-like class names (ad blockers hide `.ad-btn`). Put a "No thanks" next to it at least as big, in the same font.

`rewardedOffer({ host, placement, label, onReward, onSkip, stillOpen?, layout? })` is the offer **with** its own "No thanks"
(`data-gp="skip"`, the same class and size; put `offer.el` on the screen; null when no ad can be offered — then go on as
if skipped). A tap on the offer disables both until the ad is over; a failed ad says so and gives "No thanks" back; and
exactly one of `onReward` / `onSkip` runs, once — a reward that arrives after the skip, `offer.close()`, the offer leaving
the page or `stillOpen()` turning false is ignored (Frankengun's softlock: "No thanks" under a loading revive ad ended the
run, the late reward revived it over the results). Prefer it for a revive or a ×2. Whatever you use, **the host makes
`#ui` and the canvas `inert` while an ad is pending** (midgame or rewarded, from the request to the end: nothing under it
can be tapped or focused); a screen you put elsewhere goes under the same rule with `host.inertDuringAds(el)`.

**Meta progression is the game's own design:** pick the shape for the genre and name it in `concept.progression` —
unlocks that change how you play (`Roster`), tiers that open the next set (`Tiers`), gains with a cost (`PactTree`), run
choices (`RunChoices`), or, for idle and launch-distance games only, a level shop (`UpgradeShop` + `mountUpgradeShop`).
All from `@gp/core`, pure and save-safe; your bot exports `balance()` and `gp balance` / `gp qa` check the curve against
the channel's targets. How to choose, the blocks, the targets and the screen rules: [upgrades.md](upgrades.md).

**A story:** the story engine (`StoryRunner`, `validateStory` …) and the dialogue window — when a story pays off and how
to use them: [story.md](story.md).

**Levels with stars** (five of games 6–11 wrote this by hand): `loadStars(save.stars, LEVELS.length)` makes the
saved array safe, `levelOpen(stars, i)` opens a level once the one before has a star, `firstOpenLevel(stars)` is where Play
goes, `recordStars(stars, i, got)` keeps the best and returns the `gained` stars to pay a bonus for (never `got`: a replay
pays twice), `starsFromPar(moves, par, { two: 3 })` (lower is better) and `starsFromShare(hpLeft, 0.9, 0.5)` (higher is
better) turn a result into 1–3. A puzzle's moves: `UndoHistory` (current state, move count, undo that never passes the
start). All from `@gp/core`, pure (in a Node tool such as a level generator: `@gp/core/levels`, `@gp/core/undo`). Prove every level in your own test: solvable, and at its par (both puzzle games did,
with their own solver: a BFS over moves for a slide puzzle, a memoized search over a fixed queue for Hang the Moon).

**Small things that cost games time:** emoji in DOM text need `font-family: EMOJI_FONT` (from `@gp/core`) first, or a
headless or older browser draws them black and white; glyphs like ⏸ render differently everywhere — use inline SVG icons;
don't save at the start of a run (QA says so when Play again changes the save, and a reward written there pays twice after
a reload mid-run); for a script you run with `node` (a level generator in `tools/`), import with `.ts` extensions and keep
to what Node's type stripping takes — no parameter properties (`constructor(private x)`), enums or namespaces; a balance
report from a passing test needs `process.stdout.write` (Vitest hides `console.log` there).

## Music and ambience

`@gp/core/sound` — no sound files, a few KB; every sound through `host.audio.out`, so the portal's mute and the ad pause
silence it, and `gp qa`'s sound checks pass. The showcase `docs/examples/art` uses all of it. Effects: `createSfx` (files
and recipes, below); a score played beat by beat: `ScoreSequencer` (below); what QA listens for: the sound section (below).

```ts
import { bossTheme, createAmbience, createMixer, createMusic, createSfx, musicTheme, PLACES, sfxRecipe } from '@gp/core/sound';

const mixer = createMixer(host, save.volumes);            // { music, ambient, sfx } 0–1, the sliders' values
const music = createMusic(mixer, {
  menu: musicTheme('calm', 11),                           // moods: calm bright cozy mystery dark tense heroic spooky
  forest: musicTheme('bright', 23, { root: 'G4' }),       // the seed is the tune: another seed, another melody
  boss: bossTheme(musicTheme('bright', 23), 61),          // the same key, driving
});
const ambience = createAmbience(mixer, { seed: 7 });
music.play('forest');                                     // crossfades from what played; play(null) fades out
ambience.set(PLACES.forest);                              // or { wind: 0.4, birds: 0.6 }; left-out layers fade to 0
const sfx = createSfx(mixer, { hit: sfxRecipe('hit') });  // your effects on the sfx bus (its slider): below
mixer.duck(0.45, 0.6);                                    // music and ambience dip under a big sound
music.hold(true); ambience.hold(true);                    // the pause screen: fade out, nothing scheduled, timers stopped
mixer.setVolume('music', v); save.volumes = mixer.volumes(); host.save(save);  // a settings slider
```

- **Your own tune.** A theme is a loop of 8 bars composed from its seed (pad, bass, arpeggio, melody, drums, echo); any
  field of `musicTheme(mood, seed, over)` can change (`bpm`, `root`, `scale`, `chords`, `arp`, `melody`, `drums`,
  `pad`, `lead`, `bright`, `echo`). A theme per place and a boss theme per act is what players notice (Firefly Rush 2.1.0).
- **What it keeps for you**: nothing starts while the portal mutes, the host is paused or the context isn't running;
  the timers stop when nothing plays, on hold and on the host's pause; a suspended context never bursts the missed notes;
  every note starts and ends on an envelope (no clicks); asked to play before the first tap, it starts on that tap —
  at full level, with the volume set before it too, also when the tap comes while the host is paused (a browser test
  pins it: Frankengun's own music stayed near-silent until the first pause, its fade-in scheduled before there was a
  context — schedule a fade from `ctx.currentTime` once `mixer.ctx()` exists, not before).
- **Places**: `PLACES` — forest, meadow, night, cave, storm, rain, river, beach, camp, station, crypt. Beds (wind, rain,
  water, surf, fire, hum) move by themselves (gusts, swells); events (birds, crickets, drips, crackle, thunder) come at
  random moments from the ambience's seed.

### Adaptive music: scenes, stages, intensity (`createSceneMusic`)

An action game's score follows the fight (Frankengun's arena show wrote it by hand in music.ts): one loop whose layers
fade in and out with the **scene** and an **intensity**, a key and a tempo per **stage**, and stings on top. It is on
the mixer's music bus like `createMusic` — the music slider, `mixer.duck()`, the host's pause, the portal's mute and the
ad pause govern it — and costs ≈ 3 KB gzipped.

```ts
import { createMixer, createSceneMusic, SCENES, STAGES } from '@gp/core/sound';

const score = createSceneMusic(mixer);        // SCENES: menu explore fight boss enrage shop; STAGES: 4 keys (A, D, E, C)
score.scene('menu');                          // on the title — even before the first tap: it waits for the context
score.scene('fight', stage);                  // the scene, the stage's key and tempo change at the next bar
score.intensity(enemiesNear / 12);            // 0–1: the layers given as [low, high] follow within ½ s
score.scene('enrage', stage); score.alarm();  // the boss's last phase: a siren layer; a klaxon sting over the music
score.roar(0.8); score.riser();               // a crowd's roar (a kill streak, a boss down); a sweep into a big moment
score.hold(true);                             // the pause screen; score.scene(null) fades out and stops
```

- **Scenes** are data: `{ bpm, hard?, layers: { drums, bass, sub, arp, lead, pad, perc, siren } }`, a layer's level a
  number or `[at intensity 0, at intensity 1]`. Change a field of `SCENES` or pass your own (`createSceneMusic(mixer,
  { scenes, stages, chords, seed })`); `score.levels()` reads the layers now (a debug overlay, a test).
- **Stages** are keys: `{ root: 'D3', scale?: 'minor', bpm?: +2 }` — a stage change is heard, the same tune in a new key.
- **The trap it keeps you out of:** music asked for before the player's first tap (the title's) starts at its full level
  once the context runs. Frankengun's own score stayed near-silent until the first pause; a browser test
  (`packages/core/test-browser/music-start.test.ts`) measures the output of both `createSceneMusic` and `createMusic`
  started that way.

### Effects: `createSfx`, files and recipes

Reviewers never heard our games and called them flat: an action with no sound, the same hit a hundred times, effects lost
under the music. `createSfx` plays the effects on the mixer's sfx bus (its slider; the portal's mute, the ad pause and a
hidden tab silence it) — bundled files or **recipes**, sounds made of code, so a game without files still sounds good.
Frankengun's audio.ts, Candle Crypt's and Swarm Smash's sound.ts wrote this by hand; the recipes and materials are theirs
and Velvet's.

```ts
import { createSfx, sfxRecipe } from '@gp/core/sound';
import lineUrl from './voice/intro.mp3?inline';           // a file: a data: URL in the one-file upload

const sfx = createSfx(mixer, {
  hit: sfxRecipe('hit'),                                 // coin hit shot deny click whoosh pop thud boom
  ping: sfxRecipe('glass', { hz: 1568 }),                // struck materials: marble wood glass metal bell porcelain
  boom: { src: sfxRecipe('boom'), vol: 0.8, gap: 0.08 }, // per sound: vol, vary (±pitch), gap (throttle), max (voices)
  jingle: { src: sfxRecipe('bell'), vary: 0 },           // a tune stays in tune
  intro: lineUrl,
});
playButton.onclick = () => { void sfx.load(); play(); }; // decode the files on the first tap (recipes need nothing)
sfx.play('hit', { rate: 1 + combo * 0.06 });             // a pitch that climbs with the combo; ±6 % by itself
sfx.listener({ x: hero.x, y: hero.y, range: 600 });      // where the player hears from (a 3D game: yaw, its heading)
sfx.play('boom', { at: barrel });                        // quieter far away, panned to its side
sfx.say('intro');                                        // a voice line: one at a time, the music ducks under it
sfx.hush();                                              // the pause screen, a scene change: everything fades out
```

- **What it keeps for you**: nothing starts while the mixer is silent; the same sound within its `gap` (40 ms) plays
  once (twelve pellets are one hit) and at most `max` (6) of it ring at once, 32 of all; a soft limiter and a ceiling at
  0.9 on its output, so a burst of booms never clips (a browser test stacks 32 of them); every voice is unhooked once it
  rang out; the host's pause hushes what is ringing.
- **Variation is the point**: every play is ±6 % in pitch by default — `gp qa` warns when one sound repeats exactly six
  times in a row. A combo, a chain or a count-up climbs: `rate: PITCH.step ** n`, or the ScoreSequencer's `pitch`.
- **Files**: `?inline` imports (Vite inlines them into the one-file upload) or URLs; decoding happens once the
  context exists. Keep them short and few: every KB counts in the CrazyGames budget (`gp build --target crazygames`).
- **Size**: the whole of `createSfx` with every recipe and material ≈ 3.7 KB gzipped (10 KB minified); the ScoreSequencer ≈ 2.5 KB.

### Juice: the score beat by beat (`ScoreSequencer`)

Velvet's scoring (sim.ts's Step trace, main.ts's playback) made a block: the game's rules compute a score as a **trace of
steps**; the sequencer plays it — one beat per step at its place on screen, quicker as the chain goes on (0.28 s → 0.09 s),
a count-up, a pitch a semitone higher each beat, a roll past 12 steps, a final land sized by how far the total beat the
target — and the player sees the result before committing and can tap to fast-forward. Deckbuilder hands, combos,
match cascades, a results screen's tally, offline earnings: any score that should feel earned.

```ts
import { previewScore, ScoreSequencer, drawScoreLabels, type ScoreStep } from '@gp/core';

const steps: ScoreStep[] = hand.map((c, i) => ({ kind: 'card', at: i, add: c.chips, mult: c.mult, times: c.x }));
hud.text = `= ${previewScore(steps, { mult: 0 }).total}`;   // before the player plays it: "how much will I get"
const seq = new ScoreSequencer({
  host,                                                     // the host's pause stops it
  where: (at) => cardXY(at as number),                      // a key → a point (or give `at` as a point)
  onStep: ({ pitch, point, fast }) => { if (!fast) { sfx.play('tick', { rate: pitch }); fx.sparks(point); } },
  onRoll: ({ k }) => sfx.play('roll', { vol: k }),          // a long chain's beats run together
  onLand: ({ total, big }) => { sfx.play('thud', { vol: 0.5 + big / 2 }); camera.addTrauma(big); },
  onDone: (total) => (run.score += total),
});
seq.play(steps, { base: { mult: 0 }, target: round.target });
// each frame: seq.update(dt); draw seq.shown (the count-up), drawScoreLabels(g, seq.labels())
canvas.onpointerdown = () => seq.playing && seq.skip();     // to the result at once; a second tap ends the land
```

- The score is `add × mult × times` (base `{ add: 0, mult: 1, times: 1 }`); a game whose rules differ passes its own
  `total`, the count-up still follows the steps. `tallySteps()` gives the running score of every beat (a test can pin it).
- **Labels** (`seq.labels()`): one per number of a step (+chips, +mult, ×mult — or the step's own `label`), placed clear
  of the ones still showing (up first, then to the sides, inside `labels.bounds`), popping in and fading out;
  `drawScoreLabels` draws them outlined, coloured by kind, or draw them yourself (DOM, a sprite font).
- The timing is data: `BEAT`, `ROLL`, `PITCH`, `LAND_HOLD`, `landSize(total, target)`; unit tests pin it and a browser
  test plays it on requestAnimationFrame. The showcase `docs/examples/art` scores tap chains with it.

### What `gp qa` hears: the sound section

QA plays a run at 1280×720 — Play, the demo bot if there is one, its own taps on the game and key presses every 0.6–0.9 s,
the results — with a real-time meter in front of the page's speakers (`@gp/qa/audio-tap` `audioMeter`) and the probe's
log of every sound started. It reports, warnings first in `qa/report.md` (numbers in `qa/sound.json`):

- **fails** only when the game makes no sound at all, or the mix clips (more than 10 samples at ≥ 0.99);
- **warns** when under half of the game's taps or keys (whichever it answers more) get an effect within 150 ms, under
  half of the button clicks, or of a kind of the game's moments (`host.happytime`, `host.fail`, the round's end); when the
  effects are more than 3 LU under the music and ambience or 18 LU over them (LUFS-ish: BS.1770's K-weighting and gating,
  the mixer's buses metered apart — a game without `createMixer` gets the mix only); a silence of 5 s or more in play; one
  sound exactly alike (pitch, length, level) six times in a row; a mix in play louder than −12 or quieter than −34 LUFS.

A steering game's moves may stay quiet (Germ Dodge warns, and says why in its report); its hits, pickups and buttons not.

### What `gp qa` feels: the feel section

QA plays the game on the virtual clock `gp video` films on (`@gp/cli/clock`: nothing moves until QA advances it, one
frame at a time), at 800×450 (the portal's small frame), and reads the game's canvas after every frame — so a busy machine changes nothing. The
numbers are in `qa/feel.json`; everything but the flashes is a warning ([the research](../research/game-design-2026-10.md#12-game-feel-and-juice-concrete-numbers)):

| Measure | How | Warns (fails) when |
|---|---|---|
| **Input → response** | QA's own taps on the game and key presses in play (no demo bot): the frames until the canvas changes around the tap (around `host.qa({ hero })` for a key, else the whole frame) or the DOM changes. Each input comes after a control trial with no input, so the game's own animation doesn't count as an answer; a kind of input the game answers no more often than the control is "not used" | under 90 % of the inputs answered within 100 ms (Nielsen's 0.1 s). A headless browser can't see a display's or a touch panel's own delay |
| **Feedback channels** | for each of the game's moments in the demo — `host.happytime()`, `host.twist()`, `host.roundEnd()`, a `host.emit('score', { score })` — the channels that answer within 150 ms: visual (canvas or DOM), sound (an effect started), motion (the whole frame moves: shake, kick), haptic (`navigator.vibrate`) | a scoring moment (`happytime`, `score`) gets under 2 (feedback is one channel; juice is several at once) |
| **Flashes** | the canvas's relative luminance every frame at 60 Hz over 10–20 s of the demo | (**fails**) more than 3 flashes in any second — a flash is a pair of opposite changes of ≥ 10 % with the darker side under 0.8 (WCAG 2.3.1) |
| **Screen changes** | the composed page (DOM and canvas) just before Play and the results and two frames after; the canvas around `host.screen()` | the luminance moves 40 % or more within two frames: a cut to white or black — crossfade 250–400 ms |
| **Reduced motion** | the same seeded demo with `prefers-reduced-motion: reduce` emulated: frames whose motion reverses (shake) or whose luminance jumps 10 % in two frames | as many jolts as without it (at least half, and 3 or more). `@gp/art`'s `Camera` (no shake, no kick) and `Fx.flash` (none) do it by themselves; a hand-made shake reads `matchMedia('(prefers-reduced-motion: reduce)')` |
| **60 vs 144 Hz** | the same seeded run (the demo bot, if any) for 10 s at 60 and at 144 frames a second, then `host.qa({ digest })` — a string or a number of your state (the score, positions rounded) — or the last `score` event's value | the two differ (numbers by more than 2 %): the simulation follows the frame rate. Step it in fixed steps (`while (acc >= DT) update(DT)`); no digest and no score: said, not compared |
| **Variety over time** | `host.seen(kind, id)`, called when the player meets a new enemy, item, card, place or boss (only the first sighting of an id counts; a no-op in production): the demo plays run after run on the virtual clock up to 10 minutes of play (as far as ≈ 40 s of the machine's time takes it) and counts the distinct ids at 2, 5 and 10 minutes, and the gaps between rewards (`happytime`, `twist`) | nothing new for over 90 s of play; the median gap between rewards over 60 s. No `host.seen`: said |

```ts
host.seen('enemy', 'bat');            // the first bat; again later: nothing
host.qa({ play, end, demo, digest: () => `${score}:${Math.round(hero.x)}` });
```

### The first minute

CrazyGames: *"Games should land new users in gameplay immediately. If this is not feasible given the game specifics, a
maximum of 1 click is allowed."* Basic Launch, 2026-10-04: only 20–68 % of the players of our six launched games played a
minute (CrazyGames wants 80 %+), and conversion scored 1/5 in every per-device score outside the .io game. So, in short
([first-minute.md](first-minute.md) has it all):

- **A new player lands in play**: `if (host.firstVisit) play({ lesson: true }); else showTitle();` — a first run that
  can't be lost in its first seconds, the title after it. No prologue, modal or controls card before the first action.
- **One hint at a time**, ≤ 6 words, when the action is first needed and gone when it's done: `hints()`.
- **The results screen launches the next run**: `mountResults()` — the big button is Play again / Next, Menu small, the
  next goal and how far along it is.
- **`host.screen(name)` on every screen and `host.fail()` when the player fails**: the host's first-minute funnel
  (`'funnel'` events: boot → loaded → title → firstInput → gameplayStart → play15/30/60 → firstFail → firstResults → exit).
- **A run that survives a reload** (`host.saveRun / loadRun / clearRun`) and **"welcome back" on a new day**
  (`recordVisit`, `welcomeBack()`).

`gp qa`'s **first-minute** section opens fresh pages on a phone and, on `crazygames`, fails: more than 1 click from
loading to gameplay, no run within 8 s of Play, a loss within 12 s for a player who touches nothing, more than 25 words
before the first action, touch controls (`data-gp-touch`, `host.qa({ touchControls })`) invisible at the first frame of
play, a naive touch bot that can't keep playing for 60 s or loses (a fail or a results screen) in them, a start louder
than −10 dBFS, and under 30 fps at 4× CPU slowdown in the first 30 s. Numbers in `qa/first-minute.json`, screenshots `first-minute-0s/1s/5s.png`; the review brief has a section
where the reviewer plays the first minute as a stranger (`gp lessons`: first-minute).

### Platform screens in the game's look: `screenTheme`, drawn icons, game type

CrazyGames' reviewers read stock screens, system fonts and glyph icons as "a web app" (Frankengun's review: the results
in the platform's slate grey and yellow beside a neon arena; Velvet Ledger in Georgia and system-ui). Three blocks fix it:

```ts
import { screenTheme } from '@gp/core';
import { icon } from '@gp/core/icons';
import { useFont } from '@gp/art/type';
import { NUNITO_BLACK } from '@gp/art/type/nunito-black';
import { DELA_GOTHIC_ONE } from '@gp/art/type/dela-gothic-one';

const font = useFont(NUNITO_BLACK);         // a bundled face (Latin + Cyrillic), its CSS family with the fallbacks
const display = useFont(DELA_GOTHIC_ONE);   // headings, big numbers, the main button
screenTheme({ bg: '#1b1036', panel: 'rgba(255,255,255,0.08)', ink: '#f4ecff', muted: '#b3a6d6', accent: '#ff4fd8',
  accentInk: '#ffffff', accent2: '#5ff6ff', track: 'rgba(255,255,255,0.16)', radius: 14, font, display });
playButton.prepend(icon('play', { style: 'solid' }));   // drawn, the button's colour, never ▶
```

- **`screenTheme(theme, root?)`** sets `--gp-theme-*` on `<html>` (or `root`), and every platform screen falls back to
  it: the results (`mountResults`), welcome back, the language sheet, the daily streak, the dialogue, the season track,
  the level shop, the sites map and the hint. The fields: `bg` (a screen's panel), `panel` (a card on it), `ink`,
  `muted`, `accent` and `accentInk` (the one primary colour and its words), `accent2` (a season's big tiers, "Best
  value", "you are here"), `track` (a bar's empty part, outlines, a disabled button), `edge` (a dialogue's border and
  speaker plate), `backdrop` (the veil behind a modal), `radius`, `font`, `display`. A screen's own variables
  (`#gp-results { --gp-results-accent: … }`, the tables in [first-minute.md](first-minute.md) and
  [upgrades.md](upgrades.md)) still win, for one-off changes; a game that sets nothing looks as before. It returns a
  function that takes the theme back; `screenThemeCss(theme, selector)` is the same as a CSS rule for your style sheet.
- **`@gp/core/icons`**: ~75 drawn icons on one 24-unit grid (`ICON_NAMES`: close, check, lock, chevrons and arrows,
  play, pause, settings, sound, music, star, coin, gem, heart, shield, bolt, gift, chest, trophy, crown, clock,
  calendar, refresh, share, info, plus/minus, cart, map pin, globe, video …). `icon(name, { size, color, style, glow })`
  is an inline `<svg>` (`'1.2em'` and `currentColor` by default: it sits in a line of text and takes its colour),
  `iconSvg()` its markup, `iconUrl()` a data URL for CSS or an `<img>`, `drawIcon(ctx, name, x, y, size, o)` the same
  picture on the canvas. Styles: `line`, `duo` (a light fill under the lines), `solid` (filled, details in `detail`). A
  game's own icon is an `IconDef` (path strings on the same grid) and goes through the same functions. The platform's
  screens draw their own marks with it (the coin, the lock, the check, the chevrons, close, zoom, the level pips,
  rewardedButton's play mark), and a screen's icon option takes a drawn icon: `currency: { icon: icon('gem', { style:
  'solid', color: '#7fe0ff' }), name: 'gems' }` in the shop and the sites map, `icon:` of `mountStreakCard`, an item's
  or a reward's `icon` (an element, a function that makes one, an image URL — or text, the old way).
- **Game type**: a face from `@gp/art/type` for every text a player reads, never the system's — see
  [art.md → Game type](art.md#game-type-gparttype).

### Run seeds: see, copy, share, type back

A roguelite's run is its seed. `@gp/core/seed` gives every game the same seeds (Жаслан, 2026-10-10: «системы сидов»
in Candle Crypt and Swarm Smash, «добавь модуль сидов в платформу»):

```ts
import { seededRng } from '@gp/core';
import { copySeed, dailyRunSeed, newRunSeed, runSeedOf, seedField, seedLabel } from '@gp/core/seed';

let run = newRunSeed();                          // { code: 'K7M2-QX9P', seed, custom: false }
const r = seededRng(run.seed);                   // the map, the loot, the waves — never Math.random
host.saveRun({ ...state, seed: run.code });      // a resumed run keeps its seed: runSeedOf(saved.seed)
hud.text = seedLabel(run, host.t);               // «Seed K7M2-QX9P» on pause and results; «· custom» for a typed one
copyButton.onclick = () => copySeed(run);        // host.t('gp.seed.copy') / 'gp.seed.copied'
menu.append(seedField({ t: host.t, onSeed: (s) => start(s) }));  // type a code or any word; empty: a fresh seed
const daily = dailyRunSeed(game.id);             // the same run for every player today
```

- **One seed, one run.** Everything the run generates draws from `seededRng(run.seed)` (or sub-seeds from it); the
  player's input and the frame time never feed the generator, so two players on one seed see the same floors, waves
  and offers. Keep effects that don't change play (particles, shake) on `Math.random`.
- **Show it**: the seed on the pause and results screens, with Copy; a field for a seed on the title or the new-run
  screen (never on the first visit: a new player lands in play — first-minute.md).
- **Typed seeds are custom**: a game decides what they count for — the usual rule: unlocks yes, the daily and a
  leaderboard no (the seed could be picked to be easy). The daily run is `dailyRunSeed(id)`, not custom.
- Codes are 8 characters of Crockford base32 (no I, L, O, U); typing is forgiving (case, spaces, O→0, I/L→1), and any
  other text is hashed, so «CANDLE» is a seed too.
- The field's button is `data-gp="seed-play"`, so the title's own Play stays the one `[data-gp=play]` that `gp qa` taps.
  Copy is a button like any other: 48 px at least. A game that switches its language itself passes its own `t`
  (`seedLabel(run, myT)`, `seedField({ t: myT, … })`) with the six `gp.seed*` keys in its strings.

## Shooters and action: aim, enemies, bosses, the announcer, threat cues

Our shooters each wrote these by hand (Frankengun, game22; Candle Crypt, game9; Swarm Smash, game20), and their reviews
found bugs in every hand-made version. All pure or host-aware, all deterministic where the sim uses them; a first-person
game on three has more in [three-fps.md](three-fps.md).

| Block | From | What it does for you |
|---|---|---|
| `TwinStick` (top-down) / `LookInput` (first person) | `@gp/core` | aim, look and fire on top of `MoveInput`; the touch layer drawn from the first frame (`data-gp-touch`), the host's pause obeyed |
| `aimAssist` | `@gp/core` (`@gp/core/aim`: `forward`, `yawPitch`) | the target nearest the crosshair in a cone and a range, with a line of sight; a soft pull, `onTarget` for auto-fire |
| `steer` | `@gp/core/steer` (or `steer.*` from `@gp/core`) | seek, flee, arrive, pursuit with a lead, separation, circle avoidance, golden-angle slots round the player, flank points — forces the sim integrates |
| `BossPatterns` | `@gp/core` (`@gp/core/boss`: `fan`, `ring`, `spiral`, `aimed`, `wave`, `intercept`) | phases at health thresholds, telegraphed attacks from a deck that never plays one twice in a row, bullet patterns as spawn lists |
| `callouts` | `@gp/core` | an announcer queue: ranks, cooldowns, stale lines dropped, a streak keeps its latest step, held for the voice, the music ducked |
| `HitArcs`, `edgeArrow`, `DamageNumbers` | `@gp/art/hud` | where a hit came from, an arrow to a boss off the screen, pooled damage numbers that merge — canvas or DOM |
| `QualityLadder`, `eng.setRenderScale` | `@gp/core`, the adapters | quality levels for a WebGL game ([Engines → Quality levels](#quality-levels-and-pictures-of-the-engines-scenes)) |

**Input.** `TwinStick` (Candle Crypt's twin-stick): WASD and the left stick move; the mouse aims from the hero (`aim(heroOnScreen)`,
the left button fires, `mouseRight` and `wheel` name buttons of yours — the right button is read through `e.buttons`, so
holding fire never blocks it, and the wheel presses once per gesture); the arrow keys fire in their direction (they don't
move); on touch an aim stick under the right thumb — a drag aims and fires, no drag and `aim()` is null: aim for the
player with `aimAssist`. `LookInput` (Frankengun's): the mouse looks under pointer lock; a click on the arena takes the
lock and fires; the "Click to aim" prompt (`gp.look.click` in 13 languages) goes on `pointerlockchange`; losing the lock
in play calls `onPause(…, 'lock')`; **P** pauses (never Esc); a refused lock (an iframe without the permission) falls
back to drag-to-look ("Drag to look"); on touch, drag anywhere on the right to look (×1.6), and Fire is a look surface too.

```ts
import { LookInput, aimAssist } from '@gp/core';
import { forward, yawPitch } from '@gp/core/aim';

const input = new LookInput({ host, canvas, parent: ui, buttons: [
  { id: 'fire', label: host.t('gp.fire'), aims: true, icon: FIRE_SVG },
  { id: 'dash', label: t('dash'), keys: ['Space', 'ShiftLeft'], icon: DASH_SVG },
] });
input.onPause(() => pauseGame());               // P, or the lock lost in play (Esc, alt-tab, the portal)
input.setActive(state === 'play');              // on every screen change; Resume's own click: input.lock(), then play()
// each step:
const m = input.move();                          // y < 0 forward
if (input.touch) {
  const a = aimAssist(eye, forward(input.yaw, input.pitch), live, { cone: 0.16, range: 30, strength: 0.6, maxTurn: 0.012, visible: (e) => lineFree(eye, e) });
  if (a) ({ yaw: input.yaw, pitch: input.pitch } = yawPitch(a.dir));
  if (a?.onTarget && input.autoFire) fire = true;
}
if (input.fire) shoot();
if (input.take('dash')) dash();
```

- Every held key, button, stick and drag is let go on `setActive(false)`, on a hidden tab, an ad or a lost context (the
  host's pause; an ad also gets the cursor back: the lock is exited, so the game pauses on it), and nothing is read while
  the host is paused. `onFirstInput(fn)` says when play really began (hold the wave clock until it on a desktop first run).
- The touch layer goes into `parent` with `z-index: 2`; give your HUD buttons (pause, ability) a higher one. The buttons
  are at least `host.minTouchPx` (72 px for the first, 60 for the others); the layer shows only on a touch device (it
  comes up when a touch reaches the arena of a laptop).
- `MoveInput` itself takes `{ keys: 'wasd' }` (the arrows stay yours), `accept(e)` (which presses start its stick) and
  `host` (its pause) now.

**Enemies.** `@gp/core/steer` is Frankengun's yuka steering without the library (62 KB raw → ≈ 1 KB gzipped): forces you
add, weighted, and integrate in the sim, so a seeded run replays and the bot plays it in Node. A force is a change of
velocity per second (as yuka's, mass 1): the weight is how sharply it answers — avoidance first and heaviest.

```ts
import { add, avoid, around, arrive, flank, integrate, pursue, separation, slot } from '@gp/core/steer';
const f = { x: 0, y: 0 };
add(f, avoid(e, pillars, 2.5, speed), 3);                          // round the cover
add(f, separation(e, near, 1.6), 1.6);                              // apart from each other
if (e.kind === 'melee') add(f, arrive(e, around(player, slot(e.id, reach)), speed, 2.2), 4);   // a slot of its own: a pack surrounds
else if (e.kind === 'gunner') add(f, arrive(e, flank(player, player.facing, range, e.id & 1 ? 1 : -1), speed, 2.2), 4);
else add(f, pursue(e, player, speed, 0.6));                         // where the player is going
integrate(e, f, dt, speed, speed * 6);                              // e.vx/vy; the sim moves and collides e
```

**Bosses.** `BossPatterns` keeps the boss's state between steps; the game reads it and does what each attack means:

```ts
import { BossPatterns } from '@gp/core';
import { aimAt, aimed, fan, ring, spiral } from '@gp/core/boss';
const boss = new BossPatterns({
  attacks: { fan: { telegraph: 0.6, duration: 2.4 }, ring: { telegraph: 0.8, duration: 2.4 }, spiral: { telegraph: 0.5, duration: 3.4 }, charge: { telegraph: 0.55, duration: 1.2, recover: 1 } },
  phases: [{ at: 1, attacks: ['fan', 'ring', 'spiral'] }, { at: 0.5, attacks: ['fan', 'ring', 'spiral', 'charge'], speed: 1.3, opener: 'charge' }],
  rng: run.rng,
});
for (const ev of boss.step(dt, b.hp / b.maxHp)) {
  if (ev.type === 'telegraph') run.emit({ type: 'warn', attack: ev.attack, sec: ev.sec });   // the wind-up the player reads
  if (ev.type === 'phase') { clearEnemyBullets(run); run.emit({ type: 'roar' }); }
}
const sp = boss.speed;
if (boss.is('fan') && boss.every(0.55 / sp)) spawn(fan(b, aimAt(b, player), 7, 1.1, 115 * sp));
if (boss.is('ring') && boss.every(0.7 / sp)) spawn(ring(b, 16, 85 * sp, (boss.t * 3) % 1));
if (boss.is('spiral') && boss.every(0.09)) spawn(spiral(b, shot++, { arms: 4, turn: 0.33, speed: 95 }));
if (boss.is('charge', 'telegraph')) b.flash = 1;
```

- The deck plays every attack of the phase (by `weight`) before any comes round again, and never the same one twice in a
  row — across rounds too; a phase threshold cuts the attack, rests `phaseRest` (0.8 s), plays the phase's `opener`, and
  several thresholds crossed by one big hit report every phase in order. `history` lists what it drew (a test).
- The emitters return spawn lists (`{ x, y, angle, speed, vx, vy, delay }`); `aimed` and `intercept` lead a moving
  target (where a bullet at that speed meets it; `lead: 0.5` halfway), `wave` sweeps an arc over a period.

**The announcer.** `callouts({ lines, play, show, hide, cut, mixer })` — Frankengun's host: rank 1 the arena's news (cuts
a combo call off the air), 2 rewards, 3 big combos, 4 small talk (only into silence); `streak` groups lines of one count
(a waiting double gives way to the triple), `every` is a line's cooldown, a line waiting over 3 s is dropped, a line holds
for its voice's length + 0.2 s (≥ 1.1 s) and the music ducks under it. `update(dt)` from the game's frame: the pause
holds the queue.

**Threat cues** (`@gp/art/hud`): `new HitArcs()` and `arcs.hit(hitAngle(eye, yaw, attacker))` (`screenAngle(dx, dy)`
top-down) — arcs refresh instead of stacking; `edgeArrow(screenOf(ndc, w, h), w, h, { inset: { bottom: 120 } })` for a
boss the camera lost (behind you: mirrored, never "on screen"); `new DamageNumbers({ merge: { radius: 40, window: 0.35 },
only: 'big', bigAt: 20 })` with `add(x, y, dmg, 'crit', { key: enemy.id, world: enemy })` and
`update(dt, (e) => project(e))` — hits on one target or in one area add up into one number that pops again. Each has
`draw(ctx, …)` for a Canvas 2D HUD and `mount(parent)` for a DOM one (pooled elements, no layout per frame).

## How `gp qa` runs: sections, `--failed`, the reviewer meanwhile

The code suite runs in **sections** (one per screen size, ads, screens, languages, the production build, the balance bot…),
up to 3 at once, each on its own pages (`--jobs <n>` or `GP_QA_JOBS`; `--headed` runs one). The **frame rate** at each
size and the **twist** (timed in seconds) run last, alone on the machine, so other pages never take their frames. The
report lists the sections in the same order at any `--jobs`, and its first line says how long the run took and which
sections were slowest (`qa-results.json`: `timing`). Your bot's `balance()` runs from the start in a worker thread, beside
the browser sections: a slow balance is often the whole run's length (Dread Throne: 193 s of 218), so keep it fast.
Measured: `docs/examples/code` 94 → 53 s, art ≈ 100 → 57 s, Dread Throne 5 min 55 s → 3 min 42 s, every check the same.

- **Nothing else in a browser during a full run:** `gp covers`, `gp video` or another agent's Playwright beside `gp qa`
  take the frames its quiet end measures (Secret House Tycoon's fps and twist sections failed so) — run them before or
  after.
- **Edit while it runs, if you must:** QA's dev server is frozen (no file watcher, no HMR): a file you write during the
  run neither reloads the page under test nor reaches QA's own reloads — the run tests the game as it was when it
  started (Frankengun's sections failed on a reload mid-run). `gp covers` and `gp video` serve it the same way; `gp dev`
  still reloads on every change.
- **`gp qa <id> --failed`** re-runs only the sections with a failed check in the last run and keeps the others'
  results and screenshots (the production build re-runs with the canvas-UI frames it reads). It takes the last run's
  size: after `--quick` it re-runs the failed sections quick (one screen size), after a full run full. For iterating on
  a fix: it refuses after a failure outside the sections and when the platform checkout changed. Its report says so,
  and so does the `gp review` brief: **the gate is a full run, all green**.
- **The reviewer doesn't wait for QA:** once `gp qa --quick` is green, start the second agent on `gp review` in the
  background while the full run goes; it plays the game first and runs `gp review` again for the screenshots when the run
  ends (the brief survives a QA run: qa/ keeps it).

## What `gp qa` needs from you

The platform can't know your mechanics, so QA works through three conventions:

- **A range slider counts as a control**: `gp qa` holds it to the touch size (48 px tall on phones) like a button
  (Secret House Tycoon's before/after slider).
- **`data-gp="play"` on the Play button.** The production build is tested without any test hooks: QA taps this.
  Also `data-gp="again"` on "Play again" and `data-gp="resume"` on your pause screen's Resume, if you have them.
  A first visit that lands in play has no Play to tap: QA plays a returning player (`host.firstVisit` false) on every
  section but the first minute, and the production run taps the middle of the screen when no Play is shown.
- **`data-gp-touch` on on-screen touch controls** (a stick, jump and fire buttons in the DOM), or `host.qa({ touchControls:
  () => rects })` for ones drawn on the canvas: the first minute checks they are visible at the first frame of play on a
  phone (Spin Brawl's stick appeared only after the first touch), and play checks no HUD text lies on them.
- **`host.qa({ hero: () => rect })`**: where the player's object is in play (CSS px; null on a menu). On `crazygames` it
  must be at least 6 % of the screen's short side at every size — desktop decides ([the look](#what-gp-qa-checks-the-look)).
  A 3D game on three needs nothing more for its camera check (the adapter's `eng.camera`); a camera of its own:
  `host.qa({ camera: () => camera })`.
- **`host.qa({ play, end, lose })` in your start():** `play` starts a run as the Play button does (QA also calls it after
  the results, and after a hidden tab when no Resume is on screen: if a run is going — paused, in a scene — go on with it);
  `end` ends it straight to the results; `lose` (optional) loses the way a player does, so your rewarded "Continue"
  appears (QA waits up to 3 s for it: a death animation first is fine). In a level puzzle: `end` finishes the level the
  solver's way, `lose` makes a move that fails.
- **Right after Play, QA holds D for 0.4 s** (a steering test). In a puzzle that can be a whole move: if it solves the
  first level (Nimbus Drift's did, with one swipe right), QA says so and starts again — better make level 1 need another move.
- **`data-gp-rewarded="<placement>"` on rewarded buttons.** QA taps one and checks the ad plays and the reward arrives;
  then, with every ad failing (`?ads=fail`), that the button says so, the player can go on and no more offers appear;
  that no offer is on the active gameplay screen; that "No thanks" is as big as the offer; and that under the pending ad
  "No thanks" is out of reach and, clicked anyway, the late reward doesn't revive the run it ended.
- **Ad blockers and the portal frames** (production run): no class or id names like `ad`, `ads`, `advert`; DOM text ≥ 12 px
  in 821×462 and 800×450 at devicePixelRatio 1; no fullscreen button; no app-store or other-portal links.
- **Scrolling is allowed** in a panel (a long list on a phone): QA scrolls every clipped button into view and checks
  it is then on screen, at least the touch size and not covered by anything. It scrolls only what a player can scroll —
  a panel with `overflow: auto` or `scroll` — never the page or an `overflow: hidden` box, so the panel's on-screen part
  must reach every button (a panel running off the bottom of the screen needs bottom padding). The page itself must not scroll.
- **`data-gp="shop"` on the progression button** (with a `grant` in `host.qa` that saves): QA opens the screen, checks
  the buttons, buys, undoes and goes back — `data-gp="shop-screen"`, `"shop-balance"`, `"shop-undo"`, `"shop-back"`,
  `data-gp-buy` ([upgrades.md → the screen](upgrades.md#5-the-screen-rules-for-any-progression-screen)). `mountUpgradeShop`
  marks its own parts; the `gp init` skeleton's targets screen shows them on a screen of the game's own.
- **The twist and its explanation** (`concept.twist`): the demo bot (`host.qa({ demo })`) plays a fresh run and
  `host.twist(event)` must fire within `within` s; with `concept.twist.explained`, the words that explain it must be on
  screen before or when it fires, for 2 s + 50 ms a character (DOM text, or a `canvasUi` rect with `text`). A hint that
  waits for the player's tap must make the demo bot wait as long (`readingSec(text)` from `@gp/core`)
  ([uniqueness.md → the explanation](uniqueness.md#the-explanation)).
- **Languages** (game.yaml `languages`): `gp qa` opens the longest language with `?lang=<code>` at a phone and the
  portal's smallest frame, checks the first screen and every declared screen (text that fits, buttons, no English left)
  and the picker (`languagePicker()`: `data-gp="lang"`, `data-gp-lang`) — a switch at once, the choice kept after a
  reload — then lets your demo bot play 15 s in it at each size, sampling every visible text each second: a hint or a
  toast that leaves the frame or covers a button fails ([i18n.md](i18n.md#what-the-platform-checks)). Give long texts a
  `max-width` and let them wrap.
- **`export function balance()`** from `bot.ts`: QA's `balance` section reads your balance bot's numbers against the
  channel's targets (a warning when there is none; [upgrades.md → the balance report](upgrades.md#3-the-balance-report)).
  `balanceModel()` adds the model's checks; with `balance: { anchor }` in game.yaml its first-session checks (the first
  reward within a minute, a new thing every 3 min of the first 10, big rewards apart, the session-end hook) fail like
  the others, without it they warn ([upgrades.md → Start from time, then the anchor](upgrades.md#start-from-time-then-the-anchor)).

### What `gp qa` checks: the look

CrazyGames rejected our games for "the overall quality" while `gp qa` was green; the reviewers' and our second agents'
findings that can be measured are checks now. Each failing line names its code (`gp explain <CODE>`):

| Check | Where | Fails (warns) when | Code |
|---|---|---|---|
| **Desktop decides**: no empty or flat screen | on `crazygames`: the first screen, play, the results and the shop at 1280×720; the first screen, play and the results at 821×462 (devicePixelRatio 1, the `desktop-821x462` section); every declared screen at both | 70 % or more of the screenshot one colour, 80 % or more featureless (8×8-pixel blocks with no visible variation, at 320 px wide), or one featureless area of 40 % of the screen. A play frame is measured again 2 s later before it fails (an act card). **The later play frame** too: 1280×720, 15 s into a demo run (`desktop-1280x720-5-play-later.png`, section `desktop-look`), unless the run has ended. Calibrated on our QA screenshots: approved games stay under 60 % / 68 % / 23 %; Germ Dodge's bare dish was 83–100 % one colour. Other channels: a hint | `E_QA_DESKTOP_EMPTY` |
| **The hero is no speck** (`host.qa({ hero })`: a rect or a function returning one, CSS px) | in play at every size (and 821×462) | on `crazygames` its size, √(w·h), under 6 % of the short side (43 px at 1280×720); undeclared: said, not checked (an action game on `crazygames` must declare it: `E_QA_HERO_MISSING`) | `E_QA_HERO_SMALL` |
| **No glyphs as icons** | every screen QA reaches (the first screen, play, the results, the shop) and every declared screen, once (the first size) | emoji or a symbol from Arrows, Misc Technical, Box Drawing, Block Elements, Geometric Shapes, Misc Symbols, Dingbats (◆ ✓ ✕ ◎ ● ▌ ▶ ◀ ⚡ ★ 🔒) in visible text, `::before`/`::after` content or `canvasUi` text — named with the element and the screen. © ® ™ are marks, not icons, and an arrow between two words or numbers is running text ("×1.0 → ×1.1"; "← Back" still counts: [the calibration](../research/qa-calibration-2026-10.md)). Inside the platform's screens (`#gp-*`) too: their own marks are drawn, so a glyph there is text the game handed them (a currency or reward icon) — pass a drawn icon from `@gp/core/icons` | `E_QA_GLYPH_ICON` |
| **A first minute without a loss** | the first-minute touch bot: a fresh first visit at 360×800, random taps and drags for 60 s on `crazygames` (30 s elsewhere) | a `host.fail()` or a `host.roundEnd()` in that time (until 2026-10-19 a loss counted as a run event, a pass); a level won (`host.roundEnd({ won: true })`) is no loss — make the first run safe (a shield, sleeping threats, a first level longer than a minute: `host.firstVisit`) | `E_QA_FIRST_RUN_LOST` |
| **The HUD doesn't overlap** | play at every size (and the longest language's 15 s of play, every second) | a text over another text (line boxes overlapping by more than a third of a line), or over a button or a `data-gp-touch` control under a quarter of the screen (more than 2 px), still there 400 ms later; under a dialog covering the screen nothing counts | `E_QA_HUD_OVERLAP` |
| **The title's choices** | the title after the first run (the first size) | (a warning) more than 6 visible controls and canvas buttons | `W_TITLE_CHOICES` |
| **No magnified bitmaps** | every size: the probe watches every `drawImage` on a page canvas | a bitmap drawn over 2× its own pixels per device pixel (the transform × the destination size × the page's scale of the canvas); (a warning) over 1.25×; named with the screen and the image size. Crisp pixel art (`imageSmoothingEnabled = false`), sources under 16 px a side and soft sources (a glow, a blur: no step between neighbouring pixels over 24 of 255) are not counted. Measured at QA's devicePixelRatio (1): a phone at 3 is 3× worse | `E_QA_BITMAP_MAGNIFIED` |
| **A face of the game's own** | the first screen, play, the results and the canvas text drawn (the first size) | (a warning) more than half the visible characters render in a generic or system face (system-ui, sans-serif, Georgia, Arial, DejaVu…) rather than a font the page loaded (a loaded `FontFace` in `document.fonts`) | `W_SYSTEM_FONT` |
| **A 3D camera wide enough in portrait** | engine `three`, play at 360×800: the adapter's `eng.camera` (QA finds it), or `host.qa({ camera: () => camera })` | its horizontal field of view under 60° (three's `fov` is vertical: 75° sees ≈ 38° across a portrait phone — [three-fps.md § 3](three-fps.md#3-the-camera-field-of-view-and-the-thing-in-hand)); other engines: not checked | `E_QA_PORTRAIT_FOV` |
| **The title shows its key art** | the first screen at 1280×720 (section `desktop-look`) and a declared screen named `title`, `menu` or `home` there | with detail on the canvas behind (a shot with the DOM hidden), the share of the screen under opaque DOM layers over the canvas (a background colour or gradient, or a backdrop blur, at 60 % opacity or more; an image background is art): over 45 % fails on `crazygames`; (a warning) over 20 % — Garage 1.0.0's centred title panel is 23 %, the blind review's most named fault. A flat canvas behind: not judged | `E_QA_TITLE_COVERED` |
| **Play text is readable at 1280×720** | play 2 s and 15 s into a demo run (section `desktop-look`): the DOM's visible text and the canvas text (the probe records each `fillText`/`strokeText`: font size, position and colour through the transform) | a HUD number (mostly digits) under 12 px fails on `crazygames`; (a warning) any text under 14 px, or under 3:1 (WCAG) against the pixels behind it in the screenshot — an outline (a text stroke, a hard shadow, a `strokeText` at the same place) counts | `E_QA_PLAY_TEXT` |
| **A collection is more than placeholders** | every declared screen on a fresh save (the first size): the biggest group of 6 or more alike items | (a warning) more than half the items are placeholders: a "???" text, images with near-zero colour variance (silhouettes, flat slots), or an empty slot | `W_META_SILHOUETTES` |
| **The hero is declared** (action games) | on `crazygames`, a game of genre action or shooting (`money.genre`, or a sub-genre whose parent is one: roguelite, survivors, platformer) or tagged Arcade | no `host.qa({ hero })`: one failure at the first size (elsewhere a note) | `E_QA_HERO_MISSING` |
| **The scope** | the declared screens | (a warning) more than 15 (`host.qa({ screens })`): our rejected games declared 16–20, the approved 10–12; `gp review`'s brief then asks for a `[blocking]` prototype-risk finding unless every screen is finished | `W_SCOPE_SCREENS` |

### What `gp qa` checks underneath: the engine

From the engine lab (six engines, the same game): `gp qa` passed every variant while each had an engine-level bug that
only a probe saw. QA now installs that probe (`@gp/qa/probe`: it counts requestAnimationFrame callbacks and canvas
draws, follows every AudioContext and audio connection, records the canvas contexts) and checks:

| Check | Fails when | The fix |
|---|---|---|
| **Still screens stand still**: the first screen, the pause screen, a midgame ad — over 1.5 s, at most 3 rAF callbacks or canvas frames | a loop or an engine ticker runs there (Pixi's ran 60 times a second on the menus) | [Still screens](#still-screens): an adapter's `eng.setRunning(state === 'play')`, or your own loop requesting frames only while a run is on and `!host.paused` and drawing a still screen once (on a change of screen, a resize and in `onResume`: the `gp init` skeleton's `wake()`). A title that animates on purpose: `host.qa({ …, idleAnimation: true })` — then only the title may run, never the pause screen or an ad |
| **One AudioContext, the host's**; every sound through `host.audio.out`; none audible while the portal mute is on (it is on from the start of a run to its results); every context silent under an ad | an engine made its own context (Kaplay), a sound goes to `ctx.destination`, an `<audio>` element plays, an engine resumes the context under an ad (Phaser) | hand the engine `host.audio.ctx` and connect its output to `host.audio.out`; decode files into `host.audio.ctx` |
| **A lost WebGL context** (only when `#game` has WebGL): `WEBGL_lose_context` during play → `host.pauseReasons` has `'context'` and gameplay stops; after `restoreContext()` the canvas (DOM hidden) is drawn again, or the "reload" screen shows | the engine draws on a canvas of its own (the host can't see its loss), or nothing is drawn after the restore | draw on the `canvas` that `start()` gets; `preventDefault()` on the loss, re-create the GPU state on the restore and redraw in `onResume` — or let it go: the host shows "reload" |
| **No WebGL2, no WebGL** (production run, Chromium `--disable-webgl2` / `--disable-webgl`): the upload plays, or says it can't run | a blank page, a Play that does nothing, an unhandled rejection | a fallback (WebGL1, Canvas 2D), or throw from `start()` (let the engine's error reach it): the player shows "*Title* can't run in this browser" (`data-gp="cant-run"`). A message of your own passes if it says "can't run" / "not supported" |
| **Tab leaves the canvas**: after a click on the canvas, Tab reaches a DOM button (first screen, results) | the canvas has a `tabIndex` and swallows Tab (Kaplay) | `canvas.removeAttribute('tabindex')` after the engine starts |
| **Frame rate** ≥ 50 fps in play, told from the machine | under 50 fps on an idle machine, or on a busy one while the page's main thread needs > 10 ms of CPU per frame | less work per frame. Under parallel QA load the check measures the load, re-runs once and judges the main thread's CPU time per frame (the lab saw false failures at 31–49 fps) |

**UI drawn on the canvas.** QA reads the DOM, so a score or a button drawn by the engine is invisible to it — unless you
declare it. `canvasUi` returns what is on the canvas right now, in CSS px of the viewport (`[]` on screens with none):

```ts
host.qa({
  play, end,
  canvasUi: () => state === 'play'
    ? [{ name: 'score', kind: 'text', x: 12, y: 12, w: 140, h: 22, fontPx: 18 }, { name: 'pause', kind: 'button', x: w - 64, y: 8, w: 56, h: 56 }]
    : [],
});
```

QA checks each rect like a DOM control: on screen at the three sizes; a `button` at least `host.minTouchPx` with no DOM
element on top of it (that one would take the taps); `text` at least 12 px (`fontPx`, or the rect's height) at 821×462
and 800×450, devicePixelRatio 1. In the production run (no test hooks there) it looks at the same rects in the
screenshot: each must have something drawn in it.

**Every screen.** QA reaches five screens by itself: the first screen, play, the results, the shop and the pause screen.
A journal, a character sheet, a map, the settings, a boss card — it never sees them, and that is where text runs off a
phone (Candle Crypt wrote 148 lines, `tools/responsive.mjs`, to check its 13 screens on 12 sizes). Declare them:

```ts
host.qa({
  play, end,
  screens: {
    journal: () => showJournal(),
    sheet: () => { startRun(); showSheet(); },          // a screen that needs a run starts one
    results: () => { startRun(); run.score = 1234; finish(); },   // filled the way a long session fills it
  },
});
```

Each function opens its screen now, from whatever screen the previous one left (QA calls them in order). At every size —
360×800, 800×360 and 1280×720 (only 360×800 with `--quick`), and on a portal 821×462 and 800×450 at devicePixelRatio 1 —
QA opens each, waits 350 ms, saves `screen-<name>-<size>.png` and checks: **buttons on screen and ≥ the touch size**
(scrolling panels scrolled, as on the first screen); **text inside its box** (not cut off by `overflow: hidden`, an
ellipsis, or spilling out of its button) **and on screen**; **one screen: no page and no panel to scroll** (below); the
`canvasUi` it declares; in the portal frames **text ≥ 12 px**; at 1280×720 **Tab after a click on the canvas** (then the
page reloads before the next screen: the click may have started a run). A screen that throws fails alone. Time: about
0.5 s a screen with `--quick`, 3 s a screen in the full run (Candle Crypt's 16: 8 s and 49 s). Declaring nothing is fine —
QA says so — but every screen a player can open belongs there. The `gp init` skeleton declares its five.
In `gp dev` (and E2E builds) the driver is reachable from the page: `window.__gp.host.qaDriver.screens.journal()` in
the console, or `page.evaluate(() => __gp.host.qaDriver.screens.sheet())` in your own Playwright script, opens that
screen for a screenshot (also `.play()`, `.end()`, `.demo?.()`); release builds have no `window.__gp`.

**One screen, nothing to scroll** (Жаслан, 2026-10-10: «бесит что игры не помещаются в весь экран и приходится туда-сюда
двигать по оси y … всё помещается в один экран, кроме сообщений, уведомлений и т. д. по необходимости»). Every screen
fits the window at every size: no page scroll and no panel whose content runs past its box (`overflow: auto` with more
inside than room fails as «a panel scrolls»). When there is more than fits, use pages or tabs (◀ 1/3 ▶), fewer or
smaller rows, two columns: `mountUpgradeShop` pages itself. Only text that may run long may scroll — a message, a
notification, a log, a story line: mark its box `data-gp-scroll="<why>"`, and the report lists it as allowed (the
platform's dialogue box and language list are marked). The same holds for the play screen: the field takes most of
the window, the HUD and side panels stay compact.

Your own mechanics need your own tests: put `*.test.ts` next to your code (Vitest runs `games/*/**/*.test.ts` with `npm test`).

**Have your code reviewed by a second agent** before you call it done. Every review so far found real bugs that neither
`gp qa` nor the game's tests caught: 2 to 16 per game (buttons live while an ad loaded, rewards paid twice after a reload, a
finished run revived by a late ad, a boss deleted by a revive, timers that outlived Pause, input working under an ad).
Give the reviewer a fuzz: Dread Throne's played 400 random seeds and found a wave that never ended. After the review, a
**playtester agent** that plays every screen with real clicks at the three sizes finds what code review doesn't (Dread
Throne's: 14 bugs — texts off screen, taps doing two things, a chapter over a lost stage).

## Store graphics

The look comes first: covers that are a flat screenshot with a title don't get clicked (our games: 0.6–1.2 % on
CrazyGames, the target is 2–4 %). The rules, the hook and the check: [covers.md](covers.md).

- **Covers:** `gp covers <game>` renders the channel's sizes (CrazyGames: 1920×1080, 800×1200, 800×800) into
  `games/<id>/store/`. Give the game a **cover hook**: `host.qa({ cover })` with the key art in layers — `scene` (the world
  and the action moment at `layout.focus`), `hero` (the hero big, filling `layout.hero`, with an expression), `front`
  (sparks) — drawn with the game's own `@gp/art` look; the platform letters the title (the only text), outlines the hero,
  lights its rim, adds the vignette, fits all of it to each size, and **scores every cover at 200 px wide** (title size
  and contrast, hero vs. background, colourfulness, value contrast, near-black and flat area, clutter, borders) into
  `store/cover-check.md`, with `store/cover-preview-200.png` — the covers as players see them. A score under 70 is a
  warning with the fix for each weak measure. `--variants 3` adds two other compositions for an A/B test; `--check`
  scores what is in `store/`. The `gp init` skeleton has a hook (art.ts `cover()`); Forge Night's is in
  [scene.ts](../examples/art/scene.ts). Without a hook, `?cover` still works the old way (the game draws its frame and
  sets `document.body.dataset.cover = 'ready'`), and the check scores the picture only.
- **Preview videos (mandatory on CrazyGames):** `gp video <game>` films 15 s in both orientations (1920×1080 with a laptop's
  layout, 1080×1920 with a phone's) on a virtual clock — requestAnimationFrame, timers, `performance.now` and CSS
  animations move only frame by frame, so it is smooth 30 fps on any machine — and opens on your `?cover` frame. What it
  films: `games/<id>/video.mjs` if you write one (a default export that gets `{ page, orientation, step, sec, tap, until,
  visible, demo, filmed }`: tap Play, fast-forward off camera with `step(n, { film: false })` — the title too: frames that
  show the Play button (`data-gp="play"`) are reported, the portal wants no "Play" text —, film the moments that show what
  makes the game different; `v.demo()` starts your `host.qa({ demo })` bot); otherwise it taps Play and calls the bot.
  With a cover hook, the video opens on the composed cover.
  Needs ffmpeg with libx264: found in PATH or automatically after `pip install imageio-ffmpeg`; `FFMPEG=…` overrides.
  **Look at the video through its contact sheet:** every run also writes `store/<video>-frames.png` — a frame a second
  and the end card, each with its time, the cover, the end card and any frame that shows the Play button marked —
  composed in the browser from the recorder's own frames, no ffmpeg. `gp video <game> --frames` writes only the sheets:
  a container without ffmpeg or H.264 can still check what the video shows (then make the videos where ffmpeg is).
  **A gameplay video with sound, for the owner (not the portal):** `gp video <game> --sound` records the game's own sound
  on the same virtual clock — the AudioContext plays exactly one frame of audio per filmed frame, so the soundtrack stays
  in step with the picture (an AAC track; silent while the game has its sound suspended: a pause, an ad) — and
  `--max <seconds>` (1–600) films longer; your `video.mjs` reads the length as `v.length`. Such a video is written as
  `store/gameplay-<size>.mp4` (with its contact sheet) and never replaces the previews: the portal wants 15–20 s and no
  sound (`--max 15`…`20` without `--sound` is still a preview). Frankengun mixed its soundtrack by hand from a sound log
  before this.
  Your own tool (a benchmark, a test that your simulation follows the clock) can run the game on the same clock:
  `virtualClock` and `advanceClock(page, ms)` from `@gp/cli/clock` (packages/cli/src/clock.ts) with Playwright.
- **Listing text:** `listing: { description, controls, orientation, tags }` in game.yaml.
- **The quality review first:** `gp review <game>` → `qa/review-brief.md` for a second agent, who plays the game and writes
  `games/<id>/quality.md`; `gp submission` refuses it while it has a `[blocking]` finding
  ([publishing-crazygames.md → The quality review](publishing-crazygames.md#the-quality-review-gp-review)).
- **Everything for the form:** `gp submission <game>` → `games/<id>/submission/`: `index.html`, the three covers, the two
  videos, `listing.md` (and `quality.md` for the owner) — each checked (sizes, H.264, 15–20 s, no sound, ≤ 50 MB). Send these files to the owner at the end.

## Design for money

Where the game earns is part of its architecture: decide it with the concept, write it in `money` (game.yaml), and check it
with `gp forecast` before building and after every big change. The model, its numbers and their confidence:
[game-design.md → Design for money](game-design.md#design-for-money). In the code:

| Decide | In the code | Checked by |
|---|---|---|
| **Natural breaks** every 2–3 min: the ends of levels, runs, days, wave sets, a new floor or biome after a boss — the only places a midgame ad can go | `await host.adBreak()` in the handler of "Next level" / "Play again" (or as the player takes the stairs to the next floor), before the next run or floor starts; never on Menu, Shop, Settings (`gp qa` taps the results screen's Menu and fails a break there: Candle Crypt, Spin Brawl and Brew & Banter had one), never on a timer or during play. The channel paces it (CrazyGames requires the first after the tutorial or 3–5 min, then ≤ 1 per 3 min; the platform: never in the first 3 min, the first at the 3rd break or after 5 min, whichever comes first, then one per 3 min) | `money.session.breaks`, `gp forecast` (the midgame count through the channel's policy), `gp qa` (ads rules) |
| **Rewarded offers** that give what the player wants: a revive (once a session), ×2 on the results, a hint from a "Stuck?" panel that pauses play, a trial of a locked hero | `rewardedOffer({ host, placement, label, onReward, onSkip })` on a break screen (the offer and its same-size "No thanks"; `rewardedButton` for the offer alone); the `placement` is the id in `money.rewarded` | `gp qa` (tap-only, the "No thanks" size, `[ads fail]`), `gp forecast` reads the placements from the code |
| **A session of 10+ min** carried by a meta that outlasts it | the progression ([upgrades.md](upgrades.md)), the balance bot's `balance()` | `gp balance`, `gp forecast` (the meta's length from `balance()`) |
| **A reason to return tomorrow** | a daily challenge: `dayKey()` (UTC: one challenge for every player at once; `{ local: true }` turns over at the player's midnight — for a gift), `seededRng(daySeed(key, '<id>'))` makes the day's level, `loadDaily` / `recordDaily` / `dailyDone` keep the cleared days (trimmed, with a count that goes on) — a calendar, never a loss-framed streak; a daily reward week (`dailyStreak` + `mountStreakCard`) and a daily order (`dailyOrder`) — [first-minute.md](first-minute.md#7-a-daily-reward-week-and-a-daily-order-dailystreak-dailyorder); idle games: offline earnings (`offlineEarnings`); a goal left at 80%; the next chapter | `money.returns` |
| **Desktop and mobile** (≈ 70% of CrazyGames' plays are phones) | touch controls, portrait and landscape, Canvas 2D; the upload under 20 MB (the mobile homepage) | `gp qa` (sizes, touch), `gp build --target crazygames` (size) |
| **A fast load:** a tappable Play in under 3 s on a slow phone (players decide in the first 10 s) | Canvas 2D or a light engine; no unused imports; big assets after Play | `gp build --target crazygames` ([the budget](#the-size-and-load-budget)), `gp forecast` (the load time in P(Full Launch)) |
| **No ads in Basic Launch** (7–21 days): the game works and is fun without them | read `host.rewardedAvailable` each time an offer's screen opens (`rewardedButton` returns null) — nothing may depend on an ad | `gp qa` `[ads fail]` |

`gp qa` prints the forecast line at the end (never a failure); `gp submission` puts forecast.md into the folder for the
owner and refuses a code game without a `money` section. When the portal answers, record the outcome in
publisher/results.yaml (forecast.md has the lines).

## A game in its own repository

Games live in their own repositories next to a clone of `game_platform`. Start one with **`gp init`** — the platform's
template, the composite of what all the games so far converged on ([game-anatomy.md](game-anatomy.md)):

```sh
cd game_platform
npm run gp -- init ../my-game-repo --id my-game --title "My Game"
cd ../my-game-repo && scripts/setup.sh          # remembers where the platform is (.gp-platform; GP_PLATFORM=… to choose),
                                                # links its node_modules for tsc and vitest
scripts/gp.sh validate                          # refuses the TODO concept until you write it (docs/concept.md)
scripts/gp.sh qa --quick                        # gp.sh <command> [game] [flags]: every gp command, on this repository's game
scripts/gp.sh explain money                     # commands about the platform take no game (explain, catalog, doctor, forecast --idea)
```

With several games in one repository (`games/a`, `games/b`), name the game after the command: `scripts/gp.sh qa b --quick`
(an id from `games/`, a folder or a game.yaml); with one, it is that one.

```
work/
  game_platform/        # this repository
  my-game-repo/
    scripts/setup.sh, scripts/gp.sh   # connect to the platform; gp.sh <command> runs gp on this game
    docs/concept.md                   # the originality search, written before building
    games/my-game/                    # game.yaml, main.ts, sim.ts, data.ts, bot.ts, sim.test.ts, video.mjs, REPORT.md
      package.json, node_modules/     # optional: the game's own npm dependencies (an engine) — below
```

- The skeleton's PLACEHOLDER markers keep it honest: `gp validate` warns (`W_PLACEHOLDER`) and `gp submission` refuses
  while any is left.
- The skeleton already does what every portal game must (screens, host lifecycle, a rewarded Continue with an equal
  "No thanks", no ad on Menu, the `?cover` frame, a demo bot for `gp video`, a pure fixed-step simulation, a balance
  bot with its `balance()` report and tests) around a **PLACEHOLDER** mechanic and a **PLACEHOLDER** progression (coins
  unlock targets that play differently: a `Roster` on a small screen of its own). Replace both, keep the shape: the
  progression is the one your genre needs ([upgrades.md](upgrades.md#1-pick-a-shape)), named in `concept.progression`.
  It passes `gp qa` once the concept is written.
- **Don't copy scripts or tools from another game's repository.** They are older, hand-made versions of `gp build
  --target crazygames`, `gp covers`, `gp video` and `gp submission` (one broke on a font import when copied).
- **A game may import `@gp/*`, its own files and its own npm dependencies** ([below](#its-own-npm-dependencies-an-engine-a-physics-library)).
  `@gp/*` resolve to the platform's sources without links when `gp` builds. Types and unit tests run from the game
  repository: `./node_modules/.bin/tsc -p tsconfig.json`, `./node_modules/.bin/vitest run games/`.
- `gp build --target crazygames` needs no `--release`: that flag only switches AdMob to real ad IDs (Google Play).
  It writes `upload/index.html`, one file with everything inlined (import fonts and images from code, e.g.
  `./fonts/x.woff2?inline`; a file fetched by path can't be inlined and fails the build).
- A game with a server may keep the platform as a git submodule instead (Spin Brawl did); run `git submodule update --init` first.
- **The checks come from the platform checkout you run.** `scripts/setup.sh` clones it once and prints its commit;
  `qa/report.md` names it (`Platform: game_platform <hash> (<date>)`). Pull it (`git -C ../game_platform pull --ff-only`)
  before the full `gp qa` and before an update of a finished game: Echoflies' 116/116 came from a checkout older than the
  still-screen checks that landed that morning (the current platform fails its title loop), and Candle Crypt's update 1.2
  went out without the `money` section that `gp validate` had asked for since the day before.
- **An update raises the version** in game.yaml `version: { name, code }` (`name` the visible 1.2.0, `code` +1 for every
  Google Play upload; `gp explain version`), a `## 1.2.0` heading in CHANGELOG.md and `games/<id>/patch-notes.md` (what
  changed for players, English, ≤ 2000 characters: `gp submission` refuses an update without it). Petri Defense 2.0.0
  had to find the field in the schema.
- **A replaced game leaves the repository with `scripts/gp.sh retire <id>`** (a `git rm -r` of its folder: the history keeps
  it; it refuses uncommitted changes). An agent's `rm -r` is stopped by the permission check (Shade Clash, Kite Royale).
- **A renamed game gets an id with its new name: `scripts/gp.sh rename <old-id> <new-id>`** — the folder (`git mv`), game.yaml's
  `id`, and `saveKey` pinned to the old default so players keep their saves (appId never changes). Then the upload, the
  submission zip and the preview link carry the current name, and the next `gp preview` leaves a redirect at the old
  link. It prints what else still names the old id. The owner was sent `echoflies-submission.zip` for Firefly Rush and
  reviewers got `petri-panic/` for Scrap Royale.
- **Scratch scripts** (your Playwright probes, a helper agent's) go in the session's scratchpad, outside the repository,
  or in `scratch/` (ignored by the template's `.gitignore`, like `/_*.mjs` at the root) — never loose at the root, where
  `git add -A` commits them (Echoflies), and never a shared folder another agent may "clean up" (Candle Crypt lost its
  `.scratch/` with a running server's log that way).

### Its own npm dependencies (an engine, a physics library)

- Put them in **`games/<id>/package.json`** (pin exact versions) and install them into `games/<id>/node_modules`:
  `scripts/setup.sh` runs `npm ci` (or `npm install` without a lock file) in every game folder that has one; commit
  `package.json` and `package-lock.json`, not `node_modules`. Vite and tsc resolve a bare import from the importing file,
  so the game's own `node_modules` wins. **Never `npm install` at the repository's root**: its `node_modules` is a link to
  the platform's, and you would install into the platform. (A root `package.json` is read too, but the game folder is the place.)
- `gp validate` warns when a declared dependency isn't installed (`W_DEPS_MISSING`). The platform reads the list with
  `gameDependencies()` (packages/cli/src/deps.ts); `gp validate` checks an engine's pinned version against it ([Engines](#engines)).
- Vite's dependency pre-bundle of the game goes into **`games/<id>/node_modules/.vite`**, the game's own, not the
  platform's shared `packages/player/node_modules/.vite`.
- **WebAssembly packages** (wasm-bindgen output that imports its `.wasm` as a module, e.g. `@dimforge/rapier2d`) work
  in `gp dev`, `gp qa`, `gp covers` and `gp video`: the platform excludes them from Vite's pre-bundling (detected from a
  `.wasm` import in the package's JS, or a known list), which would otherwise split the glue from its module ("Cannot read
  properties of undefined (reading 'memory')"). The one-file upload inlines the `.wasm` as base64: no extra request, but
  ≈ 1.3 MB gzipped for Rapier — about 8 s to a tappable Play on a slow phone. WebAssembly is then required: the game
  needs its own "can't run" path without it. A `-compat` build (the `.wasm` embedded in the JS, `await init()`) works too —
  and is what the physics block takes: Rapier through `@gp/physics` ([Physics](#physics)) uses `@dimforge/rapier2d-compat`.
- **Which browsers a web build is for:** the first versions with top-level await — Chrome and Edge 89, Firefox 89,
  Safari 15 (`BUILD_TARGETS` in packages/cli/src/vite-plugin.ts). A `.wasm` imported as a module compiles to a
  top-level `await`, which no transform can lower; CrazyGames asks for Chrome and Edge and only disables a game on Safari
  that doesn't work there; below the floor are only Safari 14 / iOS 14 and Chrome 88 or older (2020). Android builds stay at es2020 (the WebView; no top-level await there).
- **Libraries beyond an engine** (game AI, camera moves, dev panels): use them as pure functions the sim calls, or
  in the view only, stepped from the engine's frame — never with their own loop, clock or random numbers, so the sim
  stays seeded for the balance bot. How Frankengun used yuka (steering forces), camera-controls (the title's camera) and
  stats-gl (dev only): [three-fps.md → The libraries](three-fps.md#12-the-libraries-it-used-and-how-each-obeys-the-platform).
- A web upload carries no Capacitor or AdMob code: for a web channel the platform's native plugins are replaced at build
  time (packages/player/src/web-native.ts; `import.meta.env.GP_PLATFORM` is `'web'`). Android builds keep them.

### The size and load budget

`gp build --target crazygames` (and every `gp qa` and `gp submission`, which build the upload) measures what it wrote:

```
✓ my-game: games/my-game/upload/index.html — one file, 592 KB (limit 20 MB)
  Size: 592 KB raw, 174 KB gzipped — budget 400 KB gzipped (the channel's), hard limit 20 MB raw
  By source (minified, from the sourcemap): pixi.js 496 KB (84%) · @gp/core 15 KB (3%) · game 11 KB (2%) · …
  Load: ≈ 1.7 s to a tappable Play on a slow phone (1.6 Mbps, 150 ms RTT, 4× CPU: download 1.0 s + start 0.7 s) — an estimate; warns above 3 s
```

- **By source:** the bytes of the minified JS per npm package, per `@gp/*` package and the game's own code, from a
  sourcemap the build writes next to the bundle (not into the upload) — what to cut first.
- **Load:** an estimate from the bytes, not a browser run: download (RTT + gzipped bytes at 1.6 Mbps), then parse,
  compile and boot at 4× CPU (160 ms + 0.88 ms per KB of code + 0.32 ms per KB of embedded base64 data). Fitted to the
  engine lab's Chromium measurements on that profile (canvas, three, phaser, rapier within 2 %, pixi −11 %); an engine
  that does heavy work at start (Kaplay: 1.9 s measured, 0.9 s estimated) is slower than its bytes say. Not in it: the
  portal SDK's own load, a real phone's GPU. The model: `packages/spec/src/budget.ts`.
- **Budget:** CrazyGames warns above **400 KB gzipped** or **3 s**, and fails above **20 MB** raw (the hard limit; nothing
  is written). A game that needs more on purpose (physics, 3D) raises the size budget in game.yaml —
  `budget: { gzipKB: 1500 }` — and the load warning with it (to the load of a budget-sized upload); never above 20 MB
  (`E_BUDGET`). Over the budget is a warning, never a refusal: the forecast pays for it instead.
- **The numbers** go to `games/<id>/upload/size.json` (not part of the upload: the form takes `index.html`).
  `gp forecast` reads the gzipped size and the load time: above 3 s P(Full Launch) drops, in full from 10 s
  ([Design for money](game-design.md#design-for-money)); `gp submission` shows them in its table.
- The engine lab's uploads for one small arcade game: Canvas 2D 16 KB gzipped (0.4 s), Kaplay 83 KB (1.9 s),
  three.js 151 KB (1.6 s), Pixi 174 KB (1.9 s), Phaser 362 KB (3.3 s), Rapier 1,267 KB (7.9 s).

## Engines

Most portal games need no engine: Canvas 2D is the default and the fastest to load. When the game needs many sprites,
real physics, particles or 3D, draw with Pixi, Phaser or three **through its adapter** (`@gp/core/engines/<name>`). The
adapter does what the engine lab's agents did by hand for every engine, and what its reviews found 4–8 bugs in per
variant that `gp qa` passed ([the lab](https://github.com/QmaCyber/game12/blob/claude/keen-bohr-8prbe8/docs/engine-lab.md)).

### Pick by genre and budget

The same small arcade game in each engine (the lab; Chromium, the phone rows CPU-throttled, WebGL on SwiftShader):

| Engine (version) | Upload gzipped | Play tappable on a slow phone | 200 sprites, phone 4× | 2,000 sprites, desktop / phone 4× | Without WebGL2 / without WebGL | Pick it for |
|---|---|---|---|---|---|---|
| **Canvas 2D** (`canvas`, the default) | 16 KB | 0.4 s | 47 fps | 59 / 9 fps | plays / plays | most games: arcade, puzzle, idle, cards — anything up to a few hundred things on screen; drawn well with `@gp/art` ([art.md](art.md)) |
| **PixiJS 8** (`pixi`) | 174 KB | 1.9 s | 34 fps | 58 / 19 fps | plays / plays (its Canvas renderer) | many sprites (a swarm, bullets, a big board): its ParticleContainer is the only path that stayed usable at 2,000 |
| **Phaser 4** (`phaser`) | 362 KB | 3.3 s | 27 fps | 35 / 8 fps | plays / plays | a game that needs Phaser's Arcade physics, particles, tweens and scenes — not "an engine to be safe" |
| **three.js r186** (`three`) | 151 KB | 1.6 s | 22 fps | 16 / 7 fps | **can't run** / **can't run** | 3D where 3D is the point; flat 2D in three costs devices for nothing |
| Kaplay 3001 | 83 KB | 1.9 s | 14 fps | 16 / 2 fps | plays / can't run | **not supported** (`E_ENGINE_UNSUPPORTED`): its loop can't be stopped, its own AudioContext, no context-loss recovery, the slowest |
| Rapier 2D (physics) | 1,267 KB | 7.9 s | — | — | needs WebAssembly | physics as the mechanic (piles, stacking): not an engine — beside Canvas 2D or Pixi, through the physics block ([Physics](#physics): `engine.physics`, `gp init --physics`) |

- **Size decides more than the frame rate.** CrazyGames' budget is 400 KB gzipped and 3 s to a tappable Play
  ([The size and load budget](#the-size-and-load-budget)); Phaser is near both, Rapier far over them.
- At 200 sprites every supported engine holds 60 fps on a desktop; on a throttled phone Canvas 2D was the fastest.
- three r163+ is WebGL2 only (`gp validate` says so, `I_ENGINE_WEBGL2`): old phones and blocklisted GPUs get "can't run".
- **A first-person 3D game on three** (Frankengun, game22: 634 KB gzipped with the budget raised on purpose): pointer
  lock, a touch twin-stick with aim assist, the portrait field of view, voxel models in code and instancing, the
  draw-call budget, the glare audit, quality levels and what QA's software GPU measures — [three-fps.md](three-fps.md).

### Use one

`gp init <dir> --id <id> --engine pixi` (or `phaser`, `three`; default `canvas`) makes the skeleton with the adapter
wired: the same screens as the Canvas skeleton in `main.ts`, the drawing in `view.ts`, the engine pinned in
`games/<id>/package.json` (installed by `scripts/setup.sh` into the game folder) and in game.yaml:

```yaml
engine: { name: pixi, version: 8.21.0 }   # canvas needs no version
```

`gp validate` checks the engine has an adapter (`E_ENGINE_UNSUPPORTED`), the version is in the adapter's range — **pixi.js
8.x, phaser 4.x, three 0.163–0.199** (tested: 8.21.0, 4.2.1, 0.186.1 — the platform's browser test runs every adapter on these very packages, packages/core/test-browser/engines-real.test.ts) — and that games/<id>/package.json pins the same
exact version and that one is installed (`E_ENGINE_VERSION`; not installed yet: `W_DEPS_MISSING`). Upgrade the engine in
both files together, within the range.

The engine lab's four worlds, moved onto the adapters, lost their hand-written plumbing (non-blank lines: Canvas 2D
225 → 199, Pixi 316 → 237, Phaser 315 → 215, three 343 → 319) and kept every behaviour `tools/measure.mjs` checks
([D69](../team/decisions.md)).

The adapters never import the engine: the game passes its module (or the pieces the adapter uses), so the engine stays the
game's own dependency, resolved from the game's `node_modules`, and `@gp/core` doesn't depend on any engine.

```ts
import { canvasAdapter } from '@gp/core/engines/canvas';
const eng = canvasAdapter(host, canvas);                     // Canvas 2D: eng.context, the transform in CSS px

import { autoDetectRenderer, Container, Ticker } from 'pixi.js';
import { pixiAdapter } from '@gp/core/engines/pixi';
const eng = await pixiAdapter(host, canvas, { autoDetectRenderer, Container, Ticker }, { background: '#101826' });
eng.stage.addChild(…);                                       // eng.renderer, eng.stage, eng.texture(graphics, { frame })

import Phaser from 'phaser';
import { phaserAdapter } from '@gp/core/engines/phaser';
const eng = phaserAdapter(host, canvas, Phaser, { scene: Play, physics: { default: 'arcade', arcade: { fps: 60 } } });
await eng.ready;                                             // eng.game; in the scene: eng.guard(onHit), eng.sound()

import { AudioContext, AudioListener, WebGLRenderer } from 'three';
import { threeAdapter } from '@gp/core/engines/three';
const eng = threeAdapter(host, canvas, { WebGLRenderer, AudioContext, AudioListener });
eng.scene = scene; eng.camera = camera;                      // eng.renderer; eng.listener() for three's positional audio
```

Then, the same for every engine:

```ts
eng.onStep((dt) => sim.step(dt));        // fixed steps (default 1/60 s; option `step`), only while running
eng.onFrame(() => moveViewsTo(state));   // before every drawn frame and every renderOnce() (Canvas 2D: draw here)
eng.onResize(({ width, height, dpr }) => keepInside(width, height));
eng.setRunning(state === 'play');        // your side: a run is on; the adapter also needs !host.paused
eng.renderOnce();                        // the title screen's still frame, the ?cover frame
eng.audio.play(buffer) / eng.audio.live()?.ctx   // sound through host.audio.out, never on a suspended context
eng.setRenderScale(0.65, { dprMax: 1 }); // a quality level: fewer pixels, the same CSS size (QualityLadder, below)
```

What each adapter guarantees:

- **Created stopped**: no engine frame, no requestAnimationFrame, no step, no engine input or audio until
  `setRunning(true)` (Pixi's `Ticker.system` stopped; Phaser's loop put to sleep before its first frame).
- **Runs only while a run is on and the host isn't paused** (a hidden tab, an ad, a lost WebGL context): it listens to
  `host.onPause` / `onResume` itself, and redraws the still frame on resume.
- **Stops at once, also from inside a step or a collision callback**: after `setRunning(false)` no more steps and no draw
  in that frame (Phaser: Arcade's catch-up loop is emptied; wrap Arcade callbacks in `eng.guard(fn)`). In your own step
  loop, check `eng.running` after anything that can end the run.
- **Resumes without the stopped time**: the frame delta is reset (Phaser: `resetDelta`, `panicMax: 0`, every scene's
  tween clock moved past the pause); a slow frame counts at most 0.1 s (option `maxDt`).
- **The engine never pauses, resumes or resizes itself**: Phaser's blur/visibility/focus handlers removed, `window.onblur`
  / `onfocus` put back, its Scale Manager's listeners stopped; the canvas's CSS and tabIndex are left to the platform. The
  adapter resizes from the window, DPR capped at 2 (option `dprMax`).
- **Sound through the host only**: one AudioContext (the host's), everything into `host.audio.out` (the portal's mute,
  the ad's silence), nothing scheduled while the context isn't running; Phaser's sound manager (`eng.sound()`) made late
  on the host's context with its per-frame resume and unlock listeners off; three's listener (`eng.listener()`) rewired
  from `ctx.destination` into `host.audio.out`.
- **`host.rng` where the engine takes a random source**: Phaser's RND is seeded from it; Phaser's own `{min, max}` ranges
  call `Math.random` with no hook — a dev build warns once when `Math.random` runs during play (use functions:
  `speed: () => host.rng.range(40, 160)`, `frame: '__BASE'` on a single-frame emitter).
- **A lost WebGL context comes back**: the adapter calls `preventDefault()` on the loss; Pixi's generated textures (they
  come back empty) are redrawn when made with `eng.texture()`; the frame is redrawn after the restore.
- **An engine that can't start throws a readable Error** (no WebGL2 for three, no renderer for Pixi, a scene's `create()`
  that throws for Phaser): let it reach `start()` — the player shows "*Title* can't run in this browser (*reason*)".

What not to do:

- Don't start the engine's own loop (`Application`, `app.ticker`, `renderer.setAnimationLoop`, `game.loop.wake()`), and
  don't add your own `visibilitychange`, `blur` or `resize` listeners for the engine: the adapter owns them.
- Don't make an `AudioContext` (three's `AudioListener` without `eng.listener()`, Phaser's default audio config) or play
  through `ctx.destination`.
- Don't turn MSAA on (`antialias: true`): software WebGL (blocklisted GPUs, and gp qa's Chromium) paid 40 % of the frame
  rate for it; smooth edges belong in generated textures.
- Don't pick Phaser or three "to be safe": each costs seconds of load on a slow phone that Canvas 2D doesn't.
- Don't use Kaplay. Don't install an engine at the repository's root (its `node_modules` is the platform's).

### Quality levels and pictures of the engine's scenes

**A render scale on every adapter.** `eng.setRenderScale(scale, { dprMax })` draws a share of the pixels at the same CSS
size: the drawing buffer becomes CSS × min(DPR, dprMax) × scale, `onResize` listeners hear it (`size.dpr` is that ratio,
`size.scale` the scale), a still frame is redrawn; below 0.6 the canvas is upscaled nearest-neighbour (`pixelatedBelow`:
a filtered full-screen upscale cost a software compositor ≈ 10 ms) and the canvas's own `image-rendering` comes back
above it. The option `renderScale` sets it at creation. It is the strongest lever a WebGL game has (Frankengun: 1 → 0.32).

**Levels of your own: `QualityLadder`** (`@gp/core`, or `@gp/core/quality`) — `@gp/art/perf`'s `AutoQuality` is the Canvas
2D one, four fixed levels judged on the frame's work; a WebGL frame's GPU time never shows in that, so this one judges
the interval between frames:

```ts
import { QualityLadder, deviceTier } from '@gp/core';
const LEVELS = [   // from the best (0) to the cheapest: any settings you apply
  { scale: 1, dprMax: 2, bloom: true, shadows: true, particles: 1 },
  { scale: 1, dprMax: 1.25, bloom: false, shadows: true, particles: 0.8 },
  { scale: 0.85, dprMax: 1, bloom: false, shadows: false, particles: 0.6 },
  { scale: 0.5, dprMax: 1, bloom: false, shadows: false, particles: 0.35 },
];
const device = deviceTier({ gl: eng.renderer.getContext() });      // 'software' | 'low' | 'phone' | 'desktop'
const quality = new QualityLadder({ levels: LEVELS, start: device.tier, onChange: apply });
function apply(l: (typeof LEVELS)[number]) { eng.setRenderScale(l.scale, { dprMax: l.dprMax }); bloomOn = l.bloom; sun.castShadow = l.shadows; fx.share = l.particles; }
apply(quality.current);
quality.watch(eng);          // every frame while a run is on; menus, the pause, an ad and the frame after are left out
settings.low = () => (quality.floor = 2);                            // a "Low" choice: never better than level 2
```

- **The start by device**: a software rasterizer (SwiftShader, llvmpipe, Microsoft Basic Render — a blocklisted GPU, a VM,
  `gp qa`'s Chromium) at the cheapest level, a phone in the middle (two thirds down with ≤ 4 cores or ≤ 3 GB), a desktop at
  the second best (`startLevel(tier, n)`). `gpuRenderer(gl)` is the GPU's name (the unmasked one where the browser gives it).
- **Down after 45 frames over 21 ms** (smoothed; a hitch counts as 100 ms at most), **up after a calm stretch** under
  17.5 ms — 5 s, doubled after every step down, at most 60 s; a level whose step up failed three times isn't tried again
  until `set()` (a settings choice). On a 60 Hz screen the interval can't show headroom, so a step up is a try.
- **Dev: `?q=<n>` pins a level** (`pinned`: `frame()` ignores everything; production builds never pin). Pin the best for
  the cover and `gp video` yourself (`?cover`, or `'__gpAdvance' in window`): time doesn't run out there.
- `measure: 'work'` judges your update + draw ms instead (10 / 5 ms), for a Canvas game with levels of its own.

**Pictures of the engine's own scenes** (a DOM thumbnail of a model, the cover's key art — Frankengun's armory and covers):

```ts
import { WebGLRenderTarget, Color, WebGLRenderer, Box3, PerspectiveCamera } from 'three';
import { fitToRect, threeAdapter } from '@gp/core/engines/three';
const eng = threeAdapter(host, canvas, { WebGLRenderer, WebGLRenderTarget, Color });
// a thumbnail: the model framed in its picture, rendered once off screen, kept as a data URL
const cam = new PerspectiveCamera(30, 2, 0.01, 50);
fitToRect(cam, new Box3().setFromObject(gun), { x: 0, y: 0, w: 240, h: 120 }, { width: 240, height: 120 });
img.src = eng.snapshot(240, 120, () => ({ scene: thumbScene, camera: cam })).toDataURL('image/png');
// the cover: the hero model filling the hero rectangle, wherever the layout puts it
hero(g, L) { fitToRect(cam, box, L.hero, { width: L.w, height: L.h }, { direction: { x: 0.4, y: -0.1, z: -1 } }); g.drawImage(eng.snapshot(L.w, L.h, () => ({ scene, camera: cam })), 0, 0); }
```

- `snapshot(w, h, draw, { samples = 4, background = null })` renders into an off-screen target with MSAA (the game itself
  runs without), reads it back the right way up into a new 2D canvas (transparent by default) and puts the renderer's
  target and clear colour back. `draw` returns `{ scene, camera }` or renders itself (several passes, a composer).
- `fitToRect(camera, box, rect, frame, { direction, padding })` puts a perspective or orthographic camera at the distance
  where the box's bounding sphere fits the rectangle and moves its view offset so the subject's centre lands on the
  rectangle's centre. Returns the distance.
- Pixi: `eng.snapshot(w, h, (root) => root.addChild(newThings))` (a fresh root; things on the stage would be moved off it)
  and `fitRect(container.getLocalBounds(), rect)` → `{ scale, x, y }` (any 2D engine). Phaser has no off-screen render of a
  scene of its own: `game.renderer.snapshotArea()` (asynchronous, the main camera) if you need one.

## Physics

Rapier 2D through the physics block **`@gp/physics`**, for a game where physics *is* the mechanic: stacking, piles,
joints, ragdolls, things that topple. A ball that bounces off walls or a few overlaps don't need it: the skeleton's own
`sim.ts` does them in a few lines and 0 KB, where Rapier costs ≈ 1.25 MB gzipped.

```sh
npm run gp -- init ../my-game-repo --id my-game --physics                 # Canvas 2D (or --engine pixi --physics)
npm run gp -- init ../my-game-repo --id my-game --physics=rapier2d-deterministic   # the same floats on every machine
```

The skeleton's PLACEHOLDER mechanic then runs on Rapier: the target is a ball that bounces off a platform and the
walls under gravity. `sim.ts` makes the world once after the WebAssembly is ready (`loadPhysics()`, awaited by `main.ts`,
the balance bot and the tests), starts every run on a fresh world (`physics.reset()`) and steps it once per sim step;
`view.ts` draws the platform and the ball from the body's position. game.yaml and `games/<id>/package.json` say so:

```yaml
engine: { name: canvas, physics: { name: rapier2d, version: 0.21.0 } }   # with Pixi: { name: pixi, version: 8.21.0, physics: … }
budget: { gzipKB: 1500 }                                                # Rapier is ≈ 1.25 MB gzipped: raised on purpose
```

`gp validate` checks the library (`E_PHYSICS_UNSUPPORTED`: rapier2d or rapier2d-deterministic), the version — in the
block's range, **0.21.x**, pinned at the same exact version in package.json and installed (`E_PHYSICS_VERSION`; another
Rapier build pinned instead is named, with the reason) — the portal budget (`W_PHYSICS_BUDGET` until it is raised), and
a Rapier package in package.json without `engine.physics` (`W_PHYSICS_UNDECLARED`). `gp explain engine.physics`.

### Which Rapier package

| game.yaml `name` | Package | Why |
|---|---|---|
| `rapier2d` (default) | `@dimforge/rapier2d-compat` | the `.wasm` embedded in the JS as base64, initialised by an explicit `await RAPIER.init()` (the block does it). Loads in Node (balance bots, unit tests) and in the browser; a failing WebAssembly is a readable Error in `start()` → the player's "can't run" screen |
| `rapier2d-deterministic` | `@dimforge/rapier2d-deterministic-compat` | the same, with Rapier's guarantee of the same floats on every machine: a shared daily seed, replays, a leaderboard of physics outcomes. +12 KB gzipped; 0.6 / 3.1 ms a step at 200 / 1,000 bodies in Node against 0.85 / 2.9 ms (one run each: about as fast) |
| — | `@dimforge/rapier2d` (plain) | not used: it imports its `.wasm` as an ES module, so it doesn't load in Node at all (no `main`, extensionless imports) and needs a top-level `await` in the page (a failing WebAssembly is then a module that never loads — a blank page, not "can't run"); its one-file upload is no smaller (the engine lab: 1,314 KB gzipped against the compat build's 1,304 KB) |
| — | `-simd` builds | not used: they need wasm simd128 (no Safari before 16.4) for steps ≈ 10 % faster (2.6 against 2.9 ms at 1,000 bodies, Node) |

### Use it

```ts
import RAPIER from '@dimforge/rapier2d-compat';           // the game's own dependency (games/<id>/package.json)
import { createPhysics } from '@gp/physics';

const physics = await createPhysics(RAPIER, {
  gravity: { x: 0, y: 900 },     // the game's units: CSS px, px/s²
  lengthUnit: 40,                // ≈ a typical moving thing in px: Rapier's contact tolerances scale with it
  host,                          // advance() steps nothing while the host is paused, and drops that time
  setup(world, R) {              // at creation and after every reset(), on the fresh world
    world.createCollider(R.ColliderDesc.cuboid(200, 8).setTranslation(400, 500));
  },
});
```

Step it on the game's clock, one of three ways — never from a `requestAnimationFrame` or a timer of its own:

- **`physics.attach(eng)`**: the world steps on the adapter's fixed step (`eng.onStep`), exactly once per step when the
  adapter's `step` is the block's `dt` (default 1/60 s both). The adapter stops calling it in menus and under every host
  pause (a hidden tab, an ad, a lost WebGL context) and resumes without the stopped time.
- **`physics.step()` from your own fixed-step sim** — the skeleton's way: `sim.step()` steps the world once, `main.ts`
  calls it from `eng.onStep`, and the balance bot calls the same `sim.step()` in Node, so `balance()` plays the page's
  physics.
- **`physics.advance(frameSeconds)`** from a loop of your own: an accumulator of whole `dt` steps, at most `maxSteps`
  (default 4) a call — a slow frame plays slower, the rest is dropped and never caught up in a burst (`stats.droppedSec`).

Then:

- **Draw from the bodies** in `eng.onFrame`: `const { x, y, angle } = physics.pose(body)` — Canvas 2D draws there, Pixi
  moves a sprite there (`sprite.position.set(x, y); sprite.rotation = angle`). `drawDebug(ctx, physics.world)` outlines
  every collider (Canvas 2D) while the art isn't there yet. At the adapter's 1/60 s step a frame shows the latest step;
  `physics.alpha` (the share of a step left in `advance()`'s accumulator) is there to interpolate if you step slower.
- **Collisions**: give the colliders `ActiveEvents.COLLISION_EVENTS`, then `physics.onCollision((h1, h2, started) => …)`
  after each step (collider handles: map them to your things). A listener that ends the run (`eng.setRunning(false)`)
  stops the rest of that step's events and steps at once. The other events (contact forces) are in `physics.events`.
- **A new run: `physics.reset()`.** It frees what you gave to `physics.keep()` (a character controller, a PID
  controller), the event queue and the world with every body, collider and joint in it, then builds a fresh world and
  runs `setup()` again: no contact cache or warm start carried over, so a run repeats. Never keep a body, a collider or
  `physics.world` across a reset; `physics.destroy()` frees everything for good.
- **The same seed, the same floats**: Rapier has no randomness of its own and the step is always `dt`, so with every
  random choice from `host.rng` (or `seededRng(n)` in a bot) and the same inputs at the same steps, the positions are
  bit-identical — `gp qa`'s demo bot and `balance()` repeat. That holds on one machine and build; across machines only
  with `rapier2d-deterministic`.

### Why the block: what it took by hand, and what it costs

- **WebAssembly memory is never the GC's**: Rapier's objects live in the WASM heap. In the engine lab, 30 worlds of
  2,000 bodies made and not freed grew it to 132 MB. The block's browser test resets a 400-body world 100 times: the
  memory stays at 4.1 MB, where the same test without `world.free()` reaches 50 MB.
- **Size**: the `gp init --physics` skeleton's upload is one file of 3.4 MB raw, **1.27 MB gzipped**, 3.1 MB of it the
  base64 `.wasm` — `gp build --target crazygames` shows `@dimforge/rapier2d-compat` at 99 % — and ≈ 7.8 s to a tappable
  Play on the slow-phone profile (the estimate; the lab measured 7.9 s). Three times CrazyGames' 400 KB: raise
  `budget.gzipKB` on purpose (1500 fits), and `gp forecast` counts the longer load. The WebAssembly compiles in
  ≈ 100–150 ms on a desktop (the lab: 122–151 ms in Chromium).
- **The tests**: packages/physics/test (the block's logic on a recording fake: the accumulator, the cap, the pauses,
  reset and destroy freeing everything once), packages/physics/test-browser/rapier-real.test.ts (the real packages,
  installed only in packages/core/test-browser/engines-real: Canvas 2D and Pixi, every pause reason, the step cap, a stop
  inside a step, 100 resets, determinism over resets and reloads, for both builds) and build.test.ts (the skeleton's
  one-file upload builds without a warning, within the raised budget). The skeletons with Rapier installed: full
  `gp qa` 140/140 (Canvas 2D) and 144/144 (Pixi).
- **Not verified**: WebAssembly inside CrazyGames' iframe (a Content-Security-Policy without `'wasm-unsafe-eval'` would
  stop it; the portal's preview is the check), the compile time on a low-end phone, Safari and Firefox.

## Games with a server (online multiplayer)

Spin Brawl (QmaCyber/game3) is an .io arena with its own Node server; what it learned:
- **The same room code runs on the server and in the page**: without a server the game plays against bots offline, so dev
  builds and `gp qa` play the real rules and the game never "hangs" when the server is down.
- **Dev builds never connect** unless the URL has `?server=ws://…`: `gp qa` fails on console errors, and a failed
  connection is one. Production builds connect only when built with the address.
- **Build-time settings** come from the environment: `import.meta.env.VITE_GAME_SERVER` (Vite reads `VITE_*` variables).
  The address must be `wss://` — a page served over https can't open `ws://`.
- The server is authoritative (the client sends only input), with a per-IP limit and checks on every message; test it with
  real WebSockets, several browsers against the production build, and the server going down.
- The portal's own multiplayer services (the player's name, invite links, instant multiplayer) aren't on the host yet: a
  game reads `window.CrazyGames.SDK` itself for now, and QA can't see it — keep it silent outside the portal.

## How to structure a bigger game (what worked across the games)

- **Tuning in data files** (`data/weapons.ts`, `data/stages.ts`, `data/shop.ts`): Basic Launch numbers change them, not the code.
- **The run as pure logic without the DOM** (`run.ts`: positions, damage, spawns, level-ups), so unit tests and a
  **balance bot** can play thousands of seconds in a test. The bot answers "how long does a fresh player survive?"
  before any human plays.
- **The balance bot recipe** (`bot.ts` in the `gp init` skeleton; details in [upgrades.md](upgrades.md#the-balance-bots-the-recipe)):
  play a run with average skill → buy like a new player (cheapest first) and like a careful one (best value) → repeat
  for 300–400 runs with fixed seeds; record the first purchase, each new thing and the end of the meta, in runs and
  minutes of play. Export it as `balance()` (`gp balance` reads it), pin it in a test and set the goal thresholds *from*
  it, not by guess.
- **Physics in fixed steps** (1/120 s) with an accumulator: the same throw on a 60 Hz phone and a 144 Hz monitor (with Rapier, the physics block steps on the adapter's fixed step for you: [Physics](#physics)).
- **Drawing separately** (`render.ts`), drawn in code — an upload under 1 MB, instant loading — and, where a painted look
  helps, cartoon sprites and backgrounds generated at build time with `gp art` ([art.md § 5](art.md#5-generated-art-gp-art)); always
  with `@gp/art` (lit materials, lights and shadows, rigs, effects, camera, parallax scenery, a glass HUD, auto quality):
  [art.md](art.md). The `gp init` skeleton's look (`art.ts`) starts you there.
- **Screens and every control in the DOM layer** (`ui`), the action on the canvas: then `gp qa` checks every button's
  size and position for you (one drawn on the canvas only if you declare it: `host.qa({ canvasUi })`).
- **A spatial grid** for collisions once there are hundreds of enemies; cap the device pixel ratio at 2.

## Rules you keep yourself (the host can't see them)

- Rewarded ads are offers: the button says what the player gets, nothing in the game requires one, the reward always comes.
- Call `host.roundEnd()` once per run: the "run 3 or 5 min, whichever comes first" limit counts them. A restart, "Leave" or `play()` over a
  running run ends that run too — once (three reviews found a restart that skipped it or an end that could run twice).
- Pause stops everything (for all three reasons, `'context'` too): time, spawns, sounds that you didn't route through `host.audio` — and **timers**. Anything that
  waits inside a run (a death beat, a crash, a pending win, a long press) runs on the game's clock or is cancelled by
  pause and restart, never a bare `setTimeout`: four of the six reviews of games 6–11 found one that outlived Pause
  (a soft-locked death, a phantom crash, a paid hint rewinding a finished level, a panel over the results). `gp qa`
  can't see it — its `end()`/`lose()` skip the beat — so test pause-during-the-beat in your own tests.
- Touch targets ≥ `host.minTouchPx` (QA checks DOM buttons, and canvas buttons you declare in `host.qa({ canvasUi })`).
  QA measures the rendered size, so a DOM screen scaled down (`zoom`, `transform: scale()` below 1) to fit a small phone
  fails it: fit with compact media queries (`@media (max-height: 460px)`) and a panel that scrolls inside itself (Candle Crypt).
- HUD labels never end in an ellipsis: QA's "text cut off" check fails `text-overflow: ellipsis` at 360 px (Kettlebot). Shorten the
  text on narrow screens (a media query with a shorter label, or an icon), don't hide the cut.
- The cover frame (`?cover`) runs the same start code as the game: a `const` used before its declaration there gives the
  player's "can't run" screen, and `gp covers` now fails on it (Kettlebot).
- PEGI 12 content, original names and art, no external links, no fullscreen button of your own (CrazyGames rules).
- Still write the report (`games/<id>/REPORT.md`, AGENTS.md §7): what the platform lacked is how it grows.
