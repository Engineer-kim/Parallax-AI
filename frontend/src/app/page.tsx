'use client'
import { useState } from 'react'
import Sidebar from './components/Sidebar'
import ChatInput from './components/ChatInput'
import CylinderCarousel from './components/CylinderCarousel'

interface Result {
  model: string
  result: string | null
  error: string | null
  latency_ms: number
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  results?: Result[]
  selectedResult?: Result
}

interface Chat {
  id: string
  title: string
  date: string
  messages: Message[]
}

export default function Home() {
  const [isDark, setIsDark] = useState(true)
  const [chats, setChats] = useState<Chat[]>([])
  const [currentId, setCurrentId] = useState('')
  const [loading, setLoading] = useState(false)

  const currentChat = chats.find(c => c.id === currentId)

  const newChat = () => {
    const id = crypto.randomUUID()
    const chat: Chat = {
      id,
      title: '새 채팅',
      date: new Date().toLocaleDateString('ko-KR'),
      messages: [],
    }
    setChats(prev => [chat, ...prev])
    setCurrentId(id)
  }

  const toggleTheme = () => {
    setIsDark(prev => {
      document.documentElement.setAttribute('data-theme', prev ? 'light' : 'dark')
      return !prev
    })
  }

  const handleSelect = (result: Result) => {
    setChats(prev => prev.map(c => {
      if (c.id !== currentId) return c
      const messages = [...c.messages]
      const lastAssistantIdx = messages.map(m => m.role).lastIndexOf('assistant')
      if (lastAssistantIdx !== -1) {
        messages[lastAssistantIdx] = {
          ...messages[lastAssistantIdx],
          selectedResult: result,
        }
      }
      return { ...c, messages }
    }))
  }

  const handleSend = async (content: string, file?: { name: string; data: string }) => {
    let chatId = currentId

    if (!chatId) {
      const id = crypto.randomUUID()
      const chat: Chat = {
        id,
        title: content.slice(0, 30),
        date: new Date().toLocaleDateString('ko-KR'),
        messages: [],
      }
      setChats(prev => [chat, ...prev])
      setCurrentId(id)
      chatId = id
    }

    const userMsg: Message = { role: 'user', content }
    setChats(prev => prev.map(c => c.id === chatId ? {
      ...c,
      title: c.messages.length === 0 ? content.slice(0, 30) : c.title,
      messages: [...c.messages, userMsg]
    } : c))

    setLoading(true)

    try {
      const currentMessages = chats.find(c => c.id === chatId)?.messages || []
      const lastSelected = [...currentMessages].reverse().find(m => m.selectedResult)?.selectedResult

      let finalContent = content
      if (lastSelected?.result) {
        finalContent = `이전 대화 맥락 (${lastSelected.model} 응답):\n${lastSelected.result}\n\n사용자 질문: ${content}`
      }

      const body: Record<string, unknown> = {
        input_type: file ? 'file' : 'text',
        content: finalContent,
        ...(file && { file_name: file.name, file_data: file.data }),
      }

      const res = await fetch('http://127.0.0.1:8000/start/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      const assistantMsg: Message = {
        role: 'assistant',
        content: '',
        results: data.results,
      }

      setChats(prev => prev.map(c => c.id === chatId ? {
        ...c,
        messages: [...c.messages, assistantMsg]
      } : c))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const lastAssistantMsg = currentChat?.messages.filter(m => m.role === 'assistant').slice(-1)[0]
  const lastResults = lastAssistantMsg?.results
  const selectedResult = lastAssistantMsg?.selectedResult

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar
        chats={chats}
        currentId={currentId}
        onNew={newChat}
        onSelect={setCurrentId}
        onThemeToggle={toggleTheme}
        isDark={isDark}
      />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '20px 40px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '14px', letterSpacing: '2px', color: 'var(--text-muted)' }}>
            GPT-4o · GEMINI · CLAUDE
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {selectedResult && (
              <div style={{ fontFamily: 'DM Mono', fontSize: '11px', color: 'var(--text-muted)', padding: '4px 10px', border: '1px solid var(--border)', borderRadius: '4px' }}>
                {selectedResult.model.toUpperCase()} 응답 기반으로 대화 중
              </div>
            )}
            {loading && (
              <div style={{ fontFamily: 'DM Mono', fontSize: '12px', color: 'var(--text-muted)' }}>
                응답 생성중...
              </div>
            )}
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 60px' }}>
          {!currentChat || currentChat.messages.length === 0 ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '48px', letterSpacing: '-2px', marginBottom: '12px' }}>
                PARALLAX
              </div>
              <div style={{ fontFamily: 'DM Mono', fontSize: '13px', color: 'var(--text-muted)' }}>
                한 화면에서 여러 모델의 답변을 비교하고 선택하세요
              </div>
            </div>
          ) : lastResults ? (
            <CylinderCarousel
              results={lastResults}
              onSelect={handleSelect}
              selectedModel={selectedResult?.model}
            />
          ) : null}
        </div>

        <ChatInput onSend={handleSend} loading={loading} />
      </main>
    </div>
  )
}