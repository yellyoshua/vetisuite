export type RouteError = {
  code: string
  message: string
  property?: string
}

export type ErrorResponseBody = {
  errors: RouteError[]
}

export function errorResponse(_status: number, _errors: RouteError[]): Response {
  throw new Error('Not implemented: errorResponse')
}
