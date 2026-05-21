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

export default function EditAgentPromptDialog({
  open,
  onOpenChange,
  agent,
  onSave,
}) {
  const [condition, setCondition] = useState("");
  const [rulesText, setRulesText] = useState("");

  useEffect(() => {
    if (!agent) return;
    setCondition(agent.condition ?? "");
    setRulesText((agent.memoryRules ?? []).join("\n"));
  }, [agent, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!agent) return;
    onSave?.(agent.id, {
      condition: condition.trim(),
      memoryRules: rulesText
        .split("\n")
        .map((r) => r.trim())
        .filter(Boolean),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="w-[min(28rem,calc(100%-1.5rem))]">
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <DialogTitle>Edit agent instructions</DialogTitle>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[#929292]">Monitoring condition</span>
            <Textarea
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              rows={4}
              required
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[#929292]">
              Agent memory / rules (one per line)
            </span>
            <Textarea
              value={rulesText}
              onChange={(e) => setRulesText(e.target.value)}
              rows={5}
              placeholder="Only suggest low-risk trades"
            />
          </label>
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
