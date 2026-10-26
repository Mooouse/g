# Naming a game

A portal title is read before the game is seen: in the search box, on the tag pages and under a 200 px thumbnail.
On the first Basic Launch day **Spin Brawl had 135 plays** — "Brawl" points at a genre players already love (Brawl Stars) —
while Dread Throne, Starsilk and Nimbus Drift had 14–20 (the CrazyGames dev portal, 2026-10-02). Cover click-through was
0.6–1.2% for all of them: the title and the cover are one decision.

## The rule

**One hook + one word of its own, 2–3 words, ≤ 24 characters.**

- **A hook** is a common word the genre's hit games made famous: *brawl, clash, royale, smash* (action, arena), *defense,
  tower, rush, kingdom* (strategy), *idle, tycoon, merge, clicker, craft* (idle), *blast, block, sort, escape* (puzzle),
  *drift, moto, dash, run* (driving, hypercasual), *.io* (io). It tells the player in one word what they will do.
  The list with what each word evokes: `HOOK_WORDS` in `packages/spec/src/naming.ts`; `gp name` prints the genre's.
- **The hit's name is never a hook.** "Brawl" is a word; "Brawl Stars" is Supercell's (E_TITLE_GENERIC keeps the
  protected names). The same for *Clash of Clans, Candy Crush, Geometry Dash, Subway Surfers, Vampire Survivors*.
- **A word of its own** says what is special: the hero, the place, the twist — *Spin*, *Gnome*, *Throne*. A hook alone is
  a category ("Tower Defense"), not a name.
- **The hook must be of the game's genre.** "Drift" on a puzzle promises a racer; players who click for a racer leave in
  a minute (Nimbus Drift: 2:01 average play).
- **A sub-genre has its own hooks.** `money.genre: deckbuilder` (benchmarked as strategy) is offered *deck, deckbuilder,
  card, dungeon, rogue, spire, hand, draft* first — not *defense* and *tower* (Velvet Domino Rogue's W_TITLE_HOOK pushed a
  card roguelike toward tower-defense words); its keep-the-name subtitles are "Deckbuilder" and "Card Roguelike". Name the
  sub-genre in `money.genre` (or `gp name --genre deckbuilder`).
- **No one-word coined compounds.** *Starsilk, Echoflies, Splicebound, Kettlebot* read as nothing in a thumbnail and
  nobody searches them. Split the idea into two real words and add a hook.
- **Short.** A thumbnail shows ≈ 16–24 characters at a readable size; the CrazyGames form allows 35.
- **Search it.** `site:crazygames.com "<title>"`: a live game with the same or a near name is a no (and `taken.ts` knows
  the crowded patterns — "X Survivors", "X.io" next to twenty others).

## The tool

```
npm run gp -- name <game>                          # the game's title, genre and own words (title + concept.pitch)
npm run gp -- name --title "Spin Brawl" --genre io  # any title
npm run gp -- name <game> --words "throne,dread"    # suggest from these words
```

It prints a score out of 100 (hook of the genre 40 · own word 25 · length 15 · 2–3 words 10 · not a coined word 10),
what costs points, the genre's hooks, **keep-the-name options** for a game already on the portal ("Dread Throne: Tower
Defense" — the players who know it still find it, the newcomers see the genre), and new titles from its own words.
`gp validate` warns on a portal game whose title has no hook of its genre (W_TITLE_HOOK) — a warning, never an error.

## Our titles (2026-10-02)

| Title | Genre | Score | What it lacks |
|---|---|---|---|
| Spin Brawl | io | 100 | — |
| Yeet the Gnome | idle | 88 | — |
| Nimbus Drift | puzzle | 70 | "drift" is a driving word: it promises a racer |
| Dread Throne | strategy | 60 | no hook → "Dread Throne: Tower Defense" (84) |
| Hang the Moon, Candle Crypt, Germ Bait, Almus Gate, Brew & Banter | — | 60 | no hook |
| Starsilk, Echoflies, Kettlebot, Splicebound | — | 40 | one coined word, no hook |

A game already live keeps its name: a new name loses the players and the likes it has. Add a subtitle only if the
portal allows a title change on update; a remake (a rejected game made anew) takes a new title by this rule.
