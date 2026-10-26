# Survey of our recent releases (2026-10-19) — compact notes of the agents' reports

## Idle (game19 Garage 1.0–1.3.6, game21 Craft Pickaxe)
TOP: 1 Goals block (daily quests N/day by day seed + bonus chest; achievements w/ rarity + hidden; progress in memory, banner queue waits for panels) — game21 meta.ts:20-45,188-215, REPORT:83; game19 achievements.ts; dailyOrder only 1 goal & saves on every add (streak.ts:343).
2 Platform screens take drawn icons: currency.icon string (shop-ui.ts:82,213; sites-map.ts:403), streak ✓ glyph (streak-ui.ts:36,97,141), 🔒 ✓ ◀ ▶ hard-coded (shop-ui.ts:255,335,347,351; sites-map.ts:198-200,575). S.
3 Coach hand (tap/swipe/drag/hold, tied to hints.show) — game19 scene.ts:763-812, game21 view.ts:686. S–M.
4 gp art import v2 (auto wheel/axle finding, even tyre rubber, arch paint off tyre, per-part resolution, restore wear, tracked vehicles wheels:[], sharpen, axle crosshair) — game19 tools/paint-cars/paint_cars.py:44-229. M.
5 QA: image drawn magnified >1.25× its pixels per device px (probe.ts:121 wraps drawImage) — «Пиксельное месиво». S–M.
6 Collection/album block (pages, rarity, silhouettes, new marks, bonus per entry). M.
7 Deferred assets in the one-file upload (loadLater(group), budget counts pre-Play bytes) — Garage 1.5 MB / 9.3 s. L.
8 Daily rewards hub: playtime gifts, lucky wheel (prize saved at spin, shown at stop; ad spin after free; amounts on slices), daily offers, timed boost never multiplies offline; add spin/currency to REWARDED_KINDS (money.ts:71). M.
More: scratch/erase layer block; exported mountPager; lessons (automation keeps the choice; subject fits screen no auto-pan; one pipeline for imported art; owner quotes «Слишком много денег», «ремонт слишком одинаковый», «магазин сделай удобнее»); host.qa({gallery}); modelFromCampaign(); fx floating-number merger; W_TRADEMARK_TEXT in strings; offline stamp vs QA save check (offline.ts:14 vs kit-code/qa/suite.ts:582); gp dev --stop; sites map label overlap/pin cut; shop tabs with affordable counts; pixel-art kit; rewarded-offer frequency hint.

## Roguelites (game6 Velvet, game4 Sanction, game9 Candle, game20 Swarm)
TOP: 1 Calibrated quality review: qa/review-sheet.png with our play/meta frames beside approved games (Candle 1.3, HtM, Garage, Potion) + front-page genre shots + cover; score 1–5 "front page", <4 blocking; desktop first; look/layout nice counts. (Swarm rejected with 0/0, Velvet 0/14.)
2 Game UI typography: @gp/art/type with 2–3 OFL display faces (Latin+Cyrillic), a pixel font for 10 languages (from Swarm font.ts), outlined numbers; W_SYSTEM_FONT QA check. Velvet = Georgia + system-ui.
3 Desktop layout/empty space/hero size fail checks on crazygames: flatFrame per screen at 1280×720 and 821×462 fails; host.qa({hero}) ≥ ~6 % of short side.
4 ScoreSequencer: Step[] trace played beat by beat (0.28→0.09 s, pitch by index, roll past 12, land sized by log(total/target)), fast-forward, label collision, preview before commit — Velvet sim.ts:58-81, main.ts:1059-1260.
5 @gp/core/sfx kit (struck-material presets, shot/hit/coin/deny/click, pitch variation, throttle, rising pitch) + gp qa sound section via audio-tap (share of actions with sound, sfx/music balance, clipping, exact repeats).
6 inspect plates (hover / 380 ms hold, plate above finger, no pick) — Velvet c0d20f6, main.ts:2435-2510. S.
7 InventoryGrid (shapes, rotation, adjacency, undo) + mountGridBench — Swarm grid.ts 630 lines, hangar.ts. L.
8 Trigger pipelines / synergies / status reactions table (ordered slots, retriggers, codex) emitting the Step trace.
More: pixel-art toolkit; TwinStick input (Candle request); boss pattern machine (fan/ring/spiral/aimed, telegraphs, HP phases, no repeat); run shop on RunChoices (reroll escalating, sell 50–75 %, slots full); borrowed-vocabulary check in gp uniqueness (Balatro terms); resubmission gate in gp forecast (3 of 4 resubmitted after stop rejected); deckbuilder sub-genre + naming hook; story lines via host.t; BUG save.ts:74 drops strings when default array's first element null (Sanction blocking); lessons (Velvet «simple and dull», «how much will I get», «no linear upgrades»; Candle «страница перегружена», «сильно рябит»; the rejections); upgrades.md: a never-erring bot makes stat upgrades look dead; Tiers context arg.
Why rejected: review measures compliance not taste; DOM screens look like a web app (system fonts, grey buttons); phone-first layouts, desktop decides; mixed style (cover vs play); derivative vocabulary; features grew faster than feel (no new systems in last pass, only feel); resubmitting a stopped game ≈ rejection.

## Frankengun deep (game22)
TOP: 1 UI inert while an ad is pending + rewardedOffer({onReward,onSkip}) returning both buttons, ignoring stale reward; QA taps offer then skip (code-review bug #1 softlock; rewarded-button.ts:40-49 only disables itself).
2 Touch bot must survive 60 s on crazygames (suite.ts:1864 TOUCH_BOT_SEC=30; line 2292 counts fail as pass) + host rookie hook.
3 screenTheme({bg,panel,ink,muted,accent,accentInk,radius,font}) base for 10 namespaces (results, welcome, lang, streak, dlg, season, shop, sites, hint, hints) + QA fails a platform screen with default variables.
4 @gp/core/icons (~95 SVG icons on 24 grid, G/icons.ts:8-109) + runtime QA scan of visible text for Geometric Shapes/Dingbats/Arrows/Misc Symbols (review.ts:51 \p{Extended_Pictographic} misses ◆ ✓ ✕ ◎ ● ▌) + replace platform glyphs (shop-ui.ts:334-351, sites-map.ts:575-624, streak-ui.ts:141, i18n-platform.ts:190,197).
5 Bot skill ladder + difficulty target in game.yaml (G/bot.ts:33-45; balance.ts:50-66 no win-rate field); forecast session from winning run length.
6 createSfx(mixer, files): sample playback, pitch variation, 40 ms throttle, distance/pan, voice + ducking, hush (G/audio.ts:60-201, view/assets.ts).
7 eng.snapshot(w,h,draw) + fitToRect(camera, box) for three/pixi/phaser (G/view.ts:110-151, cover.ts:42-61,130-141).
8 General AutoQuality({levels, measure:'interval', start: deviceTier()}) + renderScale on adapters (G/view.ts:30-38,101-105,211-230).
Next: QA title-choices count after first run (warn >6); WebGL probe leaks/draw calls; @gp/core/fuzz + corrupt-save generator (G/review.test.ts); @gp/core/steer pure 2D (seek, separation, avoidance, golden-angle slots, flank); PartGrid (G/gun.ts:69-160); callouts() announcer queue (G/main.ts:924-990); LookInput + aimAssist() (G/input.ts; twin-stick now 2 games); voxel mesher typed arrays; portraitFov() + QA ≥60° across; HUD overlap text/text and text/[data-gp-touch]; RunShop (tier inflation, escalating reroll, locks, sell-back; G/sim.ts:2792-2960); RunChoices recent-draw memory + fill fallback (G/sim.ts:1199-1225); mountSettings + host.haptic; one-card-at-a-time queue (welcome, streak, season, story); threat cues on HUD (hit arcs, off-screen arrow, DOM damage numbers pool); gp sound import / gp voice; glare hint + host.capturing; hints retire after play time; loadRun(null) dev warning.
Six of seven blocking findings auto-catchable by: touch 60 s, icons scan, text-list-where-pictures heuristic, title choices, portrait FOV, HUD overlap.
