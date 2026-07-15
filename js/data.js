/* ═══════════════════════════════════════════════════════════════
   DATA — all 16 stages: monster, dialogue, a short platform run,
   and a real-time fight. Pure data — no engine code lives here,
   so tweaking a level layout or a monster's stats never touches
   js/platformer.js or js/combat.js.
   ═══════════════════════════════════════════════════════════════ */

// Builds a level object with sane defaults so each stage only needs
// to specify what makes it different (gaps, hazards, colors...).
function mkLevel({
  width = 1100, groundY = 180, gaps = [], platforms = [], hazards = [],
  coins = [], ice = false, sky, ground, accent, goalSprite = "🚩",
}) {
  return { width, groundY, gaps, platforms, hazards, coins, ice, goalSprite,
    theme: { sky, ground, accent } };
}

// Builds a fight object; only `hp` is required, everything else
// has a gentle difficulty-appropriate default.
function mkFight(hp, { dmg = 10, atkMin = 1100, atkMax = 1900, telegraphMs = 650 } = {}) {
  return { hp, dmg, atkMin, atkMax, telegraphMs };
}

const STAGES = [

  /* ── STAGE 1 ─────────────────────────────────────────────── */
  {
    id: 1,
    monster: { sprite: "👺", name: "GOBLIN SCOUT", title: "Sniveling Sentry of the Outer Woods" },
    intro: [
      "A goblin blocks the forest path, snickering behind a crooked spear.",
      "\"Nobody outruns the Goblin Scout... except you, maybe. Try it.\"",
    ],
    defeat: "\"Ugh... fine. The path's yours, hero.\"",
    level: mkLevel({
      width: 900,
      gaps: [{ x: 380, w: 60 }],
      platforms: [{ x: 560, y: 130, w: 90, h: 14 }],
      hazards: [],
      coins: [{ x: 300, y: 140 }, { x: 600, y: 100 }],
      sky: "#1b2a3a", ground: "#2f4a2f", accent: "#4a6b3a",
    }),
    fight: mkFight(40, { dmg: 8, atkMin: 1300, atkMax: 2200, telegraphMs: 780 }),
    reward: { id: "rusty-sword", icon: "🗡️", name: "Rusty Sword",
      desc: "Old, chipped, but eager. Every legend starts with one." },
    xp: 45,
  },

  /* ── STAGE 2 ─────────────────────────────────────────────── */
  {
    id: 2,
    monster: { sprite: "🧚", name: "FOREST SPIRIT", title: "Warden of the Whispering Glade" },
    intro: [
      "Light gathers between the trees and takes a shape almost like a person.",
      "\"Prove your footing is as sure as your heart, young one.\"",
    ],
    defeat: "\"You move like the wind itself. Pass, child of the glade.\"",
    level: mkLevel({
      width: 1000,
      gaps: [{ x: 300, w: 55 }, { x: 620, w: 55 }],
      platforms: [{ x: 420, y: 120, w: 80, h: 14 }, { x: 740, y: 100, w: 80, h: 14 }],
      coins: [{ x: 460, y: 90 }, { x: 780, y: 70 }],
      sky: "#132a1f", ground: "#1e4d33", accent: "#37a06a",
    }),
    fight: mkFight(48, { dmg: 8, atkMin: 1250, atkMax: 2100, telegraphMs: 750 }),
    reward: { id: "emerald-leaf", icon: "🍃", name: "Emerald Leaf",
      desc: "It never wilts. It hums faintly when the wind changes." },
    xp: 50,
  },

  /* ── STAGE 3 ─────────────────────────────────────────────── */
  {
    id: 3,
    monster: { sprite: "💀", name: "SKELETON KNIGHT", title: "Oathbound Guard of the Three Chests" },
    intro: [
      "A knight of bare bone rises from a hall lined with locked chests.",
      "\"None have crossed my hall and lived to boast of it.\"",
    ],
    defeat: "\"Centuries... and finally, someone worthy. Go.\"",
    level: mkLevel({
      width: 1050,
      gaps: [{ x: 340, w: 60 }],
      platforms: [{ x: 200, y: 130, w: 70, h: 14 }, { x: 520, y: 110, w: 70, h: 14 }, { x: 760, y: 140, w: 90, h: 14 }],
      hazards: [{ x: 900, y: 165, w: 40, h: 15 }],
      coins: [{ x: 555, y: 80 }],
      sky: "#171522", ground: "#3a3350", accent: "#5c4f88",
    }),
    fight: mkFight(56, { dmg: 9, atkMin: 1200, atkMax: 2000, telegraphMs: 720 }),
    reward: { id: "bone-key", icon: "🦴", name: "Bone Key",
      desc: "Carved from a knight's own finger. It's still faintly warm." },
    xp: 55,
  },

  /* ── STAGE 4 ─────────────────────────────────────────────── */
  {
    id: 4,
    monster: { sprite: "🕷️", name: "SPIDER QUEEN", title: "Weaver of the Silken Labyrinth" },
    intro: [
      "The cave ahead is thick with web. Eight eyes glitter above you.",
      "\"Little morsel... my webs have swallowed braver heroes than you.\"",
    ],
    defeat: "\"Impossible! No one escapes the weave... until you.\"",
    level: mkLevel({
      width: 1100,
      gaps: [{ x: 250, w: 55 }, { x: 500, w: 55 }, { x: 780, w: 55 }],
      platforms: [{ x: 350, y: 120, w: 70, h: 14 }, { x: 620, y: 100, w: 70, h: 14 }, { x: 890, y: 130, w: 80, h: 14 }],
      hazards: [{ x: 160, y: 165, w: 35, h: 15 }],
      coins: [{ x: 655, y: 70 }],
      sky: "#140f1a", ground: "#241a30", accent: "#3d2a52",
    }),
    fight: mkFight(64, { dmg: 9, atkMin: 1150, atkMax: 1950, telegraphMs: 700 }),
    reward: { id: "silk-thread", icon: "🧵", name: "Silk Thread",
      desc: "Stronger than steel, lighter than breath." },
    xp: 60,
  },

  /* ── STAGE 5 ─────────────────────────────────────────────── */
  {
    id: 5,
    monster: { sprite: "🧙", name: "ANCIENT WIZARD", title: "Last Keeper of the Rune Tongue" },
    intro: [
      "An old man's tower floats overhead, stacked impossibly high.",
      "\"Climb, if your legs are half as clever as your courage.\"",
    ],
    defeat: "\"A century of solitude, broken by a child of sixteen years.\"",
    level: mkLevel({
      width: 1100,
      groundY: 195,
      gaps: [{ x: 260, w: 900 }], // the tower is all platforms, no ground beyond the start
      platforms: [
        { x: 300, y: 165, w: 70, h: 14 }, { x: 440, y: 135, w: 70, h: 14 },
        { x: 580, y: 105, w: 70, h: 14 }, { x: 720, y: 135, w: 70, h: 14 },
        { x: 860, y: 165, w: 70, h: 14 },
      ],
      coins: [{ x: 615, y: 75 }],
      sky: "#0d1830", ground: "#25355c", accent: "#5b7fd6",
    }),
    fight: mkFight(72, { dmg: 10, atkMin: 1100, atkMax: 1900, telegraphMs: 680 }),
    reward: { id: "spell-scroll", icon: "📜", name: "Spell Scroll",
      desc: "The ink rearranges itself when nobody is reading." },
    xp: 65,
  },

  /* ── STAGE 6 ─────────────────────────────────────────────── */
  {
    id: 6,
    monster: { sprite: "🐉", name: "FIRE DRAKE", title: "Ember of the Burnt Peaks" },
    intro: [
      "Heat rolls down the mountain pass. A young dragon uncoils from the rocks.",
      "\"Flame does not forgive hesitation, wingless one.\"",
    ],
    defeat: "\"You dance well for a creature without wings. The pass is yours.\"",
    level: mkLevel({
      width: 1100,
      gaps: [{ x: 300, w: 70 }, { x: 640, w: 70 }],
      platforms: [{ x: 460, y: 125, w: 70, h: 14 }],
      hazards: [{ x: 220, y: 165, w: 35, h: 15 }, { x: 800, y: 165, w: 35, h: 15 }],
      coins: [{ x: 490, y: 90 }],
      sky: "#2a0e0a", ground: "#5c1f10", accent: "#c2431a",
    }),
    fight: mkFight(80, { dmg: 10, atkMin: 1050, atkMax: 1850, telegraphMs: 660 }),
    reward: { id: "dragon-scale", icon: "🐲", name: "Dragon Scale",
      desc: "Warm to the touch, even days after the fight." },
    xp: 70,
  },

  /* ── STAGE 7 ─────────────────────────────────────────────── */
  {
    id: 7,
    monster: { sprite: "🧊", name: "ICE GOLEM", title: "Frozen Sentinel of the Glass Pass" },
    intro: [
      "A giant of blue ice grinds to life, its face a shattered mosaic.",
      "\"MY. ICE. NEVER. CRACKS.\"",
    ],
    defeat: "\"ICE. CRACKED. HERO. STRONG. PASS.\"",
    level: mkLevel({
      width: 1100,
      ice: true,
      gaps: [{ x: 340, w: 60 }, { x: 700, w: 60 }],
      platforms: [{ x: 480, y: 130, w: 90, h: 14 }],
      hazards: [{ x: 860, y: 165, w: 35, h: 15 }],
      coins: [{ x: 515, y: 95 }],
      sky: "#0c1e2e", ground: "#1c4a63", accent: "#7fd8f0",
    }),
    fight: mkFight(88, { dmg: 11, atkMin: 1000, atkMax: 1800, telegraphMs: 640 }),
    reward: { id: "frozen-crystal", icon: "❄️", name: "Frozen Crystal",
      desc: "It never melts. Inside, a tiny snowstorm rages forever." },
    xp: 75,
  },

  /* ── STAGE 8 ─────────────────────────────────────────────── */
  {
    id: 8,
    monster: { sprite: "🥷", name: "SHADOW ASSASSIN", title: "The Blade You Never See" },
    intro: [
      "The torches gutter out. A voice comes from everywhere at once.",
      "\"Cross my rooftops before the shadows cross you.\"",
    ],
    defeat: "\"Sharp feet. We will not meet again — you'd see me coming.\"",
    level: mkLevel({
      width: 1150,
      gaps: [{ x: 260, w: 60 }, { x: 520, w: 60 }, { x: 800, w: 60 }],
      platforms: [{ x: 360, y: 120, w: 70, h: 14 }, { x: 620, y: 95, w: 70, h: 14 }, { x: 900, y: 130, w: 80, h: 14 }],
      hazards: [{ x: 150, y: 165, w: 35, h: 15 }],
      coins: [{ x: 655, y: 65 }],
      sky: "#0a0a12", ground: "#1c1c2e", accent: "#3d3d5c",
    }),
    fight: mkFight(96, { dmg: 11, atkMin: 950, atkMax: 1750, telegraphMs: 620 }),
    reward: { id: "shadow-dagger", icon: "🔪", name: "Shadow Dagger",
      desc: "It casts no shadow of its own. It stole someone else's." },
    xp: 80,
  },

  /* ── STAGE 9 ─────────────────────────────────────────────── */
  {
    id: 9,
    monster: { sprite: "🐍", name: "SAND WYRM", title: "Devourer Beneath the Dunes" },
    intro: [
      "The desert floor bulges. A colossal wyrm bursts out, scattering sand.",
      "\"HSSS... few outrun me across shifting sand.\"",
    ],
    defeat: "\"Hkk— HKKK— there. Consider yourself... coughed upon.\"",
    level: mkLevel({
      width: 1100,
      gaps: [{ x: 300, w: 65 }, { x: 560, w: 65 }, { x: 830, w: 65 }],
      platforms: [{ x: 430, y: 130, w: 70, h: 14 }, { x: 690, y: 130, w: 70, h: 14 }],
      coins: [{ x: 465, y: 95 }, { x: 725, y: 95 }],
      sky: "#2a2008", ground: "#7a5c1e", accent: "#d4a83a",
    }),
    fight: mkFight(104, { dmg: 12, atkMin: 900, atkMax: 1700, telegraphMs: 600 }),
    reward: { id: "golden-fang", icon: "🦷", name: "Golden Fang",
      desc: "Solid gold. The wyrm grows a new one every sixteen years." },
    xp: 85,
  },

  /* ── STAGE 10 ────────────────────────────────────────────── */
  {
    id: 10,
    monster: { sprite: "🪆", name: "HAUNTED DOLL", title: "Keeper of Forgotten Toys" },
    intro: [
      "A porcelain doll sits alone in a ruined nursery. Its head turns. Slowly.",
      "\"Everyone who enters my nursery... stays.\"",
    ],
    defeat: "\"You remembered to leave... nobody ever remembers to leave.\"",
    level: mkLevel({
      width: 1100,
      gaps: [{ x: 280, w: 55 }, { x: 560, w: 55 }],
      platforms: [{ x: 400, y: 125, w: 70, h: 14 }, { x: 680, y: 105, w: 70, h: 14 }, { x: 860, y: 140, w: 80, h: 14 }],
      hazards: [{ x: 760, y: 165, w: 35, h: 15 }],
      coins: [{ x: 715, y: 70 }],
      sky: "#160f18", ground: "#3a2438", accent: "#7a4a70",
    }),
    fight: mkFight(112, { dmg: 12, atkMin: 880, atkMax: 1650, telegraphMs: 580 }),
    reward: { id: "soul-gem", icon: "💎", name: "Soul Gem",
      desc: "Something flickers inside, keeping time with your own heartbeat." },
    xp: 90,
  },

  /* ── STAGE 11 ────────────────────────────────────────────── */
  {
    id: 11,
    monster: { sprite: "🐺", name: "DARK WOLF", title: "Hunter of the Moonless Field" },
    intro: [
      "A field of black grass. Somewhere in it, a wolf laughs like a man.",
      "\"I've hunted this field longer than you've been alive, little hero.\"",
    ],
    defeat: "\"You cross my field like you own it. Respect.\"",
    level: mkLevel({
      width: 1150,
      gaps: [{ x: 260, w: 60 }, { x: 540, w: 60 }, { x: 820, w: 60 }],
      platforms: [{ x: 380, y: 120, w: 70, h: 14 }, { x: 660, y: 120, w: 70, h: 14 }],
      hazards: [{ x: 940, y: 165, w: 40, h: 15 }],
      coins: [{ x: 415, y: 85 }],
      sky: "#0a0f14", ground: "#1a2a1e", accent: "#3a5a42",
    }),
    fight: mkFight(120, { dmg: 13, atkMin: 850, atkMax: 1600, telegraphMs: 560 }),
    reward: { id: "moon-claw", icon: "🌙", name: "Moon Claw",
      desc: "It glows only when its owner is being watched." },
    xp: 95,
  },

  /* ── STAGE 12 ────────────────────────────────────────────── */
  {
    id: 12,
    monster: { sprite: "🤴", name: "CURSED KING", title: "He Who Sleeps on a Stolen Throne" },
    intro: [
      "A king slumps on a throne of tarnished gold, speaking without waking.",
      "\"Cursed... sixteen lifetimes I have slept upon this hall...\"",
    ],
    defeat: "The king's eyes open for the first time in centuries. \"...thank you, hero. Wake the Vault.\"",
    level: mkLevel({
      width: 1250,
      gaps: [{ x: 260, w: 55 }, { x: 500, w: 55 }, { x: 760, w: 55 }, { x: 1000, w: 55 }],
      platforms: [{ x: 360, y: 130, w: 70, h: 14 }, { x: 600, y: 105, w: 70, h: 14 }, { x: 860, y: 130, w: 70, h: 14 }],
      coins: [{ x: 635, y: 70 }],
      sky: "#160c10", ground: "#4a2a1a", accent: "#c99a3a",
    }),
    fight: mkFight(128, { dmg: 13, atkMin: 820, atkMax: 1550, telegraphMs: 540 }),
    reward: { id: "crown-fragment", icon: "👑", name: "Royal Crown Fragment",
      desc: "Still warm, as if the head that wore it just left." },
    xp: 100,
  },

  /* ── STAGE 13 ────────────────────────────────────────────── */
  {
    id: 13,
    monster: { sprite: "🌀", name: "VOID MAGE", title: "Arithmetician of the Empty Places" },
    intro: [
      "Reality thins. A figure of pure static blocks the passage ahead.",
      "\"Distance is just another equation, hero. Solve it with your legs.\"",
    ],
    defeat: "\"Balanced. Sealed. The void... apologizes for the inconvenience.\"",
    level: mkLevel({
      width: 1200,
      groundY: 195,
      gaps: [{ x: 200, w: 950 }], // floating platforms only — the void has no floor
      platforms: [
        { x: 250, y: 160, w: 65, h: 14 }, { x: 380, y: 120, w: 65, h: 14 },
        { x: 520, y: 85, w: 65, h: 14 }, { x: 660, y: 120, w: 65, h: 14 },
        { x: 800, y: 160, w: 65, h: 14 }, { x: 950, y: 130, w: 70, h: 14 },
      ],
      coins: [{ x: 552, y: 55 }],
      sky: "#0a0616", ground: "#241640", accent: "#8b5cf6",
    }),
    fight: mkFight(136, { dmg: 14, atkMin: 800, atkMax: 1500, telegraphMs: 520 }),
    reward: { id: "void-crystal", icon: "🔮", name: "Void Crystal",
      desc: "Looking into it feels like being looked out of." },
    xp: 105,
  },

  /* ── STAGE 14 ────────────────────────────────────────────── */
  {
    id: 14,
    monster: { sprite: "🐙", name: "KRAKEN", title: "Terror of the Drowned Cathedral" },
    intro: [
      "The bridge crosses black water. The water crosses back.",
      "\"HUMAN. FEW CROSS MY BRIDGE UNBROKEN.\"",
    ],
    defeat: "\"ENOUGH! THE BRIDGE IS YOURS. MIND THE PUDDLES.\"",
    level: mkLevel({
      width: 1250,
      gaps: [{ x: 240, w: 70 }, { x: 480, w: 70 }, { x: 740, w: 70 }, { x: 980, w: 70 }],
      platforms: [{ x: 350, y: 130, w: 70, h: 14 }, { x: 850, y: 130, w: 70, h: 14 }],
      hazards: [{ x: 590, y: 165, w: 40, h: 15 }],
      coins: [{ x: 385, y: 95 }, { x: 885, y: 95 }],
      sky: "#081018", ground: "#0f2a3a", accent: "#2a7a9a",
    }),
    fight: mkFight(144, { dmg: 14, atkMin: 780, atkMax: 1450, telegraphMs: 500 }),
    reward: { id: "pearl-depths", icon: "🫧", name: "Pearl of Depths",
      desc: "Hold it to your ear: the ocean inside is still angry." },
    xp: 110,
  },

  /* ── STAGE 15 ────────────────────────────────────────────── */
  {
    id: 15,
    monster: { sprite: "🗿", name: "GUARDIAN TITAN", title: "Final Wall Before the Vault" },
    intro: [
      "A titan of carved stone fills the corridor. Its voice is an avalanche.",
      "\"HERO. NONE PASS THE LAST WALL BEFORE THE VAULT.\"",
    ],
    defeat: "\"THE NUMBER OF YOUR YEARS. THE NUMBER OF THE GATE. PASS, CHOSEN ONE.\"",
    level: mkLevel({
      width: 1300,
      gaps: [{ x: 240, w: 60 }, { x: 460, w: 60 }, { x: 700, w: 60 }, { x: 940, w: 60 }, { x: 1140, w: 55 }],
      platforms: [{ x: 340, y: 130, w: 65, h: 14 }, { x: 580, y: 105, w: 65, h: 14 }, { x: 820, y: 130, w: 65, h: 14 }],
      hazards: [{ x: 1050, y: 165, w: 35, h: 15 }],
      coins: [{ x: 612, y: 70 }],
      sky: "#0e0e14", ground: "#2c2c38", accent: "#6a6a80",
    }),
    fight: mkFight(155, { dmg: 15, atkMin: 760, atkMax: 1400, telegraphMs: 480 }),
    reward: { id: "vault-key", icon: "🗝️", name: "Vault Key",
      desc: "Fifteen relics won, one key left. The Vault already knows you're coming." },
    xp: 120,
  },

  /* ── STAGE 16 ────────────────────────────────────────────── */
  {
    id: 16,
    monster: { sprite: "🕴️", name: "THE SHADOW KING", title: "Warden of the Birthday Vault" },
    intro: [
      "The Vault antechamber. A figure of living darkness sits on the air itself.",
      "\"So. The child of the Sixteenth Gate stands before me.\"",
      "\"Fifteen relics blaze in your satchel, hero. Let us see if they are enough.\"",
    ],
    defeat: "", // the victory line is handled by the cinematic battle sequence
    level: mkLevel({
      width: 1300,
      gaps: [{ x: 220, w: 65 }, { x: 440, w: 65 }, { x: 680, w: 65 }, { x: 920, w: 65 }, { x: 1140, w: 55 }],
      platforms: [{ x: 320, y: 130, w: 65, h: 14 }, { x: 560, y: 100, w: 65, h: 14 }, { x: 800, y: 130, w: 65, h: 14 }, { x: 1030, y: 105, w: 70, h: 14 }],
      hazards: [{ x: 1170, y: 165, w: 40, h: 15 }],
      coins: [],
      sky: "#0a0612", ground: "#1e1030", accent: "#8b5cf6",
      goalSprite: "🕴️",
    }),
    fight: mkFight(220, { dmg: 16, atkMin: 700, atkMax: 1300, telegraphMs: 460 }),
    reward: null, // the Vault itself is the reward
    xp: 200,
  },
];

/* ── Achievements — toast pops when unlocked ─────────────────── */
const ACHIEVEMENTS = [
  { id: "first-blood",  after: 1,  icon: "🩸", title: "First Blood",      text: "Defeat your first monster" },
  { id: "adventurer",   after: 5,  icon: "🥾", title: "True Adventurer",  text: "Clear 5 stages" },
  { id: "halfway",      after: 8,  icon: "⚖️", title: "Halfway There",    text: "Clear 8 of 16 stages" },
  { id: "relic-hunter", after: 12, icon: "🏺", title: "Relic Hunter",     text: "Clear 12 stages" },
  { id: "vault-key",    after: 15, icon: "🗝️", title: "Keybearer",        text: "Claim the Vault Key" },
  { id: "shadow-slayer",after: 16, icon: "👑", title: "Shadow Slayer",    text: "Defeat the Shadow King" },
];

/* ── Level curve: XP needed to reach each level ──────────────── */
const LEVEL_CURVE = [0, 100, 220, 360, 520, 700, 900, 1120, 1400];
