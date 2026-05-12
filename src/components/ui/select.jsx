import { cn } from '../../lib/utils.js'

function ChevronDownGlyph({ className }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

/**
 * Styled native `<select>` aligned with input-field states in Figma.
 * @param {object} props
 * @param {string} [props.className]
 * @param {boolean} [props.error]
 * @param {import('react').SelectHTMLAttributes<HTMLSelectElement>} props
 */
export function Select({ className, error, disabled, children, ...rest }) {
  return (
    <div className="relative w-full">
      <select
        className={cn(
          'ds-text-body w-full min-h-btn-md appearance-none rounded-md border bg-input px-3 pr-10 text-foreground shadow-ds-sm',
          'border-input-border',
          'focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          error && 'border-destructive focus-visible:border-destructive focus-visible:ring-destructive',
          disabled && 'cursor-not-allowed opacity-50',
          className,
        )}
        disabled={disabled}
        aria-invalid={error || undefined}
        {...rest}
      >
        {children}
      </select>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
        <ChevronDownGlyph />
      </span>
    </div>
  )
}
