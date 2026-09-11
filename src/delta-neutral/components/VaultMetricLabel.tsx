import { useState, type ReactNode } from "react";
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
  detail,
  className = "text-[10px] uppercase tracking-[0.8px] text-[#8f90a1]",
}: {
  label: string;
  description: string;
  /**
   * Structured content under the prose -- a figure's own arithmetic, say. Kept a
   * separate prop rather than widening `description` to a node: the touch path renders
   * the description inside Radix's `<p>`, and a table is not phrasing content. This
   * renders as its sibling instead, so both paths stay valid markup.
   */
  detail?: ReactNode;
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
        <TooltipContent
          className={`border border-[rgba(146,111,56,0.45)] bg-[#0a0a0a] text-[#e8d5b5] ${
            detail ? "max-w-[320px]" : "max-w-[220px]"
          }`}
        >
          <p>{description}</p>
          {detail && (
            <div className="mt-2.5 border-t border-[rgba(255,255,255,0.1)] pt-2.5">
              {detail}
            </div>
          )}
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
          {detail && (
            <div className="mt-3 border-t border-[rgba(255,255,255,0.1)] pt-3">
              {detail}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
