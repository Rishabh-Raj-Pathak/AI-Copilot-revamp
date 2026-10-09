import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import AppChip from "../AppChip.jsx";
import AppEmptyState from "../AppEmptyState.jsx";
import AppIcon from "../AppIcon.jsx";
import AppNavBar from "../AppNavBar.jsx";
import { appIcons, appImages } from "../mobileAssets.js";
import { useMobileApp } from "../MobileAppContext.js";
import ConnectNetworkSheet from "../sheets/ConnectNetworkSheet.jsx";
import {
  EMPTY,
  WEEKDAYS,
  daysInMonth,
  firstWeekday,
  formatCellPnl,
  formatSignedUsd,
  formatUsd,
  getPnlCalendar,
  monthKey,
  monthName,
  monthShort,
  pnlMonths,
  profitAndLoss,
} from "./pnlCalendarData.js";

/**
 * Phone PnL Calendar — Figma section "09 PnL Calendar · mobile-native"
 * (1330:6979): Current Month 1340:6979, Month View 1340:7192, No Trades
 * 1340:7448, Loading 1340:7700, Signed Out 1340:7913.
 *
 * A pushed screen (More → PnL Calendar). The user picks a month, so there is
 * no picker sheet, title or arrows: month chips under the nav (oldest →
 * newest, opening on this month), and a sideways swipe on the grid steps a
 * month. A year chip pinned before the months names the year and switches it
 * in place (added after the Figma, on request). The web's four stats, then the
 * grid.
 */
export default function MobilePnlCalendarPage() {
  const app = useMobileApp();
  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-app-bg text-ink">
      <AppNavBar title="PnL Calendar" />
      {app.walletConnected ? <CalendarView /> : <SignedOut onConnected={app.connectWallet} />}
    </div>
  );
}

/** Figma "Signed Out" (1340:7913): the shared "Connect a wallet" empty state. */
function SignedOut({ onConnected }) {
  const [connectOpen, setConnectOpen] = useState(false);
  return (
    <main className="flex min-h-0 flex-1 flex-col px-5 pb-[calc(var(--app-tab-bar-h)+1.5rem)] max-[374px]:px-4">
      <AppEmptyState
        className="px-3"
        icon={<AppIcon src={appIcons.calendar20} size={20} />}
        title="Connect a wallet"
        message="Your Total PnL, Closed PnL, Profitable Days and Profit / Loss show up here once you connect."
        actions={[{ label: "Connect wallet", primary: true, onClick: () => setConnectOpen(true) }]}
      />
      <ConnectNetworkSheet
        open={connectOpen}
        onClose={() => setConnectOpen(false)}
        onSelect={() => {
          setConnectOpen(false);
          onConnected();
        }}
      />
    </main>
  );
}

/** Loaded months by key. The first visit to a month shows bones; later ones are instant. */
function usePnlCalendar({ year, month }) {
  const key = monthKey({ year, month });
  const [loaded, setLoaded] = useState({});
  useEffect(() => {
    let live = true;
    getPnlCalendar({ month, year }).then((data) => {
      if (live) setLoaded((prev) => (prev[key] === data ? prev : { ...prev, [key]: data }));
    });
    return () => {
      live = false;
    };
  }, [key, month, year]);
  return loaded[key] ?? null;
}

function CalendarView() {
  const [today] = useState(() => new Date());
  const months = useMemo(() => pnlMonths(today), [today]);
  const [index, setIndex] = useState(months.length - 1);
  // Which side the new month slides in from: 1 newer, -1 older, 0 none.
  const [dir, setDir] = useState(0);
  const month = months[index];
  const data = usePnlCalendar(month);

  const select = (next) => {
    if (next < 0 || next >= months.length || next === index) return;
    setDir(next > index ? 1 : -1);
    setIndex(next);
  };

  // A new year keeps the month when it exists there, else the nearest one (later on a tie).
  const selectYear = (year) => {
    let best = null;
    months.forEach((m, i) => {
      if (m.year !== year) return;
      const distance = Math.abs(m.month - month.month);
      if (!best || distance <= best.distance) best = { i, distance };
    });
    if (best) select(best.i);
  };

  return (
    <>
      <PeriodChips months={months} index={index} onSelect={select} onSelectYear={selectYear} />
      <main className="app-no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-y-contain pb-[var(--app-tab-bar-h)]">
        <div className="flex flex-col gap-4 px-5 pb-6 pt-3 max-[374px]:px-4">
          <SummaryCard data={data} />
          <MonthGrid
            month={month}
            data={data}
            today={today}
            dir={dir}
            onSwipe={(step) => select(index + step)}
          />
        </div>
      </main>
    </>
  );
}

/**
 * Figma "Month Chips" plus the year. A year chip is pinned before the months
 * so the year is always on screen; tapping it swaps the strip, in place, for
 * the years with history. Picking one swaps back to that year's months.
 * Nothing covers the calendar.
 */
function PeriodChips({ months, index, onSelect, onSelectYear }) {
  const [pickingYear, setPickingYear] = useState(false);
  const year = months[index].year;
  const years = [...new Set(months.map((m) => m.year))];

  const yearItems = years.map((y) => ({
    key: String(y),
    label: String(y),
    active: y === year,
    onSelect: () => {
      onSelectYear(y);
      setPickingYear(false);
    },
  }));
  const monthItems = months
    .map((m, i) => ({
      key: monthKey(m),
      year: m.year,
      label: monthShort(m),
      ariaLabel: `${monthName(m)} ${m.year}`,
      active: i === index,
      onSelect: () => onSelect(i),
    }))
    .filter((item) => item.year === year);

  return (
    <div className="flex shrink-0 items-center">
      <div className="flex shrink-0 items-center gap-2 pb-1 pl-5 pt-3 max-[374px]:pl-4">
        <AppChip
          label={String(year)}
          ariaLabel={`Year ${year}`}
          expanded={pickingYear}
          disabled={years.length < 2}
          onClick={() => setPickingYear((open) => !open)}
        />
        <span aria-hidden className="h-5 w-px bg-white/10" />
      </div>
      {/* Keyed so a new year (or the year list) opens on its selected chip. */}
      {pickingYear ? (
        <ChipStrip key="years" label="Year" items={yearItems} />
      ) : (
        <ChipStrip key={year} label={`Month in ${year}`} items={monthItems} />
      )}
    </div>
  );
}

/**
 * A sideways chip row: Copilot's category chips, oldest → newest, opening on
 * the selected chip and keeping it on screen after a swipe. The left fade
 * (clone of 1220:41021) shows once earlier chips are scrolled off.
 */
function ChipStrip({ label, items }) {
  const rowRef = useRef(null);
  const mountedRef = useRef(false);
  const [scrolled, setScrolled] = useState(false);
  const activeKey = items.find((item) => item.active)?.key;

  useEffect(() => {
    const row = rowRef.current;
    const chip = row?.querySelector("[data-active]");
    if (!row || !chip) return;
    const behavior = mountedRef.current ? "smooth" : "instant";
    mountedRef.current = true;
    const left = chip.offsetLeft - 8;
    const right = chip.offsetLeft + chip.offsetWidth + 20 - row.clientWidth;
    if (row.scrollLeft > left) row.scrollTo({ left, behavior });
    else if (row.scrollLeft < right) row.scrollTo({ left: right, behavior });
  }, [activeKey]);

  return (
    <div className="app-fade-in relative min-w-0 flex-1">
      <div
        ref={rowRef}
        role="radiogroup"
        aria-label={label}
        onScroll={(e) => setScrolled(e.currentTarget.scrollLeft > 0)}
        className="app-no-scrollbar relative flex gap-2 overflow-x-auto overscroll-x-contain pb-1 pl-2 pr-5 pt-3 max-[374px]:pr-4"
      >
        {items.map((item) => (
          <AppChip
            key={item.key}
            active={item.active}
            label={item.label}
            ariaLabel={item.ariaLabel}
            onClick={item.onSelect}
          />
        ))}
      </div>
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-app-bg to-transparent transition-opacity duration-150 ${
          scrolled ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}

const toneClass = (value) =>
  value > 0 ? "text-app-positive" : value < 0 ? "text-app-negative" : "text-ink";

/** One stat: 11/14 label over a 14/18 value, or a bone while loading. */
function Metric({ label, loading, boneWidth = 72, children }) {
  return (
    <div className={`flex min-w-0 flex-col ${loading ? "gap-1.5" : "gap-0.5"}`}>
      <dt className="text-app-label text-ink-subtle">{label}</dt>
      <dd className="text-app-body font-medium leading-[18px]">
        {loading ? (
          <span
            className="block h-3.5 animate-pulse rounded-[4px] bg-app-control"
            style={{ width: boneWidth }}
          />
        ) : (
          children
        )}
      </dd>
    </div>
  );
}

/**
 * Figma "Summary Card": exactly the web's four stats, 2×2. A month with no
 * trades reads "–" throughout.
 */
function SummaryCard({ data }) {
  const loading = !data;
  const traded = data?.calendar.some((d) => d.pnl) ?? false;
  const { profit, loss } = data ? profitAndLoss(data.calendar) : { profit: 0, loss: 0 };
  const value = (v, format) =>
    traded && v != null ? <span className={toneClass(v)}>{format(v)}</span> : <span className="text-ink">{EMPTY}</span>;

  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-[16px] border border-app-line p-3.5">
      <Metric label="Total PnL" loading={loading}>
        {value(data?.totalPnl, formatSignedUsd)}
      </Metric>
      <Metric label="Closed PnL" loading={loading}>
        {value(data?.totalClosedPnl, formatSignedUsd)}
      </Metric>
      <Metric label="Profitable Days" loading={loading}>
        <span className="text-ink">{traded && data.profitableDays ? data.profitableDays : EMPTY}</span>
      </Metric>
      <Metric label="Profit / Loss" loading={loading} boneWidth={110}>
        {traded ? (
          // Each amount stays whole; a narrow column wraps at the slash, never after a sign.
          <>
            <span className={`whitespace-nowrap ${toneClass(profit)}`}>{formatUsd(profit)}</span>
            <span className="text-ink-subtle"> / </span>
            <span className={`whitespace-nowrap ${toneClass(loss)}`}>{formatUsd(loss)}</span>
          </>
        ) : (
          <span className="text-ink">{EMPTY}</span>
        )}
      </Metric>
    </dl>
  );
}

/** Horizontal travel (px) that counts as a month swipe. */
const SWIPE_MIN = 48;

/**
 * Figma "Calendar": weekday row and the day grid. Swipe left for the next
 * month, right for the previous; vertical drags still scroll the page.
 */
function MonthGrid({ month, data, today, dir, onSwipe }) {
  const reduceMotion = useReducedMotion();
  const start = useRef(null);
  const isCurrent = monthKey(month) === monthKey({ year: today.getFullYear(), month: today.getMonth() + 1 });
  const todayDate = isCurrent ? today.getDate() : null;
  const length = daysInMonth(month);
  const lead = firstWeekday(month);

  const endSwipe = (e) => {
    const from = start.current;
    start.current = null;
    if (!from) return;
    const dx = e.clientX - from.x;
    const dy = e.clientY - from.y;
    if (Math.abs(dx) < SWIPE_MIN || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    onSwipe(dx < 0 ? 1 : -1);
  };

  return (
    <section
      aria-label={`${monthName(month)} ${month.year}`}
      className="flex touch-pan-y select-none flex-col gap-1.5"
      onPointerDown={(e) => {
        start.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerUp={endSwipe}
      onPointerCancel={() => {
        start.current = null;
      }}
    >
      <div aria-hidden className="grid grid-cols-7 gap-1 text-center text-app-label font-medium text-ink-faint">
        {WEEKDAYS.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <motion.ol
        key={monthKey(month)}
        initial={dir && !reduceMotion ? { x: dir * 24, opacity: 0 } : false}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="grid grid-cols-7 gap-1"
      >
        {Array.from({ length: lead }, (_, i) => (
          <li key={`lead-${i}`} aria-hidden className="h-14" />
        ))}
        {Array.from({ length }, (_, i) => {
          const day = i + 1;
          return (
            <DayCell
              key={day}
              day={day}
              pnl={data?.calendar[i]?.pnl ?? 0}
              loading={!data}
              future={todayDate != null && day > todayDate}
              today={day === todayDate}
            />
          );
        })}
      </motion.ol>
    </section>
  );
}

/**
 * Figma "Day / N" (46×56, r8). Profit: green tint and edge. Loss: red tint,
 * #F06464 value. No trades: white 6% edge and "–". Future: white 4% edge, no
 * value. Today: white SemiBold date and the 4px gold dot.
 */
function DayCell({ day, pnl, loading, future, today }) {
  const tone = future || loading || !pnl ? "none" : pnl > 0 ? "profit" : "loss";
  const frame = {
    profit: "border-[#0a2917] bg-app-positive-subtle",
    loss: "border-[#470f0f] bg-app-negative-subtle",
    none: future ? "border-white/[0.04]" : "border-white/[0.06]",
  }[tone];
  const dateClass = today
    ? "font-semibold text-ink"
    : future
      ? "text-app-line-strong"
      : tone === "none"
        ? "text-ink-faint"
        : "text-ink-subtle";

  return (
    <li
      className={`flex h-14 min-w-0 flex-col justify-between overflow-hidden rounded-[8px] border px-[5px] py-1.5 max-[374px]:px-[3px] ${frame}`}
    >
      <span className={`flex items-center gap-[3px] text-app-label font-medium ${dateClass}`}>
        {day}
        {today ? <img alt="Today" src={appImages.todayDot} className="size-1 shrink-0" /> : null}
      </span>
      {future ? null : (
        <span className="flex justify-end whitespace-nowrap text-right text-app-micro font-medium">
          {loading ? (
            <span className="block h-1.5 w-[22px] animate-pulse rounded-[3px] bg-app-control" />
          ) : tone === "profit" ? (
            <span className="text-app-positive">{formatCellPnl(pnl)}</span>
          ) : tone === "loss" ? (
            <span className="text-[#f06464]">{formatCellPnl(pnl)}</span>
          ) : (
            <span className="text-app-line-strong">{EMPTY}</span>
          )}
        </span>
      )}
    </li>
  );
}
