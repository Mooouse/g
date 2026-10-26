# Market depth: web portals in Q4 2026, and how simple games keep players 10+ minutes (research, 2026-09-30)

> For `docs/research/` (next to `trends-2026-09.md`, `platforms-2026-09.md`, `crazygames-requirements-2026-09.md`).
> It **adds to** those notes and does not repeat them. Where a number is already in them, this note only says what changed.
> The egress proxy blocked crazygames.com, docs.crazygames.com, poki.com, hub.poki-cdn.com, pocketgamer.biz,
> gamedevreports.substack.com, mediacube.io, playgama.com and itch.io, so almost everything below comes from search snippets.
> The five games were read from their repositories (game2, game4, game5, game6 through the GitHub connector; game3 was not
> reachable, so Spin Brawl is described from `docs/guides/code-games.md` and `docs/team/retro-portal-games.md`).

| Marker | Meaning |
|---|---|
| **[S]** | a WebSearch snippet of the named page (a paraphrase: close to the source, not checked in context) |
| **[S-site]** | a snippet of a crazygames.com game or tag page from a `site:crazygames.com` search. Release month and rating are CrazyGames' own fields |
| **[3rd]** | a third-party page, seen only as a snippet unless it says "read" |
| **[F]** | a forum post, devlog or anecdote |
| **[repo]** | read in full in our own repositories |
| **[U]** | vendor marketing or unsourced; treat as a hint only |

**Counting live titles:** the portal's own search and tag pages are blocked, so "titles found" means *titles a search engine
indexed*. That is a lower bound, not the catalogue. Tag pages expose their page number (`/t/idle/4`), so "≥ N pages" is also a
lower bound. The page size is unknown, so page counts are not converted into titles.

---

## 1. Market update, Q4 2026

### 1.1 What's new since the September notes, in ten lines

1. **Spinning tops became a crowded niche on CrazyGames in 2026.** Top Clash (July 2026) and Gyroblade (September 2026) are single-player
   top-vs-waves roguelites with permanent upgrades, rated 8.9 and 9.3. Around them are at least 8 more spinner and push-out games.
   Spin Brawl is at the same risk Petri Panic hit ([§3.2](#32-spin-brawl-game3)).
2. **Roblox-style "Obby" games are the portal's summer wave.** At least 8 went live between March and August 2026. Most are
   "+1 per click, dig deeper" simulator loops under a 3D obby skin. *99 Nights in the Forest Online* (8.8) copies a Roblox hit that
   peaked at 14.2M concurrent players.
3. **Brainrot is fading:** at least 7 titles were released February–June 2026, and none after June turned up in the index [S-site, weak signal].
4. **Survivors keep arriving:** Tower Core Survivors (Apr), Shadow Survivors (Jun), Cell Survivor (Jun), Nightfall Survivors (Jul) and Bonk
   Survivor: Roguelike. The *Horde Survival* tag has at least 2 pages [S-site].
5. **CrazyGames now has weekly Leaderboards** (since Q4 2025, invited games only). They bring extra visibility (a sidebar page, homepage
   carousels, widgets) and weekly seasons with trophies. It is the clearest retention feature the portal itself rewards, and the platform can't use it yet [S].
6. **The SDK also has a Friends module** (friend requests, join a friend, list of friends) [S]. Together with "2× long-term retention" for
   multiplayer, this is the portal's strongest hint about what it wants.
7. **CrazyGames' rewarded-ad guide now describes daily-return mechanics:** a daily cap with shrinking rewards (100 → 50 → 25),
   a "Free Daily Chest" in the shop and a "Daily Ad Reward" button in the lobby [S]. On a platform where 90% of players multitask, the portal itself
   teaches "come back tomorrow".
8. **"Hypercasual = 78.8% of US playtime" is a taxonomy artefact, not a genre signal.** The same study puts puzzle at 20.6% and "all other genres"
   at 0.5% [3rd: Outlook Respawn, snippet]. CrazyGames files almost everything under hypercasual. Use the per-genre play-time table
   (puzzle 21 min … hypercasual 8.6 min) instead.
9. **YouTube Playables has 1,600+ games,** and the new-release winners are "Draw & Escape" brain puzzles: Tricky Twist had 394k plays a day
   [3rd: mediacube snippet]. The all-time top 11 are mobile hypercasual ports from Supersonic, SayGames, CrazyLabs, Supercent and Famobi.
10. **Mobile:** puzzle took 44% of casual spending in H1 2026 ($4.9B, of which 51% was match-3). Only 1 of 120 new match-3 games reached $100k a month.
    Block puzzles saw 2,000+ launches in H1 2026 (+89%). Sort and screw momentum is "cooling". Mobile IAP fell 2% while ad spend rose.

### 1.2 CrazyGames: genre by genre (live titles found, verdict)

| Genre / niche | Titles found on crazygames.com (release month, rating where the snippet had it) | Tag pages seen | Verdict for a new game |
|---|---|---|---|
| **Survivors-like** | Cell Survivor (Jun 2026, 8.9, desktop), Shadow Survivors (Jun 2026), Nightfall Survivors (Jul 2026), Tower Core Survivors (Apr 2026), Bonk Survivor: Roguelike, Grimdark Survivors, Endless Waves Survival, Swarm Survivor, Steal Brainrot Survivors (May 2026), plus the ≈20 already in `crazygames-requirements` §13 | Horde Survival ≥ 2, Survive ≥ 5, Roguelike ≥ 1 | **saturated.** Only a new core input gets through |
| **Spinning tops / push-out arena** | **Top Clash** (Jul 2026, 8.9: "send everything else flying off the edge", perk draft, Shards → permanent upgrades, Chassis Configs), **Gyroblade** (Sep 2026, 9.3: "24 waves and 4 bosses on a single life, then upgrade it and climb again"), Push.io (Nov 2025, 8.9: knock rivals into water, upgrade between rounds, trophies), Spinz.io, Hand Spinner IO 3D, Chaos Arena (fling-your-spinner), Super Spin (merge + spinner battles), Blade Merge, Mystical Blade, BladeBlast.io, BladeOrbit.io | Arena ≥ 1 | **crowded and fresh:** two strong single-player tops in the last 3 months. The multiplayer version is the open slot |
| **Launch-and-upgrade** | Burrito Bison: Launcha Libre (2016, 9.0, 589 votes), Kitten Cannon (2005 original, HTML5 now), Turbo Trail (slingshot a vehicle, permanent upgrades), Launch Idle, Launch Idle 3D, Color Cannon Idle, Basketball Orbit, Golf Orbit, Rocket Launch, Zombie Launcher X ("#1 for 6 weeks", 2025) | — | **proven, moderately crowded.** Classics from 2005–2016 still rank. Winning needs goals beyond distance |
| **Clicker / idle / tycoon** | Idle Supermarket Tycoon (updated Jul 2026), Idle Restaurant Tycoon, Idle Coffee Business, Cat Snack Bar, Idle Hotel Empire, Taxi Tycoon, Resource/Mine/Crusher/Rat Clicker, RPG Idle Clicker, Incremental Epic Hero 2 (2022, 9.2, still updated Sep 2026), Firestone, Liquid Swarm (9.2) | Incremental ≥ 5, Idle ≥ 4 | **large but not saturated by *quality*:** most are reskinned tycoons. Long-lived titles are the ones still updated |
| **Potion / alchemy** | Alchemy Merge Clicker, Potion Merge (slide-and-merge bottles), Art of Alchemy, Little Alchemy, Alchemy, The Witchling (point-and-click) | — | **no potion shop with a branching story found:** Brew & Banter's slot is open |
| **Story** | the Story tag is dominated by merge-story (Piece of Cake, Mansion Tale, Designville, Merge Haven) and dress-up games | Story ≥ 1 | a text-driven story is rare. Merge-story is the web's story genre |
| **Microbes / swarm** | Cell Survivor, Liquid Swarm, Germs.io (2016), Germ War (2019), Merge LAB, Bacteria (2023), C-Virus Game: Outbreak, Swarm Together (co-op 2–4), Swarm Survivor | — | **the theme is taken.** Germ Bait's verb (luring) wasn't found. A second microbe game from us would crowd our own |
| **Sort / screw / block** | Screw Sorting (Jun 2026, 9.4), Block Sort – Jigsaw Puzzle Journey (Jul 2026, 9.0), Nuts Puzzle: Sort By Color, Card Sort, Wool Mania – Sort Puzzle 3D, MemeRot Sort Puzzle, Find Sort Match | Sorting ≥ 1 | growing on web and still rated 9+. It needs its own rule ([game-ideas #1](../guides/game-ideas.md)) |
| **Obby / Roblox-style** | Keyboard Obby (Aug 2026), Obby: Stronger Drill, Deeper Mine (Aug 2026), Obby: Dig Down (Jul), Obby: +1 Click Wall Breaker (Jul), Obby: Car Crash Sandbox (Jul), Base Obby: Zombie Defense (Jun), Obby: Firefighter Tycoon (Jun), Obby – BrainWave (Mar), 99 Nights in the Forest Online (8.8) | — | a 3D wave, not for our 2D canvas games. Its *loop* (a simulator: click → stronger → dig deeper → rebirth) is borrowable |
| **Brainrot** | Brainrot Tower Defense (Feb), Ultimate Brainrot Battle (Mar), Obby: Dig Brainrots (Apr), Shoot Brainrot (Apr), Steal Brainrot Survivors (May), Run and Jump for Brainrot (May), Baseball For Brainrot (Jun), Merge & Steal Brainrot, Find Brainrot | — | avoid (legal risk, fading) |
| **Ragdoll physics** | on a third-party "top CrazyGames April 2026" list: Ragdoll Show, Crazy Crash Landing, Car Destruction Simulator 3D, Stick Dismounting!, Body Drop 3D, Noob Playground, Ragdoll Arena [3rd: playgama, snippet] | — | popular. Yeet the Gnome sits next to this cluster |
| **Sports (event-driven)** | Free Kicks World Cup 2026 (Apr, 8.8), International Cup Football 2026 (Jul, 8.4), both updated Sep 2026 | — | time-boxed spikes (the 2026 World Cup, June–July) |

**What the top and trending pages show.** They can't be opened. Search snippets and third-party lists give a stable top:
Basket Random, Moto X3M, Smash Karts, 1v1.lol, Bloxd.io, Shell Shockers, Agar.io, GeoGuessr, Uno Online ([3rd: tech-insider, mithrie]).
All of them are multiplayer or physics, and almost all are years old. **New entrants that reached the index in 2026** are clustered in five
places: obby/simulators, sort/screw, survivors, spinning tops, and World Cup football. Every recently released game we found in these
niches is rated 8.8–9.4 [S-site], so a new game is judged against rated 9s, not against filler.

**What CrazyGames says it wants, beyond `crazygames-requirements` §13 (new evidence only):**
- **Leaderboards** [S: docs.crazygames.com/sdk/leaderboards]: "only available for invited games". "Games with leaderboards enabled get additional visibility through a dedicated
  page in the sidebar, homepage carousels and widgets." There is one leaderboard per game (points, time, XP or KDA). Weekly seasons run "Monday to Monday,
  ending at 9:00 AM UTC with automatic score reset". Trophies go to the top 3 and to the top 1%, 5% and 10%. Scores can be sent from the client (can be manipulated)
  or from your server (recommended).
- **Friends** [S: docs /sdk/game]: friend requests, "friends can join the user or the user can invite their friends", and the User module lists friends.
- **Action games** [S: /resources/monetizing-action]: "let players try out a premium locked weapon or character for just one run in exchange for watching an ad";
  a revive "limited to once per session"; ×2 or ×3 of end-of-level loot.
- **Clicker games** [S: /resources/monetizing-clicker]: "Welcome Back Multipliers … one of the highest-converting placements in idle games"; "If your game has a
  prestige system or a section where progress slows down, try offering a rewarded ad to instantly finish the last leg of a milestone."
  Top clickers get 5.5 impressions per play, about half of them rewarded.
- **Hypercasual and .io games** [S: /resources/monetizing-hypercasual-io]: "Ad-gated skins … skins, trails, or hats".
- **Rewarded ads, deep dive** [S: /resources/rewarded-ads-deep-dive]: "The best-earning games are designed with rewarded ads in mind from the start"; daily caps
  with diminishing returns "encourages players to return daily".

### 1.3 Poki (Q3–Q4 2026)
- **Trending** ([3rd: Jang, Minute Mirror, Jul–Sep 2026 lists], snippets): Level Devil, Smash Karts, Subway Surfers, Blocky Blast Puzzle, Drive Mad; also Monkey Mart,
  Rumble Rush and Minefun.io. They are physics, troll-platformer, block puzzle and light management games. Nothing new in shape compared with `trends-2026-09.md`.
- **Speed bar:** "the most successful games are playable in under three seconds" [S: Poki web gaming report announcement, 2026]. Our notes said 10 s. Poki's bar is 3 s.
- **Competition is coming to the web:** 53% of surveyed developers plan to port a mobile game to the web within 12 months, and 41% a PC/console game [S: Poki 2026 State of Web Gaming].
  Expect more mobile-grade hybrid-casual games on the portals in 2027. "A simple core" alone will look thinner every quarter.
- 37% of surveyed consumers play web games several times a day [S, same report]. Short sessions, many times a day, fit daily goals and offline progress.

### 1.4 YouTube Playables
- **Catalogue:** 1,600+ games as of September 2026, tracked by the independent catalogue playables.games [3rd: mediacube, snippet].
- **Most played (to 2026-09-20)** [3rd: mediacube/playables.games snippet]:
  - Tall Man Run 104M, Build a Queen 91M, Snake Clash! 89M, Stealth Master 88M, Thief Puzzle 87M, Dessert DIY 83M;
  - Going Balls 82M, Race Master 3D 81M, Phone Case DIY 69M, Hide N Seek 66M, Magic Tiles 3 66M.
- **Weekly gainers:** Tricky Minds: Brainy Puzzle (+1.9M) and Brain Up: Tricky Quiz (+1.3M).
- **Best 2026 releases by plays per day:** Tricky Twist 394k, Dog Escape 274k, Home Rush – Draw to Home 243k.
  - All three are "Draw & Escape" puzzles: "one finger, instant feedback, no tutorial required", with "the highest day-one play rates of any 2026 release".
- **What a port needs** [S: developers.google.com/youtube/gaming/playables certification]:
  - Save all progress through `ytgame.game.saveData()` / `loadData()`. localStorage and external save servers are not allowed.
  - The save must be under 3 MiB, and should be under 500 KiB.
  - Save at each checkpoint and on pause.
  - The game must be interactive in under 5 s.
- **Fit with our games:** Yeet the Gnome (one tap) and a future draw or brain puzzle. It is not a fit for Spin Brawl (a server) or Brew & Banter (a lot of text).

### 1.5 Hybrid-casual mobile: numbers that matter for design
- **Where the money went, H1 2026** (AppMagic, via [3rd: pocketgamer.biz, outlookindia, mobidictum], snippets):
  - Casual games ≈ $11B, flat. Puzzle is 44% of casual spending ($4.9B), 51% of it match-3.
  - Only **1 of 120** new match-3 games reached $100k a month (0.8%).
  - Merge made $1.3B (+74%).
  - Sort, Screw and Block together earned ≈ $600M IAP. Block puzzles had 2,000+ launches (+89% YoY), revenue +46%, downloads +26%; sort and screw momentum is "cooling".
  - Hybrid-casual overall ≈ $2.4B (+23%) [S: Sensor Tower via Deconstructor of Fun].
  - Mobile IAP −2% in H1 2026 while ad spend climbed [S: pocketgamer.biz headline].
- **Retention benchmarks** (vendor and analyst figures, [U] unless named):
  - Hybrid-casual D7 15–22% against 8–12% for pure hypercasual. Publishers want D7 12–15% to talk, 18–22% to scale, 25%+ best in class [3rd: playio, tap-nation].
  - Survivor.io: D1 44%, D7 15%, D30 4%. Archero: 49%, 23%, 11%. Naavik's diagnosis: "so few progression tracks that they are both grindy and unrewarding" [3rd: Naavik, snippet].
  - Mob Control: D7 25.1%, D30 ≈ 4.9%, D90 2.1%. Its depth comes from base building, card collection, boss levels and events [3rd: MAF, snippet].
  - Idle games: D1 35–45%, D7 15–20%, D30 5–10% [U: game-ace/GameAnalytics snippets].

### 1.6 Verdict: grow, hold, avoid (web 13+, Q4 2026 – Q1 2027)

| Grows | Holds (proven, needs a real twist) | Saturated / avoid |
|---|---|---|
| Brain / draw-escape puzzles (Playables' top new releases); sort with its own rule; block with its own rule (mobile +46% revenue); incremental "simulator" loops (the obby wave's loop, in 2D); multiplayer with instant join (the portal pushes it); anything a weekly leaderboard can rank (portal visibility) | launch-and-upgrade; clicker/tycoon (15 min); physics/ragdoll toys; .io arenas with real players | survivors-likes (≈25 found); spinning-top roguelites (2 strong ones in 3 months); microbe/cell themes; brainrot; match-3 (0.8% success on mobile); plain block-blast clones |

---

## 2. Depth that keeps players 10+ minutes

The CrazyGames targets are unchanged: 10+ min average play, 80%+ past minute one, D1 10–15%. Our five games reach them on
the *bot's* clock (Yeet: final zone at 26–33 min; Brew & Banter: finale at 26–31 min; Germ Bait: campaign in ≈ 13 min) [repo].
Humans play slower than bots but also quit sooner. The techniques below turn a simple core into a longer, harder game.

**Build cost** is on our platform: **S** = hours, data only, or a helper exists (`UpgradeShop`, `mountUpgradeShop`, `rng`,
`host.save`, `rewardedButton`, `happytime`); **M** = a day, game code plus a small new core helper; **L** = several days, a server, or content-heavy.

| # | Technique | What it is | Shipped games | Evidence of impact | Cost |
|---|---|---|---|---|---|
| 1 | **Meta progression** | a permanent currency and a shop between runs, so failure still moves you forward | Vampire Survivors (PowerUps), Rogue Legacy, Liquid Swarm, Top Clash (Shards), Archero, Survivor.io | Liquid Swarm: halving one price ≈ doubled play time, retention +18% [F, in forums-2026-09]; hybrid-casual D7 roughly 2× hypercasual [U]. Naavik: *one* track is not enough (Survivor.io D30 4% vs Archero 11%) [3rd] | **S**: `UpgradeShop` + `mountUpgradeShop` exist |
| 2 | **Several progression tracks** | 2–4 independent tracks: upgrades, collection, rank/mastery, story or zones, so something is always close | Archero/Survivor.io (gear, pets, outfits, talents), Mob Control (base, cards, bosses, events), Burrito Bison (upgrades + missions + friends) | Survivor.io's rewards were widened after launch: "Survivor Upgrades, Tech Parts, Outfits, Pets" [3rd: Naavik]; Archero vs Survivor.io retention above | **M**: needs a goals helper (§5 #1) |
| 3 | **Unlock pacing** | a new *thing* (not a +5%) every 1–3 min in session 1, then every session: an enemy, zone, bait, rule or character | Vampire Survivors (449 unlocks, 100–200 h to 100%), Brotato (characters), Yeet (a zone every 2–7 min on the bot) | Supersonic: "the more playtime you can get with a player's first session, the more likely they'll keep coming back"; "roll [mechanics] out gradually" [S]. Vampire Survivors playtime [3rd] | **S** (data), plus a bot timeline check (§5 #10) |
| 4 | **Stages with stars (mastery goals)** | finite levels, each with 1–3 stars for doing it *well* (par, health, time); replay for stars | Cut the Rope, Angry Birds, Kingdom Rush (stars + Heroic/Iron challenges), Bejeweled Stars | Puzzle is the longest genre on CrazyGames (21 min). No public replay-rate number was found (**not verified**) | **M**: a level file + best-stars save; par from the balance bot |
| 5 | **Difficulty curve: flow + sawtooth** | difficulty rises in waves: introduce a thing safely → escalate → test at a peak → relief → the next thing | Candy Crush and Royal Match (hard-level clusters, then a relief level), Kingdom Rush | "Difficulty spikes and difficulty valleys are two of the most common churn drivers … players just stop playing" [3rd: galaxy4games/raviosoft, snippet]; one pattern is a rise over 5 levels and a drop at the 6th [3rd] | **S**: one ramp table in data, checked by the bot |
| 6 | **Dynamic difficulty (DDA)** | quietly easier after repeated failure, harder when cruising | EA's mobile DDA; Mario Kart rubber-banding; Resident Evil 4 | EA (Xue et al., WWW 2017): up to **+9% engagement**, more rounds and longer play, revenue-neutral, A/B tested [S: ACM/ResearchGate] | **S–M**: one "struggle" variable in the run |
| 7 | **Near miss** | the loss happens just short of the goal, visibly | sort puzzles' fail offers, Burrito Bison "almost reached", Tall Man Run | "Players who fail … with 1 or 2 moves remaining are far more likely to retry or spend than those who fail with 10 moves left" [3rd, snippet]; AppMagic on fail offers (in trends-2026-09) | **S**: show the distance to the goal on the results screen |
| 8 | **Bosses / climaxes** | a scripted peak every few minutes, with a new rule, not just more HP | Gyroblade (4 bosses in 24 waves), Liquid Swarm ("Epic Bosses each with a new mechanic"), Cell Survivor, Shadow Survivors ("realm boss at dawn") | CrazyGames' SDK names "beating a boss" as the moment for `happytime()` [3rd-M in requirements note]; Liquid Swarm added them after launch while its metrics were in the top 20% [F, snippet] | **M** per boss (one new behaviour each) |
| 9 | **In-run choices (drafts)** | a pick from 3 every 30–60 s that changes *how* you play | Vampire Survivors, Brotato (shop between 20–60 s waves; 15–20 min runs), Top Clash, BALL x PIT | Brotato "perfected the pacing" (critics' wording) [3rd]; run lengths: VS 30 min, 20 Minutes Till Dawn 10/20 min, Brotato 15–20 min [3rd] | **M**: a card pool + UI; reroll through `rewardedButton` |
| 10 | **Run modifiers / ascension** | after a clear, unlock harder tiers that change the rules (enemies split, less healing, a timer) | Slay the Spire (Ascension 1–20), Hades (Heat), Balatro (Stakes), Kingdom Rush (Iron) | Balatro on Steam: Red Stake won by 33.5% of owners, Gold by 12.1%, Completionist+ by 0.8% [3rd: exophase/steam, snippet]; StS A20 6.7% [3rd]. A small top tier keeps the most engaged players for a long time. It is the cheapest content multiplier there is | **S–M**: a modifier registry + an unlock after a clear |
| 11 | **Endless mode + score** | after the finite content, an escalating mode ranked by score | Germ Bait (endless after dish 6), 20 Minutes Till Dawn Endless, Burrito Bison distance | the CrazyGames weekly leaderboard gives *portal visibility* to exactly this (§1.2) [S] | **S** for the mode; **M** for the portal leaderboard adapter |
| 12 | **Daily challenge / daily seed** | the same seeded run for everyone today; one scored attempt, unlimited practice | Wordle, NYT Pips, LinkedIn Queens, Clues by Sam, Balatro/Spelunky dailies | NYT 11.2B solves in 2025; LinkedIn 84% next-day return [in trends-2026-09]; Clues by Sam 50k+ a day in the browser | **S–M**: the seed is the date (`rng` exists), the save needs "today's result" |
| 13 | **Streaks** | a count of consecutive days played | Duolingo, Wordle, Snapchat | Duolingo: a 7-day streak makes a return the next day **2.4×** more likely; Streak Wager raised D7 **+14%** [S: Duolingo blog, via snippets] | **S**, but see the rule conflict below |
| 14 | **Missions / achievements** | 3 short goals active at a time ("bounce 5 times in one throw"); finishing one raises a rank | Jetpack Joyride, Burrito Bison ("missions … doing this before the mission shows up isn't counted"), Steam achievements | Burrito Bison's missions are its long-tail layer (UI deconstruction, [3rd: interfaceingame, snippet]); goal-gradient effect: ≈ 20% shorter gaps near a reward (Kivetz 2006, in upgrades-2026-09) | **S–M**: a goals helper (§5 #1) |
| 15 | **Prestige / rebirth** | reset for a permanent multiplier `k·√(total)` or `∛`; each loop runs faster and reaches further | Cookie Clicker, AdVenture Capitalist, Liquid Swarm (Reincarnation + Perks), Roblox simulators and the obby clones | "extend game lifetime by 3–5×" [U]; CrazyGames recommends a rewarded ad to "finish the last leg" of a prestige milestone [S] | **M**: a prestige helper next to `UpgradeShop` |
| 16 | **Offline progress + welcome back** | on return, show what was earned while away (capped), ×2 with an ad | every idle game; Survivor.io's idle chest | CrazyGames: "one of the highest-converting placements in idle games" [S]; Habby: idle generation "assur[es] players that they progress even in chapters they are stuck in" [3rd: Naavik] | **S**: timestamps in the save + a cap |
| 17 | **Collection** | a visible set to complete: characters, recipes, skins, a bestiary, endings | Monopoly GO albums, Vampire Survivors bestiary, Little Alchemy, Pokémon | Monopoly GO: players "spend because they are two stickers from an album deadline" [3rd: tech-insider]; a co-op event gave +55% revenue [3rd: AppMagic]; endowed progress: 34% vs 19% completion (Nunes & Drèze, in upgrades-2026-09) | **S–M**; art is drawn in code |
| 18 | **Events / seasons** | limited-time content or rules on a calendar | Monopoly GO, Clash, Fortnite; on the web, CrazyGames' weekly leaderboard seasons | 90%+ of the US iOS top-100 grossing games run seasonal events; events per game +35% from May 2023 to Jan 2025 [3rd: GameRefinery/pocketgamer.biz, snippets] | **M–L**: needs a date-driven calendar in the build (no server) or remote config |
| 19 | **Narrative reveal** | the mechanics change as a mystery unfolds; a finite, authored arc | A Dark Room (#1 App Store, $800k+), Universal Paperclips (finite, 3–6 h), Brew & Banter | [3rd: failory, Wikipedia] | **M–L**: content-heavy (a dialogue scene is a block request) |
| 20 | **Multiplayer / social** | real opponents, invites, rooms that stay together | Smash Karts, Bloxd.io, Agar.io, Spin Brawl | CrazyGames: multiplayer has **2× long-term retention** [3rd-M, in requirements note]; the Friends module [S] | **L**: a server; the portal's multiplayer services are not on the host yet (D54) |

**Rule conflict to resolve before using #13.** [game-design.md](../guides/game-design.md) says under *Everyone*: "No dark patterns: no energy, **no daily
streaks**, no push". [game-ideas.md #2](../guides/game-ideas.md) recommends a streak. The proposal is to allow a **forgiving streak for 13+ only**:
- it is shown as a count;
- one missed day is frozen automatically;
- no reward is lost when it breaks;
- there are no reminders, and never a streak on child channels.

The owner or the game designer must make that call; this note doesn't change the rule.

### 2.1 A first-session timeline that reaches 10+ minutes

The timeline is built from the sources above plus our own bots. Use it as a checklist, and let the balance bot print it (§5 #10).

| Time | Must happen | Technique |
|---|---|---|
| 0–3 s (Poki) / ≤ 10 s | control in the player's hands, no text tutorial | — |
| 30–45 s | the first "wow" (a big hit, a long flight, a chain) | juice |
| 1–2 min | the first upgrade is affordable (Yeet's playtester flagged "first upgrade only after 2–3 throws" as a problem [repo]) | #1 |
| 2–3 min | the first *new thing* (enemy, zone, bait, rule) | #3, #5 |
| 3–5 min | the first peak (boss or stage clear), `happytime`, the first midgame ad at this break | #8 |
| 5–10 min | the first build-defining choice, the second track opens (missions, collection) | #2, #9, #14 |
| 10–15 min | the first mastery goal in reach (a 3rd star, a rank), a harder tier or mode announced | #4, #10, #11 |
| session end | a reason for tomorrow: a daily seed, offline earnings, a goal left at 80% (goal gradient) | #12, #16 |

---

## 3. The five games: ranked improvements

For each game: its closest live competitors, then 3–5 improvements ranked by (retention impact × distinctness) / cost. "Needs" names
the platform piece: **exists** = in `@gp/core` today; **new** = a block request (§5).

### 3.1 Petri Panic (game2), rejected: "concept quite close to existing titles"
**Closest live:** Cell Survivor (Jun 2026, same genre and theme), Shadow Survivors, Nightfall Survivors, Tower Core Survivors (defend a central core),
Bonk Survivor, Swarm Survivor, Liquid Swarm (a swarm of cells). **Our own:** Germ Bait (microbes, same art).
Depth features won't fix a concept rejection. A resubmission must be "a new game including significant improvements", and the
changes must be to the core verb and the theme, not polish.

1. **Change the core verb.** Suggested: *the player tilts the dish, not the cell*. Everything (your cell, the germs, the hazards) slides with
   gravity; weapons are fixed parts of the dish that germs must be steered into.
   - **Why:** the survivors reviewers compare against are all move + auto-attack. A tilt-physics horde game wasn't found.
   - **Needs:** `kit: code` (O8, the port saves ≈ 950 lines); fixed-step physics as in Yeet.
2. **Leave the microbe theme.**
   - **Why:** Cell Survivor, Germs.io, Germ War, Merge LAB and Liquid Swarm hold it, and so does our own Germ Bait. Two of our games in one niche can read as a pattern.
     CrazyGames warns that repeated non-compliant submissions may restrict the account.
   - **Needs:** content only.
3. **Short stages instead of one long survival:** 3-minute stages with a boss at the end of each, stars for health, then Heat tiers (#10).
   - **Why:** this gives it a structure the survivors crowd lacks, and each stage ends at a natural ad break.
   - **Needs:** new stages/stars and modifiers helpers.
4. **A daily dish:** a seeded layout and a weekly leaderboard.
   - **Needs:** new daily seed and leaderboard adapter.

### 3.2 Spin Brawl (game3), .io push-out arena with a server and bots
**Closest live:** Top Clash (Jul 2026, 8.9: top vs waves, perks, permanent upgrades, chassis), Gyroblade (Sep 2026, 9.3: 24 waves, 4 bosses, one life),
Push.io (Nov 2025, 8.9: push-out, upgrades between rounds, trophies/ranks), Spinz.io, Hand Spinner IO 3D, Chaos Arena, Super Spin, Blade Merge, BladeOrbit.io.
**Risk: high.** Spin Brawl would be the third spinning-top game on the portal within about three months. The single-player slot is taken by two strong games.
**The open slot is real-time multiplayer between players**, which Top Clash and Gyroblade don't have and which CrazyGames explicitly favours.

1. **Make it the portal's multiplayer spinning-top game.**
   - Instant multiplayer, an invite link, rooms that stay together across rounds, CrazyGames usernames, lobby sizes in the submission, and friends joining.
   - **Why:** "2× long-term retention"; multiplayer titles may skip Basic Launch; a multiplayer landing page exists. It is also the only honest answer to "close to Top Clash".
   - **Needs:** new portal multiplayer services on the host (open request D54); today the game reads `window.CrazyGames.SDK` itself.
2. **A spin economy as the core rule (the twist).**
   - Your RPM is your health *and* your ammo. Dashing spends spin; hitting a rival steals spin; a top below a threshold wobbles and is easy to push out.
   - **Why:** it makes the arena readable in 5 s and differs from Top Clash's perk build and Push.io's boomerang. The preview video can show it.
   - **Needs:** game code.
3. **Match structure with mutators.**
   - Best of 5 rounds. The arena shrinks each round, and each round has one mutator (ice floor, bumpers, magnet centre, low gravity).
   - The score is ring-outs plus survival.
   - **Why:** run modifiers (#10) and sawtooth (#5) at almost no content cost; it also fits the "keep rooms across rounds" rule.
   - **Needs:** new modifiers registry (optional; can live in game data).
4. **Account progression that doesn't break fairness.**
   - Rank XP, cosmetic tops and trails (ad-gated skins are CrazyGames' own suggestion), and parts that change *style*, not power (a tip that turns faster vs one that grips).
   - A weekly leaderboard, submitted from its server as CrazyGames recommends.
   - **Needs:** new leaderboard adapter; exists: `rewardedButton`.
5. **A solo ladder for empty lobbies.**
   - 10 named bot rivals, each with a gimmick; beating #10 unlocks a colour.
   - **Why:** "Playing alone is as prominent as playing with friends if both are offered" (quality guidelines), and the offline bots already exist.
   - Also fix the two QA findings: revive silently vanishing when the ad fails, and the 11 px "Leaders" label.
   - **Needs:** exists: bots, `rewardedAvailable`.

### 3.3 Yeet the Gnome (game4), launch-and-upgrade, 8 upgrades, 9 zones
**Closest live:** Burrito Bison: Launcha Libre (9.0), Kitten Cannon, Turbo Trail (slingshot + permanent upgrades), Launch Idle / Launch Idle 3D,
Color Cannon Idle, Basketball Orbit, Golf Orbit, Zombie Launcher X; the ragdoll cluster.
**Its gaps [repo]:**
- there is one track (distance → coins → 8 upgrades), and the game ends at Gnomeland after ≈ 26–33 bot-minutes;
- the playtester found "40 s of empty late-game glide" and "most pickups out of reach".

1. **Missions, 3 active at a time.**
   - Examples: "hit 3 trampolines in one throw", "land in the pond", "PERFECT launch ×3 in a row". Each one completed raises the gnome's rank, and each rank pays a reward.
   - **Why:** this is the Burrito Bison / Jetpack Joyride long-tail layer. It gives every throw a goal besides distance and fills the empty glide (#14, #2).
   - **Needs:** new goals helper.
2. **A gnome collection with different physics.**
   - A heavy gnome (rolls far), a balloon gnome (glides), a rubber gnome (bounces), each unlocked by a mission or zone.
   - **Why:** unlocks that change play, not numbers (#3, #17). Zombie Launcher X and Turbo Trail upgrade one object; a cast of gnomes is distinctive and easy to show in a cover.
   - **Needs:** game data; exists: `UpgradeShop`.
3. **"New Garden" prestige after Gnomeland.**
   - Reset the upgrades for porcelain figurines, `⌊√(total metres / k)⌋`, worth +x% coins each.
   - Each garden adds a zone variant (night, winter) with new hazards.
   - **Why:** the game currently ends at ≈ 30 min; prestige is the proven way to extend it (#15). CrazyGames suggests a rewarded ad "to finish the last leg" of a prestige milestone.
   - **Needs:** new prestige helper.
4. **Daily throw plus a weekly distance leaderboard.**
   - The seeded wind and obstacle layout is the same for everyone, one scored throw a day.
   - **Why:** #11, #12, and the portal visibility of leaderboards.
   - **Needs:** new daily seed and leaderboard adapter.
5. **A zone boss per zone** (a hawk that snatches, a sprinkler wall, a garden cat) with `happytime`, so difficulty rises within each zone (sawtooth #5, #8).
   - **Needs:** exists: `happytime`; game code.

### 3.4 Brew & Banter (game5), clicker with a 12-chapter story
**Closest live:** Idle Supermarket Tycoon, Idle Restaurant Tycoon, Idle Coffee Business, Cat Snack Bar (serve customers with a cat team), Alchemy Merge Clicker,
Potion Merge, Art of Alchemy, Little Alchemy; merge-story games (Piece of Cake, Mansion Tale). Off the portal: Potionomics, Potion Craft, A Dark Room.
**Its gaps [repo]:**
- the story ends at ≈ 26–31 bot-minutes, and then "the game continues" with nothing new;
- the core is tapping at 2.5–6 taps a second, which becomes fatigue;
- there is no offline progress;
- the "×2 gold tomorrow" offer said nothing when the ad failed (QA finding).

1. **Offline brewing + welcome back.**
   - Helpers keep brewing while the player is away (capped at 8 h). On return: "You earned N while away — ×2 (ad)".
   - **Why:** CrazyGames calls this "one of the highest-converting placements in idle games", and it is a D1 reason to return (#16). It is the cheapest fix with the biggest effect.
   - **Needs:** game code; exists: `host.save` timestamps, `rewardedButton`. A new offline-earnings helper would make it standard.
2. **Recipe discovery as a second verb.**
   - Mix 2–3 ingredients to find ≈ 30 recipes that fill a recipe book.
   - Customers ask by *effect* ("something for a dragon's hiccups"), so an order is a small deduction puzzle.
   - **Why:** it turns a clicker into a clicker-plus-puzzle hybrid (puzzle averages 21 min on CrazyGames, clicker 15). Little Alchemy has discovery without a shop or story, and the tycoons have a shop without a puzzle.
   - **Needs:** game code; the collection could use a new goals helper.
3. **An endgame after the Moonfair:**
   - a "New Season" prestige: open a branch shop in another village, with a new cast of 4–5 chapters and reputation kept as a permanent multiplier;
   - New Game+: replay the story with the choices you didn't make, and collect all endings in a gallery.
   - **Why:** it extends a finite story the way #15 and #17 do, and it uses the choices already written.
   - **Needs:** new prestige helper; the dialogue scene (open request).
4. **Regulars with a relationship meter and a daily special order.**
   - Each villager has a small arc and a favourite recipe, and one special order is seeded per day.
   - **Why:** Potionomics' pull is its cast; the daily order is #12 with no new content.
   - **Needs:** new daily seed.
5. **Less tapping, more timing.**
   - Replace spam-tapping with *stir in rhythm*: a heat gauge with a PERFECT zone. Auto-stir is an upgrade.
   - **Why:** CrazyGames' quality page says "no overly repetitive or 'boring' tasks"; tap fatigue also makes short sessions.
   - **Needs:** game code.

### 3.5 Germ Bait (game6), swarm luring: sugar leads germs into traps, and the fed germs divide
**Closest live:** Liquid Swarm (9.2), Draw Defense (9.1), Chill Reaction (Jun 2026, 8.8), Cell Survivor, Swarm Together, Tower Core Survivors. No "lure" game was found.
**Its gaps [repo]:**
- 12 dishes, one bait type and 8 upgrades;
- the bot clears the campaign in ≈ 13 min, and endless (fully upgraded) lasts ≈ 6 min;
- stars exist but have no goal beyond health.

1. **More lure verbs, one per few dishes** (sawtooth: introduce → escalate → test → relief):
   - **salt** repels;
   - **pheromone** makes germs follow the leader in a chain;
   - **bitter cube** is eaten but stops division;
   - **decoy** is a cube that moves on a track.
   - **Why:** this deepens the twist itself (*appetite control*) rather than adding generic power. The reviewer sees the difference in 30 s. It is the #3 + #5 recipe.
   - **Needs:** game code.
2. **3 worlds × 12 dishes, with par goals:** stars for health, sugar used ≤ par (par from the bot), and "no germ divided".
   - **Why:** puzzle-like mastery (#4) is the longest-playing structure on CrazyGames, and luring with limited sugar *is* a puzzle.
   - **Needs:** new stages/stars helper with par from the balance bot.
3. **Dish mutators after the campaign.** Tiers such as "germs divide on the first bite", "UV spins the other way", "blind germs, only smell" unlock one by one (Balatro stakes, #10).
   - **Needs:** new modifiers registry.
4. **Daily dish plus a weekly endless leaderboard** (#11, #12).
   - **Needs:** new daily seed and leaderboard adapter.
5. **A boss dish every 4th dish**, each with its own rule: a queen that poisons sugar it touches, a phage that eats your traps. The Mega-virus already exists (#8). Use `happytime` on each win.
   - **Needs:** exists: `happytime`; game code.

---

## 4. Anti-patterns: what makes a web game feel repetitive or "prototype-like"

From reviewer quotes ("needs content and polishing … looks like a prototype", "not unique enough"), the CrazyGames quality page, our five
games' playtests and reviews [repo], and the sources above:

**Structure**
1. **One progression track of +x% upgrades.** Numbers go up and nothing new happens. That is Naavik's diagnosis of Survivor.io's D30 at 4%.
2. **Content that ends without an endgame.** A 30-minute arc followed by "the game continues" (Brew & Banter, Yeet).
3. **An endless-only mode with no goal**, or a goal that only says "survive". Players need a finish line or a rank.
4. **Flat difficulty,** or a straight ramp with no relief. Spikes and valleys are the most common silent churn.
5. **The first upgrade after 3+ runs**, or the first new thing after 5+ minutes (Yeet's playtest).
6. **Empty time:** long glides, walks or waits with nothing to do. Yeet had "40 s of empty late-game glide".
7. **Three screens between runs.** Results → shop → menu → play. Yeet's playtest counted them; one "Again" plus an optional shop is enough.
8. **Grind walls:** prices outrun income. One price change doubled Liquid Swarm's play time.
9. **Fake choices:** dialogue options or build picks that change nothing.

**Look and feel (the "prototype" tells)**

10. Mixed art styles or resolutions, placeholder shapes, a single enemy type, and glyphs that render differently per platform (use inline SVG, as Brew & Banter learned).
11. No feedback on a success: a silent new best (Yeet's playtest), no hit-stop, no particles, no sound pitch variation.
12. Uneven audio levels, or no mute that follows the portal (`muteAudio` is handled by the platform now).
13. HUD text too small at 821×462 (Spin Brawl's 11 px "Leaders"). The platform's QA now checks ≥ 12 px.
14. Covers that are screenshots, or carry simulation text (Germ Bait's floating numbers).

**Identity**

15. **A theme swap presented as a twist,** or the genre *and* the theme of a live game (Petri Panic vs Cell Survivor).
16. **Arriving third in a fresh niche** (spinning tops: Top Clash in July, Gyroblade in September).
17. **Generic names in a crowded pattern:** "X Survivors", "X.io", "Idle X Tycoon".
18. **A look that is obviously AI-generated,** or templates with no personality (Poki's AI note).

**Monetization that reads as cheap**

19. Rewarded buttons that do nothing when the ad fails, or "No thanks" smaller than the ad button (found in 3 of our games; the platform checks it now).
20. Ads at the first break, or on navigation buttons.
21. Rewards that only an ad can reach ("poorly designed levels that can only be completed by a rewarded ad are not acceptable").
22. Login bonuses without play: they "disguise real engagement" (forums note). Reward playing, not opening the game.

---

## 5. What the platform should add (from §2–§3, ranked by how many of the five games need it)

| # | Block (kind) | What it does | Games | Notes |
|---|---|---|---|---|
| 1 | **Goals / missions / achievements** (core helper) | N active goals from a pool, progress events, rank rewards, a save shape; a "near goal" hint for the results screen | Yeet, Germ Bait, Brew & Banter, Spin Brawl, Petri | the cheapest second track; also collections |
| 2 | **Daily seed + day result + soft streak** (core helper) | seed = UTC date, one scored attempt a day, unlimited practice, a result card; a streak only if the rule conflict (§2) is settled | all 5 | already #4 in game-ideas' block list; its value grows with #3 |
| 3 | **Portal leaderboard adapter** (portal/host) | `host.leaderboard.submit(score)` for CrazyGames Leaderboards (client or server), a no-op elsewhere, faked in QA | Yeet, Germ Bait, Spin Brawl, Petri | invite-only on the portal; visibility is the reward. **Not verified** how invites are granted |
| 4 | **Stages with stars and par** (core helper) | a level list, best stars per level, unlocks; par computed by the balance bot and pinned in a test | Germ Bait, Petri, Yeet (zones) | also the base for the grid-puzzle block (#1 of game-ideas) |
| 5 | **Run modifiers / difficulty tiers** (core helper) | a registry of rule changes, unlocked after a clear, shown on the results screen | Germ Bait, Spin Brawl, Petri, Yeet | a content multiplier at almost no art cost |
| 6 | **Prestige** (in `UpgradeShop`) | reset selected upgrades for a meta currency by `k·√x` or `∛x`, a "next prestige" preview | Yeet, Brew & Banter | the math is already in upgrades-2026-09 |
| 7 | **Offline earnings** (core helper) | time away from the save, a cap, a welcome-back screen with ×2 through `rewardedButton` | Brew & Banter (and any idle game) | CrazyGames' top clicker placement |
| 8 | **Portal multiplayer services on the host** (portal) | instant multiplayer, invite link and params, join-room listener, usernames, friends | Spin Brawl | the open request D54 |
| 9 | **Dialogue scene** (scene) | speaker, portrait, typewriter, choices, flags | Brew & Banter | the open request D54 |
| 10 | **First-session timeline check** (bot/QA) | the balance bot prints the minute of the first upgrade, new element, peak and second track; `gp qa` warns past §2.1's bounds | all 5 | the platform checks the build, not the pacing, yet pacing decides Basic Launch |
| 11 | **YouTube Playables adapter** (portal) | `saveData` / `loadData`, interactive in < 5 s, bundle < 30 MiB | Yeet, future puzzles | Playables' 2026 winners are brain and draw puzzles |

## 6. Suggested edits to existing docs (not made here: this was a research-only task)

- `docs/guides/game-ideas.md`, "Already made …": add *spinning tops are crowded* (Top Clash, Jul 2026; Gyroblade, Sep 2026) and *the microbe theme is ours now* (Germ Bait).
  Under "What not to make now", add "a third spinning-top game" and "another microbe game".
- `docs/guides/game-ideas.md` and `game-design.md`: resolve the streak conflict (§2).
- `docs/guides/game-design.md` → "Web portals": add §2.1's first-session timeline and the "several tracks" rule (#2).
- `docs/research/trends-2026-09.md`, sort puzzles: add "momentum cooling in H1 2026; block +89% launches"; Playables: add "Draw & Escape leads 2026 releases".
- `docs/research/platforms-2026-09.md`, CrazyGames: add Leaderboards (invited, weekly seasons, visibility) and the Friends module. Poki: add "playable in under 3 s".
- `docs/research/crazygames-requirements-2026-09.md` §13: the "78.8% hypercasual" figure is a taxonomy artefact (other genres 0.5%).

## Not verified
- Any count of live titles beyond what a search engine indexed; the page size of tag pages.
- CrazyGames' top, new and trending pages as they look today (blocked). The third-party lists are dated April–September 2026.
- How games get invited to CrazyGames Leaderboards, and whether the Friends module is open to all games.
- Retention numbers marked [U] (hybrid-casual and idle benchmarks, "prestige ×3–5") are vendor claims.
- That any of §3's improvements moves Basic Launch metrics. Only an A/B test or a Basic Launch can tell; tune from the dashboard first (Liquid Swarm).

## Sources (all snippets unless marked "read")
- CrazyGames game pages [S-site]: [Top Clash](https://www.crazygames.com/game/top-clash), [Gyroblade](https://www.crazygames.com/game/gyroblade), [Push.io](https://www.crazygames.com/game/push-io), [Spinz.io](https://www.crazygames.com/game/spinzio), [Hand Spinner IO 3D](https://www.crazygames.com/game/hand-spinner-io-3d), [Chaos Arena](https://www.crazygames.com/game/chaos-arena), [Super Spin](https://www.crazygames.com/game/super-spin), [Blade Merge](https://www.crazygames.com/game/blade-merge), [BladeOrbit.io](https://www.crazygames.com/game/bladeorbit-io), [Cell Survivor](https://www.crazygames.com/game/cell-survivor), [Chill Reaction](https://www.crazygames.com/game/chill-reaction), [Draw Defense](https://www.crazygames.com/game/draw-defense), [Liquid Swarm](https://www.crazygames.com/game/liquid-swarm), [Nightfall Survivors](https://www.crazygames.com/game/nightfall-survivors-imo), [Tower Core Survivors](https://www.crazygames.com/game/tower-core-survivors), [Shadow Survivors](https://www.crazygames.com/game/shadow-survivors), [Bonk Survivor](https://www.crazygames.com/game/bonk-survivor-roguelike), [Burrito Bison: Launcha Libre](https://www.crazygames.com/game/burrito-bison-launcha-libre), [Kitten Cannon](https://www.crazygames.com/game/kitten-cannon), [Turbo Trail](https://www.crazygames.com/game/turbo-trail-txl), [Launch Idle](https://www.crazygames.com/game/launch-idle), [Launch Idle 3D](https://www.crazygames.com/game/launch-idle-3d), [Color Cannon Idle](https://www.crazygames.com/game/color-cannon-idle), [Idle Supermarket Tycoon](https://www.crazygames.com/game/idle-supermarket-tycoon), [Cat Snack Bar](https://www.crazygames.com/game/cat-snack-bar), [Alchemy Merge Clicker](https://www.crazygames.com/game/alchemy-merge-clicker), [Potion Merge](https://www.crazygames.com/game/potion-merge), [Incremental Epic Hero 2](https://www.crazygames.com/game/incremental-epic-hero-2), [Screw Sorting](https://www.crazygames.com/game/screw-sort---fix-match-puzzle), [Block Sort – Jigsaw](https://www.crazygames.com/game/block-sort---jigsaw-puzzle-journey), [Keyboard Obby](https://www.crazygames.com/game/keyboard-obby), [Obby: Stronger Drill, Deeper Mine](https://www.crazygames.com/game/obby-stronger-drill-deeper-mine), [99 Nights in the Forest Online](https://www.crazygames.com/game/99-nights-online), [Brainrot Tower Defense](https://www.crazygames.com/game/brainrot-tower-defense); tag pages [/t/incremental/5](https://www.crazygames.com/t/incremental/5?sorting=most-played), [/t/idle/4](https://www.crazygames.com/t/idle/4), [/t/survive/5](https://www.crazygames.com/t/survive/5), [/t/horde-survival/2](https://www.crazygames.com/t/horde-survival/2).
- CrazyGames docs [S]: [Leaderboards](https://docs.crazygames.com/sdk/leaderboards/), [Game module / Friends](https://docs.crazygames.com/sdk/game/), [Action](https://docs.crazygames.com/resources/monetizing-action/), [Clicker](https://docs.crazygames.com/resources/monetizing-clicker/), [Hypercasual & IO](https://docs.crazygames.com/resources/monetizing-hypercasual-io/), [Rewarded deep dive](https://docs.crazygames.com/resources/rewarded-ads-deep-dive/).
- Web market: [Outlook Respawn on the CrazyGames US study](https://respawn.outlookindia.com/gaming/gaming-news/hypercasual-and-puzzle-titles-dominate-99-of-web-browser-gaming), [tech-insider CrazyGames vs Poki](https://tech-insider.org/crazygames-vs-poki-vs-coolmath-games-2026/), [Poki web gaming report 2026](https://poki.com/blog/web-gaming-report-announcement-2026), [Poki State of Web Gaming 2026](https://poki.com/blog/state-of-web-gaming-report-2026), [Jang: top Poki games Jul 2026](https://jang.com.pk/en/68265-top-poki-games-for-july-2026-what-should-you-play-news), [playgama top CrazyGames Apr 2026](https://playgama.com/blog/top-games/top-crazy-games-april-2026/), [mediacube: YouTube Playables mechanics 2026](https://mediacube.io/en/blog/youtube-playables-game-mechanics), [Playables certification FAQ](https://developers.google.com/youtube/gaming/playables/support/certification_faq), [maxpowergaming: 99 Nights vs Grow a Garden](https://www.maxpowergaming.co/post/99-nights-in-the-forest-surpasses-grow-a-garden-roblox-s-september-breakout).
- Mobile: [AppMagic Casual H1 2026](https://appmagic.rocks/research/casual-report-H12026/?hl=en), [pocketgamer.biz: puzzle 44%](https://www.pocketgamer.biz/puzzle-accounts-for-44-of-casual-mobile-earnings-in-h1-2026/), [pocketgamer.biz: IAP −2%](https://www.pocketgamer.biz/mobile-gaming-iap-dipped-2-as-ad-spend-climbed-in-h1-2026/), [Deconstructor of Fun: State of Mobile 2026](https://www.deconstructoroffun.com/blog/2026/2/2/state-of-mobile-2026), [Naavik: Survivor.io vs Archero](https://naavik.co/deep-dives/survivorio-archeros-footsteps/), [MAF: Mob Control](https://maf.ad/en/blog/mob-control-analysis-hybrid-casual/), [playio: hybrid-casual economics](https://blog.playio.co/hybrid-casual-games-monetization) [U], [Supersonic: D1–D7](https://supersonic.com/learn/blog/6-ways-to-boost-your-games-retention-from-d1-d7/).
- Depth: [Xue et al. 2017, DDA at EA](https://dl.acm.org/doi/10.1145/3041021.3054170), [Duolingo streaks](https://blog.duolingo.com/how-streaks-keep-duolingo-learners-committed-to-their-language-goals/), [Balatro achievements](https://www.exophase.com/game/balatro-steam/achievements/), [Slay the Spire A20](https://www.trueachievements.com/a280165/ascend-20-achievement), [GameRefinery: seasonal events](https://pocketgamer.biz/news/77590/90-percent-grossing-mobile-games-seasonal-events), [AppMagic: Monopoly GO event](https://appmagic.rocks/research/monopoly-go-revenue-spike/?hl=en), [tech-insider: Monopoly GO stickers](https://tech-insider.org/monopoly-go-sticker-economy-mobile-monetization/), [Liquid Swarm devlog](https://mickaelbneron.itch.io/liquid-swarm/devlog/1579269/six-weeks-on-crazygames-my-incremental-roguelite-makes-31day-full-breakdown-of-whats-working-while-my-previous-three-games-flopped) [F], [Burrito Bison UI deconstruction](https://interfaceingame.com/articles/burrito-bison-launcha-libre-ui-design-process/), [A Dark Room $800k](https://www.failory.com/blog/battle-scars), [Universal Paperclips](https://en.wikipedia.org/wiki/Universal_Paperclips), [Brotato / survivors run lengths](https://rogueliker.com/bullet-heaven-games-like-vampire-survivors/), [difficulty curves in match-3](https://www.raviosoft.com/post/designing-difficulty-curves-in-word-and-match-3-games), [idle retention benchmarks](https://game-ace.com/blog/idle-game-development/) [U].
- Our repositories [repo, read]: QmaCyber/game4 `README.md`, `docs/market-research.md`, `games/yeet-the-gnome/REPORT.md`; QmaCyber/game5 `README.md`, `games/brew-and-banter/REPORT.md`; QmaCyber/game6 `docs/concept.md`, `games/germ-bait/REPORT.md`; game_platform `docs/team/retro-portal-games.md`, `docs/guides/code-games.md`, `docs/team/decisions.md`.
