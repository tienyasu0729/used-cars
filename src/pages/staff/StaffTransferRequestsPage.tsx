import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useTransfers } from '@/hooks/useTransfers'
import { useAuthStore } from '@/store/authStore'
import {
  TransferRequestForm,
  TransferDetailModal,
  TransferListPage,
} from '@/components/manager/transfers'
import type { TransferStatus } from '@/types/transfer.types'
import { Button } from '@/components/ui'

/**
 * Nhân viên: xem yêu cầu điều chuyển theo phạm vi chi nhánh (API GET /manager/transfers)
 * và tạo yêu cầu mới (POST) — đồng bộ với ManagerTransfersPage, không dùng mock.
 */
export function StaffTransferRequestsPage() {
  const { user } = useAuthStore()
  const [statusTab, setStatusTab] = useState<TransferStatus | 'all'>('all')
  const [page, setPage] = useState(0)
  const [detailId, setDetailId] = useState<number | null>(null)

  const { data, isLoading, refetch, isError, error } = useTransfers({
    status: statusTab,
    page,
    size: 10,
  })

  const items = data?.items ?? []
  const meta = data?.meta
  const totalPages = meta?.totalPages ?? 1

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 lg:text-3xl">Yêu cầu điều chuyển xe</h1>
          <p className="mt-1 text-slate-500">
            Theo dõi và tạo yêu cầu điều chuyển giữa chi nhánh. Duyệt / từ chối do Admin; hoàn tất nhận xe do quản lý
            chi nhánh đích.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="shrink-0 border-[#1A3C6E] text-[#1A3C6E]"
          onClick={() => document.getElementById('staff-transfer-form')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <Plus className="mr-2 h-4 w-4" />
          Tạo yêu cầu mới
        </Button>
      </div>

      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {(error as { message?: string })?.message ??
            'Không tải được danh sách điều chuyển. Kiểm tra đăng nhập và quyền truy cập API.'}
        </div>
      )}

      <div id="staff-transfer-form">
        <TransferRequestForm onCreated={() => void refetch()} />
      </div>

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
        role={user?.role ?? 'SalesStaff'}
        myBranchId={user?.branchId}
      />
    </div>
  )
}
