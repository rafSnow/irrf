export const webAuthnService = {
  isSupported: (): boolean => {
    return !!(
      window.PublicKeyCredential &&
      window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable
    )
  },

  async isAvailable(): Promise<boolean> {
    if (!this.isSupported()) return false
    return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
  },

  async register(username: string): Promise<PublicKeyCredential | null> {
    const challenge = window.crypto.getRandomValues(new Uint8Array(32))
    const userId = window.crypto.getRandomValues(new Uint8Array(16))

    const options: PublicKeyCredentialCreationOptions = {
      challenge,
      rp: {
        name: 'Guardião Fiscal',
        id: window.location.hostname,
      },
      user: {
        id: userId,
        name: username,
        displayName: username,
      },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' }, // ES256
        { alg: -257, type: 'public-key' }, // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required',
      },
      timeout: 60000,
    }

    try {
      const credential = (await navigator.credentials.create({
        publicKey: options,
      })) as PublicKeyCredential
      return credential
    } catch (err) {
      console.error('Error creating credential:', err)
      return null
    }
  },

  async authenticate(): Promise<boolean> {
    const challenge = window.crypto.getRandomValues(new Uint8Array(32))

    const options: PublicKeyCredentialRequestOptions = {
      challenge,
      rpId: window.location.hostname,
      userVerification: 'required',
      timeout: 60000,
    }

    try {
      const assertion = await navigator.credentials.get({
        publicKey: options,
      })
      return !!assertion
    } catch (err) {
      console.error('Error during authentication:', err)
      return false
    }
  },
}
