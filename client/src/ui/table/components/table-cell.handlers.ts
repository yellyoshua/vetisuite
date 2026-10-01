import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export type TableCellProps = ComponentProps<'td'> & {
  sticky?: 'left'
  stickyOffset?: number
}

export default function useTableCell({ className, sticky, stickyOffset = 0, style, ...rest }: TableCellProps) {
  return {
    cellProps: {
      ...rest,
      style: sticky ? { ...style, left: stickyOffset } : style,
      className: cn(
        'relative isolate h-11 border-b border-border bg-card px-3 py-2.5 align-middle text-[13px] font-medium whitespace-nowrap tabular-nums before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:transition-colors before:duration-150 motion-reduce:before:transition-none group-hover:before:bg-muted/40 group-data-[state=selected]:before:bg-muted/60',
        sticky && 'sticky left-0 z-10',
        className,
      ),
    },
  }
}
