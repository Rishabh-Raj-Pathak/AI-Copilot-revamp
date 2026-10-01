import { Children, Fragment } from "react";
import AppIcon from "../AppIcon.jsx";
import { appIcons } from "../mobileAssets.js";

/**
 * Building blocks shared by the phone Profile, Delete Account and Help &
 * Support screens (Figma "06 Profile · Delete Account", 1037:5108).
 *
 * The kit's `AppListGroup` paints its card black because it lives on a sheet;
 * these screens sit on the black page, so their cards are `bg/surface`.
 */

/** 11px medium, +0.04em, faint — the "LINKED ACCOUNTS" / "ACCOUNT" labels. */
export function Eyebrow({ children, className = "" }) {
  return (
    <p
      className={`pl-1 text-app-label font-medium tracking-[0.04em] text-ink-faint ${className}`}
    >
      {children}
    </p>
  );
}

/** A titled group: eyebrow, then its card (and any footnote) 8px below. */
export function Section({ label, children, className = "" }) {
  return (
    <section className={`flex w-full flex-col gap-2 ${className}`}>
      <Eyebrow>{label}</Eyebrow>
      {children}
    </section>
  );
}

/** Rounded `bg/surface` card with the default hairline. */
export function Card({ children, className = "", as: Tag = "div", ...rest }) {
  return (
    <Tag
      className={`flex w-full flex-col overflow-hidden rounded-xl border border-app-line bg-app-surface ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/**
 * Rows separated by an inset hairline (Figma "Divider", 48px inset by default —
 * the "List Row / Action" spec).
 */
export function DividedRows({ children, inset = "pl-12" }) {
  const rows = Children.toArray(children).filter(Boolean);
  return rows.map((row, i) => (
    <Fragment key={row.key ?? i}>
      {i > 0 ? (
        <div className={inset} aria-hidden>
          <div className="h-px bg-app-line" />
        </div>
      ) : null}
      {row}
    </Fragment>
  ));
}

const PILL_TONE = {
  neutral: "bg-app-subtle text-ink",
  positive: "bg-app-positive-subtle text-app-positive",
};

/** Figma "Signal Pill": 12px semibold on a tinted capsule. */
export function Pill({ tone = "neutral", children, className = "" }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-3 py-1 text-app-caption font-semibold ${PILL_TONE[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

/**
 * Figma "List Row / Action" (1036:5147) on a surface card: 20px icon, 14px
 * label, optional chevron. `destructive` paints icon and label `app/sell` —
 * red is reserved for delete actions.
 */
export function ActionRow({ icon, label, onClick, href, destructive = false, chevron = false }) {
  const tone = destructive ? "text-app-sell" : "text-ink";
  const body = (
    <>
      <AppIcon src={icon} size={20} className={tone} />
      <span className={`min-w-0 flex-1 text-left text-app-body ${tone}`}>{label}</span>
      {chevron ? (
        <AppIcon src={appIcons.chevronRight16} size={16} className="text-ink-faint" />
      ) : null}
      {href ? <AppIcon src={appIcons.external16} size={16} className="text-ink-faint" /> : null}
    </>
  );
  const cls = "flex w-full items-center gap-3 p-4 transition-colors active:bg-white/[0.04]";
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {body}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls}>
      {body}
    </button>
  );
}

/** Round icon badge used by the hero, sheet and success states. */
export function IconBadge({ size = 56, className = "", children }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      {children}
    </span>
  );
}
