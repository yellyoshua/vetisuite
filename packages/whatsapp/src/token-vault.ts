import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'

const ALGORITHM = 'aes-256-gcm'

const KEY_BYTES = 32

const IV_BYTES = 12

const FORMAT_VERSION = 'v1'

function encryptionKey(): Buffer {
  const key = Buffer.from(process.env.WHATSAPP_TOKEN_ENCRYPTION_KEY || '', 'base64')

  if (key.length !== KEY_BYTES) {
    throw new Error('WHATSAPP_TOKEN_ENCRYPTION_KEY debe ser una clave de 32 bytes en base64')
  }

  return key
}

export function encryptAccessToken(accessToken: string): string {
  const iv = randomBytes(IV_BYTES)
  const cipher = createCipheriv(ALGORITHM, encryptionKey(), iv)
  const encrypted = Buffer.concat([cipher.update(accessToken, 'utf8'), cipher.final()])

  return [FORMAT_VERSION, iv.toString('base64'), cipher.getAuthTag().toString('base64'), encrypted.toString('base64')].join('.')
}

export function decryptAccessToken(encryptedAccessToken: string): string {
  const [version, iv, tag, encrypted] = encryptedAccessToken.split('.')

  if (version !== FORMAT_VERSION || !iv || !tag || !encrypted) {
    throw new Error('Token de WhatsApp con formato desconocido')
  }

  const decipher = createDecipheriv(ALGORITHM, encryptionKey(), Buffer.from(iv, 'base64'))

  decipher.setAuthTag(Buffer.from(tag, 'base64'))

  return Buffer.concat([decipher.update(Buffer.from(encrypted, 'base64')), decipher.final()]).toString('utf8')
}
