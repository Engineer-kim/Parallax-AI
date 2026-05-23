'use client'
import { useState } from 'react'
import { Plus, Search, MessageSquare, Sun, Moon } from 'lucide-react'
import styles from './Sidebar.module.css'
import type { SidebarProps } from '@/lib/types'

export default function Sidebar({ chats, currentId, onNew, onSelect, onThemeToggle, isDark, isLoggedIn }: SidebarProps) {
  const [search, setSearch] = useState('')

  const filtered = chats.filter(c => c.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <aside className={styles.sidebar}>
      {/* 로고 */}
      <div className={styles.logoSection}>
        <div className={styles.logo}>PARALLAX</div>
        <div className={styles.tagline}>AI COMPARISON ENGINE</div>
      </div>
      
      <div className={styles.newChatButtonContainer}>
        <button
          onClick={isLoggedIn ? onNew : undefined}
          disabled={!isLoggedIn}
          className={`${styles.newChatButton} ${!isLoggedIn ? styles.newChatButtonDisabled : ''}`}
        >
          <Plus size={15} /> 새 채팅
        </button>
      </div>

      <div className={styles.searchContainer}>
        <div className={styles.searchWrapper}>
          <Search size={13} className={styles.searchIcon} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="채팅 검색..."
            className={styles.searchInput}
          />
        </div>
      </div>

      <div className={styles.chatList}>
        <div className={styles.chatListLabel}>최근 항목</div>
        {filtered.map(chat => (
          <button 
            key={chat.id} 
            onClick={() => onSelect(chat.id)} 
            className={`${styles.chatItem} ${currentId === chat.id ? styles.chatItemActive : ''}`}
          >
            <MessageSquare size={13} color="var(--text-muted)" />
            <div>
              <div className={styles.chatItemTitle}>{chat.title}</div>
              <div className={styles.chatItemDate}>{chat.date}</div>
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <div style={{ padding: '20px 8px', color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'DM Mono', textAlign: 'center' }}>
            채팅 없음
          </div>
        )}
      </div>

      <div className={styles.footerContainer}>
        <button onClick={onThemeToggle} className={styles.themeButton}>
          {isDark ? <Sun size={13} /> : <Moon size={13} />}
          {isDark ? '라이트 모드' : '다크 모드'}
        </button>
      </div>
    </aside>
  )
}