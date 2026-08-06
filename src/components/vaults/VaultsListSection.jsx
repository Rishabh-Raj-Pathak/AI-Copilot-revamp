import { parseMaxUsdcFromLabel } from "./vaultUiUtils.js";
import VaultRow from "./VaultRow.jsx";

function SectionTitle({ title, mobileTitle, tone = "muted" }) {
  const colorClass =
    tone === "gold"
      ? "text-[#ccb17f]"
      : "text-[rgba(113,113,130,0.6)]";

  return (
    <>
      <div className="flex items-center gap-3 max-tablet:flex tablet:hidden">
        <div className="vaults-section-hairline" />
        <h3
          className={`shrink-0 text-[10px] font-semibold uppercase leading-[15px] tracking-[2px] ${colorClass}`}
        >
          <span className="tablet:hidden">{mobileTitle ?? title}</span>
        </h3>
        <div className="vaults-section-hairline" />
      </div>
      <div className="hidden items-center gap-3 tablet:flex">
        <h3
          className={`shrink-0 text-[10px] font-semibold uppercase leading-[15px] tracking-[2px] ${colorClass}`}
        >
          {title}
        </h3>
        <div className="vaults-section-hairline" />
      </div>
    </>
  );
}

/**
 * Figma: `4421:6257` / `4421:6472` — `SectionTitle` + `rounded-[14px]` row stack (`4421:6262`).
 */
export default function VaultsListSection({
  title,
  mobileTitle,
  vaults,
  rowUi,
  onPatch,
  sectionDataTour,
  tourFeaturedFirstControls,
}) {
  if (vaults.length === 0) {
    return (
      <section
        className="vaults-root flex w-full flex-col gap-4"
        {...(sectionDataTour ? { "data-tour": sectionDataTour } : {})}
      >
        <SectionTitle title={title} mobileTitle={mobileTitle} />
        <p className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[#0c0c0c] px-4 py-6 text-sm text-[#717182]">
          No vaults match this venue filter.
        </p>
      </section>
    );
  }

  return (
    <section
      className="vaults-root flex w-full flex-col gap-4"
      {...(sectionDataTour ? { "data-tour": sectionDataTour } : {})}
    >
      <SectionTitle title={title} mobileTitle={mobileTitle} />
      <div className="flex w-full flex-col gap-3 max-tablet:gap-3 tablet:overflow-hidden tablet:rounded-[14px]">
        {vaults.map((v, i) => (
          <VaultRow
            key={v.id}
            vault={v}
            ui={rowUi[v.id]}
            isFirst={i === 0}
            tourControlsDataTour={
              tourFeaturedFirstControls && i === 0
                ? "vaults-featured-tour-controls"
                : undefined
            }
            onShareChange={(n) => onPatch(v.id, { sharePct: n })}
            onAmountStrChange={(s) => onPatch(v.id, { amountStr: s })}
            onMaxClick={() =>
              onPatch(v.id, { amountStr: String(parseMaxUsdcFromLabel(v.maxLabel)) })
            }
            onBacktest={() => onPatch(v.id, { backtestRequestedAt: Date.now() })}
            onActivate={() =>
              onPatch(v.id, { activated: true, activatedAt: Date.now() })
            }
            onStrategySelect={(strategyId) =>
              onPatch(v.id, { selectedStrategyId: strategyId })
            }
          />
        ))}
      </div>
    </section>
  );
}
