import { cloneElement, useId, useState, type KeyboardEvent, type ReactElement, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type TooltipSide = 'top' | 'bottom'

export type TooltipProps = {
  content: ReactNode
  children: ReactElement<{ 'aria-describedby'?: string }>
  side?: TooltipSide
  className?: string
}

const sideClasses: Record<TooltipSide, string> = {
  top: 'bottom-full mb-2',
  bottom: 'top-full mt-2',
}

export default function useTooltip({ children, side = 'top', className }: TooltipProps) {
  const [open, setOpen] = useState(false)
  const tooltipId = useId()
  const show = () => setOpen(true)
  const hide = () => setOpen(false)

  return {
    trigger: cloneElement(children, { 'aria-describedby': tooltipId }),
    wrapperProps: {
      className: 'relative inline-flex',
      onMouseEnter: show,
      onMouseLeave: hide,
      onFocus: show,
      onBlur: hide,
      onKeyDown: (event: KeyboardEvent<HTMLSpanElement>) => {
        if (event.key === 'Escape') hide()
      },
    },
    tooltipProps: {
      id: tooltipId,
      role: 'tooltip' as const,
      hidden: !open,
      className: cn(
        'pointer-events-none absolute left-1/2 z-50 w-max max-w-[min(16rem,calc(100vw-2rem))] -translate-x-1/2 rounded-control border border-border bg-popover px-2 py-1 text-xs text-popover-foreground shadow-popup dark:shadow-none',
        sideClasses[side],
        className,
      ),
    },
  }
}
