import { cn } from '../../lib/utils.js'

/**
 * @param {object} props
 * @param {string} [props.className]
 * @param {import('react').TableHTMLAttributes<HTMLTableElement>} props
 */
export function Table({ className, ...rest }) {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-border">
      <table className={cn('ds-text-body-sm w-full caption-bottom text-left', className)} {...rest} />
    </div>
  )
}

/**
 * @param {object} props
 * @param {string} [props.className]
 * @param {import('react').HTMLAttributes<HTMLTableSectionElement>} props
 */
export function TableHeader({ className, ...rest }) {
  return <thead className={cn('border-b border-border bg-surface-muted text-muted-foreground', className)} {...rest} />
}

/**
 * @param {object} props
 * @param {string} [props.className]
 * @param {import('react').HTMLAttributes<HTMLTableSectionElement>} props
 */
export function TableBody({ className, ...rest }) {
  return <tbody className={cn('[&_tr:last-child]:border-0', className)} {...rest} />
}

/**
 * @param {object} props
 * @param {string} [props.className]
 * @param {import('react').HTMLAttributes<HTMLTableRowElement>} props
 */
export function TableRow({ className, ...rest }) {
  return (
    <tr
      className={cn(
        'border-b border-border transition-colors hover:bg-surface-muted/50',
        className,
      )}
      {...rest}
    />
  )
}

/**
 * @param {object} props
 * @param {string} [props.className]
 * @param {import('react').ThHTMLAttributes<HTMLTableCellElement>} props
 */
export function TableHead({ className, ...rest }) {
  return (
    <th
      className={cn('h-9 px-3 text-left align-middle font-medium text-muted-foreground', className)}
      {...rest}
    />
  )
}

/**
 * @param {object} props
 * @param {string} [props.className]
 * @param {import('react').TdHTMLAttributes<HTMLTableCellElement>} props
 */
export function TableCell({ className, ...rest }) {
  return <td className={cn('p-3 align-middle text-foreground', className)} {...rest} />
}
