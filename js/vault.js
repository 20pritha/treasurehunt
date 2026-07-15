/* ═══════════════════════════════════════════════════════════════
   VAULT — the Birthday Vault ending: door, chests, finale message,
   and credits scroll.
   ═══════════════════════════════════════════════════════════════ */

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
      const ico = document.createElement("span");
      ico.className = "chest-ico";
      ico.textContent = reward.icon;
      openFace.replaceChildren(ico);
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
  fin.innerHTML = "";

  const burst = document.createElement("div");
  burst.className = "finale-burst";
  burst.textContent = "🎉";

  const title = document.createElement("h1");
  title.className = "finale-title";
  title.textContent = "HAPPY 16TH BIRTHDAY!";

  const sub = document.createElement("p");
  sub.className = "finale-sub";
  sub.textContent = `Congratulations, ${CONFIG.heroName}. You have completed the Shadow Vault.`;

  const message = document.createElement("div");
  message.className = "finale-message";
  message.textContent = `「 ${CONFIG.realTreasureMessage} 」`;

  const btn = document.createElement("button");
  btn.className = "btn btn-primary";
  btn.id = "btn-credits";
  btn.textContent = "⚔ CREDITS";
  btn.onclick = showCredits;

  fin.append(burst, title, sub, message, btn);
  confettiBurst();
}

/* ── CREDITS ───────────────────────────────────────────────── */
function creditLine(text) {
  const el = document.createElement("div");
  el.className = "credit-line";
  el.textContent = text;
  return el;
}
function creditRole(text) {
  const el = document.createElement("div");
  el.className = "credit-role";
  el.textContent = text;
  return el;
}

function showCredits() {
  show("screen-credits");
  const scroll = $("credits-scroll");
  scroll.innerHTML = "";

  const heading = document.createElement("div");
  heading.className = "credit-heading";
  heading.innerHTML = "LEVEL 16<br>THE SHADOW VAULT";

  const back = document.createElement("button");
  back.className = "btn btn-ghost";
  back.id = "btn-back-title";
  back.textContent = "↩ TITLE SCREEN";
  back.onclick = showTitle;

  const smallHeading = document.createElement("div");
  smallHeading.className = "credit-heading small";
  smallHeading.textContent = CONFIG.creditsFrom;

  scroll.append(
    heading,
    creditRole("STARRING"),
    creditLine(`🧝 ${CONFIG.heroName} — the Chosen One, age 16`),
    creditRole("FEATURING THE DEFEATED"),
    ...STAGES.map((s) => creditLine(`${s.monster.sprite} ${s.monster.name}`)),
    creditRole("RELICS RECOVERED"),
    ...State.inv.map((id) => { const r = findRelic(id); return creditLine(`${r.icon} ${r.name}`); }),
    creditRole("FINAL STATS"),
    creditLine(`⭐ ${State.xp} XP · Lv.${State.level} · ${STAGES.length}/${STAGES.length} Gates`),
    smallHeading,
    back
  );
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
