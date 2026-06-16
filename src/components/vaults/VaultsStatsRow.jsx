const STATS = [
  {
    label: "TOTAL VOLUME",
    value: "$74,204",
    hint: "Across all strategies",
  },
  {
    label: "AVERAGE APR",
    value: "18.990%",
    hint: "Historical performance",
  },
  {
    label: "TOTAL USERS",
    value: "1,500",
    hint: "Active depositors",
  },
];

/**
 * Figma: `4421:6156` — three `StatCard` columns.
 */
export default function VaultsStatsRow() {
  return (
    <section className="vaults-root grid w-full grid-cols-1 gap-4 md:grid-cols-3">
      {STATS.map((s) => (
        <div
          key={s.label}
          className="rounded-xl border border-[rgba(255,255,255,0.05)] bg-[#0c0a08] px-6 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
        >
          <div className="flex flex-col gap-2">
            <p className="text-[12px] font-bold uppercase leading-[18px] tracking-[0.08em] text-[#717182]">
              {s.label}
            </p>
            <p className="vaults-stat-value-gradient text-[32px] font-bold leading-[35px]">
              {s.value}
            </p>
            <p className="text-[12px] leading-[18px] text-[rgba(255,255,255,0.4)]">
              {s.hint}
            </p>
          </div>
        </div>
      ))}
    </section>
  );
}
