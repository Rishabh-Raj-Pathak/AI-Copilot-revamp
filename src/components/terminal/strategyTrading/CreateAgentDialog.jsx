import { useEffect, useState } from "react";
import { Button } from "../../ui/button.jsx";
import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog.jsx";
import { Input } from "../../ui/input.jsx";
import { Select } from "../../ui/select.jsx";
import { Textarea } from "../../ui/textarea.jsx";

const EXPIRY_OPTIONS = ["1 hour", "4 hours", "1 day", "Until manually stopped"];
const ACTION_MODES = [
  { id: "notify", label: "Notify only" },
  { id: "suggest", label: "Suggest trade" },
  { id: "manual", label: "Manual approval" },
];

export default function CreateAgentDialog({
  open,
  onOpenChange,
  setup,
  onCreate,
}) {
  const [name, setName] = useState("");
  const [condition, setCondition] = useState("");
  const [riskRule, setRiskRule] = useState("");
  const [expiry, setExpiry] = useState("4 hours");
  const [actionMode, setActionMode] = useState("notify");

  useEffect(() => {
    if (!open || !setup) return;
    setName(`${setup.market.split("-")[0]} ${setup.strategy} Watcher`);
    setCondition(
      `Watch ${setup.market} and notify when price enters the entry zone (${setup.entryZone}).`,
    );
    setRiskRule("Skip if volatility spikes or funding becomes unfavorable.");
    setExpiry("4 hours");
    setActionMode("notify");
  }, [open, setup]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate?.({
      name: name.trim(),
      condition: condition.trim(),
      riskRule: riskRule.trim(),
      expiry,
      actionMode,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="w-[min(28rem,calc(100%-1.5rem))]">
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <DialogTitle>Create on-demand watcher</DialogTitle>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[#929292]">Agent name</span>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[#929292]">Monitoring condition</span>
            <Textarea
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              rows={3}
              required
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[#929292]">Risk rules</span>
            <Textarea
              value={riskRule}
              onChange={(e) => setRiskRule(e.target.value)}
              rows={2}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[#929292]">Action mode</span>
            <Select
              value={actionMode}
              onChange={(e) => setActionMode(e.target.value)}
            >
              {ACTION_MODES.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </Select>
            <span className="text-[10px] text-[#757575]">
              Auto-execute is disabled in this prototype.
            </span>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[#929292]">Expiry</span>
            <Select value={expiry} onChange={(e) => setExpiry(e.target.value)}>
              {EXPIRY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </Select>
          </label>
        </DialogBody>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" variant="default">
            Create watcher
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
