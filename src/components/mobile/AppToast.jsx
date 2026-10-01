import { useCallback, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import AppIcon from "./AppIcon.jsx";
import { appIcons } from "./mobileAssets.js";
import { ToastContext } from "./appToastContext.js";

const AUTO_DISMISS_MS = 4000;

/**
 * Figma "Toast / Success" (1064:5584): sits 12px above the tab bar and
 * auto-dismisses after 4s. One toast at a time — a new one replaces the old,
 * which is how a native snackbar behaves.
 *
 * `show({ title, message, tone, action: { label, onPress } })`
 */
export function AppToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  const dismiss = useCallback(() => {
    window.clearTimeout(timerRef.current);
    setToast(null);
  }, []);

  const show = useCallback((next) => {
    window.clearTimeout(timerRef.current);
    const id = Date.now();
    setToast({ tone: "success", ...next, id });
    timerRef.current = window.setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, next.duration ?? AUTO_DISMISS_MS);
  }, []);

  const value = useMemo(() => ({ show, dismiss }), [show, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <AppToastViewport toast={toast} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function AppToastViewport({ toast, onDismiss }) {
  const reduceMotion = useReducedMotion();
  if (typeof document === "undefined") return null;
  const negative = toast?.tone === "error";
  return createPortal(
    <div
      className="pointer-events-none fixed inset-x-0 z-[95] flex justify-center px-4 tablet:hidden"
      style={{ bottom: `calc(var(--app-tab-bar-h) + 12px)` }}
      aria-live="polite"
    >
      <AnimatePresence>
        {toast ? (
          <motion.div
            key={toast.id}
            role="status"
            className="pointer-events-auto flex w-full max-w-[528px] items-center gap-2.5 rounded-xl border border-app-line bg-app-subtle px-3 py-2.5 shadow-[0_8px_12px_rgba(0,0,0,0.5)]"
            initial={{ opacity: 0, y: reduceMotion ? 0 : 16, scale: reduceMotion ? 1 : 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            drag={reduceMotion ? false : "x"}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.6}
            onDragEnd={(_, info) => {
              if (Math.abs(info.offset.x) > 80) onDismiss();
            }}
          >
            <span
              className={`flex size-6 shrink-0 items-center justify-center rounded-full ${
                negative ? "bg-app-negative-subtle text-app-negative" : "bg-app-positive-subtle text-app-positive"
              }`}
            >
              <AppIcon
                src={negative ? appIcons.circleXLine16 : appIcons.circleCheckLine16}
                size={16}
              />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <p className="text-app-callout font-medium text-ink">{toast.title}</p>
              {toast.message ? (
                <p className="text-app-caption text-ink-muted">{toast.message}</p>
              ) : null}
            </div>
            {toast.action ? (
              <button
                type="button"
                className="app-pressable shrink-0 text-app-callout font-medium text-app-accent"
                onClick={() => {
                  toast.action.onPress?.();
                  onDismiss();
                }}
              >
                {toast.action.label}
              </button>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>,
    document.body,
  );
}
