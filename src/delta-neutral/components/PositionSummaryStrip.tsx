import { Fragment, useState } from "react";
import { clsx } from "clsx";
import { AlertTriangle, ChevronDown } from "lucide-react";
import { Popover, PopoverAnchor, PopoverContent } from "./ui/popover";
import { VaultMetricLabel } from "./VaultMetricLabel";
import type { PositionSummary } from "../utils/positionSummary";
import {
  formatCostPct,
  formatDuration,
  formatPct,
  formatSignedUsd,
  formatUsd,
} from "../utils/format";

/*
 * The position summary, as a strip rather than a panel.
 *
 * It used to be a 380px column card holding six figures at full size, parked in the
 * right column beside the controls. Two things were wrong with that. It was a long way
 * from the token whose economics it describes -- the APY / Current Spread strip sits
 * directly under the token selector precisely because a market's numbers belong beside
 * the market you just picked, and a position's numbers are the same class of fact.
 * And it was ~260px tall for three headline figures, which on a laptop pushed the
 * controls that change those figures toward the fold.
 *
 * So it takes the shape of the strip it now sits under: same 48px height, same rules,
 * same label-over-value cell. Three figures stay on the surface because they are the
 * three questions asked before opening a position -- what does it earn, when does it
 * pay back, what does entry cost. Everything that derived them moved behind Details,
 * which is where the strip above already puts its per-venue breakdown.
 *
 * Nothing here renders in Categories mode. A category is a basket, not a position:
 * there is no single token, no resolved legs and no cost to open, so the strip is not
 * rendered rather than rendered empty -- see the call site.
 */

const POSITIVE = "text-[#4ade80]";
const NEGATIVE = "text-[#f87171]";

/** Matches the metric strip above, so the two read as one stack of readouts. */
const CELL_LABEL =
  "min-w-0 truncate text-[10px] font-medium uppercase leading-[12px] tracking-[0.45px] text-[#9b9cad]";
const CELL_VALUE = "font-mono text-[15px] font-semibold leading-[18px]";
/** The derivation under a value -- never competing with it. */
const CELL_SUB = "min-w-0 truncate font-mono text-[10px] leading-[12px] text-[#63646f]";

const INCOME_HELP =
  "Funding, plus any staking yield on a spot leg, at the current rate. Entry costs are listed separately rather than netted off here, so that income, cost and payback reconcile.";
const BREAK_EVEN_HELP =
  "How long you have to hold, at the current rate, before income covers the round trip. The close is estimated at the same cost as the open, since a delta-neutral exit unwinds the same two legs the same way round.";
const COST_HELP =
  "What it costs to get both legs on: the price impact of your size against the book, plus venue taker fees. Open Details for the terms it adds up from.";

/*
 * Where each cell's rules go, in both shapes the strip takes.
 *
 * Wide it is one 48px row of four; below 420px of container it wraps to two rows of
 * two, which is the only honest thing to do at that width -- three money figures at
 * 15px do not fit across a phone, and the row above this one shows what happens when
 * you make them: "+$18.1..." next to "BREAK-EV...". A truncated figure is not a
 * smaller figure, it is a wrong one.
 *
 * Wrapped, the cell that starts a row loses its left rule and the second row gains a
 * top one, so the grid keeps drawing exactly the lines that are between cells.
 */
const RULE = "border-[rgba(255,255,255,0.07)]";
const CELL_RULES = [
  "",
  "border-l",
  "border-t @[420px]:border-t-0 @[420px]:border-l",
  "border-l border-t @[420px]:border-t-0",
];

/**
 * One cell: label, then value over its derivation.
 *
 * The derivation used to trail the value on the same line, to hold the strip to a
 * 48px row. It does not fit. "+$9.06 /day" beside "≈ +$271.77 / 30d" needs ~210px of
 * the ~224 a cell has at this measure, so the pair survived only while the numbers
 * stayed small -- push the margin up and it became "+$18.12 /day ≈ +$543..." with the
 * figure that matters cut off. A truncated number is not a smaller number, it is a
 * wrong one.
 *
 * Stacked, each line is as long as it needs to be, the eye reads down one column of
 * values instead of across pairs, and the row costs 66px instead of 48. That is the
 * whole price, and it buys back the third line the old summary card charged 260px for.
 */
function Cell({
  label,
  description,
  value,
  tone,
  sub,
  index,
}: {
  label: string;
  description: string;
  value: string;
  tone?: string;
  sub?: string;
  index: number;
}) {
  return (
    <div
      className={clsx(
        "flex min-w-0 flex-col justify-center gap-0.5 px-2.5 py-2.5",
        RULE,
        CELL_RULES[index],
      )}
    >
      <VaultMetricLabel
        label={label}
        description={description}
        className={CELL_LABEL}
      />
      <p className={clsx("min-w-0 truncate", CELL_VALUE, tone ?? "text-[#e6e7ef]")}>
        {value}
      </p>
      {/* A placeholder line, not a missing one: without it the cells in a row stop
          agreeing on where the value sits. */}
      <p className={CELL_SUB}>{sub ?? " "}</p>
    </div>
  );
}

/**
 * Cost to open, as the sum it is: one total, then the lines that add up to it.
 *
 * Lifted out of the old panel unchanged in substance. The leading "+" keeps its own
 * gutter column so the labels still align down a single left edge -- an operator glued
 * to the term it applies to reads as a bullet, not as addition.
 */
function CostTerms({ summary }: { summary: PositionSummary }) {
  const terms: { label: string; pct?: string; value: string }[] = [
    {
      // "Spread", not "price impact": the same quantity under the name a perp
      // trader already uses.
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
  // A total that visibly fails to add up, directly above its own components, is
  // worse than a third row -- so gas renders as a term wherever a venue charges one.
  if (summary.costToOpenUsd.gas > 0) {
    terms.push({ label: "Gas", value: formatUsd(summary.costToOpenUsd.gas) });
  }

  return (
    <div className="grid grid-cols-[0.6rem_minmax(0,1fr)_auto_auto] items-baseline gap-x-3 gap-y-1.5">
      {terms.map((term, index) => (
        <Fragment key={term.label}>
          <span
            className="font-mono text-[10px] text-[#63646f]"
            aria-hidden={index === 0}
          >
            {index === 0 ? "" : "+"}
          </span>
          <span className="truncate text-[11px] text-[#8b8b98]" title={term.label}>
            {term.label}
          </span>
          <span className="text-right font-mono text-[10px] text-[#63646f]">
            {term.pct ?? ""}
          </span>
          <span className="text-right font-mono text-[11px] text-[#ececf3]">
            {term.value}
          </span>
        </Fragment>
      ))}
    </div>
  );
}

/** Everything the strip no longer shows on its face. Click to open, Esc to close. */
function PositionDetailsPanel({
  summary,
  warning,
}: {
  summary: PositionSummary;
  warning?: string;
}) {
  const [open, setOpen] = useState(false);
  const pctOfNotional =
    (summary.costToOpenUsd.total / summary.notionalUsd) * 100;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label="Position details - cost breakdown, capital and net APY"
          onClick={() => setOpen((v) => !v)}
          className={clsx(
            "flex h-full shrink-0 items-center justify-center gap-1.5 px-3 text-[10px] font-medium uppercase leading-[12px] tracking-[0.45px] transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-[#c9a962] @[420px]:justify-start",
            RULE,
            CELL_RULES[3],
            warning
              ? "text-[#e08a8a] hover:bg-[rgba(248,113,113,0.08)] hover:text-[#f5b5b5]"
              : open
                ? "bg-[rgba(214,176,106,0.12)] text-[#e2c68b]"
                : "text-[#9f875c] hover:bg-[rgba(214,176,106,0.08)] hover:text-[#e2c68b]",
          )}
        >
          {warning && <AlertTriangle className="h-3 w-3 shrink-0" aria-hidden />}
          <span>Details</span>
          <ChevronDown
            className={clsx(
              "h-3 w-3 shrink-0 transition-transform duration-150",
              open && "rotate-180",
            )}
            aria-hidden
          />
        </button>
      </PopoverAnchor>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="z-[130] w-[300px] border border-[rgba(146,111,56,0.55)] bg-[#090909] p-3 text-[#f5f5f5]"
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.9px] text-[#c9a962]">
          Position details
        </p>

        {/*
          A position that does not clear its own entry costs has to say so somewhere.
          It led the old panel; here it leads the panel behind the trigger that is
          already wearing the warning colour.
        */}
        {warning && (
          <p className={clsx("mt-2 text-[11px] leading-relaxed", NEGATIVE)}>
            {warning}
          </p>
        )}

        <div className="mt-2.5 rounded-[8px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-2.5">
          <p className="text-[10px] uppercase tracking-[0.8px] text-[#8b8b98]">
            Cost to open
          </p>
          <p className="mt-1 flex flex-wrap items-baseline gap-x-2">
            <span className="font-mono text-[15px] font-semibold leading-[18px] text-[#ececf3]">
              {formatUsd(summary.costToOpenUsd.total)}
            </span>
            <span className="font-mono text-[10px] text-[#63646f]">
              ({formatCostPct(pctOfNotional)} of notional)
            </span>
          </p>
          <div className="mt-2 border-t border-[rgba(255,255,255,0.08)] pt-2">
            <CostTerms summary={summary} />
          </div>
        </div>

        {/*
          Income / 30d and the round-trip cost used to sit here too. They are the
          derivations already printed under Est. income and Break-even on the strip
          itself, and a panel that opens to restate what is behind it teaches the user
          not to open it. What is left is what the face genuinely does not say.
        */}
        <dl className="mt-2.5 space-y-2 border-t border-[rgba(255,255,255,0.08)] pt-2.5 font-mono text-[11px]">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-[#9c9cac]">Capital required</dt>
            <dd className="text-[#ececf3]">
              {formatUsd(summary.capitalRequiredUsd)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-[#9c9cac]">Net APY on capital</dt>
            <dd className={summary.netAprOnCapitalPct >= 0 ? POSITIVE : NEGATIVE}>
              {formatPct(summary.netAprOnCapitalPct)}
            </dd>
          </div>
        </dl>
      </PopoverContent>
    </Popover>
  );
}

/**
 * The strip. Sits directly under the market row, styled as a sibling of the
 * APY / spread strip above it.
 *
 * It renders in both states rather than appearing once an amount is typed: a control
 * that pops into existence moves everything under it, and the empty strip is also how
 * the user learns which three numbers the amount is about to produce.
 */
export function PositionSummaryStrip({
  summary,
  className,
}: {
  summary: PositionSummary | null;
  className?: string;
}) {
  /*
   * Two elements, not one: `container-type` only sizes an element's *descendants*, so
   * the grid whose own columns depend on the width has to sit inside the container
   * rather than be it. Collapsed into one div, `@[420px]:grid-cols-...` silently never
   * matches and the strip stays two-up at every width.
   */
  const shell =
    "grid grid-cols-2 overflow-hidden rounded-[10px] border border-[rgba(214,176,106,0.16)] bg-[#080808] @[420px]:grid-cols-[repeat(3,minmax(0,1fr))_auto]";

  /*
   * Nothing sized yet. Em-dashes rather than numbers computed from a defaulted
   * amount: a quoted figure the user was never offered is worse than a blank.
   */
  if (!summary || !summary.valid) {
    return (
      <div className={clsx("@container w-full", className)}>
        <div className={shell} aria-label="Position summary">
        <Cell
          index={0}
          label="Est. income"
          description={INCOME_HELP}
          value="—"
          tone="text-[#4b4c56]"
        />
        <Cell
          index={1}
          label="Break-even"
          description={BREAK_EVEN_HELP}
          value="—"
          tone="text-[#4b4c56]"
        />
        <Cell
          index={2}
          label="Cost to open"
          description={COST_HELP}
          value="—"
          tone="text-[#4b4c56]"
        />
          <p
            className={clsx(
              "flex shrink-0 items-center px-3 text-[10px] leading-[12px] text-[#63646f]",
              RULE,
              CELL_RULES[3],
            )}
          >
            {summary?.reasons[0] ?? "Set an amount"}
          </p>
        </div>
      </div>
    );
  }

  const profitable = summary.netAprOnCapitalPct > 0;

  return (
    <div className={clsx("@container w-full", className)}>
      <div className={shell} aria-label="Position summary">
        <Cell
          index={0}
        label="Est. income"
        description={INCOME_HELP}
        value={`${formatSignedUsd(summary.incomeUsd.daily)} /day`}
        tone={summary.incomeUsd.daily >= 0 ? POSITIVE : NEGATIVE}
        sub={`≈ ${formatSignedUsd(summary.incomeUsd.monthly)} / 30d`}
      />
      <Cell
        index={1}
        label="Break-even"
        description={BREAK_EVEN_HELP}
        value={formatDuration(summary.breakEvenDays)}
        tone="text-[#c9a962]"
        sub={`${formatUsd(summary.roundTripCostUsd.total)} round-trip`}
      />
      <Cell
        index={2}
        label="Cost to open"
        description={COST_HELP}
        value={formatUsd(summary.costToOpenUsd.total)}
        sub={`${formatCostPct(
          (summary.costToOpenUsd.total / summary.notionalUsd) * 100,
        )} of notional`}
      />
        <PositionDetailsPanel
          summary={summary}
          warning={!profitable ? summary.reasons[0] : undefined}
        />
      </div>
    </div>
  );
}
