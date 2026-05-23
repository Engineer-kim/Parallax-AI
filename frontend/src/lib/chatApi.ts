import type { StartChatPayload, StartChatResponse } from './types'

export async function startChat(payload: StartChatPayload): Promise<StartChatResponse> {
  const res = await fetch('http://127.0.0.1:8000/start/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    throw new Error(`Chat request failed: ${res.status} ${res.statusText}`)
  }

  return res.json()
}
