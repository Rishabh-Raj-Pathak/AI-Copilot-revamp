import { useCopilotTheme } from "../../StrategyCopilotContext.jsx";

const DONUT_CX = 50;
const DONUT_CY = 50;
const DONUT_OUTER = 40;
const DONUT_INNER = 26;

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeDonutSlice(cx, cy, innerR, outerR, startAngle, endAngle) {
  const startOuter = polarToCartesian(cx, cy, outerR, endAngle);
  const endOuter = polarToCartesian(cx, cy, outerR, startAngle);
  const startInner = polarToCartesian(cx, cy, innerR, endAngle);
  const endInner = polarToCartesian(cx, cy, innerR, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 0 ${endOuter.x} ${endOuter.y}`,
    `L ${endInner.x} ${endInner.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 1 ${startInner.x} ${startInner.y}`,
    "Z",
  ].join(" ");
}

function WinLossDonut({ wins, losses }) {
  const total = wins + losses;
  const winAngle = total > 0 ? (wins / total) * 360 : 0;
  const lossAngle = total > 0 ? (losses / total) * 360 : 0;

  return (
    <svg
      viewBox="0 0 100 100"
      className="size-[4.5rem] shrink-0 sm:size-20"
      role="img"
      aria-label={`${wins} wins, ${losses} losses`}
    >
      <circle
        cx={DONUT_CX}
        cy={DONUT_CY}
        r={DONUT_OUTER}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={DONUT_OUTER - DONUT_INNER}
      />
      {wins > 0 && winAngle >= 360 ? (
        <circle
          cx={DONUT_CX}
          cy={DONUT_CY}
          r={(DONUT_OUTER + DONUT_INNER) / 2}
          fill="none"
          stroke="var(--ds-copilot-v2-positive)"
          strokeWidth={DONUT_OUTER - DONUT_INNER}
        />
      ) : wins > 0 && winAngle > 0 ? (
        <path
          d={describeDonutSlice(
            DONUT_CX,
            DONUT_CY,
            DONUT_INNER,
            DONUT_OUTER,
            0,
            winAngle,
          )}
          fill="var(--ds-copilot-v2-positive)"
        />
      ) : null}
      {losses > 0 && lossAngle >= 360 ? (
        <circle
          cx={DONUT_CX}
          cy={DONUT_CY}
          r={(DONUT_OUTER + DONUT_INNER) / 2}
          fill="none"
          stroke="var(--ds-copilot-v2-negative)"
          strokeWidth={DONUT_OUTER - DONUT_INNER}
        />
      ) : losses > 0 && lossAngle > 0 ? (
        <path
          d={describeDonutSlice(
            DONUT_CX,
            DONUT_CY,
            DONUT_INNER,
            DONUT_OUTER,
            winAngle,
            360,
          )}
          fill="var(--ds-copilot-v2-negative)"
        />
      ) : null}
      <circle
        cx={DONUT_CX}
        cy={DONUT_CY}
        r={DONUT_INNER - 1}
        fill="var(--ds-copilot-v2-elevated)"
      />
    </svg>
  );
}

function WinLossLegend({ wins, losses, theme }) {
  return (
    <div className="flex items-center justify-center gap-3 text-[11px] font-medium">
      <span className={`flex items-center gap-1.5 ${theme.textPositive}`}>
        <span
          className="size-1.5 shrink-0 rounded-full bg-[var(--ds-copilot-v2-positive)]"
          aria-hidden
        />
        <span className="tabular-nums">{wins}W</span>
      </span>
      <span className={`flex items-center gap-1.5 ${theme.textNegative}`}>
        <span
          className="size-1.5 shrink-0 rounded-full bg-[var(--ds-copilot-v2-negative)]"
          aria-hidden
        />
        <span className="tabular-nums">{losses}L</span>
      </span>
    </div>
  );
}

function SectionLabel({ children, theme }) {
  return (
    <p
      className={
        theme.isV3
          ? `mb-2 text-xs font-medium uppercase tracking-wide ${theme.textMuted}`
          : "mb-2 text-xs font-medium uppercase tracking-wide text-[rgba(255,255,255,0.42)]"
      }
    >
      {children}
    </p>
  );
}

function TradesStatCell({ label, value, valueTone, theme, isLast }) {
  const valueClass =
    valueTone === "positive"
      ? theme.textPositive
      : valueTone === "negative"
        ? theme.textNegative
        : theme.textSecondary;
  const labelClass = theme.isV3
    ? theme.textMuted
    : "text-[var(--ds-copilot-v2-text-muted)]";
  const borderClass = isLast
    ? ""
    : theme.isV3
      ? "border-b border-white/[0.05]"
      : "border-b border-dotted border-white/[0.06]";

  return (
    <div
      className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 py-2 ${borderClass}`}
    >
      <span className={`min-w-0 truncate text-xs ${labelClass}`}>{label}</span>
      <span className={`shrink-0 text-xs font-medium tabular-nums ${valueClass}`}>
        {value}
      </span>
    </div>
  );
}

function buildStatPairs(bt) {
  return [
    [
      {
        label: "Largest Win",
        value: bt.largestWin,
        valueTone: "positive",
      },
      {
        label: "Largest Loss",
        value: bt.largestLoss,
        valueTone: "negative",
      },
    ],
    [
      { label: "Avg Profit", value: bt.avgProfit, valueTone: "positive" },
      { label: "Avg Loss", value: bt.avgLoss, valueTone: "negative" },
    ],
    [
      { label: "Profit Factor", value: bt.profitFactor, valueTone: null },
      { label: "Avg Bars", value: bt.avgBars ?? "—", valueTone: null },
    ],
    [
      {
        label: "Max Consecutive Wins",
        value: bt.maxConsecutiveWins ?? "—",
        valueTone: "positive",
      },
      {
        label: "Max Consecutive Losses",
        value: bt.maxConsecutiveLosses ?? "—",
        valueTone: "negative",
      },
    ],
  ];
}

export default function OverviewTradesAnalysis({ bt }) {
  const theme = useCopilotTheme();
  const wins = bt.wins ?? 0;
  const losses = bt.losses ?? 0;
  const statPairs = buildStatPairs(bt);

  const header = (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h4 className={theme.overviewPanelTitle}>Trades Analysis</h4>
      <div
        className={`flex flex-wrap items-center gap-3 text-[11px] ${theme.isV3 ? theme.textMuted : "text-[var(--ds-copilot-v2-text-muted)]"}`}
      >
        <span>
          <span className="font-semibold text-white">{bt.trades ?? 0}</span>{" "}
          Trades
        </span>
        <span className="text-[rgba(255,255,255,0.2)]">·</span>
        <span>
          Win Rate{" "}
          <span className="font-semibold text-white">{bt.winRate}</span>
        </span>
      </div>
    </div>
  );

  const body = (
    <div className="mt-4">
      {/* Mobile: chart on top, then symmetric two columns */}
      <div className="flex flex-col gap-5 sm:hidden">
        <div className="flex flex-col items-center gap-2.5 border-b border-white/6 pb-5">
          <WinLossDonut wins={wins} losses={losses} />
          <WinLossLegend wins={wins} losses={losses} theme={theme} />
        </div>
        <div className="grid grid-cols-2 gap-x-5">
          <div className="min-w-0">
            <SectionLabel theme={theme}>Wins</SectionLabel>
            {statPairs.map(([win], i) => (
              <TradesStatCell
                key={win.label}
                {...win}
                theme={theme}
                isLast={i === statPairs.length - 1}
              />
            ))}
          </div>
          <div className="min-w-0 border-l border-white/6 pl-5">
            <SectionLabel theme={theme}>Losses</SectionLabel>
            {statPairs.map(([, loss], i) => (
              <TradesStatCell
                key={loss.label}
                {...loss}
                theme={theme}
                isLast={i === statPairs.length - 1}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Desktop: fixed chart rail + paired rows for row alignment */}
      <div className="hidden sm:grid sm:grid-cols-[5.5rem_minmax(0,1fr)_minmax(0,1fr)] sm:gap-x-6">
        <div className="row-span-5 flex flex-col items-center justify-center gap-2.5 border-r border-white/6 pr-6">
          <WinLossDonut wins={wins} losses={losses} />
          <WinLossLegend wins={wins} losses={losses} theme={theme} />
        </div>

        <div className="min-w-0">
          <SectionLabel theme={theme}>Wins</SectionLabel>
        </div>
        <div className="min-w-0 border-l border-white/6 pl-6">
          <SectionLabel theme={theme}>Losses</SectionLabel>
        </div>

        {statPairs.map(([win, loss], i) => (
          <div key={win.label} className="contents">
            <div className="min-w-0">
              <TradesStatCell
                {...win}
                theme={theme}
                isLast={i === statPairs.length - 1}
              />
            </div>
            <div className="min-w-0 border-l border-white/6 pl-6">
              <TradesStatCell
                {...loss}
                theme={theme}
                isLast={i === statPairs.length - 1}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (theme.isV3) {
    return (
      <section className="border-b border-white/6 py-5">
        {header}
        {body}
      </section>
    );
  }

  return (
    <div className="rounded-xl border border-[#242424] bg-[var(--ds-copilot-v2-elevated)] p-4 sm:p-5">
      {header}
      {body}
    </div>
  );
}
