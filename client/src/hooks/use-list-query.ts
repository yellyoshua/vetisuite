import { useSearchParams } from 'react-router'
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '@/constants/pagination'

export type ListQuery<TFilterKey extends string = never> = {
  page: number
  pageSize: number
  search: string
  filters: Record<TFilterKey, string>
}

export type ListPage<TRow> = {
  rows: TRow[]
  total: number
  page: number
}

type ListQueryControls<TFilterKey extends string> = {
  query: ListQuery<TFilterKey>
  setPage: (page: number) => void
  setSearch: (search: string) => void
  setFilter: (key: TFilterKey, value: string) => void
}

const PAGE_KEY = 'page'
const PAGE_SIZE_KEY = 'pageSize'
const SEARCH_KEY = 'search'

function parsePositiveInteger(value: string | null, defaultValue: number): number {
  const parsed = Number(value)

  return Number.isInteger(parsed) && parsed > 0 ? parsed : defaultValue
}

function withParam(current: URLSearchParams, key: string, value: string): URLSearchParams {
  const next = new URLSearchParams(current)
  if (value) {
    next.set(key, value)

    return next
  }
  next.delete(key)

  return next
}

export default function useListQuery<TFilterKey extends string = never>(
  filterKeys: readonly TFilterKey[] = [],
): ListQueryControls<TFilterKey> {
  const [searchParams, setSearchParams] = useSearchParams()
  const filterEntries = filterKeys.map((key) => [key, searchParams.get(key) ?? ''] as const)

  const query: ListQuery<TFilterKey> = {
    page: parsePositiveInteger(searchParams.get(PAGE_KEY), 1),
    pageSize: Math.min(MAX_PAGE_SIZE, parsePositiveInteger(searchParams.get(PAGE_SIZE_KEY), DEFAULT_PAGE_SIZE)),
    search: searchParams.get(SEARCH_KEY) ?? '',
    filters: Object.fromEntries(filterEntries) as Record<TFilterKey, string>,
  }

  function setPage(page: number) {
    setSearchParams((current) => withParam(current, PAGE_KEY, page > 1 ? String(page) : ''))
  }

  function setSearch(search: string) {
    setSearchParams((current) => withParam(withParam(current, SEARCH_KEY, search), PAGE_KEY, ''), { replace: true })
  }

  function setFilter(key: TFilterKey, value: string) {
    setSearchParams((current) => withParam(withParam(current, key, value), PAGE_KEY, ''))
  }

  return { query, setPage, setSearch, setFilter }
}
