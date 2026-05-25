'use client'

import { useRouter } from 'next/navigation'
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'
import styles from './page.module.css'

export default function ErrorPage() {
  const router = useRouter()

  return (
    <div className={styles.errorContainer}>
      <div className={styles.errorContent}>
        <div className={styles.errorIcon}>
          <AlertCircle size={40} />
        </div>
        <h1 className={styles.errorTitle}>로그인 필요</h1>
        <p className={styles.errorMessage}>
          이 페이지에 접근하려면 로그인이 필요합니다.
          <br />
          계정으로 로그인한 후 다시 시도해주세요.
        </p>
        <div className={styles.buttonGroup}>
          <Link href="/login" className={styles.loginButton}>
            로그인
          </Link>
          <button 
            onClick={() => router.push('/')}
            className={styles.homeButton}
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  )
}
