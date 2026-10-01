import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export type TableSelectionBarProps = ComponentProps<'div'> & {
  count: number
  onClear: () => void
}

export default function useTableSelectionBar({ className, count, onClear, children, ...rest }: TableSelectionBarProps) {
  return {
    visible: count > 0,
    children,
    statusText: count === 1 ? '1 seleccionado' : `${count} seleccionados`,
    barProps: {
      ...rest,
      className: cn(
        'fixed bottom-20 left-1/2 z-40 flex h-[52px] w-max max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-3 overflow-x-auto rounded-row border border-border bg-card p-3 text-sm text-foreground shadow-popup dark:shadow-none',
        className,
      ),
    },
    statusProps: { role: 'status', 'aria-live': 'polite' as const, className: 'shrink-0 whitespace-nowrap font-medium' },
    actionsProps: { className: 'flex shrink-0 items-center gap-1 [&_button]:inline-flex [&_button]:h-7 [&_button]:cursor-pointer [&_button]:items-center [&_button]:gap-2 [&_button]:rounded-control [&_button]:px-2.5 [&_button]:text-[13px] [&_button]:font-medium [&_button]:whitespace-nowrap [&_button]:transition-colors [&_button]:duration-150 motion-reduce:[&_button]:transition-none [&_button:hover]:bg-muted [&_svg]:size-4' },
    clearProps: {
      type: 'button' as const,
      onClick: onClear,
      className: 'inline-flex h-7 shrink-0 cursor-pointer items-center rounded-control px-2.5 text-[13px] font-medium whitespace-nowrap text-muted-foreground transition-colors duration-150 motion-reduce:transition-none hover:bg-muted hover:text-foreground',
    },
  }
}
