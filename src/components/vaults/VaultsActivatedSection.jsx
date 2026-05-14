import ActivatedVaultRow from "./ActivatedVaultRow.jsx";

/**
 * Activated allocations — above Featured; uses `vaults-section-hairline` + enter motion.
 */
export default function VaultsActivatedSection({ vaults, rowUi, onPatch }) {
  return (
    <section
      className="vaults-root flex w-full flex-col gap-4"
      data-tour="vaults-activated-section"
    >
      <div className="flex items-center gap-3">
        <h3 className="shrink-0 text-[10px] font-semibold uppercase leading-[15px] tracking-[2px] text-[#ccb17f]">
          Activated Vaults
        </h3>
        <div className="vaults-section-hairline" />
      </div>
      <div className="overflow-hidden rounded-[14px] border border-[rgba(120,90,40,0.22)] shadow-[0_4px_24px_-8px_rgba(0,0,0,0.55)]">
        {vaults.map((v, i) => (
          <ActivatedVaultRow
            key={v.id}
            vault={v}
            ui={rowUi[v.id]}
            isFirst={i === 0}
            enterIndex={i}
            onPatch={onPatch}
          />
        ))}
      </div>
    </section>
  );
}
