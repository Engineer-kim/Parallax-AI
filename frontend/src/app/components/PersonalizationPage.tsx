'use client'

import { useState } from 'react'
import { ArrowLeft, Settings, Bell, Palette, Shield, Zap } from 'lucide-react'
import Link from 'next/link'
import styles from '../personalization/page.module.css'

interface UserSettings {
  theme: 'dark' | 'light'
  notifications: boolean
  emailNotifications: boolean
  modelPreferences: string[]
  defaultLanguage: 'ko' | 'en'
  autoSave: boolean
}

interface PersonalizationPageProps {
  accountId: number | null
}

export default function PersonalizationClient({ accountId }: PersonalizationPageProps) {
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'dark',
    notifications: true,
    emailNotifications: false,
    modelPreferences: [],
    defaultLanguage: 'ko',
    autoSave: true,
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSettingChange = (key: keyof UserSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }))
  }

  const toggleModelPreference = (model: string) => {
    setSettings(prev => ({
      ...prev,
      modelPreferences: prev.modelPreferences.includes(model)
        ? prev.modelPreferences.filter(m => m !== model)
        : [...prev.modelPreferences, model],
    }))
  }

  const handleSave = async () => {
    try {
      const response = await fetch('/api/personalization/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        alert('설정이 저장되었습니다.')
      } else {
        alert('설정 저장에 실패했습니다.')
      }
    } catch (error) {
      console.error('설정 저장 오류:', error)
      alert('설정 저장 중 오류가 발생했습니다.')
    }
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
              <p className={styles.settingCardDescription}>
                선호하는 테마를 선택하세요.
              </p>
              <div className={styles.settingCardContent}>
                <div className={styles.preferencesGrid}>
                  <button
                    className={`${styles.preferenceButton} ${
                      settings.theme === 'dark' ? styles.active : ''
                    }`}
                    onClick={() => handleSettingChange('theme', 'dark')}
                  >
                    🌙 다크 모드
                  </button>
                  <button
                    className={`${styles.preferenceButton} ${
                      settings.theme === 'light' ? styles.active : ''
                    }`}
                    onClick={() => handleSettingChange('theme', 'light')}
                  >
                    ☀️ 라이트 모드
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.settingCard}>
              <h3 className={styles.settingCardTitle}>언어</h3>
              <p className={styles.settingCardDescription}>
                기본 언어를 설정합니다.
              </p>
              <div className={styles.settingCardContent}>
                <div className={styles.preferencesGrid}>
                  <button
                    className={`${styles.preferenceButton} ${
                      settings.defaultLanguage === 'ko' ? styles.active : ''
                    }`}
                    onClick={() =>
                      handleSettingChange('defaultLanguage', 'ko')
                    }
                  >
                    한국어
                  </button>
                  <button
                    className={`${styles.preferenceButton} ${
                      settings.defaultLanguage === 'en' ? styles.active : ''
                    }`}
                    onClick={() =>
                      handleSettingChange('defaultLanguage', 'en')
                    }
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
            <Shield size={18} />
            보안
          </h2>
          <p className={styles.sectionDescription}>
            계정 보안과 개인정보 설정입니다.
          </p>

          <div className={styles.settingGroup}>
            <div className={styles.settingCard}>
              <h3 className={styles.settingCardTitle}>비밀번호 변경</h3>
              <p className={styles.settingCardDescription}>
                계정 비밀번호를 변경합니다.
              </p>
              <button className={styles.actionButton}>비밀번호 변경</button>
            </div>

            <div className={styles.settingCard}>
              <h3 className={styles.settingCardTitle}>계정 삭제</h3>
              <p className={styles.settingCardDescription}>
                계정과 모든 데이터를 삭제합니다.
              </p>
              <button className={`${styles.actionButton} ${styles.dangerButton}`}>
                계정 삭제
              </button>
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
