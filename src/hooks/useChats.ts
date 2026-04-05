import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { customerExtrasApiEnabled } from '@/config/dataSource'
import {
  getChatMessages,
  listChatConversations,
  type ChatConversationApiRow,
  type ChatMessageApiRow,
} from '@/services/chat.service'
import { useAuthStore } from '@/store/authStore'
import type { ChatConversation, ChatMessage } from '@/types/chat'

const convKey = ['chat', 'conversations'] as const

function mapConversation(row: ChatConversationApiRow): ChatConversation {
  return {
    id: String(row.id),
    participantName: row.participantName,
    participantRole: row.participantRole,
    lastMessage: row.lastMessage ?? '',
    lastMessageAt: row.lastMessageAt ?? '',
    unreadCount: row.unreadCount ?? 0,
  }
}

function mapMessages(rows: ChatMessageApiRow[], conversationId: string, selfId: number): ChatMessage[] {
  return rows.map((m) => ({
    id: String(m.id),
    conversationId,
    senderType: m.senderId === selfId ? 'self' : 'other',
    content: m.content,
    createdAt: m.sentAt,
  }))
}

export function useConversations() {
  const enabled = customerExtrasApiEnabled()
  return useQuery({
    queryKey: convKey,
    queryFn: async () => {
      if (!enabled) return [] as ChatConversation[]
      const rows = await listChatConversations()
      return rows.map(mapConversation)
    },
    enabled,
    staleTime: 30_000,
  })
}

/** Staff và customer dùng chung endpoint — không còn /staff/chat. */
export function useStaffConversations() {
  return useConversations()
}

export function useChatMessages(conversationId: string | undefined, pollMs = 0) {
  const enabledBase = customerExtrasApiEnabled() && !!conversationId
  const selfId = useAuthStore((s) => {
    const id = s.user?.id
    if (id == null) return NaN
    const n = typeof id === 'number' ? id : Number(id)
    return Number.isFinite(n) ? n : NaN
  })
  const qc = useQueryClient()
  const numericConvId = conversationId ? parseInt(conversationId, 10) : NaN

  const query = useQuery({
    queryKey: ['chat', 'messages', conversationId],
    queryFn: async () => {
      if (!conversationId || !Number.isFinite(numericConvId)) return [] as ChatMessage[]
      const { items } = await getChatMessages(numericConvId, 0, 100)
      if (!Number.isFinite(selfId)) return []
      const chronological = [...items].reverse()
      return mapMessages(chronological, conversationId, selfId)
    },
    enabled: enabledBase && Number.isFinite(selfId),
    staleTime: pollMs > 0 ? Math.min(pollMs, 5000) : 15_000,
    refetchInterval: pollMs > 0 ? pollMs : false,
  })

  const refetch = useCallback(() => {
    void qc.invalidateQueries({ queryKey: ['chat', 'messages', conversationId] })
    void qc.invalidateQueries({ queryKey: convKey })
  }, [qc, conversationId])

  return { ...query, refetchMessages: refetch }
}

export function useInvalidateChatConversations() {
  const qc = useQueryClient()
  return useCallback(() => {
    void qc.invalidateQueries({ queryKey: convKey })
  }, [qc])
}
