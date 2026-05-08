import { useState } from 'react'
import type { Transaction } from '@/types'
import { formatPrice, formatDateTime } from '@/utils/format'
import { Wallet, ShoppingCart, RotateCcw, Eye } from 'lucide-react'
import { Modal, Pagination } from '@/components/ui'

interface TransactionTableProps {
  transactions: Transaction[]
  isLoading?: boolean
  selectMode?: boolean
  selectedIds?: Set<string>
  onToggleId?: (id: string) => void
}

const typeConfig: Record<string, { label: string; icon: typeof Wallet; className: string }> = {
  Deposit: { label: 'Đặt cọc', icon: Wallet, className: 'bg-blue-100 text-blue-700' },
  Purchase: { label: 'Mua xe', icon: ShoppingCart, className: 'bg-purple-100 text-purple-700' },
  Refund: { label: 'Hoàn tiền', icon: RotateCcw, className: 'bg-amber-100 text-amber-700' },
}

const statusConfig: Record<string, { label: string; className: string }> = {
  Completed: { label: 'Thành công', className: 'bg-emerald-50 text-emerald-700 border border-emerald-100' },
  CompletedRefund: { label: 'Hoàn thành', className: 'bg-blue-50 text-blue-700 border border-blue-100' },
  Pending: { label: 'Đang xử lý', className: 'bg-slate-100 text-slate-600 border border-slate-200' },
  Failed: { label: 'Thất bại', className: 'bg-red-50 text-red-700 border border-red-100' },
}

// Hiển thị tên cổng thanh toán dễ đọc
function gatewayLabel(gw: string | undefined): string {
  if (!gw) return 'Không rõ'
  const lower = gw.toLowerCase()
  if (lower === 'vnpay') return 'VNPay'
  if (lower === 'zalopay') return 'ZaloPay'
  if (lower === 'cash') return 'Tiền mặt'
  return gw
}

export function TransactionTable({ transactions, isLoading, selectMode, selectedIds, onToggleId }: TransactionTableProps) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(12)
  const [selected, setSelected] = useState<Transaction | null>(null)
  const total = transactions.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const start = (page - 1) * pageSize
  const paginated = transactions.slice(start, start + pageSize)

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="h-64 animate-pulse bg-slate-100" />
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500">
        Chưa có giao dịch nào
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {selectMode && (
                <th className="w-10 px-4 py-4">
                  <input
                    type="checkbox"
                    checked={paginated.length > 0 && paginated.every((tx) => selectedIds?.has(tx.id))}
                    onChange={() => {
                      if (!onToggleId) return
                      const pageIds = paginated.map((tx) => tx.id)
                      const allChecked = pageIds.every((id) => selectedIds?.has(id))
                      pageIds.forEach((id) => {
                        if (allChecked ? selectedIds?.has(id) : !selectedIds?.has(id)) onToggleId(id)
                      })
                    }}
                    className="h-4 w-4 cursor-pointer rounded border-slate-300 text-[#1A3C6E] focus:ring-[#1A3C6E]/20"
                  />
                </th>
              )}
              <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-slate-700">Loại</th>
              <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-slate-700">Ngày</th>
              <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-slate-700">Mô tả</th>
              <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-slate-700">Số tiền</th>
              <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-slate-700">Trạng thái</th>
              <th className="px-6 py-4 text-right text-sm font-bold uppercase tracking-wider text-slate-700">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginated.map((tx, rowIdx) => {
              const tc = typeConfig[tx.type] ?? typeConfig.Deposit
              const sc = tx.type === 'Refund' && tx.status === 'Completed'
  ? statusConfig.CompletedRefund
  : (statusConfig[tx.status] ?? statusConfig.Pending)
              return (
                <tr key={`${tx.id}-${start + rowIdx}`} className={`transition-colors hover:bg-slate-50 ${selectMode && selectedIds?.has(tx.id) ? 'bg-blue-50/50' : ''}`}>
                  {selectMode && (
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds?.has(tx.id) ?? false}
                        onChange={() => onToggleId?.(tx.id)}
                        className="h-4 w-4 cursor-pointer rounded border-slate-300 text-[#1A3C6E] focus:ring-[#1A3C6E]/20"
                      />
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase ${tc.className}`}>
                      <tc.icon className="h-3.5 w-3.5" />
                      {tc.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{formatDateTime(tx.date)}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{tx.description}</td>
                  <td className={`px-6 py-4 text-sm font-bold ${tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.amount >= 0 ? '+' : '-'}{formatPrice(Math.abs(tx.amount)).replace(' VNĐ', '₫')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium ${sc.className}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${tx.status === 'Pending' ? 'animate-pulse bg-slate-400' : 'bg-current'}`} />
                      {sc.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => setSelected(tx)}
                      className="text-slate-400 transition-colors hover:text-[#1A3C6E]"
                      title="Xem chi tiết"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="px-2 py-2">
        <Pagination page={page} totalPages={totalPages} total={total} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1) }} label="giao dịch" />
      </div>

      {/* Modal chi tiết giao dịch */}
      <Modal
        isOpen={selected != null}
        onClose={() => setSelected(null)}
        title="Chi tiết giao dịch"
      >
        {selected && (() => {
          const tc = typeConfig[selected.type] ?? typeConfig.Deposit
          const sc = selected.type === 'Refund' && selected.status === 'Completed'
            ? statusConfig.CompletedRefund
            : (statusConfig[selected.status] ?? statusConfig.Pending)
          return (
            <div className="space-y-5">
              {/* Loại giao dịch + trạng thái */}
              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase ${tc.className}`}>
                  <tc.icon className="h-3.5 w-3.5" />
                  {tc.label}
                </span>
                <span className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium ${sc.className}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${selected.status === 'Pending' ? 'animate-pulse bg-slate-400' : 'bg-current'}`} />
                  {sc.label}
                </span>
              </div>

              {/* Thông tin chi tiết */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Mã giao dịch</p>
                  <p className="mt-1 font-semibold text-slate-900">#{selected.id}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Ngày tạo</p>
                  <p className="mt-1 font-semibold text-slate-900">{formatDateTime(selected.date)}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Mô tả</p>
                  <p className="mt-1 font-semibold text-slate-900">{selected.description || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Số tiền</p>
                  <p className={`mt-1 text-lg font-bold ${selected.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {selected.amount >= 0 ? '+' : '-'}{formatPrice(Math.abs(selected.amount)).replace(' VNĐ', '₫')}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Cổng thanh toán</p>
                  <p className="mt-1 font-semibold text-slate-900">{gatewayLabel(selected.paymentGateway)}</p>
                </div>
              </div>
            </div>
          )
        })()}
      </Modal>
    </div>
  )
}
