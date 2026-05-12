import { cn } from '../../lib/utils.js'

const variantClasses = {
  default: 'bg-primary text-primary-foreground hover:opacity-90 active:opacity-100',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-surface-elevated',
  outline:
    'border border-border bg-transparent text-foreground hover:bg-surface-muted active:bg-surface-muted',
  ghost: 'bg-transparent text-foreground hover:bg-surface-muted active:bg-surface-muted',
  destructive: 'bg-destructive text-destructive-foreground hover:opacity-90 active:opacity-100',
  link: 'bg-transparent p-0 h-auto min-h-0 text-primary underline-offset-4 hover:underline',
}

const sizeClasses = {
  xs: 'min-h-btn-xs gap-1 rounded-md px-2 text-xs',
  sm: 'min-h-btn-sm gap-1.5 rounded-md px-3 text-sm',
  md: 'min-h-btn-md gap-2 rounded-md px-4 text-sm',
  lg: 'min-h-btn-lg gap-2 rounded-lg px-5 text-base',
  icon: 'aspect-square min-h-btn-md min-w-btn-md rounded-md p-0',
}

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50'

/**
 * @param {object} props
 * @param {import('react').ReactNode} [props.children]
 * @param {'default'|'secondary'|'outline'|'ghost'|'destructive'|'link'} [props.variant]
 * @param {'xs'|'sm'|'md'|'lg'|'icon'} [props.size]
 * @param {boolean} [props.loading]
 * @param {boolean} [props.disabled]
 * @param {string} [props.className]
 * @param {import('react').ButtonHTMLAttributes<HTMLButtonElement>} props
 */
export function Button({
  className,
  variant = 'default',
  size = 'md',
  loading = false,
  disabled,
  children,
  type = 'button',
  ...rest
}) {
  return (
    <button
      type={type}
      className={cn(
        'ds-text-button inline-flex items-center justify-center font-medium transition-opacity',
        variantClasses[variant],
        variant !== 'link' && sizeClasses[size],
        focusRing,
        className,
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <span
            className="size-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent opacity-80"
            aria-hidden
          />
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  )
}
