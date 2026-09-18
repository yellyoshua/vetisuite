export type ServiceMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE'

export type ServiceRequest = {
  path: string
  method?: ServiceMethod
  query?: Record<string, string | number | boolean>
  body?: unknown
  signal?: AbortSignal
}

export function service<TResponse>(_request: ServiceRequest): Promise<TResponse> {
  throw new Error('Not implemented: service')
}
