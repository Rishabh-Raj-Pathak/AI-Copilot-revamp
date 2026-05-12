import { cn } from '../../lib/utils.js'

/**
 * @param {object} props
 * @param {string} [props.className]
 * @param {import('react').InputHTMLAttributes<HTMLInputElement>} props
 */
export function Radio({ className, ...rest }) {
  return (
    <input
      type="radio"
      className={cn(
        'size-4 shrink-0 border border-border bg-input text-primary',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...rest}
    />
  )
}
