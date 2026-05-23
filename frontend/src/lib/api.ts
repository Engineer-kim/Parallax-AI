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

export async function sendChatRequest(
  body: BackendRequest,
  token?: string | null
): Promise<BackendResponse> {
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
    const detail = errBody?.detail || errBody?.message || `${res.status} ${res.statusText}`
    throw new Error(detail)
  }

  return res.json()
}

export async function signup(request: SignUpRequest): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/signup`, {
    method: 'POST',
    headers: buildJsonHeaders(),
    credentials: 'include',
    body: JSON.stringify(request),
  })

  if (!res.ok) {
    const errBody = await res.json().catch(() => null)
    const detail = errBody?.detail || errBody?.message || `${res.status} ${res.statusText}`
    throw new Error(detail)
  }

  return res.json()
}

export async function login(request: LoginRequest): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: buildJsonHeaders(),
    credentials: 'include',
    body: JSON.stringify(request),
  })

  if (!res.ok) {
    const errBody = await res.json().catch(() => null)
    const detail = errBody?.detail || errBody?.message || `${res.status} ${res.statusText}`
    throw new Error(detail)
  }

  return res.json()
}

export async function logout(): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/logout`, {
    method: 'POST',
    headers: buildJsonHeaders(),
    credentials: 'include',
  })

  if (!res.ok) {
    const errBody = await res.json().catch(() => null)
    const detail = errBody?.detail || errBody?.message || `${res.status} ${res.statusText}`
    throw new Error(detail)
  }

  return res.json()
}

export async function refreshAccessToken(): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/refresh`, {
    method: 'POST',
    headers: buildJsonHeaders(),
    credentials: 'include',
  })

  if (!res.ok) {
    const errBody = await res.json().catch(() => null)
    const detail = errBody?.detail || errBody?.message || `${res.status} ${res.statusText}`
    throw new Error(detail)
  }

  return res.json()
}
