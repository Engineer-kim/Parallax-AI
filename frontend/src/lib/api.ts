import type {
  AuthResponse,
  BackendRequest,
  BackendResponse,
  LoginRequest,
  SignUpRequest,
} from '@/lib/types'

const API_BASE = 'http://localhost:8000'

function buildJsonHeaders() {
  return {
    'Content-Type': 'application/json',
  }
}

function getServerErrorMessage(body: unknown, fallback: string) {
  if (!body) return fallback
  if (typeof body === 'string') return body
  if (Array.isArray(body)) {
    return body.map(item => (typeof item === 'string' ? item : JSON.stringify(item))).join(', ')
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

function translateNetworkError(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    if (
      message.includes('failed to fetch') ||
      message.includes('networkerror') ||
      message.includes('network request failed') ||
      message.includes('load failed')
    ) {
      return '서버에 연결할 수 없습니다. 네트워크 상태를 확인해주세요.'
    }
    return error.message || '요청 처리 중 오류가 발생했습니다.'
  }
  return '알 수 없는 오류가 발생했습니다.'
}

export async function sendChatRequest(
  body: BackendRequest,
): Promise<BackendResponse> {
  const request = async () =>
    fetch(`${API_BASE}/start/chat`, {
      method: 'POST',
      headers: buildJsonHeaders(),
      credentials: 'include',
      body: JSON.stringify(body),
    })

  let res = await request()

  if (res.status === 401) {
    const refreshRes = await refreshAccessToken()
    if (!refreshRes) throw new Error('AUTH_EXPIRED')
    res = await request()
  }

  if (!res.ok) {
    const errBody = await res.json().catch(() => null)
    const detail = getServerErrorMessage(errBody, `${res.status}`)
    throw new Error(detail)
  }

  return res.json()
}

export async function signup(request: SignUpRequest): Promise<AuthResponse> {
  let res: Response

  try {
    res = await fetch(`${API_BASE}/session/signup`, {
      method: 'POST',
      headers: buildJsonHeaders(),
      credentials: 'include',
      body: JSON.stringify(request),
    })
  } catch (error) {
    throw new Error(translateNetworkError(error))
  }

  if (!res.ok) {
    const errBody = await res.json().catch(() => null)
    const detail = getServerErrorMessage(errBody, `${res.status}`)
    throw new Error(detail)
  }

  return res.json()
}

export async function login(request: LoginRequest): Promise<AuthResponse> {
  let res: Response

  try {
    res = await fetch(`${API_BASE}/session/login`, {
      method: 'POST',
      headers: buildJsonHeaders(),
      credentials: 'include',
      body: JSON.stringify(request),
    })
  } catch (error) {
    throw new Error(translateNetworkError(error))
  }

  if (!res.ok) {
    const errBody = await res.json().catch(() => null)
    if (res.status === 401 || res.status === 403) {
      const detail = getServerErrorMessage(errBody, '아이디 또는 비밀번호가 올바르지 않습니다.')
      throw new Error(detail)
    }
    const detail = getServerErrorMessage(errBody, `${res.status}`)
    throw new Error(detail)
  }

  return res.json()
}

export async function logout(): Promise<AuthResponse> {
  let res: Response

  try {
    res = await fetch(`${API_BASE}/session/logout`, {
      method: 'POST',
      headers: buildJsonHeaders(),
      credentials: 'include',
    })
  } catch (error) {
    throw new Error(translateNetworkError(error))
  }

  if (!res.ok) {
    const errBody = await res.json().catch(() => null)
    const detail = getServerErrorMessage(errBody, `${res.status}`)
    throw new Error(detail)
  }

  return res.json()
}

export async function refreshAccessToken(): Promise<AuthResponse> {
  let res: Response

  try {
    res = await fetch(`${API_BASE}/session/refresh`, {
      method: 'POST',
      headers: buildJsonHeaders(),
      credentials: 'include',
    })
  } catch (error) {
    throw new Error(translateNetworkError(error))
  }

  if (!res.ok) {
    throw new Error('AUTH_EXPIRED')
  }

  return res.json()
}