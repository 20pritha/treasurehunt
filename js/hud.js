/* ═══════════════════════════════════════════════════════════════
   HUD — DOM lookup helper, screen switching, stat bars, toasts,
   achievements, and XP/level-up handling.
   ═══════════════════════════════════════════════════════════════ */

const $ = (id) => document.getElementById(id);

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
