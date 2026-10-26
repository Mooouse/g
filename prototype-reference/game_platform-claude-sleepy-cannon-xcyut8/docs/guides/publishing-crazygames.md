# Publishing on CrazyGames

The channel `crazygames` is for games for teens and adults (`audience: general`) on the CrazyGames web portal.
The portal brings the players and pays a share of the ad revenue. The game talks to the portal's SDK (v3) through the platform.

The requirements below come from CrazyGames' developer docs (requirements: intro, quality, gameplay, technical, ads, account,
multiplayer, game covers; the FAQ; the submission form), collected in
[docs/research/crazygames-requirements-2026-09.md](../research/crazygames-requirements-2026-09.md) with a source for every line.

## Why games get rejected (read this before you pick the game)

Every submission is played by CrazyGames' QA team "to check that it works smoothly, meets our quality standards, and is
fun to play". Their FAQ lists what fails: bugs or broken mechanics · missing English · **unoriginal content (clones or
asset flips)** · inappropriate themes · not meeting the requirements · not PEGI-12 · content aimed at kids. To earn money
a game must "be original and clearly distinguishable from existing games".

**Our own case.** Petri Panic (QmaCyber/game2) was finished, tested and correctly integrated — and rejected:
*"The concept is quite close to existing titles, and we're currently prioritizing more differentiated experiences."*
A live game, **Cell Survivor** (June 2026: "an evolving cell fighting endless hostile organisms", waves, bosses, permanent
upgrades), had the same genre *and* the same theme; about 20 more "X Survivors" games are live. The build was never the problem.

What that means for you, in order of how often it sinks a game:

1. **The concept.** Search the portal for the genre **and** the theme before building (`site:crazygames.com <genre> <theme>`,
   the portal's tag pages, the top of the category). If a live game shares both, change the core action or goal — not the
   skin. Write it down in `concept` (game.yaml): the validator requires it on this channel (`E_CONCEPT`, `gp explain concept`).
2. **Looks like a prototype.** "This game needs content and polishing. At the moment it looks like a prototype" is a real
   rejection. One consistent art style and resolution, audio at even levels, enough content for a 10-minute first session.
3. **Not fun or repetitive.** "No overly repetitive or boring tasks"; clear goals; the game answers every input at once.
4. **Ad rule violations** are "rejected without any feedback" — the platform enforces the rules below.
5. **A slow first minute**: more than one click to gameplay, a text tutorial before the first action.
6. **Identity**: a generic name ("Chess"; "Super Chess" is fine), someone else's name, a name or icon easy to confuse with another game (`E_TITLE_GENERIC`).

**Our second case: "the overall quality".** On 2026-10-01 three more games were rejected with *"The overall quality of
the game does not yet meet the expectations of our platform"* (Yeet the Gnome, Brew & Banter, Germ Line). All four games
made with the concept gate and `gp uniqueness` were approved. No automatic check measures quality, so a second agent
reviews the game before it goes out: [the quality review](#the-quality-review-gp-review). By 2026-10-10, 13 of our 22
portal answers were "overall quality" rejections, most in the dense second batch (13 games in 5 days, 2 approved). Those
games had what our own reviewer had marked `[nice]`: no music, emoji as icons, plain-list meta screens, text onboarding,
empty half-screens, off-style platform sheets, videos that don't show the twist — on this channel `gp review` now makes
each of them `[blocking]` ([the research](../research/feedback-and-metrics-2026-10.md) §5). Send at most 2 new games a
week, the strongest first ([docs/team/weekly-loop.md](../team/weekly-loop.md)).

Resubmit only after meaningful changes; repeated non-compliant submissions can restrict the account. A game that fails
Basic Launch can only come back "as a new game including significant improvements".

## What the platform does for you

| Portal requirement | How it's covered | Check |
|---|---|---|
| The upload: files, not archives, `index.html` at the root | `gp build --target crazygames` folds the production build into **one** `games/<id>/upload/index.html` | QA plays that very file: `[production] upload: one file` |
| Initial download ≤ 50 MB (≤ 20 MB for the mobile homepage), ≤ 1500 files, relative paths | the build fails over 20 MB, on absolute paths, test code (hooks, the test ad) and without the SDK adapter | build |
| SDK v3 from `sdk.crazygames.com`, `init()` first; `loadingStart/Stop` | `core/portal.ts`, before anything else; a plain web game if the SDK can't load | QA of the production build with a fake SDK |
| `gameplayStart` / `gameplayStop` on every break (menu, result, pause, ad, hidden tab) | automatic from the round lifecycle (kits) or `host.gameplay()` (code games) | QA: alternate, hidden tab, round end |
| Land in gameplay, at most **1 click** (Full Launch) | kits: one tap on Play; code games: `data-gp="play"` | QA (production): gameplayStart after one click |
| `happytime` sparingly (new best, boss beaten — not every level) | kits: new best only | QA |
| The portal's mute setting has priority | `host.portalMuted` / `onMuteChange`; the kits follow it | QA (production): the settings listener |
| Saves in the Data module (cloud for logged-in players) | automatic | QA (production): read at start, written after a round |
| Midgame ads only at transitions, never during play, **never on a navigational button** (menu, home, settings, shop) | the casual kit: only on **Play again**; code games call `host.adBreak()` only on the way into the next round | QA: ad checks |
| Midgame not before the player understands the game (Basic Launch guide: after the tutorial or 3–5 min) | channel floor: none in the first 3 minutes; the first at the end of round 3 or after 5 minutes of the session, whichever comes first (D36); then ≤ 1 per round and per 3 min | validate (`E_ADS_LIMITS`), QA |
| **Basic Launch: monetization is off**, every ad request fails — no freeze, no reward button that does nothing | `host.rewardedAvailable` turns false once ads are off for the session (Basic Launch, an ad blocker) or after two failed ads in a row; `rewardedButton()` says "No ad available right now" and keeps the player's choice | QA `[ads fail]` (dev, `?ads=fail`), `[production, ads blocked]` |
| Works with an ad blocker (Full Launch); ad blockers hide `.ad-btn`, `#ads` … | no ad-like class or id names | QA (production) |
| Rewarded: the player's choice, "no thanks" as big and plain as the offer, never on the active gameplay screen, no reward on an error | `host.rewarded()` refuses an ad without a tap; `rewardedButton()` | QA `[ads]` |
| Legible at devicePixelRatio 1 in the smallest 16:9 iframes (821×462, 800×450) | — | QA `[production, portal frames]`: DOM text ≥ 12 px, nothing off screen; screenshots for canvas text |
| No custom fullscreen button (the portal has one); Esc and Ctrl+W are not game keys; WASD works on AZERTY | `MoveInput` reads `e.code` (physical keys) | QA: no fullscreen button or `requestFullscreen` |
| No cross-promotion: no app-store links, no other portals, community links only on the menu | — | QA (production): no store or portal links |
| PEGI 12, general audience, not aimed at kids | `E_CHANNEL_AUDIENCE` | validate |
| Original concept, a name of its own ≤ 35 characters, the same in the game and on the form | `E_CONCEPT`, `E_TITLE_GENERIC`, `E_TITLE_LONG` | validate |
| Covers 1920×1080, 800×1200, 800×800; preview videos (landscape and portrait, 15–20 s, no sound) | `gp covers`, `gp video` (and its contact sheet `store/<video>-frames.png` to look at; `--frames` for the sheet alone, without ffmpeg) | `gp submission` checks sizes, codec, length, sound |

## Steps

1. **Concept first**: search the portal (genre + theme), keep the notes (`docs/concept.md`), write `concept` in game.yaml.
   Then start the game: `gp init <dir> --id <id> --title "…"` for your own code — the usual case
   ([code-games.md](code-games.md#a-game-in-its-own-repository)); `gp new <id> --from docs/examples/casual.game.yaml` for the
   casual kit. Both start the concept and listing as TODO.
   **Money with it**: `gp forecast --idea …` for the candidates, then `money` in game.yaml and `gp forecast <id>` — the natural
   breaks, the rewarded offers, a 10+ min session and a reason to return decide what the game can earn
   ([game-design.md → Design for money](game-design.md#design-for-money)); `gp submission` adds forecast.md for the owner.
2. `gp validate <id>` → `gp dev <id>` → `gp qa <id>` (all green; `--quick` while iterating).
3. Write the listing in game.yaml: `listing: { description, controls, orientation, tags }` — honest about the genre and the twist.
   Then **the quality review**: `gp review <id>` → a second agent → `games/<id>/quality.md`, every `[blocking]` finding fixed
   ([below](#the-quality-review-gp-review)).
4. `gp submission <id>` → **`games/<id>/submission/`**, everything the form asks for, built and checked:

   | Form field | File | Requirement |
   |---|---|---|
   | Upload files | `index.html` | files only, no archives; `index.html` at the root; < 50 MB (< 20 MB: mobile homepage) |
   | Cover landscape | `cover-landscape-1920x1080.png` | 16:9, mandatory |
   | Cover portrait | `cover-portrait-800x1200.png` | 2:3, mandatory |
   | Cover square | `cover-square-800x800.png` | 1:1, mandatory |
   | Preview video landscape | `preview-landscape-1920x1080.mp4` | mandatory: H.264, 15 s, no sound |
   | Preview video portrait | `preview-portrait-1080x1920.mp4` | mandatory (9:16, what all our games uploaded; one copy of the docs says 2:3 — check the form) |
   | Description, controls, form answers | `listing.md` | from game.yaml `listing` |
   | (for the owner) the quality review | `quality.md` | from `gp review`: refused while missing, malformed or with a `[blocking]` finding |
   | Marketing creatives, store links | — | optional |

   Every game makes its own set: its own cover frame (`?cover`), its own video script (`video.mjs`) or demo bot, its own texts.

   **New game, update, or submitted anew.** Beside the folder `gp submission` writes the one zip to send:
   `games/<id>/<id>-<version>-submission.zip` (the whole folder) for a new game, and for an update (CHANGELOG.md with
   more than one version) `<id>-<version>-update.zip` with index.html, listing.md and `patch-notes.md` (the update form;
   `games/<id>/patch-notes.md` is required). A game with an update history that must go through the **new-game form**
   again — rejected and resubmitted, or re-listed — takes **`gp submission <id> --full`**: the whole folder and the full
   submission zip (index.html, the covers, the videos, listing.md, listing-translations.md, forecast.md, uniqueness.md,
   quality.md) and a warning with the odds of a resubmission (3 of 4 after a Basic Launch stop were rejected: forecast.md
   caps P(approval) by the game's history in publisher/results.yaml), no patch notes asked for (`gp validate`'s W_PATCH_NOTES doesn't apply then). `--full --reuse-media` keeps
   the covers and videos in `store/` as they are — nothing is rendered again, even when they are older than the code
   (a note names those: look at them and at `store/<video>-frames.png`); only a missing one is made. Without `--full`,
   `--reuse-media` renders again what is older than the game's code.
5. **Hand the folder over**: send the zip `gp submission` names (the folder's files) to the owner with the report.
6. developer.crazygames.com → **Submit a game**: drag `index.html`, fill the form from `listing.md`, add covers and videos.
   **The Submit page's confirmations** (seen 2026-10-19): the owner ticks each box by hand, so the report says which ones
   the platform proved and which need a person:

   | Box | What proves it | Who ticks it |
   |---|---|---|
   | Loads and plays in desktop Chrome within 10 s, no errors | `gp qa`'s production build (console errors, time to Play) and `gp build`'s load budget | proved by QA; the owner after a look in Chrome |
   | Tested and works on mobile, or marked desktop only | `gp qa`'s phone sizes and touch (an emulation, not a device) | only after a play on a real phone (the portal's QR preview) |
   | Default language is English | `languages` starts with `en`; `gp qa` boots in English | proved |
   | The first minute makes it clear what to do | `gp qa`'s first-minute section, `gp review --first-look` | proved |
   | Someone other than me has tested and played it start to finish | the second agent's review is not that | a person (the owner or a reviewer) who played a whole run |
   | Not an asset-based template or a 1:1 clone; rights to all code, art and sound | `gp uniqueness`, `assets/provenance.yaml` (`gp art`), bundled fonts under OFL, third-party content credited in the game | proved when every asset's source is known |
   | PEGI 12 | `audience: general`; no realistic violence, gambling or sexual content | the owner |

7. Test in the portal's **Preview** (desktop and the QR code on a phone): the SDK checker, demo ads, cloud save, mute.
8. **Basic Launch** (7–21 days, until ≥ 7 days and ≥ 500 plays; ads off): the dashboard shows average play time (successful
   games: 10+ min), conversion (players who play at least one minute: 80%+) and D1 retention (10–15%), each scored 1–5 per
   device class against other games; 9 of 15 on a device class invites you to Full Launch (Full Implementation, a second QA
   review). How they score and what moves them: [below](#basic-launch-the-three-metrics-and-how-they-score).

## The quality review (`gp review`)

CrazyGames' QA team plays every submission "to check that it works smoothly, meets our quality standards, and is fun to
play". `gp qa` checks what a machine can (the SDK, ads, frames, saves); whether the game is fun, finished and clear in its
first minute takes someone playing it. That is a second agent — not the one that made the game.

**Calibrated, not a checklist.** Our reviews passed games the portal then rejected for "the overall quality": Swarm Smash
1.2.0 with 0 blocking / 0 nice, Candle Crypt 1.7.2 with 0 blocking, Velvet Domino Rogue with 0 blocking and 14 nice
(`publisher/results.yaml`). They measured compliance, not how the game looks next to the games the portal takes. So the
review starts from a picture and a score:

- **The review sheet**, `games/<id>/qa/review-sheet.png`: the game's first screen, two moments of play (captured by
  `gp review` at 1280×720 from a fresh save — the dev build on a virtual clock, `?seed=1`, the demo bot), a meta screen
  (a declared shop, upgrade or map screen from `gp qa`, else the results) and the landscape cover, above **3 approved and 2
  rejected shots of our own games** from `publisher/reference/` (`index.yaml`: game, version, the portal's answer and date,
  genre, what the shot shows; the game's own genre first). `--no-capture` builds it from the last `gp qa`'s screenshots.
- **Scores**: the reviewer scores each of the game's screens (`title`, `play-1`, `play-2`, `meta`) 1–5 for *"would it sit
  on CrazyGames' front page next to these?"*, with a reason. **A score below 3 is a `[blocking]` finding** that names the
  screen. Approval is a low bar — every approved game on the sheet was later stopped after Basic Launch: 4 means "at least
  as finished as these".
- **The desktop first.** The reviewer plays 1280×720 with mouse and keyboard first, then the phone: the portal's QA judges
  on a desktop, and the dashboard counts Mobile and Tablet "only if it passes Desktop". A finding about the look or the
  layout of the first screen or of play is never `[nice]`.
- **A blind first look** (`gp review <id> --first-look`): the reviewer reads a long brief before playing — the opposite
  of a naive player, which is how Swarm Smash went out with 0 findings. So a **third agent who knows nothing about the
  game** sees only `qa/first-look.png`: six frames of a fresh player's first 30 s at 1280×720 (0, 3, 8, 15, 22 and 30 s;
  the first screen as it loads, then Play tapped and the demo bot playing, on the same virtual clock as the sheet), each
  captioned with its time and nothing else — no title, concept, listing or report of ours. `qa/first-look-brief.md` tells
  it to open nothing else and write `qa/first-look.md` in a fixed format:

  ```markdown
  # First look

  - Goal: <one sentence — or "don't know">
  - Controls: <what the player presses — or "don't know">
  - Hook: <what would make you play on — or "none">
  - Keep playing: <1–5>/5 — <why>
  - Unclear: <optional>
  ```

  `gp review` puts the answers beside `concept.pitch` and the twist in the main brief: whether the stated goal is the
  game's is the reviewer's judgement (a wrong goal is `[blocking]`), but **"keep playing" ≤ 2 or a goal of "don't know"
  must be a `[blocking]` finding in quality.md that names "first look"** — `gp review --check` refuses the file otherwise,
  as it refuses a low score no finding names. On CrazyGames a missing or malformed `first-look.md` stops the submission.
  `gp qa` keeps these files when it clears `qa/`.
- **Sameness across the account.** Our dense batch (13 games in 5 days, 2 approved) shared a "platform look". The sheet's
  last row is our **other** games' title screens, closest first: the title shots of `publisher/reference/` and, when a
  checkout of the previews repository is at hand (`GP_PREVIEWS`, else `game-previews` beside the platform), every game in
  it — its title (the page loaded twice: a first visit may land in play) and its language sheet, captured once per preview
  commit into `.gp/looks/` (local, not committed). The game's title, results and language screens (from the last `gp qa`)
  are compared with each: a 64×36 colour histogram (intersection) and a 16×9 layout edge map (correlation), both 0–1. Both
  ≥ 0.85 is **very close**: the brief warns and asks for a `[blocking]` finding unless the likeness is on purpose. Calibrated
  on 24 previews (2026-10-19): the stock language sheet agreed 0.98–1.00 across 17 games; different titles a median 0.13;
  the closest two (Firefly Rush, Starsilk — both a centred dark menu) 0.82 / 0.80, "close" without a warning.
- **The scope gate.** `gp validate` warns **`W_SCOPE`** for a CrazyGames code game with no record in
  `publisher/results.yaml` (a first submission) whose last `gp qa` opened more than 15 declared screens: the rejected games
  of the calibration had 16–20, the approved 10–12. The source is the QA run — its `screen-<name>-<size>.png` shots and the
  `"<name>" <size>: …` checks of `qa/qa-results.json` — because `host.qa({ screens })` is code (functions, often built in a
  loop) that no static reading counts right, and `concept`/`money` don't list the screens. So the warning shows from the
  first QA run on; the review brief then asks for a `[blocking]` "prototype risk" finding whatever the hours.
- **The last pass adds no systems — only feel** (juice, sound, typography, layout): the brief lists the game's commits of
  its last day. And **a resubmission after a stop needs a big visible change**: 3 of 4 of ours came back rejected
  (Spin Brawl, Starsilk, Candle Crypt; Hang the Moon was approved again) — the brief counts them from `results.yaml`.

The steps:

1. After the full `gp qa`, run **`gp review <id> --first-look`** and give `qa/first-look-brief.md` (and nothing else) to
   an agent who hasn't seen the game; then **`gp review <id>`**. It writes the review sheet and `games/<id>/qa/review-brief.md`, the reviewer's whole task:
   - CrazyGames' quality requirements as a checklist — onboarding and the first minute, fun and depth, look and sound,
     identity, technical, ads, content, covers and video — each with its source line in
     [the research](../research/crazygames-requirements-2026-09.md) and what the platform already checks of it;
   - what the platform knows about the game: concept and twist, the progression the code shows, the money design and
     `gp forecast`, the story depth, `gp uniqueness` and its signals, the size and load budget, the last QA run (failed
     checks), and the QA screenshots, covers and preview videos to look at, each with the question to ask of it;
   - on this channel, **the nine signs promoted to `[blocking]`** (no music; emoji or OS glyphs as icons; a meta screen that
     is a plain list or the stock shop with no art; onboarding over 2 lines or a modal before the first action; a first
     visit that needs more than 1 click to gameplay; touch controls not visible at the first frame; a half-screen empty at
     1280×720 or 360×800; a platform sheet unlike the game's style; a video whose first 5 s don't show the twist), with
     what the platform found itself (music in the code, emoji in the code and strings), and **a scope check** (more than 3
     systems in a game made in under a day is a `[blocking]` "prototype risk" unless every screen is drawn and animated);
   - `qa/first-minute.json` as **pass/fail lines** (Play ready ≤ 3 s, ≤ 1 click to gameplay, no idle loss before 12 s,
     ≤ 25 words, a reward within 15 s, the twist in time, and the newer measures — the touch bot, 4× CPU fps, the start's
     loudness — when the QA writes them), and **the Basic Launch score table** with every score screen in
     `publisher/results.yaml` (the desktop is the gate: the reviewer plays it first);
   - the traits of the nine games the portal has answered for (from `publisher/results.yaml`), **as data, not causes**:
     the stock "+stat" shop screen was in all three quality rejections, but Starsilk was approved with `mountUpgradeShop`
     behind its own Loom; a silent failed rewarded ad was in all three, and in the approved Spin Brawl; Brew & Banter put
     ≈ 110 words of story before the first tap; the rejected games carried several systems around the core, and so does
     the approved Dread Throne.
2. The reviewer plays the game (10–15 min from a fresh save, **the desktop at 1280×720 first**, then the phone at 360×800),
   scores the review sheet, reads the code where play raises a question, and writes **`games/<id>/quality.md`** in a fixed
   format:

   ```markdown
   # <Title> — quality review

   Reviewer: … · Date: … · Played: …

   ## Scores

   - title: 4/5 — <why, compared with the references>
   - play-1: 3/5 — <why>
   - play-2: 4/5 — <why>
   - meta: 4/5 — <why>          (or "meta: n/a — <why>" for a game without a meta screen)

   ## Findings

   - [blocking] play-1 (3/5): <what is wrong, where> → <what to change>
   - [nice] <what would make it better> → <what to change>
   ```

   `[blocking]`: what would get the game rejected or make a new player leave in the first minutes — and every screen
   scored below 3, named as the score names it (`title` or "first screen", `play-1`, `play-2`, `meta`), and every finding
   about the look or layout of the first screen or of play. `[nice]`: better metrics and polish of the later screens, not
   a rejection. At least one finding; other sections are free text.
3. The game maker fixes every `[blocking]` finding; the reviewer checks again and updates the file, the scores too (fixed
   findings go, or move to a free-text `## Fixed` section). `gp review <id> --check` says whether the file would pass (and
   points at a `[nice]` finding that reads like the look of the first screen or play).
4. `gp submission <id>` refuses to complete while `quality.md` is missing, malformed (on CrazyGames: no `## Scores`, a
   screen unscored, a score below 3 that no `[blocking]` finding names, or a first look of ≤ 2 or no goal that no
   `[blocking]` "first look" finding names) or has a `[blocking]` finding — on CrazyGames also while `qa/first-look.md`
   is missing or malformed — and,
   for a code game, while the game has no music (the code calls no `createMusic` and game.yaml has no `sound.music`;
   `gp validate` reports it as `E_SOUND_MUSIC`) — and copies it into `submission/` for the owner when it passes.

## Covers and videos: what gets them sent back

- Covers: the three sizes in one consistent style; **only the game's title as text** (no "New", "Play now"); no borders,
  icons or store logos; nothing blurry or copyrighted; **not a plain screenshot** — the main character, a big stylized title.
  Players decide at 200 px wide: `gp covers` scores each cover at that size and writes `cover-preview-200.png` —
  the rules, the cover hook and the check: [covers.md](covers.md).
- Videos: 15–20 s, ≤ 50 MB, no sound; open on the static cover (`gp video` does); no intro logo, black bars, mouse cursor,
  promo text or fast-forward. The first seconds must show what makes the game different.

## Basic Launch: the three metrics and how they score

Approval starts Basic Launch: 7–21 days with ads off, then Full Launch or a stop. **A stopped Basic Launch is final**: the game
comes back only "as a new game including significant improvements", so the first minute has to be right before it starts.
The dashboard needs no SDK: it measures from the portal's own start of the game.

| Metric | CrazyGames' definition | Benchmark | Our numbers (2026-10) |
|---|---|---|---|
| Average playtime | "The average time a player spends in your game in a single session" | successful titles 10+ min | 2.5–6.8 min; Candle Crypt 9.5–11.7 min (desktop 9m31s → 4, 5 starts at 12m13s) |
| D1 retention | the share of players who come back the day after their first session (one day late) | strong games 10–15 % (platform average 6.7 %) | 1.0–3.9 %; Candle desktop 2.96 % → 2, 3 starts at 3.94 % |
| Gameplay conversion | "The percentage of players who play for at least one minute after starting the game" | top titles 80 %+ | desktop 51–76 %, mobile 26–52 %; Candle desktop 51.25 % → 1, 2 starts at 54 % |

**How they score.** Each metric gets **1–5 points per device class** (Desktop; Mobile and Tablet); **Full Launch needs at
least 9 of 15 on a device class**. The points are relative: a game is ranked against peer games, so the same raw value scores
differently by category and device (≈ 51.5 % conversion scored 4 for Spin Brawl on mobile and 1 for Candle Crypt on desktop).
**The category you submit under picks the peers**: choose it on purpose and record it (`category` in
`publisher/results.yaml`, with the score screen in `basicLaunch.scores`). Example, Candle Crypt on 2026-10-10: Desktop
7/15 (playtime 4, D1 2, conversion 1) — Mobile and Tablet 9/15 (5, 3, 1), "will be enabled".

**The levers, in order** ([the research](../research/feedback-and-metrics-2026-10.md) §4, ranked by effect):

1. **Conversion** — it scored 1/5 in every device score we know outside the .io game; 1 → 3 is +2 points on both classes.
   The first visit lands in gameplay (no title gate for a new save; CrazyGames: "Games should land new users in gameplay
   immediately. If this is not feasible given the game specifics, a maximum of 1 click is allowed."); no text wall or modal
   before the first action; touch controls visible from the first frame (≈ 70 % of plays are mobile, and mobile converted at
   half the desktop rate); nothing loud or punishing in the first seconds; a reward inside 15 s.
2. **D1** — about 4 % already scores 3 in Candle Crypt's category. A reason to come back that the player sees: a daily on
   the title, the session ending on a goal left at 60–80 %, the next chapter (`money.returns` is required here:
   `E_MONEY_RETURN`).
3. **Playtime** — each results screen is an exit: the big button continues, with the next goal named; content that
   outlasts the first session (an endless mode that escalates, acts with their own look); music (`E_SOUND_MUSIC`); no
   dominant strategy or easy stretch.

**Use the window.** Updates during Basic Launch are approved automatically and show the next day: read the dashboard on
day 1–2, ship the first-minute and D1 patch the same day, read again on day 4 (the playbook:
[docs/team/weekly-loop.md](../team/weekly-loop.md)). Candle Crypt is the only game that patched during its Basic Launch, and
the only one with a device class at 9.

## What makes a game do well there

The portal compares average play time, 1-minute conversion and D1 retention with other games.
- **Genre averages** (CrazyGames' monetization guides): puzzle 21 min (the top earner), clicker / idle 15 min, action ≈ 13 min
  (best D1, 8.1%), shooting 12, .io 9, hypercasual 8.6 (the weakest). Multiplayer is "strongly supported" (2× retention).
- The **first seconds** decide: gameplay after one click, the controls shown in play, no text walls.
- **Meta progression** (permanent upgrades between runs, [upgrades.md](upgrades.md)) and **rewarded ads** (revive, ×2) keep players 10+ minutes.
- `happytime` on real highs only. More: [game-design.md](game-design.md) and [docs/team/marketer.md](../team/marketer.md).
