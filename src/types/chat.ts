export interface ChatMessage {
  id: string
  conversationId: string
  senderId: string
  senderType: 'user' | 'staff' | 'ai'
  content: string
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
}
