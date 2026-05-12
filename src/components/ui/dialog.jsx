import { useEffect, useRef } from 'react'
import { cn } from '../../lib/utils.js'

/**
 * Native `<dialog>` aligned with Figma overlay patterns (no Radix).
 * @param {object} props
 * @param {boolean} props.open
 * @param {(open: boolean) => void} props.onOpenChange
 * @param {import('react').ReactNode} props.children
 * @param {string} [props.className]
 */
export function Dialog({ open, onOpenChange, children, className }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (open && !el.open) el.showModal()
    if (!open && el.open) el.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      className={cn(
        'fixed inset-0 z-50 max-h-[90vh] w-[min(32rem,calc(100%-2rem))] translate-y-0 overflow-y-auto rounded-xl border border-border bg-surface-muted p-0 text-foreground shadow-ds-lg',
        className,
      )}
      onClose={() => onOpenChange?.(false)}
      onClick={(e) => {
        if (e.target === ref.current) onOpenChange?.(false)
      }}
    >
      {children}
    </dialog>
  )
}

/**
 * @param {object} props
 * @param {string} [props.className]
 * @param {import('react').HTMLAttributes<HTMLDivElement>} props
 */
export function DialogHeader({ className, ...rest }) {
  return <div className={cn('border-b border-border px-5 py-4', className)} {...rest} />
}

/**
 * @param {object} props
 * @param {string} [props.className]
 * @param {import('react').HTMLAttributes<HTMLHeadingElement>} props
 */
export function DialogTitle({ className, ...rest }) {
  return <h2 className={cn('ds-text-heading-3', className)} {...rest} />
}

/**
 * @param {object} props
 * @param {string} [props.className]
 * @param {import('react').HTMLAttributes<HTMLDivElement>} props
 */
export function DialogBody({ className, ...rest }) {
  return <div className={cn('px-5 py-4', className)} {...rest} />
}

/**
 * @param {object} props
 * @param {string} [props.className]
 * @param {import('react').HTMLAttributes<HTMLDivElement>} props
 */
export function DialogFooter({ className, ...rest }) {
  return <div className={cn('flex justify-end gap-2 border-t border-border px-5 py-4', className)} {...rest} />
}
