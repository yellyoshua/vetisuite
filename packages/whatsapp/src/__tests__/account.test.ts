import { afterEach, describe, expect, it, vi } from 'vitest'
import { connectAccount } from '../account'
import { decryptAccessToken } from '../token-vault'
import { mockGraph, requestOf } from './graph'

const INPUT = { code: 'code-1', wabaId: 'waba-1', phoneNumberId: 'phone-1' }

const PHONE = { display_phone_number: '+52 55 1234 5678', verified_name: 'Clínica Norte' }

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('connectAccount', () => {
  it('canjea el code, suscribe el webhook y devuelve el token cifrado', async () => {
    const fetchMock = mockGraph(
      { body: { access_token: 'token-clinica' } },
      { body: { success: true } },
      { body: { ...PHONE, status: 'CONNECTED' } },
    )

    const result = await connectAccount(INPUT)

    expect(requestOf(fetchMock, 0).url.searchParams.get('code')).toBe('code-1')
    expect(requestOf(fetchMock, 1).url.pathname).toBe('/v26.0/waba-1/subscribed_apps')
    expect(requestOf(fetchMock, 1).headers.Authorization).toBe('Bearer token-clinica')
    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(decryptAccessToken(result.encryptedAccessToken)).toBe('token-clinica')
    expect(result.phoneNumberId).toBe('phone-1')
    expect(result.displayPhoneNumber).toBe('+52 55 1234 5678')
    expect(result.verifiedName).toBe('Clínica Norte')
  })

  it('registra el número cuando Meta no lo dejó conectado', async () => {
    const fetchMock = mockGraph(
      { body: { access_token: 'token-clinica' } },
      { body: { success: true } },
      { body: { ...PHONE, status: 'PENDING' } },
      { body: { success: true } },
    )

    await connectAccount(INPUT)

    const register = requestOf(fetchMock, 3)

    expect(register.url.pathname).toBe('/v26.0/phone-1/register')
    expect(register.body.pin).toMatch(/^\d{6}$/)
  })

  it('resuelve el número desde la WABA cuando el evento no lo trae', async () => {
    const fetchMock = mockGraph(
      { body: { access_token: 'token-clinica' } },
      { body: { success: true } },
      { body: { data: [{ id: 'phone-7' }] } },
      { body: { ...PHONE, status: 'CONNECTED' } },
    )

    const result = await connectAccount({ code: 'code-1', wabaId: 'waba-1' })

    expect(requestOf(fetchMock, 2).url.pathname).toBe('/v26.0/waba-1/phone_numbers')
    expect(requestOf(fetchMock, 3).url.pathname).toBe('/v26.0/phone-7')
    expect(result.phoneNumberId).toBe('phone-7')
  })

  it('falla fuerte si la WABA tiene más de un número', async () => {
    mockGraph(
      { body: { access_token: 'token-clinica' } },
      { body: { success: true } },
      { body: { data: [{ id: 'a' }, { id: 'b' }] } },
    )

    await expect(connectAccount({ code: 'code-1', wabaId: 'waba-1' })).rejects.toThrow('exactamente un número')
  })
})
