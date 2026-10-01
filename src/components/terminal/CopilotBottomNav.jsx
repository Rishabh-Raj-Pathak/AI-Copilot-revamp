/**
 * Retired: the phone tab bar is now one persistent `AppTabBar`
 * (`src/components/mobile/AppTabBar.jsx`) rendered by `App`, outside the page
 * transition — so it no longer remounts, flickers or loses the More sheet on
 * every tab switch, and Trade finally has it too.
 *
 * Kept as a no-op so existing page imports keep compiling; remove the
 * `<CopilotBottomNav />` call when touching a page.
 */
export default function CopilotBottomNav() {
  return null;
}
