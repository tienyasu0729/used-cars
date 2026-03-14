import type { Transaction } from '@/types'
import { formatPrice, formatDate } from '@/utils/format'

interface TransactionTableProps {
  transactions: Transaction[]
  isLoading?: boolean
}

export function TransactionTable({ transactions, isLoading }: TransactionTableProps) {
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

  const typeLabels: Record<string, string> = {
    Deposit: 'Đặt cọc',
    Purchase: 'Mua xe',
    Refund: 'Hoàn cọc',
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="px-4 py-3 text-left font-semibold text-slate-700">Mã GD</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-700">Ngày</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-700">Mô Tả</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-700">Loại</th>
            <th className="px-4 py-3 text-right font-semibold text-slate-700">Số Tiền</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-700">Trạng Thái</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="px-4 py-3 font-medium">{tx.id}</td>
              <td className="px-4 py-3 text-slate-600">{formatDate(tx.date)}</td>
              <td className="px-4 py-3">{tx.description}</td>
              <td className="px-4 py-3">{typeLabels[tx.type] ?? tx.type}</td>
              <td
                className={`px-4 py-3 text-right font-medium ${
                  tx.amount < 0 ? 'text-red-600' : 'text-green-600'
                }`}
              >
                {tx.amount < 0 ? '-' : '+'}
                {formatPrice(Math.abs(tx.amount))}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    tx.status === 'Completed'
                      ? 'bg-green-100 text-green-700'
                      : tx.status === 'Pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                  }`}
                >
                  {tx.status === 'Completed' ? 'Hoàn thành' : tx.status === 'Pending' ? 'Chờ xử lý' : 'Thất bại'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
