import { cn } from '../../lib/utils.js'

const alertVariants = {
  default: 'border-border bg-surface-muted text-foreground',
  success: 'border-success/40 bg-success/15 text-success-foreground',
  warning: 'border-warning/40 bg-warning/15 text-warning-foreground',
  destructive: 'border-destructive/40 bg-destructive/15 text-destructive-foreground',
  info: 'border-info/40 bg-info/15 text-info-foreground',
}

/**
 * @param {object} props
 * @param {import('react').ReactNode} props.children
 * @param {'default'|'success'|'warning'|'destructive'|'info'} [props.variant]
 * @param {string} [props.className]
 */
export function Alert({ variant = 'default', className, children, ...rest }) {
  return (
    <div
      role="status"
      className={cn('rounded-lg border px-4 py-3 shadow-ds-sm', alertVariants[variant], className)}
      {...rest}
    >
      <div className="ds-text-body-sm [&_p]:mt-1">{children}</div>
    </div>
  )
}

/**
 * @param {object} props
 * @param {string} [props.className]
 */
export function AlertTitle({ className, ...rest }) {
  return <p className={cn('ds-text-label text-foreground', className)} {...rest} />
}

/**
 * @param {object} props
 * @param {string} [props.className]
 */
export function AlertDescription({ className, ...rest }) {
  return <p className={cn('ds-text-body-sm text-muted-foreground', className)} {...rest} />
}
