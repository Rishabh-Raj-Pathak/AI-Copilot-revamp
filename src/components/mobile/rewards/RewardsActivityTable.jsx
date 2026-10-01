import { useState } from "react";
import AppIcon from "../AppIcon.jsx";
import { appIcons } from "../mobileAssets.js";
import {
  CLAIM_HISTORY,
  KOL_CLAIM_HISTORY,
  KOL_LEADERBOARD,
  KOL_TOTAL_PAGES,
  REFERRED_USERS,
  TOTAL_PAGES,
} from "../../rewards/rewardsMockData.js";
import { COLUMN_FLEX, PHONE_TABLE_COLUMNS } from "./rewardsPhone.js";

/**
 * Figma "Referred Users" (955:5153): underline tabs, a four-column table and
 * the pager. Signed out the table body is the artboard's empty state — one
 * gradient "Connect Wallet →" — and the pager reads `1 of 1`, both dimmed.
 */
const STANDARD_TABS = [
  { id: "referred-users", label: "Referred Users", rows: REFERRED_USERS, numberLabel: "No." },
  { id: "claim-history", label: "Claim History", rows: CLAIM_HISTORY, numberLabel: "No." },
];

const KOL_TABS = [
  { id: "leaderboard", label: "Leaderboard", rows: KOL_LEADERBOARD, numberLabel: "Rank" },
  { id: "kol-claims", label: "Your claims", rows: KOL_CLAIM_HISTORY, numberLabel: "No." },
];

const CELL = "flex min-w-0 items-center pl-1.5 pr-1";

export default function RewardsActivityTable({ variant, connected, onConnect }) {
  const isKol = variant === "kol";
  const tabs = isKol ? KOL_TABS : STANDARD_TABS;
  const [tabId, setTabId] = useState(tabs[0].id);
  const [page, setPage] = useState(1);
  const tab = tabs.find((item) => item.id === tabId) ?? tabs[0];
  const columns = PHONE_TABLE_COLUMNS[tab.id];
  const totalPages = connected ? (isKol ? KOL_TOTAL_PAGES : TOTAL_PAGES) : 1;
  const firstRow = (page - 1) * tab.rows.length;
  const pagerLabel =
    isKol && connected
      ? `${tab.rows.length} ${tab.id === "kol-claims" ? "claims" : "traders"}`
      : `Showing Page ${page} of ${totalPages}`;

  return (
    <section className="flex flex-col gap-3">
      <div
        role="tablist"
        aria-label={isKol ? "Gautam community activity" : "Referral activity"}
        className="flex items-start gap-2.5 border-b border-app-line"
      >
        {tabs.map((item) => {
          const active = item.id === tab.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => {
                setTabId(item.id);
                setPage(1);
              }}
              className={`app-pressable shrink-0 border-b-[3px] px-2 py-[13px] text-app-body leading-[16.8px] ${
                active ? "border-ink font-bold text-ink" : "border-transparent font-normal text-ink-muted"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col overflow-hidden rounded-xl border border-app-line" role="table">
        <div className="flex border-b border-app-line bg-app-subtle" role="row">
          {[tab.numberLabel, ...columns.map((c) => c.label)].map((label, i) => (
            <div
              key={label}
              role="columnheader"
              className={`${CELL} py-[13px]`}
              style={{ flex: COLUMN_FLEX[i] }}
            >
              <span className="truncate text-app-caption font-medium leading-[14.4px] text-ink-muted">
                {label}
              </span>
            </div>
          ))}
        </div>

        {connected ? (
          tab.rows.map((row, i) => (
            <div
              key={row.id}
              role="row"
              className={`flex border-b border-app-line last:border-b-0 ${
                row.current ? "bg-app-accent/10" : ""
              }`}
            >
              <div role="cell" className={`${CELL} py-3.5`} style={{ flex: COLUMN_FLEX[0] }}>
                <span
                  className={`text-app-caption leading-[14.4px] ${
                    row.current ? "font-semibold text-app-accent" : "text-ink"
                  }`}
                >
                  {firstRow + i + 1}
                </span>
              </div>
              {columns.map((column, c) => (
                <div
                  key={column.key}
                  role="cell"
                  className={`${CELL} py-3.5`}
                  style={{ flex: COLUMN_FLEX[c + 1] }}
                >
                  <span className="truncate text-app-caption leading-[14.4px] text-ink">
                    {row[column.key]}
                  </span>
                </div>
              ))}
            </div>
          ))
        ) : (
          <div className="flex h-[261px] items-center justify-center px-4">
            <button
              type="button"
              onClick={onConnect}
              className="app-pressable app-gradient-brand flex h-12 w-full items-center justify-center gap-2 rounded-lg text-base font-medium leading-5 text-black"
            >
              Connect Wallet
              <AppIcon src={appIcons.arrowRight20} size={20} />
            </button>
          </div>
        )}
      </div>

      <div className="flex w-full items-center gap-2">
        {/* The artboard's 16px fits "Showing Page 1 of 1"; longer page counts
            step down to 14px rather than wrap beside the two buttons. */}
        <p
          className={`min-w-0 flex-1 whitespace-nowrap leading-[21px] text-ink ${
            pagerLabel.length > 19 ? "text-app-body" : "text-base"
          }`}
        >
          {pagerLabel}
        </p>
        <PagerButton
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
          label="Previous"
        >
          <AppIcon src={appIcons.chevronLeft16} size={16} />
          Previous
        </PagerButton>
        <PagerButton
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
          label="Next"
        >
          Next
          <AppIcon src={appIcons.chevronRight16} size={16} />
        </PagerButton>
      </div>
    </section>
  );
}

function PagerButton({ onClick, disabled, label, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="app-pressable flex shrink-0 items-center gap-1.5 rounded-md border border-app-line bg-app-bg px-3 py-1.5 text-app-body font-medium leading-[17px] text-ink disabled:opacity-35"
    >
      {children}
    </button>
  );
}
