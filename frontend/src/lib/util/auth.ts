export function getAccessToken(): string | null {
  if (typeof document === 'undefined') return null

  const cookies = document.cookie ? document.cookie.split('; ') : []
  const target = cookies.find(c => c.startsWith('access_token='))

  if (!target) return null

  const value = target.split('=')[1]
  return value ? decodeURIComponent(value) : null
}

export function hasAccessToken(): boolean {
  return getAccessToken() !== null
}

export function getAccountIdFromToken(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const id = Number(payload.sub)
    return Number.isNaN(id) ? null : id
  } catch {
    return null
  }
}