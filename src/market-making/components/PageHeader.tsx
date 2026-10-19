import type { ReactNode } from 'react'

/** Page title block. Mirrors the Delta Neutral anatomy exactly */
export function PageHeader({
  title,
  subhead,
  tip,
  right,
}: {
  title: string
  subhead: string[]
  tip: string
  right?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
      <div>
        <h1 className="mm-title-gradient text-[46px] leading-[1.05] font-bold tracking-[-0.03em] sm:text-[58px]">
          {title}
        </h1>
        <div className="mt-3 max-w-[640px] space-y-0.5">
          {subhead.map((line) => (
            <p key={line} className="text-[14px] leading-[22px] text-mm-ink-4">
              {line}
            </p>
          ))}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3 pt-2">
        {right}
        <span title={tip} className="text-mm-ink-5 transition-colors hover:text-mm-gold-300">
          <svg viewBox="0 0 16 16" fill="none" className="h-[18px] w-[18px]">
            <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.2" />
            <path d="M8 7.1v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            <circle cx="8" cy="4.9" r="0.85" fill="currentColor" />
          </svg>
        </span>
      </div>
    </div>
  )
}
