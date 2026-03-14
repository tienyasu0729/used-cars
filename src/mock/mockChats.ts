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

export const mockStaffConversations: ChatConversation[] = [
  {
    id: 'c1',
    participantName: 'Nguyễn Văn A',
    lastMessage: 'Chào bạn, mình muốn hỏi về Ma...',
    lastMessageAt: '2025-03-14T10:45:00Z',
    unreadCount: 2,
    vehicleInfo: 'Mazda 3 2023 - 650tr',
    vehiclePrice: '650,000,000₫',
    isNewCustomer: true,
  },
  {
    id: 'c2',
    participantName: 'Trần Thị B',
    lastMessage: 'Xe này còn thương lượng được không ạ?',
    lastMessageAt: '2025-03-13T14:20:00Z',
    unreadCount: 0,
    vehicleInfo: 'Toyota Vios 2022 - 420tr',
    vehiclePrice: '420,000,000₫',
    isNewCustomer: false,
  },
  {
    id: 'c3',
    participantName: 'Lê Hoàng',
    lastMessage: 'Mình muốn xem xe vào chiều nay...',
    lastMessageAt: '2025-03-14T09:12:00Z',
    unreadCount: 0,
    vehicleInfo: 'Kia Seltos 2021',
    vehiclePrice: '520,000,000₫',
    isNewCustomer: false,
  },
]

export const mockChatMessages: Record<string, ChatMessage[]> = {
  c1: [
    {
      id: 'm1',
      conversationId: 'c1',
      senderId: 'u1',
      senderType: 'user',
      content: 'Chào bạn, mình thấy tin đăng xe Mazda 3 2023 giá 650tr. Xe này còn hàng ở showroom Đà Nẵng không bạn?',
      createdAt: '2025-03-14T10:42:00Z',
    },
    {
      id: 'm2',
      conversationId: 'c1',
      senderId: 'u1',
      senderType: 'user',
      content: 'Mình muốn qua xem xe trực tiếp thì tới đâu nhỉ?',
      createdAt: '2025-03-14T10:45:00Z',
    },
    {
      id: 'm3',
      conversationId: 'c1',
      senderId: 'staff1',
      senderType: 'staff',
      content: 'Dạ chào anh A, xe Mazda 3 2023 màu trắng bên em vẫn còn sẵn tại showroom Đà Nẵng ạ. Anh có thể ghé số 123 Nguyễn Hữu Thọ để xem xe nhé.',
      createdAt: '2025-03-14T10:48:00Z',
    },
  ],
  c2: [
    {
      id: 'm4',
      conversationId: 'c2',
      senderId: 'u2',
      senderType: 'user',
      content: 'Xe Toyota Vios 2022 còn không ạ?',
      createdAt: '2025-03-13T10:00:00Z',
    },
    {
      id: 'm5',
      conversationId: 'c2',
      senderId: 'staff1',
      senderType: 'staff',
      content: 'Dạ xe còn ạ. Anh/chị muốn xem xe khi nào?',
      createdAt: '2025-03-13T14:20:00Z',
    },
  ],
  c3: [],
}
