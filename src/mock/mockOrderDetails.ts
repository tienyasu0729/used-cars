export interface OrderPaymentBreakdown {
  listPrice: number
  registrationTax: number
  registrationFee: number
  serviceFee: number
  discount: number
  discountLabel?: string
}

export interface OrderTimelineStep {
  id: string
  title: string
  date?: string
  desc?: string
  status: 'done' | 'current' | 'pending'
}

export const mockOrderPaymentBreakdown: Record<string, OrderPaymentBreakdown> = {
  'ORD-001': {
    listPrice: 820000000,
    registrationTax: 24600000,
    registrationFee: 20000000,
    serviceFee: 5000000,
    discount: 19600000,
    discountLabel: 'Giảm giá hè',
  },
  'ORD-002': {
    listPrice: 695000000,
    registrationTax: 20850000,
    registrationFee: 20000000,
    serviceFee: 5000000,
    discount: 20850000,
    discountLabel: 'Khuyến mãi',
  },
}

export const mockOrderTimeline: Record<string, OrderTimelineStep[]> = {
  'ORD-001': [
    { id: '1', title: 'Đơn hàng đã tạo', date: '15/02/2025, 10:30', desc: 'Đã tiếp nhận yêu cầu đặt cọc.', status: 'done' },
    { id: '2', title: 'Xác nhận đặt cọc', date: '15/02/2025, 11:45', desc: 'Đã nhận 100.000.000₫ tiền cọc.', status: 'done' },
    { id: '3', title: 'Đang chuẩn bị xe', date: '16/02/2025', desc: 'Kiểm tra PDI & làm hồ sơ đăng ký.', status: 'done' },
    { id: '4', title: 'Sẵn sàng bàn giao', date: '20/02/2025', status: 'done' },
    { id: '5', title: 'Hoàn tất', status: 'done' },
  ],
  'ORD-002': [
    { id: '1', title: 'Đơn hàng đã tạo', date: '01/03/2025, 14:20', desc: 'Đã tiếp nhận yêu cầu đặt cọc.', status: 'done' },
    { id: '2', title: 'Xác nhận đặt cọc', date: '01/03/2025, 15:45', desc: 'Đã nhận 50.000.000₫ tiền cọc.', status: 'done' },
    { id: '3', title: 'Đang chuẩn bị xe', desc: 'Kiểm tra PDI & làm hồ sơ đăng ký.', status: 'current' },
    { id: '4', title: 'Sẵn sàng bàn giao', date: 'Dự kiến: 08/03/2025', status: 'pending' },
    { id: '5', title: 'Hoàn tất', status: 'pending' },
  ],
}

export const mockOrderExtras: Record<string, { trackingNumber: string; deliveryBranch: string; salesName: string; salesPhone: string }> = {
  'ORD-001': { trackingNumber: 'VN-001-DA-NANG', deliveryBranch: 'Showroom Hải Châu, ĐN', salesName: 'Nguyễn Văn An', salesPhone: '0905 123 456' },
  'ORD-002': { trackingNumber: 'VN-002-DA-NANG', deliveryBranch: 'Showroom Hải Châu, ĐN', salesName: 'Nguyễn Văn An', salesPhone: '0905 123 456' },
}
