# The live world: a shared clock, restocks, fair randomness, the daily table, share codes and rivals

What keeps players for weeks in the 2025–26 Roblox hits is a **clock** (a shop that restocks every 5 minutes, weather,
events at fixed times) × **variance** (eggs and rolls with rarity tiers, mutations that multiply a value) × **a
collection** × **an income that keeps going** × **a reset** ([research/roblox-2026-10.md](../research/roblox-2026-10.md) §0).
Most of it is single-player logic: a restock or a storm that is a function of the UTC clock and a seed is the same for
every web player at the same moment — no server, and true when the game says so. Board games bring the other half: a
different table every day for everyone, named score bands and a card to share
([research/board-games-2026-10.md](../research/board-games-2026-10.md) §4 #5).

These blocks are in `@gp/core` (and their own subpaths for Node tests and bots). All of them are pure, seeded and
serialisable: an injected clock (`now`), a seeded random source, a small plain-JSON field in the game's own save. The
collection index, daily quests, achievements and a lucky wheel are separate blocks.

| Block | Import | What it gives |
|---|---|---|
| `worldClock` | `@gp/core/clock` | time slots every N minutes (UTC), events on a schedule, festival hours, a weather sequence; `clockShift` for QA |
| `restockShop`, `mountRestockTimer` | `@gp/core/restock`, `@gp/core` | a stock that turns over every slot for everyone, rarity weights, a world pity, a rewarded "restock now"; the countdown pill |
| `LootTable` | `@gp/core/loot` | rarity rolls with the odds on screen, a pity, luck and a floor that only ever help |
| `variants` | `@gp/core/variants` | mutations under the world's conditions, combos, multipliers, the exact expected value |
| `dailyTable`, `shareText`, `drawShareCard` | `@gp/core/daily-table` | a setup a day for everyone, named score bands, the near-miss line, a share card |
| `shareCode` | `@gp/core/share` | a snapshot (a den, a build, a run) as a short, versioned, checksummed code |
| `rivals` | `@gp/core/rivals` | named NPC rivals with a seeded routine and scores, always labelled as characters |

`gp catalog blocks --genre <g>` lists which fit a genre; none is limited to one genre.

## 1. What is honest (the line we don't cross)

| Technique | Allowed | Rule |
|---|---|---|
| A shared world by the clock seed (restock, weather, festival) | yes: it is true | may say "the same for every player"; never a count of players in it |
| Named NPC rivals | yes: they are characters | drawn and named as characters (`rivals` refuses usernames), labelled "Rival" (`gp.rival`); no fake chat or friend requests |
| Share codes, visits, ghost races, raids on a copy | yes: real players, async | show where the code came from; the owner loses nothing; no free text in a code |
| A leaderboard of invented names presented as people | **no** | never |
| "12,483 players online", "Ana just found a Huge!" toasts | **no** | never |

A missed slot, restock, event or day takes nothing away (D56): the screen says what is coming ("New stock in 3:12",
"Festival in 2 h"), never what was missed. Never "come back in 5 minutes or lose it".

## 2. The world clock (`worldClock`)

```ts
import { clockShift, formatClock, worldClock } from '@gp/core';

const clock = worldClock({ salt: 'storm-geodes', every: '5m', offsetMs: import.meta.env.DEV ? clockShift(location.search) : 0 });
clock.slot();                       // { index, key: '2026-10-19#216', start, end, nextIn: 108, seed }
clock.rng('stall', clock.slot().index);   // a seeded stream for this slot, the same for everyone

const SKY = clock.weather({
  states: [{ id: 'clear', weight: 6, lasts: ['10m', '25m'] }, { id: 'rain', weight: 3, lasts: '8m' }, { id: 'storm', weight: 1, lasts: ['4m', '6m'] }],
});
SKY.state();                        // { id: 'rain', since, until, endsIn, next: { id: 'storm', at, startsIn } }
SKY.forecast(4);                    // the next four stretches: a forecast strip on the title
const FEST = clock.schedule([
  { id: 'aurora', every: '2h', offset: '45m', lasts: '10m' },              // 00:45, 02:45 … UTC
  { id: 'market', daily: '17:00', lasts: '1h' },
  { id: 'festival', weekly: 'SAT 18:00', lasts: '30m', data: { mutations: 2 } },
  { id: 'meteor', chance: 0.1, per: '30m', lasts: '5m' },                  // a seeded surprise, the same for everyone
]);
FEST.state();                       // { active: [...], upcoming: [{ id, start, startsIn, data }, …] } soonest first
formatClock(FEST.next('festival')!.startsIn);   // '26:14:05' → "Festival in 26:14:05" on the title
```

- **Durations** are seconds or text: `'90s'`, `'5m'`, `'2h'`, `'1d'`, `'1w'`, `'1h30m'`. A slot is at least 1 minute.
- **Everything is UTC**: two players anywhere see the same slot, weather and event at the same moment. Show event times in
  the player's own time (`new Date(start).toLocaleTimeString()`), and the countdown with `formatClock`.
- **Weather** is drawn per cycle (a UTC day by default) from the cycle's seed: whole-minute stretches, never the same
  state twice in a row (`repeat: true` allows it), merged across the cycle's edge. `shares()` says how much of the time
  each state holds ("storms ≈ 4 % of the time").
- **QA and dev time travel:** `?clock=+300` (5 minutes ahead), `?clock=-60`, `?clock=+2h`, or `?clock=2026-10-24T18:05Z`
  → `clockShift(location.search)` → `offsetMs`. Only in dev builds: a player's URL never moves the shared world. `gp qa`
  and `gp video` run the page on a virtual clock; tests and bots pass `now`.
- **Natural breaks:** a restock or the end of a weather front is a moment between purchases — `host.adBreak()` belongs on
  the way back into play, never on the shop button.

## 3. A restock shop (`restockShop`, `mountRestockTimer`)

```ts
import { mountRestockTimer, restockShop, rewardedButton } from '@gp/core';

const STALL = restockShop(save, {
  clock, slots: 4,                                      // 4 offers per restock, every clock slot (or `every: '3m'`)
  pool: [{ id: 'quartz', weight: 40, price: 10, rarity: 'common', stock: 5 }, { id: 'opal', weight: 6, price: 200, rarity: 'rare' }, …],
  rarities: ['common', 'rare', 'epic'],
  pity: { rarity: 'rare', within: 6 },                  // every block of 6 restocks holds a rare or better — for everyone
  cooldown: '15m',                                      // the personal restock at most once per 15 min
  persist: () => host.save(save),
});
const s = STALL.state();   // { slot, items: [{ id, price, rarity, stock, left, pity }], nextIn, personal, restock: { ready, in }, pityIn }
STALL.buy('quartz', (price) => (save.coins >= price ? ((save.coins -= price), true) : false));
const timer = mountRestockTimer(panel, STALL, { host, onRestock: () => drawStall() });   // "New stock in 3:12"
const now = s.restock.ready
  ? rewardedButton({ host, placement: 'restock', label: host.t('gp.restock.now'), onReward: () => { STALL.restockNow(); drawStall(); timer.update(); } })
  : null;
```

- **The stock** of a slot comes from the slot's seed: every player in that slot sees the same offers. The save keeps only
  this slot's purchases; when the slot passes they are gone and so is what wasn't bought — nothing is taken.
- **The pity is the world's:** the slots are cut into aligned blocks of `within`; a block whose stocks hold no item of the
  rarity gets one at a seeded slot (`pity: true` on that offer). So "a rare at least every 6 restocks" is true for everyone.
- **Restock now** is the player's own stock for the rest of the slot (`state().personal`: don't call it "the same for
  everyone"; the timer says "Your restock · shared stock in 3:12"). Declare it in the money design: `kind: restock`
  (`gp forecast` has a take rate for it, `rewarded.take.restock`).
- **A clock set back** never offers a slot again (the stock stays the last one seen) and never gives a free restock.
- **The timer** is a small pill (`data-gp="restock-timer"`), `gp.restock.*` in 13 languages, themeable with
  `--gp-restock-bg/-ink/-accent/-radius/-font` — each falls back to `--gp-theme-panel/-ink/-accent/-radius/-font`, then
  to the platform's defaults. `destroy()` when the panel closes.

## 4. Fair randomness (`LootTable`)

```ts
import { LootTable } from '@gp/core';

const EGGS = new LootTable(save, 'eggs', {
  tiers: [{ id: 'common', weight: 60 }, { id: 'rare', weight: 30 }, { id: 'epic', weight: 9 }, { id: 'mythic', weight: 1 }],
  items: SPECIES,                                       // [{ id: 'moss-fox', tier: 'common' }, …] (optional)
  sources: { 'storm-egg': { weights: { rare: 70, epic: 25, mythic: 5 } } },
  pity: { tier: 'epic', within: 40 },
  rng: host.rng, persist: () => host.save(save),
});
card.oddsLine.textContent = EGGS.oddsText('meadow-egg');   // "Common 60% · Rare 30% · Epic 9% · Mythic 1 in 100" — before the roll
const r = EGGS.roll('meadow-egg');                         // { id, tier, chance, pity, pityLeft, first }
EGGS.roll('meadow-egg', { floor: 'rare' });                // the rewarded "lucky incubator": a floor on a roll the player makes anyway
EGGS.expected('meadow-egg');                               // the long-run shares with the pity, for the balance model
```

**The rules** (PEGI from June 2026: paid random items 16 by default, simulated gambling 18; CrazyGames takes PEGI 12):

1. **The odds are on screen before every roll.** `odds()` returns the very numbers `roll()` uses (a due pity included:
   the panel then says "Epic or better: guaranteed"). `formatOdds` writes "30%", "2.5%", "1 in 250".
2. **Nothing random is sold** — not for real money, not for a currency sold for real money. Sell a known thing.
3. **A rewarded ad gives a guaranteed thing:** a floor, a second item, ×2, a reroll of run choices (picked, not won) —
   never the roll itself, never "spin the wheel".
4. **No casino look:** no slot reels, no roulette of prizes, no flashing jackpot.
5. Luck (`luck: 2`) only multiplies the better tiers' weights; a floor only removes the worse tiers. Neither can lower a chance of a better tier.

**In game.yaml**, `money.loot` declares each roll — its cost and where its odds are shown — and `gp validate` checks it:

```yaml
money:
  loot:
    - { id: meadow-egg, cost: earned, odds: "the egg card lists each tier's chance" }
    - { id: daily-egg, cost: free, odds: "the same card" }
  rewarded:
    - { placement: lucky-egg, kind: boost, gives: "your next egg is rare or better" }
```

| Code | When |
|---|---|
| `E_PAID_RANDOM` (error) | a roll with `cost: purchase` or `cost: bought` |
| `W_REWARDED_RANDOM` | a roll with `cost: ad`, or a rewarded offer whose `gives` promises a spin, a wheel, a random, mystery or surprise prize, a loot box |
| `W_LOOT_ODDS` | a `money.loot` entry without `odds`, or a code game that imports `LootTable` and never calls `odds()`, `oddsText()` or `formatOdds()` |

Whether the odds panel is really on screen before the roll is checked by the reviewer (`gp review` lists it).

## 5. Variants: mutations, combos, multipliers (`variants`)

```ts
import { variants } from '@gp/core';

const MUT = variants<{ weather: string }>({
  list: [
    { id: 'wet', mult: 2, chance: 0.1, when: (c) => c.weather === 'rain' },
    { id: 'frozen', mult: 3, chance: 0.05, when: (c) => c.weather === 'snow' },
    { id: 'shocked', mult: 50, chance: 0.01, when: (c) => c.weather === 'storm' },
    { id: 'burning', mult: 4, chance: 0.2, when: (c) => c.weather === 'heat', excludes: ['frozen'] },
    { id: 'frost-shock', mult: 120, combo: ['frozen', 'shocked'] },
  ],
  stack: 'multiply', max: 3,
});
const crystal = MUT.apply({ base: 'crystal', variants: [] }, { weather: SKY.state().id }, host.rng);
MUT.value(crystal, 40);                         // 40 × its multiplier
MUT.label(crystal, (id) => host.t(`mut.${id}`), host.t('crystal'));   // "Frozen Shocked Crystal"
MUT.odds({ weather: 'storm' });                 // what can land now: show it with the weather ("Storm: Shocked 1 in 100")
MUT.expected({ weather: 'storm' });             // the exact mean multiplier of one roll: the balance model's harvest value
```

An item is plain data (`{ base, variants }`). Exclusions resolve first (the earlier variant in the list wins), then
combos (the biggest recipe first), then the cap keeps the most valuable. `stack: 'add'` sums the bonuses, `'highest'`
keeps the best. `chance` may be a function of the world ("Mutation Surge: +15 %"), `luck` multiplies the chances.

## 6. The daily table (`dailyTable`)

```ts
import { dailyTable, drawShareCard, seededRng, shareText } from '@gp/core';

const TABLE = dailyTable(save, {
  salt: 'nine-plots',
  modules: { from: ['wind', 'bees', 'frost', 'market', 'moles'], pick: 2 },     // today's two modules
  setup: (rng) => ({ start: rng.int(9) }),                                     // the rest of the day's setup
  bands: [{ id: 'bronze', at: 100 }, { id: 'silver', at: 250 }, { id: 'gold', at: 400 }, { id: 'legend', at: 600 }],
  persist: () => host.save(save),
});
const day = TABLE.today();          // { key: '2026-10-19', seed: { code, seed }, modules, setup }
const run = seededRng(day.seed.seed);
// … the run …
const r = TABLE.record(score);      // { best, newBest, first, band, next, need, share, near }
TABLE.nearLine(score, host.t);      // "12 points from Gold" when within a quarter of the step (null otherwise)
const card = TABLE.card(null, { title: host.t('title'), name: (b) => host.t(`band.${b}`), t: host.t });
navigator.clipboard.writeText(shareText(card));   // "Nine Plots · 2026-10-19 / Silver · 388 / ▰▰▱▱ / 12 points from Gold / #K7M2-QX9P"
drawShareCard(document.createElement('canvas'), card, { accent: '#ffd166' });   // 1200×630: canvas.toBlob() to save
```

- The day turns over at 00:00 UTC (one table for everyone; `local: true` for the player's midnight). The seed is
  `dailyRunSeed(salt, day)`; the modules and the setup have streams of their own, so adding a module to the list doesn't
  change the setup.
- `better: 'low'` for a time or a move count (bands then fall). The near-miss line is `gp.daily.nearPoints` (or
  `gp.daily.near` with your `unit`) in 13 languages.
- The log is a calendar of days played (`recordDaily`): a missed day costs nothing. A custom-seed run is not the daily:
  don't `record()` it.

## 7. Share codes and rivals (`shareCode`, `rivals`)

```ts
import { rivals, shareCode } from '@gp/core';

const DEN = shareCode({
  salt: 'raccoon-rummage', version: 2,
  fields: { tree: { type: 'int', min: 0, max: 15 }, shelf: { type: 'list', max: 8, of: { type: 'enum', values: TREASURES } }, lock: { type: 'bool' } },
  older: { 1: { tree: { type: 'int', min: 0, max: 7 }, shelf: { type: 'list', max: 6, of: { type: 'enum', values: TREASURES_V1 } } } },
  upgrade: (old) => ({ lock: false, ...old }),
});
const code = DEN.encode({ tree: 5, shelf: ['bottlecap', 'spoon'], lock: true });   // e.g. 'R2K8-M1QA-7C'
const r = DEN.decode(typed);       // { ok: true, value, version } | { ok: false, reason: 'format' | 'checksum' | 'version' }
DEN.url(value, location.href);     // …#share=R2K8M1QA7C — DEN.fromUrl(location.href) on boot opens the visit

const RIVALS = rivals({
  salt: 'raccoon-rummage',
  cast: [{ id: 'maple', name: 'Maple', skill: 0.7 }, { id: 'bram', name: 'Old Bram', skill: 0.45 }],
  behave: (r, rng) => ({ wakes: 4 + rng.int(4), traps: rng() < r.skill }),     // today's routine
});
RIVALS.get('maple').behaviour;                     // the same for every player today (or per clock slot: `clock`)
RIVALS.board({ score: 412, name: host.t('you') }, [200, 600]);   // best first; rivals carry npc: true — label them host.t('gp.rival')
```

- **A code** is bit-packed by the layout (numbers, choices from the game's lists, yes/no — never free text), in the run
  seed's alphabet (no I, L, O, U; typing is forgiving), with the version in front and a checksum salted with the game's id
  behind: a typo or another game's code is refused, never misread. The order of the keys is the layout: add fields only in
  a new version, and keep the old layout in `older`.
- **A code is not a secret** (anyone can make one by hand): a visit, a ghost race or a raid on a copy never pays more than
  playing would, and takes nothing from the code's owner.
- **Rivals** are characters: `rivals` refuses a name with digits, underscores or @, or "Player"/"Guest"/"Admin"
  (`rivalNameProblem`). Their scores are seeded per day (or per clock slot) and spread around their skill.

## 8. Hybrids: an idle layer on another genre (`money.hybrid`)

The Roblox hits are hybrids: a tycoon base under an action raid, a rebirth in a speed runner, a camp that earns while a
run goes on. `offlineEarnings`, `Prestige`, `Sites` and `mountSitesMap` are idle blocks (`W_GENRE_BLOCK` warns when
another genre imports them); a game that has such a layer declares it:

```yaml
money:
  genre: action          # the benchmarks, the must-haves and the forecast stay action's
  hybrid: [idle]         # a den that earns while away and a rebirth: the idle blocks fit
```

`hybrid` takes genres or sub-genres (`tycoon` is idle), up to three; an unknown one is `E_MONEY`, the game's own genre
`W_MONEY_HYBRID`. It lets the layer's blocks in — nothing else changes.

## 9. What is checked, and what isn't

- **Unit tests** (`packages/core/test/{clock,restock,loot,variants,daily-table,share,rivals}.test.ts`): the same seed and
  slot give the same world on every machine, the pity holds, odds match rolls, codes round-trip and refuse typos, a clock
  set back gives nothing twice. `packages/spec/test/live-world.test.ts`: the validator codes, the `restock` kind, hybrids.
- **`gp validate`:** `E_PAID_RANDOM`, `W_REWARDED_RANDOM`, `W_LOOT_ODDS`, `W_GENRE_BLOCK` with `money.hybrid`.
- **`gp review`** asks the reviewer to look at the odds on screen, the rewarded offers, the shared-world claims and rivals.
- **Not checked by a tool:** that the odds panel is visible before the roll, that a "same for every player" line sits only
  on shared things, that a rival is drawn as a character. The browser QA can't see that a code typed on another machine
  opens the same visit — the unit tests can.
