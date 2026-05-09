import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { useTransfers } from '@/hooks/useTransfers'
import { useAuthStore } from '@/store/authStore'
import {
  TransferRequestForm,
  TransferDetailModal,
  TransferListPage,
} from '@/components/manager/transfers'
import { exportTransfersToExcel } from '@/utils/transferExport'
import { ExportMenu, ExportSelectionBar } from '@/components/ui'
import { transferService } from '@/services/transfer.service'
import type { TransferStatus } from '@/types/transfer.types'

const TRANSFER_STATUS_KEYS: readonly TransferStatus[] = ['Pending', 'Approved', 'Completed', 'Rejected']

export function ManagerTransfersPage() {
  const { user } = useAuthStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const [page, setPage] = useState(0)
  const [detailId, setDetailId] = useState<number | null>(null)

  const statusTab = useMemo((): TransferStatus | 'all' => {
    const raw = searchParams.get('status')
    if (raw && TRANSFER_STATUS_KEYS.includes(raw as TransferStatus)) {
      return raw as TransferStatus
    }
    return 'all'
  }, [searchParams])

  const handleStatusTab = (t: TransferStatus | 'all') => {
    setPage(0)
    if (t === 'all') {
      setSearchParams({}, { replace: true })
    } else {
      setSearchParams({ status: t }, { replace: true })
    }
  }

  const { data, isLoading, refetch } = useTransfers({
    status: statusTab,
    page,
    size: 10,
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

  const allItems = data?.items ?? []
  const meta = data?.meta
  const totalPages = meta?.totalPages ?? 1

  const items = useMemo(() => {
    if (!searchQuery.trim()) return allItems
    const q = searchQuery.trim().toLowerCase()
    return allItems.filter((t) => {
      if (t.vehicleTitle?.toLowerCase().includes(q)) return true
      if (String(t.id).includes(q)) return true
      if (t.vehicleListingId?.toLowerCase().includes(q)) return true
      return false
    })
  }, [allItems, searchQuery])

  const openDetail = (id: number) => setDetailId(id)

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 lg:text-3xl">Quản lý điều chuyển xe</h1>
          <p className="text-slate-500">Tạo yêu cầu, theo dõi trạng thái và xác nhận nhận xe (chi nhánh đích).</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm xe, mã yêu cầu..."
              className="h-9 w-52 rounded-lg border border-slate-200 bg-white pl-9 pr-8 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-[#1A3C6E] focus:ring-1 focus:ring-[#1A3C6E]/30"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <ExportMenu
            onExportAll={async () => {
              try {
                const res = await transferService.getTransfers({ page: 0, size: 500 })
                exportTransfersToExcel(res.items, 'outgoing')
              } catch { /* lỗi im lặng */ }
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
          totalCount={items.length}
          onSelectAll={() => setSelectedIds(new Set(items.map((t) => t.id)))}
          onDeselectAll={() => setSelectedIds(new Set())}
          onExport={() => {
            const selected = items.filter((t) => selectedIds.has(t.id))
            exportTransfersToExcel(selected, 'outgoing')
            setSelectMode(false)
            setSelectedIds(new Set())
          }}
          onCancel={() => { setSelectMode(false); setSelectedIds(new Set()) }}
        />
      )}

      <TransferRequestForm onCreated={() => void refetch()} />

      <TransferListPage
        items={items}
        isLoading={isLoading}
        statusTab={statusTab}
        onStatusTab={handleStatusTab}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        myBranchId={user?.branchId}
        onRowClick={openDetail}
        onApprove={openDetail}
        onReject={openDetail}
        onComplete={openDetail}
        selectMode={selectMode}
        selectedIds={selectedIds}
        onToggleId={(id) => {
          setSelectedIds((prev) => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
          })
        }}
      />

      <TransferDetailModal
        transferId={detailId}
        isOpen={detailId != null}
        onClose={() => {
          setDetailId(null)
          void refetch()
        }}
        role={user?.role ?? 'BranchManager'}
        myBranchId={user?.branchId}
      />
    </div>
  )
}
