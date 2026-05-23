'use client'

import Link from 'next/link'
import styles from './LoginModal.module.css'

type LoginModalProps = {
  onClose: () => void
}

export default function LoginModal({ onClose }: LoginModalProps) {
  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" onClick={onClose}>
      <div className={styles.content} onClick={(event) => event.stopPropagation()}>
        <div className={styles.header}>로그인이 필요합니다</div>
        <p className={styles.description}>
          채팅을 보내려면 로그인해야 합니다. 로그인 후 다시 시도해 주세요.
        </p>
        <p className={styles.subText}>
          계정이 없으신가요? 회원가입 후 바로 Parallax AI를 이용해 보세요.
        </p>
        <div className={styles.buttonGroup}>
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
