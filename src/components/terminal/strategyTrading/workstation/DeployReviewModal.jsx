import { Button } from "../../../ui/button.jsx";
import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../ui/dialog.jsx";
import { Select } from "../../../ui/select.jsx";

const EXEC_MODES = [
  { id: "notify", label: "Notify only" },
  { id: "manual", label: "Manual approval" },
  { id: "paper", label: "Paper trading only" },
];

export default function DeployReviewModal({
  open,
  onOpenChange,
  strategy,
  preferences,
  onConfirm,
}) {
  if (!strategy) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      className="w-[min(32rem,calc(100%-1.5rem))]"
    >
      <DialogHeader>
        <DialogTitle>Review before deployment</DialogTitle>
        <p className="mt-1 text-xs text-[#929292]">
          Confirm risk settings and execution mode. Auto-execute is disabled.
        </p>
      </DialogHeader>
      <DialogBody className="space-y-3 text-xs">
        <Row label="Strategy" value={strategy.name} />
        <Row label="Market" value={strategy.market} />
        <Row label="Timeframe" value={strategy.timeframe} />
        <Row label="Model" value={strategy.model} />
        <Row label="Type" value={strategy.strategy} />
        <Row label="Risk profile" value={preferences.riskPreference} />
        <Row label="Max leverage" value={preferences.maxLeverage} />
        <Row
          label="Backtest"
          value={
            strategy.backtest?.status === "complete"
              ? strategy.backtest.results?.totalReturn
              : "Not run"
          }
        />
        <Row
          label="Paper trading"
          value={
            strategy.paperTrading?.status === "active" ? "Active" : "Not started"
          }
        />
        <label className="flex flex-col gap-1">
          <span className="text-[#929292]">Execution mode</span>
          <Select defaultValue="manual" disabled>
            {EXEC_MODES.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </Select>
        </label>
        <p className="rounded-md border border-[#3e2e00]/40 bg-[#171200]/40 px-3 py-2 text-[#f2b500]">
          Deployment integration is not enabled yet. You can continue using paper
          trading or manual approval mode.
        </p>
      </DialogBody>
      <DialogFooter>
        <Button variant="ghost" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button variant="default" onClick={onConfirm} disabled>
          Confirm deployment
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-[#757575]">{label}</span>
      <span className="font-medium text-white">{value}</span>
    </div>
  );
}
