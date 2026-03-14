import { useState } from 'react'
import { Plus, Filter, Download, Building2, MapPin } from 'lucide-react'
import { mockTransferRequests, type MockTransferRequest } from '@/mock'
import { mockBranches } from '@/mock'
import { mockVehicles } from '@/mock'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'
import { formatDate } from '@/utils/format'
import { Badge, Button } from '@/components/ui'

const PAGE_SIZE = 4

function getBranchName(id: string) {
  return mockBranches.find((b) => b.id === id)?.name ?? id
}

function getStatusBadge(status: string) {
  if (status === 'pending') return <Badge variant="pending">Chờ Duyệt</Badge>
  if (status === 'approved') return <Badge variant="available">Đã Duyệt</Badge>
  return <Badge variant="danger">Từ Chối</Badge>
}

export function StaffTransferRequestsPage() {
  const [page, setPage] = useState(1)
  const [transfers, setTransfers] = useState<MockTransferRequest[]>(mockTransferRequests)
  const [form, setForm] = useState({ vehicleId: '', toBranchId: '', reason: '', notes: '' })
  const { user } = useAuthStore()
  const toast = useToastStore()

  const branchId = user?.branchId ?? 'branch1'
  const branchVehicles = mockVehicles.filter((v) => v.branchId === branchId && v.status === 'Available')
  const otherBranches = mockBranches.filter((b) => b.id !== branchId)

  const paginated = transfers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const totalPages = Math.ceil(transfers.length / PAGE_SIZE) || 1
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.vehicleId || !form.toBranchId) {
      toast.addToast('error', 'Vui lòng chọn xe và chi nhánh đích')
      return
    }
    const v = branchVehicles.find((x) => x.id === form.vehicleId)
    const newTransfer: MockTransferRequest = {
      id: `t${Date.now()}`,
      vehicleId: form.vehicleId,
      vehicleCode: `VIN-${v?.year ?? ''}-${(v?.model ?? '').slice(0, 2).toUpperCase()}`,
      vehicleName: v ? `${v.brand} ${v.model} ${v.year}` : '',
      fromBranchId: branchId,
      toBranchId: form.toBranchId,
      requestedBy: user?.id ?? 'u2',
      status: 'pending',
      createdAt: new Date().toISOString(),
      reason: form.reason,
      notes: form.notes,
    }
    setTransfers((prev) => [newTransfer, ...prev])
    setForm({ vehicleId: '', toBranchId: '', reason: '', notes: '' })
    toast.addToast('success', 'Đã gửi yêu cầu điều chuyển')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý Yêu cầu Điều chuyển</h1>
          <p className="text-sm text-slate-500">Theo dõi và tạo mới các yêu cầu điều chuyển xe giữa các chi nhánh trong hệ thống.</p>
        </div>
        <Button onClick={() => document.getElementById('transfer-form')?.scrollIntoView({ behavior: 'smooth' })}>
          <Plus className="h-4 w-4" />
          Tạo Yêu Cầu Mới
        </Button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Danh sách yêu cầu của tôi</h2>
          <div className="flex gap-2">
            <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" title="Lọc">
              <Filter className="h-5 w-5" />
            </button>
            <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" title="Tải xuống">
              <Download className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Mã xe & Tên</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Từ chi nhánh</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Đến chi nhánh</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Ngày yêu cầu</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paginated.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <p className="font-mono text-xs text-slate-500">{t.vehicleCode}</p>
                    <p className="font-semibold text-slate-900">{t.vehicleName}</p>
                  </td>
                  <td className="px-6 py-4 text-sm">{getBranchName(t.fromBranchId)}</td>
                  <td className="px-6 py-4 text-sm">{getBranchName(t.toBranchId)}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{formatDate(t.createdAt)}</td>
                  <td className="px-6 py-4">{getStatusBadge(t.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-4 sm:flex-row">
          <p className="text-sm text-slate-500">Hiển thị {paginated.length} trên {transfers.length} yêu cầu</p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm disabled:opacity-50">‹</button>
            {Array.from({ length: Math.min(3, totalPages) }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)} className={`min-w-[32px] rounded-lg px-3 py-1.5 text-sm font-medium ${page === p ? 'bg-[#1A3C6E] text-white' : 'border border-slate-200 hover:bg-slate-50'}`}>{p}</button>
            ))}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm disabled:opacity-50">›</button>
          </div>
        </div>
      </div>

      <div id="transfer-form" className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Plus className="h-5 w-5 text-[#1A3C6E]" />
            Tạo Phiếu Yêu Cầu Điều Chuyển
          </h2>
          <span className="text-xs text-slate-500">MẪU {new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')}</span>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Chọn Xe Điều Chuyển</label>
            <div className="relative">
              <select
                value={form.vehicleId}
                onChange={(e) => setForm((f) => ({ ...f, vehicleId: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 py-2 pl-3 pr-10 text-sm"
              >
                <option value="">-- Chọn xe từ kho hệ thống --</option>
                {branchVehicles.map((v) => (
                  <option key={v.id} value={v.id}>{v.brand} {v.model} {v.year}</option>
                ))}
              </select>
              <Building2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Chi Nhánh Đích</label>
            <div className="relative">
              <select
                value={form.toBranchId}
                onChange={(e) => setForm((f) => ({ ...f, toBranchId: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 py-2 pl-3 pr-10 text-sm"
              >
                <option value="">-- Chọn chi nhánh nhận --</option>
                {otherBranches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
              <MapPin className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Lý Do Điều Chuyển</label>
            <input
              type="text"
              value={form.reason}
              onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
              placeholder="Nhập lý do (VD: Khách hàng tại chi nhánh đích muốn xem xe)"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Ghi Chú Thêm</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Thông tin bổ sung về tình trạng xe hoặc yêu cầu đặc biệt..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setForm({ vehicleId: '', toBranchId: '', reason: '', notes: '' })} className="text-sm text-slate-500 hover:text-slate-700">
              Hủy bỏ
            </button>
            <Button type="submit">Gửi Yêu Cầu</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
