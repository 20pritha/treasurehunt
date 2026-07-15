/* ═══════════════════════════════════════════════════════════════
   GAME ENGINE — boot sequence, the walkable overworld, and the
   Part 1 (traversal) → Part 2 (confrontation) stage flow. State/
   save lives in save.js, HUD/toasts in hud.js, the ending sequence
   in vault.js.
   ═══════════════════════════════════════════════════════════════ */

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

/* ── shared damage handlers ──────────────────────────────────
   Part 1 (traversal) mistakes are forgiving: chip HP, never drop
   below 1, no floating combat text (no boss on screen yet).
   Part 2 (confrontation) mistakes hurt more and can trigger the
   "you have fallen... but heroes rise again" recovery, same as
   the original real-time combat behavior. Shared across Combat,
   Duel, and Mash so each doesn't reimplement the clamp/toast. ── */
function part1Hit(dmg) {
  State.hp = Math.max(1, State.hp - dmg);
  updateHUD();
  document.body.classList.add("hurt-flash");
  setTimeout(() => document.body.classList.remove("hurt-flash"), 350);
}

function heroTakesDamage(dmg) {
  State.hp = Math.max(0, State.hp - dmg);
  AudioSys.sfx("hit");
  document.body.classList.add("hurt-flash");
  setTimeout(() => document.body.classList.remove("hurt-flash"), 350);
  floatNum($("hero-sprite"), "-" + dmg, "float-dmg");
  updateHUD();
  if (State.hp <= 0) {
    State.hp = Math.floor(State.maxHp / 2);
    toast("💫", "You have fallen...", "...but heroes rise again. The relics lend you strength.", "toast-red");
    updateHUD();
  }
}

/* ── STAGE FLOW: dialogue → Part 1 → Part 2 ─────────────────── */
let currentStage = null;
let typeTimer = null;

function enterStage(st) {
  currentStage = st;
  show("screen-stage");
  $("stage-header").textContent = `— GATE ${st.id} OF ${STAGES.length} —`;
  $("monster-sprite").textContent = st.monster.sprite;
  $("monster-sprite").className = "monster-sprite enter";
  $("monster-name").textContent = st.monster.name;
  $("monster-title").textContent = st.monster.title;
  $("monster-zone").classList.remove("hidden");
  $("dialogue-box").classList.remove("hidden");
  $("platform-zone").classList.add("hidden");
  if (st.isFinale) AudioSys.sfx("boss");

  let line = 0;
  const showLine = () => typewrite($("dialogue-text"), st.intro[line]);
  $("btn-dialogue-next").onclick = () => {
    AudioSys.sfx("click");
    line++;
    if (line < st.intro.length) showLine();
    else beginPart1(st);
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

function beginPart1(st) {
  $("monster-zone").classList.add("hidden");
  $("dialogue-box").classList.add("hidden");
  $("platform-zone").classList.remove("hidden");
  $("platform-goal-name").textContent = st.monster.name;

  const type = st.part1.type;
  $("platform-canvas").classList.toggle("hidden", type !== "runner");
  $("part1-mount").classList.toggle("hidden", type === "runner");
  $("part1-action").textContent = type === "runner" ? "JUMP!" : "TAP!";
  $("part1-action").onpointerdown = null;

  if (type === "runner") {
    $("part1-action").onpointerdown = (e) => { e.preventDefault(); Platformer.requestJump(); };
    Platformer.start($("platform-canvas"), st.part1.config, {
      onComplete: () => beginPart2(st),
      onHit: (dmg) => part1Hit(dmg),
    });
  } else {
    TimedTap.start($("part1-mount"), $("part1-action"), st.part1.config, {
      onRepResult: (pass, dmg) => { if (!pass) part1Hit(dmg); },
      onSequenceEnd: () => beginPart2(st),
    });
  }
}

function drawBattleBars() {
  $("boss-hp-fill").style.width = Math.max(0, (Combat.bossHp / Combat.bossMax) * 100) + "%";
  $("hero-hp-fill").style.width = Math.max(0, (State.hp / State.maxHp) * 100) + "%";
}
function logBattle(text) { $("battle-log").textContent = text; }
function setActions(enabled) {
  ["btn-attack", "btn-spell", "btn-dodge", "btn-relic"].forEach((id) => ($(id).disabled = !enabled));
}

function beginPart2(st) {
  Platformer.stop();
  $("platform-zone").classList.add("hidden");
  // A safety net so a rough Part 1 never dumps the hero into a fight near death.
  State.hp = Math.max(State.hp, Math.floor(State.maxHp * 0.2));
  updateHUD();

  show("screen-battle");
  $("boss-sprite").className = "boss-sprite";
  $("boss-sprite").textContent = st.monster.sprite;
  $("boss-name").textContent = st.monster.name;
  $("battle-lvl").textContent = State.level;
  $("btn-relic").classList.toggle("hidden", !st.isFinale);

  const type = st.part2.type;
  $("battle-actions-combat").classList.toggle("hidden", type !== "combat");
  $("battle-actions-timedtap").classList.toggle("hidden", type === "combat");

  logBattle(st.isFinale
    ? "\"You stand before me at last. Show me what seven relics have made of you.\""
    : `${st.monster.name} bares its strength. Fight!`);

  if (type === "combat") {
    drawBattleBars();
    setActions(true);
    Combat.start(st.part2.config, {
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
        heroTakesDamage(dmg);
        logBattle("The blow lands. That's going to leave a mark.");
        drawBattleBars();
      },
      onVictory: () => { setActions(false); onStageWon(st); },
    });
  } else if (type === "duel") {
    $("hero-hp-fill").style.width = (State.hp / State.maxHp) * 100 + "%";
    $("boss-hp-fill").style.width = "100%";
    $("part2-action").textContent = "TAP!";
    TimedTap.start($("part2-mount"), $("part2-action"), st.part2.config, {
      onRepResult: (pass, dmg) => {
        if (pass) {
          AudioSys.sfx("hit");
          const boss = $("boss-sprite");
          boss.classList.add("hit");
          setTimeout(() => boss.classList.remove("hit"), 300);
          floatNum(boss, "-" + dmg, "float-dmg");
          logBattle("A solid strike lands!");
        } else {
          heroTakesDamage(dmg);
          logBattle("Mistimed! The blow gets through.");
        }
      },
      onProgress: ({ bossHp, bossMax }) => {
        $("boss-hp-fill").style.width = Math.max(0, (bossHp / bossMax) * 100) + "%";
      },
      onSequenceEnd: () => onStageWon(st),
    });
  } else if (type === "mash") {
    $("part2-action").textContent = "TAP FAST!";
    Mash.start($("part2-mount"), $("part2-action"), st.part2.config, {
      onProgress: ({ heroPct, bossPct }) => {
        $("hero-hp-fill").style.width = heroPct + "%";
        $("boss-hp-fill").style.width = bossPct + "%";
      },
      onRepResult: (pass) => {
        if (pass) { AudioSys.sfx("correct"); logBattle("Your power overwhelms them!"); }
        else { heroTakesDamage(st.part2.config.missDmg); logBattle("They out-muscle you — brace!"); }
      },
      onSequenceEnd: () => onStageWon(st),
    });
  }
}

function onStageWon(st) {
  if (st.isFinale) { winFinalBattle(st); return; }

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

  State.cleared = STAGES.length;
  gainXP(st.xp);
  checkAchievements();
  save();

  setTimeout(showVault, 2600);
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

  // Combat controls (Part 2 "combat" type; Duel/Mash bind their own action button internally)
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
    logBattle("All seven relics ignite in a spear of golden light!");
    $("btn-relic").disabled = true;
  };

  load();
  runLoading();
}

document.addEventListener("DOMContentLoaded", init);
