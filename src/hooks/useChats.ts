import { useQuery } from '@tanstack/react-query'
import { mockConversations, mockChatMessages, mockStaffConversations } from '@/mock'
import { isMockMode } from '@/config/dataSource'

async function fetchConversations() {
  if (isMockMode()) return mockConversations
  try {
    const res = await fetch('/api/chat/conversations')
    if (res.ok) {
      const data = await res.json()
      return Array.isArray(data) ? data : data?.data ?? mockConversations
    }
  } catch {}
  return mockConversations
}

export function useConversations() {
  return useQuery({
    queryKey: ['chatConversations', isMockMode()],
    queryFn: fetchConversations,
    staleTime: isMockMode() ? Infinity : 1000 * 60,
  })
}

export function useStaffConversations() {
  return useQuery({
    queryKey: ['staffChatConversations', isMockMode()],
    queryFn: async () => {
      if (isMockMode()) return mockStaffConversations
      try {
        const res = await fetch('/api/staff/chat/conversations')
        if (res.ok) {
          const data = await res.json()
          return Array.isArray(data) ? data : data?.data ?? mockStaffConversations
        }
      } catch {}
      return mockStaffConversations
    },
    staleTime: isMockMode() ? Infinity : 1000 * 60,
  })
}

export function useChatMessages(conversationId: string | undefined) {
  return useQuery({
    queryKey: ['chatMessages', conversationId, isMockMode()],
    queryFn: async () => {
      if (!conversationId) return []
      if (isMockMode()) {
        return mockChatMessages[conversationId] ?? []
      }
      try {
        const res = await fetch(`/api/chat/conversations/${conversationId}/messages`)
        if (res.ok) {
          const data = await res.json()
          return Array.isArray(data) ? data : data?.data ?? []
        }
      } catch {}
      return mockChatMessages[conversationId] ?? []
    },
    enabled: !!conversationId,
  })
}
