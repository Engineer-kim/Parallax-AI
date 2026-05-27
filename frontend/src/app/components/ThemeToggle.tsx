'use client'

import { Sun, Moon } from 'lucide-react'
import styles from './css/ThemeToggle.module.css'
import { ThemeToggleProps } from '@/lib/types'

export default function ThemeToggle({ isDark, onThemeToggle }: ThemeToggleProps) {
  return (
    <div className={styles.toggleContainer}>
      <button
        onClick={onThemeToggle}
        className={`${styles.toggleSwitch} ${isDark ? styles.dark : ''}`}
        role="switch"
        aria-checked={isDark}
        aria-label="테마 변경 토글"
        type="button"
      >
        <div className={styles.iconWrapper}>
          <Sun size={13} className={styles.sunIcon} />
          <Moon size={13} className={styles.moonIcon} />
        </div>
        <div className={styles.toggleHandle} />
      </button>
    </div>
  )
}