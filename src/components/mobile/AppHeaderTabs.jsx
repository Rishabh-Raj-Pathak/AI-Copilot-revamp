/**
 * Figma header tabs (Copilot "Segmented" 1227:13468): underline tabs for a
 * screen's peer views, sitting in the header under the title row — Copilot's
 * Strategies / Portfolio, Agents' Delta Neutral / Alpha Agents.
 *
 * Active: 14/600 ink with a 2px ink underline. Idle: 14/500 subtle. An
 * optional count trails the label (13/400); `pending` shows "–" while it is
 * being worked out, so a stale number never shows.
 *
 * @param {{
 *   value: string,
 *   onChange: (id: string) => void,
 *   options: { id: string, label: string, count?: number|null, countLabel?: string, pending?: boolean }[],
 *   ariaLabel: string,
 * }} props
 */
export default function AppHeaderTabs({ value, onChange, options, ariaLabel }) {
  return (
    <div role="tablist" aria-label={ariaLabel} className="flex min-w-0 flex-1 items-end gap-5">
      {options.map((o) => {
        const active = o.id === value;
        const count = o.pending ? "–" : o.count;
        return (
          <button
            key={o.id}
            type="button"
            role="tab"
            aria-selected={active}
            aria-label={o.count != null ? `${o.label}, ${o.count} ${o.countLabel ?? ""}`.trim() : o.label}
            onClick={() => onChange(o.id)}
            className={`flex h-10 shrink-0 items-center gap-[5px] border-b-2 pt-0.5 text-app-body leading-[18px] transition-colors ${
              active
                ? "border-ink font-semibold text-ink"
                : "border-transparent font-medium text-ink-subtle active:text-ink-muted"
            }`}
          >
            {o.label}
            {count != null ? (
              <span
                className={`text-app-callout font-normal leading-4 ${active ? "text-ink-subtle" : "text-ink-faint"}`}
              >
                {count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
