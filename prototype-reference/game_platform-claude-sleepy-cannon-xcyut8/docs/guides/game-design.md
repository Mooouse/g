# What makes a simple game good

> Choosing *what* to make: [game-ideas.md](game-ideas.md) — ideas for the near future with market evidence.

Guidelines from "Pop the balloon!" and the team's game design review ([docs/team/game-designer.md](../team/game-designer.md)).
Rules the validator or QA already enforce are marked ✅; the rest are for you to follow.

## Core

- **One main action.** The rule is clear in 5 seconds without text. A second idea (a bad target, a combo) comes later — not in the first round.
- **Instant, juicy feedback.** Every successful tap: sound (small pitch variation), particles, a pop-up word — in the same frame. ✅ built into `tap-collect`.
- **Success first.** The first round is the easiest one. For ages 6–8, ≥ 80% right on the first try in level 1.
- **A predictable end.** Progress is always visible (the dots in `tap-collect`). A child knows how much is left.
- **A natural stop every 30–60 s** for small children: the reward screen. No "one more" pressure.

## Children (audiences `ages-*`)

- **No losing, no lives, no timers, no negative feedback** for ages 2–5. Mistakes for 6–8 are gentle: a wobble and another try.
- **No reading needed** for ages 2–5: pictures and voice. ✅ `E_VOICE_REQUIRED` — the voice can't be switched off in a mode.
- **Big targets.** ✅ `E_TARGET_TOO_SMALL`, and QA checks every tappable element against the audience's minimum.
- **Multitouch never breaks the game.** ✅ QA: five fingers on one target = one pop; many fingers at the end = one round end.
- **No flashing:** at most 3 flashes per second, no sharp full-screen brightness changes.
- **Soft sounds;** sound and voice can be switched off by a grown-up. ✅ settings behind the parent gate.
- **Grown-up things behind the parent gate:** settings, purchases, links. ✅ `E_PARENT_GATE_REQUIRED`.
- **Reward effort, not speed.** Three stars in ages 2–5 always.
- **Ads only in the break after a round,** never during play. ✅ the round lifecycle is the platform's, not the game's; limits by channel (`E_ADS_LIMITS`).

## Everyone

- **Color is never the only signal.** A "bad" target differs by shape or emoji too.
- **Works in portrait and landscape, for left- and right-handed players.** ✅ QA runs three screen sizes and rotates mid-round.
- **No dark patterns:** no energy, no loss-framed daily streaks (a missed day never takes anything away; 13+ games may show a calendar of solved days), no push, no purchases inside a round. For children: no ads the child can choose at all (no rewarded ads on child channels).
- **Rewarded ads (13+ only) are an offer, never a toll.** A button that says what the player gets ("▶ Continue (ad)", "×2 coins"), the reward always comes after a finished ad, and everything in the game can be reached without one. ✅ `app.rewarded()` / `host.rewarded()` refuse an ad that doesn't follow the player's tap.
- **Content without unfair randomness:** items come from a shuffled bag (✅ each once, no back-to-back repeats).

## Each game is its own game

Google Play's Repetitive Content policy bans near-identical apps, and a ban takes down the whole account.
- Change at least the content, the texts and the stickers.
- Preferably change the mechanic or trajectory too.
- Use your own store screenshots.
- Release a kit's games no more often than every 2–4 weeks.

## Originality: what portals reject

Portals review the **concept**, not only the build. CrazyGames rejects "unoriginal content (clones or asset flips)" and
wants games "clearly distinguishable from existing games"; Poki asks whether a game is "unique enough among the category".
Petri Panic (QmaCyber/game2) — polished, tested, correctly integrated — was rejected with *"The concept is quite close to
existing titles"*: a live game, Cell Survivor, was a survivors-like **with the same theme** (a cell against germs), next to
about 20 more "X Survivors". A popular genre is where the competition is, not a free pass.

Before building, in this order (the answers go into `concept` in game.yaml; the validator requires it on CrazyGames):
1. **Search the portal** for the genre *and* the theme (`site:crazygames.com <genre> <theme>`, the tag pages, the top of the
   category). List the closest games honestly in `concept.closest` — the reviewer will find them anyway.
   The validator knows the genre + theme pairs we found live (`packages/spec/src/taken.ts`) and warns with their titles
   (`W_CONCEPT_TAKEN`); add what your own search finds to that list.
2. **If a live game shares both genre and theme, change one of them fundamentally.** A new theme on a crowded genre is
   thin; a new theme on a taken theme is a clone.
3. **Say the difference as something the player does** (`concept.different`): a new rule, input or goal, or a new
   combination of mechanics — "you only move the light, never the walker". A new setting, art style, name or colour is
   not a difference (`W_CONCEPT_THEME`).
4. **Show it in the first 30 seconds** and in the preview video: QA plays briefly and players judge the cover and the video.
5. **A name of its own**: not a common word ("Chess" — "Super Chess" is fine), no one else's IP, not the "X Survivors / X.io"
   pattern next to twenty others (`E_TITLE_GENERIC`). And a name players recognise: a hook of the genre (*brawl, defense, merge, drift*) + a word of its own — `gp name`, [naming.md](naming.md) (W_TITLE_HOOK).

**How it looks done well — Germ Bait (QmaCyber/game6, `docs/concept.md`):** the brief named three ideas; the search found a
close live match for each (draw walls against waves → Draw Defense; one-tap chain reaction → Chill Reaction, June 2026;
a growing colony → Celloid, Colony, Paper.io 2), so a fourth was chosen — "you don't fight the swarm, you steer its
appetite, and the bait feeds the enemy". The note is a table: each idea, what the portal has, the verdict; then the
chosen idea against its neighbours by *what the player does*, *how enemies die* and *what the risk is*. Keep such a
note next to the game (`docs/concept.md`) and put its conclusion into `concept`. Search results are not the catalogue:
say so in the report.

Signs of "looks like a prototype" (another real rejection): mixed art styles or resolutions, placeholder shapes, a single
enemy type, no end goal, sounds at uneven levels, glyphs that render differently per platform (use inline SVG icons).

## Depth: from a simple core to 10+ minutes

A good core keeps a player for a minute; depth keeps them for ten. The techniques that shipped games prove, cheapest first
(evidence and sources for all 20: [market-depth-2026-09.md](../research/market-depth-2026-09.md#2-depth-that-keeps-players-10-minutes)):

| Technique | What it is | Cost on the platform |
|---|---|---|
| **Meta progression in the genre's shape** — and **more than one track** | what a run buys, chosen for the genre ([upgrades.md](upgrades.md#1-pick-a-shape)): new heroes or tools that play differently (`Roster`), tiers that open the next set (`Tiers`), gains with a cost (`PactTree`), run choices (`RunChoices`); a "+stat" level shop (`UpgradeShop`) only for idle and launch games. Plus a second track: collection, missions, rank, zones. One track alone is a known weakness (Survivor.io D30 4% vs Archero 11%) | S (the blocks exist), M for the second track |
| **Unlock pacing** | a new *thing* — enemy, zone, rule, character — every 1–3 min of the first 10 min, then at least every 7, not a +5%; the first reward within a minute, never two big ones at once (the balance model checks it: [upgrades.md](upgrades.md#start-from-time-then-the-anchor)) | S (data) |
| **Sawtooth difficulty** | introduce safely → escalate → test at a peak → relief → the next thing; spikes and valleys are the top churn drivers | S (one ramp table, checked by the bot) |
| **Bosses / climaxes** | a scripted peak every few minutes with a *new rule*, `happytime()` on the win | M per boss |
| **Stages with stars** | finite levels, 1–3 stars for doing them *well* (par from the balance bot) | M |
| **Near miss on the results** | show how close the player came ("12 m short of the Pumpkin Farm") | S |
| **Missions, 3 at a time** | short goals ("bounce 5 times in one throw"), finishing one raises a rank | S–M |
| **Run modifiers / tiers after the campaign** | harder rules unlocked one by one (Balatro's stakes: 33.5% of players win Red, 0.8% complete everything) — the cheapest content multiplier | S–M |
| **Endless mode + score, daily seed** | the same seeded run for everyone today; a calendar of solved days, never a punishing streak | S–M |
| **Offline earnings + "welcome back ×2"** | idle and clicker games: CrazyGames calls it one of the highest-converting placements | S |
| **Dynamic difficulty** | offer an easier option after repeated failure (EA: up to +9% engagement) — the player chooses it; a silent adjustment punishes success (the better you play, the harder it gets: Schreiber, *Game Balance Concepts*; Romero & Schreiber, *Game Balance*) | S–M |
| **The session-end hook** | what the player sees at the end of the session that brings them back tomorrow: a goal left in reach (the next purchase 60–80 % paid, a stage nearly cleared), the next unlock shown with its price, the next chapter named — `gp balance` prints it at `money.session.minutes` (*at minute 15: Lithium Candle 82 % paid, 4 of 9 stages*) | S (data) |
| **Story as a reward** | see [story.md](story.md): premise and characters first, chapters only on top of a working loop | M–L |

**The first session, minute by minute** (let the balance bot print it for your game):

| Time | Must happen |
|---|---|
| 0–3 s (Poki) / ≤ 10 s | control in the player's hands, no text tutorial |
| 30–45 s | the first "wow": a big hit, a long flight, a chain |
| ≤ 1 min | the first reward: a stage cleared or a purchase (the balance model checks it) |
| 1–2 min | the first purchase is affordable (after run 1–2: `gp balance` checks it) |
| 2–3 min | the first *new thing*; then one every 1–3 min until minute 10, at least every 7 after |
| 3–5 min | the first peak (a boss or a stage clear), `happytime`, the first midgame ad at that break |
| 5–10 min | the first build-defining choice; a second track opens |
| 10–15 min | a mastery goal in reach (a 3rd star, a rank); a harder tier announced |
| session end | a reason for tomorrow: a daily seed, offline earnings, a goal left at 80% — the session-end hook above, ≥ 60 % reached (`gp balance`) |

**Signs a game will feel repetitive:** a single upgrade track; content that ends with no endgame; empty stretches (a long
glide, waiting for a timer); every run the same first minute; numbers that grow while nothing new appears.

**What open-source games add** ([open-source-games-2026-10.md](../research/open-source-games-2026-10.md): 2048, Hextris,
A Dark Room, js13k winners, Celeste's player code): a sound for every interaction state, varied in pitch; the run saved
on every move and resumed after a reload; forgiving input (a 0.1 s jump grace, buffered presses, corner nudges); a scene
that changes during one run (palette, weather, ambience at minutes 2, 6, 8); music that builds in layers; combos whose
feedback grows, with the timer drawn on the thing itself; the interface that grows with the game; authored wave
patterns with a first-wave grace. `gp lessons` carries them (retention, controls, sound).

## Web portals (CrazyGames, 13+): what players stay for

From the Petri Panic market research (QmaCyber/game2, docs/research-crazygames-2026.md, September 2026, from web search — check the
current numbers on docs.crazygames.com before relying on them):

| Genre on CrazyGames | Average play, min | D1 retention |
|---|---|---|
| Puzzle | 21 | 6.2% |
| Clicker / incremental | 15 | 6.6% |
| Action | 13 | **8.1%** |
| Shooting | 12 | 6.5% |
| .io | 9 | 5.7% |
| Driving | 8.7 | 5.7% |
| Hypercasual | 8.6 | 6.0% |

What each genre's players expect (an idle game's offline earnings and prestige, a puzzle's levels, stars and undo, a
roguelite's run seed and run choices) and which blocks fit it: [genres.md](genres.md) · `gp catalog genres` · `gp explain genre.<g>`.

- **Full Launch needs** about 10 min average play, D1 10–15%, 80%+ of players past the first minute. A pure hypercasual loop
  (the `casual` kit's `tap-score`) is below that on its own: add a reason to come back, or treat it as a quick first game.

### The three Basic Launch metrics: design for them

Basic Launch scores **average playtime, D1 retention and gameplay conversion** (the share who play at least one minute),
**each 1–5 per device class** (Desktop; Mobile and Tablet), against peer games of the category; **Full Launch needs 9 of
15 on a device class**, and a stop is final. Our six launched games scored 4–9 of 15: conversion was 1/5 in every device
score outside the .io game, D1 was 1–3 % (none had a daily at launch), playtime 2.5–6.8 min except Candle Crypt's long runs.
How the scores work and our numbers: [publishing-crazygames.md → Basic Launch](publishing-crazygames.md#basic-launch-the-three-metrics-and-how-they-score);
the causes and the ranked levers: [docs/research/feedback-and-metrics-2026-10.md](../research/feedback-and-metrics-2026-10.md) §3–§4.

| Metric | Design it in | What the platform checks |
|---|---|---|
| **Conversion** (the weakest) | A first visit lands in gameplay: no title gate, story or choice for a new save, at most 1 click (CrazyGames' rule). Control in the hands at once; show the rule, don't write it (≤ 2 short lines, no modal); touch controls drawn from the first frame on a phone (≈ 70 % of plays, half the desktop conversion); a first stage that can't be lost; nothing loud in the first 3 s; a reward inside 15 s | `gp qa`'s first minute (qa/first-minute.json); `gp review` makes each sign `[blocking]` on CrazyGames; `gp lessons`: first-visit-gameplay, mobile-controls-visible, start-sound |
| **D1** | A reason to come back that the player sees: a daily on the title with its state, never a loss-framed streak; the session ends on a goal left at 60–80 %; a story or campaign left open | `money.returns` required on CrazyGames (`E_MONEY_RETURN`); `gp lessons`: daily-visible |
| **Playtime** | Each results screen is an exit: the big button continues, with the next goal named; longer runs with fewer menu exits; content that outlasts the session (acts with their own look, an endless mode that escalates); music; no dominant strategy | music required for code games (`E_SOUND_MUSIC`); `balance.anchor` + `balanceModel()` (the first-session checks); `gp lessons`: results-continue, dominant-strategy, structure |

The scores are relative, so **choose the category on purpose** (the peers it compares you with), and use the Basic Launch
window: updates are approved automatically, so read the dashboard on day 1–2 and patch the first minute and D1 the same day
([docs/team/weekly-loop.md](../team/weekly-loop.md)).
- **What works solo in 2D:** hybrid-casual — a hook in 5 seconds plus meta progression (permanent upgrades between runs):
  survivors-like roguelites, incremental games, sort/merge puzzles, physics launchers. Those need `kit: code` today
  ([code-games.md](code-games.md)).
- **Meta progression carries the session** — in the shape the genre needs, not the same shop in every game (the shapes,
  the blocks and the balance targets: [upgrades.md](upgrades.md)): in the Liquid Swarm case, making one upgrade cheaper
  almost doubled play time. The balance bot's `balance()` report is checked by `gp qa` (first purchase within two runs,
  a meta of 10+ minutes, no trap, no dead purchase). Tune the economy from Basic Launch numbers; keep all tuning in data files.
- **The income is two kinds of ads, both designed in:** midgame ads (40–60% of a casual game's earnings) only at natural breaks
  — after a run or level. CrazyGames requires the first after the tutorial or 3–5 min of play, then at most one per 3 min;
  the platform's channel policy enforces: never in the first 3 minutes, the first at the end of run 3 or after 5 minutes
  of the session (whichever comes first), then at most one per 3 min; and rewarded offers the player chooses: a revive (CrazyGames: at most once per session), ×2 on the results,
  a hint, a trial of something locked. What that is worth, and how to design it: [Design for money](#design-for-money).

## Design for money

The owner's rule: **every new game is designed with its money in view, from the idea on.** Old games are not reworked —
what they did is the data the model starts from (`publisher/results.yaml`). Where a game earns is decided in its
architecture, not after it is built: a game with no natural break can't show a midgame ad, whatever the SDK does.

**The path to money** (CrazyGames; the numbers: [revenue-2026-09.md](../research/revenue-2026-09.md) §7):

| Stage | Days | Revenue | What decides it |
|---|---|---|---|
| QA review | 1–3 | none | quality, compliance, **originality** (Petri Panic was rejected here) — `gp uniqueness` |
| Basic Launch | 7–21 (≥ 7 days and 500 plays) | **none: ads are off** | 1-min conversion (80%+), average playtime (10+ min), D1 (10–15%), against other games |
| Full Launch | from ≈ day 10–34 | ads: midgame at breaks, rewarded by choice | plays/day (48 h on the homepage, then what the algorithm gives), minutes per play, the design's breaks and offers |

Google Play Families: review (2–7 days) → organic installs (most apps never reach 1,000) → interstitials after rounds
(Families limits) and "Remove ads" behind the parent gate. No rewarded ads for children, ever. `web` and general
`android` earn nothing in the platform today (no ad provider / no consent flow).

**The estimate: `gp forecast`.** Step 1, before any code: `gp forecast --idea --channel crazygames --genre idle --session 15
--breaks 4 --rewarded revive,x2 --pitch "…"`; after the design is in game.yaml: `gp forecast` (qa/forecast.md, handed to the
owner in the submission folder). It prints:
- **P(approval)** — the review's pass rate × a factor from the uniqueness score (in idea mode: 80, if built as described, minus
  what a taken concept costs); **P(Full Launch)** — the chance the Basic Launch metrics reach the benchmarks, from the design:
  minutes per play against the 10-min gate, the genre's D1, a reason to return, the meta's length, the upload size and
  **the time to a tappable Play on a slow phone** (from `gp build`'s size report, upload/size.json; `--load <s>` in idea mode);
- **revenue per month in months 1–3** after submission, pessimistic / median / optimistic, *if* it gets there:
  plays/day × share of gross × (midgame per play × fill × eCPM + rewarded per play × fill × eCPM);
  midgame per play = the design's breaks, evenly spaced, run through the channel's ad policy (the same rule the runtime
  uses) and capped by what games achieve per player-hour; rewarded per play = each offer × how often it is shown × the share
  taken, capped per player-hour;
- **on Full Launch: € a month** — a steady 30-day month once the game is there (plays a day × revenue a play × 30, after the homepage week): the plain answer to "what does it earn if it gets there";
- the **expected value** = P(approval) × P(Full Launch) × revenue, and the **three levers** that add the most of it;
- every input it used, with its **confidence** (high · medium · low · very low · judgement). Most are low: CrazyGames publishes
  no pass rates, eCPM or plays. The output is always ranges, and says so; never quote one number.

The inputs are one table, `MONEY_TABLE` in [packages/spec/src/money.ts](../../packages/spec/src/money.ts): replace a row
when better numbers come, nowhere else.

**What moves the money, in the design** (the levers `gp forecast` tries):
1. **Natural breaks every 2–3 min** — a level, a run, a day, a wave set that ends in "Next" or "Play again", with
   `host.adBreak()` on the way in. The portal requires the first midgame after the tutorial or 3–5 min of play, then one
   per 3 min at most; the platform shows it never in the first 3 min, at the 3rd break or after 5 min of the session
   (whichever comes first — a game of 4–5-min runs gets it at its first break after 5 min, not at run 3), then one per
   3 min: a game with a break every 5+ min leaves most of that unused, one with none earns only from rewarded offers.
   Midgame and rewarded together: at most 20 an hour (the portal counts rewarded in).
2. **Rewarded offers that give what the player wants** — a revive (once a session), ×2 on the results, a hint from a "Stuck?"
   panel, a trial of a locked hero. Each optional, a same-size "No thanks", never on the play screen (QA checks). One added
   placement raised Liquid Swarm's revenue by 25%.
3. **A session of 10+ minutes with a meta that outlasts it** — the Basic Launch playtime gate, and more breaks per play.
   The balance bot measures the meta (`balance()`: `gp forecast` reads it).
4. **A reason to return tomorrow** (D1): a daily seed or case, a goal left at 80%, the next chapter — never a loss-framed streak.
5. **Originality** — the review's odds follow `gp uniqueness`.
6. **Small and plain, fast to load:** ≈ 70% of CrazyGames' plays are on phones (lower eCPM, low-end devices): touch
   controls, portrait and landscape, Canvas 2D, an upload under 20 MB (the mobile homepage) — and **into play within
   seconds**: web players decide in the first 10 s ("into fun in under 10 s", [forums-2026-09.md](../research/forums-2026-09.md)),
   and Liquid Swarm lost about a third of its revenue (bounce +5% on low-end devices) to heavier tech. `gp build --target
   crazygames` estimates the time to a tappable Play on a slow phone (1.6 Mbps, 150 ms RTT, 4× CPU) and lists what weighs,
   by npm package; it warns above the channel's budget (CrazyGames: 400 KB gzipped, 3 s). The forecast takes the load time
   into P(Full Launch): no change up to 3 s, then down linearly to × 0.6–0.9 (mid × 0.75) at 10 s and beyond
   (`cg.full.slowLoad`, a **judgement** row: no published number ties load time to the Basic Launch metrics yet). The
   engine lab's one arcade game: Canvas 2D 0.4 s, Pixi 1.9 s, Phaser 3.3 s, Rapier 7.9 s — the same design forecasts
   P(Full Launch) mid 24% at 0.4 s and 21% at 7.9 s. A game that needs a big engine on purpose says so in game.yaml
   (`budget: { gzipKB }`, [code-games.md](code-games.md#the-size-and-load-budget)) and pays for it here.
7. **No ads in Basic Launch:** the game must work and be fun without them — `rewardedAvailable` is false there, so the offers
   disappear; nothing may depend on them.

**The money section in game.yaml** (`gp explain money`; required on a portal for `kit: code`, TODO in the template):

```yaml
money:
  genre: puzzle                  # the benchmarks: average play and D1 per genre
  session: { minutes: 18, breaks: 7, breaksAt: "a night ends → Next night; a tip-over → Try again" }
  rewarded:
    - { placement: hint, kind: hint, gives: "shows one good hook for the next piece" }
    - { placement: rewind, kind: undo, gives: "takes the last piece back" }
  meta: { minutes: 120 }         # gp forecast reads balance() when the game exports it
  returns: { kind: daily, what: "a new night every day" }
```

`gp validate` checks what can be checked: a TODO (`E_MONEY`); no natural break **and** no rewarded offer on a paying channel
with ads on (`E_MONEY_NONE`: the design says it can't show a single ad; turn ads off to say the game isn't
for money); on CrazyGames no reason to return — `returns` missing or `kind: none` (`E_MONEY_RETURN`: D1 is one of the three
Basic Launch scores); rewarded offers where there are none (`E_REWARDED_UNSUPPORTED`: children never); and warnings for no break
(`W_MONEY_BREAKS`), a break only every 20+ min (`W_MONEY_BREAK_GAP`), a session under 10 min on CrazyGames
(`W_MONEY_SESSION`), a meta done within a session (`W_MONEY_META`), no reason to return on another reviewing channel (`W_MONEY_RETURN`), and a portal code
game without the section (`W_MONEY_MISSING`). Whether an offer gives something the player wants can't be checked: say it in
`gives`, and look at it in play.

### Calibration: the model against real results

`publisher/results.yaml` holds what really happened, one entry per game: the portal's verdict, the Basic Launch metrics and
verdict, plays and revenue per day (the schema: [results.ts](../../packages/spec/src/results.ts); `gp validate --all` and
`gp forecast --results` check it). The owner or the game's agent adds the game when the portal answers — forecast.md prints
the lines to paste, with the prediction made at submission. It starts with Petri Panic's rejection.

The rule, one for every quantity: **fewer than 3 recorded outcomes of a kind** — they are shown next to the forecast (what
the model said, what happened, a Brier score for the verdicts), and the ranges stay as the table says. **3 or more** — each
of low / mid / high moves toward what was observed by n / (n + 3): the approval and Full Launch odds toward the recorded
rates, plays/day toward the recorded min / median / max, revenue per play by the median of recorded ÷ predicted. The table
counts as 3 results: three real games pull it half-way, thirty almost all the way. A result without a recorded prediction is
compared with a retro-forecast from what the record says (its concept, genre, uniqueness).

**A game the portal judged before is a resubmission.** Its latest record — Basic Launch `stopped`, or review `rejected` —
caps P(approval) at the recorded resubmissions of its kind (`cg.resubmit.afterStop`, `cg.resubmit.afterReject`; from 3 of a
kind pulled toward their rate like the rest): of the four games sent again after their Basic Launch stopped (2026-10-11/12),
one was approved (Hang the Moon) and three rejected (Spin Brawl, Starsilk, Candle Crypt) — though all four had been approved
the first time. `gp forecast` reads the history by the game's id (`--resubmission after-stop|after-rejection|none` when the
file doesn't know), shows it in "The design it read", and `gp submission --full` warns with the odds. Send a judged game
again only with a change a reviewer sees in the first minute; record the resubmission as a record of its own.
