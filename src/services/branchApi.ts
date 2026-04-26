import type { Branch } from '@/types'
import { api } from './apiClient'

export const branchApi = {
  getBranches: () => api.get<Branch[]>('/branches'),
  getBranchById: (id: string) => api.get<Branch>(`/branches/${id}`),
}
