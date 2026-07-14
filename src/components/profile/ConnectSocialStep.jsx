import { useEffect, useRef, useState } from "react";
import { Check, Copy, ExternalLink, Loader2, Plus } from "lucide-react";
import { copyText } from "../../lib/clipboard.js";
import { TelegramGlyph, XGlyph } from "./SocialGlyphs.jsx";
import {
  SOCIAL_PROVIDERS,
  createTelegramPairingCode,
  startTelegramPairing,
  startXAuthorization,
  telegramDeepLink,
} from "./simulatedOAuth.js";

const CHOICE_CARD_CLASS =
  "group flex flex-1 flex-col gap-2 rounded-lg border border-[#242424] bg-black p-3.5 text-left transition-colors hover:border-[#454545] hover:bg-white/[0.03] disabled:cursor-not-allowed disabled:opacity-60";

/**
 * Telegram first — it's the one we'd rather a trader took, since alerts bring
 * them back. X still supplies the display name when both are linked; that's
 * `ProfileContext`'s business, not this list's.
 */
const PROVIDER_ORDER = ["telegram", "x"];

const GLYPHS = {
  x: <XGlyph className="size-4" />,
  telegram: <TelegramGlyph className="size-[18px]" />,
};

/**
 * Step two: link an account. One is enough to earn the step; the other stays on
 * offer afterwards because the two do different jobs — X shares setups, Telegram
 * pushes alerts — and a trader who wants both shouldn't have to trade one away.
 *
 * There is no unlink. A linked account is a fact the profile only ever adds to,
 * which is why the connected row has nothing to click.
 *
 * @param {object} props
 * @param {import('../../lib/profileSession.js').ProfileSocials} props.socials
 * @param {(account: object) => void} props.onConnect
 * @param {(message: string, variant?: 'success'|'error') => void} [props.onNotify]
 */
export default function ConnectSocialStep({ socials, onConnect, onNotify }) {
  /** `null` | `'x'` | `'telegram'` — which connect is mid-flight. */
  const [pending, setPending] = useState(null);
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

  const settle = (account) => {
    cancelRef.current = null;
    setPending(null);
    setPairingCode(null);
    onConnect(account);
    onNotify?.(
      `${SOCIAL_PROVIDERS[account.provider].name} linked as ${account.handle}`,
      "success",
    );
  };

  const begin = {
    x: () => {
      if (pending) return;
      setPending("x");
      cancelRef.current = startXAuthorization(settle);
    },
    telegram: () => {
      if (pending) return;
      setPending("telegram");
      setPairingCode(createTelegramPairingCode());
      cancelRef.current = startTelegramPairing(settle);
    },
  };

  const cancel = () => {
    cancelRef.current?.();
    cancelRef.current = null;
    setPending(null);
    setPairingCode(null);
  };

  const copyCode = async () => {
    const ok = await copyText(pairingCode);
    setCodeCopied(ok);
    if (!ok) onNotify?.("Couldn't copy the pairing code", "error");
    window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCodeCopied(false), 2000);
  };

  const pairing = (
    <TelegramPairing
      code={pairingCode}
      onCancel={cancel}
      onCopyCode={copyCode}
      copied={codeCopied}
    />
  );

  const linked = PROVIDER_ORDER.filter((id) => socials[id]);
  const unlinked = PROVIDER_ORDER.filter((id) => !socials[id]);

  // Nothing linked yet: the two providers get equal billing, benefit and all.
  if (linked.length === 0) {
    if (pending === "telegram") return pairing;
    return (
      <div className="flex flex-col gap-2.5">
        <p className="text-xs text-[#757575]">
          <span className="font-semibold text-[#bfbfbf]">Either one</span> earns
          the step — add the other whenever you like.
        </p>

        {/* Equal halves of whatever measure the host gives it, with the `or`
            between them: two alternatives, and a wider button would read as the
            recommended one rather than a choice. */}
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <ChoiceCard
            glyph={GLYPHS[PROVIDER_ORDER[0]]}
            provider={SOCIAL_PROVIDERS[PROVIDER_ORDER[0]]}
            pending={pending === PROVIDER_ORDER[0]}
            disabled={Boolean(pending)}
            onClick={begin[PROVIDER_ORDER[0]]}
          />
          <OrDivider />
          <ChoiceCard
            glyph={GLYPHS[PROVIDER_ORDER[1]]}
            provider={SOCIAL_PROVIDERS[PROVIDER_ORDER[1]]}
            pending={pending === PROVIDER_ORDER[1]}
            disabled={Boolean(pending)}
            onClick={begin[PROVIDER_ORDER[1]]}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {linked.map((id) => (
        <LinkedRow key={id} account={socials[id]} />
      ))}

      {pending === "telegram"
        ? pairing
        : unlinked.map((id) => (
            <AddRow
              key={id}
              glyph={GLYPHS[id]}
              provider={SOCIAL_PROVIDERS[id]}
              pending={pending === id}
              disabled={Boolean(pending)}
              onClick={begin[id]}
            />
          ))}

      {unlinked.length === 0 ? (
        <p className="text-xs text-[#575757]">
          Both linked — setups and alerts are covered.
        </p>
      ) : null}
    </div>
  );
}

/**
 * Turns the pair into a choice rather than a to-do list: a rule down the middle
 * of the row, across it once the cards stack.
 */
function OrDivider() {
  return (
    <span
      className="flex items-center justify-center gap-2.5 text-[11px] font-medium uppercase tracking-wide text-[#575757] sm:flex-col sm:gap-2"
      aria-hidden
    >
      <span className="h-px flex-1 bg-[#242424] sm:h-auto sm:w-px sm:flex-1" />
      or
      <span className="h-px flex-1 bg-[#242424] sm:h-auto sm:w-px sm:flex-1" />
    </span>
  );
}

function ChoiceCard({ glyph, provider, pending, disabled, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={CHOICE_CARD_CLASS}
    >
      <span className="flex items-center gap-2 text-sm font-semibold text-white">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-[#242424] bg-[#0f0f0f] text-white">
          {glyph}
        </span>
        {pending ? provider.pendingLabel : provider.connectLabel}
        {pending ? (
          <Loader2 className="size-4 animate-spin text-[#00f3b6]" aria-hidden />
        ) : null}
      </span>
      <span className="text-xs leading-relaxed text-[#929292]">
        {provider.benefit}
      </span>
    </button>
  );
}

/** Settled state. Nothing to click — the profile never unlinks an account. */
function LinkedRow({ account }) {
  const provider = SOCIAL_PROVIDERS[account.provider];
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-[#1e5a3f] bg-[#0d2019] px-3 py-2">
      <span className="shrink-0 text-white">{GLYPHS[account.provider]}</span>
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-white">
        {account.handle}
      </span>
      {/* The glyph already names the provider, so mobile drops the word for the
          ~50px the handle needs to stay readable. */}
      <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-[#00f3b6]">
        <Check className="size-3.5" aria-hidden />
        <span className="hidden sm:inline">{provider.name} </span>
        linked
      </span>
    </div>
  );
}

/** The optional second link. Dashed, so it never reads as unfinished business. */
function AddRow({ glyph, provider, pending, disabled, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-2.5 rounded-lg border border-dashed border-[#2f2f2f] bg-black px-3 py-2 text-left transition-colors hover:border-[#454545] hover:bg-white/[0.03] disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-[#242424] bg-[#0f0f0f] text-white">
        {glyph}
      </span>

      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-sm font-semibold text-white">
          {pending ? provider.pendingLabel : provider.addLabel}
          <span className="ml-1.5 text-xs font-normal text-[#575757]">
            optional
          </span>
        </span>
        {/* One line on desktop keeps the row compact; on mobile that line is
            ~150px wide, so it wraps rather than ellipsing mid-sentence. */}
        <span className="text-xs leading-snug text-[#929292] max-sm:line-clamp-2 sm:truncate">
          {provider.benefit}
        </span>
      </span>

      {pending ? (
        <Loader2
          className="size-4 shrink-0 animate-spin text-[#00f3b6]"
          aria-hidden
        />
      ) : (
        <Plus className="size-4 shrink-0 text-[#757575]" aria-hidden />
      )}
    </button>
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
