/* ═══════════════════════════════════════════════════════════════
   AUDIO — retro chiptune SFX + ambient music, all synthesized
   with WebAudio. No audio files, so the game works fully offline.
   ═══════════════════════════════════════════════════════════════ */

const AudioSys = {
  ctx: null,
  sfxOn: true,
  musicOn: true,
  musicTimer: null,
  musicStep: 0,

  // Lazily create the context on first user gesture (browser autoplay rules).
  ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
    }
    if (this.ctx.state === "suspended") this.ctx.resume();
    return this.ctx;
  },

  // Core beep: square/triangle voices give the retro feel.
  tone(freq, durMs, { type = "square", vol = 0.12, delayMs = 0, slideTo = null } = {}) {
    const ctx = this.ensure();
    if (!ctx) return;
    const t0 = ctx.currentTime + delayMs / 1000;
    const t1 = t0 + durMs / 1000;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t1);
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t1);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t1 + 0.02);
  },

  sfx(name) {
    if (!this.sfxOn) return;
    switch (name) {
      case "click":    this.tone(440, 60, { type: "triangle", vol: 0.08 }); break;
      case "jump":     this.tone(330, 110, { type: "square", vol: 0.09, slideTo: 520 }); break;
      case "correct":  [523, 659, 784].forEach((f, i) => this.tone(f, 120, { delayMs: i * 90 })); break;
      case "wrong":    this.tone(200, 220, { slideTo: 90, vol: 0.15 }); break;
      case "hit":      this.tone(160, 130, { slideTo: 60, vol: 0.2 }); break;
      case "crit":     [880, 660, 990, 1320].forEach((f, i) => this.tone(f, 100, { delayMs: i * 60, vol: 0.16 })); break;
      case "loot":     [392, 523, 659, 784, 1046].forEach((f, i) => this.tone(f, 140, { type: "triangle", delayMs: i * 80 })); break;
      case "levelup":  [523, 659, 784, 1046, 1318].forEach((f, i) => this.tone(f, 160, { delayMs: i * 70 })); break;
      case "chest":    this.tone(330, 300, { type: "triangle", slideTo: 660 }); break;
      case "vault":    [131, 165, 196, 262].forEach((f, i) => this.tone(f, 600, { type: "triangle", delayMs: i * 350, vol: 0.15 })); break;
      case "fanfare":  [523, 523, 523, 659, 784, 1046].forEach((f, i) => this.tone(f, i === 5 ? 500 : 150, { delayMs: i * 150, vol: 0.14 })); break;
      case "boss":     this.tone(80, 900, { type: "sawtooth", slideTo: 40, vol: 0.12 }); break;
      case "reveal":   this.tone(660, 200, { type: "triangle", slideTo: 880 }); break;
    }
  },

  /* Ambient music: slow minor arpeggio, scheduled note by note.
     A(m) pentatonic-ish loop — moody, dungeon-flavored, quiet. */
  MUSIC_NOTES: [220, 261.6, 329.6, 261.6, 220, 196, 164.8, 196],
  moodMul: 1, // set via setMood() — transposes the loop per level's atmosphere

  // Small per-level "the ambient sound changes with the environment" touch:
  // a pitch multiplier on the existing loop rather than separate tracks.
  setMood(mul) { this.moodMul = mul; },

  startMusic() {
    if (this.musicTimer || !this.musicOn) return;
    const step = () => {
      if (!this.musicOn) return;
      const f = this.MUSIC_NOTES[this.musicStep % this.MUSIC_NOTES.length] * this.moodMul;
      this.tone(f, 700, { type: "triangle", vol: 0.035 });
      this.tone(f / 2, 700, { type: "sine", vol: 0.03 }); // low drone an octave down
      this.musicStep++;
      this.musicTimer = setTimeout(step, 750);
    };
    step();
  },

  stopMusic() {
    clearTimeout(this.musicTimer);
    this.musicTimer = null;
  },

  toggleSfx()   { this.sfxOn = !this.sfxOn; return this.sfxOn; },
  toggleMusic() {
    this.musicOn = !this.musicOn;
    this.musicOn ? this.startMusic() : this.stopMusic();
    return this.musicOn;
  },
};
