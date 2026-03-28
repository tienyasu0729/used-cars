import { useQuery } from '@tanstack/react-query'
import { mockBranches } from '@/mock'
import { branchService } from '@/services/branch.service'
import { isMockMode } from '@/config/dataSource'
import type { Branch } from '@/types/branch'

async function fetchBranches(): Promise<Branch[]> {
  if (isMockMode()) {
    return mockBranches
  }
  try {
    return await branchService.getBranches()
  } catch (e) {
    console.error('[useBranches] Lỗi tải chi nhánh từ API:', e)
    return []
  }
}

export function useBranches() {
  return useQuery({
    queryKey: ['branches', isMockMode()],
    queryFn: fetchBranches,
    staleTime: isMockMode() ? Infinity : 1000 * 60 * 5,
  })
}

export function useBranch(id: string | undefined) {
  return useQuery({
    queryKey: ['branch', id, isMockMode()],
    queryFn: async () => {
      if (!id) return null
      if (isMockMode()) {
        return mockBranches.find((b) => b.id === id) ?? null
      }
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
