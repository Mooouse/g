# Game-design literature vs our guidance: what we lack, and what to change in the platform (2026-10-19)

**Asked by:** the owner, «изучи материалы по гейм-дизайну».
**Read in the repo first:** AGENTS.md, docs/guides/game-design.md, first-minute.md, art.md, uniqueness.md, game-anatomy.md,
publishing-crazygames.md, docs/research/feedback-and-metrics-2026-10.md, `gp lessons` (28 lessons), publisher/results.yaml,
packages/art/src/{fx,camera,tween}.ts, the check names in packages/kit-code/qa/suite.ts, packages/cli/src/review.ts.
**Then the web:** the books, talks and blogs in the brief (sources at the end of each section, and in §4).

**How to read this.** Each principle has:
- a status: **COVERED** (with a quote from our file), **PARTLY** (the advice is there, nothing measures it), or **MISSING**;
- **Change:** what we'd add. It is one of four kinds. **QA** is a measurable `gp qa` check (what to measure in the headless
  browser, and the threshold). **LESSON** is a `gp lessons` entry. **DOC** is a paragraph in a guide. **BLOCK** is a platform block.

**Caveats on the sources.** Several books are paywalled. Where I could not read the primary text, I used the GDC Vault
abstract or a named secondary summary, and I say so. The numbers marked *(rule of thumb)* are practitioners' figures, not
measured thresholds. Use them as starting values for checks that warn (hints). Make a check fail only once our own data
calibrates it.

---

## 0. The short diagnosis

Our guidance already covers the **design** side well. It covers the first minute, pacing from time, meta shapes, sawtooth
difficulty, dark patterns, dominant strategies and the concept gate, often more concretely than the books do. The `@gp/art`
package already ships the **juice toolkit**: `fx.hitStop` (default 80 ms), `Camera.addTrauma` (trauma², smooth noise,
decay 1.4/s), `Tweens.popIn/punch`, `ease.outBack`, `Jelly`, `fx.text`, and a count-up tween.

What the literature has and we don't is mostly **measurement and dosing of feel**, plus a **calibrated outside view**:
1. **Nothing measures how the game feels.** That covers input→response latency, whether every action is answered, how
   strongly, and whether the screen flashes or stutters on a screen change. Swink, Nijman and Jonasson/Purho treat feel as
   the product. Our QA treats it as a hint (a "flat play frame").
2. **Nothing says how much juice is enough.** The empirical work shows an inverted U: none and *extreme* both lower the
   player's experience (Kao 2020). Our art.md says "three at once is juice", with no ceiling.
3. **Our reviewer agent is not calibrated.** Swarm Smash went out with *"quality 0 blocking / 0 nice"* and was rejected for
   "overall quality" (results.yaml, 2026-10-12). Skill-atom and playtest literature (Cook, Fullerton, Lemarchand) all insist
   on a naive player, not an informed one. Our reviewer reads a 300-line brief before playing.
4. **Scope.** Sid Meier: *"One good game is better than two great games."* Our rejected games grew systems; the two most
   recent approvals (Idle Garage Evolution, Hang the Moon) are one clear rule with appealing, recognisable content.
5. **Visual-quality signals a machine can see but we don't check:** upscaled or blurry sprites (CrazyGames: "consistent
   resolution"), the default font, emoji drawn at runtime, dark or muted palettes (Poki: harder to stand out), full-screen
   flashes, and **20 games that share one UI look** from the same account.

---

## 1. Principles, grouped

### 1.1 Core loop and interesting decisions

**P1. A game is a series of interesting decisions.** There are three conditions: no option is always best, the options are
not equally attractive, and the player can make an informed choice. *Sid Meier, GDC 2012 "Interesting Decisions"
(GDC Vault); the three conditions as commonly cited by Jesper Juul; Meier's design rules collected by A. Buteau.*
- Status: **PARTLY.** The `dominant-strategy` lesson: *"a fight needs a decision every few seconds"*. The balance model
  fails a *"dead purchase"* and a *"trap"*. Nothing measures whether **offered choices** (RunChoices, shop offers, a 1-of-3
  pick) are real choices.
- Change: **QA/balance** — the "pick-rate" check from Slay the Spire's metrics-driven balancing (P3). Over the bot fuzz
  (≥ 50 seeds), log each `RunChoices`/shop offer and the pick. Flag an option picked > 60 % of the times it is offered (it
  dominates), or < 5 % (it is dead weight). Flag a run whose final build differs from the median build by < 20 % of its
  slots (no build diversity). Thresholds *(rule of thumb)*. **LESSON** `choices`: "Is any 1-of-3 offer a no-brainer? Count
  what you pick over five runs."

**P2. Find the fun first; one good game beats two great ones.** Prototype the core alone. Double a value or halve it when
tuning, so that every change teaches you something. *Sid Meier (Buteau's collection); Fullerton, Game Design Workshop
(playcentric process); Lemarchand, A Playful Production Process (find the "core" in ideation, then prove it in a
first-playable before production).*
- Status: **PARTLY.** `gp review` has a scope check: *"more than 3 systems in a game made in under a day is a `[blocking]`
  'prototype risk' unless every screen is drawn and animated"* (publishing-crazygames.md). It runs at the end, after the
  systems are built.
- Change: **DOC + gate at step 3.** A **"toy test"** before any meta: the core action alone, with no shop, story or
  progression, played for 2 minutes by an agent that has not seen the design. It must say what is fun and want to go on.
  Record it in `docs/concept.md`. **QA:** count the screens in `host.qa({ screens })` and the systems (`scopeFacts`); on
  a first submission, warn above one core + one meta track + one return hook. Swarm Smash went out with *"78 parts, 16
  synergies, 7 bosses"* and was rejected.

**P3. Metrics-driven balance: every card has a clear role; read the data with care.** *Giovannetti, "Slay the Spire:
Metrics Driven Design and Balance", GDC 2019 (abstract and Podwise recap). Mega Crit collected pick and win data from Early
Access, and the Ascension levels gave fine-grained data.*
- Status: **COVERED in spirit.** game-anatomy.md: *"Pure simulation + bot + balance test — 10 of 10"*. The model checks
  walls, grind and «plays itself».
- Change: the pick-rate and win-rate-per-offer table from P1 in `gp balance --csv`. That way the bot's fuzz says what a
  Slay the Spire dashboard would.

**P4. Skill atoms: action → simulation → feedback → model update. Burnout is the measurable failure.** *Daniel Cook, "The
Chemistry of Game Design" (Lost Garden 2007 / Gamasutra): "Burnout is a very clear signal that our game design is failing
to keep the players attention… we can measure when burnout occurs for an individual atom". Also "Loops and Arcs" (2012):
loops repeat and teach, arcs (content, story) don't repeat.*
- Status: **PARTLY.** We count *new things* over time (the balance model's goals), but not *kinds* of play. The
  `variety` lesson says it: *"gp measures: … nothing counts kinds"*.
- Change: **BLOCK + QA:** `host.seen(kind, id)`, for example `host.seen('enemy', 'shield-bug')` or
  `host.seen('verb', 'dash')`. QA's demo bot reports the distinct kinds per category at 2, 5 and 10 min, and the longest
  stretch with no new kind. Threshold from our own lesson: *"Fewer than ~4 of each, or a new kind less often than every
  3–5 minutes"*. Fail on crazygames at < 3 enemy or obstacle kinds by minute 5 in an action game. This turns the `variety`
  lesson (the most frequent judge remark) into a number.

**P5. Fun is learning; boredom is mastery or noise.** *Raph Koster, A Theory of Fun: games are pattern-learning systems.
They bore when the pattern is mastered, or when it is too hard to see at all.*
- Status: **COVERED.** game-design.md: *"Signs a game will feel repetitive: … numbers that grow while nothing new appears"*.
- Change: **DOC**, one line citing Koster under "Depth". It is the theory behind the 1–3-minute cadence we already enforce.

**P6. Kishōtenketsu: introduce, develop, twist, conclude, within a few minutes per stage.** *Koichi Hayashida via Game
Maker's Toolkit (MCV coverage). Each Mario 3D World stage introduces one mechanic, builds on it, twists it and drops it.*
- Status: **PARTLY.** We have the sawtooth and *"introduce safely → escalate → test at a peak → relief"*, which is the same
  idea at the run level. Nothing applies it to a level of a puzzle or level game.
- Change: **DOC** in upgrades.md / game-design.md: a puzzle or level game's stage set follows the 4 beats per new
  mechanic. **Balance model:** a level tagged `introduces: <mechanic>` must sit at the lowest difficulty of its group.

### 1.2 Game feel and juice: concrete numbers

**P7. Feel is real-time control plus polish; the response has an envelope (ADSR).** *Steve Swink, Game Feel (2008). Six
components: input, response, context, polish (animation, visual fx, sound, cinematic, tactile), metaphor, rules.
Pichlmair & Johansen's survey (2020) splits it into three domains. Tuning is physicality, consistency and
predictability. Juicing is amplification, making the important events stand out. Streamlining is support, helping the
game do what the player meant (coyote time, buffering, aim assist).*
- Status: **PARTLY.** Streamlining is in game-design.md (*"forgiving input (a 0.1 s jump grace, buffered presses, corner
  nudges)"*). Juicing is in art.md rule 10. Tuning (an ADSR for movement) is missing.
- Change: **DOC** "Feel" section in game-design.md with the table in P8–P13. **BLOCK** `envelope({ attack, decay,
  sustain, release })` in `@gp/art/tween`, for acceleration and turn speed. The literature uses ADSR as its vocabulary;
  today each game hand-rolls it.

**P8. Response time.** Under **100 ms** feels instantaneous (Nielsen's 0.1 s limit, after Miller 1968). Card, Moran &
Newell's human-processor model puts a perceive-and-react cycle at about 240 ms, and asks for controls that respond within
100 ms (Bayreuth lecture notes, citing Swink pp. 34 f.). Raaen et al. 2014: the median player does not detect a
motor-visual delay below **51–90 ms**. Some detect delays under 40 ms. Eg et al. 2018: quality of experience falls from
**80–100 ms**.
- Status: **MISSING.** CrazyGames' quality page: *"The game responds quickly to the player's actions."* review.ts turns
  this into a reviewer checkbox only: *"The game answers every input at once (feedback, juice)"*.
- Change: **QA `feel: input → response`.** During the demo bot and the naive touch bot, after each synthetic
  `pointerdown`/`keydown`, sample frames: canvas pixels plus DOM mutations, through `requestVideoFrameCallback` or
  `page.screencast`. Also tap `host.audio.out` with an AnalyserNode for an onset. Report the median and p90 of *input →
  first visible change* and *input → first sound onset*.
  - Threshold (fail on crazygames): **p90 visual response > 100 ms** (6 frames at 60 fps) in play. Warn above 50 ms
    for an action game.
  - On a UI button: a pressed state within 100 ms, a new screen within 1 s (Nielsen's 1 s), or a visible busy state.
  - Not measurable in a headless browser: display and touch-panel latency (say so in the report).

**P9. Hit-stop (hit pause) sells the collision.** Freeze both attacker and target for a few frames, scaled with the
damage and capped. Vibrate the hit thing during the freeze: large at first, shrinking. Shake grounded things sideways,
aerial things vertically.
- Sources:
  - Sakurai's Famitsu column (Source Gaming translation): hitstop is the same for both sides and longer for more damage,
    with a cap; projectiles get less; the vibration shrinks over the freeze.
  - critpoints.net: SF2 froze both for "like 10 frames".
  - King of Fighters XIII frame data: 7 frames light, 11 heavy (≈ 115 / 185 ms).
  - Lin et al. 2022 (arXiv 2208.06155, 19 impact features across 16 Steam games): **hit stop, sound coherence and camera
    control** are the three features whose absence "may ruin players' impact feel".
- Our numbers: `fx.hitStop(sec = 0.08)` and `explode()` uses 0.06 s, a fixed length.
- Status: **PARTLY.** art.md: *"a hit-stop on big hits (`fx.hitStop`)"*. It has no scaling, no cap and no vibration.
- Change: **BLOCK** `fx.hitStop({ strength })`: `0.03 + 0.09·strength` s, capped at 0.15 s for a single hit. A
  multi-kill sums but is capped at 0.2 s. It comes with `shakeTarget` (side to side on the ground, decaying), and the
  attacker moves at 10 % speed during the freeze *(after Sakurai; numbers are a rule of thumb, 2–9 frames)*. **DOC:** the
  table *light 2–4 frames (33–67 ms), medium 5–7 (83–117 ms), heavy or kill 8–11 (133–183 ms), never on every bullet of an
  auto-fire stream*.

**P10. Screenshake from trauma: smooth noise, shake ∝ trauma² (or ³), linear decay.** *Squirrel Eiserloh, "Math for Game
Programmers: Juicing Your Cameras With Math", GDC 2016. Implemented in Bevy's 2D example: trauma 0–1 decaying, Perlin noise
per axis and rotation.* Vlambeer's "The Art of Screenshake" (Nijman 2013) adds muzzle flash, camera kick toward the shot,
enemy knockback, permanence (corpses and shells stay), bigger bullets, and a camera lerp that leads the aim (DK Liao's
recreation index).
- Status: **COVERED.** art.md: *"shake from trauma (smooth noise that decays — never random jitter), punch on hits.
  `Camera` does all of it"*, *"`addTrauma(0.25)` for a hit, `0.6` for an explosion — the shake grows with trauma²"*.
  Defaults: 14/12 px and 0.035 rad at full trauma, decay 1.4/s.
- Missing:
  - **Permanence:** debris and decals that stay. Our rule is the opposite, *"Clear the effects when the loop stops"*. That
    rule is right for screens, but a run needs things that stay.
  - **Shake as a data channel:** Balatro's shake is tiered by score magnitude. A third-party analysis (B. Crosley) gives
    ≈ 2–4 px for 0.2 s, 3–4 px for 0.3 s and 6–8 px with rotation for 0.5 s.
  - **Accessibility:** a "screen shake" slider (0–100 %).
- Change: **BLOCK** `fx.decal()` with a capped pool of persistent marks, baked into a layer. A shake multiplier in the host
  settings: **QA** checks that a settings screen exposes it when the code calls `addTrauma`. **LESSON** `permanence`.

**P11. Juice in the right dose: the inverted U.** *Kao 2020, "The effects of juiciness in an action RPG" (Entertainment
Computing 34). Four versions: none, medium, high, extreme. Medium and High beat both None and Extreme on all measures. Hicks
et al., "Good Game Feel: An Empirically Grounded Framework for Juicy Design" (DiGRA 2018, 17 developers): juice is
redundant feedback, one action answered through several channels. Jonasson & Purho, "Juice it or lose it" (2012): tweening
or easing, squash and stretch, sound, restrained particles, shake. Schell's Lens #64 (Juiciness): "Is my interface giving
the player continuous feedback for their actions?… Juicy systems reward the player many ways at once."*
- Status: **PARTLY.** art.md rule 10: *"One of these is feedback; three at once is juice."* It has no ceiling, and nothing
  counts.
- Change: **BLOCK `feel` (a feedback sequencer).** Named presets map an event to a dosed set of channels:
  - **tap/UI:** scale punch 1.08 over 120 ms, a click at ±5 % pitch.
  - **pickup:** 6–10 particles, a rising pitch per streak.
  - **hit:** hit-stop by strength, trauma 0.15–0.3, a white flash on the target for 1–2 frames, 8–16 sparks, knockback, a
    layered sound.
  - **kill:** hit-stop, trauma 0.3–0.5, 20–40 particles, a decal, a number pop.
  - **level-up/purchase:** a count-up, confetti 40–80, `happytime`.
  - **score:** a digit roll.

  Each fired preset emits `host.events('feedback', { action, channels, strength })`. **QA:** for each player action of the
  demo bot, the channels fired within 100 ms. Fail if a *scoring* action (hit, kill, pickup, purchase) gets < 2 channels.
  Warn if the median action gets > 5 channels *and* trauma is ≥ 0.5 more than 20 % of the time (the "extreme" end).
  Particle counts *(rule of thumb)*; the `Fx` cap is already 1500.

**P12. Easing, anticipation, overshoot; UI motion in 100–400 ms.** Disney's principles as used in games (squash and
stretch, anticipation, follow-through). Material 3 motion tokens run from 50 ms (short1) to 600 ms (long4), 50 ms steps
(secondary listing). Balatro, per Crosley's analysis: hover 150 ms, a 0.4 s score roll, 50 ms digit stagger, about ±3°
random rotation on scored cards.
- Status: **COVERED for the toolkit.** art.md rule 9: *"squash and stretch with the volume kept…; anticipation and
  overshoot (`anticipate`, `ease.outBack`)…; easing on everything (`ease`, `Tweens`, `approach`)"*. `tween.ts` already
  says *"a number that counts up"*.
- Missing: duration guidance, and a **count-up / digit-roll widget** for the HUD and the results. Our results screen
  shows a final number; Balatro and Vampire Survivors make the tally the reward.
- Change: **BLOCK** `countUp(el|ctx, from, to, { dur: 0.4–1.2 s by size, tick: pitch-rising blip every 50–80 ms,
  punch at end })` used by `mountResults()`. **DOC** table: *button press 80–120 ms, panel in 200–300 ms (`outBack`), panel
  out 150–200 ms (`inQuad`), screen crossfade 250–400 ms, never a cut to white*.

**P13. Sound: layered, varied, coherent, at even levels.**
- Layer: transient + body + tail; for weight, a high click, a mid body and a low thump. Fast action wants a fast attack
  and a short tail.
- Vary: round-robin samples, ±1–2 semitones of pitch, ±1–2 dB of level. Wider pitch swings sound comic.
- Level: loudness targets of −16 LUFS (IESD, mobile) to −18 LUFS (Sony mobile), with a true peak ≤ −1 dBTP.
- Sound coherence is one of the three impact-feel features (Lin et al. 2022).
- CrazyGames: *"consistent levels, not too loud or quiet, and music that complements the visuals."*
- Sources: Violet Recording, Krotos (Horizon Forbidden West), IESD Mix Ref Levels v03.02, designingsound.org, CrazyGames
  quality page.
- Status: **PARTLY.** The `sound` lesson: *"±5 % pitch variation and a pitch that rises with a combo… music that builds in
  layers"*. QA: *"The start isn't loud: louder than −10 dBFS… in the first 3 s"* and the music grep (`E_SOUND_MUSIC`).
- Change: **QA `sound: levels over play`.** Over the demo bot's 30–60 s, on `host.audio.out`:
  - **Integrated loudness** (K-weighted, BS.1770, in an AudioWorklet): warn outside −23…−12 LUFS.
  - **Short-term max − integrated > 12 LU:** one sound far louder than the rest, as in Potion Logic's boil.
  - **Music actually audible at runtime:** a sustained tonal bed > 50 % of the time, not just `createMusic` in the code.
  - **Repetition:** if the host's `sfx()` is called with the same id and identical pitch more than 4 times in a row, hint
    "vary pitch ±1–2 semitones".

  Thresholds *(rule of thumb, browsers are not mastered rooms)*.

**P14. Camera: always point to the objective; never lose the hero.** *Scott Rogers, Level Up!, the "Three Cs" chapters
(character, camera, controls): "Always Point the Camera to the Objective", "Never Let the Character Get out of the Camera's
Sight".*
- Status: **COVERED for 2D follow.** art.md rule 11 (dead zone, look-ahead, bounds). Frankengun's FOV finding at 360×800
  is the 3D case.
- Change: **QA** for games that declare `host.qa({ hero })` (a rect getter): over the demo bot, the hero is inside the
  safe area (not under the HUD or touch controls, ≥ 8 % from the edges) ≥ 98 % of frames at all three sizes. Today this is
  caught only by the reviewer's eye, as in Frankengun's *"gun … almost entirely off the right edge"*.

### 1.3 Onboarding and UX

**P15. Seven usability pillars plus engage-ability.** The seven: signs and feedback, clarity, form follows function,
consistency, minimum workload, error prevention and recovery, flexibility. *Celia Hodent, The Gamer's Brain (2017; pillar
list from the book's table of contents). Her framework was used on Fortnite.* The book's cognitive points:
- perception is subjective: test with naive players;
- attention is limited: one new thing at a time;
- memory forgets: space the teaching and remind returning players;
- teach by doing.
- Status: **COVERED in large part.**
  - first-minute.md: *"One short hint at a time, gone when the player does it | `hints()`"*.
  - The `onboarding` lesson: *"Teach by doing, lightly: one short hint at the moment an action is first needed"*.
  - QA's 25-word gate.
  - `welcomeBack()` covers the forgetting curve.
- Missing:
  - **Signifiers.** The canvas can't be inspected for "does it look tappable". The QA "naive touch bot" is the proxy.
  - **Error prevention and recovery.** Our shop has undo, but nothing covers a destructive action without a confirm, and
    nothing makes a lost first run recoverable.
  - **Flexibility.** Remapping, the shake slider, a reduce-motion setting. CrazyGames itself wants WASD/ZQSD by
    `e.code`, and code-games.md already does it.
- Change: **QA `ux: destructive actions`.** Buttons marked `data-gp="reset"|"sell"|"quit"` must open a confirm or offer
  undo. **QA** honours `prefers-reduced-motion`: run one size with `reducedMotion: 'reduce'`, and the game must cut
  trauma/flash. Fail if a full-screen luminance jump still happens. **DOC** in first-minute.md: Hodent's seven pillars as
  the reviewer's UX checklist, mapped to our checks.

**P16. Clear short-, mid- and long-term goals on screen.** *Sid Meier (Buteau): goals at every timescale. Roblox's
onboarding docs: "Show short, mid, and long-term goals in visible places… End onboarding with a designed 'moment of joy'".
CrazyGames: "clear, reachable goals". Basic Launch tips: "make goals clear".*
- Status: **PARTLY.** `mountResults()` names the next goal. game-design.md's minute table has *"≤ 1 min the first reward"*.
  Nothing checks that the **play screen** shows a goal.
- Change: **QA `goal visible in play`.** The game declares `host.qa({ goal: () => ({ text, progress }) })`. QA checks it is
  on screen and legible (DOM or canvasUi) within 5 s of play on all sizes, and that `progress` changes within the first
  30 s. **LESSON** `goal-on-screen`: "Freeze a frame 10 s into play: can a stranger say what they are trying to do?"

**P17. Playtest with naive players; don't explain.** *Fullerton, Game Design Workshop: the playtesting chapter
(think-aloud, observe, don't help). Lemarchand: attention, his GDC 2012 "Attention, Not Immersion" built on Uncharted
playtest data. Poki: "Playtest video recordings are recommended for finding UX problems". King: "time to abandon"
as a fun metric.*
- Status: **PARTLY.** We have a playtester agent (Dread: 14 bugs) and `gp review`. But the reviewer **reads the brief
  first**: concept, twist, systems, money. That is the opposite of a naive player.
- Change: **QA/process `blind first contact`.** A third agent sees only the screenshots of the first 30 s (0, 1, 5, 10,
  30 s at 360×800, from QA) and no text from us. It answers four questions in JSON: *what is the goal? what do I press?
  what is the hook? would I keep playing (1–5)?* Compare its goal and hook with `concept.different` / `twist.explained`.
  Make it `[blocking]` on crazygames when the goal is wrong or the score is ≤ 2. It is cheap, it is repeatable, and it is
  the outside view Swarm Smash lacked.

### 1.4 Difficulty and flow

**P18. Flow, and difficulty by the player's choice.** *Jenova Chen, "Flow in Games" (USC thesis; flOw): Active Dynamic
Difficulty Adjustment, choices inside the core mechanics. A system adjusting silently "broke my 'sense of control'".*
- Status: **COVERED.** game-design.md: *"Dynamic difficulty: offer an easier option after repeated failure… the player
  chooses it; a silent adjustment punishes success"*.
- Change: **DOC**, cite Chen. Nothing else.

**P19. If a level is really hard, it should also be really short; crazy-hard levels never pay off.** King measures fun as
**time to abandon** against **time to pass**. They profile skill by wins, losses and attempts, and prune the 100 least-fun
levels continuously (GDC coverage on mobilegamer.biz: *"retention always wins"*). Level 65 was the best-converting level
and also the one that drove the most churn. King estimates level difficulty with human-like bots (Gudmundsson et al. 2018).
- Status: **PARTLY.** The balance model has walls and grind. Puzzle levels have a solver and a par. game-anatomy.md
  *"the difficulty from how often a random player finishes"*. Nothing links difficulty with **length**.
- Change: **Balance-model check `hard-and-long`.** For each stage: bot pass rate per attempt, and the median attempt
  length. Warn on a stage with pass < 30 % and attempt > 90 s, or a pass rate that drops by > 40 points from one stage to
  the next (a spike). Thresholds *(rule of thumb, King's principle)*. **LESSON** `hard-is-short`.

**P20. Skill expression: a skilled player should beat a naive one by a lot.** This follows from Koster, Cook and the
`dominant-strategy` lesson.
- Status: **PARTLY.** `balance` lesson: *"two bots: the average one for the curve, a skilled one"*. The naive touch bot
  exists in QA. Nothing compares the two.
- Change: **QA `skill gap`.** Run the naive touch bot and the demo bot for the same 60 s on the same seed. Compare their
  score or progress. Warn if naive ≥ 80 % of demo (the game plays itself), or if naive dies before 12 s on the first run
  (already a gate).

### 1.5 Progression and meta

**P21. Frequent, gradual rewards inside a run; a meta where no run is wasted.** One analysis of Vampire Survivors (J. Boger)
counts the elements:
- many tiers (8 for weapons, 5 for passives), so a **reward about every 23 s**;
- pauses on level-up, so the player gets a rest;
- slot-machine chests, with the first ones scripted generous;
- gold that carries over, so *"no run feels wasted"*.

The Conversation on the gambling heritage: *"players only see ads if they choose to in exchange for in-game bonuses"*.
- Status: **COVERED for meta.** upgrades.md and the balance model: first purchase within two runs, meta ≥ 10 min.
  game-design.md: *"Meta progression carries the session"*. **MISSING for in-run reward cadence.**
- Change: **QA `reward cadence`.** From the demo bot's first 5 min, the gaps between `host.happytime()` / `host.reward()`
  events (a new event for level-ups, pickups that matter, unlocks). Report the median gap and the longest. Warn on a median
  > 60 s or a longest gap > 150 s in action, idle and roguelite. A puzzle counts stage clears. Thresholds *(rule of thumb;
  VS ≈ 23 s, our first-minute "a reward within 15 s")*.

**P22. Visible progress: the change shows on the thing.** *Schell, Lens of Visible Progress; our own lesson.*
- Status: **COVERED.** The `visible-progress` lesson: *"Every tier changes the sprite (size, parts, glow)"*.
- Change: **QA**, cheap. `host.qa({ tierFrame(tier) })` renders the hero at tier 0 and tier max. The perceptual difference
  must be ≥ 15 % of the hero's pixels. Today this is only the reviewer's eye.

### 1.6 Retention and F2P ethics

**P23. Retention is decided in the first session, then by the meta.**
- Supercell tracks D1/D7/D30 and kills about 9 games for each one it releases. Squad Busters reached 61 % D1 and 38 % D7
  in its second beta and was later shut down (pocketgamer.biz).
- Clash of Clans' team: *"we've worked very hard on our tutorial. Improving this has boosted our retention"*.
- CrazyGames' Basic Launch page: playtime 10+ min, D1 10–15 %, conversion 80 %+, *"load in under 10 seconds, build size
  below 20 MB"*. Tips: *"cut long intros so players reach gameplay within seconds"*, *"daily hooks like login bonuses or
  quests; save player progress; and fix bugs"*.
- Status: **COVERED, and ahead of the literature in specifics:** first-minute.md's gates, `dailyStreak`, `welcomeBack`,
  `saveRun`, the session-end hook.
- Change: none beyond §2.

**P24. Dark patterns: temporal (grinding, playing by appointment), monetary (pay to skip), social (social pyramid
schemes).** *Zagal, Björk & Lewis, "Dark Patterns in the Design of Games" (FDG 2013).*
- Status: **COVERED.** game-design.md: *"No dark patterns: no energy, no loss-framed daily streaks…"*. Also *"Rewarded ads
  are an offer, never a toll"*, enforced by `host.rewarded()`.
- Change: **DOC**, cite Zagal et al.; add "playing by appointment" explicitly. A daily that expires in hours is
  appointment play. Our UTC daily that waits a day is fine.

### 1.7 Art direction and readability

**P25. Silhouette first; a hierarchy between gameplay and effects; visual noise adds up.**
- Riot, "Clarity in League": *"silhouettes … the single most important thing"*. Facing direction should read from the
  silhouette. *"Visual noise adds up quickly and can make it difficult to react."*
- Overwatch: *"big, bold silhouettes"* (Petras).
- Status: **COVERED.** art.md rules 2, 7: *"Silhouettes first. Fill the sprite with one colour: can you tell what it is"*,
  *"Value first, hue second… ΔL ≥ 0.12"*.
- Change: **QA `readability under effects`.** Use the busiest frame of the demo bot (max `fx.busy`) and the declared
  `hero` rect. Fail if particles or effects cover > 40 % of the hero's rect for > 0.5 s. Warn if the luminance contrast
  between the hero and a ring around it falls under ΔL 0.12 (the `checkPalette` number, now on the real frame).

**P26. Bright, colourful, one style; muted, dark and pixel art struggle on web portals.** *Poki, "What makes a
high-quality browser game" (2026): "Bright, colourful 2D or 3D assets tend to earn more average plays… Muted palettes,
pixel art, and dark colours are described as harder to stand out with"; "All visuals should share one rendering style".
CrazyGames: "high resolution, consistent resolution throughout, free of… compression artifacts"; "visual style
internally consistent".*
- Status: **PARTLY, with a tension.** art.md rule 1 offers moody palettes (`neon`, `forge`, `crypt`, `haunt`). Kettlebot's
  redesign asked for *"тёмный navy/charcoal"*. Poki's data says dark and muted are harder. The two approvals used bright
  content (painted cars) and a clear night-sky mobile.
- Change:
  - **QA hint `look: brightness and colour`.** On the play frame, the mean OKLCH L and chroma. Hint if L < 0.32 or
    chroma < 0.04 over 70 % of the frame, so dark *and* muted.
  - **DOC** in art.md: a dark scene must carry bright, saturated accents on everything the player acts on.
  - **QA `look: one resolution`.** Instrument `CanvasRenderingContext2D.drawImage` and the `<img>` natural size against the
    drawn size × DPR. Warn when a sprite is drawn upscaled > 1.3× its source (blur), or when sprites in one frame differ
    in texel density by > 2× (mixed resolutions). This is CrazyGames' explicit "consistent resolution", and it can be
    measured.
  - **QA `look: no compression artifacts`.** For `gp art` WebP files, quality ≥ 80 and blockiness (8×8 DCT edge energy)
    under a threshold.

**P27. Type: a font of its own, legible, few families.** *CrazyGames covers guidance: a font that fits the game, not "Times
New Roman"; legibility at DPR 1 (gameplay requirements).*
- Status: **PARTLY.** QA has 12 px text at the portal's frames. Nothing checks the family.
- Change: **QA `look: fonts`.** Collect the computed `font-family` of visible DOM text and canvas `ctx.font` values.
  Warn when a browser default is used (serif/`Times`, a bare `sans-serif`, `Arial` as the first family). Warn above 3
  families. Fail if emoji are drawn in play or HUD (`fillText` / text nodes with `\p{Extended_Pictographic}`). That
  promotes `drawn-icons` (today *"gp review: emoji in the code's strings (a hint)"*) to a runtime check.

### 1.8 Polish checklist (what the literature calls "finish"), mapped

| Polish item | Source | Our status | Check |
|---|---|---|---|
| Every action answered within 100 ms, ≥ 2 channels | Swink; Nielsen; Hicks; CrazyGames "responds quickly" | MISSING (reviewer box) | QA P8 + P11 |
| Hit-stop scaled by strength | Sakurai; Lin 2022 | PARTLY (fixed 80 ms) | BLOCK P9 |
| Trauma shake, smooth noise, a slider | Eiserloh; Nijman | COVERED (no slider) | QA: setting present |
| Permanence (decals, corpses, shells) | Nijman | MISSING | BLOCK `fx.decal` |
| Count-up / digit roll on score and results | Balatro (analysis); VS | MISSING widget | BLOCK `countUp` |
| Anticipation, squash, overshoot | Disney; art.md | COVERED | — |
| UI motion 100–400 ms, crossfades, no white flash | Material; our `smooth` lesson | PARTLY (lesson only) | QA flash detector (§2) |
| Layered, varied SFX; even loudness; music audible | IESD; CrazyGames aesthetics | PARTLY (start loudness) | QA P13 |
| Silhouette, effects never hide the hero | Riot | PARTLY | QA P25 |
| One resolution, no upscaled sprites, no artifacts | CrazyGames aesthetics | MISSING | QA P26 |
| Own font, ≤ 3 families, no emoji | CrazyGames covers; our lesson | PARTLY | QA P27 |
| Goal on screen in play | Meier; Roblox; CrazyGames | PARTLY | QA P16 |
| Same physics at 60/144/165 Hz | CrazyGames gameplay req. | review box only | QA §2 S9 |
| Reduced motion / shake setting honoured | Hodent "flexibility" | MISSING | QA P15 |

---

## 2. Why polished-looking games still get rejected

### 2.1 What the reviewer sees in the first two minutes

CrazyGames' QA *"plays your game … to check that it works smoothly, meets our quality standards, and is fun to play"* (FAQ).
Their written guidelines (the quality page) have **no numbers**, so the reviewer judges from impressions. Read with our 22
verdicts and the literature, the impressions form in this order. Each has a check a machine can run.

| # | When | Signal the reviewer gets | What it reads as | Automatic check (headless) | Exists? |
|---|---|---|---|---|---|
| S1 | 0–3 s | Load to something moving; a Play button that answers | "works smoothly" | `playReadyMs` ≤ 3 s, clicks to gameplay ≤ 1 | ✅ first-minute gates |
| S2 | 0–10 s | **Is the screen alive?** Idle motion, depth, light, or a still flat frame | "prototype" | play-frame motion without input: ≥ 2 % of pixels change per second in the play area; the `look: depth` hint promoted to a warning on crazygames | ◐ depth hint only |
| S3 | first tap | **Does the first input feel like something?** Response time, sound, particles, a squash | "responds quickly", "fun" | P8 latency p90 ≤ 100 ms; P11 ≥ 2 feedback channels on the first scoring action | ✗ |
| S4 | 0–30 s | Can they tell the goal and the controls without reading? | "clear goals", "easy to learn" | P16 goal visible; ≤ 25 words; touch controls at frame 1; P17 blind first contact | ◐ words/controls ✅, goal/blind ✗ |
| S5 | 0–60 s | Style consistency: fonts, resolutions, icon style, platform sheets vs game art | "mixed art styles", "looks like a prototype" | P26 texel density, P27 fonts and emoji at runtime; themed platform sheets compared with the game's palette: the dominant colours of the language sheet / results / welcome-back must be within ΔE 20 of the play frame's palette | ◐ screenshots only |
| S6 | 0–60 s | Sound: is there music, are levels even, any harsh sound | "audio quality" | music audible at runtime, integrated loudness, short-term spike (P13) | ◐ start loudness, code grep |
| S7 | 0–120 s | Screen transitions: flashes, jumps, jank in the busiest moment | "not smooth" (Rivet, Sigil) | **flash detector:** a frame-to-frame mean-luminance jump > 0.35 over > 50 % of the frame on a screen change outside an explosion; > 3 such flashes in any 1 s (WCAG 2.3.1) fails; fps at 4× CPU | ◐ fps ✅, flash ✗ |
| S8 | 30–120 s | **Variety:** a second enemy kind, a new verb, a change of place | "repetitive", "boring tasks" | P4 `host.seen` kinds by minute 2 and 5 | ✗ |
| S9 | any | Physics at 144 Hz (the reviewer's own monitor) | "bugs or broken mechanics" | run the demo bot twice on the same seed, rAF at 60 Hz and at 144 Hz (virtual clock, as `gp video` does). The sim state hash at t = 20 s must match (fixed step) or score within ±2 % | ✗ (review box) |
| S10 | 60–120 s | The meta and side screens the reviewer opens: finished, or a list of text rows? | "needs content and polishing" | every declared screen: text-only ratio (text pixels ÷ non-background pixels > 70 % → hint), the stock-shop look, the emoji check | ◐ screens opened, not judged |
| S11 | at once, across submissions | **Does it look like the account's other 20 games?** The same HUD pill, results card, language sheet, fonts | "asset flip" / template; a shared "platform look" (feedback research §3.2: *"Possible causes: an account that sent 13 games in 5 days… a shared 'platform look'"*) | **sameness check:** perceptual hash (dHash plus a colour histogram) of title, HUD crop, results and language sheet against a registry of every game we submitted (`publisher/looks/`). Fail when a screen is within Hamming 8/64 of another game's | ✗ |
| S12 | the store tile | Cover and title promise vs the game | "name and imagery… accurately reflect the gameplay" | `gp covers` 200 px score ✅; cover hero = twist ✗ (reviewer) | ◐ |

### 2.2 Why "polished" isn't enough

Polish has two parts. **Production values** are lights, painted sprites, a glass HUD. **Feel** is response, feedback and
dosing. Our recent rejections had the first and lacked evidence of the second, or buried it under scope:
- **Swarm Smash** (rejected 2026-10-12) had *"a ≈ 33-min run… 78 parts, 16 synergies, 7 bosses; quality 0 blocking / 0
  nice"*. Our reviewer passed it; the portal didn't. The literature's answer is a naive player (P17) and a toy test of the
  core (P2), not more systems.
- **The approvals since 10-11:** Idle Garage Evolution has recognisable, appealing content (50 real-looking painted cars)
  on one clear loop. Hang the Moon has one rule and a clean look. Schell's Lens of **Inherent Interest** and Poki's "bright,
  colourful" both point there: a reviewer forms the "quality" impression from *what* is on screen as much as from how it
  is rendered.
- **Account-level signals.** Sending many games in a few days, in one UI skin, from one platform, reads as a template
  factory. No game-level QA can see this; only S11 and the submission pacing in weekly-loop.md can.

---

## 3. Top 10 platform changes, ranked by expected impact on approval

The ranking weighs three things: evidence that the signal decides "overall quality" (our 22 verdicts plus the literature),
how many of our rejections it would have caught, and effort (S/M/L).

| Rank | Change | Kind | Why (evidence) | Effort | Where |
|---|---|---|---|---|---|
| **1** | **Blind first-contact playtest plus reviewer calibration.** A third agent sees only the first 30 s of screenshots and answers goal, controls, hook and "keep playing 1–5"; a wrong goal or ≤ 2 is `[blocking]`. Calibrate `gp review` by re-running it blind on 6 approved and 6 rejected past builds; publish its agreement rate in review-brief.md | QA + process | Swarm Smash: reviewer 0/0, portal rejected; 13 of 22 answers were "overall quality"; Fullerton, Lemarchand, Poki and King all measure naive players | M | `packages/cli/src/review.ts`, new `gp review --blind`, `publisher/results.yaml` (builds to replay) |
| **2** | **`feel` feedback sequencer plus the response/feedback QA gate.** Dosed presets (tap, pickup, hit, kill, level-up, score) on `@gp/art` (hit-stop by strength, trauma, particles, a layered sound, count-up). They emit `'feedback'` events. QA: p90 input→visual ≤ 100 ms; ≥ 2 channels on scoring actions; an "extreme" warning | BLOCK + QA | CrazyGames *"responds quickly"*; Swink; Nielsen 0.1 s; Lin 2022 (hit-stop, sound, camera decide impact feel); Kao 2020 inverted U; our `animation` lesson is in 5 games' feedback | M | `packages/art/src/feel.ts` (new), `fx.ts` (scaled hitStop), `packages/kit-code/qa/suite.ts`, the template's `art.ts` |
| **3** | **Account sameness check plus a per-game UI skin.** Perceptual hashes of title, HUD, results and language sheet against all our past games; fail when near-identical. The platform screens take the game's palette by default (no stock slate and yellow pill) | QA + BLOCK | feedback research §3.2: the dense batch (13 in 5 days, 2 approved) shared a platform look; three remakes in one repo; the `themed-platform-screens` lesson | S–M | `publisher/looks/`, `suite.ts`, `results-ui.ts`, `lang-picker.ts`, `welcome.ts` |
| **4** | **Scope gate at step 3: the toy test plus a systems budget for a first submission** (one core, one meta track, one return hook; more only if each screen is drawn and animated). Validate warns from `scopeFacts` at `gp validate`, not only at review | DOC + validate | Meier *"one good game"*; *"find the fun first"*; 5 of 13 quality rejections were broad systems games built in 1–3 h; both recent approvals are single-rule | S | `AGENTS.md` step 3, `review.ts` `scopeFacts` → `packages/spec` warning `W_SCOPE` |
| **5** | **Runtime visual-quality checks:** upscaled or mixed-resolution sprites (instrumented `drawImage`), default or too many fonts, emoji drawn at runtime, WebP artifacts, a dark-and-muted play frame hint, themed sheets within ΔE 20 of the game palette | QA | CrazyGames aesthetics (*"consistent resolution… free of compression artifacts… internally consistent"*); Poki on bright vs muted; our `drawn-icons`, `art-direction` and `themed-platform-screens` lessons | M | `suite.ts` (an init script that wraps the 2D context), `packages/art/src/assets.ts` |
| **6** | **Flash and transition detector plus reduced-motion.** Full-screen luminance jumps on screen changes; WCAG 3 flashes/s; a run with `prefers-reduced-motion` must cut shake and flash; a shake slider when `addTrauma` is used | QA | Rivet Clash *"вспышка экрана при выборе и в меню"*; Sigil Clash's burn to white; Hodent "flexibility"; our kids rule *"at most 3 flashes per second"* not applied to 13+ | S | `suite.ts`, `camera.ts` (global multiplier), the settings template |
| **7** | **Variety and reward-cadence counters:** `host.seen(kind, id)` and reward events. QA reports distinct kinds at 2, 5 and 10 min and the in-run reward gaps; fails at < 3 enemy or obstacle kinds by min 5 (action), warns on a median reward gap > 60 s | BLOCK + QA | `variety` is the most frequent judge remark (lesson: *"nothing counts kinds"*); Cook's burnout per atom; VS ≈ 1 reward / 23 s | S–M | `packages/core/src/host.ts`, `suite.ts`, `balance-model.ts` |
| **8** | **Audio levels over play:** integrated loudness (−23…−12 LUFS window), a short-term spike > 12 LU, music audible at runtime > 50 % of play, a same-sample-same-pitch repetition hint | QA | CrazyGames: *"consistent levels… music that complements"*; IESD −16 / Sony −18 LUFS mobile; music missing in 6 of 10 second-batch rejections; Potion Logic's loud boil | M | `suite.ts` (AudioWorklet K-weighting on `host.audio.out`), `@gp/core/sound` (sfx id logging) |
| **9** | **Refresh-rate determinism and the hero-in-view check:** the demo bot at 60 vs 144 Hz on one seed must agree; the declared hero inside the safe area ≥ 98 % of frames at every size | QA | CrazyGames gameplay requirement (*"physics… consistently across… 144 Hz, 165 Hz"*), today a review checkbox; Rogers' camera rules; Frankengun's off-screen gun | S–M | `suite.ts` (virtual clock from `gp video`), `host.qa({ hero })` |
| **10** | **Decision-quality metrics in `gp balance`:** offer pick rates over the bot fuzz (> 60 % dominant, < 5 % dead), build diversity, the hard-and-long stage check, the naive-vs-demo skill gap | balance + QA | Meier and Juul on interesting decisions; Slay the Spire's metrics-driven balance; King: *"if a level is really hard, it should also be really short"*; our `dominant-strategy` lesson relies on *"a bot strategy is yours to write"* | M | `packages/core/src/balance-model.ts`, `balance.ts`, `RunChoices`/`UpgradeShop` logging |

**New `gp lessons` entries to add with these:**
- `feel-response`: an action that answers late or with one channel only.
- `juice-dose`: everything shakes, so nothing reads.
- `permanence`.
- `goal-on-screen`.
- `choices`: a 1-of-3 that is a no-brainer.
- `hard-is-short`.
- `sameness`: our games look like each other.
- `bright-accents`: a dark, muted frame.

Each gets the "gp measures" line pointing at the new check.

**Doc paragraphs** (one each, with citations):
- game-design.md: a "Feel" section (the P8–P13 numbers), Koster and Cook under Depth, Meier's interesting-decision
  conditions, Zagal's dark-pattern names.
- art.md: hit-stop scaling (Sakurai), juice dosing (Kao), permanence (Nijman), the bright-accent rule (Poki).
- first-minute.md: Hodent's seven usability pillars mapped to our checks.
- publishing-crazygames.md: §2's signal table.

---

## 4. Sources

**CrazyGames, Poki and other portals**
- CrazyGames quality guidelines — https://docs.crazygames.com/requirements/quality/
- CrazyGames gameplay requirements — https://docs.crazygames.com/requirements/gameplay/
- CrazyGames FAQ — https://docs.crazygames.com/faq/
- CrazyGames Basic Launch metrics — https://docs.crazygames.com/resources/basic-launch-metrics/
- CrazyGames covers — https://docs.crazygames.com/requirements/game-covers/
- Cinevva CrazyGames guide (third-party, the "looks like a prototype" anecdote) — https://app.cinevva.com/guides/publish-game-crazygames
- Poki, "What makes a high-quality browser game" — https://poki.com/blog/what-makes-high-quality-browser-game
- Roblox onboarding — https://create.roblox.com/docs/production/game-design/onboarding

**Talks**
- Sid Meier, "Interesting Decisions" (GDC 2012) — https://gamedeveloper.com/design/video-sid-meier-explores-interesting-decisions-in-gameplay
- Juul on the conditions — https://jesperjuul.net/text/justwhatisit.html
- Sid Meier's rules (A. Buteau) — https://www.antoinebuteau.com/lessons-from-sid-meier/
- Giovannetti, Slay the Spire metrics (GDC 2019) — https://www.gdcvault.com/browse/gdc-19/play/1025731 · https://gdconf.com/news/learn-slay-spires-successful-metrics-driven-approach-game-balancing-gdc-2019
- Eiserloh, "Juicing Your Cameras With Math" (GDC 2016) — https://www.gamedeveloper.com/programming/video-sprucing-up-cameras-with-math
- Bevy's trauma shake example — https://bevy.org/examples/camera/2d-screen-shake/
- Nijman, "The Art of Screenshake" (recreation) — https://dkliao.itch.io/the-art-of-screenshake-recreation/devlog
- Jonasson & Purho, "Juice it or lose it" — https://www.gdcvault.com/play/1016487/juice-it-or-lose (as cited in docs/research/upgrades-2026-09.md)
- Lemarchand, "Attention, Not Immersion" (GDC 2012) — https://gdcvault.com/play/1015464/Attention-Not-Immersion-Making-Your
- GMTK on kishōtenketsu (MCV) — https://www.mcvuk.com/development/video-nintendos-level-design-secrets-in-four-steps

**Hit-stop**
- Sakurai, translated by Source Gaming — https://sourcegaming.info/2015/11/11/thoughts-on-hitstop-sakurais-famitsu-column-vol-490-1/
- critpoints.net — https://critpoints.net/2017/05/17/hitstophitfreezehitlaghitpausehitshit/
- KOF XIII frame data — https://srk.shib.live/w/The_King_of_Fighters_XIII/Character_States/Hitstun_Blockstun_state

**Game-feel research**
- Lin et al. 2022, impact feel — https://arxiv.org/abs/2208.06155
- Pichlmair & Johansen 2020 survey — https://arxiv.org/abs/2011.09201
- Hicks et al. 2018 (DiGRA) — https://dl.digra.org/index.php/dl/article/view/936
- Kao 2020 (summaries) — https://www.goodreads.com/author_blog_posts/19932694-the-effects-of-juiciness-in-an-action-rpg-new-study
- Swink's six components — https://en.wikipedia.org/wiki/Game_feel
- Card/Moran/Newell timing (lecture notes) — https://medienwissenschaft.uni-bayreuth.de/wp-content/uploads/GxD-07-Interfaces.pdf

**Latency and response time**
- Raaen 2014 (Simula) — https://web-backend.simula.no/sites/default/files/publications/files/paper_5.pdf
- Eg et al. 2018 — https://www.uni-marburg.de/en/irtg1901/study-program/seminars/eg-et-al-2018-2.pdf
- Nielsen's response-time limits — https://www.nngroup.com/videos/3-response-time-limits-interaction-design/

**Books (via secondary sources)**
- Schell's lenses (Lens #64 text) — https://cgdc.org/?p=3902 · https://notesbylex.com/interest-curve
- Koster, A Theory of Fun — https://oreilly.com/library/view/theory-of-fun/9781449363208
- Rogers, Level Up! (table of contents) — https://oreilly.com/library/view/level-up-the/9781118877197
- Hodent, The Gamer's Brain (pillars) — https://sactx.aspendiscovery.org/GroupedWork/86f80aa1-3da1-e4af-6534-e32dc98de4e2-eng/Home · https://uxpod.com/episodes/competence-autonomy-relatedness-celia-hodent-on-games-design.html

**Lost Garden**
- Cook, "The Chemistry of Game Design" — https://www.gamedeveloper.com/design/the-chemistry-of-game-design
- Cook, "Loops and Arcs" — https://lostgarden.com/2012/04/30/loops-and-arcs

**Flow, difficulty, F2P**
- Chen, flOw — https://en.wikipedia.org/wiki/Flow_(video_game)
- King's definition of a good level — https://mobilegamer.biz/how-king-defines-a-good-candy-crush-saga-level-and-why-it-constantly-prunes-the-bad-ones/
- Gudmundsson et al. 2018 — https://www.gwern.net/doc/reinforcement-learning/imitation-learning/2018-gudmundsson.pdf
- Supercell retention — https://www.pocketgamer.biz/1-7-and-30-day-retention-rates-are-key-says-tablet-first-supercell · https://pocketgamer.biz/pressure-to-launch-a-new-game-led-to-squad-busters-global-release
- Zagal, Björk & Lewis 2013 — https://research.chalmers.se/en/publication/177148

**Games analysed**
- Vampire Survivors analysis — https://jboger.substack.com/p/the-secret-sauce-of-vampire-survivors
- The Conversation on Vampire Survivors — https://theconversation.com/vampire-survivors-how-developers-used-gambling-psychology-to-create-a-bafta-winning-game-203613
- Balatro feedback analysis (third-party) — https://blakecrosley.com/guides/design/balatro
- LocalThunk interview — https://toucharcade.com/2024/03/18/balatro-interview-mobile-port-localthunk-dlc-plans-updates-new-jokers-demo-feedback/

**Art direction**
- Riot, "Clarity in League" — https://riotgames.com/en/news/dev-clarity-in-league
- The Art of Overwatch (GDC 2017) — https://gdcvault.com/play/1024268/The-Art-of-Overwatch-Evolving

**Audio**
- IESD Mix Ref Levels — https://www.audiogang.org/wp-content/uploads/2015/04/IESD-Mix-Ref-Levels-v03.02.pdf
- Loudness in game audio — https://designingsound.org/2013/02/loudness-in-game-audio/
- SFX design for games — https://violetrecording.com/how-to-design-sound-effects-for-games/
- Horizon Forbidden West case study (Krotos) — https://www.krotosaudio.com/?p=1039824

**Motion timing**
- Material motion — https://material.io/design/motion/customization.html

**Not verified here**
- The primary texts of Schell, Fullerton, Sylvester, Lemarchand and Hodent (paywalled; used via tables of contents, lens
  excerpts and summaries).
- Meier's talk video (the three conditions are Juul's citation).
- Balatro's numbers: they come from a third-party analysis, not LocalThunk.
- Whether CrazyGames' reviewers weigh account-level sameness: this is inferred from our batch data, not stated by them.
- Every threshold marked *rule of thumb*: needs calibration on our own games before it fails a build.
