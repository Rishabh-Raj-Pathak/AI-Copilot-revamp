import { Check, ChevronDown } from "lucide-react";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import CopilotStrategyDetailStrip from "./CopilotStrategyDetailStrip.jsx";
import { resolveCopilotSegmentStrategies } from "./copilotStrategies.js";

const RISK_DOT = {
  Low: "bg-[#269755]",
  Medium: "bg-[#f2b500]",
  High: "bg-[#d53d3d]",
};

function StrategyCollapsedSummary({ strategy, inline = false }) {
  if (!strategy) return null;

  return (
    <p
      className={
        inline
          ? "shrink-0 text-[10px] leading-snug text-[#757575]"
          : "text-[11px] leading-snug text-[#757575]"
      }
    >
      {strategy.risk} risk · {strategy.timeframe}
    </p>
  );
}

function StrategyDetailsChevron({ open, onToggle, mobile = false }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-controls="copilot-strategy-details"
      aria-label={open ? "Hide strategy details" : "Show strategy details"}
      className={`inline-flex shrink-0 items-center justify-center rounded-md border border-[#242424] text-[#bfbfbf] transition-colors hover:bg-white/[0.03] hover:text-white ${
        mobile ? "size-7" : "size-7 sm:size-8"
      }`}
    >
      <ChevronDown
        className={`size-4 shrink-0 transition-transform ${
          open ? "rotate-180" : ""
        }`}
        strokeWidth={2}
        aria-hidden
      />
    </button>
  );
}

function segmentButtonClass(selected, mobile) {
  return `relative shrink-0 font-medium transition-colors ${
    mobile ? "min-h-8 px-2.5 py-1.5 text-xs" : "px-2.5 py-1 text-[11px] sm:px-3 sm:py-1.5 sm:text-xs"
  } ${
    selected
      ? "rounded-md bg-[#3e2e00] text-[#f2b500] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
      : "rounded-md text-[#bfbfbf] hover:bg-white/[0.03] hover:text-white"
  }`;
}

function SegmentControl({
  listId,
  visible,
  overflow,
  active,
  overflowOpen,
  overflowSelected,
  moreButtonRef,
  onSelect,
  onToggleOverflow,
  mobile,
}) {
  return (
    <div
      role="tablist"
      aria-label="AI strategy"
      className={
        mobile
          ? "minimal-scrollbar min-w-0 flex-1 overflow-x-auto"
          : "min-w-0 flex-1"
      }
    >
      <div className="inline-flex min-w-min rounded-md border border-[#1f1f1f] bg-[#050505] p-0.5">
        {visible.map((strategy, index) => {
          const selected = strategy.id === active.id;
          const isLast = index === visible.length - 1 && !overflow.length;

          return (
            <button
              key={strategy.id}
              type="button"
              role="tab"
              id={`${listId}-${strategy.id}`}
              aria-selected={selected}
              title={strategy.catalogName ?? strategy.name}
              onClick={() => onSelect(strategy.id)}
              className={`${segmentButtonClass(selected, mobile)} ${
                !selected && !isLast
                  ? "after:absolute after:right-0 after:top-1/2 after:h-3.5 after:w-px after:-translate-y-1/2 after:bg-[#242424]"
                  : ""
              }`}
            >
              {strategy.shortLabel ?? strategy.name}
            </button>
          );
        })}

        {overflow.length > 0 ? (
          <button
            ref={moreButtonRef}
            type="button"
            aria-haspopup="listbox"
            aria-expanded={overflowOpen}
            onClick={onToggleOverflow}
            className={`${segmentButtonClass(
              overflowSelected,
              mobile,
            )} inline-flex items-center gap-1 pl-2.5 pr-2 ${
              visible.length > 0
                ? "before:absolute before:left-0 before:top-1/2 before:h-3.5 before:w-px before:-translate-y-1/2 before:bg-[#242424]"
                : ""
            }`}
          >
            +{overflow.length} more
            <ChevronDown
              className={`size-3 shrink-0 transition-transform ${
                overflowOpen ? "rotate-180" : ""
              } ${overflowSelected ? "text-[#f2b500]" : "text-[#757575]"}`}
              strokeWidth={2}
              aria-hidden
            />
          </button>
        ) : null}
      </div>
    </div>
  );
}

function StrategyOverflowMenu({
  open,
  anchorEl,
  items,
  selectedId,
  onSelect,
  onClose,
}) {
  const menuRef = useRef(null);
  const [pos, setPos] = useState(null);

  useLayoutEffect(() => {
    if (!open || !anchorEl) {
      setPos(null);
      return undefined;
    }

    const update = () => {
      const rect = anchorEl.getBoundingClientRect();
      const width = Math.min(320, window.innerWidth - 24);
      const left = Math.min(
        Math.max(12, rect.left),
        window.innerWidth - width - 12,
      );
      const top = rect.bottom + 6;
      setPos({ left, top, width });
    };

    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [anchorEl, open]);

  useEffect(() => {
    if (!open) return undefined;

    const onPointerDown = (e) => {
      const t = e.target;
      if (menuRef.current?.contains(t) || anchorEl?.contains(t)) return;
      onClose?.();
    };

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, anchorEl, onClose]);

  if (!open || !pos || !items.length) return null;

  return createPortal(
    <div
      ref={menuRef}
      role="listbox"
      aria-label="More AI strategies"
      className="fixed z-[220] overflow-hidden rounded-xl border border-[#242424] bg-[#0a0a0a] shadow-[0_12px_40px_rgba(0,0,0,0.55)]"
      style={{ left: pos.left, top: pos.top, width: pos.width }}
    >
      <div className="border-b border-[#242424] px-3 py-2">
        <p className="text-[10px] font-medium uppercase tracking-[0.35px] text-[#757575]">
          More strategies
        </p>
      </div>
      <ul className="max-h-[min(320px,50vh)] overflow-y-auto p-1.5">
        {items.map((strategy) => {
          const selected = strategy.id === selectedId;
          const dotClass = RISK_DOT[strategy.risk] ?? RISK_DOT.Medium;

          return (
            <li key={strategy.id}>
              <button
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onSelect?.(strategy.id);
                  onClose?.();
                }}
                className={`flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2.5 text-left transition-colors ${
                  selected
                    ? "bg-[#171200] ring-1 ring-inset ring-[#3e2e00]"
                    : "hover:bg-white/[0.03]"
                }`}
              >
                <span
                  className={`mt-1.5 size-1.5 shrink-0 rounded-full ${dotClass}`}
                  aria-hidden
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-white">
                      {strategy.shortLabel ?? strategy.name}
                    </span>
                    {selected ? (
                      <Check
                        className="size-3.5 shrink-0 text-[#f2b500]"
                        strokeWidth={2.5}
                        aria-hidden
                      />
                    ) : null}
                  </span>
                  {strategy.catalogName ? (
                    <span className="mt-0.5 block text-[10px] text-[#757575]">
                      {strategy.catalogName}
                    </span>
                  ) : null}
                  <span className="mt-1 line-clamp-2 text-[11px] leading-snug text-[#999]">
                    {strategy.description}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>,
    document.body,
  );
}

/**
 * AI strategy lens — segments, chevron accordion details, overflow menu.
 */
export default function CopilotStrategySegments({
  strategies,
  selectedId,
  onSelect,
  mobile = false,
  layout = "default",
  showDetails = true,
  detailsOpen: detailsOpenProp,
  onDetailsOpenChange,
}) {
  const listId = useId();
  const moreButtonRef = useRef(null);
  const [overflowOpen, setOverflowOpen] = useState(false);
  const [detailsOpenInternal, setDetailsOpenInternal] = useState(false);
  const detailsOpen = detailsOpenProp ?? detailsOpenInternal;
  const setDetailsOpen = onDetailsOpenChange ?? setDetailsOpenInternal;

  if (!strategies?.length) return null;

  const active =
    strategies.find((s) => s.id === selectedId) ?? strategies[0];
  const { visible, overflow } = resolveCopilotSegmentStrategies(
    strategies,
    active.id,
  );
  const overflowSelected = overflow.some((s) => s.id === active.id);

  useEffect(() => {
    setOverflowOpen(false);
  }, [active.id]);

  const isToolbar = layout === "toolbar" && !mobile;
  const isSplit = isToolbar; // legacy alias

  const headerRow = isToolbar ? (
    <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
      <SegmentControl
        listId={listId}
        visible={visible}
        overflow={overflow}
        active={active}
        overflowOpen={overflowOpen}
        overflowSelected={overflowSelected}
        moreButtonRef={moreButtonRef}
        onSelect={onSelect}
        onToggleOverflow={() => setOverflowOpen((open) => !open)}
        mobile={false}
      />
      {showDetails ? (
        <StrategyDetailsChevron
          open={detailsOpen}
          onToggle={() => setDetailsOpen(!detailsOpen)}
        />
      ) : null}
    </div>
  ) : (
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0 flex-1">
        <SegmentControl
          listId={listId}
          visible={visible}
          overflow={overflow}
          active={active}
          overflowOpen={overflowOpen}
          overflowSelected={overflowSelected}
          moreButtonRef={moreButtonRef}
          onSelect={onSelect}
          onToggleOverflow={() => setOverflowOpen((open) => !open)}
          mobile={mobile}
        />
        {showDetails && !detailsOpen && !isToolbar ? (
          <div className={mobile ? "mt-2" : "mt-2.5"}>
            <StrategyCollapsedSummary strategy={active} />
          </div>
        ) : null}
      </div>
      {showDetails ? (
        <StrategyDetailsChevron
          open={detailsOpen}
          onToggle={() => setDetailsOpen(!detailsOpen)}
          mobile={mobile}
        />
      ) : null}
    </div>
  );

  if (isSplit) {
    return (
      <>
        {headerRow}
        <StrategyOverflowMenu
          open={overflowOpen}
          anchorEl={moreButtonRef.current}
          items={overflow}
          selectedId={active.id}
          onSelect={onSelect}
          onClose={() => setOverflowOpen(false)}
        />
      </>
    );
  }

  if (mobile) {
    return (
      <div className="overflow-hidden rounded-lg border border-[#242424] bg-[#0a0a0a]">
        <div
          className={`px-3 py-2.5 ${
            showDetails && detailsOpen ? "border-b border-[#242424]" : ""
          }`}
        >
          <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.35px] text-[#757575]">
            AI strategy
          </p>
          {headerRow}
        </div>

        {showDetails && detailsOpen ? (
          <div id="copilot-strategy-details" className="px-3 py-2.5">
            <CopilotStrategyDetailStrip strategy={active} compact />
          </div>
        ) : null}

        <StrategyOverflowMenu
          open={overflowOpen}
          anchorEl={moreButtonRef.current}
          items={overflow}
          selectedId={active.id}
          onSelect={onSelect}
          onClose={() => setOverflowOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-lg border border-[#242424] bg-[#0a0a0a]">
      <div
        className={`px-3.5 py-2.5 sm:px-4 ${
          showDetails && detailsOpen ? "border-b border-[#242424]" : ""
        }`}
      >
        <div className="mb-2.5 flex items-center gap-3">
          <span className="shrink-0 text-[10px] font-medium uppercase tracking-[0.35px] text-[#757575]">
            AI strategy
          </span>
        </div>
        {headerRow}
      </div>

      {showDetails && detailsOpen ? (
        <div id="copilot-strategy-details" className="px-3.5 py-3 sm:px-4 sm:py-3.5">
          <CopilotStrategyDetailStrip strategy={active} />
        </div>
      ) : null}

      <StrategyOverflowMenu
        open={overflowOpen}
        anchorEl={moreButtonRef.current}
        items={overflow}
        selectedId={active.id}
        onSelect={onSelect}
        onClose={() => setOverflowOpen(false)}
      />
    </div>
  );
}
