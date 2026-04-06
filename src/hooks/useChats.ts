import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'
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

/** Cùng một interval cho mọi nơi dùng queryKey này (tránh observer sau ghi đè refetchInterval). */
export const CHAT_CONVERSATIONS_POLL_MS = 5000

function isInternalStaffRoleForChat(role: string | undefined | null): boolean {
  const r = String(role ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
  return r === 'salesstaff' || r === 'branchmanager' || r === 'admin'
}

function mapConversation(row: ChatConversationApiRow): ChatConversation {
  const cid = row.consultationId
  return {
    id: String(row.id),
    participantName: row.participantName,
    participantRole: row.participantRole,
    lastMessage: row.lastMessage ?? '',
    lastMessageAt: row.lastMessageAt ?? '',
    unreadCount: row.unreadCount ?? 0,
    vehicleInfo: row.vehicleInfo ?? undefined,
    vehiclePrice: row.vehiclePrice ?? undefined,
    isNewCustomer: row.consultationNewLead === true,
    consultationId: typeof cid === 'number' && Number.isFinite(cid) ? cid : undefined,
    consultationStatus: row.consultationStatus ?? undefined,
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

export function useConversations(options?: { queryEnabled?: boolean; pollIntervalMs?: number }) {
  const base = customerExtrasApiEnabled()
  const enabled = base && (options?.queryEnabled !== false)
  const pollMs = options?.pollIntervalMs ?? 0
  return useQuery({
    queryKey: convKey,
    queryFn: async () => {
      if (!base) return [] as ChatConversation[]
      const rows = await listChatConversations()
      return rows.map(mapConversation)
    },
    enabled,
    staleTime: pollMs > 0 ? Math.min(pollMs, 10_000) : 30_000,
    refetchInterval: pollMs > 0 ? pollMs : false,
  })
}

/** Staff/manager trên trang chat: làm mới danh sách hội thoại định kỳ để thấy cuộc mới ngay. */
export function useStaffConversations() {
  return useConversations({ pollIntervalMs: CHAT_CONVERSATIONS_POLL_MS })
}

/**
 * NV/QL/Admin: prefetch hội thoại + poll nhẹ để badge chấm đỏ / FAB cập nhật không cần F5.
 * Dùng chung queryKey với màn chat đầy đủ.
 */
export function useInternalStaffChatInbox() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const role = useAuthStore((s) => s.user?.role)
  const base = customerExtrasApiEnabled()
  const internal = isAuthenticated && isInternalStaffRoleForChat(role)
  const enabled = base && internal
  return useConversations({
    queryEnabled: enabled,
    pollIntervalMs: enabled ? CHAT_CONVERSATIONS_POLL_MS : 0,
  })
}

export function useInternalStaffChatUnreadCount() {
  const { data = [] } = useInternalStaffChatInbox()
  return useMemo(() => data.reduce((s, c) => s + (c.unreadCount ?? 0), 0), [data])
}

export function useChatMessages(
  conversationId: string | undefined,
  pollMs = 0,
  options?: { queryEnabled?: boolean },
) {
  const enabledBase = customerExtrasApiEnabled() && !!conversationId
  const selfId = useAuthStore((s) => {
    const id = s.user?.id
    if (id == null) return NaN
    const n = typeof id === 'number' ? id : Number(id)
    return Number.isFinite(n) ? n : NaN
  })
  const qc = useQueryClient()
  const numericConvId = conversationId ? parseInt(conversationId, 10) : NaN
  const extraEnabled = options?.queryEnabled !== false

  const query = useQuery({
    queryKey: ['chat', 'messages', conversationId],
    queryFn: async () => {
      if (!conversationId || !Number.isFinite(numericConvId)) return [] as ChatMessage[]
      const { items } = await getChatMessages(numericConvId, 0, 100)
      if (!Number.isFinite(selfId)) return []
      const chronological = [...items].reverse()
      return mapMessages(chronological, conversationId, selfId)
    },
    enabled: enabledBase && Number.isFinite(selfId) && extraEnabled,
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
