import { useQuery } from '@tanstack/react-query'
import { branchService } from '@/services/branch.service'
import type { BranchTeamMemberDto } from '@/services/branch.service'
import type { Branch } from '@/types/branch'

/**
 * Luôn GET /branches — không dùng mock theo VITE_DATA_SOURCE (tránh lệch DB).
 */
async function fetchBranches(): Promise<Branch[]> {
  try {
    return await branchService.getBranches()
  } catch (e) {
    console.error('[useBranches] Lỗi tải chi nhánh từ API:', e)
    return []
  }
}

export function useBranches() {
  return useQuery({
    queryKey: ['branches'],
    queryFn: fetchBranches,
    staleTime: 1000 * 60 * 5,
  })
}

export function useBranch(id: string | undefined) {
  return useQuery({
    queryKey: ['branch', id],
    queryFn: async () => {
      if (!id) return null
      try {
        return await branchService.getBranchById(id)
      } catch (e) {
        console.error('[useBranch] Lỗi tải chi nhánh:', e)
        return null
      }
    },
    enabled: !!id,
  })
}

export function useBranchTeam(id: string | undefined) {
  const numeric = id ? parseInt(id, 10) : NaN
  const enabled = !!id && Number.isFinite(numeric)
  return useQuery({
    queryKey: ['branch', id, 'team'],
    queryFn: async (): Promise<BranchTeamMemberDto[]> => {
      try {
        return await branchService.getBranchTeam(numeric)
      } catch (e) {
        console.error('[useBranchTeam] Lỗi tải đội ngũ:', e)
        return []
      }
    },
    enabled,
    staleTime: 1000 * 60 * 2,
  })
}
