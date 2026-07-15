/* ═══════════════════════════════════════════════════════════════
   SAVE — game state shape + localStorage persistence.
   ═══════════════════════════════════════════════════════════════ */

const SAVE_KEY = "shadowvault_save_v4";

const State = {
  cleared: 0,          // highest trial completed (0 = none)
  xp: 0,
  level: 1,
  inv: [],             // relic ids, in the order they were won
  ach: [],             // unlocked achievement ids
};

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
