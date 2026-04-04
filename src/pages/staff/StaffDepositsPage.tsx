import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useDeposits } from '@/hooks/useDeposits'
import { useStaffOrManagerBasePath } from '@/hooks/useStaffOrManagerBasePath'
import { depositApi } from '@/services/depositApi'
import { useToastStore } from '@/store/toastStore'
import { formatPrice, formatDate } from '@/utils/format'
import { Button } from '@/components/ui'

function errMsg(e: unknown): string {
  if (e && typeof e === 'object' && 'message' in e && typeof (e as { message: unknown }).message === 'string') {
    return (e as { message: string }).message
  }
  return 'Thao tác thất bại.'
}

export function StaffDepositsPage() {
  const { dashboard, deposits } = useStaffOrManagerBasePath()
  const [status, setStatus] = useState<string | undefined>(undefined)
  const toast = useToastStore()
  const qc = useQueryClient()
  const { data, isLoading } = useDeposits({ status, page: 0, size: 100 })
  const rows = data?.deposits ?? []

  const confirmMut = useMutation({
    mutationFn: (id: string) => depositApi.confirm(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['deposits'] })
      toast.addToast('success', 'Đã xác nhận cọc.')
    },
    onError: (e) => toast.addToast('error', errMsg(e)),
  })

  return (
    <div className="space-y-6">
      <nav className="text-sm text-slate-500">
        <Link to={dashboard} className="hover:text-[#1A3C6E]">Dashboard</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-900">Đặt cọc</span>
      </nav>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Đặt cọc chi nhánh</h1>
          <p className="text-sm text-slate-500">Xem và xác nhận cọc khách (Pending → Confirmed).</p>
        </div>
        <Link
          to={`${deposits}/new`}
          className="inline-flex items-center justify-center rounded-lg bg-[#1A3C6E] px-4 py-2 text-sm font-bold text-white"
        >
          Tạo cọc mới
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { key: undefined as string | undefined, label: 'Tất cả' },
          { key: 'Pending', label: 'Chờ xác nhận' },
          { key: 'Confirmed', label: 'Đã xác nhận' },
          { key: 'Cancelled', label: 'Đã hủy' },
        ].map((t) => (
          <button
            key={t.label}
            type="button"
            onClick={() => setStatus(t.key)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              status === t.key ? 'bg-[#1A3C6E] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="h-48 animate-pulse rounded-xl bg-slate-100" />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-4 py-3 font-bold text-slate-500">ID</th>
                  <th className="px-4 py-3 font-bold text-slate-500">Khách</th>
                  <th className="px-4 py-3 font-bold text-slate-500">Xe</th>
                  <th className="px-4 py-3 font-bold text-slate-500">Số tiền</th>
                  <th className="px-4 py-3 font-bold text-slate-500">Hạn</th>
                  <th className="px-4 py-3 font-bold text-slate-500">Trạng thái</th>
                  <th className="px-4 py-3 font-bold text-slate-500 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((d) => (
                  <tr key={d.id}>
                    <td className="px-4 py-3 font-mono text-xs">#{d.id}</td>
                    <td className="px-4 py-3">{d.customerName ?? d.customerId}</td>
                    <td className="max-w-[200px] truncate px-4 py-3">{d.vehicleTitle ?? d.vehicleId}</td>
                    <td className="px-4 py-3 font-semibold">{formatPrice(d.amount)}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(d.expiryDate)}</td>
                    <td className="px-4 py-3">{d.status}</td>
                    <td className="px-4 py-3 text-right">
                      {d.status === 'Pending' && (
                        <Button
                          type="button"
                          size="sm"
                          className="bg-[#1A3C6E]"
                          disabled={confirmMut.isPending}
                          onClick={() => confirmMut.mutate(d.id)}
                        >
                          Xác nhận cọc
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length === 0 && <p className="p-8 text-center text-slate-500">Không có dữ liệu</p>}
        </div>
      )}
    </div>
  )
}
