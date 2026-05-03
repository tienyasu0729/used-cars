import { useState, useMemo } from 'react'
import { TransactionTable } from '@/features/customer/components/TransactionTable'
import { useTransactions } from '@/hooks/useTransactions'
import { Wallet, ShoppingCart, RotateCcw, Search, X } from 'lucide-react'
import { downloadExcel, todayStr } from '@/utils/excelExport'
import { ExportMenu, ExportSelectionBar } from '@/components/ui'

const typeFilters = [
  { key: 'all', label: 'Tất cả' },
  { key: 'Deposit', label: 'Đặt cọc', icon: Wallet },
  { key: 'Purchase', label: 'Mua xe', icon: ShoppingCart },
  { key: 'Refund', label: 'Hoàn tiền', icon: RotateCcw },
]

const typeLabel: Record<string, string> = { Deposit: 'Đặt cọc', Purchase: 'Mua xe', Refund: 'Hoàn tiền' }
const statusLabel: Record<string, string> = { Completed: 'Hoàn thành', Pending: 'Chờ xử lý', Failed: 'Thất bại', CompletedRefund: 'Đã hoàn tiền' }
const exportHeaders = ['Loại', 'Ngày', 'Mô tả', 'Số tiền (VNĐ)', 'Trạng thái']

export function TransactionsPage() {
  const [typeFilter, setTypeFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const { data: transactions, isLoading } = useTransactions()

  const allItems = transactions ?? []

  const filtered = useMemo(() => {
    let list = typeFilter === 'all' ? allItems : allItems.filter((t) => t.type === typeFilter)
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      list = list.filter((t) => {
        if (t.description && t.description.toLowerCase().includes(q)) return true
        if (String(t.amount).includes(q)) return true
        return false
      })
    }
    return list
  }, [allItems, typeFilter, searchQuery])

  const toggleId = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const buildRows = (items: typeof allItems) =>
    items.map((t) => [
      typeLabel[t.type] ?? t.type,
      t.date,
      t.description,
      String(t.amount),
      statusLabel[t.status] ?? t.status,
    ])

  const handleExportSelected = () => {
    const items = filtered.filter((t) => selectedIds.has(t.id))
    downloadExcel(`giao-dich-chon-${todayStr()}.xlsx`, exportHeaders, buildRows(items))
    setSelectMode(false)
    setSelectedIds(new Set())
  }

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
          <div className="relative ml-auto mr-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm mô tả, số tiền..."
              className="h-9 w-52 rounded-lg border border-slate-200 bg-white pl-9 pr-8 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-[#1A3C6E] focus:ring-1 focus:ring-[#1A3C6E]/30"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <ExportMenu
            onExportAll={() => {
              downloadExcel(`giao-dich-tat-ca-${todayStr()}.xlsx`, exportHeaders, buildRows(allItems))
            }}
            onExportFiltered={() => {
              setSelectMode(true)
              setSelectedIds(new Set())
            }}
          />
        </div>
      </div>

      {selectMode && (
        <ExportSelectionBar
          selectedCount={selectedIds.size}
          totalCount={filtered.length}
          onSelectAll={() => setSelectedIds(new Set(filtered.map((t) => t.id)))}
          onDeselectAll={() => setSelectedIds(new Set())}
          onExport={handleExportSelected}
          onCancel={() => { setSelectMode(false); setSelectedIds(new Set()) }}
        />
      )}

      <TransactionTable
        transactions={filtered}
        isLoading={isLoading}
        selectMode={selectMode}
        selectedIds={selectedIds}
        onToggleId={toggleId}
      />
    </div>
  )
}
