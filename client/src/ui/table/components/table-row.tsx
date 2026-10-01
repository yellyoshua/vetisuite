import useTableRow, { type TableRowProps } from './table-row.handlers'

export default function TableRow(props: TableRowProps) {
  const { rowProps } = useTableRow(props)

  return <tr {...rowProps} />
}
