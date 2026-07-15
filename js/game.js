/* ═══════════════════════════════════════════════════════════════
   GAME ENGINE — screens, state, saving, HUD, the walkable
   overworld, the platform-run → combat stage flow, and the
   Birthday Vault ending.
   ═══════════════════════════════════════════════════════════════ */

const SAVE_KEY = "shadowvault_save_v2";

const State = {
  cleared: 0,          // highest stage completed (0 = none)
  xp: 0,
  level: 1,
  hp: 100, maxHp: 100,
  mp: 50,  maxMp: 50,
  inv: [],             // relic ids, in the order they were won
  ach: [],             // unlocked achievement ids
};

const $ = (id) => document.getElementById(id);

/* ── save / load ───────────────────────────────────────────── */
function save() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(State)); } catch (e) { /* private mode etc. */ }
}
function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    Object.assign(State, JSON.parse(raw));
    State.inv = [...new Set(State.inv)];
    return true;
  } catch (e) { return false; }
}
function wipeSave() { localStorage.removeItem(SAVE_KEY); }

/* ── screen switching ──────────────────────────────────────── */
function show(screenId) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  $(screenId).classList.add("active");
}

/* ── HUD ───────────────────────────────────────────────────── */
function levelFor(xp) {
  let lvl = 1;
  for (let i = 0; i < LEVEL_CURVE.length; i++) if (xp >= LEVEL_CURVE[i]) lvl = i + 1;
  return lvl;
}

function updateHUD() {
  $("hp-fill").style.width = (State.hp / State.maxHp) * 100 + "%";
  $("mp-fill").style.width = (State.mp / State.maxMp) * 100 + "%";
  $("hp-num").textContent = State.hp;
  $("mp-num").textContent = State.mp;
  $("xp-num").textContent = State.xp + " XP";
  $("lvl-num").textContent = "Lv." + State.level;
  $("inv-count").textContent = State.inv.length;
  const next = Math.min(State.cleared + 1, 16);
  $("hud-stage").textContent = `Stage ${next}/16 · ${State.cleared}/16 ✦`;
}

/* ── toasts (achievements, level ups, warnings) ────────────── */
function toast(icon, title, text, cls = "") {
  const t = document.createElement("div");
  t.className = "toast " + cls;
  t.innerHTML = `<span class="toast-ico">${icon}</span><div><div class="toast-title">${title}</div><div class="toast-text">${text}</div></div>`;
  $("toast-zone").appendChild(t);
  setTimeout(() => t.classList.add("out"), 3400);
  setTimeout(() => t.remove(), 3900);
}

function checkAchievements() {
  ACHIEVEMENTS.forEach((a) => {
    if (State.cleared >= a.after && !State.ach.includes(a.id)) {
      State.ach.push(a.id);
      AudioSys.sfx("levelup");
      toast(a.icon, "ACHIEVEMENT · " + a.title, a.text, "toast-gold");
    }
  });
}

function gainXP(amount) {
  const before = State.level;
  State.xp += amount;
  State.level = levelFor(State.xp);
  if (State.level > before) {
    AudioSys.sfx("levelup");
    toast("⬆️", "LEVEL UP!", `You are now Level ${State.level}. The kingdom celebrates your sixteenth year.`, "toast-gold");
    State.maxHp += 10; State.hp = State.maxHp;
    State.maxMp += 5;  State.mp = State.maxMp;
    document.body.classList.add("levelup-flash");
    setTimeout(() => document.body.classList.remove("levelup-flash"), 900);
  }
  updateHUD();
}

/* Floating damage/heal number over an element */
function floatNum(overEl, text, cls) {
  const rect = overEl.getBoundingClientRect();
  const f = document.createElement("div");
  f.className = "float-num " + cls;
  f.textContent = text;
  f.style.left = rect.left + rect.width / 2 + (Math.random() * 40 - 20) + "px";
  f.style.top = rect.top + rect.height / 3 + "px";
  document.body.appendChild(f);
  setTimeout(() => f.remove(), 1100);
}

/* ── LOADING SCREEN ────────────────────────────────────────── */
const LOADING_TIPS = [
  "Sharpening rusty swords...",
  "Bribing goblin scouts...",
  "Untangling spider silk...",
  "Polishing the Sixteenth Gate...",
  "Waking ancient wizards (carefully)...",
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
  "the Shadow Vault has remained sealed.",
  "Legends spoke of a chosen hero...",
  "born under the Sixteenth Gate.",
  "Today...",
  "you awaken.",
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
  svg.innerHTML = `<path d="${d}" fill="none" stroke="#3a4080" stroke-width="1.6" stroke-dasharray="3 3"/>`;

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
  hero.textContent = "🧝";
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

/* ── STAGE FLOW: dialogue → platform run → real-time combat ── */
let currentStage = null;
let typeTimer = null;

function enterStage(st) {
  currentStage = st;
  show("screen-stage");
  $("stage-header").textContent = `— GATE ${st.id} OF 16 —`;
  $("monster-sprite").textContent = st.monster.sprite;
  $("monster-sprite").className = "monster-sprite enter";
  $("monster-name").textContent = st.monster.name;
  $("monster-title").textContent = st.monster.title;
  $("monster-zone").classList.remove("hidden");
  $("dialogue-box").classList.remove("hidden");
  $("platform-zone").classList.add("hidden");
  if (st.id === 16) AudioSys.sfx("boss");

  let line = 0;
  const showLine = () => typewrite($("dialogue-text"), st.intro[line]);
  $("btn-dialogue-next").onclick = () => {
    AudioSys.sfx("click");
    line++;
    if (line < st.intro.length) showLine();
    else beginPlatform(st);
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

function beginPlatform(st) {
  $("monster-zone").classList.add("hidden");
  $("dialogue-box").classList.add("hidden");
  $("platform-zone").classList.remove("hidden");
  $("platform-goal-name").textContent = st.monster.name;

  Platformer.start($("platform-canvas"), st.level, {
    onComplete: () => beginCombat(st),
    onHit: (dmg) => {
      State.hp = Math.max(1, State.hp + dmg);
      updateHUD();
      document.body.classList.add("hurt-flash");
      setTimeout(() => document.body.classList.remove("hurt-flash"), 350);
    },
  });
}

function drawBattleBars() {
  $("boss-hp-fill").style.width = Math.max(0, (Combat.bossHp / Combat.bossMax) * 100) + "%";
  $("hero-hp-fill").style.width = Math.max(0, (State.hp / State.maxHp) * 100) + "%";
}
function logBattle(text) { $("battle-log").textContent = text; }
function setActions(enabled) {
  ["btn-attack", "btn-spell", "btn-dodge", "btn-relic"].forEach((id) => ($(id).disabled = !enabled));
}

function beginCombat(st) {
  Platformer.stop();
  $("platform-zone").classList.add("hidden");
  // A safety net so a rough platform run never dumps the hero into a fight near death.
  State.hp = Math.max(State.hp, Math.floor(State.maxHp * 0.2));
  updateHUD();

  show("screen-battle");
  $("boss-sprite").className = "boss-sprite";
  $("boss-sprite").textContent = st.monster.sprite;
  $("boss-name").textContent = st.monster.name;
  $("battle-lvl").textContent = State.level;
  $("btn-relic").classList.toggle("hidden", st.id !== 16);
  logBattle(st.id === 16
    ? "\"You stand before me at last. Show me what fifteen relics have made of you.\""
    : `${st.monster.name} bares its strength. Fight!`);
  drawBattleBars();
  setActions(true);

  Combat.start(st.fight, {
    onTelegraph: () => {
      $("boss-sprite").classList.add("telegraph");
      logBattle(`${st.monster.name} winds up — DODGE!`);
    },
    onStrikeResolved: () => { $("boss-sprite").classList.remove("telegraph"); },
    onDodgeSuccess: () => {
      floatNum($("hero-sprite"), "DODGED!", "float-heal");
      AudioSys.sfx("click");
      logBattle("You slip past the blow just in time!");
    },
    onHeroHit: (dmg) => {
      State.hp = Math.max(0, State.hp - dmg);
      AudioSys.sfx("hit");
      document.body.classList.add("hurt-flash");
      setTimeout(() => document.body.classList.remove("hurt-flash"), 350);
      floatNum($("hero-sprite"), "-" + dmg, "float-dmg");
      logBattle("The blow lands. That's going to leave a mark.");
      drawBattleBars();
      updateHUD();
      if (State.hp <= 0) {
        State.hp = Math.floor(State.maxHp / 2);
        toast("💫", "You have fallen...", "...but heroes rise again. The relics lend you strength.", "toast-red");
        drawBattleBars();
        updateHUD();
      }
    },
    onVictory: () => { setActions(false); onStageWon(st); },
  });
}

function onStageWon(st) {
  if (st.id === 16) { winFinalBattle(st); return; }

  AudioSys.sfx("correct");
  const sprite = $("boss-sprite");
  sprite.classList.add("boss-death-small");
  floatNum(sprite, "DEFEATED!", "float-crit");

  setTimeout(() => {
    State.cleared = Math.max(State.cleared, st.id);
    if (st.reward && !State.inv.includes(st.reward.id)) State.inv.push(st.reward.id);
    State.mp = Math.min(State.maxMp, State.mp + 10);

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
  }, 900);
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
    grid.innerHTML = "<div class='inv-empty'>Your satchel is empty. Defeat monsters to collect relics.</div>";
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

/* ── FINAL BATTLE WIN → VAULT ─────────────────────────────── */
function winFinalBattle(st) {
  AudioSys.sfx("crit");
  const boss = $("boss-sprite");
  boss.classList.add("boss-death");
  logBattle("\"The Sixteenth Gate... has opened. The Vault... is... yours...\"");
  document.body.classList.add("explosion-flash");
  setTimeout(() => document.body.classList.remove("explosion-flash"), 1200);

  State.cleared = 16;
  gainXP(st.xp);
  checkAchievements();
  save();

  setTimeout(showVault, 2600);
}

/* ── THE BIRTHDAY VAULT ────────────────────────────────────── */
function showVault() {
  show("screen-vault");
  AudioSys.sfx("vault");
  const door = $("vault-door");
  const text = $("vault-text");
  text.textContent = "The Birthday Vault stirs after sixteen years...";

  setTimeout(() => { door.classList.add("opening"); text.textContent = "The Vault Key turns on its own..."; }, 1800);
  setTimeout(() => {
    door.classList.add("open");
    text.textContent = "Inside: treasure chests, glowing gold. Tap each to open.";
    buildChests();
  }, 4200);
}

function buildChests() {
  const row = $("chest-row");
  row.classList.remove("hidden");
  row.innerHTML = "";
  let opened = 0;

  CONFIG.vaultRewards.forEach((reward) => {
    const c = document.createElement("button");
    c.className = "chest";
    c.innerHTML = `<span class="chest-closed">🎁</span><span class="chest-open hidden"></span>`;
    c.onclick = () => {
      if (c.classList.contains("opened")) return;
      c.classList.add("opened");
      AudioSys.sfx("chest");
      c.querySelector(".chest-closed").classList.add("hidden");
      const openFace = c.querySelector(".chest-open");
      openFace.classList.remove("hidden");
      openFace.innerHTML = `<span class="chest-ico">${reward.icon}</span>`;
      toast(reward.icon, reward.name, reward.desc, "toast-gold");
      opened++;
      if (opened === CONFIG.vaultRewards.length) setTimeout(showFinale, 1400);
    };
    row.appendChild(c);
  });
}

function showFinale() {
  AudioSys.sfx("fanfare");
  const fin = $("vault-finale");
  fin.classList.remove("hidden");
  fin.innerHTML = `
    <div class="finale-burst">🎉</div>
    <h1 class="finale-title">HAPPY 16TH BIRTHDAY!</h1>
    <p class="finale-sub">Congratulations, ${CONFIG.heroName}. You have completed the Shadow Vault.</p>
    <div class="finale-message">「 ${CONFIG.realTreasureMessage} 」</div>
    <button class="btn btn-primary" id="btn-credits">⚔ CREDITS</button>`;
  confettiBurst();
  $("btn-credits").onclick = showCredits;
}

/* ── CREDITS ───────────────────────────────────────────────── */
function showCredits() {
  show("screen-credits");
  const relicList = State.inv.map((id) => {
    const r = findRelic(id);
    return `<div class="credit-line">${r.icon} ${r.name}</div>`;
  }).join("");
  $("credits-scroll").innerHTML = `
    <div class="credit-heading">LEVEL 16<br>THE SHADOW VAULT</div>
    <div class="credit-role">STARRING</div>
    <div class="credit-line">🧝 ${CONFIG.heroName} — the Chosen One, age 16</div>
    <div class="credit-role">FEATURING THE DEFEATED</div>
    ${STAGES.map((s) => `<div class="credit-line">${s.monster.sprite} ${s.monster.name}</div>`).join("")}
    <div class="credit-role">RELICS RECOVERED</div>
    ${relicList}
    <div class="credit-role">FINAL STATS</div>
    <div class="credit-line">⭐ ${State.xp} XP · Lv.${State.level} · 16/16 Gates</div>
    <div class="credit-heading small">${CONFIG.creditsFrom}</div>
    <button class="btn btn-ghost" id="btn-back-title">↩ TITLE SCREEN</button>`;
  $("btn-back-title").onclick = showTitle;
}

/* ── confetti ──────────────────────────────────────────────── */
function confettiBurst() {
  const COLORS = ["#ffd700", "#b98aff", "#7cf7ff", "#ff8ac2", "#9dff8a"];
  for (let i = 0; i < 80; i++) {
    const c = document.createElement("div");
    c.className = "confetti";
    c.style.left = Math.random() * 100 + "vw";
    c.style.background = COLORS[i % COLORS.length];
    c.style.animationDelay = Math.random() * 1.2 + "s";
    c.style.animationDuration = 2.2 + Math.random() * 1.8 + "s";
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 4500);
  }
}

/* ── particle background (embers + floating lanterns) ──────── */
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
      hue: lantern ? 45 : 265 + Math.random() * 40,
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
      const alpha = p.lantern ? 0.5 + Math.sin(p.flicker * 3) * 0.2 : 0.35;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 90%, ${p.lantern ? 65 : 70}%, ${alpha})`;
      ctx.shadowBlur = p.lantern ? 14 : 6;
      ctx.shadowColor = `hsla(${p.hue}, 90%, 60%, 0.8)`;
      ctx.fill();
      ctx.shadowBlur = 0;
    });
    requestAnimationFrame(loop);
  })();
}

/* ── touch-button "hold" helper (for the platformer d-pad) ──── */
function bindHold(el, onDown, onUp) {
  const down = (e) => { e.preventDefault(); onDown(); };
  const up = (e) => { e.preventDefault(); onUp(); };
  el.addEventListener("pointerdown", down);
  el.addEventListener("pointerup", up);
  el.addEventListener("pointerleave", up);
  el.addEventListener("pointercancel", up);
}

/* ── init ──────────────────────────────────────────────────── */
function init() {
  startParticles();

  $("btn-start").onclick = () => { AudioSys.sfx("click"); startGame(); };
  $("btn-continue").onclick = () => { AudioSys.sfx("click"); load(); startGame(); };
  $("btn-newgame").onclick = () => {
    if (!confirm("Start a new quest? Your saved progress will be erased.")) return;
    wipeSave();
    Object.assign(State, { cleared: 0, xp: 0, level: 1, hp: 100, maxHp: 100, mp: 50, maxMp: 50, inv: [], ach: [] });
    startGame();
  };

  $("btn-victory-continue").onclick = () => {
    AudioSys.sfx("click");
    $("overlay-victory").classList.add("hidden");
    showMap();
  };

  $("btn-inventory").onclick = openInventory;
  $("btn-inv-close").onclick = () => $("overlay-inventory").classList.add("hidden");

  $("btn-sound").onclick = () => { $("btn-sound").textContent = AudioSys.toggleSfx() ? "🔊" : "🔇"; };
  $("btn-music").onclick = () => { AudioSys.ensure(); $("btn-music").textContent = AudioSys.toggleMusic() ? "🎵" : "🔕"; };

  // Overworld movement
  $("btn-map-prev").onclick = () => setMapPos(mapPos - 1);
  $("btn-map-next").onclick = () => setMapPos(mapPos + 1);
  $("btn-map-enter").onclick = () => { AudioSys.sfx("click"); enterStage(STAGES[mapPos]); };

  // Platform run touch controls (press-and-hold)
  bindHold($("pf-left"), () => Platformer.setKey("left", true), () => Platformer.setKey("left", false));
  bindHold($("pf-right"), () => Platformer.setKey("right", true), () => Platformer.setKey("right", false));
  bindHold($("pf-jump"), () => Platformer.setKey("jump", true), () => Platformer.setKey("jump", false));

  // Combat controls
  $("btn-attack").onclick = () => {
    const res = Combat.attack();
    if (!res) return;
    AudioSys.sfx(res.critical ? "crit" : "hit");
    const boss = $("boss-sprite");
    boss.classList.add("hit");
    setTimeout(() => boss.classList.remove("hit"), 300);
    floatNum(boss, (res.critical ? "CRIT -" : "-") + res.dmg, res.critical ? "float-crit" : "float-dmg");
    drawBattleBars();
    logBattle(res.critical ? "A CRITICAL STRIKE!" : "You land a solid hit!");
  };
  $("btn-spell").onclick = () => {
    if (!Combat.canSpell(State.mp)) return;
    State.mp -= Combat.SPELL_MP_COST;
    updateHUD();
    const res = Combat.spell();
    if (!res) return;
    AudioSys.sfx(res.critical ? "crit" : "hit");
    floatNum($("boss-sprite"), (res.critical ? "CRIT -" : "-") + res.dmg, "float-crit");
    drawBattleBars();
    logBattle("Arcane energy tears through the air!");
  };
  $("btn-dodge").onclick = () => {
    Combat.dodge();
    $("btn-dodge").classList.add("dodge-flash");
    setTimeout(() => $("btn-dodge").classList.remove("dodge-flash"), 250);
    AudioSys.sfx("click");
  };
  $("btn-relic").onclick = () => {
    const res = Combat.relicBurst(45);
    if (!res) return;
    AudioSys.sfx("loot");
    floatNum($("boss-sprite"), "-" + res.dmg, "float-crit");
    drawBattleBars();
    logBattle("All fifteen relics ignite in a spear of golden light!");
    $("btn-relic").disabled = true;
  };

  load();
  runLoading();
}

document.addEventListener("DOMContentLoaded", init);
