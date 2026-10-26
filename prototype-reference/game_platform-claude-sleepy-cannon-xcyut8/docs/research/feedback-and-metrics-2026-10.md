# Feedback and Basic Launch metrics: what our 22 portal answers say, and how to raise the three numbers (2026-10-10)

> Research for the owner's request of 2026-10-10: «Изучи все отзывы и все игры которые их получили. Найти взаимосвязи и
> параллели… три параметра… все три улучшать до предела». The three parameters are CrazyGames' Basic Launch metrics that
> decide Full Launch: **average playtime, D1 retention, gameplay conversion**. Each scores 1–5 per device class (Desktop;
> Mobile and Tablet). Full Launch needs **≥ 9 of 15 on a device class**.
>
> Sources: `publisher/results.yaml`, `publisher/updates.yaml`, `publisher/loop-state.yaml`, `publisher/recs/*.md`,
> `publisher/ideas/*.md`; the reviewers' sheet (1X2c9o…, «Лист1», «Принятые рекомендации», «Обновления», read only);
> `packages/cli/src/lessons.ts`, `docs/guides/game-design.md`, `docs/guides/publishing-crazygames.md`,
> `docs/research/*.md`, `docs/team/retro-*.md`, `docs/team/decisions.md`; the game repos game2…game17 (game.yaml,
> REPORT.md, quality.md, qa/report.md at their latest local refs); `packages/core`, `packages/player`, `packages/kit-code`;
> Playgama telemetry (read only); the web (URLs inline).
>
> **Sample warning.** 22 portal verdicts on 20 games; only **6 games have Basic Launch numbers**, 4 of them with the
> per-device scores. Every "goes with" below is a correlation on 2–7 games, not a cause. Where a claim rests on one game,
> it says so.

## 1. How the three metrics are measured (what we know, what we don't)

| Metric | CrazyGames' definition | Benchmark in the docs | What we infer from our score screens |
|---|---|---|---|
| Average playtime | "The average time a player spends in your game in a single session" | "Successful titles often see 10+ minutes" | Candle Crypt desktop: 9m31s → **4**, score 5 starts at **12m13s**. Mobile: 4m19s–5m28s → **2** (three games) |
| D1 retention | Share of players who return the day after their first session; shows one day late | "Strong games often achieve 10–15%" | Candle desktop 2.96 % → **2**, score 3 starts at **3.94 %**. Mobile 1.68 % → 2 (Hang the Moon), 1.84 % → 2 (Starsilk) but 1.83 % → **1** (Spin Brawl). The bar is low in absolute terms: about 4 % already scores 3 |
| Gameplay conversion | "The percentage of players who play for at least one minute after starting the game" | "Top titles typically convert 80%+, load in under 10 seconds, build below 20 MB" | Candle desktop 51.25 % → **1**, score 2 starts at **54.00 %**. But Spin Brawl mobile 51.69 % → **4**. Hang the Moon mobile 30.96 % → 1, Starsilk mobile 26.26 % → 1 |

Sources: [Basic Launch guide](https://docs.crazygames.com/resources/basic-launch-metrics/) ("KPI tracking is automatic, no
SDK is needed"; "Updates are automatically approved, and their impact appears in your data with the daily dashboard
refresh"); [gameplay requirements](https://docs.crazygames.com/requirements/gameplay/) ("Games should land new users in
gameplay immediately… a maximum of 1 click"); [quality guidelines](https://docs.crazygames.com/requirements/quality/)
("Provide a simple onboarding phase where new users land directly", "Implement the onboarding in gameplay"). A developer's
reading of conversion: "plays lasting at least 1 minute compared to 'Play Now' button clicks"
([Reit Games, Puckit](https://reitgames.com/news/puckit-100k-gameplay)).

**What follows from this:**
- **The benchmarks are relative: by category and by device class.** The same ~51.5 % conversion scores 4 for an .io game
  on mobile and 1 for Candle Crypt on desktop. The same ~1.83 % D1 scores 1 for the .io game and 2 for Starsilk. So each
  score is a rank against the games CrazyGames compares us with ("benchmarked against other games on the platform"). The
  category we submit under chooses the peer group. Larss moved from Strategy to Puzzle for that reason
  ([devlog](https://fxf8.itch.io/larss-io/devlog/1586849/launching-a-1v1-strategy-game-on-crazygames-04-ctr-and-what-im-learning)).
  (2 data points: inference, not documented.)
- **Conversion is measured without our SDK.** No SDK is needed, so the portal counts time from the portal's start of
  the game, presumably the Play Now click. It does not count from our `gameplayStart`. Our loading, title screen, Play
  click, story and tutorial all fall inside that minute. Not documented: whether menu time counts as play, and whether
  an integrated SDK's `gameplayStart` changes anything. Treat both as unknown.
- **The window is ≈ 7 days**, because our games reach 500 plays fast (Spin Brawl had 695 plays by day 4). A game under 500
  plays gets up to 21 days (Nimbus Drift: until 10-22). Updates in Basic Launch are auto-approved and show up the next day.
  The Basic Launch period is meant for iterating, and only Candle Crypt used it.
- **A stopped Basic Launch is final.** The game comes back only "as a new game including significant improvements".
  Every Basic Launch is one shot, so the first minute must be right before it starts.

## 2. Every game and its feedback

### 2.1 Portal verdicts and metrics

Plays/time/D1/conversion of 10-04 come from the owner's dashboard screenshot (both device classes together). The
final numbers come from the CrazyGames emails of 10-09 and the score screen of 10-10.

| Game (repo) | Genre / core | Verdict (date) | 10-04: plays · time · D1 · conv | Final Desktop: time · D1 · conv → score | Final Mobile: time · D1 · conv → score |
|---|---|---|---|---|---|
| Spin Brawl (game3) | .io, real online multiplayer, push tops off an arena | approved 10-01 → **stopped 10-09** | 695 · 6:42 · 1.32 % · **68 %** | 6.77 min · 2.42 % · **75.87 %** → **8/15** | 5m28s (2) · 1.83 % (1) · 51.69 % (4) → 7/15 |
| Hang the Moon (game7) | calm physics puzzle, 30 hand-made nights | approved 10-01 → **stopped 10-09** | 204 · 4:04 · 1.04 % · 42 % | 4.02 · 2.37 % · 60.73 % → 5/15 | 4m19s (2) · 1.68 % (2) · 30.96 % (1) → 5/15 |
| Starsilk (game11) | action maze, lasso shadows with a thread, 15 depths | approved 10-01 → **stopped 10-09** | 168 · 4:45 · 3.53 % · 32 % | 4.25 · 1.16 % · 51.79 % → 4/15 | 4m59s (2) · 1.84 % (2) · 26.26 % (1) → 5/15 |
| Candle Crypt (game9) | pixel roguelike shooter, long runs, big meta, story | approved 10-02 → **pending** | 117 · **11:41** · 2.50 % · 34 % | 9m31s (4) · 2.96 % (2) · 51.25 % (1) → 7/15 | 5 · 3 · 1 → **9/15 "will be enabled"** |
| Dread Throne (game10) | tower defense, turn rooms mid-fight, comic story | approved 10-01 → pending | 118 · 4:08 · **3.92 %** · 20 % | — | — |
| Nimbus Drift (game8) | calm grid puzzle, levels | approved 10-01 → pending (to 10-22) | 123 · 2:28 · 1.75 % · 29 % | — | — |
| Potion Logic (game5) | potion-riddle puzzle, nights, story (remake of Brew & Banter) | approved 10-06 → pending | — | — | — |
| Petri Panic (game2) | survivors-like, cell vs germs | **concept** 09-30 | | | |
| Kite Royale (game6) | .io kite-fight battle royale | **concept** 10-05 | | | |
| Yeet the Gnome (game4) | launch-for-distance + upgrades | quality 10-01 | | | |
| Brew & Banter (game5) | cozy tap clicker + 12-chapter story | quality 10-01 | | | |
| Germ Line (game6) | lure germs into hazards, 12 dishes | quality 10-01 | | | |
| Echoflies (game12) | echo-loop collecting | quality 10-02 | | | |
| Secret House Tycoon (game18) | house-flipping sandbox from a long TZ | quality 10-05 | | | |
| Blackout Craft (game16) | survival sandbox (TZ), English only, no music | quality 10-05 | | | |
| Kettlebot (game13) | heat-grid robot roguelite, no music | quality 10-05 | | | |
| Gnome Sort (game4) | sort puzzle with a weight rule, no music, emoji helpers | quality 10-05 | | | |
| Sigil Clash (game17) | draw alchemy signs as combat, no music | quality 10-06 | | | |
| Alien Scan Logic (game15) | Papers-Please-like checkpoint | quality 10-06 | | | |
| Rivet Clash (game14) | 3v3 robot-part tactics, no music | quality 10-06 | | | |
| Scrap Royale (game2) | magnet .io arena, no music | quality 10-06 | | | |
| Firefly Rush (game12) | Echoflies remake, acts, bosses, music | quality 10-06 | | | |

Cover CTR on the 10-04 dashboard was 0.6–1.2 % for every game (target 2–4 %). CTR is not one of the three metrics, but
it decides how fast a game reaches 500 plays.

### 2.2 What the people who judged them said (summarized; verbatim texts are in `publisher/recs/` and the sheet)

| Game | Reviewers (Свин, Ера, unnamed) | Owner (Жаслан) / contest jury |
|---|---|---|
| Dread Throne | more fixture variety (≥ 15 more), visible upgrades, animated enemies, rotate only by button, unlocks by progress, balance (too easy mid-game), comic story, a shop instead of the side panel, more stages, **music + sliders**, RU/EN, new graphics, **the battle button is dead for 2 s at the start**, endless mode; 10-10: icons too loud, upgrade button doesn't light up, bigger shop pictures, **"too easy", endless doesn't escalate** | — |
| Starsilk | **"too quickly finished"**: more levels, mechanics, monsters; unwinnable moth levels; untie by Reel; many languages; a frozen-star bug | — |
| Candle Crypt | faces instead of avatars, detailed map and minimap, **volume sliders**, UI bars off screen, drop item, RU/ES, broken scrolls; 10-10: 16 items (chest shadow, **melee damage too low**, stuck in wall, entry room mark, secret rooms, difficulty choice per dungeon, **emoji → drawn icons**, a vanishing weapon …) | jury: **animations, melee variety**; owner: **outdated phone controls**, dice area, **"lags on the phone"**, **"the tutorial is too intrusive, make it simpler"**, 32 px pixel art, "beautiful graphics and strong gameplay matter most" |
| Spin Brawl | royale mode, 50-player arena with traps and boosts, skins, layout, upgrades by mass with rarity; 500-mass cap and unkillable builds, icons, more traps; 10-10: **mass lost too fast**, **music**, hit-sound variety, spikes, bigger map, Photon online with a bots/players choice, fewer upgrades, **no visible stick on phones**, rarity effects, compact phone panel | owner: "hype and simple, like Spin Brawl" is the model he asks for |
| Hang the Moon | real Solar System planets with names, **many languages incl. Russian, music + sliders** | — |
| Nimbus Drift | **music + slider, languages incl. Russian, more levels and chapters, each chapter its own obstacles/plants/look; 10 acts × 30 levels** | — |
| Echoflies / Firefly Rush | enemy variety, bosses, a 1-of-3 choice after each level, **acts instead of a flat run of levels**; **music** | owner: **"too simple, just fly and collect"** |
| Kettlebot | "redo the whole visual design… looks like a children's prototype" (12-point art brief) | — |
| Alien Scan Logic | too few interactive tools, more checks and dialogues (Papers, Please; Quarantine Zone), new graphics | 80+ prepared characters, more checks, space cyberpunk look |
| Rivet Clash (Splicebound) | **"make it smoother: jerky actions, a flash on every menu choice"; "a proper tutorial"** | complete redesign, robots, rarity, a story, a tutorial building the first robot |
| Sigil Clash | the white blinding screen after a ritual (lingering effects) | — |
| Potion Logic | **a deafening boil sound at the start** → a softer bubbling | "unclear what to brew: make it readable without text; brewing more interesting" |
| Secret House Tycoon | a cat blocks a sale, distinct cleaning tools, free furniture placement, wrong icon, paint bugs | "add hype" |
| Kite Royale | — | "flying low always wins": a dominant strategy |
| Yeet / Gnome Sort, Petri / Scrap Royale, game6 | — | "update the platform, a unique concept, new sprites, something trendy and simple"; "Petri Defense is crap", "Shade Clash I don't like" |
| Galaga roguelite (game20) | — | 10-10: «ты везде засовываешь систему прокачки» — decide what progression the genre needs first |

### 2.3 What each launched game did in its first minute and after (the part the metrics see)

| Game (version in Basic Launch) | Load → first screen | Before the first action | Safe start? | Meta / session | Return hook at launch | Music at launch |
|---|---|---|---|---|---|---|
| Spin Brawl 1.0 → 0.2/0.3 (uploaded 10-03) | ≈ 0.4 s, title + Play | none: Play → arena | spawn shield | run choices by mass, ranks; lives ≈ 36 s median, Play again | none (daily challenges came in 10-10 work) | **no** |
| Hang the Moon 1.0 | 0.2 s, title (Play, Nights, Sound) | a tutorial hand | yes (easy nights) | 30 nights, stars | **none** | **no** |
| Nimbus Drift 1.0 | 0.1 s, title | hints | yes | levels, stars | **none** | **no** |
| Starsilk 1.0 (1.1 not uploaded) | 0.1 s, title "Descend · Depth 1" | **a modal prologue line**; depth 1 could bite | **no** (2.0 made it so) | Loom shop, 15 depths, "finished too quickly" | **none** | **no** |
| Candle Crypt 1.0–1.3 → 1.4.x (10-03/04) | 0.2 s, title | 1.0–1.3: **a prologue scene + a controls card**; 1.4.1: one hint at a time | start room safe | long runs (2 breaks in 16 min), gems → candles, weapons, journal | meta only | yes (1.3 sliders) |
| Dread Throne 1.0 → 1.2 (10-03) | 0.3 s, title | a TD build phase; **battle button dead 2 s** | build first | 6 → 12 stages, pacts, comics | story (next chapter) | 1.0 no, 1.2 yes |

Loading was never the problem: uploads were 57–200 KB gzipped, with Play tappable in 0.1–0.4 s in QA and ≈ 1.3–1.6 s
estimated on a slow phone. Poki's data shows load matters only when it reaches tens of MB: Stickman Hook went from 29.5 s
and 50 % conversion to 3.7 s and 72 % ([Poki blog](https://poki.com/blog/what-makes-high-quality-browser-game)).

## 3. Connections and parallels

### 3.1 Remarks that recur across games (count = games)

| Remark | Games | In `gp lessons` | Platform tool |
|---|---|---|---|
| No music / no volume sliders | Dread, Firefly, Hang, Nimbus, Spin, Candle (+ the reviewer agent's [nice] in Scrap, Gnome, Kettlebot, Rivet, Blackout, Sigil) | `sound` | `@gp/core/sound` exists; **nothing requires it** |
| Too little variety / too short / too easy | Dread ×2, Starsilk, Echoflies, Alien Scan, Nimbus, Firefly ("too simple"), Kite (dominant strategy) | `variety`, `structure`, `balance` | balance model, Roster/Tiers/RunChoices |
| Languages incl. Russian | Dread, Starsilk, Candle, Hang, Nimbus | `languages` | `@gp/core/i18n`, picker (D76) |
| Visuals: prototype / children's look / redo graphics | Kettlebot, Splicebound, Alien Scan, Dread, Candle, Yeet | `art-direction` | `@gp/art`, `gp art` |
| Phone controls bad or invisible; phone lag | Candle (controls, lag), Spin (no visible stick), Dread (rotate on tap) | `controls` | QA touch sizes; nothing checks that the stick is visible or that the game runs at 4× CPU |
| Tutorial missing or too intrusive | Rivet, Splicebound, Candle | `onboarding` | QA counts words |
| Bugs a player meets | Starsilk, Candle ×2, Sigil, Secret House, Spin (mass) | `bugs` | QA console errors |
| UI unfinished (off screen, dead button, small pictures) | Candle, Dread ×2, Spin | `ui-layout` | QA layout checks |
| Sound too loud at start / not varied | Potion Logic, Spin | — | none |
| Smoothness, screen flashes | Rivet, Sigil | `smooth` | QA fps |

### 3.2 Approval vs rejection

| Pattern | Approved (7) | Rejected for quality (13) | Reading |
|---|---|---|---|
| **When submitted** | 5 of 9 in the first batch (09-30/10-01) | 10 of 13 in the second batch (10-02…06: 2 approved, 10 quality, 1 concept) | The second batch was better made (`@gp/art`, 10 languages, QA 200+/200+, `gp review` 0 blocking), yet passed less often. Possible causes: an account that sent 13 games in 5 days; three remakes renamed inside one repo (Gnome Sort, Firefly Rush, Scrap Royale; Potion Logic passed); a shared "platform look". CrazyGames warns that "repeated non-compliant submissions can restrict the account". **Unproven, but the cheapest risk to remove** |
| **Scope** | small-scope games with one rule (Hang, Nimbus, Starsilk, Spin, Potion), or a game with a lot of hand-made content (Candle, a contest game; Dread after 3 rounds) | 5 of 13 were broad "systems" games made from long reference specs (TZs) in 1–3 h (Blackout Craft survival sandbox, Secret House tycoon sandbox, Alien Scan papers-please, Rivet Clash 3v3 robot builder, Kettlebot heat-grid roguelite) | A big scope done in a few hours of procedural art reads as a prototype. CrazyGames' own wording: "needs content and polishing… looks like a prototype" |
| **Music** | Candle and Dread 1.2 had music; Spin, Hang, Nimbus and Starsilk 1.0 didn't (first batch) | **6 of the 10 second-batch quality rejections had no music** (the reviewer agent's [nice], unfixed); Firefly Rush had music and was rejected | Since 10-02 every approved game had music (Candle, Potion Logic). Weak signal, cheap fix |
| **Placeholder signs the reviewer agent left as [nice]** | — | emoji helpers (Gnome Sort), plain-list meta screens (Firefly, Kite, Hang's stock shop), text-only onboarding (Sigil, Firefly ≈ 85-word hints), empty half-screens (Kettlebot, Blackout, Rivet, Alien Scan), off-style platform sheets (language picker, dialogue: Kettlebot, Rivet), static title (Gnome Sort) | Our "[nice]" list is close to what a portal QA would call "overall quality". `gp review` lets them through |
| **Concept rejections** | — | Petri Panic (survivors-like with a taken theme), Kite Royale (an .io game next to Powerline.io, Slither.io and our own Spin Brawl) | .io is crowded: 2 of 3 .io concepts drew a concept rejection or a quality one (Scrap Royale) |

### 3.3 What goes with each metric (n = 6; directions, not laws)

| Metric | Better | Worse | Trait that differs |
|---|---|---|---|
| Playtime | Candle 9.5–11.7 min, Spin 6.8 | Nimbus 2.5, Hang 4.0, Dread 4.1, Starsilk 4.3 | **Long runs with few exits and a big meta** (Candle: 2 breaks in a 16-min session; Spin: instant Play again in an endless arena) vs **short levels with a results/menu screen after each** (Hang 14 breaks per 15 min) and **finite content** ("finished too quickly", 15–30 levels). CrazyGames puzzle games average 21 min, but those are long level ladders or endless modes |
| D1 | Dread 3.92 %, Starsilk 3.53 %, Candle 2.5–2.96 % | Hang 1.04 %, Spin 1.32 %, Nimbus 1.75 % | The three with **a story or campaign left unfinished** (next comic chapter, next depth, next candle) return more than the pure puzzles and the arena. **No game had a daily or a "tomorrow" hook** at launch. Everything is far below the platform average (6.7 %) |
| Conversion | Spin 68 % (76 desktop / 52 mobile) | Dread 20 %, Nimbus 29 %, Starsilk 32 %, Candle 34 %, Hang 42 % | **Control in the player's hands at once, a world that moves, nothing to read** (the arena) vs a build phase (TD), a puzzle grid to understand, a modal prologue, a prologue + controls card (Candle 1.0–1.3), a tutorial hand on a still scene. **Mobile converts about half as well as desktop** (Hang 31 vs 61, Starsilk 26 vs 52, Spin 52 vs 76). About 70 % of plays are mobile, so the combined number follows mobile |

The strongest single finding: **outside the .io game, conversion scored 1/5 in all 4 per-metric device scores we know**
(Candle desktop and mobile, Hang the Moon mobile, Starsilk mobile). It is the one metric where we sit far below our peer
group. A 1 → 3 on conversion is +2 points on both device classes. That
alone would take Candle Crypt desktop from 7 to 9 (Full Launch).

## 4. The three metrics: causes and levers

Ranked by expected effect on the score, then by effort. **[has]** = the platform already has it (often as advice only);
**[new]** = to build. P = platform (every game), G = per-game design.

### 4.1 Gameplay conversion (≥ 1 min played)

**Our numbers:** desktop 51–76 %, mobile 26–52 %. In Candle's category on desktop, even 54 % scores only 2/5.

**Causes we see:**
1. **A gate before play.** Every game starts on a title screen with a Play button. The platform requires it: QA checks
   "first screen: the Play button has data-gp="play"" (`packages/kit-code/qa/suite.ts` ≈ l. 413), and the template starts
   in `state = 'title'` (`templates/game-repo/games/__ID__/main.ts` l. 37). On CrazyGames the portal's Play Now already
   counts as the click, so our Play is a second gate. The docs say to land new users in gameplay immediately.
2. **Reading before doing.** Starsilk 1.0 had a modal prologue. Candle 1.0–1.3 had a prologue scene and a controls card.
   Firefly's hints ran to 85 words, Sigil's onboarding is text banners, and Dread's battle button was dead for 2 s.
   Larss: "'Play now' into a tutorial was killing conversion".
3. **Mobile.** Spin Brawl's stick was invisible on phones; Candle's phone controls were "outdated" and it "lags on the
   phone"; Hang the Moon's touch is "touch to preview, lift to hang". Halved mobile conversion is the biggest gap in the data.
4. **A still first screen.** QA forbids the game loop on menus. The title is a picture, and the reviewer flagged
   "the title is still a still picture" (Gnome Sort).
5. **First seconds that punish** (sound): Potion Logic's "deafening" boil at the start.
6. **No funnel.** We cannot see where in the first 60 s players leave. The dashboard gives one number a day.

| # | Lever | P/G | Status | Where / what | Effect |
|---|---|---|---|---|---|
| C1 | **First visit lands in gameplay.** With no save, the game boots straight into a safe first run. The title appears after the first run or on pause, or as an overlay that fades on the first input. QA accepts "gameplayStart within N s of load, no click" as the best case and flags a Play gate on first visit as a warning on `crazygames` | P | [new] | `templates/game-repo/games/__ID__/main.ts` (start in a lesson run when `host.load()` is the default), `docs/examples/code/main.ts`, `packages/kit-code/qa/suite.ts` (the Play-button check l. ≈ 413 and `runFirstMinute` l. 1621+: measure load → gameplayStart), `packages/cli/src/review.ts` l. 222 | **high**: the documented rule, the Larss and Cyber Gomoku cases, and our .io game (no reading) converts best |
| C2 | **A first-minute funnel we can read.** Host events `boot`, `title`, `firstInput`, `gameplayStart`, `play15/30/60`, `firstFail`, `firstResults` and `exit` (the last screen on `pagehide`) on the event bus, which already says "QA and (later) analytics listen". Forward them to Playgama telemetry: the Bridge already emits `gameplay_30s` / `gameplay_60s`, seen on Candle Crypt's draft. Then run every new game on the **Playgama sandbox with paid traffic before CrazyGames** (the owner decides the budget: `start_sandbox_traffic` spends money). Basic Launch then stops being the first measurement of a one-shot | P | [new] (Bridge events [has]) | `packages/core/src/events.ts`, `packages/core/src/host.ts` (`gameplay()`, `pause('hidden')`), `packages/core/src/portal.ts` (Playgama adapter); a `gp funnel <id>` reading `get_game_telemetry_*` | **high** (enables every other lever; a 1-min conversion measured before the one-shot launch) |
| C3 | **Mobile first minute as a gate.** In `runFirstMinute`: a naive touch bot (random taps and drags for 30 s) must reach a run event; the on-screen stick/buttons must be visible at the first frame; fps at 4× CPU in the first 30 s; the start's loudness (no sound over a cap in the first 3 s). On `crazygames`, make blocking: idle loss < 12 s, no run within 8 s of Play, > 25 words before the first action, invisible touch controls | P | info lines [has], gates [new] | `packages/kit-code/qa/suite.ts` (`FirstMinute`, `runFirstMinute`), `packages/cli/src/review.ts` l. 549–563 | high (mobile is ~70 % of plays and converts at half the desktop rate) |
| C4 | **A lesson-run block.** The first stage can't be lost, the first threat sleeps, one hint at a time when an action is first needed, and the first celebrated moment within 5–15 s. Today each game rebuilds it (Starsilk 2.0 `DepthDef.lesson`, Spin's spawn shield, Hang's two-Moon night 1, Candle 1.4.1 hints); Dread asked for a "tutorial tips helper" | P | [new] (lessons [has]) | `@gp/core`: `firstRun` (no save yet), `hints({ once, queue, neverOverModal })` | medium-high |
| C5 | **A live title behind Play.** Allow a cheap attract loop (the world idling, a demo-bot run muted) instead of a still picture; QA's "no loop on menus" becomes "≤ N ms per frame on menus" | P | [new] | `packages/kit-code/qa/suite.ts` (the menu-loop check), the template | medium |
| C6 | **Theme the platform's DOM widgets per game** (language sheet, shop list, dialogue sheet, settings). Reviewers flagged them as off-style | P | partly [has] (CSS vars) | `packages/core/src/lang-picker.ts`, `shop-ui.ts`, `dialogue-ui.ts`: one `theme` object from game.yaml/art | low on conversion, medium on moderation |
| C7 | **SDK init without blocking the first frame.** `boot()` awaits `portal.init()` (CrazyGames: script up to 8 s + init up to 8 s) before the game module starts. Draw the first frame while it loads and queue the SDK calls | P | [new] | `packages/player/src/boot.ts` l. 22–26, `packages/core/src/portal.ts` l. 94–100 | low normally, high on bad networks |
| G1 | Control in the hands at once: the core action is the first thing on screen; no build phase, story or choice before it (a TD starts mid-wave with one tower placed) | G | lessons [has] | game | high |
| G2 | Show the rule, don't write it: one ghost-hand or glow, ≤ 6 words, gone on the first success (Potion Logic 2.2's gauges after "unclear without reading") | G | lessons [has] | game | high |
| G3 | A reward inside 15 s and a "wow" inside 45 s (a knockout, a chain, a discovery) | G | QA measures `firstHighlightSec` [has] | game | medium |
| G4 | Phone-first controls: a visible stick or drag, auto-aim/auto-attack where aiming is a chore, buttons in a thumb arc (Candle 1.4) | G | lessons [has] | game | high on mobile |

### 4.2 Average playtime (per session)

**Our numbers:** 2.5–6.8 min, with Candle Crypt at 9.5–11.7 min. Desktop score 5 starts at 12m13s in Candle's category;
the three stopped games scored 2/5 on mobile.

**Causes:** finite content that ends inside a session ("finished too quickly", 15–30 levels); an exit screen every 1–2
min (results → Menu); nothing new after the first minutes ("too simple, just fly and collect"); dominant strategies
(Kite) and too-easy stretches (Dread); silence (no music in 4 of 6 launched games).

| # | Lever | P/G | Status | Where / what | Effect |
|---|---|---|---|---|---|
| T1 | **The results screen launches the next run.** The big button is Next, with the next goal named (from the balance model's session-end hook). Optionally it auto-continues in 3–5 s on level games, and a 1-of-3 choice comes before the next level. Menu stays small. A `mountResults()` block with these rules, plus a QA check: "results: the primary action continues play" | P | [new] (hook data [has]) | `@gp/core` (next to `rewarded-button.ts`, `balance-model.ts`), `packages/kit-code/qa/suite.ts` | **high** (each results screen is an exit; Hang had 14 per session) |
| T2 | **Pace from time, enforced.** `balance.anchor` + `balanceModel()` exist; on `crazygames` make the anchor required (W_BALANCE_ANCHOR → error) and fail QA when the first 10 min have a gap without news > 3 min, or the meta ends < 60 min | P | [has] as warnings | `packages/spec/src/money.ts`, `errors.ts`, `gp balance` | high |
| T3 | **Content that outlasts the first session:** an endless or escalating mode after the campaign ("endless doesn't escalate": Dread) and acts with their own look (Nimbus' "10 acts × 30 levels") | G | lessons `structure` [has] | game | high |
| T4 | **Music required on a portal.** `@gp/core/sound` has `createMusic`, themes and ambience; validate warns (W) and `gp review` treats "no music" as [blocking] on `crazygames` | P | blocks [has], rule [new] | `packages/spec` (a `W_SOUND_MUSIC` from the entry's imports or a `sound.music` field), `packages/cli/src/review.ts` | medium (asked for in 6 games; QA can't hear) |
| T5 | **Longer runs with fewer menu exits** where the genre allows (Candle: 16-min runs); a run saved on every move and resumed after a reload (lesson [has], no helper) | G / P | lesson [has], helper [new] | `@gp/core` `saveRun/loadRun` | medium |
| T6 | Fix dominant strategies and easy stretches with the balance bot (Kite low flight, Dread "too easy", Spin "mass lost too fast") | G | balance model [has] | game | medium |

### 4.3 D1 retention

**Our numbers:** 1.0–3.9 % (platform average 6.7 %, "strong" 10–15 %). In Candle's category on desktop, 3.94 % already
scores 3. **None of the launched games had a daily or a stated "tomorrow" at launch**; the money section with
`returns` came after them.

| # | Lever | P/G | Status | Where / what | Effect |
|---|---|---|---|---|---|
| R1 | **A daily on every portal game, visible on the title** ("Daily ✓ · new in 6 h"), with a reward the first time each day, never a loss-framed streak (D56) | P/G | `@gp/core/daily` [has], `money.returns` warns (W_MONEY_RETURN) | make `returns` required on `crazygames` (error), QA: the title shows the daily's state | **high** (+1–2 pp is +1 point) |
| R2 | **The session ends on an unfinished goal shown on the last screen**: "Lithium Candle 82 % paid", "the next chapter: …". `gp balance` prints it; nothing makes the game show it | P | data [has], display [new] | `mountResults()` (T1) takes `balanceModel().sessionEnd` | high |
| R3 | **Welcome back.** On a return visit (the save's `lastDay` ≠ today), open on a short "welcome back" card: today's daily, the goal left, what's new since the last visit | P | [new] | `@gp/core` (`daily.ts` + host load) | medium |
| R4 | **Resume the run after a reload** (2048, Hextris) | P | lesson [has], helper [new] | `saveRun/loadRun` (T5) | medium |
| R5 | **A story or campaign left open** (the D1 leaders had one), short, as a reward on top of the loop | G | `gp story` [has] | game | medium |
| R6 | **Fix bugs and rough edges** (CrazyGames' own D1 tip): the 10-10 Candle list has 16 items | G | QA [has] | game | medium |
| R7 | **Ads off in Basic Launch**, and the first midgame after level 3–4 in Full Launch "to protect D1" ([CG midgame pacing](https://docs.crazygames.com/resources/midgame-ads-pacing/)) | P | [has] (D36) | — | already done |

### 4.4 The Basic Launch window itself

| # | Lever | Status | What |
|---|---|---|---|
| B1 | **A Basic Launch playbook**: day 1–2 read the dashboard → ship the first-minute and D1 patch the same day (auto-approved) → day 4 read again. With 500 plays reached on day 4 (Spin Brawl), there is time for 2 patches | [new] in `docs/team/weekly-loop.md` | Candle Crypt is the only game that patched during Basic Launch; it is also the only one with a score that will be enabled |
| B2 | **Pick the category on purpose.** Scores are relative to a peer group; submit where our numbers rank (Larss: Strategy → Puzzle). Record the category in `results.yaml` to learn it | [new] field | low confidence, free |
| B3 | **Candle Crypt now (desktop 7 → 9):** conversion +2.75 pp (51.25 → 54 %) = +1; D1 +1 pp (2.96 → 3.94 %) = +1. Do it with a first visit straight into the first room (no title), a visible daily or "next candle 80 %" line on death, and the 16 Свин fixes | G | the cheapest Full Launch we have |

## 5. Moderation: what gets games approved, and what to change in `gp review` / `gp lessons`

**What CrazyGames checks** ([quality](https://docs.crazygames.com/requirements/quality/),
[FAQ](https://docs.crazygames.com/faq/), our research §3, §15): works smoothly, fun to play, clear goals, onboarding in
play, consistent art and resolution, even audio, "clearly distinguishable from existing games". Their reported
rejections: "close to existing titles", "looks like a prototype", "not unique enough".

**Our rejection patterns:** (1) a concept next to live titles (Petri, Kite; 2 of 22); (2) "overall quality" (13 of
22), mostly in the second, dense batch. Those games had what our own reviewer called [nice]: no music, emoji or system
glyphs as icons, plain-list meta screens, text onboarding, empty half-screens, off-style platform sheets, static titles,
and videos that don't show the twist. (3) Broad scope from long specs, built fast.

**Checklist: changes to `gp review` (packages/cli/src/review.ts) and `gp lessons` (packages/cli/src/lessons.ts)**
- [ ] Promote to **[blocking] on `crazygames`**: no music; emoji or OS glyphs as game icons; a meta screen that is a plain
  list or the stock shop with no art; onboarding > 2 lines of text or a modal before the first action; a first visit
  that doesn't reach gameplay in ≤ 1 click (C1); touch controls not visible at the first frame; a half-screen empty at
  1280×720 or 360×800; a platform sheet (language, dialogue, shop) unlike the game's style; a preview video whose first 5 s
  don't show the twist.
- [ ] Move the qa/first-minute.json numbers from "hints" to pass/fail lines in the brief (C3).
- [ ] Add the **Basic Launch score table** (§1) and the device split to the brief's "Approval is not the launch" section
  (review.ts l. ≈ 361), so the reviewer plays the phone first.
- [ ] A **scope check** in the brief: count screens and systems around the core; more than 3 systems in a game made in
  under a day is a [blocking] "prototype risk" unless each screen is drawn and animated.
- [ ] New lessons: `start-sound` (Potion Logic's boil; no sound over a level in the first 3 s), `dominant-strategy`
  (Kite's low flight, Kettlebot "plays itself": the bot's dumb strategy must not win), `mobile-controls-visible`
  (Spin Brawl), and add the 10-10 sources: Dread's "too easy / endless doesn't escalate", Candle's 16 items, Nimbus' acts.
- [ ] **Submission pacing** (owner/weekly loop, not code): ≤ 2 new games a week, the strongest first. Don't resubmit
  a remake under a new name in the same repo within days of the rejection. Each game gets its own UI skin, so 20 games
  from one account don't read as one template.
- [ ] A human playtest (Свин/Ера) **before** submission, not after: their remarks overlap the portal's (music, variety,
  phone controls).

## 6. Top 10 actions for the platform (effect on the three metrics × effort)

| Rank | Action | Metric | Effect | Effort | Files |
|---|---|---|---|---|---|
| 1 | **First visit lands in gameplay** (no title gate for a new save; QA measures load → gameplayStart; template and example changed) | Conversion | high | M | `templates/game-repo/games/__ID__/main.ts`, `docs/examples/code/main.ts`, `packages/kit-code/qa/suite.ts`, `packages/cli/src/review.ts` |
| 2 | **First-minute gates on `crazygames`** (idle loss, Play → run, words, visible touch controls, naive touch bot, 4× CPU fps, start loudness) | Conversion (mobile) | high | S–M | `packages/kit-code/qa/suite.ts` (`runFirstMinute`), `review.ts` |
| 3 | **Funnel telemetry + a Playgama pre-test** before CrazyGames (host events → Playgama; `gp funnel`) | all three (measured before the one shot) | high | M | `packages/core/src/events.ts`, `host.ts`, `portal.ts`; the owner's traffic budget |
| 4 | **`mountResults()`: the next run is the big button, the next goal and the unfinished 60–80 % shown** | Playtime, D1 | high | M | `@gp/core` + `balance-model.ts` session-end; QA check |
| 5 | **Daily required and shown on the title** (`returns` → error on `crazygames`; QA: the daily's state on the title) | D1 | high | S | `packages/spec/src/money.ts`, `errors.ts`, `@gp/core/daily` |
| 6 | **`gp review` promotions** (music, emoji icons, list screens, text onboarding, empty halves, off-style sheets, video twist) + scope check | Moderation, playtime | high on approval | S | `packages/cli/src/review.ts`, `lessons.ts` |
| 7 | **Lesson-run + hints block** (`firstRun`, one-hint queue, can't-lose first stage) | Conversion | medium-high | S–M | `@gp/core` |
| 8 | **Basic Launch playbook** (patch on day 1–2 and day 4; category on purpose; record category in results.yaml) — and apply it to Candle Crypt now (desktop needs +2.75 pp conversion and +1 pp D1) | all three | medium-high | S | `docs/team/weekly-loop.md`, `packages/spec/src/results.ts` |
| 9 | **Music required on a portal; themeable platform widgets** | Playtime, moderation | medium | S | `packages/spec`, `lang-picker.ts`, `shop-ui.ts`, `dialogue-ui.ts` |
| 10 | **Welcome-back card + run resume helper** (`saveRun/loadRun`) | D1, playtime | medium | M | `@gp/core` (`daily.ts`, `save.ts`) |

Not verified here: real phones on CrazyGames' mobile page (whether it shows its own Play Now, orientation, fullscreen),
whether CrazyGames counts menu time as play, and whether the benchmarks really are per category (two data points). The
Playgama sandbox funnel (action 3) is the cheapest way to answer the first two before the next Basic Launch.
