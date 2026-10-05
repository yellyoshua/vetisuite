import { afterEach, describe, expect, it, vi } from 'vitest'
import { encryptAccessToken } from '../token-vault'
import { describeError } from '../graph'
import { sendUtilityTemplate } from '../messages'
import { mockGraph, requestOf } from './graph'

const INPUT = {
  encryptedAccessToken: encryptAccessToken('token-clinica'),
  phoneNumberId: '1055',
  to: '+5215512345678',
  template: 'appointment_reminder',
  language: 'es_MX',
  parameters: { pet_name: 'Luna', date: '12 oct 10:00' },
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('sendUtilityTemplate', () => {
  it('envía la plantilla con parámetros con nombre y el token de la clínica', async () => {
    const fetchMock = mockGraph({ body: { messages: [{ id: 'wamid.ABC', message_status: 'accepted' }] } })

    const result = await sendUtilityTemplate(INPUT)
    const request = requestOf(fetchMock, 0)

    expect(result).toEqual({ messageId: 'wamid.ABC' })
    expect(request.url.pathname).toBe('/v26.0/1055/messages')
    expect(request.headers.Authorization).toBe('Bearer token-clinica')
    expect(request.body.type).toBe('template')
    expect(request.body.template.components[0].parameters).toEqual([
      { type: 'text', parameter_name: 'pet_name', text: 'Luna' },
      { type: 'text', parameter_name: 'date', text: '12 oct 10:00' },
    ])
  })

  it('rechaza un teléfono sin formato internacional antes de llamar a Meta', async () => {
    const fetchMock = mockGraph()

    await expect(sendUtilityTemplate({ ...INPUT, to: '5512345678' })).rejects.toThrow('formato internacional')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('un error de plantilla inexistente es permanente', async () => {
    mockGraph({ status: 400, body: { error: { code: 132001, message: 'x', error_data: { details: 'Template name does not exist' } } } })

    const error = await sendUtilityTemplate(INPUT).catch((reason) => reason)

    expect(describeError(error)).toEqual({ code: 132001, message: 'Template name does not exist', isRetryable: false, requiresReauth: false })
  })

  it('el límite de throughput se reintenta', async () => {
    mockGraph({ status: 429, body: { error: { code: 130429, message: 'rate' } } })

    expect(describeError(await sendUtilityTemplate(INPUT).catch((reason) => reason)).isRetryable).toBe(true)
  })

  it('un token vencido pide reconectar y no se reintenta', async () => {
    mockGraph({ status: 401, body: { error: { code: 190, message: 'expired' } } })

    const described = describeError(await sendUtilityTemplate(INPUT).catch((reason) => reason))

    expect(described.requiresReauth).toBe(true)
    expect(described.isRetryable).toBe(false)
  })

  it('un corte de red se reintenta', () => {
    expect(describeError(new TypeError('fetch failed')).isRetryable).toBe(true)
  })
})
