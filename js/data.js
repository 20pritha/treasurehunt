/* ═══════════════════════════════════════════════════════════════
   DATA — all 8 trials: monster, dialogue, a puzzle, a relic (with
   a `clue` value later trials reference), and a per-level visual
   theme. Pure data — no engine code lives here, so tweaking a
   puzzle's difficulty never touches js/puzzles.js.

   Clue values are fixed content (not procedurally generated), so
   later puzzles that "use" earlier relics (L7 needs L3+L4; L8
   needs L1,L2,L5,L6,L7) simply hardcode the matching answer here
   rather than resolving it at runtime — simpler than a resolver
   function since I already know every value at authoring time.
   Each relic's `desc` states its clue in plain prose: with no
   in-puzzle hints allowed, the 👜 inventory is the only legitimate
   way to recall it.
   ═══════════════════════════════════════════════════════════════ */

const STAGES = [

  /* ── LEVEL 1 — THE GATEKEEPER'S TRIAL (choice) ──────────────── */
  {
    id: 1,
    monster: { sprite: "🗿", name: "THE STONE GATEKEEPER", title: "Warden of the Forgotten Gate" },
    intro: [
      "Rain falls on broken statues. Gigantic stone doors, carved with glowing runes, block the way.",
      "The Gatekeeper's eyes ignite with blue fire. The ground shakes as it speaks.",
      "\"Only those who can observe may enter. Complete the tablet, or be turned away.\"",
    ],
    defeat: "The runes dim. The great doors grind open, one inch at a time.",
    theme: { accent: "#5b7fd6", particleHue: 210, particleDensity: 0.6, mood: 0.94 },
    puzzle: { type: "choice", config: {
      promptText: ["A stone tablet. Four symbols repeat — one is missing."],
      promptGrid: { rows: 4, cols: 4, cells: [
        "▲", "■", "●", "★",
        "■", "★", "▲", "●",
        "●", "▲", "★", "■",
        "★", "●", "■", null,
      ] },
      options: [{ icon: "▲" }, { icon: "■" }, { icon: "●" }, { icon: "★" }],
      answer: 0,
    } },
    reward: { id: "rusted-sword", icon: "⚔️", name: "Rusted Sword",
      desc: "Old and chipped. Seven notches mark the blade.", clue: 7 },
    xp: 60,
  },

  /* ── LEVEL 2 — FOREST OF WHISPERS (choice) ──────────────────── */
  {
    id: 2,
    monster: { sprite: "🧚", name: "THE WHISPERING DRYAD", title: "Warden of the Bioluminescent Grove" },
    intro: [
      "Massive glowing trees. Fireflies drift between roots thick as houses.",
      "A Dryad grows from the largest trunk, hair flowing like leaves, eyes glowing emerald.",
      "\"Three trees before you. Only one never lies. Find where the treasure truly rests.\"",
    ],
    defeat: "Vines slide away from a hidden chest, and the forest brightens.",
    theme: { accent: "#3ad17a", particleHue: 140, particleDensity: 1.3, mood: 1.06 },
    puzzle: { type: "choice", config: {
      promptText: [
        "Oak: \"The treasure is not under Oak.\"",
        "Birch: \"Elm is lying.\"",
        "Elm: \"Oak is telling the truth.\"",
        "Only one tree always tells the truth. Where is the treasure?",
      ],
      options: [{ icon: "🌳", label: "Oak" }, { icon: "🌲", label: "Birch" }, { icon: "🍂", label: "Elm" }],
      answer: 0,
    } },
    reward: { id: "emerald-leaf", icon: "🍃", name: "Emerald Leaf",
      desc: "It never wilts. A green rune glows faintly on its stem.", clue: "green" },
    xp: 70,
  },

  /* ── LEVEL 3 — LIBRARY OF LOST RUNES (sequence) ─────────────── */
  {
    id: 3,
    monster: { sprite: "👻", name: "THE ANCIENT ARCHIVIST", title: "Ghost of the Impossible Library" },
    intro: [
      "Bookshelves disappear into darkness above. Candles float between them, unattended.",
      "A ghost in cracked golden armor drifts closer, shedding glowing pages as he moves.",
      "\"Five books. Knowledge follows alphabetical order — not the order they sit in.\"",
    ],
    defeat: "Every shelf in the library lights up at once, then fades back to dark.",
    theme: { accent: "#e8c15a", particleHue: 45, particleDensity: 1.0, mood: 1.0 },
    puzzle: { type: "sequence", config: {
      items: [
        { icon: "📕", label: "F3" }, { icon: "📗", label: "A7" }, { icon: "📘", label: "M2" },
        { icon: "📙", label: "K9" }, { icon: "📔", label: "R4" },
      ],
      order: [1, 0, 3, 2, 4], // A7, F3, K9, M2, R4
    } },
    reward: { id: "spell-scroll", icon: "📜", name: "Spell Scroll",
      desc: "The ink rearranges itself. Faint numerals shimmer across it: 3.", clue: 3 },
    xp: 85,
  },

  /* ── LEVEL 4 — THE CRYSTAL CAVERN (mirror) ──────────────────── */
  {
    id: 4,
    monster: { sprite: "🕷️", name: "THE CRYSTAL SPIDER", title: "Weaver of the Glass Cavern" },
    intro: [
      "A cave made entirely of crystal. The floor reflects like glass; a waterfall falls from nowhere.",
      "Eight eyes glitter in a crevice, each one a tiny prism.",
      "\"Route the light to the heart-crystal, little guest. Every reflection matters.\"",
    ],
    defeat: "The beam strikes the crystal. Thousands more light up in answer, one by one.",
    theme: { accent: "#59d6f2", particleHue: 190, particleDensity: 1.4, mood: 1.12 },
    puzzle: { type: "mirror", config: {
      rows: 4, cols: 4,
      source: { r: 0, c: 0, dir: "right" },
      target: { r: 3, c: 1 },
      mirrors: [
        { r: 0, c: 2, initial: "/" },
        { r: 2, c: 2, initial: "\\" },
        { r: 2, c: 1, initial: "\\" },
      ],
      maxMoves: 10,
    } },
    reward: { id: "crystal-lens", icon: "🔍", name: "Crystal Lens",
      desc: "Looking through it, you count five points of light.", clue: 5 },
    xp: 95,
  },

  /* ── LEVEL 5 — THE CLOCKWORK CHAMBER (statecycle) ───────────── */
  {
    id: 5,
    monster: { sprite: "🤖", name: "THE IRON AUTOMATON", title: "Last Machine of the Sunken Sanctuary" },
    intro: [
      "Gears the size of houses turn inside the walls. Steam hisses from a hundred pipes.",
      "Scattered metal plates slide across the floor and assemble themselves into a towering shape.",
      "\"Four gears, all linked. Turn them all clockwise — but turning one turns its neighbors too.\"",
    ],
    defeat: "Every gear across the chamber locks into rhythm. Somewhere below, an elevator wakes.",
    theme: { accent: "#e2883a", particleHue: 30, particleDensity: 0.8, mood: 0.9 },
    puzzle: { type: "statecycle", config: {
      tileCount: 4,
      links: [[0, 1], [1, 2], [2, 3], [3, 0]],
      states: ["cw", "ccw"],
      stateIcons: ["↻", "↺"],
      initial: [1, 0, 1, 0],
      target: [0, 0, 0, 0],
    } },
    reward: { id: "cog-of-time", icon: "⚙️", name: "Cog of Time",
      desc: "Still spins on its own. Engraved with the numeral VIII.", clue: "VIII" },
    xp: 105,
  },

  /* ── LEVEL 6 — TEMPLE OF ECHOES (sequence) ──────────────────── */
  {
    id: 6,
    monster: { sprite: "🧘", name: "THE ECHO PRIEST", title: "Voice of the Buried Cathedral" },
    intro: [
      "Huge bells hang from a ceiling half-collapsed. Dust drifts through broken shafts of light.",
      "A robed figure never touches the ground; his robes dissolve into sound waves as he turns.",
      "\"The bells will ring. Each color is a letter. Spell what they tell you.\"",
    ],
    defeat: "Every bell in the temple rings together. Small stones fall from the high ceiling.",
    theme: { accent: "#f2d98a", particleHue: 48, particleDensity: 1.0, mood: 1.0 },
    puzzle: { type: "sequence", config: {
      promptText: ["The bells ring in order: Blue, Red, Green, Yellow."],
      items: [
        { icon: "🟡", label: "Yellow = O" }, { icon: "🔵", label: "Blue = E" },
        { icon: "🟢", label: "Green = H" }, { icon: "🔴", label: "Red = C" },
      ],
      order: [1, 3, 2, 0], // Blue(E) Red(C) Green(H) Yellow(O) -> ECHO
    } },
    reward: { id: "echo-crystal", icon: "💎", name: "Echo Crystal",
      desc: "It hums a single word, over and over: ECHO.", clue: "ECHO" },
    xp: 115,
  },

  /* ── LEVEL 7 — THE OBSIDIAN OBSERVATORY (choice, multiSelect) ── */
  {
    id: 7,
    monster: { sprite: "🔮", name: "THE VOID ASTROLOGER", title: "Watcher of the Floorless Sky" },
    intro: [
      "A ruined observatory floating above the clouds. Black obsidian underfoot; no walls, only stars.",
      "A figure in robes of moving galaxies turns toward you, an eclipse where a face should be.",
      "\"Your Lens finds the stars. Your Scroll names them. Choose the two the numbers point to.\"",
    ],
    defeat: "A shooting star crosses the sky. The observatory hums back to life.",
    theme: { accent: "#8b5cf6", particleHue: 265, particleDensity: 1.6, mood: 0.85 },
    puzzle: { type: "choice", config: {
      promptText: ["The Scroll's numeral and the Lens's count each mark a star. Select both."],
      options: [1, 2, 3, 4, 5, 6].map((n) => ({ icon: "⭐", label: String(n) })),
      answer: [2, 4], // star 3 (Scroll clue) and star 5 (Lens clue)
      multiSelect: true,
    } },
    reward: { id: "astral-compass", icon: "🧭", name: "Astral Compass",
      desc: "The needle doesn't point north. It points east.", clue: "EAST" },
    xp: 130,
  },

  /* ── LEVEL 8 — THE SHADOW MAZE (maze) — FINALE ──────────────── */
  {
    id: 8,
    isFinale: true,
    monster: { sprite: "🥷", name: "THE FACELESS HUNTER", title: "The Watcher in the Dark" },
    intro: [
      "Almost no light. Only the Compass glows. Somewhere close, something silently watches.",
      "Eyes open in the dark, and vanish. The Hunter never attacks — it only follows.",
      "\"Every relic you carry has a purpose here. Remember them all, or wander forever.\"",
    ],
    defeat: "",
    theme: { accent: "#6a5acd", particleHue: 265, particleDensity: 0.2, mood: 0.75 },
    puzzle: { type: "maze", config: {
      rows: 6, cols: 6,
      start: { r: 5, c: 0 },
      exit: { r: 0, c: 5 },
      walls: [
        { r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 }, { r: 0, c: 3 }, { r: 0, c: 4 },
        { r: 1, c: 4 },
        { r: 2, c: 1 }, { r: 2, c: 2 },
        { r: 3, c: 3 }, { r: 3, c: 4 }, { r: 3, c: 5 },
        { r: 4, c: 0 }, { r: 4, c: 1 }, { r: 4, c: 3 }, { r: 4, c: 4 }, { r: 4, c: 5 },
        { r: 5, c: 3 }, { r: 5, c: 4 }, { r: 5, c: 5 },
      ],
      gates: [
        { r: 3, c: 2, prompt: { // Sword: "Seven notches mark the blade."
          options: [{ icon: "⚔️", label: "3" }, { icon: "⚔️", label: "7" }, { icon: "⚔️", label: "12" }], answer: 1 } },
        { r: 1, c: 0, prompt: { // Leaf: "A green rune glows faintly on its stem."
          options: [{ icon: "🍃", label: "Green" }, { icon: "🍃", label: "Blue" }, { icon: "🍃", label: "Gold" }], answer: 0 } },
        { r: 1, c: 3, prompt: { // Cog: "Engraved with the numeral VIII."
          options: [{ icon: "⚙️", label: "VI" }, { icon: "⚙️", label: "VIII" }, { icon: "⚙️", label: "XII" }], answer: 1 } },
        { r: 2, c: 5, prompt: { // Crystal: "It hums a single word, over and over: ECHO."
          options: [{ icon: "💎", label: "ECHO" }, { icon: "💎", label: "VAULT" }, { icon: "💎", label: "SHADOW" }], answer: 0 } },
        { r: 1, c: 5, prompt: { // Compass: "The needle doesn't point north. It points east."
          options: [{ icon: "🧭", label: "North" }, { icon: "🧭", label: "East" }, { icon: "🧭", label: "West" }], answer: 1 } },
      ],
    } },
    reward: { id: "shadow-key", icon: "🗝️", name: "Shadow Key",
      desc: "Carved from living shadow. It hums, eager for the door ahead.", clue: null },
    xp: 180,
  },
];

/* ── Achievements — toast pops when unlocked ─────────────────── */
const ACHIEVEMENTS = [
  { id: "first-relic", after: 1, icon: "🩸", title: "First Relic",           text: "Claim your first relic" },
  { id: "scholar",     after: 3, icon: "📚", title: "Scholar",               text: "Clear 3 trials" },
  { id: "halfway",     after: 4, icon: "⚖️", title: "Halfway There",         text: "Clear 4 of 8 trials" },
  { id: "stargazer",   after: 7, icon: "🔭", title: "Stargazer",             text: "Claim the Astral Compass" },
  { id: "descender",   after: 8, icon: "🗝️", title: "First Descent Complete", text: "Escape the Shadow Maze" },
];

/* ── Level curve: XP needed to reach each level (pure flavor) ── */
const LEVEL_CURVE = [0, 80, 180, 320, 480, 650];
