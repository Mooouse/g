# Publishing platforms for a solo, AI-assisted HTML5 studio (research, 2026-09-30)

> Analyst research for [game-ideas.md](../guides/game-ideas.md). The build environment's proxy blocked the primary pages
> (docs.crazygames.com, developers.poki.com, yandex.com, developers.google.com, medium.com), so facts come from search
> snippets of those pages. "Docs, undated" = an official page without a date in the snippet. Anything not tied to a source
> is marked **unverified**. Re-check numbers before a decision.

## Platform by platform

### CrazyGames (web, 13+)
- **Audience:** 50M+ monthly players (developer portal claim), mostly Tier-1; up from 35M MAU in early 2025 ([cinevva guide 2026](https://app.cinevva.com/guides/publish-game-crazygames), [mobidictum 2025](https://mobidictum.com/crazygames-reaches-35-million-monthly-users/)). 52% male, 18–24 the largest age group ([Similarweb, Jun 2026](https://www.similarweb.com/website/crazygames.com/)). Mobile vs desktop split: unverified.
- **Age:** main site 13+, PEGI 12; the separate kids site has monetization disabled ([Wikipedia / CG docs](https://en.wikipedia.org/wiki/CrazyGames)).
- **Popular:** .io/battle, racing, puzzle, idle/tycoon, arcade ([CG FAQ](https://docs.crazygames.com/faq/)).
- **Technical:** initial download ≤ 50 MB, ≤ 20 MB for the mobile homepage, total ≤ 250 MB, ≤ 1,500 files ([CG technical docs](https://docs.crazygames.com/requirements/technical/)).
- **Ads:** the SDK allows one midgame ad per 3 min; no levels only passable by watching a rewarded ad ([CG ads docs](https://docs.crazygames.com/requirements/ads/)).
- **Process:** review ≈ 2 days; every game starts with Basic Launch (no SDK or money, 7–21 days, ≥ 500 plays), good ones are invited to Full Launch ([Basic Launch guide](https://docs.crazygames.com/resources/basic-launch-metrics/)).
- **Money:** 60% of ads / 70% of IAP to the developer (per 2026 jam terms — [cinevva](https://app.cinevva.com/guides/web-game-monetization)); no exclusivity required, +50% for time-based exclusivity ([Developer Terms, 2025-08-18](https://files.crazygames.com/documents/developer_terms_20250818.pdf)); monthly payout, €100 minimum ([Payouts](https://docs.crazygames.com/payouts/)).
- **Reported earnings:** 8 WebGL games, €556.92 from 451,327 plays ([donislawdev](https://donislawdev.com/earnings-and-statistics-from-my-8-games-android-ios-webgl/), date unverified).
- **Red flags:** QA rejects clones, reskins, asset flips, confusable names/icons ([CG quality](https://docs.crazygames.com/requirements/quality/)).

### Poki (web, all ages, highest bar)
- **Audience:** 100M monthly players; 625M players and 11.1B gameplays in 2025 ([Poki 2025 review](https://poki.com/blog/2025-at-poki-a-year-in-review)); largest age group 25–34 ([Similarweb, Aug 2026](https://www.similarweb.com/website/poki.com/)).
- **Hits:** Plonky, SnapStyle Dress Up (2025); 1,018 games passed 1M plays in 2025 ([Poki 2025 review](https://poki.com/blog/2025-at-poki-a-year-in-review)). A solo developer: 67M plays from 5 games, "Brainrot Puzzle" 1M plays in a day ([Playrea](https://medium.com/@playrea/from-hobby-to-67-million-gameplays-on-poki-in-2025-df2c147cfb27)).
- **Requirements:** initial download < 8 MB; `commercialBreak` / `rewardedBreak`, reward only after a completed ad ([requirements](https://sdk.poki.com/new-requirements.html)); kid-safe content ([content & safety](https://developers.poki.com/guide/content-player-safety)).
- **Approval:** Web Fit Test — ≈ 10k players over 3–5 days, CTR, time on page, conversion compared to category averages ([Web Fit Test](https://sdk.poki.com/web-fit-test.html)); access by submission form, closed beta ([Working with Poki](https://sdk.poki.com/index.html)).
- **Money:** web-exclusive deals run 5 years by default, 50/50 on Poki traffic, 100% of your own traffic; non-exclusive = one-time fee ([Deal types](https://sdk.poki.com/deals)).
- **AI:** no AI watermarks or prompt text, test all AI content; "the more non-original material… the higher the risk" of failing the Web Fit Test ([Working with AI](https://sdk.poki.com/working-with-ai.html)).

### Yandex Games (web, RU/CIS-heavy)
- **Audience:** 50M+ MAU in 2025; 24k games published, 29k removed in 2025 ([WN Hub](https://wnhub.io/news/other/item-49945)); 60% RU/CIS, 49% aged 35–44, 50% phones / 40% PC ([Yandex docs](https://yandex.com/dev/games/doc/en/)).
- **Popular:** bubble shooters, match-3, action; midcore rising ([Yandex Medium](https://medium.com/yandexgames/trending-game-genres-on-yandex-games-9e69ce3e48d1)).
- **Requirements:** SDK required, ≤ 100 MB, moderation 3–5 working days, automatic language detection (Russian recommended for RU/BY/KZ/UA/UZ), a clear goal or win/lose state; interactive AI in the game banned, pre-generated AI assets allowed ([requirements](https://yandex.com/dev/games/doc/en/concepts/requirements)).
- **Money:** 50% of IAP ([license](https://yandex.com/legal/licensegames/index.html)); ad share unverified; 20% tax withheld for foreign legal entities; payout complications for non-Russian developers (unquantified).

### GameDistribution (B2B syndication)
- 350M monthly players claimed, 3,000+ sites ([GD](https://gamedistribution.com/developers/)); 33% net to the developer, €100 minimum ([terms](https://static.gamedistribution.com/terms/developer.html)); SDK required, ≥ 5 min gameplay, no own ads/IAP, approval up to 3 weeks ([best-games.io 2025](https://best-games.io/blog/blog-best-places-to-submit-html5-games)).
- Small developers report cents a day ([html5gamedevs](https://www.html5gamedevs.com/topic/40668-be-careful-with-gamedistribution/)). Conflicts with a Poki exclusive.

### itch.io (showcase and jams)
- 145M visits in June 2026 ([Semrush](https://www.semrush.com/website/itch.io/overview/)); HTML5 ≤ 1,000 files, 500 MB ([docs](https://itch.io/docs/creators/html5)); open revenue share, 10% default. AI disclosure mandatory for assets ([dev update](https://itch.io/t/4309690/generative-ai-disclosure-tagging)).

### Google Play (casual, Families)
- Block Blast #1 download of 2025 (356M) and of Q1 2026 ([PocketGamer.biz](https://www.pocketgamer.biz/the-most-downloaded-mobile-games-of-2025/), [BusinessWire, Apr 2026](https://www.businesswire.com/news/home/20260423998721/en/Block-Blast-Ends-Q1-2026-as-the-No.-1-Most-Downloaded-Mobile-Game-Worldwide)).
- New personal accounts: 12 testers × 14 days before production ([Play Help](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en)). Developer verification: BR/ID/SG/TH from 2026-09-30, global from 2027 ([Android Dev Blog, Jun 2026](https://android-developers.googleblog.com/2026/06/android-developer-verification.html)).
- Families: certified ad SDKs only, no personalised ads, no unexpected full-screen interstitials ([Families policy](https://support.google.com/googleplay/android-developer/answer/9893335?hl=en)); Kids tab = Teacher Approved, by age ≤ 5 / 6–8 / 9–12.
- Risks: Repetitive Content, WebView "minimum functionality" rejections (Capacitor wrappers), 80k developer accounts banned in 2025 ([Google, Feb 2026](https://blog.google/security/keeping-google-play-android-app-ecosystem-safe-2025/)).

### YouTube Playables
- Expanded to 50+ markets on 2026-09-28 ([PocketGamer.biz](https://www.pocketgamer.biz/youtube-playables-expands-to-more-than-50-markets-including-the-eu-and-nordics/)); interest form, early access. Brain & Puzzle is the largest category; top: Tall Man Run, Build a Queen, Snake Clash!, Thief Puzzle ([playables.games, 2026-09-20](https://playables.games/best/)). Bundle < 30 MiB ([requirements](https://developers.google.com/youtube/gaming/playables/certification/requirements_stability)); interstitial + rewarded only, revenue share in pilot.

### Skip for now
- **Telegram Mini Apps:** tap-to-earn collapsed (Hamster Kombat ≈ 300M → 41M users), crypto-centric ([Bitcoinist](https://bitcoinist.com/the-rise-and-fall-of-hamster-kombat-why-260-million-players-abandoned-the-game/)).
- **Discord Activities:** social multiplayer (Poker Night, Putt Party); 85% share, but discovery needs verification ([Discord](https://discord.com/blog/build-where-the-world-plays)).
- **Facebook Instant Games:** alive but de-prioritised; Facebook Web Games shut down 2026-09-30 ([PPC Land](https://ppc.land/meta-announces-web-games-sunset-by-september-2026/)).
- **Newgrounds, Game Jolt:** hostile to generative AI.

## Ranked shortlist

1. **CrazyGames** — self-serve, ≈ 2-day review, Basic Launch tests a game for free, no exclusivity; the platform's `crazygames` channel.
2. **Poki** — biggest reach, < 8 MB, kid-safe; high bar and 5-year exclusivity; warns about templated / AI-heavy games. Only the most distinctive games.
3. **Google Play Families** — the channel for ages 2–8 (`kids` kit); account friction and Repetitive Content risk.
4. **Yandex Games** — large, fast moderation, older audience (bubble shooters, match-3); needs Russian (non-English kit texts are a platform gap); payout complications.
5. **YouTube Playables** — opportunistic: huge reach, Brain & Puzzle dominates; early access.

**The risk everywhere:** every serious platform screens for clones and templated content. Many near-identical AI-built games get you rejected or banned. Each game needs its own mechanic, twist or theme.
