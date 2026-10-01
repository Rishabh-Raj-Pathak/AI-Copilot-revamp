import { useEffect, useState } from "react";
import { formatPoints } from "../pointsData.js";
import { CURRENT_CYCLE_POINTS, nextDistribution } from "./pointsMockData.js";

/**
 * Figma "Points Card" (957:5447): the gold-on-black balance card — POINTS,
 * the balance in the gold ramp, this cycle's earnings, and a countdown to the
 * next Monday 00:00 UTC distribution that ticks every second.
 *
 * `-` stands in for the balance and the cycle while signed out or on a
 * season that has not started, exactly as the artboard draws it.
 */

const GEIST_MONO_HREF = "https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400&display=swap";

/** The countdown digits are Geist Mono; the app ships no copy, so fetch it on demand. */
function useGeistMono() {
  useEffect(() => {
    if (document.querySelector('link[data-font="geist-mono"]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = GEIST_MONO_HREF;
    link.dataset.font = "geist-mono";
    document.head.appendChild(link);
  }, []);
}

function split(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return [
    Math.floor(total / 86400),
    Math.floor((total % 86400) / 3600),
    Math.floor((total % 3600) / 60),
    total % 60,
  ].map((n) => String(n).padStart(2, "0"));
}

function useDistributionCountdown(enabled) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!enabled) return undefined;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [enabled]);
  return enabled ? split(nextDistribution(now) - now) : ["00", "00", "00", "00"];
}

const UNITS = ["Days", "Hrs", "Mins", "Secs"];
const DIGITS_FONT = "'Geist Mono', var(--font-app-mono)";

export default function PointsSummaryCard({ balance, active }) {
  useGeistMono();
  const parts = useDistributionCountdown(active);
  const hasBalance = active && balance > 0;

  return (
    <section
      className="flex w-full flex-col items-center gap-3 rounded-2xl border border-[#785a28] px-4 py-6"
      style={{
        backgroundImage:
          "linear-gradient(90deg, rgba(120,90,40,0.05) 0%, rgba(74,59,34,0.05) 100%), linear-gradient(90deg, #080808 0%, #080808 100%)",
      }}
      aria-label="Your points"
    >
      <h2 className="text-app-title font-bold uppercase leading-[23px] tracking-[2.4px] text-[#785a28]">
        Points
      </h2>
      <p className="bg-gradient-to-b from-white via-[#e8d5b5] to-[#806838] bg-clip-text text-[36px] font-bold leading-9 text-transparent">
        {hasBalance ? formatPoints(balance) : "-"}
      </p>
      <span className="rounded border border-[rgba(114,114,131,0.2)] bg-[rgba(114,114,131,0.1)] px-3 py-1 text-app-caption leading-[14px] text-[#717182]">
        {hasBalance ? `+${formatPoints(CURRENT_CYCLE_POINTS)} this cycle` : "- this cycle"}
      </span>
      <div className="flex flex-col items-center gap-3 pt-3.5">
        <h3 className="text-app-body font-bold uppercase leading-4 tracking-[1.5px] text-[#785a28]">
          Next Distribution
        </h3>
        <div
          className="flex items-center gap-[11px] rounded-full border border-[rgba(120,90,40,0.2)] bg-gradient-to-b from-[#140f0a] to-[#0a0805] px-[26px] py-2.5 shadow-[0_0_0_4px_rgba(247,187,8,0.05)]"
          role="timer"
          aria-label={`${parts[0]} days ${parts[1]} hours ${parts[2]} minutes ${parts[3]} seconds until the next distribution`}
        >
          {UNITS.map((unit, i) => (
            <div key={unit} className="contents">
              {i > 0 ? (
                <span className="text-app-caption leading-[15px] text-[#5c4d35]" aria-hidden>
                  :
                </span>
              ) : null}
              <div className="flex flex-col items-center gap-1" aria-hidden>
                <span
                  className="text-app-title font-normal leading-5 tracking-[-0.45px] text-[#e8d5b5]"
                  style={{ fontFamily: DIGITS_FONT }}
                >
                  {parts[i]}
                </span>
                <span className="text-[9px] font-bold uppercase leading-[10px] tracking-[0.35px] text-[#5c4d35]">
                  {unit}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
