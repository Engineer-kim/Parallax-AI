'use client'
import Sidebar from './components/Sidebar'
import ChatInput from './components/ChatInput'
import CylinderCarousel from './components/CylinderCarousel'
import LoginModal from './components/LoginModal'
import styles from './page.module.css'
import { MODEL_COLORS, MODEL_LABELS } from '@/lib/constants'
import { useAuth } from '@/lib/hooks/useAuth'
import { useChatManager } from '@/lib/hooks/useChatManager'
import { useTheme } from '@/lib/hooks/useTheme'

export default function Home() {
  const { isDark, toggleTheme } = useTheme()
  const { accountId, setAccountId, showLoginModal, setShowLoginModal, loading, handleLogout } = useAuth()
  const { chats, currentId, setCurrentId, currentChat, error, setError, expandedResults, setExpandedResults, messagesEndRef, lastAssistantIdx, newChat, handleSelect, handleSend } = useChatManager()

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
            )
            }

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

              {!isLoggedIn && (
                <div className={styles.loginHint}>
                  채팅을 시작하려면{' '}
                  <button
                    className={styles.loginHintButton}
                    onClick={() => setShowLoginModal(true)}
                  >
                    로그인
                  </button>
                  이 필요합니다
                </div>
              )}

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
                        <div className={styles.assistantAlertBubble}>⚠️ {msg.content}</div>
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
                          </div>
                        </div>
                        <div className={styles.carouselContainer}>
                          <CylinderCarousel
                            results={results}
                            onSelect={result => handleSelect(result, idx)}
                            selectedModel={msg.selectedResult?.model}
                          />
                        </div>
                        {!isLastAssistant && (
                          <button onClick={() => setExpandedResults(null)} className={styles.collapseButton}>
                            ▲ 접기
                          </button>
                        )}
                      </div>
                    )
                  }

                  if (results.length > 0 && !isExpanded) {
                    return (
                      <div key={idx} className={styles.assistantRow}>
                        <button onClick={() => setExpandedResults(idx)} className={styles.summaryButton}>
                          <span className={styles.summaryText}>
                            {msg.selectedResult
                              ? `선택됨: ${msg.selectedResult.model}`
                              : `${results.length}개 응답 보기`}
                          </span>
                        </button>
                      </div>
                    )
                  }

                  return null
                }

                return null
              })}

              {error && !loading && (
                <div className={styles.errorRow}>
                  <div className={styles.errorBubble}>⚠️ {error}</div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <ChatInput onSend={handleSendMessage} loading={loading} />

        {showLoginModal && (
          <LoginModal 
            onClose={() => setShowLoginModal(false)} 
            onLoginSuccess={handleLoginSuccess}
          />
        )}
      </main>
    </div>
  )
}