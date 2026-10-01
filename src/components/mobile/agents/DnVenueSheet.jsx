import AppIcon from "../AppIcon.jsx";
import BottomSheet from "../BottomSheet.jsx";
import { appIcons } from "../mobileAssets.js";
import { DN_VENUE_CHAINS, DN_VENUE_LOGOS } from "./agentsTheme.js";

/**
 * Venue picker for one Delta Neutral leg — the phone replacement for the
 * desktop Select inside "Venue Select" (951:4092).
 *
 * The venue the other leg already holds stays listed but disabled: a vault
 * needs two different venues, and hiding it would make the list shift between
 * the two pickers.
 */
export default function DnVenueSheet({
  open,
  onClose,
  title,
  options,
  value,
  excluded,
  isConnected,
  onSelect,
}) {
  return (
    <BottomSheet open={open} onClose={onClose} title={title}>
      <ul className="flex flex-col gap-1 px-4 pt-2" role="listbox" aria-label={title}>
        {options.map((dex) => {
          const selected = dex === value;
          const blocked = dex === excluded;
          const logo = DN_VENUE_LOGOS[dex];
          const chain = DN_VENUE_CHAINS[dex];
          const connected = isConnected(dex);
          return (
            <li key={dex}>
              <button
                type="button"
                role="option"
                aria-selected={selected}
                aria-disabled={blocked}
                disabled={blocked}
                onClick={() => {
                  onSelect(dex);
                  onClose();
                }}
                className={`flex h-[53px] w-full items-center gap-2.5 rounded-xl px-3 text-left transition-colors active:bg-white/[0.05] disabled:opacity-40 ${
                  selected ? "bg-[rgba(120,90,40,0.2)]" : ""
                }`}
              >
                <span className="flex size-[30px] shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-app-raised">
                  {logo ? (
                    <img alt="" src={logo} className="max-h-[18px] max-w-[18px] object-contain" />
                  ) : (
                    <span className="text-app-caption font-medium text-[#e8d5b5]">{dex.slice(0, 1)}</span>
                  )}
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="flex items-center gap-2">
                    <span
                      className={`truncate text-app-body font-medium ${
                        selected ? "text-[#f0ddb9]" : "text-ink"
                      }`}
                    >
                      {dex}
                    </span>
                    {chain ? (
                      <span className="shrink-0 rounded-[4px] bg-[rgba(120,80,40,0.3)] px-1.5 py-0.5 text-[9px] font-medium uppercase leading-[10px] tracking-[0.5px] text-[#d4a76a]">
                        {chain}
                      </span>
                    ) : null}
                  </span>
                  <span className="flex items-center gap-1.5 text-app-caption text-ink-subtle">
                    <span
                      className={`size-1.5 shrink-0 rounded-full ${connected ? "bg-[#4ade80]" : "bg-[#6b7280]"}`}
                      aria-hidden
                    />
                    {blocked ? "Used by the other leg" : connected ? "Connected" : "Not connected"}
                  </span>
                </span>
                {selected ? (
                  <AppIcon src={appIcons.check12} size={12} className="text-[#f0ddb9]" />
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </BottomSheet>
  );
}
