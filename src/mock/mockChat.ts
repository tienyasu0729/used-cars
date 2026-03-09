export interface ChatConversation {
  id: string
  name: string
  lastMsg: string
  unread: number
}

export interface ChatMessage {
  id: string
  from: 'customer' | 'showroom' | 'finance'
  text: string
  time: string
}

export const mockShowroomConversations: ChatConversation[] = [
  { id: '1', name: 'Nguyễn Văn A', lastMsg: 'Xe Toyota Camry còn không?', unread: 1 },
  { id: '2', name: 'Trần Thị B', lastMsg: 'Cảm ơn showroom', unread: 0 },
]

export const mockShowroomMessages: Record<string, ChatMessage[]> = {
  '1': [
    { id: 'm1-1', from: 'customer', text: 'Xe Toyota Camry còn không?', time: '10:30' },
    { id: 'm1-2', from: 'showroom', text: 'Dạ còn ạ. Anh đến xem lúc nào?', time: '10:32' },
  ],
  '2': [
    { id: 'm2-1', from: 'customer', text: 'Đã nhận xe, cảm ơn showroom!', time: '09:15' },
    { id: 'm2-2', from: 'showroom', text: 'Cảm ơn anh/chị. Chúc anh/chị lái xe an toàn.', time: '09:20' },
    { id: 'm2-3', from: 'customer', text: 'Cảm ơn showroom', time: '09:22' },
  ],
}

export const mockFinanceConversations: ChatConversation[] = [
  { id: '1', name: 'Nguyễn Văn A', lastMsg: 'Gửi bảng lương được không?', unread: 1 },
  { id: '2', name: 'Trần Thị B', lastMsg: 'Đã gửi CMND', unread: 0 },
]

export const mockFinanceMessages: Record<string, ChatMessage[]> = {
  '1': [
    { id: 'm1-1', from: 'customer', text: 'Tôi cần tư vấn vay mua xe', time: '10:00' },
    { id: 'm1-2', from: 'finance', text: 'Vui lòng gửi bảng lương và CMND để chúng tôi thẩm định', time: '10:05' },
    { id: 'm1-3', from: 'customer', text: 'Gửi bảng lương được không?', time: '10:10' },
  ],
  '2': [
    { id: 'm2-1', from: 'customer', text: 'Đã gửi CMND', time: '09:30' },
    { id: 'm2-2', from: 'finance', text: 'Đã nhận. Vui lòng gửi thêm sao kê ngân hàng 3 tháng', time: '09:35' },
  ],
}
