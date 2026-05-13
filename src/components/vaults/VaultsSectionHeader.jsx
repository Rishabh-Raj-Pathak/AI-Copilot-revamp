import { LayoutGrid, List } from "lucide-react";

/**
 * Figma: `4421:6184` `VaultsHeader` — title, hairline, grid/list toggle.
 */
export default function VaultsSectionHeader({ viewMode, onViewModeChange }) {
  const listActive = viewMode === "list";

  return (
    <div className="vaults-root flex w-full items-center gap-3">
      <h2 className="shrink-0 text-[20px] font-medium leading-[30px] text-[#e8d5b5]">
        Vaults
      </h2>
      <div className="h-px min-w-0 flex-1 bg-[rgba(255,255,255,0.06)]" />
      <div className="relative flex h-[42px] w-[74px] shrink-0 rounded-full border border-[rgba(255,255,255,0.05)] bg-[#0c0a08] p-1 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]">
        <button
          type="button"
          aria-pressed={!listActive}
          onClick={() => onViewModeChange("grid")}
          className={`relative z-10 flex size-8 items-center justify-center rounded-full transition-colors ${
            !listActive
              ? "bg-[#1e1b18] text-[#e8d5b5] shadow-[0_1px_3px_rgba(0,0,0,0.25)]"
              : "text-white/35 hover:text-white/55"
          }`}
        >
          <LayoutGrid className="size-4" aria-hidden />
          <span className="sr-only">Grid view</span>
        </button>
        <button
          type="button"
          aria-pressed={listActive}
          onClick={() => onViewModeChange("list")}
          className={`relative z-10 flex size-8 items-center justify-center rounded-full transition-colors ${
            listActive
              ? "bg-[#1e1b18] text-[#e8d5b5] shadow-[0_1px_3px_rgba(0,0,0,0.25)]"
              : "text-white/35 hover:text-white/55"
          }`}
        >
          <List className="size-4" aria-hidden />
          <span className="sr-only">List view</span>
        </button>
      </div>
    </div>
  );
}
