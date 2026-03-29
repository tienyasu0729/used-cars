import { useQuery } from '@tanstack/react-query'
import axiosInstance from '@/utils/axiosInstance'
import { mockConversations, mockChatMessages, mockStaffConversations } from '@/mock'
import { customerExtrasApiEnabled, isMockMode } from '@/config/dataSource'
import type { ApiResponse } from '@/types/auth.types'
import type { ChatConversation, ChatMessage } from '@/types/chat'

async function fetchConversations(): Promise<ChatConversation[]> {
  if (isMockMode() || !customerExtrasApiEnabled()) return mockConversations
  try {
    const res = (await axiosInstance.get('/chat/conversations')) as unknown as ApiResponse<ChatConversation[]>
    const raw = res.data
    if (Array.isArray(raw)) return raw
    return mockConversations
  } catch {
    return mockConversations
  }
}

export function useConversations() {
  return useQuery({
    queryKey: ['chatConversations', isMockMode(), customerExtrasApiEnabled()],
    queryFn: fetchConversations,
    staleTime: isMockMode() ? Infinity : 1000 * 60,
  })
}

export function useStaffConversations() {
  return useQuery({
    queryKey: ['staffChatConversations', isMockMode(), customerExtrasApiEnabled()],
    queryFn: async () => {
      if (isMockMode() || !customerExtrasApiEnabled()) return mockStaffConversations
      try {
        const res = (await axiosInstance.get(
          '/staff/chat/conversations',
        )) as unknown as ApiResponse<ChatConversation[]>
        const raw = res.data
        if (Array.isArray(raw)) return raw
        return mockStaffConversations
      } catch {
        return mockStaffConversations
      }
    },
    staleTime: isMockMode() ? Infinity : 1000 * 60,
  })
}

export function useChatMessages(conversationId: string | undefined) {
  return useQuery({
    queryKey: ['chatMessages', conversationId, isMockMode(), customerExtrasApiEnabled()],
    queryFn: async () => {
      if (!conversationId) return []
      if (isMockMode()) {
        return mockChatMessages[conversationId] ?? []
      }
      if (!customerExtrasApiEnabled()) {
        return mockChatMessages[conversationId] ?? []
      }
      try {
        const res = (await axiosInstance.get(
          `/chat/conversations/${conversationId}/messages`,
        )) as unknown as ApiResponse<ChatMessage[]>
        const raw = res.data
        if (Array.isArray(raw)) return raw
        return mockChatMessages[conversationId] ?? []
      } catch {
        return mockChatMessages[conversationId] ?? []
      }
    },
    enabled: !!conversationId,
  })
}
