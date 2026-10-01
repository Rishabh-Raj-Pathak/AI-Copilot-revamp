import BottomSheet from "../BottomSheet.jsx";
import { APP_VENUES } from "../venues.js";
import { appImages } from "../mobileAssets.js";

/** Figma "Copilot / Venue Switcher — Open" → Venue Sheet (944:2832). */
export default function VenueSheet({ open, onClose, value, onChange }) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Select venue">
      <ul className="flex flex-col gap-1 px-4 pt-2" role="listbox" aria-label="Venue">
        {APP_VENUES.map((venue) => {
          const active = venue.id === value;
          return (
            <li key={venue.id}>
              <button
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange?.(venue.id);
                  onClose?.();
                }}
                className="flex h-[53px] w-full items-center gap-2.5 rounded-xl px-3 transition-colors active:bg-white/[0.05]"
              >
                <span className="flex size-[30px] shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-app-raised">
                  <img alt="" src={venue.logo} className="max-h-[21px] max-w-[21px] object-contain" />
                </span>
                <span
                  className={`min-w-0 flex-1 truncate text-left text-app-body font-medium leading-5 ${
                    active ? "text-ink" : "text-white/60"
                  }`}
                >
                  {venue.label}
                </span>
                {active ? (
                  <img alt="" src={appImages.activeDot} className="size-1.5 shrink-0" />
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </BottomSheet>
  );
}
