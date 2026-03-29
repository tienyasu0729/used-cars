import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { vehicleService } from '@/services/vehicle.service'
import { branchService } from '@/services/branch.service'
import { transferService } from '@/services/transfer.service'
import { useToastStore } from '@/store/toastStore'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui'
import type { ApiErrorResponse } from '@/types/auth.types'

interface TransferRequestFormProps {
  onCreated?: () => void
}

export function TransferRequestForm({ onCreated }: TransferRequestFormProps) {
  const toast = useToastStore()
  const { user } = useAuthStore()
  const myBranchId = user?.branchId

  const { data: vehiclesRes } = useQuery({
    queryKey: ['vehicles-for-transfer', myBranchId],
    queryFn: () => vehicleService.getVehicles({ page: 0, size: 200 }),
    enabled: myBranchId != null,
  })

  const { data: branches = [] } = useQuery({
    queryKey: ['branches-transfer-form'],
    queryFn: () => branchService.getBranches(),
  })

  const availableVehicles = useMemo(() => {
    const items = vehiclesRes?.items ?? []
    if (myBranchId == null) return []
    return items.filter((v) => v.branch_id === myBranchId && v.status === 'Available')
  }, [vehiclesRes, myBranchId])

  const [vehicleId, setVehicleId] = useState('')
  const [toBranchId, setToBranchId] = useState('')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const otherBranches = branches.filter((b) => String(b.id) !== String(myBranchId))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!vehicleId || !toBranchId) {
      toast.addToast('error', 'Chọn xe và chi nhánh đích.')
      return
    }
    setSubmitting(true)
    try {
      await transferService.createTransfer({
        vehicleId: Number(vehicleId),
        toBranchId: Number(toBranchId),
        ...(reason.trim() ? { reason: reason.trim() } : {}),
      })
      toast.addToast('success', 'Đã tạo yêu cầu điều chuyển.')
      setVehicleId('')
      setToBranchId('')
      setReason('')
      onCreated?.()
    } catch (err) {
      const e = err as ApiErrorResponse
      toast.addToast('error', e.message || 'Không tạo được yêu cầu.')
    } finally {
      setSubmitting(false)
    }
  }

  if (myBranchId == null) {
    return (
      <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Tài khoản chưa gắn chi nhánh (branchId). Hệ thống cần StaffAssignments hoặc manager chi nhánh trên backend để tạo
        điều chuyển.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">Tạo yêu cầu điều chuyển</h2>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Xe (Available tại chi nhánh bạn)</label>
        <select
          value={vehicleId}
          onChange={(e) => setVehicleId(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          required
        >
          <option value="">— Chọn xe —</option>
          {availableVehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.title} ({v.listing_id})
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Chi nhánh đích</label>
        <select
          value={toBranchId}
          onChange={(e) => setToBranchId(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          required
        >
          <option value="">— Chọn chi nhánh —</option>
          {otherBranches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Lý do (tuỳ chọn)</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="Có thể để trống"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={submitting || availableVehicles.length === 0}>
          {submitting ? 'Đang gửi…' : 'Gửi yêu cầu'}
        </Button>
      </div>
    </form>
  )
}
