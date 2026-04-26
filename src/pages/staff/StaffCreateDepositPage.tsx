import { useForm } from 'react-hook-form'
import { useState, useEffect, useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Calendar, UserPlus, FileText, Info, AlertCircle, X } from 'lucide-react'
import { useInventory } from '@/hooks/useInventory'
import { useStaffOrManagerBasePath } from '@/hooks/useStaffOrManagerBasePath'
import { useStaffCustomerOptions } from '@/hooks/useStaffCustomerOptions'
import { depositApi } from '@/services/depositApi'
import { useToastStore } from '@/store/toastStore'
import { useQueryClient } from '@tanstack/react-query'
import { notifyInventoryChanged } from '@/utils/inventorySync'
import { Button } from '@/components/ui'
import { CustomerSearchSelect } from '@/features/staff/components/CustomerSearchSelect'
import { VehicleSearchSelect } from '@/features/staff/components/VehicleSearchSelect'
import { usePaymentDepositMethods } from '@/hooks/usePaymentDepositMethods'
import { ShowroomCustomerModal, type ShowroomCustomerData } from '@/features/staff/components/ShowroomCustomerModal'

const schema = z.object({
  vehicleId: z.string().min(1, 'Chọn xe'),
  customerId: z.string().optional(),
  amount: z.number().min(1000000, 'Tối thiểu 1.000.000 VND'),
  paymentMethod: z.string().min(1, 'Chọn phương thức'),
  depositDate: z.string().min(1, 'Chọn ngày đặt cọc'),
  expiryDate: z.string().min(1, 'Chọn hạn hết cọc'),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

function toDateStr(d: Date) {
  return d.toISOString().slice(0, 10)
}

export function StaffCreateDepositPage() {
  const { dashboard, orders } = useStaffOrManagerBasePath()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const toast = useToastStore()
  const queryClient = useQueryClient()
  const { data: inventory, available } = useInventory()
  const { data: customerRows = [] } = useStaffCustomerOptions()
  const branchVehicles = ((available?.length ? available : inventory) ?? []).filter(
    (v) => !v.deleted,
  )
  const { data: pmCfg } = usePaymentDepositMethods(true)

  const [showroomCustomer, setShowroomCustomer] = useState<ShowroomCustomerData | null>(null)
  const [showroomModalOpen, setShowroomModalOpen] = useState(false)

  const methodOptions = useMemo(() => {
    if (!pmCfg) return [] as { value: string; label: string }[]
    const o: { value: string; label: string }[] = []
    if (pmCfg.cash) o.push({ value: 'cash', label: 'Tiền mặt' })
    if (pmCfg.vnpay) o.push({ value: 'vnpay', label: 'VNPay' })
    if (pmCfg.zalopay) o.push({ value: 'zalopay', label: 'ZaloPay' })
    return o
  }, [pmCfg])

  const today = toDateStr(new Date())
  const defaultExpiry = toDateStr(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      vehicleId: '',
      customerId: '',
      amount: 10000000,
      paymentMethod: 'cash',
      depositDate: today,
      expiryDate: defaultExpiry,
      notes: '',
    },
  })

  useEffect(() => {
    if (methodOptions.length === 0) return
    const cur = form.getValues('paymentMethod')
    if (!methodOptions.some((m) => m.value === cur)) {
      form.setValue('paymentMethod', methodOptions[0].value)
    }
  }, [methodOptions, form])

  useEffect(() => {
    const vid = searchParams.get('vehicleId')
    if (vid && !form.getValues('vehicleId')) {
      form.setValue('vehicleId', vid)
    }
  }, [searchParams, form])

  const filteredVehicles = branchVehicles
  const filteredCustomers = customerRows

  const hasCustomer = !!(form.watch('customerId') || showroomCustomer)
  const customerError = !hasCustomer ? 'Chọn hoặc thêm khách hàng' : undefined

  const onSubmit = form.handleSubmit(async (data) => {
    if (!data.customerId && !showroomCustomer) {
      toast.addToast('error', 'Vui lòng chọn hoặc thêm khách hàng.')
      return
    }
    try {
      const res = await depositApi.create({
        vehicleId: Number(data.vehicleId),
        customerId: showroomCustomer ? undefined : Number(data.customerId),
        showroomCustomer: showroomCustomer ?? undefined,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        depositDate: data.depositDate,
        expiryDate: data.expiryDate,
        note: data.notes?.trim() ? data.notes.trim() : undefined,
      })
      queryClient.invalidateQueries({ queryKey: ['deposits'] })
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      notifyInventoryChanged()
      toast.addToast('success', `Đặt cọc #${res.id} đã tạo thành công`)
      navigate(dashboard)
    } catch (err: unknown) {
      const apiErr = err as { message?: string; errorCode?: string }
      const detail = apiErr?.message?.trim()
        ? apiErr.message
        : 'Không thể tạo đặt cọc. Vui lòng thử lại.'
      console.error('[CreateDeposit] API error:', err)
      toast.addToast('error', detail)
    }
  })

  const handleShowroomConfirm = (data: ShowroomCustomerData) => {
    setShowroomCustomer(data)
    form.setValue('customerId', '')
    setShowroomModalOpen(false)
  }

  const handleClearShowroom = () => {
    setShowroomCustomer(null)
  }

  const handleSelectCustomer = (id: string) => {
    form.setValue('customerId', id)
    setShowroomCustomer(null)
  }

  return (
    <div className="space-y-6">
      <nav className="text-sm text-slate-500">
        <Link to={dashboard} className="hover:text-[#1A3C6E]">Dashboard</Link>
        <span className="mx-2">/</span>
        <Link to={orders} className="hover:text-[#1A3C6E]">Hợp đồng</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-900">Tạo Đặt Cọc</span>
      </nav>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tạo Phiếu Đặt Cọc</h1>
        <p className="text-sm text-slate-500">Điền thông tin chi tiết để giữ chỗ xe cho khách hàng</p>
      </div>
      <form onSubmit={onSubmit} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Chọn Xe <span className="text-red-500">*</span></label>
              <VehicleSearchSelect
                vehicles={filteredVehicles ?? []}
                value={form.watch('vehicleId')}
                onChange={(id) => form.setValue('vehicleId', id)}
                placeholder="Tìm kiếm xe theo tên hoặc mã VIN..."
                error={form.formState.errors.vehicleId?.message}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Số tiền đặt cọc (VND) <span className="text-red-500">*</span></label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₫</span>
                <input
                  type="number"
                  {...form.register('amount', { valueAsNumber: true })}
                  placeholder="Ví dụ: 20,000,000"
                  className="w-full rounded-lg border border-slate-200 py-2 pl-8 pr-3 text-sm"
                />
              </div>
              {form.formState.errors.amount && (
                <p className="mt-1 text-xs text-red-600">{form.formState.errors.amount.message}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Ngày đặt cọc <span className="text-red-500">*</span></label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  {...form.register('depositDate', {
                    onChange: (e) => {
                      const d = new Date(e.target.value)
                      d.setDate(d.getDate() + 7)
                      form.setValue('expiryDate', toDateStr(d))
                    },
                  })}
                  className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-10 text-sm"
                />
                <Calendar className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
              {form.formState.errors.depositDate && (
                <p className="mt-1 text-xs text-red-600">{form.formState.errors.depositDate.message}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Ghi chú</label>
              <textarea
                {...form.register('notes')}
                placeholder="Nhập ghi chú thêm về điều kiện đặt cọc hoặc yêu cầu của khách..."
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                rows={3}
              />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Khách hàng <span className="text-red-500">*</span></label>
              {showroomCustomer ? (
                <div className="flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2">
                  <div className="flex-1 text-sm">
                    <p className="font-medium text-emerald-800">{showroomCustomer.fullName}</p>
                    <p className="text-emerald-600">{showroomCustomer.phone} &middot; {showroomCustomer.email}</p>
                  </div>
                  <button type="button" onClick={handleClearShowroom} className="rounded p-1 text-emerald-600 hover:bg-emerald-100">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <CustomerSearchSelect
                      customers={filteredCustomers}
                      value={form.watch('customerId') ?? ''}
                      onChange={handleSelectCustomer}
                      placeholder="Nhập tên hoặc SĐT để tìm..."
                      error={customerError}
                    />
                  </div>
                  <Button type="button" variant="outline" className="h-[38px] shrink-0 px-3" title="Thêm khách hàng" onClick={() => setShowroomModalOpen(true)}>
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Phương thức thanh toán</label>
              <select
                {...form.register('paymentMethod')}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                disabled={methodOptions.length === 0}
              >
                {methodOptions.map((pm) => (
                  <option key={pm.value} value={pm.value}>
                    {pm.label}
                  </option>
                ))}
              </select>
              {methodOptions.length === 0 && (
                <p className="mt-1 text-xs text-amber-700">Chưa có phương thức nào được bật trong cấu hình thanh toán.</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Hạn hết cọc <span className="text-red-500">*</span></label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  {...form.register('expiryDate')}
                  className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-10 text-sm"
                />
                <Calendar className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
              {form.formState.errors.expiryDate && (
                <p className="mt-1 text-xs text-red-600">{form.formState.errors.expiryDate.message}</p>
              )}
            </div>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-6">
          <button type="button" onClick={() => navigate(orders)} className="text-sm text-slate-500 hover:text-slate-700">
            Hủy bỏ
          </button>
          <Button type="submit">
            <FileText className="h-4 w-4" />
            Tạo Đặt Cọc
          </Button>
        </div>
      </form>
      <ShowroomCustomerModal isOpen={showroomModalOpen} onClose={() => setShowroomModalOpen(false)} onConfirm={handleShowroomConfirm} />
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex gap-3 rounded-lg bg-blue-50 p-4">
          <Info className="h-5 w-5 shrink-0 text-[#1A3C6E]" />
          <div>
            <p className="text-sm font-semibold text-slate-900">Quy định đặt cọc</p>
            <p className="text-xs text-slate-600">Số tiền tối thiểu là 1,000,000 VND cho mỗi xe.</p>
          </div>
        </div>
        <div className="flex gap-3 rounded-lg bg-amber-50 p-4">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <p className="text-sm font-semibold text-slate-900">Thời hạn giữ chỗ</p>
            <p className="text-xs text-slate-600">Mặc định là 07 ngày kể từ ngày đặt cọc thành công.</p>
          </div>
        </div>
        <div className="flex gap-3 rounded-lg bg-blue-50 p-4">
          <FileText className="h-5 w-5 shrink-0 text-[#1A3C6E]" />
          <div>
            <p className="text-sm font-semibold text-slate-900">In phiếu thu</p>
            <p className="text-xs text-slate-600">Hệ thống tự động tạo file PDF sau khi lưu thành công.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
