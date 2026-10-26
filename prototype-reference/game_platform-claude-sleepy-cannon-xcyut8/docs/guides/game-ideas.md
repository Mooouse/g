# Game ideas for the near future (Q4 2026 – Q1 2027)

For **game makers** choosing what to build, and for the **platform team** choosing which blocks to add next.
Written 2026-09-30 by the team's roles (analyst, game designer, marketer) from three research notes:
[platforms](../research/platforms-2026-09.md) · [trends](../research/trends-2026-09.md) · [forums and postmortems](../research/forums-2026-09.md),
the [CrazyGames requirements](../research/crazygames-requirements-2026-09.md) and five games made on our channel
([Petri Panic retro](../team/retro-petri-panic.md), [portal games retro](../team/retro-portal-games.md)).
**More ideas and the blocks behind them (2026-10-19):** [board games](../research/board-games-2026-10.md) (a card racer, a fireworks bag-builder, a trick-taking roguelite …), [Roblox places](../research/roblox-2026-10.md) (Night Shift Rules, Hatch Lab, Last Lamp …), [game-design literature](../research/game-design-2026-10.md), and [what our own recent releases built themselves](../research/our-games-survey-2026-10.md).
**Revised the same day after an originality audit** of every card on the portal
([evidence: ideas-audit-2026-09.md](../research/ideas-audit-2026-09.md)): 48 searches, 5 cards dropped, 5 new ones.
Numbers come from search snippets (the build proxy blocks most primary pages): re-check a number before betting on it.
Refresh this page every quarter, and re-run the searches: the portal fills a trend within months.

**Already made on the platform's channel — pick something else or change the core verb:**
survivors-like roguelite (Petri Panic, QmaCyber/game2 — **rejected by CrazyGames**: "the concept is quite close to existing
titles"; Cell Survivor had the same genre and theme) · .io push-out arena (Spin Brawl, QmaCyber/game3) · launch-and-upgrade
(Yeet the Gnome, QmaCyber/game4) · clicker with a potion-shop story (Brew & Banter, QmaCyber/game5) · swarm-luring into traps
(Germ Bait, QmaCyber/game6). Microbes are the theme of two of these five: leave them alone for a while.

**Every card below is a direction, not a concept.** The searches behind a card are a starting point, not a clearance:
search the portal again for the genre *and* the theme, then write `concept` in game.yaml
([game-design.md → Originality](game-design.md#originality-what-portals-reject)). The validator requires it on CrazyGames.

## How to use it

1. Pick the **audience and channel** from the brief (AGENTS.md §1).
2. Pick an idea below for that audience. Each card says how to build it **today**, which live games are closest and what the platform still lacks.
3. **Make it your own.** Every card has a "twist" line with what the searches did *not* find live; "Closest titles" says what
   they did find. Portals reject "too close to existing titles", Poki rejects template-heavy AI games, Google Play bans
   Repetitive Content. A theme swap is not a twist; a new rule, goal or input is.
4. Write `concept` (pitch, the 3 closest portal games, the difference as something the player does) **before** building,
   and show the difference in the first 30 seconds and in the `gp video` preview.
4a. **Choose with the money in view:** run `gp forecast --idea` for your candidates with the session, natural breaks and
   rewarded offers you would build ([the money view](#the-money-view-forecast-per-idea) below has each card's), compare the
   expected values and take the levers into the design; then write `money` next to `concept` in game.yaml.
5. Missing block? Build it now with `kit: code` ([code-games.md](code-games.md)) **and** file the block request (AGENTS.md §5).

## What the research says, in eight lines

1. **Web players decide in 10 seconds** ("like TikTok viewers, not Steam users" — Poki). Gameplay within 10 s of the click, no text tutorial, no rotate-your-phone.
2. **Portals gate by concept first, then by numbers.** "Not different enough" is the most reported rejection and was ours; then CrazyGames Full Launch wants 80%+ past the first minute, 10+ min average play, D1 10–15%.
3. **Puzzle is where the time and money are:** 21 min average play on CrazyGames and the largest share of the top-100 by earnings; puzzle IAP +20% YoY on mobile in H1 2026. Clicker/incremental is second (15 min).
4. **The crowded puzzles are crowded with 2026 releases:** tube sort, arrow escape, drop-merge each have 8–17 live titles, several from this year. Headroom comes from a rule nobody ships yet — deduction, propagation, time loops, weather — not from the trend itself.
5. **Rewarded ads are the money a player likes:** preferred 4:1 over interstitials; best placements are a hint, a revive, ×2 reward. Never on the active gameplay screen (CrazyGames rule, `gp qa` checks it): a puzzle offers its hint from a "Stuck?" panel that pauses play (`host.gameplay(false)`), on the fail screen or between levels. First midgame ad after the tutorial or 3–5 minutes of play (CrazyGames' Basic Launch guide; its pacing guide: after level 3–4, not after level 1) — the platform shows it never in the first 3 min, then at the end of round 3 or after 5 min of the session, whichever comes first.
6. **Tune before you add:** one upgrade price change nearly doubled playtime in Liquid Swarm. Keep tuning in data files and balance bots ([upgrades.md](upgrades.md)).
7. **Small and plain wins:** under 20 MB (Poki: 8 MB), Canvas 2D (WebGL2 alone lost ≈ 5% of players on low-end devices); our games are one inlined `index.html` under 1 MB.
8. **AI games are judged harder:** 85% of players are below neutral on generative AI; "looks like a prototype" is the second rejection reason. Polish, one art style and a rule of its own are the defence.

## The list

Ranked by market (CrazyGames average play by genre) × originality headroom (the audit's searches) × buildability on the
platform today, with a bonus where a story layer helps. The scoring is in the [audit](../research/ideas-audit-2026-09.md#4-re-rank).

| # | Idea | For | Channel | Build today | Closest live (≥ similar found) | Opportunity × feasibility | Money: expected, months 1–3 ([why](#the-money-view-forecast-per-idea)) |
|---|---|---|---|---|---|---|---|
| 1 | Liar deduction: a daily case in a small town | 13+ adults | CrazyGames, own site | `kit: code` + story blocks | Braindom 2: Who is Lying? (riddles) · off-portal Clues by Sam | ★★★★★ | €51 |
| 2 | Rumour mill: spread a story, watch it change | 13+ | CrazyGames | `kit: code` + story blocks | none on the portal · itch jam games | ★★★★☆ | €51 |
| 3 | Ecosystem balance idle | 13+ | CrazyGames, Yandex | `kit: code` + `UpgradeShop` | nature idles (Idle Ants, Idle Zoo …) — none with a balance rule | ★★★★☆ | €34 (€46 with a break every 2–3 min) |
| 4 | Cloud herding: swipe the wind, rain where clouds stop | 13+ | CrazyGames, Playables | `kit: code` | Ice Slide, 2048 (slide rule) — no weather puzzle | ★★★★☆ | €78 |
| 5 | Echo loop puzzle: your past runs help you | 13+ | CrazyGames desktop first | `kit: code` | Jumping Clones · off-portal itch jam games | ★★★☆☆ | €51 |
| 6 | Sort puzzle with weight | 13+ · also 6–12 | CrazyGames, Poki | `kit: code` | 17+ sort games, 3 from Jun–Aug 2026 | ★★★☆☆ | **€96** |
| 7 | Solitaire where cards are recipe ingredients | adults | Yandex, own site, CrazyGames | `kit: code` | 20+ classic solitaire/mahjong · Solitaire Dungeon: Roguelike | ★★☆☆☆ | €42 |
| 8 | Meta upgrades for an existing score-attack game | 13+ | CrazyGames | `kit: code` today; YAML needs blocks | — (an update, not a new concept) | ★★☆☆☆ | €37 |
| 9 | Tap-to-grow garden / feed the animal (pretend play) | 2–5 | Google Play Families | `kit: kids` (`tap-collect` with a new theme and content) | many shape/colour apps; our risk is our own apps | ★★★★☆ | €4 |
| 10 | Toddler colour & shape sort, no fail, voiced | 2–5 | Google Play Families | `kit: kids` + new mechanic (request) | Bimi Boo, ilugon, RV AppStudios … | ★★★☆☆ | €4 |
| 11 | Counting jar (collect exactly N) | 2–5 · 6–8 | Google Play Families | `kit: kids` + collector (known gap) | — | ★★★☆☆ | €4 |
| 12 | Gentle logic for early readers (arrows, paths, patterns) | 6–12 | Google Play Families | `kit: kids` + grid mechanic (request) | the 13+ arrow games, not on Families | ★★★☆☆ | €4 |

### The money view: forecast per idea

`gp forecast --idea` for each card, with the session, natural breaks and rewarded offers the card describes (2026-09-30,
the inputs of [revenue-2026-09.md](../research/revenue-2026-09.md); [Design for money](game-design.md#design-for-money)).
**Expected value = P(approval) × P(Full Launch) × median revenue, months 1–3 after submission.** Ordered by it. Every number
is an estimate from mostly low-confidence inputs; the pessimistic end of every card is ≈ €0 and the optimistic one thousands:
the ranges overlap. Read the order as *which design earns more*, not as a promise.
Each command is printed as run (`--unique 80` is the score a card's concept gets if built as described; 75 for #4); rerun
them after a change to the model. Revised 2026-09-30 for the first midgame at round 3 *or* 5 min (D36) and midgame +
rewarded ≤ 20 an hour.

| By EV | Idea | The design forecast (`gp forecast --idea --channel crazygames …`) | P(approval) | P(Full Launch) | Median if launched | **Expected** | The top lever |
|---|---|---|---|---|---|---|---|
| 1 | #6 Sort with weight | `--genre puzzle --session 18 --breaks 12 --rewarded undo,hint --return meta --meta 120 --unique 80` | 12–84%, mid 48% | 6–52%, mid 28% | €703 | **€96** | uniqueness 85+ (+€24): a rule nobody ships in a crowded genre |
| 2 | #4 Cloud herding | `--genre puzzle --session 18 --breaks 7 --rewarded undo,hint --return meta --meta 120 --unique 75` | mid 48% (uniqueness 75: two off-portal cloud games) | mid 28% | €573 | **€78** | uniqueness 85+ (+€20); a rewarded ×2 on the results (+€18) |
| 3 | #2 Rumour mill | `--genre puzzle --session 18 --breaks 6 --rewarded hint --return story --meta 120 --unique 80` | mid 48% | mid 28% | €377 | €51 | a rewarded ×2 (+€28) |
| 3 | #5 Echo loop | `--genre puzzle --session 18 --breaks 6 --rewarded hint --return meta --meta 90 --unique 80` | mid 48% | mid 28% | €377 | €51 | a rewarded ×2 (+€28) |
| 5 | #1 Liar deduction | `--genre puzzle --session 18 --breaks 4 --rewarded hint --return daily --meta 120 --unique 80` | mid 48% | mid 32% (the daily case helps D1) | €333 | €51 | a rewarded ×2 on the results (+€22); more cases per session |
| 6 | #7 Recipe solitaire | `--genre puzzle --session 15 --breaks 4 --rewarded extra-card --return daily --meta 60 --unique 80` | mid 48% | mid 32% | €278 | €42 | a rewarded ×2 on the results (+€22) |
| 7 | #8 Score attack + meta | `--genre hypercasual --session 10 --breaks 12 --rewarded double,continue --return meta --meta 60` | mid 40% (no concept scored) | mid 24% | €390 | €37 | uniqueness 85+ (+€19) |
| 8 | #3 Ecosystem idle | `--genre idle --session 15 --breaks 2 --rewarded boost,boost-rain --return meta --meta 180 --unique 80` | mid 48% | mid 30% | €237 | €34 | **natural breaks every 2–3 min (+€12)**: a 5-min season lets 2 midgame ads through a session where the 1-per-3-min allowance has room for 4 |
| 9 | #9–#12 kids apps (Google Play Families) | `--channel android-families --session 6 --breaks 7` | 60–90%, mid 80% | — | €5 | €4 | none in the model: no marketing means ≈ 100 installs a month |

What the money view says:
- **Puzzles with short levels earn most per play** (8.9 ad impressions per play for the portal's top puzzles): a level end every
  1.5–2.5 min is a natural break, and a hint or undo is the offer players take. A card whose unit is long (a 5-min season,
  a 6-min case) must add breaks inside it, or it leaves the 1-per-3-min midgame allowance unused.
- **The review is the biggest single factor** and it is the same for every card that passes the taken-concept check:
  uniqueness 85+ is worth as much as a rewarded offer.
- **Kids apps without marketing earn almost nothing** (median ≈ €5 in three months, optimistic ≈ €700): their value is the
  channel and the Families experience, not the revenue — say so in the report; never add rewarded ads or pressure to fix it.

**Dropped in this revision** (live matches for the genre *and* the named twists; details in the audit):
arrow / slide-out escape for 13+ (Arrow Escape, Jan 2026; Arrow Escape: Puzzle, Feb 2026 — the core moved to #12 for kids) ·
drop-and-merge (11+ fruit-merge games; the tilting jar is live in Merge Fruits) · ball / brick roguelite (ABLOCKALYPSE;
Bounce Heroes already fuses balls) · cozy garden / pond / bakery idle (17+; fish mutations in Pixel Aquarium Tycoon; named
regulars are Brew & Banter) · a generic daily logic puzzle (14 portal games have a daily mode — it lives on inside #1).

**No survivors-likes for CrazyGames now:** ≈ 20 "X Survivors" are live and Petri Panic was rejected as too close to them.
A game that borrows the auto-attack-and-level-up loop must change the core input or goal (aim instead of move, placement
instead of an avatar, a puzzle constraint) — and the ball/brick form of that is taken too.

---

### 1. Liar deduction: a daily case in a small town — 13+ adults
- **Why now:** daily logic is the web's fastest-growing habit — Clues by Sam went from launch (May 2025) to 50k+ daily players in the browser; NYT games had 11.2B solves in 2025; LinkedIn's daily games report 84% next-day return. On CrazyGames the daily modes are jigsaws, words and nonograms; deduction is missing, and puzzle has the longest sessions (21 min).
- **Loop:** 5–8 townsfolk, each says one thing about the others ("The baker is lying", "At least two of us are honest"). Some roles always lie. Tap a face to mark honest / liar; the case closes when the marks are consistent. 3–6 min; a practice case for "one more".
- **Retention and money:** one case per day for everyone (seed = date), a calendar of solved days and an archive; story chapters: each solved case adds a scene to a running town story (who took the bell, why the mayor won't talk). Rewarded "ask the innkeeper" hint (reveals one person) from a "Stuck?" panel that pauses the case — never as a button on the board; midgame only between cases, from case 3.
- **Build today:** `kit: code`: a generator + solver (a case is valid only if exactly one assignment fits; difficulty = how many deduction steps the solver needs), `host.rng` seeded by the date in production; the story scenes with the story engine and `mountDialogue` ([story.md](story.md)). `gp video` films a case being solved.
- **The twist:** statements can be **lies by role**, not only clues (Clues by Sam: everyone tells the truth); later roles bend the rule — a *gossip* repeats whatever the last person said, a *twin* always agrees with their twin. One new role per week keeps the daily fresh without new art.
- **Closest titles and how it differs:** Braindom 2: Who is Lying? (CrazyGames, 150 hand-made riddle scenes — you spot one trick; here every case is a solvable logic system with a unique answer); Detective IQ, Find The Cow (grid deduction without speakers); off the portal Clues by Sam, Daily Murder, Clue Raider — own board, own roles, own share card.
- **Watch out:** trade dress — no 4×5 suspect grid, no Clues by Sam wording or colours; a share result of your own design. `game-design.md` counts daily streaks as a dark pattern: show solved days, never "you lost your streak". PEGI 12: small-town mischief, not murder.

### 2. Rumour mill: spread a story, watch it change — 13+
- **Why now:** the portal has no game about spreading information (the searches found only jam games on itch.io); CrazyGames' quality page asks for "interesting story or scenarios"; a propagation rule plus a story layer makes a puzzle that is also a comedy.
- **Loop:** a town of 8–14 people on a map, connected by who talks to whom. The rumour is three icons (who · did what · where). Each day you whisper it to one person; overnight it spreads along the links, and each teller changes it by trait — the exaggerator swaps "a cake" for "ten cakes", the loyal friend drops their friend's name, the sceptic won't repeat what came from someone they distrust. Goal: the right version reaches the right person, and never the one it's about.
- **Retention and money:** 30–40 hand-checked levels in 4 neighbourhoods, three stars for fewest whispers; a chapter story told between levels (why the town needs this rumour). Rewarded "overhear" hint (shows tomorrow's spread for one person) from the pause panel or after a failed day; midgame at "Next day" from level 3.
- **Build today:** `kit: code`; the spread is deterministic, so a breadth-first solver over the player's choices checks every level and its par (unit tests). Icons drawn in code (no reading needed to follow the rumour); the chapter text with the story engine and `mountDialogue` ([story.md](story.md)).
- **The twist:** you never choose *what* is said, only *who hears it first* — the town's personalities write the rumour. The mutation is the puzzle.
- **Closest titles and how it differs:** We Become What We Behold (CrazyGames: a short narrative about media, you frame photos — no network, no levels); Fofoca, Gossip Ghosts, TTK: Talk To Kill (itch.io jam games, not on the portal).
- **Watch out:** keep rumours harmless and funny (no real groups, no bullying: PEGI 12 and taste); the icon rumour must read at 821×462; the story is English-only — short lines.

### 3. Ecosystem balance idle — 13+
- **Why now:** clicker/incremental is CrazyGames' second genre (15 min) and "performs really well"; cozy nature themes grew on Steam (cozy +675% among $100k+ games 2022→2025) and web players leave idles running (90% do something else meanwhile). Every nature idle on the portal is "buy more, earn more" — none has species that interact.
- **Loop:** a meadow. Buy species (clover → rabbits → foxes; flowers ↔ bees; a pond with frogs and herons). Populations follow simple predator–prey rules and oscillate; income is **biodiversity × stability**. Overbuy rabbits and the clover goes, then the rabbits, then the foxes: numbers go *down*.
- **Retention and money:** permanent habitat upgrades (hedges, a pond, a hollow tree) with `UpgradeShop` and `mountUpgradeShop`; a season is a run, a year is a prestige (seeds carried over); offline growth on return ("your meadow grew for 3 h — ×2 with an ad", rewarded); a "rainy week" boost offered at the start of a season (rewarded). Midgame only at "Next season".
- **Build today:** `kit: code` + `UpgradeShop`; the population model as pure logic in fixed steps (`run.ts`) so a balance bot plays 400 seasons in a test; prestige and offline earnings are blocks now (`Prestige`, `offlineEarnings`: [upgrades.md → Idle games](upgrades.md#7-idle-games-offline-earnings-and-prestige)). Save with `host.save` (cloud on CrazyGames).
- **The twist:** greed is punished by the system, not by a timer — the best move is often *not* to buy, and a crash is visible and recoverable in half a minute.
- **Closest titles and how it differs:** Idle Ants, Idle Zoo, Fish Catch Idle, Idle Sea Park, Planet Life Idle, Idle World (producers that only add up); Eat & Grow Fish, EvoWorld.io (you are one animal). Here you manage a food web.
- **Watch out:** show the balance in the first 30 s (a rabbit boom and a clover dip on screen); oscillations must be readable (a small graph, not a spreadsheet); tune in data from Basic Launch; no real species on the brink as a joke.

### 4. Cloud herding: swipe the wind, rain where clouds stop — 13+
- **Why now:** puzzle is the top genre and slide-puzzles are cheap to build and to verify; weather is an unused puzzle theme on the portal (the searches found tornado toys and weather events in farms, no weather puzzle).
- **Loop:** a small map of fields, forest, mountains and a town. A swipe blows the wind: **every** cloud slides until a mountain or another cloud stops it, and rains on the tile where it stops. Two clouds pushed into each other become a storm (twice the rain; lightning over forest ends the level). Water every field exactly once and keep the town dry for its fair.
- **Retention and money:** 60 levels in 5 regions, stars for fewest swipes, a "calm" mode without storms; rewarded "undo ×3" on the failed-level screen and a hint (the next swipe) from the "Stuck?" panel; midgame at "Stage Clear" from level 4.
- **Build today:** `kit: code`: a grid, a breadth-first solver over swipes (the state is small) that rejects unsolvable levels and records par — run it in unit tests; the level generator is optional (hand-made levels, solver-checked, are fine).
- **The twist:** the move is global (all clouds at once, as in 2048) and the board has **state** — watered fields, clouds that run dry after three rains, storms — so the same swipe means something new each turn.
- **Closest titles and how it differs:** Ice Slide, Just Slide, Garden Slide, Sokoban (one piece slides until blocked; here everything moves and the goal is where they *stop*, not a path); 2048 and Colors Craft (global swipe that merges numbers; here merging is a hazard).
- **Watch out:** the rule must be clear in the first level without text (one cloud, one field); rain animation cheap on low-end devices; `kit: code` is for 13+ — a version for children would be a separate `kit: kids` game on the grid block (next blocks #1).

### 5. Echo loop puzzle: your past runs help you — 13+ (desktop first)
- **Why now:** time-loop puzzles are a thinky-games staple and a favourite of game jams, but the portal's search found none (Jumping Clones moves several heroes at once; Cut the Rope Time Travel has two eras). Puzzle sessions are the longest on the portal.
- **Loop:** a single-screen room; you have 10 seconds to move. Then the loop restarts and your last run replays as an echo while you move again: the echo stands on the switch, you walk through the door. Up to 4 echoes; a level is solved in the fewest loops.
- **Retention and money:** 30 levels in 3 buildings, new objects every 5 (boxes echoes can push, doors that need two echoes, a guard who follows the newest echo); stars for loops; rewarded "watch the solution's first loop" from the pause panel; midgame at "Next room" from level 4.
- **Build today:** `kit: code` with fixed-step simulation (1/120 s) and input recording — an echo is a replay of recorded input, so it must be exactly deterministic (use `host.rng`, no `Date.now`); store each level's intended solution as recorded input and replay it in a unit test. `MoveInput` covers keyboard, joystick and drag.
- **The twist:** the player's own past is the only tool — no items, no enemies to fight; levels are built so the obvious first run is wrong and becomes useful as an echo.
- **Closest titles and how it differs:** Jumping Clones (simultaneous control, not replay); Cut the Rope Time Travel (two eras side by side); Déjà Vu: Same Level?! (the level changes, you don't); off the portal Loop Echo, Recurse, Thought Loop (itch.io), Echoshift (PSP, 2010) — own objects, own name.
- **Watch out:** level design is the whole cost (budget it: 30 levels, each solver-checked by its recorded solution); a phone plays it with the joystick, but desktop first; "Looper" is taken (a Kwalee rhythm game), pick another name.

### 6. Sort puzzle with weight — 13+ (also 6–12)
- **Why now:** sort-puzzle IAP +229% and downloads +56% in H1 2026 (AppMagic); the whole board is visible, one touch turns chaos into order. But the portal has 17+ sort games, three released June–August 2026 — only a new rule gets through.
- **Loop:** move items between containers until each holds one kind; 30–90 s levels; a near-miss at the end.
- **Retention and money:** level map, star rating per level; rewarded **undo / extra container** on the out-of-moves screen (the "fail offer" is where sort games earn) and a hint from the pause panel; midgame at "Stage Clear" from level 3–4.
- **Build today:** `kit: code`; a level generator **with a solver** (every level must be solvable and the par move count known).
- **The twist:** **weight** — a heavy item dropped on light ones sinks through them, so the pour order changes what ends up on top. Lids that open every 3 moves also weren't found live. Colour mixing is **not** a twist any more (Colors Craft, Color Match mix colours).
- **Closest titles and how it differs:** Water Sort Puzzle, Color Water Sort 3D, Water Jam, Wizard Puppy: Magic Sort, Screw Sorting, Nuts Puzzle, Bird Sort Puzzle, Wool Mania (all "top item moves onto a matching top") — here the stack reorders itself.
- **Watch out:** the most crowded genre on every store — no liquid-in-tubes look, never the names Magic Sort / Water Sort; show the sinking in the first level.

### 7. Solitaire where cards are recipe ingredients — adults
- **Why now:** Yandex Games' audience is mostly 25+ and 58% women, with bubble shooters and match-3 on top; Candy Crush Solitaire was Google Play's "Best Pick Up & Play" of 2025. Classic solitaire and mahjong are everywhere (20+ on CrazyGames alone).
- **Loop:** a tri-peaks-like layout; instead of runs by rank you build dishes (flour + egg + milk = pancakes) in a small kitchen row; a finished dish clears its cards and scores.
- **Retention and money:** a cookbook of unlocked recipes, daily layout, rewarded "one more card from the pantry".
- **Build today:** `kit: code`; Yandex Games needs its SDK and Russian (both platform gaps, next blocks #9); CrazyGames works today.
- **The twist:** recipes replace rank order, so the player plans by *what* the cards are, not their number.
- **Closest titles and how it differs:** Solitaire Online, Solitaire Gold, Microsoft TriPeaks, Classic Card Games Collection (rank rules); Solitaire Dungeon: Roguelike (solitaire as combat); That's My Recipe (ingredient placement, no cards).
- **Watch out:** no casino look (PEGI), no Microsoft or Candy Crush trade dress.

### 8. Meta upgrades for an existing score-attack game — 13+
- **Why now:** our `tap-score` is pure hypercasual (≈ 8.6 min on CrazyGames); meta progression is the cheapest way to move an existing casual-kit game up — as an **update**, not a new submission (a hypercasual concept alone won't pass as new).
- **Loop:** the same 45-s round; coins after each round; a shop of permanent upgrades (longer rounds, bigger combo window, magnet, golden targets more often).
- **Retention and money:** rewarded "×2 coins" on the score screen and "+10 s" once per round (continue offer); midgame on Play again from round 3 (or after 5 min of the session, whichever comes first).
- **Build today:** `kit: code` reusing the look, with `UpgradeShop` + `mountUpgradeShop` and `rewardedButton` — all in `@gp/core` now. The YAML path still needs two blocks (next blocks #7).
- **The twist:** upgrades that change the rule (targets split in two, chains pop neighbours), not only numbers.
- **Watch out:** keep the round the same game players already know; tune prices with the balance bots ([upgrades.md](upgrades.md)).

### 9. Tap-to-grow garden / feed the animal — ages 2–5
- **Why now:** cozy is the strongest Steam trend and Grow a Garden showed the theme's reach; for toddlers it is pretend play without failing.
- **Build today:** `kit: kids` + `tap-collect` with a new theme (seeds, water drops) and content — theme work only, the fastest item on this list.
- **Twist ideas:** each tapped drop grows a different flower; the reward is a garden that stays and grows between sessions.
- **Watch out:** Google Play Families is full of generic shape-and-colour apps; ours differ by voice, no fail, calm pacing and Families-safe ads. The Repetitive Content risk is **our own** apps: not a balloon-pop reskin.

### 10. Toddler colour & shape sort, no fail, voiced — ages 2–5
- **Why now:** the kids category is 18B downloads all-time; parents praise calm, voiced, ad-light, offline play (Pok Pok: "no levels, no winning, no losing"); sort is the #1 trend and has a natural no-fail form for toddlers.
- **Loop:** drag a toy to the basket of its colour (or shape); the voice names it; a sticker every few toys.
- **Retention and money:** stickers and the album (the kids kit has them), "Remove ads" purchase behind the parent gate; ads only in the break after a round (Families limits).
- **Build today:** `kit: kids` needs a **drag-to-target** mechanic (block request). The rules (touch size, voice, parent gate, Families ads) are all there.
- **Twist ideas:** baskets that are animals asking for "something red"; night mode where shapes glow.
- **Closest titles:** Baby Games: Shapes and Colors (Bimi Boo), Toddler Games: Shapes & Colors (ilugon, ad-free), Colors & Shapes (RV AppStudios) — the bar for polish is high.

### 11. Counting jar — ages 2–5 · 6–8
- **Loop:** "put three apples in the jar" — tap targets to drop them in; the voice counts; exactly N, then the jar lids and a sticker.
- **Build today:** `kit: kids` + the **collector** block (a known gap in AGENTS.md §5); `tap-collect` already does the counting and the voice.
- **Twist ideas:** jars for different animals that each want a number; 6–8: "make 7 from two jars".

### 12. Gentle logic for early readers — ages 6–12
- **Loop:** arrow puzzles (tap an arrow, it slides off unless blocked — the core that is too crowded for 13+ on CrazyGames), path drawing, "what comes next" patterns; mistakes are a wobble and another try (the 6–8 rules).
- **Build today:** `kit: kids` + the grid-puzzle block (next blocks #1) with a kids ruleset (no clock, no fail offer, no rewarded ads).
- **Twist ideas:** arrows that rotate after each move; two-colour boards where you must alternate colours.
- **Watch out:** QUT found deceptive patterns in 15 of 20 popular apps for ages 5–8 (characters pushing purchases, "watch ads to continue"). Ours must have none — the validator already blocks rewarded ads on child channels.

## What not to make now

- **Our own genres, in any theme:** survivors-like (Petri Panic, rejected), .io push-out arena (Spin Brawl), launch-and-upgrade
  (Yeet the Gnome), clicker with a potion shop and regulars (Brew & Banter), swarm-luring into traps (Germ Bait) — and **microbes or
  cells** as a theme (two of our games, plus Cell Survivor, Agar.io, Germs.io on the portal). A second game near one of these
  must change the core verb, and a reskin of any of them is the fastest way to lose the whole account.
- **Spinning-top / push-out arenas:** Top Clash (July 2026) and Gyroblade (September 2026) went live as strong single-player
  games, next to Push.io, Spinz.io and Chaos Arena — Spin Brawl's open room is real multiplayer, not the arena itself.
- **Survivors-likes and their cousins on CrazyGames:** ≈ 20 "X Survivors" live; ball/brick roguelites (ABLOCKALYPSE, Bounce Heroes).
- **Genres the audit found full, twists included:** tube / liquid sort without a new rule (17+, three from summer 2026),
  arrow escape for 13+ (Arrow Escape ×2 in early 2026), drop-and-merge fruit (11+, the tilting jar is live), garden / aquarium /
  bakery idles (17+), a music-band idle (Music Band, Apr 2026), minesweeper RPGs (Rogue: Monster Sweeper), layer-peeling
  puzzles (Tape Escape).
- **Concepts Germ Bait found taken:** drawing lines against waves (Draw Defense), a one-tap chain reaction (Chill Reaction,
  June 2026), a growing colony / territory (Celloid, Colony, Paper.io 2).
- **Classic match-3, block-blast, plain klondike or mahjong** — saturated and a Repetitive Content risk.
- **Plain hypercasual as a new CrazyGames concept** (8.6 min) — use it as a first game or add meta progression (#8).
- **Tap-to-earn / Telegram crypto games** — collapsed (Hamster Kombat lost > 96% of players).
- **Meme / "brainrot" games** — traffic is real, but the characters are in lawsuits and the wave passes in weeks.
- **Slot / poker looks** — PEGI 18 risk (Balatro was first rated 18), never for kids.
- **Multiplayer / .io without a server plan and bots.** CrazyGames "strongly supports" multiplayer (2× long-term retention) and
  Spin Brawl shows the platform can host it ([code-games.md → Games with a server](code-games.md#games-with-a-server-online-multiplayer)),
  but the portal's own multiplayer services (usernames, invite links, instant multiplayer) aren't on the host yet and QA can't
  see them. Make one only with offline bots, a `wss://` server and a reason to play together; better after next blocks #6.

## For the platform team: the next blocks, in order

**Done since the first version of this page:** meta progression for `kit: code` (`UpgradeShop`, `mountUpgradeShop` —
responsive: two columns on tall screens, four on a phone on its side; scrolling panels pass QA; `lock` for story unlocks) ·
rewarded buttons done right (`rewardedButton`, `rewardedAvailable`, QA `[ads fail]`) · covers with the 200×112 thumbnail
(`gp covers`, the old block #6) · one-file upload for CrazyGames · `gp video` · `gp submission` · the concept gate
(`E_CONCEPT`, `W_CONCEPT_THEME`, `E_TITLE_GENERIC`) · portal QA checks (ad-blocker names, 821×462 legibility, "No thanks" size).

| # | Block | Unlocks ideas | Why first |
|---|---|---|---|
| 1 | **Puzzle toolkit for `kit: code`** (board state, undo/redo, a level file, a level-select screen with stars, a solver hook that `gp validate` runs on every level to check it's solvable and record par); the grid-puzzle mechanic for `kids` on top of it | 1, 4, 5, 6, 12 | five of the top six ideas are puzzles, the longest sessions on the portal; each would write undo, level select and a solver check by hand |
| 2 | ~~**Story blocks**~~ — **done**: the story format and engine (`StoryRunner`, `validateStory`), `mountDialogue` (speaker, portrait, typewriter, 1–3 choices, Skip, QA hooks) — [story.md](story.md); next: `gp validate` reading `story.yaml`, barks, a journal | 1, 2, a story layer for any game | requested by Brew & Banter (D54); two of the top three ideas need it |
| 3 | **Daily seed + solved-days calendar + share card** (seed from the date in production, `?seed` in dev; an archive; a share text of the game's own design; no loss-framed streak; a solved-days calendar is fine for 13+ — [game-design.md](game-design.md), D56) | 1, and a daily mode for any puzzle | retention with no content cost |
| 4 | ~~**Idle helpers**~~ — **done**: `offlineEarnings` (capped, from a saved stamp, paid once, safe against clock changes; ×2 with `rewardedButton` on `welcomeBack`) and `Prestige` (the gain curve, the multiplier, the keys a reset clears, the second life for the balance model) — [upgrades.md → Idle games](upgrades.md#7-idle-games-offline-earnings-and-prestige); also `dailyStreak` / `dailyOrder` for any genre | 3, 7, any incremental | clicker is the second genre on the portal |
| 5 | ~~**Taken-concepts list**~~ — **done**: `packages/spec/src/taken.ts` (genre + theme → live titles, dated) and `W_CONCEPT_TAKEN` in `gp validate`; add every new search to it | all portal ideas | the #1 rejection reason; each game spent ≈ 10 min searching |
| 6 | **Portal multiplayer services on the host** (username, invite link, instant multiplayer, lobby sizes) with a QA stub | multiplayer and .io games | CrazyGames: 2× retention, "strongly supporting"; requested by Spin Brawl (D54), which reads the SDK itself today |
| 7 | **Meta progression and rewarded buttons in the YAML `casual` kit** (on top of `UpgradeShop` and `rewardedButton`) | 8 | the code path exists; the YAML path is still hypercasual only |
| 8 | **Drag-to-target and collector mechanics** for `kids` | 10, 11 | the cheapest new kids games |
| 9 | **Portal adapters: Poki, Yandex Games (+ Russian/Kazakh texts), YouTube Playables** | all web ideas, 7 | more players for the same games |
| 10 | **UMP consent and AdMob rewarded ads for the `android` channel** | Google Play casual 13+ | ads are off there until then |

Status of these lives in [docs/team/decisions.md](../team/decisions.md).
