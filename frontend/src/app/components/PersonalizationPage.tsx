'use client'

import { useState } from 'react'
import { ArrowLeft, Settings, Palette, Shield, Zap } from 'lucide-react'
import Link from 'next/link'
import styles from '../personalization/page.module.css'
import { PersonalizationPageProps, UserSettings } from '@/lib/types'
import { savePersonalizationSettings, saveApiKey, deleteApiKey } from '@/lib/api'
import { useTheme } from '@/lib/hooks/useTheme'

export default function PersonalizationClient({ accountId }: PersonalizationPageProps) {
   const { isDark, toggleTheme } = useTheme()

  const [settings, setSettings] = useState<UserSettings>({
    theme: isDark ? 'dark' : 'light',
    notifications: true,
    emailNotifications: false,
    modelPreferences: [],
    defaultLanguage: 'ko',
    autoSave: true,
  })

  const [apiKeys, setApiKeys] = useState({ gpt: '', gemini: '', claude: '' })
  const [apiKeySaving, setApiKeySaving] = useState(false)
  const [showKeys, setShowKeys] = useState({ gpt: false, gemini: false, claude: false })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSettingChange = (key: keyof UserSettings, value: any) => {

    if (key === 'theme') {
      toggleTheme()
    }

    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    try {
      await savePersonalizationSettings(settings)
      alert('설정이 저장되었습니다.')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '설정 저장 중 오류가 발생했습니다.'
      console.error('설정 저장 오류:', error)
      alert(errorMessage)
    }
  }

  const handleApiKeySave = async (model: 'gpt' | 'gemini' | 'claude') => {
    const key = apiKeys[model]
    if (!key.trim()) return
    setApiKeySaving(true)
    try {
      await saveApiKey(model, key)
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
              <h3 className={styles.settingCardTitle}>언어</h3>
              <p className={styles.settingCardDescription}>기본 언어를 설정합니다.</p>
              <div className={styles.settingCardContent}>
                <div className={styles.preferencesGrid}>
                  <button
                    className={`${styles.preferenceButton} ${settings.defaultLanguage === 'ko' ? styles.active : ''}`}
                    onClick={() => handleSettingChange('defaultLanguage', 'ko')}
                  >
                    한국어
                  </button>
                  <button
                    className={`${styles.preferenceButton} ${settings.defaultLanguage === 'en' ? styles.active : ''}`}
                    onClick={() => handleSettingChange('defaultLanguage', 'en')}
                  >
                    English
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

        <button className={styles.saveButton} onClick={handleSave}>
          설정 저장
        </button>
      </div>
    </div>
  )
}