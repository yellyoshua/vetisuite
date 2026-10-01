import useTableBody, { type TableBodyProps } from './table-body.handlers'

export default function TableBody(props: TableBodyProps) {
  const { bodyProps } = useTableBody(props)

  return <tbody {...bodyProps} />
}
