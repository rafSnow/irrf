/** @vitest-environment node */
import { describe, it, expect, beforeAll } from 'vitest'
import { encryptionService } from '../encryptionService'

describe('encryptionService', () => {
  const pin = '123456'
  const salt = new Uint8Array(16).fill(1)
  let key: CryptoKey

  beforeAll(async () => {
    key = await encryptionService.deriveKey(pin, salt)
  })

  it('should derive a valid CryptoKey', () => {
    expect(key).toBeDefined()
    expect(key.type).toBe('secret')
  })

  it('should encrypt and decrypt correctly (round-trip)', async () => {
    const originalText = 'Dados sensíveis do IRPF'
    const encoder = new TextEncoder()
    const data = encoder.encode(originalText).buffer

    const encrypted = await encryptionService.encrypt(data, key)
    expect(encrypted.byteLength).toBeGreaterThan(data.byteLength)

    const decrypted = await encryptionService.decrypt(encrypted, key)
    const decoder = new TextDecoder()
    const resultText = decoder.decode(decrypted)

    expect(resultText).toBe(originalText)
  })

  it('should fail to decrypt with a different key', async () => {
    const data = new TextEncoder().encode('test').buffer
    const encrypted = await encryptionService.encrypt(data, key)

    const otherKey = await encryptionService.deriveKey('654321', salt)

    await expect(encryptionService.decrypt(encrypted, otherKey)).rejects.toThrow()
  })
})
