import { useState, useMemo } from 'react'
import { Search, Check, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTransfersAdmin } from '@/hooks/useTransfersAdmin'
import { useApproveTransfer, useRejectTransfer } from '@/hooks/useAdminMutations'
import { TransferApprovalModal } from '@/features/admin/components/TransferApprovalModal'
import { Button, Badge } from '@/components/ui'
import type { AdminTransfer } from '@/mock/mockAdminData'

type StatusFilter = 'pending' | 'approved' | 'rejected'

export function AdminTransfersPage() {
  const { data: transfers, isLoading } = useTransfersAdmin()
  const approveTransfer = useApproveTransfer()
  const rejectTransfer = useRejectTransfer()
  const [selectedTransfer, setSelectedTransfer] = useState<AdminTransfer | null>(null)
  const [modalMode, setModalMode] = useState<'confirm' | 'reject'>('confirm')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const perPage = 4
  const counts = useMemo(() => {
    const list = transfers ?? []
    return {
      pending: list.filter((t: AdminTransfer) => t.status === 'pending').length,
      approved: list.filter((t: AdminTransfer) => t.status === 'approved').length,
      rejected: list.filter((t: AdminTransfer) => t.status === 'rejected').length,
    }
  }, [transfers])

  const filtered = useMemo(() => {
    let list = transfers ?? []
    list = list.filter((t: AdminTransfer) => t.status === statusFilter)
    if (search.trim()) {
      const q = search.toLowerCase().trim()
      list = list.filter(
        (t: AdminTransfer) =>
          t.vehicleName.toLowerCase().includes(q) ||
          t.fromBranch.toLowerCase().includes(q) ||
          t.toBranch.toLowerCase().includes(q) ||
          t.requestedBy.toLowerCase().includes(q) ||
          (t.vin && t.vin.toLowerCase().includes(q))
      )
    }
    return list
  }, [transfers, statusFilter, search])

  const totalPages = Math.ceil(filtered.length / perPage) || 1
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  const statusVariant = (s: string) => {
    if (s === 'approved') return 'available'
    if (s === 'rejected') return 'sold'
    return 'reserved'
  }

  const statusLabel = (s: string) => {
    if (s === 'approved') return 'Đã duyệt'
    if (s === 'rejected') return 'Từ chối'
    return 'Chờ duyệt'
  }

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString('vi-VN')
    } catch {
      return d
    }
  }

  const handleApprove = async (id: string, note?: string) => {
    await approveTransfer.mutateAsync({ id, note })
    setSelectedTransfer(null)
  }

  const handleReject = async (id: string, reason: string) => {
    await rejectTransfer.mutateAsync({ id, reason })
    setSelectedTransfer(null)
  }

  const handleStatusChange = (status: StatusFilter) => {
    setStatusFilter(status)
    setPage(1)
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Duyệt Điều Chuyển Xe</h2>
          <p className="mt-1 text-sm text-slate-500">Xem xét và quản lý yêu cầu điều chuyển xe giữa các chi nhánh</p>
        </div>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Tìm kiếm yêu cầu điều chuyển..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-4 text-sm focus:border-[#1A3C6E] focus:ring-1 focus:ring-[#1A3C6E]"
        />
      </div>
      <div className="flex gap-2 border-b border-slate-200">
        {(['pending', 'approved', 'rejected'] as const).map((status) => (
          <button
            key={status}
            onClick={() => handleStatusChange(status)}
            className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              statusFilter === status
                ? 'border-[#1A3C6E] text-[#1A3C6E]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {status === 'pending' && 'Chờ Duyệt'}
            {status === 'approved' && 'Đã Duyệt'}
            {status === 'rejected' && 'Từ Chối'}
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusFilter === status ? 'bg-[#1A3C6E]/10 text-[#1A3C6E]' : 'bg-slate-100 text-slate-600'}`}>
              {status === 'pending' && counts.pending}
              {status === 'approved' && counts.approved}
              {status === 'rejected' && counts.rejected}
            </span>
          </button>
        ))}
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center text-slate-500">Đang tải...</div>
        ) : (
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Mã YC</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Xe</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Từ chi nhánh</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Đến chi nhánh</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Người yêu cầu</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Ngày</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Trạng thái</th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.map((t: AdminTransfer) => (
                <tr key={t.id} className="transition-colors hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-sm text-slate-600">TRF-{String(t.id.replace(/\D/g, '')).padStart(3, '0')}</td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-slate-900">{t.vehicleName}</p>
                      {t.vin && <p className="text-xs text-slate-500">VIN: {t.vin}</p>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{t.fromBranch}</td>
                  <td className="px-4 py-3 text-slate-600">{t.toBranch}</td>
                  <td className="px-4 py-3 text-slate-600">{t.requestedBy}</td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(t.createdAt)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant(t.status)}>{statusLabel(t.status)}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {t.status === 'pending' && (
                      <div className="flex justify-end gap-2">
                        <Button variant="primary" size="sm" onClick={() => { setSelectedTransfer(t); setModalMode('confirm') }}>
                          <Check className="mr-1 h-4 w-4" />
                          Duyệt
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => { setSelectedTransfer(t); setModalMode('reject') }}>
                          <X className="mr-1 h-4 w-4" />
                          Từ chối
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!isLoading && filtered.length === 0 && (
          <div className="py-12 text-center text-slate-500">Không có yêu cầu điều chuyển</div>
        )}
      </div>
      {!isLoading && filtered.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Hiển thị {(page - 1) * perPage + 1} - {Math.min(page * perPage, filtered.length)} trong {filtered.length} mục
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`h-9 min-w-[36px] rounded-lg px-3 text-sm font-medium ${page === p ? 'bg-[#1A3C6E] text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
      <TransferApprovalModal
        transfer={selectedTransfer}
        isOpen={!!selectedTransfer}
        onClose={() => setSelectedTransfer(null)}
        onApprove={handleApprove}
        onReject={handleReject}
        initialMode={modalMode}
      />
    </div>
  )
}
