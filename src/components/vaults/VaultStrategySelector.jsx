import { CircleHelp } from "lucide-react";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const RISK_STYLES = {
  Low: "border-[rgba(0,188,125,0.25)] bg-[rgba(0,188,125,0.1)] text-[#00d492]",
  Medium:
    "border-[rgba(204,177,127,0.25)] bg-[rgba(204,177,127,0.08)] text-[#ccb17f]",
  High: "border-[rgba(255,137,4,0.25)] bg-[rgba(255,137,4,0.1)] text-[#ff8904]",
};

function StrategyInfoPopover({ strategy, anchorRef, onClose }) {
  const popoverRef = useRef(null);
  const [pos, setPos] = useState(null);

  useLayoutEffect(() => {
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
      const openBelow = spaceBelow > 180 || rect.top < 180;
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
  }, [anchorRef]);

  useEffect(() => {
    const onPointerDown = (e) => {
      if (
        popoverRef.current?.contains(e.target) ||
        anchorRef.current?.contains(e.target)
      ) {
        return;
      }
      onClose();
    };
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [anchorRef, onClose]);

  if (!pos) return null;

  const riskClass = RISK_STYLES[strategy.risk] ?? RISK_STYLES.Medium;

  return createPortal(
    <div
      ref={popoverRef}
      role="dialog"
      aria-label={`${strategy.name} strategy details`}
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
 * Dropdown strategy picker — scalable for larger strategy catalogs.
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
  const infoRef = useRef(null);
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <div
      className={`flex min-w-0 ${inline ? "shrink-0" : "flex-col gap-2"}`}
    >
      <div
        className={`flex min-w-0 items-center gap-2 ${
          inline ? "w-[min(180px,42vw)] sm:w-[168px]" : ""
        }`}
      >
        <label className="sr-only" htmlFor={selectId}>
          Select strategy
        </label>
        <div className="relative min-w-0 flex-1">
          <select
            id={selectId}
            value={active.id}
            disabled={disabled}
            onChange={(e) => onSelect(e.target.value)}
            className={`w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#0c0a08] px-2.5 text-xs font-medium text-[#e8d5b5] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] outline-none transition-colors ${
              inline ? "h-[37px]" : "h-8"
            } ${
              disabled
                ? "cursor-default opacity-60"
                : "cursor-pointer hover:border-[rgba(204,177,127,0.32)] focus-visible:border-[rgba(204,177,127,0.45)]"
            }`}
            aria-label="Select vault strategy"
          >
            {strategies.map((s) => (
              <option key={s.id} value={s.id} className="bg-[#0c0a08] text-[#e8d5b5]">
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <button
          ref={infoRef}
          type="button"
          onClick={() => setInfoOpen((v) => !v)}
          className={`flex shrink-0 items-center justify-center rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] text-[#717182] transition-colors hover:border-[rgba(204,177,127,0.24)] hover:text-[#ccb17f] ${
            inline ? "size-[37px]" : "size-8"
          }`}
          aria-label={`Learn about ${active.name}`}
          aria-expanded={infoOpen}
        >
          <CircleHelp className="size-3.5" strokeWidth={2} aria-hidden />
        </button>
      </div>

      {infoOpen ? (
        <StrategyInfoPopover
          strategy={active}
          anchorRef={infoRef}
          onClose={() => setInfoOpen(false)}
        />
      ) : null}
    </div>
  );
}
