import type { ShowroomAppointment, ShowroomTransaction, ShowroomReview, ServicePackage } from '@/api/showroomApi'

export const mockShowroomAppointments: ShowroomAppointment[] = [
  { id: 'apt-1', customerName: 'Nguyễn Văn A', carName: 'Toyota Camry 2024', carId: 'car-001', appointmentTime: '15/03/2025 10:00', status: 'pending' },
  { id: 'apt-2', customerName: 'Trần Thị B', carName: 'Honda CR-V 2023', carId: 'car-002', appointmentTime: '16/03/2025 14:00', status: 'confirmed' },
]

export const mockShowroomTransactions: ShowroomTransaction[] = [
  { id: 'txn-1', customer: 'Nguyễn A', car: 'Toyota Camry', depositAmount: 50_000_000, status: 'deposit_received' },
  { id: 'txn-2', customer: 'Trần B', car: 'Honda CR-V', depositAmount: 1_120_000_000, status: 'commission_deducted' },
]

export const mockShowroomReviews: ShowroomReview[] = [
  { id: 'rv-1', customerName: 'Lê Văn C', rating: 5, comment: 'Xe tốt, giao dịch nhanh', date: '08/03/2025' },
  { id: 'rv-2', customerName: 'Phạm Thị D', rating: 4, comment: 'Chất lượng ổn', date: '07/03/2025', reply: 'Cảm ơn bạn!' },
]

export const mockServicePackages: ServicePackage[] = [
  { id: 'pkg-1', name: 'Gói cứu hộ 1 năm', price: 200_000, description: 'Dịch vụ cứu hộ 24/7 toàn quốc' },
  { id: 'pkg-2', name: 'Voucher thay dầu', price: 150_000, description: 'Giảm 20% thay dầu lần đầu' },
]

export const mockShowroomStats = {
  weeklyViews: 1240,
  pendingAppointments: 5,
  qrScans: 12,
  conversionRate: 8.5,
}
