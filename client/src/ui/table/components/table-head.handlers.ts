import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import type { TableSortDirection } from './table-sort-button.handlers'

export type TableHeadSortDirection = TableSortDirection

export type TableHeadProps = ComponentProps<'th'> & {
  sortDirection?: TableHeadSortDirection
  onSort?: () => void
  sticky?: 'left'
  stickyOffset?: number
  resizer?: ReactNode
}

export default function useTableHead({ className, sortDirection, onSort, children, scope = 'col', sticky, stickyOffset = 0, resizer, style, ...rest }: TableHeadProps) {
  const sortable = onSort !== undefined

  return {
    onSort,
    sortDirection: sortDirection ?? 'none',
    children,
    resizer,
    headProps: {
      ...rest,
      scope,
      style: sticky ? { ...style, left: stickyOffset } : style,
      'aria-sort': sortable ? (sortDirection ?? 'none') : undefined,
      className: cn(
        'sticky top-0 isolate z-20 h-9 border-b border-border bg-card px-3 text-left align-middle text-xs font-medium whitespace-nowrap text-muted-foreground before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:bg-muted/60',
        sortable && 'px-1',
        sticky && 'left-0 z-30',
        className,
      ),
    },
  }
}
