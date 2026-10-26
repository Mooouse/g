# Upgrade math and shop UX (research, 2026-09-30)

> Research for [upgrades.md](../guides/upgrades.md). The build proxy blocked the primary articles (gamedeveloper.com,
> kongregate.com, gdcvault.com, archive.org, medium, MDN); GitHub READMEs were read in full. **[S]** = seen only in a
> search snippet, **[U]** = unverified or secondary. Pacing numbers without a source are marked as heuristics.

## Math

### Pecorella, "The Math of Idle Games" (Kongregate, 2016–17)
- **Part I** (2016-10-13, from the GDC Europe 2016 talk "Quest for Progress") ([GameDev](https://www.gamedeveloper.com/design/the-math-of-idle-games-part-i), [Kongregate](https://www.kongregate.com/en/pages/the-math-of-idle-games-part-i), [GDC Vault](https://www.gdcvault.com/play/1023876/Quest-for-Progress-The-Math)) [S]:
  - costs grow exponentially, production linearly or polynomially — production wins early, costs win later;
  - `cost_next = base × rate^owned`; AdCap Lemonade Stand base 4, rate 1.07; typical rates **1.07–1.15** (1.15 is Cookie Clicker's);
  - `production = (base × owned) × multipliers`;
  - bulk: `cost(n) = b·r^k·(r^n − 1)/(r − 1)`, max affordable `floor(log(c(r−1)/(b·r^k) + 1) / log r)`;
  - multipliers at ownership milestones (AdCap: ×2 at 25 and 50 owned) "temporarily get production closer to, or ahead of, costs"; bursts of purchases at thresholds make the curve "bumpy".
- **Part II:** tiers that produce the tier below — output 1, x, x²/2, …, xⁿ/n!; sub-exponential with finite tiers ([GameDev](https://www.gamedeveloper.com/game-platforms/the-math-of-idle-games-part-ii)) [S].
- **Part III:** prestige with a fractional exponent — square root (Realm Grinder: 4× earnings to double) or cube root (Cookie Clicker: 8×) ([GameDev](https://www.gamedeveloper.com/design/the-math-of-idle-games-part-iii)) [S].
- Worksheets: [archive.org/details/idlegameworksheets](https://archive.org/details/idlegameworksheets) [S]. GDC 2015, "Idle Games: The Mechanics and Monetization of Self-Playing Games" ([Vault](https://www.gdcvault.com/play/1022065/Idle-Games-The-Mechanics-and)) [S].

### Formulas from shipped games
| Game | Formula | Source |
|---|---|---|
| Cookie Clicker buildings | `base × 1.15^(owned − free)`; selling refunds 25% | [wiki](https://cookieclicker.fandom.com/wiki/Building) [S] |
| Cookie Clicker prestige | `floor(cbrt(all_time / 1e12))`, +1% each | [wiki](https://cookieclicker.wiki.gg/wiki/Ascension) [S] |
| AdCap generators | Lemonade 4 / 1.07, Newspaper 60 / 1.15, Car Wash 720 / 1.14, Pizza 8,640 / 1.13, Donut 103,680 / 1.12 | [IdleFramework](https://github.com/ac2522/IdleFramework/blob/main/IDLE_GAME_MECHANICS_RESEARCH.md) [U] |
| AdCap angels | `150 × sqrt(lifetime / 1e15)`, +2% each | [wiki](https://adventure-capitalist.fandom.com/wiki/Angel_Investors) [S] |
| Vampire Survivors PowerUps | `InitialPrice × (1 + Bought) + floor(20 × 1.1^TotalBought)` — a global fee growing with every purchase | [wiki](https://vampire-survivors.fandom.com/wiki/PowerUps) [S] |
| Idle Idol | cost and reward bases both ×1.1, reward slower; "even a 0.01 difference" is huge by the 20th upgrade | [GameDev](https://www.gamedeveloper.com/design/balancing-tips-how-we-managed-math-on-idle-idol) [S] |
| Kingdom Rush | 1–4 stars per upgrade; free reset with full refund | [wiki](https://kingdomrushtd.fandom.com/wiki/Upgrades) [S] |

### Value, payback, balancing
- Cookie Monster payback period `PP = max(cost − bank, 0)/income + cost/Δincome`; compares ×1 and ×10; shows time left ([README](https://github.com/CookieMonsterTeam/CookieMonster/blob/master/README.md), read).
- Schreiber & Romero, *Game Balance* (CRC, 2021): cost curves and progression ([Routledge](https://www.routledge.com/Game-Balance/Schreiber-Romero/p/book/9781498799577)) [S].
- No authoritative source for target seconds between purchases or for how many upgrades to show at once — heuristics only.

### Big numbers
- Doubles overflow above ≈ 1.797e308; integers are exact only up to 2^53 − 1.
- break_infinity.js reaches ≈ 1e(9e15), 2.5–2.9× faster than decimal.js on arithmetic, 121–442× on log/pow; cut Antimatter Dimensions' script time 4.5× ([GitHub](https://github.com/Patashu/break_infinity.js), read).
- Float closed forms can make "buy max" cost more than the player owns ([itch](https://itch.io/post/6654560)) [S].
- Formatting: swarm-numberformat — suffixes to 1e249, then scientific ([GitHub](https://github.com/erosson/swarm-numberformat), read); Antimatter Dimensions offers 24 notations ([wiki](https://antimatter-dimensions.fandom.com/wiki/Notations)) [S].

## UI/UX

### From games
- **Bulk:** AdCap ×1 → ×10 → ×100 → Next (milestone) → Max ([wiki](https://adventure-capitalist.fandom.com/wiki/Buy_Multiplier)) [S]; players asked for "buy to next unlock" ([Steam](https://steamcommunity.com/app/346900/discussions/0/523898291505167924/)) [S]. Cookie Clicker Ctrl ×10 / Shift ×100; a popular add-on refuses partial bulk buys ([wiki](https://cookieclicker.fandom.com/wiki/Add-Ons)) [S].
- **Best value:** Cookie Monster colour tiers — colour only, no colour-blind option (README, read).
- **Hold to repeat:** Egg Inc's "Hold to Research" ([wiki](https://egg-inc.fandom.com/wiki/Research)) [S].
- **Respec:** Kingdom Rush and Vampire Survivors refund in full ([VS wiki](https://vampire-survivors.fandom.com/wiki/PowerUps)) [S].
- **Tiers:** Egg Inc unlocks tiers after enough earlier purchases [S]. **In-run shop:** Brotato — free lock, paid reroll, bonuses green, drawbacks red ([wiki](https://brotato.wiki.spellsandguns.com/Shop)) [S].

### Anti-patterns
1. Prices that depend on purchase order — Vampire Survivors: cheapest-first can cost > 2× (200k+ gold) ([Steam](https://steamcommunity.com/app/1794680/discussions/0/3194745954519667869/)) [S].
2. Hidden modifier-key bulk buys — Learn to Fly 3: a stuck Shift spent all the money ([Steam](https://steamcommunity.com/app/589870/discussions/0/1692659135906102132/)) [S].
3. A premium purchase next to routine buttons — Egg Inc misclicks ([wiki](https://egg-inc.fandom.com/wiki/Glitches)) [S][U].
4. Missing buy-max, unclear effects, too many tabs — itch comments ([example](https://itch.io/post/8825673)) [S, anecdotal].
5. Colour-only state — fails WCAG 1.4.1 ([W3C](https://www.w3.org/WAI/WCAG21/Understanding/use-of-color.html)) [S].
6. Confirmation fatigue — NN/g: confirm only serious irreversible actions, prefer undo ([NN/g](https://www.nngroup.com/articles/confirmation-dialog/)) [S].

### Standards and psychology
- Touch targets: WCAG 2.2 SC 2.5.8 ≥ 24×24 CSS px (AA), 2.5.5 ≥ 44×44 (AAA) ([W3C](https://www.w3.org/TR/WCAG22/)) [S]; Apple 44 pt, Material 48 dp [S].
- **Goal-gradient effect:** Kivetz, Urminsky & Zheng, *JMR* 43(1):39–58 (2006) — purchases came faster near the reward (≈ 20% shorter gaps); a 12-stamp card with 2 pre-filled finished faster than a plain 10-stamp card ([SAGE](https://journals.sagepub.com/doi/abs/10.1509/jmkr.43.1.39)) [S].
- **Endowed progress effect:** Nunes & Drèze, *JCR* 32(4):504–512 (2006) — 10-stamp card with 2 pre-filled: 34% completion vs 19% for a plain 8-stamp card ([OUP](https://academic.oup.com/jcr/article-abstract/32/4/504/1787425)) [S].
- **Juice:** Jonasson & Purho, "Juice It or Lose It" (2012) ([GDC Vault](https://www.gdcvault.com/play/1016487/juice-it-or-lose)) [S].
