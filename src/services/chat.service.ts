import axiosInstance from '@/utils/axiosInstance'
import type { ApiResponse } from '@/types/auth.types'

export interface ChatConversationApiRow {
  id: number
  participantName: string
  participantRole: string
  lastMessage: string
  lastMessageAt: string | null
  unreadCount: number
}

export interface ChatMessageApiRow {
  id: number
  senderId: number
  senderName: string
  content: string
  sentAt: string
  isRead: boolean
}

function unwrapList<T>(res: unknown): T[] {
  const r = res as ApiResponse<T[]>
  const raw = r?.data
  return Array.isArray(raw) ? raw : []
}

function unwrapMeta(res: unknown): Record<string, unknown> | undefined {
  const r = res as ApiResponse<unknown>
  return r?.meta && typeof r.meta === 'object' ? (r.meta as Record<string, unknown>) : undefined
}

export async function listChatConversations(): Promise<ChatConversationApiRow[]> {
  const res = await axiosInstance.get<unknown>('/chat/conversations')
  return unwrapList<ChatConversationApiRow>(res)
}

export async function createChatConversation(participantId: number, initialMessage?: string): Promise<number> {
  const res = (await axiosInstance.post('/chat/conversations', {
    participantId,
    initialMessage: initialMessage?.trim() || undefined,
  })) as ApiResponse<{ conversationId: number }>
  const id = res?.data?.conversationId
  if (typeof id !== 'number') throw new Error('Invalid create conversation response')
  return id
}

export async function getChatMessages(
  conversationId: number,
  page = 0,
  size = 50,
): Promise<{ items: ChatMessageApiRow[]; meta: Record<string, unknown> | undefined }> {
  const res = await axiosInstance.get<unknown>(`/chat/conversations/${conversationId}/messages`, {
    params: { page, size },
  })
  return { items: unwrapList<ChatMessageApiRow>(res), meta: unwrapMeta(res) }
}

export async function sendChatMessage(conversationId: number, content: string, messageType = 'text'): Promise<number> {
  const res = (await axiosInstance.post('/chat/messages', {
    conversationId,
    content,
    messageType,
  })) as ApiResponse<{ messageId: number }>
  const id = res?.data?.messageId
  if (typeof id !== 'number') throw new Error('Invalid send message response')
  return id
}
