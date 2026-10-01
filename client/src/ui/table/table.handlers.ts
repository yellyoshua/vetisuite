import { useState, type ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export type TableProps = ComponentProps<'table'> & {
  containerClassName?: string
}

export type SortDirection = 'ascending' | 'descending' | 'none'

export type TableSort<Key extends string> = {
  key: Key | null
  direction: SortDirection
}

export default function useTable({ className, containerClassName, ...rest }: TableProps) {
  return {
    containerProps: { className: cn('relative w-full max-w-full overflow-auto rounded-row border border-border bg-card', containerClassName) },
    tableProps: { ...rest, className: cn('w-full caption-bottom border-separate border-spacing-0 text-[13px] text-foreground', className) },
  }
}

export function useTableSort<Row, Key extends string & keyof Row>(rows: Row[], initial: TableSort<Key> = { key: null, direction: 'none' }) {
  const [sort, setSort] = useState<TableSort<Key>>(initial)

  const sortedRows = sort.key === null || sort.direction === 'none'
    ? rows
    : [...rows].sort((a, b) => {
        const key = sort.key as Key
        const result = String(a[key]).localeCompare(String(b[key]), 'es', { numeric: true })
        return sort.direction === 'ascending' ? result : -result
      })

  const getSortDirection = (key: Key): SortDirection => (sort.key === key ? sort.direction : 'none')

  const toggleSort = (key: Key) => {
    setSort((current) => ({
      key,
      direction: current.key === key && current.direction === 'ascending' ? 'descending' : 'ascending',
    }))
  }

  return { sortedRows, getSortDirection, toggleSort }
}

export function useTableSelection<Id extends string>(rowIds: Id[]) {
  const [picked, setPicked] = useState<Set<Id>>(() => new Set())
  const selected = new Set(rowIds.filter((id) => picked.has(id)))
  const isAllSelected = rowIds.length > 0 && selected.size === rowIds.length
  const isSomeSelected = selected.size > 0 && !isAllSelected

  const toggle = (id: Id) => {
    setPicked((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => setPicked(isAllSelected ? new Set() : new Set(rowIds))
  const clear = () => setPicked(new Set())

  return { selected, isAllSelected, isSomeSelected, toggle, toggleAll, clear }
}

export type ColumnWidthLimits = { min?: number; max?: number }

export function useColumnWidths<Key extends string>(initial: Record<Key, number>, { min = 64, max = 480 }: ColumnWidthLimits = {}) {
  const [widths, setWidths] = useState<Record<Key, number>>(initial)

  const setWidth = (key: Key, px: number) => {
    setWidths((current) => ({ ...current, [key]: Math.min(max, Math.max(min, Math.round(px))) }))
  }

  return { widths, setWidth, min, max }
}
