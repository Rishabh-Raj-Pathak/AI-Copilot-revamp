import AppHeaderTabs from "../AppHeaderTabs.jsx";
import AppIcon from "../AppIcon.jsx";
import AppScreenTitle from "../AppScreenTitle.jsx";
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
      {/* Tabular so the ticking countdown doesn't nudge share/tabs every second. */}
      <span className={`text-app-caption font-medium tabular-nums ${tone}`}>
        {busy ? "Scanning" : expired ? "Expired" : formatClock(secondsLeft)}
      </span>
    </button>
  );
}

/**
 * The strategy is the screen's title: it decides every setup below it, so
 * tapping it opens the strategy sheet (a title menu, not a form dropdown).
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
          <AppScreenTitle
            title={label}
            meta={`Strategy · ${strategy.risk ?? "Medium"} risk`}
            onPress={onPress}
            expanded={open}
            disabled={disabled}
            ariaLabel={`AI strategy: ${label}, ${strategy.risk ?? "Medium"} risk. Change strategy`}
            dataTour="copilot-overview"
          />
        )}
      />
    </div>
  );
}

/**
 * Phone AI Copilot screen header — the shared `AppTopBar` (Figma 1227:13431
 * signed out / 1189:11730 signed in) with the strategy as its title and a
 * second row for the view tabs and the batch actions:
 *
 *   ┌──────────────────────────────────────────┐
 *   │ High Conviction ⌄        (venue)(pts)(w) │  top bar — strategy is the title
 *   │ Strategy · Medium risk                   │
 *   │ Strategies 2   Portfolio 3   ⇪  ⟳ 9:50  │  view tabs + their actions
 *   └──────────────────────────────────────────┘
 *
 * The tabs split discovery (Strategies) from management (Portfolio); share and
 * refresh sit beside them because they act on the batch of setups, and the
 * batch's time left lives on the refresh button. "Portfolio", not
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
    <AppTopBar
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
    >
      <div className="flex items-center gap-2 px-5 pb-px max-[374px]:px-4">
        <AppHeaderTabs
          ariaLabel="Copilot view"
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
    </AppTopBar>
  );
}
