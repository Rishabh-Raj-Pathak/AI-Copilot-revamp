import { useState } from "react";
import AppIcon from "./AppIcon.jsx";
import BottomSheet from "./BottomSheet.jsx";
import { appIcons } from "./mobileAssets.js";
import { tabForPage, useMobileApp } from "./MobileAppContext.js";
import AppMoreSheet from "./sheets/AppMoreSheet.jsx";

const TABS = [
  { id: "copilot", label: "Copilot", icon: appIcons.navCopilot },
  { id: "agents", label: "Agents", icon: appIcons.navAgents },
  { id: "trade", label: "Trade", icon: appIcons.navTrade },
  { id: "rewards", label: "Rewards", icon: appIcons.navRewards },
  { id: "more", label: "More", icon: appIcons.navMore },
];

/**
 * Sub-views a tab can hold. Figma sends each tab to one screen; the prototype
 * still carries alternates (two Delta Neutral builds, the KOL rewards view),
 * so re-tapping the active tab opens this picker instead of dropping them.
 */
const TAB_VIEWS = {
  agents: [
    { page: "dn-vaults-1", label: "Delta Neutral" },
    { page: "dn-vaults-2", label: "Delta Neutral 2" },
    { page: "vaults", label: "Alpha Agents" },
  ],
  rewards: [
    { page: "rewards", label: "Referral rewards" },
    { page: "kol", label: "Gautam Rewards" },
  ],
};

/**
 * Figma "Bottom Nav" (936:1240): five 64px items, 20px icon over a 12px label.
 * The active item sits on a gold-tinted pill; everything else is white.
 * The home-indicator gap comes from the safe-area inset.
 */
export default function AppTabBar() {
  const app = useMobileApp();
  const [moreOpen, setMoreOpen] = useState(false);
  const [viewsFor, setViewsFor] = useState(null);
  const activeTab = moreOpen ? "more" : tabForPage(app.page);

  const onTab = (id) => {
    if (id === "more") {
      setMoreOpen(true);
      return;
    }
    if (id === activeTab && TAB_VIEWS[id]) {
      setViewsFor(id);
      return;
    }
    app.navigate(id);
  };

  return (
    <>
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-50 flex items-start justify-between border-t border-app-line bg-app-bg px-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5 tablet:hidden"
      >
        {TABS.map((tab) => {
          const active = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTab(tab.id)}
              aria-current={active && tab.id !== "more" ? "page" : undefined}
              aria-haspopup={tab.id === "more" ? "dialog" : undefined}
              className={`app-pressable flex w-16 min-w-0 flex-col items-center gap-1 rounded-lg px-1 py-1.5 ${
                active ? "bg-app-accent-subtle text-app-accent" : "text-ink"
              }`}
            >
              <AppIcon src={tab.icon} size={20} />
              <span className="whitespace-nowrap text-app-caption font-medium leading-[14.4px]">
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>

      <AppMoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} />

      <BottomSheet
        open={viewsFor != null}
        onClose={() => setViewsFor(null)}
        title={viewsFor === "agents" ? "Agents" : "Rewards"}
      >
        <ul className="flex flex-col gap-1 px-4 pt-2">
          {(TAB_VIEWS[viewsFor] ?? []).map((view) => {
            const current = view.page === app.page;
            return (
              <li key={view.page}>
                <button
                  type="button"
                  onClick={() => {
                    setViewsFor(null);
                    app.navigate(view.page);
                  }}
                  className={`flex h-12 w-full items-center justify-between rounded-xl px-3 text-left text-app-body font-medium transition-colors active:bg-white/[0.05] ${
                    current ? "bg-app-accent-faint text-app-accent" : "text-ink"
                  }`}
                >
                  {view.label}
                  {current ? <AppIcon src={appIcons.check12} size={12} /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      </BottomSheet>
    </>
  );
}
