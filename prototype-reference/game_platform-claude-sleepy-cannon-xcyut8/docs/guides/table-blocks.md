# Table blocks: cards, bags, boards, dice and a rival

Board games are a library of short, balanced decision loops; the digital hits of the last years are those loops with
the bookkeeping automated (Slay the Spire, Balatro, Luck be a Landlord, Dorfromantik, Backpack Battles, Dicey Dungeons —
[the research](../research/board-games-2026-10.md)). The bookkeeping is the same in every such game: piles of cards, a
bag you draw from, a grid you place on, dice you roll and assign, a rival that follows rules. These four blocks are that
bookkeeping, so a `kit: code` game writes only its own rules and its look.

| Block | For | Proven by |
|---|---|---|
| **`Zones`** (`@gp/core/zones`) | a deck, a hand, a discard, an exhaust pile; a blind bag with its counts; a market row that slides and refills; a bust rule and its live odds; an undo of the last draw | deckbuilders, bag-builders (Quacks), push your luck (Flip 7), drafting (Century, Splendor) |
| **`Board`** (`@gp/core/board`) | square and hex grids, cells with tags, pieces of any shape that turn and flip, legal placements, matching edges, connected regions, adjacency and star cells, a pattern matcher | tile laying (Dorfromantik, Carcassonne), polyominoes (Patchwork), pattern scoring (Cascadia), a backpack or ship grid (Swarm Smash's hull, Frankengun's part grid, Backpack Hero) |
| **`Dice`** (`@gp/core/dice`) | a seeded pool, rerolls as a resource, faces you rewrite, slots with rules, the exact odds of an outcome | dice placement (Sky Team, Dicey Dungeons), roll-and-write |
| **`Automa`** (`@gp/core/automa`) | a rival or partner run by an ordered list of priority rules; its next move with a ≤ 6-word explanation; levels; a deck of priority cards | Automa Factory's solo modes, Heat's Legends, Slay the Spire's intents |

They are in the genre registry: `gp catalog blocks --genre deckbuilder` (the new sub-genre of strategy), `--genre
puzzle`, `--genre strategy`, `--genre roguelite`. A deckbuilder's must-haves (`gp explain genre.deckbuilder`): a deck
built in the run (`Zones`), the enemy's intent shown (`Automa`), a card reward (`RunChoices`, [upgrades.md](upgrades.md#runchoices--pick-1-of-n-in-a-run)).

## The contract (all four)

- **Rules in an object, state as plain JSON.** `new Zones(def)`, `new Board(def)`, `new Dice(def)`, `new Automa(opts)`
  hold the rules; `start(…)` gives the state. Every method takes a state and returns a **new** one (or `null` when the move
  isn't legal — show why, don't throw). Nothing changes the state you passed in.
- **Saves.** Store the state as it is (`host.saveRun`, or a field of the save); on load, `sanitize(raw)` it: unknown piles,
  broken pieces, faces out of range and bad numbers go, so an old or edited save can't break the run.
- **Undo** is an `UndoHistory` of states (`@gp/core`): `h.push(board.place(h.current, …)!)`, `h.undo()`. Nothing else is needed.
- **Seeded, and the rng travels with the state.** `start(…, seed)` takes a run seed (`newRunSeed()`, `dailyRunSeed()`,
  a level number) and the state keeps the rng's position (`state.rng`; `seededRng(n).state()` in `rng.ts`). The same seed
  and the same calls give the same cards and dice on every machine, after a save and a load too — and undoing a roll
  brings back the same roll, so undo can't fish for a better one. `Board` has no randomness (a tile stack is a `Zones` pile).
- **Pure:** no DOM, no engine, no clock. Unit tests, `balance()` bots and `balanceModel()` run them as they are. The look
  (a card flip, a dice tumble, the bust) is the game's, with `@gp/art`; report what happens to QA through the host's
  events like any other game action.

## Zones

```ts
import { Zones } from '@gp/core';
const z = new Zones<Card, 'draw' | 'hand' | 'discard' | 'exhaust'>({
  piles: ['draw', 'hand', 'discard', 'exhaust'],
  draw: { from: 'draw', to: 'hand' }, reshuffle: { draw: 'discard' }, limit: { hand: 10 },
});
let s = z.start({ draw: starterDeck }, runSeed);       // the draw pile shuffled
s = z.draw(s, 5);                                       // the discard shuffled back in when the draw pile runs out
s = z.move(s, 'hand', i, 'discard')!;                   // play a card ('exhaust': gone for the fight)
s = z.moveAll(s, 'hand', 'discard');                    // end of turn
z.chanceWithin(s, 'draw', (c) => c.kind === 'attack', 5); // "an attack in the next hand" — exact, for the HUD
```

| Call | Does |
|---|---|
| `start(contents, seed)` · `sanitize(raw)` | a new state (draw piles shuffled, markets filled) · a loaded one made safe |
| `draw(s, n, from?, to?)` · `drawn(s)` | draw one at a time (reshuffle when empty, a random item from a blind pile, stop at a limit or a bust) · what was just drawn |
| `undoDraw(s, { shuffle })` | the rewarded second chance: the last draw goes back; `shuffle` mixes it into a stacked pile; the rng moves on |
| `move`, `moveAll`, `add`, `remove`, `shuffle`, `rotate` | by index; `place`: `'top'`, `'end'`, `'shuffle'` |
| `peek`, `size`, `counts(s, pile)` | the top of a stack · how many · a pile by kind, keys sorted (a bag is shown as counts, never as an order) |
| `odds(s, pile, match)` · `chanceWithin(s, pile, match, n)` | the next draw · at least one in the next n (hypergeometric) |
| `busted(s)` · `bustChance(s, draws = 1)` | the bust rule (`def.bust: { pile, when }`) · the exact chance of busting within the next draws: the risk meter |
| `take(s, market, slot, to)` · `refill` · `decay` · `price(s, market, slot)` | a market row: `def.markets: { row: { from, slots, refill: 'slide' \| 'in-place', decayTo } }`, `def.price(item, slot)` |

**Push your luck** (the best mechanic for rewarded ads: the bust is a moment the player *wants* to undo):

```ts
const bag = new Zones<Token, 'bag' | 'pot'>({ piles: ['bag', 'pot'], blind: ['bag'], draw: { from: 'bag', to: 'pot' },
  bust: { pile: 'pot', when: (pot) => sum(pot, (t) => t.risk) > 7 } });
meter.value = bag.bustChance(s);                   // on screen before every draw
s = bag.draw(s);
if (bag.busted(s)) offer('Catch it', () => (s = bag.undoDraw(s)!)); // rewarded, kind "undo", once a session
```

Put the midgame ad at the round's end, never at the bust (it reads as a punishment). For ages 6–12 a bust only ends the
round, keeping what was banked (`E_NO_FAIL` for the youngest).

## Board

```ts
import { Board, polyomino } from '@gp/core';
const pack = new Board<Item>({ size: [5, 4], shapeOf: (it) => SHAPES[it.id], accepts: (it, _p, tags) => !tags.includes('locked') });
let s = pack.start({ '4,3': ['off'] });            // a cell tagged 'off' isn't on the board (untag it to grow the grid)
s = pack.place(s, sword, [0, 0], 1) ?? s;          // orientation 1: a quarter turn clockwise
pack.whyNot(s, shield, [1, 0]);                    // 'taken' — the drag preview's red outline and its reason
pack.pairs(s, (a, b) => a.item.id === 'chip' && b.item.id === 'barrel'); // adjacency synergies switched on
pack.starred(s, whetstone.uid);                    // its star cells and what lies on them
```

- **Geometry:** `grid: 'square' | 'hex'` (hex: axial `[q, r]`, pointy-top, six directions clockwise from east); bounded by
  `size: [w, h]`, `radius` (hex) or a `cells` list, else open (Dorfromantik's endless map). `neighbours`, `around`,
  `distance`, `ring`, `line`, `cells`, `empty`, `diagonal: true` for 8 neighbours.
- **Shapes:** `polyomino('L4')` (the named ones in `POLYOMINOES`, or a cell list, with star cells that turn along);
  `orientations(shape, { flip })` gives the distinct ones (an O has one, an L eight mirrored). An orientation is the
  number of clockwise turns, plus 4 (hex 6) when mirrored; a piece's `at` is the corner of its turned shape.
- **Placing:** `whyNot` (`'outside'`, `'taken'`, `'refused'` by `accepts`, `'edge'`, `'alone'` without `touch`) · `canPlace` ·
  `placements(s, item)` (every legal spot: the hint, the bot, "does it still fit anywhere?") · `place`, `move`, `turn`, `remove`.
- **Edges** (one-cell tiles): `edgesOf(item)` (a label per direction), `match`, `strictEdges` (Carcassonne refuses a
  mismatch; `false` allows it, Dorfromantik-style) · `fit(s, item, at, o)` → matched / mismatched / open edges (a
  "perfect fit") · `edgeRegions(s, 'forest')` → the forests across tiles, with their open edges and whether closed.
- **Regions and patterns:** `regions(s, test)` (flood fill, biggest first) · `fullLines(s)` (a block puzzle's clears) ·
  `find(s, pattern)` and `progress(s, pattern, min)` (the nearly finished ones and the cells missing: the "one more" glow).

**A backpack or a ship grid** (Swarm Smash's 630-line `grid.ts`, Frankengun's part grid) is this block with items for
pieces: occupancy, rotation, star cells, adjacency and a hull that grows by untagging `off` cells. The stats stay the
game's (`stats(board, state)` reads `pairs` and `starred`); the screen stays the game's. [upgrades.md](upgrades.md#1-pick-a-shape)
lists it as the grid-build shape of progression.

## Dice

```ts
import { Dice, D6, slotRules, sumIs } from '@gp/core';
const cockpit = new Dice({ slots: [
  { id: 'engines', size: 2, accepts: slotRules.sum(8), done: sumIs(8) },
  { id: 'gear', accepts: slotRules.atMost(2) },
  { id: 'brakes', size: 2, accepts: slotRules.same() },
] });
let s = cockpit.roll(cockpit.start([D6, D6, D6, D6], seed, { rerolls: 1 }));
s = cockpit.place(s, 0, 'engines') ?? s;
cockpit.chanceAfterReroll(s, [2, 3], (v) => v[2] === v[3]); // "reroll both: 17% for the brakes' pair"
```

- `roll` (the turn's roll, no reroll spent) · `reroll(s, dice)` (spends one; placed dice stay) · `addRerolls` (a rewarded
  ad: kind `reroll`) · `hold` · `setFace` (a "bump" card) · `forge(s, die, face, to)` (a face rewritten for good) ·
  `addDie`, `removeDie`, `clear` (the next turn).
- Slots: `slotRules.any / even / odd / atLeast / atMost / exactly / oneOf / same / distinct / sum / run / all`; a rule sees
  the slot's dice (a partial set while it fills) and the whole state (a rule across slots). `canPlace`, `place`, `unplace`,
  `placements` (the legal moves), `done`, `inSlot`, `free`.
- Odds: `chance(s, die, test)`, `chanceAfterReroll`, `oddsOf(pools, test)` (exact up to `EXACT_ODDS_MAX` outcomes, a seeded
  sample beyond), `sumOdds(pools)` (the distribution of a sum). Luck first, the decision after: show the odds on the
  reroll button, and never let a roll after the player's last choice decide a loss.

## Automa

```ts
import { Automa, best } from '@gp/core';
const rival = new Automa<Market, Crate>({
  rules: [   // in priority order: the first that can act, acts
    { id: 'gold', say: 'grabs any gold crate', from: 1, move: (m) => m.crates.find((c) => c.gold) ?? null },
    { id: 'cheap', say: 'takes the cheapest crate', move: (m, r) => best(m.crates, (c) => -c.price, r) },
  ],
  levels: [{ name: 'Rookie', slip: 0.3 }, { name: 'Pro' }],
});
let a = rival.start(seed, level);
const intent = rival.next(market, a);   // { move, rule, say, card, slipped, state } — draw intent.say over the rival now
// …the player moves; on the rival's turn call next() again (the same card and rng, the move fitted to the new board):
const act = rival.next(market, a); if (act) { market = apply(market, act.move); a = act.state; } else a = rival.pass(a);
```

- **Telegraph:** `next()` is pure, so the intent can be shown a turn ahead and the rival does what it said (or the next
  thing on its list, if the player took its target — which is the fun). `say` is ≤ `AUTOMA_MAX_WORDS` (6, the hint budget):
  checked when the rival is made, and for a `say(move, state)` function when it speaks; a strings key for `host.t` passes too.
- **Levels:** `from` on a rule (a harder rival knows more), `slip` on a level (it passes over its best rule at that rate,
  deterministically by seed). Name them (`levelName`): difficulty as a ladder of named levels.
- **A deck of priority cards** (`deck: [['cheap'], ['gold', 'cheap'], …]`): one card a turn, reshuffled when spent; show the
  card (`order(a)`) so its habit this turn can be read. `best(items, score, rand)` breaks ties by the seed.

## Rewarded offers they give

| Moment | Call | `money.rewarded` kind |
|---|---|---|
| a bust, a dead draw | `zones.undoDraw` | `undo` (or `revive`, once a session) |
| a bad roll | `dice.addRerolls` then `reroll` | `reroll` |
| a stuck board | `board.placements` → show one | `hint` |
| the tile stack runs out | `zones.add` five tiles | `continue` |
| the market | `zones.decay` / `refill` | `reroll` (refresh the row) |

## What they don't do (yet)

- The **trigger engine with a scoring trace** (Balatro's count-up, Luck be a Landlord's adjacent symbols: block #3 `Chain` of
  the research) and the **daily table** (variable setup, rank bands, a share card: block #5) are not built yet.
- No drawing, animation or sound: the game's, with `@gp/art`.
- `edgeRegions` treats a tile's edges of one terrain as connected inside it (no split segments, as some Carcassonne tiles have).
- `bustChance(s, draws)` is exact over every order of draws: keep `draws` small (≤ 4).

The tests are worked examples: [zones.test.ts](../../packages/core/test/zones.test.ts) (a five-night bag-builder run with a
second chance and a market), [board.test.ts](../../packages/core/test/board.test.ts) (a backpack with a whetstone's star
and a chip beside a barrel; a hex map of forests; Carcassonne's river), [dice.test.ts](../../packages/core/test/dice.test.ts)
(a landing turn and its bot), [automa.test.ts](../../packages/core/test/automa.test.ts) (a crate-market race against a
telegraphed rival).
