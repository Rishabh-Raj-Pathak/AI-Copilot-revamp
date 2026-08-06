const STATS = [
  {
    label: "TOTAL VOLUME",
    mobileLabel: "Volume",
    value: "$74,204",
    hint: "Across all strategies",
  },
  {
    label: "AVERAGE APR",
    mobileLabel: "APR",
    value: "18.990%",
    hint: "Historical performance",
  },
  {
    label: "TOTAL USERS",
    mobileLabel: "Users",
    value: "1,500",
    hint: "Active depositors",
  },
];

/**
 * Figma: `4421:6156` — three `StatCard` columns.
 */
export default function VaultsStatsRow() {
  return (
    <section className="vaults-root grid w-full grid-cols-3 gap-2.5 tablet:gap-4">
      {STATS.map((s) => (
        <div
          key={s.label}
          className="rounded-xl border border-[rgba(255,255,255,0.05)] bg-[#0c0a08] px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] max-tablet:rounded-lg max-tablet:px-3 max-tablet:py-2.5 tablet:px-6 tablet:py-6"
        >
          <div className="flex flex-col gap-2 max-tablet:gap-1">
            <p className="text-[12px] font-bold uppercase leading-[18px] tracking-[0.08em] text-[#717182] max-tablet:text-[10px] max-tablet:leading-tight max-tablet:tracking-[0.06em]">
              <span className="max-tablet:hidden">{s.label}</span>
              <span className="hidden max-tablet:inline">{s.mobileLabel}</span>
            </p>
            <p className="vaults-stat-value-gradient text-[32px] font-bold leading-[35px] max-tablet:text-[1.1875rem] max-tablet:leading-tight">
              {s.value}
            </p>
            <p className="text-[12px] leading-[18px] text-[rgba(255,255,255,0.4)] max-tablet:hidden">
              {s.hint}
            </p>
          </div>
        </div>
      ))}
    </section>
  );
}
