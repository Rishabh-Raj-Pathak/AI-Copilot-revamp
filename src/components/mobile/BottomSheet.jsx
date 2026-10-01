import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import {
  AnimatePresence,
  motion,
  useDragControls,
  useReducedMotion,
} from "framer-motion";
import AppIcon from "./AppIcon.jsx";
import { appIcons } from "./mobileAssets.js";
import { useHistoryBack } from "./appHistory.js";

/**
 * Figma "Sheet / Header" (993:5861): grab handle, centred title, optional
 * "← Back" leading action and a close button. 73px tall.
 *
 * `dragHandleProps` comes from `BottomSheet` — the header is the drag zone, so
 * a downward pull on it dismisses the sheet while the body keeps scrolling.
 */
export function SheetHeader({
  title,
  titleId,
  onBack,
  onClose,
  showClose = true,
  dragHandleProps,
  className = "",
}) {
  return (
    <div
      className={`flex shrink-0 touch-none select-none flex-col items-center gap-3 border-b border-app-line px-4 pb-3 pt-2 ${className}`}
      {...dragHandleProps}
    >
      <div className="h-1 w-10 shrink-0 rounded-full bg-app-line-strong" aria-hidden />
      <div className="flex w-full items-center">
        <div className="flex h-9 w-[46px] shrink-0 items-center">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="app-pressable -ml-1 whitespace-nowrap rounded-md px-1 py-1 text-app-body font-medium leading-5 text-app-accent"
            >
              ← Back
            </button>
          ) : null}
        </div>
        <h2
          id={titleId}
          className="min-w-0 flex-1 truncate text-center text-app-headline font-semibold text-ink"
        >
          {title}
        </h2>
        <div className="flex h-9 w-[46px] shrink-0 items-center justify-end">
          {showClose && onClose ? (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="app-pressable flex size-9 items-center justify-center rounded-xl text-ink active:bg-white/[0.06]"
            >
              <AppIcon src={appIcons.close20} size={20} />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

const SHEET_SPRING = { type: "spring", damping: 34, stiffness: 380, mass: 0.9 };
const DISMISS_OFFSET = 96;
const DISMISS_VELOCITY = 520;

/**
 * The phone bottom sheet every mobile overlay is built on.
 *
 * - Slides up on a spring over a 60% black, 2px-blur scrim (Figma "Scrim").
 * - Drag the header down to dismiss (distance or flick velocity).
 * - Scrim tap, Escape and hardware/gesture back all close it.
 * - Portals to `<body>` so no page stacking context can trap it.
 *
 * Content scrolls inside the sheet; `footer` stays pinned above the home
 * indicator. Pass `header` to replace the standard `SheetHeader` (the trade
 * ticket and backtest sheets carry their own) — it still receives drag props.
 */
export default function BottomSheet({
  open,
  onClose,
  title,
  onBack,
  showClose = true,
  header,
  footer,
  children,
  fullHeight = false,
  className = "",
  bodyClassName = "",
  ariaLabel,
}) {
  const reduceMotion = useReducedMotion();
  const dragControls = useDragControls();
  const titleId = useId();
  const panelRef = useRef(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useHistoryBack(open, () => onCloseRef.current?.());

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onCloseRef.current?.();
    };
    const previouslyFocused = document.activeElement;
    document.addEventListener("keydown", onKey);
    // Move focus into the sheet so screen readers and keyboards land on it.
    const t = window.setTimeout(() => panelRef.current?.focus({ preventScroll: true }), 0);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
      if (previouslyFocused instanceof HTMLElement) {
        previouslyFocused.focus({ preventScroll: true });
      }
    };
  }, [open]);

  if (typeof document === "undefined") return null;

  const dragHandleProps = {
    onPointerDown: (e) => {
      // Buttons inside the header (Back, Close) must stay tappable.
      if (e.target instanceof Element && e.target.closest("button, a, input")) return;
      dragControls.start(e);
    },
  };

  const headerNode =
    header === undefined ? (
      <SheetHeader
        title={title}
        titleId={titleId}
        onBack={onBack}
        onClose={onClose}
        showClose={showClose}
        dragHandleProps={dragHandleProps}
      />
    ) : typeof header === "function" ? (
      header({ dragHandleProps, titleId })
    ) : (
      header
    );

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div key="app-sheet" className="fixed inset-0 z-[90]" role="presentation">
          <motion.div
            className="app-scrim absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2, ease: "easeOut" }}
            onClick={() => onCloseRef.current?.()}
          />
          <motion.div
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby={ariaLabel ? undefined : titleId}
            aria-label={ariaLabel}
            className={`absolute inset-x-0 bottom-0 mx-auto flex w-full max-w-[560px] flex-col overflow-hidden rounded-t-app-sheet border border-b-0 border-app-line bg-app-surface outline-none ${
              fullHeight
                ? "h-[calc(100dvh-env(safe-area-inset-top)-2.5rem)]"
                : "max-h-[calc(100dvh-env(safe-area-inset-top)-2.5rem)]"
            } ${className}`}
            initial={{ y: reduceMotion ? 0 : "100%" }}
            animate={{ y: 0 }}
            exit={{ y: reduceMotion ? 0 : "100%" }}
            transition={reduceMotion ? { duration: 0 } : SHEET_SPRING}
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.7 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > DISMISS_OFFSET || info.velocity.y > DISMISS_VELOCITY) {
                onCloseRef.current?.();
              }
            }}
          >
            {headerNode}
            <div
              className={`min-h-0 flex-1 overflow-y-auto overscroll-contain ${
                footer ? "" : "pb-[var(--app-safe-bottom)]"
              } ${bodyClassName}`}
            >
              {children}
            </div>
            {footer ? (
              <div className="shrink-0 border-t border-app-line bg-app-surface px-4 pb-[var(--app-safe-bottom)] pt-3">
                {footer}
              </div>
            ) : null}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
