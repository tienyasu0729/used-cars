import { useQuery } from '@tanstack/react-query'
import axiosInstance from '@/utils/axiosInstance'
import { customerExtrasApiEnabled } from '@/config/dataSource'
import type { ApiResponse } from '@/types/auth.types'
import type { ChatConversation, ChatMessage } from '@/types/chat'

async function fetchConversations(): Promise<ChatConversation[]> {
  if (!customerExtrasApiEnabled()) return []
  try {
    const res = (await axiosInstance.get('/chat/conversations')) as unknown as ApiResponse<ChatConversation[]>
    const raw = res.data
    return Array.isArray(raw) ? raw : []
  } catch {
    return []
  }
}

export function useConversations() {
  return useQuery({
    queryKey: ['chatConversations', customerExtrasApiEnabled()],
    queryFn: fetchConversations,
    staleTime: 1000 * 60,
  })
}

export function useStaffConversations() {
  return useQuery({
    queryKey: ['staffChatConversations', customerExtrasApiEnabled()],
    queryFn: async () => {
      if (!customerExtrasApiEnabled()) return [] as ChatConversation[]
      try {
        const res = (await axiosInstance.get(
          '/staff/chat/conversations',
        )) as unknown as ApiResponse<ChatConversation[]>
        const raw = res.data
        return Array.isArray(raw) ? raw : []
      } catch {
        return []
      }
    },
    staleTime: 1000 * 60,
  })
}

export function useChatMessages(conversationId: string | undefined) {
  return useQuery({
    queryKey: ['chatMessages', conversationId, customerExtrasApiEnabled()],
    queryFn: async () => {
      if (!conversationId) return []
      if (!customerExtrasApiEnabled()) return []
      try {
        const res = (await axiosInstance.get(
          `/chat/conversations/${conversationId}/messages`,
        )) as unknown as ApiResponse<ChatMessage[]>
        const raw = res.data
        return Array.isArray(raw) ? raw : []
      } catch {
        return []
      }
    },
    enabled: !!conversationId,
  })
}
