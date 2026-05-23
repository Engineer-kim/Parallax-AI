export interface Result {
  model: string
  result: string | null
  error: string | null
  latency_ms: number
}

export interface Message {
  role: 'user' | 'assistant'
  content: string
  results?: Result[]
  selectedResult?: Result
}

export interface Chat {
  id: string
  title: string
  date: string
  messages: Message[]
}

export interface StartChatPayload {
  input_type: 'text' | 'file'
  content: string
  session_id?: number
  file_name?: string
  file_data?: string
}

export interface StartChatResponse {
  session_id?: number
  results: Result[]
}

export interface Base64File {
  name: string
  data: string
}

export interface SidebarProps {
  chats: Chat[]
  currentId: string
  onNew: () => void
  onSelect: (id: string) => void
  onThemeToggle: () => void
  isDark: boolean
}

export interface ModelCardProps {
  model: string
  result: string | null
  error: string | null
  latency: number
  isCenter: boolean
  isSelected: boolean
  onSelect: () => void
}

export interface CylinderCarouselProps {
  results: Result[]
  onSelect: (result: Result) => void
  selectedModel?: string
}

export interface ChatInputProps {
  onSend: (content: string, file?: Base64File) => void
  loading: boolean
}
