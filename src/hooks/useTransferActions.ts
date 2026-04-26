import { useMutation, useQueryClient } from '@tanstack/react-query'
import { transferService } from '@/services/transfer.service'
import { useToastStore } from '@/store/toastStore'
import type { ApiErrorResponse } from '@/types/auth.types'

export function useTransferActions() {
  const qc = useQueryClient()
  const toast = useToastStore()

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['manager-transfers'] })
    qc.invalidateQueries({ queryKey: ['admin-transfers'] })
    qc.invalidateQueries({ queryKey: ['transfer-detail'] })
    qc.invalidateQueries({ queryKey: ['manager-incoming-transfers'] })
  }

  const approve = useMutation({
    mutationFn: ({ id, note }: { id: number; note: string }) =>
      transferService.approveTransfer(id, { note }),
    onSuccess: () => {
      toast.addToast('success', 'Đã phê duyệt điều chuyển.')
      invalidate()
    },
    onError: (e: unknown) => {
      const err = e as ApiErrorResponse
      toast.addToast('error', err.message || 'Không thể phê duyệt.')
    },
  })

  const reject = useMutation({
    mutationFn: ({ id, note }: { id: number; note: string }) =>
      transferService.rejectTransfer(id, { note }),
    onSuccess: () => {
      toast.addToast('success', 'Đã từ chối yêu cầu.')
      invalidate()
    },
    onError: (e: unknown) => {
      const err = e as ApiErrorResponse
      toast.addToast('error', err.message || 'Không thể từ chối.')
    },
  })

  const complete = useMutation({
    mutationFn: ({ id, note }: { id: number; note?: string }) =>
      transferService.completeTransfer(id, note ? { note } : {}),
    onSuccess: () => {
      toast.addToast('success', 'Đã xác nhận nhận xe.')
      invalidate()
    },
    onError: (e: unknown) => {
      const err = e as ApiErrorResponse
      toast.addToast('error', err.message || 'Không thể hoàn tất.')
    },
  })

  return {
    isActing: approve.isPending || reject.isPending || complete.isPending,
    approve: approve.mutateAsync,
    reject: reject.mutateAsync,
    complete: complete.mutateAsync,
  }
}
