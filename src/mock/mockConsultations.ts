export interface MockConsultation {
  id: string
  customerId: string
  customerName: string
  customerPhone: string
  vehicleIds: string[]
  message: string
  status: 'pending' | 'processing' | 'resolved'
  priority: 'high' | 'medium' | 'low'
  createdAt: string
}

export const mockConsultations: MockConsultation[] = [
  {
    id: 'c1',
    customerId: 'u1',
    customerName: 'Nguyễn Minh Hùng',
    customerPhone: '0905123456',
    vehicleIds: ['v1'],
    message: 'Tư vấn Ford Ranger, muốn biết giá lăn bánh',
    status: 'pending',
    priority: 'high',
    createdAt: '2025-03-14T08:00:00Z',
  },
  {
    id: 'c2',
    customerId: 'u1',
    customerName: 'Chị Huệ',
    customerPhone: '0932123456',
    vehicleIds: ['v2'],
    message: 'Yêu cầu báo giá chi tiết Kia Seltos',
    status: 'pending',
    priority: 'medium',
    createdAt: '2025-03-14T06:30:00Z',
  },
]
