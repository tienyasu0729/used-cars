import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  listConsultations,
  respondToConsultation,
  updateConsultationStatus,
  type ConsultationListItem,
} from '@/services/consultation.service'
import { useToastStore } from '@/store/toastStore'
import { Button, Pagination } from '@/components/ui'

const adminConsultationsKey = ['consultations', 'admin'] as const

function statusLabel(s: string) {
  const x = s.toLowerCase()
  if (x === 'pending') return 'Chờ xử lý'
  if (x === 'processing') return 'Đang xử lý'
  if (x === 'resolved') return 'Đã xử lý'
  return s
}

export function AdminConsultationsPage() {
  const qc = useQueryClient()
  const toast = useToastStore()
  const [scope, setScope] = useState<'orphan' | 'all'>('all')
  const [tab, setTab] = useState<'all' | 'pending' | 'processing' | 'resolved'>('all')
  const [uiPage, setUiPage] = useState(1)
  const [pageSize, setPageSize] = useState(12)

  const hasVehicle: boolean | undefined = scope === 'orphan' ? false : undefined
  const statusParam = tab === 'all' ? undefined : tab

  const { data, isLoading } = useQuery({
    queryKey: [...adminConsultationsKey, scope, tab],
    queryFn: async () =>
      listConsultations({
        status: statusParam,
        has_vehicle: hasVehicle,
        page: 0,
        size: 200,
      }),
  })

  const rows: ConsultationListItem[] = data?.items ?? []
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize))
  const paginatedRows = rows.slice((uiPage - 1) * pageSize, uiPage * pageSize)

  const respondMut = useMutation({
    mutationFn: (id: number) => respondToConsultation(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: adminConsultationsKey })
      toast.addToast('success', 'Đã nhận xử lý phiếu.')
    },
    onError: () => toast.addToast('error', 'Thao tác thất bại.'),
  })

  const resolveMut = useMutation({
    mutationFn: (id: number) => updateConsultationStatus(id, 'resolved'),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: adminConsultationsKey })
      toast.addToast('success', 'Đã đánh dấu đã xử lý.')
    },
    onError: () => toast.addToast('error', 'Cập nhật thất bại.'),
  })

  const statusTabs = useMemo(
    () =>
      [
        { key: 'all' as const, label: 'Tất cả' },
        { key: 'pending' as const, label: 'Chờ xử lý' },
        { key: 'processing' as const, label: 'Đang xử lý' },
        { key: 'resolved' as const, label: 'Đã xử lý' },
      ] as const,
    [],
  )

  if (isLoading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#1A3C6E] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4 py-6 md:px-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Phiếu tư vấn</h1>
        <p className="mt-1 text-slate-500">
          Mặc định hiển thị mọi phiếu. Chọn &quot;Phiếu chung (không xe)&quot; nếu chỉ muốn các yêu cầu không gắn xe — admin điều phối nhóm đó.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => { setScope('orphan'); setUiPage(1) }}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            scope === 'orphan' ? 'bg-[#1A3C6E] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Phiếu chung (không xe)
        </button>
        <button
          type="button"
          onClick={() => { setScope('all'); setUiPage(1) }}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            scope === 'all' ? 'bg-[#1A3C6E] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Tất cả phiếu
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {statusTabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => { setTab(t.key); setUiPage(1) }}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              tab === t.key ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Khách</th>
              <th className="px-4 py-3">SĐT</th>
              <th className="px-4 py-3">Xe</th>
              <th className="px-4 py-3">Tin nhắn</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  Không có phiếu.
                </td>
              </tr>
            ) : (
              paginatedRows.map((r) => (
                <tr key={r.id} className="border-b border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-900">{r.customerName}</td>
                  <td className="px-4 py-3">{r.customerPhone}</td>
                  <td className="max-w-[140px] truncate px-4 py-3 text-slate-600">
                    {r.vehicleTitle ?? '—'}
                  </td>
                  <td className="max-w-[220px] truncate px-4 py-3 text-slate-600">{r.message}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{statusLabel(r.status)}</span>
                  </td>
                  <td className="space-x-2 px-4 py-3 whitespace-nowrap">
                    {r.status.toLowerCase() === 'pending' && (
                      <Button
                        type="button"
                        variant="outline"
                        className="text-xs"
                        disabled={respondMut.isPending}
                        onClick={() => respondMut.mutate(r.id)}
                      >
                        Nhận xử lý
                      </Button>
                    )}
                    {r.status.toLowerCase() !== 'resolved' && (
                      <Button
                        type="button"
                        variant="primary"
                        className="text-xs"
                        disabled={resolveMut.isPending}
                        onClick={() => resolveMut.mutate(r.id)}
                      >
                        Đã xử lý
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Pagination page={uiPage} totalPages={totalPages} total={rows.length} pageSize={pageSize} onPageChange={setUiPage} onPageSizeChange={(s) => { setPageSize(s); setUiPage(1) }} label="phiếu" />
    </div>
  )
}
