const COPILOT_WELCOME_SEEN_KEY = "hyprearn_copilot_welcome_seen";

export function hasSeenCopilotWelcome() {
  try {
    return localStorage.getItem(COPILOT_WELCOME_SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

export function markCopilotWelcomeSeen() {
  try {
    localStorage.setItem(COPILOT_WELCOME_SEEN_KEY, "1");
  } catch {
    /* noop */
  }
}
