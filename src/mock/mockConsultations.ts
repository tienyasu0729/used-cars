export interface MockConsultationViewedCar {
  vehicleId: string
  vehicleName: string
  viewCount: number
  lastViewed: string
}

export interface MockConsultation {
  id: string
  customerId: string
  customerName: string
  customerPhone: string
  customerEmail: string
  region: string
  vehicleIds: string[]
  summary: string
  message: string
  status: 'pending' | 'processing' | 'resolved'
  priority: 'high' | 'medium' | 'low'
  createdAt: string
  viewedCars?: MockConsultationViewedCar[]
}

export const mockConsultations: MockConsultation[] = [
  {
    id: 'REQ-291024-001',
    customerId: 'u1',
    customerName: 'Nguyễn Thị Thùy Trang',
    customerPhone: '0905123123',
    customerEmail: 'trang.ntt@email.com',
    region: 'Hải Châu, Đà Nẵng',
    vehicleIds: ['v1'],
    summary: 'Tư vấn Mazda 3 Premium',
    message: 'Xin chào BanXeOTo Da Nang, em đang quan tâm đến mẫu Mazda 3 Premium màu Trắng. Em muốn hỏi chương trình khuyến mãi hiện tại cho khách hàng tại Đà Nẵng. Đồng thời em muốn biết lãi suất trả góp 0% trong 6 tháng đầu áp dụng cho ngân hàng nào? Em có thể qua xem xe vào sáng thứ 7 này được không?',
    status: 'pending',
    priority: 'high',
    createdAt: '2025-03-14T09:45:00Z',
    viewedCars: [
      { vehicleId: 'v1', vehicleName: 'Mazda 3 Premium', viewCount: 2, lastViewed: '15 phút trước' },
      { vehicleId: 'v2', vehicleName: 'Mazda CX-5 Luxury', viewCount: 1, lastViewed: 'Hôm qua' },
      { vehicleId: 'v4', vehicleName: 'Honda City RS', viewCount: 1, lastViewed: '2 ngày trước' },
    ],
  },
  {
    id: 'REQ-291024-002',
    customerId: 'u5',
    customerName: 'Trần Hoàng Long',
    customerPhone: '0914987654',
    customerEmail: 'long.th@email.com',
    region: 'Thanh Khê, Đà Nẵng',
    vehicleIds: ['v3'],
    summary: 'Hỏi về lái thử Ford Everest',
    message: 'Anh muốn đăng ký lái thử tại nhà vào cuối tuần này. Xe Ford Everest còn chỗ không?',
    status: 'pending',
    priority: 'medium',
    createdAt: '2025-03-14T08:30:00Z',
    viewedCars: [{ vehicleId: 'v3', vehicleName: 'Ford Everest', viewCount: 3, lastViewed: '1 giờ trước' }],
  },
  {
    id: 'REQ-291024-003',
    customerId: 'u6',
    customerName: 'Phạm Minh Anh',
    customerPhone: '0988112233',
    customerEmail: 'anh.pm@email.com',
    region: 'Sơn Trà, Đà Nẵng',
    vehicleIds: ['v2'],
    summary: 'Cần bảng giá lăn bánh City 2024',
    message: 'Cho em xin giá chi tiết sau thuế tại Đà Nẵng ạ. Em muốn trả góp 0% trong 12 tháng.',
    status: 'pending',
    priority: 'low',
    createdAt: '2025-03-14T06:15:00Z',
    viewedCars: [{ vehicleId: 'v2', vehicleName: 'Honda City 2024', viewCount: 1, lastViewed: '3 giờ trước' }],
  },
]
