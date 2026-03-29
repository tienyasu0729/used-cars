import { useState } from 'react'
import { useTransfers } from '@/hooks/useTransfers'
import { useAuthStore } from '@/store/authStore'
import {
  TransferRequestForm,
  TransferDetailModal,
  TransferListPage,
} from '@/components/manager/transfers'
import type { TransferStatus } from '@/types/transfer.types'

export function ManagerTransfersPage() {
  const { user } = useAuthStore()
  const [statusTab, setStatusTab] = useState<TransferStatus | 'all'>('all')
  const [page, setPage] = useState(0)
  const [detailId, setDetailId] = useState<number | null>(null)

  const { data, isLoading, refetch } = useTransfers({
    status: statusTab,
    page,
    size: 10,
  })

  const items = data?.items ?? []
  const meta = data?.meta
  const totalPages = meta?.totalPages ?? 1

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 lg:text-3xl">Quản lý điều chuyển xe</h1>
        <p className="text-slate-500">Tạo yêu cầu, theo dõi trạng thái và xác nhận nhận xe (chi nhánh đích).</p>
      </div>

      <TransferRequestForm onCreated={() => void refetch()} />

      <TransferListPage
        items={items}
        isLoading={isLoading}
        statusTab={statusTab}
        onStatusTab={(t) => {
          setStatusTab(t)
          setPage(0)
        }}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        myBranchId={user?.branchId}
        onRowClick={(id) => setDetailId(id)}
      />

      <TransferDetailModal
        transferId={detailId}
        isOpen={detailId != null}
        onClose={() => setDetailId(null)}
        role={user?.role ?? 'BranchManager'}
        myBranchId={user?.branchId}
      />
    </div>
  )
}
