import { useState, useCallback } from 'react'
import { logout } from '@/lib/api'
import { blockHistoryNavigation } from '../util/historyDelete'

export function useAuth(initialAccountId: number | null, onLogout?: () => void) {
  const [accountId, setAccountId] = useState<number | null>(initialAccountId)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogout = useCallback(async () => {
    setLoading(true)
    await logout()
    blockHistoryNavigation()
    setAccountId(null)
    setError(null)
    setLoading(false)
    onLogout?.()
  }, [onLogout])

  return {
    accountId,
    setAccountId,
    showLoginModal,
    setShowLoginModal,
    loading,
    setLoading,
    error,
    setError,
    handleLogout,
  }
}