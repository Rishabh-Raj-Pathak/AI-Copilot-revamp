import { Layers } from "lucide-react";
import { appImages } from "../mobileAssets.js";
import { Dn2Sheet } from "../dn2/Dn2Ui.jsx";

/** Venue mark for a vault DEX filter id; "all" has no single venue, so it gets the stack glyph. */
export function AgentVenueMark({ id, size = 24 }) {
  const logo = appImages.venue[id];
  if (logo) {
    return <img alt="" src={logo} className="shrink-0 object-contain" style={{ width: size, height: size }} />;
  }
  return (
    <Layers
      className="shrink-0 text-[#e8d5b5]"
      style={{ width: size * 0.75, height: size * 0.75 }}
      strokeWidth={1.75}
      aria-hidden
    />
  );
}

/**
 * Venue filter for the Alpha Agents shelves — Figma "02 Agents - Alpha Agents"
 * A6, in the Delta Neutral 2 sheet chrome. Rows are the page's `dexTabs`.
 */
export default function AgentVenueSheet({ open, onClose, tabs, value, onChange }) {
  return (
    <Dn2Sheet open={open} onClose={onClose} title="Select venue">
      <ul className="flex flex-col gap-0.5 px-4 pt-2" role="listbox" aria-label="Venue">
        {tabs.map((tab) => {
          const active = tab.id === value;
          return (
            <li key={tab.id}>
              <button
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange(tab.id);
                  onClose();
                }}
                className={`flex h-12 w-full items-center gap-2.5 rounded-[12px] px-3 transition-colors active:bg-white/[0.05] ${
                  active ? "bg-[rgba(204,177,127,0.1)]" : ""
                }`}
              >
                <span className="flex size-[30px] shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-app-raised">
                  <AgentVenueMark id={tab.id} size={20} />
                </span>
                <span
                  className={`min-w-0 flex-1 truncate text-left text-[14px] font-medium uppercase leading-[19px] tracking-[0.35px] ${
                    active ? "text-[#e8d5b5]" : "text-[#8f90a1]"
                  }`}
                >
                  {tab.label}
                </span>
                {active ? <img alt="" src={appImages.activeDot} className="size-1.5 shrink-0" /> : null}
              </button>
            </li>
          );
        })}
      </ul>
    </Dn2Sheet>
  );
}
