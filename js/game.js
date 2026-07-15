/* ═══════════════════════════════════════════════════════════════
   GAME ENGINE — boot sequence, the walkable overworld, and the
   dialogue → puzzle → reward trial flow. State/save lives in
   save.js, HUD/toasts in hud.js, the ending sequence in vault.js,
   the five puzzle engines in puzzles.js.
   ═══════════════════════════════════════════════════════════════ */

/* ── LOADING SCREEN ────────────────────────────────────────── */
const LOADING_TIPS = [
  "Brushing sand from ancient tablets...",
  "Waking the Sentinel (carefully)...",
  "Bargaining with desert djinn...",
  "Polishing the Sixteenth Gate...",
  "Charting star maps by dune-light...",
  "Hiding birthday treasure...",
];

function runLoading() {
  let pct = 0, tip = 0;
  const iv = setInterval(() => {
    pct = Math.min(100, pct + 4 + Math.random() * 9);
    $("loading-fill").style.width = pct + "%";
    if (Math.random() < 0.3) $("loading-tip").textContent = LOADING_TIPS[++tip % LOADING_TIPS.length];
    if (pct >= 100) {
      clearInterval(iv);
      setTimeout(runCutscene, 400);
    }
  }, 120);
}

/* ── OPENING CUTSCENE ──────────────────────────────────────── */
const CUTSCENE_LINES = [
  "For sixteen years...",
  "the Shadow Vault has lain buried beneath the dunes.",
  "Legends spoke of a chosen hero...",
  "born under the Sixteenth Gate.",
  "Today...",
  "the sands finally shift.",
];

function runCutscene() {
  show("screen-cutscene");
  const box = $("cutscene-text");
  let i = 0, skipped = false;

  const next = () => {
    if (skipped) return;
    if (i >= CUTSCENE_LINES.length) { end(); return; }
    box.textContent = CUTSCENE_LINES[i];
    box.classList.remove("fade-line");
    void box.offsetWidth;
    box.classList.add("fade-line");
    i++;
    timer = setTimeout(next, 2400);
  };
  let timer = setTimeout(next, 300);

  const end = () => {
    skipped = true;
    clearTimeout(timer);
    $("screen-cutscene").removeEventListener("click", end);
    showTitle();
  };
  $("screen-cutscene").addEventListener("click", end);
}

/* ── TITLE ─────────────────────────────────────────────────── */
function showTitle() {
  show("screen-title");
  const hasSave = !!localStorage.getItem(SAVE_KEY);
  $("btn-start").classList.toggle("hidden", hasSave);
  $("btn-continue").classList.toggle("hidden", !hasSave);
  $("btn-newgame").classList.toggle("hidden", !hasSave);
}

function startGame() {
  AudioSys.ensure();
  AudioSys.startMusic();
  $("hud").classList.remove("hidden");
  updateHUD();
  showMap();
}

/* ── OVERWORLD (walkable path) ────────────────────────────── */
let mapPos = 0, mapPositions = [];

function showMap() {
  show("screen-map");
  applyTheme({ accent: "#d9a05b", particleHue: 38, particleDensity: 0.8, mood: 1 });
  updateHUD();
  buildOverworld();
}

function buildOverworld() {
  const path = $("map-path");
  const svg = $("map-path-svg");
  const n = STAGES.length;
  const spacing = 108, topPad = 54;
  const totalH = topPad * 2 + spacing * (n - 1);
  path.style.height = totalH + "px";
  svg.setAttribute("viewBox", `0 0 100 ${totalH}`);
  svg.setAttribute("preserveAspectRatio", "none");

  path.querySelectorAll(".map-node, .map-hero").forEach((el) => el.remove());

  mapPositions = STAGES.map((st, i) => ({
    x: 50 + Math.sin(i * 0.85) * 30,
    y: topPad + i * spacing,
  }));

  let d = `M ${mapPositions[0].x} ${mapPositions[0].y}`;
  for (let i = 1; i < mapPositions.length; i++) d += ` L ${mapPositions[i].x} ${mapPositions[i].y}`;
  svg.innerHTML = `<path d="${d}" fill="none" stroke="#7a5a34" stroke-width="1.6" stroke-dasharray="3 3"/>`;

  STAGES.forEach((st, i) => {
    const clearedIt = State.cleared >= st.id;
    const isNext = State.cleared + 1 === st.id;
    const node = document.createElement("button");
    node.className = "map-node " + (clearedIt ? "done" : isNext ? "next" : "locked");
    node.style.left = mapPositions[i].x + "%";
    node.style.top = mapPositions[i].y + "px";
    node.innerHTML = clearedIt || isNext
      ? `<span class="node-ico">${st.monster.sprite}</span>${clearedIt ? "<span class='node-check'>✔</span>" : ""}`
      : `<span class="node-ico">🔒</span>`;
    node.onclick = () => { AudioSys.sfx("click"); setMapPos(i); };
    path.appendChild(node);
  });

  const hero = document.createElement("div");
  hero.className = "map-hero";
  hero.id = "map-hero-token";
  hero.innerHTML = heroSprite(32);
  path.appendChild(hero);

  mapPos = Math.min(State.cleared, n - 1);
  updateMapHero();
}

function setMapPos(i) {
  const maxIdx = Math.min(State.cleared, STAGES.length - 1);
  const prev = mapPos;
  mapPos = Math.max(0, Math.min(i, maxIdx));
  if (mapPos !== prev) AudioSys.sfx("click");
  updateMapHero();
}

function updateMapHero() {
  const pos = mapPositions[mapPos];
  const hero = $("map-hero-token");
  hero.style.left = pos.x + "%";
  hero.style.top = pos.y - 30 + "px";
  hero.scrollIntoView({ behavior: "smooth", block: "center" });

  const isNextUnlocked = mapPos === State.cleared && State.cleared < STAGES.length;
  $("btn-map-enter").classList.toggle("hidden", !isNextUnlocked);
  $("btn-map-next").classList.toggle("hidden", isNextUnlocked);
  $("btn-map-prev").disabled = mapPos === 0;
}

/* ── HEARTS (per-trial, transient — reset every time a trial starts) ── */
const HEARTS_MAX = 3;
let heartsLeft = HEARTS_MAX;

function updateHearts() {
  const row = $("hearts-row");
  row.innerHTML = "";
  for (let i = 0; i < HEARTS_MAX; i++) {
    const h = document.createElement("span");
    h.className = "heart" + (i < heartsLeft ? "" : " lost");
    h.textContent = i < heartsLeft ? "❤️" : "🖤";
    row.appendChild(h);
  }
}

function loseHeart(st) {
  heartsLeft--;
  updateHearts();
  AudioSys.sfx("wrong");
  document.body.classList.add("crack-flash");
  $("hearts-row").classList.add("shake");
  setTimeout(() => document.body.classList.remove("crack-flash"), 500);
  setTimeout(() => $("hearts-row").classList.remove("shake"), 400);
  if (heartsLeft <= 0) setTimeout(() => resetLevel(st), 700);
}

/* Motes scatter outward from screen center, tinted with the current level's
   accent — fires the instant a puzzle resolves, ahead of the victory card. */
function glowBurst() {
  const color = getComputedStyle(document.body).getPropertyValue("--level-accent").trim() || "#ffd44d";
  for (let i = 0; i < 16; i++) {
    const m = document.createElement("div");
    m.className = "glow-mote";
    const angle = (i / 16) * Math.PI * 2 + Math.random() * 0.3;
    const dist = 60 + Math.random() * 70;
    m.style.setProperty("--mx", Math.cos(angle) * dist + "px");
    m.style.setProperty("--my", Math.sin(angle) * dist + "px");
    m.style.color = color;
    document.body.appendChild(m);
    setTimeout(() => m.remove(), 900);
  }
}

function resetLevel(st) {
  if (currentPuzzleEngine) currentPuzzleEngine.stop();
  toast("💔", "The trial resets...", "Steady your focus. Every clue you've already won stays with you.", "toast-red");
  enterLevel(st);
}

/* ── per-level atmosphere ─────────────────────────────────────
   Mutating `particleTheme` in place lets the always-running
   particle loop (startParticles, below) drift toward each new
   level's palette as old particles cycle out — no need to tear
   down and rebuild the canvas loop per level. ── */
let particleTheme = { hue: 265, density: 1 };

function applyTheme(theme) {
  document.body.style.setProperty("--level-accent", theme.accent);
  particleTheme.hue = theme.particleHue;
  particleTheme.density = theme.particleDensity;
  AudioSys.setMood(theme.mood || 1);
}

/* ── TRIAL FLOW: dialogue → puzzle → reward ─────────────────── */
const PUZZLE_ENGINES = {
  choice: ChoiceGrid, statecycle: StateCycle, sequence: SequenceInput,
  mirror: MirrorBeam, maze: Maze,
};

let currentStage = null;
let currentPuzzleEngine = null;
let typeTimer = null;

function enterLevel(st) {
  currentStage = st;
  show("screen-stage");
  applyTheme(st.theme);
  $("stage-header").textContent = `— TRIAL ${st.id} OF ${STAGES.length} —`;
  $("monster-sprite").textContent = st.monster.sprite;
  $("monster-sprite").className = "monster-sprite enter";
  $("monster-name").textContent = st.monster.name;
  $("monster-title").textContent = st.monster.title;
  $("monster-zone").classList.remove("hidden");
  $("dialogue-box").classList.remove("hidden");
  $("puzzle-zone").classList.add("hidden");

  heartsLeft = HEARTS_MAX;
  updateHearts();

  let line = 0;
  const showLine = () => {
    typewrite($("dialogue-text"), st.intro[line]);
    if (st.id === 1) {
      document.body.classList.add("shake");
      setTimeout(() => document.body.classList.remove("shake"), 400);
    }
  };
  $("btn-dialogue-next").onclick = () => {
    AudioSys.sfx("click");
    line++;
    if (line < st.intro.length) showLine();
    else beginPuzzle(st);
  };
  showLine();
}

function typewrite(el, text) {
  clearInterval(typeTimer);
  el.textContent = "";
  let i = 0;
  typeTimer = setInterval(() => {
    el.textContent = text.slice(0, ++i);
    if (i >= text.length) clearInterval(typeTimer);
  }, 18);
}

function beginPuzzle(st) {
  $("monster-zone").classList.add("hidden");
  $("dialogue-box").classList.add("hidden");
  $("puzzle-zone").classList.remove("hidden");
  $("puzzle-goal-name").textContent = st.monster.name;

  const engine = PUZZLE_ENGINES[st.puzzle.type];
  currentPuzzleEngine = engine;
  engine.start($("puzzle-mount"), st.puzzle.config, {
    onCorrect: () => onLevelWon(st),
    onSolved: () => onLevelWon(st),
    onWrong: () => loseHeart(st),
  });
}

function onLevelWon(st) {
  if (currentPuzzleEngine) currentPuzzleEngine.stop();
  AudioSys.sfx("correct");
  glowBurst();

  setTimeout(() => {
    State.cleared = Math.max(State.cleared, st.id);
    if (st.reward && !State.inv.includes(st.reward.id)) State.inv.push(st.reward.id);

    $("victory-monster").textContent = st.defeat;
    if (st.reward) {
      $("loot-icon").textContent = st.reward.icon;
      $("loot-name").textContent = st.reward.name + " acquired!";
    }
    $("xp-gain").textContent = `⭐ +${st.xp} XP`;
    $("overlay-victory").classList.remove("hidden");
    AudioSys.sfx("loot");

    gainXP(st.xp);
    checkAchievements();
    save();
    updateHUD();
  }, 500);
}

function findRelic(id) {
  for (const st of STAGES) if (st.reward && st.reward.id === id) return st.reward;
  return null;
}

/* ── INVENTORY ─────────────────────────────────────────────── */
function openInventory() {
  AudioSys.sfx("click");
  const grid = $("inv-grid");
  grid.innerHTML = "";
  $("inv-detail").classList.add("hidden");
  if (State.inv.length === 0) {
    grid.innerHTML = "<div class='inv-empty'>Your satchel is empty. Solve trials to collect relics.</div>";
  }
  State.inv.forEach((id, idx) => {
    const relic = findRelic(id);
    const b = document.createElement("button");
    b.className = "inv-slot";
    b.innerHTML = `<span class="inv-ico">${relic.icon}</span>`;
    b.onclick = () => {
      AudioSys.sfx("click");
      const det = $("inv-detail");
      det.classList.remove("hidden");
      det.innerHTML = `<div class="inv-det-name">${relic.icon} ${relic.name} <span class="inv-det-order">· won ${ordinal(idx + 1)}</span></div>
        <div class="inv-det-desc">${relic.desc}</div>`;
    };
    grid.appendChild(b);
  });
  $("overlay-inventory").classList.remove("hidden");
}

function ordinal(n) {
  const s = ["th", "st", "nd", "rd"], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/* ── FINALE CUTSCENE → VAULT ─────────────────────────────────
   Reuses the same fade-line staging as the opening runCutscene()
   and the same #screen-cutscene screen — its click-to-skip
   listener is always removed by the time end() fires during boot,
   so the element is inert and safe to reuse here. ── */
const FINALE_LINES = [
  "Eight relics settle into your satchel, glowing together for the first time.",
  "The Warden's wrappings unravel into dust, and do not return.",
  "A stone doorway rises from the sand, lit by nothing but moonlight.",
  "You have survived the First Descent.",
];

function runFinaleCutscene() {
  show("screen-cutscene");
  const box = $("cutscene-text");
  let i = 0;
  const next = () => {
    if (i >= FINALE_LINES.length) { showVault(); return; }
    box.textContent = FINALE_LINES[i];
    box.classList.remove("fade-line");
    void box.offsetWidth;
    box.classList.add("fade-line");
    i++;
    setTimeout(next, 2400);
  };
  setTimeout(next, 300);
}

/* ── particle background (per-level tinted embers + lanterns) ── */
function startParticles() {
  const canvas = $("particles");
  const ctx = canvas.getContext("2d");
  let W, H;
  const fit = () => { W = canvas.width = innerWidth; H = canvas.height = innerHeight; };
  fit();
  addEventListener("resize", fit);

  const parts = Array.from({ length: 40 }, () => spawn());
  function spawn() {
    const lantern = Math.random() < 0.12;
    return {
      x: Math.random() * W,
      y: H + Math.random() * H * 0.5,
      r: lantern ? 3 + Math.random() * 3 : 0.6 + Math.random() * 1.6,
      vy: lantern ? 0.15 + Math.random() * 0.2 : 0.3 + Math.random() * 0.7,
      vx: (Math.random() - 0.5) * 0.3,
      lantern,
      flicker: Math.random() * Math.PI * 2,
    };
  }

  (function loop() {
    ctx.clearRect(0, 0, W, H);
    parts.forEach((p, i) => {
      p.y -= p.vy;
      p.x += p.vx + Math.sin(p.flicker += 0.02) * 0.15;
      if (p.y < -20) parts[i] = spawn();
      const hue = p.lantern ? 45 : particleTheme.hue;
      const alpha = Math.min(1, (p.lantern ? 0.5 + Math.sin(p.flicker * 3) * 0.2 : 0.35) * particleTheme.density);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${hue}, 90%, ${p.lantern ? 65 : 70}%, ${alpha})`;
      ctx.shadowBlur = p.lantern ? 14 : 6;
      ctx.shadowColor = `hsla(${hue}, 90%, 60%, 0.8)`;
      ctx.fill();
      ctx.shadowBlur = 0;
    });
    requestAnimationFrame(loop);
  })();
}

/* ── init ──────────────────────────────────────────────────── */
function init() {
  startParticles();

  $("btn-start").onclick = () => { AudioSys.sfx("click"); startGame(); };
  $("btn-continue").onclick = () => { AudioSys.sfx("click"); load(); startGame(); };
  $("btn-newgame").onclick = () => {
    if (!confirm("Start a new descent? Your saved progress will be erased.")) return;
    wipeSave();
    Object.assign(State, { cleared: 0, xp: 0, level: 1, inv: [], ach: [] });
    startGame();
  };

  $("btn-victory-continue").onclick = () => {
    AudioSys.sfx("click");
    $("overlay-victory").classList.add("hidden");
    if (currentStage && currentStage.isFinale) runFinaleCutscene();
    else showMap();
  };

  $("btn-inventory").onclick = openInventory;
  $("btn-inv-close").onclick = () => $("overlay-inventory").classList.add("hidden");

  $("btn-sound").onclick = () => { $("btn-sound").textContent = AudioSys.toggleSfx() ? "🔊" : "🔇"; };
  $("btn-music").onclick = () => { AudioSys.ensure(); $("btn-music").textContent = AudioSys.toggleMusic() ? "🎵" : "🔕"; };

  // Overworld movement
  $("btn-map-prev").onclick = () => setMapPos(mapPos - 1);
  $("btn-map-next").onclick = () => setMapPos(mapPos + 1);
  $("btn-map-enter").onclick = () => { AudioSys.sfx("click"); enterLevel(STAGES[mapPos]); };

  load();
  runLoading();
}

document.addEventListener("DOMContentLoaded", init);
