import AppIcon from "../AppIcon.jsx";
import { appIcons } from "../mobileAssets.js";
import CopilotStrategySelector from "../../terminal/CopilotStrategySelector.jsx";
import { formatClock } from "./copilotIdeaData.js";

/** Full validity window of a batch of setups, in seconds (TerminalCopilotPage resets to 630). */
export const SETUP_WINDOW_SEC = 630;

const RISK_DOT = {
  Low: "bg-app-positive",
  Medium: "bg-app-accent",
  High: "bg-app-negative",
};

/**
 * Refresh button whose ring drains as the current batch of setups ages.
 *
 * The countdown used to be a line of text competing with four other controls;
 * as a ring it reads at a glance and the exact time moves into the list's
 * status line. Green while fresh, gold in the last minute, red once expired.
 */
function RefreshRing({ secondsLeft, busy, onPress }) {
  const r = 18;
  const c = 2 * Math.PI * r;
  const ratio = Math.max(0, Math.min(1, secondsLeft / SETUP_WINDOW_SEC));
  const expired = secondsLeft <= 0;
  const tone = expired ? "#d53d3d" : secondsLeft <= 60 ? "#f2b500" : "#269755";
  return (
    <button
      type="button"
      onClick={onPress}
      disabled={busy}
      aria-label={
        expired
          ? "Setups expired. Refresh"
          : `Refresh setups. Current batch valid for ${formatClock(secondsLeft)}`
      }
      className="app-pressable relative flex size-11 shrink-0 items-center justify-center rounded-full text-ink active:bg-white/[0.06] disabled:opacity-60"
    >
      <svg viewBox="0 0 44 44" className="absolute inset-0 size-11 -rotate-90" aria-hidden>
        <circle cx="22" cy="22" r={r} fill="none" stroke="#242424" strokeWidth="2" />
        <circle
          cx="22"
          cy="22"
          r={r}
          fill="none"
          stroke={tone}
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={expired ? 0 : c * (1 - ratio)}
          style={{ transition: "stroke-dashoffset 1s linear, stroke 300ms" }}
        />
      </svg>
      <AppIcon
        src={appIcons.refresh14}
        size={16}
        className={busy ? "animate-spin motion-reduce:animate-none" : ""}
      />
    </button>
  );
}

/** iOS-style segmented control for the screen's two peer views. */
function Segmented({ value, onChange, options }) {
  return (
    <div
      role="tablist"
      aria-label="Copilot view"
      className="grid grid-cols-2 gap-0.5 rounded-[10px] bg-app-subtle p-0.5"
    >
      {options.map((o) => {
        const active = o.id === value;
        return (
          <button
            key={o.id}
            type="button"
            role="tab"
            aria-selected={active}
            aria-label={o.count != null ? `${o.label}, ${o.count} ${o.countLabel}` : o.label}
            onClick={() => onChange(o.id)}
            className={`relative flex h-9 items-center justify-center gap-1.5 rounded-lg text-app-callout font-medium transition-colors before:absolute before:inset-x-0 before:-inset-y-1 before:content-[''] ${
              active ? "border border-app-line bg-app-raised text-ink" : "border border-transparent text-ink-subtle"
            }`}
          >
            {o.label}
            {o.count != null ? (
              <span
                className={`min-w-5 rounded px-1 text-app-label leading-4 ${
                  active ? "bg-app-accent-subtle text-app-accent" : "bg-app-bg text-ink-subtle"
                }`}
              >
                {o.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Phone AI Copilot screen header (pilot).
 *
 * The strategy lens is what decides every setup below it, so it is the
 * screen's title — tapping it opens the existing strategy sheet (a title menu,
 * not a form dropdown). Share and the refresh ring are the only toolbar
 * actions. The segmented control splits discovery (Ideas) from management
 * (Portfolio: positions, orders, history, balance), which used to be stacked
 * in one long scroll. "Portfolio", not "Positions", because the panel's own
 * first sub-tab is already called Positions.
 *
 * Pinned (non-scrolling): ~100px under the global top bar.
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
}) {
  return (
    <div className="shrink-0 border-b border-app-line bg-app-bg px-4 pb-3 pt-2">
      <div className="flex items-center gap-1">
        <div className="min-w-0 flex-1">
          {strategies?.length ? (
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
                  className="app-pressable -ml-1 flex min-h-11 max-w-full flex-col items-start justify-center rounded-lg px-1 text-left active:bg-white/[0.04]"
                >
                  <span className="flex items-center gap-1.5 text-app-label font-medium uppercase tracking-[0.06em] text-ink-faint">
                    AI strategy
                    <span
                      className={`size-1.5 rounded-full ${RISK_DOT[strategy.risk] ?? RISK_DOT.Medium}`}
                      aria-hidden
                    />
                    <span className="normal-case tracking-normal">{strategy.risk ?? "Medium"} risk</span>
                  </span>
                  <span className="flex max-w-full items-center gap-1 text-app-headline font-semibold text-ink">
                    <span className="truncate">{label}</span>
                    <AppIcon
                      src={appIcons.chevronDown16}
                      size={16}
                      className={`shrink-0 text-ink-subtle transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                    />
                  </span>
                </button>
              )}
            />
          ) : null}
        </div>
        <button
          type="button"
          aria-label="Share trade ideas"
          onClick={onShare}
          className="app-pressable flex size-11 shrink-0 items-center justify-center rounded-full text-ink active:bg-white/[0.06]"
        >
          <AppIcon src={appIcons.share14} size={16} />
        </button>
        <RefreshRing secondsLeft={expireSeconds} busy={refreshing} onPress={onRefresh} />
      </div>

      <div className="mt-2">
        <Segmented
          value={view}
          onChange={onViewChange}
          options={[
            { id: "ideas", label: "Ideas", count: ideasCount, countLabel: "setups" },
            { id: "positions", label: "Portfolio", count: positionsCount, countLabel: "open positions" },
          ]}
        />
      </div>
    </div>
  );
}
