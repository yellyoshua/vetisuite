import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useSearchParams, type Params } from 'react-router'
import { MODAL_PARAM_KEYS } from '@/constants/modals'

export type SearchValue = string | number | boolean | null

export type ResolverSearch = Record<string, SearchValue>

export type Resolver = (params: Readonly<Params>, search: ResolverSearch) => unknown

export type Resolvers = Record<string, Resolver>

type ResolvedData<TResolvers extends Resolvers> = Partial<{ [Key in keyof TResolvers]: Awaited<ReturnType<TResolvers[Key]>> }>

type ResolverState<TResolvers extends Resolvers> = {
  data: ResolvedData<TResolvers>
  errors: Record<string, string | null>
  isLoading: boolean
}

type ResolverContext = {
  params: Readonly<Params>
  search: ResolverSearch
}

type Failure = {
  error?: string
  message?: string
}

const PRIMITIVES: Record<string, SearchValue> = { true: true, false: false, null: null }

export default function useResolver<TResolvers extends Resolvers>(resolvers: TResolvers) {
  const params = useParams()
  const [searchParams] = useSearchParams()
  const [state, setState] = useState<ResolverState<TResolvers>>(() => ({ data: {}, errors: {}, isLoading: Object.keys(resolvers).length > 0 }))

  const query = withoutModalParams(searchParams).toString()
  const routeParams = JSON.stringify(params)

  const search = useMemo(() => decodeSearch(query), [query])

  const contextRef = useRef<ResolverContext>({ params, search })
  const resolversRef = useRef(resolvers)
  const pendingRef = useRef(new Map<keyof TResolvers, number>())
  const lastIdRef = useRef(0)

  useEffect(() => {
    contextRef.current = { params, search }
    resolversRef.current = resolvers
  })

  const load = useCallback((key: keyof TResolvers) => {
    const id = lastIdRef.current + 1
    const context = contextRef.current

    lastIdRef.current = id
    pendingRef.current.set(key, id)

    const settle = (value: unknown, error: string | null) => {
      if (pendingRef.current.get(key) !== id) {
        return
      }

      pendingRef.current.delete(key)

      setState((current) => ({
        data: error ? current.data : { ...current.data, [key]: value },
        errors: { ...current.errors, [String(key)]: error },
        isLoading: pendingRef.current.size > 0,
      }))
    }

    return invoke(resolversRef.current, key, context)
      .then((value) => settle(value, null))
      .catch((failure: Failure) => settle(null, failure.error || failure.message || 'No se pudo cargar la información'))
  }, [])

  const refetch = useCallback((...keys: (keyof TResolvers)[]) => {
    const targets = keys.length > 0 ? keys : Object.keys(resolversRef.current)
    const requests = targets.map((key) => load(key))

    setState((current) => ({ ...current, isLoading: pendingRef.current.size > 0 }))

    return Promise.all(requests)
  }, [load])

  useEffect(() => {
    refetch()
  }, [routeParams, query, refetch])

  return {
    data: state.data,
    error: Object.values(state.errors).find(Boolean) || null,
    isLoading: state.isLoading,
    refetch,
  }
}

async function invoke<TResolvers extends Resolvers>(resolvers: TResolvers, key: keyof TResolvers, context: ResolverContext) {
  const resolver = resolvers[key]

  if (typeof resolver !== 'function') {
    throw new Error(`No existe el resolver "${String(key)}"`)
  }

  return resolver(context.params, context.search)
}

function withoutModalParams(searchParams: URLSearchParams): URLSearchParams {
  const filtered = new URLSearchParams(searchParams)

  filtered.delete('modal')
  MODAL_PARAM_KEYS.forEach((key) => filtered.delete(key))

  return filtered
}

function decodeSearch(query: string): ResolverSearch {
  const entries = [...new URLSearchParams(query)]
    .map(([key, value]) => [key, decodePrimitive(value)])

  return Object.fromEntries(entries)
}

function decodePrimitive(value: string): SearchValue {
  if (Object.hasOwn(PRIMITIVES, value)) {
    return PRIMITIVES[value]
  }

  return decodeNumber(value)
}

function decodeNumber(value: string): string | number {
  const trimmed = value.trim()
  const parsed = Number(trimmed)

  if (trimmed === '' || !Number.isFinite(parsed) || String(parsed) !== trimmed) {
    return value
  }

  return parsed
}
