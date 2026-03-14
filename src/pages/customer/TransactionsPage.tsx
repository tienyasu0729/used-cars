import { useState } from 'react'
import { TransactionTable } from '@/features/customer/components/TransactionTable'
import { useTransactions } from '@/hooks/useTransactions'
import { Button } from '@/components/ui'

const typeFilters = [
  { key: 'all', label: 'Tất cả' },
  { key: 'Deposit', label: 'Đặt cọc' },
  { key: 'Purchase', label: 'Mua xe' },
  { key: 'Refund', label: 'Hoàn cọc' },
]

export function TransactionsPage() {
  const [typeFilter, setTypeFilter] = useState('all')
  const { data: transactions, isLoading } = useTransactions()

  const filtered =
    typeFilter === 'all'
      ? transactions ?? []
      : (transactions ?? []).filter((t) => t.type === typeFilter)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Lịch Sử Giao Dịch</h1>
          <p className="mt-1 text-slate-500">Toàn bộ giao dịch tài chính của bạn</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Xuất PDF
          </Button>
          <Button variant="outline" size="sm">
            Xuất Excel
          </Button>
        </div>
      </div>
      <div className="flex gap-2">
        {typeFilters.map((f) => (
          <button
            key={f.key}
            onClick={() => setTypeFilter(f.key)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              typeFilter === f.key
                ? 'bg-[#1A3C6E] text-white'
                : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <TransactionTable transactions={filtered} isLoading={isLoading} />
    </div>
  )
}
