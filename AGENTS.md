# Правила работы с графикой этого проекта

Перед созданием или изменением любых игровых предметов прочитай [ART_ASSET_RULES.md](./ART_ASSET_RULES.md). Этот файл фиксирует замечания пользователя, правила размеров **по клеткам**, принятые и непринятые элементы, а также журнал ошибок.

**Критическое: для каждого типа инструмента своя собственная нумерация уровней, с 1.** Оранжевые клавишные — уровень 1 клавишных; фиолетовые — уровень 2 клавишных; деревянная укулеле — уровень 1 укулеле. Никогда не присваивать уровень по порядковому номеру картинки. Пользователь утверждает каждый спрайт отдельно, команда «далее» разрешает перейти к следующему. Не интегрировать неутверждённый спрайт в игру, не заменять укулеле электрогитарой, не деформировать предмет ради квадратной клетки; 1×1 — квадратный холст, но форма предмета остаётся естественной. Новый рисунок всегда должен соответствовать конкретному объекту, рангу, ракурсу и уровню детализации.

**ОБЯЗАТЕЛЬНО, БЕЗ НАПОМИНАНИЙ:** до каждой отрисовки прочитай журнал. После каждого сгенерированного результата и до отправки самостоятельно проверь картинку по чек-листу. Если увидел неверный инструмент, количество частей, ракурс, пропорции, фон, детализацию или повтор ранее отклонённого результата — не отправляй как правильный. Немедленно добавь новую конкретную запись в журнал ошибок ART_ASSET_RULES.md и закоммить в GitHub в рамках текущей работы, затем измени способ исправления. После замечаний пользователя так же сам записывай ошибку без просьбы. После команды «далее» фиксируй принятие варианта. Нельзя рассчитывать, что пользователь напомнит о журнале. Не заявляй о завершении или одобрении без подтверждения пользователя.

**Актуальный статус ударных:** полная глянцевая установка **уровня 2, 2×2** одобрена; компактная установка **уровня 1, 1×1** теперь одобрена после команды «далее». У неё ровно 1 бас-барабан, 1 малый том и 1 золотая тарелка. Три почти одинаковые предыдущие попытки для уровня 1 отклонены. Не объявлять произвольно новую линейку/уровень.

**ОБЯЗАТЕЛЬНАЯ ПОДПИСЬ К КАЖДОЙ КАРТИНКЕ:** перед ней указывай тип инструмента, его собственный уровень, размер Ш×В в клетках и статус согласования. Если параметры предложены, а не утверждены, явно это отмечай. Красная электрогитара уровня 1 (1×2) и синяя электрогитара уровня 2 (1×2, с другой формой корпуса) визуально приняты; обе ударные установки и клавишные также приняты. Все выявленные ошибки записывай самостоятельно в ART_ASSET_RULES.md.

## Изучение PixelLab и новый экспериментальный стиль

Перед любыми новыми запросами на **пиксельную графику** обязательно читать [PIXEL_ART_STYLE_GUIDE.md](./PIXEL_ART_STYLE_GUIDE.md). Он основан на открытой документации PixelLab и фиксирует правила настоящего нативного pixel art: небольшая согласованная сетка, ограниченная палитра, кластеры оттенков, читаемый силуэт, контроль каждой клетки и ближайший сосед при увеличении. Это исследование НЕ означает обучение весов модели на данных PixelLab или использование её API. **Не подменять существующие семь утверждённых непиксельных изображений без прямого решения пользователя.** Экспериментальные пиксельные спрайты согласовываются отдельно, каждый один за раз, с названием, уровнем и размером клетки. Выявленные ошибки заносить самостоятельно в ART_ASSET_RULES.md.

## Последнее решение пользователя — сразу добавлять без предварительных показов

**Приоритет:** пользователь попросил создавать отдельные изображения для каждого игрового элемента и **не показывать их в чате перед добавлением** («не мне не показывай сразу добавляй»). Для текущей пиксельной переработки это заменяет старый режим «один рисунок — показать — ждать одобрения». Генерировать каждую картинку как отдельный PNG, сверять стиль и размеры, коммитить в `assets/pixel/` и сразу подключать к игре. Рабочий генератор: `tools/paint_assets.py`; сборка: `.github/workflows/build-pixel-assets.yml`. Перед финальным ответом проверять QA и GitHub Pages. Не удалять старые согласованные изображения из `assets/approved/`. Продолжать самостоятельно вести журнал ошибок.

## NEWEST INSTRUCTIONS: PixelLab 40-generation production (28 Oct 2026)

These instructions **supersede** the older section saying "do not show images in chat". The user now wants **each separate graphic generated, shown in the chat, saved, and only after full set approval integrated into the game**. PixelLab is the desired generator; the user supplied an API token in chat. **Never copy or quote that token, never commit it to GitHub, and never pass it as an Actions workflow input.** Store it only as the GitHub Actions secret named `PIXELLAB_API_KEY`, which requires the repository owner's action. This environment does not support authenticated third-party PixelLab POST calls directly.

Follow `PIXELLAB_SETUP.md` and `tools/pixellab_plan.py`:
- **40 total generation limit**: 36 designed art assets (24 distinct instrument models, 12 UI/board/FX), four attempts reserved.
- **One-image pilot first**. Do not run 36 blind. Use PixelLab API v2 `create-image-pixen`, not the old Python rectangle drawing program.
- The generator journals all requests and saves PNGs on separate `generated/pixellab-v1` branch. Don't activate, replace art, publish, or delete existing sprites automatically.
- Once the pilot and rest are generated, use each sprite's individual saved path to present images to the user in chat, record comments and polish any failed ones with the reserved attempts.
- On approval, integrate the complete generated set using `tools/activate_pixellab.py`, verify 24 playable tiers and 12 UI sprites, use a pull request from the staging branch, and confirm GitHub Pages deployment success.
- Family levels are 1–6 for each: keyboards, ukuleles, drums, electric guitars; structural changes with progression, no mere recolors.
- Do not claim work complete, quotas consumed, API access granted, or 24 new tiers live until the relevant Actions and integration actually succeed.

