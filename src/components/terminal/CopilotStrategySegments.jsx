import { Check, ChevronDown } from "lucide-react";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import CopilotStrategyDetailStrip from "./CopilotStrategyDetailStrip.jsx";
import {
  COPILOT_STRATEGY_MOBILE_VISIBLE_LIMIT,
  getInitialCopilotStrategyDetailsOpen,
  markCopilotStrategyDetailsIntroSeen,
  resolveCopilotSegmentStrategies,
} from "./copilotStrategies.js";

const RISK_DOT = {
  Low: "bg-[#269755]",
  Medium: "bg-[#f2b500]",
  High: "bg-[#d53d3d]",
};

function StrategyCollapsedSummary({ strategy, className = "" }) {
  if (!strategy) return null;

  return (
    <p
      className={`min-w-0 truncate text-[10px] leading-snug text-[#757575] sm:text-[11px] ${className}`}
    >
      {strategy.risk} risk · {strategy.timeframe}
    </p>
  );
}

function segmentButtonClass(selected, mobile) {
  if (mobile) {
    return `flex shrink-0 items-center border font-medium transition-colors min-h-8 rounded-md px-2.5 py-1 text-xs ${
      selected
        ? "border-transparent bg-[#3e2e00] text-[#f2b500]"
        : "border-[#242424] bg-transparent text-[#bfbfbf] hover:bg-white/5 hover:text-white"
    }`;
  }

  return `relative shrink-0 font-medium transition-colors group/segment inline-flex items-center gap-1 px-2.5 py-1 text-[11px] sm:px-3 sm:py-1.5 sm:text-xs ${
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
  onStrategyHover,
  mobile,
  detailsOpen = false,
}) {
  return (
    <div
      role="tablist"
      aria-label="AI strategy"
      onMouseLeave={() => onStrategyHover?.(null)}
      className={
        mobile
          ? "minimal-scrollbar min-w-0 flex-1 overflow-x-auto pb-0.5"
          : "min-w-0 shrink-0"
      }
    >
      <div
        className={
          mobile
            ? "flex w-max min-w-full items-center gap-2"
            : "inline-flex min-w-min rounded-md border border-[#1f1f1f] bg-[#050505] p-0.5"
        }
      >
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
              title={
                mobile
                  ? `${strategy.shortLabel ?? strategy.name}${
                      strategy.tagline ? ` — ${strategy.tagline}` : ""
                    }`
                  : (strategy.tagline ?? strategy.name)
              }
              aria-label={
                mobile
                  ? `${strategy.shortLabel ?? strategy.name}${
                      strategy.tagline ? `, ${strategy.tagline}` : ""
                    }`
                  : undefined
              }
              onMouseEnter={() => onStrategyHover?.(strategy.id)}
              onClick={() => onSelect(strategy.id)}
              className={`${segmentButtonClass(selected, mobile)} ${
                !mobile && !selected && !isLast
                  ? "after:absolute after:right-0 after:top-1/2 after:h-3.5 after:w-px after:-translate-y-1/2 after:bg-[#242424]"
                  : ""
              }`}
            >
              {strategy.shortLabel ?? strategy.name}
              {!mobile ? (
                <ChevronDown
                  className={`size-3 shrink-0 transition-all ${
                    selected
                      ? "opacity-100"
                      : "opacity-0 group-hover/segment:opacity-100 group-focus-visible/segment:opacity-100"
                  } ${selected && detailsOpen ? "rotate-180" : ""}`}
                  strokeWidth={2}
                  aria-hidden
                />
              ) : null}
            </button>
          );
        })}

        {overflow.length > 0 ? (
          <button
            ref={moreButtonRef}
            type="button"
            aria-haspopup="listbox"
            aria-expanded={overflowOpen}
            aria-label={`Browse ${overflow.length} more strategies`}
            onClick={onToggleOverflow}
            className={`${segmentButtonClass(
              overflowSelected,
              mobile,
            )} inline-flex items-center gap-1 ${
              !mobile
                ? `pl-2.5 pr-2 ${
                    visible.length > 0
                      ? "before:absolute before:left-0 before:top-1/2 before:h-3.5 before:w-px before:-translate-y-1/2 before:bg-[#242424]"
                      : ""
                  }`
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
  mobile = false,
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
      const width = Math.min(mobile ? 280 : 320, window.innerWidth - 24);
      const left = Math.min(
        Math.max(12, rect.left + rect.width / 2 - width / 2),
        window.innerWidth - width - 12,
      );
      const maxMenuHeight = Math.min(320, window.innerHeight * 0.5);
      const belowTop = rect.bottom + 6;
      const aboveTop = rect.top - maxMenuHeight - 6;
      const top =
        belowTop + maxMenuHeight > window.innerHeight - 12 && aboveTop >= 12
          ? aboveTop
          : belowTop;
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
          Choose a strategy
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
                  {strategy.tagline ? (
                    <span className="mt-1 block text-[11px] font-medium leading-snug text-[#bfbfbf]">
                      {strategy.tagline}
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
 * AI strategy lens — segments, details accordion, overflow menu.
 */
export default function CopilotStrategySegments({
  strategies,
  selectedId,
  onSelect,
  mobile = false,
  layout = "default",
  showDetails = true,
  embedded = false,
  renderDetailsPanel = true,
  detailsOpen: detailsOpenProp,
  onDetailsOpenChange,
}) {
  const listId = useId();
  const moreButtonRef = useRef(null);
  const [overflowOpen, setOverflowOpen] = useState(false);
  const [hoveredStrategyId, setHoveredStrategyId] = useState(null);
  const [detailsOpenInternal, setDetailsOpenInternal] = useState(
    getInitialCopilotStrategyDetailsOpen,
  );
  const detailsOpen = detailsOpenProp ?? detailsOpenInternal;
  const setDetailsOpen = onDetailsOpenChange ?? setDetailsOpenInternal;
  const isControlled = detailsOpenProp !== undefined;

  useEffect(() => {
    if (!isControlled && detailsOpenInternal) {
      markCopilotStrategyDetailsIntroSeen();
    }
  }, [detailsOpenInternal, isControlled]);

  useEffect(() => {
    if (isControlled && detailsOpen) {
      markCopilotStrategyDetailsIntroSeen();
    }
  }, [detailsOpen, isControlled]);

  const active =
    strategies?.find((s) => s.id === selectedId) ?? strategies?.[0] ?? null;

  useEffect(() => {
    setOverflowOpen(false);
  }, [active?.id]);

  if (!strategies?.length || !active) return null;

  const { visible, overflow } = resolveCopilotSegmentStrategies(
    strategies,
    active.id,
    mobile ? COPILOT_STRATEGY_MOBILE_VISIBLE_LIMIT : undefined,
  );
  const overflowSelected = overflow.some((s) => s.id === active.id);
  const hoveredStrategy = hoveredStrategyId
    ? (strategies.find((s) => s.id === hoveredStrategyId) ?? null)
    : null;

  const handleSelect = (id) => {
    if (id === active.id && showDetails) {
      setDetailsOpen(!detailsOpen);
      return;
    }
    onSelect(id);
    if (showDetails) {
      setDetailsOpen(true);
    }
  };

  const isToolbar = layout === "toolbar" && !mobile;
  const isSplit = isToolbar;

  const hoverSummary =
    hoveredStrategy && !detailsOpen ? (
      <StrategyCollapsedSummary strategy={hoveredStrategy} />
    ) : null;

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
        onSelect={handleSelect}
        onToggleOverflow={() => setOverflowOpen((open) => !open)}
        onStrategyHover={setHoveredStrategyId}
        mobile={false}
        detailsOpen={detailsOpen}
      />
      {hoverSummary}
    </div>
  ) : mobile ? (
    <SegmentControl
      listId={listId}
      visible={visible}
      overflow={overflow}
      active={active}
      overflowOpen={overflowOpen}
      overflowSelected={overflowSelected}
      moreButtonRef={moreButtonRef}
      onSelect={handleSelect}
      onToggleOverflow={() => setOverflowOpen((open) => !open)}
      mobile
    />
  ) : (
    <div className="flex items-center gap-2">
      <SegmentControl
        listId={listId}
        visible={visible}
        overflow={overflow}
        active={active}
        overflowOpen={overflowOpen}
        overflowSelected={overflowSelected}
        moreButtonRef={moreButtonRef}
        onSelect={handleSelect}
        onToggleOverflow={() => setOverflowOpen((open) => !open)}
        onStrategyHover={mobile ? undefined : setHoveredStrategyId}
        mobile={mobile}
        detailsOpen={detailsOpen}
      />
      {!mobile ? hoverSummary : null}
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
          onSelect={handleSelect}
          onClose={() => setOverflowOpen(false)}
        />
      </>
    );
  }

  if (mobile) {
    const mobileBody = (
      <>
        <div
          className={
            embedded
              ? undefined
              : `px-3 py-2.5 ${
                  showDetails && detailsOpen ? "border-b border-[#242424]" : ""
                }`
          }
        >
          {headerRow}
        </div>

        {showDetails && detailsOpen && renderDetailsPanel ? (
          <div
            id="copilot-strategy-details"
            className={
              embedded
                ? "mt-2.5 border-t border-[#242424] pt-2.5"
                : "px-3 py-2.5"
            }
          >
            <CopilotStrategyDetailStrip strategy={active} compact />
          </div>
        ) : null}

        <StrategyOverflowMenu
          open={overflowOpen}
          anchorEl={moreButtonRef.current}
          items={overflow}
          selectedId={active.id}
          onSelect={handleSelect}
          onClose={() => setOverflowOpen(false)}
          mobile
        />
      </>
    );

    if (embedded) {
      return mobileBody;
    }

    return (
      <div className="overflow-hidden rounded-lg border border-[#242424] bg-[#0a0a0a]">
        {mobileBody}
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
        {headerRow}
      </div>

      {showDetails && detailsOpen && renderDetailsPanel ? (
        <div id="copilot-strategy-details" className="px-3.5 py-3 sm:px-4 sm:py-3.5">
          <CopilotStrategyDetailStrip strategy={active} />
        </div>
      ) : null}

      <StrategyOverflowMenu
        open={overflowOpen}
        anchorEl={moreButtonRef.current}
        items={overflow}
        selectedId={active.id}
        onSelect={handleSelect}
        onClose={() => setOverflowOpen(false)}
      />
    </div>
  );
}
