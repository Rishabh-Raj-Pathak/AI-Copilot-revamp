import { Check, ChevronDown, X } from "lucide-react";
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { NARROW_VIEWPORT_MEDIA } from "../../styles/breakpoints.js";

const RISK_STYLES = {
  Low: "border-[#0a2917] bg-[#05150c] text-[#269755]",
  Medium: "border-[#3e2e00] bg-[#171200] text-[#f2b500]",
  High: "border-[#470f0f] bg-[#260808] text-[#d53d3d]",
};

const HOVER_CLOSE_MS = 140;
const MENU_GAP_PX = 6;
const Z_MENU = 240;
const Z_POPOVER_TRIGGER = 230;
const Z_POPOVER_MENU = 250;
const Z_SHEET_BACKDROP = 56;
const Z_SHEET = 57;

function useNarrowViewport() {
  const [narrow, setNarrow] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(NARROW_VIEWPORT_MEDIA).matches;
  });

  useEffect(() => {
    const mq = window.matchMedia(NARROW_VIEWPORT_MEDIA);
    const sync = () => setNarrow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return narrow;
}

function StrategyRiskBadge({ risk }) {
  const riskClass = RISK_STYLES[risk] ?? RISK_STYLES.Medium;
  return (
    <span
      className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.35px] ${riskClass}`}
    >
      {risk} risk
    </span>
  );
}

function StrategyActiveSummary({ strategy, onViewDetails }) {
  if (!strategy) return null;

  const parts = [
    strategy.risk ? `${strategy.risk} risk` : null,
    strategy.timeframe ?? null,
  ].filter(Boolean);

  return (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      {parts.length > 0 ? (
        <p className="min-w-0 flex-1 truncate text-[10px] leading-snug text-[#bfbfbf] sm:text-[11px]">
          {parts.join(" · ")}
        </p>
      ) : (
        <span className="min-w-0 flex-1" aria-hidden />
      )}
      {onViewDetails ? (
        <button
          type="button"
          onClick={onViewDetails}
          className="shrink-0 text-[10px] font-medium uppercase tracking-[0.3px] text-[#f2b500] transition-opacity hover:opacity-90"
        >
          Details
        </button>
      ) : null}
    </div>
  );
}

function StrategyDetailBody({ strategy }) {
  if (!strategy) return null;

  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold leading-5 text-white">
          {strategy.shortLabel ?? strategy.name}
        </p>
        <StrategyRiskBadge risk={strategy.risk} />
      </div>
      {strategy.tagline ? (
        <p className="mt-1.5 text-xs font-medium leading-snug text-[#bfbfbf]">
          {strategy.tagline}
        </p>
      ) : null}
      <p className="mt-2 text-xs leading-[1.55] text-[#999]">
        {strategy.description}
      </p>
      <dl className="mt-3 flex flex-col gap-2 border-t border-[#242424] pt-3 text-[11px]">
        <div className="flex gap-2">
          <dt className="shrink-0 font-medium uppercase tracking-[0.35px] text-[#757575]">
            Timeframe
          </dt>
          <dd className="text-[#d4d4d4]">{strategy.timeframe}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="shrink-0 font-medium uppercase tracking-[0.35px] text-[#757575]">
            Best for
          </dt>
          <dd className="text-[#d4d4d4]">{strategy.bestFor}</dd>
        </div>
      </dl>
    </>
  );
}

function StrategyInfoPopover({
  strategy,
  anchorEl,
  open,
  placement = "below",
  zIndex = Z_POPOVER_TRIGGER,
  onHoverStart,
  onHoverEnd,
}) {
  const popoverRef = useRef(null);
  const [pos, setPos] = useState(null);

  useLayoutEffect(() => {
    if (!open || !anchorEl) {
      setPos(null);
      return undefined;
    }

    const update = () => {
      const rect = anchorEl.getBoundingClientRect();
      const width = Math.min(300, window.innerWidth - 24);

      if (placement === "beside") {
        const spaceLeft = rect.left;
        const openLeft = spaceLeft >= width + 20;
        const left = openLeft
          ? rect.left - width - 10
          : Math.min(rect.right + 10, window.innerWidth - width - 12);
        const estimatedHeight = 200;
        const top = Math.min(
          Math.max(12, rect.top + rect.height / 2 - estimatedHeight / 2),
          window.innerHeight - estimatedHeight - 12,
        );
        setPos({
          left: Math.max(12, left),
          top,
          width,
        });
        return;
      }

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
  }, [anchorEl, open, placement]);

  if (!open || !pos || !strategy) return null;

  return createPortal(
    <div
      ref={popoverRef}
      role="tooltip"
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      className="fixed rounded-xl border border-[#242424] bg-[#0a0a0a] p-4 shadow-[0_8px_32px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.04)]"
      style={{
        left: pos.left,
        top: pos.top,
        bottom: pos.bottom,
        width: pos.width,
        zIndex,
      }}
    >
      <StrategyDetailBody strategy={strategy} />
    </div>,
    document.body,
  );
}

function CopilotStrategyMobileSheet({
  open,
  mode,
  strategies,
  highlightId,
  selectedId,
  returnToPicker,
  onViewDetails,
  onBackToPicker,
  onClose,
  onConfirm,
}) {
  const sheetRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  useLayoutEffect(() => {
    if (!open) {
      document.documentElement.style.removeProperty(
        "--copilot-strategy-sheet-height",
      );
      return undefined;
    }

    const el = sheetRef.current;
    if (!el) return undefined;

    const sync = () => {
      document.documentElement.style.setProperty(
        "--copilot-strategy-sheet-height",
        `${el.getBoundingClientRect().height}px`,
      );
    };

    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    window.addEventListener("resize", sync);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", sync);
      document.documentElement.style.removeProperty(
        "--copilot-strategy-sheet-height",
      );
    };
  }, [open]);

  if (!open) return null;

  const highlighted =
    strategies.find((s) => s.id === highlightId) ?? strategies[0];
  const isPicker = mode === "picker";

  return createPortal(
    <div className="max-tablet:block tablet:hidden">
      <button
        type="button"
        aria-label="Close strategy panel"
        className="fixed inset-0 bg-black/60"
        style={{ zIndex: Z_SHEET_BACKDROP }}
        onClick={onClose}
      />
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={isPicker ? "Choose AI strategy" : "Strategy details"}
        className="fixed inset-x-0 bottom-0 flex max-h-[min(88dvh,720px)] flex-col overflow-hidden rounded-t-[20px] border border-[#242424] bg-[#0a0a0a] shadow-[0_-12px_40px_rgba(0,0,0,0.55)]"
        style={{ zIndex: Z_SHEET }}
      >
        <div className="flex shrink-0 flex-col items-center border-b border-[#242424] px-4 pb-3 pt-2">
          <div
            className="mb-3 h-1 w-10 shrink-0 rounded-full bg-[#454545]"
            aria-hidden
          />
          <div className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-2">
            {!isPicker && returnToPicker ? (
              <button
                type="button"
                onClick={onBackToPicker}
                className="text-sm font-medium text-[#f2b500] transition-opacity hover:opacity-90"
              >
                ← Back
              </button>
            ) : (
              <span className="size-9" aria-hidden />
            )}
            <h3 className="text-center text-base font-semibold text-white">
              {isPicker ? "Choose strategy" : "Strategy details"}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="flex size-9 shrink-0 items-center justify-center rounded-lg text-[#bfbfbf] hover:bg-white/5 hover:text-white"
              aria-label="Close"
            >
              <X className="size-5" strokeWidth={2} aria-hidden />
            </button>
          </div>
        </div>

        <div className="minimal-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {isPicker ? (
            <>
              <p className="mb-3 text-xs leading-relaxed text-[#757575]">
                Tap a strategy to select it, or open Details to read more first.
              </p>
              <ul
                className="flex flex-col gap-3"
                role="listbox"
                aria-label="AI strategies"
              >
                {strategies.map((strategy) => {
                  const selected = strategy.id === selectedId;
                  return (
                    <li key={strategy.id}>
                      <div
                        className={`overflow-hidden rounded-[14px] border transition-colors ${
                          selected
                            ? "border-[#3e2e00] bg-[#171200]"
                            : "border-[#242424] bg-[#050505]"
                        }`}
                      >
                        <button
                          type="button"
                          role="option"
                          aria-selected={selected}
                          onClick={() => onConfirm(strategy.id)}
                          className="w-full px-4 pb-3 pt-4 text-left transition-colors active:bg-white/[0.03]"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="min-w-0 text-sm font-semibold leading-5 text-white">
                              {strategy.shortLabel ?? strategy.name}
                            </p>
                            <StrategyRiskBadge risk={strategy.risk} />
                          </div>
                          {strategy.tagline ? (
                            <p className="mt-1.5 text-xs font-medium leading-snug text-[#bfbfbf]">
                              {strategy.tagline}
                            </p>
                          ) : null}
                          <p className="mt-2 line-clamp-2 text-xs leading-[1.55] text-[#757575]">
                            {strategy.description}
                          </p>
                        </button>
                        <div className="flex justify-end border-t border-[#242424] px-4 py-2.5">
                          <button
                            type="button"
                            onClick={() => onViewDetails(strategy.id)}
                            className="text-[10px] font-medium uppercase tracking-[0.35px] text-[#f2b500] transition-opacity hover:opacity-90"
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          ) : (
            <div className="rounded-[14px] border border-[#242424] bg-[#050505] p-4">
              <StrategyDetailBody strategy={highlighted} />
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

/**
 * AI strategy dropdown — desktop hover preview; mobile bottom sheet picker.
 */
export default function CopilotStrategySelector({
  strategies,
  selectedId,
  disabled,
  onSelect,
  inline = false,
  onViewDetails,
}) {
  const isNarrow = useNarrowViewport();
  const listId = useId();
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const closeTimerRef = useRef(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const [previewStrategy, setPreviewStrategy] = useState(null);
  const [previewAnchorEl, setPreviewAnchorEl] = useState(null);
  const [previewFromMenu, setPreviewFromMenu] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState("picker");
  const [sheetHighlightId, setSheetHighlightId] = useState(null);
  const [sheetReturnToPicker, setSheetReturnToPicker] = useState(false);

  const controlHeight = inline ? "h-10" : isNarrow ? "h-9" : "h-9";
  const controlRadius = inline ? "rounded-md" : "rounded-lg";
  const menuWidth = inline ? 220 : 200;

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const closePreview = () => {
    clearCloseTimer();
    setInfoOpen(false);
    setPreviewStrategy(null);
    setPreviewAnchorEl(null);
    setPreviewFromMenu(false);
  };

  const openPreview = (strategy, anchorEl, fromMenu = false) => {
    if (disabled || !strategy || !anchorEl || isNarrow) return;
    clearCloseTimer();
    setPreviewStrategy(strategy);
    setPreviewAnchorEl(anchorEl);
    setPreviewFromMenu(fromMenu);
    setInfoOpen(true);
  };

  const scheduleClosePreview = () => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(closePreview, HOVER_CLOSE_MS);
  };

  const updateMenuPosition = () => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const left = Math.min(
      Math.max(8, rect.left),
      window.innerWidth - menuWidth - 8,
    );
    setMenuPos({
      left,
      top: rect.bottom + MENU_GAP_PX,
      width: Math.max(rect.width, menuWidth),
    });
  };

  useLayoutEffect(() => {
    if (!menuOpen || isNarrow) {
      setMenuPos(null);
      return undefined;
    }
    updateMenuPosition();
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);
    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [menuOpen, menuWidth, isNarrow]);

  useEffect(() => {
    if (!menuOpen || isNarrow) return undefined;
    const onPointerDown = (e) => {
      if (
        rootRef.current?.contains(e.target) ||
        menuRef.current?.contains(e.target)
      ) {
        return;
      }
      setMenuOpen(false);
      closePreview();
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        closePreview();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen, isNarrow]);

  useEffect(() => () => clearCloseTimer(), []);

  if (!strategies?.length) return null;

  const active =
    strategies.find((s) => s.id === selectedId) ?? strategies[0];
  const resolvedHighlightId = sheetHighlightId ?? active.id;

  const openMobileSheet = (mode) => {
    if (disabled) return;
    setSheetMode(mode);
    setSheetHighlightId(active.id);
    setSheetReturnToPicker(false);
    setSheetOpen(true);
  };

  const closeMobileSheet = () => {
    if (sheetMode === "details" && sheetReturnToPicker) {
      setSheetMode("picker");
      setSheetReturnToPicker(false);
      return;
    }
    setSheetOpen(false);
  };

  const handleBackToPicker = () => {
    setSheetMode("picker");
    setSheetReturnToPicker(false);
  };

  const handleMobileViewDetails = (strategyId) => {
    setSheetHighlightId(strategyId);
    setSheetReturnToPicker(sheetOpen && sheetMode === "picker");
    setSheetMode("details");
    setSheetOpen(true);
  };

  const handleToggleMenu = () => {
    if (disabled) return;
    if (isNarrow) {
      openMobileSheet("picker");
      return;
    }
    setMenuOpen((open) => {
      const next = !open;
      if (next) {
        closePreview();
      }
      return next;
    });
  };

  const handleSelect = (strategy) => {
    onSelect(strategy.id);
    setMenuOpen(false);
    closePreview();
  };

  const handleMobileConfirm = (strategyId) => {
    if (!strategyId) return;
    onSelect(strategyId);
    closeMobileSheet();
  };

  const triggerWidthClass = "min-w-[12rem] shrink-0 sm:min-w-[13rem]";

  return (
    <div
      ref={rootRef}
      className={`flex min-w-0 flex-col gap-1.5 ${inline ? "w-full shrink-0" : "w-full"}`}
    >
      <div className="flex min-w-0 items-center gap-2 sm:gap-2.5">
        <button
          ref={triggerRef}
          type="button"
          disabled={disabled}
          aria-haspopup={isNarrow ? "dialog" : "listbox"}
          aria-expanded={isNarrow ? sheetOpen : menuOpen}
          aria-controls={isNarrow ? undefined : listId}
          aria-label={
            isNarrow
              ? `Change strategy, currently ${active.shortLabel ?? active.name}`
              : undefined
          }
          onClick={handleToggleMenu}
          onMouseEnter={() => {
            if (isNarrow || menuOpen) return;
            openPreview(active, triggerRef.current, false);
          }}
          onMouseLeave={() => {
            if (isNarrow || menuOpen) return;
            scheduleClosePreview();
          }}
          onFocus={() => {
            if (isNarrow || menuOpen) return;
            openPreview(active, triggerRef.current, false);
          }}
          onBlur={(e) => {
            if (isNarrow) return;
            if (rootRef.current?.contains(e.relatedTarget)) return;
            if (menuRef.current?.contains(e.relatedTarget)) return;
            if (menuOpen) return;
            scheduleClosePreview();
          }}
          className={`relative flex min-w-0 items-center border pl-3 pr-8 text-left text-sm font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] outline-none transition-colors ${controlHeight} ${controlRadius} ${triggerWidthClass} ${
            disabled
              ? "cursor-default border-[#242424] bg-[#050505] text-white opacity-60"
              : "cursor-pointer border-[#3e2e00] bg-[#3e2e00] text-[#f2b500] hover:border-[#f2b500]/50 focus-visible:border-[#f2b500]"
          }`}
        >
          <span className="truncate">{active.shortLabel ?? active.name}</span>
          <ChevronDown
            className={`pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 transition-transform ${
              disabled ? "text-[#757575] opacity-50" : "text-[#f2b500]"
            } ${menuOpen || sheetOpen ? "rotate-180" : ""}`}
            strokeWidth={2}
            aria-hidden
          />
        </button>

        {!disabled ? (
          <StrategyActiveSummary
            strategy={active}
            onViewDetails={
              isNarrow
                ? (onViewDetails ?? (() => openMobileSheet("details")))
                : undefined
            }
          />
        ) : null}
      </div>

      {isNarrow ? (
        <CopilotStrategyMobileSheet
          open={sheetOpen}
          mode={sheetMode}
          strategies={strategies}
          highlightId={resolvedHighlightId}
          selectedId={selectedId ?? active.id}
          returnToPicker={sheetReturnToPicker}
          onViewDetails={handleMobileViewDetails}
          onBackToPicker={handleBackToPicker}
          onClose={closeMobileSheet}
          onConfirm={handleMobileConfirm}
        />
      ) : null}

      {!isNarrow && menuOpen && menuPos
        ? createPortal(
            <div
              ref={menuRef}
              id={listId}
              role="listbox"
              aria-label="Select AI strategy"
              className="fixed overflow-hidden rounded-lg border border-[#242424] bg-[#0a0a0a] py-1 shadow-[0_12px_40px_rgba(0,0,0,0.55)]"
              style={{
                left: menuPos.left,
                top: menuPos.top,
                width: menuPos.width,
                zIndex: Z_MENU,
              }}
              onMouseEnter={clearCloseTimer}
              onMouseLeave={scheduleClosePreview}
            >
              {strategies.map((strategy) => {
                const selected = strategy.id === active.id;
                return (
                  <button
                    key={strategy.id}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onMouseEnter={(e) =>
                      openPreview(strategy, e.currentTarget, true)
                    }
                    onFocus={(e) =>
                      openPreview(strategy, e.currentTarget, true)
                    }
                    onClick={() => handleSelect(strategy)}
                    className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs font-medium transition-colors ${
                      selected
                        ? "bg-[#171200] text-[#f2b500]"
                        : "text-[#bfbfbf] hover:bg-white/[0.03] hover:text-white"
                    }`}
                  >
                    <span className="truncate">
                      {strategy.shortLabel ?? strategy.name}
                    </span>
                    {selected ? (
                      <Check
                        className="size-3.5 shrink-0 text-[#f2b500]"
                        strokeWidth={2}
                        aria-hidden
                      />
                    ) : null}
                  </button>
                );
              })}
            </div>,
            document.body,
          )
        : null}

      {!disabled && !isNarrow && !menuOpen ? (
        <StrategyInfoPopover
          strategy={previewStrategy}
          anchorEl={previewAnchorEl}
          open={infoOpen}
          placement="below"
          zIndex={Z_POPOVER_TRIGGER}
          onHoverStart={clearCloseTimer}
          onHoverEnd={scheduleClosePreview}
        />
      ) : null}

      {!disabled && !isNarrow && menuOpen && previewFromMenu ? (
        <StrategyInfoPopover
          strategy={previewStrategy}
          anchorEl={previewAnchorEl}
          open={infoOpen}
          placement="beside"
          zIndex={Z_POPOVER_MENU}
          onHoverStart={clearCloseTimer}
          onHoverEnd={scheduleClosePreview}
        />
      ) : null}
    </div>
  );
}
