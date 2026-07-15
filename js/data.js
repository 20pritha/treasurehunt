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

  /* ── LEVEL 1 — THE SANDSTONE SENTINEL (choice) ──────────────── */
  {
    id: 1,
    monster: { sprite: "🗿", name: "THE SANDSTONE SENTINEL", title: "Warden of the Sunken Gate" },
    intro: [
      "Heat shimmers off an entrance carved into a dune's face. Two colossal stone doors, lined with glowing runes.",
      "Sand pours from the Sentinel's joints as it turns. Its eyes ignite with molten-gold fire.",
      "\"Only those who can observe may enter. Complete the tablet, or be turned back to dust.\"",
    ],
    defeat: "The runes dim. Sand cascades away as the great doors grind open.",
    theme: { accent: "#d9a05b", particleHue: 35, particleDensity: 0.7, mood: 0.94 },
    puzzle: { type: "choice", config: {
      promptText: ["A sun-scorched tablet. Four symbols repeat — one is missing."],
      promptGrid: { rows: 4, cols: 4, cells: [
        "▲", "■", "●", "★",
        "■", "★", "▲", "●",
        "●", "▲", "★", "■",
        "★", "●", "■", null,
      ] },
      options: [{ icon: "▲" }, { icon: "■" }, { icon: "●" }, { icon: "★" }],
      answer: 0,
    } },
    reward: { id: "sun-scimitar", icon: "🗡️", name: "Sun-Scimitar",
      desc: "Old and sand-scoured. Seven notches mark the blade.", clue: 7 },
    xp: 60,
  },

  /* ── LEVEL 2 — THE OASIS DJINN (choice) ─────────────────────── */
  {
    id: 2,
    monster: { sprite: "🧞", name: "THE OASIS DJINN", title: "Keeper of the Mirage Pool" },
    intro: [
      "Palm trees ring a pool too blue to be real. The water never ripples.",
      "A djinn coils up from the pool like smoke, eyes glowing turquoise.",
      "\"Three urns rest before you. Only one truthful voice among them. Find where the treasure truly rests.\"",
    ],
    defeat: "The djinn laughs, and strange blue flowers bloom in the sand around the pool.",
    theme: { accent: "#3ecfc0", particleHue: 175, particleDensity: 1.3, mood: 1.06 },
    puzzle: { type: "choice", config: {
      promptText: [
        "Gold Urn: \"The treasure is not beneath Gold.\"",
        "Silver Urn: \"Clay is lying.\"",
        "Clay Urn: \"Gold speaks the truth.\"",
        "Only one urn always speaks true. Where is the treasure?",
      ],
      options: [{ icon: "🏺", label: "Gold" }, { icon: "🏺", label: "Silver" }, { icon: "🏺", label: "Clay" }],
      answer: 0,
    } },
    reward: { id: "jade-scarab", icon: "🪲", name: "Jade Scarab",
      desc: "Carved from river-stone. A green rune glows faintly on its shell.", clue: "green" },
    xp: 70,
  },

  /* ── LEVEL 3 — THE SCROLL KEEPER (sequence) ─────────────────── */
  {
    id: 3,
    monster: { sprite: "👻", name: "THE SCROLL KEEPER", title: "Ghost of the Buried Scriptorium" },
    intro: [
      "Sand has swallowed this chamber whole, yet shelves of scrolls still glow faintly beneath it.",
      "A robed ghost drifts between them, scattering grains of gold dust with every motion.",
      "\"Five scrolls, out of order. Knowledge follows alphabet — not the shelf they fell to.\"",
    ],
    defeat: "Every scroll in the scriptorium unrolls at once, glows gold, then stills.",
    theme: { accent: "#e0c070", particleHue: 48, particleDensity: 1.0, mood: 1.0 },
    puzzle: { type: "sequence", config: {
      items: [
        { icon: "📜", label: "F3" }, { icon: "📜", label: "A7" }, { icon: "📜", label: "M2" },
        { icon: "📜", label: "K9" }, { icon: "📜", label: "R4" },
      ],
      order: [1, 0, 3, 2, 4], // A7, F3, K9, M2, R4
    } },
    reward: { id: "papyrus-scroll", icon: "📜", name: "Papyrus Scroll",
      desc: "The ink rearranges itself. Faint numerals shimmer across it: 3.", clue: 3 },
    xp: 85,
  },

  /* ── LEVEL 4 — THE SUNSTONE SCORPION (mirror) ───────────────── */
  {
    id: 4,
    monster: { sprite: "🦂", name: "THE SUNSTONE SCORPION", title: "Keeper of the Sunken Sunstones" },
    intro: [
      "A cavern beneath the dunes, walls set with polished sunstone mirrors catching light from nowhere.",
      "Something segmented and armored clicks across the stone, pincers scraping sparks.",
      "\"Route the light to the heartstone, little wanderer. Every reflection matters.\"",
    ],
    defeat: "The beam strikes the heartstone. Every sunstone in the cavern ignites at once.",
    theme: { accent: "#ff9d4d", particleHue: 28, particleDensity: 1.4, mood: 1.12 },
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
    reward: { id: "sunstone-lens", icon: "🔍", name: "Sunstone Lens",
      desc: "Looking through it, you count five points of light.", clue: 5 },
    xp: 95,
  },

  /* ── LEVEL 5 — THE BRASS SPHINX (statecycle) ────────────────── */
  {
    id: 5,
    monster: { sprite: "🤖", name: "THE BRASS SPHINX", title: "Last Machine of the Buried Sanctuary" },
    intro: [
      "An ancient waterwheel sanctuary, swallowed by sand centuries ago. Brass gears still turn somewhere in the dark.",
      "Scattered plating drags itself across the floor and assembles into a towering, sphinx-faced construct.",
      "\"Four gears, all linked, feeding the last well beneath the dunes. Turn them all clockwise — but turning one turns its neighbors too.\"",
    ],
    defeat: "Every gear locks into rhythm. Somewhere below, water begins to flow again.",
    theme: { accent: "#c98a3a", particleHue: 32, particleDensity: 0.8, mood: 0.9 },
    puzzle: { type: "statecycle", config: {
      tileCount: 4,
      links: [[0, 1], [1, 2], [2, 3], [3, 0]],
      states: ["cw", "ccw"],
      stateIcons: ["↻", "↺"],
      initial: [1, 0, 1, 0],
      target: [0, 0, 0, 0],
    } },
    reward: { id: "brass-astrolabe", icon: "⚙️", name: "Brass Astrolabe",
      desc: "Still spins on its own. Engraved with the numeral VIII.", clue: "VIII" },
    xp: 105,
  },

  /* ── LEVEL 6 — THE CANYON WIND-SEER (sequence) ──────────────── */
  {
    id: 6,
    monster: { sprite: "🧘", name: "THE CANYON WIND-SEER", title: "Voice of the Singing Canyon" },
    intro: [
      "Bronze bells and gongs hang across a narrow canyon, half-buried in drifted sand.",
      "A figure made of blown sand and wind gathers itself from the canyon floor, never quite solid.",
      "\"The bells will ring. Each tone is a letter. Spell what the canyon tells you.\"",
    ],
    defeat: "Every bell in the canyon rings together. Sand slides from the walls in sheets.",
    theme: { accent: "#c9705a", particleHue: 12, particleDensity: 1.0, mood: 1.0 },
    puzzle: { type: "sequence", config: {
      promptText: ["The bells ring in order: Blue, Red, Green, Yellow."],
      items: [
        { icon: "🟡", label: "Yellow = O" }, { icon: "🔵", label: "Blue = E" },
        { icon: "🟢", label: "Green = H" }, { icon: "🔴", label: "Red = C" },
      ],
      order: [1, 3, 2, 0], // Blue(E) Red(C) Green(H) Yellow(O) -> ECHO
    } },
    reward: { id: "canyon-shard", icon: "💎", name: "Canyon Shard",
      desc: "It hums a single word, over and over: ECHO.", clue: "ECHO" },
    xp: 115,
  },

  /* ── LEVEL 7 — THE STARGAZER OF THE DUNES (choice, multiSelect) ── */
  {
    id: 7,
    monster: { sprite: "🔮", name: "THE STARGAZER OF THE DUNES", title: "Watcher of the Endless Night Sky" },
    intro: [
      "Atop the tallest dune, the desert opens into a sky so clear the stars feel close enough to touch.",
      "A robed figure sits cross-legged, a swirl of constellations where a face should be.",
      "\"Your Lens finds the stars. Your Scroll names them. Choose the two the numbers point to.\"",
    ],
    defeat: "A shooting star crosses the sky, and the dune seems to hum with quiet relief.",
    theme: { accent: "#5a5fc7", particleHue: 245, particleDensity: 1.6, mood: 0.85 },
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

  /* ── LEVEL 8 — THE MUMMY WARDEN (maze) — FINALE ─────────────── */
  {
    id: 8,
    isFinale: true,
    monster: { sprite: "🧟", name: "THE MUMMY WARDEN", title: "The Watcher in the Buried Tomb" },
    intro: [
      "Barely any light reaches here. Only the Compass glows against the dark.",
      "Wrapped in ancient linen, something stirs at the edge of sight — it does not attack, only follows.",
      "\"Every relic you carry has a purpose here. Remember them all, or wander these sands forever.\"",
    ],
    defeat: "",
    theme: { accent: "#8a6a2a", particleHue: 40, particleDensity: 0.2, mood: 0.75 },
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
        { r: 3, c: 2, prompt: { // Scimitar: "Seven notches mark the blade."
          options: [{ icon: "🗡️", label: "3" }, { icon: "🗡️", label: "7" }, { icon: "🗡️", label: "12" }], answer: 1 } },
        { r: 1, c: 0, prompt: { // Scarab: "A green rune glows faintly on its shell."
          options: [{ icon: "🪲", label: "Green" }, { icon: "🪲", label: "Blue" }, { icon: "🪲", label: "Gold" }], answer: 0 } },
        { r: 1, c: 3, prompt: { // Astrolabe: "Engraved with the numeral VIII."
          options: [{ icon: "⚙️", label: "VI" }, { icon: "⚙️", label: "VIII" }, { icon: "⚙️", label: "XII" }], answer: 1 } },
        { r: 2, c: 5, prompt: { // Canyon Shard: "It hums a single word, over and over: ECHO."
          options: [{ icon: "💎", label: "ECHO" }, { icon: "💎", label: "VAULT" }, { icon: "💎", label: "SHADOW" }], answer: 0 } },
        { r: 1, c: 5, prompt: { // Compass: "The needle doesn't point north. It points east."
          options: [{ icon: "🧭", label: "North" }, { icon: "🧭", label: "East" }, { icon: "🧭", label: "West" }], answer: 1 } },
      ],
    } },
    reward: { id: "sunforged-key", icon: "🗝️", name: "Sun-Forged Key",
      desc: "Carved from living shadow, warmed by centuries of buried sun. It hums, eager for the door ahead.", clue: null },
    xp: 180,
  },
];

/* ── Achievements — toast pops when unlocked ─────────────────── */
const ACHIEVEMENTS = [
  { id: "first-relic", after: 1, icon: "🩸", title: "First Relic",           text: "Claim your first relic" },
  { id: "scholar",     after: 3, icon: "📚", title: "Scholar",               text: "Clear 3 trials" },
  { id: "halfway",     after: 4, icon: "⚖️", title: "Halfway There",         text: "Clear 4 of 8 trials" },
  { id: "stargazer",   after: 7, icon: "🔭", title: "Stargazer",             text: "Claim the Astral Compass" },
  { id: "descender",   after: 8, icon: "🗝️", title: "First Descent Complete", text: "Escape the Buried Tomb" },
];

/* ── Level curve: XP needed to reach each level (pure flavor) ── */
const LEVEL_CURVE = [0, 80, 180, 320, 480, 650];
