import { Globe, Hexagon, Layers, TrendingUp } from "lucide-react";

const ICONS = {
  all: Globe,
  hyperliquid: TrendingUp,
  paradex: Layers,
  nado: Hexagon,
};

/**
 * Figma: `4421:6210` `TabSwitch` — venue filters.
 */
export default function VaultsDexTabs({ activeId, onChange, tabs }) {
  return (
    <div className="vaults-root flex min-w-0 flex-1 flex-wrap items-center gap-2">
      {tabs.map((tab) => {
        const Icon = ICONS[tab.id] ?? Globe;
        const active = tab.id === activeId;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`inline-flex h-[41px] items-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors ${
              active
                ? "border-[rgba(204,177,127,0.35)] bg-[#14100a] text-[#e8d5b5] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                : "border-transparent bg-transparent text-white/80 hover:bg-white/[0.04]"
            }`}
          >
            <Icon className="size-4 shrink-0 opacity-90" aria-hidden />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
