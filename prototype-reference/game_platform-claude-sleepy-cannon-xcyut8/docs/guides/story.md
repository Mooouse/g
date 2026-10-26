# Story in simple games

How much story a game needs, which shape to use, and how to build it with the story blocks in `@gp/core`
(`kit: code` games). The evidence and the design behind every rule here: [story research](../research/story-2026-09.md).

## 1. Do you need a story?

Usually a small one. Keep these facts in mind:

- **A story multiplies a core loop that already works. It never rescues a weak one.** Build and test the loop first.
- **Reading more doesn't make players stay.** In the one large player-level study (Lee et al. 2025, 10M+ players),
  players who read *less* story stayed longer and paid more.
- **What pays off:** a one-line premise, characters with a face and a voice, and the promise of the next reveal.
  Royal Match tells its story with no words at all.
- **Web 13+ (CrazyGames):** play first, story after. Text before the first action loses players. Keep scenes short,
  always skippable, and use them as a reward at a break.
- **Idle and clicker games fit story best.** Waiting leaves natural pauses, and sessions (≈ 15 min) have room for 3–6
  short chapters.
- **Kids:** ages 2–5 don't read, so the story is wordless or a voiced guide character. Ages 6–8 need every line voiced.
  No story line ever points to the shop or ads.

| Game | None | Premise | Barks | Chapters as rewards | Branching |
|---|---|---|---|---|---|
| Web 13+, action/arcade (`casual` kit, survivors-like) | ok | **default** | **default** | at most ≤ 6 short chapters, between runs | no |
| Web 13+, idle/clicker/merge (`kit: code`), ≥ 20 min of meta progression | — | yes | yes | **default** | at most cosmetic: flags colour lines, 2–3 endings |
| Web 13+, puzzle levels | ok | **default** | yes | only with a long meta | no |
| A game where choosing *is* the play (Reigns-like) | — | — | — | — | a separate mechanic: file a block request |
| Kids 2–5 | ok | **default**, wordless | voiced reactions | no | no |
| Kids 6–8 | ok | yes | **default**, voiced | at most picture chapters, ≤ 3 voiced lines | no |
| Kids 9–12 | ok | yes | **default** | at most short chapters, ≤ 2 choices | no |

The story blocks below are for `kit: code`, which is 13+ only. The `kids` and `casual` kits have no bark or dialogue
block yet: they take `depth: premise` (the title screen, covers and store text). If a kids brief needs more, write a
block request ([AGENTS.md §5](../../AGENTS.md#5-when-the-platform-cant-express-the-brief)).

### 1.1 Set the depth: `story` in game.yaml, and `gp story`

The table above is data: `STORY_FITS` in `packages/spec/src/story-depth.ts` (`gp explain story.depth` prints it). The
row comes from the audience (children), else the genre: `story.genre` when the game says it, else the kit (`casual`
is an arcade round), else the first `listing.tags` entry that names a genre (Idle, Clicker, Merge → idle; Puzzle,
Logic → puzzle; Action, Roguelike, Tower Defense → action), else the concept's words, else action.

**A game that needs no story leaves `story` out, and nothing is asked, required or warned.** Only three things speak up:
a depth outside the row (`W_STORY_DEPTH`: branching for ages 2–5, chapters in an arcade game with no meta progression,
barks in a YAML kit), a story too thin or too heavy for its depth (below), and one info hint (`I_STORY_DEPTH`) for an
idle game with no `story` at all, where a story pays off most. `story: { depth: none }` says it is a decision — also
for a game whose only words are per-item flavour text (a line under each car, upgrade or card): that is not a story.

```yaml
story:
  depth: chapters          # none | premise | barks | chapters | branching (each includes the lighter ones)
  premise: "Malgrath the Demon King just wants some peace and quiet."   # one line, ≤ 30 words; required at depth premise
  file: story.ts           # the story as data; required at chapters and branching, checked by gp validate
  voiced: false            # every line spoken: must be true for ages 2–5 and 6–8 from depth barks up (E_STORY_VOICE)
  # genre: idle            # only when the tags don't say it
```

**`gp story <game>`** (`scripts/gp.sh story` in a game repository) prints the row, the recommended depth, what the
game supports (meta progression is read from the code, comments left out: `UpgradeShop`, `mountUpgradeShop`, `Roster`,
`Tiers`, `PactTree` or `RunChoices` built or imported, or a `meta.ts` / `upgrades.ts` / `shop.ts`), and:

- with no `story` and no story file: "no story needed" (or, for an idle game, that it gains from one). It writes nothing.
- `--write` (or a declared depth whose file doesn't exist yet): forms a starting file from the concept — bark lists with the
  `Bag` and cooldown wiring as a comment (barks); a `StoryDef` with a first-action premise and 6 short chapters unlocked
  by progress, at `run-end` (chapters); plus a choice that sets a flag, a line that reads it and 2 endings (branching).
  A game with no `story` section gets one in game.yaml with a TODO premise. `--depth <depth>` picks another depth.
- it never overwrites a file without `--force`; `--out <file>` writes the file elsewhere and leaves game.yaml alone.
- then the to-do list: the same checks `gp validate` runs, on the file as it is.

**The story file** is data only: `gp validate` loads it with Node (type stripping), so it imports nothing but types
(`import type { StoryDef } from '@gp/core'`; the `Bag` goes in main.ts). Its exports are read by shape:
`STORY` (a `StoryDef`: checked in full), bark lists (any string list or map of string lists, e.g.
`BARKS = { hit: [...] }`), `CAST` / `SPEAKERS` (names, when there is no `StoryDef`). Anything else is the game's own
format: its words are counted (`W_STORY_FORMAT` says what can't be checked). A `.json` file with the same keys works too.

**What `gp validate` checks** when `story.file` is declared:

| Check | Code |
|---|---|
| The engine's checker (§4), with the audience's limits (9–12: lines ≤ 90 characters, ≤ 2 choices; 6–8 and 2–5 stricter) | `E_STORY_*`, `W_STORY_*` from `validateStory` |
| Play before story: on a fresh save no scene is due at the first run's start (a chapter without `at` plays at run-start) | `E_STORY_BEFORE_PLAY`; an `INTRO`/`PROLOGUE` export over 20 words: `W_STORY_BEFORE_PLAY` |
| Every blocking scene skippable: the game uses `mountDialogue`, or its own screen has `data-gp="dialog-skip"` | `W_STORY_SKIP` |
| Barks fit a bubble: ≤ 60 characters (≤ 10 words for ages 6–8) | `W_STORY_BARK_LONG` |
| No line points to the shop or ads: never for children; for 13+ never during play (barks, the first-action scene) | `E_STORY_SHOP`, `W_STORY_SHOP` |
| Children: every line voiced (`story.voiced: true`) | `E_STORY_VOICE` |
| Too thin: barks < 30, chapters < 6, branching without a consequence or with < 2 endings | `W_STORY_THIN` |
| Too heavy: more than the depth ("depth barks, but story.ts holds 6 chapters…: that is depth chapters"), > 12 chapters, > 2,000 words of chapters (3,200 branching), > 3 endings, > 200 barks | `W_STORY_HEAVY` |
| TODO left from `gp story` | `W_STORY_TODO` |

`gp uniqueness` counts the story a little: an own premise (+2) and a named character (+3) out of 100. A copied mechanic
stays a gate whatever the story.

## 2. Structures, from cheap to expensive

Word counts assume one writer or agent. Translation costs about $0.10–0.25 per word per language.

| Structure | What it is | Words to write | What you build | Translation |
|---|---|---|---|---|
| **Premise** | one line and one picture: who, what, why ("the pigs stole the eggs") | ≤ 30 | nothing new: title screen, covers, `concept`, store text | trivial |
| **Barks** | a character reacts to events in a bubble, ≤ 60 characters, never blocks play | 300–1,500 (50–200 barks) | a speech bubble in your code, a `Bag` so lines don't repeat, a cooldown | low: short strings |
| **Chapters as rewards** | 6–12 short scenes unlocked by progress, played between runs | 500–2,000 | a `StoryDef`, `StoryRunner`, `mountDialogue`, the story state in your save | ≈ $150–375 per language for 1.5k words |
| **Episodes** | a new chapter with each content drop or event | 300–800 per episode, ongoing | the same, plus new content per release | per episode |
| **Light branching** | flags from choices change later lines; 2–3 endings | chapters × 1.3–1.6 | the same, plus `if`, `goto` / `label`, `ending` | in proportion to words |

- **Every game gets a premise.** It costs almost nothing, and it feeds the title, covers and store text. It is also the
  cheapest way to make a game its own (AGENTS.md §2.3).
- **Barks give the most value per word.** They make the game feel alive and never take control. Read them from a no-repeat
  `Bag`, show each for about 3 s, and keep them ≥ 5 s apart. There is no bark block yet: write your own bubble.
- **Chapters work as a reward, not a gate.** Show "the next chapter unlocks when…" (`nextChapter()`), so the story
  becomes a goal.
- **Branch cosmetically.** A flag that changes one line later feels like a consequence at a fraction of the cost.
  Real structural branches double the writing and the QA, and a player sees only one path.
- **Other cheap options:** a world that changes (a room fills up, the UI grows), or collectible lore (postcards,
  journal pages) that players may read or skip. Both cost almost nothing to translate.
- **A Reigns-style card deck is a mechanic, not a scene.** The dialogue block doesn't cover it; file a mechanic
  block request.

## 3. Pacing rules

Adults read about 4 words a second (238 wpm). 120 words is about 30 s of reading.

| Rule | Limit | Checked by |
|---|---|---|
| Before the first core action | nothing, except one `first-action` scene of ≤ 20 words | `validateStory`: `E_STORY_FIRST_ACTION` |
| The first chapter (longest path) | ≤ 60 words | `E_STORY_FIRST_SCENE` |
| A line | warning > 100 characters, error > 140 | `W_STORY_LINE_LONG`, `E_STORY_LINE_LONG` |
| A scene (longest path) | warning > 120 words, error > 200, unless the scene says why with `long: "<reason>"` | `W_STORY_SCENE_LONG`, `E_STORY_SCENE_LONG` |
| Choices | 1–3 per point, each ≤ 40 characters | `E_STORY_CHOICES`, `W_STORY_CHOICE_LONG` |
| Narrator | no 3 narrator lines in a row: let a character say it | `W_STORY_NARRATOR_WALL` |
| Skip | always there | `mountDialogue` (it can't be turned off) |
| When scenes play | at a break: after a run, at the next run's start, on a game event. Never in the middle of the action | you (`dueScene` only at your safe points) |
| During a run | barks only, never a blocking scene | you |
| Chapter spacing | the first chapter within 3 min of play; chapters ≥ 1 min apart; the finale within 60 min | you: measure it with your balance bot |

The numbers are `STORY_LIMITS` (web, 13+). Pass stricter ones as the second argument to `validateStory` if your game
needs them. They are starting values: the story's skip and finish events will tell us whether to tighten them.

**A scene between runs is not gameplay.** Call `host.gameplay(false)` before it. Barks during a run are gameplay.

**Kids** (when a kids kit gets story): every line voiced, text optional for ages 2–5, ≤ 10 words per line and a
picture on each choice for ages 6–8, no timers or pressure in a scene, and no line or effect that leads to a purchase
or an ad.

## 4. Using the blocks

`@gp/core` has a pure story engine (`story.ts`, no DOM: usable in the game, tests and bots) and a dialogue screen
(`mountDialogue`).

| Export | What it does |
|---|---|
| `StoryDef` | the story as data: `cast`, `moods`, `vars` (`story` with defaults, `game` names), `rewards`, `events`, `cues`, `chapters`, `scenes` |
| `loadStory(def)` | loads it for playing; throws if it can't run (a condition that doesn't parse, a `goto` to nowhere) |
| `storyState(story, saved?)` | a fresh state, or a saved one cleaned up (unknown scenes and vars dropped, wrong types reset) |
| `dueScene(story, state, moment, progress)` | the scene to play now, or `null`: the next chapter if its `when` holds, else the highest-`priority` side scene |
| `new StoryRunner(story, sceneId, state, progress)` | plays one scene on a copy of the state: `line`, `choices()`, `next()`, `choose(id)`, `skip()`, `done`, `result` |
| `commitScene(story, state, result)` | returns the new state for a **finished** scene (seen, choices, vars). An unfinished or already committed result changes nothing |
| `nextChapter(story, state)`, `storyProgress(story, state)` | the next unseen chapter (for "unlocks when…"), chapters seen as 0–100 |
| `validateStory(def, limits?)` | every problem as `{ code, severity, path, message, fix }`; run it in your unit test |
| `STORY_LIMITS`, `NARRATOR` | the numbers in §3; the built-in narrator's speaker id |

**Lines** are strings in the form `'speaker/mood: text'`, `'speaker: text'` (mood `neutral`), or plain text for the
narrator. When a line needs more, use an object: `{ who, mood, text, if, do, cue, choose, goto, label, ending, id }`.
Text that contains `: ` right after a word needs the object form, or that word is read as a speaker.

**Conditions** (`when` on a scene, `if` on a line or choice) are parsed, never `eval`ed: names of story or game vars,
numbers, `true` / `false`, `not`, `and`, `or`, `( )`, `== != < <= > >=`, `seen(scene)`, `chose(scene.choiceId)`.
They are checked when the line is reached, so a choice made earlier in the same scene counts.

**Effects** (`do` on a line or choice): `set: 'flag'`, `clear: 'flag'`, `add: { trust: 1 }` change story vars.
`give: { gold: 20 }` and `fire: 'unlock-golems'` go to your game after the commit: names must be listed in `rewards` /
`events`.

**Moments** (`at`): `first-action`, `run-start`, `run-end`, `event:<name>`. Chapters default to `run-start`; a scene with no
`at` that isn't a chapter plays only when your code runs it. Side scenes play once unless `once: false`.

### The story: `games/<id>/story.ts`

Keep it as data only, one exported object, so it can be checked, counted and later translated.

```ts
import type { StoryDef } from '@gp/core';

export const STORY: StoryDef = {
  cast: {
    pip: { name: 'Pip', color: '#e0a526' },
    vex: { name: 'Master Vex', color: '#7b44b8' },
  },
  moods: ['neutral', 'smug', 'surprised', 'angry'],
  vars: { story: { polite: false }, game: ['day'] }, // game vars: your code passes them in at each check
  rewards: ['gold'],
  chapters: ['arrival', 'rival'],
  scenes: {
    arrival: {
      title: 'The Bubbling Kettle',
      at: 'run-end', // after the first run: play first, story after (38 words on its longest path)
      lines: [
        'The shop door creaks. Something on the counter opens one eye.',
        "pip/smug: You're late. Wren said Tuesday.",
        {
          who: 'pip',
          text: "I'm Pip. I came with the shop.",
          choose: [
            { id: 'shock', text: 'A talking cat?!', then: ['pip/smug: A talking cat who knows where the gold is.'] },
            {
              id: 'polite',
              text: 'Nice to meet you, Pip.',
              do: { set: 'polite', give: { gold: 20 } },
              then: ['pip/surprised: Manners. Here, twenty gold for the till.'],
            },
          ],
        },
        'pip: Same time tomorrow. Brew faster.',
      ],
    },
    rival: {
      title: 'The Soup Man',
      at: 'run-end',
      when: 'day >= 3',
      lines: [
        'vex/angry: So the new owner finally shows up.',
        { who: 'pip', text: 'At least our owner says hello.', if: 'polite' },
        { who: 'pip', text: 'Ignore him. He sells soup.', if: 'not polite' },
        'vex: The Moonfair is in ten days. Bring your best brew.',
      ],
    },
  },
};
```

### Wiring it: `main.ts`

```ts
import { commitScene, dueScene, loadStory, mountDialogue, NARRATOR, storyState, StoryRunner, type GameContext, type Moment } from '@gp/core';
import { STORY } from './story';

export default function start({ host, ui }: GameContext): void {
  const story = loadStory(STORY);
  const save = host.load({ gold: 0, day: 1, story: {} as unknown });
  let state = storyState(story, save.story); // the saved story, cleaned up

  let run: StoryRunner | null = null;
  let resume: (() => void) | null = null;

  const dialog = mountDialogue(ui, {
    minTouchPx: host.minTouchPx,
    onNext: () => { run?.next(); show(); },
    onChoose: (id) => { run?.choose(id); show(); },
    onSkip: () => { run?.skip(); show(); }, // to the next choice point or the end
  });

  function show(): void {
    if (!run) return;
    const line = run.line;
    if (!line) return finish();
    const c = STORY.cast[line.who];
    const speaker = line.who === NARRATOR ? null : { id: line.who, name: c.name, color: c.color };
    dialog.show({ speaker, mood: line.mood, text: line.text, choices: run.choices() });
  }

  function finish(): void {
    dialog.hide();
    const result = run!.result;
    run = null;
    const next = commitScene(story, state, result); // only a finished scene, only once
    if (next !== state) {
      state = next;
      save.gold += result.give.gold ?? 0; // hand out rewards and fire events after the commit
      save.story = state;
      host.save(save);
    }
    resume?.();
  }

  /** Plays the scene due at this moment, if there is one */
  function tell(moment: Moment): Promise<void> {
    const id = dueScene(story, state, moment, { day: save.day });
    if (!id) return Promise.resolve();
    return new Promise((resolve) => {
      resume = resolve;
      run = new StoryRunner(story, id, state, { day: save.day });
      show();
    });
  }

  /** Your run-over handler (after host.roundEnd) */
  async function runOver(): Promise<void> {
    host.gameplay(false); // a scene between runs is not gameplay
    save.day += 1;
    host.save(save);
    await tell('run-end');
    // …then your results screen
  }

  // Leaving mid-scene (menu, QA's end()): drop the runner, don't commit. The scene replays later and pays once.
  // if (run) { run = null; dialog.hide(); }
}
```

- The story state lives inside your own save and is written with your `host.save()`. It is well under 2 KB.
- Never save at the start of a run (QA's "a reload keeps the save unchanged" check fails).

### Checking it: `games/<id>/story.test.ts`

```ts
import { describe, expect, it } from 'vitest';
import { commitScene, loadStory, StoryRunner, storyState, validateStory } from '@gp/core';
import { STORY } from './story';

describe('story', () => {
  it('has no errors, and no warnings we did not accept', () => {
    const issues = validateStory(STORY);
    expect(issues.filter((i) => i.severity === 'error')).toEqual([]);
    expect(issues.map((i) => i.code)).toEqual([]); // or the warnings you explain in REPORT.md
  });

  it('remembers a polite answer', () => {
    const story = loadStory(STORY);
    const run = new StoryRunner(story, 'arrival', storyState(story), { day: 1 });
    run.skip(); // to the choice
    run.choose('polite');
    run.skip(); // to the end
    const state = commitScene(story, storyState(story), run.result);
    expect(run.result.give).toEqual({ gold: 20 });

    const next = new StoryRunner(story, 'rival', state, { day: 3 });
    next.next();
    expect(next.line?.text).toBe('At least our owner says hello.');
  });
});
```

`validateStory` walks every path of every scene: story flags are followed through, and game vars are treated as
unknown, so both outcomes are checked. It finds unknown speakers and moods, bad references, dead ends, lines no path
reaches, choices with no effect, and the length limits in §3. Each issue has a `fix` line.

## 5. Rules you keep yourself, and QA

- **Scene ids and choice ids never change after a release.** They are save data, like `saveKey`: `storyState()` drops
  unknown ids, so a renamed chapter plays again and a renamed choice is forgotten. Fix a typo in the text, never in the id.
- **Line ids** default to `<scene>.<n>` and move when you insert lines. Set `id:` on a line that must keep its id
  (for translations).
- **The story in every language.** `gp story --strings` writes the story file's lines, choices and barks into
  strings/en.yaml as `story.<line id>`, `story.<line id>.<choice id>` and `bark.<event>.<n>` keys (it replaces the old
  ones each run); `gp translate --write` then lists them for the other languages like any text. Show them through the
  host: `new StoryRunner(story, scene, state, progress, { i18n: host.i18n })` (lines and choices) and
  `barkText(host.i18n, event, i, BARKS[event][i])`; a key strings/en.yaml lacks stays the file's English. `gp validate`
  keeps the two in step (W_STORY_STRINGS) and tells a story that is still English only in a game of several languages
  (I_STORY_STRINGS) — Swarm Smash kept a hand-made copy in strings and a test to keep them equal.
- **Call `dueScene` only at your safe points:** after the first core action, at a run's start or end, or on an event.
  Never mid-action.
- **Nothing before the first action** except a `first-action` scene of ≤ 20 words. The tutorial goes into barks while
  the player plays.
- **Give rewards and fire events only after `commitScene`**, and only when it returned a new state.
- **Every choice does something:** a reply (`then`), an effect (`do`), or both.
- **13+ only in code games:** no story line pushes the shop or an ad during play. A "the shop has new stock" line on the
  results screen is fine.

QA conventions:

| Hook | Where | Set by |
|---|---|---|
| `data-gp="dialog"` | the dialogue sheet | `mountDialogue` |
| `data-gp="dialog-next"` | Next | `mountDialogue` |
| `data-gp="dialog-skip"` | Skip | `mountDialogue` |
| `data-gp="dialog-choice"` | each choice button | `mountDialogue` |

- If you draw your own dialogue screen, put the same attributes on it, or QA can't find it.
- `gp qa` checks, whenever a dialogue is open, that Skip is there and that every button is ≥ `minTouchPx` and on
  screen.
- Your unit test runs `validateStory` (above); `gp validate` runs it too once `story.file` is declared (§1.1).
- Open your longest line at 360×800 (a phone in portrait) with `gp dev` and check that it fits in the sheet.

## 6. What Brew & Banter taught

Brew & Banter (QmaCyber/game5) is a clicker with 12 chapters, 12 characters, choices and flags, and its own dialogue
engine. The story blocks come from it ([research §3.9](../research/story-2026-09.md#39-brew--banter-review-what-to-keep-what-to-fix)).

- **Chapter 1 blocked the first tap for about 30 s** (≈ 110 words plus a title card), and `gp qa` passed because the
  game called `gameplay(true)` before the dialogue. The better shape: one ≤ 20-word line, play at once, the tutorial
  as barks, and the rest of the chapter at the end of day 1 as the first reward.
- **An interrupted chapter could pay its reward twice** (its review's bug #2). That is why a runner works on a copy and
  `commitScene` writes only a finished scene, once.
- **It had no Skip**, only a tap per line. Skip is now always there and goes to the next choice, because the choices
  belong to the player.
- **Story text in code with single-flag `if` / `unless`** couldn't be counted, checked or translated. The finale also
  copied lines to change one speaker. The condition language and `goto` / `label` fix both.
- **What worked, keep it:** ≈ 7 min of reading in ≈ 30 min of play, chapters 2–6 min apart; flags that colour later
  lines instead of real branches; and "earn 12,000 more gold to unlock the next chapter", which turns the story into a goal.
