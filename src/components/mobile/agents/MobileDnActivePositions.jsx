const GROUPS = [
  { id: "all", label: "All" },
  { id: "category", label: "Categories" },
  { id: "token", label: "Tokens" },
];

const CAPTIONS = {
  all: "All active positions grouped by category and token.",
  category: "Showing category-based positions only.",
  token: "Showing token-pair positions only.",
};

const EMPTY = {
  all: "No active positions right now.",
  category: "No category positions right now.",
  token: "No token positions right now.",
};

/**
 * Figma "Active Positions" (952:4133): hairline heading, All / Categories /
 * Tokens filter, caption, then the running vault cards — or the empty row.
 *
 * The cards themselves come from the page (`children`), which keeps owning
 * the vault list, expand, stop and settings handlers.
 */
export default function MobileDnActivePositions({ group, onGroupChange, isEmpty, children }) {
  return (
    <section className="flex flex-col gap-[14px] pt-2" aria-labelledby="dn-active-positions">
      <div className="flex items-center gap-3">
        <span className="h-px min-w-0 flex-1 bg-[linear-gradient(90deg,rgba(0,0,0,0)_0%,rgba(255,255,255,0.05)_100%)]" />
        <h2
          id="dn-active-positions"
          className="shrink-0 text-[18px] font-medium leading-6 text-[#e8d5b5]"
        >
          Active positions
        </h2>
        <span className="h-px min-w-0 flex-1 bg-[linear-gradient(90deg,rgba(255,255,255,0.05)_0%,rgba(0,0,0,0)_100%)]" />
      </div>

      <div
        role="tablist"
        aria-label="Group active positions"
        className="flex gap-[5px] rounded-xl border border-white/[0.08] bg-[rgba(10,10,10,0.78)] p-[7px]"
      >
        {GROUPS.map((item) => {
          const active = group === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onGroupChange(item.id)}
              className={`app-pressable flex h-11 min-w-0 flex-1 items-center justify-center rounded-[9px] border text-[10px] font-semibold uppercase leading-3 tracking-[0.85px] ${
                active
                  ? "border-[rgba(214,177,107,0.42)] bg-[linear-gradient(180deg,rgba(54,42,28,0.96)_0%,rgba(22,18,13,0.98)_100%)] text-[#f0ddb9]"
                  : "border-transparent text-[#9394a1]"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <p className="text-[11px] leading-[13px] text-[#8d8e99]">{CAPTIONS[group] ?? CAPTIONS.all}</p>

      {isEmpty ? (
        <div className="flex h-12 items-center justify-center rounded-[14px] border border-white/10 bg-[rgba(14,14,16,0.88)] px-4">
          <p className="text-center text-[13px] leading-4 text-[#8f90a1]">{EMPTY[group] ?? EMPTY.all}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">{children}</div>
      )}
    </section>
  );
}
