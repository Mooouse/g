# QA review: "Pop the balloon!" port → game_platform (milestone: parity)

Reviewer: QA. Baseline: `/home/user/qmacyber/game/src` @ 8d813f5 (74/74 browser QA, 31/31 device).
Method: file-by-file diff of the originals against their ports, plus running `games/balloon-pop/game.yaml`
and ~25 mutated variants through `loadYaml → checkSchema → resolveGame` (Node 22, no build).

**Summary.** The runtime port is very faithful. On the default `game.yaml` I found **no blockers**:
same ad rules and limits (60 s / round 2 / every 2 / 90 s / 120 s / 5 s stub), same purchase flow,
same `finishRound` order, same layout maths (`minTouchPx: 64` gives the old `max(32, u·k)`), same save key
and fields, same content, previews and card colours, same multitouch and rotation code. The resolved
config matches the original `config.ts`/`i18n.ts` value for value.
The problems are in validator edge cases and in QA harness compatibility.

Severity: **blocker** = default game differs from the original / a QA check must fail; **major** = wrong
behaviour on valid-looking input, a compliance hole, or parity cannot be verified; **minor** = cosmetic, perf, UX.

---

## Findings

### MAJOR-1 — `.inf` / `.nan` pass validation and switch the Families ad limits off at runtime
- **Where:** `packages/spec/src/check-schema.ts:66-71` (no check that numbers are finite);
  `packages/spec/src/resolve.ts:168` (`policy[k] < floor[k]` is `false` for NaN);
  `packages/cli/src/vite-plugin.ts:31` (`JSON.stringify(load())` turns NaN and ±Infinity into `null`).
- **What happens:** YAML `.inf`/`.nan` are valid numbers. `limits: { minIntervalSec: .inf }` looks
  *stricter* than the floor, so it passes `E_ADS_LIMITS`. `.nan` passes because `NaN < 90` is false.
  Both arrive in the player as `null`. `shouldShowAd` then compares `x < null`, which means `x < 0`.
  Checked: with the policy after the JSON round-trip, `shouldShowAd(...)` returns `true` at t=1 s after round 1,
  and on every round after that. In short, an ad after every round, from the first second.
- **Why it matters:** this is a silent Google Play Families policy breach, and `gp validate` reports it as OK.
  The same hole affects `round.target.min/max: .inf`, which becomes `null` and so `Math.max(null, …)`.
- **Fix:** in `checkSchema`, reject values where `typeof value === 'number' && !Number.isFinite(value)`
  (use E_TYPE or E_RANGE, with a hint like "use a large number, e.g. 999999"). In resolve, write the check the safe
  way round: `if (!(policy[k] >= floor[k]))`. Optionally, make the plugin serializer throw on non-finite numbers.

### MAJOR-2 — Color-bound items: the validator ignores case, the runtime does not
- **Where:** `packages/spec/src/resolve.ts:115-116` compares in lower case.
  `packages/blocks/src/mechanics/tap-collect.ts:59` uses `x.color === color` (exact match).
- **What happens:** an inline colour list such as `items: [{ color: "#FF4B4B", word: red }, …]` is valid
  (the schema pattern allows `A-F`, and the `E_COLOR_NOT_NAMED` check passes). At runtime no item matches a palette
  colour, so it falls back to `items[0]`: every balloon says "red", in red.
- **Why it matters:** the validator accepts input that breaks the Colors mode, with no error and no warning.
- **Fix:** normalize `color` to lower case in resolve (items, preview strings and palette). Or compare case-insensitively at runtime.
  Add a unit test with an upper-case inline colour list.

### MAJOR-3 — The original QA harness cannot run against the port as-is, so parity is not provable yet
- **Where:** `/home/user/qmacyber/game/tools/qa.mjs` (and `device-test.mjs`) identify scenes by
  `scene.constructor.name`. They expect `PlayScene` and `RoundEndScene` (qa.mjs:103, 213, 218, 221, 383-422;
  device-test.mjs:146-147, 195, 293-336). They also load texts with `import('/src/i18n.ts')` (qa.mjs:444).
  In the port these are `TapCollectRound`, `RewardScene` and `KIDS_STRINGS_EN`, and there is no `/src/i18n.ts`.
  `packages/qa/src/index.ts` is in progress and does not typecheck yet (`@gp/kit-kids/qa` is missing).
- **Why it matters:** the milestone asks for "identical behaviour", and 74/74 plus 31/31 are the oracle.
  With the class-name checks, 20+ of the 74 checks fail no matter what the game does.
- **Good news:** every other property the harness touches is still public at runtime with the same shape:
  `app.scene`, `go`, `finishRound`, `home`, `persist`, `save`, `ads.state`, `audio.ctx`, `audio.speaker.tts`,
  menu `cards[].mode`/`album`/`lock`/`layout()`, round `field`/`popped`/`state`, reward `next`/`home`/`t`,
  album `cells`, gate `code`/`keys`, settings `rows`/`toast`, and `[data-test-ad]`.
- **Fix (pick one):** (a) port the harness to `scene.id` (`menu | round | reward | album | gate | settings`) and
  `__gp.game.kit.strings`, using this mapping: MenuScene→menu, PlayScene→round, RoundEndScene→reward,
  AlbumScene→album, ParentGateScene→gate, SettingsScene→settings. Then run the old qa.mjs once with only
  that mapping patched, to prove parity before any other change to it. (b) Keep the original names (for example
  `class PlayScene extends TapCollectRound`). I recommend (a) with the one-time run.

### MINOR-1 — The save's JSON key order changed
- **Where:** `packages/player/src/boot.ts:20` and `packages/core/src/save.ts:20`.
- **What:** the original writes `{"sound","voice","noAds","stickers","rounds"}`. The port writes `{"sound","voice","noAds","rounds","stickers"}`.
  Loading works in both directions (both loaders read by key), so this is not a player-visible change.
- **Fix, if byte-identical output is wanted:** `saveDefaults: { sound, voice, noAds, stickers: 0, rounds: 0 }`. For example, the kit
  passes its fields and core inserts `rounds` last.

### MINOR-2 — Inherited object keys slip through as known fields
- **Where:** `packages/spec/src/check-schema.ts:101` uses `const p = props[k]`.
- **What:** `round: { toString: 5, constructor: x }` validates with no issues, because `props['toString']`
  is `Object.prototype.toString`, a truthy value with no constraints. Checked.
- **Fix:** `const p = Object.hasOwn(props, k) ? props[k] : undefined`. Do the same for `r in obj` in the `required` check.

### MINOR-3 — Sprite caches are cleared on every resize, not only when the DPR changes
- **Where:** `packages/core/src/draw.ts:15-18`, plus the listener in `blocks/src/themes/sky-balloons.ts:9-12`.
- **What:** the original `setRenderScale` cleared `spriteCache` only when `scale !== dpr`. Now every resize or
  rotation rebuilds all balloon sprites. This costs a little performance only. The `perf` check (p95 < 8 ms) is unlikely to notice.
- **Fix:** notify listeners only when `scale` changes. `skyCache` is keyed by w/h anyway.

### MINOR-4 — Validator UX: empty sections and unquoted `#colors`
- **What:** `menu:` or `strings:` with no body becomes YAML `null`, and the validator reports "E_TYPE: menu must be a section, got null"
  (checked). An unquoted `fill: #ff0000` is a YAML comment, so it also becomes `null`.
- **Fix:** treat `null` as "section omitted, use the defaults" for optional object sections. For a `null` string field whose
  pattern starts with `^#`, hint "quote the colour: "#ff0000"".

### MINOR-5 — Empty strings are accepted where a child will hear or see them
- **Where:** `kit-kids/src/index.meta.ts:141` (praise), the inline stickers list, and `strings.*`.
- **What:** `praise: [""]`, `stickers: [""]` and `strings: { back: "" }` all validate (checked). The results are an empty title that is spoken as silence,
  an empty sticker, and an empty button.
- **Fix:** add `minLength: 1` to these string item schemas.

### MINOR-6 — `say: true` by default, but items without `word` are silently mute
- **Where:** `packages/spec/src/resolve.ts:144` and `tap-collect.ts:67`.
- **What:** an inline list such as `items: [{emoji: "🐶"}, {emoji: "🐱"}]` resolves with `say: true` and no voice (checked).
  For `ages-2-5` ("pictures, sound and voice only") the author should be told.
- **Fix:** emit `W_NO_VOICE` when `say` is true and some item has no `word`.

### MINOR-7 — Small things
- `player/src/boot.ts:13-14`: `?seed=0` counts as "unseeded", because `Number(null) === 0` hides a real 0. Use `get('seed') !== null`.
- `check-schema.ts:67-69`: the `lo` variable and the exclusiveMinimum message are wrong when both `minimum` and
  `exclusiveMinimum` are set. This does not affect the current schema.
- `kit-kids/src/scenes/album.ts:85`: if a later release shortens the sticker list, the title reads "30 / 24"
  and `RewardScene` picks a random sticker. Show `Math.min(got, n)`.
- `resolve.ts:123,134`: the *default* card previews (colour formula `(i*3+k*2)%7`, first 3 items) do not reproduce the
  original (for example 🐮 instead of 🐰 for animals). This has no effect on balloon-pop, because `game.yaml` sets previews explicitly. Noted so nobody
  "fixes" game.yaml by removing them.

---

## Verified identical (do not re-check)

- `App.finishRound`: the guard comes first, then `round:end` event → `flow.roundEnded` (sticker index, then `stickers++`) →
  `rounds++` → `persist()` → `await ads.afterRound()` → `go(reward)`, with `finishing` reset in `finally`. This is the original order.
  `back()` is ignored while finishing.
- `AdManager` and `shouldShowAd` match line for line. The limits resolve to exactly `ADS` from the original `config.ts`.
  The AdMob flags (COPPA, TFUA, G, npa, immersive), the 120 s safety timer, the retry backoff and the 5 s test stub are all the same.
- `start()`: `checkPurchase` races a 5 s timeout, then `ads.init()`. Refunds are never revoked. Billing is unchanged apart from the product id
  (`remove_ads`, stub key `stub.remove_ads`).
- Save: key `balloonpop.save.v1`, the same 5 fields, the same type checks and clamping, and the same try/catch behaviour.
- TargetField and rise are the original BalloonField maths (spawn x, colour de-dup, spawn Y, speed, sway 0.15, gone,
  rotation rescale, hit ellipse ×1.2, pop). TapCollectRound matches PlayScene (bag without repeats across refills,
  home button after the balloon hit test, taps ignored after pop 15, celebrate timing, progress dots).
- Content: 7 colours in the same order as the palette, numbers 1–10 with words, A–Z, 26 animals and 24 stickers are identical.
  Card fills and previews in balloon-pop match.
- Menu, Reward, Album, Gate and Settings diffs contain only the intended changes listed below. `draw.ts` matches `render.ts` except for `rng`.

## Intended behaviour changes (genre-neutral generalization — not bugs)

- Scene classes are renamed and every scene has `id`. There is a `probe()` for layout checks and an `EventBus`
  (`scene`, `round:start`, `target:pop`, `round:end`, `ad:start`, `ad:end`, `purchase`).
- `Flow` abstraction: core counts `rounds`, while the kit owns `stickers` and the reward scene.
- Ad policy, AdMob flags, billing product, save key, TTS language and `minTouchPx` come from `game.yaml` and profiles.
  `opts.ads === null` means no ads at all.
- `isTesting` is now `!release`, and dev builds always use Google test IDs. The original hard-coded `isTesting: true`.
- The Privacy row is hidden when `privacyPolicyUrl` is null. `parentGate: false` skips the gate (rejected for child audiences).
- The menu grid supports 1–8 modes (`cols = min(n, 2|4)`, `rows = ceil(n/cols)`). For 4 modes it is identical.
  Card preview items are data: label **or** emoji, with 1–3 spots.
- The menu background field reuses `round.spawnEvery/target/trajectory` (the original used the same GAME constants).
- `rng` wraps `Math.random`, and `?seed=` exists in dev and E2E builds only. A pop-up label is skipped when there is no text or emoji
  (the original pushed an invisible one).

## Вопросы к разработчику

1. How do we prove parity for QA? Do we port qa.mjs/device-test.mjs to `scene.id` (with one run of the old harness
   patched only for names), or keep the original class names as aliases?
2. Do we need a byte-identical save (key order `stickers, rounds`), or is "readable in both directions" enough?
3. Non-finite numbers: do we reject them in `checkSchema` (my proposal), or handle them in resolve and the serializer?
4. `privacyPolicyUrl` is required even for `mode: dev`, so `npm run dev` of a new game fails until the page exists.
   Is that intended, or should it be a warning in dev?
5. `numberWords` (the parent-gate task) is always English, whatever `locale` is. Should resolve warn for a non-`en` locale until
   there are packs for other languages?
