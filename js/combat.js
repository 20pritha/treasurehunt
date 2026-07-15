/* ═══════════════════════════════════════════════════════════════
   COMBAT — real-time reflex fight. The monster telegraphs an
   attack, then strikes; the hero must dodge in time or take the
   hit. Attacking is always available (on a cooldown). Used for
   every one of the 16 fights, including the finale.
   ═══════════════════════════════════════════════════════════════ */

const Combat = {
  fight: null, bossHp: 0, bossMax: 0,
  active: false, telegraphActive: false, dodging: false,
  attackReadyAt: 0, spellReadyAt: 0,
  timers: [],
  onVictory: null, onHeroHit: null, onTelegraph: null, onStrikeResolved: null, onDodgeSuccess: null,

  ATTACK_DMG: [8, 14],
  SPELL_DMG: [18, 26],
  ATTACK_COOLDOWN: 450,
  SPELL_COOLDOWN: 1000,
  SPELL_MP_COST: 15,

  start(fightData, callbacks) {
    this.fight = fightData;
    this.bossHp = this.bossMax = fightData.hp;
    this.active = true;
    this.telegraphActive = false;
    this.dodging = false;
    this.attackReadyAt = 0;
    this.spellReadyAt = 0;
    this.relicBurstUsed = false;
    Object.assign(this, callbacks); // onVictory, onHeroHit, onTelegraph, onStrikeResolved, onDodgeSuccess
    this._scheduleAttack();
  },

  stop() {
    this.active = false;
    this.timers.forEach((t) => clearTimeout(t));
    this.timers = [];
  },

  _scheduleAttack() {
    if (!this.active) return;
    const delay = this.fight.atkMin + Math.random() * (this.fight.atkMax - this.fight.atkMin);
    this.timers.push(setTimeout(() => this._telegraph(), delay));
  },

  _telegraph() {
    if (!this.active) return;
    this.telegraphActive = true;
    if (this.onTelegraph) this.onTelegraph();
    this.timers.push(setTimeout(() => this._strike(), this.fight.telegraphMs));
  },

  _strike() {
    if (!this.active) return;
    this.telegraphActive = false;
    if (this.dodging) {
      if (this.onDodgeSuccess) this.onDodgeSuccess();
    } else if (this.onHeroHit) {
      this.onHeroHit(this.fight.dmg);
    }
    if (this.onStrikeResolved) this.onStrikeResolved();
    this._scheduleAttack();
  },

  dodge() {
    if (!this.active) return false;
    this.dodging = true;
    setTimeout(() => (this.dodging = false), 260);
    return this.telegraphActive;
  },

  canAttack() { return this.active && Date.now() >= this.attackReadyAt; },
  canSpell(mp) { return this.active && mp >= this.SPELL_MP_COST && Date.now() >= this.spellReadyAt; },

  attack() {
    if (!this.canAttack()) return null;
    this.attackReadyAt = Date.now() + this.ATTACK_COOLDOWN;
    const dmg = Math.floor(this.ATTACK_DMG[0] + Math.random() * (this.ATTACK_DMG[1] - this.ATTACK_DMG[0]));
    return this._applyDamage(dmg);
  },

  spell() {
    if (!this.active) return null;
    this.spellReadyAt = Date.now() + this.SPELL_COOLDOWN;
    const dmg = Math.floor(this.SPELL_DMG[0] + Math.random() * (this.SPELL_DMG[1] - this.SPELL_DMG[0]));
    return this._applyDamage(dmg);
  },

  relicBurst(dmg) {
    if (!this.active || this.relicBurstUsed) return null;
    this.relicBurstUsed = true;
    return this._applyDamage(dmg);
  },

  _applyDamage(dmg) {
    const critical = this.bossHp - dmg <= 0.18 * this.bossMax && this.bossHp > 0;
    if (critical) dmg = this.bossHp;
    this.bossHp = Math.max(0, this.bossHp - dmg);
    const result = { dmg, critical, bossHp: this.bossHp, bossMax: this.bossMax };
    if (this.bossHp <= 0) {
      this.stop();
      if (this.onVictory) setTimeout(() => this.onVictory(), critical ? 700 : 0);
    }
    return result;
  },
};
