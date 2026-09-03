import { useEffect, useRef, useState } from "react";
import { Check, Copy, ExternalLink, Loader2 } from "lucide-react";
import { copyText } from "../../lib/clipboard.js";
import {
  WALLET_CHAIN,
  addressExplorerUrl,
  truncateAddress,
} from "../../lib/wallet.js";
import ProfileAvatar from "./ProfileAvatar.jsx";
import { XGlyph } from "./SocialGlyphs.jsx";
import { startXAuthorization } from "./simulatedOAuth.js";
import { useProfile } from "./ProfileContext.jsx";

const COPY_FEEDBACK_MS = 2000;

/**
 * The other profile: wallet credential and X link, nothing else on it — no
 * ring, no checklist, no points. One card, two labeled sections, same shape
 * as `ConnectionsCard`'s hairline-divided rows so it doesn't invent a new
 * pattern for a page that already has one.
 *
 * X still connects for real (same simulated OAuth `ConnectSocialStep` uses)
 * so the card isn't a static mock of a state the user hasn't reached — it
 * just never mentions what the link is worth.
 *
 * @param {object} props
 * @param {(message: string, variant?: 'success'|'error') => void} [props.onNotify]
 */
export default function ProfileSimpleCard({ onNotify }) {
  const { address, socials, connectSocial } = useProfile();
  const [copied, setCopied] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const copyTimer = useRef(null);
  const cancelRef = useRef(null);

  useEffect(
    () => () => {
      window.clearTimeout(copyTimer.current);
      cancelRef.current?.();
    },
    [],
  );

  const handleCopy = async () => {
    const ok = await copyText(address);
    setCopied(ok);
    onNotify?.(
      ok ? "Wallet address copied" : "Couldn't copy address",
      ok ? "success" : "error",
    );
    window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopied(false), COPY_FEEDBACK_MS);
  };

  const handleConnectX = () => {
    if (connecting) return;
    setConnecting(true);
    cancelRef.current = startXAuthorization((account) => {
      cancelRef.current = null;
      setConnecting(false);
      connectSocial(account);
      onNotify?.(`X connected as ${account.handle}`, "success");
    });
  };

  const x = socials.x;
  const xProfileUrl = x ? `https://x.com/${x.handle.replace(/^@/, "")}` : null;

  return (
    <section className="overflow-hidden rounded-xl border border-[#242424] bg-[#0f0f0f]">
      {/* Wallet address */}
      <div className="p-4 sm:p-5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[#757575]">
          Wallet Address
        </p>

        <div className="mt-3 flex items-center gap-3">
          <ProfileAvatar seed={address} className="shrink-0" />

          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span className="truncate font-mono text-sm text-white">
              {truncateAddress(address)}
            </span>
            <span className="shrink-0 rounded-full border border-[#454545] px-2.5 py-0.5 text-xs text-[#bfbfbf]">
              {WALLET_CHAIN.label}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-1">
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
              className="flex size-8 items-center justify-center rounded-md text-xs font-medium text-[#bfbfbf] transition-colors hover:bg-white/5 hover:text-white md:w-auto md:gap-1.5 md:px-2"
            >
              <span className="hidden md:inline">
                View on {WALLET_CHAIN.explorerName}
              </span>
              <ExternalLink className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
            </a>
          </div>
        </div>
      </div>

      {/* X account */}
      <div className="border-t border-[#242424] p-4 sm:p-5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[#757575]">
          X Account
        </p>

        <div className="mt-3">
          {x ? (
            <div className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[#242424] bg-black text-white">
                <XGlyph className="size-4" />
              </span>

              <div className="flex min-w-0 flex-1 items-center gap-2">
                <span className="truncate text-sm font-medium text-white">
                  {x.handle}
                </span>
                <span className="flex shrink-0 items-center gap-1 rounded-full border border-[#1e5a3f] bg-[#0d2019] px-2.5 py-0.5 text-xs font-medium text-[#00f3b6]">
                  <Check className="size-3" strokeWidth={2.5} aria-hidden />
                  Connected
                </span>
              </div>

              <a
                href={xProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View on X"
                className="flex size-8 shrink-0 items-center justify-center rounded-md text-xs font-medium text-[#bfbfbf] transition-colors hover:bg-white/5 hover:text-white md:w-auto md:gap-1.5 md:px-2"
              >
                <span className="hidden md:inline">View on X</span>
                <ExternalLink className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
              </a>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleConnectX}
              disabled={connecting}
              className="flex w-full items-center gap-2.5 rounded-lg border border-[#242424] bg-black px-3 py-2 text-left transition-colors hover:border-[#454545] hover:bg-white/[0.03] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[#242424] bg-[#0f0f0f] text-white">
                <XGlyph className="size-4" />
              </span>
              <span className="flex-1 text-sm font-semibold text-white">
                {connecting ? "Authorizing on X…" : "Connect X"}
              </span>
              {connecting ? (
                <Loader2
                  className="size-4 shrink-0 animate-spin text-[#00f3b6]"
                  aria-hidden
                />
              ) : (
                <ExternalLink className="size-4 shrink-0 text-[#757575]" aria-hidden />
              )}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
