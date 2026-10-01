import { useMemo, useState } from "react";
import AppIcon from "../AppIcon.jsx";
import { appIcons } from "../mobileAssets.js";
import {
  LEADERBOARD_PAGE_SIZE,
  POINTS_LEADERBOARD,
  formatEffVolume,
  formatLeaderAddress,
} from "./pointsMockData.js";

/**
 * Figma "Leaderboard" (957:5470): All Time / Current Week toggle, sortable
 * RANK and EFF. VOL columns, eight rows a page (trophy avatar and trend mark
 * for the top three) and a numbered pager.
 */

const RANGES = [
  { id: "allTime", label: "All Time" },
  { id: "currentWeek", label: "Current Week" },
];

const GOLD_TEXT = "text-[#e8d5b5]";
const SLATE_TEXT = "text-[#717182]";

/** The stacked ⌃⌄ pair; the active direction is lit, the other dimmed. */
function SortMark({ dir }) {
  return (
    <span className="flex flex-col" aria-hidden>
      <AppIcon
        src={appIcons.chevronUp16}
        size={8}
        className={`-mb-1 ${dir === "asc" ? "opacity-100" : dir ? "opacity-30" : "opacity-60"}`}
      />
      <AppIcon
        src={appIcons.chevronDown16}
        size={8}
        className={dir === "desc" ? "opacity-100" : dir ? "opacity-30" : "opacity-60"}
      />
    </span>
  );
}

function SortHeader({ label, dir, onPress, className = "" }) {
  return (
    <button
      type="button"
      onClick={onPress}
      aria-label={`Sort by ${label}${dir ? (dir === "asc" ? ", ascending" : ", descending") : ""}`}
      className={`app-pressable relative flex h-3.5 items-center gap-1 text-app-caption font-bold uppercase leading-[14px] ${GOLD_TEXT} after:absolute after:-inset-x-1 after:-inset-y-3 ${className}`}
    >
      {label}
      <SortMark dir={dir} />
    </button>
  );
}

/** `1 2 3 …` — a three-page window around the current page. */
function pageWindow(page, total) {
  const start = Math.max(1, Math.min(page - 1, total - 2));
  const end = Math.min(total, start + 2);
  const pages = [];
  for (let p = start; p <= end; p += 1) pages.push(p);
  return pages;
}

function PageButton({ children, active, disabled, onPress, label }) {
  return (
    <button
      type="button"
      onClick={onPress}
      disabled={disabled}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={`app-pressable flex size-8 shrink-0 items-center justify-center rounded-lg text-app-body leading-4 disabled:opacity-40 ${
        active ? `bg-[rgba(247,187,8,0.12)] font-semibold ${GOLD_TEXT}` : `bg-[#1a1a1a] font-normal ${SLATE_TEXT}`
      }`}
    >
      {children}
    </button>
  );
}

export default function PointsLeaderboard({ active }) {
  const [range, setRange] = useState("allTime");
  const [sort, setSort] = useState({ key: "rank", dir: "asc" });
  const [page, setPage] = useState(1);

  const rows = useMemo(() => {
    const list = [...POINTS_LEADERBOARD[range]];
    const sign = sort.dir === "asc" ? 1 : -1;
    list.sort((a, b) =>
      sort.key === "rank" ? (a.rank - b.rank) * sign : (a.effVolume - b.effVolume) * sign,
    );
    return list;
  }, [range, sort]);

  const totalPages = Math.max(1, Math.ceil(rows.length / LEADERBOARD_PAGE_SIZE));
  const pageRows = rows.slice((page - 1) * LEADERBOARD_PAGE_SIZE, page * LEADERBOARD_PAGE_SIZE);
  const pages = pageWindow(page, totalPages);

  const sortBy = (key) => {
    setSort((current) =>
      current.key === key
        ? { key, dir: current.dir === "asc" ? "desc" : "asc" }
        : { key, dir: key === "rank" ? "asc" : "desc" },
    );
    setPage(1);
  };

  return (
    <section className="flex w-full flex-col overflow-hidden rounded-[14px] border border-white/[0.06] bg-[#080808] px-3 pt-4">
      <div className="flex items-center justify-between gap-2 px-1">
        <h2 className={`text-app-title font-normal leading-7 ${GOLD_TEXT}`}>Leaderboard</h2>
        <div className="flex rounded-[10px] bg-[#1a1a1a] px-1 py-1.5" role="tablist" aria-label="Leaderboard range">
          {RANGES.map((item) => {
            const selected = item.id === range;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => {
                  setRange(item.id);
                  setPage(1);
                }}
                className={`app-pressable relative rounded-lg px-2.5 py-1 text-app-caption font-semibold leading-4 tracking-[0.2px] after:absolute after:-inset-y-2.5 after:inset-x-0 ${
                  selected ? `bg-[rgba(247,187,8,0.12)] ${GOLD_TEXT}` : "text-[#9a9aaa]"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {active ? (
        <>
          <div className="flex items-center px-3 pb-3 pt-4">
            <div className="w-[60px] shrink-0">
              <SortHeader label="Rank" dir={sort.key === "rank" ? sort.dir : null} onPress={() => sortBy("rank")} />
            </div>
            <p className={`min-w-0 flex-1 text-app-caption font-bold uppercase leading-[14px] tracking-[1.5px] ${GOLD_TEXT}`}>
              User
            </p>
            <SortHeader label="Eff. vol" dir={sort.key === "vol" ? sort.dir : null} onPress={() => sortBy("vol")} />
          </div>

          <ol className="flex flex-col gap-2" aria-label="Leaderboard">
            {pageRows.map((row) => {
              const top = row.rank <= 3;
              return (
                <li
                  key={row.address}
                  className="flex items-center rounded-[14px] border border-white/5 bg-app-surface px-3 py-[15px]"
                >
                  <span
                    className={`w-[60px] shrink-0 text-app-body font-bold leading-4 ${top ? GOLD_TEXT : SLATE_TEXT}`}
                  >
                    #{row.rank}
                  </span>
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <span
                      className={`flex size-7 shrink-0 items-center justify-center rounded-full border border-white/5 ${
                        top ? "bg-gradient-to-b from-[#785a28] to-[#1a150a]" : "bg-[#1a1a1a]"
                      }`}
                    >
                      {top ? (
                        <AppIcon src={appIcons.trophy14} size={14} className={GOLD_TEXT} />
                      ) : (
                        <AppIcon src={appIcons.user16} size={16} className={SLATE_TEXT} />
                      )}
                    </span>
                    <span className="truncate text-app-callout leading-[15px] text-ink">
                      {formatLeaderAddress(row.address)}
                    </span>
                  </div>
                  <span className="flex shrink-0 items-center gap-1">
                    <span className={`text-app-body leading-4 ${GOLD_TEXT}`}>
                      {formatEffVolume(row.effVolume)}
                    </span>
                    {top ? (
                      <AppIcon src={appIcons.trendUp12} size={12} className="text-[#2f9e85] opacity-50" />
                    ) : (
                      <span className="size-3 shrink-0" aria-hidden />
                    )}
                  </span>
                </li>
              );
            })}
          </ol>

          <nav
            className="mt-2 flex items-center justify-center gap-2 border-t border-white/5 bg-[#080808] py-[9px]"
            aria-label="Leaderboard pages"
          >
            <PageButton label="Previous page" disabled={page <= 1} onPress={() => setPage(page - 1)}>
              <AppIcon src={appIcons.chevronLeft16} size={16} />
            </PageButton>
            {pages.map((p) => (
              <PageButton key={p} active={p === page} onPress={() => setPage(p)} label={`Page ${p}`}>
                {p}
              </PageButton>
            ))}
            {pages[pages.length - 1] < totalPages ? (
              <PageButton label="More pages" onPress={() => setPage(Math.min(totalPages, page + 3))}>
                ...
              </PageButton>
            ) : null}
            <PageButton label="Next page" disabled={page >= totalPages} onPress={() => setPage(page + 1)}>
              <AppIcon src={appIcons.chevronRight16} size={16} />
            </PageButton>
          </nav>
        </>
      ) : (
        <div className="flex flex-col items-center gap-1.5 px-4 pb-10 pt-12 text-center">
          <p className={`text-app-headline font-medium ${GOLD_TEXT}`}>Season 2 hasn’t started</p>
          <p className="text-app-callout text-[#717182]">Stay tuned! The leaderboard opens with the season.</p>
        </div>
      )}
    </section>
  );
}
