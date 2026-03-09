import type { Transaction } from '@/types'

export const mockTransactions: Transaction[] = [
  {
    id: 'TXN-001234',
    date: '26 Oct 2023',
    customerName: 'Nguyen Van A',
    showroom: 'SCUDN Hanoi Central',
    car: 'Tesla Model 3',
    amount: 1_200_000_000,
    currency: 'VND',
    status: 'Completed',
  },
  {
    id: 'TXN-001235',
    date: '26 Oct 2023',
    customerName: 'Tran Thi B',
    showroom: 'SCUDN Saigon',
    car: 'VinFast VF 8',
    amount: 900_000_000,
    currency: 'VND',
    status: 'Pending',
  },
  {
    id: 'TXN-001236',
    date: '25 Oct 2023',
    customerName: 'Le Van C',
    showroom: 'SCUDN Danang',
    car: 'Mercedes-Benz E-Class',
    amount: 2_500_000_000,
    currency: 'VND',
    status: 'Completed',
  },
]
