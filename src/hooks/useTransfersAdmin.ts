import { useQuery } from '@tanstack/react-query'
import { mockAdminTransfers, type AdminTransfer } from '@/mock/mockAdminData'
import { isMockMode } from '@/config/dataSource'
import { transferService } from '@/services/transfer.service'
import type { TransferRequest, TransferStatus } from '@/types/transfer.types'

function adminMockToTransfer(a: AdminTransfer, idx: number): TransferRequest {
  const st =
    a.status === 'pending'
      ? 'Pending'
      : a.status === 'approved'
        ? 'Approved'
        : a.status === 'rejected'
          ? 'Rejected'
          : 'Completed'
  return {
    id: idx + 1,
    vehicleId: idx + 1,
    vehicleTitle: a.vehicleName,
    vehicleListingId: a.vin ?? 'ADM-MOCK',
    fromBranchId: 1,
    fromBranchName: a.fromBranch,
    toBranchId: 2,
    toBranchName: a.toBranch,
    requestedBy: 1,
    requestedByName: a.requestedBy,
    status: st as TransferStatus,
    reason: null,
    createdAt: a.createdAt,
    updatedAt: a.createdAt,
    approvalHistory: [],
  }
}

export function useTransfersAdmin(params: { page?: number; size?: number; status?: TransferStatus | 'all' }) {
  const page = params.page ?? 0
  const size = params.size ?? 50
  const status = params.status

  return useQuery({
    queryKey: ['admin-transfers', page, size, status, isMockMode()],
    queryFn: async () => {
      if (isMockMode()) {
        let rows = mockAdminTransfers.map((a, i) => adminMockToTransfer(a, i))
        if (status && status !== 'all') {
          rows = rows.filter((r) => r.status === status)
        }
        return { items: rows, meta: { page: 0, size: rows.length, totalElements: rows.length, totalPages: 1 } }
      }
      return transferService.getTransfers({
        page,
        size,
        status: status && status !== 'all' ? status : undefined,
      })
    },
    staleTime: isMockMode() ? Infinity : 30_000,
  })
}
