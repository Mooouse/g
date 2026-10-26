# Do the new quality gates separate rejected from approved? (calibration, 2026-10-19)

The platform at `claude/sleepy-cannon-xcyut8` 54f3bf4 (the look checks, the first-minute loss, the HUD overlap, the title's
choices, magnified bitmaps, the system font, the sound section) against five of our CrazyGames submissions. Each repository was copied
into a scratchpad and pointed at the local checkout (`scripts/setup.sh` with `GP_PLATFORM`; Hang the Moon's older
`scripts/gp.sh` through a `../game_platform` link), then the full `scripts/gp.sh qa` and `scripts/gp.sh review` ran. No game
was changed, and every game ran on the current platform with no API drift.

| Game | Build | CrazyGames' answer |
|---|---|---|
| Idle Garage Evolution (game19) | **1.0.0 296fb52**, the build that was approved (HEAD 1.3.6 eb00f36 ran too) | approved for Basic Launch 2026-10-12 |
| Hang the Moon (game7) | 2.0.1 0acdfec | approved again 2026-10-11 |
| Candle Crypt (game9) | 1.7.2 b5914f2 | rejected, overall quality, 2026-10-12 |
| Swarm Smash (game20) | 1.2.0 7a236d9 | rejected, overall quality, 2026-10-12 |
| Velvet Domino Rogue (game6) | v3 c3665c4 (whether v2 or v3 was submitted is not recorded) | rejected, overall quality, 2026-10-18 |

## The table

✗ fails, ⚠ warns, ✓ passes. The numbers are the worst of all sizes and screens.

| Check | Garage 1.0.0 ✅ | Hang the Moon ✅ | Candle Crypt ❌ | Swarm Smash ❌ | Velvet Domino ❌ |
|---|---|---|---|---|---|
| QA total (54f3bf4) | 305 / 5 failed | 286 / 23 failed | 333 / 4 failed | 390 / 18 failed | **375 / 0 failed** |
| E_QA_DESKTOP_EMPTY (one colour / featureless / largest area) | ✓ 39 % / 52 % / 18 % | ✓ 31 % / 57 % / 5 % | ✓ 65 % / 67 % / 23 % on the full run; ✗ on the `--failed` re-run: the map overlay at 821×462 was 77 % #000000 (flaky) | ✗ the settings screen 77 % (1280×720) and 70 % (821×462) #000011 | ✓ 35 % / 43 % / 10 % |
| E_QA_HERO_SMALL | not declared | not declared (a puzzle) | not declared; the screenshot gives ≈ 40 px ≈ 5.5 %, so it **would fail** | not declared; the ship is ≈ 60 px ≈ 8 % | not declared (a card game) |
| E_QA_GLYPH_ICON | ✗ 5 screens: ◀ ▶ pager buttons, and the arrow in "Power ×1.0 → ×1.1" | ✗ 8: "▶ Play", "★ 0" wallet, ★ on the platform shop, and the arrow in "Rods tip 1° further → …" | ✗ 1: **only** the arrow in "The Drowned Catacombs → the lich" | ✗ 14: ▶ ★ in `span.ic` on every screen | ✓ |
| E_QA_FIRST_RUN_LOST | ✓ | ✗ "the results 34.4 s after" — **a night won** by the random taps (`roundEnd({ won: true })`) | ✓ | ✓ (but the older idle check fails: the run ends after 9 s untouched) | ✓ |
| E_QA_HUD_OVERLAP | ✓ (HEAD 1.3.6 ✗ in fr: an achievement toast over the results title) | ✓ | ✓ (its HUD is canvas text, which QA doesn't sample) | ✗ fr 360×800: the hint covers "Tout placer" | ✓ |
| W_TITLE_CHOICES (> 6) | ⚠ 8 (HEAD 9) | 6 | ⚠ 9 | ⚠ 7 | ⚠ 7 |
| E_QA_BITMAP_MAGNIFIED | ✓ | ✓ | ✗ a 64-px canvas at 16–32×: **its radial glow sprite** | ✓ | ✓ |
| W_SYSTEM_FONT (> 50 %) | ⚠ 100 % system-ui | ⚠ 100 % (Trebuchet MS 99 %) | ⚠ 100 % ui-monospace (DOM; its pixel font is drawn bitmaps) | 0 % (Swarm Pixel, loaded) | ⚠ 100 % (system-ui 90 %, Georgia 10 %) |
| Sound section | no warning (HEAD: the same sound 6× in a row) | ⚠ taps 36 %, keys 30 % answered | none (no `createMixer`: effects against music not measured) | ⚠ round:end silent (0/1) | ⚠ round:end silent (0/1) |
| gp review: music / glyphs in the code / scope | ✓ / ✗? / 16 h, 1 system | ✓ / ✗? / 242 h, 2 | declared synth / ✗? / 271 h, 1 | ✓ / ✗? / 27 h, 3 | ✓ / ✗? / 8.2 h, 3 |
| Screens declared to QA | 12 | 10 | 19 | 20 | 16 |

The review sheet and brief were written for all five. Scoring the sheet takes a second agent, and none was run here.

## What separates, and what doesn't

**Signals, all weak at n = 5:**
- **E_QA_DESKTOP_EMPTY** fails on 2 of 3 rejected games and on neither approved one. It fired only on side screens,
  though: Swarm Smash's settings and Candle Crypt's map overlay (and that one only on a re-run). On the screens the portal
  judges (first screen, play, results) the approved games stay under 39 % / 57 % / 18 %, and Candle Crypt reaches
  65 % / 67 % / 23 %. The thresholds are fine. Candle Crypt's dark play frame comes closest.
- **The sound section's "round:end silent"** fires on 2 of 3 rejected games and neither approved build.
- **The number of screens:** 16–20 on the rejected games, 10–12 on the approved ones. No check uses this yet (below).

**False alarms, now fixed** (each fired for something no reviewer minds):
1. **An arrow in running text** ("×1.0 → ×1.1", "Catacombs → the lich") counted as an icon on both approved games, and it
   was the only glyph Candle Crypt had. Now an arrow between two words or numbers is typography. An arrow alone or at the
   end of a label ("← Back", "Next →") and ▶ ◀ still count (`TEXT_ARROW_SOURCE`, @gp/qa/glyphs). After a re-run: Candle
   Crypt 0 glyph failures, Hang the Moon's arrow gone.
2. **A magnified soft source:** Candle Crypt's 64-px radial glow drawn 16–32× looks the same at any size. The probe now
   skips a source with no step between neighbouring pixels over 24 of 255. It reads each image once and a canvas again
   every 2 s, so a render target that starts blank is still counted. Re-run: 0 failures.
3. **A level won in the first minute:** Hang the Moon's random taps hung a whole night, and `roundEnd({ won: true })` failed
   E_QA_FIRST_RUN_LOST. A won round is no loss now (the host's `firstFail` funnel step already read it that way). Re-run: ✓,
   "1 won".
4. **`gp review`'s "Screens declared to QA"** read nested keys: Garage showed "streak, day, n, claimed", Swarm Smash showed
   "kind, options, source, rerolls…", and Candle Crypt showed "none found". It now takes the screens from the last QA's
   `screen-<name>-<size>.png` shots, else only the top-level keys.

**Still firing on the approved games, kept on purpose:**
- **E_QA_GLYPH_ICON** fails both approved builds (Garage's ◀ ▶ pager, Hang the Moon's "▶ Play" and ★ wallet) and passes
  rejected Velvet. It doesn't separate the portal's answers. It stays a gate because the owner asked for drawn icons,
  but the docs should stop calling it a reason for rejection.
- **W_SYSTEM_FONT** warns on 4 of 5 games, both approved ones at 100 %. Keep it a warning, and don't promote it to
  `[blocking]` in the review.
- **W_TITLE_CHOICES** warns on the approved Garage (8). If it is ever promoted to a failure, the threshold should be > 8.
- **E_QA_HERO_SMALL** never ran: none of the five declares `host.qa({ hero })`.

## What the rejected games share that no check catches

1. **Scope.** 16–20 screens (approved: 10–12), 75 weapons, 78 parts with 16 synergies, a roguelite with 16 screens. The
   review's prototype-risk rule needs more than 3 platform systems *and* under 24 h. It fired on none of them: Velvet was
   made in 8.2 h with 3 systems, and Candle Crypt's systems are its own. Proposal: in the brief, more than 15 declared
   screens makes the prototype risk `[blocking]` whatever the hours.
2. **Play text that is small or low in contrast at 1280×720:** Swarm Smash's objective line, barely visible under its
   progress bar; Velvet's 13 px "Chains 4 · Discards 3 · Bag 21" and the dashed empty slots that fill its board; Candle
   Crypt's pixel HUD. Proposal: a contrast check for play text (WCAG ratio against the pixels behind) and a minimum HUD
   size on desktop.
3. **Canvas HUD text is invisible** to the HUD overlap and glyph checks. Candle Crypt's HP "22/58" is drawn over by its
   bar segments.
4. **Small pixel-art sprites on a desktop screen** (Candle Crypt's 32-px sprites, Swarm Smash's ≈ 30-px enemies). The
   hero check would catch the first, but only once it is declared. Proposal: require `host.qa({ hero })` on crazygames
   for action, roguelite and arcade genres.
5. **Velvet Domino Rogue passes 375/375.** What reads as unfinished there is the look: a system font, web-app panels and
   placeholder outlines. Only the scored review sheet can see that.

## The blind scored review (2026-10-19, a second agent)

A reviewer who didn't know the portal's answers scored each game's own 1280×720 frames on its `qa/review-sheet.png`
(title, play-1, play-2, meta; 1–5, "would it sit on CrazyGames' front page"). Garage was scored twice (1.0.0 and 1.3.6).

| Game | Portal | Title | Play-1 | Play-2 | Meta | Sum |
|---|---|---|---|---|---|---|
| Idle Garage Evolution 1.3.6 | approved | 3 | 4 | 3 | 4 | **14** |
| Idle Garage Evolution 1.0.0 | approved | 3 | 4 | 3 | 3 | 13 |
| Velvet Domino Rogue | rejected | 4 | 3 | 3 | 3 | 13 |
| Hang the Moon 2.0.1 | approved | 4 | 3 | 2* | 3 | 12 |
| Candle Crypt 1.7.2 | rejected | 3 | 3 | 3 | 3 | 12 |
| Swarm Smash 1.2 | rejected | 3 | 3 | 3 | 2 | 11 |

\* Hang the Moon's play-2 was its "Night 1" results card, not play: the capture took the frame at 20 s whatever was on
screen. Fixed: play-2 is now the last frame still in play (`captureFrames`, packages/cli/src/review-sheet.ts).

**What it shows.** The reviewer rejected all six at "4 on title and play": a gate at 4 would have refused the two games
the portal approved. The ranking leans the right way (Garage first, Swarm Smash last) but Velvet ties with an approved
build: the scores order games roughly, they don't separate them. So `PASS_SCORE` is now **3** (a 2 is blocking, as it
was for Swarm Smash's meta and Hang the Moon's mis-captured frame) and the scores are an ordered list of what to lift,
not a verdict. The faults the reviewer named most, across approved and rejected alike:

1. **The title hides the key art** behind a centred dark modal (Garage ×2, Swarm Smash, Candle Crypt) instead of
   full-bleed art with the buttons beside it.
2. **Empty or dim play frames**: sparse scenes, a mostly empty table (Velvet), a sky with one bar (Hang the Moon).
3. **Meta screens of silhouettes or near-identical dark icons** (albums of "???", codexes of 37 dark icons).

These are the next checks worth building: a title that covers more than ~30 % of its key art with a panel, a play frame's
detail (the flat measure) on the *later* frame, and a collection screen that is mostly silhouettes for a new player.
