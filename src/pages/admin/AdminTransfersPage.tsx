import { useState, useMemo, useEffect } from 'react'
import { Search } from 'lucide-react'
import { useTransfersAdmin } from '@/hooks/useTransfersAdmin'
import { TransferStatusBadge } from '@/components/manager/transfers/TransferStatusBadge'
import { Pagination } from '@/components/ui'
import type { TransferStatus } from '@/types/transfer.types'

type StatusTab = 'pending' | 'approved' | 'completed' | 'rejected'

const TAB_TO_API: Record<StatusTab, TransferStatus> = {
  pending: 'Pending',
  approved: 'Approved',
  completed: 'Completed',
  rejected: 'Rejected',
}

export function AdminTransfersPage() {
  const [statusFilter, setStatusFilter] = useState<StatusTab>('pending')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const perPage = 10

  const { data, isLoading } = useTransfersAdmin({
    page,
    size: perPage,
    status: TAB_TO_API[statusFilter],
  })

  const items = data?.items ?? []
  const meta = data?.meta
  const totalPages = meta?.totalPages ?? 1

  const filtered = useMemo(() => {
    if (!search.trim()) return items
    const q = search.toLowerCase().trim()
    return items.filter(
      (t) =>
        t.vehicleTitle.toLowerCase().includes(q) ||
        t.fromBranchName.toLowerCase().includes(q) ||
        t.toBranchName.toLowerCase().includes(q) ||
        t.requestedByName.toLowerCase().includes(q) ||
        t.vehicleListingId.toLowerCase().includes(q)
    )
  }, [items, search])

  const { data: allForCountsData } = useTransfersAdmin({ page: 0, size: 500, status: 'all' })
  const [counts, setCounts] = useState({ pending: 0, approved: 0, completed: 0, rejected: 0 })
  useEffect(() => {
    const list = allForCountsData?.items ?? []
    setCounts({
      pending: list.filter((t) => t.status === 'Pending').length,
      approved: list.filter((t) => t.status === 'Approved').length,
      completed: list.filter((t) => t.status === 'Completed').length,
      rejected: list.filter((t) => t.status === 'Rejected').length,
    })
  }, [allForCountsData])

  const handleStatusChange = (status: StatusTab) => {
    setStatusFilter(status)
    setPage(0)
  }

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString('vi-VN')
    } catch {
      return d
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Điều chuyển xe</h2>
        <p className="mt-1 text-sm text-slate-500">
          Theo dõi các yêu cầu điều chuyển xe giữa các chi nhánh trên toàn hệ thống. Việc phê duyệt/từ chối do quản lý chi nhánh nguồn thực hiện.
        </p>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Tìm theo xe, chi nhánh, người tạo…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-4 text-sm focus:border-[#1A3C6E] focus:ring-1 focus:ring-[#1A3C6E]"
        />
      </div>
      <div className="flex flex-wrap gap-2 border-b border-slate-200">
        {(
          [
            ['pending', 'Chờ duyệt', counts.pending],
            ['approved', 'Đã duyệt', counts.approved],
            ['completed', 'Hoàn thành', counts.completed],
            ['rejected', 'Từ chối', counts.rejected],
          ] as const
        ).map(([key, label, c]) => (
          <button
            key={key}
            type="button"
            onClick={() => handleStatusChange(key)}
            className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium ${
              statusFilter === key ? 'border-[#1A3C6E] text-[#1A3C6E]' : 'border-transparent text-slate-500'
            }`}
          >
            {label}
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{c}</span>
          </button>
        ))}
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center text-slate-500">Đang tải…</div>
        ) : (
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-xs font-bold uppercase text-slate-500">Mã</th>
                <th className="px-4 py-3 text-xs font-bold uppercase text-slate-500">Xe</th>
                <th className="px-4 py-3 text-xs font-bold uppercase text-slate-500">Từ</th>
                <th className="px-4 py-3 text-xs font-bold uppercase text-slate-500">Đến</th>
                <th className="px-4 py-3 text-xs font-bold uppercase text-slate-500">Người yêu cầu</th>
                <th className="px-4 py-3 text-xs font-bold uppercase text-slate-500">Ngày</th>
                <th className="px-4 py-3 text-xs font-bold uppercase text-slate-500">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-sm text-slate-600">#{t.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{t.vehicleTitle}</p>
                    <p className="text-xs text-slate-500">{t.vehicleListingId}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{t.fromBranchName}</td>
                  <td className="px-4 py-3 text-slate-600">{t.toBranchName}</td>
                  <td className="px-4 py-3 text-slate-600">{t.requestedByName}</td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(t.createdAt)}</td>
                  <td className="px-4 py-3">
                    <TransferStatusBadge status={t.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!isLoading && filtered.length === 0 && (
          <div className="py-12 text-center text-slate-500">Không có yêu cầu</div>
        )}
      </div>
      <Pagination
        page={page + 1}
        totalPages={totalPages}
        total={(meta?.totalElements as number) ?? items.length}
        pageSize={perPage}
        onPageChange={(p) => setPage(p - 1)}
        label="yêu cầu"
      />
    </div>
  )
}
