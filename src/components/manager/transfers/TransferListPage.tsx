import { TransferStatusBadge } from './TransferStatusBadge'
import type { TransferRequest, TransferStatus } from '@/types/transfer.types'

const TABS: { key: TransferStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'Pending', label: 'Chờ duyệt' },
  { key: 'Approved', label: 'Đã duyệt' },
  { key: 'Completed', label: 'Hoàn thành' },
  { key: 'Rejected', label: 'Từ chối' },
]

export function TransferListPage({
  items,
  isLoading,
  statusTab,
  onStatusTab,
  page,
  totalPages,
  onPageChange,
  myBranchId,
  onRowClick,
}: {
  items: TransferRequest[]
  isLoading: boolean
  statusTab: TransferStatus | 'all'
  onStatusTab: (t: TransferStatus | 'all') => void
  page: number
  totalPages: number
  onPageChange: (p: number) => void
  myBranchId?: number
  onRowClick: (id: number) => void
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap gap-2 border-b border-slate-100 px-4 py-3">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => onStatusTab(tab.key)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              statusTab === tab.key ? 'bg-[#1A3C6E] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center text-slate-500">Đang tải…</div>
        ) : (
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="px-4 py-3 font-bold text-slate-500">Mã / Xe</th>
                <th className="px-4 py-3 font-bold text-slate-500">Tuyến</th>
                <th className="px-4 py-3 font-bold text-slate-500">Người tạo</th>
                <th className="px-4 py-3 font-bold text-slate-500">Ngày tạo</th>
                <th className="px-4 py-3 font-bold text-slate-500">Trạng thái</th>
                <th className="px-4 py-3 text-right font-bold text-slate-500">Gợi ý</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((t) => {
                const isIncoming = myBranchId != null && t.toBranchId === myBranchId
                const isOutgoing = myBranchId != null && t.fromBranchId === myBranchId
                return (
                  <tr
                    key={t.id}
                    className="cursor-pointer hover:bg-slate-50/80"
                    onClick={() => onRowClick(t.id)}
                  >
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs text-slate-500">#{t.id}</p>
                      <p className="font-semibold text-slate-900">{t.vehicleTitle}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      <span className="text-xs text-slate-500">{isOutgoing ? 'Đi' : isIncoming ? 'Đến' : ''}</span>
                      <br />
                      {t.fromBranchName} → {t.toBranchName}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{t.requestedByName}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {new Date(t.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-4 py-3">
                      <TransferStatusBadge status={t.status} />
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-slate-500">Xem chi tiết</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
        {!isLoading && items.length === 0 && (
          <div className="py-12 text-center text-slate-500">Không có yêu cầu phù hợp.</div>
        )}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-4 py-3">
          <button
            type="button"
            disabled={page <= 0}
            className="rounded border px-3 py-1 text-sm disabled:opacity-50"
            onClick={() => onPageChange(page - 1)}
          >
            Trước
          </button>
          <span className="text-sm text-slate-600">
            Trang {page + 1} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages - 1}
            className="rounded border px-3 py-1 text-sm disabled:opacity-50"
            onClick={() => onPageChange(page + 1)}
          >
            Sau
          </button>
        </div>
      )}
    </div>
  )
}
