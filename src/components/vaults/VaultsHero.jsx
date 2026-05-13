import { Lock } from "lucide-react";

/**
 * Figma: `4421:6151` → `Frame 2` — hero title, trust pill, subtitle.
 */
export default function VaultsHero() {
  return (
    <section className="vaults-root flex w-full max-w-[1150px] flex-col gap-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-5">
        <div className="min-w-0 shrink-0">
          <h1 className="vaults-hero-title-gradient text-[clamp(2.5rem,6vw,4rem)] font-bold leading-[1.05] tracking-[-0.02em]">
            Vaults
          </h1>
        </div>
        <button
          type="button"
          className="inline-flex h-[41px] shrink-0 items-center gap-2 rounded-full border border-[rgba(204,177,127,0.25)] bg-[#14100a] px-5 text-sm font-medium text-[#e8d5b5] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-colors hover:border-[rgba(204,177,127,0.4)]"
        >
          <Lock className="size-[13px] shrink-0 opacity-90" aria-hidden />
          <span className="whitespace-nowrap">fully non-custodial</span>
        </button>
      </div>
      <p className="text-[15px] leading-6 text-white/90">
        Compare and allocate to automated strategies.
      </p>
    </section>
  );
}
