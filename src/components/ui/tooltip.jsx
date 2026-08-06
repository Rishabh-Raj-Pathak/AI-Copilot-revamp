import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { cn } from '../../lib/utils.js'

/**
 * Compact hover/focus tooltip for short supporting explanations.
 * @param {object} props
 * @param {import('react').ReactNode} props.content
 * @param {import('react').ReactNode} props.children
 * @param {string} [props.className]
 * @param {'start'|'center'|'end'} [props.align]
 */
export function Tooltip({ content, children, className, align = 'center' }) {
  return (
    <TooltipPrimitive.Provider delayDuration={120}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side="top"
            align={align}
            sideOffset={8}
            collisionPadding={12}
            className={cn(
              'z-[160] max-w-[280px] rounded-lg border border-[#454545] bg-[#121212] px-3 py-2.5 text-left text-xs leading-[1.45] text-white shadow-[0_12px_32px_rgba(0,0,0,0.55)]',
              'data-[state=delayed-open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=delayed-open]:fade-in-0',
              className,
            )}
          >
            {content}
            <TooltipPrimitive.Arrow className="fill-[#454545]" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}
