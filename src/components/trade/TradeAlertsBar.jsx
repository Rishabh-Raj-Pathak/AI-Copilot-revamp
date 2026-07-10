import { AlertTriangle, ChevronDown, X } from "lucide-react";
import { useState } from "react";
import { TRADE_ALERTS } from "./tradeAlerts.js";

/** Vertical peek of each stacked card behind the top one, in px. */
const DECK_OFFSET_PX = 7;
/** How many cards peek out behind the top alert. */
const MAX_DECK_LAYERS = 2;
/** Extra px below the peek so the expand strip is a usable click/tap target. */
const PEEK_HIT_PADDING_PX = 8;

function AlertRow({ alert, onAction, onDismiss }) {
  return (
    <div
      role="status"
      className="flex items-center justify-between gap-3 rounded-[10px] border border-[#3e2e00] bg-[#171200] px-3.5 py-2"
    >
      <div className="flex min-w-0 items-center gap-3">
        <AlertTriangle
          className="size-4 shrink-0 text-[#f2b500]"
          strokeWidth={1.75}
          aria-hidden
        />
        {/* Truncates rather than wraps, so the band stays exactly one line tall. */}
        <p className="min-w-0 truncate leading-snug" title={`${alert.title} — ${alert.body}`}>
          <span className="text-[13px] font-semibold text-white">
            {alert.title}
          </span>
          <span className="ml-2 text-xs text-[#bfbfbf]">{alert.body}</span>
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={() => onAction?.(alert.cta.type, alert)}
          className="inline-flex h-8 shrink-0 items-center justify-center whitespace-nowrap rounded-lg bg-[#f2b500] px-3.5 text-xs font-semibold text-[#171200] transition-[filter] hover:brightness-110 focus-visible:shadow-ds-ring focus-visible:outline-none active:brightness-95"
        >
          {alert.cta.label}
        </button>
        <button
          type="button"
          onClick={onDismiss}
          aria-label={`Dismiss alert: ${alert.title}`}
          className="flex size-7 shrink-0 items-center justify-center rounded-lg text-[#787878] transition-colors hover:bg-white/5 hover:text-white focus-visible:shadow-ds-ring focus-visible:outline-none"
        >
          <X className="size-4" strokeWidth={1.75} aria-hidden />
        </button>
      </div>
    </div>
  );
}

/**
 * Amber account-blocker band above the trade terminal.
 * Collapsed, the top alert rests on an iOS-style deck of peeking cards; expanding fans them into a list.
 */
export default function TradeAlertsBar({ alerts = TRADE_ALERTS, onAction }) {
  const [dismissedIds, setDismissedIds] = useState(() => new Set());
  const [expanded, setExpanded] = useState(false);

  const visible = alerts.filter((a) => !dismissedIds.has(a.id));
  if (visible.length === 0) return null;

  const hasMore = visible.length > 1;
  // Derived, not stored: a dismissal that drops us to one alert collapses the bar on its own.
  const isExpanded = expanded && hasMore;

  const dismiss = (id) =>
    setDismissedIds((prev) => new Set(prev).add(id));

  // Collapsed: the top alert sits on a deck of decorative peeking edges (iOS notification stack).
  // Two layers max — past that the deck reads as noise rather than depth.
  const deck = hasMore ? visible.slice(1, 1 + MAX_DECK_LAYERS) : [];

  return (
    <div
      role="region"
      aria-label="Trade alerts"
      className="flex shrink-0 flex-col gap-2 border-b border-[#242424] bg-black px-4 py-2 sm:px-5"
    >
      {isExpanded ? (
        <>
          {visible.map((alert) => (
            <AlertRow
              key={alert.id}
              alert={alert}
              onAction={onAction}
              onDismiss={() => dismiss(alert.id)}
            />
          ))}
          <button
            type="button"
            onClick={() => setExpanded(false)}
            aria-expanded
            className="mx-auto flex h-7 items-center gap-1 rounded-lg px-2 text-xs font-medium text-[#787878] transition-colors hover:bg-white/5 hover:text-white focus-visible:shadow-ds-ring focus-visible:outline-none"
          >
            Show less
            <ChevronDown className="size-3.5 rotate-180" aria-hidden />
          </button>
        </>
      ) : (
        <div
          className="relative isolate"
          style={{ marginBottom: deck.length * DECK_OFFSET_PX }}
        >
          {deck.map((alert, i) => (
            <div
              key={alert.id}
              aria-hidden
              className="absolute inset-0 rounded-[10px] border border-[#3e2e00] bg-[#171200] transition-transform"
              style={{
                zIndex: -(i + 1),
                transform: `translateY(${(i + 1) * DECK_OFFSET_PX}px) scaleX(${1 - (i + 1) * 0.028})`,
                opacity: 1 - (i + 1) * 0.28,
              }}
            />
          ))}

          <AlertRow
            alert={visible[0]}
            onAction={onAction}
            onDismiss={() => dismiss(visible[0].id)}
          />

          {/* The peeking deck edge is the sole expand affordance, so it must be a real control. */}
          {hasMore ? (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              aria-expanded={false}
              aria-label={`Show ${visible.length - 1} more ${visible.length - 1 === 1 ? "alert" : "alerts"}`}
              className="absolute inset-x-0 top-full rounded-b-[10px] focus-visible:shadow-ds-ring focus-visible:outline-none"
              style={{ height: deck.length * DECK_OFFSET_PX + PEEK_HIT_PADDING_PX }}
            />
          ) : null}
        </div>
      )}
    </div>
  );
}
