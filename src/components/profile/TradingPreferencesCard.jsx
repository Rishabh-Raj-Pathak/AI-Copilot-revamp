import { useState } from "react";
import { Pencil } from "lucide-react";
import TradingProfileStep from "./TradingProfileStep.jsx";
import { useProfile } from "./ProfileContext.jsx";
import { marketLabel, riskLabel } from "./profileSteps.js";

/**
 * Read-only summary of what Copilot is tuned to, with an inline editor.
 *
 * @param {object} props
 * @param {(message: string, variant?: 'success'|'error') => void} [props.onNotify]
 */
export default function TradingPreferencesCard({ onNotify }) {
  const { trading, saveTrading } = useProfile();
  const [editing, setEditing] = useState(false);

  const save = (draft) => {
    saveTrading(draft);
    setEditing(false);
    onNotify?.("Trading profile updated", "success");
  };

  return (
    <section className="rounded-xl border border-[#242424] bg-[#0f0f0f] p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-white">Trading profile</h2>
          <p className="mt-1 text-sm text-[#929292]">
            Copilot sizes and filters its setups against these.
          </p>
        </div>
        {trading && !editing ? (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="flex shrink-0 items-center gap-1.5 rounded-md border border-[#242424] px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/5"
          >
            <Pencil className="size-3.5" aria-hidden />
            Edit
          </button>
        ) : null}
      </div>

      <div className="mt-4">
        {trading && !editing ? (
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Stat label="Risk profile" value={riskLabel(trading.risk)} />
            <Stat label="Preferred market" value={marketLabel(trading.market)} />
            <Stat label="Max leverage" value={trading.maxLeverage} />
          </dl>
        ) : (
          <TradingProfileStep
            trading={trading}
            onSave={save}
            submitLabel={trading ? "Update trading profile" : "Save trading profile"}
          />
        )}
      </div>
    </section>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-lg border border-[#242424] bg-black px-3 py-2.5">
      <dt className="text-[10px] font-medium uppercase tracking-wide text-[#757575]">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-semibold text-white">{value}</dd>
    </div>
  );
}
