# LEVEL 16: The Shadow Vault 🗝️

A birthday puzzle-adventure — the First Descent. 8 trials, 8 guardians, each a real
logic puzzle with a relic reward, ending at the Birthday Vault.

## Play

Open `index.html` in any browser, or serve the folder statically:

```sh
python3 -m http.server 8000
```

Works fully offline after loading. Progress auto-saves in the browser (localStorage).

## The trial flow

Every trial is dialogue → **puzzle** → **relic**. No combat, no reflexes — pure
trial-and-error logic, no hints. Get it wrong and you lose a heart (3 per trial); lose
all three and the whole trial resets, dialogue and all. Several trials require recalling
a clue from an *earlier* relic (its description states the clue in plain prose — the
👜 inventory is the only place to check).

Five puzzle engines, reused across the 8 trials by interaction shape:

- **choice** — tap one (or several) of N options, judged immediately (a Latin-square
  tablet, a knights-and-knaves chest pick, a star-pair select).
- **statecycle** — tap a tile to cycle its state and propagate to its neighbors, then
  submit (four linked gears, all must end clockwise).
- **sequence** — tap items into ordered slots, checked once full (alphabetize books,
  decode a bell sequence into a word).
- **mirror** — a real reflection-tracing beam puzzle; rotate mirrors, watch the beam
  update live.
- **maze** — tap-to-move grid navigation with clue-gated junctions, combining every
  earlier relic's clue.

Every level also carries a small visual/audio theme (accent color, particle tint and
density, ambient music mood) applied live as you enter it — see `theme` in
[`js/data.js`](js/data.js).

## Customize

Everything you'd want to change is in [`js/config.js`](js/config.js):

- **`realTreasureMessage`** — the final hint pointing at where the real-world gift is hidden. ★ Edit this before gifting. ★
- `vaultRewards` — the birthday chests revealed inside the Vault
- `heroName` — name used in dialogue and credits

Monsters, dialogue, each trial's puzzle config, relic (with its `clue`), and visual
theme all live in [`js/data.js`](js/data.js) — pure data, no engine code.

## Structure

| File | Purpose |
|---|---|
| `js/config.js` | Birthday customization |
| `js/data.js` | All 8 trials: monsters, dialogue, puzzle configs, relics + clues, themes |
| `js/save.js` | Game state shape + localStorage persistence |
| `js/hud.js` | DOM helper, screen switching, toasts, achievements, XP/level-up |
| `js/audio.js` | Synthesized chiptune SFX + music (no audio files) |
| `js/puzzles.js` | The five puzzle engines: ChoiceGrid, StateCycle, SequenceInput, MirrorBeam, Maze |
| `js/vault.js` | Birthday Vault ending: door, chests, finale, credits |
| `js/game.js` | Boot sequence, overworld, trial flow orchestration, hearts, per-level atmosphere |
| `css/style.css` | Pixel-fantasy styling |
