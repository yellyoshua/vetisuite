import { apiDomain } from '@/lib/environment'
import { useSessionStore } from '@/stores/session.store'

export type ServiceFailure = {
  status: number
  error: string
  fields?: string[]
}

export type ServiceQuery = Record<string, unknown>

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

type Envelope = {
  response?: unknown
  errors?: string[] | null
  fields?: string[]
}

export default function service(path: string) {
  const base = `${apiDomain}/api/${path}`

  return {
    get: <T = unknown>(query?: ServiceQuery) => send<T>('GET', withQuery(base, query)),
    getOne: async <T = unknown>(query?: ServiceQuery) => (await send<T[] | null>('GET', withQuery(base, query)))?.[0] ?? null,
    post: <T = unknown>(body?: unknown) => send<T>('POST', base, body),
    put: <T = unknown>(body?: unknown) => send<T>('PUT', base, body),
    remove: <T = unknown>(query?: ServiceQuery) => send<T>('DELETE', withQuery(base, query)),
  }
}

async function send<T>(method: HttpMethod, url: string, body?: unknown): Promise<T> {
  const options = bodyOptions(body)

  const response = await fetch(url, {
    method,
    cache: 'no-store',
    credentials: 'include',
    ...options,
  }).catch(() => {
    const failure: ServiceFailure = { status: 0, error: 'No se pudo conectar con el servidor. Revisa tu conexión a internet.' }
    throw failure
  })

  const envelope: Envelope = await response.json().catch(() => ({}))

  if (response.status === 401) {
    useSessionStore.getState().clear()
  }

  if (!response.ok || envelope.errors) {
    const failure: ServiceFailure = {
      status: response.status,
      error: envelope.errors?.[0] || 'Ocurrió un error inesperado',
      fields: envelope.fields,
    }
    throw failure
  }

  return envelope.response as T
}

function bodyOptions(body: unknown): RequestInit {
  if (body === undefined) {
    return {}
  }

  if (body instanceof FormData) {
    return { body }
  }

  return { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
}

function withQuery(url: string, query?: ServiceQuery): string {
  const entries = Object.entries(query || {})
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => [key, String(value)])

  if (entries.length === 0) {
    return url
  }

  return `${url}?${new URLSearchParams(entries).toString()}`
}
