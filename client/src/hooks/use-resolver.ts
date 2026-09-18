export type Resolver<TParams, TResult> = (params: TParams) => Promise<TResult>

export type ResolverState<TResult> = {
  data: TResult | null
  error: Error | null
  isLoading: boolean
  refetch: () => void
}

export default function useResolver<TParams, TResult>(
  _resolver: Resolver<TParams, TResult>,
  _params: TParams,
): ResolverState<TResult> {
  throw new Error('Not implemented: useResolver')
}
