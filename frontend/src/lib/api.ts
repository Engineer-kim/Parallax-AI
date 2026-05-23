import type { AuthResponse, BackendRequest, BackendResponse, LoginRequest, SignUpRequest } from '@/lib/types'

const API_BASE = 'http://127.0.0.1:8000'

function buildJsonHeaders(token?: string | null) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

function getServerErrorMessage(body: unknown, fallback: string) {
  if (!body) return fallback
  if (typeof body === 'string') return body
  if (Array.isArray(body)) {
    return body
      .map(item => (typeof item === 'string' ? item : JSON.stringify(item)))
      .join(', ')
  }

  if (typeof body === 'object') {
    if (body === null) return fallback

    const errorBody = body as Record<string, unknown>
    if (typeof errorBody.detail === 'string') return errorBody.detail
    if (typeof errorBody.message === 'string') return errorBody.message
    return Object.keys(errorBody).length ? JSON.stringify(errorBody) : fallback
  }

  return fallback
}

function translateFetchError(error: unknown) {
  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    if (message.includes('failed to fetch') || message.includes('networkerror') || message.includes('network request failed')) {
      return '서버에 연결할 수 없습니다. 네트워크 상태를 확인해주세요.'
    }
    return '요청 처리 중 오류가 발생했습니다.'
  }
  return '알 수 없는 오류가 발생했습니다.'
}

export async function sendChatRequest(
  body: BackendRequest,
  token?: string | null
): Promise<BackendResponse> {
  try {
    const res = await fetch(`${API_BASE}/start/chat`, {
      method: 'POST',
      headers: buildJsonHeaders(token),
      credentials: 'include',
      body: JSON.stringify(body),
    })

    if (res.status === 401) {
      throw new Error('AUTH_EXPIRED')
    }

    if (!res.ok) {
      const errBody = await res.json().catch(() => null)
      const detail = getServerErrorMessage(errBody, `${res.status} ${res.statusText}`)
      throw new Error(detail)
    }

    return res.json()
  } catch (error) {
    throw new Error(translateFetchError(error))
  }
}

export async function signup(request: SignUpRequest): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE}/session/signup`, {
      method: 'POST',
      headers: buildJsonHeaders(),
      credentials: 'include',
      body: JSON.stringify(request),
    })

    if (!res.ok) {
      const errBody = await res.json().catch(() => null)
      const detail = getServerErrorMessage(errBody, `${res.status} ${res.statusText}`)
      throw new Error(detail)
    }

    return res.json()
  } catch (error) {
    throw new Error(translateFetchError(error))
  }
}

export async function login(request: LoginRequest): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE}/session/login`, {
      method: 'POST',
      headers: buildJsonHeaders(),
      credentials: 'include',
      body: JSON.stringify(request),
    })

    if (!res.ok) {
      const errBody = await res.json().catch(() => null)
      const detail = getServerErrorMessage(errBody, `${res.status} ${res.statusText}`)
      throw new Error(detail)
    }

    return res.json()
  } catch (error) {
    throw new Error(translateFetchError(error))
  }
}

export async function logout(): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE}/session/logout`, {
      method: 'POST',
      headers: buildJsonHeaders(),
      credentials: 'include',
    })

    if (!res.ok) {
      const errBody = await res.json().catch(() => null)
      const detail = getServerErrorMessage(errBody, `${res.status} ${res.statusText}`)
      throw new Error(detail)
    }

    return res.json()
  } catch (error) {
    throw new Error(translateFetchError(error))
  }
}

export async function refreshAccessToken(): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE}/session/refresh`, {
      method: 'POST',
      headers: buildJsonHeaders(),
      credentials: 'include',
    })

    if (!res.ok) {
      const errBody = await res.json().catch(() => null)
      const detail = getServerErrorMessage(errBody, `${res.status} ${res.statusText}`)
      throw new Error(detail)
    }

    return res.json()
  } catch (error) {
    throw new Error(translateFetchError(error))
  }
}
