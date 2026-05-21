export default function StrategyLogicCard({ setup }) {
  if (!setup) return null;

  const entry = setup.entryRules ?? [];
  const exit = setup.exitRules ?? [];
  const risk = setup.riskRules ?? [];

  return (
    <div className="mt-3 rounded-lg border border-[#242424] bg-[#0a0a0a] p-3">
      <h4 className="text-xs font-semibold text-white">Strategy Logic</h4>
      {setup.description ? (
        <p className="mt-1.5 text-[11px] leading-relaxed text-[#929292]">{setup.description}</p>
      ) : null}

      {entry.length > 0 ? (
        <div className="mt-3">
          <p className="text-[10px] font-medium uppercase tracking-wide text-[#757575]">
            Entry condition
          </p>
          <ul className="mt-1 space-y-0.5">
            {entry.map((r) => (
              <li key={r} className="text-[11px] text-[#bfbfbf]">
                · {r}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {exit.length > 0 ? (
        <div className="mt-2.5">
          <p className="text-[10px] font-medium uppercase tracking-wide text-[#757575]">
            Exit condition
          </p>
          <ul className="mt-1 space-y-0.5">
            {exit.map((r) => (
              <li key={r} className="text-[11px] text-[#bfbfbf]">
                · {r}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {risk.length > 0 ? (
        <div className="mt-2.5">
          <p className="text-[10px] font-medium uppercase tracking-wide text-[#757575]">
            Risk rules
          </p>
          <ul className="mt-1 space-y-0.5">
            {risk.map((r) => (
              <li key={r} className="text-[11px] text-[#bfbfbf]">
                · {r}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {setup.personalizationNote ? (
        <p className="mt-3 rounded-md border border-[#3e2e00]/30 bg-[#171200]/30 px-2.5 py-2 text-[10px] leading-relaxed text-[#f2b500]">
          {setup.personalizationNote}
        </p>
      ) : null}
    </div>
  );
}
