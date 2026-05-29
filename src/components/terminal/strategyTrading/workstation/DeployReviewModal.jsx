import { useState } from "react";
import { Button } from "../../../ui/button.jsx";
import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../ui/dialog.jsx";
import { useCopilotTheme } from "../StrategyCopilotContext.jsx";

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
  const [checked, setChecked] = useState(() => CHECKLIST.map(() => false));

  if (!strategy) return null;

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
        <Section title="Strategy summary" theme={theme}>
          <Row label="Name" value={strategy.name} theme={theme} />
          <Row label="Market" value={strategy.market} theme={theme} />
          <Row label="Timeframe" value={strategy.timeframe} theme={theme} />
          <Row label="Type" value={strategy.strategy} theme={theme} />
          <Row label="Model" value={strategy.model} theme={theme} />
        </Section>

        <Section title="Risk settings" theme={theme}>
          <Row label="Risk profile" value={preferences.riskPreference} theme={theme} />
          <Row label="Max leverage" value={preferences.maxLeverage} theme={theme} />
          <Row label="Execution" value="Manual approval" theme={theme} />
        </Section>

        <Section title="Backtest estimate" theme={theme}>
          <Row
            label="Total return"
            value={bt?.totalReturn ?? "Not run"}
            highlight={bt?.totalReturn?.startsWith("+")}
            theme={theme}
          />
          <Row label="Max drawdown" value={bt?.maxDrawdown ?? "—"} theme={theme} />
          <Row label="Sharpe" value={bt?.sharpeRatio ?? "—"} theme={theme} />
        </Section>

        <Section title="Paper trading" theme={theme}>
          <Row
            label="Status"
            value={
              strategy.paperTrading?.status === "active" ? "Active" : "Not started"
            }
            theme={theme}
          />
        </Section>

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

function Section({ title, children, theme }) {
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
            : "space-y-1 rounded-lg border border-[#242424] bg-[#121212] p-2.5"
        }
      >
        {children}
      </div>
    </div>
  );
}

function Row({ label, value, highlight, theme }) {
  return (
    <div className="flex justify-between gap-4">
      <span className={theme.isV2 ? theme.textMuted : "text-[#757575]"}>{label}</span>
      <span
        className={`font-medium ${
          highlight
            ? theme.isV2
              ? theme.textPositive
              : "text-[#00f3b6]"
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
