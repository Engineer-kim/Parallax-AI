'use client'

import Link from 'next/link'
import styles from './css/LoginModal.module.css'
import { useEffect, useState } from 'react'

type LoginModalProps = {
  onClose: () => void
  onLoginSuccess: (id: number) => void
}

export default function LoginModal({ onClose, onLoginSuccess }: LoginModalProps) {
  const [isDark] = useState(() => {
    if (typeof window === 'undefined') return false

    return localStorage.getItem('theme') !== 'light'
  })

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" onClick={onClose}>
      <div className={styles.content} 
           onClick={e => e.stopPropagation()} 
           style={{ border: '3px solid var(--text)', background: isDark ? '#161616' : '#ffffff',}}>
        <div className={styles.header}>로그인이 필요합니다</div>
        <p className={styles.description}>
          채팅을 보내려면 로그인해야 합니다.
        </p>
        <p className={styles.subText}>
          계정이 없으신가요? 회원가입 후 바로 Parallax AI를 이용해 보세요.
        </p>
        <div className={styles.buttonGroup}>
          <Link href="/login" className={styles.primaryButton}>
            로그인
          </Link>
          <Link href="/signup" 
              className={styles.secondaryButton} 
              style={{ background: isDark ? '#ffffff' : '#000000', color: isDark ? '#000000' : '#ffffff',border: 'none', }}>
            회원가입
          </Link>
        </div>
        <button className={styles.closeButton} onClick={onClose}>
          닫기
        </button>
      </div>
    </div>
  )
}