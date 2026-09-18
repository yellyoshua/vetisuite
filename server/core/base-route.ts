import type { H3Event } from 'nitro'
import type { ZodType } from 'zod'
import type { AuthContext } from './auth-core'
import type { RouteError } from './error-response'

export type RouteEnvelope<TOutput> = {
  response: TOutput | null
  errors: RouteError[] | null
}

export type RouteContext<TInput> = {
  event: H3Event
  auth: AuthContext
  input: TInput
}

export function defineRoute<TInput, TOutput>(
  _schema: ZodType<TInput>,
  _handler: (context: RouteContext<TInput>) => Promise<TOutput>,
): (event: H3Event) => Promise<RouteEnvelope<TOutput>> {
  throw new Error('Not implemented: defineRoute')
}
