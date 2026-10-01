import TableSortButton from './table-sort-button'
import useTableHead, { type TableHeadProps } from './table-head.handlers'

export default function TableHead(props: TableHeadProps) {
  const { onSort, sortDirection, children, resizer, headProps } = useTableHead(props)

  return (
    <th {...headProps}>
      {onSort ? <TableSortButton direction={sortDirection} onSort={onSort}>{children}</TableSortButton> : children}
      {resizer}
    </th>
  )
}
