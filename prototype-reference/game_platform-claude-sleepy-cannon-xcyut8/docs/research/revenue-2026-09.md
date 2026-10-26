# Revenue expectations: CrazyGames, web ads, Poki, Google Play kids (research, 2026-09-30)

> Market-analyst research for the revenue estimator: what a game on our channels can earn, with every number sourced.
> It **extends** [platforms](platforms-2026-09.md), [forums](forums-2026-09.md), [trends](trends-2026-09.md),
> [market-depth](market-depth-2026-09.md), [crazygames-requirements](crazygames-requirements-2026-09.md) and
> [marketer.md](../team/marketer.md). A number already in those notes is repeated here only when the model needs it.
> The egress proxy blocked every page fetch (docs.crazygames.com, files.crazygames.com, itch.io, reitgames.com,
> donislawdev.com, cinevva, playgama, reddit, html5gamedevs, web.archive.org), so everything below comes from **search
> snippets**. Reddit was not indexed by the search tool. Re-check before a money decision.

| Marker | Meaning |
|---|---|
| **[S]** | a snippet of a primary source: the platform's own docs, terms, blog or press release, or an ad network's own case study |
| **[3rd]** | a secondary source: press, an analyst, a benchmark aggregator. **[U]** = vendor marketing or no method given; a hint only |
| **[F]** | a developer's own devlog, forum post, blog or video (an anecdote, n = 1) |
| **derived** | the analyst's arithmetic on sourced numbers; the inputs are named |
| **NOT CONFIRMED** / **NOT FOUND** | could not be verified / no credible number exists in what the search reached |

---

## 0. The 10 most decision-relevant numbers

| # | Number | Tag | Source |
|---|---|---|---|
| 1 | **CrazyGames pays 60% of ad revenue, 70% of IAP**, computed on *net* revenue: gross minus the direct cost of serving the ads and minus fees to partner portals. The 2021 terms put direct costs at 20%, so the developer keeps **≈ 48% of gross** (derived). No exclusivity needed; +50% for 2 months of browser exclusivity after Full Launch | [3rd] share (2026 jam terms), [S] net definition and bonus | [playgama](https://playgama.com/blog/business-faqs/poki-vs-crazygames-vs-gamedistribution-revenue-share/), [cinevva](https://app.cinevva.com/guides/web-game-monetization), [Developer Terms 2025-08-18](https://files.crazygames.com/documents/developer_terms_20250818.pdf) |
| 2 | **Midgame ads: at most 1 per 3 min** (≤ 20 an hour, rewarded counted in); a revive at most **once per session**; daily caps for ad currency (e.g. 5 a day); first midgame after the tutorial or **3–5 min** | [S] | [CG midgame pacing](https://docs.crazygames.com/resources/midgame-ads-pacing/), [CG action](https://docs.crazygames.com/resources/monetizing-action/), [rewarded deep dive](https://docs.crazygames.com/resources/rewarded-ads-deep-dive/), [Basic Launch guide](https://docs.crazygames.com/resources/basic-launch-metrics/) |
| 3 | **Top games' ad impressions per play:** puzzle **8.9** (4.2 rewarded + 4 midgame), word **7.9** (2.8 + 4.8), driving **7**, clicker **5.5** (≈ half rewarded). Midgame is **40–60%** of a casual game's earnings | [S] | [puzzle](https://docs.crazygames.com/resources/monetizing-puzzle/), [word](https://docs.crazygames.com/resources/monetizing-word/), [driving](https://docs.crazygames.com/resources/monetizing-driving/), [clicker](https://docs.crazygames.com/resources/monetizing-clicker/), [ad guide](https://docs.crazygames.com/resources/ad-monetization-guide/) |
| 4 | **A good solo game earns ≈ €31/day** (≈ $12.9k a year): Liquid Swarm, an incremental roguelite, six weeks after Full Launch with Basic Launch metrics "many in the top 20%". Adding one rewarded placement raised revenue **+25%**; a WebGL2 switch cut it by **⅓** | [F] | [Liquid Swarm devlog, ~2026-07](https://mickaelbneron.itch.io/liquid-swarm/devlog/1579269/six-weeks-on-crazygames-my-incremental-roguelite-makes-31day-full-breakdown-of-whats-working-while-my-previous-three-games-flopped) |
| 5 | **Developer revenue per 1,000 plays on CrazyGames:** **€1.0–1.2** for 8 simple WebGL games from ≈ 2018 (451,327 plays → €556.92); **€4** for one word game (≈ 2018, 3,000 plays → €11.99). Today's platform-wide average is **≈ $5–8** (derived, top-down, #7 in §1.4) | [F], derived | [donislawdev](https://donislawdev.com/earnings-and-statistics-from-my-8-games-android-ios-webgl/), [html5gamedevs](https://www.html5gamedevs.com/topic/41871-crazygames-and-gamedistribution/) |
| 6 | **Traffic shape after Full Launch:** 48 guaranteed hours on the homepage. Puckit (rated 8.8) **peaked at ≈ 23,000 plays a day** for 3 days with the "hot" label, then settled at **≈ 2,500 a day** (−89%) | [3rd], [F] | [GamesBeat via search](https://gamesbeat.com/crazygames-hits-35m-users-for-browser-games-and-launches-social-multiplayer-features/), [Reit Games](https://reitgames.com/news/puckit-100k-gameplay) |
| 7 | **Web rewarded eCPM:** **$15–28 US, $8–15 EU, $1–3 tier-3**; an interstitial pays about half of that; web display $0.5–2 | [3rd] | [cinevva](https://app.cinevva.com/guides/web-game-monetization), [AppLixir](https://www.applixir.com/blog/rewarded-vs-interstitial-ads-ecpm-cpm-web-game-revenue/) [U] |
| 8 | **CrazyGames' audience lowers the blend:** ≈ **70% of visits are mobile**; the US is **22.8%** of desktop traffic, then India 8.9%, Vietnam 8.1%, Turkey 5.1%, UK 3.4%. US desktop video pays ≈ **20–25% more** than mobile | [3rd] | [Semrush, Aug 2026](https://www.semrush.com/website/crazygames.com/overview/), [Similarweb, Aug 2026](https://www.similarweb.com/website/crazygames.com/), [adsposure 2026](https://www.adsposure.com/cpm/) |
| 9 | **Kids (COPPA) ads pay 2.5–5× less** than general traffic. US kids/education: interstitial **$4–8**, rewarded $6–11, ARPDAU **$0.02–0.05**. AppLovin stopped serving kids' traffic in January 2025 | [3rd] | [GameBiz Consulting 2026](https://www.gamebizconsulting.com/newsletter/admon-newsletter-11-the-shrinking-island-ad-monetization-underage-users), [RevenueLab 2026](https://www.revenuelab.fyi/blog/admob-ecpm-benchmarks-2026) [U], [Kidoz](https://www.kidoz.net/blog/navigating-the-applovin-decision-a-guide-for-developers-with-kids-and-mixed-audiences) |
| 10 | **Google Play without marketing: most apps never reach 1,000 installs.** Of 3.04M listings, **37% have < 100 lifetime installs, 62.7% < 1,000**, 19% 1k–10k, 11% 10k–100k, 5% 100k–1M, 2% > 1M | [3rd] | [Testers Community, Jul–Aug 2026](https://www.testerscommunity.com/research/google-play-statistics) |

**What is NOT FOUND and matters most:** the share of Basic Launch games that reach Full Launch; the share of submissions QA rejects;
a typical (not good, not hit) Full Launch game's plays per day; CrazyGames' own eCPM or fill rate; downloads of a new kids app;
a kids "remove ads" conversion rate. The model inputs in §7 carry wide, labelled ranges for these.

---

## 1. CrazyGames

### 1.1 Revenue share and terms
- **Share.** CrazyGames' docs publish no split. The closest official number is in the **2026 CrazyGames × GameMaker Web Jam terms**:
  **60% of ad revenue and 70% of in-game-purchase revenue** to the developer [3rd: [cinevva](https://app.cinevva.com/guides/publish-game-crazygames), [playgama](https://playgama.com/blog/business-faqs/poki-vs-crazygames-vs-gamedistribution-revenue-share/), both quoting the jam guide at [crazygames.indiehero.io](https://crazygames.indiehero.io/cggmwj-jg/), which the proxy blocked]. Whether the same 60/70 holds outside the jam: **NOT CONFIRMED**.
- **What the share is taken from** (Developer Terms, snippet) [S: [terms 2021-02-11](https://files.crazygames.com/documents/developer_terms_20210211.pdf), [terms 2025-08-18](https://files.crazygames.com/documents/developer_terms_20250818.pdf)]:
  - "Net Game-related Advertisement Revenues" = gross game-related ad revenue **less Direct Game-related Costs** (ad serving, infrastructure and data transfer for the ads) **less the fee paid to portals** CrazyGames syndicates to.
  - Compensation "is calculated monthly based on the popularity of games in terms of user browsing and the performance of in-game ads shown and advertiser interest".
  - The 2021 terms set direct costs at **20%** of ad revenue [F/3rd, from `crazygames-requirements-2026-09.md` §12]. Whether the 2025 terms keep 20%: **NOT CONFIRMED**.
  - **derived:** 60% × (1 − 0.20) = **48% of gross ad revenue**; 60% of gross if direct costs are near zero.
- **Which ads count.** At the 2019 portal launch CrazyGames said the share covers "**all the ads the gamer sees when playing the game, not just the in-game ads**" [S: [press release, 2019](https://start-it-x.prezly.com/crazygames-launches-new-developer-portal-with-revenue-share-options)]. Whether page banners around the game still count in 2026: **NOT CONFIRMED**.
- **Exclusivity bonus:** "+50% Compensation if the Game is exclusively available on CrazyGames for two months after Full Launch", only for those two months. Steam, App Store and Google Play don't count as browser sites [S: terms 2025-08-18].
- **IAP:** invite-only, through Xsolla. Xsolla says CrazyGames' conversion rose 15–20% and average order value 60%+ after its integration [U: [Xsolla](https://xsolla.com/partner-spotlight/crazygames-improves-conversion-with-xsolla-pay)].
- **No revenue before Full Launch:** during Basic Launch ads are off, "no revenue will be shared" [S, `crazygames-requirements` §5].

### 1.2 Payout and reporting
- Monthly through **Tipalti** once unpaid earnings reach **€100**; payment "by the 10th of the following month"; invoices under **€10** roll over; wait "a few business days after month-end" for the invoice [S: [CG Payouts](https://docs.crazygames.com/payouts/)].
- The developer dashboard shows players, average playtime, gameplay conversion, retention and revenue, **updated daily**; set "Previous Month" to estimate a payout [S: Payouts, Basic Launch guide]. Deeper analytics: ByteBrew is recommended [S].
- **Cash-flow lag (derived):** the first money arrives ≈ **4–6 weeks after Full Launch** if the first month clears €100 (the month closes, then payment by the 10th).

### 1.3 What games earn: every public number found

| Game (genre) | Period | Plays | Developer revenue | Per 1,000 plays | Tag |
|---|---|---|---|---|---|
| Liquid Swarm (incremental roguelite, solo, 4th game; the first 3 flopped) | 6 weeks after Full Launch (May–Jul 2026) | not in snippet | **≈ €31/day, ≈ $12.9k/yr annualised** | derived ≈ €5–10 if 3–6k plays/day (unverified) | [F] [devlog](https://mickaelbneron.itch.io/liquid-swarm/devlog/1579269/six-weeks-on-crazygames-my-incremental-roguelite-makes-31day-full-breakdown-of-whats-working-while-my-previous-three-games-flopped) |
| 8 WebGL games (idle clickers, arcade), donislawdev | ≈ 2018 | 451,327 | €556.92 total | **€1.23** | [F] [blog](https://donislawdev.com/earnings-and-statistics-from-my-8-games-android-ios-webgl/), [gamedev.net](https://www.gamedev.net/blogs/entry/2265795-earning-and-statistics-from-my-8-games-android-webgl-some%C2%A0thoughts/) |
| Fish Eat Fishes (same dev, web only) | ≈ 2018 | 143,000 | €149.36 | **€1.04** | [F] same |
| A word puzzle game | ≈ 2018 | 3,000 | €11.99 | **€4.00** | [F] [html5gamedevs](https://www.html5gamedevs.com/topic/41871-crazygames-and-gamedistribution/) |
| PolyTrack (racing, solo) | 2024–2026 | not public | "most of the revenue comes from ads on CrazyGames" | — | [F] [itch.io](https://itch.io/post/12695112) |
| Puckit (Reit Games) | first weeks after launch (Nov, year not in snippet) | peak ≈ 23k/day, then ≈ 2.5k/day, ≈ 100k total; conversion 73%; rated 8.8 | not published | — | [F] [Reit Games](https://reitgames.com/news/puckit-100k-gameplay) |

Other claims, weaker:
- "A well-performing casual game on a portal typically clears **$200 to $2,000 a month**" [3rd: cinevva, no method].
- "For a first web game, realistically **$500–3,000 a month**" [3rd/U: [IndieGameBusiness](https://indiegamebusiness.com/web-gaming-for-indie-developers/)].
- Trustpilot and video titles claim CrazyGames rejects "90%" or "99%" of submissions [F: [YouTube](https://www.youtube.com/watch?v=G4NPK08MCRs), [YouTube](https://www.youtube.com/watch?v=O2QiNVuejYk)]. No method; see §1.6.

**What the old numbers mean:** the ≈ 2018 games earned €1–4 per 1,000 plays with little or no ad integration, few ads per play and
older CPMs. They are the **floor**, not the norm. Liquid Swarm is the only recent, well-integrated data point.

### 1.4 The platform, top-down
1. **Revenue:** CrazyGames grew revenue **43% a year for four years** and "expects to hit **$100 million in 2027**" (Raf Mertens) [3rd: [Bloomberg via BusinessWorld, 2025-11-11](https://bworldonline.com/bloomberg/2025/11/11/711147/video-games-hottest-new-platform-is-an-old-one-websites/)].
2. Other estimates conflict: $13.9M in 2025 [U: [Latka](https://getlatka.com/companies/about.crazygames.com)]; "€10M–50M as of 2024-12-31" [3rd: Tracxn/tech-insider]. Bloomberg's is the only one attributed to the CEO.
3. **derived:** $100M ÷ 1.43² ≈ **$49M in 2025**, ≈ $70M in 2026.
4. **Scale:** 50M+ monthly players, **300M+ gameplays a month** [S: developer portal, via cinevva]. 4,000–4,500 games [3rd].
5. **Impressions:** 1.24B impressions went through Zeta's HIRO identity layer in Q3 2025 (≈ 410M a month), with HIRO-treated eCPM +15% YoY. The stack is Google Ad Manager + Prebid on desktop and mobile web [S-vendor: [Zeta case study](https://zetaglobal.com/resource-center/from-reach-to-revenue-how-hiro-powered-crazygames-next-phase-of-growth/)]. That is ≥ 1.4 impressions per gameplay across the platform (a lower bound: not every impression goes through HIRO).
6. **derived gross revenue per 1,000 gameplays:** $49M ÷ 3.6B ≈ **$13.6**. It includes page banners and CrazyGames' own Originals.
7. **derived developer share per 1,000 plays:** × 48–60% ≈ **$6.5–8**. The median game earns less, because revenue follows playtime and the top games take most of it.

### 1.5 Traffic after launch
- **Basic Launch** (no ads): ends after ≥ 7 days **and** ≥ 500 plays, or after 21 days [S]. That is **≥ 25–70 plays a day** of test traffic.
  - Larss (1v1 strategy) on day 2 of Basic Launch: 6,100 thumbnail impressions, 23 clicks, CTR 0.4% against a 2–4% target [F: [devlog](https://fxf8.itch.io/larss-io/devlog/1586849/launching-a-1v1-strategy-game-on-crazygames-04-ctr-and-what-im-learning)].
  - **derived:** Basic Launch shows a game ≈ 5–10k thumbnail impressions a day. Plays = impressions × CTR, so a 3% thumbnail brings ≈ 150–300 plays a day, and a 0.4% one only ≈ 25.
- **Full Launch:** "Every new game receives **48 guaranteed hours** on the homepage" [3rd, snippet attributed to CrazyGames]. Games that do well in the first days get "additional visibility through featured spots and algorithmic promotion" [3rd: cinevva].
- **How the algorithm chooses** [S, via search]: placements are selected by device, country and OS, some are personalised by history, and games appear in feeds and carousels by genre, tags and engagement.
  - Leaderboard games get a sidebar page, homepage carousels and widgets [S, `market-depth` §1.2].
  - Liquid Swarm: after the rewarded placement, "CrazyGames' algorithm ranked the game higher, generating more plays" [F]. Revenue per play feeds back into traffic.
- **Observed curves:**
  - **Puckit:** ≈ 23k/day peak (days 1–3, "hot" label) → ≈ 2.5k/day from day 5, a drop of **≈ 89% from peak** within a week [F].
  - **Liquid Swarm:** grew over six weeks with updates [F].
  - **Solo browser TD** (own traffic, not a portal): launch-day players "halving each day"; D1 2% [F: [itch.io](https://itch.io/t/6645181/launch-week-postmortem-solo-browser-td-product-hunt-a-portal-rejection-and-a-flagged-show-hn-numbers-inside)].
  - A **typical** Full Launch game's plays per day: **NOT FOUND**.
- **Hits, for scale (other platforms):**
  - Poki: Playrea's "Brainrot Puzzle" hit **1M plays in one day**; 5 games held **≈ 200k plays a day** combined [F: [Medium](https://medium.com/@playrea/from-hobby-to-67-million-gameplays-on-poki-in-2025-df2c147cfb27)].
  - YouTube Playables' best 2026 releases: 243k–394k plays a day [3rd, `market-depth` §1.4].
  - A CrazyGames hit's plays per day: **NOT FOUND**.
- **Calendar effects:** weekdays +22% over weekends; Thursday has the most sessions, Friday the longest; the US average session is **30 min** (1.74B sessions, May 2025–May 2026) [S: [CrazyGames via PocketGamer.biz](https://www.pocketgamer.biz/report-hypercasual-and-puzzle-games-dominate-the-browser-gaming-space/), [WN Hub](https://wnhub.io/news/analytics/item-50915)].

### 1.6 Basic Launch → Full Launch, and QA review
- **The rule** [S, `crazygames-requirements` §2]: average playtime, conversion (≥ 1 min played) and D1 retention are "benchmarked against other games on the platform".
  - All metrics at or above benchmark → invited to Full Launch.
  - Some → may improve and retry Basic Launch.
  - Most below → the game can't proceed; resubmit it as a new game with "significant improvements".
- **What "good" means** [S]: top titles convert **80%+**, play **10+ min** and reach D1 **10–15%**. The platform's average D1 is **6.7%**.
- **The pass marks themselves: NOT FOUND** ("No numeric bar is published").
- **Conversion rate from Basic to Full Launch: NOT FOUND.** No interview, talk or doc gives a share.
  - The one data point: Liquid Swarm, "many [metrics] in the top 20%", went to Full Launch in ≈ 3 weeks (submitted May 5, released May 27) [F].
- **QA rejection rate: NOT FOUND.** The "90%" and "99%" figures are YouTube titles with no method [F]. Treat them as a sign that rejection is common, not as a rate.
- **Time to money** [3rd: cinevva; F: Liquid Swarm]: review ≈ 2 days; Basic Launch 7–21 days; Full integration + second QA a few days. Submission to Full Launch ≈ **3–4 weeks**.

---

## 2. Web ad economics 2025–2026

### 2.1 eCPM
No portal publishes a rate card. Every number below is secondary or vendor data. Mobile *app* benchmarks don't transfer: AdMob,
AppLovin, Unity and ironSource don't serve web inventory [3rd: AppLixir].

| Format, geo | eCPM (gross, before the portal's share) | Tag / source |
|---|---|---|
| Rewarded video, US | **$15–28** | [3rd] [cinevva](https://app.cinevva.com/guides/web-game-monetization) |
| Rewarded video, EU | $8–15 | [3rd] same |
| Rewarded video, tier-3 (India, Brazil) | **$1–3** | [3rd] same |
| Rewarded video, web blended | $4–15 (top: US/Western Europe desktop); AppLixir network "$4+" | [U] [AppLixir](https://www.applixir.com/blog/ecpm-optimization-for-web-games-benchmarks-and-fixes/) |
| Rewarded web (Google Ad Manager) | €30+, **fill ≤ 30%** | [3rd] [FatChilli](https://fatchillimedia.com/860/rewarded-ads-on-the-webadelivering-surprisingly-high-a30-cpms-for-publishers/) |
| Interstitial / midgame | ≈ half of rewarded; $4–15 in tier-1 | [3rd] cinevva, [U] AppLixir |
| H5 Games Ads (AdSense) on your own site | "$10 eCPM" reported by some developers; Google's case: +20% revenue, +50% eCPM in 3 months | [U] [monetizemore](https://www.monetizemore.com/blog/game-monetize-online-games/), [S] [AdSense H5](https://adsense.google.com/start/h5-games-ads/) |
| Web display | $0.5–2 | [U] AppLixir |
| US video, desktop vs mobile | desktop avg **$15** (range $8–25), mobile avg **$12** ($7–25): desktop **+20–25%** | [3rd] [adsposure 2026](https://www.adsposure.com/cpm/) |
| CrazyGames' own eCPM | **NOT FOUND** (only "+15% YoY" on HIRO-treated inventory, Q3 2025) | [S-vendor] Zeta |

**CrazyGames' geography (drives the blend):**
- The US is 22.8% of desktop traffic, then India 8.9%, Vietnam 8.1%, Turkey 5.1%, UK 3.4%, others 51.8% [3rd: Similarweb, Aug 2026].
- Mobile is **69.7%** of visits, desktop 30.3% [3rd: Semrush, Aug 2026]. The mobile share of *plays* and of *revenue*: **NOT FOUND**.
- Liquid Swarm: "many CrazyGames users come from low-income countries with devices that don't support WebGL2" [F].
- Poki for comparison: US 14.6%, Brazil 10.1%, Vietnam 9.8%, India 9.3% [3rd: Similarweb]; mobile 40% of players by Poki's count, 32% by Similarweb's [3rd: [Naavik](https://naavik.co/digest/web-gaming-strikes-back/)].

**derived blended gross eCPM for CrazyGames traffic** (≈ 25–35% tier-1, ≈ 70% mobile): midgame ≈ **$2–6**, rewarded ≈ **$4–12**.
This is the analyst's estimate, not a measurement.

### 2.2 Fill rate
- Vendors claim **90%+** in the US, Canada and UK; AppLixir's network averages 95.1% fill, 97% opt-in and 93.8% completion [U: AppLixir].
- Rewarded web inventory through Google Ad Manager: "**up to 30%**" [3rd: FatChilli].
- CrazyGames' SDK returns `unfilled` and CrazyGames serves **fallback banners** for unfilled rewarded requests [S, `crazygames-requirements` §5]. Unfilled requests are expected enough to have a fallback.
- **CrazyGames' fill rate: NOT FOUND.** Model it as 60–90% midgame and 50–90% rewarded (analyst judgement).

### 2.3 How many ads a session may show
- **CrazyGames** [S]:
  - Midgame at most **1 per 3 min**, counting preroll and rewarded; a request before that "just gets ignored" (`adCooldown`).
  - Revive once per session; rewarded currency capped per day (example: 5).
  - No chained ads, no levels passable only by ad.
  - First midgame after the tutorial or 3–5 min.
- **Poki** [S]: `commercialBreak()` before each `gameplayStart()`; Poki paces the breaks itself; no internal ad timers. The published cap: **NOT FOUND**.
- **Mobile-app norms, for comparison** [3rd]: first interstitial after 60–90 s, 2–3 min between, 4–6 a session.

### 2.4 Impressions per player-hour
- **derived from the CrazyGames numbers** (top games' impressions per play ÷ genre average playtime):

  | Genre | Impressions per play | Playtime | Per hour: all | Per hour: midgame | Per hour: rewarded |
  |---|---|---|---|---|---|
  | Puzzle | 8.9 | 21 min | ≈ **25** | ≈ 11 | ≈ 12 |
  | Word | 7.9 | 14 min | ≈ 34 | ≈ **21** (= the cap) | ≈ 12 |
  | Clicker | 5.5 | 15 min | ≈ 22 | ≈ 11 | ≈ 11 |

- These are **upper bounds**: the impressions are for *top* games, the playtimes are *genre averages*, and top games play longer.
- **Ceilings:** midgame ≤ **20 an hour**. Rewarded has no hard cap, but CrazyGames pushes once-per-session revives and daily caps.
- **Platform average (derived):** ≥ 1.4 impressions per gameplay (§1.4 #5).

---

## 3. Poki, GameDistribution, Coolmath, Yandex (for comparison)
- **Poki's deal** [S, `platforms` note; 3rd: [IndieGameBusiness](https://indiegamebusiness.com/web-gaming-for-indie-developers/)]:
  - Web-exclusive, 5 years: **50%** of revenue from players Poki brings, **100%** from your own traffic.
  - Non-exclusive: a one-time fee, no share.
- **Poki's gates** [S: [how testing works](https://developers.poki.com/guide/how-testing-works), [Web Fit Test](https://sdk.poki.com/web-fit-test.html); 3rd: [Kuyi Mobile](https://kuyimobile.substack.com/p/my-game-production-process-and-how)]:
  - **Player Fit Test:** 500 players; healthy = 3+ min average **and 25%+ of plays over 3 min**.
  - **Web Fit Test:** ≈ 10,000 players, ≈ 5–7 days, then a final review of 1–2 weeks.
  - Benchmarks: the average game has ≈ 70% conversion and 6+ min; aim for 65%+ conversion and 5+ min (10+ for management and simulation).
  - **Pass rate: NOT FOUND.**
- **Poki's earnings, public:**
  - Top studios earn "up to **€1 million a year**" [S: Poki via [Mobidictum](https://mobidictum.com/pokis-web-gaming-interview-michiel-van-amerongen/)].
  - A top-10 developer made **$50k** a year in 2020 and ≈ **$1M** now [3rd: Bloomberg 2025-11].
  - Solo BLUMGI: 100M plays in 2 years, "live comfortably" [S: [Poki Medium](https://medium.com/poki/blumgi-my-journey-on-the-web-how-i-reached-100m-players-in-2-years-as-an-indie-game-developer-6071481a3461)].
  - Playrea: 67M plays in 2025 from 5 games, ≈ 200k a day [F].
  - Poki's revenue has grown ≈ 50% a year since 2020 [3rd: Bloomberg].
  - **No Poki developer has published money per play: NOT FOUND.**
- **GameDistribution:** **33% of net** revenue, €100 minimum, paid ≈ 60 days after the monthly report; small developers report cents to "$1–2 per game" a day [S: [GD terms](https://static.gamedistribution.com/terms/developer.html); F: [html5gamedevs](https://www.html5gamedevs.com/topic/40362-monetising-html5-games/)].
- **Coolmath Games:** no in-game ads; flat **licence fees**. A Suika-style game (60M+ players across portals, #1 on Coolmath mobile) earned **$25k+** from licences of **$1,500–2,500** each [F: [gameplaydev](https://gameplaydev.substack.com/p/my-ai-generated-game-earned-25000)].
- **Yandex Games:** **$70M** paid to developers over four years; IAP revenue for developers +75% in 2025 [3rd: [WN Hub](https://wnhub.io/news/other/item-49945), Yandex].

---

## 4. Google Play Families with AdMob (kids apps)

### 4.1 eCPM for child-directed traffic

| Item | Number | Tag / source |
|---|---|---|
| COPPA traffic vs general | **2.5–5× lower** eCPM | [3rd] [GameBiz Consulting, 2026](https://www.gamebizconsulting.com/newsletter/admon-newsletter-11-the-shrinking-island-ad-monetization-underage-users) |
| Marking a whole app child-directed | "could cost 70% of your eCPM on every user" | [3rd] same |
| Moving a mixed app to kids-certified ads | −6% to −30%+ eCPM | [3rd] same |
| US kids/education, interstitial | **$4–8** (all verticals: $9–14) | [U] [RevenueLab 2026](https://www.revenuelab.fyi/blog/admob-ecpm-benchmarks-2026) (an aggregate of network reports) |
| US kids/education, rewarded | $6–11 (not usable: no rewarded ads in our kids games) | [U] same |
| US kids/education, ARPDAU | **$0.02–0.05** | [U] same |
| General US Android interstitial, for scale | **$14.08** (rewarded $16.49), Q4 2024 | [3rd] [Appodeal 2025](https://appodeal.com/wp-content/uploads/2025/03/Appodeal-The-Latest-eCPM-Report-2025.pdf) |
| General US Android interstitial, Tenjin | $16.15 (rewarded $30.25), Q2 2024 | [3rd] [Tenjin](https://tenjin.com/blog/ad-mon-gaming-2026/) |
| Demand is shrinking | AppLovin SDK ≥ 13 can't be initialised for kids' traffic since **Jan 2025**; ironSource Direct sunset | [3rd] [Kidoz](https://www.kidoz.net/blog/navigating-the-applovin-decision-a-guide-for-developers-with-kids-and-mixed-audiences), GameBiz |
| Fill | family-safe ads are "a subset" of the pool, so expect lower match and fill. TutoTOONS raised fill **+30%** and ad revenue **+20%** by moving to AdMob | [S] [AdMob help](https://support.google.com/admob/answer/6223431?hl=en), [AdMob case](https://admob.google.com/home/resources/tutotoons-ensures-ad-safety-and-boosts-revenue-20-percent-with-google-admob/) |

**derived global kids interstitial eCPM** (US $4–8, most installs outside the US, ÷ 2.5–5 outside tier-1): **≈ $1–4**.

### 4.2 Downloads with no marketing
- **Lifetime installs of all Play listings** (3,037,501 listings, 2026-07-27 to 08-25): <100: **37%**; 100–999: 26%; 1k–9,999: 19%; 10k–99,999: 11%; 100k–999,999: 5%; ≥ 1M: 2% [3rd: [Testers Community](https://www.testerscommunity.com/research/google-play-statistics)].
- "The vast majority of the ≈ 300 new mobile games released every day will never reach 1,000 downloads" [3rd: [PixelPicked](https://pixelpicked.com/blogs/why-indie-mobile-games-keep-dying)]. New releases get a 48–72-hour window for algorithmic boosts [3rd, same].
- **Old kids anecdotes:**
  - Two preschool edu apps earned $1,311 in Jan–Apr 2017, **$250–420 a month** [F: [Medium](https://medium.com/jimmy-tech-log/app-development-report-april-2017-baaee7b6ec1)].
  - A one-person preschool developer (XigXag) lives mostly from AdMob [S: [AdMob case study](https://services.google.com/fh/files/misc/admob-case-study-xigxag.pdf)].
  - Six simple Android games by donislawdev got 26,857 downloads in total, ≈ 2018 [F].
- **A new kids app's downloads per month: NOT FOUND.** The Kids tab requires Teacher Approved; its install uplift: **NOT FOUND**.

### 4.3 "Remove ads" conversion
- SHREDD (2015): 96 ad-removal IAPs in the first week from ≈ 10k DAU and 400k+ downloads, **≈ 0.1% of DAU and ≈ 0.02% of downloads** [F: [TouchArcade](https://toucharcade.com/2015/05/14/the-developer-of-shredd-added-an-iap-to-remove-ads-the-results-may-shock-you/)].
- All IAP in F2P games: 1.5–3.5% of active users pay [3rd: [MAF](https://maf.ad/en/blog/mobile-game-conversion-rates/)]. That counts every purchase, not ad removal.
- A one-time purchase next to a subscription lifts total conversion 15–25% [S: [RevenueCat](https://www.revenuecat.com/blog/growth/2025-app-monetization-trends)].
- **A kids-app remove-ads conversion: NOT FOUND.**
  - Parents in reviews complain about ads and praise "no ads" (`forums` §5), which argues for a higher rate than SHREDD's.
  - The parent gate before a purchase adds friction.

---

## 5. Genre benchmarks on web portals

CrazyGames' own numbers from its monetization guides [S]. New in this note: **word** and **driving** impressions.

| Genre | Avg playtime | D1 | Impressions per play (top games) | Earnings signal |
|---|---|---|---|---|
| Puzzle | **21 min** | 6.2% | 8.9 (4.2 rewarded) | **largest category in the top 100 by earnings**; conversion 68% |
| Clicker / idle / incremental | 15 min | 6.6% | 5.5 (≈ half rewarded) | "perform really well"; Liquid Swarm €31/day [F] |
| Word | 14 min | 7.6% | 7.9 (2.8 rewarded) | — |
| Action | ≈ 13 min | **8.1%** | "more rewarded than the platform average, even with shorter sessions" | — |
| Shooting | 12 min | 6.5% | — | — |
| .io | 9 min | 5.7% | — | multiplayer: "2× retention" |
| Driving | 8.7 min | 5.7% | 7 (mostly midgame) | "over-rely on forced midgame ads" |
| Hypercasual | 8.6 min | 6% | — | weakest |
| Tower defense, roguelite | **NOT FOUND** | NOT FOUND | NOT FOUND | a solo browser TD: D1 2% [F] |
| **Platform** | US session 30 min | **6.7%** | ≥ 1.4 per gameplay (derived) | — |

- **Poki:** the average game converts ≈ 70% and plays 6+ min [S]. By genre: **NOT FOUND**.
- **Mobile, for contrast:** median D1 ≈ 22%, top quartile ≈ 30% [3rd: [GameAnalytics 2025](https://gamedevreports.substack.com/p/gameanalytics-mobile-gaming-benchmarks)]. Web D1 is ≈ 3× lower: a portal game lives on new players, not on returns.
- **Revenue by genre, in money: NOT FOUND.** Only the ranking (puzzle first) is public.

## 6. What drives revenue per player on portals
1. **Playtime.** "Average play time and impressions per play are linked" [S: CG action guide]. With a 3-min midgame cap, each extra 3 minutes buys at most one more midgame.
   - Liquid Swarm: halving one upgrade price nearly **doubled playtime** (`forums` §1) [F].
2. **Natural breaks.** A midgame can only fire at a break. A game without a break every ≈ 3 min leaves the cap unused. Midgame is 40–60% of casual earnings [S].
3. **Rewarded placements.**
   - Highest eCPM, opt-in [S].
   - Top puzzle games get ≈ half their impressions from rewarded [S].
   - One rewarded placement: **+25% revenue** and a better algorithm rank (Liquid Swarm) [F].
   - Best-converting placements [S]: revive (once per session), ×2 loot, a hint with a 1-min cooldown, try a locked item for one run, welcome-back multipliers (idle), finishing a milestone's last leg.
4. **Returning players.**
   - D1 is 6–8% on average and 10–15% for strong games [S].
   - 37% of web gamers play several times a day [S: Poki 2026 survey].
   - Leaderboards and daily caps are the portal's own return tools [S].
   - Revenue from returning players vs new: **NOT FOUND**.
5. **Device and geography.**
   - ≈ 70% of CrazyGames visits are mobile [3rd]. Desktop video pays ≈ 20–25% more in the US [3rd].
   - Low-end devices fail on heavy tech: WebGL2 cost Liquid Swarm ⅓ of revenue [F].
   - Tier-3 rewarded pays ≈ 1/10 of US [3rd].
6. **Algorithmic feedback.** Engagement decides homepage and carousel placement [S], so the metrics that earn money also buy traffic.
7. **Exclusivity.** +50% for 2 months, browser portals only [S]. It conflicts with Poki's 5-year exclusive.

---

## 7. Model inputs

Low / mid / high are the analyst's ranges **built from** the sources named. "derived" = arithmetic on sourced numbers.
"judgement" = no source; a placeholder to replace with our own data after the first Full Launch.

| Parameter | Low | Mid | High | Source / confidence |
|---|---|---|---|---|
| CrazyGames developer share of **gross** ad revenue | 45% | 50% | 60% | 60% of net [3rd, 2026 jam terms]; net = gross − direct costs (20% in the 2021 terms) [S/F]. **Medium** |
| CrazyGames IAP share | 60% | 70% | 70% | [3rd] jam terms; IAP invite-only. **Medium** |
| Exclusivity bonus (2 months, browser only) | — | +50% of compensation | — | [S] terms 2025-08-18. **High** |
| eCPM midgame, **desktop**, CG traffic blend (gross) | $2 | $5 | $10 | derived: US $4–15 [3rd/U], US 23% of traffic, desktop +20–25% [3rd]. **Low** |
| eCPM midgame, **mobile web**, CG traffic blend (gross) | $1 | $3 | $7 | derived, same inputs. **Low** |
| eCPM rewarded, CG traffic blend (gross) | $3 | $8 | $15 | derived: US $15–28, EU $8–15, T3 $1–3 [3rd]. **Low** |
| Fill rate, midgame | 60% | 80% | 95% | vendor 90%+ tier-1 [U]; CG `unfilled` path exists [S]; CG's own rate NOT FOUND. **Low** |
| Fill rate, rewarded | 30% | 70% | 95% | ≤ 30% GAM web rewarded [3rd] vs 95% AppLixir [U]; CG fallback banner [S]. **Low** |
| Midgame ads per player-hour **allowed** | — | — | **20** | 1 per 3 min [S]. **High** |
| Midgame ads per player-hour **achieved** | 5 | 11 | 20 | derived: top puzzle/clicker ≈ 11, word ≈ 21 [S]. **Medium** |
| Rewarded ads per player-hour achieved | 1 | 5 | 12 | derived: top puzzle/word/clicker ≈ 11–12 [S] = the high end; revive once per session [S]. **Medium** |
| Ad impressions per play (all) | 1.5 | 3.5 | 9 | ≥ 1.4 platform-wide (derived, Zeta [S-vendor]); top genres 5.5–8.9 [S]. **Medium** |
| **Developer revenue per 1,000 plays (CG)** | €1 | $5 | $15 | €1.0–4 in ≈ 2018 [F]; ≈ $6.5–8 platform average (derived); high = a top puzzle game: 8.9 imp × 80% × $4 × 50% ≈ $14 (derived). **Low** |
| Basic Launch test traffic, plays/day | 25 | 150 | 300 | ≥ 500 plays in 7–21 days [S]; 6,100 impressions/day at 0.4% CTR [F]; 2–4% CTR target [F]. **Low** |
| New game plays/day, **wk 1** after Full Launch — typical / good / hit | 300–1,500 | 5,000–25,000 | 100,000–1,000,000 | typical: **NOT FOUND** (judgement). Good: Puckit 23k peak [F]. Hit: Poki 1M/day [F]; a CG hit NOT FOUND. **Low** |
| … **wks 2–4** — typical / good / hit | 100–500 | 2,000–6,000 | 30,000–200,000 | Puckit 2.5k steady [F]; Liquid Swarm €31/day ≈ 3–6k plays (derived); Playrea 5 games ≈ 200k/day [F]. **Low** |
| Decay, launch peak → steady (first 1–2 weeks) | −95% | −85% | −60% | Puckit −89% [F]; 48 h homepage window [3rd]. **Low** |
| Decay per month after that, no updates | −40% | −20% | −5% | **NOT FOUND** (judgement). Updates can grow a game (Liquid Swarm [F]). **Very low** |
| Basic → Full Launch, all 3 metrics ≥ platform benchmark (≈ top 20–30%: conversion ≥ 75–80%, playtime ≥ 10 min, D1 ≥ 8–10%) | 50% | 75% | 90% | rule [S]; Liquid Swarm passed with "top 20%" [F]; the rate itself NOT FOUND. **judgement** |
| … some metrics at benchmark | 0% (retry) | 10% | 30% | [S]: "may be invited to improve… another Basic Launch". **judgement** |
| … most below benchmark | 0% | 0% | 0% | [S]: "can't proceed"; resubmit as a new game. **High** |
| QA review pass rate (first submission) | 10% | 40% | 70% | **NOT FOUND.** "90–99% rejected" claims have no method [F]. Ours: Petri Panic was rejected at review for originality ([decisions.md](../team/decisions.md) D47). **Very low** |
| Google Play kids interstitial eCPM, **US** | $3 | $5 | $8 | $4–8 [U]; COPPA 2.5–5× below general $14 [3rd]. **Low–medium** |
| Google Play kids interstitial eCPM, **global blend** | $0.8 | $2 | $4 | derived: US $4–8 ÷ the tier mix. **Low** |
| Kids interstitials per DAU (Families rules, natural breaks) | 1 | 2.5 | 4 | derived from the mobile norms (2–3 min apart, 4–6 a session) [3rd]; kids sessions are short. **Low** |
| Kids ARPDAU (ads) | $0.001 | $0.005 | $0.03 | derived = impressions × eCPM; US vertical $0.02–0.05 [U]; marketer's target ≥ $0.02. **Low** |
| Kids new-app downloads per month, no marketing | 10 | 100 | 1,500 | derived from the lifetime distribution: 63% < 1,000 lifetime, 19% 1k–10k, 18% > 10k [3rd]; a kids-specific number NOT FOUND. **Low** |
| Remove-ads conversion (share of installs that buy) | 0.05% | 0.3% | 1.5% | SHREDD 0.02% of downloads / 0.1% of DAU [F, 2015]; all-IAP payers 1.5–3.5% [3rd]; kids NOT FOUND. **Very low** |

### 7.1 How to combine them (formula for the estimator)
```
dev revenue/day (CG) = plays/day × [ min(playtime_min/3, breaks_per_play) × fill_mid × eCPM_mid
                                    + rewarded_per_play × fill_rew × eCPM_rew ] / 1000 × dev_share_of_gross
eCPM_mid = 0.3 × eCPM_desktop + 0.7 × eCPM_mobile     (70% mobile visits; replace with the dashboard's split)
```
- **Worked check (derived):** a good incremental game at 3,500 plays a day, 15 min per play:
  - midgame: min(5, 4 breaks) × 0.8 × $3.6 = $11.5 per 1,000 plays;
  - rewarded: 1.5 per play × 0.7 × $8 = $8.4 per 1,000 plays;
  - total ≈ $19.9 gross per 1,000 plays × 50% share ≈ $10 per 1,000 → ≈ **$35 a day**.
  - That is close to Liquid Swarm's reported €31/day, so the mid inputs are consistent with the one recent data point. They are not validated by it.
- **Kids (Google Play):** `revenue/month = DAU × 30 × ARPDAU + installs/month × remove_ads_rate × price × 0.85`
  (Google's fee is 15% on the first $1M a year).

## 8. Sources not reachable, to re-check with a browser
- `files.crazygames.com/documents/developer_terms_20250818.pdf`: the exact Article V percentages and the direct-cost rate.
- `crazygames.indiehero.io/cggmwj-jg/`: the 60/70 wording and its conditions.
- The Liquid Swarm devlog: plays per day behind €31/day. That would give the only modern revenue per 1,000 plays.
- `docs.crazygames.com/resources/*`: platform-average impressions per play (the guides compare genres to it).
- The Poki 2026 report PDF (`hub.poki-cdn.com`): mobile share and session data.
- Reddit r/gamedev and r/incremental_games (not indexed by the search tool): earnings threads.
