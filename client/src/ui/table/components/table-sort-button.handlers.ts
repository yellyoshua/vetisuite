import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export type TableSortDirection = 'ascending' | 'descending' | 'none'

export type TableSortButtonProps = Omit<ComponentProps<'button'>, 'type' | 'onClick'> & {
  direction: TableSortDirection
  onSort: () => void
}

export default function useTableSortButton({ direction, onSort, className, ...rest }: TableSortButtonProps) {
  return {
    direction,
    buttonProps: {
      ...rest,
      type: 'button' as const,
      onClick: onSort,
      className: cn(
        'inline-flex h-7 cursor-pointer touch-manipulation items-center gap-1 rounded-control px-2 text-xs font-medium text-muted-foreground transition-colors duration-150 motion-reduce:transition-none hover:bg-card hover:text-foreground [&_svg]:size-3.5 [&_svg]:shrink-0',
        direction !== 'none' && 'text-foreground',
        className,
      ),
    },
  }
}
