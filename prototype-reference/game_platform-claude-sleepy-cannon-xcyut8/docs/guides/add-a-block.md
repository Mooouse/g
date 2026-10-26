# Adding a building block

Only when a real game needs it (the principle: the platform grows from games). The block's definition of done
is in [definition-of-done.md](definition-of-done.md).

## Where things go

| Kind | Catalog entry (pure data) | Code | Registered in |
|---|---|---|---|
| Mechanic | `packages/blocks/src/mechanics/<id>.meta.ts` (config type, defaults, schema, example) | `…/mechanics/<id>.ts` (a `Scene` with `id = 'round'`) | `index.meta.ts` + `packages/spec/src/catalog.ts` + the kit's flow |
| Trajectory | `packages/blocks/src/trajectories/<id>.meta.ts` | `…/trajectories/<id>.ts` (`Trajectory`) | `index.meta.ts`, the mechanic's schema |
| Theme | `packages/blocks/src/themes/<id>.meta.ts` (palette, background, card colors) | `…/themes/<id>.ts` (`Theme`) | `THEMES` in `blocks/src/index.ts`, `THEME_METAS` |
| Content pack | `packages/blocks/src/content/packs.ts` (data only) | — | `CONTENT_PACKS` / `STICKER_PACKS` |
| Kit | `packages/kit-<id>/src/index.meta.ts` (sections, schema, config type) | scenes + a `Flow` | `spec/src/catalog.ts`, `player/src/boot.ts`, `qa` suites |
| Profile rule | `packages/spec/src/profiles.ts` (data) + `resolve.ts` (check) | — | an error code in `errors.ts` + a test |

## Rules

- `*.meta.ts` files are **pure data** (Node reads them): only erasable TypeScript, imports with `.ts`, no DOM.
- Runtime code gets everything through its constructor (app, theme, config) — no globals, no reading `game.yaml`.
- All randomness through `rng` (seeded runs), all drawing of the target through the theme.
- Report what happens through `app.events` (QA depends on events, never on class names).
- New validator codes: an `ERRORS` entry (title, why, fix) and a test — `validate.test.ts` fails otherwise.
- Run `npm run check` (types, tests, all games valid, docs up to date) and `gp qa` on the reference game.
