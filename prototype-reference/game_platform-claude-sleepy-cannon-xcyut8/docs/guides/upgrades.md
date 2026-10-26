# Progression: what a run buys, in the shape the game needs

Meta progression is what a run leaves behind: a currency, a new hero, an open tier, a pact. It keeps players for the
10+ minutes a portal needs ([game-design.md](game-design.md#depth-from-a-simple-core-to-10-minutes)) — and it is a
**design choice of the game**, not a screen the platform hands every game. The `gp init` skeleton used to ship the level
shop of Yeet the Gnome (a list of "+stat" cards with ×1 / ×10 / Max); it got into Germ Bait, Dread Throne, Starsilk and
Brew & Banter, and the owner called it what it was: the same shop in every game. The games that did better replaced it
with their own shape — this page is what they proved.

0. **Decide from the game design whether the game needs meta progression at all, and which** — before any block or
   screen (the owner, 2026-10-10: «ты везде засовываешь систему прокачки, но сначала модулем геймдизайна нужно решить,
   какая прокачка нужна — магазины не всегда подходят»). Start from the core loop and what brings the player back: a
   puzzle may need only new levels and stars, a roguelite its in-run build, a tower defense its pacts, an arcade
   shooter its ship built in the run. "None beyond the levels" is a valid answer; a shop is one shape of five, not the
   default. Write the decision and its reason in `concept.progression`.
1. **Pick a shape for the genre** (§1) and write it in `concept.progression` in game.yaml (and `docs/concept.md`).
2. **Build it from the blocks** (§2): `Roster`, `Tiers`, `PactTree`, `RunChoices` and `UpgradeShop` in `@gp/core` —
   pure, deterministic with `host.rng`, save-safe. The screen is the game's own (§5 has the rules and the QA contract);
   `mountUpgradeShop` is the ready screen for the level shop.
3. **Measure it with the balance bot** and export the numbers (§3): `gp balance` and `gp qa` read them against the
   channel's targets.

Sources for the math: [the research note](../research/upgrades-2026-09.md). Numbers marked *heuristic* have no published
source: tune them with the balance bots.

## 1. Pick a shape

| Shape | What a purchase gives | Proven by | Block |
|---|---|---|---|
| **Unlocks** | a new hero, tool or mode that **plays differently** (a new power, a new rule), bought once, one in play | Candle Crypt (game9): gems buy candles, each with its own class power and passive — no "+5% damage" anywhere | `Roster` |
| **Tiers** | a set of new things; buying in one tier opens the next | Starsilk (game11): the Loom's spindles open one after another, the answers to a new shadow open with the depth where it first appears | `Tiers` (over an `UpgradeShop`, a `Roster` or a `PactTree`) |
| **Pacts** | a gain **with a cost**, on paths; an Oath sworn one of two ways (re-swearing is free); a fork (one of two, never both) | Dread Throne (game10): three paths of Dark Pacts with Oaths; every fixture ascends one of two ways at level 3 | `PactTree` (ranks next to it: `UpgradeShop`) |
| **Run choices** | the build is made **in the run**: pick 1 of 3 at a level-up or a floor; weights, stacks, no duplicates, a reroll | Candle Crypt: a pick of three feats at every level-up, one reroll for a rewarded ad | `RunChoices` |
| **Level shop** | "+stat" levels bought with the currency, many of them | Yeet the Gnome (game4, launch distance), idle games | `UpgradeShop` + `mountUpgradeShop` |
| **Grid build (inventory)** | the build is the items' **placement**: pieces of different shapes on a grid (a ship, a backpack), adjacent items boost or combine — Backpack Hero, Backpack Battles | Swarm Smash (game20): parts laid on a 9×9 hull, star cells carry a part's effect; Frankengun (game22): a chip beside a barrel boosts it; `RunChoices` for the offers | `Board` ([table-blocks.md](table-blocks.md#board): shapes that turn, occupancy, star cells, adjacency synergies) |
| **Levels and stars only** | nothing is bought: the next level, its stars, a harder mode — the game's skill is the progression | puzzles (Hang the Moon's nights), short arcade | `recordStars`, `levelOpen` |
| **A collection** (a second track) | every thing ever found has its card, missing ones a silhouette; each found one may add a small bonus **for good** | Craft Pickaxe Idle (game21: every material × level ever owned, +1 % damage each, kept through Reforge); Idle Garage Evolution's car album | `collection` + `mountAlbum` |

**By genre** (what to start from; two tracks beat one — Survivor.io D30 4% vs Archero 11%):

| Genre | Start with | Second track |
|---|---|---|
| Roguelite, action, survivors-like | **Unlocks** (heroes, weapons) + **run choices** (feats, blessings) | a collection, a bestiary, story pages (Candle Crypt) |
| Tower defense, strategy | **Pacts** (gains with a cost, Oaths) + in-run forks (Dread Throne's level-3 ascensions) | stars per stage, harder tiers after the campaign |
| Campaign with depths or stages (puzzle, maze, action) | **Tiers** opened by depth (Starsilk) over a short level shop | stars, an endless mode |
| Story clicker | a level shop whose upgrades open with the chapters (`lock`: Brew & Banter) → **tiers by chapter** | the story itself |
| Idle, incremental, clicker | **Level shop**: dozens of levels, ×10 / Max, milestones, later prestige (`Prestige`, §7) | offline earnings (`offlineEarnings`, §7), several places with a map (`Sites` + `mountSitesMap`, §7), a daily reward week, a collection |
| Launch-distance, physics toy | **Level shop**: 5–10 levels an upgrade, one press a level (Yeet the Gnome) | zones, missions |

Rules that hold for every shape (from the games' balance bots and [game-design.md](game-design.md)):

- **A new thing, not a bigger number.** An unlock changes what the player does; "+5%" is a level. The first new thing
  within 2–3 minutes of play, then one every 2–7 minutes.
- **A purchase after the first run or two.** Every game that kept players had one (Yeet, Germ Bait, Starsilk).
- **The meta outlasts the first session**, but its end is in reach: Starsilk's Loom is mostly woven by the finale and
  not before it; Germ Bait's shop is 65% bought when the campaign ends.
- **Sidegrades are fine** when the choice is real (Dread Throne's brute or trick, Candle Crypt's candles); a purchase
  that changes nothing is not.
- **Name it in the concept.** `concept.progression: "Gems buy new candles, each with its own class power; feats are picked
  1 of 3 at every level-up"`. `gp uniqueness` lowers the score a little when the progression is only the stock level
  shop, and raises it for the blocks or the game's own system.

## 2. The blocks

All in `@gp/core` (and `@gp/core/progression` for Node tests). Pure: no DOM, randomness only from the rng you pass
(`host.rng`, or `seededRng(seed)` from `@gp/core/rng` in bots: `?seed=1` repeats a run). Every block has `sanitize(raw)` — run it on a loaded
save: unknown ids, duplicates, wrong types and impossible states go. Every block has the balance bots' buyers:
cheapest first and best value first.

### Roster — unlocks that change how you play

```ts
import { Roster } from '@gp/core';

const CANDLES = new Roster([
  { id: 'wick', price: 0 },                           // free: the one a new player plays
  { id: 'lithium', price: 150 },
  { id: 'ash', price: 900, requires: 'potassium' },   // needs another first
  …
], { lock: (id, save) => (id === 'strontium' && !reached(3) ? 'Reach the Ember Halls' : null) });

const save = host.load({ gems: 0, candles: CANDLES.initial() });
save.candles = CANDLES.sanitize(save.candles);       // { owned: ['wick', …], selected: 'wick' }

CANDLES.view(save.candles, save.gems);   // rows: state (selected, owned, affordable, too-expensive, locked), price, progress, needs / lockReason
CANDLES.buy('lithium', save.candles, save.gems);     // { save, coins } or null; selects it (select: false to keep the current one)
CANDLES.select('wick', save.candles);                // play another owned one
CANDLES.refund('lithium', save.candles, save.gems);  // undo at exactly the price
CANDLES.next(save.candles);                          // the cheapest one not owned: "Next: Lithium Candle, 150"
```

A "try it for one run" offer (a rewarded ad) is the game's: play `trialHero` for the run without adding it to `owned`.

### Tiers — a tier opens the next set

```ts
import { Tiers, UpgradeShop } from '@gp/core';

const TIERS = new Tiers([
  { name: 'The Way', items: ['spool', 'lamp'] },
  { name: 'The Snare', items: ['knot', 'thorn'], opensAt: 4 },   // 4 levels bought in the tiers below
  { name: 'Mira', items: ['hearts'], opensAt: 8 },
], { gate: (t) => (t === 2 && save.cleared < 3 ? 'Clear depth 3 first' : null) });
const LOOM = new UpgradeShop(UPGRADES, { lock: (id, levels) => TIERS.lock(id, levels) });

TIERS.view(save.levels);   // per tier: open, bought, need ("4 more to open The Snare"), reason
```

`opensAt` counts what was bought in all the tiers below; it defaults to their number of items (one of each in every tier
below). An undo that would close a tier with things bought in it is refused (`UpgradeShop.refund`, `Roster.refund` and
`PactTree.release` ask the lock; a full respec — `refundAll`, `releaseAll` — clears everything, so it is always allowed).
For things bought once, pass `countsOf(roster.owned)`.

### PactTree — gains with a cost

```ts
import { PactTree } from '@gp/core';

const PACTS = new PactTree([
  { id: 'vigor', price: 25, path: 'throne', mods: { kingHp: 25, startSouls: -10 } },       // a gain and its cost
  { id: 'mantle', price: 120, path: 'throne', requires: 'vigor',
    sides: [{ id: 'thorns', mods: { thorns: 1.5 } }, { id: 'tyrant', mods: { gaze: 2 } }] }, // an Oath: sworn one way
  { id: 'grinder', price: 60, path: 'spikes', excludes: ['pit'] },                          // a fork: this or the pit
  { id: 'pit', price: 60, path: 'spikes' },
], { lock: (id) => (id === 'mantle' && !cleared(1) ? 'Clear stage 2 first' : null) });

const r = PACTS.take('mantle', save.pacts, save.infamy, 'tyrant');   // { save, coins } or null
save.pacts = PACTS.swear('mantle', 'thorns', save.pacts)!;           // free, any time between runs
PACTS.mods(save.pacts);   // { kingHp: 25, startSouls: -10, thorns: 1.5 } — what the run reads
PACTS.sides(save.pacts);  // Set { 'thorns' } — the rules in force
PACTS.release('mantle', save.pacts, save.infamy);    // undo at exactly the price (not while another needs it)
PACTS.releaseAll(save.pacts, save.infamy);           // "Break all pacts": everything back
```

Rows (`view`) say `needs` (the pact before it on the path), `excludedBy` (the other side of the fork) or the game's
`lockReason`; `paths()` gives the rows of the screen. Ranks (a pact with 1–3 levels) are an `UpgradeShop` next to the
tree — its `lock` can ask the tree.

### RunChoices — pick 1 of N in a run

```ts
import { RunChoices } from '@gp/core';

const FEATS = new RunChoices([
  { id: 'bless', max: 3 },                     // stacks up to 3 in a run
  { id: 'glass', excludes: ['tough'] },        // never together
  { id: 'twin', requires: 'pierce' },          // only after pierce
  { id: 'phoenix', weight: 0.2 },              // rare
  …
], { size: 3, rerolls: 0, eligible: (id) => !(id === 'glass' && run.maxHp <= 20) });

let feats = FEATS.start();                          // at the start of a run
feats = FEATS.offer(feats, host.rng);               // at a level-up: feats.offer = three distinct cards
feats = FEATS.pick(feats, 'bless')!;                // the player keeps one
feats = FEATS.reroll(FEATS.addRerolls(feats), host.rng)!;   // a rewarded "Other feats": new cards where there are any
```

The draw is weighted, without replacement, one rng call per card: the same seed draws the same cards. An empty offer
means nothing is eligible — skip the pick. A maxed card (`max` reached) is never offered.

Two settings keep a long run's offers fresh (Frankengun's drops and benches, `sim.ts` rollPart/benchOffer):
- **`recent: { offers: 2, weight: 0.25 }`** — the cards of the last 2 offers (and rerolls) come up at a quarter of their
  weight: the same three don't return offer after offer. Rarer, never banned, so a short pool still fills; off by
  default (the memory lives in the state, `feats.recent`, and in a mid-run save).
- **Fillers, `{ id: 'heal', fill: true }`** — offered only when the real cards can't fill an offer (late in a run, most
  maxed: Frankengun's boss bench showed one card), never instead of one; no `max` by default. `pool()` lists the real
  cards, `fillers()` the fillers.

### UpgradeShop — the level shop (idle and launch games)

`UpgradeShop` is the math of a level shop: prices, bulk buying, states, refunds, "best value", balance bots, and your own
unlock conditions with `lock(id, levels)`. Use it for idle and launch-distance games, for ranks next to a `PactTree`, and
under `Tiers`. `mountUpgradeShop` is its ready screen (§6); an idle game with several places keeps one per place in `Sites` (§7). Existing games keep working; the one visible change is that
the screen shows no ×1 / ×10 / Max toggle unless an upgrade has 25+ levels (or the game passes `amounts`).

### collection — the album, a second track (any genre)

What a player has found — cars, pickaxes, fish, cards — with the rest as silhouettes to hunt: the second track the
genre table names, and a permanent bonus that survives a prestige.

```ts
import { collection, mountAlbum } from '@gp/core';

const album = collection(save, {
  entries: MATERIALS.flatMap((m) => LEVELS.map((l) => ({ id: `${m}:${l}`, group: 'picks', row: m, rarity: l > 6 ? 'epic' : 'common', bonus: 0.01 }))),
  persist: () => host.save(save),
});
if (album.find(`${pick.m}:${pick.l}`)) banners.push({ title: host.t('album.new') });   // true: the first time
const damage = base * (1 + album.bonus());                                              // +1 % an entry, for good
mountAlbum(null, album, {
  host,
  view: (id) => ({ icon: pickIcon(id), name: host.t(`pick.${id}`) }),
  rowName: (group, row) => ({ label: host.t(`mat.${row}`), icon: blockIcon(row), tint: MAT[row].color }),
  groupName: (g) => host.t(`album.${g}`),
});
```

- Found is for good: a reset never empties it, and the ids a game removes stay in the save out of the count. An old
  plain list of ids (Craft Pickaxe's `codex: string[]`) loads as found and seen (no wall of "new" marks after an update).
- `entries` carry a `group` (its pages), a `row` (a labelled row: its material, its class — what Craft Pickaxe's
  reviewer missed in 88 identical silhouettes), a `rarity`, a `bonus` (a share) and `secret` (not even a silhouette:
  "?"). `state()` gives the counts by group and row and the new ones; `markSeen()` clears "new" marks.
- **The album** (`mountAlbum`): each group on its own pages, rows labelled (icon and name), found entries in their
  picture with their rarity's frame, missing ones as a blacked-out silhouette on their row's tint (or the game's own
  `silhouette`), a red "new" dot until the page is turned or the album closed, a tap names the entry on the info line
  ("Not found yet" for a missing one). Cells are at least the touch size; as many lines a page as fit — never a scroll.
  `gp.album.*` in 13 languages, `host.screen('album')`, `--gp-album-*` on `#gp-album` (the shared `--gp-theme-*`
  first), `data-gp="album"`, `"album-cell"` (`data-gp-entry`, `data-found`, `data-new`), `"album-info"` for QA.

## 3. The balance report

Before anyone plays, the game's own bot answers: when does the first purchase come, when does each new thing arrive,
how long does the whole meta last, is the fully progressed player clearly stronger, is there a trap (the cheap buys slow a
new player down) or a purchase that does nothing. Every game so far measured this in its own way (Germ Bait's campaign
per dish, Starsilk's depths per minute, Dread Throne's stages per attempt); the platform now reads one shape of it.

**The contract.** `bot.ts` (or `balance.ts`) exports `balance()` returning a `BalanceReport` (async is fine):

```ts
import { meanCurve, type BalanceReport } from '@gp/core';

export function balance(): BalanceReport {
  const seeds = [1, 2, 3];
  return {
    measure: 'stage-5 win rate, the average bot',   // what fresh and full measure; higher = stronger
    fresh: winRate(STAGE5, noUpgrades),             // a fresh save …
    full: winRate(STAGE5, everything),              // … and a fully progressed one, in the same test
    cheap: meanCurve(seeds.map((s) => campaign(s, 'cheap'))),      // a new player: the cheapest thing first
    careful: meanCurve(seeds.map((s) => campaign(s, 'careful'))),  // the best value first
    dead: [],                                       // purchases the bot measured as changing nothing
    offers: offers.stages(),                        // a roguelite: what each stage offered (below)
    note: '3 seeds × up to 300 runs',
  };
}
// a campaign's curve: { firstPurchaseRun, firstPurchaseMin, finishMin, finishRun, goalsMin: [minutes of each new thing] }
```

Every field is optional: what isn't reported is skipped (say why in REPORT.md — a roster of sidegrades has no "full is
stronger"). `meanCurve` averages seeds; a seed that never finished makes the mean `null` (not finished), which is honest.
The `gp init` skeleton's `bot.ts` is a complete example, and its `sim.test.ts` pins the report.

**The targets** (`BALANCE_TARGETS` in `@gp/core`; CrazyGames and the own site share them for now):

| Check | Target | Warns | Fails (unambiguous) | Where the number comes from |
|---|---|---|---|---|
| The first purchase comes early | after ≤ 2 runs | 3–5 runs | never, or after 6+ runs | Yeet, Germ Bait, Starsilk: a purchase after every early run |
| The first new thing arrives soon | within 3 min | later | — | game-design.md: the first new thing at 2–3 min |
| The meta lasts | 10–180 min | under 10 or over 180 min, or not finished within the bot's runs | everything done in under 3 min | Full Launch needs ~10 min average play |
| No long stretch without a new thing | ≤ 7 min between new things | longer | — | Yeet's curve: a new goal every 2–7 min |
| Fully progressed is clearly stronger | full ≥ 1.5 × fresh | less, or equal (fine for sideways unlocks: say so) | full weaker than fresh | Candle Crypt: fresh wins 4/16, full 16/16 |
| No trap, no dominant pick | the careful buyer ≤ 1.33 × faster | up to 2 ×, or the careful one slower or never finishing (the value measure is off) | over 2 ×, or only the careful one finishes | Starsilk's balance test: at most a third apart |
| Every purchase changes something | none dead | — | any dead purchase | a purchase that does nothing is a lie |
| The late run still offers variety | each stage of the run's last third offers ≥ 8 distinct things (when it showed ≥ 16 cards) and ≥ 50 % of the most an earlier stage did | fewer | — (never) | Frankengun: late waves drew six things, "the same six upgrades keep dropping" |
| Skill matters: naive falls behind skilled | the least skilled bot under 80 % of the most skilled one's progress (or win rate) | 80 %+ (the game plays itself), or naive ahead | — (never) | the research: a skilled player should beat a naive one by a lot (P20) |
| The *skill* player's win rate | game.yaml `balance.difficulty.<skill>.winRate` ± tolerance (default 0.1), from 20+ runs | not measured, or under 20 runs | outside the target | Frankengun: the skilled bot wins 24 of 120 (4 of 20) |
| The winning run's length | game.yaml `balance.difficulty.winningRunMin` | no run won | outside the range | Frankengun: a winning run 30–40 min (32–33 measured) |
| Offered choices are real choices | every option offered 20+ times is picked 5–60 % of the times it is offered | a dominant (> 60 %) or dead (< 5 %) option | — (never) | Slay the Spire's pick rates (Giovannetti, GDC 2019) |
| Builds differ from run to run | the final builds of 5+ runs share ≤ 80 % (mean Jaccard) | more alike | — (never) | the research: a build that differs from the median by < 20 % of its slots |
| Hard stages are short | a stage cleared in < 30 % of 10+ attempts takes no longer an attempt than the median stage | longer | — (never) | King: "if a level is really hard, it should also be really short" |

The last six rows read the decisions, not the curve ([the skill ladder](#the-skill-ladder-and-the-difficulty-as-designed),
[decision quality](#decision-quality-pick-rates-builds-hard-stages)); like every row they are skipped when not reported.

**Offer variety (roguelites).** A run that offers choices — level-up cards (`RunChoices`), part drops, a shop between
waves — can look fine in every number above and still bore: late in a run the pool narrows (things maxed, the own build's
parts weighted up) and the same few cards come back. Let the bot log every card it was shown, by stage, and report them:

```ts
import { offerLog } from '@gp/core';

const log = offerLog();
// in the bot's runs, wherever the game shows an offer (every seed, every run):
log.add(wave, offer.map((card) => card.id));      // repeats count: each card shown is one
// …
return { …, offers: log.stages() };                // [{ stage: 1, ids: […] }, { stage: 2, … }] in run order
```

The report takes the last third of the stages as "late" and counts the distinct ids in each: a stage that shows enough
cards (twice the floor) but fewer than 8 distinct ones, or fewer than half the most an earlier stage offered, is a
warning naming the stage and its most repeated cards. The fix is in the draw, not the report: drop what is finished
(maxed parts), let the build's own share fall with the stage, make the last few offers come back less often.

### The skill ladder and the difficulty as designed

One bot measures a curve; it can't say whether the game is hard enough. Play the same fresh save with a **ladder of
bots** — the ones a game already has, at three settings of its skill (Frankengun's `bot.ts`: `AVERAGE` and `SKILLED`
are aim error, reaction time, turn speed and the share of telegraphs dodged):

| Skill | Who | Frankengun |
|---|---|---|
| `naive` | a portal's new visitor: slow, imprecise, no plan | — |
| `average` | the curve's player (the buyers' campaigns above) | aim 0.045 rad, react 0.35 s, dodges 60 % |
| `skilled` | a good human, the owner's level | aim 0.025 rad, react 0.22 s, dodges 85 % |

Report the runs per skill, or each run tagged with its skill (the report adds both up):

```ts
return {
  …,
  measure: 'waves a run',
  skills: {
    naive: { runs: 120, wins: 0, progress: 6.2 },                        // progress: in `measure`, a run's mean
    average: { runs: 120, wins: 3, winMin: [34, 36, 35], progress: 10.5 },
    skilled: { runs: 120, wins: 24, winMin: winning.map((r) => r.minutes), progress: 14.1 },
  },
  // or: runs: [{ skill: 'skilled', won: true, minutes: 33.2, progress: 20, stages: [...], build: [...] }, …]
};
```

A game without a win (an endless dodger, the `gp init` skeleton) leaves `wins` out and compares `progress`. The report
says how far the least skilled bot falls behind the most skilled one (a warning when naive reaches 80 %+: the game plays
itself), each skill's win rate and the median winning run. **Declare the targets** in game.yaml and they are checked —
outside them is a failure in `gp balance` and `gp qa`:

```yaml
balance:
  anchor: { name: "waves a run", unit: waves, says: "how many of the 20 waves a run clears", shape: run }
  difficulty:
    skilled: { winRate: 0.2, tolerance: 0.05 }   # 4 runs of 20 from scratch (default tolerance 0.1)
    winningRunMin: [30, 40]                      # a winning run's minutes (the skilled bot's median)
```

- **Enough runs.** A win rate is judged from 20 runs (fewer: a warning). Frankengun needed 120 seeds for its 4 in 20:
  sets of 40 varied too much. The same seeds for every skill (common random numbers), as for the buyers.
- **Measure again after every change to drops, shops or waves**: Frankengun's varied late drops alone doubled the skilled
  bot's wins.
- **The session.** With `winningRunMin`, `gp forecast` takes a winning run's minutes as the session (the bot's measured
  median, else the range's middle) in place of `money.session.minutes`, and scales `money.session.breaks` to it: a
  roguelite whose whole is one run is played, by a player who wins, for that long. forecast.md's Session row says so.
- **A patch** that runs the model alone (`gp qa` in an update) doesn't play the bots: the rows are skipped, not failed.

### Decision quality: pick rates, builds, hard stages

A game is a series of interesting decisions: no option always best, none never worth it (Sid Meier). Slay the Spire
balanced its cards from **pick rates** — how often a card is taken when offered — over Early Access (Giovannetti, GDC
2019; docs/research/game-design-2026-10.md P1, P3). The bot's runs give the same numbers before anyone plays. Log every
offer and the pick with `choiceLog()`:

```ts
import { choiceLog } from '@gp/core';

const log = choiceLog();
// wherever the run offers a choice (a 1-of-3 card, a shop, a draft), every seed, every run:
log.pick(offer.map((c) => c.id), chosen?.id ?? null, wave);   // null: the bot took none
// after each run (its build: the ids picked in it — or pass the final build: log.endRun(run.parts))
log.endRun();
// …
return { …, choices: log.choices(), builds: log.builds(), offers: log.offers() };   // offers: the variety check, no offerLog needed
```

- **Pick rates.** Each option's picked ÷ offered, over offers of two or more distinct options; judged from 20 offers. Over
  60 % it dominates (a no-brainer: weaken it, or make it situational), under 5 % it is dead weight (give it a role, buff
  it, or drop it). A warning, never a failure: the bot's policy is yours to write. **Pick by the value the bot measures,
  with a little noise** (the gain to the run's power, the build's synergy): a bot that always takes one kind makes its
  favourite look dominant. `gp balance` prints the table (qa/balance.md), `--csv` writes `qa/balance-picks.csv`.
- **Build diversity.** The runs' final builds as sets: the mean Jaccard similarity of every pair, the distinct top-3
  "cores" (the three most repeated pieces of a build) and the most common one's share. More than 80 % alike (5+ runs)
  is a warning: every run ends in the same build, one path wins.
- **Hard stages are short** (King: *"if a level is really hard, it should also be really short"*). Per stage, the
  attempts, the clears and the minutes an attempt — `stages: [{ stage, attempts, clears, minutes }]`, or tagged runs
  with the `stages` they played (a roguelite's run: each wave reached is an attempt). A stage cleared in under 30 % of
  10+ attempts that takes longer an attempt than the median stage is a warning: a loss there costs the player the most
  time. Shorten it, or ease it.

**Where it runs.** `gp balance <game>` prints the table and writes `qa/balance.md`; `gp qa` runs it for every code game
as its `balance` section: a failing row fails QA, a warning is a ⚠ line in `qa/report.md`, a game without `balance()` gets
a warning (not a failure). The module is loaded like the game's tests load it (Vite: `@gp/*` and extensionless imports
work). Keep `balance()` under a few seconds of work (three seeds, a few hundred runs): QA runs it once.

**Pin it in your tests** too, so a change in `data.ts` that breaks the curve fails before QA:

```ts
expect(evaluateBalance(balance(), 'crazygames').rows.filter((r) => r.status === 'fail')).toEqual([]);
```

vitest 5 hides `console.log` of passing tests (Dread Throne): print a curve with `process.stdout.write`, or run
`gp balance`.

### The balance bots (the recipe)

1. A **cheapest-first** buyer (a new player: `spendLikeAPlayer`, `spendCheapest`) and a **best-value** buyer
   (`spendBestValue`, `spendBest` with the bot's measure of power).
2. Each plays a campaign of 300–400 runs with fixed seeds; record the run and the minute of play of the first purchase,
   of each new thing (a goal, a stage, a tier, a hero) and of the end of the meta.
3. The bot must be allowed what the player is: Brew & Banter's bot shopped only in the evening while players shop any
   time, so its curve was slower than theirs.
4. Read the gap between the buyers: best value **much faster** → the cheap buys are traps; **no difference** → prices may
   not matter enough (fine when the choice is about play, not numbers).
5. **A random simulation: the same random numbers for every loadout** (common random numbers). Give each compared
   build or buyer the same list of seeds, run for run, so the gap between them is the build and not the dice: Scrap
   Royale's `gp balance` flipped between runs until every loadout played the same seeds. Fewer runs then suffice too —
   and keep `balance()` fast: `gp qa` runs it beside the browser and a slow one is the whole run's length.

### Start from time, then the anchor

Our CrazyGames games were rejected, or stopped after Basic Launch on their metrics: 4–7 min of average play against a
target of 10+, D1 1–2.4 % against 10–15 %, 26–76 % of players past the first minute against 80 %+. The owner's
game-balance method (2026-10) says what the tables were missing: they began with prices and power, not with the time a
player has.

1. **Time first.** The target session length is the one number entered by hand (`money.session.minutes`). Everything
   else is derived from it: how long a stage takes, when the first reward comes, how many new things fit in the first
   ten minutes, what is left in reach at the session's end, how long the meta lasts (two sessions at least).
2. **Then the anchor:** the one number the genre converts everything into. Declare it in game.yaml and build
   `balanceModel()` in it (its `measure` names it; `gp qa` warns when it doesn't):

   ```yaml
   balance:
     anchor: { name: "clear time", unit: "s", says: "how long one room takes a fresh hero" }
   ```

   | Genre | Anchor |
   |---|---|
   | RPG, shooter, action | health and what converts into it (damage, defense, healing, time to death) |
   | Sprint, endless, time attack | distance over the session's length |
   | Circuit racing | lap time |
   | Tower defense | damage per wave for the tower budget |
   | Roguelike | expected depth or rooms per run (`shape: run`: [below](#start-from-time-then-the-anchor)) |
   | Clicker, idle | income per unit of time; the next source's price is a curve of what is owned |
   | Match-3 | the distribution of moves to win; the move budget cuts it |
   | Puzzle | almost no numeric anchor: the skill-difficulty curve |
   | Metroidvania | access to the next area |
   | MOBA, card games | identity cost curve |

3. **Name the inputs.** A number set by hand is an input and says so (`const SESSION_MIN = 15 // input: the target
   session`); every other number is derived from the inputs and the anchor. No invented constants: a `1.37` with no
   reason is a guess the next patch can't reason about.
4. **Add a layer only if the anchor is wrong without it.** Armour, crits, a second currency: each is a layer of the
   model, and it earns its place only when the anchor's numbers come out wrong without it.
5. **End with the holes:** write down what the model doesn't count — what depends on skill (aim, reading a pattern,
   a combo), luck the expected values smooth out, a choice the cheapest-first player never makes. The bot and a
   playtest check exactly those.

**The checks the anchor turns on.** `gp balance` and `gp qa` read the model's walk (the cheapest-first player) for the
first session, the shape of the difficulty and the session's end. Without `balance.anchor` they are warnings (⚠ lines
in `qa/report.md`), so games made before them keep passing; with it they fail like the others. A portal code game
without the anchor gets `W_BALANCE_ANCHOR` from `gp validate`; `gp init` writes one (its skeleton's: replace it).

| Check | Target | Fails with the anchor (else warns) | Where the number comes from |
|---|---|---|---|
| The first reward within a minute | a stage cleared or a purchase within 60 s of play | later, or never | the method: the first reward inside the first minute (26–76 % of our players got past it) |
| A new thing every few minutes at first | ≤ 3 min between new things in a stretch that starts in the first 10 min (later: the ≤ 7 min of the curve) | a longer stretch | the method: many small rewards spread over the first session |
| No two big rewards in the same minute | news of weight ≥ 2 (an unlock, a boss, a story beat) ≥ 1 min apart | two closer | the method: a big reward spent next to another is one the player doesn't feel |
| No hard streak | fewer than 3 stages in a row over 2.5 attempts each (bosses aside) | 3 or more | Schreiber, level 7: difficulty rises in a sawtooth, with relief after each peak |
| Stage time grows steadily | the time a stage takes (arrival to clear, farming included) ≤ × 1.5 the stage before; bosses and breathers aside (per stage across them) | a bigger jump | Schreiber, level 7: pacing without sudden jumps |
| The session ends with a goal in reach | around `money.session.minutes` (or the model's `sessionMin`) the next goal — the stage the player is on or an item for sale, whichever is nearer — ≥ 60 % reached **on average over the session ± 1 min** (`sessionWindowMin`) | less, or nothing left | the method: the reason to come back is a goal left at 80 % (D1) |
| The meta outlasts the session | the meta ≥ 2 × the session | shorter | the method: the progression must outlast the first session |
| The meta's length agrees with money.meta | the model's meta within 25 % of `money.meta.minutes` | — (a warning: correct the one that is wrong) | |
| The power is measured in the anchor | the model's `measure` names the anchor's name or unit | — (a warning) | |

The thresholds are in `MODEL_TARGETS` (`@gp/core/balance-model`), with the sources: the owner's method (2026-10) and
Schreiber, ["Game Balance Concepts"](https://gamebalanceconcepts.wordpress.com/), level 7 (advancement, progression
and pacing; CC BY 3.0).

**A run, not a campaign (`shape: run`).** The checks above read a campaign: a stage at a time, retried until cleared,
the last one replayed for coins. A roguelite's stages are a run's waves, floors or rooms: every run starts at the first
and goes on until a loss, and the purchases come between runs. Declared with the anchor, the model plays it that way
(Frankengun's block request: declaring its anchor failed four checks that don't apply to a run of 20 waves):

```yaml
balance:
  anchor: { name: "waves a run", unit: "waves", says: "how many of the 20 waves a run of the average player clears", shape: run }
```

The walk then plays runs in expected values (`runAt(model, power)`: each stage reached with the chance of clearing all
before it; the stage a run is lost on is played for `deathShare` of its minutes, default ½, and pays its `lossReward`).
A stage is first reached and first cleared in the run by which half the players have done it; the meta is over when
every item is bought (`finish: 'stages'` waits for a first win instead, `'all'` for both). `qa/balance.md` gets a runs
table (power, stages cleared, the chance to win, minutes, coins per run). The checks:

| Check | Target | In a run |
|---|---|---|
| No grind, No stretch that plays itself, No hard streak, Stage time grows steadily | — | left out (shown as –, not failed): a run never replays a stage for coins, its first stages are easy by design, its stages are reached, not retried |
| No wall | the meta finishes | stuck fails; a stage that ≥ 20 runs reach before it is first cleared warns |
| A new thing every few minutes at first; No two big rewards in the same minute | as above | warnings: a run's own news (level-ups, drops, run choices) are not in the tables, and its results pay the unlocks right after its last clear |
| A first run shows the game | a fresh player's first run lasts ≥ 2 min and clears ≥ 1 stage | fails with the anchor |
| Progress carries into the run | the fully progressed player gets ≥ 1.5× as far as a fresh one, or to 90 % of the stages | fails with the anchor |
| A winning run fits the session | a run that clears every stage ≤ 1.25 × `money.session.minutes` | fails with the anchor |
| The runs get further in the first session | the run in progress at the session's end gets ≥ 1 stage further than the first | fails with the anchor |
| The first reward, the session's end, the meta outlasts the session, the measure | as above | as above (the session-end goal: the next new depth, or the next purchase) |

The report's `fresh` and `full` are the stages a run clears (fresh against fully progressed), so the curve's "fully
progressed is clearly stronger" reads the run too. A model can say `shape: 'run'` itself; game.yaml's wins.

**The session-end hook.** `atMinute(model, t)` snapshots the walk at minute t: the stages cleared, the stage the player
is on and how far, power, coins, the purchases made, the next purchase and the share of it paid, the nearest goal.
`gp balance` prints it at the session's end, e.g. *at minute 15: Lithium Candle 82 % paid, 4 of 9 stages, 6 of 20
purchases* — what the player sees when they stop, and the reason to open the game tomorrow. Nothing at 60 %+ means the
session ends on nothing; the campaign over by then means there is nothing to come back for.

The check reads a window, not that one instant: `atMinuteWindow(model, t, 1)` reads the walk at fixed steps through
minutes t − 1 to t + 1, with the stage's progress and the coins growing through each attempt as they do in play, and
averages the nearest goal's share (it also gives the worst and the best moment). One instant lands just before a clear
or a purchase or just after it, so a change of an attempt's length from 0.8 to 0.85 min flipped a goal from 6 % to
64 %; the average moves a point or two. Not the best moment (≈ 100 % whenever anything is bought or cleared in the
window) and not the median (it jumps across the gap a clear leaves, 40 % → 95 %). `gp balance` prints both: *at minute
15: …; over minutes 14–16 the nearest goal is 64 % reached on average (31 % at minute 14.2: s4 of the way; 100 % at
minute 15.6: Lithium Candle paid)*.

**The reward timeline.** `qa/balance.md` lists, minute by minute up to the session's end, what arrives: the stages
cleared, the purchases, ★ for a big reward. Mark what is news in the tables:

- a stage's `kind: 'boss'` (a deliberate peak: news of weight 3) or `kind: 'breather'` (a deliberate dip): the
  "difficulty rises" check takes the fall at a breather and after a boss as designed;
- `news: { kind: 'unlock' | 'stage' | 'boss' | 'story' | 'item', weight? }` on a stage or an item (default weight: stage
  and item 1, unlock and story 2, boss 3); an item with `news` is a new thing (`goal: true` alone is an unlock);
- the model's `sessionMin` when game.yaml has no `money.session.minutes`.

The first minute's QA (`gp qa`, section *first minute*) shows the model's first reward next to the demo bot's first
celebrated moment (`host.happytime()`): the tables say when the first reward comes, the game must celebrate it then.

### The balance model: the economy as tables (`balanceModel()`)

Before the bot, the numbers: designers balance a game in a spreadsheet — a row per stage (how hard, what it pays, how
long), a row per purchase (price, what it adds) — and read off where the player stands at each stage. `@gp/core/balance-model`
is that spreadsheet in code. Export `balanceModel()` from bot.ts (or balance.ts) next to `balance()`, or alone while
the game has no bot yet:

```ts
import { curve, type BalanceModel } from '@gp/core/balance-model';

export function balanceModel(): BalanceModel {
  const difficulty = curve.geometric(12, 10, 1.3);   // stage HP × DPS to beat: ×1.3 a stage
  const reward = curve.geometric(12, 20, 1.25);      // coins for a clear: a bit slower than difficulty
  const stages = difficulty.map((d, i) => ({ id: `stage-${i + 1}`, difficulty: d, reward: reward[i], minutes: 1.5 }));
  const items = UPGRADES.flatMap((u) =>              // your real data: the same tables the game reads
    u.prices.map((cost, l) => ({ id: `${u.id}-${l + 1}`, cost, mult: 1 + u.perLevel, ...(l ? { requires: `${u.id}-${l}` } : {}) })));
  return { start: { power: 11 }, stages, items, measure: 'HP × DPS', win: { steepness: 4 } };
}
```

- **Stages:** `difficulty` (in the unit of the player's power), `reward` (coins per clear; a loss pays `lossReward`,
  default 30 %), `minutes` per attempt, `entry` (coins paid once to start it — the house a flipper buys, a ticket: the
  player farms the stage before until it is paid), `goal: false` for a stage that isn't news, `kind: 'boss' | 'breather'`
  for a planned peak or dip, `news` for what its clear brings (the reward timeline, above).
- **Items:** `cost`, and `power` (adds) or `mult` (multiplies); `after: '<stage>'` for sale once that stage is cleared;
  `requires: '<item>'` for the next level of an upgrade; `goal: true` for a hero or a weapon (news to the player), or
  `news: { kind, weight }` to say how big.
- **Shape:** a campaign by default; `shape: 'run'` (or game.yaml `balance.anchor.shape: run`) for a roguelite whose
  stages are a run's waves or floors — the walk plays whole runs from the first stage ([a run, not a campaign](#start-from-time-then-the-anchor)).
- **Winning:** by default `p = r^k / (1 + r^k)` with `r` = power ÷ difficulty — even power wins half the time, k = 4:
  1.5× the power wins 84 %, 0.7× 19 %. Measure a few points with the bot (`{ ratio, win }`) and `fitWinCurve(points)`
  gives your game's k; or pass `win: (ratio) => …`.

The platform walks two players through the tables in **expected values** (no randomness, milliseconds): the cheapest
buyer and the best-value one, buying between attempts; below a 25 % chance at the next stage the player replays the last
cleared one for coins, as players do. `gp balance` prints, and writes to `qa/balance.md`:

- **the stage table:** when the player arrives, power on arrival, **power ÷ difficulty** (the number to tune: around
  0.9–1.1 on arrival is a fair fight; under 0.7 a wall, over 1.5 the stage plays itself), the chance to win, attempts,
  minutes of farming, when it was cleared;
- **the purchase table:** when each item was bought and on which stage, power before → after, power per 1 000 coins
  (value for money), how many minutes of income it cost;
- **the growth a stage** of difficulty and reward, and of prices from one item to the next dearer one — reward growing
  slower than difficulty is what makes purchases matter;
- **the checks** (in `gp qa` too, as `model: …`): no wall (> 4 attempts warns, > 10 or stuck fails), no grind (≤ 25 % of
  the play replaying for coins), no stretch that plays itself (3+ stages in a row won ≥ 95 % on arrival), difficulty and
  reward never fall (a breather and the stage after a boss may), every purchase reached and adding power (a dead one
  fails), none worth more than 3× the median; and the first-session, difficulty-shape and session-end checks of the
  anchor ([above](#start-from-time-then-the-anchor));
- **the first session:** the first reward, the session-end hook and the reward timeline (minute → what arrives);
- **the curve** (first purchase, each new thing, the meta's length, cheap vs careful) read against the channel's targets
  above — from the model when the game has no `balance()` yet, from the bot when it has.

`gp balance --csv` also writes both tables as CSV (`qa/balance-stages.csv`, `qa/balance-items.csv`) to open in Google
Sheets or Excel and play with the columns; nothing else writes them.

**The workflow:** tables first (cheap: change a rate, run `gp balance`, read power ÷ difficulty), then the bot on the
real game confirms them. When the two disagree, the model's win curve or a stage's minutes are off: fit k from the bot.

**Why it pays** (measured 2026-10-03): tuning 96 candidate economies (price level, reward and difficulty growth) to a
30–45 min meta, a first purchase within 3 min, ≤ 4 attempts a stage and no grind. Judged by a stochastic bot alone: 96
bot evaluations. Ranked by the model (0.5 ms each), then confirmed by the bot: 4 bot evaluations to a passing economy of
the same quality. The model's meta length was within 2 % of the bot's median (90 % of candidates within 7 %), and it
ordered the candidates like the bot (Spearman 0.93) though the bot played another win curve, noisy rewards and a skill
spread. A real bot costs 14 s (Scrap Royale) to 193 s (Dread Throne) an evaluation, so that is ≈ 22 min → 1 min and ≈ 5 h
→ 13 min. The cost is writing the tables (the power each purchase adds, in one unit); a test in
`packages/core/test/balance-model.test.ts` keeps the agreement checked.

**A launch runs both, a patch the model alone** (the owner, 2026-10-03). `gp qa` of a new game runs the bot's
`balance()` and `balanceModel()` and compares them (`model vs bot: the meta's length` within 25 %, the first purchase
within 25 % or a minute; off → a ⚠ to calibrate the model: `fitWinCurve` from the bot's wins, the stages' minutes, the
power of each purchase). An update (CHANGELOG.md with 2+ versions) skips the bot when the game has a model: the curve
and the model's checks come from the tables alone, in milliseconds (`gp qa --bot` runs the bot too; `gp balance`
always runs both). Measured on 300 random patches of a calibrated economy (prices ×0.3–4, rewards ×0.2–1.8, a stage
up to ×3.7 harder, attempts ×0.3–3.3 longer, a new item, a dead one): the model alone gave the same verdict as the bot
in 91 %; it caught all 15 patches the bot failed, and failed none the bot passed; the 9 % that differ are warnings
(the bot's random runs show a longer worst gap between new things than the expected-value walk). A patch that changes
how the game plays (a new mechanic, a new kind of stage) is a launch for the balance: run `gp qa --bot`.

**On a real game** (Sigil Clash 1.0.0): 8 chapters and 21 purchases from the game's own data, the chapters' difficulty
calibrated from the bot's wins with an empty and a full book; the model's meta 49.8 min, the bot's 53.2 (−6 %). It found
three real faults the bot's curve hadn't named: a chapter easier than the one before it, a reward that fell at chapter 5,
and one sign worth 5× the median — each fixed and confirmed by the bot. The hard part is the one unit of power: estimate
each purchase, then check the full-power total (×3.7 there) against the bot.

## 4. The math of a level shop

### Prices

The price of the level after `l` levels (Pecorella, "The Math of Idle Games", Kongregate 2016: `base × rate^owned`):

```
c(0) = max(1, round(base))
c(l) = max( round(base × growth^l),  c(l−1) + 1 )        l = 1 … max−1
```

What `UpgradeShop` guarantees (each one is a unit test):

| Invariant | Why |
|---|---|
| The table is built once by repeated multiplication, not `Math.pow` | `Math.pow` isn't required to be exact and can differ in the last bit between browsers; `round()` at .5 then gives different prices on different devices. Multiplication is exactly rounded everywhere |
| Every level costs strictly more than the one before | a small base with growth near 1 would repeat a price (1, 1, 1 …) |
| All prices are safe integers (≤ 2^53 − 1), checked at creation | past that, integers lose precision; an economy that big needs a big-number library (break_infinity.js) |
| Bulk price = the sum of single prices (prefix sums) | the closed form `b·r^k·(r^n − 1)/(r − 1)` is off by a level once prices are rounded; "buy 10" must cost exactly ten single buys |
| "Max affordable" is the largest n whose exact sum fits the coins (binary search) | a float closed form can promise a level the player can't pay for — a known bug in idle games |
| A price depends only on the upgrade's own level | a global fee that grows with every purchase (Vampire Survivors) makes the purchase *order* change the total by 2× — players call it a trap |
| Buy and refund round-trip exactly | undo and respec must give back what was paid |
| Levels read from a save become integers in 0..max | a tampered or old save can't make prices negative or skip levels |

### Growth rates (starting points)

- **Generators / idle buildings:** growth **1.07–1.15** per level (AdVenture Capitalist 1.07–1.15, Cookie Clicker 1.15), many levels.
- **Meta-shop upgrades with 5–20 levels:** growth **1.3–1.9** (Yeet the Gnome uses 1.5–1.9) — *heuristic*.
- **Effects grow slower than prices:** linear (`v0 + k·l`) or gentle geometric (`v0 · 1.05^l`), with an occasional
  milestone bonus (×2 at levels 10, 25 …, as in AdVenture Capitalist and Cookie Clicker). Then every next level of the
  same upgrade pays back more slowly — the curve that makes "which one next?" a real choice.
- Mark milestones with `milestones: [10, 25]`: the shop's **Next** amount buys up to the next one.

### Value for money

- **Run-based games:** gain per coin = `(score(after) − score(before)) / cost`, where `score` is the game's measure of
  power (e.g. the bot's expected distance). `view(…, { score })` tags the best row, `spendBestValue()` shops by it. Units
  differ between upgrades (tiles, seconds, hearts): Starsilk's `POWER` table (the clear chance a level adds) is the way.
- **Idle games:** payback period `PP = max(cost − bank, 0) / income + cost / Δincome` (Cookie Monster) — lower is better.
- **Time to afford:** `ceil((cost − coins) / incomePerRun)` runs — `view(…, { incomePerRun })` gives it per row.

### Prestige (if the game resets for a permanent bonus)

`points = floor(k · (earned / E0)^p)`, with p = ½ (doubling needs 4× the earnings; AdVenture Capitalist: k = 150,
E0 = 10^15, +2% each) or p = ⅓ (8×; Cookie Clicker: E0 = 10^12, +1% each). The block is `Prestige`
(`Prestige.root(E0, 2)` or `(E0, 3)`): [§7 Idle games](#7-idle-games).

## 5. The screen: rules for any progression screen

`mountUpgradeShop` does all of these for a level shop; a game's own screen (a roster, a pact tree, the Loom) must too.

1. **Every card:** an icon, the name, a one-line effect, **now → next** for levels ("260 → 278 px/s") or what it changes
   for an unlock, the level or state, and the price on the buy button.
2. **Four states told by text and icon, not colour alone** (WCAG 1.4.1): affordable, too expensive, 🔒 locked, ✓ owned / max.
3. **Locked things stay visible** and say what unlocks them ("🔒 Needs Flagella", "Clear depth 3 first").
4. **Too expensive shows the way there:** a bar to the price and "Need 🪙 12 · ≈ 3 runs" — the goal-gradient effect
   (Kivetz et al. 2006: people speed up as a goal gets near).
5. **A badge on the entry button only for news:** something that became affordable since the player last looked
   (`shopBadge` / `markSeen`), not "something is affordable" all the time.
6. **An amount toggle only for an idle-scale economy.** With 5–10 levels an upgrade, one press buys one level (Starsilk
   and Dread Throne took the toggle out). With dozens of levels, a visible ×1 / ×10 / Next / Max toggle — never hidden
   modifier keys (a stuck Shift spent a whole bank in Learn to Fly 3). A fixed amount buys exactly that many or nothing,
   and the button shows the total price.
7. **Hold to keep buying** levels, slowly at first, then faster (from 450 ms down to 60 ms per level); stops at max or when
   the coins run out. Keyboard: one level per key press, repeats ignored.
8. **Feedback on every purchase** (a pop of the card, a sound, the balance and bar move) and a distinct "no" (a shake,
   a low sound) when it can't be bought.
9. **Undo instead of confirmations:** the last purchases can be undone at exactly their price (every block has a refund).
   Confirm only what can't be undone (a premium currency), naming the item and price — and keep such buttons away from
   the routine ones.
10. **Touch targets ≥ the audience minimum** (48 px for 13+; Apple 44 pt, Material 48 dp) with gaps between them;
    numbers in tabular figures; no price ever cut off. A long list may scroll: `gp qa` scrolls every clipped button into
    view (only panels a player can scroll, never the page) and checks it is then on screen, big enough and not covered.
11. **One number format everywhere:** three significant digits (1.23K, 12.3K, 123K, 1.23M), `formatAmount`;
    **the balance rounds down, prices round up** — so 1,000 coins and a 1,005 price read "1.00K" and "1.01K", not both "1.00K".
12. **At most one "Best value" tag,** as a labelled tag, computed from the score gain (or value gain) per coin.
13. **Stable order:** the order of your definitions (group by kind, cheaper first); cards never jump while the player
    buys (`mountUpgradeShop` creates them once and only updates them).
14. **Show the journey when it helps:** "37% upgraded" with a bar (endowed progress: Nunes & Drèze 2006) suits a level
    shop; a roster shows "4 of 6 candles", a tree its paths. `mountUpgradeShop({ progress: false })` hides the line.

**The QA contract** (whatever the screen is): `data-gp="shop"` on the entry button; `data-gp="shop-screen"`,
`"shop-balance"`, `"shop-undo"`, `"shop-back"` on the screen; `data-gp-buy` on buy buttons, with `aria-disabled` when it
can't be bought; `host.save()` after every change; and `grant(n)` in `host.qa({ … })` that **saves** — QA reloads the page
before it opens the screen, and says "grant() didn't persist: call host.save()" otherwise. `gp qa` then opens the screen
on every size, checks the buttons, buys, undoes and goes back. The `gp init` skeleton's targets screen is a small example.

## 6. mountUpgradeShop — the ready level-shop screen

```ts
import { markSeen, mountUpgradeShop, shopBadge, UpgradeShop } from '@gp/core';

const SHOP = new UpgradeShop([
  { id: 'power', max: 12, baseCost: 9, growth: 1.5, value: (l) => Math.round(260 * (1 + 0.07 * l)) },
  { id: 'rocket', max: 8, baseCost: 19, growth: 1.8, requires: 'power', value: (l) => 1.2 + 0.4 * l },
]);
const save = host.load({ coins: 0, earned: 0, runs: 0, levels: SHOP.noLevels(), seen: [] as string[] });
save.levels = SHOP.sanitize(save.levels);

const news = shopBadge(SHOP, save.levels, save.coins, save.seen);   // the entry button: "Upgrades ●" only for news

save.seen = markSeen(SHOP, save.levels, save.coins, save.seen);
mountUpgradeShop(ui, {
  shop: SHOP,
  items: {
    power: { name: 'Power', icon: '💪', effect: 'Launch harder', format: (v) => `${v} m/s` },
    rocket: { name: 'Rocket', icon: rocketCanvas, effect: 'A boost in the air' },  // an element, or an image URL
  },
  minTouchPx: host.minTouchPx,
  get: () => ({ levels: save.levels, coins: save.coins }),
  set: (levels, coins) => { save.levels = levels; save.coins = coins; host.save(save); },
  incomePerRun: () => (save.runs ? save.earned / save.runs : null),
  onBuy: () => sound.buy(),
  onBack: showTitle,
});
```

- **Amounts:** none by default (one level a press); ×1 / ×10 / Max by itself when some upgrade has 25+ levels (plus Next
  with milestones). `amounts: [1, 10, 'max']` always wins; `[1]` hides the toggle.
- **Theme:** `screenTheme()` dresses it with every other platform screen (`bg`, `panel` for the cards, `accent`,
  `track`, `accent2` for "Best value", `radius`, `font`, `display`: [code-games.md](code-games.md#platform-screens-in-the-games-look-screentheme-drawn-icons-game-type));
  for the shop alone set the variables on `#gp-shop` in your CSS — `#gp-shop { --gp-shop-bg: …; --gp-shop-ink: …; --gp-shop-card: …;
  --gp-shop-accent: …; --gp-shop-accent-ink: …; --gp-shop-muted: …; --gp-shop-off: …; --gp-shop-best: …; --gp-shop-radius: …;
  --gp-shop-font: … }`. The defaults have no specificity (`:where(#gp-shop)`), so yours win wherever your style sheet is
  (Candle Crypt needed `#ui #gp-shop`).
- **Icons:** a drawn icon (`icon('bolt', { style: 'solid', color })` from `@gp/core/icons`, `iconImg()` from
  `@gp/art/dom`, a canvas), a function that makes one, an image URL (png, svg, webp, a `data:` URL) or text (an emoji)
  — no walking `.gp-icon` by hand (Starsilk). The currency too: `currency: { icon: icon('gem', …), name: 'gems' }`
  (default the platform's drawn coin). The shop's own marks are drawn: the lock, the check of a maxed level, the
  pager's chevrons, the level pips.
- **Texts:** every string through `texts` (title, back, buy, maxed, needs, need, runs, best, undo, upgraded, amounts).
- Its browser test (`packages/core/test-browser/shop-ui.test.ts`, `npm run test:browser`) checks the rules at 360×800,
  800×360 and 1280×720 with eight upgrades, under a game's hostile button CSS.

## 7. Idle games

The blocks in this section are a shape of **idle, clicker and tycoon games only** (`@genre idle`: `OFFLINE_GENRES`,
`PRESTIGE_GENRES`, `SITES_GENRES`; `gp catalog genres` lists them and `gp validate` warns, W_GENRE_BLOCK, when another
genre imports one) — what Idle Garage Evolution, Brew & Banter and Yeet the Gnome wrote by hand. They are pure
(`@gp/core/offline`, `@gp/core/prestige`, `@gp/core/sites` for Node tests and bots), take an injected clock or plain
numbers, and keep a small field in the game's own save. Their balance model is best built from the bot's campaign:
[`modelFromCampaign`](#the-balance-model-of-an-idle-game-from-the-bots-campaign-modelfromcampaign). The daily reward week and the daily order are for any genre:
[first-minute.md → A daily reward week](first-minute.md#7-a-daily-reward-week-and-a-daily-order-dailystreak-dailyorder);
so are the genre's rewards hub — playtime gifts, a lucky wheel, the day's offers in a second currency and a timed ×2
boost that never multiplies the offline earnings — and daily quests with a bonus chest
([first-minute.md §7.2–7.3](first-minute.md#73-playtime-gifts-a-lucky-wheel-the-days-offers-a-timed-boost-mountrewardshub)).

A game of another genre with an idle **layer** (a den that earns while you raid, a rebirth in a speed runner: the
Roblox hybrids) declares it in game.yaml — `money: { genre: action, hybrid: [idle] }` — and these blocks fit it too
(W_GENRE_BLOCK stays quiet; the benchmarks and must-haves stay the main genre's):
[live-world.md → Hybrids](live-world.md#8-hybrids-an-idle-layer-on-another-genre-moneyhybrid). A shop that restocks
on a shared clock, loot with visible odds and mutations by the weather are there too.

### Offline earnings (`offlineEarnings`)

What the game earned while the player was away: share × income per second × the seconds away, clamped to a cap, paid
once. CrazyGames calls the "welcome back ×2" one of the highest-converting rewarded placements.

```ts
import { formatAmount, offlineEarnings, rewardedButton, stampOffline, welcomeBack } from '@gp/core';

const OFFLINE = { share: 0.6, maxHours: 8, minSec: 60, persist: () => host.save(save) };
const away = offlineEarnings(save, OFFLINE, () => incomePerSec(save));   // at start, before the loop earns anything
if (away) {                                                              // null: away under a minute, or nothing earned
  const take = (mult: number) => { save.coins += away.collect(mult); host.save(save); };
  const x2 = rewardedButton({ host, placement: 'offline-x2', label: host.t('gp.offline.double', { amount: formatAmount(away.amount * 2) }),
    onReward: () => { take(2); card.close(); play(); } });
  const card = welcomeBack({ host, lines: [host.t('gp.offline.earned', { amount: formatAmount(away.amount) })],
    extra: x2 ? [x2] : [], onContinue: () => { take(1); play(); }, onClose: () => take(1) });
}
// while the game runs, before every host.save(save) and on pagehide:
stampOffline(save);
```

- **Paid once, never lost.** `offlineEarnings` moves the stamp (`save.offline.at`) to now and writes the pay-out into
  the save as `pending` in the same change, and `persist` saves it before the card is shown. A reload before the
  player collects shows the same pending amount again (plus any new time away), never a second one; `collect(mult)`
  pays it once (×2 after the rewarded ad) and clears it.
- **Clamped:** at most `maxHours` count (`capped: true` says the player was away longer — "the garage was full"); under
  `minSec` it returns null (a reload is not a return). A clock set back pays nothing and moves the stamp back with it.
- **The rate is the running income** (what the HUD shows per second), times `share` (0.5–0.7 is usual: being away is
  worth less than playing). The first call on a fresh save only sets the stamp.
- `stampOffline(save)` marks the game as running: the time away starts at the last stamp, so stamp with every save and
  on `pagehide` (then `host.save(save)`). `gp qa`'s "save: survives a reload unchanged" leaves the stamp out — the `at`
  of an offline log (`{ at, pending }`, under any field name: `key`) — so a stamp on leaving and at start is fine; write
  nothing else on leaving (Craft Pickaxe Idle's QA failed on the stamp before QA knew it).
- The card is `welcomeBack()` (its `lines` and `extra`), the ×2 is `rewardedButton()` — it is absent when no rewarded
  ad can be shown, and the big button then collects ×1.

### Prestige (`Prestige`)

Start the economy again for a permanent multiplier. The points come from the **lifetime earnings of all lives**, minus
those already gained (Cookie Clicker, AdVenture Capitalist): a reset after a short life gives little, playing longer
before a reset always pays more.

```ts
import { Prestige } from '@gp/core';

const PRESTIGE = new Prestige({
  needs: (s: Save) => s.garages >= 5,          // the game's milestone: when the "New garage" button shows
  gain: Prestige.root(1e6, 2),                 // stars = floor(sqrt(lifetime / 1M)): 4× the earnings for 2× the stars
  perPoint: 0.5,                               // multiplier = 1 + stars × 0.5
  keeps: ['prestige', 'lifetime', 'settings', 'streak', 'order', 'offline', 'visit'],   // the rest is cleared
});
save.prestige = PRESTIGE.sanitize(save.prestige);           // { points, earned, count }
const income = base * PRESTIGE.multiplier(save.prestige);
PRESTIGE.next(save.lifetime, save.prestige);                // the button: "+3 ★"; 0 → nothing to gain yet
const done = PRESTIGE.prestige(save, save.lifetime, save.prestige);   // null when it can't
if (done) {
  PRESTIGE.reset(save);                                     // ['coins', 'garages', …]: the keys it clears
  save = PRESTIGE.restart(save, SAVE_DEFAULTS);             // defaults for those, the kept keys as they were
  save.prestige = done.save;
  host.save(save);
}
```

- `needs(state)` is the game's condition; `can()` also asks for at least one point (a reset for nothing is refused).
- `Prestige.root(unit, 2)` (square root, AdVenture Capitalist) or `(unit, 3)` (cube root: 8× the earnings for 2×,
  Cookie Clicker); or any `gain(lifetime)` of your own.
- **`keeps` must name the prestige field and the lifetime earnings**, and whatever a reset must not touch: the
  settings, the language, the daily blocks, the offline stamp, the visit log.
- CrazyGames suggests a rewarded ad "to finish the last leg" of a prestige milestone: a `rewardedButton` next to the
  bar towards `needs`.

**In the balance model** — the second life. `lives(n, perLife)` walks n lives (each earning `perLife(life, multiplier)`)
and `multiplierAfter(n, perLife)` gives the multiplier after n prestiges; `prestigeModel(model, multiplier)` is the same
tables with every stage's reward × the multiplier (`'power'`: the start's power instead). Walk both:

```ts
import { walkModel } from '@gp/core/balance-model';
import { prestigeModel } from '@gp/core/prestige';

const first = walkModel(balanceModel(), 'cheapest');
const second = walkModel(prestigeModel(balanceModel(), PRESTIGE.multiplierAfter(1, LIFE_EARNINGS)), 'cheapest');
// the second life should reach the first one's prestige point clearly faster (2–5×, *heuristic*: tune it with the bot)
```

### Several places: Sites

When an idle game grows from one place to several — the garages of a network, the shops of a town, planets — every place
needs its own upgrade levels, its own unlock price and tier, its income while the player is somewhere else, and its part
of the offline income; the wallet stays one. Idle Garage Evolution (QmaCyber/game19) wrote all of it by hand for 1.4
(`economy.ts`: `sites`, `siteRate`, `backgroundRate`, `offline`, the 1.3 save moved into the first garage). `Sites` in
`@gp/core` (and `@gp/core/sites` for Node tests) is that, general and pure:

```ts
import { formatAmount, mountUpgradeShop, Sites, UpgradeShop, welcomeBack } from '@gp/core';

const SITES = [
  { id: 'shed', price: 0 },                            // the first site is free: a new player starts there
  { id: 'corner', price: 300, requires: 'shed' },
  { id: 'tokyo', price: 1500, tier: 2, requires: 'corner' },
  { id: 'moon', price: 2e6, tier: 5 },
] as const;
type SiteId = (typeof SITES)[number]['id'];
const shops = new Map<number, UpgradeShop<'tools' | 'robots'>>();  // one shop per tier: its own caps and prices
const shopFor = (tier: number) => shops.get(tier) ?? shops.set(tier, makeShop(tier)).get(tier)!;

const sites = new Sites<SiteId, 'tools' | 'robots', { cars: number }>(SITES, {
  shop: (s) => shopFor(s.tier ?? 1),
  rate: (s, levels) => robotsPerSec(s, levels) * starMult(),   // $ a second from the numbers, never from the scene
  start: (s) => ({ tools: ((s.tier ?? 1) - 1) * 5 }),           // a higher tier opens with its basic kit
  data: { cars: 0 },                                           // the game's own record per site
  lock: (s) => ((s.tier ?? 1) >= 5 && save.prestige < 1 ? host.t('lock.chain') : null),
  scenePays: true,                                             // the garage on screen pays per car: earn()
  offline: { maxHours: 8, share: 0.6, minSec: 60 },
});

// Load: the 1.4 save has a `sites` record; a 1.3 save (one garage, no `sites` field) goes into site 0 with its money and levels
sites.load(save.sites, { legacy: () => ({ coins: save.money, levels: { tools: save.tools, robots: save.robots } }) });

// Every frame: the garages the player isn't in earn without their scenes
function frame(dt: number) { sites.tick(dt); /* … */ }
// A car restored in the scene
sites.earn(payout);
// Save: one field of the game's save, stamped for the offline income
save.sites = sites.save(); host.save(save);

// Coming back: what every site earned while the player was away (×2 for a rewarded ad)
const away = sites.offline();
if (away) welcomeBack({ host, lines: [host.t('gp.sites.away', { amount: formatAmount(away.coins) })],
  onContinue: () => sites.collect(away), onClose: () => sites.collect(away) });

// One site's shop on the shared wallet, in the ready shop screen
mountUpgradeShop(ui, { ...sites.shopFor(sites.at, () => host.save(save)), items, minTouchPx: host.minTouchPx });
```

- **Per site:** `levels(id)`, `buy(upgrade, amount, id)`, `refund`, `data(id)` (the game's own record, sanitised through
  its defaults), `earned(id)`, `level(id)` (the levels bought, or the game's own `level()`). Buying in one site never
  changes another (a test checks it).
- **Opening:** `siteState(id)` is `open`, `affordable`, `too-expensive` or `locked` (its `requires`, or the game's
  `lock()` with its reason); `unlock(id)` pays the price and opens it with its `start` levels; `next()` is the next one to
  open (the HUD's goal); `travel(id)` moves the player into an open site. `rows()` gives all of it per site in one call.
- **Income:** `rate(id)` and `totalRate()` from the game's `rate()` (non-finite or negative counts as 0; keep it cheap or
  cache it: it runs every tick). `tick(dt)` pays every open site, or with `scenePays` all but the one on screen
  (`backgroundRate()`).
- **Offline:** `offline(now)` — every open site at `share` of its rate, at most `maxHours`; nothing under `minSec`, before
  the first save or when the clock went back. It doesn't pay: `collect(away, mult)` pays it once (its time becomes the
  save's). Use it with `welcomeBack()` (`gp.sites.away` is the line, in 13 languages) or a card of your own with a ×2 offer.
- **Save:** `save(now)` is one JSON object (`{ v, coins, at, sites: { id: { levels, earned, data } }, seen }`); `load(raw)`
  sanitises it (unknown sites go, levels through each site's shop, a free site always open, the player in an open site).
  `migrate(old)` / `load(raw, { legacy })` moves a one-place save into site 0, so an update keeps every player's progress
  (`appId` and `saveKey` stay the same: AGENTS.md §2). `reset(coins)` is the prestige: every bought site closes.

### The map: mountSitesMap

`mountSitesMap(root, sites, { views, items, minTouchPx, onEnter })` is the screen of the places. The game paints each
view's background itself — `draw(ctx, w, h, t, cam)` with the context transformed so (0, 0)–(w, h) is the whole view —
and the platform gives the generic parts: a pin per site at a point of the view (`pins: { id: { x, y } }`, 0..1, or a
function of the time for pins that move), open pins with their level, income and a badge of the game's (`👷 3`), the next
one with its price, locked ones as a head with a lock; pan by drag, pinch and wheel zoom about the finger or the cursor,
\+ / − buttons, the arrows and + / − keys; a tab per view and a cross-fade between them when there is more than one; a
tap on an open pin travels there and calls `onEnter(id)`, a tap on a closed one opens its card with the price and the
Open button (`onUnlock`, default: enter it; `onDenied` for a "no" sound). One screen (no page or panel scrolls; a pin
whose point is on the map shows with its head pulled 4 px inside the edge, never cut — off the map it hides; captions
never cover each other or a pin: each takes the first free place below, above, right or left of its head, in the order
selected › the player's site › open › next, and one with no room hides until its pin is selected — `layoutMapPins`),
every target ≥
`minTouchPx`, the words through `i18n` (`gp.sites.*`, 13 languages) or `texts`. Theme: `--gp-sites-bg`, `-ink`, `-muted`,
`-panel`, `-accent`, `-accent-ink`, `-open`, `-here`, `-locked`, `-font` on `#gp-sites`, or `screenTheme()` with every platform screen; its marks (the coin, the lock, zoom, close) are drawn, and `currency.icon` and a site's `icon` take a drawn icon (`@gp/core/icons`), an image URL or text. Call `host.screen('map')` when it opens
and declare it in `host.qa({ screens })`.

**One view (most games): a town with its shops.**

```ts
mountSitesMap(ui, sites, {
  views: [{
    id: 'town', aspect: 1.6,
    draw: (g, w, h, t, cam) => {
      g.fillStyle = '#3f7d4a'; g.fillRect(cam.visible.x, cam.visible.y, cam.visible.w, cam.visible.h); // past the edge
      drawTown(g, w, h, t);                           // the game's own streets, river and roofs (@gp/art helps)
    },
    pins: { bakery: { x: 0.18, y: 0.32 }, florist: { x: 0.42, y: 0.7 }, cinema: { x: 0.8, y: 0.4 } },
  }],
  items: { bakery: { name: host.t('site.bakery'), icon: '🥐' }, florist: { name: host.t('site.florist'), icon: '💐' },
    cinema: { name: host.t('site.cinema'), icon: bakedCinemaCanvas } },
  minTouchPx: host.minTouchPx, i18n: host.i18n,
  onEnter: (id) => showShop(id),
  onBack: showTitle,
});
```

**Two views the game draws: Idle Garage's Earth and its Solar System.** The garages on Earth sit at their cities
(lon/lat → x/y of an equirectangular map the game paints from its own coastline polygons); the space garages ride their
planets, so their pins are a function of the time.

```ts
const earth = (lon: number, lat: number) => ({ x: (lon + 180) / 360, y: (90 - lat) / 180 });
mountSitesMap(ui, sites, {
  views: [
    { id: 'earth', label: host.t('map.earth'), aspect: 2, maxZoom: 6, background: '#123a66',
      draw: (g, w, h, t) => drawEarth(g, w, h, t),                       // the sea, the graticule, the continents
      pins: Object.fromEntries(GARAGES.filter((s) => !s.space).map((s) => [s.id, earth(s.lon, s.lat)])) },
    { id: 'space', label: host.t('map.space'), icon: '🪐', maxZoom: 2, background: '#050816',
      draw: (g, w, h, t) => drawSolarSystem(g, w, h, t),                 // the Sun, the orbits, the planets at time t
      pins: (t) => Object.fromEntries(GARAGES.filter((s) => s.space).map((s) => [s.id, planetAt(s.space!, t)])) },
  ],
  items: Object.fromEntries(GARAGES.map((s) => [s.id, { name: host.t(`site.${s.id}`), badge: () => `🤖 ${robots(s.id)}` }])),
  minTouchPx: host.minTouchPx, i18n: host.i18n,
  onEnter: (id) => enterGarage(id),
  onView: () => sound.whoosh(),
});
```

The map returns `refresh()` (it also re-reads `Sites` four times a second), `setView(id)`, `focus(id)` (the view with
that pin, centred on it), `camera` (the pure `MapCamera`: `toScreen`, `toView`, `pan`, `zoomAt`, `center` — Node tests
it) and `destroy()`. Its browser test (`packages/core/test-browser/sites-map.test.ts`, `npm run test:browser`) plays it
at 360×800, 800×360 and 1280×720 under a game's hostile button CSS, with the kit-code QA's own one-screen checks
(`panelScrolls`, `tappables`, `textFit`).

### The balance model of an idle game: from the bot's campaign (`modelFromCampaign`)

An idle game's economy is many small purchases (levels, tools, robots) and stages measured in time, and tables written
by hand drift from the real rules at the first price change. Both idle games built the model from their own bot instead
(Craft Pickaxe's and Garage Evolution's `bot.ts`); `modelFromCampaign()` in `@gp/core/balance-model` is that recipe:

```ts
import { modelFromCampaign, type BalanceModel, type CampaignLog } from '@gp/core/balance-model';

/** The cheapest-first bot's campaign as the model needs it: each structure it cleared, each purchase */
function campaignLog(seed: number): CampaignLog {
  const c = campaign(seed, 'cheap');                     // the bot balance() already plays
  return {
    start: { power: dps(c.start) },                      // power in the anchor's unit: damage a second, income a minute
    stages: c.stages.map((s) => ({ minutes: s.min, reward: s.coins, power: s.dpsOnArrival })),
    buys: c.buys.map((b) => ({ min: b.min, cost: b.cost, gain: b.gain })),   // or powerAfter: the power right after it
  };
}

export function balanceModel(): BalanceModel {
  return modelFromCampaign([1, 2, 3].map(campaignLog), {
    win: (r) => Math.min(1, r),   // idle: a structure takes minutes ÷ r at power r × its difficulty
    lossReward: 0,
    farmBelow: 0.1,
    finish: 'stages',
    measure: 'income a minute',
    sessionMin: SESSION_MIN,
  });
}
```

- **The stages** are the stages the bot cleared, in order. Their minutes are noisy (a lucky TNT, a rare chest), so each is
  the **running mean of 5** around it (`smooth`), **rising at most ×1.3** from the stage before (`growthCap`; a boss keeps
  its own length), never under 0.2 min. The difficulty is the bot's power on arrival × 0.7 (`difficultyShare`: the bot
  arrived able to clear it), the reward what it earned there.
- **The purchases** are what the bot bought, in its order (each `requires` the one before): a quarter-minute's shopping
  is one item (`batchMin`), its cost the sum, its power the gains added — or, with `powerAfter`, the power path held at the
  best so far (a new place's fresh tools dip the income: the model's power never falls, as in Garage Evolution).
- **Several campaigns** (seeds): the stages are averaged one by one over the stages every campaign reached; the purchases
  come from the first. The other options are the model's own fields (`win`, `finish`, `sessionMin`; `news` on a stage or
  a purchase feeds the reward timeline).
- **Why:** the model is then the real economy, re-measured on every `gp balance`, so a patch can run it alone in
  milliseconds (`gp qa` in an update) and its first-session checks (the first reward, the session-end goal) read real
  minutes. Calibrate once at the launch: `gp qa` compares the model's meta with the bot's (within 25 %).
