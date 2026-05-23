import { useState, useEffect } from 'react'
import { logout } from '@/lib/api'

export function useAuth() {
  const [accountId, setAccountId] = useState<number | null>(null)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const verifyLoginStatus = async () => {
      try {
        const response = await fetch('/api/session/me', {
          method: 'GET',
          credentials: 'include',
        })

        if (response.ok) {
          const data = await response.json()

          if (data?.account_id) {
            setAccountId(Number(data.account_id))
            setShowLoginModal(false)
          } else {
            setAccountId(null)
          }
        } else {
          setAccountId(null)
        }
      } catch {
        setAccountId(null)
      }
    }

    verifyLoginStatus()
  }, [])

  useEffect(() => {
    const onFocus = async () => {
      try {
        const response = await fetch('/api/session/me', {
          method: 'GET',
          credentials: 'include',
        })

        if (response.ok) {
          const data = await response.json()
          if (data?.account_id) {
            setAccountId(Number(data.account_id))
          }
        }
      } catch {
        setAccountId(null)
      }
    }

    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [])

  const handleLogout = async () => {
    setLoading(true)

    try {
      await logout()
      setAccountId(null)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : '로그아웃 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

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