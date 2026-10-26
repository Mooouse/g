# CLAUDE.md

Making a game: follow @AGENTS.md exactly.

Working on the platform itself (packages/): read docs/guides/add-a-block.md and docs/platform-architecture.md;
run `npm run check` before every commit, and after any change to runtime, blocks or kits a full `gp qa` of the code-game
examples — the kind of game we ship: `npm run gp -- qa docs/examples/code/game.yaml` and `npm run gp -- qa docs/examples/art/game.yaml`.
(The kids kit is covered by `npm run check`; Balloon Pop is not a reference for our games — the owner, 2026-10-02.)
