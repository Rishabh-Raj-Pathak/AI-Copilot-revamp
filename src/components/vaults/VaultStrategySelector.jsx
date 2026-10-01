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
import BottomSheet from "../mobile/BottomSheet.jsx";
import { appIcons } from "../mobile/mobileAssets.js";

const RISK_STYLES = {
  Low: "border-[rgba(0,188,125,0.25)] bg-[rgba(0,188,125,0.1)] text-[#00d492]",
  Medium:
    "border-[rgba(204,177,127,0.25)] bg-[rgba(204,177,127,0.08)] text-[#ccb17f]",
  High: "border-[rgba(255,137,4,0.25)] bg-[rgba(255,137,4,0.1)] text-[#ff8904]",
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

function StrategyRiskBadge({ risk, className = "py-0.5" }) {
  const riskClass = RISK_STYLES[risk] ?? RISK_STYLES.Medium;
  return (
    <span
      className={`shrink-0 rounded-full border px-2 text-[9px] font-semibold uppercase tracking-[0.4px] ${riskClass} ${className}`}
    >
      {risk} risk
    </span>
  );
}

function StrategyDetailBody({ strategy }) {
  if (!strategy) return null;

  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold leading-5 text-[#e8d5b5]">
          {strategy.name}
        </p>
        <StrategyRiskBadge risk={strategy.risk} />
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
    // Closed: render bails on `!open`; the next open re-measures before paint.
    if (!open || !anchorEl) return undefined;

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
      className="vaults-root fixed rounded-xl border border-[rgba(120,90,40,0.28)] bg-[#0c0a08] p-4 shadow-[0_8px_32px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.04)]"
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
 * Phone strategy picker / details, on the app kit's BottomSheet (drag, scrim,
 * hardware back). "← Back" returns from a strategy's details to the list it
 * was opened from; close always dismisses the sheet.
 */
function VaultStrategyMobileSheet({
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
  const highlighted =
    strategies.find((s) => s.id === highlightId) ?? strategies[0];
  const isPicker = mode === "picker";

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={isPicker ? "Choose strategy" : "Strategy details"}
      onBack={!isPicker && returnToPicker ? onBackToPicker : undefined}
      className="vaults-root"
    >
      <div className="px-4 pt-4">
        {isPicker ? (
          <>
            <p className="mb-3 text-app-caption text-[#717182]">
              Tap a strategy to select it, or open Details to read more first.
            </p>
            <ul className="flex flex-col gap-3" role="listbox" aria-label="Vault strategies">
              {strategies.map((strategy) => {
                const selected = strategy.id === selectedId;
                return (
                  <li key={strategy.id}>
                    <div
                      className={`overflow-hidden rounded-[14px] border transition-colors ${
                        selected
                          ? "border-[#785a28] bg-[rgba(204,177,127,0.08)]"
                          : "border-[rgba(255,255,255,0.06)] bg-[#0c0a08]"
                      }`}
                    >
                      <button
                        type="button"
                        role="option"
                        aria-selected={selected}
                        onClick={() => onConfirm(strategy.id)}
                        className="w-full px-4 pb-3 pt-4 text-left transition-colors active:bg-[rgba(255,255,255,0.03)]"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="flex min-w-0 items-center gap-2 text-app-body font-semibold text-[#e8d5b5]">
                            {selected ? (
                              <AppIcon src={appIcons.check12} size={12} className="text-[#ccb17f]" />
                            ) : null}
                            <span className="truncate">{strategy.name}</span>
                          </p>
                          <StrategyRiskBadge risk={strategy.risk} />
                        </div>
                        <p className="mt-2 line-clamp-2 text-app-caption text-[#717182]">
                          {strategy.description}
                        </p>
                      </button>
                      <div className="flex justify-end border-t border-[rgba(255,255,255,0.05)] px-2 py-0.5">
                        <button
                          type="button"
                          onClick={() => onViewDetails(strategy.id)}
                          className="flex min-h-10 items-center px-2 text-[10px] font-medium uppercase tracking-[0.35px] text-[#ccb17f] active:opacity-70"
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
          <div className="rounded-[14px] border border-[rgba(255,255,255,0.06)] bg-[#0c0a08] p-4">
            <StrategyDetailBody strategy={highlighted} />
          </div>
        )}
      </div>
    </BottomSheet>
  );
}

/**
 * Custom strategy dropdown — desktop hover preview; mobile bottom sheet picker.
 */
export default function VaultStrategySelector({
  strategies,
  selectedId,
  disabled,
  onSelect,
  inline = false,
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

  const controlHeight = isNarrow ? "h-[39px]" : inline ? "h-[37px]" : "h-8";
  const controlRadius = isNarrow || inline ? "rounded-[10px]" : "rounded-lg";
  const menuWidth = inline ? 168 : 200;

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
    // Closed: render bails on `!menuOpen`; the next open re-measures before paint.
    if (!menuOpen || isNarrow) return undefined;
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

  return (
    <div
      ref={rootRef}
      className={`flex min-w-0 flex-col gap-1.5 ${inline ? "shrink-0 tablet:w-[130px]" : "w-full"}`}
    >
      {isNarrow ? (
        <span className="text-[10px] font-semibold uppercase leading-[13px] tracking-[0.35px] text-[#717182]">
          Strategy
        </span>
      ) : null}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-haspopup={isNarrow ? "dialog" : "listbox"}
        aria-expanded={isNarrow ? sheetOpen : menuOpen}
        aria-controls={isNarrow ? undefined : listId}
        aria-label={
          isNarrow ? `Change strategy, currently ${active.name}` : undefined
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
        className={`relative flex w-full min-w-0 items-center border bg-[#0c0a08] pl-3 pr-8 text-left text-xs font-medium text-[#e8d5b5] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] outline-none transition-colors ${controlHeight} ${controlRadius} ${
          disabled
            ? "cursor-default border-[rgba(255,255,255,0.06)] opacity-60"
            : "cursor-pointer border-[rgba(120,90,40,0.22)] hover:border-[#785a28] focus-visible:border-[#ccb17f]"
        }`}
      >
        <span className="truncate">{active.name}</span>
        {isNarrow ? (
          <AppIcon
            src={appIcons.chevronDown14}
            size={14}
            className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#717182] transition-transform ${
              sheetOpen ? "rotate-180" : ""
            } ${disabled ? "opacity-50" : ""}`}
          />
        ) : (
          <ChevronDown
            className={`pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[#717182] transition-transform ${
              menuOpen || sheetOpen ? "rotate-180" : ""
            } ${disabled ? "opacity-50" : ""}`}
            strokeWidth={2}
            aria-hidden
          />
        )}
      </button>

      {!disabled && isNarrow && selectedId ? (
        <div className="flex flex-col gap-1.5 rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#0c0a08] px-3 py-[11px]">
          <div className="flex items-center justify-between gap-2">
            <StrategyRiskBadge risk={active.risk} className="py-[3px] leading-[11px]" />
            <button
              type="button"
              onClick={() => openMobileSheet("details")}
              className="relative shrink-0 text-[11px] font-medium uppercase leading-[14px] tracking-[0.3px] text-[#ccb17f] after:absolute after:-inset-3 active:opacity-70"
            >
              Details
            </button>
          </div>
          <p className="line-clamp-2 max-w-[200px] text-[11px] leading-[15.95px] text-[#717182]">
            {active.description}
          </p>
        </div>
      ) : null}

      {isNarrow ? (
        <VaultStrategyMobileSheet
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
              aria-label="Select vault strategy"
              className="vaults-root fixed overflow-hidden rounded-[10px] border border-[rgba(120,90,40,0.28)] bg-[#0c0a08] py-1 shadow-[0_12px_40px_rgba(0,0,0,0.55)]"
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
                        ? "bg-[rgba(204,177,127,0.1)] text-[#e8d5b5]"
                        : "text-[#a1a1aa] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#e8d5b5]"
                    }`}
                  >
                    <span className="truncate">{strategy.name}</span>
                    {selected ? (
                      <Check
                        className="size-3.5 shrink-0 text-[#ccb17f]"
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
