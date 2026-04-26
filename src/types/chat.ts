export interface ChatMessage {
  id: string
  conversationId: string
  /** 'self' = tin của user đang đăng nhập, 'other' = đối phương */
  senderType: 'self' | 'other'
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
  vehicleInfo?: string
  vehiclePrice?: string
  isNewCustomer?: boolean
  /** Phiếu tư vấn pending gắn khách — dùng cho nút Tiếp nhận ngay */
  consultationId?: number
  consultationStatus?: string
}
