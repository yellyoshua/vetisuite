import { describe, expect, it } from 'vitest'
import { decryptAccessToken, encryptAccessToken } from '../token-vault'

describe('token-vault', () => {
  it('cifra y descifra el token sin dejarlo en claro', () => {
    const encrypted = encryptAccessToken('EAAB-secreto')

    expect(encrypted).not.toContain('EAAB-secreto')
    expect(decryptAccessToken(encrypted)).toBe('EAAB-secreto')
  })

  it('cada cifrado usa un iv distinto', () => {
    expect(encryptAccessToken('token')).not.toBe(encryptAccessToken('token'))
  })

  it('rechaza un token manipulado', () => {
    const [version, iv, tag, data] = encryptAccessToken('token').split('.')
    const tampered = [version, iv, tag, Buffer.from('otro').toString('base64')].join('.')

    expect(data).toBeTruthy()
    expect(() => decryptAccessToken(tampered)).toThrow()
  })

  it('falla fuerte si la clave no mide 32 bytes', () => {
    const previous = process.env.WHATSAPP_TOKEN_ENCRYPTION_KEY

    process.env.WHATSAPP_TOKEN_ENCRYPTION_KEY = 'corta'

    expect(() => encryptAccessToken('token')).toThrow('32 bytes')

    process.env.WHATSAPP_TOKEN_ENCRYPTION_KEY = previous
  })
})
