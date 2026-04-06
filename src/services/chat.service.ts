import axiosInstance from '@/utils/axiosInstance'
import type { ApiResponse } from '@/types/auth.types'

export interface ChatConversationApiRow {
  id: number
  participantName: string
  participantRole: string
  lastMessage: string
  lastMessageAt: string | null
  unreadCount: number
  consultationId?: number | null
  consultationStatus?: string | null
  vehicleInfo?: string | null
  vehiclePrice?: string | null
  consultationNewLead?: boolean | null
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

/** QL: NV/QL cùng chi nhánh + chi nhánh khác (BE lọc active). */
export interface ManagerChatContactRow {
  userId: number
  name: string
  role: string
  avatarUrl?: string | null
}

function parseManagerContactRow(raw: Record<string, unknown>): ManagerChatContactRow | null {
  const userId = Number(raw.userId ?? raw.user_id)
  if (!Number.isFinite(userId)) return null
  const name = typeof raw.name === 'string' ? raw.name : ''
  const role = typeof raw.role === 'string' ? raw.role : ''
  const avatarUrl = typeof raw.avatarUrl === 'string' ? raw.avatarUrl : raw.avatar_url
  return {
    userId,
    name,
    role,
    avatarUrl: typeof avatarUrl === 'string' ? avatarUrl : null,
  }
}

export async function listManagerChatContacts(): Promise<ManagerChatContactRow[]> {
  const res = await axiosInstance.get<unknown>('/chat/manager-contact-options')
  const raw = unwrapList<Record<string, unknown>>(res)
  const out: ManagerChatContactRow[] = []
  for (const row of raw) {
    if (row && typeof row === 'object') {
      const c = parseManagerContactRow(row)
      if (c) out.push(c)
    }
  }
  return out
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

export const TRANSFER_GROUP_SAME_BRANCH_SALES = 'SAME_BRANCH_SALES' as const
export const TRANSFER_GROUP_OTHER_BRANCH_MANAGER = 'OTHER_BRANCH_MANAGER' as const

export interface ChatTransferCandidate {
  userId: number
  name: string
  roleLabel: string
  /** BE: tách NV cùng chi nhánh / QL chi nhánh khác */
  transferGroup?: typeof TRANSFER_GROUP_SAME_BRANCH_SALES | typeof TRANSFER_GROUP_OTHER_BRANCH_MANAGER
}

function parseTransferCandidate(raw: Record<string, unknown>): ChatTransferCandidate | null {
  const userId = Number(raw.userId ?? raw.user_id)
  if (!Number.isFinite(userId)) return null
  const name = typeof raw.name === 'string' ? raw.name : ''
  const roleLabel =
    typeof raw.roleLabel === 'string'
      ? raw.roleLabel
      : typeof raw.role_label === 'string'
        ? raw.role_label
        : ''
  const tg = raw.transferGroup ?? raw.transfer_group
  const transferGroup =
    tg === TRANSFER_GROUP_OTHER_BRANCH_MANAGER
      ? TRANSFER_GROUP_OTHER_BRANCH_MANAGER
      : tg === TRANSFER_GROUP_SAME_BRANCH_SALES
        ? TRANSFER_GROUP_SAME_BRANCH_SALES
        : undefined
  return { userId, name, roleLabel, transferGroup }
}

export async function fetchTransferCandidates(conversationId: number): Promise<ChatTransferCandidate[]> {
  const res = await axiosInstance.get<unknown>(`/chat/conversations/${conversationId}/transfer-candidates`)
  const raw = unwrapList<Record<string, unknown>>(res)
  const out: ChatTransferCandidate[] = []
  for (const row of raw) {
    if (row && typeof row === 'object') {
      const c = parseTransferCandidate(row)
      if (c) out.push(c)
    }
  }
  return out
}

export async function transferChatConversation(conversationId: number, targetUserId: number): Promise<void> {
  await axiosInstance.post(`/chat/conversations/${conversationId}/transfer`, { targetUserId })
}
