import { ShieldCheck } from "lucide-react";

/** Figma `4603:34` `Button` — fill + `#785a28` ring, shield icon, uppercase label. */
const HERO_TRUST_FILL =
  "linear-gradient(180deg, #1a140b 0%, #18130b 16.667%, #16120b 33.333%, #14110c 50%, #13100c 66.667%, #110f0c 83.333%, #0f0e0c 100%)";

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
          className="relative inline-flex h-[41px] shrink-0 items-center gap-2 rounded-full border border-[#785a28] px-5 text-[14px] font-medium uppercase leading-[21px] tracking-[0.35px] text-[#e8d5b5] shadow-[inset_0_0_4px_rgba(0,0,0,0.5)] transition-opacity hover:opacity-95"
          style={{ backgroundImage: HERO_TRUST_FILL }}
        >
          <ShieldCheck
            className="h-[15px] w-[13px] shrink-0"
            strokeWidth={1.75}
            aria-hidden
          />
          <span className="whitespace-nowrap">fully non-custodial</span>
        </button>
      </div>
      <p className="text-[15px] leading-6 text-white/90">
        Compare and allocate to automated strategies.
      </p>
    </section>
  );
}
