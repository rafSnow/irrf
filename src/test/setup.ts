import '@testing-library/jest-dom'
import 'fake-indexeddb/auto'
import { webcrypto } from 'node:crypto'

// Polyfill for environments missing Web Crypto (like some versions of JSDOM)
if (typeof globalThis.crypto === 'undefined') {
  // @ts-expect-error - polyfilling globalThis.crypto
  globalThis.crypto = webcrypto
} else if (typeof globalThis.crypto.subtle === 'undefined') {
  Object.defineProperty(globalThis.crypto, 'subtle', {
    value: webcrypto.subtle,
    writable: false,
  })
}
