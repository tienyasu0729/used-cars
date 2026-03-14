import { useState, useRef, useEffect } from 'react'
import { Plus, MoreVertical, Filter, Download, ArrowRight, Inbox } from 'lucide-react'
import { useTransfers } from '@/hooks/useTransfers'
import { TransferDetailModal } from '@/features/manager/components'
import { exportTransfersToCsv } from '@/utils/transferExport'
import type { ManagerTransfer } from '@/mock/mockManagerData'

const STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-rose-100 text-rose-700',
} as const

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected'

const PAGE_SIZE = 3

export function ManagerTransfersPage() {
  const { data: transfers, isLoading } = useTransfers()
  const [activeTab, setActiveTab] = useState<'outgoing' | 'incoming'>('outgoing')
  const [selected, setSelected] = useState<ManagerTransfer | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [filterOpen, setFilterOpen] = useState(false)
  const [page, setPage] = useState(1)
  const filterRef = useRef<HTMLDivElement>(null)

  const rawOutgoing = (transfers ?? []).filter((t: ManagerTransfer) => t.fromBranchId === 'branch1')
  const rawIncoming = (transfers ?? []).filter((t: ManagerTransfer) => t.toBranchId === 'branch1')
  const outgoing =
    statusFilter === 'all'
      ? rawOutgoing
      : rawOutgoing.filter((t: ManagerTransfer) => t.status === statusFilter)
  const incoming =
    statusFilter === 'all'
      ? rawIncoming
      : rawIncoming.filter((t: ManagerTransfer) => t.status === statusFilter)
  const pendingIncoming = rawIncoming.filter((t: ManagerTransfer) => t.status === 'pending').length
  const totalOutgoing = outgoing.length
  const totalPages = Math.max(1, Math.ceil(totalOutgoing / PAGE_SIZE))
  const paginatedOutgoing = outgoing.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false)
      }
    }
    document.addEventListener('click', h)
    return () => document.removeEventListener('click', h)
  }, [])

  useEffect(() => {
    setPage(1)
  }, [statusFilter, activeTab])

  const openDetail = (t: ManagerTransfer) => {
    setSelected(t)
    setDetailOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1A3C6E] border-t-transparent" />
      </div>
    )
  }

  const displayList = activeTab === 'outgoing' ? paginatedOutgoing : incoming

  const handleDownload = () => {
    const list = activeTab === 'outgoing' ? outgoing : incoming
    exportTransfersToCsv(list, activeTab)
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 lg:text-3xl">
            Quản Lý Điều Chuyển
          </h1>
          <p className="text-slate-500">
            Điều phối xe giữa các chi nhánh trong hệ thống
          </p>
        </div>
        <button className="flex items-center justify-center gap-2 rounded-lg bg-[#1A3C6E] px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:brightness-110">
          <Plus className="h-5 w-5" />
          Tạo Yêu Cầu Mới
        </button>
      </div>
      <div className="space-y-6">
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('outgoing')}
            className={`border-b-2 px-6 py-3 text-sm font-bold ${
              activeTab === 'outgoing'
                ? 'border-[#1A3C6E] text-[#1A3C6E]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Yêu cầu đi (Outgoing)
          </button>
          <button
            onClick={() => setActiveTab('incoming')}
            className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'incoming'
                ? 'border-[#1A3C6E] text-[#1A3C6E]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Yêu cầu đến (Incoming)
            {pendingIncoming > 0 && (
              <span className="inline-flex items-center justify-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-600">
                {pendingIncoming}
              </span>
            )}
          </button>
        </div>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h3 className="text-lg font-bold">
              {activeTab === 'outgoing' ? 'Danh sách yêu cầu đi' : 'Danh sách yêu cầu đến'}
            </h3>
            <div className="relative flex gap-2" ref={filterRef}>
              <button
                onClick={() => setFilterOpen((o) => !o)}
                className={`p-2 ${filterOpen ? 'text-[#1A3C6E]' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Filter className="h-5 w-5" />
              </button>
              {filterOpen && (
                <div className="absolute right-0 top-full z-10 mt-1 w-44 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                  <p className="px-3 py-2 text-xs font-bold text-slate-500">Lọc theo trạng thái</p>
                  {[
                    { value: 'all' as const, label: 'Tất cả' },
                    { value: 'pending' as const, label: 'Chờ Duyệt' },
                    { value: 'approved' as const, label: 'Đã Duyệt' },
                    { value: 'rejected' as const, label: 'Từ Chối' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setStatusFilter(opt.value)
                        setFilterOpen(false)
                      }}
                      className={`block w-full px-3 py-2 text-left text-sm ${
                        statusFilter === opt.value ? 'bg-[#1A3C6E]/10 font-bold text-[#1A3C6E]' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
              <button
                onClick={handleDownload}
                className="p-2 text-slate-400 hover:text-slate-600"
                title="Tải xuống CSV"
              >
                <Download className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Mã Yêu Cầu
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Phương Tiện (Vehicle)
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    {activeTab === 'outgoing' ? 'Đến Chi Nhánh' : 'Từ Chi Nhánh'}
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Ngày Yêu Cầu
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
                    Trạng Thái
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                    Thao Tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayList.map((t: ManagerTransfer) => (
                  <tr
                    key={t.id}
                    className="cursor-pointer transition-colors hover:bg-slate-50/50"
                    onClick={() => openDetail(t)}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-slate-400">#{t.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-12 overflow-hidden rounded bg-slate-100">
                          {t.vehicleImage && (
                            <img
                              src={t.vehicleImage}
                              alt={t.vehicleName}
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold">{t.vehicleName}</p>
                          {t.vin && (
                            <p className="text-xs text-slate-500">VIN: {t.vin}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {activeTab === 'outgoing' ? t.toBranchName : t.fromBranchName}
                        </span>
                        {activeTab === 'outgoing' && t.toBranchRegion && (
                          <span className="text-xs text-slate-500">{t.toBranchRegion}</span>
                        )}
                        {activeTab === 'incoming' && t.fromBranchRegion && (
                          <span className="text-xs text-slate-500">{t.fromBranchRegion}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{t.createdAt}</td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_STYLES[t.status as keyof typeof STATUS_STYLES]}`}
                      >
                        {t.status === 'pending'
                          ? 'Chờ Duyệt'
                          : t.status === 'approved'
                            ? 'Đã Duyệt'
                            : 'Từ Chối'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => openDetail(t)}
                        className="text-slate-400 hover:text-[#1A3C6E]"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4">
            <p className="text-sm text-slate-500">
              {activeTab === 'outgoing'
                ? `Hiển thị ${totalOutgoing ? (page - 1) * PAGE_SIZE + 1 : 0}-${Math.min(page * PAGE_SIZE, totalOutgoing)} trong số ${totalOutgoing} yêu cầu`
                : `Hiển thị 1-${incoming.length} trong số ${incoming.length} yêu cầu`}
            </p>
            {activeTab === 'outgoing' && totalPages > 1 && (
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded border border-slate-200 px-3 py-1 text-sm disabled:opacity-50"
                >
                  Trước
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`rounded px-3 py-1 text-sm ${
                      page === n ? 'bg-[#1A3C6E] text-white' : 'border border-slate-200'
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="rounded border border-slate-200 px-3 py-1 text-sm disabled:opacity-50"
                >
                  Sau
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-xl font-bold">
            <Inbox className="h-5 w-5 text-[#1A3C6E]" />
            Yêu cầu đến từ các chi nhánh khác
          </h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {incoming.slice(0, 2).map((t: ManagerTransfer, i: number) => (
              <div
                key={t.id}
                className={`rounded-xl border bg-white p-5 shadow-sm ${
                  i === 0 ? 'border-l-4 border-l-[#1A3C6E]' : 'border-slate-200'
                }`}
              >
                <div className="mb-4 flex items-start justify-between">
                  {i === 0 && (
                    <span className="rounded bg-[#1A3C6E]/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#1A3C6E]">
                      Mới Nhất
                    </span>
                  )}
                  {i !== 0 && <div />}
                  <span className="text-xs text-slate-400">{t.createdAtAgo ?? ''}</span>
                </div>
                <div className="mb-4 flex items-center gap-4">
                  <div className="size-12 overflow-hidden rounded-lg bg-slate-100">
                    {t.vehicleImage && (
                      <img
                        src={t.vehicleImage}
                        alt={t.vehicleName}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">{t.vehicleName}</h4>
                    <p className="text-xs text-slate-500">Từ: {t.fromBranchName}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openDetail(t)}
                    className="flex-1 rounded-lg bg-[#1A3C6E] py-2 text-xs font-bold text-white"
                  >
                    Chấp Nhận
                  </button>
                  <button
                    onClick={() => openDetail(t)}
                    className="flex-1 rounded-lg border border-slate-200 py-2 text-xs font-bold hover:bg-slate-50"
                  >
                    Xem Chi Tiết
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={() => setActiveTab('incoming')}
              className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-100 p-5 transition-all hover:bg-slate-200"
            >
              <div className="flex size-10 items-center justify-center rounded-full bg-white text-slate-400">
                <ArrowRight className="h-5 w-5" />
              </div>
              <p className="text-sm font-bold text-slate-600">Xem tất cả yêu cầu đến</p>
            </button>
          </div>
        </div>
      </div>
      <TransferDetailModal
        transfer={selected}
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </div>
  )
}
