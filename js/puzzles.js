/* ═══════════════════════════════════════════════════════════════
   PUZZLES — five engines grouped by interaction shape, not one
   bespoke build per level:

   ChoiceGrid    — tap one (or several) of N options, judged
                   immediately. L1, L2, L7.
   StateCycle    — tap tiles to cycle+propagate state, then submit.
                   L5 (gears).
   SequenceInput — tap items into ordered slots, auto-checked once
                   full. L3, L6.
   MirrorBeam    — real beam-tracing across a small grid of
                   rotatable mirrors, live-checked every tap. L4.
   Maze          — tap-to-move grid with clue-gated junctions.
                   L8 only, no reuse elsewhere.

   All five build their own DOM into a container element handed to
   `.start()`, exactly like Platformer/Combat did in the previous
   build — the orchestrator (game.js) never reaches into their DOM.
   ═══════════════════════════════════════════════════════════════ */

// Small tap-feedback ring, reused by every engine's tap handlers so every
// puzzle interaction shares the same "magical" acknowledgment.
function ripple(el) {
  const r = document.createElement("span");
  r.className = "pz-ripple";
  el.appendChild(r);
  setTimeout(() => r.remove(), 500);
}

function buildGrid(container, rows, cols, cellRenderer) {
  container.innerHTML = "";
  const grid = document.createElement("div");
  grid.className = "pz-grid";
  grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = document.createElement("button");
      cell.className = "pz-cell";
      cellRenderer(cell, r, c);
      grid.appendChild(cell);
      cells.push(cell);
    }
  }
  container.appendChild(grid);
  return cells;
}

/* ═══ CHOICE GRID (L1 pedestals, L2 chests, L7 star-pairs) ═══ */
const ChoiceGrid = {
  container: null, config: null, selected: [],
  onCorrect: null, onWrong: null,

  start(container, config, callbacks) {
    this.container = container;
    this.config = config;
    this.selected = [];
    Object.assign(this, { onCorrect: null, onWrong: null }, callbacks);
    this._render();
  },

  stop() { this.container.innerHTML = ""; },

  _render() {
    this.container.innerHTML = "";

    if (this.config.promptText) {
      const p = document.createElement("div");
      p.className = "pz-prompt-text";
      this.config.promptText.forEach((line) => {
        const l = document.createElement("div");
        l.className = "pz-prompt-line";
        l.textContent = line;
        p.appendChild(l);
      });
      this.container.appendChild(p);
    }

    if (this.config.promptGrid) {
      const { rows, cols, cells } = this.config.promptGrid;
      buildGrid(this.container, rows, cols, (cell, r, c) => {
        const v = cells[r * cols + c];
        cell.classList.add("pz-tablet-cell");
        cell.disabled = true;
        cell.textContent = v == null ? "?" : v;
        if (v == null) cell.classList.add("blank");
      });
    }

    const row = document.createElement("div");
    row.className = "pz-choice-row";
    this.config.options.forEach((opt, i) => {
      const btn = document.createElement("button");
      btn.className = "pz-choice";
      btn.innerHTML = (opt.icon ? `<span class="pz-choice-ico">${opt.icon}</span>` : "") +
        (opt.label ? `<span class="pz-choice-label">${opt.label}</span>` : "");
      btn.onclick = () => this._pick(i, btn);
      row.appendChild(btn);
    });
    this.container.appendChild(row);
  },

  _pick(i, btn) {
    ripple(btn);
    const answer = Array.isArray(this.config.answer) ? this.config.answer : [this.config.answer];
    if (this.config.multiSelect) {
      btn.classList.toggle("picked");
      const idx = this.selected.indexOf(i);
      if (idx === -1) this.selected.push(i); else this.selected.splice(idx, 1);
      if (this.selected.length < answer.length) return;
      this._judge(this.selected, [...this.container.querySelectorAll(".pz-choice.picked")]);
    } else {
      this._judge([i], [btn]);
    }
  },

  _judge(picked, btns) {
    const answer = Array.isArray(this.config.answer) ? this.config.answer : [this.config.answer];
    const correct = picked.length === answer.length && picked.every((p) => answer.includes(p));
    if (correct) {
      btns.forEach((b) => b.classList.add("correct"));
      if (this.onCorrect) this.onCorrect();
    } else {
      btns.forEach((b) => b.classList.add("wrong"));
      if (this.onWrong) this.onWrong();
      this.selected = [];
      setTimeout(() => this._render(), 550);
    }
  },
};

/* ═══ STATE CYCLE (L5 gears: tap cycles + propagates, then submit) ═══ */
const StateCycle = {
  container: null, config: null, state: [],
  onSolved: null, onWrong: null,

  start(container, config, callbacks) {
    this.container = container;
    this.config = config;
    this.state = [...config.initial];
    Object.assign(this, { onSolved: null, onWrong: null }, callbacks);
    this._render();
  },

  stop() { this.container.innerHTML = ""; },

  _render() {
    const n = this.config.tileCount;
    this.cells = buildGrid(this.container, 1, n, (cell, r, c) => {
      cell.classList.add("pz-gear");
      cell.onclick = () => { ripple(cell); this._tap(c); };
    });
    this._paint();
    if (!this.submitBtn || !this.container.contains(this.submitBtn)) {
      this.submitBtn = document.createElement("button");
      this.submitBtn.className = "btn btn-primary action-btn pz-submit";
      this.submitBtn.textContent = "LOCK IT IN";
      this.submitBtn.onclick = () => this._submit();
      this.container.appendChild(this.submitBtn);
    }
  },

  _paint() {
    const n = this.config.states.length;
    this.cells.forEach((cell, i) => {
      cell.textContent = this.config.stateIcons[this.state[i] % n];
      cell.classList.toggle("cw", this.state[i] % n === 0);
    });
  },

  _tap(i) {
    const n = this.config.states.length;
    this.state[i] = (this.state[i] + 1) % n;
    this.config.links.forEach(([a, b]) => {
      if (a === i) this.state[b] = (this.state[b] + 1) % n;
      if (b === i) this.state[a] = (this.state[a] + 1) % n;
    });
    this._paint();
  },

  _submit() {
    const solved = this.state.every((s, i) => s === this.config.target[i]);
    if (solved) {
      if (this.onSolved) this.onSolved();
    } else {
      if (this.onWrong) this.onWrong();
      this.state = [...this.config.initial];
      this._paint();
    }
  },
};

/* ═══ SEQUENCE INPUT (L3 books, L6 Morse decode) ═══ */
const SequenceInput = {
  container: null, config: null, slots: [],
  onCorrect: null, onWrong: null,

  start(container, config, callbacks) {
    this.container = container;
    this.config = config;
    this.slots = [];
    Object.assign(this, { onCorrect: null, onWrong: null }, callbacks);
    this._render();
  },

  stop() { this.container.innerHTML = ""; },

  _render() {
    this.container.innerHTML = "";

    if (this.config.promptText) {
      const p = document.createElement("div");
      p.className = "pz-prompt-text";
      this.config.promptText.forEach((line) => {
        const l = document.createElement("div");
        l.className = "pz-prompt-line";
        l.textContent = line;
        p.appendChild(l);
      });
      this.container.appendChild(p);
    }

    const slotRow = document.createElement("div");
    slotRow.className = "pz-slot-row";
    this.config.items.forEach((_, i) => {
      const s = document.createElement("button");
      s.className = "pz-slot";
      s.textContent = this.slots[i] != null ? this.config.items[this.slots[i]].icon : "";
      s.onclick = () => this._undo(i);
      slotRow.appendChild(s);
    });
    this.container.appendChild(slotRow);

    const itemRow = document.createElement("div");
    itemRow.className = "pz-choice-row";
    this.config.items.forEach((item, i) => {
      const btn = document.createElement("button");
      btn.className = "pz-choice";
      btn.disabled = this.slots.includes(i);
      btn.innerHTML = `<span class="pz-choice-ico">${item.icon}</span>` +
        (item.label ? `<span class="pz-choice-label">${item.label}</span>` : "");
      btn.onclick = () => { ripple(btn); this._place(i); };
      itemRow.appendChild(btn);
    });
    this.container.appendChild(itemRow);
  },

  _place(i) {
    if (this.slots.includes(i) || this.slots.length >= this.config.items.length) return;
    this.slots.push(i);
    this._render();
    if (this.slots.length === this.config.order.length) this._check();
  },

  _undo(slotIdx) {
    if (this.slots[slotIdx] == null) return;
    this.slots.splice(slotIdx, 1);
    this._render();
  },

  _check() {
    const correct = this.slots.every((v, i) => v === this.config.order[i]);
    const slotEls = [...this.container.querySelectorAll(".pz-slot")];
    if (correct) {
      slotEls.forEach((s) => s.classList.add("correct"));
      if (this.onCorrect) this.onCorrect();
    } else {
      slotEls.forEach((s) => s.classList.add("wrong"));
      if (this.onWrong) this.onWrong();
      setTimeout(() => { this.slots = []; this._render(); }, 550);
    }
  },
};

/* ═══ MIRROR BEAM (L4: real reflection tracing, live-checked) ═══ */
const DIR = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] };
const REFLECT = {
  "/":  { up: "right", right: "up",   down: "left",  left: "down" },
  "\\": { up: "left",  left: "up",    down: "right", right: "down" },
};

const MirrorBeam = {
  container: null, config: null, orient: {}, moves: 0,
  onSolved: null, onWrong: null,

  start(container, config, callbacks) {
    this.container = container;
    this.config = config;
    this.orient = {};
    config.mirrors.forEach((m) => { this.orient[m.r + "," + m.c] = m.initial; });
    this.moves = 0;
    Object.assign(this, { onSolved: null, onWrong: null }, callbacks);
    this._render();
  },

  stop() { this.container.innerHTML = ""; },

  _render() {
    const { rows, cols } = this.config;
    this.cells = buildGrid(this.container, rows, cols, (cell, r, c) => {
      const key = r + "," + c;
      if (key in this.orient) {
        cell.classList.add("pz-mirror");
        cell.onclick = () => { ripple(cell); this._rotate(r, c); };
      } else if (r === this.config.source.r && c === this.config.source.c) {
        cell.classList.add("pz-source");
        cell.textContent = "✦";
      } else if (r === this.config.target.r && c === this.config.target.c) {
        cell.classList.add("pz-target");
        cell.textContent = "◇";
      } else {
        cell.classList.add("pz-empty");
      }
    });
    this._trace();
  },

  _rotate(r, c) {
    const key = r + "," + c;
    this.orient[key] = this.orient[key] === "/" ? "\\" : "/";
    this.moves++;
    this._trace();
    if (this.moves >= this.config.maxMoves && !this.solved) {
      if (this.onWrong) this.onWrong();
      this.config.mirrors.forEach((m) => { this.orient[m.r + "," + m.c] = m.initial; });
      this.moves = 0;
      this._trace();
    }
  },

  _trace() {
    const { rows, cols, source, target } = this.config;
    this.cells.forEach((cell) => cell.classList.remove("beam"));
    let r = source.r, c = source.c, dir = source.dir;
    const seen = new Set();
    for (let steps = 0; steps < rows * cols * 2; steps++) {
      const [dr, dc] = DIR[dir];
      r += dr; c += dc;
      if (r < 0 || r >= rows || c < 0 || c >= cols) break;
      const key = r + "," + c;
      if (seen.has(key + dir)) break;
      seen.add(key + dir);
      const idx = r * cols + c;
      this.cells[idx].classList.add("beam");
      if (r === target.r && c === target.c) {
        this.solved = true;
        if (this.onSolved) this.onSolved();
        return;
      }
      if (key in this.orient) dir = REFLECT[this.orient[key]][dir];
    }
  },
};

/* ═══ MAZE (L8: tap-to-move, clue-gated junctions) ═══ */
const Maze = {
  container: null, config: null, pos: null, resolvedGates: null,
  onSolved: null, onWrong: null,

  start(container, config, callbacks) {
    this.container = container;
    this.config = config;
    this.pos = { ...config.start };
    this.resolvedGates = new Set();
    this.activeGate = null;
    Object.assign(this, { onSolved: null, onWrong: null }, callbacks);
    this._render();
  },

  stop() { this.container.innerHTML = ""; },

  _wallAt(r, c) { return this.config.walls.some((w) => w.r === r && w.c === c); },
  _gateAt(r, c) { return this.config.gates.find((g) => g.r === r && g.c === c && !this.resolvedGates.has(g.r + "," + g.c)); },

  _render() {
    const { rows, cols, exit } = this.config;
    this.cells = buildGrid(this.container, rows, cols, (cell, r, c) => {
      if (this._wallAt(r, c)) { cell.classList.add("pz-wall"); return; }
      if (r === this.pos.r && c === this.pos.c) { cell.classList.add("pz-player"); cell.textContent = "🧝"; }
      else if (r === exit.r && c === exit.c) { cell.classList.add("pz-exit"); cell.textContent = "🚪"; }
      else if (this._gateAt(r, c)) { cell.classList.add("pz-gate"); cell.textContent = "✖"; }
      else cell.classList.add("pz-open");
      cell.onclick = () => this._step(r, c, cell);
    });
    this.promptZone = document.createElement("div");
    this.container.appendChild(this.promptZone);

    // torch-light vignette centered on the player, following it each move —
    // "almost no light, only the Compass illuminates the surroundings"
    const gridEl = this.container.querySelector(".pz-grid");
    gridEl.classList.add("torch");
    gridEl.style.setProperty("--torch-x", ((this.pos.c + 0.5) / cols * 100) + "%");
    gridEl.style.setProperty("--torch-y", ((this.pos.r + 0.5) / rows * 100) + "%");
  },

  _step(r, c, cell) {
    if (this.activeGate) return;
    const dr = Math.abs(r - this.pos.r), dc = Math.abs(c - this.pos.c);
    if (dr + dc !== 1) return; // only orthogonal-adjacent moves
    if (this._wallAt(r, c)) return;
    ripple(cell);

    const gate = this._gateAt(r, c);
    if (gate) { this._openGate(gate, r, c); return; }

    this.pos = { r, c };
    this._render();
    if (r === this.config.exit.r && c === this.config.exit.c) {
      if (this.onSolved) this.onSolved();
    }
  },

  _openGate(gate, r, c) {
    this.activeGate = gate;
    this.promptZone.innerHTML = "";
    const row = document.createElement("div");
    row.className = "pz-choice-row";
    gate.prompt.options.forEach((opt, i) => {
      const btn = document.createElement("button");
      btn.className = "pz-choice";
      btn.innerHTML = (opt.icon ? `<span class="pz-choice-ico">${opt.icon}</span>` : "") +
        (opt.label ? `<span class="pz-choice-label">${opt.label}</span>` : "");
      btn.onclick = () => {
        ripple(btn);
        if (i === gate.prompt.answer) {
          this.resolvedGates.add(gate.r + "," + gate.c);
          this.activeGate = null;
          this.pos = { r, c };
          this._render();
        } else {
          if (this.onWrong) this.onWrong();
          row.classList.add("shake");
        }
      };
      row.appendChild(btn);
    });
    this.promptZone.appendChild(row);
  },
};
