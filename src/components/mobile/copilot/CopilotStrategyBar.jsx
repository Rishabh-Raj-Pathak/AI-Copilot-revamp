import { useEffect, useRef, useState } from "react";
import AppIcon from "../AppIcon.jsx";
import { appIcons } from "../mobileAssets.js";
import CopilotStrategySelector from "../../terminal/CopilotStrategySelector.jsx";
import { COPILOT_CATEGORY_CHIPS } from "./copilotIdeaData.js";

/** `01m 51s` — Figma's zero-padded countdown. */
function formatCountdown(totalSec) {
  const s = Math.max(0, Math.floor(totalSec));
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}m ${String(s % 60).padStart(2, "0")}s`;
}

/** Figma "Category Chip" (937:1163 active · 937:1178 default). */
function CategoryChip({ chip, active, onPress }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      data-active={active || undefined}
      onClick={() => onPress(chip.id)}
      className={`app-pressable flex h-7 shrink-0 items-center gap-1.5 rounded-md border border-app-line px-2.5 ${
        active ? "bg-app-accent-subtle text-app-accent" : "bg-app-bg text-ink active:bg-white/[0.06]"
      }`}
    >
      <AppIcon src={chip.icon} size={14} />
      <span className="whitespace-nowrap text-app-caption font-medium leading-[14.4px]">
        {chip.label}
      </span>
    </button>
  );
}

/**
 * Figma "Strategy Section" → "Strategy Bar" (939:1267 / 938:1190; expired
 * timer 938:1229). Strategy dropdown, countdown, Share and Refresh on top;
 * category chips below, scrolling sideways.
 */
export default function CopilotStrategyBar({
  strategies,
  selectedStrategyId,
  onStrategySelect,
  activeFilter,
  onFilterChange,
  expireSeconds = 0,
  onRefresh,
  onShare,
  chips = COPILOT_CATEGORY_CHIPS,
}) {
  const expired = expireSeconds <= 0;
  const chipsRef = useRef(null);
  // The right-edge fade says "more this way"; drop it once the row is at its end.
  const [chipsAtEnd, setChipsAtEnd] = useState(false);
  const syncChipsEnd = () => {
    const row = chipsRef.current;
    if (row) setChipsAtEnd(row.scrollLeft + row.clientWidth >= row.scrollWidth - 1);
  };

  // Keep the active chip on screen when the category changes from elsewhere
  // (the empty state's "View Trending", a refresh that resets the lens).
  useEffect(() => {
    const row = chipsRef.current;
    const chip = row?.querySelector("[data-active]");
    if (!row || !chip) return;
    const left = chip.offsetLeft - 12;
    const right = chip.offsetLeft + chip.offsetWidth + 12 - row.clientWidth;
    if (row.scrollLeft > left) row.scrollTo({ left, behavior: "smooth" });
    else if (row.scrollLeft < right) row.scrollTo({ left: right, behavior: "smooth" });
  }, [activeFilter]);

  useEffect(() => {
    const row = chipsRef.current;
    if (!row) return undefined;
    // Fires once on observe, then on every resize (rotation, font load).
    const ro = new ResizeObserver(() =>
      setChipsAtEnd(row.scrollLeft + row.clientWidth >= row.scrollWidth - 1),
    );
    ro.observe(row);
    return () => ro.disconnect();
  }, []);

  return (
    <section className="border-b border-app-line px-4 py-3" aria-label="Strategy and market">
      <div className="flex flex-col gap-3 overflow-hidden rounded-xl border border-app-line bg-app-surface py-3">
        <div className="flex items-center justify-between gap-2 px-3">
          {strategies?.length ? (
            <CopilotStrategySelector
              strategies={strategies}
              selectedId={selectedStrategyId}
              onSelect={onStrategySelect}
            />
          ) : (
            <span />
          )}
          <div className="flex shrink-0 items-center gap-2">
            <p
              className="flex items-center gap-1 whitespace-nowrap text-app-label leading-[14px]"
              aria-live="off"
            >
              {expired ? (
                <span className="font-normal text-app-negative">Expired</span>
              ) : (
                <>
                  <span className="font-normal text-ink-faint">Expires in</span>
                  <span className="font-semibold text-app-positive">
                    {formatCountdown(expireSeconds)}
                  </span>
                </>
              )}
            </p>
            <button
              type="button"
              aria-label="Share trade ideas"
              onClick={onShare}
              className="app-pressable relative flex size-9 items-center justify-center rounded-[10px] border border-app-line text-ink before:absolute before:-inset-1 before:content-[''] active:bg-white/[0.06]"
            >
              <AppIcon src={appIcons.share14} size={14} />
            </button>
            <button
              type="button"
              aria-label="Refresh trade ideas"
              onClick={onRefresh}
              className="app-pressable app-gradient-brand relative flex size-9 items-center justify-center rounded-[10px] text-black before:absolute before:-inset-1 before:content-['']"
            >
              <AppIcon src={appIcons.refresh14} size={14} />
            </button>
          </div>
        </div>
        <div
          ref={chipsRef}
          onScroll={syncChipsEnd}
          className={`app-no-scrollbar relative flex gap-2 overflow-x-auto overscroll-x-contain px-3 ${
            chipsAtEnd ? "" : "app-edge-fade-x"
          }`}
          role="group"
          aria-label="Market category"
        >
          {chips.map((chip) => (
            <CategoryChip
              key={chip.id}
              chip={chip}
              active={chip.id === activeFilter}
              onPress={onFilterChange}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
