import { useQuery } from '@tanstack/react-query'
import { mockManagerTransfers, mockIncomingTransfers, type ManagerTransfer } from '@/mock/mockManagerData'
import { isMockMode } from '@/config/dataSource'
import { useAuthStore } from '@/store/authStore'
import { transferService } from '@/services/transfer.service'
import type { TransferRequest, TransferStatus } from '@/types/transfer.types'

function parseMockBranchId(s: string): number {
  const n = parseInt(String(s).replace(/\D/g, ''), 10)
  return Number.isFinite(n) ? n : 1
}

function userNumericBranchToMockId(b: number | undefined): string {
  if (b === 2) return 'branch2'
  if (b === 3) return 'branch3'
  if (b === 4) return 'branch4'
  return 'branch1'
}

function managerTransferToApi(m: ManagerTransfer, idx: number): TransferRequest {
  const st = m.status === 'pending' ? 'Pending' : m.status === 'approved' ? 'Approved' : 'Rejected'
  return {
    id: idx + 10000,
    vehicleId: parseInt(m.vehicleId, 10) || idx + 1,
    vehicleTitle: m.vehicleName,
    vehicleListingId: m.vin ?? `MOCK-${m.id}`,
    fromBranchId: parseMockBranchId(m.fromBranchId),
    fromBranchName: m.fromBranchName,
    toBranchId: parseMockBranchId(m.toBranchId),
    toBranchName: m.toBranchName,
    requestedBy: 1,
    requestedByName: 'Mock Manager',
    status: st as TransferStatus,
    reason: null,
    createdAt: m.createdAt,
    updatedAt: m.createdAt,
    approvalHistory: [],
  }
}

export interface ManagerTransferListFilters {
  /** Pending | Approved | Rejected | Completed | undefined = tất cả */
  status?: TransferStatus | 'all'
  page: number
  size?: number
}

export function useTransfers(filters: ManagerTransferListFilters) {
  const { user } = useAuthStore()
  const branchKey = user?.branchId ?? 'mock-branch1'

  const apiStatus =
    filters.status && filters.status !== 'all' ? filters.status : undefined

  return useQuery({
    queryKey: ['manager-transfers', branchKey, apiStatus, filters.page, filters.size ?? 10, isMockMode()],
    queryFn: async (): Promise<{ items: TransferRequest[]; meta: { page: number; size: number; totalElements: number; totalPages: number } }> => {
      if (isMockMode()) {
        const bid = userNumericBranchToMockId(user?.branchId)
        const outgoing = mockManagerTransfers.filter((t) => t.fromBranchId === bid)
        const incoming = mockIncomingTransfers.filter((t) => t.toBranchId === bid)
        const merged = [...outgoing, ...incoming]
        let rows = merged.map((m, i) => managerTransferToApi(m, i))
        if (apiStatus) {
          rows = rows.filter((r) => r.status === apiStatus)
        }
        const size = filters.size ?? 10
        const page = filters.page
        const start = page * size
        const slice = rows.slice(start, start + size)
        return {
          items: slice,
          meta: {
            page,
            size,
            totalElements: rows.length,
            totalPages: Math.max(1, Math.ceil(rows.length / size)),
          },
        }
      }
      return transferService.getTransfers({
        status: apiStatus,
        page: filters.page,
        size: filters.size ?? 10,
      })
    },
    staleTime: isMockMode() ? Infinity : 30_000,
  })
}
