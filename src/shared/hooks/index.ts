import { useState, useEffect } from 'react'

export function useNetwork() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return { isOnline }
}

export function useStorage() {
  const [usage, setUsage] = useState<{ used: number; total: number; percent: number } | null>(null)

  useEffect(() => {
    if (!navigator.storage || !navigator.storage.estimate) return

    const checkStorage = async () => {
      const estimate = await navigator.storage.estimate()
      if (estimate.usage !== undefined && estimate.quota !== undefined) {
        setUsage({
          used: estimate.usage,
          total: estimate.quota,
          percent: (estimate.usage / estimate.quota) * 100,
        })
      }
    }

    checkStorage()
    // Check every minute
    const interval = setInterval(checkStorage, 60000)
    return () => clearInterval(interval)
  }, [])

  return { usage }
}
