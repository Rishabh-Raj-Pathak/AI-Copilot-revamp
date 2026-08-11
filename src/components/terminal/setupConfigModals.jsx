/**
 * AI Copilot setup panel — margin mode and leverage editors.
 *
 * Perp DEXes (Hyperliquid, Variational, Lighter, Vooi) keep both of these out
 * of the order form: the panel shows a compact chip with the current value and
 * the actual editor opens as a modal. Two reasons that pattern holds — these
 * are account-level settings changed once a session, not per-trade inputs, so
 * they shouldn't spend vertical space above the CTA; and leverage is the single
 * riskiest control in the panel, so it deserves a deliberate open → adjust →
 * confirm gesture rather than a slider you can nudge by accident while
 * scrolling.
 *
 * Both editors hold a draft and only commit on Confirm — closing or dismissing
 * discards, matching the reference DEXes.
 */
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { terminalGradientCta } from "../../design-system/tokens/terminalConnectWallet";
import { Checkbox, CopilotSetupSlider } from "./detailsPanelParts.jsx";

/**
 * Shared shell — same portal + overlay idiom as `TradeSuccessModal`, so these
 * stack above the product-tour overlay like the rest of the copilot's modals.
 */
function SetupModalShell({ open, onClose, titleId, title, subtitle, children }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-1000000001 flex items-center justify-center px-4 py-8"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 border-0 bg-black/85"
        onClick={onClose}
        aria-label="Close"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-1 flex max-h-[min(90vh,40rem)] w-full max-w-[26rem] flex-col overflow-hidden rounded-xl border border-[#242424] bg-black shadow-[0_8px_40px_rgba(0,0,0,0.45)]"
      >
        <div className="flex shrink-0 items-start gap-3 px-5 pt-5">
          <div className="min-w-0 flex-1">
            <h2
              id={titleId}
              className="text-anchor text-ink"
            >
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-1.5 text-data text-ink-muted">
                {subtitle}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mt-1 -mr-1.5 shrink-0 rounded-md p-1.5 text-ink-faint transition-colors hover:bg-white/5 hover:text-ink"
          >
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="minimal-scrollbar flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 py-5">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}

const MARGIN_MODES = [
  {
    id: "cross",
    label: "Cross",
    description:
      "All cross positions share the same margin as collateral. In the event of liquidation, your cross margin balance and any remaining open positions under assets in this mode may be forfeited.",
  },
  {
    id: "isolated",
    label: "Isolated",
    description:
      "Manage risk on individual positions by restricting the margin allocated to each. If the margin ratio of an isolated position reaches 100%, that position is liquidated on its own.",
  },
];

/**
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {string} props.symbol
 * @param {"cross" | "isolated"} props.value
 * @param {(mode: "cross" | "isolated") => void} props.onConfirm
 */
export function MarginModeModal({ open, onClose, symbol, value, onConfirm }) {
  return (
    <SetupModalShell
      open={open}
      onClose={onClose}
      titleId="copilot-margin-mode-title"
      title={`${symbol}-USDC Margin Mode`}
    >
      {/* Body mounts with the shell, so the draft seeds itself on every open. */}
      <MarginModeBody value={value} onClose={onClose} onConfirm={onConfirm} />
    </SetupModalShell>
  );
}

function MarginModeBody({ value, onClose, onConfirm }) {
  const [draft, setDraft] = useState(value);

  return (
    <>
      <div className="flex flex-col gap-3">
        {MARGIN_MODES.map((mode) => {
          const selected = draft === mode.id;
          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => setDraft(mode.id)}
              aria-pressed={selected}
              className={`flex flex-col gap-2 rounded-lg border p-4 text-left transition-colors ${
                selected
                  ? "border-[#f2b500] bg-white/4"
                  : "border-[#242424] hover:bg-white/3"
              }`}
            >
              <span className="flex items-center gap-2">
                <Checkbox
                  checked={selected}
                  onChange={() => setDraft(mode.id)}
                  className="size-4 shrink-0"
                />
                <span className="text-control font-medium text-ink">
                  {mode.label}
                </span>
              </span>
              <span className="text-data text-ink-muted">
                {mode.description}
              </span>
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => {
          onConfirm?.(draft);
          onClose?.();
        }}
        className={`${terminalGradientCta.componentClassName} w-full px-6 py-3 text-control font-medium`}
      >
        Confirm
      </button>
    </>
  );
}

/**
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {string} props.symbol
 * @param {number} props.value
 * @param {number} props.max
 * @param {(leverage: number) => void} props.onConfirm
 */
export function LeverageModal({ open, onClose, symbol, value, max, onConfirm }) {
  return (
    <SetupModalShell
      open={open}
      onClose={onClose}
      titleId="copilot-leverage-title"
      title="Adjust Leverage"
      subtitle={`Control the leverage used for ${symbol} positions. The maximum leverage is ${max}x.`}
    >
      <LeverageBody
        value={value}
        max={max}
        onClose={onClose}
        onConfirm={onConfirm}
      />
    </SetupModalShell>
  );
}

function LeverageBody({ value, max, onClose, onConfirm }) {
  const [draft, setDraft] = useState(value);

  const clamp = (n) => Math.min(max, Math.max(1, n));

  return (
    <>
      <div className="flex items-center gap-3">
        <CopilotSetupSlider
          value={draft}
          min={1}
          max={max}
          ariaLabel="Leverage"
          onChange={setDraft}
        />
        <div className="flex w-20 shrink-0 items-center gap-1 rounded-md border border-[#242424] bg-black px-3 py-2 focus-within:border-[#3a3a3a]">
          <input
            type="text"
            inputMode="numeric"
            aria-label="Leverage value"
            value={draft}
            onChange={(e) => {
              const n = Number.parseInt(e.target.value.replace(/\D/g, ""), 10);
              setDraft(Number.isFinite(n) ? clamp(n) : 1);
            }}
            className="min-w-0 flex-1 bg-transparent text-control text-ink outline-none"
          />
          <span className="shrink-0 text-data text-ink-faint">x</span>
        </div>
      </div>
      <button
        type="button"
        onClick={() => {
          onConfirm?.(clamp(draft));
          onClose?.();
        }}
        className={`${terminalGradientCta.componentClassName} w-full px-6 py-3 text-control font-medium`}
      >
        Confirm
      </button>
      {/*
        Warning sits below the CTA, as it does on Hyperliquid and Lighter — it
        is a consequence of the choice above, not a gate on pressing Confirm.
      */}
      <p className="rounded-lg border border-[#5f1414] bg-[#5f1414]/20 px-4 py-3 text-data text-[#e08a8a]">
        Setting a higher leverage increases the risk of liquidation.
      </p>
    </>
  );
}
