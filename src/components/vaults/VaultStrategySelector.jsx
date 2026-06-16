import { ChevronDown } from "lucide-react";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const RISK_STYLES = {
  Low: "border-[rgba(0,188,125,0.25)] bg-[rgba(0,188,125,0.1)] text-[#00d492]",
  Medium:
    "border-[rgba(204,177,127,0.25)] bg-[rgba(204,177,127,0.08)] text-[#ccb17f]",
  High: "border-[rgba(255,137,4,0.25)] bg-[rgba(255,137,4,0.1)] text-[#ff8904]",
};

const HOVER_CLOSE_MS = 140;

function StrategyInfoPopover({
  strategy,
  anchorRef,
  open,
  onHoverStart,
  onHoverEnd,
}) {
  const popoverRef = useRef(null);
  const [pos, setPos] = useState(null);

  useLayoutEffect(() => {
    if (!open) {
      setPos(null);
      return undefined;
    }

    const anchor = anchorRef.current;
    if (!anchor) return undefined;

    const update = () => {
      const rect = anchor.getBoundingClientRect();
      const width = Math.min(300, window.innerWidth - 24);
      const left = Math.min(
        Math.max(12, rect.left + rect.width / 2 - width / 2),
        window.innerWidth - width - 12,
      );
      const spaceBelow = window.innerHeight - rect.bottom;
      const openBelow = spaceBelow > 200 || rect.top < 200;
      if (openBelow) {
        setPos({ left, top: rect.bottom + 8, width });
      } else {
        setPos({
          left,
          bottom: window.innerHeight - rect.top + 8,
          width,
        });
      }
    };

    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [anchorRef, open]);

  if (!open || !pos) return null;

  const riskClass = RISK_STYLES[strategy.risk] ?? RISK_STYLES.Medium;

  return createPortal(
    <div
      ref={popoverRef}
      role="tooltip"
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      className="vaults-root fixed z-[200] rounded-xl border border-[rgba(120,90,40,0.28)] bg-[#0c0a08] p-4 shadow-[0_8px_32px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.04)]"
      style={{
        left: pos.left,
        top: pos.top,
        bottom: pos.bottom,
        width: pos.width,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold leading-5 text-[#e8d5b5]">
          {strategy.name}
        </p>
        <span
          className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.4px] ${riskClass}`}
        >
          {strategy.risk} risk
        </span>
      </div>
      <p className="mt-2 text-xs leading-[1.55] text-[#a1a1aa]">
        {strategy.description}
      </p>
      <dl className="mt-3 flex flex-col gap-2 border-t border-[rgba(255,255,255,0.06)] pt-3 text-[11px]">
        <div className="flex gap-2">
          <dt className="shrink-0 font-medium uppercase tracking-[0.35px] text-[#717182]">
            Timeframe
          </dt>
          <dd className="text-[#d4d4d8]">{strategy.timeframe}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="shrink-0 font-medium uppercase tracking-[0.35px] text-[#717182]">
            Best for
          </dt>
          <dd className="text-[#d4d4d8]">{strategy.bestFor}</dd>
        </div>
      </dl>
    </div>,
    document.body,
  );
}

/**
 * Dropdown strategy picker — hover the selected strategy for details.
 */
export default function VaultStrategySelector({
  strategies,
  selectedId,
  disabled,
  onSelect,
  inline = false,
}) {
  if (!strategies?.length) return null;

  const active =
    strategies.find((s) => s.id === selectedId) ?? strategies[0];
  const selectId = useId();
  const anchorRef = useRef(null);
  const closeTimerRef = useRef(null);
  const [infoOpen, setInfoOpen] = useState(false);

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const handleHoverStart = () => {
    if (disabled) return;
    clearCloseTimer();
    setInfoOpen(true);
  };

  const handleHoverEnd = () => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => setInfoOpen(false), HOVER_CLOSE_MS);
  };

  useEffect(() => () => clearCloseTimer(), []);

  const controlHeight = inline ? "h-[37px]" : "h-8";
  const controlRadius = inline ? "rounded-[10px]" : "rounded-lg";

  return (
    <div
      className={`flex min-w-0 ${inline ? "shrink-0 sm:w-[130px]" : "w-full"}`}
    >
      <div
        ref={anchorRef}
        className={`relative min-w-0 flex-1 ${inline ? "w-full" : ""}`}
        onMouseEnter={handleHoverStart}
        onMouseLeave={handleHoverEnd}
      >
        <label className="sr-only" htmlFor={selectId}>
          Select strategy
        </label>
        <select
          id={selectId}
          value={active.id}
          disabled={disabled}
          onChange={(e) => onSelect(e.target.value)}
          onFocus={handleHoverStart}
          onBlur={handleHoverEnd}
          className={`vaults-strategy-select w-full appearance-none border bg-[#0c0a08] pl-3 pr-8 text-xs font-medium text-[#e8d5b5] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] outline-none transition-colors ${controlHeight} ${controlRadius} ${
            disabled
              ? "cursor-default border-[rgba(255,255,255,0.06)] opacity-60"
              : "cursor-pointer border-[rgba(120,90,40,0.22)] hover:border-[#785a28] focus-visible:border-[#ccb17f]"
          }`}
          aria-label="Select vault strategy"
        >
          {strategies.map((s) => (
            <option key={s.id} value={s.id} className="bg-[#0c0a08] text-[#e8d5b5]">
              {s.name}
            </option>
          ))}
        </select>
        <ChevronDown
          className={`pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[#717182] ${
            disabled ? "opacity-50" : ""
          }`}
          strokeWidth={2}
          aria-hidden
        />
      </div>

      {!disabled ? (
        <StrategyInfoPopover
          strategy={active}
          anchorRef={anchorRef}
          open={infoOpen}
          onHoverStart={handleHoverStart}
          onHoverEnd={handleHoverEnd}
        />
      ) : null}
    </div>
  );
}
