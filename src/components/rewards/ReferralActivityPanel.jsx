import { useState } from "react";
import { ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";
import {
  CLAIM_HISTORY,
  KOL_CLAIM_HISTORY,
  KOL_LEADERBOARD,
  KOL_REWARD_STATS,
  KOL_TOTAL_PAGES,
  REFERRED_USERS,
  TOTAL_PAGES,
} from "./rewardsMockData.js";

function formatRankChange(value) {
  if (value === "–") return "No change";
  if (value.startsWith("+")) return `Up ${value.slice(1)}`;
  if (value.startsWith("–")) return `Down ${value.slice(1)}`;
  return value;
}

/**
 * Referred Users / Claim History, the tabbed table in the middle of the page.
 *
 * Desktop keeps the artboard's five-column table; below `tablet` it collapses to
 * the stacked row cards the rest of the app uses for wide tables.
 */
const STANDARD_TABS = [
  {
    id: "referred-users",
    label: "Referred Users",
    rows: REFERRED_USERS,
    columns: [
      { key: "wallet", label: "Wallet Address" },
      { key: "joined", label: "Date Joined" },
      { key: "volume", label: "Total Volume" },
      { key: "reward", label: "Your Reward" },
    ],
  },
  {
    id: "claim-history",
    label: "Claim History",
    rows: CLAIM_HISTORY,
    columns: [
      { key: "date", label: "Date" },
      { key: "amount", label: "Amount" },
      { key: "source", label: "Source" },
      { key: "status", label: "Status" },
    ],
  },
];

const KOL_TABS = [
  {
    id: "leaderboard",
    label: "Leaderboard",
    rows: KOL_LEADERBOARD,
    columns: [
      { key: "wallet", label: "Wallet Address" },
      { key: "volume", label: "Total Volume" },
      { key: "milestone", label: "Milestone" },
      { key: "movement", label: "Rank change" },
    ],
  },
  {
    id: "claim-history",
    label: "Your claims",
    rows: KOL_CLAIM_HISTORY,
    columns: [
      { key: "date", label: "Date" },
      { key: "amount", label: "Amount" },
      { key: "source", label: "Source" },
      { key: "status", label: "Status" },
    ],
  },
];

export default function ReferralActivityPanel({ variant = "rewards" }) {
  const isKol = variant === "kol";
  const tabs = isKol ? KOL_TABS : STANDARD_TABS;
  const totalPages = isKol ? KOL_TOTAL_PAGES : TOTAL_PAGES;
  const [tabId, setTabId] = useState(tabs[0].id);
  const [page, setPage] = useState(1);

  const tab = tabs.find((t) => t.id === tabId) ?? tabs[0];
  const firstRowNumber = (page - 1) * tab.rows.length;
  const currentLeaderboardRow = isKol
    ? KOL_LEADERBOARD.find((row) => row.current)
    : null;

  return (
    <section
      className={`flex flex-col gap-5 ${
        isKol ? "rounded-lg border border-[#242424] p-5" : ""
      }`}
    >
      {isKol ? (
        <header className="flex items-start justify-between gap-4 max-tablet:flex-col">
          <div>
            <h2 className="text-2xl font-semibold leading-[1.2] text-white">
              Gautam Community Leaderboard
            </h2>
            <p className="mt-1.5 text-sm leading-[1.4] text-[#bfbfbf]">
              See where you rank in Gautam’s trading community.
            </p>
          </div>
          <div className="flex min-w-[190px] items-center gap-3 rounded-xl border border-[#514000] bg-[#171300] px-3.5 py-3 max-tablet:w-full">
            <strong className="flex size-12 shrink-0 items-center justify-center rounded-full border border-[#705600] bg-[#211a00] text-xl font-semibold leading-none text-[#f2b500]">
              {KOL_REWARD_STATS.leaderboardRank}
            </strong>
            <div>
              <p className="text-xs text-[#bfbfbf]">Your community rank</p>
              {currentLeaderboardRow?.movement?.startsWith("+") ? (
                <p className="mt-1 flex items-center gap-1 text-xs font-medium text-[#52e5c4]">
                  <TrendingUp className="size-3.5" strokeWidth={2} aria-hidden />
                  You’re up {currentLeaderboardRow.movement.slice(1)} places
                </p>
              ) : null}
            </div>
          </div>
        </header>
      ) : null}

      <div
        role="tablist"
        aria-label={isKol ? "Gautam community activity" : "Referral activity"}
        className="flex gap-5 overflow-x-auto border-b border-[#242424]"
      >
        {tabs.map((t) => {
          const active = t.id === tab.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => {
                setTabId(t.id);
                setPage(1);
              }}
              className={`shrink-0 border-b-[3px] px-2 py-3 text-sm leading-[1.2] transition-colors ${
                active
                  ? "border-[#f2b500] font-semibold text-white"
                  : "border-transparent text-[#bfbfbf] hover:text-white"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Desktop: the artboard's table. */}
      <div className="overflow-hidden rounded-xl border border-[#242424] bg-black max-tablet:hidden">
        <table className="w-full table-fixed border-collapse">
          <thead>
            <tr className="border-b border-[#242424] bg-[#121212]">
              <th className="w-20 p-3 text-center text-[10px] font-normal leading-[1.2] text-[#bfbfbf]">
                {tab.id === "leaderboard" ? "Rank" : "No."}
              </th>
              {tab.columns.map((c) => (
                <th
                  key={c.key}
                  className="p-3 text-center text-[10px] font-normal leading-[1.2] text-[#bfbfbf]"
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tab.rows.map((row, i) => (
              <tr
                key={row.id}
                className={`border-b border-[#242424] last:border-b-0 ${
                  row.current ? "bg-[#f2b500]/10" : ""
                }`}
              >
                <td className="p-3 text-center text-xs leading-[1.2] text-white">
                  <span
                    className={`inline-flex size-7 items-center justify-center rounded-full ${
                      row.current
                        ? "border border-[#705600] bg-[#211a00] font-semibold text-[#f2b500]"
                        : ""
                    }`}
                  >
                    {firstRowNumber + i + 1}
                  </span>
                </td>
                {tab.columns.map((c) => (
                  <td
                    key={c.key}
                    className="p-3 text-center text-xs leading-[1.2] text-white"
                  >
                    {isKol && c.key === "movement"
                      ? formatRankChange(row[c.key])
                      : row[c.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: same rows, stacked — a five-column table does not fit 402px. */}
      <ul className="flex flex-col gap-2 tablet:hidden">
        {tab.rows.map((row, i) => (
          <li
            key={row.id}
            className={`rounded-lg border px-3.5 py-3 ${
              row.current
                ? "border-[#f2b500] bg-[#f2b500]/10"
                : "border-[#242424] bg-[#0f0f0f]"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-white">
                {tab.columns[0] ? row[tab.columns[0].key] : null}
              </span>
              <span className="text-[10px] text-[#757575]">
                #{firstRowNumber + i + 1}
              </span>
            </div>
            <dl className="mt-2 flex flex-col gap-1.5">
              {tab.columns.slice(1).map((c) => (
                <div key={c.key} className="flex items-center justify-between gap-3">
                  <dt className="text-[10px] leading-[1.2] text-[#757575]">{c.label}</dt>
                  <dd className="text-xs leading-[1.2] text-white">
                    {isKol && c.key === "movement"
                      ? formatRankChange(row[c.key])
                      : row[c.key]}
                  </dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs leading-[1.2] text-white">
          {isKol
            ? `${tab.rows.length} ${tab.id === "claim-history" ? "claims" : "traders"}`
            : `Showing Page ${page} of ${totalPages}`}
        </p>
        <div className="flex items-center gap-2">
          <PagerButton
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="size-4 shrink-0" strokeWidth={2} aria-hidden />
            Previous
          </PagerButton>
          <PagerButton
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
            <ChevronRight className="size-4 shrink-0" strokeWidth={2} aria-hidden />
          </PagerButton>
        </div>
      </div>
    </section>
  );
}

function PagerButton({ onClick, disabled, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-[29px] items-center justify-center gap-1.5 rounded-md border border-[#242424] px-3 text-sm font-medium leading-[1.2] text-white transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:text-[#575757] disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}
