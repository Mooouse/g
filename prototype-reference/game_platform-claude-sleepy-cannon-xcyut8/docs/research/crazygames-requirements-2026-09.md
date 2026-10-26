# CrazyGames developer requirements and rejection reasons (reconstructed 2026-09-30)

`docs.crazygames.com`, `crazygames.com`, `files.crazygames.com`, the Wayback Machine, Google cache, Trustpilot, LinkedIn,
itch.io, Poki docs, cinevva, pley and every other non-GitHub host were **blocked by the egress proxy**. Only WebSearch
snippets and `raw.githubusercontent.com` could be reached. Two public GitHub repositories turned out to hold
**word-for-word copies of the official pages**, which made it possible to read most of the docs in full.

## Markers and sources

| Marker | Meaning |
|---|---|
| **[S]** | Seen in a WebSearch snippet of the official docs (`docs.crazygames.com/...`). The snippet is a search engine's paraphrase, so quotes are close to the original but not guaranteed exact. |
| **[3rd]** | A third-party page read in full. **[3rd-M]** is a third-party *verbatim copy of an official page* (a mirror), read in full. Quotes marked [3rd-M] are the official wording, but the copy may be older than the live page. |
| **[F]** | A forum post, review, video or other anecdote, usually seen only as a snippet. |
| **NOT CONFIRMED** | Could not be confirmed from any official source. |

Mirrors and research files (all read in full):

- **M1**: <https://raw.githubusercontent.com/cosmicrafts/Adventures-Bevy/HEAD/crazygames.md>. A verbatim dump of the developer portal's submit form plus the docs pages Introduction, Requirements intro, Technical, Gameplay, Ads, Account integration, Multiplayer, Game covers, Quality, SDK intro, Video ads, Banners, Game, User and more. It is undated but **older than the live docs**: it says Basic Launch lasts "2-week", and it lists the portrait preview video as optional, where the live snippets say "7 to 21 days" and "mandatory".
- **M2**: <https://raw.githubusercontent.com/wanghaisheng/OpenAgenticGame-Studios/HEAD/docs/qulification/crazygames/quality.md>. A verbatim copy of `/requirements/quality/`, identical to the quality section of M1.
- **R1**: <https://raw.githubusercontent.com/d954mas/game-67-idle/HEAD/features/platform-sdk/references/portals/crazygames.md>. A research packet "checked against primary sources" on **2026-09-07**, including the FAQ and the live submit form.
- **R2**: <https://raw.githubusercontent.com/manueltarouca/claude-marketplace/HEAD/plugins/matm-skills/skills/crazygames-publishing/references/launch.md> (with `ads.md` and `requirements.md` next to it). A snapshot of the docs taken **2026-08-19**.
- **R3**: <https://raw.githubusercontent.com/a52cents/was-it-there/HEAD/submission/crazygames/pre-submission-audit.md>. A pre-submission audit against the live docs, dated **2026-07-25**.

---

## 1. requirements/intro: Requirements overview

Official page: https://docs.crazygames.com/requirements/intro/

- **Purpose.** "To be published on CrazyGames, your game must meet our requirements. We designed these standards to ensure all games on our platform are **fun, unique, visually appealing, and properly integrated**." [S] [3rd-M: M1]
- **Two stages.** "A game in Basic Launch allows you to go live without needing to customize your game for CrazyGames. The CrazyGames SDK is optional and monetization is not available." Once the game is selected for Full Launch, "you are required to comply to all integration requirements listed below, including the CrazyGames SDK." [S] [3rd-M: M1]
- **Summary table** (Basic Implementation → Full Implementation) [3rd-M: M1], [S] for the individual cells:

  | Area | Basic Implementation | Full Implementation (also includes everything in Basic) |
  |---|---|---|
  | Technical | Initial download ≤ 50 MB · total ≤ 250 MB ("50MB without SDK") · file count ≤ 1500 | SDK and the GameplayStart event |
  | Gameplay | "Basic visual QA checks" · "Adhere to PEGI12" | "Full visual QA check" · "Land directly in gameplay" |
  | Advertisement | "CrazyGames monetization is disabled" · "No external ads" | "Ads through SDK, following our guidelines" · "Works with AdBlock" |
  | Account integration (only when applicable) | "No external login options" | "Progress is linked to CrazyGames Account" · "Use CrazyGames username & avatar" · "Automatic login for CrazyGames users" |
  | Multiplayer (only when applicable) | optional | "User room info" · "Invite link (if applicable)" · "Instant multiplayer flow" · "Keep rooms across rounds" · "DisableChat preference" |
  | In-game purchases | "Invite Only", not available | "Use CrazyGames Xsolla account and userId" |

- **What you submit besides the build.** "qualitative metadata (game description and controls) and Game covers (images and videos)." [S] [3rd-M: M1]
- **Quality guidelines are optional.** They are "optional but based on our insights in our audience and web gaming". In the docs they are marked with a "Guideline" badge. [S] [3rd-M: M1]
- **Money.** "The primary monetization mechanism we offer is through advertisement revenue share. Only ads served through our SDK are allowed." In-game purchases are for "Selected games" only, need Full Implementation and use Xsolla. [S] [3rd-M: M1]
- **Dashboard metrics.** Players, Average playtime, Gameplay conversion, Retention, Revenue. ByteBrew is recommended for deeper analytics. [3rd-M: M1]
- **Personal data.** If the game "collects additional personal data beyond the events in our SDK", it must show new players a Terms & Conditions and/or Privacy Policy notice. The docs recommend "a simple notice rather than a pop-up blocking the user". [3rd-M: M1]
- **SDK support.** "Once your games reach **50k plays** (combined), we can offer you technical support with SDK integration." [3rd-M: M1] [3rd: R2]
- **QA tool.** The Developer Portal preview lets you "Run your game as it would on CrazyGames", "Check if your game meets our requirements" and "Test all the SDK features". [3rd-M: M1]

## 2. Docs root: Launching on CrazyGames, Basic Launch vs Full Launch

Official pages: https://docs.crazygames.com/ and https://docs.crazygames.com/resources/basic-launch-metrics/

- **Every game is reviewed.** "All game submissions are carefully reviewed by our QA team according to our technical and quality requirements." [3rd-M: M1] [S]
- **Why two stages.** The goal is "to shorten the initial launch timeline and evaluate real-world performance before proceeding to a global release." [3rd-M: M1]
- **Basic Launch.** "Test your game on our platform with a limited audience for a temporary period of **7 to 21 days**" [S]. The older copy says "temporary 2-week period" [3rd-M: M1].
  - It "Requires Basic Implementation; no CrazyGames-specific integration and only Basic QA review." [S] [3rd-M]
  - "Monetization (video ads, banners, in-game purchases) is disabled." [S] [3rd-M]
- **When Basic Launch ends.** It ends "once your game has been live for at least **7 days** and has reached at least **500 plays**. If your game hasn't reached 500 plays by then, the period ends automatically after **21 days**." [S] [3rd: R1, R2]
- **Ads are switched off during Basic Launch.** The docs give three reasons: "to create the best possible player experience and reduce friction during early testing", "to ensure engagement metrics aren't influenced by ad interruptions", and "to focus on understanding true player interest and retention". Ads stay disabled even if the SDK is integrated. [S]
- **What decides Full Launch.** "Progression to the Full Launch stage is based on key engagement metrics - **average playtime, conversion to gameplay, and retention**. These metrics will be **benchmarked against other games on the platform**." [S] [3rd-M: M1]
- **Possible outcomes** [S] [3rd-M: M1]:
  - "If all metrics meet or exceed benchmarks, you are invited to update your game", implement Full Implementation, and submit that version for Full Launch.
  - "If some metrics meet benchmarks, you may be invited to improve your game and request another Basic Launch period."
  - "If most metrics fall below benchmarks, your game unfortunately can't proceed to Full Launch. If you wish to submit it again, you need to **submit as a new game including significant improvements**."
- **Skipping Basic Launch.** "multiplayer titles that require a larger audience or games already published elsewhere and specifically invited by our team" may go straight to Full Launch. [3rd-M: M1]
- **During Full-Launch integration**, "the Basic version remains available to its initial limited audience." [3rd-M: M1]
- **A second QA review.** Games that perform well and are updated to the Full requirements "are reviewed once more by our QA team before moving to full launch." [S]
- **Basic Launch benchmarks.** The docs frame these as what successful games reach, not as published pass marks [S] [3rd: R1, R2]:
  - Average play time: "Successful titles often see **10+ minutes**."
  - Day-1 retention: "Strong games often achieve **10–15%**." It appears on the dashboard one day late.
  - Conversion ("the percentage of players who play for at least one minute after starting the game"): "Top-performing titles typically convert **80%+** of players, load in **under 10 seconds**, and have a build size **below 20 MB**."
  - **NOT CONFIRMED:** the exact benchmark values that decide Full Launch. R2 notes: "No numeric bar is published."
- **Advice from the Basic Launch guide** [S]:
  - "if players are shown ads before they understand the core loop, they may leave". Wait "until the player completes the tutorial or has played for at least **3-5 minutes** before showing a midgame ad".
  - "load tutorial-critical assets first, start gameplay as soon as the tutorial can be played, and continue loading main-game content while the player is in the tutorial."
- **Genre averages** from the monetization guides. Use them to set expectations [S]:

  | Genre | Average play time | Day-1 retention | Notes |
  |---|---|---|---|
  | Platform average | — | **6.7%** | |
  | Puzzle | **21 min** ("32% above the platform average") | 6.2% | Largest category in the top-100 by earnings; conversion 68%; 8.9 ad impressions per play |
  | Clicker / idle / incremental | **15 min** | 6.6% | "perform really well on CrazyGames"; 5.5 impressions per play |
  | Action | **≈13 min** | **8.1%** ("21% above the platform average") | |
  | Shooting | 12 min | 6.5% | |
  | .io | 9 min | 5.7% | |
  | Hypercasual | **8.6 min** | 6% | Weakest |
  | Driving | — | 5.7% | |

## 3. requirements/quality: Quality guidelines (the most important page)

Official page: https://docs.crazygames.com/requirements/quality/. Full verbatim text: [3rd-M: M1, M2]. Key lines were also seen in [S].
Officially these are "optional" best practices ("Guideline"). But the FAQ's QA rejection list uses the same themes
(originality, fun, polish), so in practice they gate acceptance (see §12).

- **Framing.** "Whether a game is 'good' or 'bad' can often be subjective, but there are best practices learned from our experiences with successful games. The following list is non-exhaustive." [3rd-M]
- **Onboarding.** "it is crucial that users get to gameplay quickly, understand what the game is about and how to control it." [S] [3rd-M]
  - "Provide a simple onboarding phase where new users land directly."
  - "Implement the onboarding in gameplay."
  - "Focus on the core functionality so users can start playing, avoid explaining every single feature."
  - "Make the onboarding phase skippable."
  - "Prioritize visuals and limit the use of text for onboarding."
  - "Show the user how to control the game with a keyboard overlay or mouse gestures."
  - Make sure the UI is clear: "Buttons are clearly labeled to indicate how to proceed", "Buttons are **not sized to encourage ads** or other behaviors", "Buttons **do not have delays** to confuse users or encourage other behaviors."
- **General principles** [3rd-M]:
  - "There are clear goals that the player can reach."
  - "The game is easy to learn."
  - "The game is easy to understand — the language is correct and clear, well translated, or the game makes good use of universal graphics prompts."
  - "The controls are consistent and intuitive throughout the game."
- **"What makes your game a fun experience?"** [3rd-M]
  - "The game responds quickly to the player's actions."
  - "The challenge, strategy, and game story are balanced and well-paced."
  - "The display layout is comfortable and intuitive."
  - "The audio is comfortable and appropriate for the game."
  - "The game interface is designed for the user's device (desktop and optionally mobile)."
  - "**Various player segments can enjoy the game.**"
  - "The game story or scenarios are interesting where applicable."
  - "There are **no overly repetitive or 'boring' tasks** in the game."
  - "The game processes information quickly to give players a feeling of smooth flow and continuity."
  - Solo and friends: "Playing alone is as prominent as playing with friends if both are offered"; "If playing alone is not available, the game clearly explains that."
- **"Is your game unique?"** [S] [3rd-M]
  - "It should be easy to improve or modify the game to add new content like new levels, art, story elements, etc."
  - "Major features such as the game's genre should not change after submission."
  - "The game should be frequently maintained and updated."
  - "The game is **not easily confused with another that features a similar name or iconography**."
  - "The game does not use a **common identifier** unless the game developer owns the respective IP. E.g. the name 'Super Chess' is unique and clear, while simply 'Chess' is not. The name 'Scrabble' is clear and unique, but can only be used by the IP holder."
  - Note: this section is about *identity*: name, iconography, maintainability. The page does not literally say "the concept must differ from existing games". That test is applied by QA through the FAQ's "Unoriginal content" criterion (§12) and through feedback like "close to existing titles" (§15).
- **"Is your game aesthetically pleasing?"** [S] [3rd-M]
  - "Graphics should be of high quality." "High resolution — quality games are visually pleasing." "Quality games have consistent resolution throughout the game." "Quality games are free of graphical defects like compression artifacts."
  - "Audio should be of high quality". "Audio levels are consistent." "Sounds aren't too loud or quiet." "Any music in the game complements the visual experience."
  - "In addition to having no technical graphical issues, the game is **internally consistent, coherent, and has attractive visuals**. The games aesthetic style should remain consistent and not switch between looks i.e. moving from realistic to cartoony, or high resolution to low resolution."
- **Honesty about the game.** "The game is clear about what it is. It isn't misleading and is clear about what genre and type of game it is overall. The name and imagery presented on CrazyGames should reflect accurately the type of game the player will experience." The name and imagery should change only "where totally necessary", for example after a significant update or visual overhaul. [3rd-M]
- **Restricted keys.** Key bindings should preferably adapt to the keyboard layout (AZERTY: "WASD keys for movement are ZQSD"). "Avoid common keys that have other behaviour on web": "Escape closes fullscreen"; "Ctrl / Cmd + W closes the tab" (you can disable this in fullscreen). [3rd-M] [S]
- **NOT CONFIRMED:** any sentence on this page about "differentiated experiences", genre saturation or "too close to existing titles". None was found in either copy or in any snippet. That wording seems to come from reviewer feedback (§15), not from the page.

## 4. requirements/gameplay

Official page: https://docs.crazygames.com/requirements/gameplay/. Full text: [3rd-M: M1]. Key lines: [S].

- **Intro.** "While we are not looking for the 'perfect' game, our goal is to help players discover your well-crafted game without encountering inappropriate or **subpar content**. Only games that prioritize quality and gameplay will be allowed on the platform. **Developers who repeatedly submit non-compliant games may face restrictions on future submissions.**" [S] (first half) [3rd-M] (all of it)
- "Our quality guidelines are inspired by the Facebook games." [3rd-M]
- **Basic Gameplay Requirements.** "Our team performs several visual and functional checks on each submitted game." [S] [3rd-M]
  - **Readable content.** "Text and images must be legible on devices with a **devicePixelRatio:1**, on responsive iframe sizes (**16x9 ratio**) and mobile screens (if applicable). These are the most important iframe sizes for our audience" [S] [3rd-M]:
    - Desktop, not fullscreen: **907×510, 1216×684, 1077×606, 821×462**
    - Desktop, fullscreen: **1366×768, 1920×1080, 1536×864, 1280×720**
    - Mobile: **800×450**. Tablet: **1080×607**.
    - The smallest cases, 821×462 and 800×450, bind the HUD design. [3rd: R2]
  - **Consistent physics.** "The game's physics must perform consistently across different monitor refresh rates (e.g. **144 Hz, 165 Hz**)." [S] [3rd-M]
  - **Language.** "The game must have **English localization**." Translations must be "accurate and of high quality". Pick the language from the SDK's system-info locale and fall back to English. [S] [3rd-M]
  - **Intuitive controls** on different types of devices (see the restricted keys in §3). [S] [3rd-M]
  - **Smooth performance.** "The game must load quickly and play seamlessly without errors or crashes." [S] [3rd-M]
  - **Originality.** "Game names, assets, and overall content should exhibit originality." [S] [3rd-M]
  - **Fullscreen.** "Fullscreen mode is automatically provided by CrazyGames. **Custom in-game fullscreen buttons are prohibited**, as they can interfere with other features (e.g. monetization)." [S] [3rd-M]
  - **No cross-promotion.** "The game should not include cross-promotions for external or internal games/platforms." [S] [3rd-M]
    - Always allowed: Privacy Policy and Terms links.
    - Allowed only if not "a main CTA on the menu":
      - community links (Discord, developer website) "on the game menu only as long they don't lead directly to a playable web version";
      - game store links (Epic, Steam) "on desktop games only on main menu or at the end of a demo game";
      - backlinks to the CrazyGames home or category page, "accepted but not promoted";
      - links to other games in the same series.
    - "**App Store links are never allowed in-game**". Use the game metadata fields in the Developer Portal instead.
  - **Suited for minors.** "CrazyGames is a website for an audience aged **13 or more**. Your game must be **PEGI 12 compliant**." There is a separate kids site, but "monetization is disabled on that domain". [S] [3rd-M]
- **Full Gameplay Requirements.** "Games should **land new users in gameplay immediately**. If this is not feasible given the game specifics, a **maximum of 1 click** is allowed." [3rd-M] [S] (the "land directly in gameplay" wording)
- **Mobile.** Declare the supported orientations in the submission. The site asks users to rotate their device, so "you don't need to implement any orientation lock logic." [S] [3rd-M]
- **CrazyGames App.** Games run fullscreen edge to edge, so keep important UI inside the safe area (CSS `env(safe-area-inset-*)`), for example when `applicationType` is `google_play_store` or `apple_store`. [S]
- **NOT CONFIRMED:** any seconds-to-gameplay limit for self-hosted games. Only the ≤ 20 s limit for externally hosted files exists (§5).

## 5. requirements/technical

Official page: https://docs.crazygames.com/requirements/technical/. Full text: [3rd-M: M1]. Numbers also in [S].

- **Why the limits are strict.** "A key factor of a web game's success is the time it takes for a user to start playing. This is why we enforce strict file size limits." [3rd-M]
- **Size and files.**
  - Total **≤ 250 MB**; file count **≤ 1500** ("high file counts will make loading slower"). [S] [3rd-M]
  - Initial download **≤ 50 MB**, and **≤ 20 MB** for mobile-homepage eligibility. [S] [3rd-M]
  - How initial download is measured: "between the start of loading and the occurrence of the **first Gameplay start event**". That event "should be triggered when the user enters in a playable state, so excludes menus and additional loading steps." [S] [3rd-M]
  - Without the SDK, the total file size is used instead (≤ 50 MB, or ≤ 20 MB for mobile). [S]
  - Externally hosted or loaded files: "our QA team will evaluate based on the time it takes to reach gameplay (**≤ 20 seconds**)." [S] [3rd-M]
  - "Use only **relative paths** when referring to other files in the game bundle. Never use absolute paths, as they will fail to load." [S] [3rd-M]
- **Devices and browsers** [S] [3rd-M]:
  - "We expect games to work on **Chrome and Edge**. Games that don't work well on Safari will be disabled on that browser."
  - "Games will be disabled on **Chromium OS** if they do not work smoothly on a **4GB RAM** device."
  - "Game supports mouse, keyboard, and touch if mobile is supported."
  - "Game should be playable in **landscape mode on desktop**." Portrait games are allowed, with black bars or background images at the sides.
  - Recommended: use the SDK's system info for device-specific behaviour.
- **Mobile.** Initial download ≤ 20 MB for the mobile homepage. Add `user-select: none` CSS to stop magnifier and select-all on tablets. Unity games are disabled on iOS by default. The platform manages Unity DPR (DPR 1 on iOS and low-memory Android). [3rd-M]
- **SDK, Basic Implementation.** "A Gameplay start event is triggered from the Game module when the player reaches game state." "Ads are not allowed in Basic Launch, and will be disabled even if you would integrate them." [3rd-M]
- **SDK, Full Implementation.** Gameplay start/stop events; the Data module if progress is saved; the User module if the game has accounts; load start/stop are optional. [3rd-M] [S]
- **Sitelock.** Optional. If you add one, whitelist every CrazyGames domain. [S] [3rd-M]
- **Submission form (live, read 2026-09-07)** [3rd: R1]:
  - The build is uploaded as a **folder** with `index.html` at its root.
  - The game name is **≤ 35 characters** and "Must be the same as the title that appears in your game" (also in [3rd-M: M1] form dump).
  - A first submission is locked to the **Basic** flow.
  - The steps are **Upload → QA → Details → Submit**. Covers, videos and texts go in Details.
- **NOT CONFIRMED** (R2 lists these as "not documented"): an FPS requirement, required file formats, a memory ceiling, HTTPS/CORS rules, a canvas size.

## 6. requirements/ads

Official page: https://docs.crazygames.com/requirements/ads/. Full text: [3rd-M: M1]. Key lines: [S].
The SDK pages warn: "your game will be **rejected without any feedback** if it doesn't follow them." [3rd-M: M1, video-ads and banners pages] [3rd: R2]

- **During Basic Launch** "Advertisements will be disabled; no revenue will be shared." If the ads SDK is integrated, QA checks that the game still runs with ads disabled, and "The game will be rejected if it does not. For example: Game doesn't freeze between levels. There should not be rewarded ad buttons without effect." [3rd-M] [S] (disabled/no revenue)
- **Only SDK ads.** "Only Ads requested through the CrazyGames SDK are allowed." [S] [3rd-M]
- **Ad types.** Midgame ("between levels or stages"), rewarded ("when giving a reward"; CrazyGames provides fallback banners), and in-game banners. [S] [3rd-M]
- **General rule.** Ads "should not appear before the user has experienced a reasonable amount of gameplay". Ads must not "Interrupt gameplay", "Trigger deceptively" or "Chain multiple ads". [S] [3rd-M]
- **Video ads** [S] [3rd-M]:
  - "Advertisements should not be shown while a user is playing." Show them at logical points (level transition, map change, death).
  - "Do not show a midgame ad on a **navigational button** (e.g. when clicking the main menu icon or opening the settings or opening the shop)."
  - Pause the game from the ad request until `adFinished` or `adError`: disable buttons or show a spinner.
  - Handle `adError` or unfilled ads so the game continues.
  - Mute in-game audio when the ad **starts** (not when it is requested) and unmute when it ends.
  - Frequency is handled automatically, "taking into account the start of the game, the midroll frequency (**max 1 every 3 minutes**) and interplay with rewarded ads". A request that comes too early "just gets ignored".
- **Rewarded ads** [S] [3rd-M]:
  - They "should be special opportunities that a user looks forward to, and not an expectation". "Poorly designed levels that can only be completed by a rewarded ad are not acceptable."
  - Don't offer them too often: show a timer or hide the button.
  - "Do not chain multiple ads". "Do not promote the rewarded ads too aggressively."
  - "The request button should not appear on an active gameplay screen."
  - The button sits in a consistent, accessible place and is not misleading: "the continue without watching ... should be the **same size, font, color**". "Hiding or delaying the skip or close button on the offer is not allowed." Make the ad obvious, for example with a video icon.
  - "Provide an alternative to watching an ad" (for example, buy the reward with coins).
  - On `adFinished`, make it clear the player was rewarded. On `adError`, "do NOT reward the player".
- **Banners** [S] [3rd-M]:
  - Only "on useful screens with content that are open for at least **5 seconds** on average".
  - They must not block game UI at any size, and "Do not show in-game banners during game-play". They must be clearly distinguishable from game content.
  - Limits: at least 30 s between refreshes; at most 120 refreshes per session per banner size.
  - Maximum 2 per screen. [3rd: R1, R2]
- **Adblock** (Full Implementation) [3rd-M]:
  - "It is never allowed to block players with AdBlockers from playing, or penalize players".
  - You may lock extra features, with a notice saying why.
  - Don't use popups. Don't leave rewarded buttons clickable when they have no effect.
- **SDK error codes.** `adsDisabledBasicLaunch`, `unfilled`, `adblock`, `adCooldown` ("usual midgame ad request interval is 3 minutes, taking rewarded and preroll ads into consideration"), `other`. [3rd-M]

## 7. requirements/account-integration

Official page: https://docs.crazygames.com/requirements/account-integration/. Full text: [3rd-M: M1].

- "Over **35 million** players have a CrazyGames account". The page describes the experience CrazyGames wants: "No standalone in-game username or avatar is needed", "No additional login flows in-game are needed", "Guests can also play the games". [3rd-M]
- **Basic Implementation.** "No external login options." "Logging out in the game and allowing login with external login options (e.g. Facebook, Google, email) is not allowed." [S] [3rd-M]
- **Progress save** (Full Implementation). "Unless progress is not applicable for your game, we require you to implement one of these methods." [3rd-M]
  - Preferred: the Data module. Guest progress is saved locally and synced to the account on login "as long as no cloud progress was present". [S] [3rd-M]
  - Or your own backend linked through the User module.
  - Or **Automatic Progress Save (APS)**, which is "not allowed for games with in-game purchases". The live form says APS doesn't work for iframe games. [3rd-M] [3rd: R1]
- **In-game accounts** [3rd-M]:
  - Use `getUserToken()` (a JWT) and the userId.
  - "always allow the user to start playing as Guest".
  - A "Login with CrazyGames" button is allowed but "not as a main CTA". A good place is the top right.
  - "Don't trigger the Auth prompt automatically".
  - Guests may only use "Login with CrazyGames".
- **Submit form question.** "Does your game save progress?" The answers are: no; the Data Module; your own backend linked to the CrazyGames user; LocalStorage (APS). [3rd-M: M1 form dump]

## 8. requirements/multiplayer

Official page: https://docs.crazygames.com/requirements/multiplayer/. Full text: [3rd-M: M1]. Key lines: [S].

- "Games that offer an online multiplayer experience have **2x higher long term retention** than single player games. We are strongly supporting multiplayer games on CrazyGames." [3rd-M]. This is one of the few explicit statements of what CrazyGames wants more of.
- **Full Implementation**, required for the Multiplayer landing page [S] [3rd-M]:
  - An invite button or invite link.
  - **Instant Multiplayer**: "The first player in a party should be placed directly into a new private room with default settings". When `isInstantMultiplayer` is true, launch straight into multiplayer. "An intermediate configuration screen (e.g., game mode, player count) is acceptable." "For games that support **20+ players**, you may instead place the player directly into public gameplay." The player must be joinable immediately.
  - Submit lobby sizes with the build.
  - Show CrazyGames usernames in-game.
  - Round-based games keep the group together between rounds.
- **Chat and UGC.** Honour the `disableChat` setting ("In case of complaints, we will require you to disable chat alltogether"). A profanity filter is required at minimum; Lasso moderation is recommended. UGC also needs moderation. [3rd-M] [S]
- **Basic Launch.** Multiplayer games that need a big audience may skip Basic Launch; games with a single-player part may not. QA decides which flow applies. [3rd-M]

## 9. requirements/game-covers (covers and preview video)

Official page: https://docs.crazygames.com/requirements/game-covers/. Full text: [3rd-M: M1]. Key lines: [S].

- **Mandatory.** 3 covers: **Landscape 16:9, 1920×1080**; **Portrait 2:3, 800×1200**; **Square 1:1, 800×800**. They must share "consistent visuals and aesthetics". [S] [3rd-M]
- **Restrictions**, most likely what gets a cover sent back [S] [3rd-M]:
  - "Don't put **borders** around your game covers."
  - "Don't write anything else other than your **game's title** (e.g. don't write New, Updated, Play or Play now,...)."
  - "Don't put **icons or store logos** in the visuals."
  - "Don't use **copyrighted visuals** that you don't have the right to use."
  - "Don't use **blurry or pixelated** visuals."
- **Guidelines** [S] [3rd-M]:
  - "**Don't just take a screenshot of the game** ... try to be more creative". Use the main character, a big stylized title, or art "that refers to the game without even being taken from the game itself".
  - "Keep it simple": "Over-cluttered covers are hard to scan, especially on small screens."
  - "Put the name of your game directly on the cover". It "makes it distinct from other games that share a similar style."
  - "Use a nice and stylized font".
  - Update covers occasionally, because "there is often a spike in sessions when covers for older games are updated". Don't update too often.
- **Preview video** [S] [3rd-M]:
  - 15–20 s (longer videos are cut to 20 s); ≤ 50 MB.
  - Landscape 1080p 16:9 is mandatory. Portrait 1080p 2:3 is listed as **mandatory** in the live snippet [S] and **optional** in the older M1.
  - Avoid: an opening transition or black-screen logo, black bars, the default mouse cursor, "Play Now" or promotional text, app or social icons, fast-forwarding, and sound.
  - Use the static cover as the opening frame.
  - "You can use animated video as long as it represents the gameplay and is not misleading."
- **NOT CONFIRMED:** any policy on AI-generated covers or assets. Nothing was found in the CrazyGames docs; Poki has one, see §14.

## 10. SDK game module (`/sdk/game/`)

Official page: https://docs.crazygames.com/sdk/game/. Full text: [3rd-M: M1]. Also [S] and [3rd: R1].

- **`gameplayStart()`** is called "whenever the player starts playing or resumes playing after a break (game start, resume, revive, enter next level, ...). **The first event is used to determine your game's initial loading size.**" [S] [3rd-M]
- **`gameplayStop()`** is called "on every game break (entering a menu, ending level, pausing the game, ...)". "Don't call this event when the user switches focus or leaves the game area (we handle this on our side)." [S] [3rd-M]
- **`loadingStart()` / `loadingStop()`** (named `sdkGameLoadingStart/Stop` in v2) are optional. They measure loading times and fail rates. [S] [3rd-M]
- **`happytime()`**: call it "on various player achievements (beating a boss, reaching a highscore, etc.)". "There is **no need to call this when a level is completed**, or an item is obtained." "Use this feature sparingly, the celebration should remain a special moment." [S] [3rd-M]
- **`settings`**: `disableChat` and `muteAudio`, plus `addSettingsChangeListener` and `removeSettingsChangeListener`. `muteAudio` "should take priority over in-game audio settings". The submit form asks "The game supports CrazyGames muting audio through SDK". [S] [3rd-M]
- **Multiplayer**: `isInstantMultiplayer`, `inviteLink`, `getInviteParam`, `inviteParams`, `addJoinRoomListener`, and `updateRoom`/`leftRoom` (show/hideInviteButton are deprecated per R1). [3rd-M] [3rd: R1]
- **Others**: `setGameContext` / `clearGameContext` attach data to player feedback reports; `reportGameCompletedPercentage(n)` also exists. [3rd: R1]
- **Environments**: `local`, `crazygames`, and `disabled`. On any other domain "All the calls to the SDK methods will throw an error". The SDK must be awaited with `init()` and loaded from the CDN (`https://sdk.crazygames.com/crazygames-sdk-v3.js`). [3rd-M] [3rd: R1]

## 11. Submission form and publishing flow

- **Form** [3rd-M: M1 (form dump)] [3rd: R1 (live, 2026-09-07)]:
  - Game name, ≤ 35 characters, the same as in the game.
  - Engine (HTML5 etc.).
  - Upload with `index.html`.
  - "Does your game save progress?"
  - Options: mobile support, online multiplayer, in-game purchases, "supports CrazyGames muting audio through SDK".
  - Details step: description, controls, covers, videos. [S]
  - A first submission is Basic only.
- **Flow.** The FAQ describes three steps [S]:
  - "**Step A: Initial Quality Assurance (QA) check**". "Every game goes through an initial review by our QA team, where we spend time **playing each submission** to check that it works smoothly, meets our quality standards, and **is fun to play**."
  - Step B: Basic Launch.
  - Step C: Full Launch.
- **Feedback on rejection.** "Upon review, we make sure to share constructive feedback to help developers reach the needed standards." [S]
  - Many developers report that no reason was given [F]: Magare.yo devlog, Dmitrii Rigin on LinkedIn, Trustpilot reviews.
  - Ad-rule failures are "rejected without any feedback". [3rd-M]
- **Resubmitting.** "You're welcome to resubmit your game, but before doing so, please make sure you've made **meaningful improvements** and that the game meets the requirements." [S]
  - After a failed Basic Launch, you must submit "as a new game including significant improvements". [S] [3rd-M]
  - Repeated non-compliant submissions "may face restrictions on future submissions". [3rd-M]
- **Review timing**:
  - The official docs give no SLA for a first review. **NOT CONFIRMED** officially. [3rd: R1, R2 "docs silent"]
  - Third parties: "feedback usually landing in 1 to 2 days" (cinevva snippet) [F/3rd-snippet]; one rejection "in about two hours" (Rigin) [F]; pley estimates "0-3 days, plus CrazyGames' QA wait" [F/3rd-snippet].
  - Updates: "usually processed within the **same working day**". Basic Launch updates go live instantly. "updates that violate the Terms and Conditions will result in the games being terminated immediately." [S]

## 12. FAQ: why games are rejected, what earns money, exclusivity

Official page: https://docs.crazygames.com/faq/. Seen only in snippets [S]; R1 and R2 confirm the list.

- **The QA rejection list, verbatim.** Games "might not make it through this stage" for [S] [3rd: R1, R2]:
  1. "Bugs or broken mechanics"
  2. "Missing English-language support"
  3. "**Unoriginal content (e.g. clones or asset flips)**"
  4. "Inappropriate themes or content"
  5. "Not meeting our Developer Requirements, Terms & Conditions, or ethical standards"
  6. "Does not adhere to PEGI-12 guidelines"
  7. "**Content is targeted for kids**"
- **Who CrazyGames wants.** "We welcome a wide variety of games ... something for every player and a place where every developer can find their audience. However, submissions must meet the standards our players expect". Genre preference varies by age: "teenagers often prefer competitive .io games, while older players gravitate toward puzzle games". [S]
- **To earn money**, the game must [S]:
  - "not include **branding from another game portal**";
  - "integrate the CrazyGames SDK";
  - "not contain external advertisements";
  - "**Be original and clearly distinguishable from existing games**". This is the closest official wording to Petri Panic's rejection.
- **Earnings.** "Earnings vary". Payout is monthly once unpaid earnings reach **€100**, by wire or PayPal (Tipalti). [S] [3rd: R1]
- **Exclusivity.** None required. You can publish on CrazyGames if the game "is already live or has been previously published on mobile, Steam, or other platforms, as long as you hold the distribution rights"; this "doesn't affect your eligibility for revenue share". [S]
- **Revenue share: NOT CONFIRMED in the docs** (R1 and R2: "docs silent").
  - The CrazyGames × GameMaker Web Jam 2026 terms (a third-party snippet via cinevva) give developers 60% of ad revenue and 70% of in-game purchase revenue after costs are recouped. [F/3rd-snippet]
  - The old Developer Terms PDFs (2019/2021, files.crazygames.com, blocked) had a "Time-based exclusivity option": **+50% compensation** for 2 months of exclusivity. The 2021 terms set direct costs at 20% of ad revenue. [F/3rd-snippet]. Whether this still applies is **NOT CONFIRMED**.
- **AI.** The FAQ acknowledges AI tools for art, sound and music but states no policy. **NOT CONFIRMED.** [S]

## 13. What CrazyGames says it wants now, and saturated genres

- **Official wording that exists:**
  - "fun, unique, visually appealing" (§1)
  - "Be original and clearly distinguishable from existing games" (§12)
  - "Game names, assets, and overall content should exhibit originality" (§4)
  - "Various player segments can enjoy the game"; "no overly repetitive or 'boring' tasks" (§3)
  - Multiplayer is "strongly supported" because of 2× retention (§8)
  - Puzzle leads earnings; clicker and incremental "perform really well" (§2)
- **"we're currently prioritizing more differentiated experiences"**: not found in any official page or snippet. It is **reviewer wording**, and a search for the exact phrase found nothing indexed. Trustpilot reviews quote similar rejections [F]:
  - "considered too similar to existing titles";
  - "Not unique enough" (rejected four times) for an incremental game with "multiple prestige layers ... Not a clone, not a reskin";
  - "Doesn't feel unique";
  - "Not unique enough" for a game that had made $880k on Steam.
  - The same reviews complain of inconsistency: reskins such as "Emoji Clickers" are live.
- **Survivors-likes are crowded on CrazyGames** (site: search snippets of crazygames.com [S-site]):
  - Titles found: World Survivors, King Survivors, Vampire Pixel Survivors, Shadow Survivors ("A Vampire Survivors-style action roguelike: your hero auto-attacks, dodge endless hordes, evolve your weapons"), Grimdark Survivors, Meme Survivors: Backrooms, Tower Core Survivors, Nightfall Survivors, Mirage Survivors, Idle Zombie Wave: Survivors, Brave Survivor (Sep 2025), War V: Survivor (Jun 2025), Drone.io – AI Survivor (May 2025), Path of Survivor (Jan 2026), Survivor: Space Battle, Swarm Survivor, Tiny Survivors, Crowd Survivor, Space Survivor.
  - **Most important for Petri Panic: "Cell Survivor"** (https://www.crazygames.com/game/cell-survivor), **released June 2026**. "a fast-paced survivor roguelite where you control an **evolving cell** fighting against endless hostile organisms in a dangerous microscopic universe ... abilities, relics, synergies, overdrives, and auras ... waves of enemies and bosses ... collect coins to unlock **permanent upgrades**". HTML5, desktop only, rated 8.9. [S-site]
  - Petri Panic has the same genre, the same theme (a cell against germs), the same auto-attack, level-up and meta-upgrade structure, and would have launched a few months later. That is almost certainly the "existing title" behind the rejection. The cell theme is also taken by Agar.io, Germs.io, Germ War, Merge LAB and "Bacteria" (Yso Corp).
- **Other crowded genres** (from Poki's "oversaturated genres" wording and the repo's own research): block and sort puzzles, match-3, and "X Survivors". Hypercasual is the weakest by play time (8.6 min).
- **Market stories, not verified**: "CrazyGames rejects almost 99% of submissions" and "90% of games get rejected" are YouTube video titles and claims [F], **NOT CONFIRMED**.

## 14. Poki for comparison (snippets only; sdk.poki.com and developers.poki.com were blocked)

- Poki "values originality and uniqueness in games that offer fresh gameplay ideas or put a creative twist on familiar mechanics", with "clear differentiation especially in **oversaturated genres**". "A one-to-one clone ... will not be accepted", but games "inspired by other games" are welcome "as long as they contribute something new". "templates and asset flips with little modification don't qualify as original work." [S-Poki] https://sdk.poki.com/poki-quality-guidelines
- **Final Poki Review.** The team checks whether the game "is **unique enough among the category/categories** your game falls into". It takes 1–2 weeks, after a Web Fit Test with ~10,000 players. "Even if a game performs well but violates quality guidelines, Poki may decide against moving forward". [S-Poki] https://sdk.poki.com/final-review.html
- **AI.** "Games that rely too heavily on AI-generated content or templates without adding distinct personality, polish, or innovation may not meet our standards"; "The more non-original material your game uses, the higher the risk". No AI watermarks or prompt text, and all generated content must be tested. [S-Poki] https://sdk.poki.com/working-with-ai.html
- **Takeaway.** Poki states outright the "unique within its category" test that CrazyGames applies without writing it down. Assume CrazyGames' QA compares a submission against what is already live in the same category.

## 15. Anecdotes: rejections and what fixed them [F]

- **Dmitrii Rigin (LinkedIn)** had three games rejected, one of them "about two hours" after submission. A 2D horror game was resubmitted about 5 times with no explanation. An idle, farm and clicker hybrid submitted as a demo got: "**This game needs content and polishing. At the moment it looks like a prototype.**" https://www.linkedin.com/pulse/my-game-got-rejected-just-2-hours-dmitrii-rigin
- **Cyber Gomoku** passed on the third try. Submission 1 had an external link to the developer's site; they removed it and split the web and portal builds with flags. Submission 2 gave vague feedback; they compared with successful games on the portal and found those "introduce their controls and objective immediately", while theirs had a long explanation before the first move. They shortened it and reached Basic Launch. https://cybergomoku.com/en/articles/crazygames-third-review
- **Magare.yo** was rejected with no reason given. "All assets except for sound effects are AI-generated." https://ugonomamenoko.itch.io/magareyo/devlog/1504087/the-mystery-of-the-crazygames-rejection
- **Trustpilot developer reviews**: "too similar to existing titles", "Not unique enough" (×4), "Doesn't feel unique", "Not unique enough" for a Steam game with $880k in sales. https://www.trustpilot.com/review/crazygames.com
- **Food Knockout (Bump Dev)** reached Basic Launch: a Godot pixel-art survival game, mobile supported, posted 2026-03-27. https://bump-dev.itch.io/food-knockout/devlog/1470465/crazygames-basic-launch
- **Our own case, Petri Panic**: "The concept is quite close to existing titles, and we're currently prioritizing more differentiated experiences." SDK, ads and QA were fine. This fits §13: Cell Survivor, June 2026.

---

## Rejection reasons, ranked

The ranking weighs how often a reason shows up in official lists and in reports, and how hard it is to fix after the fact.

1. **The concept is not differentiated**: "close to existing titles", "not unique enough", clone, reskin, asset flip. It is FAQ criterion #3; the monetization rule says "clearly distinguishable from existing games"; it is the most reported reason [F]; and it was our case. QA compares against live games in the same genre *and* theme. A crowded genre with a new theme is not enough when the theme is taken too (Cell Survivor).
2. **Looks like a prototype**: thin content, no polish, visuals that don't hang together, placeholder or unmatched assets, AI look. Sources: "needs content and polishing ... looks like a prototype" [F]; the quality page's "internally consistent, coherent, and has attractive visuals" [3rd-M]; "subpar content" [3rd-M].
3. **Not fun, or repetitive**: QA plays every game "to check that it ... is fun to play" [S]; "no overly repetitive or 'boring' tasks" [3rd-M].
4. **Bugs, crashes, slow loading, performance**: FAQ #1, "must load quickly and play seamlessly" [S]. Also physics that change at 144/165 Hz, Chromebook with 4 GB RAM.
5. **Ad rule violations**: rejected "without any feedback" [3rd-M]. Examples: ads during play, ads on navigation buttons, a rewarded button that does nothing or freezes during Basic Launch, deceptive buttons, ad chaining.
6. **Slow first-time experience**: more than 1 click to gameplay (Full), long tutorials or text walls before the first action [F: Cyber Gomoku], a slow first `gameplayStart`.
7. **Cross-promotion or external links**: developer site as a CTA, app-store links, another portal's branding [S] [F].
8. **Legibility**: text unreadable at 821×462 or 800×450 at DPR 1 [S].
9. **Content**: not PEGI-12, inappropriate themes, or "targeted for kids" [S].
10. **Missing English, or poor translations** [S].
11. **Custom fullscreen button**; restricted keys (Esc, Ctrl+W) used for gameplay [S].
12. **Naming and identity**: a generic name ("Chess"), a name or icon confusable with another game, someone else's IP, cover rule violations (borders, "Play now", logos, blurry art, copyrighted visuals) [S].
13. **After QA** (not a rejection, but the game stops): Basic Launch metrics below benchmark (play time, 1-minute conversion, D1 retention) [S].

## What a game must do to pass the quality review (actionable checklist)

**A. Differentiation, checked before building anything.** This is what failed Petri Panic.
- [ ] Search `crazygames.com` (site search and `site:crazygames.com <genre> <theme>` in a search engine) for the genre **and** the theme. **If a live game shares both** (as Cell Survivor does with "survivors-like + cell"), change at least one of them fundamentally.
- [ ] Write the pitch as "It's <genre>, but <core-verb twist>". The twist must change **the core input or goal**, not just the skin or theme. For survivors-likes: aim instead of move, one-button, physics or ricochet, placement or tower instead of avatar, co-op, a puzzle constraint. Swapping sprites, enemy names or the "cell/germ" setting does not count.
- [ ] The first 30 seconds of play, and the 15–20 s preview video, must *show* the difference. QA plays briefly; players judge the cover and hover video.
- [ ] Unique name (≤ 35 characters, the same in the game and in the form): not generic ("Chess"), no "X Survivors / X.io" pattern next to 20 others, no third-party IP, not confusable with an existing title or icon.
- [ ] Prefer what CrazyGames explicitly says works: puzzle (21 min average, top earner), incremental and clicker (15 min), action with meta progression (13 min, best D1 8.1%), and multiplayer ("strongly supporting", 2× retention). Avoid plain hypercasual (8.6 min).
- [ ] Keep a local "taken concepts" list per genre (from the searches above). The platform should warn when a new game's genre + theme matches a live title.

**B. Content and polish: must not look like a prototype.**
- [ ] One consistent art style and resolution throughout. No mixed asset packs, no compression artifacts, no visible AI artefacts, watermarks or prompt text.
- [ ] Audio at consistent levels, music that fits, and `muteAudio` honoured with priority over in-game settings.
- [ ] Enough content for a 10+ minute first session: several enemy or level types, a boss or climax, meta progression that changes play. No demo-only builds.
- [ ] Juice: instant response to input, hit feedback, clear goals on screen. No long repetitive stretches.
- [ ] The UI is clearly labelled. No buttons sized or delayed to push the player toward ads.

**C. First-time experience.**
- [ ] The player lands in gameplay immediately, or after at most 1 click. Onboarding happens *in gameplay*, is visual, is skippable, covers the core verb only, and shows a controls overlay (keyboard or mouse).
- [ ] The first `gameplayStart` fires as early as possible. Load tutorial assets first and stream the rest. The target is under 10 s to play and a build under 20 MB.
- [ ] No midgame ad before about 3–5 minutes of play or the end of the tutorial.

**D. Technical and legibility.**
- [ ] Readable at 821×462, 907×510, 800×450 and 1080×607 at DPR 1. The HUD fits the smallest size.
- [ ] Fixed-timestep simulation, so play is identical at 60, 144 and 165 Hz.
- [ ] Works on Chrome and Edge, smooth on a 4 GB Chromebook, and supports mouse, keyboard and touch if mobile is declared. Playable in landscape on desktop. Safe-area padding in the app.
- [ ] Relative paths only; ≤ 1500 files; ≤ 250 MB total; ≤ 50 MB initial (≤ 20 MB for mobile).
- [ ] No custom fullscreen button. Esc and Ctrl+W are not used for gameplay. ZQSD (AZERTY) works as well as WASD.
- [ ] No console errors, no crashes, and the game works with an adblocker.

**E. Ads (the silent-rejection zone).**
- [ ] SDK ads only. Midgame ads only at transitions (death, level end), never on menu, settings or shop buttons. The game pauses while an ad request is pending. Audio mutes on `adStarted`.
- [ ] Rewarded ads: opt-in, a video icon, a skip option of the same size, font and colour, never on an active gameplay screen, a non-ad alternative, no reward on `adError`, never required to progress.
- [ ] Basic Launch build: no rewarded buttons that do nothing, and no freeze when the ad call returns `adsDisabledBasicLaunch`.
- [ ] Banners only on screens open ≥ 5 s, never during play, max 2 per screen, not covering UI.

**F. Content rules and the listing.**
- [ ] PEGI-12 compliant and not aimed at kids. English is present. Translations, if any, are good and follow `systemInfo.locale`.
- [ ] No cross-promotion: no app-store links, no other-portal branding, community links only on the menu and not as the main CTA.
- [ ] Three covers (1920×1080, 800×1200, 800×800): the same style, title only, no border, no "Play/New" text, no logos or icons, not blurry, not a plain screenshot, uncluttered, stylized title font.
- [ ] Preview video: 15–20 s, ≤ 50 MB, landscape 16:9 and portrait 2:3 at 1080p, the static cover as the first frame, no sound, no cursor, no black bars or logo intro, no promotional text.
- [ ] The description and controls text say honestly what the game is (genre, the twist), matching the cover.

**G. Process.**
- [ ] Test in the Developer Portal Preview tool (`crazygames.com/preview`) before submitting.
- [ ] If rejected, resubmit only after **meaningful** changes (for a concept rejection: a different core mechanic or theme, not a polish pass), and say what changed. Repeated non-compliant submissions can restrict the account.
- [ ] During Basic Launch (7–21 days, ≥ 500 plays), watch 1-minute conversion (target 80%+), average play time (10+ min) and D1 (10–15%).

## Gaps for this repository

- `docs/guides/publishing-crazygames.md` has **no** section on originality, the QA rejection list, the 1-click rule, legibility sizes, cover restrictions or Basic Launch benchmarks.
- `docs/guides/game-ideas.md:11` still presents Petri Panic as the survivors-like reference. It should record the rejection and the Cell Survivor overlap.
- A "concept collision" step belongs in the loop (AGENTS.md step 1) before building any game for CrazyGames.
