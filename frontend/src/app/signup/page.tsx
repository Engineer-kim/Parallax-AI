'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signup, login } from '@/lib/api'

export default function SignupPage() {
  const router = useRouter()
  const [loginId, setLoginId] = useState('')
  const [nickname, setNickname] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const isDark = typeof window !== 'undefined' && localStorage.getItem('theme') !== 'light'
  const inputBorder = isDark ? '1px solid #555555' : '1px solid #aaaaaa'

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await signup({ login_id: loginId, password, nickname })
      await login({ login_id: loginId, password })
      router.replace('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : '회원가입에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
      <section style={{ width: 'min(560px, 100%)', borderRadius: '24px', background: 'var(--bg-card)', border: '1px solid rgba(255, 255, 255, 0.08)', boxShadow: '0 28px 80px rgba(0, 0, 0, 0.16)', padding: '36px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: 'Syne', fontSize: '32px', fontWeight: 800, color: 'var(--text)' }}>
            회원가입
          </h1>
          <p style={{ margin: '16px 0 0', fontFamily: 'DM Mono', fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.8 }}>
            새 계정을 만들고 Parallax AI 서비스를 이용하세요.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
          <label style={{ display: 'grid', gap: '8px', fontFamily: 'DM Mono', fontSize: '12px', color: 'var(--text-muted)' }}>
            아이디
            <input
              type="text"
              value={loginId}
              onChange={e => setLoginId(e.target.value)}
              required
              style={{ width: '100%', padding: '14px 16px', borderRadius: '14px', border: inputBorder, background: 'var(--bg)', color: 'var(--text)' }}
            />
          </label>

          <label style={{ display: 'grid', gap: '8px', fontFamily: 'DM Mono', fontSize: '12px', color: 'var(--text-muted)' }}>
            닉네임
            <input
              type="text"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              required
              style={{ width: '100%', padding: '14px 16px', borderRadius: '14px', border: inputBorder, background: 'var(--bg)', color: 'var(--text)' }}
            />
          </label>

          <label style={{ display: 'grid', gap: '8px', fontFamily: 'DM Mono', fontSize: '12px', color: 'var(--text-muted)' }}>
            비밀번호
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '14px 16px', borderRadius: '14px', border: inputBorder, background: 'var(--bg)', color: 'var(--text)' }}
            />
          </label>

          {error && (
            <div style={{ color: '#ff6b6b', fontFamily: 'DM Mono', fontSize: '12px' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ padding: '14px 18px', borderRadius: '14px', border: 'none', background: '#10a37f', color: '#fff', fontFamily: 'DM Mono', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
          >
            {loading ? '회원가입 중...' : '회원가입'}
          </button>
        </form>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: '140px', padding: '12px 18px', borderRadius: '14px', background: '#10a37f', color: '#fff', textDecoration: 'none', fontFamily: 'DM Mono', fontSize: '12px', fontWeight: 700 }}>
            홈으로 돌아가기
          </Link>
          <Link href="/login" style={{ color: 'var(--text-muted)', fontFamily: 'DM Mono', fontSize: '12px', textDecoration: 'underline' }}>
            로그인으로 이동
          </Link>
        </div>
      </section>
    </main>
  )
}