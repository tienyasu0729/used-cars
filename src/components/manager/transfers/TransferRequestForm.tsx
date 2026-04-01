import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
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

/**
 * Form tạo yêu cầu điều chuyển xe (PULL: kéo xe từ chi nhánh khác về chi nhánh mình).
 *
 * Hỗ trợ 2 cách vào:
 * 1. URL param ?vehicleId=123 → tự điền xe, user chỉ cần gõ lý do + submit.
 * 2. Không có param → user chọn xe từ dropdown (xe Available ngoài chi nhánh mình).
 */
export function TransferRequestForm({ onCreated }: TransferRequestFormProps) {
  const toast = useToastStore()
  const { user } = useAuthStore()
  const myBranchId = user?.branchId
  const [searchParams, setSearchParams] = useSearchParams()

  // Lấy vehicleId từ URL param (nếu chuyển từ tab "Tra cứu mạng lưới")
  const urlVehicleId = searchParams.get('vehicleId')

  // Danh sách xe toàn hệ thống (scope=NETWORK) để chọn xe cần điều chuyển
  const { data: vehiclesRes } = useQuery({
    queryKey: ['vehicles-for-transfer-network'],
    queryFn: () => vehicleService.getManagerVehicles({ page: 0, size: 200, scope: 'NETWORK' }),
    enabled: myBranchId != null,
  })

  const { data: branches = [] } = useQuery({
    queryKey: ['branches-transfer-form'],
    queryFn: () => branchService.getBranches(),
  })

  // Chỉ lấy xe Available thuộc chi nhánh KHÁC (PULL: kéo xe nơi khác về nhà mình)
  const availableVehicles = useMemo(() => {
    const items = vehiclesRes?.items ?? []
    if (myBranchId == null) return []
    return items.filter((v) => v.branch_id !== myBranchId && v.status === 'Available')
  }, [vehiclesRes, myBranchId])

  const [vehicleId, setVehicleId] = useState('')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Auto-fill vehicleId từ URL param
  useEffect(() => {
    if (urlVehicleId) {
      setVehicleId(urlVehicleId)
    }
  }, [urlVehicleId])

  // Tìm thông tin xe đã chọn để hiển thị preview
  const selectedVehicle = useMemo(() => {
    if (!vehicleId) return null
    return availableVehicles.find((v) => String(v.id) === String(vehicleId)) ?? null
  }, [vehicleId, availableVehicles])

  // Tìm tên chi nhánh đang quản lý
  const myBranchName = useMemo(() => {
    if (myBranchId == null) return ''
    return branches.find((b) => String(b.id) === String(myBranchId))?.name ?? `Chi nhánh #${myBranchId}`
  }, [branches, myBranchId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!vehicleId || myBranchId == null) {
      toast.addToast('error', 'Vui lòng chọn xe cần điều chuyển.')
      return
    }
    setSubmitting(true)
    try {
      await transferService.createTransfer({
        vehicleId: Number(vehicleId),
        toBranchId: myBranchId,
        ...(reason.trim() ? { reason: reason.trim() } : {}),
      })
      toast.addToast('success', 'Đã tạo yêu cầu điều chuyển xe về chi nhánh của bạn.')
      setVehicleId('')
      setReason('')
      // Xóa vehicleId khỏi URL sau khi tạo thành công
      if (urlVehicleId) {
        searchParams.delete('vehicleId')
        setSearchParams(searchParams, { replace: true })
      }
      onCreated?.()
    } catch (err) {
      const error = err as ApiErrorResponse
      toast.addToast('error', error.message || 'Không tạo được yêu cầu.')
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
      <p className="text-sm text-slate-500">
        Chọn xe từ chi nhánh khác để yêu cầu chuyển về <strong>{myBranchName}</strong>.
        Quản lý chi nhánh nơi có xe sẽ duyệt yêu cầu này.
      </p>

      {/* Xe cần điều chuyển */}
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Xe cần điều chuyển (từ chi nhánh khác)</label>
        <select
          value={vehicleId}
          onChange={(e) => setVehicleId(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          required
          disabled={Boolean(urlVehicleId && selectedVehicle)}
        >
          <option value="">— Chọn xe —</option>
          {availableVehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.title || 'Xe'} — {v.branch_name ?? '?'} ({v.listing_id})
            </option>
          ))}
        </select>
      </div>

      {/* Preview xe đã chọn */}
      {selectedVehicle && (
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm">
          <p className="font-semibold text-slate-800">{selectedVehicle.title || 'Xe'}</p>
          <p className="text-slate-500">
            Mã tin: {selectedVehicle.listing_id} • Từ: <strong>{selectedVehicle.branch_name ?? '?'}</strong> → Về: <strong>{myBranchName}</strong>
          </p>
        </div>
      )}

      {/* Chi nhánh đích (hiển thị read-only = chi nhánh mình) */}
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Chi nhánh đích (nơi nhận xe)</label>
        <input
          type="text"
          value={myBranchName}
          readOnly
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600"
        />
      </div>

      {/* Lý do */}
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Lý do (tùy chọn)</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="Ví dụ: Khách hàng tại chi nhánh mình đang cần mẫu xe này..."
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={submitting || !vehicleId}>
          {submitting ? 'Đang gửi…' : 'Gửi yêu cầu điều chuyển'}
        </Button>
      </div>
    </form>
  )
}
