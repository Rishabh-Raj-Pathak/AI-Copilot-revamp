import React from "react";
import { clsx } from "clsx";
import { formatWalletAddress } from "../utils/wallet";

type WalletAddressLabelProps = {
  address: string;
  className?: string;
};

export function WalletAddressLabel({
  address,
  className,
}: WalletAddressLabelProps) {
  return (
    <span
      title={address}
      className={clsx(
        "font-['Consolas',monospace] text-[11px] tracking-[0.15px] text-[#c4c5d0]",
        className,
      )}
    >
      {formatWalletAddress(address)}
    </span>
  );
}
