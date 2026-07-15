# LEVEL 16: The Shadow Vault 🗝️

A birthday RPG adventure, built phone-first. 8 stages, 8 monsters, each a two-part
challenge — ending at the Birthday Vault.

## Play

Open `index.html` in any browser, or serve the folder statically:

```sh
python3 -m http.server 8000
```

Works fully offline after loading. Progress auto-saves in the browser (localStorage).

## The two-part stage flow

Every stage is dialogue → **Part 1** (traversal) → **Part 2** (confrontation), and the
type of each part varies stage to stage instead of repeating the same minigame:

- **Part 1** — `runner` (auto-run, tap to jump), `rhythm` (tap in time with a lit rune),
  or `dodge` (tap to dodge an incoming hazard).
- **Part 2** — `combat` (the 4-button real-time fight), `duel` (tap a sweeping bar's lit
  zone), or `mash` (tap-race a power meter against the boss's).

Every one of these (except `combat`, which keeps its own 4-button row) shares a single
interaction: tap the one big button at the right moment. No swipes, no hold-to-steer —
deliberately, for reliability on a touchscreen.

## Customize

Everything you'd want to change is in [`js/config.js`](js/config.js):

- **`realTreasureMessage`** — the final hint pointing at where the real-world gift is hidden. ★ Edit this before gifting. ★
- `vaultRewards` — the birthday chests revealed inside the Vault
- `heroName` — name used in dialogue and credits

Monsters, dialogue, and each stage's Part 1/Part 2 config all live in
[`js/data.js`](js/data.js) — pure data, no engine code.

## Structure

| File | Purpose |
|---|---|
| `js/config.js` | Birthday customization |
| `js/data.js` | All 8 stages: monsters, dialogue, Part 1/Part 2 configs, relics |
| `js/save.js` | Game state shape + localStorage persistence |
| `js/hud.js` | DOM helper, screen switching, stat bars, toasts, achievements |
| `js/audio.js` | Synthesized chiptune SFX + music (no audio files) |
| `js/platformer.js` | Runner (Part 1): auto-run + tap-to-jump engine |
| `js/timedtap.js` | Rhythm/Dodge/Duel (tap-a-window) + Mash (tap-race) engines |
| `js/combat.js` | Real-time battle engine (Part 2 `combat`) |
| `js/vault.js` | Birthday Vault ending: door, chests, finale, credits |
| `js/game.js` | Boot sequence, overworld, stage flow orchestration |
| `css/style.css` | Pixel-fantasy styling |
