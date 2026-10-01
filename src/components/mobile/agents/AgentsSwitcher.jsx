import { useMobileApp } from "../MobileAppContext.js";
import { GOLD_PILL_FILL } from "./agentsTheme.js";

/**
 * Figma "Agents Switcher" (995:5911 / 995:5916) — the pill segmented control at
 * the top of both Agents screens.
 *
 * Delta Neutral goes to v1 unless v2 is already showing: v2 stays a real route,
 * reached from the tab bar's re-tap picker, and this control must not bounce
 * the user out of it.
 */
export default function AgentsSwitcher() {
  const app = useMobileApp();
  const onDeltaNeutral = app.page.startsWith("dn-vaults");

  const segments = [
    {
      id: "delta-neutral",
      label: "Delta Neutral",
      active: onDeltaNeutral,
      onPress: () => {
        if (!onDeltaNeutral) app.navigate("dn-vaults-1");
      },
    },
    {
      id: "alpha-agents",
      label: "Alpha Agents",
      active: !onDeltaNeutral,
      onPress: () => {
        if (onDeltaNeutral) app.navigate("vaults");
      },
    },
  ];

  return (
    <div
      role="tablist"
      aria-label="Agent type"
      className="flex shrink-0 rounded-full border border-[rgba(120,90,40,0.5)] bg-app-subtle p-[3px]"
    >
      {segments.map((segment) => (
        <button
          key={segment.id}
          type="button"
          role="tab"
          aria-selected={segment.active}
          onClick={segment.onPress}
          className={`app-pressable relative flex h-[34px] min-w-0 flex-1 items-center justify-center rounded-full border px-3 text-[14px] font-medium leading-4 after:absolute after:-inset-y-1 after:inset-x-0 ${
            segment.active
              ? `border-[#785a28] text-ink ${GOLD_PILL_FILL}`
              : "border-transparent text-white/[0.42]"
          }`}
        >
          <span className="truncate">{segment.label}</span>
        </button>
      ))}
    </div>
  );
}
