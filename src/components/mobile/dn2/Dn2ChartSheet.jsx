import { Share } from "lucide-react";
import { openSetupShare, setupShareText } from "../../../lib/share.js";
import AppChartCard from "../trade/AppChartCard.jsx";
import { Dn2Button, Dn2Sheet, SheetCloseButton, TokenIcon, VenueMark } from "./Dn2Ui.jsx";
import { coinOf, formatTokenPrice, tokenPrice, venueFunding } from "./dn2Data.js";
import { FIELD_LABEL, TILE } from "./dn2Theme.js";

/**
 * Figma B6 "Sheet — BTC-USDC chart" (4495:587). Token data on the phone is the
 * Copilot trade-ticket chart (`AppChartCard`, ticket variant) — the funding
 * graphs of the web page are not carried over. Opened from the candle button
 * in the builder, on a pair card, or from an expanded token vault.
 *
 * `pair` is "BTC-USDC" or "BTC/USDC"; `venues` are the venues whose funding
 * is listed under the chart.
 */
export default function Dn2ChartSheet({ open, onClose, pair, venues = [] }) {
  const label = String(pair ?? "").replace("/", "-");
  const coin = coinOf(label);
  const price = tokenPrice(label);

  const share = async () => {
    const text = setupShareText({ coin });
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: label, text, url: "https://app.hyprearn.com" });
        return;
      } catch (err) {
        if (err?.name === "AbortError") return;
      }
    }
    openSetupShare({ coin });
  };

  return (
    <Dn2Sheet
      open={open}
      onClose={onClose}
      title={label}
      header={({ dragHandleProps, titleId }) => (
        <div className="flex shrink-0 touch-none select-none flex-col" {...dragHandleProps}>
          <div className="flex h-4 items-end justify-center" aria-hidden>
            <span className="h-1 w-10 rounded-full bg-[#3a3026]" />
          </div>
          <div className="flex flex-col gap-1 px-4 pt-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <TokenIcon pair={label} size={24} />
                <h2 id={titleId} className="truncate text-[18px] font-bold leading-[23px] text-[#e8d5b5]">
                  {label}
                </h2>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Dn2Button size="sm" onClick={share} className="gap-1">
                  <Share size={14} aria-hidden />
                  Share
                </Dn2Button>
                <SheetCloseButton onPress={onClose} />
              </div>
            </div>
            <p className="flex items-center gap-1.5 whitespace-nowrap text-[16px] leading-6">
              <span className="text-[#757575]">Current price</span>
              <span className="font-semibold text-white">{formatTokenPrice(price)}</span>
            </p>
          </div>
        </div>
      )}
    >
      <div className="flex flex-col gap-5 px-4 pt-5">
        <AppChartCard symbol={coin} price={price} variant="ticket" />
        {venues.length ? (
          <section className={`${TILE} flex flex-col gap-2.5 p-3`} aria-label="Funding on your venues">
            <p className={FIELD_LABEL}>Funding on your venues</p>
            {venues.map((dex) => {
              const rate = venueFunding(dex);
              return (
                <div key={dex} className="flex items-center gap-2">
                  <div className="flex min-w-0 flex-1 items-center gap-1.5">
                    <VenueMark dex={dex} size={14} />
                    <span className="truncate text-[12px] font-medium leading-4 text-[#dcdce8]">{dex}</span>
                  </div>
                  <span className="flex shrink-0 items-center gap-2.5 whitespace-nowrap text-[12px] leading-4">
                    <span className="text-[#dcdce8]">{rate.funding}</span>
                    <span className={`font-medium ${rate.apr >= 0 ? "text-[#00d492]" : "text-[#e5484d]"}`}>
                      APY {rate.aprLabel}
                    </span>
                  </span>
                </div>
              );
            })}
          </section>
        ) : null}
      </div>
    </Dn2Sheet>
  );
}
