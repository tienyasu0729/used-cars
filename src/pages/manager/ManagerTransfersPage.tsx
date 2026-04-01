import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTransfers } from '@/hooks/useTransfers'
import { useAuthStore } from '@/store/authStore'
import {
  TransferRequestForm,
  TransferDetailModal,
  TransferListPage,
} from '@/components/manager/transfers'
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

  const items = data?.items ?? []
  const meta = data?.meta
  const totalPages = meta?.totalPages ?? 1

  const openDetail = (id: number) => setDetailId(id)

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
        onStatusTab={handleStatusTab}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        myBranchId={user?.branchId}
        onRowClick={openDetail}
        onApprove={openDetail}
        onReject={openDetail}
        onComplete={openDetail}
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
