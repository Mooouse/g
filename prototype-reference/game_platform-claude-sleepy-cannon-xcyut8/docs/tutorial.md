# Tutorial: your first game in 15 minutes

We make **Fruit Pop**: toddlers pop balloons with fruit and numbers, collect fruit stickers.
The finished file is [docs/examples/fruit-pop.game.yaml](examples/fruit-pop.game.yaml) (CI validates it).

## 1. Create the game from Balloon Pop (the kids-kit example)

```sh
npm install                 # once
npm run gp -- new fruit-pop --from balloon-pop --title "Fruit Pop"
```

`gp new` copies `docs/examples/kids/game.yaml` (Balloon Pop, the kids kit's example) to `games/fruit-pop/game.yaml` with a new `id`, `appId`,
save key and privacy policy URL. Everything else is still Balloon Pop — now make it your own game.

## 2. Make it its own game

Open `games/fruit-pop/game.yaml`. Your editor autocompletes fields if it has a YAML extension
(the first line points it to the schema).

1. Replace `modes` with two modes: a `fruit` mode with inline items, and `numbers` from a pack.
   `show`, `pop` and `say` are inferred: the fruit items have `emoji` and `word`, so the emoji is drawn and popped, and the word is spoken.
   ```yaml
   modes:
     - id: fruit
       items:
         - { emoji: "🍎", word: apple }
         - { emoji: "🍌", word: banana }
         - { emoji: "🍇", word: grapes }
     - id: numbers
       content: numbers-1-10-en
   ```
2. A shorter, slower round for toddlers:
   ```yaml
   round:
     mechanic: tap-collect
     goal: 12
     maxOnScreen: 5
     trajectory: { type: rise, time: [6, 8.5] }
   ```
3. Own rewards:
   ```yaml
   rewards:
     stickers: ["🍎", "🍌", "🍇", "🍓", "🍊", "🍐", "🍉", "🍒", "🍍", "🥝", "🥥", "🍋"]
     praise: ["Yummy!", "Well done!", "Super!"]
   ```
4. Remove the `saveKey` line if it's still there, and remove the `card` previews you no longer need. Without them each card shows its first three items.

## 3. Validate

```sh
npm run gp -- validate fruit-pop
```

Every issue says where, what, and how to fix it. For example, a typo `menue:` gives:

```
games/fruit-pop/game.yaml:31  error E_UNKNOWN_FIELD  menue: unknown field "menue"
    fix: Did you mean "menu"?
```

and a round with `target: { min: 20 }` for toddlers gives `E_TARGET_TOO_SMALL` with the minimum for the audience.
`gp explain <CODE>` explains any code. Repeat until `✓ fruit-pop: 0 error(s)`.

## 4. Play it

```sh
npm run gp -- dev fruit-pop
```

Open the printed URL (a phone-sized window is best). Ads are a grey test stub, "Remove ads" is a stub dialog.
The parent gate is behind the small lock in the corner. Edit `game.yaml` — the page reloads.

## 5. QA

```sh
npm run gp -- qa fruit-pop
```

This runs the kids kit's checks on three screen sizes:
- layout and touch sizes, every mode's round;
- multitouch, rotation;
- the ad rules, the purchase, the parent gate;
- saves, performance, console errors.

Read `games/fruit-pop/qa/report.md` and look at the screenshots next to it.

## 6. Build

```sh
npm run gp -- build fruit-pop          # web build in games/fruit-pop/dist
```

Publishing to Google Play: [guides/publishing.md](guides/publishing.md).

## What next

- All fields: [reference/game-yaml.md](reference/game-yaml.md) · building blocks: `gp catalog`.
- What makes a simple game good: [guides/game-design.md](guides/game-design.md).
- When is it done: [guides/definition-of-done.md](guides/definition-of-done.md).
