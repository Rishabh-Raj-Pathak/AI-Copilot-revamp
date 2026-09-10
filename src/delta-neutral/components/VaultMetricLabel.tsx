import { useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "./ui/dialog";

/**
 * A metric label that carries its own explanation — hover tooltip on desktop, sheet
 * on touch, keyboard-reachable on both.
 *
 * Extracted from DeltaVaultBuilder so the Position Summary can use it too. A metric
 * whose name does not fully explain it needs this; one whose name does should not
 * pay for a tooltip nobody opens.
 */
export function VaultMetricLabel({
  label,
  description,
  className = "text-[10px] uppercase tracking-[0.8px] text-[#8f90a1]",
}: {
  label: string;
  description: string;
  className?: string;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={`hidden cursor-help text-left outline-none transition-colors hover:text-[#d8d9e3] focus-visible:text-[#e8d5b5] tablet:inline ${className}`}
          >
            {label}
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-[220px] border border-[rgba(146,111,56,0.45)] bg-[#0a0a0a] text-[#e8d5b5]">
          {description}
        </TooltipContent>
      </Tooltip>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className={`cursor-help text-left outline-none transition-colors hover:text-[#d8d9e3] focus-visible:text-[#e8d5b5] max-tablet:inline tablet:hidden ${className}`}
      >
        {label}
      </button>
      <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
        <DialogContent className="max-w-[calc(100%-1.5rem)] rounded-[14px] border border-[rgba(146,111,56,0.55)] bg-[linear-gradient(180deg,rgba(12,12,12,0.98)_0%,rgba(6,6,6,0.98)_100%)] p-4 text-[#f5f5f5]">
          <DialogTitle className="font-['Onest',sans-serif] text-[14px] text-[#e8d5b5]">
            {label}
          </DialogTitle>
          <DialogDescription className="mt-1 text-[12px] text-[#b4b5c2]">
            {description}
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </>
  );
}
