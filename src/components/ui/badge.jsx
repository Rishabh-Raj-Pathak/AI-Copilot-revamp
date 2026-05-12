import { cn } from '../../lib/utils.js'

const badgeVariants = {
  default: 'border-transparent bg-primary text-primary-foreground',
  secondary: 'border-transparent bg-secondary text-secondary-foreground',
  outline: 'border-border bg-transparent text-foreground',
  destructive: 'border-transparent bg-destructive text-destructive-foreground',
  success: 'border-transparent bg-success text-success-foreground',
  /** Maps Figma chip `style=brand` */
  brand: 'border-transparent bg-primary/20 text-primary',
  /** Maps Figma chip `style=neutral` */
  neutral: 'border-transparent bg-muted text-muted-foreground',
}

const badgeSizes = {
  sm: 'rounded px-1.5 py-0.5 text-xs leading-none',
  md: 'rounded-md px-2 py-0.5 text-xs',
  lg: 'rounded-md px-2.5 py-1 text-sm',
}

/**
 * @param {object} props
 * @param {import('react').ReactNode} props.children
 * @param {'default'|'secondary'|'outline'|'destructive'|'success'|'brand'|'neutral'} [props.variant]
 * @param {'sm'|'md'|'lg'} [props.size]
 * @param {'square'|'pill'} [props.shape]
 * @param {string} [props.className]
 */
export function Badge({
  className,
  variant = 'default',
  size = 'md',
  shape = 'square',
  children,
  ...rest
}) {
  return (
    <span
      className={cn(
        'ds-text-caption inline-flex items-center border font-medium',
        badgeVariants[variant],
        badgeSizes[size],
        shape === 'pill' && 'rounded-full',
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  )
}
