import { Fragment } from "react";
import { clsx } from "clsx";
import { VaultMetricLabel } from "./VaultMetricLabel";
import type { PositionSummary } from "../utils/positionSummary";
import {
  formatCostPct,
  formatDuration,
  formatSignedUsd,
  formatUsd,
} from "../utils/format";

/*
 * Flat, not nested.
 *
 * The first pass gave every figure its own bordered card, inside the panel's own
 * border -- six boxes in a 380px column, two of them holding their own divided
 * sub-blocks. Every one of those borders was a line the eye had to parse before
 * reaching a number, and the cost rows crammed three columns into a 151px card.
 *
 * Rectangles are not the only way to group. Here the grouping is whitespace and two
 * hairlines, the figures sit in a borderless row, and the itemised costs run the full
 * width of the column where three columns actually fit. Same information, a third of
 * the lines drawn.
 *
 * Sizes and weights come from the trading type scale (`ds-eyebrow`, `text-anchor`,
 * `text-data`, `text-micro`, `text-meta`) -- no arbitrary pixel sizes, nothing heavier
 * than 500. Colour stays on the vault's own palette rather than the terminal ink
 * ladder, which is neutral grey and would read as a transplant on a gold surface.
 *
 * `tabular-nums` is set explicitly on every figure: the terminal surfaces inherit it
 * from `[data-type-scale="terminal"]`, but that attribute is not applied on this page.
 */

type PanelVariant = "default" | "v2";

const POSITIVE = "text-[#4ade80]";
const NEGATIVE = "text-[#f87171]";
const RULE = "border-[rgba(255,255,255,0.07)]";

/*
 * Vertical rhythm, three steps, applied in exactly one place each so the same
 * relationship cannot end up with two different gaps:
 *
 *   section break   33px  (py-4 either side of a hairline)
 *   figure to figure 20px  (gap-y-5 in the figure row)
 *   label to value    6px  (mt-1.5), value to its derivation 2px (mt-0.5)
 *
 * The last one is a single pair of constants rather than a number written at each
 * figure, because the blocks that used to live here disagreed on it -- 6px in one,
 * 2px in the next -- and it is the same relationship in both.
 */
const LABEL_TO_VALUE = "mt-1.5";
const VALUE_TO_SUB = "mt-0.5";

/** Metric labels. The panel title is deliberately not this — see `TITLE`. */
const LABEL = "ds-eyebrow text-[#8f90a1]";

/*
 * The panel's own title, tinted to match "Cross-Dex Setup" heading the column beside
 * it, so the two read as sibling headers rather than the right one reading as one
 * more metric label. Colour only: the sibling is `font-semibold`, which the type
 * scale caps at 500, and the extra weight is not what carries the distinction.
 */
const TITLE = "ds-eyebrow text-[rgba(227,202,157,0.82)]";

/** One headline figure: label, value, and the derivation under it. */
function Figure({
  label,
  description,
  value,
  tone,
  sub,
}: {
  label: string;
  description: string;
  value: string;
  tone?: string;
  sub?: string;
}) {
  return (
    <div className="flex min-w-0 flex-col">
      <VaultMetricLabel label={label} description={description} className={LABEL} />
      <p className={clsx(LABEL_TO_VALUE, "text-data tabular-nums", tone ?? "text-[#e6e7ef]")}>
        {value}
      </p>
      {sub && (
        <p
          className={clsx(VALUE_TO_SUB, "truncate text-meta tabular-nums text-[#63646f]")}
          title={sub}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

/**
 * Cost to open, as the sum it is: one total, then the lines that add up to it.
 *
 * These were two things -- a figure in the row above and a free-floating pair of rows
 * at the foot of the panel. Nothing but proximity said they were related, so the total
 * read as an assertion. One component, one grid, and the arithmetic is on screen:
 *
 *   Cost to open
 *   $6.45 (0.044% of notional)
 *   ----------------------------------
 *      Spread                  0.005%   $0.78
 *    + DEX fees (taker/maker)  0.039%   $5.67
 *
 * The leading "+" gets its own gutter column rather than being glued to the label,
 * so the labels still align down a single left edge -- an operator that indents the
 * term it applies to reads as a bullet, not as addition.
 *
 * Gas is why the venue profiles quote zero for it: a third cost, unshown, would break
 * that sum. It renders as its own term when a venue does charge one, because a total
 * that visibly fails to add up, directly above its own components, is worse than a
 * third row.
 */
function CostToOpenBlock({ summary }: { summary: PositionSummary }) {
  const pctOfNotional =
    (summary.costToOpenUsd.total / summary.notionalUsd) * 100;

  /*
   * "Spread" rather than "price impact": the same quantity -- what crossing the book
   * costs at this size -- under the name a perp trader already uses.
   */
  const terms: { label: string; pct?: string; value: string }[] = [
    {
      label: "Spread",
      pct: formatCostPct(
        summary.long.priceImpactPct + summary.short.priceImpactPct,
      ),
      value: formatUsd(summary.costToOpenUsd.priceImpact),
    },
    {
      label: "DEX fees (taker/maker)",
      pct: formatCostPct(summary.long.openFeePct + summary.short.openFeePct),
      value: formatUsd(summary.costToOpenUsd.fees),
    },
  ];
  if (summary.costToOpenUsd.gas > 0) {
    terms.push({ label: "Gas", value: formatUsd(summary.costToOpenUsd.gas) });
  }

  return (
    <div className="pt-4">
      <VaultMetricLabel
        label="Cost to open"
        description="What it costs to get both legs on: the price impact of your size against the book, plus venue taker fees. The terms below add up to it."
        className={LABEL}
      />

      {/*
        Total and share of notional on one line, the share in parentheses beside it
        rather than stacked under it. Stacked, it sat at the same offset as the two
        terms below and joined the list it is the sum of.
      */}
      <p className={clsx(LABEL_TO_VALUE, "flex flex-wrap items-baseline gap-x-2")}>
        <span className="text-anchor tabular-nums text-[#e6e7ef]">
          {formatUsd(summary.costToOpenUsd.total)}
        </span>
        <span className="text-meta tabular-nums text-[#63646f]">
          ({formatCostPct(pctOfNotional)} of notional)
        </span>
      </p>

      <div
        className={clsx(
          "mt-2.5 grid grid-cols-[0.6rem_minmax(0,1fr)_auto_auto] items-baseline gap-x-3 gap-y-1.5 border-t pt-2.5",
          RULE,
        )}
      >
        {terms.map((term, index) => (
          <Fragment key={term.label}>
            <span
              className="text-meta tabular-nums text-[#63646f]"
              aria-hidden={index === 0}
            >
              {index === 0 ? "" : "+"}
            </span>
            <span className="truncate text-meta text-[#7c7d8a]" title={term.label}>
              {term.label}
            </span>
            <span className="text-right text-meta tabular-nums text-[#63646f]">
              {term.pct ?? ""}
            </span>
            <span className="text-right text-micro tabular-nums text-[#b4b5c2]">
              {term.value}
            </span>
          </Fragment>
        ))}
      </div>
    </div>
  );
}

export function PositionSummaryPanel({
  summary,
  variant = "default",
}: {
  summary: PositionSummary | null;
  variant?: PanelVariant;
}) {
  const shell = clsx(
    "@container rounded-[11px] border p-4 max-tablet:p-3.5",
    variant === "v2"
      ? "border-[#1f1f1f] bg-[#121212]"
      : "border-[rgba(255,255,255,0.06)] bg-[linear-gradient(180deg,rgba(13,12,10,0.88)_0%,rgba(9,9,10,0.93)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.03),inset_0_-6px_18px_rgba(0,0,0,0.3)]",
  );

  /*
   * Nothing selected yet. An em-dash rather than a number computed from a defaulted
   * venue: the predecessor fell back to Hyperliquid's profile and quoted a live APY
   * for an empty form, which is a rate the user was never offered.
   */
  if (!summary || !summary.valid) {
    return (
      <section className={shell} aria-label="Position summary">
        <p className={TITLE}>Position Summary</p>
        <p className="mt-3 text-data text-[#63646f]">—</p>
        <p className="mt-1 text-meta text-[#63646f]">
          {summary?.reasons[0] ?? "Select two venues and an amount."}
        </p>
      </section>
    );
  }

  const profitable = summary.netAprOnCapitalPct > 0;

  return (
    <section className={shell} aria-label="Position summary">
      <p className={TITLE}>Position Summary</p>

      {/*
        The "Net APR on capital" hero stood here, with its on-notional and capital-
        efficiency derivation under it. The headline rate is quoted on the market strip
        above the inputs, so the panel no longer opens by repeating it.

        Its warning stays. A position that does not clear its own entry costs has to
        say so somewhere, and the hero was the only place on this panel that did --
        deleting the block wholesale would have taken the blocking reason with it and
        left a summary that reads fine while describing a losing position.
      */}
      {!profitable && summary.reasons[0] && (
        <p className={clsx("mt-2 text-meta", NEGATIVE)}>{summary.reasons[0]}</p>
      )}

      {/*
        The two figures that are only figures. Cost to open left this row: it is the
        one number here with parts, and a total whose components sit two blocks further
        down reads as an assertion rather than as a sum. It gets its own block below.

        A container query, not a breakpoint: this panel is 380px in the desktop
        sidebar and full width when the builder stacks, and it is its own width that
        decides how many columns fit -- not the viewport's. Keyed to the viewport
        instead, the stacked case gave each figure a 380px-wide cell holding a
        six-character number. Two figures fit side by side at either width, so this row
        no longer needs a wide variant.
      */}
      <div className={clsx("mt-3 grid grid-cols-2 gap-x-4 gap-y-5 border-b py-4", RULE)}>
        <Figure
          label="Est. income"
          description="Funding, plus any staking yield on a spot leg, at the current rate. Entry costs are listed separately rather than netted off here, so that income, cost and payback reconcile."
          value={`${formatSignedUsd(summary.incomeUsd.daily)} /day`}
          tone={summary.incomeUsd.daily >= 0 ? POSITIVE : NEGATIVE}
          sub={`≈ ${formatSignedUsd(summary.incomeUsd.monthly)} / 30d`}
        />
        <Figure
          label="Break-even"
          description="How long you have to hold, at the current rate, before income covers the round trip. The close is estimated at the same cost as the open, since a delta-neutral exit unwinds the same two legs the same way round."
          value={formatDuration(summary.breakEvenDays)}
          tone="text-[#c9a962]"
          sub={`${formatUsd(summary.roundTripCostUsd.total)} round-trip`}
        />
      </div>

      <CostToOpenBlock summary={summary} />
    </section>
  );
}
