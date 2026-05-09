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

const consultationsKey = ['consultations', 'staff'] as const

function statusLabel(s: string) {
  const x = s.toLowerCase()
  if (x === 'pending') return 'Chờ xử lý'
  if (x === 'processing') return 'Đang xử lý'
  if (x === 'resolved') return 'Đã xử lý'
  return s
}

function priorityLabel(p: string) {
  const x = p.toLowerCase()
  if (x === 'high') return 'Cao'
  if (x === 'low') return 'Thấp'
  return 'Trung bình'
}

export function StaffConsultationsPage() {
  const qc = useQueryClient()
  const toast = useToastStore()
  const [tab, setTab] = useState<'all' | 'pending' | 'processing' | 'resolved'>('all')
  const [uiPage, setUiPage] = useState(1)
  const [pageSize, setPageSize] = useState(12)

  const statusParam = tab === 'all' ? undefined : tab

  const { data, isLoading } = useQuery({
    queryKey: [...consultationsKey, tab],
    queryFn: async () => listConsultations({ status: statusParam, page: 0, size: 200 }),
  })

  const rows: ConsultationListItem[] = data?.items ?? []
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize))
  const paginatedRows = rows.slice((uiPage - 1) * pageSize, uiPage * pageSize)

  const respondMut = useMutation({
    mutationFn: (id: number) => respondToConsultation(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: consultationsKey })
      toast.addToast('success', 'Đã nhận xử lý phiếu.')
    },
    onError: () => toast.addToast('error', 'Thao tác thất bại.'),
  })

  const resolveMut = useMutation({
    mutationFn: (id: number) => updateConsultationStatus(id, 'resolved'),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: consultationsKey })
      toast.addToast('success', 'Đã đánh dấu đã xử lý.')
    },
    onError: () => toast.addToast('error', 'Cập nhật thất bại.'),
  })

  const tabs = useMemo(
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tư vấn &amp; phiếu liên hệ</h1>
        <p className="mt-1 text-slate-500">Phiếu có gắn xe thuộc chi nhánh của bạn</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => { setTab(t.key); setUiPage(1) }}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              tab === t.key ? 'bg-[#1A3C6E] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
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
              <th className="px-4 py-3">Ưu tiên</th>
              <th className="px-4 py-3">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                  Không có phiếu nào.
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
                  <td className="max-w-[200px] truncate px-4 py-3 text-slate-600">{r.message}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{statusLabel(r.status)}</span>
                  </td>
                  <td className="px-4 py-3 text-xs">{priorityLabel(r.priority)}</td>
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
