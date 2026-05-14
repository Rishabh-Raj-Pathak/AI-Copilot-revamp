import SetupChip from "./SetupChip.jsx";
import SetupRadio from "./SetupRadio.jsx";
import SuggestionPriceChart from "./SuggestionPriceChart.jsx";
import ViewThesisButton from "./ViewThesisButton.jsx";

/**
 * Copilot setup row — collapsed (header only) vs expanded (chart + thesis).
 * Selected: Figma 4039:11883 — gold border #f7bb08, filled radio.
 * Chart: Figma 4039:11895 — one image; image mounts after 3ms when expanded.
 */
export default function CopilotSuggestionCard({
  setup,
  expanded,
  selected,
  onSelect,
  onViewThesis,
}) {
  return (
    <article
      data-tour={
        selected && expanded ? "copilot-expanded-suggestion" : undefined
      }
      role="button"
      tabIndex={0}
      onClick={() => onSelect?.(setup.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect?.(setup.id);
        }
      }}
      className={`cursor-pointer rounded-xl border p-5 transition-[box-shadow,border-color] duration-200 ${
        selected
          ? "border-[#f7bb08] shadow-[0_0_0_1px_rgba(247,187,8,0.35),0_0_32px_rgba(247,187,8,0.12)]"
          : "border-[#242424] hover:border-[#333333]"
      }`}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <img
            src={setup.tokenIcon}
            alt=""
            className="mt-0.5 size-5 shrink-0 rounded-full object-cover"
            width={20}
            height={20}
            draggable={false}
          />
          <div className="min-w-0 flex-1">
            <h2
              className={`font-semibold leading-snug text-white ${
                expanded ? "text-lg" : "text-sm"
              }`}
            >
              {setup.title}
            </h2>
          </div>
          <SetupRadio selected={selected} />
        </div>
        <div className="flex w-full flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
            {setup.chips.map((c, i) => (
              <SetupChip key={`${setup.id}-${i}-${c.label}`} chip={c} />
            ))}
          </div>
          <ViewThesisButton
            onClick={(e) => {
              e.stopPropagation();
              onViewThesis?.();
            }}
          />
        </div>
      </div>

      {expanded ? <SuggestionPriceChart active={expanded} delayMs={3} /> : null}
    </article>
  );
}
