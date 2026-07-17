import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ExternalLink,
  Globe,
  LifeBuoy,
  Lock,
  ScrollText,
  Sparkles,
  Trash2,
  TriangleAlert,
  Wallet,
  X,
} from "lucide-react";
import { DOC_LINKS } from "../../lib/docs.js";
import { NARROW_VIEWPORT_MEDIA } from "../../styles/breakpoints.js";

/**
 * The mobile "More" sheet.
 *
 * Phone-only: the only thing that can open it is the More button in
 * `CopilotBottomNav`, and that nav is `tablet:hidden`. The desktop equivalent of
 * these links is the header's More dropdown, so there is no `tablet:` branch.
 *
 * It portals to `document.body` rather than rendering in place. The bottom nav
 * is `z-50`, which makes it a stacking context — a sheet nested inside it can
 * never rise above the `z-[60]` "Install app" button that already portals to
 * the body, no matter what z-index it asks for.
 */

/** Icons are presentation, so they stay here rather than in the link data. */
const DOC_ICONS = {
  "privacy-policy": Lock,
  "terms-of-service": ScrollText,
  "risk-disclosure": TriangleAlert,
  "account-deletion": Trash2,
  "restricted-regions": Globe,
};

const SHEET_TRANSITION = { type: "spring", damping: 32, stiffness: 360, mass: 0.9 };

const ROW_CLASS =
  "flex w-full items-center gap-3.5 px-4 py-3.5 text-left transition-colors hover:bg-white/[0.04] active:bg-white/[0.07] focus-visible:bg-white/[0.06] focus-visible:outline-none";
const ROW_ICON_CLASS = "size-[18px] shrink-0 text-[#bfbfbf]";
const ROW_LABEL_CLASS = "min-w-0 flex-1 truncate text-sm font-medium text-white";
const SECTION_LABEL_CLASS =
  "px-4 pb-1.5 pt-4 text-[10px] font-semibold uppercase tracking-[0.09em] text-[#757575]";

export default function MoreSheet({
  open,
  onClose,
  onOpenSupport,
  onCopilotTutorial,
  onVaultTutorial,
}) {
  const reduceMotion = useReducedMotion();

  const tutorials = [
    { id: "copilot", label: "AI Copilot tutorial", icon: Sparkles, run: onCopilotTutorial },
    { id: "vault", label: "Vault tutorial", icon: Wallet, run: onVaultTutorial },
  ].filter((t) => typeof t.run === "function");

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Portaling costs us the nav's `tablet:hidden`, so a phone-width sheet left
  // open across a resize would otherwise strand itself on the desktop layout.
  useEffect(() => {
    if (!open) return undefined;
    const mq = window.matchMedia(NARROW_VIEWPORT_MEDIA);
    const sync = () => {
      if (!mq.matches) onClose?.();
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [open, onClose]);

  if (typeof document === "undefined") return null;

  /** Rows fade up in sequence so the list reads top-down; transform/opacity only. */
  const rowMotion = (index) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 6 },
          animate: { opacity: 1, y: 0 },
          transition: { delay: 0.06 + index * 0.022, duration: 0.2, ease: "easeOut" },
        };

  let rowIndex = 0;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          key="more-sheet-backdrop"
          className="fixed inset-0 z-[70] flex items-end justify-center bg-[#030504]/82 backdrop-blur-[3px]"
          role="presentation"
          initial={{ opacity: reduceMotion ? 1 : 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.22, ease: "easeOut" }}
          onClick={onClose}
        >
          <motion.div
            key="more-sheet"
            className="flex max-h-[min(88dvh,36rem)] w-full max-w-md flex-col overflow-hidden rounded-t-2xl border-t border-[#242424] bg-[#0f0f0f] shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="more-sheet-title"
            initial={{ y: reduceMotion ? 0 : "100%" }}
            animate={{ y: 0 }}
            exit={{ y: reduceMotion ? 0 : "100%" }}
            transition={reduceMotion ? { duration: 0 } : SHEET_TRANSITION}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-white/25"
              aria-hidden
            />

            <header className="flex shrink-0 items-center justify-between px-4 pb-3 pt-3">
              <h2
                id="more-sheet-title"
                className="text-[15px] font-semibold leading-none text-white"
              >
                More
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="-mr-1.5 flex size-8 items-center justify-center rounded-md text-[#8c8c8c] transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#3e2e00]"
              >
                <X className="size-4" aria-hidden />
              </button>
            </header>

            <div className="minimal-scrollbar flex-1 overflow-y-auto overscroll-y-contain pb-[max(1rem,env(safe-area-inset-bottom))]">
              {tutorials.length ? (
                <section aria-labelledby="more-sheet-tutorials">
                  <h3 id="more-sheet-tutorials" className={SECTION_LABEL_CLASS}>
                    Tutorials
                  </h3>
                  <div className="divide-y divide-[#1c1c1c] border-y border-[#1c1c1c]">
                    {tutorials.map(({ id, label, icon: Icon, run }) => (
                      <motion.button
                        key={id}
                        type="button"
                        className={ROW_CLASS}
                        onClick={() => {
                          onClose?.();
                          run();
                        }}
                        {...rowMotion(rowIndex++)}
                      >
                        <Icon className={ROW_ICON_CLASS} aria-hidden />
                        <span className={ROW_LABEL_CLASS}>{label}</span>
                      </motion.button>
                    ))}
                  </div>
                </section>
              ) : null}

              <section aria-labelledby="more-sheet-legal">
                <h3 id="more-sheet-legal" className={SECTION_LABEL_CLASS}>
                  Legal &amp; Support
                </h3>
                <div className="divide-y divide-[#1c1c1c] border-y border-[#1c1c1c]">
                  {typeof onOpenSupport === "function" ? (
                    <motion.button
                      type="button"
                      className={ROW_CLASS}
                      onClick={() => {
                        onClose?.();
                        onOpenSupport();
                      }}
                      {...rowMotion(rowIndex++)}
                    >
                      <LifeBuoy className={ROW_ICON_CLASS} aria-hidden />
                      <span className={ROW_LABEL_CLASS}>Help &amp; Support</span>
                    </motion.button>
                  ) : null}
                  {DOC_LINKS.map(({ id, label, href }) => {
                    const Icon = DOC_ICONS[id];
                    return (
                      <motion.a
                        key={id}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={ROW_CLASS}
                        onClick={onClose}
                        {...rowMotion(rowIndex++)}
                      >
                        {Icon ? <Icon className={ROW_ICON_CLASS} aria-hidden /> : null}
                        <span className={ROW_LABEL_CLASS}>{label}</span>
                        <ExternalLink
                          className="size-3.5 shrink-0 text-[#757575]"
                          strokeWidth={2}
                          aria-hidden
                        />
                      </motion.a>
                    );
                  })}
                </div>
              </section>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
