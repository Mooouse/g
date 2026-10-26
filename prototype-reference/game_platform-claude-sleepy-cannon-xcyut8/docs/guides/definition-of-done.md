# Definition of done

## A game

| # | Check | How | Automatic |
|---|---|---|---|
| 1 | `game.yaml` valid: 0 errors, warnings read | `gp validate <id>` | ✅ |
| 2 | Its own game: content, texts and stickers differ from every other game; preferably a different mechanic or trajectory | review against `games/*` | ❌ (checklist) |
| 3 | Browser QA all green on the kit's three screen sizes (kids: 360×800, 800×360, 768×1024; casual and code: 360×800, 800×360, 1280×720) | `gp qa <id>` → `games/<id>/qa/report.md` | ✅ |
| 4 | Screenshots looked at: nothing clipped, text readable, pictures make sense without reading | `games/<id>/qa/*.png` | ❌ (look) |
| 5 | Web build succeeds | `gp build <id>` | ✅ |
| 6 | Android channels — release: real AdMob IDs of this publisher, no TODO, publisher data filled in | `gp validate <id> --release` | ✅ |
| 7 | Android channels: AAB builds in CI, the merged manifest has only allowlisted permissions, emulator test green | `gp build <id> --target android` → `.github/workflows/android.yml` (Actions → Android → Run workflow, game id) | ✅ in CI |
| 8 | Android channels — store: listing texts, graphics, privacy policy published, Play Console checklist done | [publishing.md](publishing.md) | 🟡 partly manual |
| 9 | Portal channels: the concept written before building (`E_CONCEPT` clean, `W_CONCEPT_*` read) | `gp validate <id>`, `docs/concept.md` | 🟡 the search is yours |
| 9a | The money design written with the concept and forecast: `money` in game.yaml (no `E_MONEY*`, `W_MONEY_*` read), the idea chosen with `gp forecast --idea`, `qa/forecast.md` read and handed over with the submission | `gp forecast --idea …`, `gp forecast <id>` | 🟡 the numbers are estimates |
| 10 | Portal channels: the one-file upload builds | `gp build <id> --target crazygames` | ✅ |
| 10a | Portal channels: the quality review — a second agent (not the game's maker) played the game from `gp review`'s brief (CrazyGames' quality requirements, the QA screenshots and videos, our portal verdicts) and wrote `quality.md`; every `[blocking]` finding fixed and checked again | `gp review <id>` → `games/<id>/qa/review-brief.md` → `games/<id>/quality.md`; `gp review <id> --check` | 🟡 the format and the gate are automatic, the judgement is the reviewer's |
| 11 | Portal channels: the submission is complete and looked at (covers, both videos, listing) and sent to the owner | `gp submission <id>` → `games/<id>/submission/` (refused while `quality.md` is missing or has a `[blocking]` finding) | 🟡 checks are automatic, looking is yours |
| 12 | A code game: reviewed by a second agent, its findings fixed | [code-games.md](code-games.md) | ❌ |
| 13 | The report says what was verified and what wasn't | the agent's report | ❌ |

## A building block (mechanic, trajectory, theme, content pack, kit, profile rule)

A block exists because a real game needs it. It is done when it has:

1. **A catalog entry** (`*.meta.ts`): id, one-paragraph description, the JSON Schema of its settings with descriptions and defaults, an example.
2. **Code** that reads its settings only from the resolved game (no globals), draws only through the theme, and reports what happens through `app.events`.
3. **Unit tests** for its logic, and validator tests for its rules (every new error code has a test and a catalog entry — a test fails otherwise).
4. **A game that uses it**, passing `gp qa` — and the reference games still passing theirs (74/74 for Balloon Pop).
5. **Regenerated docs**: `gp docs` (CI fails on stale docs).
6. For anything native (ads, purchases, TTS, Back, full screen): the emulator test.
