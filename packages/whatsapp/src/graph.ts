import { decryptAccessToken } from './token-vault'

const DEFAULT_GRAPH_VERSION = 'v26.0'

const RETRYABLE_CODES = new Set([130429, 131056, 131000, 135000, 131016, 131057])

const REAUTH_CODE = 190

const HTTP_UNAUTHORIZED = 401

const HTTP_SERVER_ERROR = 500

type GraphRequest = {
  path: string
  method?: 'GET' | 'POST' | 'DELETE'
  accessToken?: string
  query?: Record<string, string>
  body?: unknown
}

type GraphErrorBody = {
  error?: { message?: string; code?: number; error_data?: { details?: string } }
}

class GraphError extends Error {
  code: number | null
  status: number

  constructor(message: string, code: number | null, status: number) {
    super(message)
    this.code = code
    this.status = status
  }
}

export function appConfig() {
  const appId = process.env.WHATSAPP_APP_ID
  const appSecret = process.env.WHATSAPP_APP_SECRET

  if (!appId || !appSecret) {
    throw new Error('Faltan WHATSAPP_APP_ID y WHATSAPP_APP_SECRET')
  }

  return { appId, appSecret, version: process.env.WHATSAPP_GRAPH_VERSION || DEFAULT_GRAPH_VERSION }
}

export function businessToken(encryptedAccessToken: string): string {
  return decryptAccessToken(encryptedAccessToken)
}

export async function graph<T>({ path, method = 'GET', accessToken, query, body }: GraphRequest): Promise<T> {
  const { version } = appConfig()
  const url = new URL(`https://graph.facebook.com/${version}/${path}`)

  Object.entries(query || {}).forEach(([key, value]) => url.searchParams.set(key, value))

  const response = await fetch(url, {
    method,
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  const payload = (await response.json().catch(() => ({}))) as GraphErrorBody

  if (!response.ok) {
    throw new GraphError(
      payload.error?.error_data?.details || payload.error?.message || `Graph API respondió ${response.status}`,
      payload.error?.code ?? null,
      response.status,
    )
  }

  return payload as T
}

// Los errores de red no son GraphError: se reintentan igual que un 5xx.
export function describeError(error: unknown) {
  if (!(error instanceof GraphError)) {
    return { code: null, message: String(error instanceof Error ? error.message : error), isRetryable: true, requiresReauth: false }
  }

  return {
    code: error.code,
    message: error.message,
    isRetryable: RETRYABLE_CODES.has(error.code ?? 0) || (error.code === null && error.status >= HTTP_SERVER_ERROR),
    requiresReauth: error.code === REAUTH_CODE || error.status === HTTP_UNAUTHORIZED,
  }
}
