# game_platform — аналитика: политики, покрытие правил, метрики

Версия 0.1 · 2026-09-29 · автор: аналитик (политики/compliance + продуктовые метрики)
Основа: `packages/spec/src/{profiles,errors,resolve,schema}.ts`, `docs/platform-architecture.md` §5/§9/§13, `docs/opportunity-map.md` §0, эталон `QmaCyber/game` (`docs/play-console-checklist.md`, `GDD.md` §7–9, `REPORT.md`, `.github/workflows/android.yml`, `tests/ads.test.ts`). Источники политик — в конце, `[n]`.
`support.google.com` и `developers.google.com` из этого окружения не открываются: формулировки политик взяты из поисковой выдачи и чек-листа эталона. Перед релизом их нужно сверить с первоисточником (пометка **[сверить]**).

**Главное:**
1. В платформе сейчас **работает только статический слой** (валидатор). `packages/qa/src` и `packages/cli/src` пусты, `.github/` нет. Всё, что в эталоне проверяли QA, CI и эмулятор, в платформе пока **не проверяется**.
2. Из 40 требований матрицы 8 закрыты правилами валидатора, 5 заложены в поля профиля (попадают в runtime, но не проверяются), остальные есть только в документах, только в эталоне или не описаны нигде.
3. Два значения опасны прямо сейчас: `say: false` можно поставить для `ages-2-5` (игра станет требовать чтения), а `W_TITLE_LONG` — только предупреждение, хотя Play отклоняет названия длиннее 30 символов. Ещё два станут опасны, когда включат рекламу в `android`: `PG` и отсутствие проверки «игра нравится детям».

---

## 1. Матрица покрытия

**Где проверять:** **S** — статически по `game.yaml` (`gp validate`) · **B** — браузерный QA (`gp qa`, headless, лог событий) · **A** — Android-сборка (merged manifest, дерево Gradle-зависимостей) · **E** — эмулятор или устройство · **H** — только человек в Play Console / AdMob / App Store Connect.
**Сейчас:** `V:код` — правило валидатора · `P` — поле профиля, применяется в runtime, но не проверяется · `Э` — есть только в эталоне (QA или CI `QmaCyber/game`), в платформу не перенесено · `D` — только текст (`rules[]`, чек-лист) · `—` — нет нигде.

### 1.1 Google Play Families + COPPA (канал `android-families`)

| # | Требование (источник) | Сейчас | Предлагаемая точка контроля |
|---|---|---|---|
| F1 | Реклама только через Families Self-Certified Ads SDK; AdMob ≥ 19.0.0 в списке; программа закрыта для новых SDK [1][2] | P (`ads: admob`) | **A:** allowlist ad-зависимостей в Gradle: только `play-services-ads`, без адаптеров медиации. **H:** в AdMob медиация и bidding выключены |
| F2 | Ни interest-based, ни ремаркетинга; child-directed; рейтинг G [1][3] | P (`admob.*`, игра не может переопределить) | **S** ✓ через профиль. **B:** мок плагина AdMob записывает параметры init, QA сверяет их с профилем. **H:** галка child-directed в AdMob |
| F3 | Нет interstitial сразу при запуске [4] | V:`E_ADS_LIMITS` (`noAdsAfterLaunchSec ≥ 60`) | **B:** инвариант лога: `ad.show.t − app.start.t ≥ 60 s` |
| F4 | Реклама не мешает игре: только в естественной паузе [4][5] | Э (`qa.mjs`, device-test) | **B:** `ad.show` только в состоянии `round.end → reward`, ни разу внутри `round` |
| F5 | Любую рекламу (включая rewarded) можно закрыть через 5 с [4] | D (`testAdCloseSec` — только заглушка; в чек-листе совет «только display») | **H:** в ad unit оставить только Display. **E:** тестовая реклама, время до появления крестика ≤ 5 с |
| F6 | Не передавать AAID, SIM/Build serial, BSSID, MAC, SSID, IMEI, IMSI; не запрашивать номер телефона [6]; с 15.07.2026 то же для смешанной аудитории [7] | Э (denylist `AD_ID\|ADSERVICES` в CI) | **A:** allowlist разрешений; `ACCESS_WIFI_STATE`, `READ_PHONE_*`, `BLUETOOTH*` — ошибка. Сейчас `ACCESS_WIFI_STATE` через denylist проходит |
| F7 | Приложения только для детей не запрашивают геолокацию [6] | Э (denylist `LOCATION`) | **A:** allowlist |
| F8 | Покупки, внешние ссылки и настройки — только за родительским замком (Play [6], Apple 1.3 [11]) | V:`E_PARENT_GATE_REQUIRED` (только флаг) | **B:** `link.open` и `purchase.start` только при `scene = parent`; 40 серий случайных тапов не открывают замок (Э) |
| F9 | В Target audience для 2–5 выбрать только «5 & under» [8] | D (чек-лист §4.6) | **S:** генерировать ответ в `publish-checklist.md` из `audience`. **H:** заполнить форму |
| F10 | Контент подходит самой младшей группе (без страшного, насилия и т. п.) [8] | — | **S:** у контент-паков и тем поле `minAge`, валидатор сверяет его с `audience`. **H:** ревью ассетов |
| F11 | Privacy policy в сторе и в приложении, https | V:`E_PRIVACY_POLICY` (только формат) | **CI:** URL отвечает 200 и содержит `title`. **B:** ссылка есть в parent-сцене |
| F12 | COPPA 2025 (обязательно с 22.04.2026): в privacy notice письменная data-retention policy, категории третьих лиц, цели persistent ID; письменная программа безопасности [9][10] | — | **S:** privacy policy генерируется из профиля, CI проверяет наличие разделов. **H:** один раз на издателя — программа безопасности |
| F13 | Раскрытие данных третьим лицам для рекламы требует отдельного VPC [9]. Не применяется, пока реклама контекстная (child-directed) | P (child-directed нельзя выключить) | **A:** allowlist SDK: аналитика, крэш-репортеры и трекеры — ошибка сборки |
| F14 | Data safety соответствует SDK в сборке | D | **A:** черновик формы генерируется из дерева зависимостей. **H:** заполнить форму |
| F15 | IARC, декларации Ads и Advertising ID | D | **S:** черновики ответов из `monetization` и `parentGate`. **H:** заполнить |
| F16 | EEA/UK/CH с TFUA: UMP форму не показывает, идут Limited Ads [12][13] | D (открытый вопрос §9 чек-листа) | **H/PM:** решение по странам. **S:** поле канала `regions` |
| F17 | Статический лимит частоты сильнее политики (60 с / 2 раунда / 90 с) | V:`E_ADS_LIMITS` + Э (`ads.test.ts`) | **перенести** `ads.test.ts` в платформу (unit на `shouldShowAd` и на `FAMILIES_AD_POLICY`) |
| F18 | `remove_ads` подтверждается (acknowledge), иначе через 3 дня возврат | Э (код + QA на заглушке) | **E/H:** license tester (чек-лист §7.2) |

### 1.2 Google Play — общие требования (оба android-канала)

| # | Требование | Сейчас | Точка контроля |
|---|---|---|---|
| G1 | targetSdk ≥ 36 для новых приложений и обновлений с 31.08.2026, продление до 01.11.2026 [14] | Э (CI только печатает, `\|\| true`) | **A:** fail, если ниже `channel.minTargetSdk` (новое поле профиля) |
| G2 | Play Billing Library ≥ 8 с 31.08.2026 (8 → до 31.08.2027) [15] | D (в эталоне 9.1.0) | **A:** проверка версии в дереве зависимостей по `channel.minBillingMajor` |
| G3 | Название ≤ 30 символов | V:`W_TITLE_LONG` (**warning**) | **S:** для `platform: android` — ошибка `E_TITLE_LONG` |
| G4 | Листинг: длины, запрещённые слова (#1, best, free), скриншоты ≤ 2:1 | D (`gp listing check` — план) | **S/CI:** `gp listing check` |
| G5 | Repetitive Content / Spam: нельзя «то же самое» и серии шаблонов [16] | D (строка в `rules[]`) | **S:** проверка схожести по портфелю `games/*` (см. §2, R6). **H:** темп релизов |
| G6 | Minimum functionality: без крэшей и ANR | Э (device-test 31/31) | **E:** device-test в CI платформы. **H:** Android vitals |
| G7 | Personal-аккаунт: закрытый тест 12 × 14 дней | D | **H.** Метрика «календарное время» (§3) |
| G8 | `app-ads.txt` в корне сайта разработчика | D | **CI:** HTTP-проверка строки `pub-…` |
| G9 | Release без тестовых ID, ID своего издателя, без TODO | V:`E_RELEASE_IDS`, `E_ADMOB_PUBLISHER`, `E_RELEASE_TODO` ✓ | ✓. Добавить **A:** `admob_app_id` в собранном манифесте = `game.yaml` |
| G10 | Общая аудитория, AdMob в EEA/UK/CH: сертифицированный CMP (UMP), TCF v2.2/2.3, точка входа в privacy options. Non-personalized тоже требует согласия на cookies/ID [12][17][18] | V:`E_ADS_UNSUPPORTED` (реклама запрещена, `adsNeedConsent: true`) ✓ | Когда появится UMP: **B:** форма показана до `ads.init`, кнопка privacy options есть, если `REQUIRED`. **E:** проверка на эмуляторе с EEA debug geography |
| G11 | Interstitial у общей аудитории: не при запуске и не в начале уровня, закрытие ≤ 15 с [5] | P (`adPolicy` канала `android`) | **B:** те же инварианты F3/F4 |
| G12 | Play Age Signals (US: TX, UT, LA; глобально до конца 2026) [19] | — | **PM:** решение нужно до первой игры `general` с покупками **[сверить]** |

### 1.3 Возрастные правила (UX), все каналы

| # | Требование (источник) | Сейчас | Точка контроля |
|---|---|---|---|
| U1 | Радиус тап-целей ≥ минимума аудитории | V:`E_TARGET_TOO_SMALL` ✓ | + **B:** реальный hit-радиус на 3 размерах экрана |
| U2 | Кнопки ≥ `minTouchPx` (64/48/44) | P (`minTouchPx` → layout) + Э (QA 64 px) | **B:** QA измеряет прямоугольники всех кнопок из событий layout |
| U3 | Мультитач не ломает игру | Э (`qa.mjs`: 5 и 8 касаний) | **B** |
| U4 | Не больше 3 вспышек в секунду, без резкой смены яркости экрана (WCAG 2.3.1 [20]) | D | **B:** покадровая яркость в headless (порог 25 % по площади ≥ 25 %) на конфетти, салюте, награде |
| U5 | 2–5: не нужно читать, всё озвучено | D. **Дыра:** `say: false` проходит валидатор | **S:** для `ages-2-5` `say: false` — ошибка. **B:** каждое всплывающее слово озвучено (`tts.speak` в логе) |
| U6 | 2–5: нет проигрыша, таймеров, негатива; 6–8: мягкие ошибки | D (у `tap-collect` этого нет по устройству механики) | **S:** флаги в meta механики (`hasTimer`, `hasFail`, `gestures`) сверяются с аудиторией; без этого M2 (`tap-correct-answer`) проверить нельзя |
| U7 | 2–5: один тап, без свайпов и long press | D | **S:** `gestures` в meta механики |
| U8 | 6–8: текст ≤ Grade 2; 9–12: ≤ Grade 5 (есть в архитектуре §5, **нет** в `profiles.ts`) | — | **S:** эвристика читаемости для `strings` и паков + **H** |
| U9 | Длительность раунда: 2–5 — 30–60 с (архитектура §5) | — | **B:** QA-бот играет раунд, время раунда в отчёте. **S:** оценка по `goal` и `spawnEvery` |
| U10 | Звук и голос выключаются взрослым | Э (QA toggle) | **B** |

### 1.4 Будущие каналы (профилей пока нет)

| Требование | Вывод для профиля |
|---|---|
| Apple Kids Category 1.3: без сторонней аналитики и рекламы (исключение — контекстная реклама с ручной проверкой креативов), без передачи device info, parental gate [11] | Канал `ios-kids`: `ads: null`, SDK allowlist пуст. AdMob туда не подходит |
| Apple: новые возрастные рейтинги 4+/9+/13+/16+/18+, анкета обязательна с 31.01.2026 [21] | **H:** шаг в чек-листе iOS |
| Web-порталы для детей | COPPA действует и в web: при подключении SDK портала `web` + child audience должны требовать privacy policy |

**Итог по типам:** статически (S) можно закрыть F2, F3, F9–F12 (генерация), F17, G3–G5, G9, U1, U5–U8. В браузере (B) — F4, F8, F11, U1–U5, U9–U10. Нужна Android-сборка (A) для F1, F6, F7, F13, F14, G1, G2, G9. Эмулятор или устройство (E) — F5, F18, G6, G10. Только человек (H) — F5 (настройки ad unit), F9, F10, F14–F16, G7, G12 и все формы Play Console.

---

## 2. Неверные и рискованные значения в текущих профилях

| # | Где | Значение | Риск и основание | Предложение |
|---|---|---|---|---|
| R1 | `resolve.ts` / `ModeInput.say` | `say: false` разрешён для `ages-2-5` | Правило профиля «No text is needed to play» нарушается одной строкой YAML: режим с `show: label` без голоса требует чтения | `E_VOICE_REQUIRED` для аудиторий без чтения |
| R2 | `errors.ts` `W_TITLE_LONG`; schema `maxLength: 50` | warning | Play Console не примет название > 30 символов. «Зелёный validate» тогда не гарантирует, что игру можно выпустить | Ошибка для `platform: android`, warning для web |
| R3 | `CHANNELS.android.admob.maxAdContentRating` | `'PG'` | Сейчас реклама в `android` выключена (`E_ADS_UNSUPPORTED`), но единственный kit — `kids`, темы детские. Игра `general` на `kids-kit` почти наверняка «нравится детям». Тогда Google считает аудиторию смешанной, и нужны Families-реклама и neutral age screen [1][6]. PG ≠ «ads appropriate for children» | `G` по умолчанию; `PG` только при `kit ≠ kids` или явном `appealsToChildren: false` с ревью человека. Ещё лучше — запретить пару `general + kids` до решения PM |
| R4 | `CHANNELS.android.adPolicy` | `noAdsAfterLaunchSec: 30`, `firstAdAfterRound: 1`, `minIntervalSec: 60` | Формально по Better Ads [5] допустимо (не «сразу при запуске», пауза после раунда). Но: (а) при раунде ~20–40 с первая реклама приходится на ~30–40-ю секунду первой сессии, это бьёт по D1; (б) `testAdCloseSec: 5` здесь ни на что не влияет, для общей аудитории порог — 15 с; (в) источника у чисел нет, в отличие от Families (эталон) | Пометить как **[гипотеза]**; до UMP не важно. Ввести поле `source` у каждого порога |
| R5 | `AUDIENCES['ages-9-12' \| 'general'].minTouchPx` | `44` | Android рекомендует ≥ 48 × 48 dp для любого элемента [22]; 44 — это норма Apple (pt). Для канала Android 44 < базовой рекомендации | `48` для всех android-каналов (или `max(audience, channel.minTouchPx)`) |
| R6 | Repetitive Content — только строка в `rules[]` | — | Главный риск бизнес-модели (`opportunity-map` §0.2): бан аккаунта снимает весь портфель. Валидатор не мешает выпустить `balloon-pop` с другим `title` | `W/E_TOO_SIMILAR`: сравнение с `games/*` по (механика, траектория, тема, набор паков, ключевые слова листинга). Для android-каналов нужно отличие хотя бы в механике или теме плюс уникальный листинг [16] |
| R7 | `schema.privacyPolicyUrl.pattern` | `^https?://` | Схема пропускает http, резолвер требует https только при `privacyPolicyRequired`. Агент получает две разные ошибки на одно поле | Одно правило: `^https://` в схеме |
| R8 | `FAMILIES_AD_POLICY.maxAdWaitSec` | `120` | Ребёнок до 2 минут смотрит на «паузу», пока ждёт рекламу (на эмуляторе реклама пришла через ~80 с, `REPORT.md`). Политику это не нарушает, но это плохой UX, и его видят асессоры Teacher Approved | Метрика в device-test (p95 ожидания); цель ≤ 10 с; снизить cap после данных |
| R9 | `CHANNELS['android-families'].adsNeedConsent` | `false` | С TFUA UMP форму не показывает, в EEA идут Limited Ads [12][13]. Это верно, но по названию поля кажется, что EEA не требует действий. Доход в EEA ≈ минимальный, вопрос включения регионов открыт (чек-лист §9) | Добавить `regions`/`eeaMode: limited-ads \| exclude` и выводить решение в чек-лист |
| R10 | `CHANNELS.web` + child audience | `privacyPolicyRequired: false` | Пока нет сети и SDK — допустимо. Когда подключат SDK портала, COPPA-уведомление станет обязательным [9] | `privacyPolicyRequired: child && ads !== null` |
| R11 | `ages-9-12` в `profiles.ts` | нет правил о тексте, таймерах, длине раунда | Архитектура §5 обещает «≤ Grade 5», «таймер можно», а профиль этого не знает. Документация и данные расходятся | Одна таблица-источник: `rules[]` → структурированные поля + генерация §5 из профилей |
| R12 | CI эталона: denylist разрешений | `AD_ID\|ADSERVICES\|LOCATION\|CAMERA\|…` | В архитектуре §5 написано «белый список», фактически это denylist. Пропускает `ACCESS_WIFI_STATE` (BSSID/SSID, F6), `QUERY_ALL_PACKAGES`, `POST_NOTIFICATIONS`, `SYSTEM_ALERT_WINDOW`, `FOREGROUND_SERVICE_*` | Allowlist по каналу в профиле: `INTERNET`, `ACCESS_NETWORK_STATE`, `BILLING`, `WAKE_LOCK`, `FOREGROUND_SERVICE`, `*.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION` |
| R13 | Правило «No banners, no rewarded ads» | в `rules[]` | Это решение платформы, а не требование Google: Families разрешает rewarded, если его можно закрыть через 5 с [4]. Если так и оставить, агенты начнут считать это политикой Google | Разделить в профиле `policy` (требование стора) и `choice` (наше решение) |

Что правильно (подтверждено): Families-флаги AdMob (`childDirected`, `underAgeOfConsent`, `G`, NPA) [3][13]. Запрет рекламы в `android` до UMP: NPA тоже требует согласия в EEA [17]. Пары канал–аудитория (`E_CHANNEL_AUDIENCE`) исключают смешанную аудиторию без age screen. Минимумы `ages-2-5` 64 dp / радиус 38 — строже любой внешней нормы.

---

## 3. Метрики платформы

**Источник данных — один:** каждая команда `gp` (включая вызовы агента через MCP) дописывает строку в `.gp/runs.jsonl` (игра, команда, `git sha`, время старта и длительность, код выхода, список `issue.code` с `path`, версия профилей). CI прикладывает этот файл и отчёты `qa-report.json` / `device-test.json` к артефакту. Метрики считает скрипт `gp metrics` по всем `games/*`; для их сбора ни агенту, ни человеку ничего делать не нужно. Исключение — M8 и M9: их вводит человек (одна строка в `games/<id>/release-log.yaml`).

| # | Метрика | Точное определение | Как собирается | База (Balloon Pop) → цель |
|---|---|---|---|---|
| M1 | **Время от брифа до зелёного QA** | `t(первый gp qa exit 0 при 0 ошибок validate)` − `t(gp new <id>)`; только «стенное» время сессии, паузы > 30 мин без команд вычитаются | `runs.jsonl` | ≈ 4 ч → M1: < 2 ч, M3: < 1 ч |
| M1b | Время до пакета публикации | то же до `gp build android` + `gp listing check` + device-test, всё зелёное | `runs.jsonl` + CI | — → < 1.5 ч (M3) |
| M2 | **Итерации валидатора** | число запусков `gp validate` от первого до первого с 0 ошибок (warnings не считаются) | `runs.jsonl` | — → ≤ 2 |
| M2b | Исправление с одной подсказки | доля пар (`code`, `path`): ошибка есть в запуске N и исчезла в N+1, новых ошибок на том же `path` нет | `runs.jsonl`, по кодам | → ≥ 90 %; коды < 70 % — переписать `fix` |
| M3 | **% игр без нового кода** | игра засчитывается, если diff от коммита `gp new` до релизного тега трогает только `games/<id>/**` (yaml, контент, ассеты); изменения `packages/**` в PR с меткой `game:<id>` — «новый код» | `git diff --stat` в CI | 0 % (всё с нуля) → M3: ≥ 75 % из 4 игр |
| M3b | Объём нового кода на игру | строки `+` в `packages/**`, `components/**` с меткой игры | git | → < 150 строк/игра после M2 |
| M4 | **Дефекты на устройстве после зелёного QA** | число упавших проверок device-test + issues с меткой `found-on-device` на сборке, у которой `gp qa` был зелёным | CI device-test + GitHub labels | 5 из 29 → 0 |
| M5 | Покрытие правил | доля требований из §1 с `enforcedBy ∈ {S,B,A,E}` среди всех, кроме H. Требования хранятся в профиле как `{id, text, source, enforcedBy}`, а не строками | `gp metrics` по профилям | сейчас ~ 30 % → 80 % к M3 |
| M6 | Регрессии профилей | число игр, у которых validate/qa покраснел после изменения `profiles.ts`, на один PR | CI matrix по `games/*` | → ловится в том же PR 100 % |
| M7 | Пробелы документации | `gp explain <X>` без ответа + вопросы агента без ответа в `AGENTS.md` (метка `docs-gap`) | `runs.jsonl` | → 0 к заморозке v1 |
| M8 | **Policy escape** | отказы и предупреждения Play / AdMob на одну отправку, по причинам | `release-log.yaml` (вводит человек) | → 0 |
| M9 | Ручное время релиза | часы человека в Play Console / AdMob на игру + календарные дни до production | `release-log.yaml` | 6–10 ч, 3–5 недель → ≤ 2 ч (без 12 × 14) |
| M10 | Цена игры | токены и $ сессий агента на игру | логи сессии (если доступны) | $20–100 → снижать |

Продуктовые метрики после релиза (D1/D7, ARPDAU, fill rate, доля EEA с Limited Ads) — только из экспорта Play Console / AdMob, своей аналитики нет (архитектура §14). Экспорт раз в неделю, ручной или через AdMob Reporting API; подключаем после первой опубликованной игры.

**Правила интерпретации:** M1–M4 считаются только для игр, сделанных агентом по брифу (не для порта эталона). Для каждой игры фиксируется версия профилей и платформы. Метрика вехи засчитывается по медиане, если игр ≥ 3, иначе по каждой игре отдельно.

---

## Вопросы к PM

1. Канал `android` (общая аудитория) нужен в ближайших трёх играх? Если да, UMP и решение по R3 (PG vs G, `general + kids-kit`) становятся блокерами. Если нет, предлагаю убрать рекламу из профиля до появления `casual-kit`.
2. EEA/UK/CH в Families-релизах: включаем с Limited Ads (почти без дохода) или исключаем в v1.0? От этого зависит поле `regions` (R9).
3. Тип аккаунта издателя: personal (12 × 14 дней на каждую игру) или organization? От этого M9 и календарный срок меняются в разы.
4. Кто и по какому критерию утверждает «достаточно отличается» (R6) и допустимый темп релизов (сейчас в GDD — одна игра в 2–4 недели)?
5. iOS (Apple Kids Category) в горизонте 6 месяцев? Там AdMob нельзя: монетизация только покупкой или платным приложением.

## Вопросы к геймдизайнеру

1. Целевая длительность раунда по возрастам (2–5: 30–60 с?) — фиксируем как проверяемое QA-правило (U9)? Сейчас `goal: 15` при `spawnEvery [0.45, 0.95]` — сколько это в секундах у реального малыша?
2. Для 6–8 и 9–12: какие таймеры и ошибки допустимы («мягкий таймер» — что это численно)? Без этого не заполнить флаги механик (U6) для `tap-correct-answer`.
3. Какие жесты, кроме одиночного тапа, будут в ближайших механиках (Butterflies — drag?) и для каких возрастов?
4. Есть ли у тем и контент-паков «возраст»? Например, `night-sky` может пугать 2-летних (F10).
5. `maxAdWaitSec: 120` — сколько ребёнок реально готов ждать на экране паузы? Предлагаю 10 с и измерять.

## Вопросы к разработчику

1. Можно ли сразу заложить `.gp/runs.jsonl` в CLI (формат выше) и отдавать его артефактом CI? Без этого M1–M2 не измерить уже на M1.
2. Какие события `core/events` видны QA: `ad.show`, `link.open`, `purchase.start`, `tts.speak`, `scene.enter` с id сцены? Этого хватит, чтобы закрыть F3, F4, F8, U5 инвариантами без привязки к именам классов.
3. Где будет проверка Android: в `packager/android` или в CI-скрипте? Нужны allowlist разрешений (R12), минимальные targetSdk и Billing из профиля, запрет ad- и аналитических зависимостей по `gradle dependencies`.
4. Реально ли в headless Chromium измерять вспышки (покадровая разница яркости) без заметного замедления `gp qa`?
5. Согласен ли перевести `rules: string[]` в `{id, text, source, enforcedBy}`? Тогда §5 архитектуры, `gp explain` и метрика M5 генерируются из одного источника.

---

## Источники

[1] Families Self-Certified Ads SDK Program — https://support.google.com/googleplay/android-developer/answer/9900633 ; Policy — https://support.google.com/googleplay/android-developer/answer/12918983
[2] Participate in the program (не принимает новых) — https://support.google.com/googleplay/android-developer/answer/12955712
[3] Comply with Families Policy using AdMob — https://support.google.com/admob/answer/6223431
[4] Preview: Google Play Families Policies (июль 2026) — https://support.google.com/googleplay/android-developer/answer/17122218 ; Families Policies — https://support.google.com/googleplay/android-developer/answer/9893335
[5] Better Ads Experiences — https://support.google.com/googleplay/android-developer/answer/12271244 ; Ads policy — https://support.google.com/googleplay/android-developer/answer/9857753
[6] Data practices in Families apps — https://support.google.com/googleplay/android-developer/answer/11043825
[7] Policy announcement 15.07.2026 — https://support.google.com/googleplay/android-developer/answer/17134731 **[сверить]**
[8] Families Policies (возрастные группы, контент) — https://support.google.com/googleplay/android-developer/answer/9893335
[9] Amended COPPA Rule (Federal Register) — https://www.federalregister.gov/documents/2025/04/22/2025-05904/childrens-online-privacy-protection-rule ; compliance 22.04.2026 — https://www.hunton.com/privacy-and-cybersecurity-law-blog/coppa-rule-amendment-compliance-deadline-approaches
[10] Data retention по COPPA 2025 — https://www.fenwick.com/insights/publications/what-the-amended-coppa-rule-means-for-data-retention-practices
[11] App Review Guidelines 1.3 Kids — https://developer.apple.com/app-store/review/guidelines/
[12] AdMob: Disclose to EEA users (UMP) — https://developers.google.com/admob/android/privacy/gdpr ; Limited ads — https://support.google.com/admob/answer/10105530
[13] AdMob targeting (TFCD/TFUA/max rating) — https://developers.google.com/admob/android/targeting
[14] Target API level requirements — https://support.google.com/googleplay/android-developer/answer/11926878 ; https://developer.android.com/google/play/requirements/target-sdk
[15] Play Billing Library deprecation — https://developer.android.com/google/play/billing/deprecation-faq
[16] Spam / Repetitive Content — https://support.google.com/googleplay/android-developer/answer/9899034 ; White label best practices — https://support.google.com/googleplay/android-developer/answer/15884185
[17] Personalised and non-personalised ads — https://support.google.com/admob/answer/7676680
[18] Google consent management requirements EEA/UK/CH — https://support.google.com/admanager/answer/13554116 ; TCF 2.3 — https://www.cookieyes.com/blog/iab-tcf-v2-3-explained/
[19] Play Age Signals API — https://developer.android.com/google/play/age-signals/use-age-signals-api ; https://android-developers.googleblog.com/2026/07/google-play-age-signals-api-safer-experiences.html
[20] WCAG 2.3.1 — https://www.w3.org/TR/UNDERSTANDING-WCAG20/seizure-does-not-violate.html
[21] Apple age ratings update — https://developer.apple.com/news/upcoming-requirements/?id=07242025a
[22] Android touch target 48dp — https://developer.android.com/guide/topics/ui/accessibility/apps
