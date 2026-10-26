import { useEffect, useState, type ButtonHTMLAttributes, type ReactNode } from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { EYEBROW, EYEBROW_MUTED, MONO, cn, type Phase } from './lib'

/*
 * Production's Market Making primitives, one for one. Class strings are the
 * ones the production bundle renders after its tailwind-merge pass, written
 * for Tailwind v4 where the syntax differs (`w-(--var)` for `w-[--var]`).
 * Two of its theme tokens are spelled out: `rounded-md` is 10px there and
 * `rounded-lg` 12px, which this app's theme sets differently.
 */

/* ------------------------------------------------------------- icons -- */

type IconProps = { className?: string }

export function IconInfo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className={cn('h-3.5 w-3.5', className)}>
      <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.2" />
      <path d="M8 7.1v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="8" cy="4.9" r="0.85" fill="currentColor" />
    </svg>
  )
}

export function IconChevron({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className={cn('h-3.5 w-3.5', className)}>
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconCheck({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className={cn('h-3.5 w-3.5', className)}>
      <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconPlus({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className={cn('h-3.5 w-3.5', className)}>
      <path d="M8 3.5v9M3.5 8h9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

export function IconSearch({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className={cn('h-3.5 w-3.5', className)}>
      <circle cx="7.2" cy="7.2" r="4.2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10.4 10.4l3.1 3.1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

export function IconBack({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className={cn('h-3.5 w-3.5', className)}>
      <path d="M9.5 3.5L5 8l4.5 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconWarning({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className={cn('h-3.5 w-3.5', className)}>
      <path d="M8 2.4l6 11H2l6-11z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M8 6.6v3.1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="8" cy="11.5" r="0.75" fill="currentColor" />
    </svg>
  )
}

export function IconWallet({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className={cn('h-4 w-4', className)}>
      <rect x="1.9" y="3.6" width="12.2" height="9" rx="2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M1.9 6.6h12.2" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="11.1" cy="9.7" r="0.9" fill="currentColor" />
    </svg>
  )
}

export function IconPause({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className={cn('h-3.5 w-3.5', className)}>
      <path d="M5.6 4v8M10.4 4v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export function IconDrawdown({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className={cn('h-3.5 w-3.5', className)}>
      <path
        d="M8 3v6.9M5.2 7.2L8 10l2.8-2.8M3.2 13h9.6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function IconClock({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className={cn('h-3.5 w-3.5', className)}>
      <circle cx="8" cy="8" r="5.9" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 5v3l2 1.3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconStop({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className={cn('h-3.5 w-3.5', className)}>
      <rect x="4.5" y="4.5" width="7" height="7" rx="1.5" fill="currentColor" />
    </svg>
  )
}

/** lucide-react's LoaderCircle, the spinner production uses. */
export function Spinner({ className, label }: IconProps & { label?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={label ? undefined : 'true'}
      aria-label={label}
      className={cn('animate-spin', className)}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}

const GLYPH = { stroke: 'currentColor', strokeWidth: 1.3, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

/** The market filter's category marks. */
export function CategoryGlyph({ id, className }: { id: string; className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={cn('h-4 w-4', className)}>
      {id === 'Top Picks' && (
        <>
          <path d="M6.5 3.5h7v3.2a3.5 3.5 0 0 1-7 0V3.5Z" {...GLYPH} />
          <path d="M6.5 4.8H4.6a2 2 0 0 0 1.9 2M13.5 4.8h1.9a2 2 0 0 1-1.9 2" {...GLYPH} />
          <path d="M10 10.2v3.3M7.4 16.5h5.2" {...GLYPH} />
        </>
      )}
      {id === 'Bluechip' && (
        <>
          <path d="M10 3.2l5.2 4.3-5.2 9.3-5.2-9.3L10 3.2Z" {...GLYPH} />
          <path d="M4.8 7.5h10.4" {...GLYPH} />
        </>
      )}
      {id === 'Stocks' && (
        <>
          <path d="M3.4 13.6l4-4 2.8 2.8 5.4-5.4" {...GLYPH} />
          <path d="M11.8 7h4.2v4.2" {...GLYPH} />
        </>
      )}
      {id === 'Commodities' && (
        <>
          <circle cx="10" cy="10" r="6.4" {...GLYPH} />
          <ellipse cx="10" cy="10" rx="2.6" ry="6.4" {...GLYPH} />
        </>
      )}
      {id === 'Meme' && <path d="M11.2 2.6L5.4 10.8h3.9l-.5 6.6 5.8-8.6h-3.9l.5-6.2Z" {...GLYPH} />}
      {id === 'FX' && (
        <>
          <circle cx="10" cy="10" r="6.4" {...GLYPH} />
          <path d="M10 5.4v9.2" {...GLYPH} />
          <path
            d="M12.2 7.7c-.5-.7-1.3-1.1-2.2-1.1-1.2 0-2.2.8-2.2 1.8 0 2.4 4.4 1.2 4.4 3.6 0 1-1 1.8-2.2 1.8-.9 0-1.7-.4-2.2-1.1"
            {...GLYPH}
          />
        </>
      )}
    </svg>
  )
}

/** Bars for the volume strategy, a wave for every other. */
export function StrategyGlyph({ id, className }: { id: string; className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={cn('h-4 w-4', className)}>
      {id === 'volume' ? (
        <path d="M4 16V10M8.7 16V6M13.3 16V8.5M18 16V3.5" {...GLYPH} />
      ) : (
        <path d="M2 13.5c2.4 0 2.6-7 5-7s2.6 7 5 7 2.6-4 4-4" {...GLYPH} />
      )}
    </svg>
  )
}

/** Production's DEX logos, served from public/market-making/dex. */
const DEX_LOGO: Record<string, string> = {
  hyperliquid: 'Hyperliquid-logo.svg',
  pacifica: 'Pacifica-logo.svg',
  nado: 'Nado-logo.svg',
  variational: 'Variational-logo.svg',
  lighter: 'Lighter-logo.svg',
  lighter_rh: 'lighterRH.svg',
  arcus: 'Arcus-logo.svg',
  decibel: 'Decibel-logo.svg',
}
const DEX_KEY: Record<string, string> = { zkLighter: 'lighter', 'Lighter@Robinhood': 'lighter_rh' }

export function DexLogo({ dex, className }: { dex: string; className?: string }) {
  const file = DEX_LOGO[DEX_KEY[dex] ?? dex.toLowerCase()]
  if (!file) return null
  return (
    <img
      src={`${import.meta.env.BASE_URL}market-making/dex/${file}`}
      alt=""
      aria-hidden
      className={cn('h-4 w-4 shrink-0 object-contain', className)}
    />
  )
}

/* ------------------------------------------------- radix, as styled -- */

const TOOLTIP_CONTENT =
  'mm-root z-50 w-64 max-w-[calc(100vw-2rem)] overflow-visible rounded-[10px] border border-white/10 bg-[#242424] px-3 py-2 text-[12px] font-normal normal-case leading-[18px] tracking-normal text-[#bfbfbf] shadow-[0_8px_24px_rgba(0,0,0,0.6)]'

/** The ⓘ beside a card label. Hover on a pointer, tap on a touch screen. */
export function InfoTip({ text, align = 'right' }: { text: string; align?: 'left' | 'right' }) {
  const touch = useIsTouch()
  const [open, setOpen] = useState(false)
  return (
    <TooltipPrimitive.Provider delayDuration={touch ? 0 : 200}>
      <TooltipPrimitive.Root
        open={touch ? open : undefined}
        onOpenChange={touch ? undefined : setOpen}
        disableHoverableContent={touch}
      >
        <TooltipPrimitive.Trigger asChild>
          <button
            type="button"
            aria-label="More information"
            onClick={touch ? () => setOpen((v) => !v) : undefined}
            className="inline-flex text-[#717182] outline-none transition-colors hover:text-[#ccb17f] focus-visible:text-[#ccb17f]"
          >
            <IconInfo />
          </button>
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side="top"
            align={align === 'right' ? 'center' : 'end'}
            sideOffset={8}
            onPointerDownOutside={() => touch && setOpen(false)}
            className={TOOLTIP_CONTENT}
          >
            {text}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}

function useIsTouch() {
  const [touch, setTouch] = useState(false)
  useEffect(() => {
    const check = () => setTouch('ontouchstart' in window || navigator.maxTouchPoints > 0)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return touch
}

export const Popover = PopoverPrimitive.Root
export const PopoverTrigger = PopoverPrimitive.Trigger

/** Production's popover after its merge with the picker classes. */
export function PopoverContent({
  className,
  align = 'center',
  sideOffset = 4,
  children,
}: {
  className?: string
  align?: 'start' | 'center' | 'end'
  sideOffset?: number
  children: ReactNode
}) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'mm-root z-50 w-72 rounded-[10px] border bg-[#0a0a0a] p-4 shadow-md outline-hidden',
          className,
        )}
      >
        {children}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  )
}

/** The picker dropdown shell, shared by the venue and market lists. */
export const PICKER_MENU =
  'mm-lh z-[130] w-(--radix-popover-trigger-width) overflow-hidden rounded-[14px] border border-[rgba(204,177,127,0.4)] bg-[#15130f] p-0 shadow-[0_16px_40px_rgba(0,0,0,0.75)]'
export const PICKER_ROW = 'mx-1.5 flex w-[calc(100%-12px)] items-center gap-2.5 rounded-[10px] px-2.5 py-2.5 text-left transition-colors'
/** The dropdown trigger: a raised warm grey block. */
export const PICKER =
  'border border-white/[0.1] bg-[linear-gradient(180deg,rgba(29,27,25,0.98)_0%,rgba(21,20,19,0.98)_100%)] cursor-pointer outline-none transition-colors hover:bg-[linear-gradient(180deg,rgba(34,32,30,0.98)_0%,rgba(24,23,22,0.98)_100%)] focus-visible:ring-1 focus-visible:ring-[rgba(214,176,106,0.24)] flex w-full items-center gap-3 rounded-[12px] px-4 py-3.5 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.05),inset_0_2px_6px_rgba(0,0,0,0.25)] disabled:cursor-not-allowed disabled:opacity-50'

/** Production's dialog, merged with the confirm sheet's classes. */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm" />
        <DialogPrimitive.Content className="mm-root mm-lh fixed left-[50%] top-[50%] z-[200] grid w-full max-w-[calc(100%-1.5rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-[14px] border border-[rgba(146,111,56,0.55)] bg-black bg-[linear-gradient(180deg,rgba(12,12,12,0.98)_0%,rgba(6,6,6,0.98)_100%)] p-5 text-[#f5f5f5] shadow-lg duration-200 sm:max-w-md sm:rounded-[12px]">
          <DialogPrimitive.Title className="text-[15px] font-semibold leading-none tracking-tight text-[#e8d5b5]">
            {title}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="text-[13px] leading-[19px] text-[#b4b5c2]">
            {description}
          </DialogPrimitive.Description>
          {children}
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-[8px] opacity-70 transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none">
            <svg viewBox="0 0 15 15" fill="none" aria-hidden="true" className="h-5 w-5">
              <path
                d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
              />
            </svg>
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

/* -------------------------------------------------------- surfaces -- */

const LIGHT = {
  edge: 'radial-gradient(ellipse 45% 24px at 16% 0%, rgba(214,176,106,0.12), transparent)',
  long: 'radial-gradient(ellipse 90% 160px at 14% 0%, rgba(214,176,106,0.11), transparent)',
}

/** The gold-edged frame a screen's main content sits in. */
export function Frame({
  children,
  className,
  light = 'edge',
}: {
  children: ReactNode
  className?: string
  light?: keyof typeof LIGHT
}) {
  return (
    <div
      className={cn('min-w-0 rounded-[20px] border border-[rgba(214,176,106,0.22)] p-3 sm:p-4', className)}
      style={{
        backgroundImage: `${LIGHT[light]}, linear-gradient(180deg, rgba(14,13,12,0.9) 0%, rgba(10,10,10,0.96) 100%)`,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03), inset 0 -8px 18px rgba(0,0,0,0.34)',
      }}
    >
      {children}
    </div>
  )
}

const CARD_FILL = { backgroundImage: 'linear-gradient(180deg, rgb(17,16,14) 0%, rgb(12,11,10) 100%)' }

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-[16px] border border-white/[0.08]', className)} style={CARD_FILL}>
      {children}
    </div>
  )
}

/** A card with a gold label, an optional tip, and a control on the right. */
export function CardSection({
  label,
  tip,
  right,
  children,
  className,
}: {
  label: string
  tip?: string
  right?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={cn('h-full min-w-0 rounded-[16px] border border-white/[0.08] p-4 sm:p-5', className)}
      style={CARD_FILL}
    >
      <header className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <h3 className={EYEBROW}>{label}</h3>
          {tip && <InfoTip text={tip} />}
        </div>
        {right}
      </header>
      {children}
    </section>
  )
}

/** One headline figure. */
export function StatTile({
  title,
  value,
  subtext,
  tone = 'cream',
  tip,
}: {
  title: string
  value: ReactNode
  subtext: ReactNode
  tone?: 'cream' | 'pos' | 'neg'
  tip?: string
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-1.5">
        <span className={EYEBROW_MUTED}>{title}</span>
        {tip && <InfoTip text={tip} />}
      </div>
      <div
        className={cn(
          'mt-2.5 text-[28px] font-semibold tabular-nums leading-[1.15] tracking-tight',
          tone === 'pos'
            ? 'text-[#4ade80]'
            : tone === 'neg'
              ? 'text-[#e5484d]'
              : 'w-fit bg-gradient-to-b from-[#ffffff] via-[#e8d5b5] to-[#ccb17f] bg-clip-text text-transparent',
        )}
      >
        {value}
      </div>
      <div className="mt-2.5 text-[12px] leading-[18px] text-[#717182]">{subtext}</div>
    </Card>
  )
}

/** A label over a figure, inside a card. */
export function Counter({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <div className={EYEBROW_MUTED}>{label}</div>
      <div className="mt-1 text-[15px] font-medium tabular-nums text-[#f5f5f5]">{value}</div>
    </div>
  )
}

/** The fading hairline between groups in a card. */
export function Hairline({ className }: { className?: string }) {
  return (
    <div
      className={cn('my-4 h-px bg-[linear-gradient(to_right,transparent,rgba(255,255,255,0.1),transparent)]', className)}
    />
  )
}

/* --------------------------------------------------------- controls -- */

/** The green-to-gold primary action. */
export function GradientButton({ children, className, disabled, ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        'w-full rounded-[12px] px-5 py-3.5 text-[14px] font-semibold tracking-[0.02em] transition-all',
        disabled
          ? 'cursor-not-allowed border border-white/[0.05] bg-[#171717] text-[#63646f]'
          : 'cursor-pointer bg-[linear-gradient(96deg,#e9d24b_0%,#b6d84f_48%,#34d17e_100%)] text-[#0a0a0a] shadow-[0_4px_14px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.25)] hover:brightness-110 active:translate-y-px',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}

/** Dark brown under a gold hairline: Deposit, Connect DEX, View Agent, Edit. */
export function GoldButton({
  children,
  onClick,
  className,
  disabled,
}: {
  children: ReactNode
  onClick?: () => void
  className?: string
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-[rgba(173,134,73,0.56)] bg-[linear-gradient(180deg,rgba(50,40,28,0.98)_0%,rgba(27,22,16,0.99)_100%)] px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.7px] text-[#f0ddb9] outline-none transition-colors hover:border-[rgba(206,163,95,0.74)] focus-visible:ring-1 focus-visible:ring-[rgba(214,176,106,0.4)] active:translate-y-px',
        disabled && 'cursor-not-allowed opacity-40 hover:border-[rgba(173,134,73,0.56)] active:translate-y-0',
        className,
      )}
    >
      {children}
    </button>
  )
}

/** The raised grey action: View Results. */
export const QUIET_BUTTON =
  'inline-flex cursor-pointer items-center justify-center gap-2 border border-white/[0.1] bg-[linear-gradient(180deg,rgba(29,27,25,0.98)_0%,rgba(21,20,19,0.98)_100%)] font-semibold uppercase tracking-[0.7px] text-[#d4d4d8] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] outline-none transition-colors hover:bg-[linear-gradient(180deg,rgba(34,32,30,0.98)_0%,rgba(24,23,22,0.98)_100%)] hover:text-[#f5f5f5] focus-visible:ring-1 focus-visible:ring-[rgba(214,176,106,0.24)] active:translate-y-px'

/** Green when connected, grey when not. */
export function ConnectionDot({ connected, className }: { connected: boolean; className?: string }) {
  return (
    <span
      className={cn('inline-block h-[7px] w-[7px] shrink-0 rounded-full', connected ? 'bg-[#4ade80]' : 'bg-[#63646f]', className)}
      title={connected ? 'Connected' : 'Not connected'}
      aria-hidden
    />
  )
}

export function Badge({ children, tone = 'gold' }: { children: ReactNode; tone?: 'gold' | 'muted' }) {
  return (
    <span
      className={cn(
        'shrink-0 rounded-[10px] border px-1.5 py-[3px] text-[9px] font-semibold uppercase leading-none tracking-[0.08em]',
        tone === 'gold'
          ? 'border-[rgba(120,90,40,0.55)] bg-[rgba(120,90,40,0.14)] text-[#e8d5b5]'
          : 'border-white/[0.08] bg-transparent text-[#717182]',
      )}
    >
      {children}
    </span>
  )
}

export function Toggle({
  checked,
  onChange,
  label,
  id,
  disabled,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  id: string
  disabled?: boolean
}) {
  return (
    <label htmlFor={id} className={cn('inline-flex items-center gap-2.5', disabled ? 'cursor-not-allowed' : 'cursor-pointer')}>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-[20px] w-[36px] shrink-0 rounded-full border shadow-[inset_0_1px_3px_rgba(0,0,0,0.45)] transition-colors disabled:cursor-not-allowed',
          checked ? 'border-[rgba(204,177,127,0.5)] bg-[rgba(204,177,127,0.28)]' : 'border-white/[0.08] bg-white/[0.07]',
        )}
      >
        <span
          className={cn(
            'absolute top-1/2 h-[13px] w-[13px] -translate-y-1/2 rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.5)] transition-all',
            checked
              ? 'left-[calc(100%-16px)] bg-[linear-gradient(to_bottom,#f2ddb5,#ba8f52)]'
              : 'left-[3px] bg-[linear-gradient(to_bottom,#6a6a6a,#444)]',
          )}
        />
      </button>
      <span className="text-[13px] text-[#bfbfbf]">{label}</span>
    </label>
  )
}

/** Gold-filled pick on a raised track: Cross/Isolated, Min/Hr, All/Active/Completed. */
export function ChoiceToggle<T extends string>({
  options,
  value,
  onChange,
  size = 'md',
  ariaLabel,
}: {
  options: { id: T; label: string; disabled?: boolean }[]
  value: T
  onChange: (v: T) => void
  size?: 'sm' | 'md'
  ariaLabel: string
}) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn(
        'inline-flex rounded-full border border-white/[0.1] bg-[linear-gradient(180deg,rgba(29,27,25,0.98)_0%,rgba(21,20,19,0.98)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]',
        size === 'sm' ? 'gap-0.5 p-[3px]' : 'gap-1 p-1',
      )}
    >
      {options.map((o) => {
        const active = o.id === value
        return (
          <button
            key={o.id}
            type="button"
            aria-pressed={active}
            disabled={o.disabled}
            onClick={() => onChange(o.id)}
            className={cn(
              'rounded-full font-semibold uppercase tracking-[0.7px] outline-none transition-colors focus-visible:ring-1 focus-visible:ring-[rgba(214,176,106,0.4)]',
              size === 'sm' ? 'px-3 py-1 text-[10px]' : 'px-4 py-1.5 text-[11px]',
              active
                ? 'border border-[rgba(173,134,73,0.56)] bg-[linear-gradient(180deg,rgba(50,40,28,0.98)_0%,rgba(27,22,16,0.99)_100%)] text-[#f0ddb9]'
                : o.disabled
                  ? 'cursor-not-allowed border border-transparent text-[#8f90a1] opacity-40'
                  : 'cursor-pointer border border-transparent text-[#8f90a1] hover:bg-white/[0.05] hover:text-[#f5f5f5]',
            )}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

/** The Configure / Dashboard switch beside the page title. */
export function PageSwitch<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: { id: T; label: string }[]
  value: T
  onChange: (v: T) => void
  ariaLabel: string
}) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="inline-flex gap-1 rounded-full border border-white/[0.05] bg-[#121212] p-1 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]"
    >
      {options.map((o) => {
        const active = o.id === value
        return (
          <button
            key={o.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.id)}
            className={cn(
              'rounded-full border-[0.8px] px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.06em] outline-none transition-all focus-visible:ring-1 focus-visible:ring-[#ccb17f]/50',
              active
                ? 'border-[#785a28] bg-[linear-gradient(to_bottom,#1a140b,#0f0e0c)] text-[#e8d5b5] shadow-[inset_0_0_4px_1px_rgba(0,0,0,0.5)]'
                : 'border-transparent text-[#717182] hover:bg-white/[0.04] hover:text-[#bfbfbf]',
            )}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

const DECIMAL = /^\d*\.?\d*$/
function parseAmount(s: string) {
  const n = Number(s)
  return s !== '' && Number.isFinite(n) ? n : 0
}

/** An amount with its unit, and a Max when there is a ceiling. */
export function MoneyField({
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
  const v = Number.isFinite(value) && value > 0 ? value : 0
  const [text, setText] = useState(() => (v === 0 ? '' : String(v)))
  useEffect(() => {
    // Mirror a value set from outside (the slider, Max) without fighting what is typed
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setText((t) => (parseAmount(t) === v ? t : v === 0 ? '' : String(v)))
  }, [v])

  const type = (raw: string) => {
    const s = raw.replace(/[,\s]/g, '')
    if (!DECIMAL.test(s)) return
    const n = parseAmount(s)
    if (max !== undefined && n > max) {
      setText(max > 0 ? String(max) : '')
      onChange(max)
      return
    }
    setText(s)
    onChange(n)
  }

  return (
    <div className="flex cursor-text items-center gap-2 rounded-[12px] border border-white/[0.1] bg-[linear-gradient(180deg,rgba(22,21,19,0.98)_0%,rgba(16,15,14,0.98)_100%)] px-3.5 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),inset_0_2px_6px_rgba(0,0,0,0.3)] transition-colors focus-within:border-[rgba(214,176,106,0.45)] hover:bg-[linear-gradient(180deg,rgba(26,25,23,0.98)_0%,rgba(18,17,16,0.98)_100%)]">
      <span className="text-[15px] text-[#ccb17f]">{prefix}</span>
      <input
        aria-label={ariaLabel}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={text}
        onChange={(e) => type(e.target.value)}
        placeholder="0"
        className="w-full min-w-0 bg-transparent text-[18px] font-semibold tabular-nums text-[#f5f5f5] outline-none placeholder:text-[#63646f]"
      />
      {suffix && <span className={cn(EYEBROW_MUTED, 'shrink-0')}>{suffix}</span>}
      {onMax && max !== undefined && (
        <>
          <span className="h-5 w-px shrink-0 bg-white/[0.1]" />
          <button
            type="button"
            onClick={onMax}
            className="shrink-0 cursor-pointer text-[13px] font-semibold uppercase tracking-[0.02em] text-[#ccb17f] transition-colors hover:text-[#f0ddb9]"
          >
            Max
          </button>
        </>
      )}
    </div>
  )
}

export type Tick = { value: number; label: string }

/** Thin ticks out of a crowded set, keeping both ends and 9% clear between labels. */
function spreadTicks(ticks: Tick[], min: number, span: number) {
  if (span <= 0 || ticks.length < 3) return ticks
  const at = (t: Tick) => ((t.value - min) / span) * 100
  const sorted = [...ticks].sort((a, b) => a.value - b.value)
  const last = sorted[sorted.length - 1]
  const kept = [sorted[0]]
  for (const t of sorted.slice(1, -1)) {
    if (at(t) - at(kept[kept.length - 1]) >= 9 && at(last) - at(t) >= 9) kept.push(t)
  }
  kept.push(last)
  return kept
}

function stepDecimals(step: number) {
  const [, frac = ''] = String(step).split('.')
  return frac.length
}

/** Gold track and knob over a native range input, with clickable ticks. */
export function Slider({
  min,
  max,
  step = 1,
  value,
  onChange,
  ticks,
  disabled,
  ariaLabel,
  format,
}: {
  min: number
  max: number
  step?: number
  value: number
  onChange: (v: number) => void
  ticks?: Tick[]
  disabled?: boolean
  ariaLabel: string
  format?: (v: number) => string
}) {
  const span = max - min
  const clamp = (v: number) => Math.min(max, Math.max(min, v))
  const snap = (v: number) => {
    const s = min + Math.round((v - min) / step) * step
    return s >= max ? max : Number(clamp(s).toFixed(stepDecimals(step)))
  }
  const shown = spreadTicks(
    (ticks ?? []).filter((t, i, all) => t.value >= min && t.value <= max && all.findIndex((x) => x.value === t.value) === i),
    min,
    span,
  )
  const current = clamp(Number.isFinite(value) ? value : min)
  const fill = span > 0 ? ((current - min) / span) * 100 : 0
  const set = (v: number) => {
    const s = snap(v)
    if (s !== current) onChange(s)
  }

  return (
    <div className={cn(disabled && 'opacity-45')}>
      <div className="relative h-5 select-none">
        <div className="absolute top-1/2 h-[7px] w-full -translate-y-1/2 rounded-full bg-white/[0.09] shadow-[inset_0_2px_4px_rgba(0,0,0,0.5),inset_0_0_0_1px_rgba(255,255,255,0.06)]" />
        <div
          className={cn(
            'absolute top-1/2 h-[7px] -translate-y-1/2 rounded-full',
            disabled ? 'bg-[linear-gradient(to_right,#4a3d24,#6b5a38)]' : 'bg-[linear-gradient(to_right,#8f6a33,#d6b06a)]',
          )}
          style={{ width: `${fill}%` }}
        />
        <div
          className="pointer-events-none absolute top-1/2 h-[18px] w-[18px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(204,177,127,0.7)] bg-[linear-gradient(to_bottom,#f2ddb5,#ba8f52)] shadow-[0_2px_8px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.28)]"
          style={{ left: `${fill}%` }}
        />
        <input
          type="range"
          aria-label={ariaLabel}
          aria-valuetext={format ? format(current) : undefined}
          min={min}
          max={max}
          step="any"
          value={current}
          disabled={disabled}
          onChange={(e) => set(Number(e.target.value))}
          onKeyDown={(e) => {
            if (disabled) return
            const page = Math.max(step, span / 10)
            switch (e.key) {
              case 'ArrowRight':
              case 'ArrowUp':
                set(current + step)
                break
              case 'ArrowLeft':
              case 'ArrowDown':
                set(current - step)
                break
              case 'PageUp':
                set(current + page)
                break
              case 'PageDown':
                set(current - page)
                break
              case 'Home':
                set(min)
                break
              case 'End':
                set(max)
                break
              default:
                return
            }
            e.preventDefault()
          }}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
        />
      </div>
      {shown.length > 0 && (
        <div className="relative mt-2 h-4">
          {shown.map((t) => {
            const at = span > 0 ? ((t.value - min) / span) * 100 : 0
            return (
              <button
                key={t.value}
                type="button"
                disabled={disabled}
                onClick={() => set(t.value)}
                style={{ left: `${at}%`, transform: `translateX(-${at}%)` }}
                className={cn(
                  EYEBROW_MUTED,
                  'absolute top-0 cursor-pointer whitespace-nowrap transition-colors hover:text-[#ccb17f] disabled:cursor-not-allowed',
                )}
              >
                {t.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ---------------------------------------------------------- status -- */

export type PillStatus = 'Active' | 'Starting' | 'Offline' | 'Pausing' | 'Stopping' | 'Paused' | 'Ended' | 'Standby'

export const PILL_FOR_PHASE: Record<Phase, PillStatus> = {
  starting: 'Starting',
  running: 'Active',
  offline: 'Offline',
  pausing: 'Pausing',
  paused: 'Paused',
  stopping: 'Stopping',
  stopped: 'Ended',
}

const PILL_DOT: Record<PillStatus, string> = {
  Active: 'bg-[#4ade80]',
  Starting: 'bg-[#ccb17f]',
  Offline: 'bg-[#e5484d]',
  Pausing: 'bg-[#ccb17f]',
  Stopping: 'bg-[#ccb17f]',
  Paused: 'bg-[#ccb17f]',
  Ended: 'bg-[#e5484d]',
  Standby: 'bg-[#717182]',
}
const PILL_TEXT: Record<PillStatus, string> = {
  Active: 'text-[#4ade80]',
  Starting: 'text-[#e8d5b5]',
  Offline: 'text-[#e5484d]',
  Pausing: 'text-[#e8d5b5]',
  Stopping: 'text-[#e8d5b5]',
  Paused: 'text-[#e8d5b5]',
  Ended: 'text-[#e5484d]',
  Standby: 'text-[#8f90a1]',
}

/** The pill on the right of Strategy status and Activity. */
export function StatusPill({ status }: { status: PillStatus }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-[#121212] px-3 py-1.5">
      <span className={cn('h-[7px] w-[7px] rounded-full', PILL_DOT[status])}>
        {status === 'Active' && <span className={cn('block h-full w-full animate-ping rounded-full', PILL_DOT[status])} />}
      </span>
      <span className={cn('text-[11px] font-medium uppercase tracking-[0.08em]', PILL_TEXT[status])}>{status}</span>
    </span>
  )
}

const STATE_TITLE = { loading: 'Loading', error: 'Something went wrong', empty: 'Nothing here yet' }

/** Loading, error and empty placeholders. */
export function StateMessage({
  kind,
  title,
  message,
  onRetry,
}: {
  kind: 'loading' | 'error' | 'empty'
  title?: string
  message?: string
  onRetry?: () => void
}) {
  return (
    <div
      role={kind === 'error' ? 'alert' : 'status'}
      className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center"
    >
      {kind === 'loading' && <Spinner className="h-5 w-5 text-[#ccb17f]" />}
      <p
        className={cn(
          'text-[13px] font-medium',
          kind === 'error' ? 'text-[#e9a5a7]' : kind === 'loading' ? 'text-[#bfbfbf]' : 'text-[#8f90a1]',
        )}
      >
        {title ?? STATE_TITLE[kind]}
      </p>
      {message && <p className="max-w-sm text-[12px] leading-[18px] text-[#717182]">{message}</p>}
      {kind === 'error' && onRetry && (
        <GoldButton onClick={onRetry} className="mt-1">
          Retry
        </GoldButton>
      )}
    </div>
  )
}

export { EYEBROW, EYEBROW_MUTED, MONO }
