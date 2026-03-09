export interface Notification {
  id: string
  title: string
  message: string
  read: boolean
  createdAt: string
}

export const mockNotifications: Notification[] = [
  { id: 'n1', title: 'Thông báo hệ thống', message: 'Bảo trì định kỳ vào 02:00-04:00', read: false, createdAt: '09/03/2025' },
  { id: 'n2', title: 'Tin đăng mới', message: 'Toyota Camry 2024 chờ duyệt', read: true, createdAt: '08/03/2025' },
]
