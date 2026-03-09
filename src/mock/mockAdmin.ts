import type {
  ShowroomManage,
  TransactionManage,
  CommissionRecord,
  SubscriptionPackage,
  RescuePartner,
  SystemLog,
  RefundRequest,
  CustomerManage,
} from '@/api/adminApi'

export const mockCustomers: CustomerManage[] = [
  { id: '1', name: 'Nguyễn Văn A', email: 'nguyenvin@gmail.com', phone: '(031)4767889', registeredAt: '19/03/2024', transactionCount: 68, status: 'active' },
  { id: '2', name: 'Trần Thị B', email: 'tranthib@gmail.com', phone: '(032)1234567', registeredAt: '20/03/2024', transactionCount: 34, status: 'active' },
  { id: '3', name: 'Lê Văn C', email: 'levanc@gmail.com', phone: '(033)9876543', registeredAt: '15/02/2024', transactionCount: 12, status: 'blocked' },
  { id: '4', name: 'Phạm Thị D', email: 'phamthid@gmail.com', phone: '(034)5551234', registeredAt: '01/04/2024', transactionCount: 45, status: 'active' },
  { id: '5', name: 'Hoàng Văn E', email: 'hoangvane@gmail.com', phone: '(035)7778888', registeredAt: '10/01/2024', transactionCount: 89, status: 'active' },
  { id: '6', name: 'Vũ Thị F', email: 'vuthif@gmail.com', phone: '(036)2223333', registeredAt: '25/12/2023', transactionCount: 5, status: 'blocked' },
]

export const mockShowroomsManage: ShowroomManage[] = [
  { id: '1', name: 'CarHub Motors', contact: '+84 912 345 678', location: 'Đà Nẵng', totalCars: 120, trustScore: 4.8, status: 'active' },
  { id: '2', name: 'Elite Auto Sales', contact: '+84 905 111 222', location: 'Hà Nội', totalCars: 85, trustScore: 4.5, status: 'active' },
  { id: '3', name: 'City Drive Dealer', contact: '+84 908 333 444', location: 'TP. Hồ Chí Minh', totalCars: 200, trustScore: 3.9, status: 'active' },
  { id: '4', name: 'SCUDN Hanoi Central', contact: '+84 901 555 666', location: 'Hà Nội', totalCars: 95, trustScore: 4.7, status: 'pending' },
  { id: '5', name: 'Premium Motors', contact: '+84 907 777 888', location: 'Đà Nẵng', totalCars: 60, trustScore: 0, status: 'pending' },
  { id: '6', name: 'Auto Premium', contact: '+84 909 999 000', location: 'Cần Thơ', totalCars: 45, trustScore: 3.2, status: 'blocked' },
]

export const mockTransactionsManage: TransactionManage[] = [
  { id: 'TXN-001', customer: 'Nguyen Van A', showroom: 'SCUDN Hanoi', depositAmount: 50_000_000, status: 'Escrow', date: '08/03/2025' },
  { id: 'TXN-002', customer: 'Tran Thi B', showroom: 'CarHub', depositAmount: 30_000_000, status: 'Completed', date: '07/03/2025' },
  { id: 'TXN-003', customer: 'Le Van C', showroom: 'Auto Premium', depositAmount: 80_000_000, status: 'Refunded', date: '06/03/2025' },
]

export const mockCommissions: CommissionRecord[] = [
  { saleId: 'S-001', showroom: 'SCUDN Hanoi', car: 'VinFast VF 8', salePrice: 900_000_000, commissionRate: 2, commissionAmount: 18_000_000 },
  { saleId: 'S-002', showroom: 'CarHub', car: 'Tesla Model 3', salePrice: 1_200_000_000, commissionRate: 2, commissionAmount: 24_000_000 },
]

export const mockSubscriptionPackages: SubscriptionPackage[] = [
  { id: '1', name: 'Featured Listing', price: 500_000, duration: '30 ngày', status: 'active' },
  { id: '2', name: 'Rescue Service', price: 200_000, duration: '1 lần', status: 'active' },
]

export const mockRescuePartners: RescuePartner[] = [
  { id: '1', garageName: 'Garage A', location: 'Hà Nội', phone: '0901111111', coverageArea: 'Nội thành Hà Nội', status: 'approved' },
  { id: '2', garageName: 'Garage B', location: 'TP.HCM', phone: '0902222222', coverageArea: 'Quận 1, 3, 5', status: 'pending' },
]

export const mockSystemLogs: SystemLog[] = [
  { id: '1', timestamp: '08/03/2025 10:30', user: 'Admin', role: 'Super Admin', action: 'Approve refund', targetModule: 'Transactions', status: 'success' },
  { id: '2', timestamp: '08/03/2025 09:15', user: 'Staff A', role: 'Staff', action: 'Update showroom', targetModule: 'Showrooms', status: 'success' },
]

export const mockRefundRequests: RefundRequest[] = [
  {
    id: '1',
    transactionId: 'TXN-001',
    customerName: 'Nguyen Van A',
    customerPhone: '0901234567',
    customerEmail: 'a@email.com',
    carName: 'VinFast VF 8',
    carVin: 'VF8-2024-001',
    showroomName: 'SCUDN Hanoi',
    showroomPhone: '1900xxxx',
    depositAmount: 50_000_000,
    inspectionSummary: '142-point inspection passed. Minor wear on tires.',
    damagePhotos: ['/photo1.jpg', '/photo2.jpg'],
    staffNotes: 'Đã xác minh với showroom. Khách hàng yêu cầu hoàn cọc do không hài lòng.',
    status: 'pending',
  },
]
