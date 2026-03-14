import type { ChatConversation, ChatMessage } from '@/types'

export const mockConversations: ChatConversation[] = [
  {
    id: 'c1',
    participantName: 'Tư vấn viên BanXeOTo',
    participantRole: 'Nhân viên tư vấn',
    lastMessage: 'Xe Toyota Camry đã sẵn sàng cho buổi lái thử ngày mai.',
    lastMessageAt: '2025-03-12T10:30:00Z',
    unreadCount: 1,
  },
]

export const mockChatMessages: Record<string, ChatMessage[]> = {
  c1: [
    {
      id: 'm1',
      conversationId: 'c1',
      senderId: 'staff1',
      senderType: 'staff',
      content: 'Chào anh/chị! Em có thể hỗ trợ gì ạ?',
      createdAt: '2025-03-12T09:00:00Z',
    },
    {
      id: 'm2',
      conversationId: 'c1',
      senderId: 'u1',
      senderType: 'user',
      content: 'Tôi muốn đặt lịch lái thử xe Toyota Camry.',
      createdAt: '2025-03-12T09:05:00Z',
    },
    {
      id: 'm3',
      conversationId: 'c1',
      senderId: 'staff1',
      senderType: 'staff',
      content: 'Xe Toyota Camry đã sẵn sàng cho buổi lái thử ngày mai.',
      createdAt: '2025-03-12T10:30:00Z',
    },
  ],
}
