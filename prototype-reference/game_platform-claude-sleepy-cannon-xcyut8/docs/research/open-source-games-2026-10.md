# What open-source games teach about design and the look (2026-10)

The owner asked to study open-source games and build what they teach into the platform (2026-10-10). Thirteen games
with readable source, mostly small web games and js13k winners, read against `docs/guides/game-design.md`,
`docs/guides/art.md`, `gp lessons`, `@gp/core/sound` and `@gp/art`. The question behind it: our games keep players 4–7
minutes (CrazyGames' bar: 10+), 1–2.4 % come back the next day (10–15 %), 26–76 % get past the first minute (80 %+).

Ideas, not code: GPL (Hextris, shapez, Mindustry), MPL (A Dark Room, BrowserQuest) and unlicensed or non-commercial
games (Casual Crusade, Cat Survivors, CLAWSTRIKE) are read for their ideas only. MIT code (2048, Tiny Yurts, Celeste's
`Player.cs`, Antimatter Dimensions, HexGL) may be adapted with its notice. The js13k rankings come from search results
(js13kgames.com was unreachable from the research session); the 2024 winners weren't found.

## The games and what their source shows

| Game | License | What the source shows |
|---|---|---|
| [2048](https://github.com/gabrielecirulli/2048) | MIT | The board is saved after every move (`js/game_manager.js`), "keep playing" after the win; a new tile is a 2 nine times in ten, so the first merge comes in 1–3 moves. A 100 ms slide, the merged tile pops to 1.2×, the new one appears after the slide; tile colour runs toward gold with value and glows from 128 up; a floating "+N" on the score |
| [Hextris](https://github.com/Hextris/hextris) | GPL-3.0 | The shake runs along the hit lane and halves every frame; score = n² × combo, with the combo window drawn as the hex's outline draining; authored wave patterns mixed into random spawns, difficulty per cleared block, not per second; the run saved after each block. Its text "How to play" is the counterexample |
| [A Dark Room](https://github.com/doublespeakgames/adarkroom) | MPL-2.0 | One button at the start ("light fire"); a stranger arrives ≈ 30 s later; each unlock announced by a character; the title itself changes (A Dark Room → A Firelit Room); each button is its own cooldown bar; the interface grows only as it is needed |
| [Tiny Yurts](https://github.com/burntcustard/tiny-yurts) (js13k 2023) | MIT | A 13-colour palette that is also the entity-type list; plucked-string sounds (Karplus–Strong); demand drawn as a ring on the farm itself; building while paused |
| [Casual Crusade](https://github.com/anttihaavikko/casual-crusade) (js13k 2023) | none | A sound for every interaction state (hover, pick, drop, invalid drop, place, score, multi) with ZzFX; shake with rotation; ring pulses; curtain transitions instead of flashes; keywords highlighted inside sentences; a relic choice after each level |
| [CLAWSTRIKE](https://github.com/remvst/clawstrike) (js13k 2025, 1st) | non-commercial | The menu drawn over the live level 1; a death goes straight to a retry; easy mode offered after 5 deaths; a jump still works 0.1 s after leaving the ground; a 0.05 s shake on an attack, a 10 px push on a hit |
| [Cat Survivors](https://github.com/js13kGames/cat-survivors) (js13k 2025, 2nd) | none | A timeline inside one run — rain at 2–4 min, snow at 6–7, night at 8–9 — that recolours the palette and adds particles; music that builds: the bass fades in over 0–30 s, chords open over 30–90 s |
| [Celeste `Player.cs`](https://github.com/NoelFB/Celeste) | MIT (that file) | 0.1 s jump grace, buffered jump input, 4 px corner correction, squash to (0.6, 1.4) relaxing at 1.75/s, 0.05 s freeze frames, directional shake |
| [shapez.io](https://github.com/tobspr-games/shapez.io) | GPL-3.0 | Each hint is a condition on the game state that pulses a highlight on the nearest valid tile in the world and moves on when met; one new building per level |
| [Mindustry](https://github.com/Anuken/Mindustry) | GPL-3.0 | The first wave waits twice the normal spacing; the player can call the next wave early |
| [Antimatter Dimensions](https://github.com/IvarK/AntimatterDimensionsSourceCode) | MIT | Offline progress re-runs the real game loop in a capped number of ticks, then shows "while you were away" from the saved state against the new one; prestige layers |
| [HexGL](https://github.com/BKcore/HexGL) | MIT | The camera pulls back as speed rises; a vignette post-process |
| [BrowserQuest](https://github.com/mozilla/BrowserQuest) | MPL-2.0 / CC-BY-SA 3.0 art | Whole-number scale (1, 2, 3) by window size, smoothing off, a sprite set per scale |

## The lessons, ranked (new to the platform unless marked)

1. **A sound for every interaction state, with variation.** Hover, pick, drop, a denied move, place, hit, hurt, pickup,
   level-up — each its own sound, ±5 % pitch, the pitch rising with a combo (Casual Crusade, Cat Survivors, CLAWSTRIKE).
   *Spot it:* the sound events of a 60 s bot run — fewer than ≈ 8 distinct sounds, an action that makes none, one sound
   at one pitch. *Fix:* ZzFX presets on the effects bus. → `gp lessons` sound.
2. **Resume where the player left off.** 2048 and Hextris save the run after every move; an unfinished board is a reason
   to come back tomorrow. *Spot it:* reload mid-run — is the run there? *Fix:* save the run state on every move, or at
   least at each break, through the host's saves. → `gp lessons` retention.
3. **Forgive the input.** A jump 80 ms after a ledge still jumps; a press 100 ms before landing fires on landing; a 4 px
   nudge round corners; hitboxes bigger than the drawn sprite (Celeste, CLAWSTRIKE). Without it: "I pressed and nothing
   happened" — the reviewers' controls complaint. → `gp lessons` controls.
4. **The scene changes during one run.** A timeline of palette, weather, particles and ambience (Cat Survivors at 2, 6
   and 8 min; A Dark Room's room warming up). It fills minutes 5–10 of a single run. *Spot it:* play frames at 0, 3, 6
   and 9 min look alike. → `gp lessons` retention.
5. **Music that builds.** Layers fade in with time or intensity (bass, then arpeggio, then drums), not only a crossfade
   between themes.
6. **Combos with growing feedback; timers drawn on the thing.** n² × combo with the window drawn on the object
   (Hextris), a demand ring on the farm (Tiny Yurts), a button that is its own cooldown bar (A Dark Room).
7. **Show one thing first; the interface grows with the game** (partly in the docs). One button at the start; hints as
   conditions pointing at a place in the world, not a "Next" button.
8. **Death to control in under a second; the menu over the live level** (partly in the docs). Instant retry; an easier
   option offered after repeated deaths, never silently applied.
9. **Authored wave patterns, a first-wave grace, waves the player can call.** Patterns mixed into random spawns; the
   first wave at 2× the spacing; "next wave now" for a bonus.
10. **Offline progress by re-running the simulation** (a known gap). Capped ticks of the real loop, then "while you were
    away", with a ×2 rewarded offer.
11. **Each tier shows in colour and glow** (already in the docs).
12. **Speed you feel through the camera:** distance or zoom follows speed (HexGL).
13. **Pixel art, if chosen:** whole-number scale, smoothing off, a small fixed palette.
14. **The juice set, with numbers** (already in `@gp/art`): freeze 0.05–0.1 s and squash 0.6/1.4 (Celeste), a 0.05 s
    shake on an attack and 0.1 s on a hit (CLAWSTRIKE), shake halving every frame (Hextris), rotational shake and curtain
    transitions (Casual Crusade).

## Libraries worth adopting

- **[ZzFX](https://github.com/KilledByAPixel/ZzFX)** (MIT, ≈ 1.2 KB): one call per sound, a web designer, used by two
  js13k winners — the candidate for a `sfx` module of named presets on the effects bus.
- **[jsfxr](https://github.com/chr15m/jsfxr)** (Unlicense): its preset names (pickup, laser, explosion, power-up, hit,
  jump, blip) as the preset vocabulary.
- **Karplus–Strong pluck** (≈ 30 lines, as in Tiny Yurts, MIT): warm UI and pickup tones.
- **[pixi-filters](https://github.com/pixijs/filters)** (MIT): glow, bloom, outline, shockwave for Pixi games.
- Study, don't adopt: LittleJS and Kontra (MIT) duplicate `@gp/art`. Avoid: Sonant-X (an NC ancestry), and code from the
  GPL, MPL and unlicensed games above.
