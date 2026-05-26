import { useState, useCallback, useRef, useEffect } from 'react'
import type { Chat, Message, Result, Base64File, BackendRequest } from '@/lib/types'
import { sendChatRequest } from '@/lib/api'

export function useChatManager() {
  const [chats, setChats] = useState<Chat[]>([])
  const [currentId, setCurrentId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [expandedResults, setExpandedResults] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const currentChat = chats.find(c => c.id === currentId)

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [currentChat?.messages.length, scrollToBottom])

  const newChat = () => {
    const id = crypto.randomUUID()
    const chat: Chat = {
      id,
      title: 'new chat',
      date: new Date().toLocaleDateString('ko-KR'),
      messages: [],
    }
    setChats(prev => [chat, ...prev])
    setCurrentId(id)
    setError(null)
    setExpandedResults(null)
  }

  const handleSelect = (result: Result, messageIndex: number) => {
    setChats(prev => prev.map(c => {
      if (c.id !== currentId) return c
      const messages = [...c.messages]
      if (messageIndex >= 0 && messageIndex < messages.length && messages[messageIndex].role === 'assistant') {
        messages[messageIndex] = { ...messages[messageIndex], selectedResult: result }
      }
      return { ...c, messages }
    }))
  }

  const handleSend = async (content: string, file?: Base64File, accountId?: number | null): Promise<boolean> => {
    if (!accountId) {
      setError('로그인이 필요합니다.')
      return false
    }

    setError(null)
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

    const currentMessages = chats.find(c => c.id === chatId)?.messages || []
    const userMsgCount = currentMessages.filter(m => m.role === 'user').length
    const inputOrder = userMsgCount + 1

    const lastSelectedResult = [...currentMessages]
      .reverse()
      .find(m => m.selectedResult)?.selectedResult

    let finalContent = content
    if (lastSelectedResult?.result) {
      finalContent =
        `이전 대화 맥락 (${lastSelectedResult.model} 응답):\n` +
        `${lastSelectedResult.result}\n\n사용자 질문: ${content}`
    }

    let contentType: 'text' | 'file' | 'image' | 'video' = 'text'
    if (file) {
      const ext = file.name.split('.').pop()?.toLowerCase() || ''
      if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) contentType = 'image'
      else if (['mp4', 'mov', 'avi', 'mkv'].includes(ext)) contentType = 'video'
      else contentType = 'file'
    }

    const userMsg: Message = { role: 'user', content }

    setChats(prev =>
      prev.map(c =>
        c.id === chatId
          ? {
              ...c,
              title: c.messages.length === 0 ? content.slice(0, 30) : c.title,
              messages: [...c.messages, userMsg],
            }
          : c
      )
    )

    setLoading(true)

    try {
      const body: BackendRequest = {
        session_id: null,
        input_order: inputOrder,
        selected_model: lastSelectedResult?.model || null,
        content_type: contentType,
        content: finalContent,
        file_name: file?.name || null,
        file_url: null,
        mime_type: null,
        file_data: file?.data || null,
        has_text: !!content.trim(),
        has_file: !!file,
        account_id: accountId,
      }

      const data = await sendChatRequest(body)

      if (data.status === 'blocked') {
        setError(data.message || '요청이 차단되었습니다.')
        const blockedMsg: Message = {
          role: 'assistant',
          content: data.message || '요청이 차단되었습니다.',
          results: [],
        }
        setChats(prev =>
          prev.map(c => c.id === chatId ? { ...c, messages: [...c.messages, blockedMsg] } : c)
        )
        return true
      }

      const assistantMsg: Message = {
        role: 'assistant',
        content: '',
        results: data.results.map(r => ({
          model: r.model,
          result: r.result,
          error: r.error,
          latency_ms: r.latency_ms ?? 0,
        })),
      }

      setChats(prev =>
        prev.map(c => c.id === chatId ? { ...c, messages: [...c.messages, assistantMsg] } : c)
      )
      setExpandedResults(null)
      return true
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다.'
      if (errMsg.includes('AUTH_EXPIRED')) {
        setError('세션이 만료되었습니다. 다시 로그인해주세요.')
        return false
      } else {
        setError(errMsg)
        return false
      }
    } finally {
      setLoading(false)
    }
  }

  const lastAssistantIdx = currentChat?.messages
    ? currentChat.messages.map(m => m.role).lastIndexOf('assistant')
    : -1

  const clearChats = useCallback(() => {
    setChats([])
    setCurrentId('')
    setError(null)
    setExpandedResults(null)
  }, [])

  return {
    chats,
    currentId,
    setCurrentId,
    currentChat,
    error,
    setError,
    expandedResults,
    setExpandedResults,
    loading,
    messagesEndRef,
    lastAssistantIdx,
    newChat,
    clearChats, 
    handleSelect,
    handleSend,
  }
}
