# Game ideas: originality audit (2026-09-30)

> Evidence for the revised [game-ideas.md](../guides/game-ideas.md). Proposed place in the repo:
> `docs/research/ideas-audit-2026-09.md` (the revised page links there).

## Method and limits

- `crazygames.com` and `docs.crazygames.com` are blocked by the build proxy, so this audit uses **WebSearch snippets** only:
  `site:crazygames.com <genre> <theme>` queries plus a few open-web queries. 48 queries in all, run on 2026-09-30.
- **Search results are not the catalogue.** A title counts as "live" when a search snippet showed its crazygames.com game page.
  Counts are **lower bounds**: a search returns about 10 hits, so a genre with "11+" titles probably has many more.
  "Not found" means no search hit, not "the portal has none". The portal's own search and tag pages are the real test.
- Release dates and ratings come from the snippets (search-engine paraphrases of the game pages).

| Marker | Meaning |
|---|---|
| **[S]** | A WebSearch snippet of a crazygames.com game page (or play.google.com for the kids ideas) |
| **[3rd]** | A third-party page seen as a snippet (Wikipedia, itch.io, thinkygames, review sites) |
| **[F]** | A forum post, review or anecdote |
| **[R]** | This repository: research notes, game reports, retros |

Verdicts: **keep** (headroom found) · **keep only with the named twist** (the genre is taken; the twist was not found live) ·
**drop** (the genre and the listed twists are live, or the idea overlaps our own games).

## 1. The twelve existing cards

| # (old) | Idea | Queries run | Closest live titles on CrazyGames [S] | Similar (≥) | Twists: live? | Verdict |
|---|---|---|---|---|---|---|
| 1 | Sort puzzle with its own rule | `sort puzzle color water`; `sort puzzle mix colors pour`; `sort puzzle weight heavy sink OR lid OR "sort by shape"`; `colors merge mix red blue purple puzzle tubes`; `sort puzzle 2026 new sorting game` | Water Sort Puzzle (Jul 2021), Color Water Sort 3D (Dec 2024), Water Jam (Oct 2024), Cups – Water Sort Puzzle (May 2022, 300+ levels), Liquid Puzzle, Pouring Puzzle (Oct 2023), **Wizard Puppy: Magic Sort (Jul 2026)**, Color Sort: Kitchen Chaos, Nuts Puzzle: Sort By Color, Rope Color Sort 3D, Bird Sort Puzzle, **Screw Sorting (Jun 2026)**, Wool Mania – Sort Puzzle 3D, **Jewel Coloring: Crystal Sorting (Aug 2026)**, Hexa Stack, Coffee Match: Block Puzzle, Find Sort Match | 17 | Colour mixing: **adjacent live** — Colors Craft (2048 with RGB/CMYK mixing), Color Match (mix to a target shade). Lids every 3 moves: not found. Weight / heavy sinks: not found. Sort by changing rule: not found | **keep only with the weight twist** (heavy items sink through light ones); no liquid-in-tubes look; ranked down |
| 2 | Daily logic puzzle with a streak | `daily puzzle logic`; `daily challenge streak puzzle new puzzle every day`; `logic puzzle weekly rule changes OR "rule" deduction clues`; open web: `"Clues by Sam" clone …` | Akagram (Akari + clues, Daily Challenge), Nonogram Square (Daily Challenge), Daily Puzzle (jigsaw), Daily Word Search, Unscrambled (daily, streak), Daily Timeline, Labyrinth Puzzles (daily maze, login streak), Daily AMazeBalls, Daily Room Escape, Solitaire Daily Challenge, Daily Solitaire Blue, Twisted Tangle (weekly), Find The Cow, Shikaku Puzzle | 14 with a daily mode | "One rule changes each weekday": not found. Two-part puzzle: not found. Weather-themed grid: not found. Off the portal [3rd]: Clues by Sam (50k+ daily players by early 2026), Griductive (a look-alike), Clue Raider, Daily Murder | **keep only as a daily *deduction* case** → merged into new #1 (a daily mode alone is common on the portal) |
| 3 | Arrow / slide-out escape | `arrows escape puzzle tap arrow`; `arrow twist rotate puzzle` | **Arrow Escape (Jan 2026, 8.8)**, **Arrow Escape: Puzzle (Feb 2026, 9.0)**, Arrows (move limit), Arrow Slide Puzzle (reveals a picture), Tap Out: Block Escape (3D), Unpuzzle: Tap Away (1000+ levels), Pin Away Puzzle, Slide Out | 8 | Rotating arrows: adjacent — Redirect (rotate arrows to steer a ball). Two-colour alternation: not found | **drop for CrazyGames** (two near-identical 2026 releases). The grid core moves to the kids card for 6–12 (Google Play) |
| 4 | Score-attack with meta upgrades | `tap score upgrades shop coins permanent arcade`; `clicker targets combo upgrades pop incremental` | Nothing like our `tap-score` + shop was found; neighbours: Bouncemasters, Turbo Trail (permanent upgrades), Idle Retro Arcade, Battle Button Clicker (roguelike cards), Satisfying Ball Clicker | — | "Upgrades that change the rule": generic, not checkable | **keep only as the meta layer of an existing casual-kit game** — the genre is hypercasual (8.6 min); not a new CrazyGames concept |
| 5 | Cozy idle (garden, pond, bakery) | `idle garden cozy`; `idle pond fish breed`; `idle bakery customers orders`; `weather control idle rain sun grow` | Garden: Garden Idle, Florist Idle, The Zen Garden (fish in a lake, bamboo), Loop Farm, Farm Ring Idle, Idle Farm, Grow a Garden – Growden.io (weather events). Pond: **Pixel Aquarium Tycoon** (50+ fish, "visual mutations"), Evo Fish (merge fish), Fish Catch Idle, Idle Fishing, Idle Sea Park. Bakery: My Cake Shop, Bakery Manager, My bakery, Cat Bakery, Cozy Kitchen | 17 | "Fish change colour by feed": **close to live** (Pixel Aquarium Tycoon's mutations). "Orders from named regulars with stories": **our own Brew & Banter** [R] | **drop** — all three themes are taken; replaced by new #3 (the difference is a rule, not a theme) |
| 6 | Ball / brick roguelite | `ball brick breaker roguelite upgrades`; `ball launch roguelike bounce balls fuse` | **ABLOCKALYPSE** (turn-based brick breaker, 6 ball types, 21 relics), **Bounce Heroes** (roguelite, "combine bouncy balls"), Byte Breaker Incremental (prestige), Idle Breakout, Brick Bounce Idle, Idle Cannon, Bricks Breaker, Break it, Asteroid Breaker, Ball Blast, Cannon Ball Blast | 11 | Balls that fuse: **live** (Bounce Heroes). A paddle that walks: that is BALL x PIT itself [3rd]. No-aim mode: not checkable | **drop** — the genre *and* its twists are live, and it is a survivors-like cousin |
| 7 | Drop-and-merge physics | `merge drop fruit suika`; `merge drop jar tilt OR rotate OR gravity` | Merge Fruits (**with tilt buttons**), Fruit Merge: Juicy Drop, Drop Some Fruits, Fruit Party, Vortex Fruit Drop, Watermelon Fruit Merge Saga, Merge a Fruit, Watermelon Balls, Merge and Munch, Capy Merge: Animal Drop Puzzle, Merge Galaxy (gravity) | 11 | Tilting jar: **live** (Merge Fruits). Gravity: **live** (Merge Galaxy). Colour + size: adjacent (Colors Craft) | **drop** |
| 8 | Toddler colour & shape sort (Google Play) | open web: `toddler color shape sorting game app drag basket no ads Google Play 2026` | Google Play [S]: Toddler Games: Shapes & Colors (ilugon, ad-free, updated Aug 2026), Colors & Shapes (RV AppStudios), Baby Games: Shapes and Colors (Bimi Boo), Kids Matching & Sorting Games, Shapes & Colors learning games, Sort And Learn for Kids | 6+ | Not a portal review; Google Play's risk is Repetitive Content across **our own** apps | **keep** (needs drag-to-target) |
| 9 | Counting jar (Google Play) | not searched separately (same market as #8) | — | — | — | **keep** (needs the collector) |
| 10 | Tap-to-grow garden (Google Play) | not searched separately | — | — | — | **keep** — the fastest item: theme and content only |
| 11 | Gentle logic for early readers (Google Play) | covered by the #3 searches | the arrow games above are 13+ web games; the kids version plays on Google Play with the 6–8 rules | — | — | **keep**, and it takes #3's arrow core |
| 12 | Solitaire / mahjong variant | `mahjong solitaire recipe OR ingredients`; `solitaire cooking OR recipe OR roguelike cards`; `solitaire klondike spider freecell` | Solitaire Online, Solitaire Gold, Microsoft TriPeaks, Microsoft Klondike, Microsoft Spider, Spider Solitaire (Oct 2025), Classic Card Games Collection (150+), Klondike Solitaire, Algerian Patience, Solitaire Daily Challenge, Daily Solitaire Blue; mahjong: Mahjongg Solitaire, Online Mahjong Solitaire, Solitaire Mahjong Classic / Zodiac / Juicy / Farm, Mahjong Royal, Mahjongg Candy; variants: **Solitaire Dungeon: Roguelike**, Jigpic Solitaire | 20 | Cards as recipe ingredients: **not found** (That's My Recipe is an ingredient-placement logic puzzle, not cards). Mahjong that clears into a picture: not searched | **keep only with the recipe twist**, low priority (Yandex needs an adapter; the classic variants are everywhere) |

## 2. Our own games (the portfolio counts too)

| Game | Genre / verb | Theme | Status [R] |
|---|---|---|---|
| Petri Panic (game2) | survivors-like | cell vs germs | rejected: "quite close to existing titles" (Cell Survivor, Jun 2026; ≈ 20 "X Survivors") |
| Spin Brawl (game3) | .io push-out arena | spinning tops | made; own Node server |
| Yeet the Gnome (game4) | launch-and-upgrade | garden gnome | made |
| Brew & Banter (game5) | clicker with story | café, named regulars | made |
| Germ Bait (game6) | swarm-luring with traps | microbes again | made; its concept note found live matches for draw-walls (Draw Defense), one-tap chain reaction (Chill Reaction, Jun 2026), colony growth (Celloid, Colony, Paper.io 2) |

Microbes are now the theme of two of our five games, and are taken on the portal (Cell Survivor, Agar.io, Germs.io, Germ War [R]).

## 3. Candidates for new ideas

| Candidate | Queries run | What the portal has [S] | Off the portal | Verdict |
|---|---|---|---|---|
| **Liar deduction** (some characters always lie, deduce who) | `knights and knaves liar truth-teller logic puzzle`; `truth lie statements logic puzzle each character says`; `deduction mystery daily who is guilty logic suspects`; `logic grid murder mystery deduction puzzle clues grid` | Braindom 2: Who is Lying? (Famobi, Mar 2023, 150 hand-made riddle scenes — "sometimes you figure out which person is lying"), Detective IQ: Brain Games (weekly stories), Find The Cow (grid deduction), Night Incident, Hidden Object: Detective Story | Clues by Sam (daily, everyone tells the truth, 20-suspect grid) [3rd], Daily Murder, Clue Raider, Griductive [3rd] | **headroom**: no generated liar-deduction with a solver found; the closest is a riddle game → new #1 |
| **Rumour spreading** through a town | `rumor gossip spread town`; `"rumor" OR "whisper" game` | We Become What We Behold (narrative, camera; not a spreading puzzle), Whooo? (unrelated) | itch.io jam games [3rd]: Fofoca, Gossip Ghosts, Small Town Rumours, TTK: Talk To Kill, whispers please, did you hear | **headroom** on the portal → new #2 |
| **Ecosystem balance idle** (species interact; overbuying crashes income) | `ecosystem idle predator prey balance food chain`; `ecosystem simulator population balance wolves rabbits` | Idle Ants, Idle Zoo, Fish Catch Idle, Idle Sea Park, Eat & Grow Fish, Hungry Ocean, EvoWorld.io, Planet Life Idle, Idle World — all "buy more, earn more"; animal simulators are single-animal | Cell to Singularity-style evolution idles (Steam), not checked | **headroom for the rule**, not the theme (nature idles are common) → new #3 |
| **Cloud herding** (swipe wind, all clouds slide, rain where they stop) | `push clouds rain weather puzzle`; `wind blow clouds`; `rainmaker OR "rain maker" OR "cloud puzzle"`; `sliding ice puzzle slide until blocked sokoban` | Weather: Tornado Madness, Grow a Garden (weather events). Slide rule: Ice Slide (slide until a wall, fill tiles), Just Slide (Remastered), Garden Slide, Neko Sliding, Sokoban, 2048 family | Storm (2013), Cloud (2005) [3rd] | **headroom, medium**: slide-until-blocked is common; the weather rules are the difference → new #4 |
| **Echo loop puzzle** (your past runs replay and help) | `time loop puzzle past self clones replay`; `echo recorded moves past self cooperate switches puzzle`; `time rewind puzzle replay yourself levels`; open web `crazygames "Looper"` | Jumping Clones (control several at once), Cut the Rope Time Travel (two eras), Déjà Vu: Same Level?!, 100 Doors Puzzle Box, Looper (Kwalee, a rhythm game — the name only) | itch.io [3rd]: Loop Echo, Recurse, Thought Loop, Project Echo; Echoshift (PSP, 2010) | **headroom** on the portal → new #5 |
| Music-layer idle (each instrument adds a loop) | `idle music band instruments incremental song` | **Music Band** (Fluffy Games, Apr 2026, 9.5): concert-empire idle | — | **dropped**: fresh, highly rated neighbour |
| Lighthouse beam steering ships | `lighthouse beam guide ships` | The Last Lighthouse (defend the beacon from sea monsters) | — | **dropped**: theme taken, and "steer by attraction" is Germ Bait's verb |
| Minesweeper RPG | `minesweeper roguelike dungeon dragonsweeper` | Rogue: Monster Sweeper, Minesweeper Squad, Minesweeper Duel, MineSweeper.io | Dragonsweeper (2025 web hit) [3rd] | **dropped** |
| Stamp / layer-order picture puzzle | `stamp layers puzzle order recreate picture`; `stamp puzzle "stamp"` | Tape Escape (peel overlapping strips in the right order — the same deduction reversed), Layers Roll, Block Sort – Jigsaw | — | **dropped**: too close to Tape Escape |
| Domino placement | `domino placement puzzle topple chain reach` | Domino Pressure (push one domino to crush a tomato), Domino Duel, Domino Battle | — | **dropped** |
| Juggling with upgrades | `juggle juggling keep in the air upgrades` | nothing close (Magic Finger 3D) | — | **not pursued**: a hypercasual core (8.6 min) |

## 4. Re-rank

Score = market × headroom × buildability, with a story bonus (+1 on buildability) where a story layer helps retention.
Market from CrazyGames genre averages [S via R]: puzzle 21 min → 5, clicker 15 → 4, action 13 → 3.5, .io 9 → 2, hypercasual 8.6 → 1.5.
Headroom 1–5 from §1 and §3. Buildability 1–5 on today's platform (`kit: code`, `UpgradeShop` + `mountUpgradeShop`,
`rewardedButton`, `host.save/rng/qa`, `gp covers/video/submission`, the concept gate); −1 for each block the idea needs
that doesn't exist (dialogue, daily, solver/level toolkit, prestige, offline earnings, portal adapters).

| New # | Idea | Market | Headroom | Build | Story | Score | Stars |
|---|---|---|---|---|---|---|---|
| 1 | Liar deduction, a daily case (new; absorbs old #2) | 5 | 4 | 3 (+1) | yes | 80 | ★★★★★ |
| 2 | Rumour mill (new) | 5 | 5 | 2 (+1) | yes | 75 | ★★★★☆ |
| 3 | Ecosystem balance idle (new; replaces old #5) | 4 | 4 | 4 | — | 64 | ★★★★☆ |
| 4 | Cloud herding (new) | 5 | 3 | 4 | — | 60 | ★★★★☆ |
| 5 | Echo loop puzzle (new) | 5 | 4 | 3 | — | 60 | ★★★☆☆ (level design is the cost) |
| 6 | Sort puzzle with weight (old #1) | 5 | 2 | 4 | — | 40 | ★★★☆☆ |
| 7 | Solitaire with recipes (old #12) | 5 | 2 | 3 | — | 30 | ★★☆☆☆ |
| 8 | Score-attack meta layer (old #4) | 1.5 | 2 | 5 | — | 15 | ★★☆☆☆ (an update, not a new game) |
| — | Arrow escape 13+ (old #3) | 5 | 1 | 5 | — | 25 | dropped for CrazyGames |
| — | Drop-and-merge (old #7) | 5 | 1 | 4 | — | 20 | dropped |
| — | Cozy garden / pond / bakery idle (old #5) | 4 | 1 | 4 | — | 16 | dropped |
| — | Ball / brick roguelite (old #6) | 3.5 | 1 | 3 | — | 10.5 | dropped |

Kids ideas (Google Play Families) are ranked on their own — portal genre data doesn't apply:
tap-to-grow garden (theme only, fastest) → toddler sort (drag-to-target) → counting jar (collector) → gentle logic 6–12 (grid block).

## 5. Things the audit turned up

- **Conflict in our own docs:** old card #2 and the "next blocks" table ask for a *streak*; [game-design.md](../guides/game-design.md)
  lists "no daily streaks" under dark patterns for everyone. The revised page asks for a **calendar of solved days** that never
  punishes a missed day. The team should settle this in game-design.md.
- **Twists in the old cards were not checked when written.** Of eleven named twists that could be searched, four are live
  (fusing balls, tilting jar, gravity merge, fish that change colour ≈ mutations) and one is our own game (regulars with stories).
  The revised cards name only twists that the searches didn't find, and say which searches were run.
- **2026 releases dominate the crowded genres** (Arrow Escape ×2, Wizard Puppy: Magic Sort, Screw Sorting, Jewel Coloring,
  Music Band, Cell Survivor, Chill Reaction): the portal fills trends within months. A trend listed here is a trend others
  are already shipping; the headroom must come from the rule.
- **A taken-concepts file would save each game ≈ 10 minutes** (Germ Bait's search time [R]) and give the validator something to
  compare with: this audit is its first content.
