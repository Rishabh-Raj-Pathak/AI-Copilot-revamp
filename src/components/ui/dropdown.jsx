import { useEffect, useId, useRef, useState } from 'react'
import { cn } from '../../lib/utils.js'

/**
 * Minimal dropdown (Figma `dropdown` + `dropdown-list`) — keyboard: Escape closes.
 * @param {object} props
 * @param {import('react').ReactNode} props.trigger
 * @param {import('react').ReactNode} props.children
 * @param {string} [props.className]
 * @param {string} [props.contentClassName]
 */
export function Dropdown({ trigger, children, className, contentClassName }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const id = useId()

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    const onPointer = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onPointer)
    }
  }, [open])

  return (
    <div ref={rootRef} className={cn('relative inline-block text-left', className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={open ? id : undefined}
        className="inline-flex"
        onClick={() => setOpen((o) => !o)}
      >
        {trigger}
      </button>
      {open ? (
        <div
          id={id}
          role="menu"
          className={cn(
            'absolute z-50 mt-1 min-w-[10rem] rounded-lg border border-border bg-surface-muted py-1 shadow-ds-md',
            contentClassName,
          )}
        >
          {children}
        </div>
      ) : null}
    </div>
  )
}

/**
 * @param {object} props
 * @param {() => void} props.onSelect
 * @param {import('react').ReactNode} props.children
 * @param {string} [props.className]
 */
export function DropdownItem({ onSelect, className, children, ...rest }) {
  return (
    <button
      type="button"
      role="menuitem"
      className={cn(
        'ds-text-body flex w-full px-3 py-2 text-left text-foreground hover:bg-surface-elevated focus:bg-surface-elevated focus:outline-none',
        className,
      )}
      onClick={onSelect}
      {...rest}
    >
      {children}
    </button>
  )
}
