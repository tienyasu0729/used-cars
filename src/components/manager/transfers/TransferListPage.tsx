import { TransferStatusBadge } from './TransferStatusBadge'
import type { TransferRequest, TransferStatus } from '@/types/transfer.types'
import { Check, ThumbsUp, ThumbsDown, Eye } from 'lucide-react'
import { Pagination } from '@/components/ui'

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
  onApprove,
  onReject,
  onComplete,
  selectMode,
  selectedIds,
  onToggleId,
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
  onApprove?: (id: number) => void
  onReject?: (id: number) => void
  onComplete?: (id: number) => void
  selectMode?: boolean
  selectedIds?: Set<number>
  onToggleId?: (id: number) => void
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
                {selectMode && (
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={items.length > 0 && items.every((t) => selectedIds?.has(t.id))}
                      onChange={() => {
                        if (!onToggleId) return
                        const allChecked = items.every((t) => selectedIds?.has(t.id))
                        items.forEach((t) => {
                          if (allChecked ? selectedIds?.has(t.id) : !selectedIds?.has(t.id)) onToggleId(t.id)
                        })
                      }}
                      className="h-4 w-4 cursor-pointer rounded border-slate-300 text-[#1A3C6E] focus:ring-[#1A3C6E]/20"
                    />
                  </th>
                )}
                <th className="px-4 py-3 font-bold text-slate-500">Mã / Xe</th>
                <th className="px-4 py-3 font-bold text-slate-500">Tuyến</th>
                <th className="px-4 py-3 font-bold text-slate-500">Người tạo</th>
                <th className="px-4 py-3 font-bold text-slate-500">Ngày tạo</th>
                <th className="px-4 py-3 font-bold text-slate-500">Trạng thái</th>
                <th className="px-4 py-3 text-right font-bold text-slate-500">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((t) => {
                const isIncoming = myBranchId != null && t.toBranchId === myBranchId
                const isOutgoing = myBranchId != null && t.fromBranchId === myBranchId

                // Manager chi nhánh nguồn (nơi có xe) → có thể Duyệt/Từ chối khi Pending
                const canApproveReject = isOutgoing && t.status === 'Pending'
                // Manager chi nhánh đích (người yêu cầu) → Xác nhận nhận xe khi Approved
                const canComplete = isIncoming && t.status === 'Approved'

                return (
                  <tr
                    key={t.id}
                    className={`cursor-pointer hover:bg-slate-50/80 ${selectMode && selectedIds?.has(t.id) ? 'bg-blue-50/50' : ''}`}
                    onClick={() => selectMode ? onToggleId?.(t.id) : onRowClick(t.id)}
                  >
                    {selectMode && (
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds?.has(t.id) ?? false}
                          onChange={() => onToggleId?.(t.id)}
                          className="h-4 w-4 cursor-pointer rounded border-slate-300 text-[#1A3C6E] focus:ring-[#1A3C6E]/20"
                        />
                      </td>
                    )}
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
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {canApproveReject && (
                          <>
                            <button
                              type="button"
                              title="Đồng ý điều chuyển"
                              className="rounded-lg bg-emerald-50 p-1.5 text-emerald-700 transition-colors hover:bg-emerald-100"
                              onClick={() => onApprove?.(t.id)}
                            >
                              <ThumbsUp className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              title="Từ chối điều chuyển"
                              className="rounded-lg bg-rose-50 p-1.5 text-rose-700 transition-colors hover:bg-rose-100"
                              onClick={() => onReject?.(t.id)}
                            >
                              <ThumbsDown className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {canComplete && (
                          <button
                            type="button"
                            title="Mở chi tiết để xác nhận nhận xe"
                            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-emerald-700"
                            onClick={() => onComplete?.(t.id)}
                          >
                            <Check className="h-3.5 w-3.5 shrink-0" />
                            Xác nhận nhận xe
                          </button>
                        )}
                        <button
                          type="button"
                          title="Xem chi tiết"
                          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                          onClick={() => onRowClick(t.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
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
      <div className="px-2 py-2">
        <Pagination
          page={page + 1}
          totalPages={totalPages}
          total={totalPages * items.length || items.length}
          pageSize={items.length || 10}
          onPageChange={(p) => onPageChange(p - 1)}
          label="yêu cầu"
        />
      </div>
    </div>
  )
}
