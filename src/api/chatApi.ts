import { API_CONFIG } from '@/config/apiConfig'
import { mockResponse } from './mockService'
import { httpClient } from './baseApi'

export interface ChatConversation {
  id: string
  name: string
  lastMsg: string
  unread: number
}

export interface ChatMessage {
  id: string
  from: 'customer' | 'showroom' | 'finance'
  text: string
  time: string
}

export type ChatActor = 'showroom' | 'finance'

export const chatApi = {
  async getConversations(actor: ChatActor) {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(async () => {
        const { mockShowroomConversations, mockFinanceConversations } = await import('@/mock/mockChat')
        return actor === 'showroom' ? [...mockShowroomConversations] : [...mockFinanceConversations]
      })
    }
    const res = await httpClient.get<ChatConversation[]>(`/chat/${actor}/conversations`)
    return res.data
  },

  async getMessages(actor: ChatActor, conversationId: string) {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(async () => {
        const { mockShowroomMessages, mockFinanceMessages } = await import('@/mock/mockChat')
        const messages = actor === 'showroom' ? mockShowroomMessages : mockFinanceMessages
        return [...(messages[conversationId] ?? [])]
      })
    }
    const res = await httpClient.get<ChatMessage[]>(`/chat/${actor}/conversations/${conversationId}/messages`)
    return res.data
  },

  async sendMessage(actor: ChatActor, conversationId: string, text: string) {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse({
        success: true,
        message: {
          id: `m-${Date.now()}`,
          from: actor,
          text,
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        },
      })
    }
    const res = await httpClient.post<{ success: boolean; message: ChatMessage }>(
      `/chat/${actor}/conversations/${conversationId}/messages`,
      { text }
    )
    return res.data
  },

  async markAsRead(actor: ChatActor, conversationId: string) {
    if (API_CONFIG.USE_MOCK) return mockResponse({ success: true })
    await httpClient.post(`/chat/${actor}/conversations/${conversationId}/read`)
    return { success: true }
  },

  async createConversation(actor: ChatActor, data: { targetUserId?: string; targetName?: string; initialMessage?: string }) {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse({
        success: true,
        conversation: {
          id: `conv-${Date.now()}`,
          name: data.targetName ?? 'New conversation',
          lastMsg: data.initialMessage ?? '',
          unread: 0,
        },
      })
    }
    const res = await httpClient.post<{ success: boolean; conversation: ChatConversation }>(
      `/chat/${actor}/conversations`,
      data
    )
    return res.data
  },
}
