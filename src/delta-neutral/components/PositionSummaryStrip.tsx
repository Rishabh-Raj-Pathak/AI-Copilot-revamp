import { Fragment, useState, type ReactNode } from "react";
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

/**
 * One readout in a column card: what it is called, what it explains, what it says.
 *
 * Declared here, beside the cell that renders it, so the caller that assembles the
 * market's figures is stating them in the shape the card already reads.
 */
export type MarketMetric = {
  label: string;
  description: string;
  value: string;
  /** Colour carries the sign; the value is never re-weighted for it. */
  tone?: string;
};

/** Which builder layout the summary is being rendered into. */
type SummaryLayout = "strip" | "panel";
type SummaryVariant = "default" | "v2";

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
  row = false,
}: {
  label: string;
  description: string;
  value: string;
  tone?: string;
  sub?: string;
  index: number;
  /**
   * Panel shape: label on the left, figure on the right, one per line. A 380px column
   * is too narrow to put three of these across and too wide to spend a whole line on a
   * label with nothing beside it.
   */
  row?: boolean;
}) {
  if (row) {
    return (
      <div className="flex items-baseline justify-between gap-3 py-2">
        <VaultMetricLabel
          label={label}
          description={description}
          className={CELL_LABEL}
        />
        <div className="flex min-w-0 flex-col items-end gap-0.5">
          <p className={clsx("min-w-0 truncate", CELL_VALUE, tone ?? "text-[#e6e7ef]")}>
            {value}
          </p>
          {sub && <p className={CELL_SUB}>{sub}</p>}
        </div>
      </div>
    );
  }

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
  className,
}: {
  summary: PositionSummary;
  warning?: string;
  className?: string;
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
            className,
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
/**
 * The three figures, once. Both shapes read this list rather than each writing out
 * its own -- the whole point of one component with two layouts is that the versions
 * cannot drift into quoting different things.
 */
function figuresFor(summary: PositionSummary) {
  return [
    {
      label: "Est. income",
      description: INCOME_HELP,
      value: `${formatSignedUsd(summary.incomeUsd.daily)} /day`,
      tone: summary.incomeUsd.daily >= 0 ? POSITIVE : NEGATIVE,
      sub: `≈ ${formatSignedUsd(summary.incomeUsd.monthly)} / 30d`,
    },
    {
      label: "Break-even",
      description: BREAK_EVEN_HELP,
      value: formatDuration(summary.breakEvenDays),
      tone: "text-[#c9a962]",
      sub: `${formatUsd(summary.roundTripCostUsd.total)} round-trip`,
    },
    {
      label: "Cost to open",
      description: COST_HELP,
      value: formatUsd(summary.costToOpenUsd.total),
      tone: undefined as string | undefined,
      sub: `${formatCostPct(
        (summary.costToOpenUsd.total / summary.notionalUsd) * 100,
      )} of notional`,
    },
  ];
}

const EMPTY_FIGURES = [
  { label: "Est. income", description: INCOME_HELP },
  { label: "Break-even", description: BREAK_EVEN_HELP },
  { label: "Cost to open", description: COST_HELP },
];

const EMPTY_TONE = "text-[#4b4c56]";

/**
 * The shell every card in the column wears.
 *
 * The column holds two of them now -- the market's rates, then the position they
 * produce -- and a card is only read as the sibling of the one above it if the border,
 * the ground and the padding are the same to the pixel. One function, so they are.
 */
function panelShell(variant: SummaryVariant, className?: string) {
  return clsx(
    "rounded-[11px] border p-4 max-tablet:p-3.5",
    variant === "v2"
      ? "border-[#1f1f1f] bg-[#121212]"
      : "border-[rgba(255,255,255,0.06)] bg-[linear-gradient(180deg,rgba(13,12,10,0.88)_0%,rgba(9,9,10,0.93)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.03),inset_0_-6px_18px_rgba(0,0,0,0.3)]",
    className,
  );
}

/** The full-width footer a column card hangs its disclosure trigger in. */
function PanelFooter({ children }: { children: ReactNode }) {
  return <div className={clsx("flex h-[34px] border-t", RULE)}>{children}</div>;
}

/**
 * The market's own economics, as a card for the column layout.
 *
 * The same three figures the strip layout keeps under the token selector -- the rate
 * on offer, the spread it is earned from, and the ceiling that spread is read against.
 * In the column layout they belong here rather than in the control column: they are
 * readouts, not inputs, and the left column is what you set while the right column is
 * what it gets you. Stacked above the position summary they also read in the order the
 * arithmetic runs -- what the market pays, then what a position in it comes to.
 *
 * It lives in this file because it has to match the card below it exactly, and the
 * cell, the rules and the shell that make that match are all here.
 */
export function MarketMetricsPanel({
  metrics,
  footer,
  variant = "default",
  className,
}: {
  metrics: MarketMetric[];
  /** The disclosure trigger, given the card's full width. Optional. */
  footer?: ReactNode;
  variant?: SummaryVariant;
  className?: string;
}) {
  return (
    <section className={panelShell(variant, className)} aria-label="Market rates">
      <div className={clsx("divide-y", RULE)}>
        {metrics.map((metric, index) => (
          <Cell key={metric.label} row index={index} {...metric} />
        ))}
      </div>
      {footer && <PanelFooter>{footer}</PanelFooter>}
    </section>
  );
}

/**
 * The summary as a column card, for the builder layout that keeps a column to put it
 * in.
 *
 * Same three figures, same words, same Details panel as the strip -- only the
 * arrangement differs, because 380px is too narrow to put three money figures across
 * and the strip's own wrapped fallback (two up, two down) leaves a hole where its
 * fourth cell would be.
 *
 * No heading. It had one while it was the only card in the column and the strip
 * layout's own summary was a nameless 48px row under the market; now it is the second
 * of two cards that both state figures for the pair named at the top of the builder,
 * and a title over one of them labelled the wrong thing -- the column, not the card.
 * The three row labels already say what each figure is, which is what a heading over
 * them could only repeat. The accessible name stays on the section.
 */
function SummaryPanel({
  summary,
  variant,
  className,
}: {
  summary: PositionSummary | null;
  variant: SummaryVariant;
  className?: string;
}) {
  const shell = panelShell(variant, className);

  if (!summary || !summary.valid) {
    return (
      <section className={shell} aria-label="Position summary">
        <div className={clsx("divide-y", RULE)}>
          {EMPTY_FIGURES.map((figure, index) => (
            <Cell
              key={figure.label}
              row
              index={index}
              label={figure.label}
              description={figure.description}
              value="—"
              tone={EMPTY_TONE}
            />
          ))}
        </div>
        <p className={clsx("border-t pt-2.5 text-[10px] text-[#63646f]", RULE)}>
          {summary?.reasons[0] ?? "Set an amount"}
        </p>
      </section>
    );
  }

  const profitable = summary.netAprOnCapitalPct > 0;

  return (
    <section className={shell} aria-label="Position summary">
      <div className={clsx("divide-y", RULE)}>
        {figuresFor(summary).map((figure, index) => (
          <Cell key={figure.label} row index={index} {...figure} />
        ))}
      </div>
      {/*
        The same trigger the strip carries, given the panel's full width so it reads as
        the card's own footer rather than as a button parked in a corner.
      */}
      <PanelFooter>
        <PositionDetailsPanel
          summary={summary}
          warning={!profitable ? summary.reasons[0] : undefined}
          className="w-full justify-center border-l-0"
        />
      </PanelFooter>
    </section>
  );
}

export function PositionSummaryStrip({
  summary,
  layout = "strip",
  variant = "default",
  className,
}: {
  summary: PositionSummary | null;
  /**
   * Which builder layout is asking. "strip" is the 48px readout under the market row;
   * "panel" is the column card beside the controls. The figures are identical either
   * way -- see `figuresFor`.
   */
  layout?: SummaryLayout;
  variant?: SummaryVariant;
  className?: string;
}) {
  if (layout === "panel") {
    return (
      <SummaryPanel summary={summary} variant={variant} className={className} />
    );
  }

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
          {EMPTY_FIGURES.map((figure, index) => (
            <Cell
              key={figure.label}
              index={index}
              label={figure.label}
              description={figure.description}
              value="—"
              tone={EMPTY_TONE}
            />
          ))}
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
        {figuresFor(summary).map((figure, index) => (
          <Cell key={figure.label} index={index} {...figure} />
        ))}
        <PositionDetailsPanel
          summary={summary}
          warning={!profitable ? summary.reasons[0] : undefined}
        />
      </div>
    </div>
  );
}
