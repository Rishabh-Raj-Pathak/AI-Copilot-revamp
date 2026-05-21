import { useEffect, useState } from "react";
import { Button } from "../../ui/button.jsx";
import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog.jsx";
import { Textarea } from "../../ui/textarea.jsx";
import { AGENT_RULE_CHIPS } from "./strategyTradingMockData.js";

export default function EditAgentPromptDialog({
  open,
  onOpenChange,
  agent,
  onSave,
}) {
  const [condition, setCondition] = useState("");
  const [rules, setRules] = useState([]);

  useEffect(() => {
    if (!agent) return;
    setCondition(agent.condition ?? "");
    setRules([...(agent.memoryRules ?? [])]);
  }, [agent, open]);

  const toggleRule = (rule) => {
    setRules((prev) =>
      prev.includes(rule) ? prev.filter((r) => r !== rule) : [...prev, rule],
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!agent) return;
    onSave?.(agent.id, {
      condition: condition.trim(),
      memoryRules: rules,
    });
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      className="w-[min(30rem,calc(100%-1.5rem))]"
    >
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <DialogTitle>Edit agent instructions</DialogTitle>
          <p className="mt-1 text-xs text-[#929292]">
            Update what this watcher monitors and which rules it follows.
          </p>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[#929292]">Agent instruction</span>
            <Textarea
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              rows={4}
              required
            />
          </label>
          <div>
            <span className="text-xs text-[#929292]">Quick rules</span>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {AGENT_RULE_CHIPS.map((chip) => {
                const on = rules.includes(chip);
                return (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => toggleRule(chip)}
                    className={`rounded-md border px-2 py-1 text-[10px] font-medium transition-colors ${
                      on
                        ? "border-[#3e2e00] bg-[#171200] text-[#f2b500]"
                        : "border-[#242424] text-[#929292] hover:border-[#454545]"
                    }`}
                  >
                    {chip}
                  </button>
                );
              })}
            </div>
          </div>
          {rules.length > 0 ? (
            <div className="rounded-md border border-[#242424] bg-[#0a0a0a] p-2">
              <p className="text-[10px] font-medium text-[#757575]">
                Active rules
              </p>
              <ul className="mt-1 space-y-0.5">
                {rules.map((r) => (
                  <li key={r} className="text-xs text-[#929292]">
                    · {r}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </DialogBody>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" variant="default">
            Save changes
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
