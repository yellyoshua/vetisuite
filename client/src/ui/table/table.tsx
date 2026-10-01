import useTable, { type TableProps } from './table.handlers'

export default function Table(props: TableProps) {
  const { containerProps, tableProps } = useTable(props)

  return (
    <div {...containerProps}>
      <table {...tableProps} />
    </div>
  )
}
