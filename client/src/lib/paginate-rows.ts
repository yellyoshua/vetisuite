import type { ListPage } from '@/hooks/use-list-query'

type Pagination = {
  page: number
  pageSize: number
}

export function paginateRows<TRow>(rows: TRow[], { page, pageSize }: Pagination): ListPage<TRow> {
  const lastPage = Math.max(1, Math.ceil(rows.length / pageSize))
  const currentPage = Math.min(page, lastPage)
  const start = (currentPage - 1) * pageSize

  return {
    rows: rows.slice(start, start + pageSize),
    total: rows.length,
    page: currentPage,
  }
}
