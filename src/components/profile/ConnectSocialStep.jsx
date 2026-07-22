import { useEffect, useRef, useState } from "react";
import { Check, Copy, ExternalLink, Loader2 } from "lucide-react";
import { copyText } from "../../lib/clipboard.js";
import { TelegramGlyph, XGlyph } from "./SocialGlyphs.jsx";
import { SOCIAL_POINTS } from "./profileSteps.js";
import {
  SOCIAL_PROVIDERS,
  X_HANDLE,
  createTelegramPairingCode,
  startTelegramPairing,
  startXAuthorization,
  telegramDeepLink,
} from "./simulatedOAuth.js";

const GLYPHS = {
  x: <XGlyph className="size-4" />,
  telegram: <TelegramGlyph className="size-[18px]" />,
};

/**
 * One provider's link, start to finish: the connect affordance, the flow while
 * it's in flight, and the settled row afterwards.
 *
 * Scoped to a single provider because Telegram and X are separate checklist
 * steps rather than one either/or choice — the component that used to offer both
 * side by side had a whole vocabulary (choice cards, an `or` divider, a dashed
 * "add the other one" row) that only existed to model a decision the checklist
 * no longer asks the user to make.
 *
 * Two states, not three. Both providers pay on the link itself, so the amber
 * "linked but not yet earning" row this component used to own is gone. The pitch
 * that used to hang under the X row — what a PnL card is — went with it: posting
 * the card is the other half of step three and renders directly beneath this row
 * the moment X settles, so advertising it here would sell the same thing twice.
 *
 * There is no unlink. A linked account is a fact the profile only ever adds to,
 * which is why the settled row has nothing to click.
 *
 * @param {object} props
 * @param {'x'|'telegram'} props.provider
 * @param {import('../../lib/profileSession.js').ProfileSocial|null} props.account
 * @param {(account: object) => void} props.onConnect
 * @param {(message: string, variant?: 'success'|'error') => void} [props.onNotify]
 */
export default function ConnectSocialStep({
  provider,
  account,
  onConnect,
  onNotify,
}) {
  const [pending, setPending] = useState(false);
  const [pairingCode, setPairingCode] = useState(null);
  const [codeCopied, setCodeCopied] = useState(false);
  const cancelRef = useRef(null);
  const copyTimer = useRef(null);

  // A cancelled or unmounted flow must not resolve into the store. StrictMode
  // double-invokes effects in dev, so every timer owns its teardown.
  useEffect(
    () => () => {
      cancelRef.current?.();
      window.clearTimeout(copyTimer.current);
    },
    [],
  );

  const settle = (linked) => {
    cancelRef.current = null;
    setPending(false);
    setPairingCode(null);
    onConnect(linked);
    onNotify?.(
      provider === "x"
        ? `Now following ${X_HANDLE} — +${SOCIAL_POINTS.x} pts earned`
        : `Telegram joined as ${linked.handle} — +${SOCIAL_POINTS.telegram} pts earned`,
      "success",
    );
  };

  const begin = () => {
    if (pending) return;
    setPending(true);
    if (provider === "x") {
      cancelRef.current = startXAuthorization(settle);
      return;
    }
    setPairingCode(createTelegramPairingCode());
    cancelRef.current = startTelegramPairing(settle);
  };

  const cancel = () => {
    cancelRef.current?.();
    cancelRef.current = null;
    setPending(false);
    setPairingCode(null);
  };

  const copyCode = async () => {
    const ok = await copyText(pairingCode);
    setCodeCopied(ok);
    if (!ok) onNotify?.("Couldn't copy the pairing code", "error");
    window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCodeCopied(false), 2000);
  };

  if (account) return <SettledRow provider={provider} account={account} />;

  // The pairing panel replaces the connect row rather than sitting under it —
  // there's only ever one thing to do here at a time.
  if (provider === "telegram" && pending) {
    return (
      <TelegramPairing
        code={pairingCode}
        onCancel={cancel}
        onCopyCode={copyCode}
        copied={codeCopied}
      />
    );
  }

  return <ConnectRow provider={provider} pending={pending} onClick={begin} />;
}

/**
 * The unlinked state. Solid border, not dashed — both providers are required
 * steps now, so neither row is ever an optional extra.
 */
function ConnectRow({ provider, pending, onClick }) {
  const meta = SOCIAL_PROVIDERS[provider];
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="flex w-full items-center gap-2.5 rounded-lg border border-[#242424] bg-black px-3 py-2 text-left transition-colors hover:border-[#454545] hover:bg-white/[0.03] disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-[#242424] bg-[#0f0f0f] text-white">
        {GLYPHS[provider]}
      </span>

      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-sm font-semibold text-white">
          {pending ? meta.pendingLabel : meta.connectLabel}
        </span>
        {/* One line on desktop keeps the row compact; on mobile that line is
            ~150px wide, so it wraps rather than ellipsing mid-sentence. */}
        <span className="text-xs leading-snug text-[#929292] max-sm:line-clamp-2 sm:truncate">
          {meta.benefit}
        </span>
      </span>

      {pending ? (
        <Loader2
          className="size-4 shrink-0 animate-spin text-[#00f3b6]"
          aria-hidden
        />
      ) : (
        <span className="shrink-0 text-xs font-semibold text-[#f2b500]">
          +{SOCIAL_POINTS[provider]}
        </span>
      )}
    </button>
  );
}

/**
 * Fully settled: linked *and* paid. Nothing to click — no unlink.
 *
 * No points here, deliberately. This row shows up twice on a finished profile —
 * inside the checklist step and again in the Connections card — and a `+75`
 * printed in both places next to the same `+75` in the ledger's column reads as
 * three separate credits rather than one. The ledger owns the arithmetic; this
 * row owns the account.
 */
function SettledRow({ provider, account }) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-[#1e5a3f] bg-[#0d2019] px-3 py-2">
      <span className="shrink-0 text-white">{GLYPHS[provider]}</span>
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-white">
        {account.handle}
      </span>
      <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-[#00f3b6]">
        <Check className="size-3.5" aria-hidden />
        {SOCIAL_PROVIDERS[provider].settledLabel}
      </span>
    </div>
  );
}

function TelegramPairing({ code, onCancel, onCopyCode, copied }) {
  return (
    <div className="flex flex-col gap-3.5 rounded-lg border border-[#242424] bg-black p-3.5 sm:p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-white">
        <TelegramGlyph className="size-[18px] shrink-0" />
        Join Telegram
      </div>

      <ol className="flex flex-col gap-2.5 text-xs text-[#bfbfbf]">
        <li className="flex items-start gap-2.5">
          <StepIndex>1</StepIndex>
          <span className="pt-0.5">
            Open the HyprEarn bot and tap{" "}
            <span className="font-semibold text-white">Start</span>.
          </span>
        </li>
        <li className="flex items-start gap-2.5">
          <StepIndex>2</StepIndex>
          <span className="pt-0.5">Send it this pairing code.</span>
        </li>
      </ol>

      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <div className="flex items-center justify-between gap-3 rounded-md border border-[#242424] bg-[#0f0f0f] px-3 py-2">
          <span className="font-mono text-sm tracking-[0.3em] text-white sm:text-base sm:tracking-[0.35em]">
            {code}
          </span>
          <button
            type="button"
            onClick={onCopyCode}
            aria-label="Copy pairing code"
            className="flex size-7 shrink-0 items-center justify-center rounded text-[#bfbfbf] transition-colors hover:bg-white/5 hover:text-white"
          >
            {copied ? (
              <Check className="size-4 text-[#00f3b6]" aria-hidden />
            ) : (
              <Copy className="size-4" aria-hidden />
            )}
          </button>
        </div>

        <a
          href={telegramDeepLink(code)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 rounded-md border border-[#242424] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/5"
        >
          Open bot
          <ExternalLink className="size-3.5" aria-hidden />
        </a>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-[#242424] pt-3">
        <span
          className="flex min-w-0 items-center gap-2 text-xs text-[#929292]"
          role="status"
        >
          <Loader2
            className="size-3.5 shrink-0 animate-spin text-[#00f3b6]"
            aria-hidden
          />
          Waiting for you to tap Start…
        </span>
        <button
          type="button"
          onClick={onCancel}
          className="ml-auto shrink-0 text-xs font-medium text-[#bfbfbf] transition-colors hover:text-white"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function StepIndex({ children }) {
  return (
    <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-[#242424] bg-[#0f0f0f] text-[10px] font-semibold text-[#bfbfbf]">
      {children}
    </span>
  );
}
