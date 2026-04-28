const PBKDF2_ITERATIONS = 100000
const ALGO = 'AES-GCM'
const IV_LENGTH = 12

export const encryptionService = {
  async deriveKey(pin: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder()
    const pinData = encoder.encode(pin)

    const baseKey = await globalThis.crypto.subtle.importKey('raw', pinData, 'PBKDF2', false, [
      'deriveBits',
      'deriveKey',
    ])

    return await globalThis.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt as any,
        iterations: PBKDF2_ITERATIONS,
        hash: 'SHA-256',
      },
      baseKey,
      { name: ALGO, length: 256 },
      false,
      ['encrypt', 'decrypt'],
    )
  },

  async encrypt(data: ArrayBuffer, key: CryptoKey): Promise<ArrayBuffer> {
    const iv = globalThis.crypto.getRandomValues(new Uint8Array(IV_LENGTH))
    const encrypted = await globalThis.crypto.subtle.encrypt(
      {
        name: ALGO,
        iv,
      },
      key,
      data,
    )

    // Combine IV + Encrypted Data
    const combined = new Uint8Array(iv.length + encrypted.byteLength)
    combined.set(iv)
    combined.set(new Uint8Array(encrypted), iv.length)

    return combined.buffer
  },

  async decrypt(data: ArrayBuffer, key: CryptoKey): Promise<ArrayBuffer> {
    const iv = new Uint8Array(data.slice(0, IV_LENGTH))
    const encryptedData = data.slice(IV_LENGTH)

    return await globalThis.crypto.subtle.decrypt(
      {
        name: ALGO,
        iv,
      },
      key,
      encryptedData,
    )
  },
}
