'use client'

import Link from 'next/link'
import styles from './css/LoginModal.module.css'

// 1. 컴파일 에러 해결을 위해 프로프 타입 정의에 onLoginSuccess 추가
type LoginModalProps = {
  onClose: () => void
  onLoginSuccess: (id: number) => void
}

export default function LoginModal({ onClose, onLoginSuccess }: LoginModalProps) {
  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div className={styles.content} onClick={e => e.stopPropagation()}>
        <button
          className={styles.closeButtonX}
          onClick={onClose}
          aria-label="닫기"
        >
          ✕
        </button>

        <div className={styles.header}>로그인이 필요합니다</div>
        <p className={styles.description}>
          채팅을 보내려면 로그인해야 합니다.
        </p>
        <p className={styles.subText}>
          계정이 없으신가요? 회원가입 후 바로 Parallax AI를 이용해 보세요.
        </p>

        <div className={styles.buttonGroup}>
          {/* 로그인/회원가입 페이지로 이동 — 돌아오면 메인(Home) 컴포넌트의 useEffect나 focus 이벤트가 쿠키를 재확인하여 onLoginSuccess를 호출해야 합니다 */}
          <Link href="/login" className={styles.primaryButton}>
            로그인
          </Link>
          <Link href="/signup" className={styles.secondaryButton}>
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