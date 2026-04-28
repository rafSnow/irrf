import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { pinService, getSalt } from '../../features/auth/services/pinService'
import { webAuthnService } from '../../features/auth/services/webAuthnService'
import { encryptionService } from '../../features/documents/services/encryptionService'
import { documentService } from '../../features/documents/services/documentService'
import { settingsRepository } from '../../db/repositories/settingsRepository'

interface AuthContextType {
  isAuthenticated: boolean
  isLocked: boolean
  hasPin: boolean
  isBiometryEnabled: boolean
  encryptionKey: CryptoKey | null
  login: (pin: string) => Promise<boolean>
  loginWithBiometry: () => Promise<boolean>
  setupPin: (pin: string) => Promise<void>
  enableBiometry: () => Promise<boolean>
  disableBiometry: () => Promise<void>
  lock: () => void
  logout: () => void
  attempts: number
}

const AuthContext = createContext<AuthContextType | null>(null)

const MAX_ATTEMPTS = 5
const INACTIVITY_TIMEOUT = 5 * 60 * 1000 // 5 minutes

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLocked, setIsLocked] = useState(true)
  const [hasPin, setHasPin] = useState<boolean>(false)
  const [isBiometryEnabled, setIsBiometryEnabled] = useState(false)
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null)
  const [attempts, setAttempts] = useState(0)

  useEffect(() => {
    const initAuth = async () => {
      const storedPinHash = await settingsRepository.get('pin_hash')
      const biometryEnabled = await settingsRepository.get('biometry_enabled')
      setHasPin(!!storedPinHash)
      setIsBiometryEnabled(!!biometryEnabled)
    }
    initAuth()
  }, [])

  const lock = useCallback(() => {
    setIsAuthenticated(false)
    setIsLocked(true)
    setEncryptionKey(null) // Security: clear key on lock
  }, [])

  const logout = useCallback(async () => {
    lock()
  }, [lock])

  useEffect(() => {
    if (!isAuthenticated) return

    let timeout: number
    const resetTimer = () => {
      window.clearTimeout(timeout)
      timeout = window.setTimeout(lock, INACTIVITY_TIMEOUT)
    }

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    events.forEach((event) => window.addEventListener(event, resetTimer))
    resetTimer()

    return () => {
      window.clearTimeout(timeout)
      events.forEach((event) => window.removeEventListener(event, resetTimer))
    }
  }, [isAuthenticated, lock])

  useEffect(() => {
    if (encryptionKey) {
      documentService.migrateToEncryption(encryptionKey).then((count) => {
        if (count > 0) console.log(`Migrated ${count} documents to encryption`)
      })
    }
  }, [encryptionKey])

  const login = async (pin: string) => {
    if (attempts >= MAX_ATTEMPTS) return false

    const storedPinHash = (await settingsRepository.get('pin_hash')) as string
    if (!storedPinHash) return false

    const isValid = await pinService.verifyPin(pin, storedPinHash)
    if (isValid) {
      const salt = await getSalt()
      const key = await encryptionService.deriveKey(pin, salt)

      setEncryptionKey(key)
      setIsAuthenticated(true)
      setIsLocked(false)
      setAttempts(0)

      // Store PIN temporarily in session storage ONLY if biometry is enabled
      // so we can re-derive the key when biometry is used.
      // This is a compromise for UX vs security.
      if (isBiometryEnabled) {
        sessionStorage.setItem('temp_pin', pin)
      }

      return true
    } else {
      setAttempts((prev) => prev + 1)
      return false
    }
  }

  const loginWithBiometry = async () => {
    if (!isBiometryEnabled) return false
    const success = await webAuthnService.authenticate()
    if (success) {
      const tempPin = sessionStorage.getItem('temp_pin')
      if (tempPin) {
        const salt = await getSalt()
        const key = await encryptionService.deriveKey(tempPin, salt)
        setEncryptionKey(key)
      }

      setIsAuthenticated(true)
      setIsLocked(false)
      setAttempts(0)
      return true
    }
    return false
  }

  const setupPin = async (pin: string) => {
    const hash = await pinService.hashPin(pin)
    await settingsRepository.set('pin_hash', hash)

    const salt = await getSalt()
    const key = await encryptionService.deriveKey(pin, salt)

    setEncryptionKey(key)
    setHasPin(true)
    setIsAuthenticated(true)
    setIsLocked(false)
  }

  const enableBiometry = async () => {
    const success = await webAuthnService.register('usuario-irrf')
    if (success) {
      await settingsRepository.set('biometry_enabled', true)
      setIsBiometryEnabled(true)
      return true
    }
    return false
  }

  const disableBiometry = async () => {
    await settingsRepository.set('biometry_enabled', false)
    setIsBiometryEnabled(false)
    sessionStorage.removeItem('temp_pin')
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLocked,
        hasPin,
        isBiometryEnabled,
        encryptionKey,
        login,
        loginWithBiometry,
        setupPin,
        enableBiometry,
        disableBiometry,
        lock,
        logout,
        attempts,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
