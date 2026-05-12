import { cn } from '../../lib/utils.js'

const sizes = {
  xs: 'size-5 text-xs',
  sm: 'size-6 text-xs',
  md: 'size-8 text-sm',
  lg: 'size-10 text-base',
  xl: 'size-12 text-lg',
  '2xl': 'size-16 text-xl',
}

/**
 * @param {object} props
 * @param {'xs'|'sm'|'md'|'lg'|'xl'|'2xl'} [props.size]
 * @param {string} [props.alt]
 * @param {string} [props.src]
 * @param {string} [props.fallback]
 * @param {string} [props.className]
 */
export function Avatar({ size = 'md', alt = '', src, fallback, className, ...rest }) {
  const label = fallback?.slice(0, 2)?.toUpperCase() ?? '?'

  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted font-medium text-muted-foreground',
        sizes[size],
        className,
      )}
      {...rest}
    >
      {src ? <img src={src} alt={alt} className="size-full object-cover" /> : <span aria-hidden>{label}</span>}
    </span>
  )
}
