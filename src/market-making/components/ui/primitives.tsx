import { useState, type ReactNode } from 'react'
import { cx } from '../../lib/cx'

/* ---------------------------------------------------------------- icons -- */

export function IconInfo({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={cx('h-3.5 w-3.5', className)}>
      <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.2" />
      <path d="M8 7.1v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="8" cy="4.9" r="0.85" fill="currentColor" />
    </svg>
  )
}

export function IconChevron({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={cx('h-3.5 w-3.5', className)}>
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconCheck({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={cx('h-3.5 w-3.5', className)}>
      <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconPlus({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={cx('h-3.5 w-3.5', className)}>
      <path d="M8 3.5v9M3.5 8h9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

export function IconSearch({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={cx('h-3.5 w-3.5', className)}>
      <circle cx="7.2" cy="7.2" r="4.2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10.4 10.4l3.1 3.1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

export function IconArrowLeft({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={cx('h-3.5 w-3.5', className)}>
      <path d="M9.5 3.5L5 8l4.5 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconShare({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={cx('h-3.5 w-3.5', className)}>
      <path d="M8 10.5V2.8M8 2.8L5.4 5.4M8 2.8l2.6 2.6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.2 9.4v3.1h9.6V9.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconWarn({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={cx('h-3.5 w-3.5', className)}>
      <path d="M8 2.4l6 11H2l6-11z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M8 6.6v3.1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="8" cy="11.5" r="0.75" fill="currentColor" />
    </svg>
  )
}

/** Strategy glyphs. Simple line marks, no fills, no colour of their own */
export function StrategyGlyph({ id, className = '' }: { id: string; className?: string }) {
  const common = { stroke: 'currentColor', strokeWidth: 1.3, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  return (
    <svg viewBox="0 0 20 20" fill="none" className={cx('h-4 w-4', className)}>
      {id === 'adaptive' && <path d="M2 13.5c2.4 0 2.6-7 5-7s2.6 7 5 7 2.6-4 4-4" {...common} />}
      {id === 'tight' && (
        <>
          <path d="M3 7.5h14M3 12.5h14" {...common} />
          <path d="M10 4.5v2M10 13.5v2" {...common} />
        </>
      )}
      {id === 'passive' && (
        <>
          <path d="M3 5.5h14M3 14.5h14" {...common} />
          <path d="M10 8v4" {...common} />
        </>
      )}
      {id === 'sniper' && (
        <>
          <circle cx="10" cy="10" r="5.5" {...common} />
          <path d="M10 1.8v3M10 15.2v3M1.8 10h3M15.2 10h3" {...common} />
        </>
      )}
    </svg>
  )
}

/** Small mark for each market category. Same line language as StrategyGlyph. */
export function CategoryGlyph({ id, className = '' }: { id: string; className?: string }) {
  const common = { stroke: 'currentColor', strokeWidth: 1.3, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  return (
    <svg viewBox="0 0 20 20" fill="none" className={cx('h-4 w-4', className)}>
      {id === 'Top Picks' && (
        <>
          <path d="M6.5 3.5h7v3.2a3.5 3.5 0 0 1-7 0V3.5Z" {...common} />
          <path d="M6.5 4.8H4.6a2 2 0 0 0 1.9 2M13.5 4.8h1.9a2 2 0 0 1-1.9 2" {...common} />
          <path d="M10 10.2v3.3M7.4 16.5h5.2" {...common} />
        </>
      )}
      {id === 'Bluechip' && (
        <>
          <path d="M10 3.2l5.2 4.3-5.2 9.3-5.2-9.3L10 3.2Z" {...common} />
          <path d="M4.8 7.5h10.4" {...common} />
        </>
      )}
      {id === 'Stocks' && (
        <>
          <path d="M3.4 13.6l4-4 2.8 2.8 5.4-5.4" {...common} />
          <path d="M11.8 7h4.2v4.2" {...common} />
        </>
      )}
      {id === 'Commodities' && (
        <>
          <circle cx="10" cy="10" r="6.4" {...common} />
          <ellipse cx="10" cy="10" rx="2.6" ry="6.4" {...common} />
        </>
      )}
      {id === 'Meme' && <path d="M11.2 2.6L5.4 10.8h3.9l-.5 6.6 5.8-8.6h-3.9l.5-6.2Z" {...common} />}
      {id === 'FX' && (
        <>
          <circle cx="10" cy="10" r="6.4" {...common} />
          <path d="M10 5.4v9.2" {...common} />
          <path d="M12.2 7.7c-.5-.7-1.3-1.1-2.2-1.1-1.2 0-2.2.8-2.2 1.8 0 2.4 4.4 1.2 4.4 3.6 0 1-1 1.8-2.2 1.8-.9 0-1.7-.4-2.2-1.1" {...common} />
        </>
      )}
    </svg>
  )
}

export function IconWallet({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={cx('h-4 w-4', className)}>
      <rect x="1.9" y="3.6" width="12.2" height="9" rx="2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M1.9 6.6h12.2" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="11.1" cy="9.7" r="0.9" fill="currentColor" />
    </svg>
  )
}

/** Venue marks. Distinct geometric glyphs drawn in each venue's own tint */
export function VenueGlyph({ id, tint, className = '' }: { id: string; tint: string; className?: string }) {
  const s = { stroke: tint, strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  return (
    <svg viewBox="0 0 20 20" fill="none" className={cx('h-[18px] w-[18px] shrink-0', className)}>
      {id === 'hyperliquid' && (
        <path d="M2.8 4.6L9.1 10l-6.3 5.4V4.6zM17.2 4.6L10.9 10l6.3 5.4V4.6z" fill={tint} />
      )}
      {id === 'pacifica' && (
        <path d="M10 2.6c1 3.4 3 5.4 6.4 6.4-3.4 1-5.4 3-6.4 6.4-1-3.4-3-5.4-6.4-6.4 3.4-1 5.4-3 6.4-6.4z" fill={tint} />
      )}
      {id === 'nado' && <path d="M16.6 3.6L3.4 8.9l4.8 1.9 1.9 4.8 6.5-12z" {...s} />}
      {id === 'avantis' && <path d="M3.4 16L10 3.8 16.6 16M6.4 12.4h7.2" {...s} />}
      {(id === 'zklighter' || id === 'lighter') && (
        <path d="M11.4 2.6L4.6 11h4.2l-1 6.4L16 8.6h-4.6l1-6z" fill={tint} />
      )}
    </svg>
  )
}

/* ------------------------------------------------------------- tooltips -- */

export function InfoTip({ text, align = 'right' }: { text: string; align?: 'left' | 'right' }) {
  const [open, setOpen] = useState(false)
  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-label="More information"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((v) => !v)}
        className="text-mm-ink-5 transition-colors hover:text-mm-gold-300"
      >
        <IconInfo />
      </button>
      {open && (
        <span
          role="tooltip"
          className={cx(
            'absolute bottom-full z-30 mb-2 w-64 rounded-[10px] border border-white/10 bg-mm-elevated px-3 py-2 text-[12px] leading-[18px] font-normal tracking-normal normal-case text-mm-ink-3 shadow-[0_8px_24px_rgba(0,0,0,0.6)]',
            align === 'right' ? 'left-1/2 -translate-x-1/2' : 'right-0',
          )}
        >
          {text}
        </span>
      )}
    </span>
  )
}

/* --------------------------------------------------------- containers ---- */

/** Outer config panel. Everything on Configure lives inside one of these */
export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cx('rounded-[20px] border border-white/[0.06] p-3 sm:p-4', className)}
      style={{
        backgroundImage:
          'linear-gradient(226.75deg, rgba(22,20,18,0.76) 1.98%, rgba(14,12,10,0.784) 87.36%)',
      }}
    >
      {children}
    </div>
  )
}

/** Labelled section inside the outer panel */
export function Section({
  label,
  tip,
  right,
  children,
}: {
  label: string
  tip?: string
  right?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="rounded-[16px] border border-white/[0.05] bg-mm-recessed/70 p-4 sm:p-5">
      <header className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <h3 className="mm-micro">{label}</h3>
          {tip && <InfoTip text={tip} />}
        </div>
        {right}
      </header>
      {children}
    </section>
  )
}

/** Card used for every stat in the top row */
export function StatCard({
  label,
  value,
  descriptor,
  tone = 'cream',
  tip,
}: {
  label: string
  value: ReactNode
  descriptor: ReactNode
  tone?: 'cream' | 'pos' | 'neg' | 'muted'
  tip?: string
}) {
  const toneClass =
    tone === 'pos' ? 'text-mm-pos' : tone === 'neg' ? 'text-mm-neg' : tone === 'muted' ? 'text-mm-ink-4' : 'text-mm-gold-50'
  return (
    <div
      className="rounded-[16px] border border-white/[0.05] p-5"
      style={{
        backgroundImage:
          'linear-gradient(226.75deg, rgba(22,20,18,0.76) 1.98%, rgba(14,12,10,0.784) 87.36%)',
      }}
    >
      <div className="flex items-center gap-1.5">
        <span className="mm-micro-muted">{label}</span>
        {tip && <InfoTip text={tip} />}
      </div>
      <div className={cx('mm-num mt-3 text-[28px] leading-none font-semibold tracking-tight', toneClass)}>
        {value}
      </div>
      <div className="mt-2.5 text-[12px] leading-[18px] text-mm-ink-5">{descriptor}</div>
    </div>
  )
}

/** Page size used by every strategy list. */
export const PAGE_SIZE = 10

/**
 * Compact pager. Stays on screen whenever the list has rows — even at a single
 * page — so the count is always readable and the control never appears to
 * vanish. It only drops out when there is nothing to page through at all.
 */
export function Pager({
  page,
  pages,
  total,
  rangeLabel,
  onChange,
}: {
  page: number
  pages: number
  /** Rows across every page. The pager hides only when this is zero. */
  total: number
  rangeLabel: string
  onChange: (p: number) => void
}) {
  if (total === 0) return null

  const step = (to: number) => () => onChange(Math.max(0, Math.min(pages - 1, to)))

  return (
    <div className="mt-3 flex flex-wrap items-center justify-end gap-x-4 gap-y-2">
      <span className="mm-micro-muted">{rangeLabel}</span>
      <div className="flex items-center gap-2">
        <PagerStep label="Previous page" disabled={page === 0} onClick={step(page - 1)} back />
        <span className="mm-num text-[11px] text-mm-ink-4">
          {page + 1} / {pages}
        </span>
        <PagerStep label="Next page" disabled={page === pages - 1} onClick={step(page + 1)} />
      </div>
    </div>
  )
}

function PagerStep({
  label,
  disabled,
  onClick,
  back,
}: {
  label: string
  disabled: boolean
  onClick: () => void
  back?: boolean
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cx(
        'rounded-[8px] border border-white/[0.09] p-1.5 transition-colors',
        disabled
          ? 'cursor-not-allowed text-mm-ink-6 opacity-40'
          : 'text-mm-ink-3 hover:bg-white/[0.05] hover:text-mm-ink-1',
      )}
    >
      <IconChevron className={back ? 'rotate-90' : '-rotate-90'} />
    </button>
  )
}

/* ------------------------------------------------------------- controls -- */

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  size = 'md',
}: {
  options: { id: T; label: string; disabled?: boolean }[]
  value: T
  onChange: (v: T) => void
  size?: 'sm' | 'md'
}) {
  return (
    <div
      className={cx(
        'inline-flex rounded-full border border-white/[0.05] bg-mm-surface',
        size === 'sm' ? 'gap-0.5 p-[3px]' : 'gap-1 p-1',
      )}
      style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)' }}
    >
      {options.map((o) => {
        const active = o.id === value
        return (
          <button
            key={o.id}
            type="button"
            disabled={o.disabled}
            onClick={() => onChange(o.id)}
            className={cx(
              'rounded-full font-medium tracking-[0.06em] uppercase transition-all',
              size === 'sm' ? 'px-3 py-1 text-[10px]' : 'px-4 py-1.5 text-[11px]',
              active ? 'text-mm-gold-200' : 'text-mm-ink-5 hover:bg-white/[0.04] hover:text-mm-ink-3',
              o.disabled && 'cursor-not-allowed opacity-40 hover:bg-transparent',
            )}
            style={
              active
                ? {
                    backgroundImage: 'linear-gradient(to bottom, #1a140b, #0f0e0c)',
                    border: '0.8px solid #785a28',
                    boxShadow: 'inset 0 0 4px 1px rgba(0,0,0,0.5)',
                  }
                : { border: '0.8px solid transparent' }
            }
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

/** Selectable card. Gold outline when active, exactly like the PERP toggle */
export function SelectCard({
  active,
  disabled,
  quiet,
  onClick,
  children,
  className,
}: {
  active: boolean
  disabled?: boolean
  /** Drops the hover treatment, for a card that is stated rather than chosen. */
  quiet?: boolean
  onClick?: () => void
  children: ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={active}
      className={cx(
        'w-full rounded-[14px] p-4 text-left transition-all',
        disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer',
        !active && !disabled && !quiet && 'hover:border-white/10 hover:bg-white/[0.02]',
        className,
      )}
      style={{
        border: active ? '1px solid rgba(204,177,127,0.55)' : '1px solid rgba(255,255,255,0.06)',
        backgroundImage: active
          ? 'linear-gradient(to bottom, #1a140b, #0f0e0c)'
          : 'linear-gradient(to bottom, rgba(255,255,255,0.012), rgba(255,255,255,0))',
        boxShadow: active ? '0 0 15px -5px rgba(204,177,127,0.35)' : undefined,
      }}
    >
      {children}
    </button>
  )
}

export function Radio({ active }: { active: boolean }) {
  return (
    <span
      className={cx(
        'flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-full border transition-colors',
        active ? 'border-mm-gold-300' : 'border-white/15',
      )}
    >
      {active && <span className="h-[7px] w-[7px] rounded-full bg-mm-gold-300" />}
    </span>
  )
}

export function Toggle({
  checked,
  onChange,
  label,
  id,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  id: string
}) {
  return (
    <label htmlFor={id} className="inline-flex cursor-pointer items-center gap-2.5">
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="relative h-[20px] w-[36px] shrink-0 rounded-full transition-colors"
        style={{
          backgroundColor: checked ? 'rgba(204,177,127,0.28)' : 'rgba(255,255,255,0.07)',
          border: checked ? '1px solid rgba(204,177,127,0.5)' : '1px solid rgba(255,255,255,0.08)',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.45)',
        }}
      >
        <span
          className="absolute top-1/2 h-[13px] w-[13px] -translate-y-1/2 rounded-full transition-all"
          style={{
            left: checked ? 'calc(100% - 16px)' : '3px',
            backgroundImage: checked
              ? 'linear-gradient(to bottom, #f2ddb5, #ba8f52)'
              : 'linear-gradient(to bottom, #6a6a6a, #444)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.5)',
          }}
        />
      </button>
      <span className="text-[13px] text-mm-ink-3">{label}</span>
    </label>
  )
}

/** Recessed money input with a carved-in well */
export function MoneyInput({
  value,
  onChange,
  prefix = '$',
  suffix,
  max,
  onMax,
  ariaLabel,
}: {
  value: number
  onChange: (v: number) => void
  prefix?: string
  suffix?: string
  max?: number
  onMax?: () => void
  ariaLabel: string
}) {
  return (
    <div
      className="flex items-center gap-2 rounded-[10px] border border-white/[0.05] bg-mm-recessed px-3.5 py-2.5"
      style={{ boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.4)' }}
    >
      <span className="text-[15px] text-mm-gold-300">{prefix}</span>
      <input
        aria-label={ariaLabel}
        type="number"
        value={Number.isFinite(value) ? value : ''}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mm-num w-full bg-transparent text-[18px] font-semibold text-mm-ink-1 outline-none placeholder:text-mm-ink-6"
        placeholder="0"
      />
      {suffix && <span className="mm-micro-muted shrink-0">{suffix}</span>}
      {onMax && max !== undefined && (
        <>
          <span className="h-5 w-px shrink-0 bg-white/[0.07]" />
          <button
            type="button"
            onClick={onMax}
            className="shrink-0 text-[13px] font-semibold tracking-[0.02em] text-mm-gold-300 uppercase transition-colors hover:text-mm-gold-100"
          >
            Max
          </button>
        </>
      )}
    </div>
  )
}

/* -------------------------------------------------------------- buttons -- */

/** Primary CTA. The yellow to green gradient used by Deposit and Swap */
export function GradientButton({
  children,
  onClick,
  disabled,
  className,
}: {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cx(
        'w-full rounded-[12px] px-5 py-3.5 text-[14px] font-semibold tracking-[0.02em] transition-all',
        disabled
          ? 'cursor-not-allowed text-mm-ink-6'
          : 'cursor-pointer text-[#0a0a0a] hover:brightness-110 active:translate-y-px',
        className,
      )}
      style={
        disabled
          ? { backgroundColor: '#171717', border: '1px solid rgba(255,255,255,0.05)' }
          : {
              backgroundImage: 'linear-gradient(96deg, #e9d24b 0%, #b6d84f 48%, #34d17e 100%)',
              boxShadow: '0 4px 14px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.25)',
            }
      }
    >
      {children}
    </button>
  )
}

export function GhostButton({
  children,
  onClick,
  className,
}: {
  children: ReactNode
  onClick?: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        'rounded-[12px] border border-white/[0.08] bg-transparent px-5 py-3.5 text-[14px] font-medium text-mm-ink-3 transition-colors hover:border-white/15 hover:bg-white/[0.03] hover:text-mm-ink-1',
        className,
      )}
    >
      {children}
    </button>
  )
}

/** Small dark button with a gold rim. Used for Deposit and Connect */
export function GoldButton({
  children,
  onClick,
  className,
}: {
  children: ReactNode
  onClick?: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        'rounded-[10px] px-3.5 py-2 text-[11px] font-medium tracking-[0.06em] text-mm-gold-100 uppercase transition-colors hover:bg-mm-gold-600/15 hover:text-mm-gold-50 active:translate-y-px',
        className,
      )}
      style={{
        backgroundImage: 'linear-gradient(to bottom, #2a2117, #16120d)',
        border: '1px solid rgba(204,177,127,0.45)',
      }}
    >
      {children}
    </button>
  )
}

/* ---------------------------------------------------------------- chips -- */

export function Badge({ children, tone = 'gold' }: { children: ReactNode; tone?: 'gold' | 'muted' }) {
  return (
    <span
      className={cx(
        'shrink-0 rounded-md px-1.5 py-[3px] text-[9px] leading-none font-semibold tracking-[0.08em] uppercase',
        tone === 'gold' ? 'text-mm-gold-200' : 'text-mm-ink-5',
      )}
      style={{
        border: tone === 'gold' ? '1px solid rgba(120,90,40,0.55)' : '1px solid rgba(255,255,255,0.08)',
        backgroundColor: tone === 'gold' ? 'rgba(120,90,40,0.14)' : 'transparent',
      }}
    >
      {children}
    </span>
  )
}

export type Status = 'Standby' | 'Active' | 'Paused' | 'Ended'

export function StatusPill({ status }: { status: Status }) {
  const dot =
    status === 'Active' ? 'bg-mm-pos' : status === 'Paused' ? 'bg-mm-gold-300' : status === 'Ended' ? 'bg-mm-neg' : 'bg-mm-ink-5'
  const text =
    status === 'Active' ? 'text-mm-pos' : status === 'Paused' ? 'text-mm-gold-200' : status === 'Ended' ? 'text-mm-neg' : 'text-mm-ink-4'
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-mm-surface px-3 py-1.5">
      <span className={cx('h-[7px] w-[7px] rounded-full', dot)}>
        {status === 'Active' && <span className={cx('block h-full w-full animate-ping rounded-full', dot)} />}
      </span>
      <span className={cx('text-[11px] font-medium tracking-[0.08em] uppercase', text)}>{status}</span>
    </span>
  )
}

/** Risk chip used on the account card */
export function RiskChip({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.07] bg-white/[0.02] px-2 py-1">
      <span className="mm-micro-muted">{label}</span>
      <span className="mm-num text-[12px] font-medium text-mm-ink-2">{value}</span>
    </span>
  )
}

/** Inline warning block. Used when a guard is switched off */
export function WarnBlock({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex items-start gap-2.5 rounded-[10px] px-3.5 py-3"
      style={{
        border: '1px solid rgba(229,72,77,0.28)',
        backgroundColor: 'rgba(229,72,77,0.07)',
      }}
    >
      <span className="mt-px text-mm-neg">
        <IconWarn />
      </span>
      <p className="text-[12px] leading-[18px] text-[#e9a5a7]">{children}</p>
    </div>
  )
}

/** Derived read-out under a control. States consequences in plain English */
export function DerivedLine({ children }: { children: ReactNode }) {
  return <p className="mm-mono text-[12px] leading-[18px] text-mm-ink-5">{children}</p>
}
