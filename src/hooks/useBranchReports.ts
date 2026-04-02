import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import type { BranchReportData } from '@/types/branchReports.types'
import { EMPTY_BRANCH_REPORTS } from '@/types/branchReports.types'

/**
 * Báo cáo chi nhánh (biểu đồ Manager dashboard / reports).
 * Chưa có GET API → luôn trả `EMPTY_BRANCH_REPORTS`; không fallback branchId giả, không mock số liệu.
 * UI: hiển thị “Chưa có dữ liệu” trên Manager dashboard / reports.
 */
export function useBranchReports() {
  const { user } = useAuthStore()
  const branchKey =
    typeof user?.branchId === 'number' && user.branchId > 0 ? user.branchId : 'none'

  return useQuery<BranchReportData>({
    queryKey: ['branch-reports', branchKey],
    queryFn: async () => EMPTY_BRANCH_REPORTS,
    staleTime: Infinity,
  })
}
