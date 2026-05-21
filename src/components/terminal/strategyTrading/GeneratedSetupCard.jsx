import { Badge } from "../../ui/badge.jsx";
import { Button } from "../../ui/button.jsx";

function directionVariant(dir) {
  const d = (dir ?? "").toLowerCase();
  if (d === "long") return "success";
  if (d === "short") return "destructive";
  return "neutral";
}

function Metric({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-medium uppercase tracking-wide text-[#757575]">
        {label}
      </p>
      <p className="mt-0.5 truncate text-sm font-medium text-white">{value}</p>
    </div>
  );
}

export default function GeneratedSetupCard({
  setup,
  onCreateAgent,
  onModifyPrompt,
  onAskFollowUp,
}) {
  if (!setup) return null;

  return (
    <article className="rounded-lg border border-[#242424] bg-[#0a0a0a]">
      <header className="border-b border-[#242424] px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-white sm:text-base">
              {setup.title}
            </h3>
            <p className="mt-1 text-xs text-[#929292]">
              {setup.market} · {setup.preferredDex} · {setup.timeframe}
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant={directionVariant(setup.direction)} size="sm">
              {setup.direction}
            </Badge>
            <Badge variant="brand" size="sm">
              {setup.confidence} confidence
            </Badge>
            <Badge variant="outline" size="sm">
              Risk: {setup.riskLevel}
            </Badge>
          </div>
        </div>
      </header>

      <div className="grid gap-4 px-4 py-4 sm:grid-cols-2 sm:px-5">
        <Metric label="Strategy" value={setup.strategy} />
        <Metric label="Model" value={setup.model} />
        <Metric label="Entry zone" value={setup.entryZone} />
        <Metric label="Stop loss" value={setup.stopLoss} />
        <Metric label="Take profit" value={setup.takeProfit} />
        <Metric label="Risk / reward" value={setup.riskReward} />
      </div>

      {setup.personalizationNote ? (
        <div className="mx-4 mb-3 rounded-md border border-[#3e2e00]/50 bg-[#171200]/60 px-3 py-2 sm:mx-5">
          <p className="text-xs text-[#f2b500]">{setup.personalizationNote}</p>
        </div>
      ) : null}

      <div className="space-y-3 border-t border-[#242424] px-4 py-4 sm:px-5">
        <Section title="Reasoning" items={setup.reasoning} />
        <Section title="Wait for" items={setup.waitFor} />
        <Section title="What could go wrong" items={setup.warnings} warn />
        <Section title="Suggested next actions" items={setup.nextActions} />
      </div>

      <footer className="flex flex-wrap gap-2 border-t border-[#242424] px-4 py-3 sm:px-5">
        <Button size="sm" variant="default" onClick={onCreateAgent}>
          Create watcher
        </Button>
        <Button size="sm" variant="outline" onClick={onModifyPrompt}>
          Modify prompt
        </Button>
        <Button size="sm" variant="ghost" onClick={onAskFollowUp}>
          Ask follow-up
        </Button>
        <Button size="sm" variant="ghost" disabled title="Prototype">
          Save setup
        </Button>
        <Button size="sm" variant="ghost" disabled title="Prototype">
          Paper trade
        </Button>
        <Button size="sm" variant="ghost" disabled title="Prototype">
          Place manually
        </Button>
      </footer>

      <p className="border-t border-[#242424] px-4 py-2 text-[10px] leading-relaxed text-[#757575] sm:px-5">
        AI-generated setups are for analysis only. Review risk before taking
        action.
      </p>
    </article>
  );
}

function Section({ title, items, warn = false }) {
  if (!items?.length) return null;
  return (
    <div>
      <h4
        className={`text-xs font-semibold ${warn ? "text-[#d53d3d]" : "text-[#bfbfbf]"}`}
      >
        {title}
      </h4>
      <ul className="mt-1.5 space-y-1">
        {items.map((item, i) => (
          <li
            key={`${title}-${i}`}
            className="text-xs leading-relaxed text-[#929292]"
          >
            · {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
