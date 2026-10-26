# The first minute: land in play, keep playing, come back

CrazyGames decides Full Launch on three Basic Launch numbers per device class: **gameplay conversion** (the share of
players who play at least one minute after starting the game), **average playtime** and **D1 retention**. Outside our
one .io game, conversion scored 1/5 in every per-device score we have, and mobile converted about half as well as desktop
([the research](../research/feedback-and-metrics-2026-10.md) §1–4). The portal measures without our SDK, from its own
Play Now: our loading, title, Play click, story and tutorial all fall inside that minute.

CrazyGames' gameplay requirements, verbatim: *"Games should land new users in gameplay immediately. If this is not
feasible given the game specifics, a maximum of 1 click is allowed."*
([requirements](https://docs.crazygames.com/requirements/gameplay/))

This page is what the platform gives a `kit: code` game for that, and what `gp qa` checks.

| What | Block | Lever (research §4) |
|---|---|---|
| A new player lands in a safe first run, no title in the way | `host.firstVisit` | C1 |
| The funnel of the first minute, on the event bus | `host.screen()`, `host.fail()`, events `'funnel'` | C2 |
| One short hint at a time, gone when the player does it | `hints()` | C4 |
| A ghost hand that shows the gesture instead of a sentence | `coachHand()`, `hints().show(…, { hand })` | C4 |
| What a thing does, without a rules page: hover it, or hold it on a phone | `inspect()` | C4 |
| The results screen launches the next run and names the next goal | `mountResults()`, `goalFromSnapshot()` | T1, R2 |
| A run that survives a reload | `host.saveRun / loadRun / clearRun` | R4, T5 |
| "Welcome back" on the first visit of a new day | `recordVisit()`, `welcomeBack()` | R3 |
| A daily reward week and a daily order: a reason for tomorrow | `dailyStreak()`, `mountStreakCard()`, `dailyOrder()` | R3 |
| A season pass and a weekly event: a reason for next week (action, roguelites, idle) | `seasonPass()`, `mountSeasonTrack()`, `weeklyEvent()` | R3 |
| Daily quests and achievements: goals for today and for good | `dailyQuests()`, `achievements()`, `mountGoals()`, `goalBanners()` | R2, R3 |
| Playtime gifts, a lucky wheel, the day's offers, a timed boost | `playtimeGifts()`, `luckyWheel()`, `dailyOffers()`, `timedBoost()`, `mountRewardsHub()` | R3 |
| The title's cards one at a time (welcome, the week, the season, story, goals) | `cards` | C3 |
| What an idle game earned while the player was away (idle games) | `offlineEarnings()` on the welcome-back card, ×2 with `rewardedButton()` | R3 |
| The game doesn't wait for a slow portal SDK | the player's boot (`deferPortal`) | C7 |
| The first minute as gates on crazygames | `gp qa` → first minute | C3 |

## 1. Land in play (`host.firstVisit`)

`host.firstVisit` is `true` when there was no save when the game started: a new player. Boot them straight into a
first run, and show the title after it (from the results' Menu), on pause, or as an overlay that fades on the first input:

```ts
const save = host.load(SAVE);
// … screens, loop …
if (host.firstVisit) play({ lesson: true });   // no title, no Play gate: 0 clicks from the portal's Play Now
else showTitle();
```

- **The first run is a lesson run, and it can't be lost in its first seconds**: the first threat sleeps (Germ Dodge's
  germs fly past for 14 s; Spin Brawl's spawn shield; Hang the Moon's two-Moon night 1). `gp qa` fails a crazygames game
  whose new player, touching nothing, loses within 12 s.
- **No reading before doing**: no prologue, no modal, no controls card before the first action. A story dialog over the
  run's first frame counts as a click. Show the rule in play with one hint (§3).
- **Don't save at the start of the first run**: the first save comes when the run ends (or the first thing is learned).
  A reload in the middle of the lesson is still a first visit.
- In dev and E2E builds `?visit=first` / `?visit=returning` play either (`gp dev` with an old save: add `?visit=first`).
  `gp qa` plays a returning player everywhere (title → Play → results) except its first-minute section.

The host holds the portal's `gameplayStart` until loading is done, so a run started inside `start()` still reports
`init → loadingStart → loadingStop → gameplayStart`.

## 2. The funnel (`'funnel'` events)

The host reports each step once a session on its event bus (`host.events.on(e => e.type === 'funnel')`), with `sec`
since the page opened: `boot` (with `firstVisit`), `loaded`, `title`, `firstInput`, `gameplayStart`, `play15`,
`play30`, `play60` (seconds of gameplay: menus and pauses don't count), `firstFail`, `firstResults`, and `exit` on
`pagehide` with the last screen, the gameplay seconds and the last step reached. Two calls feed it:

| `host.` | When |
|---|---|
| `screen(name)` | every screen the game shows: `'title'`, `'shop'`, `'paused'`, `'map'` (mountResults says `'results'`, welcomeBack `'welcome'`) |
| `fail(data?)` | the moment the player fails (dies, loses a level), before any Continue offer. `roundEnd({ lost: true })` counts too |
| `playedSec` | seconds of gameplay this session |

`gp qa` writes the funnel of a fresh first visit into `qa/first-minute.json` (`funnel`).

**Where it goes.** The events are on the bus for QA and for a game's own analytics. Neither portal takes a game's own
events today: CrazyGames measures conversion without the SDK, and Playgama Bridge has no custom-event API — its
`platform.sendMessage` takes lifecycle messages (`game_ready`, `gameplay_started` / `gameplay_stopped`, `level_*`,
`player_got_achievement`), and its telemetry derives play time (the `gameplay_30s` / `gameplay_60s` seen on Candle
Crypt's draft) from the `gameplay_started` / `gameplay_stopped` the host already sends. `Portal.funnel` is the hook for a
portal that gets such an API. The host's `gameplayStart`/`Stop` are what that telemetry reads, so keep them right
(they are: `host.gameplay()`).

### Measuring a funnel before the one-shot Basic Launch (the owner's decision)

A stopped Basic Launch is final, so the first real numbers should come from somewhere else. Playgama's sandbox can
send paid traffic to a build and its telemetry shows play time from the gameplay messages. Nothing in the platform does
this automatically, and no agent may start it: **publishing a sandbox makes the game public by link, and
`start_sandbox_traffic` spends money and cannot be undone**. When the owner decides to:

1. `gp build <id> --target playgama`, then `gp playgama-check <id>` (all green), then upload the archive in the Playgama
   console (or with the console tools) and wait for its state to be PASSED.
2. The owner publishes the sandbox and chooses the traffic budget (a referral or share bonus first, if one is available).
3. After the traffic has run, read the game's telemetry (play time, sessions, the share past 30 s and 60 s) and compare
   it with `qa/first-minute.json`. Fix the first minute, rebuild with a new version, and measure again before the
   CrazyGames submission.

## 3. One hint at a time (`hints()`)

```ts
const tips = hints({ seen: save.hints, onSeen: () => host.save(save) });   // save.hints: string[]
tips.show('move', host.t('tipMove'), { after: 1500 });   // only if the player hasn't moved within 1.5 s
// … where the player moves:
tips.done('move');                                        // gone, never shown again (saved)
```

- One hint on screen; the others wait in order until it is done (`queue: false`: the latest one replaces it).
- **Never cut short.** A hint stays on screen at least its reading time before another takes its place —
  `readingSec(text)` from `@gp/core/reading`: 2 s to notice + 50 ms a character (`minSec` in `show()` for your own);
  time behind a modal doesn't count. Only the player doing it (`done()`) takes it away sooner: they know it now.
- **Where:** `position: 'bottom'` (default), `'top'` or `'center'`. A card or board game keeps its main object clear:
  `hints({ top: 72 })` (px, or any CSS length: `'18%'`, `'calc(env(safe-area-inset-top) + 64px)'`) puts it that far
  from the top, or set `--gp-hints-top` in the game's CSS (`:root { --gp-hints-top: 12vh }`, a media query for
  landscape): it moves `'top'` and `'center'` hints.
- **≤ 6 words** (`HINT_MAX_WORDS`; a dev warning past that). Show the rule, don't write it: a ghost hand or a glow
  beside it is better than a sentence.
- Never over a modal (a dialogue, the language sheet, a shop, anything `aria-modal`): it waits. `isModal` for your own.
- Learned once (`once: true`): the ids go into the list you pass and you save it. `clear()` on a screen change.
- No pointer events, no animation frames (a still screen stays still), `role=status` for screen readers. Theme it with
  `screenTheme()` (its `bg`, `ink`, `font`: every platform screen at once — [code-games.md](code-games.md#platform-screens-in-the-games-look-screentheme-drawn-icons-game-type)),
  or `--gp-hint-bg`, `--gp-hint-ink`, `--gp-hint-radius`, `--gp-hint-font` on `#gp-hint`.

### 3.1 The coach's hand (`coachHand`, `hints().show(…, { hand })`)

"Show the rule, don't write it": a ghost hand that taps, swipes, drags or presses and holds — at a point, or from one
point (or element) to another. Idle Garage Evolution drew one on its canvas (scrub, tap, hold, pull), Craft Pickaxe
another for its first merge; now it is one block, a DOM overlay over any engine.

```ts
tips.show('merge', host.t('hint.merge'), { hand: { gesture: 'drag', from: () => cellCenter(a), to: () => cellCenter(b) } });
// the hand shows while its hint is on screen, hides behind a modal, goes with tips.done('merge')

const hand = coachHand({ gesture: 'tap', at: document.querySelector('[data-gp=play]')! });   // standalone
hand.destroy();
```

- Points are viewport CSS px (`{ x, y }`: clientX/clientY), an element (its centre) or a function — read again on every
  loop, so the hand follows a layout that moves. A point not on the page yet waits.
- `'tap'` presses with a ring, `'hold'` stays down while the ring grows, `'swipe'` is quick and lifts, `'drag'` presses,
  carries and lets go; a dashed path and an arrowhead join the two points.
- Drawn SVG (`--gp-coach-fill`, `--gp-coach-ink`, `--gp-coach-ring` on `#gp-coach`, the ring falling back to
  `--gp-theme-accent`), or the game's own hand: `sprite` (an image URL or an element) with its fingertip at `hotspot`.
- No pointer events, `aria-hidden`; with reduced motion asked for, a still hand at the start and the arrow to the end.
  One hand at a time (a second replaces the first).

### 3.2 Inspect plates (`inspect`)

What a tile, an enemy or a rule does, without a rules page: a mouse rests on it, a finger holds it for 380 ms, and a
plate opens beside it (above the finger, where the finger doesn't cover it). Velvet Domino Rogue wrote it after its
reviewers couldn't tell what a bone did on a phone.

```ts
const plates = inspect(canvas, (x, y) => {            // x, y: CSS px inside the target
  const t = tileAt(x, y);
  return t ? { title: host.t(`tile.${t.id}`), text: host.t(`tile.${t.id}.text`), kind: t.rarity } : null;
}, { host, tips, onTap: (x, y) => pick(x, y) });
```

- **The hold never picks or presses.** On a finger, a short tap goes to `onTap` (and to the game's own listeners); a
  hold's lift is kept from the game (its pointerup and click stop in the capture phase). A game that acts on
  pointerdown should act in `onTap` instead, or wait while `plates.pressing`. A finger that moves more than 14 px is a
  drag: no plate.
- **The plate stays on the screen**: kept inside the viewport, beside the point; it closes when the finger lifts or the
  mouse moves off the thing. A short vibration says it opened (`vibrate: false`, or its ms).
- **The first time** a touch player taps a thing that has a plate, `tips` shows "Hold to read" (`gp.inspect.hold`, 13
  languages), once; holding learns it.
- Themeable with `--gp-plate-bg`, `-ink`, `-muted`, `-accent`, `-radius`, `-font` on `#gp-plate` (the shared
  `--gp-theme-*` first); `kind` is `data-kind` on the plate.

## 4. The results screen launches the next run (`mountResults()`)

Every results screen is an exit (Hang the Moon had 14 in a 15-minute session). The games whose players stayed put the
next run one big tap away and ended the session on an unfinished goal:

```ts
mountResults(ui, {
  host,
  title: host.t(newBest ? 'gp.newBest' : 'gameOver'),
  lines: [host.t('score', { n: run.score })],
  primary: 'again',                 // or 'next' for levels, depths, waves (data-gp="again" / "next")
  onPrimary: play,                  // after host.adBreak(): the natural break, within the channel's limits
  onMenu: showTitle,                // small, plain, no ad (a navigational button)
  goal: { label: host.t('target.star.name'), progress: save.coins / 50 },   // "Star · 82 %"
  extra: [doubleCoinsButton],       // a rewardedButton(), a 1-of-3 pick
  autoContinueSec: 4,               // level games: on by itself unless the player taps; never an ad on a timer
});
```

- The goal: what the player is on the way to and how far (floored: "100 %" only when done). From the balance model's
  session-end walk: `goalFromSnapshot(snapshot, (id) => host.t(\`item.${id}.name\`))`.
- The platform's words come in 13 languages (`gp.playAgain`, `gp.next`, `gp.menu`, `gp.results.goal`,
  `gp.results.auto`).
- **Theming.** One call for every platform screen: `screenTheme({ bg, panel, ink, muted, accent, accentInk, radius,
  font, display })` from `@gp/core` ([code-games.md](code-games.md#platform-screens-in-the-games-look-screentheme-drawn-icons-game-type));
  the results fall back to it (`display`: the title and the big button). For this screen alone, CSS variables on
  `#gp-results` win over the theme (set them in the game's CSS, e.g. `#gp-results { --gp-results-accent: #7ee0c0 }`):

  | Variable | What | Theme field | Default |
  |---|---|---|---|
  | `--gp-results-bg` | the panel | `bg` | `rgba(16, 26, 38, 0.92)` |
  | `--gp-results-ink` | the text | `ink` | `#f2f7ff` |
  | `--gp-results-muted` | the goal's caption and detail, Menu | `muted` | `#a9b9cc` |
  | `--gp-results-accent` | the big button, the goal's bar and percentage | `accent` | `#ffd166` |
  | `--gp-results-accent-ink` | the big button's words | `accentInk` | `#18222e` |
  | `--gp-results-bar` | the goal bar's track | `track` | `rgba(255, 255, 255, 0.16)` |
  | `--gp-results-radius` | the panel's corners | `radius` | `20px` |
  | `--gp-results-font` | the font family | `font` | the platform's `FONT_FALLBACK` |

  Beyond the variables, plain rules win: the platform's style goes first in `<head>`, each rule an id and at most a
  class (`#gp-results .gp-primary`), so the game's `#gp-results h2 { … }`, `#gp-results .gp-primary { … }` or
  `#gp-results { padding: … }` win without `#ui #gp-results` — while a generic `#ui button { … }` still doesn't reach
  the buttons. The parts: `h2`, `.gp-lines`, `.gp-goal` (`.gp-goal-k`, `-l`, `-p`, `-d`, `.gp-bar`), `.gp-primary`,
  `.gp-menu`.
- **It centres itself** in the root (absolutely, `inset: 0; margin: auto`: in the root's box when the root is
  positioned, as a `position: fixed` `#ui` is, else in the window), whatever the root's own layout.
  `#gp-results { position: static; margin: 0 }` puts it back into the root's flow.
- `gp qa` checks every results screen it reaches: the biggest button (rewarded offers aside) goes on into the next run
  (data-gp `again` / `next` / `play`, or its words), and says so when Menu is as big.

## 5. A run that survives a reload (`saveRun`)

```ts
host.saveRun({ room, hp, seed });          // on every important change: a move, a room cleared — never every frame
const run = host.loadRun(RUN_DEFAULTS, { maxAgeHours: 24 });   // null: none, cleared, too old
host.clearRun();                           // the run is over: results, give up
```

It lives next to the game's save (`<saveKey>.run`), in the host's storage — CrazyGames' and Playgama's cloud saves keep
it (the boot passes the key to Playgama's up-front load). It is not a save: a player with only a saved run is still on
a first visit. Germ Dodge resumes it on its pause screen, one tap from going on.

## 6. Welcome back (`recordVisit`, `welcomeBack()`)

None of our launched games said "tomorrow", and D1 was 1–4 %. On the first visit of a new day, open with a short card:

```ts
const visit = recordVisit(save.visit);     // @gp/core/daily: { log, firstVisit, newDay, daysAway } — the player's local day
save.visit = visit.log;
host.save(save);
showTitle();
if (visit.newDay) welcomeBack({ host, daily: { done: dailyDone(save.daily, dayKey()) }, goal: nextGoal(),
  resume: !!host.loadRun(RUN), onContinue: () => (host.loadRun(RUN) ? resumeRun() : play()) });
```

Its big button goes straight into play (still one click), × or a tap outside closes it. Themeable with `screenTheme()`
or `--gp-welcome-*` on `#gp-welcome`; a done daily ends in a drawn check, the close × is a drawn icon. Never a loss-framed streak (D56): what is waiting, not what was missed. `extra`
takes more buttons above the big one — an idle game's offline earnings ×2 (`offlineEarnings`, a `rewardedButton`:
[upgrades.md → Idle games](upgrades.md#7-idle-games)), with `gp.offline.earned` as a line.

## 7. A daily reward week and a daily order (`dailyStreak`, `dailyOrder`)

For any genre. Both keep a small field in the game's save, count the player's local days, and take a clock (`now`) in
tests and bots (`@gp/core/streak` in Node).

```ts
import { dailyOrder, dailyStreak, daySeed, mountStreakCard } from '@gp/core';

const streak = dailyStreak(save, { days: 7, reward: (day) => (day === 7 ? 1500 : 50 * day), persist: () => host.save(save) });
// when a run ends: streak.played() — the card never shows before the player's first play
if (streak.state().show) mountStreakCard(ui, streak, { host, icon: '🪙', onClaim: (n) => { save.coins += n; host.save(save); } });

const order = dailyOrder(save, {
  need: [{ id: 'sell', amount: 20 }, { id: 'paint', amount: 8 }, { id: 'tune', amount: 5 }],   // one a day, by the seed
  reward: (goal) => goal.amount * 15,
  from: 'secondVisit',                                       // a reason to come back: not on the first day
  seed: (key) => daySeed(key, 'idle-garage'),
  persist: () => host.save(save),
});
order.add('sell');                                           // where the player sells a car: true when it is done
const o = order.state();                                     // { available, goal, progress, share, done, claimed, reward }
if (o.done && !o.claimed) save.coins += order.claim() ?? 0;
```

- **The week:** the visit is recorded when `dailyStreak` is created; a new player's first day is day 1. One `claim()` a
  day pays `reward(day)`; after day `days` a new week starts. `state()` gives the day, the week's dots (`claimed`,
  `today`, `later`), today's and tomorrow's reward, and `show` (played once, and today's reward waiting). A visit
  without a claim keeps the week: the day's reward waits.
- **A missed day** (a calendar day with no visit) costs nothing: the week waits where it was (`miss: 'pause'`, the default, D56) —
  or, by a game's own choice, starts again at day 1 (`miss: 'restart'`). Either way **nothing claimed is taken back**, and the card
  says what is waiting, never what was missed ("you lost your streak" is a dark pattern: game-design.md, D56). A clock
  set back never pays twice.
- **The card** (`mountStreakCard`): a modal with the week's dots, a big Claim button, tomorrow's reward (the reason to
  return) and ×; one screen at every size (seven dots in a row on a 360 px phone, every language), the words
  `gp.streak.*` in 13 languages (`texts` to override), `host.screen('streak')`. It returns null — opens nothing — before
  the first play and once claimed today (`force: true` shows the week from a menu). Its marks are drawn
  (`@gp/core/icons`): the currency before every amount (default a gold coin; `icon:` takes your drawn icon, an image URL,
  text, or `''` for none), the check of a claimed day, ×. Themeable with `screenTheme()` or `--gp-streak-*` on
  `#gp-streak`; `data-gp="streak"`, `"streak-claim"`, `"streak-close"`.
- **The order:** the day's goal is `need[seed(day) % need.length]` — with `local: false` the same for every player on
  the same UTC day. Progress on another goal doesn't count; done and claimed once; a new day brings a new order (an
  unclaimed one is simply gone: it was never paid). Show it on the title or the welcome-back card (`lines`, `goal`).
- **Where it opens:** never between the player and play — the portal's one click into gameplay holds. On the title
  of a returning player (instead of the welcome-back card, or after it is closed: never two modals at once — the
  queue `cards` does it, §7.4) or after a run's results; `show` is false on a new player's first visit until `played()`.

### 7.1 A season pass and a weekly event (`seasonPass`, `mountSeasonTrack`, `weeklyEvent`)

The game-as-a-service layer between runs that Frankengun wrote by hand (a 30-tier season with paints and kill effects
every 3 tiers, a weekly event with its own rule): for action games, roguelites and idle games (`gp catalog blocks
--genre action`). Pure logic over a field of the save with an injected clock (`@gp/core/season` in Node), the screen
apart.

```ts
import { mountSeasonTrack, seasonPass, weeklyEvent } from '@gp/core';
import { iconImg } from '@gp/art/dom';

const pass = seasonPass(save, {
  seasons: [                                              // a new season is a new entry; dates are UTC days, both included
    { id: 's1', from: '2026-10-01', to: '2027-01-31', tiers: 30, xp: 200 },
    { id: 's2', from: '2027-02-01', to: '2027-05-31', tiers: 30, xp: (t) => 150 + 10 * t },
  ],
  reward: (t) => (t % 3 === 0 ? { kind: 'paint', id: PAINTS[t / 3 - 1] } : { kind: 'coins', n: 30 + 5 * t }),
  rewardEvery: 3,                                         // every 3rd tier is a big one: marked on the track
  persist: () => host.save(save),
});
pass.add(xpOfRun);                                        // a run's end: XP in → { reached: [4, 5], paid: [], tier }
mountSeasonTrack(ui, pass, {
  host,
  name: (s) => host.t(`season.${s.id}`),
  view: (r) => (r.kind === 'coins' ? { icon: iconImg(drawCoin, 28, { key: 'coin' }), label: `${r.n}` } : { icon: paintIcon(r.id), label: host.t(`paint.${r.id}`) }),
  onClaim: (claims) => { for (const c of claims) pay(c.reward); host.save(save); },
});

const week = weeklyEvent(save, { rules: ['swarm', 'glass-cannon', 'giants'], goal: 8, reward: 200, salt: 'my-game', persist: () => host.save(save) });
const { rule, seed, daysLeft } = week.state();            // this week's rule for every player (Monday to Sunday, UTC)
if (week.record(wavesCleared)) toast(host.t('weeklyPrize')); // true once a week: the goal first reached
save.coins += week.claim() ?? 0;
```

- **The season:** the one running today; after its last day its track stays open until the next starts (`phase:
  'ended'`), before the first one it is `'upcoming'`. `state()` gives the tier, the XP into the next one and what it
  takes, the days left, the next season, and the track: per tier its reward, `major` (every `rewardEvery`), `state`
  (`claimed`, `ready`, `locked`) and `next`. `claim: 'tap'` (the default) leaves a reached tier waiting on the track —
  the moment the screen is for; `claim: 'auto'` pays it as `add()` reaches it.
- **Nothing is taken (D56):** XP never decays; a missed day or week costs nothing. A season that ends keeps what was
  earned: its reached but unclaimed tiers **carry** into the next season and `claimAll()` pays them; a new season starts
  its own track at 0 and the lifetime XP (`log.life`, a rank) only grows. A weekly prize reached and not claimed is still
  paid after the week turns.
- **The screen** (`mountSeasonTrack`): a modal with the season's name, the days left, the tier bar and the tiers **a
  page at a time** — as many as fit the screen (three pages of 12 on a 360×800 phone, all 30 at once at 1280×720), never
  a list to scroll; it opens on the page of the first waiting tier. A tap claims a ready tier, Claim all (n) takes every
  waiting one, Back closes it. The platform's marks (claimed, locked, the big tiers, the pager) are drawn SVG from
  `@gp/core/icons`; the rewards' icons are yours (`icon()` from `@gp/core/icons`, `iconImg` from `@gp/art/dom`, an image
  URL or an element). The words `gp.season.*` in 13 languages (`texts` to override), `host.screen('season')`; themeable
  with `screenTheme()` (`accent2`: the big tiers) or `--gp-season-*` on `#gp-season`;
  `data-gp="season"`, `"season-tier"`, `"season-claim-all"`, `"season-back"`, `data-gp-tier="<n>"` for QA.
- **The weekly event:** the week's rule is `rules[seed % rules.length]` from the Monday's seed (`salt`: your game's id),
  so every player has the same one; `state().seed` seeds an event run (`seededRng(seed)`), `best` keeps the week's best
  score, `goal: null` makes an event for the best alone. Contracts — one goal a day — are `dailyOrder` (§7).
- **Where it opens:** from the title or the results (a button with the tier, «Season 7/30»), never between a new
  player and play. Leaderboards (a weekly best against others) are not a block yet: they need the portal's services.

### 7.2 A reason to come back in five minutes, and tomorrow (the live world)

A shop that restocks every few minutes and weather or festival hours on a shared UTC clock (`worldClock`,
`restockShop`, `mountRestockTimer`), a different daily table for everyone with named bands, a near-miss line and a
share card (`dailyTable`), share codes and NPC rivals: [live-world.md](live-world.md). The same rule as above: the
screen says what is coming, never what was missed.
### 7.2 Daily quests and achievements (`dailyQuests`, `achievements`, `mountGoals`, `goalBanners`)

Goals for today and goals for good, for any genre: what Craft Pickaxe Idle (three quests a day from a pool, a quest
chest for all three) and Idle Garage Evolution (31 achievements, four rarities, secret ones) wrote by hand. `dailyOrder`
(§7) is one goal a day; quests are several, each claimed alone. Pure logic over fields of the save (`@gp/core/goals` in
Node), the screen apart.

```ts
import { achievements, dailyQuests, goalBanners, mountGoals } from '@gp/core';

const quests = dailyQuests(save, {
  pool: [{ id: 'blocks', need: 120, reward: 15 }, { id: 'chests', need: 15, reward: 15 }, { id: 'merges', need: 5, reward: 15 }, …],
  perDay: 3, bonus: 25, salt: 'my-game', persist: () => host.save(save),
});
quests.add('blocks');                       // in memory: the game's next host.save(save) carries it — never a save per add

const ach = achievements(save, { list: [
  { id: 'first', rarity: 'common', test: (s) => s.stats.runs >= 1 },
  { id: 'hundred', rarity: 'rare', test: (s) => s.stats.runs >= 100, progress: (s) => s.stats.runs / 100, reward: 50 },
  { id: 'night', rarity: 'epic', hidden: true, test: (s) => s.lastRunHour < 5 },          // "???" until earned
], persist: () => host.save(save) });
const banners = goalBanners({ host });
for (const a of ach.check(save)) banners.push({ title: host.t(`ach.${a.id}.name`), rarity: a.rarity });   // after a save

mountGoals(null, {
  host, quests, achievements: ach, ctx: save,
  questText: (id, need) => host.t(`quest.${id}`, { n: need }),
  achievement: (id) => ({ name: host.t(`ach.${id}.name`), text: host.t(`ach.${id}.desc`), icon: trophyIcon }),
  view: (r) => ({ icon: gemIcon, label: `${r}` }),
  onClaim: (claims) => { for (const c of claims) save.gems += c.reward; host.save(save); },
});
```

- **Quests:** `perDay` of the pool by the day's seed (`salt`: your game's id; `local: false` gives every player the same
  quests on the same UTC day), each fits a session; `add()` counts, `claim(id)` pays a done one once, `claimBonus()` the
  bonus when all are claimed, `claimAll()` everything waiting. `from: 'secondVisit'` keeps the first day for the game.
- **A missed day takes nothing (D56):** quests done and not claimed when the day turns, and a bonus earned and not
  taken, carry over (`state().carried`, "Waiting from earlier: 4" on the screen) and `claimAll()` pays them. A half-done
  quest is simply new the next day: nothing was earned.
- **Achievements:** `check(ctx)` tests the ones not earned yet and returns the new ones (saved when there are any);
  `unlock(id)` earns one by the game's own event. Earned once, never taken back — a prestige reset that makes a test
  fail later changes nothing. `hidden` ones are "???" (`gp.goals.secret`) with no progress until earned; `reward` makes
  one claimable on its card. An old plain list of ids (Garage's `ach: string[]`) loads as earned.
- **The screen** (`mountGoals`): a Quests tab (each quest with its bar, its reward and its own Claim; the bonus row; what
  waits from earlier) and an Achievements tab (cards with the rarity's colour, a page at a time — 10 on a 360×800 phone,
  all 14 at 1280×720 — never a scroll). Drawn marks (check, lock, star, chest, "?"), the rewards' icons the game's
  (an image URL, an element, a text). `gp.goals.*` and `gp.rarity.*` in 13 languages, `host.screen('goals')`,
  `--gp-goals-*` on `#gp-goals` (falling back to the shared `--gp-theme-*`), `data-gp="goals"`, `"goals-quest"`,
  `"goals-claim"`, `"goals-bonus"`, `"goals-carried"`, `"goals-ach"` for QA.
- **The banners** (`goalBanners`): one at a time at the top, each for its reading time, **held while any panel or card is
  open** (Garage's unlock landed under its shop) — the time behind it doesn't run. No pointer events.

### 7.3 Playtime gifts, a lucky wheel, the day's offers, a timed boost (`mountRewardsHub`)

The rewards hub of the genre's hits (the mining simulators' gifts for the minutes played, a free spin a day, Idle
Miner's three offers a day), with what Craft Pickaxe's code review and quality review found built in. Idle games and
simulators most, any genre may. Pure logic (`@gp/core/rewards` in Node), the screen apart.

```ts
import { dailyOffers, luckyWheel, mountRewardsHub, playtimeGifts, timedBoost } from '@gp/core';

const gifts = playtimeGifts(save, { gifts: [{ min: 1, reward: { coins: 200 } }, { min: 5, reward: { gems: 5 } }, …], persist });
// in the loop while the player plays: gifts.tick(dt)   (menus and pauses don't count)
const wheel = luckyWheel(save, { slices: [{ reward: { coins: 120 }, weight: 30 }, …], free: 1, ad: 1,
  paid: { price: 10, pay: (p) => spendGems(p) }, rand: () => host.rng.random(), persist });
const offers = dailyOffers(save, { pool: OFFERS, perDay: 3, firstFree: true, fixed: [BOOST_OFFER], salt: 'my-game',
  ad: { reward: { gems: 10 }, perDay: 3 }, persist });
const boost = timedBoost(save, { factor: 2, persist });          // income: boost.apply(rate) — tick(dt) in the loop
mountRewardsHub(null, { host, gifts, wheel, offers, boost, view, currency: { icon: gemIcon, amount: () => save.gems },
  pay: spendGems, onPrize: (r) => { give(r); host.save(save); } });
```

- **Gifts:** today's minutes of play (or one ladder for good: `reset: 'never'`), counted by `tick()` in memory and kept
  across sessions with the save (saved at once when a gift is reached); a gift reached and not taken when the day turns
  is kept (`carried`). The screen counts down to the next one ("Next gift after 2:40 of play").
- **The wheel:** the prize is **decided and saved at the spin** (`spin()` → pending) and **shown when the wheel stops**
  (`collect()` pays it once): a reload mid-spin keeps it — the next open stands on it and pays it; closing the hub
  mid-spin pays it too. The **ad spin is offered only after the free one** ("Extra spin", placement `wheel-spin`, kind
  `spin`); a paid spin takes the game's currency through `paid.pay`. Every slice carries its amount (the reward view's
  label, never upside down) and an image icon; with reduced motion it stops at once.
- **The day's offers:** `perDay` from the pool by the day's seed, each bought once a day, **the first one free** once a
  day; fixed offers any time; `ad` gives currency for a rewarded ad a few times a day (placement `free-currency`, kind
  `currency`). Declare the placements in game.yaml `money.rewarded` (`gp forecast` values both kinds).
- **The boost:** `factor()` while it runs (the play clock by default: menus and the time away don't use it up;
  `clock: 'wall'` for real time), stacked up to `maxSec`. It **never multiplies the offline earnings**: inside
  `offlineEarnings()` and `Sites.offline()` it answers ×1 even when the game's income function applies it (the bug a
  bought ×2 boost had in Craft Pickaxe).
- **The screen** (`mountRewardsHub`): Gifts, Wheel and Offers tabs (those you pass), the wallet and the boost's time
  left in the header; the gifts and offers a page at a time, the wheel beside its buttons on a wide screen. Other buttons
  wait while a rewarded ad runs. `gp.rewards.*` in 13 languages, `host.screen('rewards')`, `--gp-rewards-*` (and
  `-slice-a/-b/-c/-ink`) on `#gp-rewards`, `data-gp="rewards"`, `"rewards-gift"`, `"rewards-take"`, `"rewards-wheel"`,
  `"rewards-spin-free"`, `"rewards-won"`, `"rewards-offer"`, `"rewards-buy"` for QA.
- **Where it opens:** from a button on the title or the HUD. Don't light its dot in a new player's first minute: the
  first run belongs to the core action (Craft Pickaxe's reviewer, D56).

### 7.4 One card at a time (`cards`)

A returning player's title is wanted by the welcome-back card, the reward week, the season, a story scene, the goals and
the rewards hub. Frankengun held its week's card back by hand until the welcome card closed; the queue does it for every
game: one card on screen, the next a beat after it closes, **never while any other modal is up** (the language sheet, a
shop, a dialogue).

```ts
import { cards } from '@gp/core';
showTitle();
if (visit.newDay) cards.offer('welcome', () => welcomeBack({ host, onContinue: play }), { priority: 2 });
cards.offer('streak', () => mountStreakCard(null, streak, { host, onClaim }));     // returns null: nothing to show, the next one
cards.offer('quests', () => (quests.state().claimable ? mountGoals(null, { host, quests, view, onClaim }) : null));
// the player starts a run: cards.hold(true) — nothing opens over the play; back on the title: cards.hold(false)
```

- The cards offered together open by `priority` (higher first, then in order); an id waiting is offered once (the newer
  opener kept); `drop(id)`, `clear()`, `current`, `waiting`.
- `welcomeBack`, `mountStreakCard`, `mountSeasonTrack`, the dialogue box, `mountGoals`, `mountAlbum` and
  `mountRewardsHub` say when they open and close (`cardOpened`), so the queue waits for them even when the game opened
  one directly; a card of the game's own is followed by its element (closed when it leaves the page or is hidden).
- Never between a new player and play: a first visit lands in the run (§1) and the queue is held while it runs.

## 8. A slow SDK doesn't hold the game (the player's boot)

`boot()` used to await the portal's SDK (CrazyGames: the script up to 8 s, then init up to 8 s) before the game's module
started: on a bad network the player looked at an empty page. Now the page (the game's background) is up at once, the
game waits for the SDK at most `PORTAL_SOFT_WAIT_MS` (1.5 s), then starts with the SDK's calls queued (`deferPortal`):
the lifecycle calls go through in order once it is ready; saves go to localStorage meanwhile, and a portal store that
is still empty then gets them copied — one that already has a save is never overwritten (that session stays local).
The production run of `gp qa` checks it with the SDK arriving after 4 s.

## 9. What `gp qa` measures (the first-minute section)

A fresh profile on a 360×800 phone, a new player. On a `crazygames` build each line is a check; on other channels a hint.

| Gate | Fails when |
|---|---|
| In gameplay within 1 click of loading | more than 1 click (a prologue, a modal, a controls card, a story dialog over the run) or no gameplay within 3. 1 click passes, with "0 clicks is best" |
| Play starts the run within 8 s | (1-click games) no run 8 s after the Play tap |
| A player who touches nothing keeps playing | the run ends within 12 s |
| Words before the first action | more than 25 on screen in the first 6 s of the run (DOM and declared canvas text) |
| Touch controls visible at the first frame | a declared control (`data-gp-touch` on DOM controls, `host.qa({ touchControls })` for canvas ones) isn't visible before the first touch |
| A naive touch bot keeps playing, and doesn't lose | into play by the biggest button, then 60 s of random taps and drags (30 s off `crazygames`): neither 15 s of gameplay nor a run event (a score, a hit, the results) — or a fail (`host.fail()`) or a results screen (`host.roundEnd()`) in that time (`E_QA_FIRST_RUN_LOST`: a first run safe for its first minute; until 2026-10-19 a loss passed as a run event) |
| The start isn't loud | louder than −10 dBFS (RMS over ≈ 43 ms on `host.audio.out`) in the first 3 s of sound |
| Play at 4× CPU slowdown | the median of three samples in the first 30 s under 30 fps (CDP `Emulation.setCPUThrottlingRate`, at the quiet end of the run) |

Also reported: Play's time to tappable, the funnel, the demo bot's first `host.happytime()` and twist. The numbers are in
`qa/first-minute.json` (the earlier fields kept: `playReadyMs`, `playToRunMs`, `idleEndSec`, `words`,
`firstHighlightSec`, `twistSec`, `demoEndSec`; new: `clicksToGameplay`, `clickPath`, `loadToGameplayMs`, `funnel`,
`touchControls`, `touchBot`, `startLoudness`, `fps4x`, `failed`), and the screenshots `first-minute-0s.png`,
`-1s.png`, `-5s.png` and `first-minute-touch-bot.png` (where the touch bot ended: `touchBot.endedOn`; its seconds and
the first loss or results in them: `touchBot.sec`, `touchBot.failedAt`).

Not measured here: a real phone (touch latency, thermal throttling), CrazyGames' own mobile page (whether it shows its
own Play Now, orientation), whether the portal counts menu time as play.

## 10. Something new every minute (`host.seen`)

"No variety" is what judges told our games most often (`gp lessons`: `variety`). Call `host.seen(kind, id)` whenever
the player meets something new — an enemy, an obstacle, an item, a card, a place, a boss: `host.seen('enemy', 'bat')`.
Call it every time; only the first sighting of each id counts, and outside dev and E2E builds it does nothing. `gp qa`'s
feel section lets the demo bot (`host.qa({ demo })`) play run after run for up to 10 minutes of play on the virtual
clock and reports the distinct ids at 2, 5 and 10 minutes, the longest stretch with nothing new and the gaps between
rewards (`host.happytime`, `host.twist`); it warns when nothing new appears for over 90 s of play, or the median gap
between rewards is over a minute (Vampire Survivors: about one every 23 s). The table and the other feel measures (input
→ response, feedback channels, flashes, 60 vs 144 Hz): [code-games.md → the feel section](code-games.md#what-gp-qa-feels-the-feel-section).
