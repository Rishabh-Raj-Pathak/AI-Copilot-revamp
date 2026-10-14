import { ChevronDown, ChevronUp, Info, X } from "lucide-react";
import BottomSheet from "../BottomSheet.jsx";
import { TOKEN_PARTS } from "../positions/positionsMockData.js";
import { TokenIcon as LayeredTokenIcon } from "../positions/PositionsUi.jsx";
import { tokenIconFor, coinOf, venueLogo } from "./dn2Data.js";
import {
  BRONZE_FILL,
  BRONZE_SMALL_FILL,
  DIVIDER,
  LABEL,
  SHEET_CLASS,
  TILE,
  TOGGLE,
  TOGGLE_OFF,
  TOGGLE_ON,
  TOGGLE_OPTION,
  VALUE,
} from "./dn2Theme.js";

/**
 * Shared Delta Neutral 2 phone pieces (Figma 4476:2). Each one mirrors a
 * recurring Figma layer so the screens are assembled, not re-drawn.
 */

/* ── Marks ────────────────────────────────────────────────────────────── */

/** A venue's logo; Variational has no vendored mark, so it is Figma's "V" disc. */
export function VenueMark({ dex, size = 16 }) {
  const logo = venueLogo(dex);
  if (logo) {
    return <img alt="" src={logo} className="shrink-0 object-contain" style={{ width: size, height: size }} />;
  }
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full bg-[#2a2a33] font-semibold text-[#c9c9ff]"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.6) }}
      aria-hidden
    >
      {String(dex ?? "?").slice(0, 1)}
    </span>
  );
}

/** Figma "Disc / {venue}": logo on a #121212 disc. */
export function VenueDisc({ dex, size = 28, logo = 16, className = "border-2 border-[#0c0a08]" }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-[#121212] ${className}`}
      style={{ width: size, height: size }}
    >
      <VenueMark dex={dex} size={logo} />
    </span>
  );
}

/** Figma "Venue Pair": two discs, the second tucked 8px under the first. */
export function VenuePair({ a, b, size = 28, logo = 16 }) {
  return (
    <span className="flex shrink-0 items-center" aria-hidden>
      <span className="-mr-2">
        <VenueDisc dex={a} size={size} logo={logo} />
      </span>
      <VenueDisc dex={b} size={size} logo={logo} />
    </span>
  );
}

/**
 * Figma "Token / {coin}" — the coin art the app already ships: BTC / ETH / SOL
 * discs, and HYPE as the layered mark the Positions screen draws. A coin with
 * no art gets a letter disc rather than a broken image.
 */
export function TokenIcon({ pair, size = 28 }) {
  const coin = coinOf(pair);
  if (TOKEN_PARTS[coin]) return <LayeredTokenIcon coin={coin} size={size} />;
  const src = tokenIconFor(pair);
  if (src) {
    return <img alt="" src={src} className="shrink-0 rounded-full object-cover" style={{ width: size, height: size }} />;
  }
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-[#121212] font-semibold text-[#e8d5b5]"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.42) }}
      aria-hidden
    >
      {coinOf(pair).slice(0, 1)}
    </span>
  );
}

/* ── Layout bits ──────────────────────────────────────────────────────── */

export function Divider() {
  return <span className={DIVIDER} aria-hidden />;
}

/** Label left, value right — the row every DN2 card is built from. */
export function DataRow({ label, value, tone = "text-[#dcdce8]", labelClassName = "" }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className={`${LABEL} ${labelClassName}`}>{label}</dt>
      <dd className={`text-[12px] leading-4 ${tone}`}>{value}</dd>
    </div>
  );
}

/** Label left, value over a quieter sub line right (estimates, position size). */
export function StackRow({ label, value, sub, tone = "text-[#dcdce8]", size = "text-[13px]", aside = null }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-1.5">
        <dt className={LABEL}>{label}</dt>
        {aside}
      </div>
      <dd className="flex flex-col items-end gap-0.5 text-right">
        <span className={`${size} font-medium leading-4 ${tone}`}>{value}</span>
        {sub ? <span className="text-[10px] leading-[13px] text-[#717182]">{sub}</span> : null}
      </dd>
    </div>
  );
}

/* ── Controls ─────────────────────────────────────────────────────────── */

/** 28px expand / collapse circle on a card header. */
export function ExpandButton({ expanded, onPress, label }) {
  const Icon = expanded ? ChevronUp : ChevronDown;
  return (
    <button
      type="button"
      onClick={onPress}
      aria-expanded={expanded}
      aria-label={label}
      className="app-pressable relative flex size-7 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-[#ccb17f] after:absolute after:-inset-2"
    >
      <Icon size={14} aria-hidden />
    </button>
  );
}

/**
 * Gold Lucide `Info` (Figma "Info"): one drawn glyph, so the "i" is centred in its
 * ring by construction, and it sits on the label's centre line. 16px, with a
 * 40px hit area.
 */
export function InfoButton({ label, onPress }) {
  return (
    <button
      type="button"
      onClick={onPress}
      aria-label={label}
      aria-haspopup="dialog"
      className="app-pressable relative flex size-4 shrink-0 items-center justify-center text-[#ccb17f]/85 after:absolute after:-inset-3 active:text-[#e8d5b5]"
    >
      <Info size={16} strokeWidth={1.75} aria-hidden />
    </button>
  );
}

const BUTTON_SIZES = {
  lg: "h-11 rounded-[22px] px-5 text-[14px] leading-[18px]",
  md: "h-[38px] rounded-[19px] px-4 text-[13px] leading-[18px]",
  // Not rounded-2xl: this repo's radius ladder makes that 12px.
  sm: "h-8 rounded-[16px] px-3 text-[12px] leading-4",
  xs: "h-7 rounded-[14px] px-2.5 text-[12px] leading-4",
};

const BUTTON_VARIANTS = {
  /** Bronze pill, champagne label — one per screen. */
  primary: "border-[rgba(120,90,40,0.6)] text-[#f0ddb9] disabled:border-white/10 disabled:text-[#7f8090]",
  /** Dark pill, gold edge and label. */
  secondary: "border-[rgba(120,90,40,0.45)] bg-[#0f0f0f] text-[#ccb17f]",
  /** Same pill with a champagne label (Variational steps, desktop actions). */
  quiet: "border-[rgba(120,90,40,0.45)] bg-[#0f0f0f] text-[#f0ddb9]",
  /** Bronze row action ("Connect DEX", "Set up"). */
  small: "border-[rgba(120,90,40,0.6)] text-[#f0ddb9]",
  danger: "border-[rgba(248,113,113,0.42)] bg-[#0f0f0f] text-[#f87171]",
};

/** Figma control-scale pill: `size` lg 44 · md 38 · sm 32 · xs 28. */
export function Dn2Button({
  variant = "secondary",
  size = "md",
  className = "",
  children,
  type = "button",
  ...rest
}) {
  const fill = variant === "primary" ? BRONZE_FILL : variant === "small" ? BRONZE_SMALL_FILL : undefined;
  return (
    <button
      type={type}
      style={fill}
      className={`app-pressable flex min-w-0 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap border font-medium disabled:active:scale-100 ${BUTTON_SIZES[size]} ${BUTTON_VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

/** Text-only "Cancel" under a sheet CTA (13 Medium, 40 tall). */
export function CancelButton({ onPress, children = "Cancel" }) {
  return (
    <button
      type="button"
      onClick={onPress}
      className="app-pressable flex h-10 w-full items-center justify-center text-[13px] font-medium leading-[18px] text-[#8f90a1]"
    >
      {children}
    </button>
  );
}

/** Figma "Group Toggle": equal segments, the picked one in bronze. */
export function GroupToggle({ options, value, onChange, ariaLabel, disabled = false, className = "" }) {
  return (
    <div role="tablist" aria-label={ariaLabel} className={`${TOGGLE} ${disabled ? "opacity-50" : ""} ${className}`}>
      {options.map((o) => {
        const on = o.id === value;
        return (
          <button
            key={o.id}
            type="button"
            role="tab"
            aria-selected={on}
            disabled={disabled}
            onClick={() => onChange(o.id)}
            className={`${TOGGLE_OPTION} ${on ? TOGGLE_ON : TOGGLE_OFF}`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ── Badges ───────────────────────────────────────────────────────────── */

/** Gold pill: a pair's category. */
export function GoldBadge({ children, size = "sm" }) {
  return (
    <span
      className={`shrink-0 whitespace-nowrap rounded-full border border-[rgba(204,177,127,0.4)] bg-[rgba(204,177,127,0.1)] font-semibold uppercase text-[#ccb17f] ${
        size === "md" ? "px-2 py-0.5 text-[10px] leading-[13px]" : "px-[7px] py-0.5 text-[9px] leading-3 tracking-[0.4px]"
      }`}
    >
      {children}
    </span>
  );
}

/** Long (green) / short (red) pill — also carries "Close Long" etc. */
export function SideBadge({ side, children }) {
  const long = side === "long";
  return (
    <span
      className={`shrink-0 whitespace-nowrap rounded-full border px-[7px] py-0.5 text-[9px] font-semibold uppercase leading-3 tracking-[0.4px] ${
        long
          ? "border-[rgba(0,188,125,0.25)] bg-[rgba(0,188,125,0.1)] text-[#00d492]"
          : "border-[rgba(251,44,54,0.25)] bg-[rgba(251,44,54,0.1)] text-[#ff6467]"
      }`}
    >
      {children ?? (long ? "Long" : "Short")}
    </span>
  );
}

/* ── Sheets ───────────────────────────────────────────────────────────── */

/** Figma "Sheet / Header": handle, centred champagne title, 32px close. */
function SheetHead({ title, titleId, onClose, dragHandleProps }) {
  return (
    <div
      className="flex shrink-0 touch-none select-none flex-col items-center gap-3 border-b border-white/[0.06] px-4 pb-3 pt-2"
      {...dragHandleProps}
    >
      <span className="h-1 w-10 shrink-0 rounded-full bg-[#3a3026]" aria-hidden />
      <div className="flex h-9 w-full items-center">
        <span className="size-8 shrink-0" aria-hidden />
        <h2 id={titleId} className="min-w-0 flex-1 truncate text-center text-[16px] font-semibold leading-6 text-[#e8d5b5]">
          {title}
        </h2>
        <SheetCloseButton onPress={onClose} />
      </div>
    </div>
  );
}

export function SheetCloseButton({ onPress }) {
  return (
    <button
      type="button"
      onClick={onPress}
      aria-label="Close"
      className="app-pressable relative flex size-8 shrink-0 items-center justify-center rounded-full text-[#8f90a1] after:absolute after:-inset-1.5 active:bg-white/[0.06]"
    >
      <X size={20} aria-hidden />
    </button>
  );
}

/**
 * The kit's `BottomSheet` in the vault theme: warm-black gradient, bronze
 * edge, champagne title. Pass `header` to draw a custom head (chart,
 * Variational) — it still gets the drag props.
 */
export function Dn2Sheet({ title, header, children, bodyClassName = "", ...rest }) {
  return (
    <BottomSheet
      {...rest}
      title={title}
      className={SHEET_CLASS}
      footerClassName="border-white/[0.06] bg-transparent"
      bodyClassName={bodyClassName}
      header={
        header ??
        (({ dragHandleProps, titleId }) => (
          <SheetHead title={title} titleId={titleId} onClose={rest.onClose} dragHandleProps={dragHandleProps} />
        ))
      }
    >
      {children}
    </BottomSheet>
  );
}

/** Figma "Vault Summary": the vault a sheet acts on — its name and venues; `aside` for a status. */
export function VaultSummaryTile({ vault, aside = null }) {
  return (
    <div className={`${TILE} flex items-center gap-2.5 px-3 py-2.5`}>
      <VenuePair a={vault.longAccount} b={vault.shortAccount} size={24} logo={14} />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="truncate text-[14px] font-medium leading-[18px] text-[#e8d5b5]">{vault.pair}</p>
        <p className="whitespace-pre text-[11px] leading-[14px] text-[#8f90a1]">
          {`${vault.longAccount}  ⇄  ${vault.shortAccount}`}
        </p>
      </div>
      {aside}
    </div>
  );
}

/** Figma "Empty State" (A4): centred title, message, one 44px action. */
export function EmptyCard({ title, message, action = null }) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-[16px] border border-white/10 bg-[rgba(14,14,16,0.88)] px-5 pb-5 pt-7 text-center">
      <p className="text-[15px] font-medium leading-5 text-[#e8d5b5]">{title}</p>
      {message ? <p className="text-[12px] leading-[17px] text-[#8f90a1]">{message}</p> : null}
      {action ? <div className="mt-2.5 w-full">{action}</div> : null}
    </div>
  );
}

export { LABEL, VALUE };
