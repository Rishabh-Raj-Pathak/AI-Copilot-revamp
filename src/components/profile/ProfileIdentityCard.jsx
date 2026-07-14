import { useEffect, useRef, useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import { copyText } from "../../lib/clipboard.js";
import {
  WALLET_CHAIN,
  addressExplorerUrl,
  truncateAddress,
} from "../../lib/wallet.js";
import ProfileAvatar from "./ProfileAvatar.jsx";
import ProfileProgressRing from "./ProfileProgressRing.jsx";
import { TelegramGlyph, XGlyph } from "./SocialGlyphs.jsx";
import { useProfile } from "./ProfileContext.jsx";

const COPY_FEEDBACK_MS = 2000;

/**
 * Who you are, how far along, and the wallet behind it — one card.
 *
 * Identity above the hairline, wallet credential below it. They were two cards
 * that between them rendered the same address three times; the address now
 * appears exactly once, in the strip that owns the actions on it. Desktop shows
 * it in full — this is the one page where you'd want to read the whole thing —
 * and only mobile truncates.
 *
 * @param {object} props
 * @param {(message: string, variant?: 'success'|'error') => void} [props.onNotify]
 */
export default function ProfileIdentityCard({ onNotify }) {
  const { address, socials, social, progress } = useProfile();
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef(null);

  useEffect(() => () => window.clearTimeout(resetTimer.current), []);

  const handleCopy = async () => {
    const ok = await copyText(address);
    setCopied(ok);
    onNotify?.(
      ok ? "Wallet address copied" : "Couldn't copy address",
      ok ? "success" : "error",
    );
    window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setCopied(false), COPY_FEEDBACK_MS);
  };

  // Until a social is linked the address *is* the name, so it headlines.
  const displayName = social?.name ?? truncateAddress(address);

  return (
    /* Two clusters, edge to edge: who you are on the left, the wallet you are it
       *with* on the right. The card is as wide as the page, and on a wide desktop
       all of that slack falls between the clusters — never inside one, which is
       what strands a score a foot from the name it belongs to, or a copy button a
       foot from the address it copies. */
    <section className="rounded-xl border border-[#242424] bg-[#0f0f0f] p-4 sm:p-5 xl:flex xl:items-center xl:gap-8">
      <div className="flex items-center gap-3 sm:gap-4 xl:min-w-0">
        <ProfileProgressRing
          percent={progress.percent}
          size={68}
          strokeWidth={2.5}
          className="max-sm:size-[60px]"
        >
          <ProfileAvatar
            name={social?.name}
            handle={social?.handle}
            seed={address}
            size="lg"
            className="max-sm:size-12 max-sm:text-base"
          />
        </ProfileProgressRing>

        {/* Capped on desktop: past ~15rem a display name is stealing width from
            the address, not earning it. */}
        <div className="flex min-w-0 flex-1 flex-col gap-1 xl:max-w-60">
          <h2 className="truncate text-base font-semibold text-white sm:text-lg">
            {displayName}
          </h2>
          {social ? (
            /* One glyph per linked account, then the handle they're known by. */
            <span className="flex items-center gap-1.5 text-sm text-[#929292]">
              {socials.x ? <XGlyph className="size-3 shrink-0" /> : null}
              {socials.telegram ? (
                <TelegramGlyph className="size-3.5 shrink-0" />
              ) : null}
              <span className="truncate">{social.handle}</span>
            </span>
          ) : (
            /* Wraps rather than truncates — it's a sentence, not an identifier. */
            <span className="text-sm leading-snug text-[#757575]">
              No account linked yet
            </span>
          )}
        </div>

        {/* Its own cell once there's room for the hairline: the score reads as a
            stat the card reports, not as something that drifted off the name. */}
        <div className="flex shrink-0 flex-col items-end gap-0.5 xl:items-start xl:border-l xl:border-[#242424] xl:pl-5">
          <span className="bg-linear-to-r from-[#f7bb08] to-[#2fffce] bg-clip-text text-xl font-semibold tabular-nums text-transparent sm:text-2xl">
            {progress.points}
          </span>
          {/* `pts` at 320px: the 15px it saves is what keeps an unlinked profile's
              headline (a truncated address) from truncating a second time. */}
          <span className="whitespace-nowrap text-[11px] text-[#757575] sm:text-xs">
            of {progress.pointsTotal}
            <span className="sm:hidden"> pts</span>
            <span className="hidden sm:inline"> points</span>
          </span>
        </div>
      </div>

      {/* Stacked under a hairline until there's room; then it lifts onto the row
          and sits against the right edge, actions last — the same edge the
          checklist's chevrons hold, one card down. */}
      <div className="mt-4 flex flex-wrap items-center gap-x-2.5 gap-y-2 border-t border-[#242424] pt-3.5 xl:mt-0 xl:ml-auto xl:min-w-0 xl:border-t-0 xl:pt-0">
        {/* Dropped on mobile: a `0x…` in mono next to a chain badge needs no caption,
            and its 46px is the difference between one line and two. */}
        <span className="hidden text-[10px] font-medium uppercase tracking-wide text-[#757575] sm:inline">
          Wallet
        </span>

        {/* Full address at `md`, not `sm`: at 640px it and the explorer label
            together push the action group onto a second line. */}
        <span className="min-w-0 font-mono text-sm text-white">
          <span className="hidden md:inline">{address}</span>
          <span className="md:hidden">{truncateAddress(address)}</span>
        </span>

        <span className="shrink-0 rounded-full border border-[#454545] px-2 py-0.5 text-xs text-[#bfbfbf] sm:px-2.5">
          {WALLET_CHAIN.label}
        </span>

        <div className="ml-auto flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copy wallet address"
            title="Copy wallet address"
            className="flex size-8 items-center justify-center rounded-md text-[#bfbfbf] transition-colors hover:bg-white/5 hover:text-white"
          >
            {copied ? (
              <Check className="size-4 text-[#00f3b6]" strokeWidth={2} aria-hidden />
            ) : (
              <Copy className="size-4" strokeWidth={2} aria-hidden />
            )}
          </button>

          <a
            href={addressExplorerUrl(address)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`View on ${WALLET_CHAIN.explorerName}`}
            className="flex size-8 items-center justify-center rounded-md text-xs font-medium text-[#bfbfbf] transition-colors hover:bg-white/5 hover:text-white md:size-auto md:gap-1.5 md:px-2 md:py-1.5"
          >
            <span className="hidden md:inline">
              View on {WALLET_CHAIN.explorerName}
            </span>
            <ExternalLink className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
          </a>
        </div>
      </div>
    </section>
  );
}
