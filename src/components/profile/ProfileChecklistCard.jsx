import { useState } from "react";
import { Check, ChevronDown, Wallet } from "lucide-react";
import { truncateAddress } from "../../lib/wallet.js";
import ConnectSocialStep from "./ConnectSocialStep.jsx";
import TradingProfileStep from "./TradingProfileStep.jsx";
import { TelegramGlyph, XGlyph } from "./SocialGlyphs.jsx";
import { useProfile } from "./ProfileContext.jsx";
import {
  PROFILE_POINTS,
  STEP_SOCIAL,
  STEP_TRADING,
  STEP_WALLET,
  marketLabel,
  riskLabel,
} from "./profileSteps.js";

/**
 * The checklist. Renders at 1/3 on first paint because the wallet step is
 * already satisfied — the user connected one to get here.
 *
 * @param {object} props
 * @param {(message: string, variant?: 'success'|'error') => void} [props.onNotify]
 */
export default function ProfileChecklistCard({ onNotify }) {
  const {
    address,
    social,
    trading,
    progress,
    connectSocial,
    disconnectSocial,
    saveTrading,
  } = useProfile();

  // Open the first thing that still needs doing; the user can override.
  const [expandedId, setExpandedId] = useState(() =>
    !social ? STEP_SOCIAL : !trading ? STEP_TRADING : null,
  );

  const toggle = (id) => setExpandedId((current) => (current === id ? null : id));

  const handleSaveTrading = (draft) => {
    saveTrading(draft);
    setExpandedId(null);
    onNotify?.("Trading profile saved", "success");
  };

  const handleConnect = (account) => {
    const wasFirstConnect = !social;
    connectSocial(account);
    // Move them along on the first connect. Switching providers later means the
    // user is deliberately in this step, so leave it open to show the result.
    if (wasFirstConnect) setExpandedId(trading ? null : STEP_TRADING);
  };

  if (progress.isComplete) {
    return <CompleteSummary points={progress.points} />;
  }

  return (
    <section className="rounded-xl border border-[#242424] bg-[#0f0f0f] p-4 sm:p-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-white">
            Complete your profile
          </h2>
          <p className="mt-1 text-sm text-[#929292]">
            Earn{" "}
            <span className="font-semibold text-[#f2b500]">
              {progress.pointsTotal} HyprEarn Points
            </span>{" "}
            and let Copilot work the way you trade.
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-[#242424] bg-black px-2.5 py-1 text-xs font-semibold text-white">
          {progress.completedCount}/{progress.totalCount}
        </span>
      </header>

      <div className="mt-4 flex items-center gap-3">
        <div
          role="progressbar"
          aria-valuenow={progress.percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Profile completion"
          className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#242424]"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#f2b500] to-[#00f3b6] transition-[width] duration-500 ease-out"
            style={{ width: `${progress.percent}%` }}
          />
        </div>
        <span className="shrink-0 text-xs font-medium text-[#bfbfbf]">
          {progress.percent}%
        </span>
      </div>

      <ul className="mt-4 flex flex-col gap-2">
        <StepRow
          id={STEP_WALLET}
          title="Wallet connected"
          done
          points={PROFILE_POINTS[STEP_WALLET]}
          icon={<Wallet className="size-4" aria-hidden />}
          summary={truncateAddress(address)}
        />

        <StepRow
          id={STEP_SOCIAL}
          title="Connect X or Telegram"
          done={Boolean(social)}
          points={PROFILE_POINTS[STEP_SOCIAL]}
          icon={
            social?.provider === "telegram" ? (
              <TelegramGlyph className="size-[18px]" />
            ) : (
              <XGlyph className="size-4" />
            )
          }
          summary={social ? social.handle : null}
          expanded={expandedId === STEP_SOCIAL}
          onToggle={toggle}
        >
          <ConnectSocialStep
            social={social}
            onConnect={handleConnect}
            onDisconnect={disconnectSocial}
            onNotify={onNotify}
          />
        </StepRow>

        <StepRow
          id={STEP_TRADING}
          title="Set your trading profile"
          done={Boolean(trading)}
          points={PROFILE_POINTS[STEP_TRADING]}
          icon={<span className="text-xs font-bold">%</span>}
          summary={
            trading
              ? `${riskLabel(trading.risk)} · ${marketLabel(trading.market)} · ${trading.maxLeverage}`
              : null
          }
          expanded={expandedId === STEP_TRADING}
          onToggle={toggle}
        >
          <TradingProfileStep
            trading={trading}
            onSave={handleSaveTrading}
            submitLabel={trading ? "Update trading profile" : "Save trading profile"}
          />
        </StepRow>
      </ul>

      <p className="mt-4 border-t border-[#242424] pt-3 text-xs text-[#575757]">
        Finish all three for a{" "}
        <span className="font-medium text-[#757575]">
          +{PROFILE_POINTS.completionBonus} bonus
        </span>
        .
      </p>
    </section>
  );
}

/**
 * A row is a static `<li>` when it can't be opened (the wallet step), and a
 * disclosure otherwise.
 */
function StepRow({
  id,
  title,
  done,
  points,
  icon,
  summary,
  expanded,
  onToggle,
  children,
}) {
  const interactive = typeof onToggle === "function";

  const head = (
    <>
      <span
        className={`flex size-7 shrink-0 items-center justify-center rounded-full border transition-colors ${
          done
            ? "border-[#1e5a3f] bg-[#0d2019] text-[#00f3b6]"
            : "border-[#242424] bg-black text-[#757575]"
        }`}
      >
        {done ? <Check className="size-4" aria-hidden /> : icon}
      </span>

      <span className="flex min-w-0 flex-1 flex-col text-left">
        <span
          className={`truncate text-sm font-medium ${done ? "text-[#bfbfbf]" : "text-white"}`}
        >
          {title}
        </span>
        {summary ? (
          <span className="truncate text-xs text-[#757575]">{summary}</span>
        ) : null}
      </span>

      <span
        className={`shrink-0 text-xs font-semibold ${done ? "text-[#00f3b6]" : "text-[#757575]"}`}
      >
        +{points}
      </span>

      {interactive ? (
        <ChevronDown
          className={`size-4 shrink-0 text-[#757575] transition-transform ${expanded ? "rotate-180" : ""}`}
          aria-hidden
        />
      ) : (
        <span className="size-4 shrink-0" aria-hidden />
      )}
    </>
  );

  return (
    <li className="overflow-hidden rounded-lg border border-[#242424] bg-black/40">
      {interactive ? (
        <button
          type="button"
          onClick={() => onToggle(id)}
          aria-expanded={expanded}
          className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-white/[0.03]"
        >
          {head}
        </button>
      ) : (
        <div className="flex w-full items-center gap-3 px-3 py-2.5">{head}</div>
      )}

      {interactive && expanded ? (
        <div className="border-t border-[#242424] px-3 py-3.5">{children}</div>
      ) : null}
    </li>
  );
}

function CompleteSummary({ points }) {
  return (
    <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#1e5a3f] bg-[#0d2019] p-4 sm:p-5">
      <div className="flex items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[#1e5a3f] bg-black text-[#00f3b6]">
          <Check className="size-5" aria-hidden />
        </span>
        <div>
          <h2 className="text-base font-semibold text-white">Profile complete</h2>
          <p className="text-sm text-[#929292]">
            Copilot is tuned to your setup.
          </p>
        </div>
      </div>
      <span className="rounded-full border border-[#242424] bg-black px-3 py-1 text-sm font-semibold text-[#f2b500]">
        +{points} points
      </span>
    </section>
  );
}
