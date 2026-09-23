import { DEFAULT_PAGE_SIZE } from '@/constants/pagination'

export function pageRows<TRow>(rows: TRow[], page: unknown): TRow[] {
  const currentPage = Number(page) || 1
  const start = (currentPage - 1) * DEFAULT_PAGE_SIZE

  return rows.slice(start, start + DEFAULT_PAGE_SIZE)
}
