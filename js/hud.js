/* ═══════════════════════════════════════════════════════════════
   HUD — DOM lookup helper, screen switching, stat bars, toasts,
   achievements, and XP/level-up handling.
   ═══════════════════════════════════════════════════════════════ */

const $ = (id) => document.getElementById(id);

/* ── hero sprite: a small hand-authored pixel-art human, drawn in
   inline SVG (no image assets, stays offline). The tunic reads
   the current --level-accent so it tints per trial like everything
   else; hair/skin/pants/boots stay fixed. Used anywhere the hero
   is shown on screen — the overworld token, the maze player tile,
   the credits line. ── */
function heroSprite(size) {
  return `<svg viewBox="0 0 10 14" width="${size}" height="${size}" style="image-rendering:pixelated" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="0" width="4" height="1" fill="#2a2a3a"/>
    <rect x="2" y="1" width="6" height="1" fill="#2a2a3a"/>
    <rect x="2" y="2" width="1" height="1" fill="#2a2a3a"/>
    <rect x="7" y="2" width="1" height="1" fill="#2a2a3a"/>
    <rect x="3" y="2" width="4" height="2" fill="#e8b98a"/>
    <rect x="3" y="4" width="4" height="1" style="fill:var(--level-accent)"/>
    <rect x="2" y="5" width="6" height="1" style="fill:var(--level-accent)"/>
    <rect x="1" y="6" width="8" height="2" style="fill:var(--level-accent)"/>
    <rect x="2" y="8" width="6" height="1" fill="#ffd44d"/>
    <rect x="3" y="9" width="4" height="3" fill="#3a3550"/>
    <rect x="2" y="12" width="6" height="1" fill="#1c1a24"/>
  </svg>`;
}

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
  $("xp-num").textContent = State.xp + " XP";
  $("lvl-num").textContent = "Lv." + State.level;
  $("inv-count").textContent = State.inv.length;
  const next = Math.min(State.cleared + 1, STAGES.length);
  $("hud-stage").textContent = `Trial ${next}/${STAGES.length} · ${State.cleared}/${STAGES.length} ✦`;
}

/* ── toasts (achievements, level ups, warnings) ────────────── */
function toast(icon, title, text, cls = "") {
  const t = document.createElement("div");
  t.className = "toast " + cls;
  const ico = document.createElement("span");
  ico.className = "toast-ico";
  ico.textContent = icon;
  const body = document.createElement("div");
  const titleEl = document.createElement("div");
  titleEl.className = "toast-title";
  titleEl.textContent = title;
  const textEl = document.createElement("div");
  textEl.className = "toast-text";
  textEl.textContent = text;
  body.append(titleEl, textEl);
  t.append(ico, body);
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
    document.body.classList.add("levelup-flash");
    setTimeout(() => document.body.classList.remove("levelup-flash"), 900);
  }
  updateHUD();
}
