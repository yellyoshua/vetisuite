import useTableEmpty, { type TableEmptyProps } from './table-empty.handlers'

export default function TableEmpty(props: TableEmptyProps) {
  const { cellProps } = useTableEmpty(props)

  return (
    <tr>
      <td {...cellProps} />
    </tr>
  )
}
