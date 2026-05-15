import { useForm } from 'react-hook-form'
import { useState, useEffect, useMemo, useRef } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { FileText } from 'lucide-react'
import { useInventory } from '@/hooks/useInventory'
import { useStaffOrManagerBasePath } from '@/hooks/useStaffOrManagerBasePath'
import { useStaffCustomerOptions } from '@/hooks/useStaffCustomerOptions'
import { depositApi } from '@/services/depositApi'
import { useToastStore } from '@/store/toastStore'
import { useQueryClient } from '@tanstack/react-query'
import { notifyInventoryChanged } from '@/utils/inventorySync'
import { Button } from '@/components/ui'
import { usePaymentDepositMethods } from '@/hooks/usePaymentDepositMethods'
import { ShowroomCustomerModal, type ShowroomCustomerData } from '@/features/staff/components/ShowroomCustomerModal'
import { OtpVerificationStep } from '@/components/otp/OtpVerificationStep'
import { maskPhone } from '@/utils/maskPhone'
import { DepositInfoCards } from './DepositInfoCards'
import { DepositFormFields } from './DepositFormFields'

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
  const [showOtp, setShowOtp] = useState(false)
  const depositPayloadRef = useRef<Parameters<typeof depositApi.create>[0] | null>(null)

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

  const watchedCustomerId = form.watch('customerId')
  const customerPhone = useMemo(() => {
    if (showroomCustomer) return showroomCustomer.phone
    if (watchedCustomerId) {
      const found = filteredCustomers.find((c) => c.id === watchedCustomerId)
      return found?.phone ?? ''
    }
    return ''
  }, [showroomCustomer, filteredCustomers, watchedCustomerId])

  const onSubmit = form.handleSubmit(async (data) => {
    if (!data.customerId && !showroomCustomer) {
      toast.addToast('error', 'Vui lòng chọn hoặc thêm khách hàng.')
      return
    }
    if (!customerPhone) {
      toast.addToast('error', 'Khách hàng chưa có số điện thoại. Vui lòng cập nhật thông tin.')
      return
    }
    depositPayloadRef.current = {
      vehicleId: Number(data.vehicleId),
      customerId: showroomCustomer ? undefined : Number(data.customerId),
      showroomCustomer: showroomCustomer ?? undefined,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      depositDate: data.depositDate,
      expiryDate: data.expiryDate,
      note: data.notes?.trim() ? data.notes.trim() : undefined,
    }
    setShowOtp(true)
  })

  const handleOtpVerified = async () => {
    if (!depositPayloadRef.current) return
    try {
      const res = await depositApi.create(depositPayloadRef.current)
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
      toast.addToast('error', detail)
      setShowOtp(false)
    }
  }

  const handleShowroomConfirm = (data: ShowroomCustomerData) => {
    setShowroomCustomer(data)
    form.setValue('customerId', '')
    setShowroomModalOpen(false)
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
      {showOtp ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <OtpVerificationStep
            phone={customerPhone}
            maskedPhone={maskPhone(customerPhone)}
            referenceType="deposit"
            onVerified={handleOtpVerified}
            onBack={() => setShowOtp(false)}
          />
        </div>
      ) : (
        <>
          <form onSubmit={onSubmit} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <DepositFormFields
              form={form}
              filteredVehicles={filteredVehicles}
              filteredCustomers={filteredCustomers}
              showroomCustomer={showroomCustomer}
              customerError={customerError}
              methodOptions={methodOptions}
              onClearShowroom={() => setShowroomCustomer(null)}
              onSelectCustomer={(id) => { form.setValue('customerId', id); setShowroomCustomer(null) }}
              onOpenShowroomModal={() => setShowroomModalOpen(true)}
              toDateStr={toDateStr}
            />
            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-6">
              <button type="button" onClick={() => navigate(orders)} className="text-sm text-slate-500 hover:text-slate-700">Hủy bỏ</button>
              <Button type="submit">
                <FileText className="h-4 w-4" />
                Tạo Đặt Cọc
              </Button>
            </div>
          </form>
          <ShowroomCustomerModal isOpen={showroomModalOpen} onClose={() => setShowroomModalOpen(false)} onConfirm={handleShowroomConfirm} />
          <DepositInfoCards />
        </>
      )}
    </div>
  )
}
