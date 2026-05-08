import { useState } from 'react'
import { CheckCircle, XCircle, EyeOff, Trash2, Star } from 'lucide-react'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useAdminReviews, useModerateReview, useDeleteReview } from '@/hooks/useReviews'
import { Badge, Pagination, Spinner, ConfirmDialog } from '@/components/ui'

const STATUS_MAP: Record<string, { label: string; variant: 'success' | 'warning' | 'default' | 'danger' }> = {
  approved: { label: 'Đã duyệt', variant: 'success' },
  pending: { label: 'Chờ duyệt', variant: 'warning' },
  rejected: { label: 'Từ chối', variant: 'danger' },
  hidden: { label: 'Ẩn', variant: 'default' },
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-3.5 w-3.5 ${s <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`}
        />
      ))}
    </div>
  )
}

export function AdminReviewsPage() {
  useDocumentTitle('Quản lý đánh giá')

  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(0)
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)

  const { data, isLoading } = useAdminReviews({
    status: statusFilter || undefined,
    page,
    size: 20,
  })

  const moderate = useModerateReview()
  const deleteReview = useDeleteReview()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Quản lý đánh giá xe</h1>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(0) }}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="pending">Chờ duyệt</option>
          <option value="approved">Đã duyệt</option>
          <option value="rejected">Từ chối</option>
          <option value="hidden">Ẩn</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-600">Xe</th>
                <th className="px-4 py-3 font-medium text-gray-600">Người đánh giá</th>
                <th className="px-4 py-3 font-medium text-gray-600">Đánh giá</th>
                <th className="px-4 py-3 font-medium text-gray-600">Nội dung</th>
                <th className="px-4 py-3 font-medium text-gray-600">Trạng thái</th>
                <th className="px-4 py-3 font-medium text-gray-600">Ngày</th>
                <th className="px-4 py-3 font-medium text-gray-600">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.items.map((r) => {
                const s = STATUS_MAP[r.status] ?? { label: r.status, variant: 'default' as const }
                return (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="max-w-[180px] truncate px-4 py-3 text-gray-900">{r.vehicleTitle ?? `#${r.vehicleId}`}</td>
                    <td className="px-4 py-3 text-gray-500">{r.reviewerName ?? 'Ẩn danh'}</td>
                    <td className="px-4 py-3"><StarDisplay rating={r.rating} /></td>
                    <td className="max-w-xs truncate px-4 py-3 text-gray-500">{r.comment ?? '—'}</td>
                    <td className="px-4 py-3"><Badge variant={s.variant}>{s.label}</Badge></td>
                    <td className="px-4 py-3 text-gray-500">{new Date(r.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {r.status !== 'approved' && (
                          <button
                            onClick={() => moderate.mutate({ id: r.id, action: 'approve' })}
                            className="rounded p-1.5 text-gray-400 hover:bg-green-50 hover:text-green-600"
                            title="Duyệt"
                          ><CheckCircle className="h-4 w-4" /></button>
                        )}
                        {r.status !== 'rejected' && (
                          <button
                            onClick={() => moderate.mutate({ id: r.id, action: 'reject' })}
                            className="rounded p-1.5 text-gray-400 hover:bg-orange-50 hover:text-orange-600"
                            title="Từ chối"
                          ><XCircle className="h-4 w-4" /></button>
                        )}
                        {r.status !== 'hidden' && (
                          <button
                            onClick={() => moderate.mutate({ id: r.id, action: 'hide' })}
                            className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                            title="Ẩn"
                          ><EyeOff className="h-4 w-4" /></button>
                        )}
                        <button
                          onClick={() => setDeleteTarget(r.id)}
                          className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                          title="Xóa"
                        ><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {(!data?.items || data.items.length === 0) && (
                <tr><td colSpan={7} className="py-12 text-center text-gray-400">Chưa có đánh giá nào.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {data?.meta && data.meta.totalPages > 1 && (
        <Pagination
          page={data.meta.page + 1}
          totalPages={data.meta.totalPages}
          total={data.meta.totalElements}
          pageSize={data.meta.size}
          onPageChange={(p) => setPage(p - 1)}
          label="đánh giá"
        />
      )}

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Xóa đánh giá"
        message="Bạn có chắc chắn muốn xóa đánh giá này?"
        onConfirm={async () => {
          if (deleteTarget) await deleteReview.mutateAsync(deleteTarget)
          setDeleteTarget(null)
        }}
      />
    </div>
  )
}
