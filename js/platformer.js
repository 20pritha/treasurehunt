/* ═══════════════════════════════════════════════════════════════
   PLATFORMER — a small run/jump engine. One canvas, one hero,
   one level object (see mkLevel in js/data.js). Runs until the
   hero reaches the far edge, then hands off to js/combat.js.
   ═══════════════════════════════════════════════════════════════ */

const Platformer = {
  W: 480, H: 220,
  GRAVITY: 0.5,
  JUMP_V: -9.6,
  ACCEL: 0.6,
  RUN_SPEED: 2.6,
  FRICTION_GROUND: 0.82,
  FRICTION_ICE: 0.95,
  MAX_FALL: 9,

  canvas: null, ctx: null,
  level: null, hero: null,
  camX: 0, invuln: 0, spawnX: 20,
  keys: { left: false, right: false, jump: false },
  running: false, raf: null,
  onComplete: null, onHit: null,

  start(canvas, levelData, { onComplete, onHit }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.canvas.width = this.W;
    this.canvas.height = this.H;
    this.level = { ...levelData, coins: [...levelData.coins] }; // coins get consumed; don't mutate shared data
    this.onComplete = onComplete;
    this.onHit = onHit;
    this.hero = { x: 20, y: levelData.groundY - 20, vx: 0, vy: 0, w: 14, h: 20, onGround: true, facing: 1 };
    this.camX = 0;
    this.invuln = 0;
    this.keys = { left: false, right: false, jump: false };
    this.running = true;
    this._bindInput();
    this._loop();
  },

  stop() {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    this._unbindInput();
  },

  setKey(name, val) { this.keys[name] = val; },

  _bindInput() {
    this._kd = (e) => {
      if (["ArrowLeft", "a", "A"].includes(e.key)) this.keys.left = true;
      if (["ArrowRight", "d", "D"].includes(e.key)) this.keys.right = true;
      if ([" ", "ArrowUp", "w", "W"].includes(e.key)) { this.keys.jump = true; e.preventDefault(); }
    };
    this._ku = (e) => {
      if (["ArrowLeft", "a", "A"].includes(e.key)) this.keys.left = false;
      if (["ArrowRight", "d", "D"].includes(e.key)) this.keys.right = false;
      if ([" ", "ArrowUp", "w", "W"].includes(e.key)) this.keys.jump = false;
    };
    window.addEventListener("keydown", this._kd);
    window.addEventListener("keyup", this._ku);
  },
  _unbindInput() {
    window.removeEventListener("keydown", this._kd);
    window.removeEventListener("keyup", this._ku);
  },

  _loop() {
    if (!this.running) return;
    this._update();
    this._draw();
    this.raf = requestAnimationFrame(() => this._loop());
  },

  _groundYAt(x) {
    for (const g of this.level.gaps) if (x >= g.x && x <= g.x + g.w) return null;
    return this.level.groundY;
  },

  _respawn(dmg, invulnFrames) {
    const h = this.hero;
    h.x = Math.max(this.spawnX, h.x - 70);
    h.y = this.level.groundY - h.h;
    h.vx = 0; h.vy = 0;
    if (invulnFrames) this.invuln = invulnFrames;
    if (this.onHit && dmg) this.onHit(dmg);
  },

  _update() {
    const h = this.hero, lvl = this.level;
    const friction = lvl.ice ? this.FRICTION_ICE : this.FRICTION_GROUND;

    if (this.keys.left) { h.vx -= this.ACCEL; h.facing = -1; }
    if (this.keys.right) { h.vx += this.ACCEL; h.facing = 1; }
    h.vx *= friction;
    if (Math.abs(h.vx) < 0.05) h.vx = 0;
    h.vx = Math.max(-this.RUN_SPEED, Math.min(this.RUN_SPEED, h.vx));

    if (this.keys.jump && h.onGround) {
      h.vy = this.JUMP_V;
      h.onGround = false;
      AudioSys.sfx("jump");
    }

    h.vy = Math.min(this.MAX_FALL, h.vy + this.GRAVITY);

    const prevBottom = h.y + h.h;
    h.x = Math.max(0, Math.min(lvl.width - h.w, h.x + h.vx));
    h.y += h.vy;

    // ground / gap collision
    h.onGround = false;
    const groundHere = this._groundYAt(h.x + h.w / 2);
    if (groundHere != null && h.y + h.h >= groundHere && h.vy >= 0) {
      h.y = groundHere - h.h;
      h.vy = 0;
      h.onGround = true;
    }

    // platforms (one-way: only catch the hero when falling onto the top)
    lvl.platforms.forEach((p) => {
      const wasAbove = prevBottom <= p.y + 1;
      if (h.vy >= 0 && wasAbove && h.x + h.w > p.x && h.x < p.x + p.w && h.y + h.h >= p.y) {
        h.y = p.y - h.h;
        h.vy = 0;
        h.onGround = true;
      }
    });

    // fell into a pit
    if (groundHere == null && h.y > this.H + 30 && !lvl.platforms.some((p) => h.x + h.w > p.x && h.x < p.x + p.w && h.y + h.h <= p.y + 6)) {
      this._respawn(-8, 0);
    }

    // hazards
    if (this.invuln > 0) this.invuln--;
    else {
      for (const hz of lvl.hazards) {
        if (h.x + h.w > hz.x && h.x < hz.x + hz.w && h.y + h.h > hz.y && h.y < hz.y + hz.h) {
          AudioSys.sfx("hit");
          this._respawn(-12, 60);
          break;
        }
      }
    }

    // coins (cosmetic pickup)
    lvl.coins = lvl.coins.filter((c) => {
      const dx = h.x + h.w / 2 - c.x, dy = h.y + h.h / 2 - c.y;
      if (Math.sqrt(dx * dx + dy * dy) < 18) { AudioSys.sfx("click"); return false; }
      return true;
    });

    this.camX = Math.max(0, Math.min(lvl.width - this.W, h.x - this.W / 2));

    if (h.x >= lvl.width - 36) {
      this.stop();
      if (this.onComplete) this.onComplete();
    }
  },

  _draw() {
    const ctx = this.ctx, lvl = this.level, h = this.hero;
    ctx.clearRect(0, 0, this.W, this.H);
    ctx.fillStyle = lvl.theme.sky;
    ctx.fillRect(0, 0, this.W, this.H);

    ctx.save();
    ctx.translate(-this.camX, 0);

    // ground, skipping gaps
    ctx.fillStyle = lvl.theme.ground;
    let seg = 0;
    [...lvl.gaps].sort((a, b) => a.x - b.x).forEach((g) => {
      if (g.x > seg) ctx.fillRect(seg, lvl.groundY, g.x - seg, this.H - lvl.groundY);
      seg = g.x + g.w;
    });
    if (seg < lvl.width) ctx.fillRect(seg, lvl.groundY, lvl.width - seg, this.H - lvl.groundY);

    // platforms
    ctx.fillStyle = lvl.theme.accent;
    lvl.platforms.forEach((p) => ctx.fillRect(p.x, p.y, p.w, p.h));

    // hazard spikes
    ctx.fillStyle = "#ff5d73";
    lvl.hazards.forEach((hz) => {
      for (let i = 0; i < hz.w; i += 10) {
        ctx.beginPath();
        ctx.moveTo(hz.x + i, hz.y + hz.h);
        ctx.lineTo(hz.x + i + 5, hz.y);
        ctx.lineTo(hz.x + i + 10, hz.y + hz.h);
        ctx.closePath();
        ctx.fill();
      }
    });

    // coins
    ctx.font = "14px sans-serif";
    ctx.textAlign = "center";
    lvl.coins.forEach((c) => ctx.fillText("✨", c.x, c.y + 5));

    // goal marker
    ctx.font = "30px sans-serif";
    ctx.fillText(lvl.goalSprite, lvl.width - 30, lvl.groundY - 6);

    // hero (flashes while invulnerable)
    if (this.invuln === 0 || Math.floor(this.invuln / 6) % 2 === 0) {
      ctx.save();
      ctx.translate(h.x + h.w / 2, h.y + h.h / 2);
      if (h.facing < 0) ctx.scale(-1, 1);
      ctx.font = "26px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("🧝", 0, 2);
      ctx.restore();
    }

    ctx.restore();

    // progress bar (screen space, not world space)
    const pct = Math.min(1, h.x / (lvl.width - 40));
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(10, 10, 120, 8);
    ctx.fillStyle = "#ffd44d";
    ctx.fillRect(10, 10, 120 * pct, 8);
  },
};
