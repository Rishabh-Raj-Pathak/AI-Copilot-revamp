import { cn } from '../../lib/utils.js'

/**
 * @param {object} props
 * @param {string} [props.className]
 * @param {import('react').HTMLAttributes<HTMLDivElement>} props
 */
export function Card({ className, ...rest }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-surface-muted text-foreground shadow-ds-sm',
        className,
      )}
      {...rest}
    />
  )
}

/**
 * @param {object} props
 * @param {string} [props.className]
 * @param {import('react').HTMLAttributes<HTMLDivElement>} props
 */
export function CardHeader({ className, ...rest }) {
  return <div className={cn('flex flex-col gap-1 border-b border-border px-5 py-4', className)} {...rest} />
}

/**
 * @param {object} props
 * @param {string} [props.className]
 * @param {import('react').HTMLAttributes<HTMLHeadingElement>} props
 */
export function CardTitle({ className, ...rest }) {
  return <h3 className={cn('ds-text-heading-4 text-foreground', className)} {...rest} />
}

/**
 * @param {object} props
 * @param {string} [props.className]
 * @param {import('react').HTMLAttributes<HTMLParagraphElement>} props
 */
export function CardDescription({ className, ...rest }) {
  return <p className={cn('ds-text-body-sm text-muted-foreground', className)} {...rest} />
}

/**
 * @param {object} props
 * @param {string} [props.className]
 * @param {import('react').HTMLAttributes<HTMLDivElement>} props
 */
export function CardContent({ className, ...rest }) {
  return <div className={cn('px-5 py-4', className)} {...rest} />
}

/**
 * @param {object} props
 * @param {string} [props.className]
 * @param {import('react').HTMLAttributes<HTMLDivElement>} props
 */
export function CardFooter({ className, ...rest }) {
  return <div className={cn('flex items-center border-t border-border px-5 py-4', className)} {...rest} />
}
