import { useState } from 'react'
import type { Transaction } from '@/types'
import { formatPrice, formatDateTime } from '@/utils/format'
import { Wallet, ShoppingCart, RotateCcw, Eye } from 'lucide-react'

interface TransactionTableProps {
  transactions: Transaction[]
  isLoading?: boolean
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

const PAGE_SIZE = 5

export function TransactionTable({ transactions, isLoading }: TransactionTableProps) {
  const [page, setPage] = useState(1)
  const total = transactions.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const start = (page - 1) * PAGE_SIZE
  const paginated = transactions.slice(start, start + PAGE_SIZE)
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 5)

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
              <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-slate-700">Loại</th>
              <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-slate-700">Ngày</th>
              <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-slate-700">Mô tả</th>
              <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-slate-700">Số tiền</th>
              <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-slate-700">Trạng thái</th>
              <th className="px-6 py-4 text-right text-sm font-bold uppercase tracking-wider text-slate-700">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginated.map((tx) => {
              const tc = typeConfig[tx.type] ?? typeConfig.Deposit
              const sc = tx.type === 'Refund' && tx.status === 'Completed'
  ? statusConfig.CompletedRefund
  : (statusConfig[tx.status] ?? statusConfig.Pending)
              return (
                <tr key={tx.id} className="transition-colors hover:bg-slate-50">
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
                    <button className="text-slate-400 transition-colors hover:text-[#1A3C6E]">
                      <Eye className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/50 px-6 py-4">
        <span className="text-sm text-slate-500">
          Hiển thị {start + 1} - {Math.min(start + PAGE_SIZE, total)} của {total} giao dịch
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-lg border border-slate-200 p-2 text-slate-400 transition-colors hover:bg-slate-100 disabled:opacity-50"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          {pageNumbers.map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium ${
                page === p ? 'bg-[#1A3C6E] text-white' : 'hover:bg-slate-100'
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="rounded-lg border border-slate-200 p-2 text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-50"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
