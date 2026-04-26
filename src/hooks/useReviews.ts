import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reviewService } from '@/services/review.service'
import type { SubmitReviewRequest } from '@/types/review.types'

export function useVehicleReviews(vehicleId: number | undefined, params: { page?: number; size?: number } = {}) {
  return useQuery({
    queryKey: ['reviews', vehicleId, params],
    queryFn: () => reviewService.getApprovedReviews(vehicleId!, params),
    enabled: !!vehicleId,
    staleTime: 30_000,
  })
}

export function useReviewSummary(vehicleId: number | undefined) {
  return useQuery({
    queryKey: ['reviews', 'summary', vehicleId],
    queryFn: () => reviewService.getReviewSummary(vehicleId!),
    enabled: !!vehicleId,
    staleTime: 30_000,
  })
}

export function useCanReview(vehicleId: number | undefined, isLoggedIn: boolean) {
  return useQuery({
    queryKey: ['reviews', 'can-review', vehicleId],
    queryFn: () => reviewService.canReview(vehicleId!),
    enabled: !!vehicleId && isLoggedIn,
    staleTime: 60_000,
  })
}

export function useSubmitReview(vehicleId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: SubmitReviewRequest) => reviewService.submitReview(vehicleId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews', vehicleId] })
      qc.invalidateQueries({ queryKey: ['reviews', 'summary', vehicleId] })
      qc.invalidateQueries({ queryKey: ['reviews', 'can-review', vehicleId] })
    },
  })
}

export function useAdminReviews(params: { vehicleId?: number; status?: string; page?: number; size?: number }) {
  return useQuery({
    queryKey: ['admin', 'reviews', params],
    queryFn: () => reviewService.getAdminReviews(params),
    staleTime: 15_000,
  })
}

export function useModerateReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, action }: { id: number; action: 'approve' | 'reject' | 'hide' }) => {
      if (action === 'approve') return reviewService.approveReview(id)
      if (action === 'reject') return reviewService.rejectReview(id)
      return reviewService.hideReview(id)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'reviews'] })
      qc.invalidateQueries({ queryKey: ['reviews'] })
    },
  })
}

export function useDeleteReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => reviewService.deleteReview(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'reviews'] })
      qc.invalidateQueries({ queryKey: ['reviews'] })
    },
  })
}
