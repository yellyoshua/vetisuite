export type ServiceRequest = {
  path: string
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
}

export type ServiceClient = {
  request: <TResponse>(options: ServiceRequest) => Promise<TResponse>
}

export function createServiceClient(_baseUrl: string): ServiceClient {
  throw new Error('Not implemented: createServiceClient')
}
