import { Shield } from "lucide-react";

/**
 * Figma: `4421:6247` `TrustBadge` — “Safe & Fully Non-custodial”.
 */
export default function VaultsTrustBadge() {
  return (
    <div className="vaults-root inline-flex h-[29px] items-center gap-2 rounded-full border border-[rgba(255,255,255,0.06)] bg-[#0c0a08] px-3.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <Shield className="size-[13px] shrink-0 text-[#ccb17f]" aria-hidden />
      <span className="whitespace-nowrap">Safe &amp; Fully Non-custodial</span>
    </div>
  );
}
