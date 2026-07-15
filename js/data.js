/* ═══════════════════════════════════════════════════════════════
   DATA — all 8 stages: monster, dialogue, and a two-part challenge
   (Part 1 = traversal, Part 2 = confrontation). Pure data — no
   engine code lives here, so tweaking a stage never touches
   js/platformer.js, js/timedtap.js, or js/combat.js.

   Part 1 types: "runner" (auto-run + tap-to-jump), "rhythm" (tap
   in time with a lit rune), "dodge" (tap to dodge an incoming
   hazard). Part 2 types: "combat" (the 4-button real-time fight),
   "duel" (tap a sweeping bar's lit zone), "mash" (tap-race a power
   meter against the boss's).
   ═══════════════════════════════════════════════════════════════ */

// Runner level: sane defaults so each stage only overrides what
// makes it different (gaps, hazards, colors...).
function mkRunnerLevel({
  width = 900, groundY = 180, gaps = [], platforms = [], hazards = [],
  coins = [], sky, ground, accent, goalSprite = "🚩",
}) {
  return { width, groundY, gaps, platforms, hazards, coins, goalSprite,
    theme: { sky, ground, accent } };
}

function mkFight(hp, { dmg = 10, atkMin = 1100, atkMax = 1900, telegraphMs = 650 } = {}) {
  return { hp, dmg, atkMin, atkMax, telegraphMs };
}

function mkRhythm({ reps = 6, windowMs = 300, intervalMs = 650, missDmg = 6 } = {}) {
  return { mode: "rhythm", reps, windowMs, intervalMs, missDmg };
}

function mkDodge({ reps = 5, approachMs = 1200, windowMs = 280, missDmg = 8 } = {}) {
  return { mode: "dodge", reps, approachMs, windowMs, missDmg };
}

function mkDuel({ hp = 60, dmg = 12, missDmg = 9, sweepMs = 1300, zoneWidth = 0.18 } = {}) {
  return { mode: "duel", hp, dmg, missDmg, sweepMs, zoneWidth };
}

function mkMash({ target = 100, tapPower = 6, decayPerSec = 14, bossFillMs = 4200, missDmg = 10 } = {}) {
  return { target, tapPower, decayPerSec, bossFillMs, missDmg };
}

const STAGES = [

  /* ── STAGE 1 — Runner / Combat ──────────────────────────────── */
  {
    id: 1,
    monster: { sprite: "🔥", name: "TORCH IMP", title: "Flickering Guard of the Garden Gate" },
    intro: [
      "A tiny flame-shaped imp cartwheels across the garden path.",
      "\"Ooh, a birthday guest! Catch me if your feet are quick enough!\"",
    ],
    defeat: "\"Okay, okay! Through you go — mind the candles!\"",
    part1: { type: "runner", config: mkRunnerLevel({
      width: 900,
      gaps: [{ x: 380, w: 55 }],
      platforms: [{ x: 560, y: 130, w: 90, h: 14 }],
      coins: [{ x: 300, y: 140 }, { x: 600, y: 100 }],
      sky: "#1b2a3a", ground: "#2f4a2f", accent: "#4a6b3a",
    }) },
    part2: { type: "combat", config: mkFight(45, { dmg: 7, atkMin: 1300, atkMax: 2200, telegraphMs: 800 }) },
    reward: { id: "ember-charm", icon: "🔥", name: "Ember Charm",
      desc: "Warm in your pocket, like a tiny lit candle that never burns out." },
    xp: 60,
  },

  /* ── STAGE 2 — Rhythm / Combat ──────────────────────────────── */
  {
    id: 2,
    monster: { sprite: "🦉", name: "NIGHT OWL ORACLE", title: "Keeper of the Hooting Hollow" },
    intro: [
      "An owl with too many eyes blinks down from a birch branch.",
      "\"Match my call, little one, or wander this hollow forever.\"",
    ],
    defeat: "\"Hoo... well matched. The hollow remembers your rhythm.\"",
    part1: { type: "rhythm", config: mkRhythm({ reps: 6, windowMs: 320, intervalMs: 700 }) },
    part2: { type: "combat", config: mkFight(55, { dmg: 8, atkMin: 1250, atkMax: 2100, telegraphMs: 760 }) },
    reward: { id: "owl-feather", icon: "🪶", name: "Owl Feather",
      desc: "Drops silently. Somehow, so do you, when you carry it." },
    xp: 65,
  },

  /* ── STAGE 3 — Runner / Duel ────────────────────────────────── */
  {
    id: 3,
    monster: { sprite: "⚙️", name: "CLOCKWORK SENTRY", title: "Timekeeper of the Rusted Hall" },
    intro: [
      "Brass gears grind. A sentry unfolds from an old grandfather clock.",
      "\"Tick. Tock. Precision is survival here, hero.\"",
    ],
    defeat: "\"Gear... stripped. Efficient. You may... pass.\"",
    part1: { type: "runner", config: mkRunnerLevel({
      width: 980,
      gaps: [{ x: 300, w: 55 }, { x: 620, w: 55 }],
      platforms: [{ x: 420, y: 120, w: 80, h: 14 }, { x: 740, y: 100, w: 80, h: 14 }],
      coins: [{ x: 460, y: 90 }, { x: 780, y: 70 }],
      sky: "#132a1f", ground: "#1e4d33", accent: "#37a06a",
    }) },
    part2: { type: "duel", config: mkDuel({ hp: 65, dmg: 13, missDmg: 9, sweepMs: 1150, zoneWidth: 0.2 }) },
    reward: { id: "brass-gear", icon: "⚙️", name: "Brass Gear",
      desc: "Still spins on its own, a full minute after you stop touching it." },
    xp: 75,
  },

  /* ── STAGE 4 — Dodge / Combat ───────────────────────────────── */
  {
    id: 4,
    monster: { sprite: "🦇", name: "CAVE BAT SWARM", title: "Wardens of the Whispering Dark" },
    intro: [
      "Wings fill the tunnel — hundreds of them, all at once.",
      "\"Squeak. (Translation: nobody walks through us unscathed.)\"",
    ],
    defeat: "\"Squeak... (translation: fine, FINE, go already.)\"",
    part1: { type: "dodge", config: mkDodge({ reps: 6, approachMs: 1050, windowMs: 260 }) },
    part2: { type: "combat", config: mkFight(70, { dmg: 9, atkMin: 1150, atkMax: 1950, telegraphMs: 700 }) },
    reward: { id: "echo-fang", icon: "🦷", name: "Echo Fang",
      desc: "Hold it to your ear — you can hear around corners." },
    xp: 80,
  },

  /* ── STAGE 5 — Rhythm / Mash ────────────────────────────────── */
  {
    id: 5,
    monster: { sprite: "🧜", name: "SIREN OF THE REEF", title: "Songkeeper of the Sunken Chimes" },
    intro: [
      "A voice curls up from the tidepool, gentle and impossible to ignore.",
      "\"Sing with me first, dear guest. Then... try to leave.\"",
    ],
    defeat: "\"Ha! Strong grip, for a landbound thing. Go, before I change my mind.\"",
    part1: { type: "rhythm", config: mkRhythm({ reps: 7, windowMs: 280, intervalMs: 620 }) },
    part2: { type: "mash", config: mkMash({ target: 100, tapPower: 7, decayPerSec: 16, bossFillMs: 3800, missDmg: 8 }) },
    reward: { id: "pearl-of-song", icon: "🫧", name: "Pearl of Song",
      desc: "Hold it up to your ear. It's still humming her tune." },
    xp: 90,
  },

  /* ── STAGE 6 — Runner / Duel ────────────────────────────────── */
  {
    id: 6,
    monster: { sprite: "🗿", name: "STONE COLOSSUS", title: "Last Statue Before the Vault Stair" },
    intro: [
      "A statue the size of a house creaks, and opens one glowing eye.",
      "\"FEW... REACH MY FOOTSTEPS AND KEEP RUNNING.\"",
    ],
    defeat: "\"WORTHY. THE STAIR... IS YOURS.\"",
    part1: { type: "runner", config: mkRunnerLevel({
      width: 1080,
      gaps: [{ x: 300, w: 65 }, { x: 640, w: 65 }],
      platforms: [{ x: 460, y: 125, w: 70, h: 14 }],
      hazards: [{ x: 220, y: 165, w: 35, h: 15 }, { x: 800, y: 165, w: 35, h: 15 }],
      coins: [{ x: 490, y: 90 }],
      sky: "#0e0e14", ground: "#2c2c38", accent: "#6a6a80",
    }) },
    part2: { type: "duel", config: mkDuel({ hp: 95, dmg: 14, missDmg: 11, sweepMs: 1000, zoneWidth: 0.16 }) },
    reward: { id: "colossus-shard", icon: "🪨", name: "Colossus Shard",
      desc: "Impossibly light for its size. It hums when the Vault is near." },
    xp: 100,
  },

  /* ── STAGE 7 — Dodge / Mash ─────────────────────────────────── */
  {
    id: 7,
    monster: { sprite: "🦂", name: "VAULT SCORPION", title: "Threshold Warden of the Last Door" },
    intro: [
      "Its tail casts a shadow shaped like a key. It does not blink.",
      "\"None cross this threshold unstung, birthday-born.\"",
    ],
    defeat: "\"Unstung. Unheard of. Take the key — you've earned the door.\"",
    part1: { type: "dodge", config: mkDodge({ reps: 7, approachMs: 950, windowMs: 240 }) },
    part2: { type: "mash", config: mkMash({ target: 100, tapPower: 7, decayPerSec: 18, bossFillMs: 3500, missDmg: 10 }) },
    reward: { id: "vault-key", icon: "🗝️", name: "Vault Key",
      desc: "Warm to the touch. The Vault already knows you're close." },
    xp: 115,
  },

  /* ── STAGE 8 — FINALE — Rhythm / Combat + relic burst ──────── */
  {
    id: 8,
    isFinale: true,
    monster: { sprite: "🕴️", name: "THE MIDNIGHT SOVEREIGN", title: "Warden of the Birthday Vault" },
    intro: [
      "The Vault antechamber. A figure of living midnight sits on the air itself.",
      "\"So. The birthday child stands before me at last.\"",
      "\"Seven relics blaze in your satchel, hero. Let us see if they are enough.\"",
    ],
    defeat: "", // the victory line is handled by the cinematic battle sequence
    part1: { type: "rhythm", config: mkRhythm({ reps: 8, windowMs: 260, intervalMs: 560 }) },
    part2: { type: "combat", config: mkFight(200, { dmg: 15, atkMin: 750, atkMax: 1350, telegraphMs: 480 }) },
    reward: null, // the Vault itself is the reward
    xp: 220,
  },
];

/* ── Achievements — toast pops when unlocked ─────────────────── */
const ACHIEVEMENTS = [
  { id: "first-blood",   after: 1, icon: "🩸", title: "First Blood",     text: "Defeat your first monster" },
  { id: "adventurer",    after: 3, icon: "🥾", title: "True Adventurer", text: "Clear 3 stages" },
  { id: "halfway",       after: 4, icon: "⚖️", title: "Halfway There",   text: "Clear 4 of 8 stages" },
  { id: "relic-hunter",  after: 6, icon: "🏺", title: "Relic Hunter",    text: "Clear 6 stages" },
  { id: "vault-key",     after: 7, icon: "🗝️", title: "Keybearer",       text: "Claim the Vault Key" },
  { id: "vault-breaker", after: 8, icon: "👑", title: "Vault Breaker",   text: "Defeat the Midnight Sovereign" },
];

/* ── Level curve: XP needed to reach each level ──────────────── */
const LEVEL_CURVE = [0, 80, 180, 320, 480, 650];
