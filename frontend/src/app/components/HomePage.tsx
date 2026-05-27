'use client'

import Sidebar from './Sidebar'
import ChatInput from './ChatInput'
import CylinderCarousel from './CylinderCarousel'
import LoginModal from './LoginModal'
import styles from '../page.module.css'
import { useAuth } from '@/lib/hooks/useAuth'
import { useChatManager } from '@/lib/hooks/useChatManager'
import { useTheme } from '@/lib/hooks/useTheme'
import { blockHistoryNavigation } from '@/lib/util/historyDelete'
import { useEffect, useState } from 'react'
import BentoCompare from './BentoCompare'

export default function HomeClient({ initialAccountId }: { initialAccountId: number | null }) {

  const [responseLayout] = useState<'carousel' | 'bento'>(() => {
    if (typeof window === 'undefined') return 'carousel'

    const saved = localStorage.getItem('response-layout')

    return saved === 'bento' ? 'bento' : 'carousel'
  })

  useEffect(() => {
    const cleanup = blockHistoryNavigation()

    return cleanup
  }, [])

  const { isDark, toggleTheme } = useTheme()

  const {
    chats,
    currentId,
    setCurrentId,
    currentChat,
    error,
    setError,
    setExpandedResults,
    clearChats,
    updateSessionRef,
    messagesEndRef,
    newChat,
    handleSelect,
    handleSend,
    loadChatHistory,
    loadChatDetailHistory,
  } = useChatManager()

  useEffect(() => {
    if (initialAccountId) {
      loadChatHistory()
    }
  }, [initialAccountId, loadChatHistory])



  const { accountId, setAccountId, showLoginModal, setShowLoginModal, loading, handleLogout } =
    useAuth(initialAccountId, () => {
      clearChats()
    })

  const isLoggedIn = accountId !== null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSendMessage = async (content: string, file?: any) => {
    if (!isLoggedIn) {
      setError('로그인이 필요합니다.')
      setShowLoginModal(true)
      return false
    }
    return handleSend(content, file, accountId)
  }

  const handleLoginSuccess = (id: number) => {
    setAccountId(id)
    setShowLoginModal(false)
    loadChatHistory()
  }

  const handleLogoutClick = async () => {
    await handleLogout()
    setError(null)
  }

  return (
    <div className={styles.wrapper}>
      <Sidebar
        chats={chats}
        currentId={currentId}
        onNew={newChat}
        onSelect={id => {
          setCurrentId(id)
          setError(null)
          setExpandedResults(null)
          const selectedChat = chats.find(c => c.id === id)
          updateSessionRef(selectedChat?.sessionId || null)
          loadChatDetailHistory(Number(id))
        }}
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

            {isLoggedIn ? (
              <button
                type="button"
                className={styles.headerButton}
                onClick={handleLogoutClick}
                disabled={loading}
              >
                로그아웃
              </button>
            ) : (
              <button
                type="button"
                className={styles.headerButton}
                onClick={() => setShowLoginModal(true)}
                disabled={loading}
              >
                로그인
              </button>
            )}

            {loading && (
              <div className={styles.loadingStatus}>
                <span className={styles.loadingPulse} />
                응답 생성중...
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className={styles.errorNotification}>
            <div className={styles.errorContent}>
              <span className={styles.errorIcon}>⚠️</span>
              <span className={styles.errorMessage}>{error}</span>
              <button
                onClick={() => setError(null)}
                className={styles.errorCloseButton}
                aria-label="Close error notification"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <div className={styles.chatArea}>
          {!currentChat || currentChat.messages.length === 0 ? (
            <div className={styles.welcomeCard}>
              <div className={styles.heroTitle}>PARALLAX</div>
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

                  if (results.length > 0) {
                    return (
                      <div key={idx} className={styles.chatList}>
                        {/* <CylinderCarousel
                          results={results}
                          onSelect={result => handleSelect(result, idx)}
                          selectedModel={msg.selectedResult?.model}
                        /> */}
                        {responseLayout === 'carousel' ? (
                          <CylinderCarousel
                            results={results}
                            onSelect={result => handleSelect(result, idx)}
                            selectedModel={msg.selectedResult?.model}
                          />
                        ) : (
                          <BentoCompare
                            results={results}
                            onSelect={result => handleSelect(result, idx)}
                            selectedModel={msg.selectedResult?.model}
                          />
                        )}
                      </div>
                    )
                  }
                }

                return null
              })}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <ChatInput onSend={handleSendMessage} loading={loading} />

        {showLoginModal && (
          <LoginModal onClose={() => setShowLoginModal(false)} onLoginSuccess={handleLoginSuccess} />
        )}
      </main>
    </div>
  )
}