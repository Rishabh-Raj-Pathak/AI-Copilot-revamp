import React, { useMemo, useState } from "react";
import { clsx } from "clsx";
import { Check, ChevronDown, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  LEG_STRUCTURES,
  TOKEN_FILTERS,
  THEME_ICONS,
  filterTokens,
  type LegStructure,
  type ThemeOption,
  type TokenFilter,
  type TokenOption,
} from "../utils/markets";

type TokenPickerVariant = "default" | "v2";

interface TokenPickerProps {
  value: TokenOption;
  onChange: (token: TokenOption) => void;
  disabled?: boolean;
  variant?: TokenPickerVariant;
  className?: string;
  /**
   * Leg structure is picker-local by default. Pass both to lift it into the
   * builder's market state once execution needs to branch on it.
   */
  structure?: LegStructure;
  onStructureChange?: (structure: LegStructure) => void;
}

/**
 * The pair selector. A plain dropdown stopped scaling once the catalog covered stocks,
 * commodities and FX alongside crypto, so search and the category filters live inside
 * the panel — the same categories offered on the Categories tab, so the two market
 * modes stay one mental model.
 *
 * Leg structure sits above both because it cuts the catalog hardest. Spot <> Perp
 * needs a real spot book on the long side, which the synthetic markets — stocks,
 * commodities, FX — do not have, so the categories stop being a useful way to narrow
 * and are hidden entirely in that mode.
 */
export function TokenPicker({
  value,
  onChange,
  disabled = false,
  variant = "default",
  className,
  structure: structureProp,
  onStructureChange,
}: TokenPickerProps) {
  const isV2 = variant === "v2";
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<TokenFilter>("Top Picks");
  const [structureState, setStructureState] =
    useState<LegStructure>("Perp <> Perp");

  const structure = structureProp ?? structureState;
  const showCategories = structure === "Perp <> Perp";

  const setStructure = (next: LegStructure) => {
    setStructureState(next);
    onStructureChange?.(next);
    // Spot <> Perp hides the chips, so a category picked in the other mode would
    // silently strand the list with no visible control to clear it.
    if (next === "Spot <> Perp") setFilter("All Tokens");
  };

  const results = useMemo(
    () => filterTokens(query, filter, structure),
    [query, filter, structure],
  );

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        // Each visit starts from the default view rather than the last search.
        if (!next) setQuery("");
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          aria-label="Select market pair"
          className={clsx(
            "flex h-[48px] items-center justify-between gap-2 rounded-[10px] border px-3 text-left shadow-[inset_0_2px_6px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:-outline-offset-1",
            isV2
              ? "border-[#2a2a2a] bg-[#0d0d0d] text-[#E8E2D2] hover:bg-[#141414] focus-visible:outline-[#c9a962]"
              : "border-[rgba(255,255,255,0.09)] bg-[linear-gradient(180deg,rgba(19,19,21,0.96)_0%,rgba(11,11,13,0.98)_100%)] text-[#f5f5f5] hover:bg-[linear-gradient(180deg,rgba(25,25,28,0.98)_0%,rgba(12,12,15,0.99)_100%)] focus-visible:outline-[#d6b06a]",
            disabled && "cursor-not-allowed opacity-50",
            className,
          )}
        >
          <span className="truncate font-['Onest',sans-serif] text-[14px]">
            {value}
          </span>
          <span className="flex shrink-0 items-center gap-2">
            {/* Which book the pair trades on. Only worth saying here — inside the
                panel the toggle is already on screen. */}
            <span
              className={clsx(
                "font-['Onest',sans-serif] text-[10px] uppercase leading-none tracking-[0.7px]",
                isV2 ? "text-[#888888]" : "text-[#7d7e88]",
              )}
            >
              {structure}
            </span>
            <ChevronDown
              className={clsx(
                "h-3.5 w-3.5 transition-transform duration-150",
                isV2 ? "text-[#d4af37]/80" : "text-[rgba(227,202,157,0.76)]",
                open && "rotate-180",
              )}
              aria-hidden
            />
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={8}
        className={clsx(
          "z-[130] w-[380px] max-w-[calc(100vw-24px)] p-0",
          isV2
            ? "border-[#3d3428] bg-[#0d0d0d]"
            : "border-[rgba(146,111,56,0.55)] bg-[linear-gradient(180deg,rgba(16,15,13,0.99)_0%,rgba(9,9,10,0.99)_100%)]",
        )}
      >
        {/* Leg structure — the widest cut, so it leads the panel. */}
        <div className="px-2.5 pt-2.5">
          <div
            role="group"
            aria-label="Leg structure"
            className={clsx(
              "grid grid-cols-2 gap-1 rounded-[10px] border p-1 shadow-[inset_0_2px_8px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.03)]",
              isV2
                ? "border-[#2a2a2a] bg-[#0a0a0a]"
                : "border-[rgba(255,255,255,0.09)] bg-[rgba(10,10,11,0.94)]",
            )}
          >
            {LEG_STRUCTURES.map((option) => {
              const active = structure === option;
              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setStructure(option)}
                  className={clsx(
                    "h-[34px] rounded-[8px] font-['Onest',sans-serif] text-[13px] font-medium tracking-[0.3px] transition-all focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-1",
                    active
                      ? isV2
                        ? "border border-[#c9a962] bg-[#141414] text-[#c9a962] focus-visible:outline-[#c9a962]"
                        : "border border-[rgba(214,176,106,0.62)] bg-[linear-gradient(180deg,rgba(73,56,31,0.92)_0%,rgba(35,28,19,0.95)_100%)] text-[#f0ddb9] shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] focus-visible:outline-[#d6b06a]"
                      : isV2
                        ? "border border-transparent text-[#888888] hover:bg-[#141414] hover:text-[#c4c4c4] focus-visible:outline-[#c9a962]"
                        : "border border-transparent text-[#7f8090] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#cfcfd8] focus-visible:outline-[#d6b06a]",
                  )}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search */}
        <div className="p-2.5">
          <div
            className={clsx(
              "flex h-[38px] items-center gap-2 rounded-[9px] border px-2.5",
              isV2
                ? "border-[#2a2a2a] bg-[#080808]"
                : "border-[rgba(255,255,255,0.08)] bg-[#080808]",
            )}
          >
            <Search className="h-3.5 w-3.5 shrink-0 text-[#7d7e88]" aria-hidden />
            <input
              type="text"
              value={query}
              autoFocus
              placeholder="Search tokens..."
              onChange={(e) => setQuery(e.target.value)}
              className="w-full min-w-0 border-none bg-transparent font-['Onest',sans-serif] text-[13px] text-[#f0f0f0] outline-none placeholder:text-[#6e6f7a]"
            />
          </div>
        </div>

        {/* Category filters — one chip per category, plus the unfiltered view. Only
            Perp <> Perp spans enough of the catalog for them to be worth showing. */}
        {showCategories && (
          <div className="flex flex-wrap gap-1.5 px-2.5 pb-2.5">
            {TOKEN_FILTERS.map((option) => {
              const active = filter === option;
              const Icon =
                option === "All Tokens"
                  ? undefined
                  : THEME_ICONS[option as ThemeOption];
              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFilter(option)}
                  className={clsx(
                    "inline-flex h-[28px] shrink-0 items-center gap-1.5 rounded-[8px] border px-2.5 font-['Onest',sans-serif] text-[11px] leading-none transition-colors",
                    active
                      ? isV2
                        ? "border-[#c9a962] bg-[#141414] text-[#c9a962]"
                        : "border-[rgba(214,176,106,0.62)] bg-[linear-gradient(180deg,rgba(73,56,31,0.92)_0%,rgba(35,28,19,0.95)_100%)] text-[#f0ddb9]"
                      : isV2
                        ? "border-[#2a2a2a] text-[#888888] hover:bg-[#141414] hover:text-[#c4c4c4]"
                        : "border-[rgba(255,255,255,0.08)] text-[#9a9ba8] hover:border-[rgba(214,176,106,0.22)] hover:bg-[rgba(120,90,40,0.14)] hover:text-[#f1dfbf]",
                  )}
                >
                  {Icon && <Icon className="h-3 w-3 shrink-0" aria-hidden />}
                  {option}
                </button>
              );
            })}
          </div>
        )}

        <div
          className={clsx(
            "border-t",
            isV2 ? "border-[#1f1f1f]" : "border-[rgba(255,255,255,0.07)]",
          )}
        />

        {/* Results */}
        <div className="max-h-[216px] overflow-y-auto p-1.5" role="listbox">
          {results.length === 0 ? (
            <p className="px-2.5 py-4 text-center font-['Onest',sans-serif] text-[12px] leading-relaxed text-[#7d7e88]">
              {query.trim() === ""
                ? `No ${filter === "All Tokens" ? "" : `${filter} `}markets support ${structure}.`
                : `No ${structure} markets match “${query}”.`}
            </p>
          ) : (
            results.map((token) => {
              const selected = token.value === value;
              return (
                <button
                  key={token.value}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    onChange(token.value);
                    setOpen(false);
                  }}
                  className={clsx(
                    "flex h-[36px] w-full items-center justify-between gap-2 rounded-[8px] border px-2.5 font-['Onest',sans-serif] text-[14px] transition-colors",
                    selected
                      ? isV2
                        ? "border-[#c9a962] bg-[#1a1a1a] text-[#f0ddb9]"
                        : "border-[rgba(214,176,106,0.5)] bg-[rgba(120,90,40,0.22)] text-[#f6e5c8]"
                      : isV2
                        ? "border-transparent text-[#E8E2D2] hover:bg-[#161616]"
                        : "border-transparent text-[#d8d9e3] hover:bg-[rgba(120,90,40,0.16)] hover:text-[#f1dfbf]",
                  )}
                >
                  <span className="truncate">{token.value}</span>
                  {selected && (
                    <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} aria-hidden />
                  )}
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
