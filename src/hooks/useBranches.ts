import { useQuery } from '@tanstack/react-query'
import { mockBranches } from '@/mock'
import { branchApi } from '@/services/branchApi'
import { isMockMode } from '@/config/dataSource'

function ensureBranchArray(value: unknown): typeof mockBranches {
  if (Array.isArray(value)) return value
  if (value && typeof value === 'object' && 'data' in value && Array.isArray((value as { data: unknown }).data)) {
    return (value as { data: typeof mockBranches }).data
  }
  return mockBranches
}

async function fetchBranches(): Promise<typeof mockBranches> {
  if (isMockMode()) {
    return mockBranches
  }
  try {
    const res = await branchApi.getBranches()
    return ensureBranchArray(res.data)
  } catch {
    return mockBranches
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
        const res = await branchApi.getBranchById(id)
        return res.data
      } catch {
        return mockBranches.find((b) => b.id === id) ?? null
      }
    },
    enabled: !!id,
  })
}
