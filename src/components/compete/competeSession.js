/**
 * Which competitions this session has entered.
 *
 * Module-scoped rather than page state, because `CompetePage` unmounts the
 * moment you visit Trade or Rewards — and an entry that vanishes on the way
 * back is a bug, not a demo. The wallet and the X link already outlive the
 * page (`App` and `ProfileProvider` own those), so the entry has to as well.
 *
 * In-memory only, exactly like `profileSession.js`: a refresh wipes it and the
 * flow replays from the top, which is what you want while demoing and keeps it
 * consistent with the wallet session, which resets on refresh too. To make
 * entries survive a reload, swap the `Set` for a `localStorage` read/write
 * here — no caller changes.
 */

/** @type {Set<string>} */
const entered = new Set();

/**
 * The entry modal opens by itself on the way into the hub, so the flag that
 * stops it has to outlive the page too — otherwise closing it and stepping
 * over to Trade would bring it straight back on the way home.
 *
 * Written from the close handler rather than from the open, deliberately:
 * `readEntryPromptDismissed` is then a pure read, safe to call from a lazy
 * `useState` initialiser that StrictMode invokes twice.
 */
let promptDismissed = false;

export function readEntryPromptDismissed() {
  return promptDismissed;
}

export function dismissEntryPrompt() {
  promptDismissed = true;
}

/** A fresh Set each read, so React sees a new reference and re-renders. */
export function readEnteredCompetitions() {
  return new Set(entered);
}

/**
 * @param {string} id
 * @returns {Set<string>} the entered ids after the write
 */
export function enterCompetition(id) {
  entered.add(id);
  return readEnteredCompetitions();
}
