import useTableCell, { type TableCellProps } from './table-cell.handlers'

export default function TableCell(props: TableCellProps) {
  const { cellProps } = useTableCell(props)

  return <td {...cellProps} />
}
