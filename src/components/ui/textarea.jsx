import { cn } from '../../lib/utils.js'

/**
 * @param {object} props
 * @param {string} [props.className]
 * @param {boolean} [props.error]
 * @param {import('react').TextareaHTMLAttributes<HTMLTextAreaElement>} props
 */
export function Textarea({ className, error, disabled, ...rest }) {
  return (
    <textarea
      className={cn(
        'ds-text-body min-h-24 w-full resize-y rounded-md border bg-input px-3 py-2 text-foreground shadow-ds-sm',
        'border-input-border placeholder:text-input-placeholder',
        'focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        error && 'border-destructive focus-visible:border-destructive focus-visible:ring-destructive',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
      disabled={disabled}
      aria-invalid={error || undefined}
      {...rest}
    />
  )
}
