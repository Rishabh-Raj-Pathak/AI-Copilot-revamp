import { clsx } from "clsx";
import type { ManagedDexId } from "./ActiveVaultCard";
import hyperliquidLogo from "@/assets/hyperliquid-logo.png";
import nadoLogo from "@/assets/nado-logo.png";
import pacificaLogo from "@/assets/pacifica-logo.png";

const DEX_LOGO_SRC: Partial<Record<ManagedDexId, string>> = {
  Hyperliquid: hyperliquidLogo,
  Nado: nadoLogo,
  Pacifica: pacificaLogo,
};

type DexLogoProps = {
  dex: ManagedDexId;
  className?: string;
};

export function DexLogo({ dex, className }: DexLogoProps) {
  const src = DEX_LOGO_SRC[dex];
  if (!src) return null;

  return (
    <img
      src={src}
      alt=""
      aria-hidden
      className={clsx("h-4 w-4 shrink-0 object-contain", className)}
    />
  );
}

export function DexLabel({
  dex,
  className,
}: {
  dex: ManagedDexId;
  className?: string;
}) {
  return (
    <span className={clsx("inline-flex min-w-0 items-center gap-2", className)}>
      <DexLogo dex={dex} />
      <span className="truncate">{dex}</span>
    </span>
  );
}
