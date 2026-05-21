import { Badge } from "../../ui/badge.jsx";
import { Button } from "../../ui/button.jsx";

const STATUS_VARIANT = {
  Watching: "brand",
  Triggered: "success",
  Paused: "neutral",
  Completed: "secondary",
};

export default function AgentCard({ agent, onEditPrompt, onPause, onStop }) {
  return (
    <article className="rounded-lg border border-[#242424] bg-[#0a0a0a] p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h4 className="truncate text-sm font-semibold text-white">
            {agent.name}
          </h4>
          <p className="mt-0.5 text-xs text-[#757575]">
            {agent.market} · {agent.strategy}
          </p>
        </div>
        <Badge
          variant={STATUS_VARIANT[agent.status] ?? "neutral"}
          size="sm"
        >
          {agent.status}
        </Badge>
      </div>

      <p className="mt-2 text-xs leading-relaxed text-[#929292]">
        {agent.condition}
      </p>

      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-[#757575]">
        <span>Model: {agent.model}</span>
        <span>Expires: {agent.expiry}</span>
        <span>Checked: {agent.lastChecked}</span>
      </div>

      {agent.updateLog?.length > 0 ? (
        <p className="mt-2 text-[10px] text-[#00f3b6]">
          {agent.updateLog[agent.updateLog.length - 1]}
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-1.5">
        <Button size="xs" variant="outline" onClick={() => onEditPrompt(agent)}>
          Edit prompt
        </Button>
        <Button
          size="xs"
          variant="ghost"
          onClick={() => onPause(agent.id)}
          disabled={agent.status === "Paused"}
        >
          Pause
        </Button>
        <Button size="xs" variant="ghost" onClick={() => onStop(agent.id)}>
          Stop
        </Button>
      </div>
    </article>
  );
}
