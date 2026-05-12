import { cn } from '../../lib/utils.js'

/**
 * Uses the native `title` tooltip. Replace with Radix Tooltip when that dependency is added.
 * @param {object} props
 * @param {string} props.content
 * @param {import('react').ReactNode} props.children
 * @param {string} [props.className]
 */
export function Tooltip({ content, children, className }) {
  return (
    <span className={cn('inline-flex', className)} title={content}>
      {children}
    </span>
  )
}
