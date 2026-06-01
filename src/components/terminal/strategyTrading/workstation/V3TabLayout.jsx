/** Shared divider-based layout for Strategy Copilot v3 workspace tabs. */

export function V3TabShell({ children }) {
  return <div className="flex flex-col">{children}</div>;
}

/** Top block: actions, intro copy, primary controls. */
export function V3TabLead({ children, className = "" }) {
  return (
    <section
      className={`border-b border-white/6 py-5 ${className}`.trim()}
    >
      {children}
    </section>
  );
}

/** Title → description → actions (shared v2 / v3 workspace tab lead). */
export function CopilotTabLead({
  title,
  description,
  actions = null,
  isV3 = true,
  className = "",
}) {
  const titleClass = isV3
    ? v3SectionTitle
    : "text-sm font-bold text-white";
  const bodyClass = isV3
    ? `mt-2 max-w-xl ${v3BodyText}`
    : "mt-2 max-w-xl text-xs leading-relaxed text-[#929292]";

  return (
    <section
      className={`border-b border-white/6 ${isV3 ? "py-5" : "pb-4 pt-0"} ${className}`.trim()}
    >
      <h4 className={titleClass}>{title}</h4>
      {description ? <p className={bodyClass}>{description}</p> : null}
      {actions ? (
        <div className="mt-4 flex flex-wrap items-center gap-3">{actions}</div>
      ) : null}
    </section>
  );
}

/** Standard section with bottom divider. */
export function V3TabSection({ children, className = "", divider = true }) {
  return (
    <section
      className={`py-5 ${divider ? "border-b border-white/6" : ""} ${className}`.trim()}
    >
      {children}
    </section>
  );
}

/** Two-column split (Status / AI notes, etc.). */
export function V3TabSplit({ left, right, className = "" }) {
  return (
    <section
      className={`grid sm:grid-cols-2 sm:items-start ${className}`.trim()}
    >
      <div className="border-b border-white/6 py-5 sm:border-b-0 sm:py-5 sm:pr-8">
        {left}
      </div>
      <div className="py-5 sm:border-l sm:border-white/6 sm:pl-8">
        {right}
      </div>
    </section>
  );
}

export const v3SectionTitle =
  "text-sm font-medium tracking-tight text-[rgba(255,255,255,0.9)]";

export const v3BodyText =
  "text-[13px] leading-relaxed text-[rgba(255,255,255,0.58)]";

export const v3LabelText =
  "text-[11px] font-medium uppercase tracking-wide text-[rgba(255,255,255,0.45)]";

export const v3DetailText =
  "text-[12px] leading-relaxed text-[rgba(255,255,255,0.62)]";
