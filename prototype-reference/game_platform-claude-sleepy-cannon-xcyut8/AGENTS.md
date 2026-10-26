# AGENTS.md — making games on game_platform

**Start here.** This page is the whole workflow. Everything else is linked from it.

**What the platform is for:** from a short brief to a simple game that is ready to publish — fast, and within
the rules of the store and the audience. You describe the game in one file, `games/<id>/game.yaml`. The platform
builds it from proven building blocks, checks it against the rules, tests it in a browser and packages it.
You do not write game code for things the platform already has.

Commands run from the repository root: `npm run gp -- <command>` (or `node packages/cli/src/gp.ts <command>`).
Needs Node 22.18+ and `npm install` once. `gp doctor` checks the environment.

## 1. The loop

Do these steps in order. Don't skip validation or QA: "it builds" is not "it's done".

| # | Step | Command | Done when |
|---|---|---|---|
| 1 | Read the brief. Decide **audience**, **channel**, the **one core action**, the **content**. No game in the brief yet? Pick one from [game-ideas.md](docs/guides/game-ideas.md). **For a portal: search it for the genre *and* the theme first** (crazygames.com may be closed to a cloud session's network: search it with a web search, `site:crazygames.com <genre>`) — CrazyGames rejected a finished game as "quite close to existing titles" ([why](docs/guides/game-design.md#originality-what-portals-reject)). **Choose the idea with its money in view:** forecast each candidate (its session, natural breaks, rewarded offers) and compare the expected values ([Design for money](docs/guides/game-design.md#design-for-money)). **Pick the genre** (a money genre or a sub-genre: roguelite, tycoon …): it sets the benchmarks and what its players expect ([genres.md](docs/guides/genres.md)) | `gp explain audience`, `gp explain channel`, `gp explain concept`, `gp explain genres`, **`gp forecast --idea --channel <ch> --genre <g> --session <min> --breaks <n> --rewarded revive,x2 --pitch "…"`** (it prints the genre's must-haves) | you can say the game in one sentence, what the player does that the 3 closest games on the portal don't, and where it earns: the forecast of the chosen idea and the runner-up, and why this one (notes in `docs/concept.md` of a `gp init` repository; they go into `concept` and `money` in game.yaml at step 4) |
| 2 | See what exists: pick the genre, then **`gp catalog genres`** says what its players expect and which blocks fit it — some blocks are one genre's only (offline earnings, prestige, sites: idle) | `gp catalog`, `gp catalog genres`, `gp catalog blocks --genre <g>` | you know which kit, mechanic, theme and packs you'll use — for a code game, the genre (`money.genre`) and the blocks for its must-haves |
| 3 | Start the game | **`kit: code` (13+, its own repository — the usual case):** `gp init <dir> --id <id> --title "…"` (`--engine pixi\|phaser\|three` only when the genre needs one: [Engines](docs/guides/code-games.md#engines); default Canvas 2D), then in that repository `scripts/setup.sh` and `scripts/gp.sh <command>` (no id: it knows its game). **A YAML kit inside the platform:** `gp new <id> --from <game> --title "…"` | `games/<id>/game.yaml` exists (in your new repository for `gp init`) |
| 4 | Edit `game.yaml` | fields: [docs/reference/game-yaml.md](docs/reference/game-yaml.md), one field: `gp explain <field>`. A story only if the game needs one: `gp story <id>` says how much and forms a starting file ([story.md](docs/guides/story.md#11-set-the-depth-story-in-gameyaml-and-gp-story)). The **title**: a hook of the genre + a word of its own, 2–3 words (`gp name`, [naming.md](docs/guides/naming.md)). The **money design** in `money` (`gp explain money`): session, natural breaks and where they are, rewarded offers and what each gives, the reason to return. The **languages**: `languages: [en, es, pt-BR, fr, de, ru, tr, it, pl, id]` on a portal; every text a player reads through `host.t('key')` from `strings/en.yaml`, a `languagePicker` on the title; `gp translate` lists the rest for you to translate ([i18n.md](docs/guides/i18n.md)) | the file says what the brief says, and where the game earns |
| 5 | Validate, fix, repeat | `gp validate <id>` (`--json` to parse; it also checks the story file `story.file` declares); **`gp uniqueness <id>` after every big change** — a low score means change the game (core action, goal, rule), not the text ([uniqueness.md](docs/guides/uniqueness.md)); **`gp forecast <id>`** once the design is in game.yaml and after every big change — a small expected value means change the design (breaks, offers, session, meta), its levers say which | `✓ <id>: 0 error(s)`; warnings read and either fixed or explained; the uniqueness report and `qa/forecast.md` read |
| 6 | Play it | `gp dev <id>` prints the URL (test ads, stub purchase; `?seed=1` for a repeatable run). No display? The QA screenshots are your eyes | you looked at it |
| 7 | QA (it also checks the twist: the demo bot plays and `host.twist()` must fire within `concept.twist.within` s, with the words of `concept.twist.explained` on screen long enough to read, in a stretch that starts before the twist or ≤ 1 s after it ([how it's measured](docs/guides/uniqueness.md#the-explanation)); every screen declared in `host.qa({ screens })` at every size, each fitting **one screen — no page or panel to scroll** (pages or tabs instead; only a message or long text may scroll, `data-gp-scroll`: [code-games.md](docs/guides/code-games.md#what-gp-qa-needs-from-you)); a new player's first minute on a phone — on `crazygames` at most 1 click from loading to gameplay (*"land new users in gameplay immediately… a maximum of 1 click"*: boot a `host.firstVisit` straight into a safe first run), no loss in 12 s untouched, ≤ 25 words before the first action, touch controls visible at once, a quiet start, ≥ 30 fps at 4× CPU ([first-minute.md](docs/guides/first-minute.md)); and a code game's progression curve from its bot's `balance()` and its `balanceModel()` — compared at a launch; an update runs the model alone (`--bot` to run the bot too) — `gp balance <id>` alone) | `gp qa <id>` (≈1–3 min: up to 3 sections at once, the frame rate and the twist alone at the end; `--quick` while iterating, **`--failed`** to re-run only the sections that failed — then the full run again before the review; `--headed` to watch; a portal game is also checked as its production build) | the **full** run all green; you read `games/<id>/qa/report.md` and the screenshots (the play and `production-frame-*` shots for your kit) |
| 8 | Build | `gp build <id>` (web); `--target crazygames` (one `upload/index.html`: the portal form takes files, not archives; it prints the **size and load budget**: raw and gzipped, each npm package's share, the estimated time to a tappable Play on a slow phone — [budget](docs/guides/code-games.md#the-size-and-load-budget)); `--target android` (Android project; Gradle runs in CI) | `games/<id>/dist` or `upload/`; on a portal, the budget read: within it (CrazyGames 400 KB gzipped, 3 s), or raised on purpose in game.yaml `budget` (the forecast pays for it; over 20 MB fails). A dev build has Google test ad IDs: fine for testing; a store release needs `gp admob provision` and `--release` (AdMob only — CrazyGames needs no `--release`) |
| 9 | Quality review, then submission (portal games) | write `listing` (description, controls) in game.yaml, and translate it into each `strings/<code>.yaml` (`gp translate --check` ✓: every language complete); **`gp review <id>`** writes `qa/review-brief.md` — give it to a **second agent** (one who didn't make the game), **while the full QA runs** (start it in the background as soon as `gp qa --quick` is green; it plays the game meanwhile and runs `gp review` again for the screenshots when the full run ends): it plays the game against CrazyGames' quality requirements, our nine portal verdicts and the lessons from the people who judged our games (`gp lessons`) and writes `games/<id>/quality.md` (`- [blocking] … → …` / `- [nice] … → …`); on CrazyGames also **`gp review <id> --first-look`** for a third agent who knows nothing about the game (six frames of the first 30 s, no text of ours → `qa/first-look.md`; "keep playing" ≤ 2 or no goal is `[blocking]`); fix every `[blocking]` finding and have the reviewer check again (CrazyGames rejected three games for "the overall quality": [why](docs/guides/publishing-crazygames.md#the-quality-review-gp-review)). Then `gp submission <id>`: the upload, 3 covers (`gp covers`: the game draws the key art in `host.qa({ cover })`, the platform letters the title and scores each cover at 200 px — under 70, fix what `store/cover-check.md` says and look at `cover-preview-200.png`: [covers.md](docs/guides/covers.md)), 2 preview videos (`gp video`), `listing.md`, `uniqueness.md`, `forecast.md` and `quality.md` (an update also `patch-notes.md`: what changed for players, ≤ 2000 characters, from `games/<id>/patch-notes.md`), each checked — it refuses a uniqueness score below 70, a code game without a `money` design, and a `quality.md` that is missing, malformed or has a `[blocking]` finding | `gp review <id> --check` ✓ (no `[blocking]`); `✓ … submission/ is complete`; you looked at the covers and the videos |
| 10 | Report and hand over | write `games/<id>/REPORT.md` (template in §7); **send the owner the one zip `gp submission` writes** (`games/<id>/<id>-<version>-submission.zip`; an update: `…-update.zip` with index.html, listing.md and patch-notes.md; a game with an update history submitted anew, e.g. rejected and resubmitted: `gp submission --full`, the whole folder) with the report — forecast.md says what the game can earn and how sure that is. When the portal answers, record the outcome in `publisher/results.yaml` (forecast.md has the lines) | the platform team reads the report; the owner has everything the portal form asks for, and the forecast |

In a `gp init` repository every `gp <command> <id>` below is `scripts/gp.sh <command>`.

**Pick the kit and channel from the audience and where the game goes:**

| Audience | Where | `audience` | `channel` | `kit` | `round.mechanic` | Start from |
|---|---|---|---|---|---|---|
| Small children (2–5) | Google Play | `ages-2-5` | `android-families` | `kids` | `tap-collect` | `docs/examples/kids` (Balloon Pop), `docs/examples/minimal.game.yaml` |
| Children 6–12 | Google Play | `ages-6-8` / `ages-9-12` | `android-families` | `kids` | `tap-collect` | same, bigger goals |
| Teens and adults (13+) | CrazyGames | `general` | `crazygames` | `casual` | `tap-score` | `docs/examples/casual.game.yaml` |
| Teens and adults (13+) | own site | `general` | `web` | `casual` | `tap-score` | same, `channel: web` |
| Teens and adults (13+), a mechanic no kit has (puzzle levels, physics, idle, action with meta progression) | CrazyGames or own site | `general` | `crazygames` / `web` | `code` | — (your `main.ts`) | `gp init` · [guide](docs/guides/code-games.md) |

**Pick the genre from the market, then the kit.** A tap-and-score round alone is the weakest genre on CrazyGames (≈8.6 min
average play); action and incremental games with meta progression keep players 13–15 min
([game-design.md](docs/guides/game-design.md#web-portals-crazygames-13-what-players-stay-for)). If the kits can't express
the game the brief needs, use `kit: code`: your mechanics, the platform's rules, portal, ads, saves, QA and packaging.
**Never leave the platform** to write a game from scratch: you would rebuild and re-verify all of that by hand.

The validator rejects combinations that break the rules. For example, a clock and penalties for children (`E_NO_FAIL`), or a kit without a parent gate for children (`E_KIT_AUDIENCE`).
If the audience isn't in the brief, ask; don't guess it. Publishing: [Google Play](docs/guides/publishing.md), [CrazyGames](docs/guides/publishing-crazygames.md).

## 2. Rules you never break

1. **Don't change `packages/` to make one game work.** A missing block is a request (§5), or — only if you were
   asked to extend the platform — a new block by [docs/guides/add-a-block.md](docs/guides/add-a-block.md), in its own change.
   What the game needs beyond the blocks goes into its own code (`kit: code`), not into `packages/`.
2. **Never loosen a rule.** Ad limits, touch sizes, the parent gate, voice for toddlers, privacy policy: the validator
   enforces them. If a rule blocks the brief, say so; don't look for a way around it.
3. **Every game must be its own game.** Google Play bans near-identical apps (Repetitive Content) and a ban removes
   *all* the publisher's games. The minimum today: own content, own stickers, own praise and title, own store texts.
   Where the catalog has a second mechanic, trajectory or theme that fits the brief, use it too.
   Never ship a copy of another game with a new title.
4. **`appId` and `saveKey` never change after a release.** Players would lose their progress, the store would see a new app.
5. **Ad IDs:** dev builds always use Google's test IDs. Real IDs go in only through `gp admob provision`, only for a release.
6. **Don't commit build output** (`games/*/dist`, `games/*/qa` are ignored).
7. **Say what you didn't verify.** Browser QA is not a phone: native parts (ads, purchases, TTS, Back) need the Android build and the emulator test.

## 3. game.yaml in one minute

The smallest useful game ([docs/examples/minimal.game.yaml](docs/examples/minimal.game.yaml) — CI validates it):

```yaml
spec: 0
id: sea-bubbles
title: "Sea Bubbles"
appId: com.qma.seabubbles
audience: ages-2-5
channel: android-families
kit: kids
theme: sky-balloons
privacyPolicyUrl: https://qmacyber.github.io/sea-bubbles/privacy-policy.html
round: { mechanic: tap-collect }
modes:
  - { id: colors, content: colors-en }
  - id: sea
    items:
      - { emoji: "🐟", word: fish }
      - { emoji: "🐙", word: octopus }
      - { emoji: "🐳", word: whale }
      - { emoji: "🦀", word: crab }
```

- **Platform fields:** `id`, `title`, `appId`, `audience`, `channel`, `kit`, `theme`, `round`, `monetization`, `privacyPolicyUrl`, `languages` (and `glossary`: [i18n.md](docs/guides/i18n.md)); on a portal also `concept` (what makes it its own), `money` (where it earns: session, breaks, rewarded offers, the reason to return — `gp forecast`) and `listing` (description, controls); a portal code game also `balance.anchor` (the one number its balance converts into: [upgrades.md](docs/guides/upgrades.md#start-from-time-then-the-anchor)) and, for a painted look, `art` (`gp art`); optionally `story` (how much story, `gp story`).
- **`audience` + `channel` switch on the rules** ([docs/reference/profiles.md](docs/reference/profiles.md)): touch sizes, ad limits, parent gate, what's allowed.
- **`round`** is the mechanic and its settings. Everything except `mechanic` has a default.
- **The kit adds its sections.** `kids`: `modes` (menu cards), `menu`, `rewards`, `parentGate`, `strings`. `casual`: `titleScreen`, `result`, `strings`. `code`: `entry`, `background` (no `round`, no `theme`).
- **Content:** `content: <pack id>` or `items: [...]` inline. What's drawn and spoken is inferred from the items (`show`, `pop`, `say` to override).
  `word` may be several words ("fire truck"). Use long-established emoji (Emoji ≤ 5.0, e.g. 🚗 🐮, not 🛻): newer ones show as empty boxes on old Android. Stickers: any number (1–60, one per round; after the last one the reward screen repeats a collected one).
- **appId** comes from `publisher/publisher.yaml` (`appIdPrefix`) when you use `gp new`.
- **Kids-kit example:** [docs/examples/kids/game.yaml](docs/examples/kids/game.yaml) (Balloon Pop, id `balloon-pop`: `gp <command> balloon-pop` finds it) — also the platform's regression test, not a game we ship (74/74 of its original QA checks pass on the platform build). No game is a model to copy: what a finished code game looks like is [game-anatomy.md](docs/guides/game-anatomy.md).

## 4. Where to look

| Question | Answer |
|---|---|
| What can I use? | `gp catalog [kind]` · [docs/reference/catalog.md](docs/reference/catalog.md) |
| Which genre, what its players expect, which blocks fit it? | Pick the genre (`money.genre`), then `gp catalog genres` says which blocks fit it · `gp explain genre.<g>` · `gp catalog blocks --genre <g>` · [docs/guides/genres.md](docs/guides/genres.md) (generated from `packages/spec/src/genres.ts`) · `gp validate`: I_GENRE_EXPECTS, W_GENRE_BLOCK |
| What does a field mean? | `gp explain round.trajectory` · [docs/reference/game-yaml.md](docs/reference/game-yaml.md) |
| What does an error mean? | the issue's `fix` line; `gp explain E_…` · [docs/reference/errors.md](docs/reference/errors.md) |
| What are the rules for this audience/channel? | `gp explain ages-2-5`, `gp explain android-families` · [docs/reference/profiles.md](docs/reference/profiles.md) |
| What makes a simple game good? | [docs/guides/game-design.md](docs/guides/game-design.md) · **`gp lessons`**: what reviewers, the owner and a contest jury told off our games for (variety, animation, smoothness, art direction, visible progress, controls, sound, tutorial …), each with how to spot it and the usual fix — read it before you design; `gp review` hands it to the reviewer |
| Music, ambient sound and effects (themes, places, sliders, ducking; an action game's adaptive score; effects from files or recipes; a score that plays beat by beat) | [code-games.md → Music and ambience](docs/guides/code-games.md#music-and-ambience) · `@gp/core/sound`: `createMixer`, `createMusic` + `musicTheme`/`bossTheme`, `createSceneMusic` + `SCENES`/`STAGES` (scenes, a key per stage, layers with the intensity, alarm, crowd roar), `createAmbience` + `PLACES`, `createSfx` + `sfxRecipe` (files, recipes, struck materials; pitch variation, throttle, pan, voice lines) · `ScoreSequencer` in `@gp/core` (combos, hands, cascades, results: beat by beat, count-up, land, preview) · `gp qa`'s sound section · the showcase `docs/examples/art` |
| A shooter or action game: aim, look and fire (pointer lock, a touch twin-stick), aim assist, enemy steering, bosses, an announcer, hit arcs and damage numbers | [code-games.md → Shooters and action](docs/guides/code-games.md#shooters-and-action-aim-enemies-bosses-the-announcer-threat-cues) · `TwinStick` / `LookInput`, `aimAssist`, `@gp/core/steer`, `BossPatterns` + `@gp/core/boss` (fan, ring, spiral, aimed, wave), `callouts` in `@gp/core` · `HitArcs`, `edgeArrow`, `DamageNumbers` in `@gp/art/hud` · a WebGL game's quality levels: `QualityLadder` + `eng.setRenderScale`, pictures of its scenes: `eng.snapshot` + `fitToRect` |
| How do I make it look finished (palette, light, volume, idle animation, effects, camera, depth, HUD) and stay smooth? | [docs/guides/art.md](docs/guides/art.md) · `@gp/art` (`@gp/art/<module>`: material, light, sprite, rig, fx, camera, scenery, hud, perf, dom — drawn icons as `<img>` for DOM screens, type — bundled game fonts and the pixel font, `useFont`, outlined `drawNumber`) · `@gp/core/icons` (drawn icons, never glyphs) · `screenTheme()` (every platform screen in the game's look) · the showcase `docs/examples/art` · `gp qa` reports a flat play frame, `gp review` checks the look |
| Painted sprites and backgrounds instead of shapes (the look of Google AI Studio's games), always cartoon and game-like | **`gp art <id>`**: game.yaml `art` (a cartoon style + assets), an image model (Gemini, `GEMINI_API_KEY`) paints a style board and every asset at build time, cut out and bundled as WebP with `assets/provenance.yaml` · `loadImages` / `drawImageSprite` from `@gp/art/assets`, the life (light, fx, rig) still in code · [art.md § 5](docs/guides/art.md#5-generated-art-gp-art) · the owner's own finished pictures (a plain studio background cut off, wheels split, a paint mask): **`gp art import <dir> <id>`** ([§ 5.1](docs/guides/art.md#51-importing-finished-pictures-gp-art-import)) |
| Progression: what a run buys (unlocks, tiers, pacts, run choices, a level shop), prices, the balance report, the screen | [docs/guides/upgrades.md](docs/guides/upgrades.md) · `Roster`, `Tiers`, `PactTree`, `RunChoices`, `UpgradeShop` (+ `mountUpgradeShop` for idle and launch games), a collection (`collection` + `mountAlbum`) in `@gp/core` · idle games: `Prestige`, `offlineEarnings`, several places and their map `Sites` + `mountSitesMap` ([§7](docs/guides/upgrades.md#7-idle-games)) · the balance model — the economy as tables, walked in milliseconds (`balanceModel()`, `@gp/core/balance-model`: [upgrades.md → the model](docs/guides/upgrades.md#the-balance-model-the-economy-as-tables-balancemodel); a roguelite's waves a run: `balance.anchor.shape: run`; an idle game's from the bot's campaign: `modelFromCampaign`) · the decisions: a skill ladder of bots (naive, average, skilled) held to game.yaml `balance.difficulty` (a skilled win rate, a winning run's minutes), pick rates of every offer and build diversity (`choiceLog()`), hard stages short ([upgrades.md → the skill ladder](docs/guides/upgrades.md#the-skill-ladder-and-the-difficulty-as-designed)) · `gp balance <id>` (`--csv` for a spreadsheet) |
| Cards, a bag, a board, dice, a rival (deckbuilders, bag-builders, tile laying, a backpack grid, dice placement, a solo opponent) | [docs/guides/table-blocks.md](docs/guides/table-blocks.md) · `Zones`, `Board`, `Dice`, `Automa` in `@gp/core` |
| What can it earn? The path to money, P(approval), revenue months 1–3, the levers; the money design | `gp forecast --idea …` (step 1) · `gp forecast <id>` · [game-design.md → Design for money](docs/guides/game-design.md#design-for-money) · the inputs: `MONEY_TABLE` in packages/spec/src/money.ts · real outcomes: `publisher/results.yaml` |
| How do players get past the first minute and come back? (CrazyGames' conversion, playtime, D1) | [docs/guides/first-minute.md](docs/guides/first-minute.md) · `host.firstVisit` (land in play), `hints()`, `mountResults()` (the next run is the big button, the next goal shown), `host.saveRun/loadRun`, `recordVisit` + `welcomeBack()`, `dailyStreak` + `mountStreakCard()` and `dailyOrder` (a reason for tomorrow), `seasonPass` + `mountSeasonTrack()` and `weeklyEvent` (a season and a weekly event: action, roguelites, idle), `dailyQuests` + `achievements` + `mountGoals()`, the rewards hub (`playtimeGifts`, `luckyWheel`, `dailyOffers`, `timedBoost`, `mountRewardsHub()`), `cards` (the title's cards one at a time), `coachHand()` and `inspect()` (teach without words), `host.screen/fail` (the funnel) in `@gp/core` · `gp qa`'s first-minute section and `qa/first-minute.json` |
| Run seeds for a roguelite (see, copy, share, type back; the daily run) | [code-games.md → Run seeds](docs/guides/code-games.md#run-seeds-see-copy-share-type-back) · `@gp/core/seed`: `newRunSeed`, `runSeedFrom`, `runSeedOf`, `dailyRunSeed`, `seedLabel`, `copySeed`, `seedField` |
| A live world: a shop that restocks every few minutes, weather and festival hours the same for everyone, loot with its odds shown (never sold, never a rewarded spin), mutations, a daily table with a share card, share codes, NPC rivals; an idle layer on another genre | [docs/guides/live-world.md](docs/guides/live-world.md) · `@gp/core`: `worldClock`, `restockShop` + `mountRestockTimer`, `LootTable`, `variants`, `dailyTable`, `shareCode`, `rivals` · game.yaml `money.loot` (E_PAID_RANDOM, W_LOOT_ODDS), `money.hybrid` |
| What should the game be called? A title players recognise (a genre hook + a word of its own) | [docs/guides/naming.md](docs/guides/naming.md) · `gp name <id>` |
| How do I make it multilingual? The languages, the strings files, plurals, the picker, translating | [docs/guides/i18n.md](docs/guides/i18n.md) · `host.t`, `languagePicker`, `FONT_FALLBACK` in `@gp/core` · `gp translate <id>` (`--write`, `--check`) · `gp qa` plays the longest language |
| Is my game unique enough? The twist, the score, what to change | [docs/guides/uniqueness.md](docs/guides/uniqueness.md) · `gp uniqueness <id>` |
| Does my game need a story? How much? The story engine and dialogue | `gp story <id>` · [docs/guides/story.md](docs/guides/story.md) |
| Playgama: one upload to 20+ platforms (YouTube Playables, MSN, Yandex, Facebook, Telegram …) | [publishing-playgama.md](docs/guides/publishing-playgama.md) · `gp build <id> --target playgama` |
| iDos Games (idosgames.com): the game hosted on its own Title, no portal SDK | [publishing-idosgames.md](docs/guides/publishing-idosgames.md) · `gp build <id> --target idos` |
| Why portals reject games, what CrazyGames checks | [publishing-crazygames.md](docs/guides/publishing-crazygames.md) · [the requirements, with sources](docs/research/crazygames-requirements-2026-09.md) · the quality review before submitting: `gp review <id>` |
| What should I make next? What's trending? | [docs/guides/game-ideas.md](docs/guides/game-ideas.md) (with the research in `docs/research/`) |
| When is a game done? | [docs/guides/definition-of-done.md](docs/guides/definition-of-done.md) |
| How do I publish? | [docs/guides/publishing.md](docs/guides/publishing.md) |
| A first game step by step | [docs/tutorial.md](docs/tutorial.md) |
| A game with its own code | [docs/guides/code-games.md](docs/guides/code-games.md) · a new repository: `gp init <dir> --id <id>` · what a finished game looks like, from all the games made so far: [game-anatomy.md](docs/guides/game-anatomy.md) (what games 6–11 proved: [retro-games-6-11.md](docs/team/retro-games-6-11.md); Echoflies and Candle Crypt 1.2: [retro-games-12-9.md](docs/team/retro-games-12-9.md); Frankengun, the first 3D game: [retro-frankengun.md](docs/team/retro-frankengun.md)). Don't copy another game's repo: its tools are older versions of `gp`'s |
| A game in its own repository | [code-games.md → A game in its own repository](docs/guides/code-games.md#a-game-in-its-own-repository) |
| Which engine (Canvas 2D, Pixi, Phaser, three), and how to use it | [code-games.md → Engines](docs/guides/code-games.md#engines): pick by genre and budget, the adapters `@gp/core/engines/<name>`, `gp init --engine`, game.yaml `engine: { name, version }` (`gp explain E_ENGINE_VERSION`) · a first-person 3D game on three (pointer lock, touch twin-stick, voxels, draw calls, glare, quality levels): [three-fps.md](docs/guides/three-fps.md) · physics (Rapier 2D): [code-games.md → Physics](docs/guides/code-games.md#physics), the block `@gp/physics`, `engine.physics`, `gp init --physics` |
| Covers that get clicked: the rules, the cover hook, the 200 px check, A/B variants | [covers.md](docs/guides/covers.md) · `gp covers <id>` (`--variants 3`, `--check`) · `host.qa({ cover })` · `@gp/art/cover`, `burst()` in `@gp/art/fx` |
| Covers, preview videos, listing, the submission folder | `gp covers <id>`, `gp video <id>`, `gp submission <id>` · [code-games.md → Store graphics](docs/guides/code-games.md#store-graphics) |
| How is the platform built? | [docs/platform-architecture.md](docs/platform-architecture.md) |

The reference docs are generated from the code (`gp docs`), so they are never out of date.

## 5. When the platform can't express the brief

Stop and write a **block request** in your report. Don't patch `packages/`:

```
Block request: <kind: mechanic | trajectory | theme | content | kit | scene | rule>
Game: <id>, brief: <one line>
Needed: <what it must do, in one or two sentences>
Settings: <the game.yaml fields you'd expect, with example values>
Why the existing blocks don't fit: <one line per block you tried>
```

Making the game now? Write it with `kit: code` and still file the request: the next game then gets the block.

Known gaps (they come with the next games, see [docs/team/decisions.md](docs/team/decisions.md)):
- trajectories other than `rise` (falling, curves);
- a collector (jar/basket);
- a tap-the-right-answer mechanic and levels;
- for `kit: code` puzzles: a level checker in `gp validate`, a solver, a level-select screen (stars, unlock and undo are in `@gp/core`: `recordStars`, `levelOpen`, `UndoHistory`);
- meta progression for the YAML kits — `kit: code` games pick a shape from `@gp/core` (`Roster`, `Tiers`, `PactTree`, `RunChoices`, `UpgradeShop`) and export `balance()` for `gp balance` / `gp qa`; idle games add `Prestige`, `offlineEarnings` and several places with a map (`Sites`, `mountSitesMap`) ([upgrades.md → Idle games](docs/guides/upgrades.md#7-idle-games)), any genre a daily reward week and a daily order (`dailyStreak`, `dailyOrder`), action, roguelite and idle games a season pass and a weekly event (`seasonPass`, `mountSeasonTrack`, `weeklyEvent`);
- rewarded ads in a YAML kit (a "Continue" or "×2" on the casual kit's score screen) and AdMob rewarded ads on Android;
- portal multiplayer services on the host (username, invite links — Spin Brawl; leaderboards, a weekly best — Frankengun);
- a bark bubble block (barks are data the platform checks, but each game draws its own bubble);
- engines: Kaplay is not supported (`E_ENGINE_UNSUPPORTED`: its loop, audio and context loss can't be made to obey the host). Physics is a block now: Rapier 2D through `@gp/physics` (`engine.physics` in game.yaml, `gp init --physics`; [code-games.md → Physics](docs/guides/code-games.md#physics)) — not yet: Box2D, Matter.js, 3D physics, a smaller upload than Rapier's ≈ 1.25 MB gzipped.

Android packaging exists (`gp build --target android`); the AAB and the emulator test run in CI (`.github/workflows/android.yml`).

## 6. Done means

`gp validate` has 0 errors · `gp qa` is all green · `gp build` succeeds · a code game was reviewed by a second agent · a portal game passed the quality review (`gp review`: a second agent's `quality.md` with no `[blocking]` finding) and has a complete `gp submission` folder (with forecast.md: what it can earn, and quality.md), sent to the owner · the report says what was checked and what wasn't.
The full list: [docs/guides/definition-of-done.md](docs/guides/definition-of-done.md).

## 7. The report (`games/<id>/REPORT.md`)

The platform grows from what game makers needed. Write this file at the end, even when everything went well:

```markdown
# <Title> (<id>)
Brief: <one line>. Audience / channel / kit / mechanic / theme: …

## Results
- Money: `gp forecast` — P(approval) <…–…%>, P(Full Launch) <…–…%>, months 1–3 if launched €<pess> / €<median> / €<opt>, expected €<…>; the top lever and whether you took it
- Time: <minutes from start to done> · validate runs until 0 errors: <n> · QA: <passed>/<total> · build: <ok / upload size> · submission: <complete / what is missing>
- Own checks: <unit tests, the balance bot's curve> · code review by a second agent: <n findings, fixed> · quality review (`gp review`, portal games): <n blocking fixed, n nice left>
- Not verified: <what only a device, the portal preview or a human can check>

## Block requests
<one block per request, the template from §5 — or "none">

## Questions the docs didn't answer
- …

## Friction and bugs
- <what was slow, confusing or wrong> → <suggested fix: file + change>

## What I had to work around
- <anything you expressed in a roundabout way because the platform lacked it>
```

