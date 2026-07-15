/* ═══════════════════════════════════════════════════════════════
   TIMEDTAP — shared "tap the one button at the right moment" engine
   for Rhythm, Dodge (Part 1) and Duel (Part 2). Every mode is the
   same loop: schedule a cue, open a judge window, resolve on tap
   or timeout, repeat. Mash (below) is a separate object — it's a
   continuous fill-race with no discrete window, so it doesn't fit
   this state machine.
   ═══════════════════════════════════════════════════════════════ */

const TimedTap = {
  container: null, actionBtn: null, config: null, mode: null,
  active: false, timers: [], raf: null,
  rep: 0, cycleStart: 0, windowOpen: false, locked: false,
  bossHp: 0, bossMax: 0,
  onRepResult: null, onSequenceEnd: null, onProgress: null,

  start(container, actionBtn, config, callbacks) {
    this.container = container;
    this.actionBtn = actionBtn;
    this.config = config;
    this.mode = config.mode;
    this.active = true;
    this.rep = 0;
    this.locked = false;
    Object.assign(this, { onRepResult: null, onSequenceEnd: null, onProgress: null }, callbacks);

    if (this.mode === "duel") this.bossHp = this.bossMax = config.hp;

    this._buildDOM();
    this._down = (e) => { e.preventDefault(); this._tap(); };
    this.actionBtn.addEventListener("pointerdown", this._down);

    if (this.mode === "duel") this._loopDuel();
    else this._nextCue();
  },

  stop() {
    this.active = false;
    this.timers.forEach((t) => clearTimeout(t));
    this.timers = [];
    if (this.raf) cancelAnimationFrame(this.raf);
    this.actionBtn.removeEventListener("pointerdown", this._down);
  },

  _buildDOM() {
    this.container.innerHTML = "";
    if (this.mode === "rhythm") {
      this.runeEl = document.createElement("div");
      this.runeEl.className = "tt-rune";
      this.runeEl.textContent = "◈";
      this.container.appendChild(this.runeEl);
    } else if (this.mode === "dodge") {
      const lane = document.createElement("div");
      lane.className = "tt-lane";
      this.hazardEl = document.createElement("div");
      this.hazardEl.className = "tt-hazard";
      this.hazardEl.textContent = "☄️";
      const zone = document.createElement("div");
      zone.className = "tt-zone";
      lane.append(this.hazardEl, zone);
      this.container.appendChild(lane);
    } else if (this.mode === "duel") {
      const track = document.createElement("div");
      track.className = "bar tt-sweep-track";
      const zone = document.createElement("div");
      zone.className = "tt-sweep-zone";
      const zw = this.config.zoneWidth * 100;
      zone.style.left = (50 - zw / 2) + "%";
      zone.style.width = zw + "%";
      this.markerEl = document.createElement("div");
      this.markerEl.className = "tt-marker";
      track.append(zone, this.markerEl);
      this.container.appendChild(track);
    }
  },

  /* ── rhythm / dodge: discrete scheduled cue → window → judge ── */
  _nextCue() {
    if (!this.active) return;
    if (this.rep >= this.config.reps) { this._end(true); return; }
    this.windowOpen = false;
    const delay = this.mode === "rhythm" ? this.config.intervalMs : this.config.approachMs;
    const windowMs = this.config.windowMs;

    if (this.mode === "dodge") {
      // hazard travels from the top of the lane down to the zone near the
      // bottom, arriving exactly as the judge window opens/closes
      this.hazardEl.style.transition = "none";
      this.hazardEl.style.top = "0%";
      requestAnimationFrame(() => {
        this.hazardEl.style.transition = `top ${delay}ms linear`;
        this.hazardEl.style.top = "82%";
      });
    }

    this.timers.push(setTimeout(() => {
      if (!this.active) return;
      this.windowOpen = true;
      if (this.runeEl) this.runeEl.classList.add("lit");
      if (this.hazardEl) this.hazardEl.classList.add("lit");
      this.timers.push(setTimeout(() => {
        if (!this.active) return;
        if (this.windowOpen) this._resolve(false); // ran out of time
      }, windowMs));
    }, Math.max(0, delay - windowMs)));
  },

  _resolve(pass) {
    this.windowOpen = false;
    if (this.runeEl) this.runeEl.classList.remove("lit");
    if (this.hazardEl) this.hazardEl.classList.remove("lit");
    this.rep++;
    if (this.onRepResult) this.onRepResult(pass, pass ? 0 : this.config.missDmg);
    this._nextCue();
  },

  /* ── duel: continuous sweep, judged on tap ── */
  _loopDuel() {
    this.cycleStart = Date.now();
    const tick = () => {
      if (!this.active) return;
      this.markerEl.style.left = (this._duelPos() * 100) + "%";
      this.raf = requestAnimationFrame(tick);
    };
    tick();
  },

  _duelPos() {
    const elapsed = Date.now() - this.cycleStart;
    return (elapsed % this.config.sweepMs) / this.config.sweepMs;
  },

  _tap() {
    if (!this.active || this.locked) return;
    if (this.mode === "duel") this._duelJudge(Math.abs(this._duelPos() - 0.5) <= this.config.zoneWidth / 2);
    else if (this.windowOpen) this._resolve(true);
  },

  _duelJudge(pass) {
    this.locked = true;
    if (pass) this.bossHp = Math.max(0, this.bossHp - this.config.dmg);
    if (this.onRepResult) this.onRepResult(pass, pass ? this.config.dmg : this.config.missDmg);
    if (this.onProgress) this.onProgress({ bossHp: this.bossHp, bossMax: this.bossMax });
    if (this.bossHp <= 0) { this._end(true); return; }
    this.timers.push(setTimeout(() => {
      this.locked = false;
      this.cycleStart = Date.now();
    }, 250));
  },

  _end(passed) {
    this.stop();
    if (this.onSequenceEnd) this.onSequenceEnd(passed);
  },
};

/* ═══════════════════════════════════════════════════════════════
   MASH — continuous fill-race: tap to fill your power meter before
   the boss's autofills (which also decays yours, so pace matters).
   Losing a round costs HP and resets the meters; the round never
   hard-fails the stage, matching the forgiving pattern everywhere
   else in the game (platformer respawns, combat never "loses").
   ═══════════════════════════════════════════════════════════════ */

const Mash = {
  container: null, actionBtn: null, config: null,
  active: false, raf: null, lastT: 0,
  heroPct: 0, bossPct: 0,
  onRepResult: null, onSequenceEnd: null, onProgress: null,

  start(container, actionBtn, config, callbacks) {
    this.container = container;
    this.actionBtn = actionBtn;
    this.config = config;
    this.active = true;
    this.heroPct = 0;
    this.bossPct = 0;
    Object.assign(this, { onRepResult: null, onSequenceEnd: null, onProgress: null }, callbacks);

    this.container.innerHTML = "";
    const hint = document.createElement("div");
    hint.className = "tt-mash-hint";
    hint.textContent = "TAP FAST!";
    this.container.appendChild(hint);

    this._down = (e) => {
      e.preventDefault();
      if (this.active) this.heroPct = Math.min(100, this.heroPct + this.config.tapPower);
    };
    this.actionBtn.addEventListener("pointerdown", this._down);

    this.lastT = performance.now();
    this.raf = requestAnimationFrame((t) => this._tick(t));
  },

  stop() {
    this.active = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.actionBtn.removeEventListener("pointerdown", this._down);
  },

  _tick(t) {
    if (!this.active) return;
    const dt = (t - this.lastT) / 1000;
    this.lastT = t;
    this.heroPct = Math.max(0, this.heroPct - this.config.decayPerSec * dt);
    this.bossPct = Math.min(100, this.bossPct + (100 / (this.config.bossFillMs / 1000)) * dt);

    if (this.onProgress) this.onProgress({ heroPct: this.heroPct, bossPct: this.bossPct });

    if (this.heroPct >= this.config.target) {
      if (this.onRepResult) this.onRepResult(true);
      this._end(true);
      return;
    }
    if (this.bossPct >= 100) {
      if (this.onRepResult) this.onRepResult(false);
      this.heroPct = 0;
      this.bossPct = 0;
    }
    this.raf = requestAnimationFrame((t2) => this._tick(t2));
  },

  _end(passed) {
    this.stop();
    if (this.onSequenceEnd) this.onSequenceEnd(passed);
  },
};
