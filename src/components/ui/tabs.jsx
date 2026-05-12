import { createContext, useContext, useMemo } from 'react'
import { cn } from '../../lib/utils.js'

const TabsCtx = createContext(null)

/**
 * @param {object} props
 * @param {string} props.value
 * @param {(v: string) => void} props.onValueChange
 * @param {import('react').ReactNode} props.children
 * @param {string} [props.className]
 */
export function Tabs({ value, onValueChange, children, className }) {
  const api = useMemo(() => ({ value, onValueChange }), [value, onValueChange])
  return (
    <TabsCtx.Provider value={api}>
      <div className={cn('flex flex-col gap-2', className)}>{children}</div>
    </TabsCtx.Provider>
  )
}

/**
 * @param {object} props
 * @param {string} [props.className]
 * @param {import('react').HTMLAttributes<HTMLDivElement>} props
 */
export function TabsList({ className, ...rest }) {
  return (
    <div
      role="tablist"
      className={cn('inline-flex gap-1 rounded-lg border border-border bg-muted p-1', className)}
      {...rest}
    />
  )
}

/**
 * @param {object} props
 * @param {string} props.value
 * @param {import('react').ReactNode} props.children
 * @param {'sm'|'lg'} [props.size]
 * @param {string} [props.className]
 */
export function TabsTrigger({ value, size = 'md', className, children, ...rest }) {
  const ctx = useContext(TabsCtx)
  if (!ctx) throw new Error('TabsTrigger must be used within Tabs')
  const active = ctx.value === value
  const sizeCls =
    size === 'lg'
      ? 'min-h-11 px-4 text-sm'
      : 'min-h-9 px-3 text-sm'

  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      id={`tab-${value}`}
      tabIndex={active ? 0 : -1}
      className={cn(
        'rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        sizeCls,
        active ? 'bg-surface-elevated text-foreground shadow-ds-sm' : 'text-muted-foreground hover:text-foreground',
        className,
      )}
      onClick={() => ctx.onValueChange(value)}
      {...rest}
    >
      {children}
    </button>
  )
}

/**
 * @param {object} props
 * @param {string} props.value
 * @param {import('react').ReactNode} props.children
 * @param {string} [props.className]
 */
export function TabsContent({ value, className, children, ...rest }) {
  const ctx = useContext(TabsCtx)
  if (!ctx) throw new Error('TabsContent must be used within Tabs')
  if (ctx.value !== value) return null
  return (
    <div
      role="tabpanel"
      aria-labelledby={`tab-${value}`}
      className={cn('ds-text-body text-foreground', className)}
      {...rest}
    >
      {children}
    </div>
  )
}
