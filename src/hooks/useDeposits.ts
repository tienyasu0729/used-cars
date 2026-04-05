import { useQuery } from '@tanstack/react-query'
import { depositApi } from '@/services/depositApi'
import type { DepositListItem } from '@/services/deposit.service'
import type { Deposit } from '@/types'

function toDeposit(row: DepositListItem): Deposit {
  return {
    id: row.id,
    vehicleId: row.vehicleId,
    customerId: row.customerId,
    customerName: row.customerName,
    vehicleTitle: row.vehicleTitle,
    vehicleImageUrl: row.vehicleImageUrl,
    amount: row.amount,
    depositDate: row.depositDate,
    expiryDate: row.expiryDate,
    createdAt: row.createdAt,
    status: row.status as Deposit['status'],
    orderId: row.orderId,
    gatewayTxnRef: row.gatewayTxnRef,
  }
}

export function useDeposits(params?: { status?: string; page?: number; size?: number }) {
  return useQuery({
    queryKey: ['deposits', params?.status, params?.page, params?.size],
    queryFn: async () => {
      const { items, meta } = await depositApi.list({
        status: params?.status,
        page: params?.page ?? 0,
        size: params?.size ?? 100,
      })
      return { deposits: items.map(toDeposit), meta }
    },
    staleTime: 1000 * 60,
  })
}
