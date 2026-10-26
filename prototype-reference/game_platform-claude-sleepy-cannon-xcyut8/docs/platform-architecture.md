# Game Platform для AI-агентов — архитектура v0

Версия 0.2 · 2026-09-29 · проектный документ и статус реализации

**Решение:** строим **верхнеуровневую платформу** — набор готовых конструкций, правил (специфики), документации и инструментов, в рамках которых AI-агент (и человек) быстро и качественно собирает игры. Платформа не привязана к жанру или аудитории: детские игры — первый набор конструкций (`kids-kit`), а не граница платформы. Balloon Pop (`QmaCyber/game`) выпускается отдельно, когда появится возможность публикации, и служит эталоном: платформа считается рабочей, когда воспроизводит Balloon Pop без потери качества.

Бизнес-контекст и выбор рынков — в [opportunity-map.md](opportunity-map.md). Здесь только «как устроено».

> **Статус.** Готовы M0a и M0b (M0b: AAB и тест на эмуляторе в CI, `.github/workflows/android.yml`; нестабильность эмулятора — [D34](team/decisions.md)), а также набор для 13+ и канал CrazyGames (`kit-casual`, `tap-score`, `neon-pop`, `core/portal.ts`) — см. [team/decisions.md](team/decisions.md) §4–4.2.
> После первой игры другого агента (Petri Panic, [разбор](team/retro-petri-panic.md)) добавлены: `kit-code` — игра своим кодом на `core/host.ts` (`GameHost`),
> rewarded-реклама, QA production-сборки с подменённым SDK портала, проверки загрузки (один index.html), `gp video` и `gp submission`; бандл кита фиксируется при сборке (`import.meta.env.GP_KIT`), а web-канал собирается без Capacitor и AdMob (`import.meta.env.GP_PLATFORM`, заглушка `player/src/web-native.ts`).
> После Engine Lab ([D67](team/decisions.md)): свои npm-зависимости игры (`games/<id>/package.json`, кэш Vite в папке игры, WASM-пакеты вне pre-bundle — `cli/src/deps.ts`) и бюджет размера и времени загрузки портальной сборки (`spec/src/budget.ts`, `upload/size.json`, его читает `gp forecast`).
> Адаптеры движков ([D69](team/decisions.md)): `core/src/engines/` — общий драйвер (пуск/стоп по игре и паузам хоста, фиксированный шаг, размер и DPR, звук через хост, потеря WebGL-контекста) и адаптеры `canvas`, `pixi`, `phaser`, `three`; движок не импортируется — игра передаёт его модуль, движок остаётся её зависимостью. `engine: { name, version }` в game.yaml — `spec/src/engines.ts` (поддерживаемые версии) и `cli/src/game.ts` (`engineChecks`: package.json и node_modules); `gp init --engine` — `templates/game-repo/engines/`.
> Блок физики ([D74](team/decisions.md)): `packages/physics` (`@gp/physics`) — мир Rapier 2D на фиксированном шаге игры (шаг адаптера, свой сим или `advance` с капом), стоит при любой паузе хоста, освобождает WASM-память при каждом `reset()`, детерминирован; Rapier — зависимость игры (`-compat`), не платформы. `engine.physics` в game.yaml — `spec/src/engines.ts` (`PHYSICS`) и `cli/src/game.ts` (`physicsChecks`); `gp init --physics` — `templates/game-repo/physics/`.
> Модуль отрисовки ([D75](team/decisions.md)): `packages/art` (`@gp/art`) — Canvas 2D для `kit: code`: палитры с ролями и OKLCH-оттенки, материалы с объёмом от одного света, карта света с тенями от окклюдеров, Path2D-формы и части персонажей, запечённые спрайты и листы с LRU-кэшем, риги и процедурная анимация, пул эффектов, камера, параллакс-фоны, стеклянный HUD, `AutoQuality`; плотность пикселей и easing — из `@gp/core/draw`, перезапекание при смене плотности и потере 2D-контекста. Витрина `docs/examples/art`, шаблон `gp init` рисует через него (`art.ts`), `gp qa` подсказывает про плоский кадр (`qa/src/flat.ts`), `gp review` проверяет вид. Гайд — [guides/art.md](guides/art.md).
> Переводы ([D76](team/decisions.md)): `core/src/i18n.ts` (`@gp/core/i18n`, чистый модуль: Node проверяет им строки) — `createI18n`, параметры, числа и формы множественного числа через Intl, определение языка (сохранённый выбор → `Portal.locale()` → браузер → en); `i18n-platform.ts` — тексты платформы на 13 языках, у китов — `strings.meta.ts`; `lang-picker.ts` — выбор языка с SVG-флагами; `GameHost.t/lang/setLanguage/onLanguage`. Строки игры — `games/<id>/strings/<code>.yaml` (`cli/src/i18n.ts`: проверки `gp validate`, `gp translate`, модуль `virtual:gp/strings`); языковой проход `gp qa` — `kit-code/qa/suite.ts` (`runLanguages`).
> Первая минута ([guides/first-minute.md](guides/first-minute.md), рычаги C1–C4, C7, T1, R2–R4 из [research/feedback-and-metrics-2026-10.md](research/feedback-and-metrics-2026-10.md)): `GameHost.firstVisit` (нет сохранения — новый игрок сразу в безопасном первом забеге), воронка на шине событий (`'funnel'`: boot → loaded → title → firstInput → gameplayStart → play15/30/60 → firstFail → firstResults → exit; `host.screen/fail`), `saveRun/loadRun`; `core/src/hints.ts` (одна подсказка за раз), `results-ui.ts` (`mountResults`: большая кнопка — следующий забег, следующая цель), `welcome.ts` + `daily.ts` `recordVisit` (возврат в новый день); `streak.ts` + `streak-ui.ts` (`dailyStreak`, `dailyOrder`, `mountStreakCard`: неделя ежедневных наград и заказ дня, для любого жанра); для idle-игр — `offline.ts` (`offlineEarnings`: доход за время отсутствия, выплата один раз, ×2 через `rewardedButton` на `welcomeBack`) и `prestige.ts` (`Prestige`, `prestigeModel`: сброс за множитель и вторая жизнь в модели баланса; `OFFLINE_GENRES`/`PRESTIGE_GENRES` — для реестра жанров); `portal.ts` `deferPortal` + `player/src/boot.ts`: игра ждёт SDK портала не дольше 1,5 с, вызовы SDK в очереди. `gp qa` — секция first-minute в `kit-code/qa/suite.ts` (на `crazygames` — проверки: ≤ 1 клика до игры, простой 12 с, ≤ 25 слов, видимые сенсорные кнопки, сенсорный бот, громкость старта, fps при 4× CPU) и медленный SDK в `qa/src/portal-suite.ts`.
> После Frankengun (FPS-роглайт на three.js, game22): `core/src/season.ts` + `season-ui.ts` (`seasonPass`, `weeklyEvent`, `mountSeasonTrack`: сезон с датами, ступенями за опыт и большой наградой каждые K ступеней, недельное событие с одним правилом на всех; пропущенный день или неделя ничего не отнимают, невостребованные ступени прошедшего сезона переносятся — D56; экран — страницы вместо прокрутки, отметки нарисованы SVG, `gp.season.*` на 13 языках; блоки в реестре жанров для action, roguelite и idle); `core/src/sound.ts` `createSceneMusic` (`SCENES`, `STAGES`: сцены, тональность и темп на этап, слои по интенсивности, сирена, сигнал тревоги и рёв толпы на шине музыки; браузерный тест старта до первого касания — `test-browser/music-start.test.ts`); `core/src/balance-model.ts` — форма `shape: 'run'` (`runAt`: забеги от первой стадии в ожидаемых значениях, покупки между забегами; кампанийные проверки по стадиям пропускаются, вместо них проверки забега; game.yaml `balance.anchor.shape`). Лидерборды — не блок: нужны сервисы портала.
> Живой мир ([guides/live-world.md](guides/live-world.md), по [research/roblox-2026-10.md](research/roblox-2026-10.md) и [research/board-games-2026-10.md](research/board-games-2026-10.md)): `core/src/clock.ts` (`worldClock`: слоты по UTC, расписание событий и праздничных часов, погода по сиду; `clockShift` — `?clock=+300` для dev и QA), `restock.ts` + `restock-ui.ts` (`restockShop`: общий для всех ассортимент на слот, редкости, мировая страховка, личный «завоз сейчас» за rewarded — вид `restock` в `REWARDED_KINDS` и `MONEY_TABLE`; `mountRestockTimer`, переменные `--gp-restock-*` с запасными `--gp-theme-*`), `loot.ts` (`LootTable`: видимые шансы, страховка, удача только вверх), `variants.ts` (мутации по условиям мира, комбо, множители, точное ожидание), `daily-table.ts` (`dailyTable`: расклад дня, полосы очков, «12 очков до Gold», карточка), `share.ts` (`shareCode`: версия и контрольная сумма), `rivals.ts` (`rivals`: NPC-соперники, имена-персонажи, не игроки). В `spec`: `money.loot` — `E_PAID_RANDOM` (случайное за деньги — PEGI 16), `W_REWARDED_RANDOM`, `W_LOOT_ODDS` (и в коде: `lootChecks`); `money.hybrid` — блоки idle-слоя в игре другого жанра без `W_GENRE_BLOCK`.
> Мета-блоки из опроса наших игр (Craft Pickaxe, Garage, Velvet, Frankengun): `core/src/goals.ts` + `goals-ui.ts` (`dailyQuests` — N заданий дня из пула по сиду дня, каждое забирается отдельно, бонус за все, прогресс в памяти и в сохранении игры, не сохранение на каждый `add`; `achievements` — постоянные проверки по сохранению, редкость, скрытые «???», получены один раз; `mountGoals` — вкладки заданий и достижений, страницы вместо прокрутки; `goalBanners` — очередь баннеров, ждущая закрытия панели); `coach.ts` (`coachHand` — рука-подсказка tap/swipe/drag/hold, SVG или спрайт игры, неподвижна при reduced motion; `hints().show(…, { hand })`); `inspect.ts` (`inspect` — табличка при наведении мыши или удержании пальца 380 мс, удержание не нажимает); `collection.ts` + `album-ui.ts` (`collection`, `mountAlbum` — найдено/силуэт, редкость, метки «новое», постоянный бонус, подписи рядов); `rewards.ts` + `rewards-ui.ts` (`playtimeGifts`, `luckyWheel` — приз решён и сохранён при вращении, показан при остановке, рекламный спин только после бесплатного; `dailyOffers` — первое бесплатно; `timedBoost` — ×1 внутри расчёта офлайн-дохода, `offline.ts` `measuringOffline`; `mountRewardsHub`); `cards.ts` (`cards` — одна карточка за раз на титуле: welcome, неделя, сезон, сюжет, цели; `cardOpened` в welcome/streak/season/dialogue); `ui-kit.ts` — общие отметки SVG, иконки игры, переменные темы с запасным `--gp-theme-*`, страницы. Виды награды `spin` и `currency` в `REWARDED_KINDS` (`spec/src/money.ts`). D56: пропущенный день ничего не отнимает (невостребованное переносится).
> Звук и «сочность» (ревьюеры не слышали наших игр и называли их плоскими; Velvet, Candle Crypt, Swarm Smash, Frankengun писали это сами): `core/src/sfx.ts` — `createSfx(mixer, sounds)` в `@gp/core/sound` (файлы через decodeAudioData и процедурные рецепты `sfxRecipe`: coin, hit, shot, deny, click, whoosh, pop, thud, boom и ударные материалы marble/wood/glass/metal/bell/porcelain по модальным таблицам Velvet; ±6 % высоты на каждое проигрывание, троттлинг по звуку, лимит голосов, громкость и панорама от слушателя, голосовые реплики с приглушением музыки, `hush()`, мягкий лимитер с потолком 0,9 на выходе; шины микшера помечены `__gpBus`); `core/src/sequencer.ts` — `ScoreSequencer` (трасса шагов Velvet: такт 0,28 → 0,09 с, счётчик, высота по номеру такта, «дробь» после 12 шагов, приземление по log(итог/цель), перемотка по тапу, пауза хоста, раздвигание подписей, `previewScore` до хода); `gp qa` — секция `sound` (`kit-code/qa/sound.ts`, `qa/src/sound.ts`, измеритель реального времени `qa/src/audio-tap.ts` `audioMeter` — тот же перехват AudioContext, что у `gp video --sound`): доля действий со звуком в 150 мс, баланс эффектов и музыки (LUFS по BS.1770), клиппинг, длинная тишина, точные повторы; провал — только клиппинг или полная тишина, остальное — предупреждения (⚠️, первыми в отчёте).
> Блоки шутеров ([D81](team/decisions.md); Frankengun, Candle Crypt, Swarm Smash): `core/src/twin-stick.ts` (`TwinStick`, `LookInput` поверх `MoveInput`: pointer lock, сенсорный twin-stick, пауза хоста), `aim.ts` (`aimAssist`), `steer.ts` (`@gp/core/steer`), `boss.ts` (`BossPatterns` и эмиттеры пуль), `callouts.ts` (диктор), `quality.ts` (`QualityLadder`, `deviceTier`); у адаптеров — `setRenderScale`, у three — `snapshot` и `fitToRect`, у pixi — `snapshot` и `fitRect`; `art/src/threat.ts` через `@gp/art/hud` (`HitArcs`, `edgeArrow`, `DamageNumbers`). Гайд — [guides/code-games.md → Shooters and action](guides/code-games.md#shooters-and-action-aim-enemies-bosses-the-announcer-threat-cues).
>
> **M0a.** В репозитории работают:
> - пакеты `core`, `blocks`, `kit-kids`, `spec`, `player`, `cli`, `qa`;
> - `docs/examples/kids/game.yaml` (Balloon Pop, `id: balloon-pop`; до 2026-10-10 — `games/balloon-pop`) проходит 74/74 проверок оригинального QA и 15 проверок платформы;
> - оригинальный `qa.mjs` против сборки платформы — 74/74 (`tools/parity-check.mjs`).
>
> Справочник полей, каталог, профили и коды ошибок **генерируются из кода** в [docs/reference/](reference/). Если текст ниже расходится со справочником, прав справочник. Решения команды — в [team/decisions.md](team/decisions.md).
>
> Настоящие имена пакетов: `blocks` (в старых разделах ниже — `components`), `kit-kids`, `kit-casual`, `kit-code` (в старых разделах — `kids-kit`, `casual-kit`).

---

## 1. Принципы

1. **Агент пишет *что*, платформа знает *как*.** Игра = спецификация (`game.yaml`) + контент + при необходимости маленький компонент. Цикл кадров, ввод, звук, реклама, покупки, родительский замок, сборка Android — никогда не пишутся заново.
2. **Специфика = код, а не текст.** Возрастные правила, политики Google Play Families и COPPA, требования каналов оформлены как правила валидатора и проверки QA. Агент не может «забыть» их, потому что сборка не пройдёт.
3. **Быстрая машиночитаемая обратная связь.** Каждая ошибка содержит код, место и подсказку исправления. Превью и QA работают headless за секунды.
4. **Детерминизм.** Seed для случайности, внедряемые часы: одинаковая спецификация = одинаковая игра = воспроизводимый тест.
5. **Растём от реальных игр.** Каждая новая конструкция появляется, потому что её потребовала конкретная игра. Спецификация замораживается (v1) только после трёх игр.
6. **Маленькая поверхность.** Агент должен уметь держать в контексте весь API платформы: ~15 точек расширения, один файл документации `AGENTS.md`.
7. **Документация и удобство — часть продукта.** Конструкция без документации, примера и скриншота не считается готовой (§9). Создать игру должно быть удобно: минимальный `game.yaml` в ~10 строк, остальное — разумные умолчания.
8. **В платформу попадает только проверенное.** Код переносится из эталонной игры, только когда прошёл её браузерный QA **и** тест на устройстве/эмуляторе. Непрошедшие части ждут исправления в исходной игре (§2.1).

## 2. Что берём из Balloon Pop

Разбор `QmaCyber/game/src` (≈2800 строк) — куда уходит каждый файл:

| Файл Balloon Pop | Слой платформы | Как переносится | Статус |
|---|---|---|---|
| `app.ts` (цикл кадров, DPR, safe-area, ввод, переходы, Back) | `core` | как есть, но без импорта сцен и `STICKERS`: мета-цикл задаётся спецификацией | ⏸ частично: Back и связка `finishRound` → реклама ждут исправления |
| `audio.ts` (WebAudio-синтез, TTS) | `core/audio` | как есть; звуки становятся именованными пресетами | ✅ |
| `storage.ts` | `core/save` | обобщить: `Save<T>` с namespace игры и миграциями версий | ✅ |
| `native.ts` | `core/native` | как есть | ⏸ ждёт исправления (keep-awake, minimize, возврат из браузера) |
| `render.ts` (текст, эмодзи, панели, иконки, звезда, частицы, easing) | `core/draw` | как есть; `drawBalloon`/`drawSkyBackground` → в `themes/` | ✅ |
| `scenes/ui.ts` (layout, hit-тесты, kid-кнопки ≥64 dp) | `core/layout` | как есть + правило минимального размера из профиля возраста | ✅ |
| `ads.ts` + тесты правил | `kit-kids/ads` | как есть; лимиты `ADS` → профиль канала `android-families` | ⏸ правила и тесты ✅; показ AdMob на устройстве ждёт исправления |
| `billing.ts` (remove_ads, подтверждение покупки, очередь вызовов) | `kit-kids/iap` | как есть | ⏸ ждёт исправления («Restore» зависает) |
| `scenes/parent.ts` (замок + настройки) | `kit-kids/parent` | как есть; пункты настроек — из спецификации | ⏸ частично: ссылка на privacy policy (возврат в игру) |
| `scenes/menu.ts` (карточки режимов) | `kit-kids/scenes/menu` | обобщить: карточки = режимы из спецификации | ✅ |
| `scenes/roundEnd.ts` («Well done!», звёзды, наклейка) | `kit-kids/scenes/reward` | как есть | ✅ |
| `scenes/album.ts` (24 наклейки) | `kit-kids/scenes/album` | обобщить: размер альбома из спецификации | ✅ |
| `field.ts` (поле плывущих целей) | `components/spawn-field` | обобщить: траектория вынесена в отдельный компонент (`rise`); глобальные `THEME`/`GAME`/`COLORS` заменить на внедрение | ✅ |
| `scenes/play.ts` (раунд, режимы `switch`, «мешок» без повторов) | `components/tap-collect` + `content/` | `Mode` и `switch` → контент-паки из спецификации; «мешок» → `core/rng.bag()` | ⏸ частично: снятие keep-awake после раунда |
| `theme.ts` | `themes/sky-balloons` | интерфейс `Theme` остаётся контрактом темы | ✅ |
| `config.ts` (`GAME`) | `game.yaml → balance` | данные спецификации | ✅ |
| `i18n.ts` (цвета, числа, буквы, животные, наклейки, UI) | `content/en/*` + `game.yaml` | общие паки (цвета, числа, алфавит, животные) + строки игры | ✅ |
| `tests/ads.test.ts` | `kids-kit` тесты | как есть | ✅ |
| `tools/qa.mjs`, `device-test.mjs` | `qa/` | обобщить: опираться на события `game.events`, а не на имена классов сцен (`scene.constructor.name` ломается при минификации и переименовании) | ✅ |
| `tools/art.ts`, `make-art.mjs`, `screenshots.mjs` | `packager/store-art` | обобщить: иконка/фича-графика из темы | ✅ |
| `android/`, `capacitor.config.ts`, CI | `packager/android` | генерируется из спецификации (appId, имя, цвета), манифест-проверка встроена | ⏸ частично: `MainActivity` и сборка ✅ в CI, поведение Back/полноэкранного режима — после зелёного device-test |
| `docs/store-listing.md`, `privacy-policy.html`, чек-листы | `packager/store` | шаблоны + проверка длины и запрещённых слов | ✅ |

**Итог:** примерно 70% кода Balloon Pop — это платформа. Игроспецифичны только тема, контент и параметры.

### 2.1 Нативные части: исправлены в `QmaCyber/game`, перенесены

При первом разборе тест на эмуляторе в `game` показывал 24/29: падали реклама AdMob, keep-screen-on, Back, «Restore purchases» и возврат из браузера. Агент в `game` это исправил: **31/31** (результаты в коммите `c833576`, код после этого не менялся, кроме адреса privacy policy). Платформа перенесла весь код с коммита `8d813f5`. Нативные части (`native.ts`, `ads.ts`, `billing.ts`) в платформе такие же. Сборка платформы проверяется на эмуляторе в CI (M0b): `.github/workflows/android.yml` собирает AAB из `gp build --target android`, проверяет объединённый манифест (`gp android check-manifest`) и прогоняет device-test на эмуляторе; сбои самого эмулятора и что с ними сделано — [D34](team/decisions.md). Настоящий телефон всё ещё нужен до релиза.

## 3. Слои

Платформа делится на три уровня. Верхний не знает ни жанра, ни аудитории:

| Уровень | Что входит | Зависит от жанра/аудитории? |
|---|---|---|
| **Платформа** | `core`, `spec` (схема + валидатор + реестр), `qa`-фреймворк, `packager`, `cli`, `mcp` (план), документация | нет |
| **Наборы (kits)** | `kids-kit` (замок, Families-реклама, альбом, награды), позже `edu-kit` (уровни, прогресс, отчёт учителю), `casual-kit` (очки, рекорды, rewarded) · компоненты · темы · контент · профили | да, каждый набор — для своей области |
| **Игры** | `game.yaml` + контент + редкие собственные компоненты | — |

Новый рынок из opportunity-map (порталы, playables, обучение) = новый набор или профиль канала, а не новая платформа.

Сейчас наборов три: `kit-kids` (детские, Google Play), `kit-casual` (13+, `tap-score`, CrazyGames и свой сайт) и `kit-code` (своя механика в `main.ts` на `GameHost`). Модули `core`, появившиеся после схемы ниже: `host` (`GameHost` для `kit: code`), `portal` (адаптер SDK CrazyGames), `upgrades` + `shop-ui` (мета-прогрессия: `UpgradeShop`, `mountUpgradeShop`), `sites` + `sites-map` (несколько мест idle-игры с общим кошельком, фоновым и офлайн-доходом, миграцией сохранения одного места; экран карты с видами, которые рисует игра — `Sites`, `mountSitesMap`), `rewarded-button` (кнопка rewarded-рекламы, которая честно выдаёт награду и прячется без рекламы), `story` + `dialogue-ui` (сюжетный движок и диалоговый экран), `levels` + `undo` (звёзды за уровень, открытие по порядку, история ходов головоломки — D62), `zones`, `board`, `dice`, `automa` (настольные блоки: колода, мешок, рынок и шанс перебора; квадратная и гексагональная сетка, полимино, рюкзак, шаблоны; кубики со слотами и шансами; соперник по списку приоритетов с объяснением хода — [table-blocks.md](guides/table-blocks.md)). В `spec` — `taken.ts` (занятые концепции, `W_CONCEPT_TAKEN`).

```
┌────────────────────────────────────────────────────────────────────────────┐
│  Агент  ──  AGENTS.md  ·  CLI `gp`  ·  (MCP-tools — план)                  │
├────────────────────────────────────────────────────────────────────────────┤
│  game.yaml (GameSpec)  ──▶  validator (schema + профили возраста/канала)  │
├──────────────┬──────────────┬───────────────┬──────────────┬───────────────┤
│  components  │  content     │  themes       │  kids-kit    │  (edu-kit…)   │
│  механики,   │  паки слов,  │  фон, цель,   │  parent gate,│  позже, когда │
│  траектории, │  генераторы  │  палитра,     │  ads Families│  появится     │
│  прогрессия  │  (числа, ×)  │  звуки        │  IAP, награды│  игра         │
├──────────────┴──────────────┴───────────────┴──────────────┴───────────────┤
│  core: цикл · сцены · ввод · layout · draw · audio/TTS · save · rng · time │
│        · events (для QA и аналитики) · native (Capacitor)                  │
├────────────────────────────────────────────────────────────────────────────┤
│  qa: профили · headless-прогоны · скриншоты · perf · compliance           │
│  packager: web · android (Capacitor) · store-art · store-listing · (MRAID)│
└────────────────────────────────────────────────────────────────────────────┘
```

## 4. Каталог готовых конструкций

✅ — есть в Balloon Pop, 🔜 — нужна ближайшей игре (в скобках — какой), остальное не строим, пока не понадобится.

**Сцены (kids-kit):** ✅ меню с карточками режимов · ✅ раунд · ✅ праздник 1.4 с · ✅ экран награды («Well done!», 3 звезды, наклейка) · ✅ альбом наклеек · ✅ родительский замок · ✅ настройки (звук, голос, remove ads, restore, privacy) · 🔜 выбор уровня (умножение).

**Механики (components):**

| Компонент | Статус | Описание |
|---|---|---|
| `spawn-field` | ✅ | поле появляющихся целей: лимит на экране, частота, отступы, адаптация к повороту |
| `tap-collect` | ✅ | тап по цели → эффект + контент + счётчик до N |
| `trajectory/rise` | ✅ | вверх с покачиванием (шарики) |
| `trajectory/fall` | 🔜 (Catch a Star, Fruit Garden, Snowflakes) | вниз |
| `trajectory/curve` | 🔜 (Butterflies) | полёт по кривой |
| `collector` | 🔜 (Catch a Star) | цель летит в «банку», видимый счётчик |
| `tap-correct-answer` | 🔜 (умножение) | вопрос + N вариантов, «мягкая» ошибка без проигрыша |
| `burst-at-touch` | 🔜 (Fireworks) | эффект в точке касания, с ограничением вспышек |
| `progression/levels` | 🔜 (умножение) | уровни с параметрами генератора, сохранение прогресса |

**Контент (content):** ✅ цвета · ✅ числа 1–10 · ✅ алфавит A–Z · ✅ 26 животных · ✅ 24 наклейки · 🔜 морские животные, фрукты, фигуры · 🔜 генератор `multiplication`. Контент-пак = данные (`emoji`, `label`, `say`), без кода.

**Обратная связь и эффекты:** ✅ конфетти · ✅ салют · ✅ всплывающее слово · ✅ озвучка TTS · ✅ синтез-звуки (pop, tap, win, firework) · 🔜 shake (мягкая ошибка).

**Темы:** ✅ `sky-balloons` · 🔜 `night-sky` (Catch a Star, Fireworks) · 🔜 `meadow`.

## 5. Специфика: профили

Профиль — набор правил, которые валидатор проверяет статически, а QA — в запуске. Игра выбирает `audience` и `channel`, остальное включается автоматически.

**Профили возраста**

| Правило | `ages-2-5` | `ages-6-8` | `ages-9-12` |
|---|---|---|---|
| Мин. touch-таргет | 64 dp (цели ≥ 76 dp) | 48 dp | 48 dp |
| Текст, нужный для игры | нет, только картинки и голос | ≤ Grade 2 | ≤ Grade 5 |
| Проигрыш / таймер | запрещены | мягкий таймер можно | можно |
| Длительность раунда | 30–60 с | 1–5 мин | свободно |
| Вспышки | ≤ 3/с, без резкой смены яркости всего экрана | то же | то же |
| Мультитач | не ломает игру | то же | то же |
| Покупки, внешние ссылки | только за родительским замком | то же | то же |

**Профили канала**

| Правило | `android-families` | `web` | `crazygames` | `playable` (позже) |
|---|---|---|---|---|
| Аудитория | только детские (`ages-*`) | любая | только `general` (13+, PEGI 12) | — |
| Реклама | AdMob, `tagForChildDirectedTreatment`, G, без `AD_ID` и Privacy Sandbox; лимиты Balloon Pop (не раньше 60 с и 2-го раунда, ≤1 за 2 раунда и 90 с) | нет (пока) | SDK портала: межстраничная не раньше 180 с и конца 3-го раунда, ≤1 за раунд и 180 с, только на пути в следующий раунд; rewarded — только по тапу игрока | нет |
| IAP | `remove_ads` через Play Billing с подтверждением | нет | нет | нет |
| Разрешения | белый список: сборка падает при `AD_ID`, геолокации, камере, микрофоне и т. д. | — | — | — |
| Аналитика | нет (как в Balloon Pop), пока не будет решения по Data safety | нет | события SDK (`gameplayStart/Stop`, `happytime`) — автоматически | события сети |
| Сохранения | локально | локально | модуль данных SDK (облачные для вошедших игроков) — автоматически | — |
| Размер | — | — | один `upload/index.html`; начальная загрузка ≤ 20 МБ, ≤ 1500 файлов | ≤ 5 МБ, один HTML |
| Магазин / портал | листинг: длины, запрещённые слова, скриншоты 9:16; фича-графика 1024×500 | — | `concept` (`E_CONCEPT`, `W_CONCEPT_TAKEN`), название ≤ 35 символов, 3 обложки, 2 превью-видео, `listing` — всё в `gp submission` | — |

Правила берутся из уже проверенных артефактов Balloon Pop: `config.ts` (`ADS`), `tests/ads.test.ts`, `docs/play-console-checklist.md`, `docs/GDD.md` §9.

## 6. GameSpec v0

Критерий: **Balloon Pop целиком описывается спецификацией** — выполнен: [examples/kids/game.yaml](examples/kids/game.yaml).

- **Все поля** с типами, умолчаниями и ограничениями: [reference/game-yaml.md](reference/game-yaml.md). Схема для редактора — `packages/spec/schema/game.schema.json`, генерируется.
- **Схема собирается** по `kit` (его секции) и `round.mechanic` (схема раунда). Новый набор или механика — запись в каталоге, а не правка валидатора.
- **`kit: code`** — набор без раунда и темы (`round: false` в его записи каталога): схема без `round`/`theme`, резолвер проверяет только правила платформы, канала и аудитории (13+, веб-каналы). Плеер передаёт модулю игры `GameContext { host, canvas, ui, game }`; `GameHost` держит правила, которые игра не должна реализовывать сама (жизненный цикл портала, лимиты рекламы, rewarded только после тапа, звук во время рекламы, сохранения, пауза по набору причин `'hidden' | 'ad' | 'context'` — последняя: потеря WebGL-контекста на `#game`, с экраном «перезагрузите» `showNotice`, если его не вернуть). `start()`, который бросает или отклоняется, плеер (`boot.ts`) ловит: экран «*Title* can't run in this browser (…)», `loadingStop`, одно предупреждение в консоли (D66). QA — общий набор по соглашениям `data-gp="play"`, `host.qa(...)`, `data-gp-rewarded`.
- **Примеры**, проверяемые в CI: [examples/minimal.game.yaml](examples/minimal.game.yaml) (~20 строк) и [examples/fruit-pop.game.yaml](examples/fruit-pop.game.yaml) (игра из учебника).
- **Следующие игры** — черновики геймдизайнера: [team/drafts/](team/drafts/). В них поля, которых ещё нет, помечены `# NEW:`: `fall`, `collector`, `tap-answer`, `levels` (`kit: casual` с тех пор сделан).
- **Поля портала:** `concept` — чем игра своя (обязательно на канале с проверкой оригинальности, `E_CONCEPT`; `spec/taken.ts` — занятые на CrazyGames пары «жанр + тема», предупреждение `W_CONCEPT_TAKEN`) и `listing` — описание, управление, ориентация, теги для формы портала (`gp submission`).

```yaml
# из docs/examples/kids/game.yaml
spec: 0
id: balloon-pop
audience: ages-2-5          # правила аудитории: размеры, голос, замок
channel: android-families   # правила канала: лимиты рекламы, AdMob для детей, privacy policy
kit: kids                   # сцены вокруг раунда и секции modes / menu / rewards / parentGate / strings
theme: sky-balloons
round:
  mechanic: tap-collect
  goal: 15
  trajectory: { type: rise, time: [5.5, 7.5] }
modes:
  - { id: colors, content: colors-en }
  - { id: numbers, content: numbers-1-10-en }
```

## 7. Контракты компонентов (TypeScript, эскиз)

```ts
/** Всё, что компонент получает от платформы. Прямого доступа к window, сети и localStorage нет. */
interface GameContext {
  readonly screen: { w: number; h: number; u: number; inset: Insets };
  readonly time: number;                       // внедряемые часы
  readonly rng: Rng;                           // seed; rng.bag(n) — «мешок» без повторов
  readonly audio: { sfx(name: SfxName): void; speak(text: string): void };
  readonly theme: Theme;                       // контракт из Balloon Pop theme.ts
  readonly profile: AudienceProfile;           // минимальные размеры, правила текста
  readonly events: EventBus;                   // round:start, target:spawn, target:pop, round:end, ad:*
  readonly save: ScopedSave;                   // только свой namespace
}

interface Mechanic<Cfg> {
  readonly id: string;                         // 'tap-collect@1'
  readonly schema: JSONSchema;                 // схема своей секции в game.yaml
  create(ctx: GameContext, cfg: Cfg, content: ContentSource): RoundController;
}

interface RoundController {
  update(dt: number): void;
  draw(g: CanvasRenderingContext2D): void;
  pointer(x: number, y: number): void;
  readonly done: boolean;                      // платформа сама запускает праздник → рекламу → награду
}

interface Trajectory { readonly id: string; spawn(ctx: GameContext): Motion; step(m: Motion, dt: number): void; offscreen(m: Motion): boolean }
interface ContentSource { next(): ContentItem }  // ContentItem = { label?, emoji?, say?, color? }
```

Ключевое отличие от Balloon Pop: **мета-цикл (раунд → праздник → реклама → награда) принадлежит платформе**. Компонент сообщает только `done`. Поэтому защиту от двойного `finishRound`, паузу после раунда и правила рекламы нельзя сломать из игры.

`events` — единый источник для QA (вместо `window.__app.scene.constructor.name`) и, позже, для аналитики.

## 8. Инструменты агента

**CLI `gp`** (`--json` — там, где есть смысл; полный справочник генерируется из `packages/cli/src/gp.ts`: [reference/cli.md](reference/cli.md)):

| Команда | Что делает |
|---|---|
| `gp validate [game] [--all] [--release] [--json]` | схема, ссылки, правила аудитории и канала; у каждой ошибки код, строка и подсказка; `--release` требует настоящие ID рекламы и данные издателя |
| `gp explain <тема>` | код ошибки, поле `game.yaml`, профиль или запись каталога |
| `gp catalog [kind] [--json]` | конструкции: наборы, механики, траектории, темы, контент-паки, наклейки |
| `gp new <id> [--from <game>] [--title "…"]` | новая игра внутри платформы из существующей (новые id, appId, saveKey, privacy URL; ID AdMob — `auto`) |
| `gp init <dir> --id <id> --title "…"` | новый репозиторий игры из шаблона `templates/game-repo` (скелет вокруг заглушки-механики, `docs/concept.md`, `REPORT.md`) |
| `gp dev [game] [--port 5173]` | dev-сервер с тестовой рекламой и покупкой-заглушкой, перезагрузка при правке `game.yaml` |
| `gp build [game] [--target web\|android\|crazygames] [--release] [--e2e]` | web → `dist/`; `crazygames` → один `upload/index.html` с проверкой лимитов портала; `android` → Capacitor-проект (Gradle — в CI) |
| `gp covers [game]` | обложки по профилю канала (CrazyGames 1920×1080, 800×1200, 800×800; Google Play 1024×500) + превью 200×112 |
| `gp video [game]` | два 15-секундных превью-видео (1920×1080 и 1080×1920) на виртуальных часах |
| `gp review [game] [--check] [--no-capture]` | задание второму агенту на проверку качества (`qa/review-brief.md`: требования CrazyGames с источниками, факты игры, скриншоты и видео, признаки девяти игр с ответом портала) и лист сравнения `qa/review-sheet.png`: кадры игры 1280×720 (титул, два момента игры, мета-экран, обложка) рядом с 3 одобренными и 2 отклонёнными кадрами наших игр из `publisher/reference/`; рецензент играет сначала десктоп, ставит каждому экрану 1–5 («встал бы на главную CrazyGames рядом с этими?») и пишет `quality.md` (`## Scores`, `[blocking]` / `[nice]`; оценка ниже 4 — `[blocking]`), `--check` проверяет файл (D70, D80) |
| `gp submission [game] [--reuse-media]` | папка `submission/` со всем для формы портала: upload, обложки, видео, `listing.md`, `quality.md` — каждый файл проверен; не собирается, пока в `quality.md` есть `[blocking]` |
| `gp android check-manifest [game] <manifest>` | объединённый манифест против белого списка разрешений канала и минимального `targetSdkVersion` |
| `gp qa [game] [--quick] [--headed]` | QA в браузере: набор проверок кита на его размерах экрана; игра портала — ещё и как production-upload с подменённым SDK |
| `gp admob provision [game] [--app-id …] [--interstitial …]` | ID AdMob игры (§8.1) |
| `gp schema` | JSON Schema `game.yaml` для редактора |
| `gp docs [--check]` | генерирует `docs/reference/*.md` и схему; `--check` — только проверка актуальности (CI) |
| `gp doctor` | проверка окружения: Node, зависимости, браузер для QA, Android (необязательно) |

**План, не сделано:** `gp preview` (headless-скриншот сцены и `--gallery`), `gp listing check` для Google Play, генерация иконки и скриншотов стора, `gp upgrade` (миграции `game.yaml`), MCP-сервер. Сейчас скриншоты для проверки — из `gp qa`.

**Формат ошибки** (агент исправляет за одну итерацию):

```json
{ "code": "E_TARGET_TOO_SMALL", "path": "round.target.min", "value": 30,
  "rule": "ages-2-5: target min ≥ 38 css px (≈76 dp diameter)",
  "fix": "set round.target.min to 38 or more" }
```

**MCP-сервер** (план, не сделано) — те же команды как tools (`validate`, `qa`, `build`, `catalog`, `explain`). Пока агент вызывает CLI.

**`AGENTS.md`** (одна страница): рабочий цикл · выбор кита и канала по аудитории · правила, которые нельзя нарушать · где что искать · шаблон отчёта и запроса блока.

**Рабочий цикл агента** (подробно — шаги 1–10 в [AGENTS.md](../AGENTS.md)). Эталонной игры нет ([D59](team/decisions.md)): игра начинается с `gp new --from <ближайшая игра>` или, для своего репозитория, с `gp init`; как выглядит готовая игра — [guides/game-anatomy.md](guides/game-anatomy.md).

```
бриф → аудитория, канал, concept → gp catalog → gp new / gp init → game.yaml → gp validate ─┐
   ▲                                                                                      │ ошибки → исправить
   └──────────────────────────────────────────────────────────────────────────────────────┘
→ нет нужной конструкции? → запрос блока в отчёте; игра сейчас — на kit: code
→ gp dev → gp qa → gp build (--target crazygames | android)
→ портал: gp review → второй агент: quality.md → gp submission (gp covers, gp video) → REPORT.md → владелец: публикация
```

### 8.1 Данные издателя и AdMob

**Уровень издателя — один раз на все игры** (`publisher/publisher.yaml`):
- Publisher ID: `pub-7106564298463512`;
- сайт разработчика, имя, email (пока `TODO(publisher)`);
- `publisher/app-ads.txt` генерируется из Publisher ID и публикуется в **корне** сайта разработчика (`https://<сайт>/app-ads.txt`). Одна строка покрывает все игры:
  `google.com, pub-7106564298463512, DIRECT, f08c47fec0942fa0`.

**Уровень игры.** `gp new` записывает в `game.yaml` `monetization.ads.appId: auto` и `interstitial: auto`; dev-сборки с ними работают на тестовых ID Google. Настоящие ID ставит `gp admob provision`:

```
gp admob provision <game>
 └─ печатает точные шаги в AdMob с готовыми именами:
    «Apps → Add app → Android → не опубликовано → имя "<title>" → App ID;
     это приложение → Ad units → Interstitial → имя "<id>-interstitial" → ad unit ID»
gp admob provision <game> --app-id ca-app-pub-…~… --interstitial ca-app-pub-…/…
 └─ записывает ID в game.yaml и проверяет их валидатором (издатель из publisher.yaml);
    при ошибке game.yaml остаётся прежним
```

Соглашение об именах: приложение = `title`, блок = `<id>-interstitial`.

**План, не сделано:** искать и создавать приложение и блок через AdMob API (`apps.list`, `adUnits.list`; `apps.create`, `adUnits.create` — ограниченный доступ), чтобы ID подставлялись без ручного копирования. Для этого нужны OAuth-учётные данные Google Cloud с включённым AdMob API (scope `admob.readonly` / `admob.monetization`) в GitHub Secrets / локальном `.env`, не в репозитории.

**Защиты:**
- `gp dev` и отладочные сборки **всегда** используют тестовые ID Google, независимо от `game.yaml`: клики по своей настоящей рекламе — частая причина блокировки аккаунта AdMob;
- релизная сборка падает, если остались тестовые ID, `TODO(publisher)` или App ID не принадлежит `publisherId` (префикс `ca-app-pub-7106564298463512~`);
- после публикации в Google Play приложение нужно связать с магазином (AdMob → Link your app — `gp admob provision` печатает это напоминание), ID при этом не меняются.

## 9. Definition of Done игры (всё проверяется автоматически)

- `gp validate` — 0 ошибок.
- `gp qa` — все проверки на 360×800, 800×360, 768×1024: ничего не выходит за экран, таргеты по профилю, 60 fps с запасом, мультитач, реклама по правилам, замок не открывается случайными тапами.
- Юнит-тесты компонентов зелёные; правила рекламы не ослаблены.
- Android: сборка AAB в CI, манифест по белому списку.
- Тест на эмуляторе зелёный (урок Balloon Pop: браузерного QA мало, на эмуляторе упали 5 из 29 проверок).
- Листинг и графика проходят проверки.
- Сгенерированы документы игры (§11): GDD, листинг, privacy policy, чек-лист публикации.

**Definition of Done конструкции** (компонента, темы, контент-пака, профиля): схема · описание в 2–3 предложениях · минимальный пример `game.yaml` · скриншот/GIF из `gp preview` · юнит-тесты · проверка на эталонной игре в браузере **и на эмуляторе**. CI не зарегистрирует конструкцию без любого из пунктов.

## 10. Структура репозитория

```
game_platform/
  AGENTS.md · CLAUDE.md        вход для агента
  publisher/                   publisher.yaml · app-ads.txt (общие для всех игр) · results.yaml (ответы порталов) · reference/ (кадры одобренных и отклонённых игр для gp review)
  packages/
    core/                      runtime без привязки к жанру (цикл, сцены, ввод, draw, audio, save, rng, events, ads, billing,
                               host, portal, upgrades + shop-ui, sites + sites-map, rewarded-button, story + dialogue-ui, levels, undo, i18n + lang-picker)
    blocks/                    механики, траектории, темы, контент (+ *.meta.ts — каталог в виде данных)
    kit-kids/                  набор для детских игр: сцены, flow, QA-набор (qa/suite.ts), device-test для эмулятора
    kit-casual/                набор 13+: титульный экран, раунд `tap-score`, экран результата, QA-набор
    art/                       модуль отрисовки для kit: code (@gp/art: материалы, свет, спрайты, риги, эффекты, камера, фоны, HUD)
    kit-code/                  набор для игр своим кодом (`main.ts` на `GameHost`): запись каталога без раунда и темы
    spec/                      схема, профили, ошибки, валидатор, resolve, explain, taken.ts (занятые концепции)
    player/                    запуск игры по resolved spec (index.html, boot.ts)
    android/                   шаблон Capacitor-проекта и его генерация из спецификации
    cli/                       gp: validate, explain, catalog, new, init, dev, build, covers, video, review, submission, android,
                               qa, admob, schema, docs, doctor, translate
    qa/                        раннер QA-наборов (Playwright), QA production-сборки портала (portal-suite.ts), отчёт
  templates/game-repo/         шаблон репозитория игры для `gp init`
  games/                       своих игр у платформы нет: сюда `gp new` кладёт игру YAML-кита (папка создаётся по требованию);
                               наши игры живут в своих репозиториях (`gp init`)
  docs/                        tutorial, guides/, reference/ (генерируется), examples/, team/, research/
  docs/examples/               kids/ (Balloon Pop — пример и регрессионный тест детского кита в CI; `gp … balloon-pop`
                               находит его по id), code/, art/, *.game.yaml
  tools/parity-check.mjs       оригинальный qa.mjs против сборки платформы
```

npm workspaces, TypeScript, Vite, Vitest, Playwright — тот же стек, что в Balloon Pop. Без новых зависимостей в runtime.

**Balloon Pop 1.0 выпускается из `QmaCyber/game` как есть**, платформа его не блокирует. Порт (`docs/examples/kids`, id `balloon-pop`) нужен только для доказательства паритета. Выпускать v1.1 из платформы или нет — решение после паритета (appId и `SAVE_KEY` сохраняются).

## 11. Документация и удобство создания игр

У документации две аудитории — агент и человек — и один источник истины: схемы и реестр конструкций. Всё, что можно сгенерировать, генерируется, поэтому документация не отстаёт от кода.

### 11.1 Что есть в документации

| Тип (Diátaxis) | Содержание | Как поддерживается |
|---|---|---|
| **Tutorial** | «Первая игра за 15 минут»: `gp new` → правим `game.yaml` → `gp dev` → `gp qa` | проходится в CI как сценарий: если шаг сломался, падает сборка |
| **How-to** | добавить режим, тему, контент-пак, механику, профиль канала; перенести игру на новую версию спецификации; подготовить публикацию | короткие страницы с проверенными примерами |
| **Reference** | каждое поле `game.yaml` · каталог компонентов, тем, контент-паков с их схемами, примерами и скриншотами · коды ошибок · команды `gp` | **генерируется** из JSON Schema, реестра и CLI |
| **Explanation** | архитектура · почему правила профилей такие (Families, COPPA, доступность для малышей) · мета-цикл раунда | пишется вручную, ссылки на первоисточники политик |

**Для агента:** `AGENTS.md` (одна страница, рабочий цикл и правила) + `llms.txt` (оглавление со ссылками) + MCP-tool `catalog` / `explain <поле|компонент|ошибка>`. Агент не читает весь сайт документации, он спрашивает ровно то, что нужно.

**Для человека:** сайт документации (статический, из того же репозитория), галерея игр и конструкций со скриншотами.

**Проверяемые примеры:** каждый YAML-пример в документации валидируется в CI, а в каталоге рендерится `gp preview` (план, не сделано). Пример, который не проходит `gp validate`, ломает сборку.

**Каталог ошибок:** у каждого кода (`E_TARGET_TOO_SMALL`, `E_ADS_LIMITS`, …) есть страница «причина → как исправить → пример». Ссылка на неё приходит прямо в JSON ошибки.

**Changelog и миграции:** версия спецификации и каждого компонента; руководство по миграции + `gp upgrade` (автоматическая правка `game.yaml`).

### 11.2 Документы каждой игры генерируются

Balloon Pop показал, что около половины работы после кода — документы: GDD, листинг, privacy policy, чек-лист Play Console, отчёт. Платформа генерирует их из `game.yaml` и профилей:

| Документ | Источник |
|---|---|
| `GDD.md` | `game.yaml` (режимы, раунд, мета-цикл, правила рекламы из профиля) + ручной раздел «концепция» |
| `store-listing.md` | шаблон + `gp listing check` (план, не сделано; для портала уже есть `listing` → `listing.md` в `gp submission`) |
| `privacy-policy.html` | профиль канала (какие SDK, какие данные) |
| `publish-checklist.md` | профиль канала (`android-families`: IARC, Families, Data safety, `remove_ads`, тестеры) |
| `qa-report.html` | `gp qa`: таблица проверок + скриншоты всех сцен на всех размерах экрана |

### 11.3 Удобство создания игр

| Что | Зачем |
|---|---|
| `gp new <id> --from <эталон>` с вопросами (аудитория, канал, тема) | старт за минуту с рабочей игрой |
| `extends:` в `game.yaml` | вариант игры = несколько строк разницы |
| разумные умолчания из профиля | минимальная игра — ~10 строк YAML |
| JSON Schema для редактора | автодополнение и подсказки в VS Code у человека, та же схема у агента |
| hot reload `game.yaml` в `gp dev` | правка сразу видна |
| `gp preview --gallery` (план, не сделано) | одна HTML-страница: все сцены × режимы × размеры экрана |
| `gp explain <поле>` | описание, допустимые значения и пример в терминале |
| `gp doctor` | проверка окружения (Node ≥ 22.18, Java, Android SDK или CI) с понятными подсказками |
| понятные отчёты QA | не «74 OK», а таблица и скриншоты, где видно, что не так |

**Метрики удобства:** время до первой работающей игры у нового агента/человека · доля ошибок, исправленных только по подсказке · число вопросов агента, на которые не нашлось ответа в документации (каждый такой вопрос → новая страница или подсказка).

## 12. Решение по движку

Оставляем **свой Canvas 2D runtime из Balloon Pop**, а не Phaser/PixiJS:
- он уже написан, проверен QA и эмулятором, ~2800 строк без зависимостей;
- агент работает с API платформы (спецификация + компоненты), а не с движком, поэтому то, что LLM «хорошо знают Phaser», почти ничего не даёт;
- у Phaser сотни API — это противоречит принципу маленькой поверхности.

Пересматриваем, если понадобятся спрайтовые анимации, физика или тысячи объектов: тогда рендерер заменяется за интерфейсом `core/draw`, а спецификации не меняются.

## 13. Roadmap: каждая веха доказывается игрой

| Веха | Что делаем | Доказательство | Метрика |
|---|---|---|---|
| ✅ **M0a. Ядро из проверенного** | монорепо; перенос только ✅-частей (§2): цикл, draw, layout, audio, save, `spawn-field`, `tap-collect`, `rise`, `sky-balloons`, контент-паки, правила рекламы; `game.yaml` v0; `gp validate/dev/qa`; каркас документации (§11) | web-сборка `games/balloon-pop` проходит браузерные проверки оригинального `qa.mjs` | паритет браузерного QA 100% |
| ✅ **M0b. Android-упаковка** | код нативных частей уже перенесён (§2.1); `gp build --target android` (Capacitor-проект из спецификации, **белый список** разрешений из профиля); тест на эмуляторе в CI платформы | Android-сборка `games/balloon-pop` проходит тот же device-test | 31/31 на эмуляторе; `.github/workflows/android.yml` собирает AAB, проверяет манифест и гоняет device-test; сбои эмулятора в CI — [D34](team/decisions.md) |
| **M1. Игра №2 силами агента** | Catch a Star: `fall`, `jar`, `night-sky`; `gp preview`; ошибки с подсказками | агент делает игру по брифу, не трогая `core` | время < 2 ч (было ≈4 ч), ≤ 2 итераций `validate` |
| **M2. Игра №3, не детская** (предложение, решает владелец — decisions O1) | Pop Rush: `kit: casual`, `tap-score`, `goal.time`, лучший счёт, канал `web` | платформа не только для детей | 0 изменений в `core`; **заморозка GameSpec v1** |
| **M3. Другой возраст** | умножение 6–8: `tap-answer`, `levels`, генератор, профиль `ages-6-8` | спецификация выдерживает уровни и ответы | 0 изменений в `core` |
| **M4. Агентный интерфейс** | MCP-сервер, `AGENTS.md`, `catalog`, `packager/android` + `store-art` + `listing check` | игра №4 из одного предложения брифа без написания кода | < 1 ч до зелёного QA и AAB |
| **M5. Каналы** | `web`, затем `playable` (если подтвердится спрос, см. opportunity-map MVP C) | одна спецификация → Android + web | сборка под второй канал без правок игры |

## 14. Что сознательно не строим

Визуальный редактор · свой синтаксис DSL и компилятор (YAML + JSON Schema достаточно) · 3D · свой бэкенд и аккаунты платформы (облачные сохранения на CrazyGames даёт SDK портала, платформа их уже использует; игра со своим сервером для онлайн-мультиплеера возможна на `kit: code` — [code-games.md → Games with a server](guides/code-games.md#games-with-a-server-online-multiplayer), сервисы мультиплеера портала — открытый запрос D54) · физический движок · маркетплейс компонентов · публичный API для внешних клиентов · аналитику (до решения по Data safety). Каждый пункт возвращается в план только вместе с игрой или клиентом, которым он нужен.

## 15. Риски

| Риск | Защита |
|---|---|
| Абстракция под одну игру (всё выглядит как «шарики») | обобщаем только после игр №2 и №3; M2 — намеренно другая механика и возраст |
| Платформа ломает старые игры | версии компонентов (`tap-collect@1`), golden-скриншоты эталонных игр в CI |
| Агент уходит писать код в обход спецификации | линтер: игра не импортирует `core` напрямую, только API; компоненты — в отдельной ветке с ревью |
| Правила Families/COPPA меняются | профили версионируются; обновление профиля = одна правка для всех игр |
| Браузерный QA зелёный, устройство — нет | тест на эмуляторе в DoD |
