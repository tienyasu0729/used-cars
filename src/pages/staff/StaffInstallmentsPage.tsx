import { useState, useMemo, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Search, Eye, Send, XCircle, CheckCircle, Loader2, PlusCircle } from 'lucide-react'
import { installmentService, type InstallmentApplicationDTO } from '@/services/installment.service'
import { useToastStore } from '@/store/toastStore'
import { formatPriceNumber } from '@/utils/format'
import { Pagination, ConfirmDialog } from '@/components/ui'
import { useVehicles } from '@/hooks/useVehicles'

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  DRAFT: { label: 'Bản nháp', cls: 'bg-slate-100 text-slate-600 border-slate-200' },
  PENDING_DOCUMENT: { label: 'Chờ hồ sơ', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
  BANK_PROCESSING: { label: 'Ngân hàng xử lý', cls: 'bg-blue-100 text-blue-700 border-blue-200' },
  APPROVED: { label: 'Đã duyệt', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  REJECTED: { label: 'Từ chối', cls: 'bg-red-100 text-red-700 border-red-200' },
  DEPOSIT_PENDING: { label: 'Chờ cọc', cls: 'bg-purple-100 text-purple-700 border-purple-200' },
  DEPOSIT_PAID: { label: 'Đã cọc', cls: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  COMPLETED: { label: 'Hoàn tất', cls: 'bg-green-100 text-green-800 border-green-200' },
  CANCELLED: { label: 'Đã hủy', cls: 'bg-slate-100 text-slate-500 border-slate-200' },
}

const TABS = [
  { key: '', label: 'Tất cả' },
  { key: 'PENDING_DOCUMENT', label: 'Chờ hồ sơ' },
  { key: 'BANK_PROCESSING', label: 'Đang xử lý' },
  { key: 'APPROVED', label: 'Đã duyệt' },
  { key: 'REJECTED', label: 'Từ chối' },
  { key: 'COMPLETED', label: 'Hoàn tất' },
]

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] ?? { label: status, cls: 'bg-slate-100 text-slate-600' }
  return <span className={`rounded px-2.5 py-1 text-xs font-medium border ${s.cls}`}>{s.label}</span>
}

export function StaffInstallmentsPage() {
  const navigate = useNavigate()
  const [apps, setApps] = useState<InstallmentApplicationDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedApp, setSelectedApp] = useState<InstallmentApplicationDTO | null>(null)
  const [confirmAction, setConfirmAction] = useState<{ type: string; id: number } | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [showVehiclePicker, setShowVehiclePicker] = useState(false)
  const toast = useToastStore()

  const fetchApps = useCallback(async () => {
    setLoading(true)
    try {
      const data = await installmentService.getAllApplications(activeTab || undefined)
      setApps(data)
    } catch {
      toast.addToast('error', 'Không thể tải danh sách hồ sơ trả góp')
    } finally {
      setLoading(false)
    }
  }, [activeTab, toast])

  useEffect(() => { fetchApps() }, [fetchApps])

  const filtered = useMemo(() => {
    if (!search.trim()) return apps
    const q = search.toLowerCase()
    return apps.filter((a) =>
      (a.fullName ?? '').toLowerCase().includes(q) ||
      (a.customerName ?? '').toLowerCase().includes(q) ||
      (a.vehicleTitle ?? '').toLowerCase().includes(q) ||
      String(a.id).includes(q),
    )
  }, [apps, search])

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page, pageSize])

  const totalPages = Math.ceil(filtered.length / pageSize) || 1

  const handleAction = async () => {
    if (!confirmAction) return
    setActionLoading(true)
    try {
      if (confirmAction.type === 'appraise') {
        await installmentService.appraiseApplication(confirmAction.id)
        toast.addToast('success', 'Đã gửi ngân hàng thẩm định')
      } else if (confirmAction.type === 'cancel') {
        await installmentService.cancelApplication(confirmAction.id)
        toast.addToast('success', 'Đã hủy hồ sơ')
      } else if (confirmAction.type === 'complete') {
        await installmentService.completeApplication(confirmAction.id)
        toast.addToast('success', 'Đã hoàn tất hồ sơ')
      }
      setConfirmAction(null)
      setSelectedApp(null)
      fetchApps()
    } catch (err: unknown) {
      const apiErr = err as { errorCode?: string; message?: string }
      if (apiErr?.errorCode === 'BANK_CONNECTION_ERROR') {
        toast.addToast('error', 'Không thể kết nối ngân hàng. Vui lòng thử lại sau.')
      } else if (apiErr?.errorCode === 'BANK_API_ERROR') {
        toast.addToast('error', 'Ngân hàng trả về lỗi. Vui lòng liên hệ quản trị.')
      } else {
        toast.addToast('error', apiErr?.message || 'Thao tác thất bại')
      }
    } finally {
      setActionLoading(false)
    }
  }

  const statCounts = useMemo(() => ({
    total: apps.length,
    pending: apps.filter((a) => a.status === 'PENDING_DOCUMENT').length,
    processing: apps.filter((a) => a.status === 'BANK_PROCESSING').length,
    approved: apps.filter((a) => a.status === 'APPROVED' || a.status === 'DEPOSIT_PAID').length,
  }), [apps])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Hồ Sơ Trả Góp</h2>
          <p className="text-sm text-slate-500">Quản lý hồ sơ mua xe trả góp từ khách hàng</p>
        </div>
        <button onClick={() => setShowVehiclePicker(true)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary/90 transition-colors cursor-pointer">
          <PlusCircle className="h-4 w-4" /> Tạo hồ sơ mới
        </button>
      </div>

      {showVehiclePicker && (
        <VehiclePickerModal
          onSelect={(vId) => { setShowVehiclePicker(false); navigate(`/staff/installments/create/${vId}`) }}
          onClose={() => setShowVehiclePicker(false)}
        />
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Tổng hồ sơ</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{statCounts.total}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Chờ xử lý</p>
          <p className="mt-1 text-2xl font-bold text-amber-600">{statCounts.pending}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Đang thẩm định</p>
          <p className="mt-1 text-2xl font-bold text-blue-600">{statCounts.processing}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Đã duyệt / Cọc</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">{statCounts.approved}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-2 overflow-x-auto border-b border-slate-200 flex-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => { setActiveTab(t.key); setPage(1) }}
              className={`border-b-2 px-4 py-3 text-sm font-bold whitespace-nowrap ${
                activeTab === t.key ? 'border-[#1A3C6E] text-[#1A3C6E]' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >{t.label}</button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Tìm tên KH, xe, mã..."
            className="rounded-lg border border-slate-300 py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-3 text-slate-500">Đang tải...</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-xs font-bold uppercase text-slate-500">MÃ</th>
                  <th className="px-5 py-3 text-xs font-bold uppercase text-slate-500">KHÁCH HÀNG</th>
                  <th className="px-5 py-3 text-xs font-bold uppercase text-slate-500">XE</th>
                  <th className="px-5 py-3 text-xs font-bold uppercase text-slate-500">SỐ TIỀN VAY</th>
                  <th className="px-5 py-3 text-xs font-bold uppercase text-slate-500">TRẠNG THÁI</th>
                  <th className="px-5 py-3 text-xs font-bold uppercase text-slate-500">NGÀY TẠO</th>
                  <th className="px-5 py-3 text-xs font-bold uppercase text-slate-500 text-right">THAO TÁC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.length === 0 ? (
                  <tr><td colSpan={7} className="px-5 py-12 text-center text-sm text-slate-400">Không có hồ sơ nào</td></tr>
                ) : paginated.map((a) => (
                  <tr key={a.id} className="transition-colors hover:bg-slate-50/50">
                    <td className="px-5 py-3 text-sm font-semibold text-primary">#{a.id}</td>
                    <td className="px-5 py-3">
                      <p className="text-sm font-medium text-slate-900">{a.customerName || a.fullName || '—'}</p>
                      <p className="text-xs text-slate-500">{a.customerPhone || a.phoneNumber || ''}</p>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-700 max-w-[200px] truncate">{a.vehicleTitle || `Xe #${a.vehicleId}`}</td>
                    <td className="px-5 py-3 text-sm font-semibold text-slate-900">
                      {a.loanAmount ? `${formatPriceNumber(a.loanAmount)} đ` : '—'}
                    </td>
                    <td className="px-5 py-3"><StatusBadge status={a.status} /></td>
                    <td className="px-5 py-3 text-xs text-slate-500">{new Date(a.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => setSelectedApp(a)} className="rounded-lg bg-blue-100 p-2 text-blue-700 hover:bg-blue-200" title="Chi tiết">
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} total={filtered.length} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1) }} label="hồ sơ" />

      {selectedApp && (
        <DetailModal
          app={selectedApp}
          onClose={() => setSelectedApp(null)}
          onAppraise={(id) => setConfirmAction({ type: 'appraise', id })}
          onCancel={(id) => setConfirmAction({ type: 'cancel', id })}
          onComplete={(id) => setConfirmAction({ type: 'complete', id })}
        />
      )}

      <ConfirmDialog
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        title={confirmAction?.type === 'appraise' ? 'Gửi ngân hàng thẩm định' : confirmAction?.type === 'cancel' ? 'Hủy hồ sơ' : 'Xác nhận hoàn tất'}
        message={
          confirmAction?.type === 'appraise'
            ? 'Gửi hồ sơ này đến ngân hàng để thẩm định tín dụng?'
            : confirmAction?.type === 'cancel'
              ? 'Hủy hồ sơ trả góp này? Thao tác không thể hoàn tác.'
              : 'Xác nhận hồ sơ đã hoàn tất, xe sẽ chuyển sang Sold?'
        }
        confirmLabel={confirmAction?.type === 'cancel' ? 'Hủy hồ sơ' : 'Xác nhận'}
        onConfirm={handleAction}
        loading={actionLoading}
      />
    </div>
  )
}

function DetailModal({
  app, onClose, onAppraise, onCancel, onComplete,
}: {
  app: InstallmentApplicationDTO
  onClose: () => void
  onAppraise: (id: number) => void
  onCancel: (id: number) => void
  onComplete: (id: number) => void
}) {
  const sections = [
    { title: 'Thông tin cá nhân', rows: [
      { label: 'Họ tên', value: app.fullName },
      { label: 'CCCD/CMND', value: app.identityNumber },
      { label: 'Ngày sinh', value: app.dob },
      { label: 'SĐT', value: app.phoneNumber },
      { label: 'Email', value: app.email },
    ]},
    { title: 'Nghề nghiệp', rows: [
      { label: 'Loại hình', value: app.employmentType },
      { label: 'Công ty', value: app.companyName },
      { label: 'Thu nhập/tháng', value: app.monthlyIncome ? `${formatPriceNumber(app.monthlyIncome)} đ` : null },
    ]},
    { title: 'Khoản vay', rows: [
      { label: 'Giá xe', value: app.vehiclePrice ? `${formatPriceNumber(app.vehiclePrice)} đ` : null },
      { label: 'Trả trước', value: app.prepaymentAmount ? `${formatPriceNumber(app.prepaymentAmount)} đ` : null },
      { label: 'Số tiền vay', value: app.loanAmount ? `${formatPriceNumber(app.loanAmount)} đ` : null },
      { label: 'Kỳ hạn', value: app.loanTermMonths ? `${app.loanTermMonths} tháng` : null },
    ]},
  ]

  const showAppraise = app.status === 'PENDING_DOCUMENT' || app.status === 'DRAFT'
  const showCancel = app.status !== 'COMPLETED' && app.status !== 'CANCELLED'
  const showComplete = app.status === 'APPROVED' || app.status === 'DEPOSIT_PAID'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold text-slate-900">Hồ sơ #{app.id}</h3>
            <StatusBadge status={app.status} />
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">✕</button>
        </div>

        <div className="space-y-6 p-6">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Xe</p>
            <p className="text-base font-bold text-slate-900">{app.vehicleTitle || `Xe #${app.vehicleId}`}</p>
            <p className="text-sm text-slate-500 mt-1">Khách: {app.customerName || app.fullName || '—'} · {app.customerPhone || app.phoneNumber || ''}</p>
          </div>

          {app.bankLoanId && (
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm font-semibold text-blue-800">Bank Loan ID: {app.bankLoanId}</p>
              {app.bankPdfUrl && (
                <a href={app.bankPdfUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-sm text-blue-600 hover:underline">
                  Xem PDF phê duyệt →
                </a>
              )}
            </div>
          )}

          {app.rejectionReason && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-semibold text-red-800">Lý do từ chối:</p>
              <p className="text-sm text-red-700">{app.rejectionReason}</p>
            </div>
          )}

          {sections.map((s) => (
            <div key={s.title}>
              <h4 className="mb-3 text-sm font-bold text-slate-700">{s.title}</h4>
              <div className="rounded-xl border border-slate-200 divide-y divide-slate-100">
                {s.rows.map((r) => (
                  <div key={r.label} className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-sm text-slate-500">{r.label}</span>
                    <span className="text-sm font-medium text-slate-900">{r.value || '—'}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {app.documents && app.documents.length > 0 && (
            <div>
              <h4 className="mb-3 text-sm font-bold text-slate-700">Tài liệu đã upload ({app.documents.length})</h4>
              <div className="grid gap-2 sm:grid-cols-2">
                {app.documents.map((d) => (
                  <a key={d.id} href={d.documentUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg border border-slate-200 p-3 hover:bg-slate-50">
                    <FileText className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-primary hover:underline">{d.documentType}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 p-6">
          {showAppraise && (
            <button onClick={() => onAppraise(app.id)} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700">
              <Send className="h-4 w-4" /> Gửi thẩm định
            </button>
          )}
          {showComplete && (
            <button onClick={() => onComplete(app.id)} className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700">
              <CheckCircle className="h-4 w-4" /> Hoàn tất
            </button>
          )}
          {showCancel && (
            <button onClick={() => onCancel(app.id)} className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 hover:bg-red-100">
              <XCircle className="h-4 w-4" /> Hủy hồ sơ
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function VehiclePickerModal({ onSelect, onClose }: { onSelect: (id: number) => void; onClose: () => void }) {
  const [q, setQ] = useState('')
  const { vehicles, isLoading } = useVehicles({ size: 20, q: q || undefined, status: 'Available' })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="mx-4 max-h-[80vh] w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="border-b border-slate-200 p-5">
          <h3 className="text-lg font-bold text-slate-900">Chọn xe để tạo hồ sơ trả góp</h3>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Tìm tên xe..."
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
        </div>
        <div className="max-h-[50vh] overflow-y-auto divide-y divide-slate-100">
          {isLoading && <div className="py-8 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" /></div>}
          {!isLoading && vehicles.length === 0 && <p className="py-8 text-center text-sm text-slate-400">Không tìm thấy xe</p>}
          {vehicles.map(v => (
            <button key={v.id} type="button" onClick={() => onSelect(v.id)}
              className="flex w-full items-center gap-3 px-5 py-3 text-left hover:bg-primary/5 transition-colors cursor-pointer">
              {v.thumbnail && <img src={v.thumbnail} alt={v.title} className="h-12 w-18 rounded-lg object-cover" />}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900 truncate">{v.title}</p>
                <p className="text-xs text-slate-500">{formatPriceNumber(v.price)} VNĐ</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
