import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "../../../ui/button.jsx";
import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../ui/dialog.jsx";
import { useCopilotTheme } from "../StrategyCopilotContext.jsx";
import { StatusBadge } from "./statusBadge.jsx";

function deployMarketLabel(strategy) {
  const market = (strategy.market ?? "").trim();
  const tf = (strategy.timeframe ?? "").trim();
  if (!tf || !market.includes(tf)) return market;
  return (
    market
      .replace(new RegExp(`\\s*·?\\s*${tf.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`), "")
      .trim() || market
  );
}

const CHECKLIST = [
  "I understand this is AI-generated analysis",
  "I reviewed the strategy rules",
  "I reviewed risk and drawdown",
  "I understand manual approval is required",
  "I understand there is no guaranteed profit",
];

export default function DeployReviewModal({
  open,
  onOpenChange,
  strategy,
  preferences,
  onConfirmReview,
  onKeepPaper,
}) {
  const theme = useCopilotTheme();
  const isCopilotV2 = theme.isV2 && !theme.isV3;

  if (!strategy) return null;

  if (isCopilotV2) {
    return (
      <DeployReviewModalV2
        open={open}
        onOpenChange={onOpenChange}
        strategy={strategy}
        preferences={preferences}
        theme={theme}
        onConfirmReview={onConfirmReview}
      />
    );
  }

  return (
    <DeployReviewModalLegacy
      open={open}
      onOpenChange={onOpenChange}
      strategy={strategy}
      preferences={preferences}
      theme={theme}
      onConfirmReview={onConfirmReview}
      onKeepPaper={onKeepPaper}
    />
  );
}

function DeployReviewModalV2({
  open,
  onOpenChange,
  strategy,
  preferences,
  theme,
  onConfirmReview,
}) {
  const bt = strategy.backtest?.results;
  const hasBacktest = strategy.backtest?.status === "complete" && bt;
  const paperActive = strategy.paperTrading?.status === "active";
  const marketLabel = deployMarketLabel(strategy);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onOpenChange]);

  if (!open || typeof document === "undefined") return null;

  const handleConfirm = () => {
    onConfirmReview?.();
    onOpenChange(false);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 border-0 bg-[#030504]/82 backdrop-blur-[3px]"
        onClick={() => onOpenChange(false)}
        aria-label="Close dialog"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="deploy-review-v2-title"
        className="relative z-1 flex max-h-[min(90vh,44rem)] w-full max-w-[30rem] flex-col overflow-hidden rounded-xl border border-white/6 bg-[#0D100F] shadow-[0_24px_80px_rgba(0,0,0,0.65),0_0_0_1px_rgba(255,255,255,0.04)_inset]"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="shrink-0 border-b border-white/6 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h2
                id="deploy-review-v2-title"
                className="text-[17px] font-semibold tracking-tight text-[rgba(255,255,255,0.92)]"
              >
                Deploy strategy
              </h2>
              <p className={`mt-1.5 text-xs leading-relaxed ${theme.textSecondary}`}>
                Review your setup before going live. Manual approval stays required
                for each trade.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="shrink-0 rounded-md p-1.5 text-[rgba(255,255,255,0.42)] transition-colors hover:bg-white/[0.06] hover:text-[rgba(255,255,255,0.88)]"
              aria-label="Close"
            >
              <X className="size-4" strokeWidth={1.75} aria-hidden />
            </button>
          </div>
        </header>

        <div className="minimal-scrollbar flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <div className="rounded-xl border border-white/6 bg-[#101312] px-5 py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h3 className="text-[15px] font-semibold leading-snug text-[rgba(255,255,255,0.92)]">
                  {strategy.name}
                </h3>
              </div>
              <StatusBadge status={strategy.status} className="shrink-0 pt-0.5" />
            </div>
          </div>

          {hasBacktest ? (
            <div className="grid grid-cols-3 divide-x divide-white/6 overflow-hidden rounded-xl border border-white/6 bg-[#141716]">
              <KpiCell
                label="Return"
                value={bt.totalReturn}
                tone="positive"
                theme={theme}
              />
              <KpiCell
                label="Drawdown"
                value={bt.maxDrawdown}
                tone="negative"
                theme={theme}
              />
              <KpiCell label="Sharpe" value={bt.sharpeRatio} theme={theme} />
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-white/10 bg-[#101312]/80 px-5 py-4 text-center">
              <p className="text-xs font-medium text-[rgba(255,255,255,0.58)]">
                No backtest run yet
              </p>
              <p className={`mt-1.5 text-[11px] leading-relaxed ${theme.textMuted}`}>
                Deploy without estimates, or run a backtest from the workspace first.
              </p>
            </div>
          )}

          <div className="overflow-hidden rounded-xl border border-white/6 bg-[#101312]">
            <DetailSection title="Strategy configuration" theme={theme}>
              <DetailRow label="Market" value={marketLabel || strategy.market} theme={theme} />
              <DetailRow label="Timeframe" value={strategy.timeframe} theme={theme} />
              <DetailRow label="Strategy type" value={strategy.strategy} theme={theme} />
              <DetailRow label="Model" value={strategy.model} theme={theme} />
            </DetailSection>
            <div className="border-t border-white/6" aria-hidden />
            <DetailSection title="Risk & execution" theme={theme}>
              <DetailRow
                label="Risk profile"
                value={preferences.riskPreference}
                theme={theme}
              />
              <DetailRow
                label="Max leverage"
                value={preferences.maxLeverage}
                theme={theme}
              />
              <DetailRow label="Execution" value="Manual approval" theme={theme} />
              <DetailRow
                label="Paper trading"
                value={paperActive ? "Active" : "Not started"}
                theme={theme}
                highlight={paperActive}
              />
            </DetailSection>
          </div>
        </div>

        <footer className="shrink-0 border-t border-white/6 px-6 py-4">
          <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              className={`${theme.secondaryActionBtn} w-full sm:min-w-[6.5rem] sm:w-auto`}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className={`${theme.gradientCta} w-full gap-1.5 text-xs font-medium sm:min-w-[10.5rem] sm:w-auto`}
              onClick={handleConfirm}
            >
              Confirm deployment
            </button>
          </div>
        </footer>
      </div>
    </div>,
    document.body,
  );
}

function KpiCell({ label, value, tone, theme }) {
  const valueClass =
    tone === "positive"
      ? theme.textPositive
      : tone === "negative"
        ? theme.textNegative
        : theme.textPrimary;
  return (
    <div className="min-w-0 px-4 py-4 text-center">
      <p className={theme.metricLabel}>{label}</p>
      <p className={`mt-1.5 text-sm font-bold tabular-nums ${valueClass}`}>
        {value}
      </p>
    </div>
  );
}

function DetailSection({ title, children, theme }) {
  return (
    <div className="px-5 py-4">
      <p
        className={`mb-3 text-[10px] font-medium uppercase tracking-wide ${theme.textMuted}`}
      >
        {title}
      </p>
      <dl className="grid grid-cols-[7.25rem_minmax(0,1fr)] items-baseline gap-x-5 gap-y-3">
        {children}
      </dl>
    </div>
  );
}

function DetailRow({ label, value, theme, highlight }) {
  return (
    <>
      <dt className={`text-xs leading-snug ${theme.textMuted}`}>{label}</dt>
      <dd
        className={`text-right text-xs font-medium leading-snug tabular-nums ${
          highlight ? theme.textPositive : theme.textPrimary
        }`}
      >
        {value}
      </dd>
    </>
  );
}

function DeployReviewModalLegacy({
  open,
  onOpenChange,
  strategy,
  preferences,
  theme,
  onConfirmReview,
  onKeepPaper,
}) {
  const [checked, setChecked] = useState(() => CHECKLIST.map(() => false));

  const allChecked = checked.every(Boolean);
  const bt = strategy.backtest?.results;

  const toggle = (i) => {
    setChecked((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
  };

  const handleClose = (openState) => {
    if (!openState) setChecked(CHECKLIST.map(() => false));
    onOpenChange(openState);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={handleClose}
      className="w-[min(34rem,calc(100%-1.5rem))]"
    >
      <DialogHeader>
        <DialogTitle>Review Strategy Deployment</DialogTitle>
        <p
          className={`mt-1 text-xs leading-relaxed ${theme.isV2 ? theme.textSecondary : "text-[#929292]"}`}
        >
          AI-generated setups are for analysis and decision support only. Review risk
          before taking any trade. Auto-execution is disabled.
        </p>
      </DialogHeader>
      <DialogBody className="space-y-3 text-xs">
        <LegacySection title="Strategy summary" theme={theme}>
          <LegacyRow label="Name" value={strategy.name} theme={theme} />
          <LegacyRow label="Market" value={strategy.market} theme={theme} />
          <LegacyRow label="Timeframe" value={strategy.timeframe} theme={theme} />
          <LegacyRow label="Type" value={strategy.strategy} theme={theme} />
          <LegacyRow label="Model" value={strategy.model} theme={theme} />
        </LegacySection>

        <LegacySection title="Risk settings" theme={theme}>
          <LegacyRow label="Risk profile" value={preferences.riskPreference} theme={theme} />
          <LegacyRow label="Max leverage" value={preferences.maxLeverage} theme={theme} />
          <LegacyRow label="Execution" value="Manual approval" theme={theme} />
        </LegacySection>

        <LegacySection title="Backtest estimate" theme={theme}>
          <LegacyRow
            label="Total return"
            value={bt?.totalReturn ?? "Not run"}
            highlight={bt?.totalReturn?.startsWith("+")}
            theme={theme}
          />
          <LegacyRow label="Max drawdown" value={bt?.maxDrawdown ?? "—"} theme={theme} />
          <LegacyRow label="Sharpe" value={bt?.sharpeRatio ?? "—"} theme={theme} />
        </LegacySection>

        <LegacySection title="Paper trading" theme={theme}>
          <LegacyRow
            label="Status"
            value={
              strategy.paperTrading?.status === "active" ? "Active" : "Not started"
            }
            theme={theme}
          />
        </LegacySection>

        <div
          className={
            theme.isV2
              ? "space-y-2 rounded-xl border border-white/6 bg-[var(--ds-copilot-v2-elevated)] p-3"
              : "space-y-2 rounded-lg border border-[#242424] bg-[#0a0a0a] p-3"
          }
        >
          <p
            className={`font-medium ${theme.isV2 ? theme.textPrimary : "text-[#bfbfbf]"}`}
          >
            Required confirmations
          </p>
          {CHECKLIST.map((label, i) => (
            <label key={label} className="flex cursor-pointer items-start gap-2">
              <input
                type="checkbox"
                checked={checked[i]}
                onChange={() => toggle(i)}
                className={`mt-0.5 ${theme.isV2 ? "accent-[var(--ds-copilot-v2-mint)]" : "accent-[#f2b500]"}`}
              />
              <span className={theme.isV2 ? theme.textSecondary : "text-[#929292]"}>
                {label}
              </span>
            </label>
          ))}
        </div>
      </DialogBody>
      <DialogFooter className="flex-wrap gap-2">
        <Button variant="ghost" onClick={() => handleClose(false)}>
          Cancel
        </Button>
        {theme.isV2 ? (
          <button
            type="button"
            className={theme.secondaryActionBtn}
            onClick={onKeepPaper}
          >
            Keep Paper Trading
          </button>
        ) : (
          <Button variant="outline" onClick={onKeepPaper}>
            Keep Paper Trading
          </Button>
        )}
        {theme.isV2 ? (
          <button
            type="button"
            className={`${theme.gradientCta} disabled:cursor-not-allowed disabled:opacity-50`}
            disabled={!allChecked}
            onClick={() => {
              onConfirmReview?.();
              handleClose(false);
            }}
          >
            Confirm Manual Review
          </button>
        ) : (
          <Button
            variant="default"
            disabled={!allChecked}
            onClick={() => {
              onConfirmReview?.();
              handleClose(false);
            }}
          >
            Confirm Manual Review
          </Button>
        )}
      </DialogFooter>
    </Dialog>
  );
}

function LegacySection({ title, children, theme }) {
  return (
    <div>
      <p
        className={`mb-1.5 text-[10px] font-medium uppercase tracking-wide ${theme.isV2 ? theme.textMuted : "text-[#757575]"}`}
      >
        {title}
      </p>
      <div
        className={
          theme.isV2
            ? "space-y-1 rounded-xl border border-white/6 bg-[var(--ds-copilot-v2-surface)] p-2.5"
            : "space-y-1 rounded-lg border border-[#242424] bg-[#0f0f0f] p-2.5"
        }
      >
        {children}
      </div>
    </div>
  );
}

function LegacyRow({ label, value, highlight, theme }) {
  return (
    <div className="flex justify-between gap-4">
      <span className={theme.isV2 ? theme.textMuted : "text-[#757575]"}>{label}</span>
      <span
        className={`font-medium ${
          highlight
            ? theme.isV2
              ? theme.textPositive
              : "text-[#269755]"
            : theme.isV2
              ? theme.textPrimary
              : "text-white"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
