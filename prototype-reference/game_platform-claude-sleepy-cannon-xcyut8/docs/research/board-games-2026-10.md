# Board games as a source of short digital games — research for game_platform

*2026-10-19. The owner's request: "изучи настолки — там можно найти интересное для разработки" (study tabletop games, there's useful material in them for development).*
*Method: web searches (BoardGameGeek itself returns 403 to this session and its XML API returns 401, so BGG facts come from
secondary sources, award juries and Board Game Arena); CrazyGames read directly (its tag pages and game pages are
server-rendered and reachable from this session: 15 tag pages and ≈ 45 game slugs probed on 2026-10-19); the repo
(AGENTS.md, genres.md, game-ideas.md, game-design.md, `packages/core/src`, `packages/spec/src/taken.ts`, `gp lessons`); and
`gp forecast --idea` for every idea in §3. Facts with no URL are background knowledge, marked (bk). Treat the sales numbers
as the third-party estimates they are.*

---

## 0. The short version

- **Board games are a library of proven, already-balanced *decision loops* that run in short turns.** The best digital
  hits of 2019–2026 are board mechanics with the bookkeeping automated and the luck moved in front of the decision:
  Slay the Spire (Dominion + Netrunner → deckbuilding roguelike; StS 2 sold 3.3 M in its first week of early access,
  March 2026), Balatro (poker + Luck be a Landlord → over 5 M copies), Luck be a Landlord (a slot machine as a bag
  builder: ≈ 275 K on Steam), Backpack Battles (polyomino inventory + async PvP: 640 K in a month), Dorfromantik (tile
  laying: ≈ 0.5–1 M+ on Steam; its board game then won Spiel des Jahres 2023), Loop Hero (a deck of map tiles: 1 M in 9
  months), Dicey Dungeons (dice placement).
- **The portal has a crowded *score-target card roguelike* shelf** (Pocketro 2025-05, Cardlike 2026-03, Super Coupon
  Club: Origins 2026-10-16, Tavern Rumble, Dungeon Deck, Dungeon Crawl Theater, Poker Quest, Die in the Dungeon) and a
  crowded *block/polyomino* shelf (≈ 35 "10x10 / Block Puzzle / Wood Block" games). It has **none** of the following
  (by the tag pages and probes): a bag-builder, a card racer, a dice-placement landing or vehicle puzzle, a trick-taking
  roguelite, a roll-and-write, a Dorfromantik-like landscape tiler, a Patchwork-style market ring. That's where the
  originality is.
- **What the platform has already covers most of the board-game meta** (RunChoices = drafting 1 of 3, Tiers, PactTree,
  seeds, the daily, seasons, stars, undo, the story engine). **What it lacks is the board itself**: card zones, a bag, dice,
  grids, polyominoes, a pattern matcher, a trigger engine that explains its combos, and an automa. Section 4 ranks those.
- **Top 5 blocks:** (1) `Zones`: deck, bag and stack (draw, discard, exhaust, bust); (2) `Board`: grid, hex, polyomino
  and pattern; (3) `Chain`: a trigger engine with a scoring trace the art layer animates; (4) `Automa`: a rival that
  telegraphs its moves; (5) `DailyTable`: variable setup, shared seed, rank bands and a share card.
- **Top 3 ideas:** a card racer in the spirit of Heat (#2), a fireworks bag-builder with push-your-luck (#1), a
  trick-taking roguelite with exact bids (#8). The forecast puts each at €19–21 expected over months 1–3, the top of
  today's range.

---

## 1. The mechanics catalog

BGG's taxonomy has ≈ 50 mechanics; its own label now merges "Deck, Bag, and Pool Building" into one, and that family
was the most-tagged mechanic among new releases in 2022 (5.3%) and 2023 (5.4%, with Push Your Luck at 3.6%)
([Board Game of the Year stats 2023](https://boardgameoftheyear.org/2023/sites/Stonemaier%20Games),
[2022](https://boardgameoftheyear.org/2022/sites/All%20You%20Can%20Board),
[Bell of Lost Souls on BGG's most and least popular mechanics](https://www.belloflostsouls.net/?p=271905)).
Recent juries say what's winning now: Spiel des Jahres 2024 Sky Team (cooperative dice placement), 2025 Bomb Busters
(cooperative deduction; nominee Flip 7, push-your-luck), Kennerspiel 2025 Endeavor: Deep Sea; Castle Combo (a 3×3 card
tableau) recommended in 2025; SdJ 2026 Dito!, Kennerspiel 2026 Rebirth (Knizia)
([SdJ 2025](https://www.spiel-des-jahres.de/en/the-spiel-des-jahres-2025-is-bomb-busters/),
[SdJ 2026 – icv2](https://icv2.com/articles/news/view/62835/spiel-des-jahres-winner-announced),
[Sky Team – Wargamer](https://www.wargamer.com/board-games/sky-team-spiel-des-jahres-winner),
[Castle Combo – Pandasaurus](https://pandasaurusgames.com/blogs/pandasaurus-blog/faraway-castle-combo-recognized-by-spiel-des-jahres)).
Board Game Arena's player vote: 2025 Harmonies (best regular), Castle Combo (best casual), Splendor Duel; 2026 Flip 7
(best casual), Toy Battle ([Boardgamewire](https://boardgamewire.com/index.php/2025/02/04/harmonies-darwins-journey-splendor-duel-among-winners-in-this-years-boardgamearena-awards/),
[Tabletop Gaming](https://tabletopgaming.co.uk/news/board-game-arena-award-winners-announced)).
**The trend is plain: light, fast, solo-friendly games with one clever constraint win, not heavy euros.** That is what
a 10–30 min web session wants.

### Overview

| # | Mechanic | Fits a 10–30 min session | Natural break | Rewarded hook | Kids (2–12)? | Near it in `@gp/core` | Block priority |
|---|---|---|---|---|---|---|---|
| 1 | Deck-building | ★★★★★ | a fight or a round | undo the last draw, ×2 gold, reroll the reward | no (reading) | `RunChoices` (card reward), seeds | **1** (Zones) |
| 2 | Bag-building | ★★★★★ | a night/round | take back the bust token | 6–12: yes, no fail | `Bag` (rng.ts) shuffles indices only | **1** (Zones) |
| 3 | Push-your-luck | ★★★★★ | every bank/bust | "second chance" = revive | 6–12, without loss | — | **1** (Zones: bust rule) |
| 4 | Dice placement | ★★★★☆ | a turn set / a level | reroll one die, hint | 6–12: yes | `rng` | 6 (Dice) |
| 5 | Roll/flip-and-write | ★★★☆☆ alone, ★★★★☆ with a campaign | a sheet | reroll, peek | 6–12: yes | `daySeed`, `dailyRunSeed`, `recordDaily` | 5 (DailyTable) + 2 |
| 6 | Tile-laying | ★★★★★ | the stack runs out / a quest | +5 tiles, undo | 2–8: yes | — | **2** (Board) |
| 7 | Polyomino placement and the time track | ★★★★☆ | a voyage / a quilt | undo, an extra row trial | 6–12: yes | `UndoHistory` | **2** (Board) |
| 8 | Engine building / tableau | ★★★★★ | a round / a rent | ×2 harvest, reroll market | no | `UpgradeShop` (numbers only) | **3** (Chain) |
| 9 | Drafting (market) | ★★★★☆ | a round | refresh the market | yes | `RunChoices` (1 of N + reroll) | in 1/2 (Market) |
| 10 | Set collection | ★★★☆☆ (as a layer) | — | — | **2–5: yes** | `Roster`, `Tiers` (meta) | small helper |
| 11 | Pattern building | ★★★★☆ | a round | a hint (show the pattern) | 6–12 | — | **2** (Board.patterns) |
| 12 | Worker placement | ★★☆☆☆ | a round (year) | an extra worker | no | idle `Sites` (distant) | 8 |
| 13 | Area control / majority | ★★★☆☆ | a stage | — | no | — | 9 |
| 14 | Trick-taking | ★★★★☆ | a hand | peek one card, redeal | 9–12 | — | in 1 + 4 |
| 15 | Hidden roles / deduction | ★★★☆☆ solo (as a puzzle) | a case | a clue | 9–12 | story engine; idea #1 of game-ideas.md | 7 (Deduce) |
| 16 | Real-time | ★★★☆☆ | a round | +10 s | yes | the action loop | — |
| 17 | Legacy / campaign | ★★★★☆ (as the meta) | a chapter | — | 6–12 | `StoryRunner`, `Tiers`, `seasonPass` | 10 (Ledger) |
| 18 | Solo modes and automas | (the enabler) | — | — | — | the balance bot (a player, not a rival) | **4** (Automa) |

---

### 1.1 Deck-building (and its digital form, the roguelike deckbuilder)

- **Core loop:** draw a hand from your deck → play cards for effects → buy or earn a new card into the discard → reshuffle;
  the deck you play at the end is one you made. Digital: a fight per node, a card reward (1 of 3) after it.
- **Why it's fun:** each new card is a bet on how often you'll draw it (a thin deck draws its best cards often); removing a card is
  as strong as adding one; the build is made in the run. Tension: a dead draw.
- **Proof:** Dominion (2008) started it; Dune Imperium and Lost Ruins of Arnak fuse it with worker placement, the cards
  decide which spaces you can visit ([Roll to Review](https://rolltoreview.com/?p=17416)); Heat (hand management with heat
  cards that clog the deck, below). Digital: Slay the Spire started as "Dominion meets roguelike", with Netrunner in
  the mix, and was balanced from metrics ([Wikipedia](https://en.wikipedia.org/wiki/Slay_the_Spire),
  [GDC 2019 – Game Developer](https://www.gamedeveloper.com/design/learn-i-slay-the-spire-i-s-metrics-driven-approach-to-game-balancing-at-gdc-2019));
  Slay the Spire 2: 3.3 M sold, 25 M runs in its first week, ≈ 575 K concurrent players
  ([GosuGamers](https://www.gosugamers.net/entertainment/news/78130-slay-the-spire-ii-sells-3-3-million-copies-as-players-attempt-25-million-runs-in-first-week));
  Cobalt Core (cards move your ship on one axis: dodging is the twist, "builds on the formula instead of imitating it"
  — [Wikipedia](https://en.wikipedia.org/wiki/Cobalt_Core), [PC Gamer](https://www.pcgamer.com/cobalt-core-review/));
  Wildfrost (each unit has a counter that ticks down and attacks at 0, so the enemy's next move is always shown —
  [Wildfrost Wiki](https://wildfrostwiki.com/Counter)); Inscryption (damage is a scale that tips at 5: a tug of war, not
  two HP bars — [Wikipedia](https://en.wikipedia.org/wiki/Inscryption)); Loop Hero (the deck is map tiles you lay
  around a loop: 500 K in 7 days, 1 M by Dec 2021 —
  [GamingOnLinux](https://www.gamingonlinux.com/2021/12/loop-hero-from-four-quarters-hits-a-million-sales/)).
- **The lesson in the successes:** each hit changes *one* thing about the base loop — the board (Cobalt Core), the clock
  (Wildfrost), the health (Inscryption), the map (Loop Hero), the deck itself (Balatro's 52 cards). A deckbuilder with
  no such change is what the portal already has six of.
- **10–30 min and ads:** a fight takes 1–3 min, which is a natural break; an act (≈ 8–12 min) ends at a boss. Rewarded:
  "Redraw" (redraw the hand once a fight), ×2 gold on the results, a reroll of the card reward (`RunChoices.addRerolls`),
  a trial of a locked starter deck. Revive: "Last stand" (back to 1 HP) once a session.
- **Solo trick:** the enemy is an automa with **visible intent** (StS's intents, Wildfrost's counters): the player reads
  the next blow and plans, so the solo game is a puzzle, not a dice roll.
- **Platform block — `Zones` (deck mode):**
  ```ts
  const z = zones<Card>({ rng: host.rng, piles: ['draw', 'hand', 'discard', 'exhaust'], handSize: 5 });
  z.setup(starterDeck); z.draw(5);              // reshuffles discard into draw when empty
  z.move(card, 'hand', 'discard'); z.exhaust(card);
  z.add(newCard, 'discard'); z.remove(card);    // the build: adds and removals
  z.peek('draw', 3); z.odds('draw', c => c.kind === 'attack'); // a readable chance for the HUD
  z.save(); zones.load(saved);                  // a mid-run save; deterministic under ?seed
  ```
  Settings: piles, hand size, reshuffle rule (when empty / at turn end), retain, a starting deck, and an `onEmpty`
  (reshuffle | lose | end round).
- **Near it today:** `RunChoices` (the card reward), `newRunSeed`/`seedField`, `host.rng`; no card zones. Each card
  game would write draw, discard and reshuffle by hand.

### 1.2 Bag-building

- **Core loop:** draw tokens blindly from your own bag into a pot or track; at round end you buy tokens into the bag;
  the bag's makeup is your build. Usually paired with push-your-luck (§1.3).
- **Why it's fun:** the same probability game as a deck, but the bag shows its contents (a count by kind) and the draw is
  one token at a time, so every pull is a decision. Quacks: keep drawing while the white "cherry bombs" stay ≤ 7, or
  stop; the pot "explodes" past 7 ([Meeple Mountain](https://www.meeplemountain.com/reviews/the-quacks-of-quedlinburg/),
  [Punchboard](https://punchboard.co.uk/the-quacks-of-quedlinburg-the-alchemists-review/)). Its catch-up (rat tails: the
  further behind, the bigger the head start) softens the swings.
- **Proof:** Quacks of Quedlinburg (SdJ Kennerspiel 2018, bk), Orléans, Altar Quest; Fire in the Library (books vs fire
  cubes); Luck be a Landlord is a bag builder in disguise: the symbols you add go into a "bag" the slot draws 20 from
  each spin; ≈ 275 K Steam copies, 93% positive of 11.5 K reviews, and Balatro's author calls it "the one largest
  influence on Balatro" ([Raijin estimate](https://raijin.gg/app/1404850/Luck_be_a_Landlord),
  [Steam](https://store.steampowered.com/app/1404850/Luck_be_a_Landlord/)). Ballionaire (pachinko + building, Very
  Positive — [Nodal](https://nodal.gg/game/ballionaire-2667120)).
- **10–30 min and ads:** a night is 60–90 s and nine nights make a game: breaks are built in. Rewarded: **"Catch it"**,
  taking back the bust token (the revive, once a session), ×2 earnings on the results, a reroll of the token shop.
- **Solo trick:** a target per round (the rival's pot as a number, or a rising quota) plus Quacks' catch-up as a
  **mercy rule**: after two busts the next night starts with a head start. The odds are on screen.
- **Platform block — `Zones` (bag mode)** plus the bust rule of §1.3:
  ```ts
  const bag = zones<Token>({ rng: host.rng, piles: ['bag', 'pot', 'out'], blind: true });
  bag.counts('bag');                  // { white1: 4, red2: 2, ... } — the bag shown as a count, as the board game lets you
  bag.draw(1, 'pot'); bag.returnAll('pot', 'bag');
  ```
- **Near it today:** `Bag` in `rng.ts` is a no-repeat shuffle of indices (for spawn variety), not a player-owned bag.

### 1.3 Push-your-luck

- **Core loop:** take another draw, roll or step for more, or stop and bank; a bust loses what's unbanked.
- **Why it's fun:** a decision every second, with real stakes, and the odds can be read; the stories are the busts. Flip 7
  (each number appears as many times as its value, a duplicate busts you) won BGA's best casual game 2026 and was an
  SdJ 2025 nominee ([Player2 review](https://www.player2.net.au/2025/07/flip7-review-flippin-good-time/),
  [Tabletop Gaming](https://tabletopgaming.co.uk/news/board-game-arena-award-winners-announced)); Can't Stop,
  Diamant/Incan Gold, Quacks (bk).
- **Digital proof:** Balatro's "one more hand / discard" economy, Dungeons & Degenerate Gamblers (blackjack, 81% positive,
  a top-25 Next Fest demo — [GameCritics](https://gamecritics.com/jack-dunn/dungeons-degenerate-gamblers-review/)),
  Lucky Tower on CrazyGames (pick a door, a funny death: live since 2020).
- **10–30 min and ads:** the best mechanic in the catalog for rewarded ads: the bust is a moment the player *wants* to
  undo, so a "second chance" (the platform's revive kind, once a session) is taken often. Each bank/bust is also
  a micro-break; a midgame ad goes at the round end, never at the bust (it would read as punishment).
- **Solo trick:** a **target** (beat 40 tonight) and a **ladder** (each round's target rises: Balatro's blinds), so
  "stop" has a meaning without a rival.
- **Platform block — the bust rule in `Zones`, and a `Gamble` helper:**
  ```ts
  const g = gamble({ bustWhen: pot => sum(pot, t => t.risk) > 7, bank: pot => score(pot) });
  g.risk(bag);          // chance the next draw busts: for the HUD's meter
  g.push(); g.stop();   // → { banked } | { bust, lost }
  g.secondChance();     // undo the bust once (wired to rewardedButton)
  ```
  QA hook: `gp qa` can play a push-your-luck game with a "stop at 50% risk" bot and check that the risk shown
  matches the measured one.
- **Note for kids:** push-your-luck without loss (a bust only ends the round, keeping what was banked) suits ages
  6–12; never with a clock or penalties for the youngest (`E_NO_FAIL`).

### 1.4 Dice placement (dice allocation)

- **Core loop:** roll a pool, then assign each die to a slot whose rule it must fit (any, odd, ≥ 4, exact, a pair, a sum);
  each slot does something.
- **Why it's fun:** "input randomness": luck first, then the decision. Dicey Dungeons' author calls it *"an inversion of
  RPG combat… the player gets the RNG up front and decides how to make the best of it"*; the fun is in mismatches
  between dice and slots ([Game Developer – Road to the IGF](https://www.gamedeveloper.com/disciplines/road-to-the-igf-cavanagh-houston-dobbe-s-i-dicey-dungeons-i-),
  [Siliconera](https://www.siliconera.com/the-many-sides-of-dicey-dungeons-on-switch/)).
- **Proof:** Sky Team (SdJ 2024: two pilots secretly roll and place dice on axis, engines, flaps, gear, brakes over 7
  rounds of descent; ≈ 20 min — [Wargamer](https://www.wargamer.com/board-games/sky-team-spiel-des-jahres-winner),
  [Tabletopping](https://tabletopping.games/2024/07/25/sky-team-a-flight-simulation-adventure-for-two/)), Grand Austria
  Hotel, Lords of Vegas (bk); digital: Dicey Dungeons, Die in the Dungeon (CrazyGames, 2021), Dicefolk, Dog Witch (2025).
- **10–30 min and ads:** a level is a short puzzle (one landing, one fight); rewarded: "reroll one die", "a hint: the best
  slot for this die", a revive. Stars per level from a par (leftover dice, fuel).
- **Solo trick:** Sky Team's partner becomes an **automa with a visible rule** ("the co-pilot puts its highest die on
  engines"): the player plans around a teammate it can read, the cooperative game without the second human.
- **Platform block — `Dice`:**
  ```ts
  const tray = dice({ rng: host.rng, count: 4, faces: 6 });
  tray.roll(); tray.reroll(i);                         // rerolls are a resource (a token, an ad)
  const slot = slotRule('even') | slotRule({ min: 4 }) | slotRule({ exact: 6 }) | slotRule({ sumWith: 'flapsB', is: 7 });
  slot.accepts(die); board.place(die, slotId);          // legality + an undo via UndoHistory
  ```
  Settings: faces (custom faces as in Dicey Dungeons), pool size, reroll budget, slot rules. Rendering: a dice roll
  animation and sound in `@gp/art` (dice are the most "physical" joy of board games).
- **Near it today:** `rng`, `UndoHistory`, `starsFromPar`; nothing for dice.

### 1.5 Roll-and-write / flip-and-write

- **Core loop:** everyone sees the same dice or card flip; each player writes it into their own sheet (a road, a
  shape, a number in a street); at the end the sheet is scored.
- **Why it's fun:** the same luck for all, so it's pure skill against the sheet; every roll a small spatial puzzle;
  a sheet that fills up visibly ([Tabletop Gaming](https://tabletopgaming.co.uk/Features/the-best-roll-write-games),
  [Zatu](https://zatu.com/blogs/features/shake-rattle-roll-and-write)). Railroad Ink: connect routes from the dice; solo
  it's "playing against yourself"; Cartographers turns flip-and-write into a map with seasons and changing scoring cards.
- **Proof:** Welcome To…, Railroad Ink, Cartographers (BGA 2025 runner-up), Hadrian's Wall, Floodlands (print and play);
  in the browser, gilga on itch.io ([itch.io](https://itch.io/t/2251859/gilga-a-calm-abstract-roll-and-write-game-about-drawing-paths)).
  Digital's closest mass hit is the shared daily puzzle (Wordle's model: the same seed for all, a share card).
- **10–30 min and ads:** one sheet is 4–8 min: short on its own; a campaign (maps with stars) or a "season" of sheets
  (Cartographers' 4 seasons) makes the session. Rewarded: reroll one die once a sheet; "peek at the next roll".
  The daily is the D1 lever.
- **Solo trick:** **score bands with names** ("Rookie Surveyor < 40 < Cartographer < 70 < Master"): the solo player beats a
  rank, not a rival. Railroad Ink and Cartographers both ship such tables.
- **Platform block —** the sheet is a `Board` (§1.6), the shared roll is `DailyTable` (§4 #5).
- **Near it today:** `daySeed`, `dailyRunSeed`, `recordDaily`, `mountStreakCard`.

### 1.6 Tile-laying

- **Core loop:** draw or choose a tile, place it touching the map so its edges fit, score the regions it closes or extends.
- **Why it's fun:** a map that grows and becomes *yours*; a "perfect fit" is a small payoff, an open region a small hope.
  Dorfromantik's tile stack is the budget: quests (a river of 6, a closed forest) earn more tiles, so the game lasts as
  long as you play well (a running budget, not a timer — [Wikipedia](https://en.wikipedia.org/wiki/Dorfromantik));
  Islanders: placing a building scores by what's near, the points open the next pack ("the Tetris of city builders" —
  [Wikipedia](https://en.wikipedia.org/wiki/Islanders_(video_game))).
- **Proof:** Carcassonne (bk), Cascadia (a market of 4 tile+animal pairs, swappable scoring cards, "shines brightest at
  one player" — [Frontline Gaming](https://frontlinegaming.org/2025/06/11/board-game-review-cascadia/)), Harmonies
  (stacked tokens, BGA best game 2025 — [Meeple Mountain](https://www.meeplemountain.com/reviews/harmonies/)).
  Digital: Dorfromantik (Raijin: ≈ 527 K Steam copies; SteamSpy 1–2 M owners —
  [Raijin](https://raijin.gg/app/1455840/Dorfromantik), [SteamSpy](https://www.steamspy.com/dev/Toukana+Interactive)),
  and its board game won SdJ 2023 ([Wikipedia](https://en.wikipedia.org/wiki/Dorfromantik:_The_Board_Game)); Islanders,
  Loop Hero, Carcassonne apps.
- **On CrazyGames:** hex tiles are only *sorting* games (Hexa Stack 2026-07, Hexa Sort, Wood Hexa Factory) and a path
  drawer (Hexa Fill Puzzle); no landscape tiler found (`/game/dorfromantik`, `/t/hexagon`, `/t/city-builder` are 404).
- **10–30 min and ads:** the stack is the session; a quest closed = a payoff; "the stack is empty" = the natural end and a
  break. Rewarded: "+5 tiles" once a map (the revive: the game goes on), ×2 on the score, undo the last tile.
- **Solo trick:** the stack as a budget plus quests; a threat that **telegraphs** (§2.4) to give it teeth.
- **Platform block — `Board` (grid/hex):**
  ```ts
  const b = board<Tile>({ shape: 'hex' | 'square', size: [9, 9] | 'open' });
  b.fits(tile, at, rotation);                 // edge matching through tile.edges and a match(a, b) rule
  b.legal(tile);                              // every legal (at, rotation): the hint and the bot use it
  b.place(tile, at, rot); b.regions('forest'); // connected regions (union–find), closed or open
  b.neighbours(at); b.ring(at, r); b.line(from, dir);
  ```
- **Near it today:** nothing. Block #1 of game-ideas.md (the puzzle toolkit: board state, undo, level file, solver
  hook) is the same need: build it as `Board` once.

### 1.7 Polyomino placement and the time track

- **Core loop:** take a shaped piece (from a market), place it on your grid (rotate, flip), pay its cost; fill
  rows/regions for points; the empty cells cost you at the end.
- **Why it's fun:** a Tetris satisfaction with planning: a big awkward piece now, or a small one that fits. Patchwork adds
  **time as a cost**: each patch costs buttons *and* time; whoever is behind on the time track moves next; passing a
  button mark pays income; empty squares are −2 each; the first 7×7 square earns a bonus of 7
  ([Dice Tower](https://dicetower.com/board-game/163412),
  [Cardsrealm review](https://mtg.cardsrealm.com/en-ph/articles/patchwork-review-simple-rules-quick-turns-challenging-game)).
  The market is a ring: you may take one of the next three after the pawn. Two currencies (coins and time) make
  every piece a trade-off.
- **Proof:** Patchwork, Cottage Garden, Bärenpark, Isle of Skye (bk), Tetris. Digital: Backpack Hero (items gain power
  from neighbours or need empty space — [Epic Games](https://store.epicgames.com/news/backpack-hero-makes-inventory-management-a-blissful-delight)),
  Backpack Battles (500 K in under two weeks, 640 K in a month, 48% of sales in China, an async PvP of players' builds —
  [Game World Observer](https://gameworldobserver.com/2024/04/25/backpack-battles-sales-640k-copies-china-top-country)),
  ship-loading puzzles off-portal (Ocean Express, Vira, where cargo has weight and the boat must stay balanced —
  [Gamezebo](https://www.gamezebo.com/reviews/ocean-express-review/)).
- **On CrazyGames:** Backpack Battles is live (2023); ≈ 35 block-fill games (`/t/tetris`: 10x10!, Block Champ, Wood Block
  Journey, Sudoku Block Puzzle, Sandtrix …). A pure block placer is saturated (game-ideas.md: "plain block-blast"); the
  open space is the **market + time + income** of Patchwork, or a polyomino with a physical rule (weight/balance).
- **10–30 min and ads:** a quilt/voyage is 2–4 min, a natural break; rewarded: undo the last piece (undo kind), a
  trial of a bigger grid, ×2 income.
- **Solo trick:** Patchwork's solo is score-attack; a better one is an **automa on the time track** that takes the piece
  you'd want by a visible rule ("takes the cheapest piece in reach").
- **Platform block — `Board` (polyomino part):**
  ```ts
  const P = polyomino('L4');                 // or from a cell list; P.rotations, P.flips, P.cells
  b.canPlace(P, at, orient); b.placements(P); // all legal placements (hints, the bot, "can it still fit?")
  b.filled(); b.emptyCells(); b.fullRows(); b.squares(7);
  market = ring(pieces, { reach: 3 });        // take one of the next 3; the pawn moves on
  ```
- **Near it today:** `UndoHistory`, `starsFromPar`. Nothing for shapes.

### 1.8 Engine building / tableau

- **Core loop:** add cards to a tableau; each one makes later actions stronger or triggers when something happens;
  early turns build, late turns harvest.
- **Why it's fun:** a felt growth of power: Hargrave on Wingspan: *"that structure really helps players feel more and
  more powerful over the course of the game, in a very tangible way"*; birds in one habitat chain their powers when
  that row is activated (an idea taken from Deus) ([Board Game Design Lab](https://boardgamedesignlab.com/how-to-design-an-engine-building-game-with-elizabeth-hargrave/),
  [Wikipedia](https://en.wikipedia.org/wiki/Wingspan_(board_game))). Castle Combo compresses it into 9 cards: a 3×3 grid
  where each card scores off its neighbours, two currencies (coins and keys)
  ([Spielwarenmesse](https://www.spielwarenmesse.de/en/mag/toy-lab/spiele-highlights-2025/),
  [Meeple Mountain](https://www.meeplemountain.com/reviews/castle-combo/)).
- **Proof:** Wingspan (170 unique birds; an enormous seller), Castle Combo, Earth, Res Arcana, Race for the Galaxy
  (bk). Digital: **Balatro** (jokers in a row, triggered left to right: the engine *is* the combo cascade; started from
  the card game Big 2 and from watching Luck be a Landlord; demos and community iteration made it — 250 K in 3 days,
  1 M in a month, 3.5 M by late 2024, 5 M+ by early 2025 —
  [TouchArcade interview](https://toucharcade.com/2024/03/18/balatro-interview-mobile-port-localthunk-dlc-plans-updates-new-jokers-demo-feedback/),
  [Game World Observer](https://gameworldobserver.com/2024/03/18/balatro-sales-1-million-copies-first-month-localthunk),
  [GamesMarket](https://www.gamesmarket.global/publishing/poker-roguelike-balatro-sells-more-than-five-million-copies-311dcc58f214ad4dd53243ae1161ba71));
  Luck be a Landlord (adjacent symbols trigger each other).
- **What made Balatro work, beyond poker:** a familiar base (everyone knows a pair and a flush, so there's no rules
  text), the score shown as **chips × mult counted up one trigger at a time**, so every combo explains itself, and rising
  blinds as the clock. LocalThunk avoided fantasy vocabulary on purpose. **Careful:** game-ideas.md lists
  "slot / poker looks: PEGI 18 risk (Balatro was first rated 18)". Take the engine, not the casino.
- **On CrazyGames:** the score-target card roguelike is crowded: Pocketro (poker deckbuilder, 2025-05), Cardlike (target
  scores, 2026-03, rated 9.1), Super Coupon Club: Origins (coupons stack discounts, 2026-10-16). A new one needs a different
  board (a 3×3 or a map), not different cards.
- **10–30 min and ads:** a round (a rent, a blind) is 1–2 min; an ante of three rounds is ≈ 5 min, which is where the
  midgame goes. Rewarded: reroll the shop, ×2 harvest, keep a card that would leave.
- **Solo trick:** a **rising quota** (rent/blind ladder), and stakes after the campaign (Balatro's stakes: the cheapest
  content multiplier, already in game-design.md).
- **Platform block — `Chain` (trigger engine with a trace):**
  ```ts
  const engine = chain<Ctx>({ order: 'left-to-right' | 'grid-reading' | 'priority' });
  engine.add({ id: 'mill', on: 'harvest', when: c => c.adj('field') > 0, do: c => c.add('grain', c.adj('field')) });
  const trace = engine.fire('harvest', ctx);  // [{ source, target, delta, total }…], deterministic
  playTrace(trace, { fx, sound, speed: 'auto' }); // @gp/art: count up step by step, pitch rising with each step
  engine.limit = 200;                          // loop guard; the QA bot reports runaway chains
  ```
  The trace is the important part: it is what the player watches (the Balatro count-up), what `balance()` reads, and
  what a test asserts.
- **Near it today:** `UpgradeShop` gives "+stat" levels; `Fx` and `burst()` can play the steps; no trigger engine.

### 1.9 Drafting (a market)

- **Core loop:** choose one from a shared display (or a passed hand); what you don't take the others (or the
  automa) may take; the display refills.
- **Why it's fun:** a small menu (3–6), so decisions are fast; denial; the value of a card depends on what you already
  have. Azul's factories (take all of one colour from a display; the rest go to the centre; what you can't place falls to
  the floor line as a penalty) ([Wikipedia](https://en.wikipedia.org/wiki/Azul_(board_game))); Cascadia's 4 pairs
  with a "nature token" to break the pairing.
- **Proof:** 7 Wonders, Sushi Go, Azul, Cascadia, Splendor Duel (BGA 2025), Century (bk). Digital: every roguelite's 1-of-3
  (StS card reward, Balatro's shop).
- **10–30 min and ads:** drafting is the fast part of other mechanics; rewarded: refresh the market once a round.
- **Solo trick:** the market **decays**: the card at the end leaves each turn, or the price drops as it slides
  (Century, Small World), so waiting has a cost even without a rival.
- **Platform block —** `RunChoices` already is a draft (weights, max, requires, excludes, rerolls). Missing: a
  **persistent market row** (slots that keep cards, refill and slide down, a price by position):
  `market({ slots: 4, refill: 'slide', price: i => base + i })`. Put it in `Zones` as a pile with positions.

### 1.10 Set collection

- **Core loop:** collect matching or varied items; a set scores more than its parts (1-2-3-4 → 1-3-6-10).
- **Why it's fun:** an instant, readable goal ("one more red"); the near-complete set pulls you on.
- **Proof:** Ticket to Ride, Sushi Go, Splendor, Lost Cities (bk); digital: sticker albums, Pokémon. It's the kids kit's
  sticker reward already.
- **Fit:** a layer, not a game; best as the meta (a collection screen) or a scoring rule. **Kids 2–5: yes** (match three
  animals, no fail).
- **Platform block:** scoring helpers in `Board`/`Zones` — `scoreSets(items, { by: 'kind', table: [1,3,6,10] })`,
  `runs()`, `majority()`; the meta side is `Roster`/`Tiers`.

### 1.11 Pattern building (spatial scoring)

- **Core loop:** place pieces so they form scoring patterns (a line of 5, a cluster, an L, a habitat shape); the
  scoring cards change between games.
- **Why it's fun:** the goal is a *shape*, visible on the board; partial patterns pull you toward the next placement.
  Harmonies: animal cards show the habitat they need; a river scores by length; a mountain scores 0 alone
  ([Meeple Mountain](https://www.meeplemountain.com/reviews/harmonies/)); Cascadia has four scoring cards per
  animal, so the same tiles play differently ([People of Play](https://peopleofplay.com/blog/game-review-cascadia)).
- **Proof:** Azul (rows and columns), Sagrada, Cascadia, Harmonies, Calico (bk). Digital: match-3 is the degenerate case.
- **10–30 min and ads:** a hint is the natural rewarded offer ("show me where this pattern can still be made").
- **Solo trick:** rotate the scoring cards (A/B/C/D per element) by the day or week, the variable setup of §2.6.
- **Platform block — `Board.patterns`:**
  ```ts
  const bearPairs = pattern({ cells: [[0,0],[1,0]], of: 'bear', exclusive: true, isolated: true });
  b.find(bearPairs);              // the matches (for scoring and highlighting)
  b.progress(bearPairs);          // nearly-complete matches: hints, the "one more" glow
  scoring({ card: 'bear-B', table: [0,4,11,19,27] })
  ```

### 1.12 Worker placement

- **Core loop:** place a limited number of workers on action spaces; a space taken is blocked for the others; recall.
- **Why it's fun:** planning under scarcity, being blocked, a growing workforce. Arnak adds exploration (new spaces open
  as you explore); Dune Imperium makes cards say where you may go
  ([Roll to Review](https://rolltoreview.com/?p=17416)).
- **Fit:** weakest for a 10-second web hook (many rules before the first fun); its casual cousin is time management
  (Diner Dash, Papa's: both live on CrazyGames).
- **Solo trick:** an automa that blocks spaces by a visible card (Automa Factory's Viticulture).
- **Block:** `ActionSpaces({ spaces, capacity, blockedBy })`. Low priority; an idle `Sites` game is the nearest thing
  we ship.

### 1.13 Area control / majority

- **Core loop:** add influence to regions; whoever has the most in a region scores it at checkpoints.
- **Why it's fun:** tug of war; reading where the rival goes. Arcs (2024) (bk), El Grande, Toy Battle (BGA 2026).
- **On CrazyGames:** Dice Wars, Hex Empire, Landgrab Royale (2026-06), and Risk-likes are live.
- **Fit:** a strategy genre (13 min); needs an automa. Block: `Influence` on `Board` regions plus `Automa`.
  Priority low.

### 1.14 Trick-taking

- **Core loop:** each player plays one card; follow suit if you can; highest (or trump) wins the trick; score tricks
  (or the exact number you bid).
- **Why it's fun:** reading what others hold from what they played; the bid as a promise; the tension of the last
  tricks. The Crew (2019) made it cooperative with missions ("win a trick with the pink 1") and "kickstarted a huge
  renaissance" of trick-takers; LotR: Fellowship (trick-taking) followed ([Wikipedia](https://en.wikipedia.org/wiki/The_Crew_(card_game)),
  [Meeple Mountain](https://www.meeplemountain.com/reviews/the-fellowship-of-the-ring-trick-taking/eed/)).
  Arcs (2024) uses trick-taking for actions (bk).
- **Digital proof:** Hearts and Spades classics (on CrazyGames since 2018); the roguelite form is only arriving:
  Trick-Taking Rogue (Steam, 2026), Overtrick and Tricklewood Tales on itch.io
  ([Steam](https://store.steampowered.com/app/3703450), [itch.io](https://celloloops.itch.io/overtrick)).
- **10–30 min and ads:** a hand (8–10 tricks) is 1–2 min; a table of 3–5 hands is a natural break. Rewarded: peek at
  one rival's card, redeal a hopeless hand (once a session), ×2 winnings.
- **Solo trick:** rivals are automas with **declared habits** ("Magpie always leads her highest", "Mole never wins
  the first trick"), the trick-taking version of telegraphing. Readable rivals make a solo trick-taker a deduction
  puzzle.
- **Block:** a `Tricks` rule set on top of `Zones` (lead, follow, trump, winner, bids) plus `Automa` for the rivals.

### 1.15 Hidden roles and deduction

- **Core loop:** some players (or statements) are lying; deduce who from what they say and do.
- **Proof:** Werewolf, The Resistance, Bomb Busters (SdJ 2025: deduce the numbers of your own hidden wires from
  teammates' visible ones; 48 wires 1–12 ×4; 66 missions and 5 secret boxes —
  [Tabletopping](https://tabletopping.games/2025/07/31/bomb-busters/)). Digital: Among Us; Clues by Sam (daily logic).
- **Fit solo:** as a puzzle, not a social game: game-ideas.md's #1 ("Liar deduction: a daily case in a small town") is
  exactly this. Bomb Busters suggests another solo form: **a deduction puzzle on numbers** (a row of hidden tiles, sorted,
  clues from neighbours), daily.
- **Block:** `Deduce`: a small constraint solver that checks a generated case has exactly one solution and gives its
  difficulty (the steps a solver needs), which is the "solver hook" game-ideas.md block #1 asks for. Priority medium
  (one or two games).

### 1.16 Real-time

- **Core loop:** everyone acts at once against a sand timer (Magic Maze, Captain Sonar, Kitchen Rush, Skyrockets) (bk).
- **For us:** the action genre already is real-time; the board lesson is the **visible timer drawn on the thing
  itself** (the sand running out on the card), already in game-design.md's open-source lessons. No block needed.

### 1.17 Legacy and campaign

- **Core loop:** across sessions the game changes for good: stickers on the board, cards destroyed, sealed boxes opened
  when something happens. Pandemic Legacy: a board that records your group's history; characters gain scars; *"a reason
  to meet regularly"* ([Zatu](https://zatu.com/blogs/reviews/pandemic-legacy-season-one-review),
  [Miniature Market](https://miniaturemarket.com/reviewcorner/pandemiclegacy)). Bomb Busters' secret boxes are a light version.
- **For us:** this *is* D1 and the meta: the "secret box" that opens at a milestone, the map that keeps the marks
  of earlier runs (Inscryption's and Hades' world memory). Our runtime has the parts: `StoryRunner` (chapters by
  progress), `Tiers`, `seasonPass`, `welcomeBack`.
- **Missing block — `Ledger`:** permanent marks on a persistent map, with the moment each was made:
  ```ts
  const ledger = loadLedger(host.load('ledger'));
  ledger.mark('village-3', 'burned', { run: 12 });  // a sticker: drawn on the map from then on
  ledger.seal('box-2', { opensWhen: p => p.wins >= 5 }); ledger.due(progress); // the sealed boxes, opened once
  ```
  Priority: after the five in §4; StoryRunner covers half of it.

### 1.18 Solo modes and automas (the enabler)

- **What the board-game designers learned:** Morten Monrad Pedersen (Automa Factory: Viticulture, Scythe, Wingspan),
  the term "automa" is his: *the automa must mimic the core interactions you have with another player and leave out
  everything else*; it's driven by a small deck of cards whose halves combine into a **prioritised list**; the automa takes
  the first action it can perform ([Going Analog](https://www.goinganalogshow.com/article/6/table-talk-building-solo-play-board-games),
  [Punchboard: solo modes part 2](https://punchboard.co.uk/blog-solo-modes-in-board-games-part-two-automa/)).
  Heat's Legends are 10 cards that drive bot cars ([BGA – Heat](https://en.boardgamearena.com/gamepanel?game=heat)).
  Spirit Island's invader deck shows *where* invaders will explore, then build, then ravage over three turns, a
  "semi-predictable" threat the player plans around ([Dized rules](https://rules.dized.com/game/_7rPptSyRn6_unBi4-2eVg/qF7SmvMsQ7iQcDgb-3mF5w/invader-phase-overview)).
- **The tricks that make single-player work** (each used in §3):
  1. **Telegraphed intent:** the rival's next action is visible (Spirit Island, Wildfrost counters, StS intents).
  2. **A prioritised rule list** rather than an AI: cheap, readable, testable, difficulty = which card list.
  3. **A rising quota** (rent, blinds, a descending plane) in place of a rival's score.
  4. **Score bands with names** for pure score attack.
  5. **A market that decays** so waiting costs.
  6. **Difficulty levels as automa cards** (Automa's levels, Spirit Island's adversaries 1–6, Balatro's stakes).
- **Platform block — `Automa`:**
  ```ts
  const rival = automa<State, Act>({ deck: rivalCards, rng: host.rng, level: 2 });
  rival.next(state);           // the action it *will* take: draw it on screen (telegraph)
  rival.act(state);            // takes the first legal action of the card's priority list
  rival.explain(act);          // ≤ 6 words for the intent bubble ("takes the cheapest crate") — HINT_MAX_WORDS
  ```
  QA: `host.qa({ telegraph })` declares where the intent is drawn; the first-minute check can then verify it is on
  screen before the rival acts.

---

## 2. Design lessons from board games for all our games

Board games can't hide anything in code: the state, the rules and the score sit on the table where everyone can see
them. That constraint is why they are clear, and it's what portal reviewers keep asking our games for (`gp lessons`:
information, visible-progress, onboarding, drawn-icons). Each lesson below ends with how `gp qa`, `gp review` or a
lesson in `packages/cli/src/lessons.ts` could check it.

| # | Lesson | The board-game form | Enforce with |
|---|---|---|---|
| 1 | **All state the player decides on is visible** | open information; the bag's contents printed on the player board; the time track | `host.qa({ state: ['coins','heat','turn'] })` lists the decision state; QA reads the DOM/canvas text at play screenshots and fails if a declared state isn't drawn. Extend lesson `information`: *"Name every number you decide on; is each on screen without a tap?"* |
| 2 | **Icons, not text; one icon language** | Wingspan's food icons, Cascadia's animals, Castle Combo's coin and key; the rules on the component | a card/tooltip text limit like `HINT_MAX_WORDS` (6) for card rules, checked by `gp validate` over `strings/en.yaml` keys under `card.*`; the `drawn-icons` lesson; the cover 200 px check already measures legibility |
| 3 | **Teach by the first turn** | learn-as-you-play (The Crew's mission 1 is trivial, Bomb Busters' first mission teaches one rule) | first-minute QA already checks ≤ 25 words, 1 click, no loss in 12 s; **add:** "the first decision has ≤ 3 options" (`host.qa({ firstChoice: n })`) and "a new rule appears no earlier than its first use" (lesson `onboarding`) |
| 4 | **Telegraph the threat** | Spirit Island's invader cards, Wildfrost's counters, StS intents | `host.qa({ telegraph })`; QA checks the intent is on screen ≥ 1 s before it resolves (the same machinery as the twist's explanation timing). New lesson `telegraph`: *"Can you say what the enemy will do next turn?"* |
| 5 | **"One more turn" pacing: short turns, a payoff each round, the next goal shown** | a round is 2–5 min, the score track moves every turn, Balatro's next blind is shown | the balance model already checks a new thing every 1–3 min and the session-end hook; **add** median decision time from the bot's event log (target 3–15 s for turn-based) and "a visible next target on the results" (`mountResults`) |
| 6 | **Variable setup for replay** | Dominion's 10 of 25 kingdoms, Cascadia's A–D scoring cards, Spirit Island adversaries | QA runs two seeds and compares the setups (`host.qa({ setup })` returns the chosen modules); W if identical. `weeklyEvent` can rotate a module every week |
| 7 | **A score track that explains itself** | Patchwork's button income, Wingspan's end-of-round goals, a scoring pad by category | results screen lists the score by source (≥ 3 lines) and the best of each; `gp review` asks "where did the points come from?" Balatro's counted chips × mult is the gold standard (block `Chain`) |
| 8 | **The end is visible from the start** | Patchwork's time track end, Azul's "a row is full", Dorfromantik's stack count, Sky Team's 7 rounds | `host.qa({ endMeter })`: a declared "how close the end is" element; QA checks it is on screen in play. Lesson `structure` gets the line |
| 9 | **Catch-up and mercy, not rubber-banding** | Quacks' rat tails; a head start for the one behind | the balance bot runs N seeds and reports the share of runs lost in the first 2 rounds (target < 5%); a declared mercy rule (`mercy: 'two busts → head start'`) the review can check. Matches game-design.md's dynamic difficulty: the player opts in |
| 10 | **Luck before the decision, not after** | Dicey Dungeons' dice first, Sky Team's rolled dice, Railroad Ink's shared roll | a review question (`gp review`): *"Is a loss ever decided by a roll after the player's last choice?"* — `[blocking]` if a run ends on output luck with no choice left |
| 11 | **Bands and titles for solo scores** | Railroad Ink/Cartographers' rank tables | results show a named band and the points to the next band (a near miss) — `mountResults({ bands })` |
| 12 | **Difficulty as a ladder of named levels** | Automa levels, Spirit Island adversaries, Balatro's stakes | already `Tiers` + game-design.md's "run modifiers after the campaign"; a review check that a harder tier is announced by minute 15 |
| 13 | **The physical joy: rolls, flips, clacks** | the dice roll, a card flip, a tile snap | `E_SOUND_MUSIC` covers music; the `sound` lesson gets "a distinct sound for draw, place, bust, bank, combo step (pitch rising)" |
| 14 | **A low-interaction game still needs a reason to look at the rival** | Cascadia's shared market (the only interaction) | in solo, the automa or the quota fills that role; review question: "what do you look at besides your own board?" |

---

## 3. Eight game ideas for CrazyGames

Every idea is a `kit: code` game (the YAML kits can't express these). The originality checks were run on 2026-10-19
directly on CrazyGames (tag pages `/c/card`, `/c/board`, `/t/roguelike`, `/t/turn-based`, `/t/tetris`, `/t/block`,
`/t/sorting`, `/t/build`, `/t/management`, `/t/relaxing`, `/t/cooking`, `/c/driving`, `/t/medieval`, `/t/detective`, and ≈ 45 game slugs) and with
web searches; `site:crazygames.com` web searches return almost nothing (the index is thin), so a slug that answers 404 means
"not at that address", not "not on the portal". **Search again before building** (AGENTS.md step 1).

Forecasts: `gp forecast --idea --channel crazygames` with the session, breaks, offers, `--return daily` and a meta
shown per idea, run 2026-10-19 on today's MONEY_TABLE (calibrated on 29 review verdicts). Ranges are wide (the
pessimistic end is ≈ €0 for all); the **median expected value over months 1–3** is quoted. These numbers are lower than
the €34–96 in game-ideas.md's money view, which was computed on an older table, so compare the ideas with each other
here and not with that page. The model scores genre, session, breaks, offers, meta and return; it can't see a
mechanic's appeal. That part is judgement.

### Idea 1 — Fireworks bag-builder ("a night of shells")
- **One sentence:** draw firework shells from your own bag one at a time into tonight's show; the third dud fizzles the
  whole show, so stop and launch; the order you drew *is* the show you watch; buy better shells between nights.
- **Genre:** `roguelite` (bag-building + push-your-luck). Mechanics §1.2, §1.3, §1.11 (crowd requests are patterns).
- **Closest on CrazyGames:** Lucky Tower (push-your-luck doors, 2020), the score-target card roguelikes (Pocketro,
  Cardlike, Super Coupon Club: Origins); no bag-builder or fireworks game found (`/game/fireworks*`, `/game/diamant`,
  `/game/flip-7` 404). Off-portal: Quacks of Quedlinburg (board), Fire in the Library, Skyrockets (real-time fireworks
  board game).
- **The twist:** the draw order is the visible payoff, a **show** drawn in the sky in the order drawn, and the crowd's
  requests ("three reds in a row", "end on gold") are pattern goals on that sequence. So "stop now" is also an aesthetic
  choice, not only a risk one. Second twist: shells interact with the previous shell (a "chain" fuse doubles the next),
  which is `Chain`'s trace, animated in the sky.
- **Money:** nights of 60–90 s, a festival of 3 nights ≈ 4 min = the natural break (≈ 5 per 15 min); rewarded:
  **"Catch the dud"** (take back the bust draw: the revive kind, once a session), **×2 tickets** on the results, a reroll
  of the shell shop; daily: the same festival bag for everyone (`dailyRunSeed`), a weekly crowd rule (`weeklyEvent`).
  Meta: shell types as `Roster`/`Tiers`, festivals as stages. **Forecast:** session 15, 5 breaks, revive/x2/reroll,
  meta 90 → median EV **€19** (months 1–3 if launched €484 median).
- **Blocks:** Zones (bag), Gamble, Chain, `RunChoices` (shop), `seasonPass`.

### Idea 2 — Card racer (Heat-style deckbuilding race)
- **One sentence:** race a season with a deck of speed cards: your gear sets how many cards you play, every corner has a
  speed limit, overspeed shuffles heat cards into your deck, and between races you tune the car's deck.
- **Genre:** `roguelite` (deckbuilding + hand management; it could be benchmarked as `driving`, a weaker genre at 8.7 min).
- **Closest on CrazyGames:** driving games are physics games (PolyTrack, Crazy Plane Landing, Smash Karts); the card
  shelf has no racer (Cardlike, Tavern Rumble, Dungeon Deck, Cards Keeper are fights). Web search found no card racer on
  the portal; off-portal: Heat (board, BGA), Deck of Carts (board), Deck RX (in development), itch.io jam games.
- **The twist:** **heat as the build's own poison.** Going fast clogs your deck (Heat's heat cards, StS's status
  cards), cooling needs low gear; the race is a push-your-luck on every corner; rival cars follow **visible Legend
  cards** (Heat's solo bots) so you can plan overtakes. Cards are the speedometer, which is new to the portal.
- **Money:** a race is 2–3 min = the natural break (6 per 18-min session); a championship of 5 races is the run.
  Rewarded: **"Pit stop"** (remove 2 heat cards; once a session as the revive kind after a spin-out), **×2 prize money**,
  a **trial** of a locked car (a starter deck, `Roster`). Daily: today's track (a seeded circuit with a weather rule).
  **Forecast:** session 18, 6 breaks, revive/x2/trial, meta 120 → median EV **€21** (the top of the eight).
- **Blocks:** Zones (deck), Automa (rivals), Board (the track's spaces and corners), `Roster` (cars), `Tiers`.

### Idea 3 — Dice landing (Sky Team, solo with a readable co-pilot)
- **One sentence:** land an airliner with dice: roll four, place them on axis, engines, flaps, gear and brakes while the
  co-pilot places its own dice by a rule you can read; each airport is a level with stars.
- **Genre:** `puzzle` (21 min average play: the longest).
- **Closest on CrazyGames:** Crazy Plane Landing (physics flying, Boombit, 2024), Yatzy/Yahtzee Online (dice), Die in the
  Dungeon (dice combat); no dice-placement vehicle puzzle found. Off-portal: Sky Team (board, SdJ 2024), Landing Strip
  (roll-and-write).
- **The twist:** **cooperation with a readable automa:** the co-pilot's habit is printed ("puts its highest die on
  engines") and changes per airport, so the puzzle is planning around a partner, a solo version of Sky Team's silent
  co-op. Weather and traffic modules (wind on the axis, a plane on the runway) as the variable setup.
- **Money:** a landing is 2–3 min, 7 breaks in 18 min; rewarded: **"Ask the tower"** (a hint: one good placement),
  **"Go around"** (retry the final approach once: the revive kind); stars by leftover coffee/fuel (`starsFromPar`);
  daily: one airport for everyone + a calendar of landings. **Forecast:** session 18, 7 breaks, hint/revive, meta 120 →
  median EV **€15**.
- **Blocks:** Dice, Automa, `levelOpen`/`recordStars`, `UndoHistory`, `DailyTable`.

### Idea 4 — Nine plots (a 3×3 village engine roguelite)
- **One sentence:** build a 3×3 village of cards that score off their neighbours to pay a rising rent; each season the
  oldest column leaves the grid, so the engine must keep renewing.
- **Genre:** `roguelite` (engine building + drafting).
- **Closest on CrazyGames:** Pocketro, Cardlike, Super Coupon Club: Origins (score-target deck roguelikes, one launched
  three days ago), Merge Royal; off-portal Luck be a Landlord (slot grid), Castle Combo (board), Townland (itch.io:
  score above the target before the land runs out). **The most crowded neighbourhood of the eight.**
- **The twist:** **the grid as a conveyor**: the leftmost column leaves each season, carrying its cards out, so
  placement is about *when* a card should leave, not only where; adjacency counted with a visible `Chain` trace. Avoid
  slot visuals (PEGI): a village in daylight, not reels.
- **Money:** a season (round) 1–2 min, a year of 4 seasons ≈ 5 min; rewarded: reroll the market, ×2 harvest, "keep" a
  card that would leave. **Forecast:** session 15, 6 breaks, reroll/x2, meta 90 → median EV **€18**.
- **Blocks:** Chain, Board (3×3), Zones (market), `RunChoices`.

### Idea 5 — Same roll, your map (daily roll-and-write + campaign)
- **One sentence:** everyone gets the same seven dice rolls today; draw road and rail pieces on your map, then watch
  the town drive your network and score its deliveries.
- **Genre:** `puzzle`.
- **Closest on CrazyGames:** Daily Puzzle, Daily Solitaire Challenge (dailies), Hexa Fill Puzzle (paths on a hex grid),
  Tile Clash (2026-10-06, arrowword duel), the 10x10 family; off-portal Railroad Ink, gilga (itch.io).
- **The twist:** **the sheet comes alive**: after the last roll the network is simulated (cars and trains run it), so the
  score is something you watch, and broken links show as jams; a share card with today's map.
- **Money:** a sheet is 4–6 min; on its own it's too short (the forecast agrees), so it needs a campaign of 30 authored
  maps with stars plus the daily. Rewarded: reroll one die once a sheet, "peek at the next roll". **Forecast:** session
  12, 4 breaks, reroll/hint, meta 60 → median EV **€8** (the lowest: a short session).
- **Blocks:** DailyTable, Board, `recordDaily`, `mountStreakCard`.

### Idea 6 — Deck cargo (Patchwork's market ring on a ship)
- **One sentence:** load a cargo ship from a ring of shaped crates: take one of the next three, each costs coins and
  days, crates pay at every port you pass, and an unbalanced hull lists.
- **Genre:** `puzzle` (could be `strategy`).
- **Closest on CrazyGames:** the ≈ 35 block-fill games (10x10!, Wood Block Journey, Block Champ …), Backpack Battles
  (inventory), Hexa Stack; off-portal Ocean Express, Vira, Harborea (cargo puzzles), Patchwork.
- **The twist:** **two currencies and a physical rule**: Patchwork's time track (days) and income marks (ports) plus
  **weight**: a crate's weight tilts the ship, a list past 10° costs speed. The block puzzle becomes an economy
  with a balance rule, and the "take one of the next three" ring means you plan the market, not only the fit.
- **Money:** a voyage port-to-port ≈ 2–3 min = break (6 in 16 min); rewarded: undo the last crate (undo kind), ×2 voyage
  pay, a trial of a bigger hull (`Roster` of ships). Daily: today's manifest. **Forecast:** session 16, 6 breaks,
  undo/x2/trial, meta 90 → median EV **€17**.
- **Blocks:** Board (polyomino, market ring), `physicsAfterInit` not needed (a weight sum suffices), `UndoHistory`, `Roster`.

### Idea 7 — Firebreak (tile-laying against a telegraphed wildfire)
- **One sentence:** lay landscape tiles from a stack while a wildfire advances on a schedule you can read a turn ahead;
  rivers and rock make firebreaks, and closing a quest earns more tiles.
- **Genre:** `strategy`.
- **Closest on CrazyGames:** Hexa Stack/Hexa Sort (hex sorting), Kingdom Rush and the TD shelf, Forest Nothing;
  `packages/spec/src/taken.ts` lists maze tower defense with rotated tiles (Monster Tiles TD) — this has no towers or
  enemies, but say so in `concept`. Off-portal: Dorfromantik, Spirit Island's invader deck (board).
- **The twist:** **Spirit Island's three-step lag on a Dorfromantik map**: the fire card shows "next turn: ignite pine;
  then: spread to meadows", so each tile is laid to win a race with a visible schedule; the stack is the budget, quests
  refill it. A cosy tiler with teeth.
- **Money:** a fire season (a stage) 3–4 min, 5 breaks per 16 min; rewarded: **"Rain cloud"** (douse one region: the
  revive kind), ×2 seeds (the meta currency); a weekly wind (`weeklyEvent`). **Forecast:** session 16, 5 breaks,
  revive/x2, meta 90 → median EV **€13** (strategy benchmarks are lower than roguelite/puzzle).
- **Blocks:** Board (hex, regions), Automa (the fire schedule is an automa deck), `levelOpen`/`recordStars`, `weeklyEvent`.

### Idea 8 — Exact tricks (a trick-taking roguelite with bids)
- **One sentence:** bid exactly how many tricks you'll take against three rivals with visible habits; charms bend the
  rules; each table adds a mission like "win a trick with the 1".
- **Genre:** `roguelite` (trick-taking + drafting).
- **Closest on CrazyGames:** Hearts: Classic, Spades, Classic Card Games Collection (classics without a run),
  Pocketro (poker roguelike); off-portal Trick-Taking Rogue (Steam, 2026), Overtrick and Tricklewood Tales (itch.io), The
  Crew (board).
- **The twist:** **The Crew's missions as the floors of a run** plus **rivals as readable automas** ("Magpie leads her
  highest", "Mole ducks the first trick"): a solo trick-taker becomes a deduction game where you know *how* the others
  think, not what they hold. Own suits (four themed suits, not French cards) to stay clear of the casino look.
- **Money:** a hand 1–2 min, a table of 4 hands ≈ 5 min = break; rewarded: **peek** at one rival's card (hint),
  **redeal** a hopeless hand (once a session: the revive kind), **×2 winnings**; daily deal for everyone. **Forecast:**
  session 15, 5 breaks, hint/revive/x2, meta 90 → median EV **€21**.
- **Blocks:** Zones (hands, tricks), Automa (rivals), `RunChoices` (charms), `PactTree` (a rival's pact for a bigger prize).

### Ranking of the eight

| Rank | Idea | Originality on the portal | Forecast (median EV, m1–3) | Build cost | Why |
|---|---|---|---|---|---|
| 1 | **#2 Card racer** | high: nothing like it found | €21 | M–L | a new genre crossing (cards × racing) players grasp at once; Heat proves the rules; a race = a perfect break |
| 2 | **#1 Fireworks bag-builder** | high | €19 | M | push-your-luck is the best rewarded-ad mechanic; the show is the cover and the video |
| 3 | **#8 Exact tricks** | high on the portal, rising on Steam | €21 | M | familiar rules (no tutorial), automa rivals are cheap; a daily deal is free content |
| 4 | #3 Dice landing | high | €15 | M | puzzle genre, levels with stars; a dice tray is a new block |
| 5 | #6 Deck cargo | medium (block shelf full; the economy is new) | €17 | M | puzzle; the twist must be visible in the first 30 s |
| 6 | #4 Nine plots | low–medium (3 score-target roguelikes, one this week) | €18 | M | strong mechanic, crowded neighbourhood |
| 7 | #7 Firebreak | medium–high | €13 | L | lovely, but strategy benchmarks and a hex tiler cost the most |
| 8 | #5 Same roll | medium | €8 | S–M | best as a daily mode inside another game |

---

## 4. Top 5 platform blocks to build first (reuse × impact)

Scored by how many of the 18 mechanics and the 8 ideas each block serves (reuse) and how much it changes what a game
can be or earn (impact). Each goes in by `docs/guides/add-a-block.md`, in its own change, with the eight ideas as its
test cases. None of them is a game; each is the board part a card, dice or tile game would otherwise write by hand.

| Rank | Block | Package | Serves mechanics | Serves ideas | Reuse × impact | Why first |
|---|---|---|---|---|---|---|
| **1** | **`Zones`**: cards, bags and stacks (draw, hand, discard, exhaust, a blind bag with counts, a market row that slides, a bust rule and its odds, save/load, seeded) | `@gp/core/zones` | 1, 2, 3, 6 (the stack), 9, 10, 14 | 1, 2, 4, 6 (ring), 7 (stack), 8 | 7 × high | every card or token game starts here; the card shelf is the portal's busiest roguelike neighbourhood; the rewarded "take it back" is one call (`undoLast`) |
| **2** | **`Board`**: square/hex grids, edges that match, legal placements, connected regions, polyominoes (rotate, flip, fit), and a pattern matcher with partial progress | `@gp/core/board` | 5, 6, 7, 10, 11, 13 | 3, 4, 5, 6, 7 | 6 × high | it is block #1 of game-ideas.md (the puzzle toolkit) given a shape; puzzles are the 21-min genre; `legal()` feeds hints, the bot and a solvability check in `gp validate` |
| **3** | **`Chain`**: a trigger engine (on event, when, do) in a declared order, with a deterministic **trace** that `@gp/art` plays as a count-up (pitch rising with each step) | `@gp/core/chain` + `@gp/art/chain` | 1, 2, 4, 8 | 1, 2, 4, 6, 8 | 5 × very high | the combo you *watch* is what made Balatro and Luck be a Landlord; it answers the reviewers' "visible progress" and "information" lessons; the trace is testable and readable by `balance()` |
| **4** | **`Automa`**: a rival or partner driven by a small deck of prioritised rule cards, with `next()` to telegraph, `explain()` in ≤ 6 words, and levels | `@gp/core/automa` | 4, 9, 12, 13, 14, 15, 18; also tower defense's "waves announced ahead" must-have | 2, 3, 6, 7, 8 | 6 × high | the board designers' answer to "how does a solo game have tension"; cheaper and clearer than AI; a QA hook (`host.qa({ telegraph })`) can check the intent is on screen |
| **5** | **`DailyTable`**: a variable setup (which modules or scoring cards today), the shared seed, rank bands with names, a near-miss line and a share card; on top of `daySeed`/`dailyRunSeed`/`recordDaily` | `@gp/core/daily` (extend) | 5, 6, 11, and every puzzle | 1, 3, 5, 6, 7, 8 | 6 × medium-high | D1 is the weakest Basic Launch score (1–3% in our games); it completes block #3 of game-ideas.md (daily seed + calendar + **share card**); variable setup is lesson 2.6 |

**Next after these:** `Dice` (a tray, custom faces, slot rules, reroll budget: ideas 3 and parts of 1), `Gamble` (if not
folded into `Zones`), `Deduce` (unique-solution check for deduction puzzles: game-ideas.md #1), `Ledger` (legacy marks),
`Tricks` (follow/trump/bid rules on top of `Zones`).

**Lessons to add to `packages/cli/src/lessons.ts`** (from §2, each with its look/fix): `telegraph` (2.4), `end-visible`
(2.8), `score-sources` (2.7), `luck-before-choice` (2.10), plus lines in `information` (2.1) and `onboarding` (2.3).
New `host.qa` declarations that would let `gp qa` check them: `state`, `telegraph`, `endMeter`, `setup`, `firstChoice`.

**Block request (AGENTS.md §5 format), for the first one:**
```
Block request: mechanic (runtime block)
Game: any card/bag/tile game (ideas 1, 2, 4, 6, 7, 8 of docs board-games research), brief: deckbuilders, bag-builders, trick-takers
Needed: card/token zones — a deck, a hand, a discard, a blind bag with visible counts, a sliding market row — seeded, saved mid-run, with a bust rule and its odds, and an undo of the last draw for a rewarded "second chance".
Settings: zones({ piles: ['draw','hand','discard'], handSize: 5, reshuffle: 'when-empty', blind: true, bust: { sumOf: 'risk', over: 7 } })
Why the existing blocks don't fit: Bag (rng.ts) shuffles indices for variety, not a player-owned bag; RunChoices offers 1 of N but keeps no piles; UndoHistory undoes a whole state, not a draw.
```

---

## 5. What I couldn't verify

- **BGG's own pages** (ranks, hotness, the mechanic list): 403 for pages, 401 for the XML API from this session. Taxonomy
  and popularity come from secondary sources and award juries; a BGG "most played" claim for March 2026 (Flip 7 first,
  Bomb Busters second) appeared in one search snippet with no checkable source and is left out.
- **Sales figures** for Dorfromantik and Luck be a Landlord are third-party estimates (Raijin, SteamSpy). Balatro's,
  Slay the Spire 2's, Loop Hero's and Backpack Battles' come from developers via press.
- **CrazyGames absence is "not found", not "not there":** the portal's search runs in the browser, so I read tag pages
  and probed slugs. A game with an unexpected name can be missed. Re-run the search with a web search and the
  portal's search box before building (AGENTS.md step 1), and add what you find to `packages/spec/src/taken.ts`.
- **Earth, Arcs, Lost Ruins of Arnak, Pocket Rogues** were not researched in depth (Pocket Rogues is an action roguelike,
  not board-derived). Remarks on them are background knowledge.
- **The forecast** can't see a mechanic's appeal or a card game's tutorial cost; the EVs mainly reflect genre, session,
  breaks, offers and the daily.

## Sources

Board games and design: [BGG mechanics popularity – Bell of Lost Souls](https://www.belloflostsouls.net/?p=271905) ·
[Board Game of the Year 2023 mechanics](https://boardgameoftheyear.org/2023/sites/Stonemaier%20Games) ·
[2022](https://boardgameoftheyear.org/2022/sites/All%20You%20Can%20Board) ·
[Meeple Mountain: six perfected mechanics](https://www.meeplemountain.com/articles/six-perfected-game-mechanics-volume-2/) ·
[Quacks – Meeple Mountain](https://www.meeplemountain.com/reviews/the-quacks-of-quedlinburg/) ·
[Quacks – Punchboard](https://punchboard.co.uk/the-quacks-of-quedlinburg-the-alchemists-review/) ·
[Cascadia – Frontline Gaming](https://frontlinegaming.org/2025/06/11/board-game-review-cascadia/) ·
[Cascadia – People of Play](https://peopleofplay.com/blog/game-review-cascadia) ·
[Patchwork – Dice Tower](https://dicetower.com/board-game/163412) ·
[Patchwork rules review – Cardsrealm](https://mtg.cardsrealm.com/en-ph/articles/patchwork-review-simple-rules-quick-turns-challenging-game) ·
[Heat – BGA](https://en.boardgamearena.com/gamepanel?game=heat) ·
[Heat – Spectre Collie](https://spectrecollie.com/2024/11/09/pedal-to-the-metal-late-to-the-party/) ·
[Wingspan – Board Game Design Lab](https://boardgamedesignlab.com/how-to-design-an-engine-building-game-with-elizabeth-hargrave/) ·
[Wingspan – Wikipedia](https://en.wikipedia.org/wiki/Wingspan_(board_game)) ·
[Azul – Wikipedia](https://en.wikipedia.org/wiki/Azul_(board_game)) ·
[Castle Combo – Spielwarenmesse](https://www.spielwarenmesse.de/en/mag/toy-lab/spiele-highlights-2025/) ·
[Castle Combo – Meeple Mountain](https://www.meeplemountain.com/reviews/castle-combo/) ·
[Castle Combo/Faraway – Pandasaurus](https://pandasaurusgames.com/blogs/pandasaurus-blog/faraway-castle-combo-recognized-by-spiel-des-jahres) ·
[Harmonies – Meeple Mountain](https://www.meeplemountain.com/reviews/harmonies/) ·
[BGA Awards 2025 – Boardgamewire](https://boardgamewire.com/index.php/2025/02/04/harmonies-darwins-journey-splendor-duel-among-winners-in-this-years-boardgamearena-awards/) ·
[BGA Awards – Tabletop Gaming](https://tabletopgaming.co.uk/news/board-game-arena-award-winners-announced) ·
[Spiel des Jahres 2025](https://www.spiel-des-jahres.de/en/the-spiel-des-jahres-2025-is-bomb-busters/) ·
[SdJ 2025 nominees – Wargamer](https://www.wargamer.com/board-games/spiel-des-jahres-2025-nominees) ·
[SdJ 2026 – icv2](https://icv2.com/articles/news/view/62835/spiel-des-jahres-winner-announced) ·
[SdJ 2026 nominees – Nordkurier](https://www.nordkurier.de/panorama/spiel-des-jahres-2026-das-sind-die-nominierten-4586777) ·
[Sky Team – Wargamer](https://www.wargamer.com/board-games/sky-team-spiel-des-jahres-winner) ·
[Sky Team – Tabletopping](https://tabletopping.games/2024/07/25/sky-team-a-flight-simulation-adventure-for-two/) ·
[Flip 7 – Player2](https://www.player2.net.au/2025/07/flip7-review-flippin-good-time/) ·
[Bomb Busters – Tabletopping](https://tabletopping.games/2025/07/31/bomb-busters/) ·
[Spirit Island invader phase – Dized](https://rules.dized.com/game/_7rPptSyRn6_unBi4-2eVg/qF7SmvMsQ7iQcDgb-3mF5w/invader-phase-overview) ·
[Dune Imperium vs Arnak – Roll to Review](https://rolltoreview.com/?p=17416) ·
[The Crew – Wikipedia](https://en.wikipedia.org/wiki/The_Crew_(card_game)) ·
[LotR trick-taking – Meeple Mountain](https://www.meeplemountain.com/reviews/the-fellowship-of-the-ring-trick-taking/eed/) ·
[Pandemic Legacy – Zatu](https://zatu.com/blogs/reviews/pandemic-legacy-season-one-review) ·
[Pandemic Legacy – Miniature Market](https://miniaturemarket.com/reviewcorner/pandemiclegacy) ·
[Roll & write – Tabletop Gaming](https://tabletopgaming.co.uk/Features/the-best-roll-write-games) ·
[Roll & write – Zatu](https://zatu.com/blogs/features/shake-rattle-roll-and-write) ·
[Railroad Ink solo – Board With Myself](https://mikedrucker.substack.com/p/board-with-myself-railroad-ink) ·
[Automa – Going Analog](https://www.goinganalogshow.com/article/6/table-talk-building-solo-play-board-games) ·
[Automa – Punchboard](https://punchboard.co.uk/blog-solo-modes-in-board-games-part-two-automa/) ·
[Dorfromantik board game – Wikipedia](https://en.wikipedia.org/wiki/Dorfromantik:_The_Board_Game) ·
[Dorfromantik SdJ 2023 – berlin.de](https://www.berlin.de/gamescapital/news/dorfromantik-board-game-is-rewarded-game-of-the-year-1580991.en.php).

Digital games: [Balatro interview – TouchArcade](https://toucharcade.com/2024/03/18/balatro-interview-mobile-port-localthunk-dlc-plans-updates-new-jokers-demo-feedback/) ·
[Balatro interview – Rogueliker](https://rogueliker.com/balatro-interview/) ·
[Balatro 1 M – Game World Observer](https://gameworldobserver.com/2024/03/18/balatro-sales-1-million-copies-first-month-localthunk) ·
[Balatro 5 M – GamesMarket](https://www.gamesmarket.global/publishing/poker-roguelike-balatro-sells-more-than-five-million-copies-311dcc58f214ad4dd53243ae1161ba71) ·
[Slay the Spire – Wikipedia](https://en.wikipedia.org/wiki/Slay_the_Spire) ·
[StS GDC 2019 – Game Developer](https://www.gamedeveloper.com/design/learn-i-slay-the-spire-i-s-metrics-driven-approach-to-game-balancing-at-gdc-2019) ·
[Slay the Spire 2: 3.3 M – GosuGamers](https://www.gosugamers.net/entertainment/news/78130-slay-the-spire-ii-sells-3-3-million-copies-as-players-attempt-25-million-runs-in-first-week) ·
[StS 2 concurrent – GosuGamers](https://www.gosugamers.net/entertainment/news/78102-slay-the-spire-ii-hits-574-000-concurrent-players-12-000-short-of-hollow-knight-silksong-s-record) ·
[Luck be a Landlord – Raijin](https://raijin.gg/app/1404850/Luck_be_a_Landlord) ·
[Luck be a Landlord – Steam](https://store.steampowered.com/app/1404850/Luck_be_a_Landlord/) ·
[Luck be a Landlord – dev blog](https://blog.trampolinetales.com/whats-next-for-luck-be-a-landlord/) ·
[Dorfromantik – Wikipedia](https://en.wikipedia.org/wiki/Dorfromantik) ·
[Dorfromantik – Raijin](https://raijin.gg/app/1455840/Dorfromantik) ·
[Toukana – SteamSpy](https://www.steamspy.com/dev/Toukana+Interactive) ·
[Islanders – Wikipedia](https://en.wikipedia.org/wiki/Islanders_(video_game)) ·
[Dicey Dungeons – Game Developer](https://www.gamedeveloper.com/disciplines/road-to-the-igf-cavanagh-houston-dobbe-s-i-dicey-dungeons-i-) ·
[Dicey Dungeons – Siliconera](https://www.siliconera.com/the-many-sides-of-dicey-dungeons-on-switch/) ·
[Loop Hero 1 M – GamingOnLinux](https://www.gamingonlinux.com/2021/12/loop-hero-from-four-quarters-hits-a-million-sales/) ·
[Cobalt Core – Wikipedia](https://en.wikipedia.org/wiki/Cobalt_Core) ·
[Cobalt Core – PC Gamer](https://www.pcgamer.com/cobalt-core-review/) ·
[Wildfrost counter – Wiki](https://wildfrostwiki.com/Counter) ·
[Inscryption – Wikipedia](https://en.wikipedia.org/wiki/Inscryption) ·
[Backpack Hero – Epic](https://store.epicgames.com/news/backpack-hero-makes-inventory-management-a-blissful-delight) ·
[Backpack Battles 640 K – Game World Observer](https://gameworldobserver.com/2024/04/25/backpack-battles-sales-640k-copies-china-top-country) ·
[Ballionaire – Nodal](https://nodal.gg/game/ballionaire-2667120) ·
[Dungeons & Degenerate Gamblers – GameCritics](https://gamecritics.com/jack-dunn/dungeons-degenerate-gamblers-review/) ·
[Trick-Taking Rogue – Steam](https://store.steampowered.com/app/3703450) ·
[Overtrick – itch.io](https://celloloops.itch.io/overtrick) ·
[gilga – itch.io](https://itch.io/t/2251859/gilga-a-calm-abstract-roll-and-write-game-about-drawing-paths) ·
[Townland – itch.io](https://tzdevil.itch.io/townland) ·
[Ocean Express – Gamezebo](https://www.gamezebo.com/reviews/ocean-express-review/).

CrazyGames (read 2026-10-19): [Card](https://www.crazygames.com/c/card) · [Board](https://www.crazygames.com/c/board) ·
[Roguelike](https://www.crazygames.com/t/roguelike) · [Turn-based](https://www.crazygames.com/t/turn-based) ·
[Tetris](https://www.crazygames.com/t/tetris) · [Sorting](https://www.crazygames.com/t/sorting) ·
[Build](https://www.crazygames.com/t/build) · [Relaxing](https://www.crazygames.com/t/relaxing) ·
[Pocketro](https://www.crazygames.com/game/pocketro) · [Cardlike](https://www.crazygames.com/game/cardlike) ·
[Super Coupon Club: Origins](https://www.crazygames.com/game/super-coupon-club-origins) ·
[Die in the Dungeon](https://www.crazygames.com/game/die-in-the-dungeon) ·
[Tavern Rumble](https://www.crazygames.com/game/tavern-rumble-roguelike-card) ·
[Dungeon Deck](https://www.crazygames.com/game/dungeon-deck) ·
[Dungeon Crawl Theater](https://www.crazygames.com/game/dungeon-crawl-theater) ·
[Backpack Battles](https://www.crazygames.com/game/backpack-battles) · [Hexa Stack](https://www.crazygames.com/game/hexa-stack) ·
[Lucky Tower](https://www.crazygames.com/game/lucky-tower) · [Crazy Plane Landing](https://www.crazygames.com/game/crazy-plane-landing) ·
[Tile Clash](https://www.crazygames.com/game/tile-clash) · [Landgrab Royale](https://www.crazygames.com/game/landgrab-royale) ·
[Hearts: Classic](https://www.crazygames.com/game/hearts-classic) · [Yatzy](https://www.crazygames.com/game/yatzy).
