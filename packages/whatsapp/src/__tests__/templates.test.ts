import { afterEach, describe, expect, it, vi } from 'vitest'
import { syncUtilityTemplates } from '../templates'
import { encryptAccessToken } from '../token-vault'
import { mockGraph, requestOf } from './graph'

const DEFINITION = {
  name: 'appointment_reminder',
  language: 'es_MX',
  body: 'Hola, recordatorio de la cita de {{pet_name}}.',
  parameters: [{ name: 'pet_name', example: 'Luna' }],
}

const INPUT = { wabaId: 'waba-1', encryptedAccessToken: encryptAccessToken('token'), templates: [DEFINITION] }

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('syncUtilityTemplates', () => {
  it('crea como UTILITY la plantilla que falta', async () => {
    const fetchMock = mockGraph({ body: { data: [] } }, { body: { id: 'tpl-1', status: 'PENDING', category: 'UTILITY' } })

    const [template] = await syncUtilityTemplates(INPUT)
    const created = requestOf(fetchMock, 1)

    expect(created.body.category).toBe('UTILITY')
    expect(created.body.parameter_format).toBe('NAMED')
    expect(created.body.components[0].example.body_text_named_params).toEqual([{ param_name: 'pet_name', example: 'Luna' }])
    expect(template).toEqual({ metaId: 'tpl-1', name: 'appointment_reminder', language: 'es_MX', status: 'pending', category: 'utility', rejectedReason: null })
  })

  it('no vuelve a crear la que ya existe y respeta la categoría que fijó Meta', async () => {
    const fetchMock = mockGraph({
      body: { data: [{ id: 'tpl-1', name: 'appointment_reminder', language: 'es_MX', status: 'APPROVED', category: 'MARKETING' }] },
    })

    const [template] = await syncUtilityTemplates(INPUT)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(template).toMatchObject({ status: 'approved', category: 'marketing' })
  })

  it('un estado desconocido nunca queda como aprobado', async () => {
    mockGraph({ body: { data: [{ id: 'tpl-1', name: 'appointment_reminder', language: 'es_MX', status: 'PENDING_DELETION', category: 'UTILITY' }] } })

    const [template] = await syncUtilityTemplates(INPUT)

    expect(template!.status).toBe('disabled')
  })
})
