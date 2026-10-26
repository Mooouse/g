# Uniqueness: a game of its own, checked at every stage

> Choosing the idea: [game-ideas.md](game-ideas.md). The portal's rules: [publishing-crazygames.md](publishing-crazygames.md).
> The short version of this page: [game-design.md → Originality](game-design.md#originality-what-portals-reject).

A portal game has one **twist**: the thing the player does here that the closest live games don't have. The platform
asks you to name it before building (`concept` in game.yaml), to show where it happens in play (`concept.twist` and
`host.twist()`), and it checks both at every stage, up to a score that `gp submission` needs.

## 1. Why

**Petri Panic** (QmaCyber/game2) was polished, tested and correctly integrated, and CrazyGames rejected it:
*"The concept is quite close to existing titles."* A live game, Cell Survivor (June 2026), was a survivors-like with the
same theme (a cell against germs), next to about 20 more "X Survivors". A popular genre is where the competition is.

What the portals say (sources: [crazygames-requirements-2026-09.md](../research/crazygames-requirements-2026-09.md) §12–15):

| Who | Wording |
|---|---|
| CrazyGames QA, rejection list | "Unoriginal content (e.g. clones or asset flips)" |
| CrazyGames, monetization rules | "Be original and clearly distinguishable from existing games" |
| CrazyGames reviewers (developer reports) | "too similar to existing titles", "Not unique enough" (one game four times), "Doesn't feel unique" |
| Poki | "a creative twist on familiar mechanics", "clear differentiation especially in oversaturated genres", "unique enough among the category"; "templates and asset flips with little modification don't qualify as original work" |

Assume the reviewer compares your game with what is live in the same genre **and** theme, and finds the same titles
you would. A rejected concept is resubmitted only after a meaningful change (a different core mechanic or theme, not a
polish pass), and repeated submissions can restrict the account.

**A theme swap is not a twist.** Survivors-like with germs, then with robots, then with cats: the same game three times.

## 2. What a twist is, and what it isn't

A twist is **a rule the player feels in the first 30 seconds**: it changes what they do, what they want or what they risk.
You can say it in one sentence that starts with "you".

| Game | Twist | Why it works |
|---|---|---|
| **Germ Bait** (game6) | you don't fight the swarm, you steer its appetite: the sugar you drop lures germs into traps, **and a germ that eats it divides** | every tap is a bet; the lure is also a risk. Its three first ideas were dropped because the search found them live (§6) |
| **Brew & Banter** (game5) | a clicker whose customers are a story: named regulars bring the orders, and 12 chapters with choices unfold who the cat Pip really is | the tap core is a common clicker; the difference is the story around it. That makes it a weaker twist: it has to reach the player early (the first named regular's order, not chapter 3) |
| **Spin Brawl** (game3) | the single-player spinning-top slot is taken (Top Clash, Gyroblade); the open slot is **real multiplayer** between players | the difference is in who you play against. QA plays offline against bots, so declare an in-play rule too (the research proposes a spin economy: your RPM is health and ammo) |

**Not a twist** (all of these have been called "too close"):

| Not a twist | Why |
|---|---|
| a new skin, art style or name | the same rules; `W_CONCEPT_THEME` |
| a new setting (space, the sea, a kitchen) | the same rules in another place |
| more levels, more enemies, bigger numbers | content, not a difference; every game in the genre has it |
| a shop, bosses, a daily mode | depth techniques ([market-depth §2](../research/market-depth-2026-09.md#2-depth-that-keeps-players-10-minutes)) keep players 10+ minutes, but the neighbours have them too. A twist can *use* them (a boss with a new rule); on its own it isn't one |
| a twist that appears at minute 5 | reviewers and players judge the first 30 seconds, the cover and the video |

### Twist levers

Pick one lever and apply it to the core, not to the decoration:

| Lever | One-line example | The crowded genre it rescues |
|---|---|---|
| **Change the input** | you never move the walker: you swing a lantern and it steps only where the light falls (Lantern Walk, the example in [code-games.md](code-games.md)) | escort and path puzzles |
| **Change the goal** | an idle where buying too much of one species crashes the income: the goal is balance, not growth (ideas audit, new #3) | cozy garden / pond / bakery idle (17+ live) |
| **Change a rule** | heavy items sink through light ones (ideas audit, sort with weight) | tube / colour sort (17+ live) |
| **Add a constraint** | a deduction case where some suspects always lie, and you may ask only a few questions (ideas audit, new #1) | daily logic puzzles (14 with a daily mode) |
| **Invert a role** | you steer the enemy instead of shooting it (Germ Bait); you are the wave, choosing its path | survivors-likes, draw-and-tower defense |
| **Combine two known mechanics** | slide-until-blocked plus weather: swipe the wind, every cloud slides, rain falls where they stop (cloud herding, new #4) | slide puzzles, Sokoban, 2048 |
| **A resource that is also a risk** | the bait feeds the enemy (Germ Bait); your spin is your health and your ammo (Spin Brawl proposal) | .io arenas, survivors-likes, chain reactions |

Check the twist itself on the portal too: four of eleven twists in our old idea cards turned out to be live already
(fusing balls, a tilting jar, gravity merge, fish mutations) — [ideas-audit-2026-09.md](../research/ideas-audit-2026-09.md) §5.

## 3. The checks at every stage

| Stage | Command | What is checked | What fails | How to fix |
|---|---|---|---|---|
| **Concept** | `gp validate` | `concept` is written and names ≥ 3 closest games | `E_CONCEPT`: missing, TODO, fewer than 3 in `closest` | search (§6), fill `pitch`, `closest`, `different` |
| | | `different` is about play | `W_CONCEPT_THEME`: it talks about looks only | name the new rule, input, goal or combination |
| | | the text doesn't read like a live genre + theme pair ([taken.ts](../../packages/spec/src/taken.ts)) | `W_CONCEPT_TAKEN` with the live titles | put them in `closest`; if the core action is the same, change the game (§7), not the words |
| | | a portal code game declares where its twist happens | `W_TWIST_MISSING` | add `concept.twist` (§5) |
| | | …and the words that explain it to a new player | `W_TWIST_UNEXPLAINED` | add `concept.twist.explained` ([§5, the explanation](#the-explanation)) |
| | | the search is written down (a `gp init` repository) | `W_CONCEPT_NOTES`: `docs/concept.md` still TODO | fill in the search table (§6) |
| **Building** | `gp validate` | the rules code is your own | `W_MECHANIC_COPY`: `sim.ts` / the main loop is too close to the `gp init` template or the code example | replace the mechanic; keep only the host wiring |
| | | no template leftovers | `W_PLACEHOLDER` | replace the PLACEHOLDER mechanic, texts and art |
| **QA** | `gp qa` | the demo bot (`host.qa({ demo })`) plays a fresh run; `host.twist(event)` must fire within `within` seconds | the `uniqueness` check: no `demo()` (QA can't see the twist) or the event never fired in time | fire the event at the moment (§5); make the twist reachable early; let the bot play like a new player |
| | | in the same run, the `explained` words are on screen before or when it fires, long enough to read (2 s + 50 ms a character) | `twist explained`: never visible, too short (Echoflies: 30 ms), or only after the twist | keep the hint until read; a hint that waits for a tap: let the demo bot wait too ([the explanation](#the-explanation)) |
| **Score** | `gp uniqueness <game>` | the signals above as a score 0–100, a verdict, what to change, search queries | nothing fails here: it tells you | the lowest signal first (§4) |
| **Submission** | `gp submission <game>` | the score | refuses a score below 70 | §7; then `uniqueness.md` goes into `submission/` for the owner |

Warnings in `gp validate` don't stop a build; they cost points, and the score stops the submission.

## 4. The score and how to raise it

`gp uniqueness <game>` reads game.yaml, `docs/concept.md`, the code and the last `gp qa` (`qa/uniqueness.json`):

| Signal | Points | You get them when | To raise it |
|---|---|---|---|
| Concept about play | +20 | `concept` passes `E_CONCEPT` and `W_CONCEPT_THEME` | rewrite `different` as what the player does, starting with "you" |
| No taken match | +25, −15 for each match (−5 for one found only off the portal: `offPortal` in taken.ts) | the concept doesn't read like a pair in taken.ts | change the genre or the theme **of the game**, fundamentally; then describe the new game |
| Search notes | +10 | `docs/concept.md` is filled (no TODO) | write the table from §6 |
| Twist seen in play | +20 (declared only: +5) | QA saw `host.twist(event)` within `within` s | add `demo` to `host.qa`, fire the event, move the twist earlier |
| Own mechanic | +20 | no `W_MECHANIC_COPY`, no `W_PLACEHOLDER` | replace the template's rules |
| Own premise and characters | +5 (premise +2, characters +3) | `story.premise` is written, and the story file names a character | `gp story`: a one-line premise and a character with a name ([story.md](story.md)). A small signal on purpose: it never outweighs a copied mechanic |
| Own progression (code games) | +5 / 0 / −5 | +5: the progression blocks (`Roster`, `Tiers`, `PactTree`, `RunChoices`) or the game's own system; −5: only the stock level shop (`mountUpgradeShop` of "+stat" levels) | give the progression the genre's shape ([upgrades.md](upgrades.md#1-pick-a-shape)); the total stays within 0–100 |
| Own words | 0, or −10 for another hit's signature words (−5 more per further term, −25 a hit, −35 at most) | strings/en.yaml, the listing and the pitch use none of a hit's signature terms (`packages/spec/src/vocabulary.ts`: Balatro's Mult, Chips × Mult, blinds, seals and foil / holographic / polychrome / negative editions; Vampire Survivors' items; Minecraft's Creeper, Nether, Ender, Redstone; Tetris, Pac-Man, Among Us; car brands) — one strong term, or four ordinary ones of one hit | name the scoring, the items and their editions after your own theme. Velvet Domino Rogue scored 100 and was rejected with Balatro's words all over a domino game; a brand in the texts is also `W_TRADEMARK_TEXT` in `gp validate` |

**Gates, whatever the score:** a concept that is missing or TODO (`E_CONCEPT`), and a mechanic that is still the
template's or the example's (`W_MECHANIC_COPY`, `W_PLACEHOLDER`) make the verdict "too close". Without `docs/concept.md` (a
game inside the platform) the search counts 7 when `closest` names 3 games. A YAML-kit game (`casual`) plays the kit's
rules and can't declare a twist: it tops out at 67 — on CrazyGames, make it a `kit: code` game with a twist, or publish
it on the own-site channel.

| Score | Verdict | What it means |
|---|---|---|
| ≥ 70 | unique enough | `gp submission` goes on |
| 50–69 | risky | a reviewer can call it close; change the game before submitting |
| < 50 | too close | the concept is a clone or not built yet; go back to §6 |

The report also prints **ready search queries** built from your concept's words: run them, and add what you find to
`closest` and `docs/concept.md`. A high score means the platform found nothing wrong; only the portal decides.

## 5. Declare and fire the twist

In `game.yaml`, next to the concept:

```yaml
concept:
  pitch: "Drop sugar to lure a germ swarm into traps before it reaches your cell."
  closest: ["Draw Defense", "Chill Reaction", "Liquid Swarm"]
  different: "You never attack: you steer the swarm's appetite, and a germ that eats your sugar divides."
  twist: { event: fed-divide, within: 30 }    # within: seconds of play, 5–120, default 30
```

In the game, at the moment it happens, and a demo bot so QA can play a run:

```ts
// the frame loop: the simulation reports what happened
for (const e of sim.drain()) if (e.type === 'divide') host.twist('fed-divide');   // every time, not once

host.qa({
  play: () => begin(1),
  end: () => finish(),
  demo: () => { bot = new Bot(sim, host.rng, NEWCOMER); },   // plays the run that just started
});
```

- **Name the event by what happens** (`fed-divide`, `lie-caught`, `rain-falls`), not `twist`: the report shows it.
- **Call it every time**, from the game, at the real moment. Don't call it from the bot or on a timer: that checks nothing.
- **QA plays a fresh run in real time** (1280×720) and waits `within` seconds; it saves `qa/uniqueness-twist.png`. If another
  event name fired, the check says which.
- **The bot plays like a new player.** A perfect bot may avoid the twist (a smart bot never feeds a germ); a newcomer meets it.
  If only a mistake shows the twist, it is fine for the demo bot to make that mistake.
- **Make the twist unavoidable early**: the first level is built so it happens in the first 30 s (no Germ Bait dish can be
  won without sugar, so a new player drops it, and feeds germs, in the first seconds). The same moment belongs in the preview video (`video.mjs`) and on the cover.
- `demo` is also what `gp video` films, so one bot serves both.

### The explanation

A twist a new player meets but isn't told about is not a twist to them. Echoflies passed QA 116/116 while the line
that explained its echoes was on screen for **30 ms**; a playtest found it, QA and the code review could not. So name
the words that explain it:

```yaml
concept:
  twist: { event: first-echo, within: 30, explained: "your echo flies" }
```

- **`explained`** is the text, or a phrase from it, as the screen shows it (case, spacing and curly quotes don't
  matter). It can be DOM text, or drawn on the canvas: then return it in a `canvasUi` rect with `text`
  (`{ name: 'hint', kind: 'text', x, y, w, h, fontPx: 16, text: 'Your echo flies the dotted path' }`).
- **What QA checks**, in the same demo-bot run as the twist (1280×720, from the Play tap, every frame): the smallest
  element whose text holds the phrase is visible — ≥ 90 % of it on screen, opacity ≥ 0.5 up its ancestors, text ≥ 12 px —
  in a stretch that starts **before the twist fires, or within 1 s after it**, and lasts long enough to read **the whole
  text the phrase is in**: **2 s + 50 ms per character, at most 8 s** (`readingSec` in `@gp/core`). Not checked: an
  element covering it.
- **Why that long:** 50 ms a character is 20 characters a second — the ceiling of Netflix's Timed Text Style Guide for
  adult subtitles in English (17 for children's) and Brysbaert's meta-analysis of silent reading (238 words a minute,
  Journal of Memory and Language 109, 2019, ≈ 20 characters a second). The 2 s on top are the platform's allowance for
  *noticing* it: a subtitle appears where the viewer already looks, a hint appears while the eyes follow the action.
  A 61-character hint needs 5 s; "Tap the target!" 2.8 s.
- **A hint that waits for a tap** (Echoflies after its playtest: the next loop starts only on a fresh tap) stays as long as
  a player wants — but the demo bot doesn't tap, it goes on at once, and the check fails. **Let the bot read too**: when
  `demo` is on, hold the hint `readingSec(text) * 1000` ms before going on. (Echoflies, re-checked: before the playtest
  0.03 s ✗, after it with a bot that skips the hold 0.04 s ✗, with a bot that reads 5.1 s ✓.)
- A highlight, an arrow or a pause without words is not checked: say it in words too.
- No `explained` on a portal code game with a twist: `W_TWIST_UNEXPLAINED` in `gp validate` (a warning; QA says "not
  checked"). The result is in `qa/uniqueness.json` (`explained`) and `qa/uniqueness-explained.png`.

## 6. The search, step by step

Do it before building, and again after each big change. Budget about 10 minutes per idea.

1. **Name the idea in portal words**: the genre as the portal's tags say it (survivors, sort puzzle, idle, .io), the theme
   in 2–3 words, and the twist in one verb and one object.
2. **Run the queries** (or the ones `gp uniqueness` prints):

   | Query | Finds |
   |---|---|
   | `site:crazygames.com <genre> <theme>` | the clone risk: same genre and theme |
   | `site:crazygames.com <genre> 2026` | fresh releases: the portal fills a trend within months |
   | `site:crazygames.com <verb> <object>` (e.g. `lure bait swarm`) | your twist, already live under another genre |
   | the genre's tag page and the top of its category | what a reviewer sees first |
   | the same on Poki; our own games ([ideas audit §2](../research/ideas-audit-2026-09.md#2-our-own-games-the-portfolio-counts-too)) | the category test; the portfolio counts too |

   crazygames.com is blocked by the build proxy (403): search engines' `site:` snippets work. Say so in the notes.
3. **Record it in `docs/concept.md`** (Germ Bait's is the model):
   - a table per idea: the idea, the queries run, the closest live titles (link, release month, rating), the verdict;
   - for the chosen idea, a table against its 3 closest neighbours by **what the player does**, **how you win or enemies
     die**, and **what the risk is**. If two columns read the same, the twist is too thin.
4. **Read the results:**

   | You found | Verdict |
   |---|---|
   | a live game with the same genre **and** theme | a clone: change one of them fundamentally |
   | the same genre, another theme | thin: you need a twist from §2, not a theme |
   | your twist, live in any genre | drop that twist, pick another lever |
   | a close game from the last 6 months | worse than an old one: the reviewer has it fresh in mind |
   | one of our own games | also too close (microbes are already the theme of two of ours) |
   | nothing | good, not proof |

5. **Put the conclusion into game.yaml**: the closest titles honestly in `closest` (the reviewer will find them anyway),
   the twist in `different`, its moment in `twist`.
6. **Grow the list**: new live genre + theme pairs belong in [taken.ts](../../packages/spec/src/taken.ts), so the next game
   is warned. Propose them in your report, or add them in a change of their own.

**Search results are not the catalogue.** A search returns about ten hits: counts are lower bounds, and "not found" means
"no search hit", not "the portal has none". Only the portal's own search and its reviewers are the real test. Say this in
`REPORT.md`.

## 7. When the score is low: change the game

A low score means the game is too close, not the text. Rewording `different` to dodge a warning, or dropping titles from
`closest`, is loosening a rule (AGENTS.md §2): the reviewer reads the game, not the YAML.

1. **Read `gp uniqueness`**: which signal lost points, which live titles matched, what it suggests.
2. **Change the game with one lever** from §2: the core action, the goal, a rule, a constraint, a combination. Germ Bait
   dropped three ideas before the fourth held; changing an idea is cheaper before the art and the shop exist.
3. **Search the new version** (§6), the twist itself first, and update `docs/concept.md` and `concept` to describe the new game.
4. **Rebuild the proof**: the rules in `sim.ts`, the `host.twist()` call at the new moment, the demo bot; then
   `gp validate`, `gp qa --quick` while iterating, the full `gp qa`, and `gp uniqueness` again.
5. **Repeat until ≥ 70.** Still below after two or three rounds? Drop the idea and pick another from
   [game-ideas.md](game-ideas.md); a well-built clone is still a clone.

Run `gp uniqueness` after the concept, after the first playable run, after every big change and before `gp submission`.
