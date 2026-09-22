import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { useDebounce } from 'react-use'

type QueryValue = string | number | boolean | null | undefined

export default function useQueryParams() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [queryParams, setQueryParams] = useState(searchParams)
  const [syncedSearchParams, setSyncedSearchParams] = useState(searchParams)

  if (syncedSearchParams !== searchParams) {
    setSyncedSearchParams(searchParams)
    setQueryParams((current) => {
      return current.toString() === searchParams.toString() ? current : searchParams
    })
  }

  const [, cancel] = useDebounce(() => {
    if (queryParams === searchParams) {
      return
    }

    setSearchParams(queryParams, { replace: true })
  }, 600, [queryParams])

  const changeQuery = (query: Record<string, QueryValue> = {}) => {
    const params = new URLSearchParams(queryParams)

    Object.entries(query).forEach(([key, value]) => {
      if (value) {
        params.set(key, String(value))

        return
      }

      if (params.has(key)) {
        params.delete(key)
      }
    })

    setQueryParams(params)
  }

  const nextPage = () => {
    const page = queryParams.get('page') || '1'
    changeQuery({ page: parseInt(page, 10) + 1 })
  }

  const prevPage = () => {
    const page = queryParams.get('page') || '1'
    changeQuery({ page: Math.max(parseInt(page, 10) - 1, 0) })
  }

  const search = (value: string) => {
    changeQuery({ search: value, page: null })
  }

  const query = useMemo(() => {
    return Object.fromEntries(queryParams.entries())
  }, [queryParams])

  useEffect(() => {
    return () => {
      cancel()
    }
  }, [cancel])

  return {
    changeQuery,
    nextPage,
    prevPage,
    search,
    query,
  }
}
