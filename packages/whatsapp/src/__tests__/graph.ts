import { vi } from 'vitest'

export type Reply = { status?: number; body: unknown }

export function mockGraph(...replies: Reply[]) {
  const fetchMock = vi.fn()

  replies.forEach(({ status = 200, body }) => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify(body), { status }))
  })
  vi.stubGlobal('fetch', fetchMock)

  return fetchMock
}

export function requestOf(fetchMock: ReturnType<typeof vi.fn>, call: number) {
  const [url, init] = fetchMock.mock.calls[call] as [URL, RequestInit]

  return { url, method: init.method, headers: init.headers as Record<string, string>, body: init.body ? JSON.parse(String(init.body)) : undefined }
}
