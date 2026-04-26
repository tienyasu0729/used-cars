import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import {
  checkAIChatHealth,
  createAIChatSession,
  sendAIChatMessage,
  getAIChatMessages,
  type AIChatSendMessageResponse,
} from '@/services/aiChat.service'

// ── Types ────────────────────────────────────────────────────────

export interface AIChatMessage {
  id: number
  role: 'user' | 'bot'
  content: string
  intent?: 'RAG' | 'SQL' | 'OTHER'
  sentAt?: string
}

export type HealthStatus = 'connecting' | 'ready' | 'loading_model' | 'error'

const LS_SESSION_KEY = 'ai_chat_session_id'
const LS_GUEST_KEY = 'ai_chat_guest_id'

const WELCOME_MESSAGE: AIChatMessage = {
  id: 0,
  role: 'bot',
  content:
    'Xin chào! Tôi là trợ lý AI của SCUDN. Tôi có thể giúp bạn tìm xe, trả lời câu hỏi về chính sách, hoặc hỗ trợ thông tin mua xe. Bạn cần gì? 🚗',
}

// ── Helper ───────────────────────────────────────────────────────

function getOrCreateGuestId(): string {
  let guestId = localStorage.getItem(LS_GUEST_KEY)
  if (!guestId) {
    guestId = crypto.randomUUID()
    localStorage.setItem(LS_GUEST_KEY, guestId)
  }
  return guestId
}

// ── Hook ─────────────────────────────────────────────────────────

export function useAIChat() {
  const user = useAuthStore((s) => s.user)

  const [messages, setMessages] = useState<AIChatMessage[]>([WELCOME_MESSAGE])
  const [isTyping, setIsTyping] = useState(false)
  const [healthStatus, setHealthStatus] = useState<HealthStatus>('connecting')
  const [error, setError] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<number | null>(null)

  const nextIdRef = useRef(1)
  const initCalledRef = useRef(false)

  // ── Initialise session + health on mount ──

  const initSession = useCallback(async () => {
    // 1. Health check
    try {
      const health = await checkAIChatHealth()
      if (health.status === 'ok') {
        setHealthStatus(health.embedding_ready ? 'ready' : 'loading_model')
      } else {
        setHealthStatus('error')
      }
    } catch {
      setHealthStatus('error')
    }

    const userId = user?.id ?? null
    const guestId = getOrCreateGuestId()

    // 2. Try to restore existing session
    const savedSessionId = localStorage.getItem(LS_SESSION_KEY)
    if (savedSessionId) {
      const sid = parseInt(savedSessionId, 10)
      try {
        const history = await getAIChatMessages(sid)
        setSessionId(sid)

        if (history.length > 0) {
          const restored: AIChatMessage[] = history.map((msg, idx) => ({
            id: idx + 1,
            role: msg.sender_type === 'user' ? 'user' : 'bot',
            content: msg.content,
            sentAt: msg.sent_at,
          }))
          nextIdRef.current = restored.length + 1
          setMessages(restored)
        }
        return
      } catch {
        localStorage.removeItem(LS_SESSION_KEY)
      }
    }

    // 3. Create new session
    try {
      const res = await createAIChatSession(userId, guestId)
      setSessionId(res.session_id)
      localStorage.setItem(LS_SESSION_KEY, String(res.session_id))
    } catch {
      setError('Không thể tạo phiên chat. Vui lòng thử lại sau.')
    }
  }, [user?.id])

  useEffect(() => {
    if (initCalledRef.current) return
    initCalledRef.current = true
    initSession()
  }, [initSession])

  // ── Send message ──

  const sendMessage = useCallback(
    async (text: string) => {
      const content = text.trim()
      if (!content || isTyping || !sessionId) return

      setError(null)

      const userMsgId = nextIdRef.current++
      const userMsg: AIChatMessage = { id: userMsgId, role: 'user', content }
      setMessages((prev) => [...prev, userMsg])
      setIsTyping(true)

      try {
        const res: AIChatSendMessageResponse = await sendAIChatMessage(
          sessionId,
          content,
        )

        const botMsg: AIChatMessage = {
          id: nextIdRef.current++,
          role: 'bot',
          content: res.reply,
          intent: res.intent,
          sentAt: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, botMsg])
      } catch (err: unknown) {
        const detail = extractErrorDetail(err)
        setError(detail)

        const errMsg: AIChatMessage = {
          id: nextIdRef.current++,
          role: 'bot',
          content: detail,
        }
        setMessages((prev) => [...prev, errMsg])
      } finally {
        setIsTyping(false)
      }
    },
    [isTyping, sessionId],
  )

  // ── Create new session ──

  const createNewSession = useCallback(async () => {
    const userId = user?.id ?? null
    const guestId = getOrCreateGuestId()

    try {
      const res = await createAIChatSession(userId, guestId)
      setSessionId(res.session_id)
      localStorage.setItem(LS_SESSION_KEY, String(res.session_id))
      setMessages([WELCOME_MESSAGE])
      nextIdRef.current = 1
      setError(null)
    } catch {
      setError('Không thể tạo phiên chat mới. Vui lòng thử lại sau.')
    }
  }, [user?.id])

  return {
    messages,
    isTyping,
    healthStatus,
    error,
    sessionId,
    sendMessage,
    createNewSession,
  }
}

// ── Error detail extraction ──────────────────────────────────────

function extractErrorDetail(err: unknown): string {
  if (err && typeof err === 'object') {
    const axiosErr = err as { response?: { status?: number; data?: { detail?: string } } }
    const status = axiosErr.response?.status
    const detail = axiosErr.response?.data?.detail

    if (status === 429) {
      return detail ?? 'Hệ thống đang quá tải. Vui lòng thử lại sau ít phút.'
    }
    if (status === 503) {
      return detail ?? 'Hệ thống đang khởi động. Vui lòng thử lại sau.'
    }
    if (status === 404) {
      return 'Phiên chat không tồn tại. Vui lòng tạo phiên mới.'
    }
    if (detail) return detail
  }
  return 'Đã xảy ra lỗi. Vui lòng thử lại sau.'
}
