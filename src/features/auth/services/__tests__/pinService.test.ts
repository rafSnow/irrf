import { describe, it, expect } from 'vitest'
import { pinService } from '../pinService'

describe('pinService', () => {
  it('should hash a pin and verify it correctly', async () => {
    const pin = '123456'
    const hash = await pinService.hashPin(pin)
    
    expect(hash).toBeDefined()
    expect(typeof hash).toBe('string')
    
    const isValid = await pinService.verifyPin(pin, hash)
    expect(isValid).toBe(true)
  })

  it('should fail verification with wrong pin', async () => {
    const pin = '123456'
    const wrongPin = '654321'
    const hash = await pinService.hashPin(pin)
    
    const isValid = await pinService.verifyPin(wrongPin, hash)
    expect(isValid).toBe(false)
  })

  it('should produce different hashes for different pins', async () => {
    const hash1 = await pinService.hashPin('123456')
    const hash2 = await pinService.hashPin('111111')
    
    expect(hash1).not.toBe(hash2)
  })
})
