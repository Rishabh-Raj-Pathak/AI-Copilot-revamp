import { cn } from '../../lib/utils.js'

/**
 * Horizontal nav shell (Figma `nav-bar` / `Navigation Bars`) — layout only.
 * @param {object} props
 * @param {import('react').ReactNode} props.children
 * @param {string} [props.className]
 */
export function Navbar({ className, children, ...rest }) {
  return (
    <header
      className={cn(
        'flex h-btn-lg w-full items-center gap-4 border-b border-border bg-background px-4',
        className,
      )}
      {...rest}
    >
      {children}
    </header>
  )
}

/**
 * @param {object} props
 * @param {boolean} [props.active]
 * @param {import('react').ButtonHTMLAttributes<HTMLButtonElement>} props
 */
export function NavbarItem({ active, className, ...rest }) {
  return (
    <button
      type="button"
      className={cn(
        'ds-text-body rounded-md px-3 py-2 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        active ? 'bg-surface-muted text-foreground' : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground',
        className,
      )}
      {...rest}
    />
  )
}
