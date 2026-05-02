export interface ChatMessage {
  id: string
  conversationId: string
  senderType: 'self' | 'other'
  content: string
  messageType?: string
  createdAt: string
}

export interface ChatConversation {
  id: string
  participantName: string
  participantAvatar?: string
  participantRole?: string
  lastMessage: string
  lastMessageAt: string
  unreadCount: number
  vehicleInfo?: string
  vehiclePrice?: string
  isNewCustomer?: boolean
  consultationId?: number
  consultationStatus?: string
}
