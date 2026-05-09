import { useQuery } from '@tanstack/react-query'
import { fetchManagerReports } from '@/services/managerReports.service'
import type { BranchReportData } from '@/types/branchReports.types'

export function useBranchReports(branchId?: number | null) {
  return useQuery<BranchReportData>({
    queryKey: ['branch-reports', branchId ?? 'all'],
    queryFn: () => fetchManagerReports(branchId),
    staleTime: 60_000,
  })
}
