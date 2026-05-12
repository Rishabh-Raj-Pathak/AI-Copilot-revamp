import { cn } from '../../lib/utils.js'

/**
 * Toast region (Figma `toast` types: default, success, error). Mount near app root.
 * @param {object} props
 * @param {import('react').ReactNode} props.children
 * @param {'default'|'success'|'error'} [props.variant]
 * @param {string} [props.className]
 */
export function Toast({ variant = 'default', className, children, ...rest }) {
  const v =
    variant === 'success'
      ? 'border-success/40 bg-success/15 text-success-foreground'
      : variant === 'error'
        ? 'border-destructive/40 bg-destructive/15 text-destructive-foreground'
        : 'border-border bg-surface-muted text-foreground'

  return (
    <div
      role="status"
      className={cn(
        'ds-text-body-sm flex w-full max-w-lg items-center gap-3 rounded-lg border px-4 py-3 shadow-ds-md',
        v,
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}

/**
 * Fixed container for stacked toasts (positioning helper).
 */
export function ToastViewport({ className, children, ...rest }) {
  return (
    <div
      className={cn('pointer-events-none fixed bottom-4 right-4 z-50 flex max-w-md flex-col gap-2', className)}
      {...rest}
    >
      <div className="pointer-events-auto flex flex-col gap-2">{children}</div>
    </div>
  )
}
