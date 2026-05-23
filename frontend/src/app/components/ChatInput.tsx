'use client'
import { useState, useRef } from 'react'
import { Send, Paperclip, X } from 'lucide-react'
import styles from './ChatInput.module.css'
import type { Base64File, ChatInputProps } from '@/lib/types'

export default function ChatInput({ onSend, loading }: ChatInputProps) {
  const [text, setText] = useState('')
  const [file, setFile] = useState<Base64File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1]
      setFile({ name: f.name, data: base64 })
    }
    reader.readAsDataURL(f)
  }

  const handleSend = () => {
    if (!text.trim() || loading) return
    onSend(text, file || undefined)
    setText('')
    setFile(null)
  }

  return (
    <div className={styles.container}>
      {file && (
        <div className={styles.fileAttachment}>
          <Paperclip size={12} className={styles.fileIcon} />
          <span className={styles.fileName}>{file.name}</span>
          <button onClick={() => setFile(null)} className={styles.removeFileButton}>
            <X size={12} />
          </button>
        </div>
      )}

      <div className={styles.inputWrapper}>
        <div className={styles.inputBox}>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
            placeholder="메시지를 입력하세요..."
            rows={1}
            className={styles.textarea}
          />
          <input ref={fileRef} type="file" className={styles.fileInput} onChange={handleFile} accept=".txt,.pdf,.docx,.xlsx,.csv,.md" />
          <button onClick={() => fileRef.current?.click()} className={styles.fileButton}>
            <Paperclip size={16} />
          </button>
        </div>

        <button 
          onClick={handleSend} 
          disabled={!text.trim() || loading} 
          className={`${styles.sendButton} ${text.trim() && !loading ? styles.sendButtonActive : styles.sendButtonInactive}`}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  )
}