import { useEffect, useRef, useState } from "react";
import { Check, Copy, ExternalLink, Loader2 } from "lucide-react";
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
 * Step two: link exactly one account.
 *
 * Product decision, enforced here and in the store: X *or* Telegram, never
 * both. Connecting the second one replaces the first, so there is no state in
 * which the step can be credited twice.
 *
 * @param {object} props
 * @param {import('../../lib/profileSession.js').ProfileSocial|null} props.social
 * @param {(account: object) => void} props.onConnect
 * @param {() => void} [props.onDisconnect]
 * @param {(message: string, variant?: 'success'|'error') => void} [props.onNotify]
 */
export default function ConnectSocialStep({
  social,
  onConnect,
  onDisconnect,
  onNotify,
}) {
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
      `${SOCIAL_PROVIDERS[account.provider].name} connected as ${account.handle}`,
      "success",
    );
  };

  const beginX = () => {
    if (pending) return;
    setPending("x");
    cancelRef.current = startXAuthorization(settle);
  };

  const beginTelegram = () => {
    if (pending) return;
    setPending("telegram");
    setPairingCode(createTelegramPairingCode());
    cancelRef.current = startTelegramPairing(settle);
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

  if (social) {
    return (
      <ConnectedSocial
        social={social}
        pending={pending}
        onSwitch={social.provider === "x" ? beginTelegram : beginX}
        onDisconnect={onDisconnect}
        pairingCode={pairingCode}
        onCancel={cancel}
        onCopyCode={copyCode}
        codeCopied={codeCopied}
      />
    );
  }

  if (pending === "telegram") {
    return (
      <TelegramPairing
        code={pairingCode}
        onCancel={cancel}
        onCopyCode={copyCode}
        copied={codeCopied}
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2.5 sm:flex-row">
        <ChoiceCard
          glyph={<XGlyph className="size-4" />}
          provider={SOCIAL_PROVIDERS.x}
          pending={pending === "x"}
          disabled={Boolean(pending)}
          onClick={beginX}
        />
        <ChoiceCard
          glyph={<TelegramGlyph className="size-[18px]" />}
          provider={SOCIAL_PROVIDERS.telegram}
          pending={false}
          disabled={Boolean(pending)}
          onClick={beginTelegram}
        />
      </div>
      <p className="text-xs text-[#757575]">
        Pick one — you can switch later.
      </p>
    </div>
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

function TelegramPairing({ code, onCancel, onCopyCode, copied }) {
  return (
    <div className="flex flex-col gap-3.5 rounded-lg border border-[#242424] bg-black p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-white">
        <TelegramGlyph className="size-[18px]" />
        Connect Telegram
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
          <span className="font-mono text-base tracking-[0.35em] text-white">
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

      <div className="flex items-center justify-between gap-3 border-t border-[#242424] pt-3">
        <span
          className="flex items-center gap-2 text-xs text-[#929292]"
          role="status"
        >
          <Loader2 className="size-3.5 animate-spin text-[#00f3b6]" aria-hidden />
          Waiting for you to tap Start…
        </span>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs font-medium text-[#bfbfbf] transition-colors hover:text-white"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

/**
 * One compact row. The identity already appears in the profile header and the
 * checklist summary, so repeating an avatar and display name here would be the
 * third time we say the same thing.
 */
function ConnectedSocial({
  social,
  pending,
  onSwitch,
  onDisconnect,
  pairingCode,
  onCancel,
  onCopyCode,
  codeCopied,
}) {
  const other = social.provider === "x" ? SOCIAL_PROVIDERS.telegram : SOCIAL_PROVIDERS.x;

  if (pending === "telegram") {
    return (
      <TelegramPairing
        code={pairingCode}
        onCancel={onCancel}
        onCopyCode={onCopyCode}
        copied={codeCopied}
      />
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-[#242424] bg-black px-3 py-2">
      <span className="shrink-0 text-white">
        {social.provider === "x" ? (
          <XGlyph className="size-3.5" />
        ) : (
          <TelegramGlyph className="size-4" />
        )}
      </span>

      <span className="min-w-0 flex-1 truncate text-sm font-medium text-white">
        {social.handle}
      </span>

      <Check className="size-4 shrink-0 text-[#00f3b6]" aria-hidden />

      <span className="h-4 w-px shrink-0 bg-[#242424]" aria-hidden />

      <button
        type="button"
        onClick={onSwitch}
        disabled={Boolean(pending)}
        className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-[#757575] transition-colors hover:text-white disabled:opacity-60"
      >
        {pending === "x" ? (
          <>
            <Loader2 className="size-3 animate-spin text-[#00f3b6]" aria-hidden />
            {SOCIAL_PROVIDERS.x.pendingLabel}
          </>
        ) : (
          <>Use {other.name}</>
        )}
      </button>

      {onDisconnect ? (
        <button
          type="button"
          onClick={onDisconnect}
          className="shrink-0 text-xs font-medium text-[#757575] transition-colors hover:text-[#d53d3d]"
        >
          Disconnect
        </button>
      ) : null}
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
