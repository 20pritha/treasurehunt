# LEVEL 16: The Shadow Vault 🗝️

A birthday RPG puzzle adventure. 16 stages, 16 monsters, 16 puzzles — ending at the Birthday Vault.

## Play

Open `index.html` in any browser, or serve the folder statically:

```sh
python3 -m http.server 8000
```

Works fully offline after loading. Progress auto-saves in the browser (localStorage).

## Customize

Everything you'd want to change is in [`js/config.js`](js/config.js):

- **`realTreasureMessage`** — the final hint pointing at where the real-world gift is hidden. ★ Edit this before gifting. ★
- `vaultRewards` — the birthday chests revealed inside the Vault
- `heroName` — name used in dialogue and credits
- `finalPassword` — the Stage 16 password (15 letters, one per relic rune; keep `glyph` fields in `js/data.js` in sync)

Puzzles, monsters, and dialogue all live in [`js/data.js`](js/data.js) — pure data, no engine code.

## Structure

| File | Purpose |
|---|---|
| `js/config.js` | Birthday customization |
| `js/data.js` | All 16 stages: monsters, dialogue, puzzles, relics |
| `js/puzzles.js` | One renderer per puzzle type |
| `js/game.js` | Engine: screens, saving, HUD, battle, vault |
| `js/audio.js` | Synthesized chiptune SFX + music (no audio files) |
| `css/style.css` | Pixel-fantasy styling |

## Spoilers (for the gift-giver)

<details>
<summary>Answers</summary>

The final password is **OPENTHEVAULTNOW** — each relic's rune, in the order won.
Stage 15's answer is **16** (Dragon Scale IV × Soul Gem V − Bone Key IV = 4×5−4).

</details>
