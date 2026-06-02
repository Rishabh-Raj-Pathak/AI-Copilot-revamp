import { Badge } from "../../ui/badge.jsx";
import { Button } from "../../ui/button.jsx";
import StrategyFlowStepper from "./StrategyFlowStepper.jsx";

function directionVariant(dir) {
  const d = (dir ?? "").toLowerCase();
  if (d === "long") return "success";
  if (d === "short") return "destructive";
  return "neutral";
}

function MetricTile({ label, value }) {
  return (
    <div className="rounded-md border border-[#242424] bg-[#0f0f0f] px-3 py-2.5">
      <p className="text-[10px] font-medium uppercase tracking-wide text-[#757575]">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function BulletSection({ title, items, warn = false }) {
  if (!items?.length) return null;
  return (
    <section>
      <h4
        className={`text-xs font-semibold ${warn ? "text-[#d53d3d]" : "text-[#bfbfbf]"}`}
      >
        {title}
      </h4>
      <ul className="mt-2 space-y-1.5">
        {items.map((item, i) => (
          <li
            key={`${title}-${i}`}
            className="flex gap-2 text-xs leading-relaxed text-[#929292]"
          >
            <span className="text-[#585858]">·</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function GeneratedSetupCard({
  setup,
  onCreateAgent,
  onModifySetup,
  onAskFollowUp,
}) {
  if (!setup) return null;

  return (
    <article className="space-y-4">
      <div className="rounded-lg border border-[#242424] bg-[#0a0a0a]">
        <header className="border-b border-[#242424] px-4 py-3.5 sm:px-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-white">
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

        <div className="grid gap-2 px-4 py-4 sm:grid-cols-2 sm:px-5 lg:grid-cols-3 xl:grid-cols-5">
          <MetricTile label="Entry zone" value={setup.entryZone} />
          <MetricTile label="Stop loss" value={setup.stopLoss} />
          <MetricTile label="Take profit" value={setup.takeProfit} />
          <MetricTile label="Risk / reward" value={setup.riskReward} />
          <MetricTile
            label="Suggested leverage"
            value={setup.suggestedLeverage ?? `Max 3x`}
          />
        </div>

        {setup.personalizationNote ? (
          <div className="mx-4 mb-4 rounded-md border border-[#3e2e00]/40 bg-[#171200]/50 px-3 py-2.5 sm:mx-5">
            <p className="text-[10px] font-medium uppercase tracking-wide text-[#f2b500]/80">
              Personalization
            </p>
            <p className="mt-1 text-xs leading-relaxed text-[#f2b500]">
              {setup.personalizationNote}
            </p>
          </div>
        ) : null}
      </div>

      <StrategyFlowStepper steps={setup.flowSteps} />

      <div className="rounded-lg border border-[#242424] bg-[#0a0a0a] px-4 py-4 sm:px-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <BulletSection title="Strategy logic" items={setup.strategyLogic} />
          <BulletSection title="Why this setup" items={setup.whySetup ?? setup.reasoning} />
          <BulletSection title="Wait for" items={setup.waitFor} />
          <BulletSection
            title="What could go wrong"
            items={setup.warnings}
            warn
          />
        </div>
      </div>

      <footer className="flex flex-wrap gap-2">
        <Button size="sm" variant="default" onClick={onCreateAgent}>
          Create agent
        </Button>
        <Button size="sm" variant="outline" onClick={onModifySetup}>
          Modify setup
        </Button>
        <Button size="sm" variant="ghost" onClick={onAskFollowUp}>
          Ask follow-up
        </Button>
        <Button size="sm" variant="ghost" disabled title="Prototype">
          Save idea
        </Button>
        <Button size="sm" variant="ghost" disabled title="Prototype">
          Paper trade
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled
          title="Manual execution integration not enabled yet."
        >
          Place manually
        </Button>
      </footer>

      <p className="text-[10px] leading-relaxed text-[#585858]">
        AI-generated setups are for analysis and decision support only. Review
        risk before taking any trade.
      </p>
    </article>
  );
}
