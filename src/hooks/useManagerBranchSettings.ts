import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getBranchSettings,
  updateBranchSettings,
  type UpdateBranchSettingsPayload,
} from '@/services/managerSettings.service'
import { useAuthStore } from '@/store/authStore'

function canLoadSettings(user: ReturnType<typeof useAuthStore.getState>['user'], branchId: number | null): boolean {
  if (!user) return false
  if (user.role !== 'Admin' && user.role !== 'BranchManager') return false
  return branchId != null && branchId > 0
}

/**
 * @param resolvedBranchId Chi nhánh đã resolve (Admin: đã chọn hoặc mặc định; Manager: từ profile).
 */
export function useManagerBranchSettings(resolvedBranchId: number | null) {
  const user = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()
  const adminParam = user?.role === 'Admin' ? resolvedBranchId ?? undefined : undefined

  const query = useQuery({
    queryKey: ['manager-branch-settings', user?.role, resolvedBranchId],
    queryFn: () => getBranchSettings(adminParam),
    enabled: canLoadSettings(user ?? null, resolvedBranchId),
    staleTime: 30_000,
  })

  const mutation = useMutation({
    mutationFn: (payload: UpdateBranchSettingsPayload) =>
      updateBranchSettings(payload, adminParam),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['manager-branch-settings'] }),
        queryClient.invalidateQueries({ queryKey: ['branches'] }),
        queryClient.invalidateQueries({ queryKey: ['branch'] }),
      ])
    },
  })

  return { ...query, saveSettings: mutation.mutateAsync, isSaving: mutation.isPending, saveError: mutation.error }
}
