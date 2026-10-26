# Publishing

Android packaging is in the platform: `gp build <id> --target android` generates the Capacitor project from the spec,
the merged manifest is checked against the channel's allowlist (`gp android check-manifest`), and CI builds the AAB and runs
the emulator test (`.github/workflows/android.yml`: Actions → Android → Run workflow, game id). The Play Console
paperwork still lives in the first game's repository `QmaCyber/game`:
- Android project and CI build of the AAB;
- emulator test (31/31);
- `docs/play-console-checklist.md`: account → app → IARC → Families → Data safety → `remove_ads` → testing → release;
- `docs/store-listing.md` (texts, lengths, banned words);
- `docs/privacy-policy.html`.

## What the platform already does

- **Rules at build time.** `gp validate --release` fails on test ad IDs, `auto`, IDs of another publisher, and TODOs in the game or `publisher/publisher.yaml`.
- **AdMob IDs.** `gp admob provision <id>` prints the exact AdMob steps and names, then writes the App ID and interstitial ID into `game.yaml` after checking them against `publisher/publisher.yaml`.
- **Publisher data.** Name, email, website, `app-ads.txt`: `publisher/`. The site `https://qmacyber.github.io` serves `app-ads.txt` and the privacy policies.

## Steps for a new game (android-families)

1. `gp validate <id>`, `gp qa <id>` green.
2. Privacy policy page on the developer website at the `privacyPolicyUrl` of the game.
3. AdMob: `gp admob provision <id>` → create the app and the interstitial unit with the printed names → run it again with the IDs.
4. `gp validate <id> --release` green.
5. `gp build <id> --target android --release` → the Android workflow green (AAB and the emulator test).
6. Play Console: follow `docs/play-console-checklist.md` in QmaCyber/game; choose only the "5 and under" age group for ages 2–5.
7. After release: AdMob → Link your app; check `app-ads.txt` in AdMob after a few days.
