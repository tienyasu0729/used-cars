import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, Clock3, ImageIcon, Loader2, Wallet } from 'lucide-react'
import { Button, Input, Spinner } from '@/components/ui'
import { usedCarPurchaseRequestService } from '@/services/usedCarPurchaseRequest.service'
import { externalImageDisplayUrl } from '@/utils/externalImageDisplayUrl'
import { formatPriceNumber } from '@/utils/format'

function formatPrice(value?: number | null): string {
  if (value == null) return '--'
  return `${formatPriceNumber(value)} đ`
}

function statusLabel(status?: string | null): string {
  switch (status) {
    case 'PendingApproval':
      return 'Chờ duyệt'
    case 'Approved':
      return 'Đã duyệt'
    case 'Rejected':
      return 'Từ chối'
    case 'Paid':
      return 'Đã thanh toán'
    case 'ConvertedToInventory':
      return 'Đã tạo xe kho'
    default:
      return status || '--'
  }
}

export function AdminUsedCarPurchaseRequestsPage() {
  const queryClient = useQueryClient()
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [approvedPurchasePrice, setApprovedPurchasePrice] = useState(0)
  const [adminNote, setAdminNote] = useState('')

  const listQuery = useQuery({
    queryKey: ['admin-used-car-purchase-requests'],
    queryFn: () => usedCarPurchaseRequestService.listAdmin({ page: 0, size: 20 }),
    staleTime: 30_000,
  })

  const detailQuery = useQuery({
    queryKey: ['admin-used-car-purchase-request-detail', selectedId],
    queryFn: () => usedCarPurchaseRequestService.getAdminById(selectedId as number),
    enabled: selectedId != null,
  })

  const approveMutation = useMutation({
    mutationFn: () =>
      usedCarPurchaseRequestService.approve(selectedId as number, {
        approvedPurchasePrice,
        adminNote: adminNote.trim() || null,
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-used-car-purchase-requests'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-used-car-purchase-request-detail', selectedId] }),
      ])
    },
  })

  const rejectMutation = useMutation({
    mutationFn: () =>
      usedCarPurchaseRequestService.reject(selectedId as number, {
        adminNote: adminNote.trim(),
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-used-car-purchase-requests'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-used-car-purchase-request-detail', selectedId] }),
      ])
    },
  })

  useEffect(() => {
    if (!selectedId && listQuery.data?.items.length) {
      setSelectedId(listQuery.data.items[0].id)
    }
  }, [listQuery.data?.items, selectedId])

  useEffect(() => {
    const detail = detailQuery.data
    if (!detail) return
    setApprovedPurchasePrice(Number(detail.requestedPurchasePrice) || 0)
    setAdminNote(detail.adminNote ?? '')
  }, [detailQuery.data])

  const valuation = useMemo(
    () => (detailQuery.data?.valuationSnapshot ?? {}) as Record<string, unknown>,
    [detailQuery.data?.valuationSnapshot],
  )
  const vehicleSnapshot = useMemo(
    () => (detailQuery.data?.vehicleSnapshot ?? {}) as Record<string, unknown>,
    [detailQuery.data?.vehicleSnapshot],
  )
  const images = detailQuery.data?.imageSnapshot ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Duyệt mua xe cũ</h1>
        <p className="mt-1 text-sm text-gray-600">
          Admin xem toàn bộ snapshot manager đã gửi: thông tin xe, tình trạng, tất cả ảnh, caption và kết quả AI định giá trước khi duyệt khoản tiền mua.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-5 py-4">
            <p className="font-semibold text-gray-900">Danh sách hồ sơ</p>
          </div>
          {listQuery.isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {listQuery.data?.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className={`flex w-full items-start gap-4 px-5 py-4 text-left transition ${
                    selectedId === item.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
                    {item.primaryImageUrl ? (
                      <img src={externalImageDisplayUrl(item.primaryImageUrl)} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon className="h-5 w-5 text-slate-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 font-semibold text-gray-900">{item.vehicleTitle || `Hồ sơ #${item.id}`}</p>
                    <p className="mt-1 text-sm text-gray-600">Giá manager đề nghị: {formatPrice(item.requestedPurchasePrice)}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                      <span className="rounded-full bg-slate-100 px-2 py-1 font-semibold text-slate-700">{statusLabel(item.status)}</span>
                      <span>Chi nhánh #{item.branchId}</span>
                    </div>
                  </div>
                </button>
              ))}
              {!listQuery.data?.items.length && (
                <div className="px-5 py-12 text-center text-sm text-gray-500">Chưa có hồ sơ mua xe cũ nào.</div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-6">
          {detailQuery.isLoading ? (
            <div className="rounded-2xl border border-gray-200 bg-white py-12 shadow-sm">
              <div className="flex justify-center">
                <Spinner size="lg" />
              </div>
            </div>
          ) : detailQuery.data ? (
            <>
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{detailQuery.data.vehicleTitle || 'Hồ sơ mua xe cũ'}</h2>
                    <p className="mt-1 text-sm text-gray-600">
                      Trạng thái: <span className="font-semibold text-gray-900">{statusLabel(detailQuery.data.status)}</span>
                      {' '}· Manager: <span className="font-semibold text-gray-900">{detailQuery.data.requestedByName || '--'}</span>
                    </p>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm text-gray-700">
                    Giá manager đề nghị: <span className="font-semibold text-gray-900">{formatPrice(detailQuery.data.requestedPurchasePrice)}</span>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-gray-200 bg-slate-50 p-4 text-sm text-gray-700">
                    <p className="font-semibold text-gray-900">Thông tin xe snapshot</p>
                    <div className="mt-2 space-y-1">
                      <p>Category/Subcategory: {String(vehicleSnapshot.categoryId ?? '--')} / {String(vehicleSnapshot.subcategoryId ?? '--')}</p>
                      <p>Năm: {String(vehicleSnapshot.year ?? '--')} · Số km: {String(vehicleSnapshot.mileage ?? '--')}</p>
                      <p>Nhiên liệu: {String(vehicleSnapshot.fuel ?? '--')} · Hộp số: {String(vehicleSnapshot.transmission ?? '--')}</p>
                      <p>Kiểu dáng: {String(vehicleSnapshot.bodyStyle ?? '--')} · Xuất xứ: {String(vehicleSnapshot.origin ?? '--')}</p>
                    </div>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-slate-50 p-4 text-sm text-gray-700">
                    <p className="font-semibold text-gray-900">Kết quả AI snapshot</p>
                    <div className="mt-2 space-y-1">
                      <p>Result type: {String(valuation.resultType ?? '--')}</p>
                      <p>Confidence: {String(valuation.confidenceLabel ?? '--')} ({String(valuation.confidence ?? '--')})</p>
                      <p>Market price: {formatPrice((valuation.marketSellingPrice as { suggestedPrice?: number } | undefined)?.suggestedPrice)}</p>
                      <p>Fair price: {formatPrice((valuation.fairPrice as { suggestedPrice?: number } | undefined)?.suggestedPrice)}</p>
                      <p>Purchase price: {formatPrice((valuation.purchasePrice as { suggestedPrice?: number } | undefined)?.suggestedPrice)}</p>
                    </div>
                  </div>
                </div>

                {typeof vehicleSnapshot.description === 'string' && vehicleSnapshot.description.trim().length > 0 && (
                  <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 text-sm leading-6 text-gray-700">
                    <p className="font-semibold text-gray-900">Mô tả manager</p>
                    <p className="mt-2">{String(vehicleSnapshot.description)}</p>
                  </div>
                )}

                {detailQuery.data.managerNote && (
                  <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 text-sm leading-6 text-gray-700">
                    <p className="font-semibold text-gray-900">Ghi chú gửi duyệt</p>
                    <p className="mt-2">{detailQuery.data.managerNote}</p>
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <p className="font-semibold text-gray-900">Toàn bộ ảnh và caption snapshot</p>
                <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {images.map((item, index) => {
                    const url = typeof item.url === 'string' ? item.url : ''
                    return (
                      <div key={`${url}-${index}`} className="overflow-hidden rounded-xl border border-gray-200 bg-slate-50">
                        <div className="aspect-[4/3] bg-slate-100">
                          {url ? (
                            <img src={externalImageDisplayUrl(url)} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <ImageIcon className="h-5 w-5 text-slate-400" />
                            </div>
                          )}
                        </div>
                        <div className="space-y-1 p-3 text-xs text-gray-600">
                          <p><span className="font-semibold text-gray-900">Nhóm:</span> {String(item.declaredGroup ?? '--')}</p>
                          <p><span className="font-semibold text-gray-900">Caption:</span> {String(item.caption ?? '--')}</p>
                          <p><span className="font-semibold text-gray-900">Nguồn note:</span> {String(item.captionBy ?? '--')} / {String(item.captionType ?? '--')}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-[#1A3C6E]" />
                  <p className="font-semibold text-gray-900">Duyệt khoản tiền mua</p>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Giá admin duyệt</label>
                    <Input
                      type="number"
                      value={approvedPurchasePrice}
                      onChange={(e) => setApprovedPurchasePrice(Number(e.target.value) || 0)}
                      className="w-full"
                      disabled={detailQuery.data.status !== 'PendingApproval'}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Ghi chú admin</label>
                    <textarea
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      rows={4}
                      disabled={detailQuery.data.status !== 'PendingApproval'}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#1A3C6E] focus:ring-1 focus:ring-[#1A3C6E] disabled:cursor-not-allowed disabled:opacity-70"
                    />
                  </div>
                </div>

                {detailQuery.data.status === 'PendingApproval' ? (
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button type="button" className="bg-[#1A3C6E]" onClick={() => approveMutation.mutate()} disabled={approveMutation.isPending || approvedPurchasePrice <= 0}>
                      {approveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                      Duyệt khoản tiền mua
                    </Button>
                    <Button type="button" variant="outline" onClick={() => rejectMutation.mutate()} disabled={rejectMutation.isPending || !adminNote.trim()}>
                      {rejectMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Clock3 className="h-4 w-4" />}
                      Từ chối
                    </Button>
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                    Hồ sơ đã chuyển sang trạng thái <span className="font-semibold text-slate-900">{statusLabel(detailQuery.data.status)}</span>.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center text-sm text-gray-500 shadow-sm">
              Chọn một hồ sơ từ danh sách bên trái để xem chi tiết snapshot.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
