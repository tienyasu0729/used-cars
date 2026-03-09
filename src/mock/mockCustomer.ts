import type { Banner, Appointment, Transaction, Voucher } from '@/api/customerApi'

export const mockBanners: Banner[] = [
  { id: '1', title: 'Khuyến mãi mùa hè - Giảm đến 50 triệu', image: '', type: 'promotion' },
  { id: '2', title: 'Xe nổi bật tuần - Toyota Camry 2024', image: '', type: 'featured' },
  { id: '3', title: 'Đối tác SCUDN - Bảo hành toàn quốc', image: '', type: 'partner' },
]

export const mockAppointments: Appointment[] = [
  { id: 'apt-1', carId: 'car-001', carName: 'Toyota Camry', showroomId: 'sr-001', showroomName: 'CarHub Motors', date: '15/03/2025', time: '10:00', status: 'pending' },
  { id: 'apt-2', carId: 'car-002', carName: 'Honda CR-V', showroomId: 'sr-001', showroomName: 'CarHub Motors', date: '12/03/2025', time: '14:00', status: 'confirmed' },
]

export const mockTransactions: Transaction[] = [
  { id: 'TXN-001', carId: 'car-001', carName: 'Toyota Camry', amount: 20_000_000, status: 'completed', date: '08/03/2025', type: 'deposit' },
  { id: 'TXN-002', carId: 'car-002', carName: 'Honda CR-V', amount: 1_120_000_000, status: 'completed', date: '05/03/2025', type: 'payment' },
]

export const mockVouchers: Voucher[] = [
  { id: 'v1', name: 'Cứu hộ 1 năm miễn phí', description: 'Dịch vụ cứu hộ 24/7', expiryDate: '31/12/2025', status: 'active' },
  { id: 'v2', name: 'Voucher thay dầu', description: 'Giảm 20% thay dầu', expiryDate: '30/06/2025', status: 'active' },
]
