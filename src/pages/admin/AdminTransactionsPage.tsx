import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import {
  CreditCard,
  Download,
  RefreshCw,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Button, Badge, Input, Spinner, EmptyState } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'
import { useBranchesAdmin } from '@/hooks/useBranchesAdmin'
import {
  useAdminTransactions,
  useAdminTransactionSummary,
  useAdminTransactionDetail,
} from '@/hooks/useAdminTransactions'
import { adminTransactionService, type TransactionRow } from '@/services/adminTransactions.service'

const VN_TZ = 'Asia/Ho_Chi_Minh'

function vnYmd(d = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: VN_TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d)
}

function ymdToStartInstant(ymd: string): string {
  return `${ymd}T00:00:00+07:00`
}

function ymdAddDays(ymd: string, days: number): string {
  const [y, m, dd] = ymd.split('-').map(Number)
  const t = Date.UTC(y, m - 1, dd) + days * 86400000
  const d = new Date(t)
  const yy = d.getUTCFullYear()
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${yy}-${mm}-${day}`
}

function formatVnd(n: number | string | null | undefined): string {
  const x = typeof n === 'string' ? Number(n) : Number(n ?? 0)
  if (Number.isNaN(x)) return '0 đ'
  return `${new Intl.NumberFormat('vi-VN').format(x)} đ`
}

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('vi-VN', { timeZone: VN_TZ, day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function statusBucket(row: TransactionRow): 'completed' | 'pending' | 'cancelled' {
  if (row.source === 'DEPOSIT') {
    if (row.status === 'Confirmed' || row.status === 'Pending') return 'completed'
    if (row.status === 'AwaitingPayment') return 'pending'
    if (row.status === 'Cancelled') return 'cancelled'
  }
  if (row.source === 'ORDER_PAYMENT') {
    if (row.status === 'Completed') return 'completed'
    if (row.status === 'Pending') return 'pending'
    if (row.status === 'Cancelled' || row.status === 'Refunded') return 'cancelled'
  }
  return 'pending'
}

function statusBadgeClass(bucket: 'completed' | 'pending' | 'cancelled'): string {
  if (bucket === 'completed') return 'bg-emerald-100 text-emerald-800'
  if (bucket === 'pending') return 'bg-amber-100 text-amber-800'
  return 'bg-red-100 text-red-800'
}

function gatewayBadgeClass(gw: string | null | undefined): string {
  const g = (gw ?? 'cash').toLowerCase()
  if (g === 'zalopay') return 'bg-blue-100 text-blue-800'
  if (g === 'vnpay') return 'bg-red-100 text-red-800'
  return 'bg-slate-100 text-slate-700'
}

function gatewayLabel(gw: string | null | undefined): string {
  const g = (gw ?? 'cash').toLowerCase()
  if (g === 'zalopay') return 'ZaloPay'
  if (g === 'vnpay') return 'VNPay'
  return 'Tiền mặt'
}

function shortenRef(s: string | null | undefined, len = 14): string {
  if (!s) return '—'
  if (s.length <= len) return s
  return `${s.slice(0, len)}…`
}

type DatePreset = 'today' | '7d' | '30d' | 'custom'

export function AdminTransactionsPage() {
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.role === 'Admin'
  const queryClient = useQueryClient()
  const { data: branches = [] } = useBranchesAdmin()

  const [preset, setPreset] = useState<DatePreset>('30d')
  const [customFrom, setCustomFrom] = useState(() => vnYmd())
  const [customTo, setCustomTo] = useState(() => vnYmd())
  const [source, setSource] = useState('')
  const [status, setStatus] = useState('')
  const [gateway, setGateway] = useState('')
  const [branchId, setBranchId] = useState<string>('')
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(0)
  const [exporting, setExporting] = useState(false)

  const [panelOpen, setPanelOpen] = useState(false)
  const [selectedSource, setSelectedSource] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const { fromIso, toIso } = useMemo(() => {
    const today = vnYmd()
    if (preset === 'today') {
      const next = ymdAddDays(today, 1)
      return { fromIso: ymdToStartInstant(today), toIso: ymdToStartInstant(next) }
    }
    if (preset === '7d') {
      const from = ymdAddDays(today, -7)
      const next = ymdAddDays(today, 1)
      return { fromIso: ymdToStartInstant(from), toIso: ymdToStartInstant(next) }
    }
    if (preset === '30d') {
      const from = ymdAddDays(today, -30)
      const next = ymdAddDays(today, 1)
      return { fromIso: ymdToStartInstant(from), toIso: ymdToStartInstant(next) }
    }
    const a = customFrom <= customTo ? customFrom : customTo
    const b = customFrom <= customTo ? customTo : customFrom
    const nextB = ymdAddDays(b, 1)
    return { fromIso: ymdToStartInstant(a), toIso: ymdToStartInstant(nextB) }
  }, [preset, customFrom, customTo])

  const summaryFilter = useMemo(
    () => ({
      source: source || undefined,
      status: status || undefined,
      gateway: gateway || undefined,
      branchId: isAdmin && branchId ? Number(branchId) : undefined,
      keyword: keyword.trim() || undefined,
      from: fromIso,
      to: toIso,
    }),
    [source, status, gateway, branchId, keyword, fromIso, toIso, isAdmin],
  )

  const listFilter = useMemo(
    () => ({
      ...summaryFilter,
      page,
      size: 20,
    }),
    [summaryFilter, page],
  )

  const { data: listData, isLoading, isFetching, refetch } = useAdminTransactions(listFilter)
  const { data: summary, isLoading: summaryLoading } = useAdminTransactionSummary(summaryFilter)
  const detailQuery = useAdminTransactionDetail(panelOpen ? selectedSource : null, panelOpen ? selectedId : null)

  const items = listData?.items ?? []
  const meta = listData?.meta

  const resetPage = useCallback(() => setPage(0), [])

  const onPreset = (p: DatePreset) => {
    setPreset(p)
    resetPage()
  }

  const onExport = async () => {
    setExporting(true)
    try {
      const blob = await adminTransactionService.exportCsv(summaryFilter)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `transactions_${vnYmd().replace(/-/g, '')}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }

  const openRow = (row: TransactionRow) => {
    setSelectedSource(row.source)
    setSelectedId(row.sourceId)
    setPanelOpen(true)
  }

  const invalidateAll = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin-transactions'] })
    void queryClient.invalidateQueries({ queryKey: ['admin-transactions-summary'] })
    void refetch()
  }

  const totalPages = meta?.totalPages ?? 0
  const totalElements = meta?.totalElements ?? 0

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Lịch Sử Giao Dịch</h1>
          <p className="mt-1 text-sm text-slate-500">Xem và lọc đặt cọc, thanh toán đơn hàng</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => invalidateAll()} disabled={isFetching}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Tải lại
          </Button>
          <Button type="button" size="sm" onClick={() => void onExport()} disabled={exporting}>
            {exporting ? <Spinner size="sm" className="mr-2" /> : <Download className="mr-2 h-4 w-4" />}
            Xuất CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Tổng thực thu"
          tone="emerald"
          loading={summaryLoading}
          value={formatVnd(summary?.totalCompleted)}
        />
        <SummaryCard
          title="Đang xử lý"
          tone="amber"
          loading={summaryLoading}
          value={formatVnd(summary?.totalPending)}
        />
        <SummaryCard
          title="Đã hủy / thất bại"
          tone="red"
          loading={summaryLoading}
          value={formatVnd(summary?.totalCancelled)}
        />
        <SummaryCard
          title="Tổng giao dịch"
          tone="slate"
          loading={summaryLoading}
          value={summary != null ? String(summary.countAll) : '—'}
          isCount
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {(
              [
                { id: 'today' as const, label: 'Hôm nay' },
                { id: '7d' as const, label: '7 ngày' },
                { id: '30d' as const, label: '30 ngày' },
                { id: 'custom' as const, label: 'Tùy chọn' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onPreset(opt.id)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  preset === opt.id ? 'bg-[#1A3C6E] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {preset === 'custom' && (
            <div className="flex flex-wrap items-end gap-3">
              <label className="text-sm">
                <span className="text-slate-500">Từ ngày</span>
                <Input
                  type="date"
                  className="mt-1 w-40"
                  value={customFrom}
                  onChange={(e) => {
                    setCustomFrom(e.target.value)
                    resetPage()
                  }}
                />
              </label>
              <label className="text-sm">
                <span className="text-slate-500">Đến ngày</span>
                <Input
                  type="date"
                  className="mt-1 w-40"
                  value={customTo}
                  onChange={(e) => {
                    setCustomTo(e.target.value)
                    resetPage()
                  }}
                />
              </label>
            </div>
          )}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
            <FilterSelect
              label="Loại"
              value={source}
              onChange={(v) => {
                setSource(v)
                resetPage()
              }}
              options={[
                { value: '', label: 'Tất cả' },
                { value: 'DEPOSIT', label: 'Đặt cọc' },
                { value: 'ORDER_PAYMENT', label: 'Thanh toán đơn' },
              ]}
            />
            <FilterSelect
              label="Trạng thái"
              value={status}
              onChange={(v) => {
                setStatus(v)
                resetPage()
              }}
              options={[
                { value: '', label: 'Tất cả' },
                { value: 'completed', label: 'Thành công' },
                { value: 'pending', label: 'Đang xử lý' },
                { value: 'cancelled', label: 'Đã hủy' },
              ]}
            />
            <FilterSelect
              label="Cổng TT"
              value={gateway}
              onChange={(v) => {
                setGateway(v)
                resetPage()
              }}
              options={[
                { value: '', label: 'Tất cả' },
                { value: 'zalopay', label: 'ZaloPay' },
                { value: 'vnpay', label: 'VNPay' },
                { value: 'cash', label: 'Tiền mặt' },
              ]}
            />
            {isAdmin && (
              <FilterSelect
                label="Chi nhánh"
                value={branchId}
                onChange={(v) => {
                  setBranchId(v)
                  resetPage()
                }}
                options={[
                  { value: '', label: 'Tất cả' },
                  ...branches.map((b) => ({ value: String(b.id), label: b.name })),
                ]}
              />
            )}
            <div className="md:col-span-2 xl:col-span-2">
              <label className="text-sm text-slate-500">Tìm kiếm</label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  className="pl-9"
                  placeholder="Tên, SĐT, mã GD, mã đơn…"
                  value={keyword}
                  onChange={(e) => {
                    setKeyword(e.target.value)
                    resetPage()
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Thời gian</th>
                <th className="px-4 py-3">Loại</th>
                <th className="px-4 py-3">Khách hàng</th>
                <th className="px-4 py-3">Xe</th>
                <th className="px-4 py-3">Chi nhánh</th>
                <th className="px-4 py-3 text-right">Số tiền</th>
                <th className="hidden px-4 py-3 lg:table-cell">Cổng TT</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="hidden px-4 py-3 lg:table-cell">Mã GD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading
                ? Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={9} className="px-4 py-4">
                        <div className="h-4 rounded bg-slate-100" />
                      </td>
                    </tr>
                  ))
                : items.length === 0
                  ? (
                      <tr>
                        <td colSpan={9} className="px-4 py-12">
                          <EmptyState
                            icon={CreditCard}
                            title="Không có giao dịch nào phù hợp"
                            description="Thử đổi bộ lọc hoặc khoảng thời gian."
                          />
                        </td>
                      </tr>
                    )
                  : (
                      items.map((row) => {
                        const b = statusBucket(row)
                        return (
                          <tr
                            key={`${row.source}-${row.sourceId}`}
                            className="cursor-pointer transition-colors hover:bg-slate-50"
                            onClick={() => openRow(row)}
                          >
                            <td className="whitespace-nowrap px-4 py-3 text-slate-700">{formatDateTime(row.createdAt)}</td>
                            <td className="px-4 py-3">
                              <Badge
                                variant="default"
                                className={row.source === 'DEPOSIT' ? 'border-sky-200 bg-sky-100 text-sky-800' : 'border-orange-200 bg-orange-100 text-orange-800'}
                              >
                                {row.type}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-medium text-slate-900">{row.customerName ?? '—'}</div>
                              <div className="text-xs text-slate-500">{row.customerPhone ?? ''}</div>
                            </td>
                            <td className="max-w-[200px] px-4 py-3">
                              <div className="truncate text-slate-800">{row.vehicleTitle ?? '—'}</div>
                              <div className="truncate text-xs text-slate-500">{row.vehicleListingId ?? ''}</div>
                            </td>
                            <td className="px-4 py-3 text-slate-700">{row.branchName ?? '—'}</td>
                            <td className="px-4 py-3 text-right font-bold text-slate-900">{formatVnd(row.amount)}</td>
                            <td className="hidden px-4 py-3 lg:table-cell">
                              <Badge variant="default" className={gatewayBadgeClass(row.paymentGateway)}>
                                {gatewayLabel(row.paymentGateway)}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant="default" className={statusBadgeClass(b)}>
                                {row.statusLabel}
                              </Badge>
                            </td>
                            <td
                              className="hidden max-w-[120px] truncate font-mono text-xs text-slate-600 lg:table-cell"
                              title={row.gatewayTxnRef ?? undefined}
                            >
                              {shortenRef(row.gatewayTxnRef, 16)}
                            </td>
                          </tr>
                        )
                      })
                    )}
            </tbody>
          </table>
        </div>
        {!isLoading && totalPages > 0 && (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row">
            <p className="text-sm text-slate-500">
              Hiển thị {items.length} / {totalElements} giao dịch
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page <= 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
                Trước
              </Button>
              <span className="text-sm text-slate-600">
                Trang {page + 1} / {Math.max(1, totalPages)}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Sau
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {panelOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/30"
            aria-label="Đóng"
            onClick={() => setPanelOpen(false)}
          />
          <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-full flex-col border-l border-slate-200 bg-white shadow-xl sm:max-w-md">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <h2 className="text-lg font-semibold text-slate-900">Chi tiết giao dịch</h2>
              <button type="button" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" onClick={() => setPanelOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {detailQuery.isLoading ? (
                <div className="flex justify-center py-12">
                  <Spinner size="lg" />
                </div>
              ) : detailQuery.data ? (
                <DetailBody data={detailQuery.data} userRole={user?.role} />
              ) : (
                <p className="text-sm text-red-600">Không tải được chi tiết.</p>
              )}
            </div>
          </aside>
        </>
      )}
    </div>
  )
}

function SummaryCard(props: {
  title: string
  value: string
  loading: boolean
  tone: 'emerald' | 'amber' | 'red' | 'slate'
  isCount?: boolean
}) {
  const border =
    props.tone === 'emerald'
      ? 'border-emerald-200'
      : props.tone === 'amber'
        ? 'border-amber-200'
        : props.tone === 'red'
          ? 'border-red-200'
          : 'border-slate-200'
  return (
    <div className={`rounded-xl border ${border} bg-white p-4 shadow-sm`}>
      <p className="text-sm font-medium text-slate-500">{props.title}</p>
      {props.loading ? (
        <div className="mt-2 h-8 w-3/4 animate-pulse rounded bg-slate-100" />
      ) : (
        <p className={`mt-1 text-xl font-bold ${props.isCount ? 'text-slate-800' : 'text-slate-900'}`}>{props.value}</p>
      )}
    </div>
  )
}

function FilterSelect(props: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <label className="text-sm">
      <span className="text-slate-500">{props.label}</span>
      <select
        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#1A3C6E] focus:outline-none focus:ring-1 focus:ring-[#1A3C6E]"
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
      >
        {props.options.map((o) => (
          <option key={o.value || 'all'} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function DetailBody(props: { data: import('@/services/adminTransactions.service').TransactionDetail; userRole?: string | null }) {
  const { row, timeline, rawGatewayRef, notes } = props.data
  const bucket = statusBucket(row)
  const isManager = props.userRole === 'BranchManager'

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant="default"
          className={row.source === 'DEPOSIT' ? 'border-sky-200 bg-sky-100 text-sky-800' : 'border-orange-200 bg-orange-100 text-orange-800'}
        >
          {row.type}
        </Badge>
        <Badge variant="default" className={statusBadgeClass(bucket)}>
          {row.statusLabel}
        </Badge>
      </div>

      <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        <DetailItem label="Mã giao dịch" value={String(row.sourceId)} />
        <DetailItem label="Loại" value={row.type} />
        <DetailItem label="Số tiền" value={formatVnd(row.amount)} />
        <DetailItem label="Cổng TT" value={gatewayLabel(row.paymentGateway)} />
        <div className="sm:col-span-2">
          <dt className="text-slate-500">Mã tham chiếu</dt>
          <dd className="mt-1 break-all font-mono text-xs text-slate-800">{rawGatewayRef ?? '—'}</dd>
        </div>
      </dl>

      <section>
        <h3 className="text-sm font-semibold text-slate-800">Khách hàng</h3>
        <p className="mt-1 text-sm text-slate-700">{row.customerName ?? '—'}</p>
        <p className="text-sm text-slate-500">{row.customerPhone ?? '—'}</p>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-slate-800">Xe</h3>
        <p className="mt-1 text-sm text-slate-700">Mã xe: {row.vehicleListingId ?? '—'}</p>
        <p className="text-sm text-slate-700">{row.vehicleTitle ?? '—'}</p>
        <p className="text-sm text-slate-500">CN: {row.branchName ?? '—'}</p>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-slate-800">{row.source === 'DEPOSIT' ? 'Đặt cọc' : 'Đơn hàng'}</h3>
        {row.source === 'DEPOSIT' && (
          <p className="mt-1 text-sm text-slate-700">
            Mã cọc: {row.depositId ?? row.sourceId}
            {isManager ? (
              <>
                {' '}
                ·{' '}
                <Link to="/manager/deposits" className="text-[#1A3C6E] underline">
                  Mở danh sách cọc
                </Link>
              </>
            ) : (
              <span className="ml-2 text-slate-400">(Admin: tra cứu nội bộ theo mã)</span>
            )}
          </p>
        )}
        {row.source === 'ORDER_PAYMENT' && (
          <p className="mt-1 text-sm text-slate-700">
            Mã đơn: {row.orderId ?? '—'}
            {isManager ? (
              <>
                {' '}
                ·{' '}
                <Link to="/manager/orders" className="text-[#1A3C6E] underline">
                  Mở đơn hàng
                </Link>
              </>
            ) : (
              <span className="ml-2 text-slate-400">(Admin: tra cứu nội bộ theo mã)</span>
            )}
          </p>
        )}
      </section>

      <section>
        <h3 className="text-sm font-semibold text-slate-800">Dòng thời gian</h3>
        <ul className="relative mt-3 space-y-4 border-l border-slate-200 pl-4">
          {timeline.map((ev, i) => (
            <li key={i} className="relative">
              <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-[#1A3C6E]" />
              <p className="font-medium text-slate-800">{ev.event}</p>
              <p className="text-xs text-slate-500">{ev.at ? formatDateTime(ev.at) : '—'}</p>
              {ev.detail ? <p className="mt-1 text-sm text-slate-600">{ev.detail}</p> : null}
            </li>
          ))}
        </ul>
      </section>

      {notes ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <strong>Ghi chú:</strong> {notes}
        </div>
      ) : null}
    </div>
  )
}

function DetailItem(props: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-slate-500">{props.label}</dt>
      <dd className="font-medium text-slate-900">{props.value}</dd>
    </div>
  )
}
