import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getBookingSlots,
  updateBookingSlots,
  type UpdateBookingSlotsPayload,
} from '@/services/managerSettings.service'
import { useAuthStore } from '@/store/authStore'

function canLoad(user: ReturnType<typeof useAuthStore.getState>['user'], branchId: number | null): boolean {
  if (!user) return false
  if (user.role !== 'Admin' && user.role !== 'BranchManager') return false
  return branchId != null && branchId > 0
}

/**
 * @param resolvedBranchId Chi nhánh đã resolve (Admin: đã chọn / mặc định).
 * @param activeOnly GET chỉ slot đang bật (theo API).
 */
export function useManagerBookingSlots(resolvedBranchId: number | null, activeOnly: boolean) {
  const user = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()
  const adminParam = user?.role === 'Admin' ? resolvedBranchId ?? undefined : undefined

  const query = useQuery({
    queryKey: ['manager-booking-slots', user?.role, resolvedBranchId, activeOnly],
    queryFn: () => getBookingSlots(adminParam, activeOnly),
    enabled: canLoad(user ?? null, resolvedBranchId),
    staleTime: 15_000,
  })

  const mutation = useMutation({
    mutationFn: (payload: UpdateBookingSlotsPayload) => updateBookingSlots(payload, adminParam),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['manager-booking-slots'] })
    },
  })

  return {
    ...query,
    saveSlots: mutation.mutateAsync,
    isSavingSlots: mutation.isPending,
    saveSlotsError: mutation.error,
  }
}
