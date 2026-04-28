const PBKDF2_ITERATIONS = 100000
const SALT_KEY = 'auth_salt'

export async function getSalt(): Promise<Uint8Array> {
  const storedSalt = localStorage.getItem(SALT_KEY)
  if (storedSalt) {
    return new Uint8Array(storedSalt.split(',').map(Number))
  }
  const salt = globalThis.crypto.getRandomValues(new Uint8Array(16))
  localStorage.setItem(SALT_KEY, salt.toString())
  return salt
}

export const pinService = {
  async hashPin(pin: string): Promise<string> {
    const salt = await getSalt()
    const encoder = new TextEncoder()
    const pinData = encoder.encode(pin)

    const baseKey = await globalThis.crypto.subtle.importKey('raw', pinData, 'PBKDF2', false, [
      'deriveBits',
      'deriveKey',
    ])

    const derivedBits = await globalThis.crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt as BufferSource,
        iterations: PBKDF2_ITERATIONS,
        hash: 'SHA-256',
      },
      baseKey,
      256,
    )

    return btoa(String.fromCharCode(...new Uint8Array(derivedBits)))
  },

  async verifyPin(pin: string, storedHash: string): Promise<boolean> {
    const hash = await this.hashPin(pin)
    return hash === storedHash
  },
}
