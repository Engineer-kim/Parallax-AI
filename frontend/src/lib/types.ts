export interface Result {
  model: string
  result: string | null
  error: string | null
  latency_ms: number
}

export interface BackendRequest {
  session_id: number | null
  input_order: number
  selected_model: string | null
  content_type: 'text' | 'file' | 'image' | 'video'
  content: string | null
  file_name: string | null
  file_url: string | null
  mime_type: string | null
  file_data: string | null
  has_text: boolean
  has_file: boolean
  account_id: number | null
}

export interface SignUpRequest {
  login_id: string
  password: string
  nickname: string
}

export interface LoginRequest {
  login_id: string
  password: string
}

export interface AuthResponse {
  message: string
}

export interface BackendModelResult {
  model: string
  result: string | null
  error: string | null
  latency_ms: number | null
}

export interface BackendResponse {
  status: 'success' | 'error' | 'blocked'
  request_id: string
  results: BackendModelResult[]
  message: string | null
  session_id: number | null
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
  sessionId?: number | null
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
  isLoggedIn: boolean
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
  onSend: (content: string, file?: Base64File) => Promise<boolean>
  loading: boolean
}

export interface UserSettings {
  theme: 'dark' | 'light'
  notifications: boolean
  emailNotifications: boolean
  modelPreferences: string[]
  defaultLanguage: 'ko' | 'en'
  autoSave: boolean
}

export interface PersonalizationPageProps {
  accountId: number | null
}