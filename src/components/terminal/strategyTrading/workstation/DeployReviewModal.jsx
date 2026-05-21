import { useState } from "react";
import { Button } from "../../../ui/button.jsx";
import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../ui/dialog.jsx";

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
        <p className="mt-1 text-xs leading-relaxed text-[#929292]">
          AI-generated setups are for analysis and decision support only. Review risk
          before taking any trade. Auto-execution is disabled.
        </p>
      </DialogHeader>
      <DialogBody className="space-y-3 text-xs">
        <Section title="Strategy summary">
          <Row label="Name" value={strategy.name} />
          <Row label="Market" value={strategy.market} />
          <Row label="Timeframe" value={strategy.timeframe} />
          <Row label="Type" value={strategy.strategy} />
          <Row label="Model" value={strategy.model} />
        </Section>

        <Section title="Risk settings">
          <Row label="Risk profile" value={preferences.riskPreference} />
          <Row label="Max leverage" value={preferences.maxLeverage} />
          <Row label="Execution" value="Manual approval" />
        </Section>

        <Section title="Backtest estimate">
          <Row
            label="Total return"
            value={bt?.totalReturn ?? "Not run"}
            highlight={bt?.totalReturn?.startsWith("+")}
          />
          <Row label="Max drawdown" value={bt?.maxDrawdown ?? "—"} />
          <Row label="Sharpe" value={bt?.sharpeRatio ?? "—"} />
        </Section>

        <Section title="Paper trading">
          <Row
            label="Status"
            value={
              strategy.paperTrading?.status === "active" ? "Active" : "Not started"
            }
          />
        </Section>

        <div className="space-y-2 rounded-lg border border-[#242424] bg-[#0a0a0a] p-3">
          <p className="font-medium text-[#bfbfbf]">Required confirmations</p>
          {CHECKLIST.map((label, i) => (
            <label key={label} className="flex cursor-pointer items-start gap-2">
              <input
                type="checkbox"
                checked={checked[i]}
                onChange={() => toggle(i)}
                className="mt-0.5 accent-[#f2b500]"
              />
              <span className="text-[#929292]">{label}</span>
            </label>
          ))}
        </div>
      </DialogBody>
      <DialogFooter className="flex-wrap gap-2">
        <Button variant="ghost" onClick={() => handleClose(false)}>
          Cancel
        </Button>
        <Button variant="outline" onClick={onKeepPaper}>
          Keep Paper Trading
        </Button>
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
      </DialogFooter>
    </Dialog>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-[#757575]">
        {title}
      </p>
      <div className="space-y-1 rounded-lg border border-[#242424] bg-[#121212] p-2.5">
        {children}
      </div>
    </div>
  );
}

function Row({ label, value, highlight }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-[#757575]">{label}</span>
      <span
        className={`font-medium ${highlight ? "text-[#00f3b6]" : "text-white"}`}
      >
        {value}
      </span>
    </div>
  );
}
