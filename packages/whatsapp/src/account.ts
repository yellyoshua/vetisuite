import { randomInt } from 'node:crypto'
import { appConfig, businessToken, graph } from './graph'
import { encryptAccessToken } from './token-vault'

const CONNECTED_STATUS = 'CONNECTED'

const PIN_DIGITS = 1_000_000

type ConnectAccountInput = {
  code: string
  wabaId: string
  phoneNumberId?: string
}

type DisconnectAccountInput = {
  wabaId: string
  encryptedAccessToken: string
}

type PhoneNumberInfo = {
  display_phone_number: string
  verified_name: string
  status: string
}

type AccessTokenResponse = {
  access_token: string
}

type PhoneNumberList = {
  data: { id: string }[]
}

// Con coexistencia el evento del Embedded Signup puede no traer el phone_number_id: la WABA de una
// clínica conectada con su número existente tiene uno solo.
async function resolvePhoneNumberId(wabaId: string, accessToken: string): Promise<string> {
  const { data } = await graph<PhoneNumberList>({ path: `${wabaId}/phone_numbers`, accessToken, query: { fields: 'id' } })

  if (data.length !== 1) {
    throw new Error(`La WABA ${wabaId} no tiene exactamente un número de teléfono`)
  }

  return data[0]!.id
}

// Cierra el Embedded Signup: canjea el code (vive 30 s), suscribe el webhook de la WABA del cliente
// y registra el número si Meta no lo dejó conectado (un número con coexistencia ya viene registrado).
export async function connectAccount({ code, wabaId, phoneNumberId: reportedPhoneNumberId }: ConnectAccountInput) {
  const { appId, appSecret } = appConfig()

  const { access_token: accessToken } = await graph<AccessTokenResponse>({
    path: 'oauth/access_token',
    query: { client_id: appId, client_secret: appSecret, code },
  })

  await graph({ path: `${wabaId}/subscribed_apps`, method: 'POST', accessToken })

  const phoneNumberId = reportedPhoneNumberId ?? (await resolvePhoneNumberId(wabaId, accessToken))
  const phone = await graph<PhoneNumberInfo>({
    path: phoneNumberId,
    accessToken,
    query: { fields: 'display_phone_number,verified_name,status' },
  })

  if (phone.status !== CONNECTED_STATUS) {
    await graph({
      path: `${phoneNumberId}/register`,
      method: 'POST',
      accessToken,
      body: { messaging_product: 'whatsapp', pin: String(randomInt(PIN_DIGITS)).padStart(6, '0') },
    })
  }

  return {
    phoneNumberId,
    encryptedAccessToken: encryptAccessToken(accessToken),
    displayPhoneNumber: phone.display_phone_number,
    verifiedName: phone.verified_name,
  }
}

export async function disconnectAccount({ wabaId, encryptedAccessToken }: DisconnectAccountInput): Promise<void> {
  await graph({ path: `${wabaId}/subscribed_apps`, method: 'DELETE', accessToken: businessToken(encryptedAccessToken) })
}
