import { useState } from "react";
import AppIcon from "../AppIcon.jsx";
import BottomSheet from "../BottomSheet.jsx";
import { appIcons } from "../mobileAssets.js";
import { GOLD_TITLE_CLASS } from "./agentsTheme.js";

/**
 * Figma "Hero" (951:4068) on "Agents / Delta Neutral — Full Page".
 *
 * The platform stat tiles are hidden on this frame, so their figures move into
 * the sheet behind the info button, each beside the line that explains it.
 *
 * @param {{ stats: { title: string, value: string, subtext?: string, body: string }[] }} props
 */
export default function MobileDnHero({ stats = [] }) {
  const [open, setOpen] = useState(false);

  return (
    <section className="flex flex-col gap-2">
      <h1 className={GOLD_TITLE_CLASS}>Delta Neutral</h1>
      <div className="flex items-end gap-1">
        <p className="min-w-0 flex-1 text-[13px] leading-5 text-[#b4b5c2]">
          Funding yield, engineered to be directionless. HyprEarn continuously routes into the
          highest-volume pair between your two venues to tighten execution and maximize funding
          capture.
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Explain platform metrics"
          aria-haspopup="dialog"
          className="app-pressable relative flex size-7 shrink-0 items-center justify-center rounded-lg border border-white/[0.12] bg-white/[0.02] text-[#8f90a1] after:absolute after:-inset-2 active:text-[#d6b06a]"
        >
          <AppIcon src={appIcons.info14} size={14} />
        </button>
      </div>

      <BottomSheet open={open} onClose={() => setOpen(false)} title="Platform metrics">
        <div className="flex flex-col gap-3 px-4 pt-4">
          <p className="text-app-callout text-ink-muted">
            Core trust and reliability indicators for delta-neutral vault operations.
          </p>
          <ul className="flex flex-col gap-2">
            {stats.map((stat) => (
              <li
                key={stat.title}
                className="flex flex-col gap-1 rounded-xl border border-[rgba(214,177,107,0.22)] bg-[#0c0a08] px-4 py-3"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[11px] font-medium uppercase leading-[14px] tracking-[0.6px] text-[#9c9cac]">
                    {stat.title}
                  </span>
                  <span className="text-app-headline font-medium text-[#e8d5b5]">{stat.value}</span>
                </div>
                <p className="text-app-caption text-[#9c9cac]">{stat.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </BottomSheet>
    </section>
  );
}
