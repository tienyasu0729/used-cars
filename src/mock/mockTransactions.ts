import type { Transaction } from '@/types'

export const mockTransactions: Transaction[] = [
  { id: 'tx1', date: '2025-03-15T14:30:00', description: 'Nạp vào ví điện tử từ Ngân hàng Techcombank', type: 'Deposit', amount: 100000000, status: 'Completed' },
  { id: 'tx2', date: '2025-03-12T09:15:00', description: 'Thanh toán Toyota Vios 2022 (VIN: 45A-123.45)', type: 'Purchase', amount: -450000000, status: 'Completed' },
  { id: 'tx3', date: '2025-03-10T16:45:00', description: 'Hoàn phí đặt cọc Mazda 3 (Giao dịch hủy)', type: 'Refund', amount: 10000000, status: 'Completed' },
  { id: 'tx4', date: '2025-03-05T11:20:00', description: 'Nạp tiền qua VNPay QR', type: 'Deposit', amount: 50000000, status: 'Completed' },
  { id: 'tx5', date: '2025-03-01T18:05:00', description: 'Thanh toán Hyundai Accent AT', type: 'Purchase', amount: -200000000, status: 'Pending' },
  { id: 'tx6', date: '2025-02-28T10:00:00', description: 'Đặt cọc xe Ford Ranger', type: 'Deposit', amount: -80000000, status: 'Completed' },
  { id: 'tx7', date: '2025-02-15T14:00:00', description: 'Thanh toán mua xe Toyota Camry', type: 'Purchase', amount: -750000000, status: 'Completed' },
]
