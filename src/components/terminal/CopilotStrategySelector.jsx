import { Check, ChevronDown } from "lucide-react";
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { NARROW_VIEWPORT_MEDIA } from "../../styles/breakpoints.js";
import AppIcon from "../mobile/AppIcon.jsx";
import { appIcons } from "../mobile/mobileAssets.js";
import CopilotStrategySheet from "../mobile/copilot/CopilotStrategySheet.jsx";

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
      className={`ds-eyebrow shrink-0 rounded-full border px-2 py-0.5 ${riskClass}`}
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
        <p className="min-w-0 flex-1 truncate text-micro text-ink-muted">
          {parts.join(" · ")}
        </p>
      ) : (
        <span className="min-w-0 flex-1" aria-hidden />
      )}
      {onViewDetails ? (
        <button
          type="button"
          onClick={onViewDetails}
          className="ds-eyebrow shrink-0 text-[#f2b500] transition-opacity hover:opacity-90"
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
        <p className="text-control font-medium text-ink">
          {strategy.shortLabel ?? strategy.name}
        </p>
        <StrategyRiskBadge risk={strategy.risk} />
      </div>
      {strategy.tagline ? (
        <p className="mt-1.5 text-data text-ink-muted">
          {strategy.tagline}
        </p>
      ) : null}
      <p className="mt-2 text-data text-ink-subtle">
        {strategy.description}
      </p>
      <dl className="mt-3 flex flex-col gap-2 border-t border-[#242424] pt-3 text-micro">
        <div className="flex gap-2">
          <dt className="ds-eyebrow shrink-0 text-ink-faint">
            Timeframe
          </dt>
          <dd className="text-ink-muted">{strategy.timeframe}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="ds-eyebrow shrink-0 text-ink-faint">
            Best for
          </dt>
          <dd className="text-ink-muted">{strategy.bestFor}</dd>
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

/**
 * AI strategy dropdown — desktop hover preview; phone bottom sheet picker
 * (Figma "Strategy Dropdown" 938:1192 → "Choose strategy" sheet 943:2495).
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

  const controlHeight = inline ? "h-8" : isNarrow ? "h-9" : "h-9";
  const controlRadius = inline ? "rounded-md" : "rounded-lg";
  const controlText = "text-control font-medium";
  const controlPadding = inline ? "pl-2.5 pr-6" : "pl-3 pr-7";
  const menuWidth = inline ? 220 : 200;

  const triggerStyle = inline
    ? disabled
      ? "cursor-default border-[#242424] bg-transparent text-white opacity-60"
      : "cursor-pointer border-[#f2b500] bg-transparent text-[#f2b500] hover:bg-[#f2b500]/5 focus-visible:border-[#f2b500]"
    : disabled
      ? "cursor-default border-[#242424] bg-[#050505] text-white opacity-60"
      : "cursor-pointer border-[#3e2e00] bg-[#3e2e00] text-[#f2b500] hover:border-[#f2b500]/50 focus-visible:border-[#f2b500]";

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

  /* X, scrim, drag and hardware back close outright — the sheet header has
     its own "← Back" for returning to the list. */
  const dismissMobileSheet = () => setSheetOpen(false);

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

  if (isNarrow) {
    const label = active.shortLabel ?? active.name;
    return (
      <div ref={rootRef} className="min-w-0 shrink">
        <button
          ref={triggerRef}
          type="button"
          disabled={disabled}
          aria-haspopup="dialog"
          aria-expanded={sheetOpen}
          aria-label={`Change strategy, currently ${label}`}
          onClick={handleToggleMenu}
          className={`app-pressable flex h-9 max-w-full items-center gap-1 rounded-[10px] border px-2.5 ${
            disabled
              ? "cursor-default border-app-line text-ink-faint opacity-60"
              : "border-app-accent text-app-accent active:bg-app-accent/10"
          }`}
        >
          <span className="truncate text-app-caption font-medium leading-[15px]">
            {label}
          </span>
          <AppIcon
            src={appIcons.chevronDown14}
            size={14}
            className={`transition-transform duration-200 ${sheetOpen ? "rotate-180" : ""}`}
          />
        </button>
        <CopilotStrategySheet
          open={sheetOpen}
          mode={sheetMode}
          strategies={strategies}
          highlightId={resolvedHighlightId}
          selectedId={selectedId ?? active.id}
          returnToPicker={sheetReturnToPicker}
          onViewDetails={handleMobileViewDetails}
          onBackToPicker={handleBackToPicker}
          onClose={dismissMobileSheet}
          onConfirm={handleMobileConfirm}
        />
      </div>
    );
  }

  const triggerWidthClass = inline
    ? "w-fit max-w-[9.5rem] shrink-0 sm:max-w-[11rem]"
    : "w-fit max-w-[10.5rem] shrink-0 sm:max-w-[12rem]";

  return (
    <div
      ref={rootRef}
      className={
        inline ? "shrink-0" : "flex min-w-0 w-full flex-col gap-1.5"
      }
    >
      <div
        className={
          inline ? "contents" : "flex min-w-0 items-center gap-2 sm:gap-2.5"
        }
      >
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
          className={`relative inline-flex max-w-full items-center border text-left outline-none transition-colors ${controlHeight} ${controlRadius} ${controlText} ${controlPadding} ${triggerWidthClass} ${
            inline ? "" : "shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
          } ${triggerStyle}`}
        >
          <span className="truncate">{active.shortLabel ?? active.name}</span>
          <ChevronDown
            className={`pointer-events-none absolute top-1/2 -translate-y-1/2 transition-transform ${
              inline ? "right-1.5 size-3" : "right-2 size-3.5"
            } ${
              disabled ? "text-ink-faint opacity-50" : "text-[#f2b500]"
            } ${menuOpen || sheetOpen ? "rotate-180" : ""}`}
            strokeWidth={2}
            aria-hidden
          />
        </button>

        {!disabled && !inline ? (
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
                    className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-data transition-colors ${
                      selected
                        ? "bg-[#171200] text-[#f2b500]"
                        : "text-ink-muted hover:bg-white/[0.03] hover:text-ink"
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
