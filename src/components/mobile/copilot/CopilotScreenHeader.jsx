import AppIcon from "../AppIcon.jsx";
import AppTopBar from "../AppTopBar.jsx";
import { appIcons } from "../mobileAssets.js";
import CopilotStrategySelector from "../../terminal/CopilotStrategySelector.jsx";
import { formatClock } from "./copilotIdeaData.js";

/**
 * Refresh with the batch's time left beside it (Figma "Refresh · Expires in").
 * Outline-free; the countdown carries the state: green while fresh, gold in
 * the last minute, "Expired" in red, "Scanning" while a refresh runs.
 */
function RefreshTimer({ secondsLeft, busy, onPress }) {
  const expired = secondsLeft <= 0;
  const tone = busy
    ? "text-ink-subtle"
    : expired
      ? "text-app-negative"
      : secondsLeft <= 60
        ? "text-app-accent"
        : "text-app-positive";
  return (
    <button
      type="button"
      onClick={onPress}
      disabled={busy}
      aria-label={
        busy
          ? "Scanning for new setups"
          : expired
            ? "Setups expired. Refresh"
            : `Refresh setups. Current batch valid for ${formatClock(secondsLeft)}`
      }
      className="app-pressable relative flex h-8 shrink-0 items-center gap-1.5 rounded-full pl-2.5 pr-3 text-ink before:absolute before:inset-x-0 before:-inset-y-1.5 before:content-[''] active:bg-white/[0.06]"
    >
      <AppIcon
        src={appIcons.refresh14}
        size={14}
        className={busy ? "animate-spin motion-reduce:animate-none" : ""}
      />
      <span className={`text-app-caption font-medium ${tone}`}>
        {busy ? "Scanning" : expired ? "Expired" : formatClock(secondsLeft)}
      </span>
    </button>
  );
}

/** Underline tabs for the screen's two peer views; the count trails the label. */
function Tabs({ value, onChange, options }) {
  return (
    <div role="tablist" aria-label="Copilot view" className="flex min-w-0 flex-1 items-end gap-5">
      {options.map((o) => {
        const active = o.id === value;
        const count = o.pending ? "–" : o.count;
        return (
          <button
            key={o.id}
            type="button"
            role="tab"
            aria-selected={active}
            aria-label={o.count != null ? `${o.label}, ${o.count} ${o.countLabel}` : o.label}
            onClick={() => onChange(o.id)}
            className={`flex h-10 shrink-0 items-center gap-[5px] border-b-2 pt-0.5 text-app-body leading-[18px] transition-colors ${
              active
                ? "border-ink font-semibold text-ink"
                : "border-transparent font-medium text-ink-subtle active:text-ink-muted"
            }`}
          >
            {o.label}
            {count != null ? (
              <span
                className={`text-app-callout font-normal leading-4 ${active ? "text-ink-subtle" : "text-ink-faint"}`}
              >
                {count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Strategy picker that stands in for the brand mark in the top bar. The
 * strategy decides every setup below it, so it is the screen's title; tapping
 * it opens the strategy sheet (a title menu, not a form dropdown).
 */
function StrategyTitle({ strategies, selectedStrategyId, onStrategySelect }) {
  if (!strategies?.length) return <span className="min-w-0 flex-1" />;
  return (
    <div className="min-w-0 flex-1">
      <CopilotStrategySelector
        strategies={strategies}
        selectedId={selectedStrategyId}
        onSelect={onStrategySelect}
        renderTrigger={({ label, strategy, open, disabled, onPress }) => (
          <button
            type="button"
            disabled={disabled}
            onClick={onPress}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-label={`AI strategy: ${label}, ${strategy.risk ?? "Medium"} risk. Change strategy`}
            data-tour="copilot-overview"
            className="app-pressable -ml-1.5 flex min-h-11 max-w-full flex-col items-start justify-center gap-px rounded-lg px-1.5 text-left active:bg-white/[0.04]"
          >
            <span className="flex max-w-full items-center gap-0.5 text-app-heading font-semibold text-ink max-[374px]:text-app-button">
              <span className="truncate">{label}</span>
              <AppIcon
                src={appIcons.chevronDown16}
                size={14}
                className={`shrink-0 text-ink-subtle transition-transform duration-200 ${open ? "rotate-180" : ""}`}
              />
            </span>
            <span className="max-w-full truncate text-app-label font-medium text-ink-faint">
              Strategy · {strategy.risk ?? "Medium"} risk
            </span>
          </button>
        )}
      />
    </div>
  );
}

/**
 * Phone AI Copilot screen header (Figma 1209:6992).
 *
 *   ┌──────────────────────────────────────────┐
 *   │ High Conviction ⌄        (venue)(pts)(w) │  top bar — strategy is the title
 *   │ Strategy · Medium risk                   │
 *   │ Strategies 2   Portfolio 3   ⇪  ⟳ 9:50  │  view tabs + their actions
 *   └──────────────────────────────────────────┘
 *
 * The strategy replaces the brand mark, so the whole pinned header is two
 * rows. The tabs split discovery (Strategies) from management (Portfolio);
 * share and refresh sit beside them because they act on the batch of setups,
 * and the batch's time left lives on the refresh button. "Portfolio", not
 * "Positions", because the panel's own first sub-tab is already Positions.
 */
export default function CopilotScreenHeader({
  strategies,
  selectedStrategyId,
  onStrategySelect,
  expireSeconds,
  refreshing,
  onRefresh,
  onShare,
  view,
  onViewChange,
  ideasCount,
  positionsCount,
  onWalletConnected,
  onWalletDisconnect,
  onTerminalPlatformChange,
}) {
  return (
    <div className="shrink-0 border-b border-app-line bg-app-bg">
      <AppTopBar
        compact
        className="border-b-0! px-5! max-[374px]:px-4!"
        onWalletConnected={onWalletConnected}
        onWalletDisconnect={onWalletDisconnect}
        onTerminalPlatformChange={onTerminalPlatformChange}
        leading={
          <StrategyTitle
            strategies={strategies}
            selectedStrategyId={selectedStrategyId}
            onStrategySelect={onStrategySelect}
          />
        }
      />

      <div className="flex items-center gap-2 px-5 pb-px max-[374px]:px-4">
        <Tabs
          value={view}
          onChange={onViewChange}
          options={[
            {
              id: "ideas",
              label: "Strategies",
              count: ideasCount,
              pending: refreshing,
              countLabel: "setups",
            },
            { id: "positions", label: "Portfolio", count: positionsCount, countLabel: "open positions" },
          ]}
        />
        <button
          type="button"
          aria-label="Share trade ideas"
          onClick={onShare}
          className="app-pressable relative flex size-8 shrink-0 items-center justify-center rounded-full text-ink-muted before:absolute before:-inset-1.5 before:content-[''] active:bg-white/[0.06]"
        >
          <AppIcon src={appIcons.share14} size={14} />
        </button>
        <RefreshTimer secondsLeft={expireSeconds} busy={refreshing} onPress={onRefresh} />
      </div>
    </div>
  );
}
