'use client'
import styles from './css/ModelCard.module.css'
import type { ModelCardProps } from '@/lib/types'

const MODEL_COLORS: Record<string, string> = {
  gpt: '#10a37f',
  gemini: '#4285f4',
  claude: '#d4a574',
}

const MODEL_LABELS: Record<string, string> = {
  gpt: 'GPT-4o',
  gemini: 'Gemini',
  claude: 'Claude',
}

export default function ModelCard({ model, result, error, latency, isCenter, isSelected, onSelect }: ModelCardProps) {
  const color = MODEL_COLORS[model] || '#ffffff'
  const label = MODEL_LABELS[model] || model

  const borderColor = isSelected ? color : isCenter ? color + '88' : 'var(--border)'
  const boxShadow = isSelected ? `0 0 60px ${color}44` : isCenter ? `0 0 40px ${color}22` : 'none'
  const opacity = isCenter ? 1 : 0.5
  const scale = isCenter ? 1 : 0.88

  return (
    <div 
      className={styles.card}
      style={{
        border: `1px solid ${borderColor}`,
        boxShadow: boxShadow,
        transform: `scale(${scale})`,
        opacity: opacity,
      }}
    >
      <div className={styles.headerContainer}>
        <div className={styles.labelContainer}>
          <div 
            className={styles.colorIndicator}
            style={{ background: color }}
          />
          <span className={styles.label}>{label}</span>
          {isSelected && (
            <span 
              className={styles.selectedBadge}
              style={{ color: color, border: `1px solid ${color}` }}
            >
              선택됨
            </span>
          )}
        </div>
        <span className={styles.latency}>
          {latency ? `${latency.toFixed(0)}ms` : '—'}
        </span>
      </div>

      <div className={styles.divider} />

      <div className={styles.content} style={{ color: error ? '#ff6b6b' : 'var(--text)' }}>
        {/* <div className={styles.contentText}>
          {error ? `오류: ${error}` : result || (
            <div className={styles.placeholder}>응답 대기중...</div>
          )}
        </div> */}
        <div className={styles.contentText}>
            {error ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ color: '#ff6b6b' }}>⚠️ {error}</span>
                {error.includes('키가 올바르지') && (
                  <a href="/personalization" style={{ fontSize: '11px', color: '#ff6b6b', textDecoration: 'underline' }}>
                    → 설정에서 API 키 확인
                  </a>
                )}
              </div>
              ) : result || (
                <div className={styles.placeholder}>응답 대기중...</div>
              )}
          </div>
      </div>

      {isCenter && result && (
        <button
          onClick={onSelect}
          className={`${styles.selectButton} ${isSelected ? styles.selectButtonActive : styles.selectButtonInactive}`}
          style={{
            background: isSelected ? color : 'transparent',
            border: `1px solid ${color}`,
            color: isSelected ? 'var(--bg)' : color,
          }}
        >
          {isSelected ? '✓ 선택됨 — 이 응답으로 대화 중' : '이 응답 선택'}
        </button>
      )}
    </div>
  )
}