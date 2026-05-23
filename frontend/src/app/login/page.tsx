'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { login } from '@/lib/api'

export default function LoginPage() {
  const router = useRouter()
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await login({ login_id: loginId, password })
      router.replace('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
      <section style={{ width: 'min(560px, 100%)', borderRadius: '24px', background: 'var(--bg-card)', border: '1px solid rgba(255, 255, 255, 0.08)', boxShadow: '0 28px 80px rgba(0, 0, 0, 0.16)', padding: '36px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: 'Syne', fontSize: '32px', fontWeight: 800, color: 'var(--text)' }}>
            로그인
          </h1>
          <p style={{ margin: '16px 0 0', fontFamily: 'DM Mono', fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.8 }}>
            기존 계정으로 로그인하면 Parallax AI 채팅을 바로 이용할 수 있습니다.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
          <label style={{ display: 'grid', gap: '8px', fontFamily: 'DM Mono', fontSize: '12px', color: 'var(--text-muted)' }}>
            로그인 아이디
            <input
              type="text"
              value={loginId}
              onChange={e => setLoginId(e.target.value)}
              required
              style={{ width: '100%', padding: '14px 16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.14)', background: 'var(--bg)', color: 'var(--text)' }}
            />
          </label>

          <label style={{ display: 'grid', gap: '8px', fontFamily: 'DM Mono', fontSize: '12px', color: 'var(--text-muted)' }}>
            비밀번호
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '14px 16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.14)', background: 'var(--bg)', color: 'var(--text)' }}
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
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: '140px', padding: '12px 18px', borderRadius: '14px', background: '#10a37f', color: '#fff', textDecoration: 'none', fontFamily: 'DM Mono', fontSize: '12px', fontWeight: 700 }}>
            홈으로 돌아가기
          </Link>
          <Link href="/signup" style={{ color: 'var(--text-muted)', fontFamily: 'DM Mono', fontSize: '12px', textDecoration: 'underline' }}>
            회원가입으로 이동
          </Link>
        </div>
      </section>
    </main>
  )
}
