import { cn } from '../../lib/utils.js'

/**
 * Accessible toggle (Figma `Toggle` / switch pattern) without Radix.
 * @param {object} props
 * @param {boolean} props.checked
 * @param {(next: boolean) => void} props.onCheckedChange
 * @param {boolean} [props.disabled]
 * @param {string} [props.className]
 * @param {string} [props['aria-label']]
 */
export function Switch({
  checked,
  onCheckedChange,
  disabled,
  className,
  'aria-label': ariaLabel = 'Toggle',
  ...rest
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      className={cn(
        'grid h-6 w-11 grid-cols-1 grid-rows-1 items-center px-1 transition-colors',
        'rounded-full border border-border',
        checked ? 'bg-primary' : 'bg-muted',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
      onClick={() => !disabled && onCheckedChange?.(!checked)}
      {...rest}
    >
      <span
        className={cn(
          'col-start-1 row-start-1 size-5 rounded-full bg-background shadow-ds-sm transition-transform duration-200 ease-out',
          checked ? 'translate-x-4' : 'translate-x-0',
        )}
      />
    </button>
  )
}
