import { Activity, Hexagon, Layers, Zap } from "lucide-react";

const ICONS = {
  all: Layers,
  hyperliquid: Activity,
  paradex: Hexagon,
  nado: Zap,
};

const ACTIVE_TAB_GRADIENT =
  "linear-gradient(180deg, #1a140b 0%, #18130b 16.67%, #16120b 33.33%, #14110c 50%, #13100c 66.67%, #110f0c 83.33%, #0f0e0c 100%)";

/**
 * Figma: `4421:6210` `TabSwitch` inside `4421:6209` — venue filters in one pill track.
 */
export default function VaultsDexTabs({ activeId, onChange, tabs }) {
  return (
    <div className="vaults-root min-w-0 max-w-full overflow-x-auto overscroll-x-contain pb-0.5 [scrollbar-width:thin]">
      <div
        className="inline-flex h-[49px] shrink-0 items-center gap-1 rounded-full border border-[rgba(255,255,255,0.05)] bg-[#121212] p-1"
        role="tablist"
        aria-label="Venue filters"
      >
        {tabs.map((tab) => {
          const Icon = ICONS[tab.id] ?? Layers;
          const active = tab.id === activeId;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(tab.id)}
              className={`relative inline-flex h-[41px] shrink-0 items-center gap-2 rounded-full border px-5 text-[14px] font-medium uppercase leading-[21px] tracking-[0.35px] transition-colors ${
                active
                  ? "border-[#785a28] text-[#e8d5b5] shadow-[inset_0_0_4px_rgba(0,0,0,0.5)]"
                  : "border-transparent text-[#717182] shadow-[inset_0_0_4px_rgba(0,0,0,0.5)] hover:text-[#e8d5b5]/80"
              }`}
              style={active ? { backgroundImage: ACTIVE_TAB_GRADIENT } : undefined}
            >
              <Icon
                className={`size-4 shrink-0 ${active ? "text-[#e8d5b5]" : "text-[#717182]"}`}
                aria-hidden
              />
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
