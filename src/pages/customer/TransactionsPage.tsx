import { useState } from 'react'
import { TransactionTable } from '@/features/customer/components/TransactionTable'
import { useTransactions } from '@/hooks/useTransactions'
import { Wallet, ShoppingCart, RotateCcw } from 'lucide-react'

const typeFilters = [
  { key: 'all', label: 'Tất cả' },
  { key: 'Deposit', label: 'Đặt cọc', icon: Wallet },
  { key: 'Purchase', label: 'Mua xe', icon: ShoppingCart },
  { key: 'Refund', label: 'Hoàn tiền', icon: RotateCcw },
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
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Lịch sử giao dịch</h1>
        <p className="mt-1 text-slate-500">Theo dõi và quản lý mọi hoạt động tài chính trên hệ thống</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <span className="mr-2 text-sm font-bold text-slate-700">Bộ lọc:</span>
          {typeFilters.map((f) => (
            <button
              key={f.key}
              onClick={() => setTypeFilter(f.key)}
              className={`flex h-9 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors ${
                typeFilter === f.key
                  ? 'bg-[#1A3C6E] text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {f.icon && <f.icon className="h-[18px] w-[18px]" />}
              {f.label}
            </button>
          ))}
          <div className="ml-auto flex gap-2">
            <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M3 8h12M3 12h12M3 16h12" />
              </svg>
            </button>
            <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <TransactionTable transactions={filtered} isLoading={isLoading} />
    </div>
  )
}
