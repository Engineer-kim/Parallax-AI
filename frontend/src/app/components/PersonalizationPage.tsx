'use client'

import { useState, useEffect } from 'react'
import { fetchAvailableModels } from '@/lib/api'
import { ArrowLeft, Settings, Palette, Shield, Zap } from 'lucide-react'
import Link from 'next/link'
import styles from '../personalization/page.module.css'
import { PersonalizationPageProps, UserSettings } from '@/lib/types'
import { savePersonalizationSettings, saveApiKey, deleteApiKey } from '@/lib/api'
import { useTheme } from '@/lib/hooks/useTheme'

export default function PersonalizationClient({ accountId }: PersonalizationPageProps) {
  const { isDark, toggleTheme } = useTheme()

  const [responseLayout, setResponseLayout] = useState<'carousel' | 'bento'>(() => {
    if (typeof window === 'undefined') return 'carousel'

    const saved = localStorage.getItem('response-layout')

    return saved === 'bento' ? 'bento' : 'carousel'
  })

  const [settings, setSettings] = useState<UserSettings>({
    theme: isDark ? 'dark' : 'light',
  })

  const [apiKeys, setApiKeys] = useState({ gpt: '', gemini: '', claude: '' })
  const [apiKeySaving, setApiKeySaving] = useState(false)
  const [showKeys, setShowKeys] = useState({ gpt: false, gemini: false, claude: false })
  const [registeredModels, setRegisteredModels] = useState<string[]>([])

  useEffect(() => {
    fetchAvailableModels().then(setRegisteredModels)
  }, [])

  useEffect(() => {
    localStorage.setItem('response-layout', responseLayout)
  }, [responseLayout])

  const handleApiKeySave = async (model: 'gpt' | 'gemini' | 'claude') => {
    const key = apiKeys[model]
    if (!key.trim()) return
    setApiKeySaving(true)
    try {
      await saveApiKey(model, key)
      const updated = await fetchAvailableModels()
      setRegisteredModels(updated)
      alert(`${model.toUpperCase()} 키가 저장되었습니다.`)
    } catch {
      alert('저장 실패')
    } finally {
      setApiKeySaving(false)
    }
  }

  const handleApiKeyDelete = async (model: 'gpt' | 'gemini' | 'claude') => {
    try {
      await deleteApiKey(model)
      setApiKeys(prev => ({ ...prev, [model]: '' }))
      const updated = await fetchAvailableModels()
      setRegisteredModels(updated)
      alert(`${model.toUpperCase()} 키가 삭제되었습니다.`)
    } catch {
      alert('삭제 실패')
    }
  }

  const handleThemeChange = (theme: 'dark' | 'light') => {
    if (theme === 'dark' && !isDark) toggleTheme()
    if (theme === 'light' && isDark) toggleTheme()
    setSettings(prev => ({ ...prev, theme }))
  }

  return (
    <div className={styles.personalizationContainer}>
      <header className={styles.header}>
        <h1 className={styles.headerTitle}>
          <Settings size={24} />
          개인화 설정
        </h1>
        <Link href="/" className={styles.backButton}>
          <ArrowLeft size={16} />
          뒤로가기
        </Link>
      </header>

      <div className={styles.content}>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <Palette size={18} />
            디스플레이
          </h2>
          <p className={styles.sectionDescription}>
            앱의 테마와 디스플레이 설정을 관리합니다.
          </p>
          <div className={styles.settingGroup}>
            <div className={styles.settingCard}>
              <h3 className={styles.settingCardTitle}>테마</h3>
              <p className={styles.settingCardDescription}>선호하는 테마를 선택하세요.</p>
              <div className={styles.settingCardContent}>
                <div className={styles.preferencesGrid}>
                  <button
                    className={`${styles.preferenceButton} ${isDark ? styles.active : ''}`}
                    onClick={() => handleThemeChange('dark')}>
                    🌙 다크 모드
                  </button>
                  <button
                    className={`${styles.preferenceButton} ${!isDark ? styles.active : ''}`}
                    onClick={() => handleThemeChange('light')}>
                    ☀️ 라이트 모드
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.settingCard}>
              <h3 className={styles.settingCardTitle}>응답 레이아웃</h3>
              <p className={styles.settingCardDescription}>AI 응답 표시 방식을 설정합니다.</p>
              <div className={styles.settingCardContent}>
                <div className={styles.preferencesGrid}>
                 <button
                    className={`${styles.preferenceButton} ${responseLayout === 'carousel' ? styles.active : ''}`}
                    onClick={() => setResponseLayout('carousel')}>
                     <div className={styles.layoutPreviewCarousel}>
                        <div className={styles.layoutPreviewCenter} />
                        <div className={styles.layoutPreviewLeft} />
                        <div className={styles.layoutPreviewRight} />
                      </div>
                    캐러셀
                  </button>

                  <button
                    className={`${styles.preferenceButton} ${responseLayout === 'bento' ? styles.active : ''}`}
                    onClick={() => setResponseLayout('bento')}>
                     <div className={styles.layoutPreviewBento}>
                      <div className={styles.layoutPreviewBentoItem} />
                      <div className={styles.layoutPreviewBentoItem} />
                      <div className={styles.layoutPreviewBentoItem} />
                    </div>
                    벤토
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <Zap size={18} />
            API 키 관리
          </h2>
          <p className={styles.sectionDescription}>
            사용할 AI 모델의 API 키를 등록하세요. 등록된 모델만 응답을 비교할 수 있습니다.
          </p>
          <div className={styles.settingGroup}>
            {(['gpt', 'gemini', 'claude'] as const).map(model => (
              <div key={model} className={styles.settingCard}>
                <h3 className={styles.settingCardTitle}>
                  {model === 'gpt' ? 'GPT-4o (OpenAI)' : model === 'gemini' ? 'Gemini (Google)' : 'Claude (Anthropic)'}
                  {registeredModels.includes(model) ? (
                      <span style={{ fontSize: '11px', color: '#10a37f', marginLeft: '8px' }}>
                        ✓ 등록됨
                      </span>
                    ) : (
                      <span style={{ fontSize: '11px', color: '#ef4444', marginLeft: '8px' }}>
                        ✗ 등록 안됨
                      </span>
                  )}
                  </h3>
                <p className={styles.settingCardDescription}>
                  {model === 'gpt' ? 'platform.openai.com' : model === 'gemini' ? 'aistudio.google.com' : 'console.anthropic.com'}에서 발급받은 키를 입력하세요.
                </p>
                <div className={styles.settingCardContent}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type={showKeys[model] ? 'text' : 'password'}
                      placeholder={`${model.toUpperCase()} API Key`}
                      value={apiKeys[model]}
                      onChange={e => setApiKeys(prev => ({ ...prev, [model]: e.target.value }))}
                      style={{
                        flex: 1,
                        padding: '10px 12px',
                        background: 'transparent',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        color: 'var(--text-primary)',
                        fontFamily: 'DM Mono, monospace',
                        fontSize: '12px',
                        outline: 'none',
                      }}
                    />
                    <button
                      onClick={() => setShowKeys(prev => ({ ...prev, [model]: !prev[model] }))}
                      style={{ background: 'none', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer', color: 'var(--text-muted)', padding: '0 10px', fontSize: '12px' }}
                    >
                      {showKeys[model] ? '숨김' : '표시'}
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className={styles.actionButton}
                      disabled={!apiKeys[model].trim() || apiKeySaving}
                      onClick={() => handleApiKeySave(model)}
                      style={{ flex: 1, fontSize: '12px', padding: '8px' }}
                    >
                      저장
                    </button>
                    <button
                      className={`${styles.actionButton} ${styles.dangerButton}`}
                      onClick={() => handleApiKeyDelete(model)}
                      disabled={!registeredModels.includes(model)}
                      style={{ fontSize: '12px', padding: '8px 14px' }}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <Shield size={18} />
            보안
          </h2>
          <p className={styles.sectionDescription}>
            계정 보안과 개인정보 설정입니다.
          </p>
          <div className={styles.settingGroup}>
            <div className={styles.settingCard}>
              <h3 className={styles.settingCardTitle}>비밀번호 변경</h3>
              <p className={styles.settingCardDescription}>계정 비밀번호를 변경합니다.</p>
              <button className={styles.actionButton}>비밀번호 변경</button>
            </div>
            <div className={styles.settingCard}>
              <h3 className={styles.settingCardTitle}>계정 삭제</h3>
              <p className={styles.settingCardDescription}>계정과 모든 데이터를 삭제합니다.</p>
              <button className={`${styles.actionButton} ${styles.dangerButton}`}>계정 삭제</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}