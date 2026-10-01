import { Fragment, Children } from "react";
import AppIcon from "./AppIcon.jsx";
import { appIcons } from "./mobileAssets.js";

/**
 * Grouped card of tappable rows (Figma "Wallet Actions", Profile "Account").
 * Rows are separated by an inset hairline starting at 48px, per the
 * "List Row / Action" spec.
 */
export function AppListGroup({ children, className = "" }) {
  const rows = Children.toArray(children).filter(Boolean);
  return (
    <div
      className={`flex w-full flex-col overflow-hidden rounded-xl border border-app-line bg-app-bg ${className}`}
    >
      {rows.map((row, i) => (
        <Fragment key={row.key ?? i}>
          {i > 0 ? (
            <div className="pl-12" aria-hidden>
              <div className="h-px bg-app-line" />
            </div>
          ) : null}
          {row}
        </Fragment>
      ))}
    </div>
  );
}

/**
 * Figma "List Row / Action" (1036:5147): 20px icon, 14px label, optional value
 * and chevron. `tone="destructive"` paints icon + label red.
 */
export function AppListRow({
  icon,
  label,
  value,
  showChevron = false,
  tone = "default",
  onClick,
  href,
  trailing,
}) {
  const destructive = tone === "destructive";
  const content = (
    <>
      {icon ? (
        <AppIcon
          src={icon}
          size={20}
          className={destructive ? "text-app-sell" : "text-ink"}
        />
      ) : null}
      <span
        className={`min-w-0 flex-1 truncate text-left text-app-body ${
          destructive ? "text-app-sell" : "text-ink"
        }`}
      >
        {label}
      </span>
      {value ? (
        <span className="shrink-0 text-app-body text-ink-subtle">{value}</span>
      ) : null}
      {trailing}
      {showChevron ? (
        <AppIcon src={appIcons.chevronRight16} size={16} className="text-ink-subtle" />
      ) : null}
    </>
  );
  const rowClass =
    "flex w-full items-center gap-3 p-4 transition-colors active:bg-white/[0.04]";
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={rowClass}>
        {content}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={rowClass}>
      {content}
    </button>
  );
}
