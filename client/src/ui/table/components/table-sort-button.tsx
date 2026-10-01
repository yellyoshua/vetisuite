import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import useTableSortButton, { type TableSortButtonProps } from './table-sort-button.handlers'

export default function TableSortButton(props: TableSortButtonProps) {
  const { direction, buttonProps } = useTableSortButton(props)
  const Icon = { ascending: ArrowUp, descending: ArrowDown, none: ArrowUpDown }[direction]

  return (
    <button {...buttonProps}>
      {buttonProps.children}
      <Icon aria-hidden="true" />
    </button>
  )
}
