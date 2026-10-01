import useTableResizer, { type TableResizerProps } from './table-resizer.handlers'

export default function TableResizer(props: TableResizerProps) {
  const { resizerProps } = useTableResizer(props)

  return <div {...resizerProps} />
}
