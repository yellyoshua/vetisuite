import { useEffect, useState } from 'react'

export type Resolver<TParams, TResult> = (params: TParams) => Promise<TResult>

export type ResolverState<TResult> = {
  data: TResult | null
  error: Error | null
  isLoading: boolean
  refetch: () => void
}

type Settled<TResult> = {
  requestKey: string
  paramsKey: string
  data: TResult | null
  error: Error | null
}

function toError(reason: unknown): Error {
  if (reason instanceof Error) {
    return reason
  }

  return new Error('No se pudo cargar la información', { cause: reason })
}

export default function useResolver<TParams extends object, TResult>(
  resolver: Resolver<TParams, TResult>,
  params: TParams,
): ResolverState<TResult> {
  const paramsKey = JSON.stringify(params)
  const [version, setVersion] = useState(0)
  const [settled, setSettled] = useState<Settled<TResult> | null>(null)
  const requestKey = `${version}:${paramsKey}`

  useEffect(() => {
    const controller = new AbortController()
    const requestParams: TParams = JSON.parse(paramsKey)
    resolver(requestParams).then(
      (data) => {
        if (!controller.signal.aborted) {
          setSettled({ requestKey, paramsKey, data, error: null })
        }
      },
      (reason: unknown) => {
        if (!controller.signal.aborted) {
          setSettled({ requestKey, paramsKey, data: null, error: toError(reason) })
        }
      },
    )

    return () => controller.abort()
  }, [resolver, paramsKey, requestKey])

  const hasSameParams = settled?.paramsKey === paramsKey

  return {
    data: hasSameParams ? settled.data : null,
    error: hasSameParams ? settled.error : null,
    isLoading: settled?.requestKey !== requestKey,
    refetch: () => setVersion((current) => current + 1),
  }
}
