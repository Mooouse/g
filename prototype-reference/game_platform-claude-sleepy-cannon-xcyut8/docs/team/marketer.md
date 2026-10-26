# Маркетинг и дистрибуция: тренды 2026, каналы, маркетинговый набор игры

Маркетолог (рост, дистрибуция, рынок) · 2026-09-29 · основа: `decisions.md` §5, `pm.md` §3–4, `game-designer.md` §2–3, `analyst.md` §3, `opportunity-map.md` §0, §5, §13 и веб-поиск (источники `[n]` в конце). Первоисточники многих площадок (docs.crazygames.com, sdk.poki.com, developers.google.com) из этого окружения не открываются: цифры взяты из поисковой выдачи. Перед заявкой в канал их нужно сверить (**[сверить]**).

**Главное.**
1. **Главный риск — дистрибуция, а не производство** (opportunity-map §0.2). Установки мобильных игр падают: −12 % г/г в H1 2026 [3]. Платный трафик при LTV ≈ $0.2 не окупится. Выигрывают каналы, где **трафик приводит площадка**: web-порталы, YouTube Playables, Reddit. Всё это HTML5, а наш runtime уже HTML5.
2. **Самый быстрый канал с обратной связью — CrazyGames.** Basic Launch без SDK: через 7–21 день площадка сама выдаёт метрики вовлечённости [8]. Google Play Families требует 3–5 недель календарного времени. Поэтому **web-упаковку и профиль портала надо делать раньше или вместе с M0b**, а не после M3.
3. **Растут простые механики с глубиной:** sort/screw/block-пазлы (выручка sort +229 % г/г), merge (+74 %), hybrid-casual (+23 %, $2.4 млрд за H1) [1][2][3]. Популярны «приятные» ASMR-игры и ежедневные пазлы. Для нас это значит: **следующая казуальная механика — `sort`, дешёвая фича — `daily`** (seed уже есть).
4. **Площадки завалены AI-играми и ужесточают фильтр.** В Яндекс Играх 17,1 тыс. заявок за август, у новичков 86 % отказов. У Poki отдельные правила для AI. На Steam AI-пометка у 30,8 % релизов [18][19][20]. Наш moat — **качество и соответствие правилам как код**, а не количество игр.
5. **Маркетинговый «хвост» генерируется из той же игры.** Детерминированный seed + QA в браузере дают скриншоты, видео и playable почти бесплатно. Это следующий по ценности инструмент после упаковки.

---

## 1. Тренды 2025–2026 и что они значат для платформы простых игр

| Тренд | Данные | Вывод для платформы |
|---|---|---|
| Рынок установок сжимается, растёт только hybrid-casual | установки −12 % г/г в H1 2026. Hybrid-casual $2.4 млрд (+23 %), D7 у топа выше, чем у casual. Реклама в играх (фев–апр 2026): hyper $2.02 млрд, casual $2.01 млрд, hybrid $0.83 млрд [3][4] | «Простая игра + мета» (рекорд, уровни, коллекция) лучше «одного экрана». Kids-мета (наклейки, альбом) — правильная основа; для `casual` нужны рекорд и прогресс |
| **Sort / screw / block-пазлы** | около $600 млн IAP за H1 2026, sort +229 % г/г. Новые хиты: Color Block Jam, Magic Sort, Screwdom, Pixel Flow [1][2] | Лучшая **вторая механика для `kit: casual`**: сетка, цвета, ход, победа. Для детей то же самое — «разложи по цветам/формам» (банка `jar` из M1 = контейнер) |
| Merge | $1.3 млрд IAP (+74 %), 311 млн установок (+22 %) [1] | позже: merge требует экономики и LiveOps, для «простых» игр это тяжело |
| Match-3 | $2.5 млрд, выручка стоит на месте; только 1 из 120 новых игр набрал > $100k/мес [1] | **не делать**: насыщенный жанр, нужен UA-бюджет |
| ASMR / «satisfying» | Mystery Dumpling Box — №1 в трендах августа 2026. В Playables: Skincare ASMR 61 млн запусков, Thief Puzzle 87 млн, DOP 4 42 млн [5][10] | «Сочность» (звук, частицы, тактильность) — главный конкурентный признак простой игры. Пакет звуков и эффектов в теме, **а не новый движок** |
| Ежедневные пазлы | LinkedIn Games: 3.5 млн DAU (май 2026), 8 пазлов. NYT Games — один из главных источников выручки NYT. Reddit Daily Games Hackathon: $40k [6][13] | `round.seed: daily` + «поделиться результатом» (emoji-сетка) — это 1–2 дня работы, а открывает Reddit, Telegram и web. Только `general` (у детей нет шеринга) |
| Cozy | линейка Apple Arcade 2026 «cozy-first», Sago Mini Jinja's Garden, Unpacking+ [27] | подтверждает тон kids-кита: без проигрыша, мягкие звуки |
| Idle, физические «игрушки» | idle растёт внутри hybrid-casual. Hole.io — 493 млн установок за всё время [7] | idle — не наш профиль (экономика). Физика «дыра/пин» — кандидат на M4+ |
| Web-игры растут | Poki: 100 млн игроков в месяц, 1 млрд запусков в месяц. 37 % игроков играют несколько раз в день. 53 % студий планируют порт в браузер [8][9] | подтверждает приоритет O3 (порталы). Конкуренция тоже растёт |
| **Падают / закрываются** | Telegram-игры: MAU 52 → 47 млн после tap-to-earn [15]. Facebook Web Games закрываются 30.09.2026, Instant Games переходят на Zero Permissions [16]. Google Play Instant закрыт в 12.2025 [24]. Amazon Appstore для Android — 20.08.2025 [25]. Netflix уходит с мобильных в облако на ТВ [26] | в эти каналы **не инвестировать** |

## 2. Матрица каналов

Усилие: **S** — только упаковка и метаданные, **M** — адаптер SDK площадки (реклама, пауза, события), **L** — новый клиент, сервер или язык. «Дети» — можно ли туда наш `kit: kids`.

| Канал | Аудитория | Деньги / доля разработчика | Тех. требования | Усилие | Дети | Рек. |
|---|---|---|---|---|---|---|
| **Google Play Families** (текущий) | крупнейший стор; COPPA-трафик | AdMob: eCPM у COPPA в 2.5–5 раз ниже [21]; IAP 85 % | AAB, Families, Data safety, Age Signals API (Техас действует с 05.2026) [22] | M0b | ✅ | **сейчас** (M0b) |
| **CrazyGames** | 50+ млн игроков/мес, Tier 1; **есть kids.crazygames.com** (COPPA-реклама) [8][11] | 60 % рекламы, 70 % IAP; выплата от €100 [8] | Basic Launch без SDK → Full Launch с SDK. Начальная загрузка ≤ 50 МБ (≤ 20 МБ для мобильной главной), ≤ 1500 файлов. Basic: ≥ 7 дней и 500 запусков (до 21 дня) [8] | **S** → M | ✅ через Kids [сверить, как туда подают] | **сейчас** (O3 ✅) |
| **Poki** | 100 млн/мес, 1 млрд запусков; отбор жёсткий: 227 релизов за 2025 [9][19] | 50/50 на трафике Poki, 100 % на своём; web-эксклюзив на 5 лет или разовая лицензия [9] | Poki SDK, Web Fit Test, правила для AI: оригинальность, никаких «чистых шаблонов» [19] | M | ⚠️ Poki Kids есть, отбор строгий | **позже**: одна лучшая игра по данным CrazyGames |
| GameDistribution | 350 млн/мес через 4000+ сайтов [12] | **33 %** | GD SDK | M | ⚠️ | **нет** (низкая доля, конфликтует с эксклюзивом Poki) |
| Playgama (агрегатор) | один Bridge SDK на ~20 площадок (CrazyGames, Yandex, YouTube, Telegram, Reddit…) [14] | до 80–90 % рекламы (по их маркетингу) | open-source SDK | M | ❓ COPPA не проверен | **вопрос к разработчику** (см. §6) |
| **YouTube Playables** | 50+ рынков с 28.09.2026 (было 7) [10] | реклама; условия доли разработчика не опубликованы (пилот) [10] | начальный бандл ≤ 30 МиБ (рекомендуется ≤ 15), файл ≤ 30 МиБ (реком. ≤ 512 КиБ), всего ≤ 250 МиБ. SDK: `firstFrameReady`, `gameReady`; интерактив < 5 с; **только 13+, не «для детей»** [10] | M | ❌ | **позже**: Pop Rush после CrazyGames (заявка через interest form) |
| **Reddit (Devvit Web)** | 130 млн DAU (Q2 2026) [13] | Developer Funds H2 2026: $111–5000/мес при 6k–50k Daily Qualified Engagers; разовые выплаты до $75k [13] | Devvit Web (HTML5, Phaser-шаблон), сервер Devvit (Redis) для рейтингов; ежедневный пост = игра | L | ❌ | **позже** (M4, с `daily`); хороший эксперимент для `general` |
| Яндекс Игры | 50+ млн/мес, 60 % РФ/СНГ [17] | 50 % дохода Яндекса [17] | SDK обязателен; локализация всех текстов и графики; интерактивный AI запрещён, заранее сгенерированный — можно. Модерация 3–7 дней, **86 % отказов у новичков** [17][18] | M | ✅ | **позже**, решение владельца (O4, выплаты в РК) |
| Telegram Mini Apps | 1 млрд MAU; игр — 47 млн MAU (−9 %) [15] | Stars (стор берёт 30 % при покупке), Adsgram rewarded (CPM около $2) [15] | HTML5 WebView, бот | M | ❌ | **нет** до `daily`/`casual`; аудитория крипто-ориентирована |
| Discord Activities | 200+ млн MAU [23] | IAP около 70 % (US/UK/EU, desktop) [23] | Embedded App SDK, прокси и CSP, ценность — в совместной игре | L | ❌ | **нет** (нужна социальная механика) |
| TikTok Mini Games | US, JP, BR, TR и др. [14b] | реклама и IAP, Growth Max (05.2026) | HTML5 WebView, свой SDK, одобрение | M–L | ❌ | **следить** |
| Facebook Instant Games | переход на Zero Permissions до 30.09.2026 [16] | Audience Network | — | M | ❌ | **нет** |
| Samsung Instant Plays 2.0 | облачный стриминг нативного Android, нужен Samsung IAP [24b] | — | не HTML5 | L | — | **нет** |
| Apple Arcade / Netflix | курируемые, питч студии; Netflix — облако на ТВ, дети и party [26][27] | фикс. контракт | нативные, крупные игры | L | — | **нет** |
| Kids-подписки (Piknik/Sago, Lingokids, Khan Kids) | закрытые каталоги своих студий; Lingokids ≈ $25–50 млн выручки [28] | — | — | — | ✅ | **нет** как канал; позже — B2B/лицензия |
| Roblox / UEFN | DevEx $1.7 млрд за 12 мес; UEFN $1 млрд+ [29] | 50–100 % | Luau / Verse, не HTML5 | L | ✅/❌ | **нет** (другая платформа) |
| Playable ads (B2B, MVP C) | UA-команды студий | $3–8k за штуку у агентств (opportunity-map §0.2) | один HTML ≤ 5 МБ, ассеты внутри файла, без сети. MRAID 2.0 (AppLovin) / 3.0 (Unity), TikTok — без MRAID [30] | M | — | **позже** (после сигнала MVP C) |

## 3. Рекомендации к плану (distribution first)

Порядок вех из O1 оставляю (M1 Catch a Star → M2 Pop Rush → M3 умножение). Но **добавляю web-канал раньше**: детские игры тоже HTML5, и CrazyGames Kids даёт данные о вовлечённости за 1–3 недели, а Play — за 3–5 недель.

| # | Что добавить | Когда | Почему | Не переусложнять |
|---|---|---|---|---|
| R1 | **`gp build web --target crazygames`** (+ профиль канала `web-crazygames`): zip, относительные пути, проверки «≤ 20 МБ / ≤ 1500 файлов», без внешних ссылок и чужой рекламы, `pauseOnHide`, мышь = тап, 16:9. Balloon Pop и Catch a Star — в Basic Launch (Kids) | **сразу после M0**, параллельно M0b | самый дешёвый способ получить первые реальные метрики (игры, время, конверсия в геймплей). В «Basic» SDK не нужен | без SDK и рекламы на первом шаге; адаптер SDK (R4) — только если Basic дошёл до Full |
| R2 | **Store kit v1** (бэклог PM №11): `gp listing` генерирует листинг из `game.yaml` и проверяет его (длины, запрещённые слова, отличие от других игр). `gp shots` делает скриншоты из QA-прогона с `?seed=` в размерах каналов + feature graphic + обложки портала | M1 | «хвост» — около половины работы (PM). Скриншоты уже есть в QA, их нужно кадрировать и подписать | подписи — шаблоны темы, **без генерации картинок нейросетью** |
| R3 | **`gp video`**: запись детерминированного прогона (Playwright `recordVideo`) → 15–30 с, 9:16 1080×1920 (Shorts/TikTok) и 16:9 (Play promo, CrazyGames). Хук в первые 2 с — «первая награда» | M1–M2 | органические ролики — единственный UA по карману при LTV $0.2; для Play нужен YouTube-URL | без монтажа и AI-озвучки: один сценарий «seed → 3 тапа → награда → конец» |
| R4 | **Интерфейс `portal` в core** (`gameplayStart/Stop`, `ad(midgame|rewarded)`, `loading`, `happytime`, `save`) + первый адаптер CrazyGames SDK | M2 (Pop Rush) | Full Launch и доход на CrazyGames; потом тот же интерфейс для Poki, YouTube, Yandex | один адаптер на веху. Не писать 5 адаптеров «на всякий случай» |
| R5 | **`kit: casual` + рекорд + `daily`** (seed от даты, «поделиться» emoji-сеткой) | M2 | у Pop Rush сессия 45 с, а топ CrazyGames — 10+ мин среднего времени [8]. Нужен цикл «ещё раз» + повод вернуться завтра | `daily` без сервера: seed = дата UTC. Рейтинги — только через SDK площадки |
| R6 | **Механика `sort`** (цвета/предметы по контейнерам): casual-пазл для `general` + детская версия «разложи по банкам» | M4 (после умножения) | самый быстрорастущий casual-поджанр [1]; для детей — классика развивающих игр; переиспользует `jar` из M1 | уровни из генератора, **без редактора уровней** |
| R7 | **Локализация листинга** (текст + подписи скриншотов) раньше локализации игры. Для 2–5 лет — ракурс «английский для малышей» в неанглоязычных сторах | M1–M3 | локализованный листинг +26 % конверсии; подписи на скриншотах дают около 60 % эффекта [31]. Play Console уже умеет AI-перевод и custom store listings по ключевым словам [32] | не делать `locale` для голоса (D11) ради ASO; это решение владельца (O4) |
| R8 | **Playable-экспорт** (`gp build playable`: один HTML ≤ 5 МБ, MRAID-обёртка, end card) | только после сигнала MVP C | 3 демо для B2B — дёшево, потому что runtime маленький | не строить «фабрику playables» до первых оплат |
| R9 | M3 «умножение»: канал Play Families + CrazyGames Kids; ASO по запросам родителей и учителей («times tables», «multiplication games») | M3 | высокий интент поиска; у родителей образовательный контент — главный повод платить | подписку не делать: у kids-edu отток 7.4 %/мес, нужен бренд [28] |

**Overengineering (не делать сейчас):**
- Упаковщики под Telegram, Discord, TikTok, Facebook.
- Своя аналитика или SDK в играх.
- AI-генерация иконок и видео с озвучкой.
- A/B-тесты иконок до трафика: store experiments маленьким приложениям нужны резкие отличия и тысячи установок [33].
- Массовый выпуск «×1000»: Яндекс отказывает 86 % новичков, у Google Play есть Repetitive Content, Poki проверяет оригинальность.
- Эксклюзив Poki до данных.
- Плагинная система адаптеров.

## 4. Маркетинговый набор, который платформа генерирует для каждой игры

Источник всего — `game.yaml` + детерминированный прогон `gp qa`. Результат — `games/<id>/store/<channel>/`. Человек только проверяет.

| Ассет | Google Play [34][35] | CrazyGames / порталы | YouTube Playables | Shorts / TikTok / Reels | Playable (B2B) |
|---|---|---|---|---|---|
| Название | ≤ 30 симв. (ошибка `E_TITLE_LONG`); без «free», «best», «#1» и эмодзи | короткое, уникальное в каталоге | локализованное | — | — |
| Описание | короткое ≤ 80, полное ≤ 4000; ключевые слова 2–3 раза, без спама; для Families — без ложных «educational» | 1–3 абзаца + «как играть» + управление | коротко, 13+ | подпись + 3–5 хэштегов | — |
| Иконка | 512×512 PNG 32-bit, ≤ 1 МБ | квадратная обложка [сверить размеры] | да [сверить] | — | — |
| Графика | feature graphic 1024×500, без прозрачности | обложки 16:9 / 2:3 / 1:1 [сверить: 1920×1080, 800×1200, 800×800] | обложка [сверить] | — | end card 1080×1920 |
| Скриншоты | 4–8 шт., 1080×1920 (9:16) + планшет. Первые 3 — ключевое действие + подпись ≤ 5 слов | 3–5, 16:9 (десктопная аудитория) | — | — | — |
| Видео | YouTube-URL, 30 с, реальная игра в первые 10 с, ≥ 1080p, автоплей без звука [35] | превью 15–20 с (для карточки на hover) [сверить] | — | **9:16, 1080×1920, 15–30 с, хук ≤ 2 с**, 100 % геймплей, понятно без звука | — |
| Playable | — | — | — | — | один HTML ≤ 5 МБ (Meta: HTML ≤ 2 МБ), без сети, MRAID 2.0/3.0, TikTok без MRAID, ≤ 30 с + CTA [30] |
| Проверки | `gp listing check`: длины, запрещённые слова, похожесть на другие `games/*` (R6 в analyst.md), совпадение скриншотов с текущей сборкой | размер, файлы, нет внешних ссылок | размер бандла, время до `gameReady` | длительность, соотношение сторон, нет чужой музыки | размер, нет `fetch`/XHR |

**Правила для детских листингов:** не обещать «Teacher Approved» (это решает Google). Сторонние ссылки и кросс-промо только за родительским замком. На скриншотах нет детских лиц и чужих персонажей (IP). Запрещённые слова и длины берём из `docs/store-listing.md` эталона [сверить с Metadata policy Play].

**UA для игр с низким ARPDAU [36].** CPI на Android: casual около $0.14, hyper-casual около $0.40, hybrid-casual $0.95 (почти ×2 за год). TikTok для hyper-casual на Android — $0.25–0.80. При LTV ≈ $0.2 (kids) и ≈ $0.1–0.3 (web) **платный UA не окупается**. Деньги тратим только на тест креатива (OM4): иконка и первые 2 с видео, $100–300 на игру. Рост дают органика стора (ASO, custom store listings по ключевым словам [32]), трафик порталов и собственные короткие ролики. Для детей — только реклама, которую видят родители (Families запрещает таргет на детей).

## 5. Метрики для маркетолога (без нарушения детской приватности)

Правило: **в `android-families` и kids-web в игре нет ни одного SDK аналитики.** Данные берём только агрегатами из консолей. Для `general`-web — события портала через его SDK. Всё это записывается в `release-log.yaml` (аналитик, M8/M9) и экспорт раз в неделю.

| Метрика | Источник | Kids-safe | Порог-ориентир |
|---|---|---|---|
| Показы листинга → посетители → установки (конверсия), по источникам (поиск / рекомендации) и поисковым запросам | Play Console (агрегат) | ✅ | конверсия ≥ 25–30 % [гипотеза] |
| D1 / D7 / D30, удаления | Play Console | ✅ | D1 ≥ 25 % (MVP A) |
| ARPDAU, eCPM, fill rate, показов на DAU, доля EEA Limited Ads | AdMob | ✅ | ARPDAU ≥ $0.02 |
| Запуски, **конверсия в геймплей (≥ 1 мин)**, среднее время, удержание | дашборд CrazyGames / Poki | ✅ (агрегат портала) | конверсия ≥ 80 %, время 10+ мин у топа [8] |
| Просмотр → переход/установка по роликам (IPM, CTR) | YouTube Studio / TikTok | ✅ (канал взрослого издателя) | — |
| Результат A/B-теста листинга | Play store listing experiments | ✅ | только при достаточном трафике [33] |
| **Платформенные:** время от зелёного QA до готового маркетингового набора; доля ассетов, принятых без ручной правки; отказы модерации по каналу и причине | `runs.jsonl`, `release-log.yaml` | ✅ | набор < 30 мин (PM №11); 0 отказов |

Внутриигровая воронка (время до первого тапа, доля завершённых раундов) — только в QA-прогонах (`game.events`), а не у реальных детей.

## 6. Вопросы

### Вопросы к PM
1. Можно ли поставить R1 (web-упаковка + CrazyGames Basic для Balloon Pop) **параллельно M0b**, а не после M2? Это даст первые метрики дистрибуции через 1–3 недели.
2. Включаем ли маркетинговый набор (листинг + скриншоты + видео) в критерий M1.1 «< 2 ч до пакета стора»? Сейчас «пакет стора» описан без видео.
3. Кто отвечает за каналы после релиза (ответы на отзывы, обновление листингов, повторные заявки на порталы) — человек или агент по чек-листу?
4. Метрику успеха MVP B («≥ 1000 сессий/день») меряем по CrazyGames или суммарно по всем порталам?

### Вопросы к геймдизайнеру
1. Pop Rush: раунд 45 с. Что держит игрока 10+ минут (цель порталов)? Рекорд, `daily`, разблокировки тем, серии?
2. Можно ли сделать `sort` так, чтобы одна механика давала и `general`-пазл, и детскую «разложи по банкам» (переиспользуя `jar`)?
3. Какие 3 кадра игры — «продающие» для скриншотов и первых 2 с видео? Нужен флаг в `game.yaml` (например `store.hero: reward`) или хватит сценария по умолчанию?
4. «Сочность» (ASMR): какой минимальный набор звуков и частиц на тему делает простую игру «приятной», и что из этого проверяется в QA?
5. Для `daily` у `general`: как устроить «поделиться результатом» без ссылок и без персональных данных?

### Вопросы к аналитику
1. Для CrazyGames Kids / web-kids: какие требования COPPA к SDK портала и к нашей privacy policy (R10 из вашего документа)? Можно ли в Basic Launch вообще без SDK?
2. Порог похожести листингов (M1.7) — возьмёте на себя метрику для `gp listing check` (например cosine по n-граммам ≤ X)?
3. Age Signals API (Техас действует с 05.2026): нужно ли его вызывать в Families-играх без аккаунтов и покупок, кроме `remove_ads`?
4. Какие агрегаты Play Console / AdMob / CrazyGames экспортируются по API, а какие только руками? От этого зависит, автоматизировать ли еженедельный отчёт.

### Вопросы к разработчику
1. Интерфейс `portal` (R4): уложится ли он в существующий `ads`-провайдер core, или это отдельный модуль? Можно ли, чтобы в `android-families` его не было вообще (tree-shaking)?
2. Эмодзи в web выглядят по-разному в Windows, macOS и Android. Для скриншотов и порталов нужен свой набор (Noto/Twemoji SVG-подмножество)? Какой прирост размера?
3. `gp video`: реально ли записывать ролик из headless-прогона с тем же seed (Playwright `recordVideo`) со звуком, или звук надо сводить отдельно?
4. Playgama Bridge против своих адаптеров: смотрели ли вы код? Проходит ли он для детского web (нет трекинга)?
5. Какой вес web-сборки Balloon Pop сейчас (начальная загрузка, число файлов) — мы уже укладываемся в 15 МиБ YouTube и 20 МБ мобильной главной CrazyGames?

## 7. Решения владельца

| # | Вопрос | Предложение маркетолога |
|---|---|---|
| OM1 | **Web раньше Android?** Выкладывать ли Balloon Pop / Catch a Star на CrazyGames (Kids) до релиза в Play | да: канал бесплатный и быстрый, а Play идёт своим темпом (M0b) |
| OM2 | **Эксклюзив Poki** (web на 5 лет, 50/50) или широкое размещение (CrazyGames + Яндекс + YouTube) для одной игры | по умолчанию широко. Poki — только для одной игры с лучшими метриками |
| OM3 | Яндекс Игры: юр. лицо и выплаты в РК, санкционные риски | проверить договор; канал хорош для RU/KZ-контента (O4) |
| OM4 | Бюджет на тест креативов: $100–300 на игру (CPI и CTR на TikTok/Google), чтобы проверить видео и иконку | да, но только для игры, прошедшей Basic Launch |
| OM5 | Один бренд издателя на всех каналах (имя, сайт, YouTube-канал с роликами игр) | да: у Poki свой трафик = 100 % дохода, у Play помогает доверию родителей |
| OM6 | Раскрывать ли использование AI там, где площадки спрашивают (Steam-формат, Poki по запросу) | да, честно: процесс + ручная проверка. Это снижает риск отказа по IP |

---

## Источники

1. AppMagic, Casual Games Report H1 2026 — https://appmagic.rocks/research/casual-report-H12026/?hl=en · сводка: https://mobidictum.com/casual-games-mobile-marketing-report-h1-2026/
2. Respawn: Mobile Puzzle Games $4.9B H1 2026 — https://respawn.outlookindia.com/gaming/gaming-news/top-mobile-puzzle-games-ruling-the-global-grossing-charts-in-2026
3. Sensor Tower, Gaming Market H1'26 — https://gamedevreports.substack.com/p/sensor-tower-the-gaming-market-in · https://sensortower.com/blog/h1-2026-digital-gaming-market-index
4. Sensor Tower, State of Gaming 2026 — https://gamedevreports.substack.com/p/sensor-tower-state-of-gaming-2026
5. Biggest Mobile Games of August 2026 — https://www.globalgamesforum.com/news-media/the-biggest-mobile-games-of-august-2026
6. LinkedIn Games 2026 — https://cripsywire.com/linkedin-games-2026/ · NYT Games — https://en.wikipedia.org/wiki/The_New_York_Times_Games
7. Udonis, most downloaded games 2026 — https://www.blog.udonis.co/mobile-marketing/mobile-games/most-downloaded-mobile-games
8. CrazyGames: requirements — https://docs.crazygames.com/requirements/technical/ · Basic Launch metrics — https://docs.crazygames.com/resources/basic-launch-metrics/ · гайд 2026 — https://app.cinevva.com/guides/publish-game-crazygames
9. Poki: State of Web Gaming 2026 — https://poki.com/blog/state-of-web-gaming-report-2026 · deals — https://developers.poki.com/guide/revenue-deal-types · 1 млрд запусков — https://app.dealroom.co/news/feed/poki-hits-1b-monthly-plays-as-developer-first-model-boosts-top-studio-revenues-tenfold-1
10. YouTube Playables: 50+ рынков — https://www.pocketgamer.biz/youtube-playables-expands-to-more-than-50-markets-including-the-eu-and-nordics/ · монетизация — https://developers.google.com/youtube/gaming/playables/reference/monetization · требования — https://developers.google.com/youtube/gaming/playables/certification/requirements_integration · https://playables.in/youtube-playables-requirements/ · механики — https://mediacube.io/en/blog/youtube-playables-game-mechanics
11. CrazyGames Kids (COPPA) — https://kids.crazygames.com/information-for-parents
12. GameDistribution — https://static.gamedistribution.com/terms/developer.html · https://app.cinevva.com/guides/web-game-monetization
13. Reddit Developer Funds H2 2026 — https://support.reddithelp.com/hc/en-us/articles/50860336905108-Reddit-Developer-Funds-H2-2026-Terms · Daily Games Hackathon — https://redditdailygames2026.devpost.com/ · Devvit + Phaser — https://phaser.io/news/2026/05/devvit-phaser-starter-template · DAUq Q2 2026 — https://www.cnbc.com/2026/07/30/reddit-rddt-q2-2026-earnings-report.html
14. Playgama Bridge — https://github.com/playgama/bridge · 14b. TikTok Mini Games — https://developers.tiktok.com/docs/en/mini-games-overview · https://ads.tiktok.com/business/en/blog/tiktok-growth-max-mini-games
15. Telegram Mini Apps 2026 — https://whimsygames.co/blog/exploring-telegram-mini-apps-mobile-gaming/ · https://sqmagazine.co.uk/telegram-statistics/ · Adsgram — https://adsgram.ai/monetization
16. Meta: Web Games sunset / Zero Permissions — https://ppc.land/meta-announces-web-games-sunset-by-september-2026/
17. Яндекс Игры: требования — https://yandex.com/dev/games/doc/en/concepts/requirements · итоги 2025 — https://wnhub.io/news/other/item-49945 · лицензионное соглашение (50 %) — https://yandex.ru/legal/licensegames/ru/
18. Яндекс Игры: модерация и отказы 2026 — https://wnhub.io/news/other/item-51215 · https://wnhub.io/news/other/item-52073
19. Poki: Working with AI — https://sdk.poki.com/working-with-ai.html · Quality Guidelines — https://sdk.poki.com/poki-quality-guidelines · автоплейтест — https://roboticsandautomationnews.com/2026/04/21/how-web-gaming-platforms-use-automated-playtesting-to-scale-quality-control/100793/
20. Steam AI-раскрытие 2026 — https://app.cinevva.com/news/2026-07-20-steam-ai-disclosure-study · https://www.pcgamer.com/gaming-industry/steam-week-in-review-take-cover-because-it-looks-like-more-than-half-of-steam-games-will-have-an-ai-disclosure-by-2027-2028/
21. COPPA и eCPM — https://www.gamebizconsulting.com/newsletter/admon-newsletter-11-the-shrinking-island-ad-monetization-underage-users · https://www.pixalate.com/knowledgebase/coppa-compliance-tools-faqs · правило COPPA 22.04.2026 — https://www.finnegan.com/en/insights/articles/coppas-amended-rule-is-now-in-full-effect-what-operators-need-to-know.html
22. Play Age Signals API / Texas SB 2420 — https://support.google.com/googleplay/android-developer/answer/16569691?hl=en · https://betanews.com/article/google-play-age-signals-api-global-rollout/
23. Discord Activities — https://docs.discord.com/developers/activities/overview · IAP — https://docs.discord.com/developers/monetization/implementing-iap-for-activities · https://www.strayspark.studio/blog/discord-activities-embedded-app-sdk-indie-game-distribution-2026
24. Google Play Instant закрыт — https://www.androidauthority.com/google-killing-android-instant-apps-3567211/ · 24b. Samsung Instant Plays — https://developer.samsung.com/instant-plays/overview.html
25. Amazon Appstore для Android закрыт — https://developer.amazon.com/apps-and-games/blogs/2025/02/upcoming-changes-to-amazon-appstore-for-android-devices-and-coins-program
26. Netflix cloud-first — https://www.pocketgamer.biz/netflix-unveils-new-cloud-first-direction-for-its-games-strategy/ · https://www.gamefile.news/p/netflix-closes-night-school-moonloot
27. Apple Arcade 2026 — https://www.idropnews.com/news/new-apple-arcade-games-2026/257766/ · https://9to5mac.com/2026/03/11/apple-arcades-april-lineup-adding-two-of-the-most-acclaimed-recent-indie-games/
28. Kids/edu: RevenueCat Education 2026 — https://www.revenuecat.com/state-of-subscription-apps-2026-education · отток — https://retentioncheck.com/churn-benchmarks/kids-education-apps · Lingokids — https://tracxn.com/d/companies/lingokids/__GxSIzECWO5pX-UjHemrLSuT0RTQ9U6Rx3oZoaV9iuv8 · Piknik/Sago — https://en.wikipedia.org/wiki/Sago_Mini
29. Roblox DevEx — https://www.ibtimes.co.uk/roblox-top-creators-devex-payouts-2026-1819403 · UEFN — https://www.tubefilter.com/2026/06/17/epic-games-unreal-editor-for-fortnite-creator-payouts/
30. Playable-спецификации по сетям — https://www.sett.ai/content/playable-ad-networks/ · https://docs.unity.com/en-us/grow/acquire/creatives/playable/specifications · https://segwise.ai/blog/understanding-playable-ads-guide · AppLovin SparkLabs — https://www.applovin.com/blog/ad-creative-ai-sparklabs/
31. Локализация ASO — https://appfollow.io/blog/app-store-optimization-localization · https://www.businessofapps.com/insights/the-power-of-localization-in-aso/
32. Google Play I/O 2026 (Gemini: custom store listings, перевод) — https://android-developers.googleblog.com/2026/05/io-2026-whats-new-in-google-play.html · https://play.google.com/console/about/customstorelistings/
33. Store listing experiments для маленьких приложений — https://www.apptweak.com/en/aso-blog/store-listing-experiments-a-guide-to-play-store-a-b-testing · https://play.google.com/console/about/store-listing-experiments/
34. Требования к графике Play — https://screenshototter.com/blog/google-play-screenshot-requirements · https://appradar.com/blog/android-app-screenshot-sizes-and-guidelines-for-google-play
35. Preview video Play — https://support.google.com/googleplay/android-developer/answer/9866151?hl=en · https://www.applaunchflow.com/blog/google-play-promo-video-requirements-2026
36. UA: CPI 2026 — https://foxdata.com/en/blogs/2026-mobile-game-user-acquisition-cost-benchmarks-how-much-should-you-spend/ · TikTok UA — https://gamegrowthadvisor.com/blog/2026-05-07-tiktok-ads-mobile-games-ua-playbook-2026/
