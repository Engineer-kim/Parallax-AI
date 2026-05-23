'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import Sidebar from './components/Sidebar'
import ChatInput from './components/ChatInput'
import CylinderCarousel from './components/CylinderCarousel'
import styles from './page.module.css'
import type { Base64File, Chat, Message, Result, BackendRequest, BackendResponse } from '@/lib/types'

const API_BASE = 'http://127.0.0.1:8000'

/* ───────── JWT / 쿠키 유틸 ───────── */

function getAccessToken(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(/(?:^|;\s*)access_token=([^;]*)/)
  return match ? decodeURIComponent(match[1]) : null
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
    const json = atob(padded)
    return JSON.parse(json)
  } catch {
    return null
  }
}

function getAccountIdFromToken(token: string): number | null {
  const payload = decodeJwtPayload(token)
  if (!payload) return null
  const sub = payload.sub
  if (sub === undefined || sub === null) return null
  const id = Number(sub)
  return Number.isNaN(id) ? null : id
}

async function sendChatRequest(
  body: BackendRequest,
  token: string
): Promise<BackendResponse> {
  const res = await fetch(`${API_BASE}/start/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
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

const MODEL_COLORS: Record<string, string> = {
  gpt: '#10a37f',
  gemini: '#4285f4',
  claude: '#d4a574',
}

const MODEL_LABELS: Record<string, string> = {
  gpt: 'GPT-4o',
  gemini: 'Gemini',
  claude: 'Claude',
}


export default function Home() {
  const [isDark, setIsDark] = useState(true)
  const [chats, setChats] = useState<Chat[]>([])
  const [currentId, setCurrentId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedResults, setExpandedResults] = useState<number | null>(null)
  const [showLoginModal, setShowLoginModal] = useState(false)

  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [accountId, setAccountId] = useState<number | null>(null)
  const [authChecked, setAuthChecked] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const currentChat = chats.find(c => c.id === currentId)

  useEffect(() => {
    window.requestAnimationFrame(() => {
      const token = getAccessToken()
      if (token) {
        setAccessToken(token)
        const id = getAccountIdFromToken(token)
        setAccountId(id)
      }
      setAuthChecked(true)
    })
  }, [])

  useEffect(() => {
    const handleFocus = () => {
      const token = getAccessToken()
      if (token) {
        setAccessToken(token)
        const id = getAccountIdFromToken(token)
        setAccountId(id)
      } else {
        setAccessToken(null)
        setAccountId(null)
      }
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [currentChat?.messages.length, scrollToBottom])


  const newChat = () => {
    const id = crypto.randomUUID()
    const chat: Chat = {
      id,
      title: '새 채팅',
      date: new Date().toLocaleDateString('ko-KR'),
      messages: [],
    }
    setChats(prev => [chat, ...prev])
    setCurrentId(id)
    setError(null)
    setExpandedResults(null)
  }

  const toggleTheme = () => {
    setIsDark(prev => {
      document.documentElement.setAttribute('data-theme', prev ? 'light' : 'dark')
      return !prev
    })
  }

  const handleSelect = (result: Result, messageIndex: number) => {
    setChats(prev => prev.map(c => {
      if (c.id !== currentId) return c
      const messages = [...c.messages]
      if (messageIndex >= 0 && messageIndex < messages.length && messages[messageIndex].role === 'assistant') {
        messages[messageIndex] = {
          ...messages[messageIndex],
          selectedResult: result,
        }
      }
      return { ...c, messages }
    }))
  }



  const handleSend = async (content: string, file?: Base64File) => {
    if (!accessToken || accountId === null) {
      setError('로그인이 필요합니다. 먼저 로그인해주세요.')
      setShowLoginModal(true)
      return false
    }

    let chatId = currentId
    setError(null)

    if (!chatId) {
      const id = crypto.randomUUID()
      const chat: Chat = {
        id,
        title: content.slice(0, 30),
        date: new Date().toLocaleDateString('ko-KR'),
        messages: [],
      }
      setChats(prev => [chat, ...prev])
      setCurrentId(id)
      chatId = id
    }

    const currentMessages = chats.find(c => c.id === chatId)?.messages || []
    const userMsgCount = currentMessages.filter(m => m.role === 'user').length
    const inputOrder = userMsgCount + 1

    const lastSelectedResult = [...currentMessages]
      .reverse()
      .find(m => m.selectedResult)?.selectedResult

    let finalContent = content
    if (lastSelectedResult?.result) {
      finalContent = `이전 대화 맥락 (${lastSelectedResult.model} 응답):\n${lastSelectedResult.result}\n\n사용자 질문: ${content}`
    }

    const hasFile = !!file
    const hasText = !!content.trim()

    let contentType: 'text' | 'file' | 'image' | 'video' = 'text'
    if (file) {
      const ext = file.name.split('.').pop()?.toLowerCase() || ''
      if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
        contentType = 'image'
      } else if (['mp4', 'mov', 'avi', 'mkv'].includes(ext)) {
        contentType = 'video'
      } else {
        contentType = 'file'
      }
    }

    const userMsg: Message = {
      role: 'user',
      content,
    }

    setChats(prev => prev.map(c => c.id === chatId ? {
      ...c,
      title: c.messages.length === 0 ? content.slice(0, 30) : c.title,
      messages: [...c.messages, userMsg]
    } : c))

    setLoading(true)

    try {
      const body: BackendRequest = {
        session_id: null,
        input_order: inputOrder,
        selected_model: lastSelectedResult?.model || null,
        content_type: contentType,
        content: finalContent,
        file_name: file?.name || null,
        file_url: null,
        mime_type: null,
        file_data: file?.data || null,
        has_text: hasText,
        has_file: hasFile,
        account_id: accountId,
      }

      const data = await sendChatRequest(body, accessToken)

      if (data.status === 'blocked') {
        setError(data.message || '요청이 차단되었습니다.')
        const blockedMsg: Message = {
          role: 'assistant',
          content: data.message || '요청이 차단되었습니다.',
          results: [],
        }
        setChats(prev => prev.map(c => c.id === chatId ? {
          ...c,
          messages: [...c.messages, blockedMsg]
        } : c))
        return true
      }

      const assistantMsg: Message = {
        role: 'assistant',
        content: '',
        results: data.results.map(r => ({
          model: r.model,
          result: r.result,
          error: r.error,
          latency_ms: r.latency_ms ?? 0,
        })),
      }

      setChats(prev => prev.map(c => c.id === chatId ? {
        ...c,
        messages: [...c.messages, assistantMsg]
      } : c))

      const updatedChat = chats.find(c => c.id === chatId)
      const newIdx = (updatedChat?.messages.length ?? 0) + 1
      setExpandedResults(newIdx)
      return true

    } catch (e) {
      if (e instanceof Error && e.message === 'AUTH_EXPIRED') {
        setAccessToken(null)
        setAccountId(null)
        setError('인증이 만료되었습니다. 다시 로그인해주세요.')
        setShowLoginModal(true)
      } else {
        const errMsg = e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다.'
        setError(errMsg)
      }
      console.error('Chat error:', e)
      return false
    } finally {
      setLoading(false)
    }
  }

  const lastAssistantIdx = currentChat?.messages
    ? currentChat.messages.map(m => m.role).lastIndexOf('assistant')
    : -1

  if (!authChecked) return null

  const isLoggedIn = !!accessToken && accountId !== null

  return (
    <div className={styles.wrapper}>
      <Sidebar
        chats={chats}
        currentId={currentId}
        onNew={newChat}
        onSelect={(id) => { setCurrentId(id); setError(null); setExpandedResults(null) }}
        onThemeToggle={toggleTheme}
        isDark={isDark}
        isLoggedIn={isLoggedIn}
      />

      <main className={styles.main}>
        <div className={styles.header}>
          <div className={styles.branding}>GPT-4o · GEMINI · CLAUDE</div>
          <div className={styles.headerRight}>
            <div className={`${styles.statusBlock} ${isLoggedIn ? styles.loggedIn : styles.loggedOut}`}>
              <span className={`${styles.statusDot} ${isLoggedIn ? '' : styles.loggedOut}`} />
              {isLoggedIn ? `인증됨 (ID: ${accountId})` : '로그인 필요'}
            </div>

            {loading && (
              <div className={styles.loadingStatus}>
                <span className={styles.loadingPulse} />
                응답 생성중...
              </div>
            )}
          </div>
        </div>

        <div className={styles.chatArea}>
          {!currentChat || currentChat.messages.length === 0 ? (
            <div className={styles.welcomeCard}>
              <div className={styles.heroTitle}>PARALLAX</div>
              <div className={styles.welcomeText}>
                한 번의 질문으로 GPT, Gemini, Claude의 답변을 동시에 비교하세요
              </div>
              <div className={styles.buttonGroup}>
                {(['gpt', 'gemini', 'claude'] as const).map(model => (
                  <div
                    key={model}
                    className={styles.tag}
                    style={{
                      border: `1px solid ${MODEL_COLORS[model]}44`,
                      color: MODEL_COLORS[model],
                      background: `${MODEL_COLORS[model]}0a`,
                    }}
                  >
                    {MODEL_LABELS[model]}
                  </div>
                ))}
              </div>
            </div>

          ) : (
            <div className={styles.chatList}>
              {currentChat.messages.map((msg, idx) => {
                if (msg.role === 'user') {
                  return (
                    <div key={idx} className={styles.userRow}>
                      <div className={styles.userBubble}>{msg.content}</div>
                    </div>
                  )
                }

                if (msg.role === 'assistant') {
                  const results = msg.results || []
                  if (results.length === 0 && msg.content) {
                    return (
                      <div key={idx} className={styles.assistantRow}>
                        <div className={styles.assistantAlertBubble}>
                          ⚠️ {msg.content}
                        </div>
                      </div>
                    )
                  }

                  const isLastAssistant = idx === lastAssistantIdx
                  const isExpanded = expandedResults === idx || isLastAssistant

                  if (results.length > 0 && isExpanded) {
                    return (
                      <div key={idx} className={styles.chatList}>
                        <div className={styles.assistantMeta}>
                          <div className={styles.metaInfo}>
                            <span className={styles.metaDot} />
                            {results.length}개 모델 응답
                            {msg.selectedResult && (
                              <span
                                className={styles.metaBadge}
                                style={{
                                  color: MODEL_COLORS[msg.selectedResult.model] || 'var(--text)',
                                  border: `1px solid ${MODEL_COLORS[msg.selectedResult.model] || 'var(--border)'}44`,
                                }}
                              >
                                {MODEL_LABELS[msg.selectedResult.model] || msg.selectedResult.model} 선택됨
                              </span>
                            )}
                          </div>
                        </div>

                        <div className={styles.carouselContainer}>
                          <CylinderCarousel
                            results={results}
                            onSelect={(result) => handleSelect(result, idx)}
                            selectedModel={msg.selectedResult?.model}
                          />
                        </div>

                        {!isLastAssistant && (
                          <button
                            onClick={() => setExpandedResults(null)}
                            className={styles.collapseButton}
                          >
                            ▲ 접기
                          </button>
                        )}
                      </div>
                    )
                  }

                  if (results.length > 0 && !isExpanded) {
                    return (
                      <div key={idx} className={styles.assistantRow}>
                        <button
                          onClick={() => setExpandedResults(idx)}
                          className={styles.summaryButton}
                        >
                          <div className={styles.summaryDots}>
                            {results.map(r => (
                              <div
                                key={r.model}
                                className={styles.summaryDot}
                                style={{
                                  background: r.error ? '#ff6b6b' : (MODEL_COLORS[r.model] || '#888'),
                                  borderColor: msg.selectedResult?.model === r.model
                                    ? MODEL_COLORS[r.model] : 'transparent',
                                }}
                              />
                            ))}
                          </div>
                          <span className={styles.summaryText}>
                            {msg.selectedResult
                              ? `${MODEL_LABELS[msg.selectedResult.model] || msg.selectedResult.model} 응답 선택됨`
                              : `${results.length}개 모델 응답 보기`}
                          </span>
                          <span className={styles.summaryArrow}>▼</span>
                        </button>
                      </div>
                    )
                  }

                  return null
                }

                return null
              })}



              {loading && (
                <div className={styles.loadingRow}>
                  <div className={styles.loadingCard}>
                    <div className={styles.loadingDots}>
                      {[0, 1, 2].map(i => (
                        <span
                          key={i}
                          className={styles.loadingDot}
                          style={{
                            background: [MODEL_COLORS.gpt, MODEL_COLORS.gemini, MODEL_COLORS.claude][i],
                            animationDelay: `${i * 0.16}s`,
                          }}
                        />
                      ))}
                    </div>
                    <span className={styles.summaryText}>3개 모델이 응답 생성 중...</span>
                  </div>
                </div>
              )}

              {error && !loading && (
                <div className={styles.errorRow}>
                  <div className={styles.errorBubble}>⚠️ {error}</div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <ChatInput onSend={handleSend} loading={loading} />

        {showLoginModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>로그인이 필요합니다</div>
              <div className={styles.modalText}>
                채팅을 보내려면 로그인해야 합니다. 로그인 후 페이지를 새로고침하거나
                다시 시도해주세요.
              </div>
              <div className={styles.modalActions}>
                <button
                  className={styles.modalButton}
                  onClick={() => setShowLoginModal(false)}
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}