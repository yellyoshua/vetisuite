import useTableHeader, { type TableHeaderProps } from './table-header.handlers'

export default function TableHeader(props: TableHeaderProps) {
  const { headerProps } = useTableHeader(props)

  return <thead {...headerProps} />
}
