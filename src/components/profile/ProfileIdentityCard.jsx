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
    <section className="rounded-xl border border-[#242424] bg-[#0f0f0f] p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-4">
        <ProfileProgressRing percent={progress.percent} size={68} strokeWidth={2.5}>
          <ProfileAvatar
            name={social?.name}
            handle={social?.handle}
            seed={address}
            size="lg"
          />
        </ProfileProgressRing>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h2 className="truncate text-lg font-semibold text-white">
            {displayName}
          </h2>
          {social ? (
            /* One glyph per linked account, then the handle they're known by. */
            <span className="flex items-center gap-1.5 text-sm text-[#929292]">
              {socials.x ? <XGlyph className="size-3" /> : null}
              {socials.telegram ? <TelegramGlyph className="size-3.5" /> : null}
              <span className="truncate">{social.handle}</span>
            </span>
          ) : (
            <span className="text-sm text-[#757575]">No account linked yet</span>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-0.5">
          <span className="bg-linear-to-r from-[#f7bb08] to-[#2fffce] bg-clip-text text-xl font-semibold text-transparent">
            {progress.points}
          </span>
          <span className="text-xs text-[#757575]">
            of {progress.pointsTotal} points
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-2.5 gap-y-2 border-t border-[#242424] pt-3.5">
        <span className="text-[10px] font-medium uppercase tracking-wide text-[#757575]">
          Wallet
        </span>

        <span className="font-mono text-sm text-white">
          <span className="hidden sm:inline">{address}</span>
          <span className="sm:hidden">{truncateAddress(address)}</span>
        </span>

        <span className="shrink-0 rounded-full border border-[#454545] px-2.5 py-0.5 text-xs text-[#bfbfbf]">
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
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-[#bfbfbf] transition-colors hover:bg-white/5 hover:text-white"
          >
            <span className="hidden sm:inline">
              View on {WALLET_CHAIN.explorerName}
            </span>
            <ExternalLink className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
          </a>
        </div>
      </div>
    </section>
  );
}
