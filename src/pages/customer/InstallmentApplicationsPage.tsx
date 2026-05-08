import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink, FileText, Loader2 } from 'lucide-react'
import { installmentService, type InstallmentApplicationDTO } from '@/services/installment.service'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { formatPriceNumber } from '@/utils/format'

function formatDateTime(value: string): string {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString('vi-VN')
}

function statusLabel(status: string): { text: string; cls: string } {
  const map: Record<string, { text: string; cls: string }> = {
    DRAFT: { text: 'Ban nhap', cls: 'bg-slate-100 text-slate-700' },
    PENDING_DOCUMENT: { text: 'Cho ho so', cls: 'bg-amber-100 text-amber-800' },
    BANK_PROCESSING: { text: 'Dang tham dinh', cls: 'bg-blue-100 text-blue-700' },
    APPROVED: { text: 'Da duyet', cls: 'bg-emerald-100 text-emerald-700' },
    REJECTED: { text: 'Tu choi', cls: 'bg-red-100 text-red-700' },
    DEPOSIT_PENDING: { text: 'Cho dat coc', cls: 'bg-orange-100 text-orange-800' },
    DEPOSIT_PAID: { text: 'Da dat coc', cls: 'bg-teal-100 text-teal-700' },
    COMPLETED: { text: 'Hoan tat', cls: 'bg-emerald-100 text-emerald-700' },
    CANCELLED: { text: 'Da huy', cls: 'bg-slate-100 text-slate-600' },
  }
  return map[status] ?? { text: status, cls: 'bg-slate-100 text-slate-700' }
}

export function InstallmentApplicationsPage() {
  const [apps, setApps] = useState<InstallmentApplicationDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const pageSize = 10

  useDocumentTitle('Lịch sử trả góp')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await installmentService.getMyApplications({
          page,
          size: pageSize,
          status: statusFilter || undefined,
          q: keyword || undefined,
        })
        if (!cancelled) {
          setApps(data.items)
          setTotalPages(Math.max(1, data.meta.totalPages))
          setTotalElements(data.meta.totalElements)
        }
      } catch {
        if (!cancelled) setError('Khong tai duoc danh sach ho so tra gop.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [keyword, page, pageSize, statusFilter])

  const sorted = useMemo(() => apps, [apps])
  const latestDraft = useMemo(() => sorted.find((app) => app.status === 'DRAFT'), [sorted])

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        <p className="mt-3 text-slate-500">Dang tai ho so tra gop...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Lịch sử trả góp</h1>
        <p className="mt-1 text-slate-500">Theo doi trang thai cac ho so tra gop da tao.</p>
      </div>

      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-semibold text-slate-500">Tim kiem nhanh</label>
          <input
            value={keyword}
            onChange={(e) => {
              setPage(0)
              setKeyword(e.target.value)
            }}
            placeholder="Ma ho so, ten xe, ho ten, so dien thoai..."
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500">Trang thai</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setPage(0)
              setStatusFilter(e.target.value)
            }}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
          >
            <option value="">Tat ca</option>
            <option value="DRAFT">Ban nhap</option>
            <option value="PENDING_DOCUMENT">Cho ho so</option>
            <option value="BANK_PROCESSING">Dang tham dinh</option>
            <option value="APPROVED">Da duyet</option>
            <option value="REJECTED">Tu choi</option>
            <option value="DEPOSIT_PENDING">Cho dat coc</option>
            <option value="DEPOSIT_PAID">Da dat coc</option>
            <option value="COMPLETED">Hoan tat</option>
            <option value="CANCELLED">Da huy</option>
          </select>
        </div>
      </div>

      {latestDraft && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm font-semibold text-blue-900">
            Ban dang co ho so tra gop chua hoan tat #{latestDraft.id}
          </p>
          <p className="mt-1 text-sm text-blue-800">Co the tiep tuc ngay trong thoi gian cho phep cua he thong.</p>
          <div className="mt-3">
            <Link
              to={`/dashboard/installment/${latestDraft.vehicleId}`}
              className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
            >
              Tiep tuc hoan tat ho so
            </Link>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!error && sorted.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          Chua co ho so tra gop nao.
        </div>
      )}

      <div className="space-y-3">
        {sorted.map((app) => {
          const status = statusLabel(app.status)
          const isDraft = app.status === 'DRAFT'
          return (
            <div key={app.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900">
                    Ho so #{app.id} - {app.vehicleTitle || `Xe #${app.vehicleId}`}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">Tao luc: {formatDateTime(app.createdAt)}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    So tien vay: {app.loanAmount ? `${formatPriceNumber(Number(app.loanAmount))} d` : '-'}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${status.cls}`}>{status.text}</span>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Link
                  to={`/dashboard/installments/${app.id}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                >
                  <FileText className="h-4 w-4" />
                  Xem chi tiet
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
                {isDraft && (
                  <Link
                    to={`/dashboard/installment/${app.vehicleId}`}
                    className="inline-flex items-center rounded-md border border-primary/25 bg-primary/5 px-3 py-1.5 text-xs font-bold text-primary transition hover:bg-primary/10"
                  >
                    Tiep tuc hoan tat ho so
                  </Link>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {!error && totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm">
          <p className="text-slate-500">
            Trang {page + 1}/{totalPages} - {totalElements} ho so
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 0}
              onClick={() => setPage((prev) => Math.max(0, prev - 1))}
              className="rounded-md border border-slate-200 px-3 py-1.5 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
            >
              Truoc
            </button>
            <button
              type="button"
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
              className="rounded-md border border-slate-200 px-3 py-1.5 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
