import { useState, type ReactNode } from 'react'
import EmptyState from '@/components/EmptyState'
import ErrorState from '@/components/ErrorState'
import LoadingState from '@/components/LoadingState'
import Card from '@/components/legacy-ui/Card'
import Pager from '@/components/legacy-ui/Pager'
import type { ListPage } from '@/hooks/use-list-query'

export type DataTableColumn<TRow> = {
  key: string
  header: string
  align?: 'left' | 'right'
  isHeaderHidden?: boolean
  render: (row: TRow) => ReactNode
}

type DataTableProps<TRow> = {
  label: string
  columns: DataTableColumn<TRow>[]
  data: ListPage<TRow> | null
  error: Error | null
  isLoading: boolean
  pageSize: number
  minWidth: number
  rowKey: (row: TRow) => string
  onPageChange: (page: number) => void
  emptyTitle?: string
  emptyHint?: string
}

const STICKY_CELL_CLASS_NAME = 'sticky left-0 bg-card shadow-sticky'

function alignClassName(align: DataTableColumn<unknown>['align']): string {
  return align === 'right' ? 'text-right' : 'text-left'
}

export default function DataTable<TRow>({
  label,
  columns,
  data,
  error,
  isLoading,
  pageSize,
  minWidth,
  rowKey,
  onPageChange,
  emptyTitle = 'Sin resultados',
  emptyHint = 'Ajusta la búsqueda o los filtros.',
}: DataTableProps<TRow>) {
  const [lastData, setLastData] = useState(data)
  if (data && data !== lastData) {
    setLastData(data)
  }
  const shownData = error ? null : (data ?? lastData)
  const rows = shownData?.rows ?? []
  const [firstColumn, ...otherColumns] = columns

  return (
    <Card className="overflow-hidden">
      <div role="region" aria-label={label} tabIndex={0} className="relative overflow-x-auto">
        <table aria-label={label} className="w-full border-separate border-spacing-0" style={{ minWidth: `${minWidth}px` }}>
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`border-b border-line bg-card px-4 py-[13px] text-[11px] font-semibold tracking-[0.4px] whitespace-nowrap text-sub uppercase ${alignClassName(column.align)} ${index === 0 ? `${STICKY_CELL_CLASS_NAME} z-[3]` : ''}`}
                >
                  {column.isHeaderHidden ? <span className="sr-only">{column.header}</span> : column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={rowKey(row)}>
                <th
                  scope="row"
                  className={`z-[2] border-b border-line-soft px-4 py-3 text-left align-middle font-normal whitespace-nowrap ${STICKY_CELL_CLASS_NAME}`}
                >
                  {firstColumn.render(row)}
                </th>
                {otherColumns.map((column) => (
                  <td
                    key={column.key}
                    className={`border-b border-line-soft px-4 py-3 align-middle text-[13px] whitespace-nowrap text-ink tabular-nums ${alignClassName(column.align)}`}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isLoading && !shownData && <LoadingState />}
      {error && <ErrorState error={error} />}
      {shownData && rows.length === 0 && <EmptyState title={emptyTitle} hint={emptyHint} />}
      {shownData && rows.length > 0 && (
        <div className="border-t border-line-soft px-4 py-3">
          <Pager page={shownData.page} total={shownData.total} pageSize={pageSize} onPageChange={onPageChange} />
        </div>
      )}
    </Card>
  )
}
