import React, { useEffect, useState } from "react";
import { clsx } from "clsx";
import { Check, Copy } from "lucide-react";
import { formatWalletAddress } from "../utils/wallet";

type VaultLegChipProps = {
  /** The venue this leg runs on -- the thing the address belongs to. */
  venue: string;
  address: string;
  /** v2 runs a flatter, colder palette than the default gradient card. */
  isV2?: boolean;
  className?: string;
};

/*
 * One leg of a delta-neutral vault: the venue and the wallet it trades from, in a
 * single chip.
 *
 * The two used to be separate stacked rows -- "Hyperliquid <-> Pacifica" above
 * "0x7a3f...9f2e <-> 0x4d5e...c3a6" -- which repeated the same arrow twice and left
 * the reader to match first-with-first, second-with-second by position alone. Pairing
 * them inside one chip states the relationship the data actually has, and collapses
 * two ragged lines into one row.
 *
 * The chip is a button because a truncated address is useless as text: the only thing
 * anyone wants from it is the full string. Clicking copies it; the label swaps to a
 * check for a beat so the copy is acknowledged where it happened rather than in a
 * toast somewhere else on the screen.
 */
export function VaultLegChip({
  venue,
  address,
  isV2 = false,
  className,
}: VaultLegChipProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 1400);
    return () => window.clearTimeout(id);
  }, [copied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
    } catch {
      /* Clipboard blocked (insecure origin, denied permission) -- the title
         attribute still carries the full address for manual selection. */
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={address}
      aria-label={
        copied ? `${venue} wallet address copied` : `Copy ${venue} wallet address`
      }
      className={clsx(
        "group inline-flex h-[24px] max-w-full shrink-0 items-center gap-1.5 rounded-[7px] border px-2 transition-colors focus-visible:outline-none focus-visible:ring-1",
        isV2
          ? "border-[#1f1f1f] bg-[#080808] hover:border-[#c9a962]/45 focus-visible:ring-[#c9a962]/40"
          : "border-[rgba(255,255,255,0.09)] bg-[rgba(255,255,255,0.02)] hover:border-[rgba(176,132,65,0.5)] focus-visible:ring-[rgba(204,177,127,0.45)]",
        className,
      )}
    >
      <span
        className={clsx(
          "truncate text-[11px] leading-none transition-colors",
          isV2
            ? "text-[#a8a8a8] group-hover:text-[#E8D5A1]"
            : "text-[#b4b5c2] group-hover:text-[#e8d5b5]",
        )}
      >
        {venue}
      </span>

      {/* Hairline rather than a dot: the venue and the wallet are one fact split in
          two, not two items in a list. */}
      <span
        aria-hidden
        className={clsx(
          "hidden h-[11px] w-px shrink-0 tablet:block",
          isV2 ? "bg-[#262626]" : "bg-[rgba(255,255,255,0.12)]",
        )}
      />

      <span
        className={clsx(
          "hidden font-['Consolas',monospace] text-[10px] leading-none tracking-[0.15px] transition-colors tablet:inline",
          isV2
            ? "text-[#6d6d6d] group-hover:text-[#999999]"
            : "text-[#7f8091] group-hover:text-[#b4b5c2]",
        )}
      >
        {formatWalletAddress(address)}
      </span>

      {/*
        Reserved space, not a layout shift: the icon is always laid out and only
        fades in, so hovering a chip does not nudge the one beside it.

        It stays visible on mobile, where the address itself is hidden and there is no
        hover to reveal anything: without it the chip would be a box that copies
        something you cannot see, on a tap that looked like it did nothing.
      */}
      <span
        aria-hidden
        className={clsx(
          "inline-flex size-3 shrink-0 items-center justify-center transition-opacity",
          copied
            ? "opacity-100"
            : "opacity-60 tablet:opacity-0 tablet:group-hover:opacity-100",
        )}
      >
        {copied ? (
          <Check
            className={clsx(
              "size-3",
              isV2 ? "text-[#c9a962]" : "text-[#ccb17f]",
            )}
            strokeWidth={2.5}
          />
        ) : (
          <Copy
            className={clsx("size-3", isV2 ? "text-[#6d6d6d]" : "text-[#7f8091]")}
            strokeWidth={2}
          />
        )}
      </span>
    </button>
  );
}
