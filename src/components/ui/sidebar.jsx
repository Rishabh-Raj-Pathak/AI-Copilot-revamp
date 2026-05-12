import { cn } from '../../lib/utils.js'

/**
 * Collapsible sidebar shell (Figma `sidebar` signed-in / expanded states) — layout only.
 * @param {object} props
 * @param {boolean} [props.collapsed]
 * @param {import('react').ReactNode} props.children
 * @param {string} [props.className]
 */
export function Sidebar({ collapsed, className, children, ...rest }) {
  return (
    <aside
      className={cn(
        'flex h-full min-h-0 flex-col border-r border-border bg-background transition-[width] duration-200 ease-out',
        collapsed ? 'w-16' : 'w-60',
        className,
      )}
      {...rest}
    >
      {children}
    </aside>
  )
}
