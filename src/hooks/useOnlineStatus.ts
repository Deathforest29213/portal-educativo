import { useEffect, useState } from 'react'

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine)

  useEffect(() => {
    const updateOnline = () => setIsOnline(true)
    const updateOffline = () => setIsOnline(false)

    window.addEventListener('online', updateOnline)
    window.addEventListener('offline', updateOffline)

    return () => {
      window.removeEventListener('online', updateOnline)
      window.removeEventListener('offline', updateOffline)
    }
  }, [])

  return isOnline
}
