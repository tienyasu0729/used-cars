import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronRight, ChevronLeft, Check, Info } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useInventory } from '@/hooks/useInventory'
import { useStaffOrManagerBasePath } from '@/hooks/useStaffOrManagerBasePath'
import { useStaffCustomerOptions } from '@/hooks/useStaffCustomerOptions'
import { orderApi } from '@/services/orderApi'
import { depositApi } from '@/services/deposit.service'
import { useToastStore } from '@/store/toastStore'
import { Button } from '@/components/ui'
import { formatPrice } from '@/utils/format'
import { CreateOrderStepDetails } from '@/features/staff/components/CreateOrderStepDetails'
import { VehicleSearchSelect } from '@/features/staff/components/VehicleSearchSelect'
import { CustomerSearchSelect } from '@/features/staff/components/CustomerSearchSelect'

const STEPS = ['Chọn Xe', 'Khách Hàng', 'Chi Tiết', 'Xác Nhận']

export function StaffCreateOrderPage() {
  const { dashboard, orders } = useStaffOrManagerBasePath()
  const [step, setStep] = useState(1)
  const [vehicleId, setVehicleId] = useState('')
  const [customerId, setCustomerId] = useState('')
  const [totalPrice, setTotalPrice] = useState(0)
  const [depositId, setDepositId] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [notes, setNotes] = useState('')
  const [depositTouched, setDepositTouched] = useState(false)
  const navigate = useNavigate()
  const toast = useToastStore()
  const queryClient = useQueryClient()
  const { data: inventory, available } = useInventory()
  const { data: customerRows = [] } = useStaffCustomerOptions()
  const branchVehicles = (available?.length ? available : inventory) ?? []

  const selectedVehicle = branchVehicles.find((v) => String(v.id) === vehicleId)
  const vehiclePrice = selectedVehicle?.price ?? 0
  const selectedCustomer = customerRows.find((c) => c.id === customerId)

  const { data: depositListResult, isLoading: depositsLoading } = useQuery({
    queryKey: ['deposits', 'order-create', vehicleId, customerId],
    queryFn: () => depositApi.list({ size: 400 }),
    enabled: Boolean(vehicleId && customerId && step >= 3),
  })

  const matchedConfirmedDeposits = useMemo(() => {
    const items = depositListResult?.items ?? []
    if (!vehicleId || !customerId) return []
    return items.filter(
      (d) =>
        String(d.vehicleId) === String(vehicleId) &&
        String(d.customerId) === String(customerId) &&
        d.status === 'Confirmed' &&
        !(d.orderId != null && String(d.orderId).trim() !== ''),
    )
  }, [depositListResult?.items, vehicleId, customerId])

  const suggestedDeposit = useMemo(() => {
    if (matchedConfirmedDeposits.length === 0) return undefined
    return [...matchedConfirmedDeposits].sort(
      (a, b) => new Date(b.depositDate).getTime() - new Date(a.depositDate).getTime(),
    )[0]
  }, [matchedConfirmedDeposits])

  const resolvedDepositAmount = useMemo(() => {
    const trimmed = depositId.trim()
    if (!trimmed) return null
    const dep = depositListResult?.items?.find((d) => d.id === trimmed)
    if (
      !dep ||
      String(dep.vehicleId) !== String(vehicleId) ||
      String(dep.customerId) !== String(customerId) ||
      dep.status !== 'Confirmed'
    ) {
      return null
    }
    return dep.amount
  }, [depositId, depositListResult?.items, vehicleId, customerId])

  useEffect(() => {
    setDepositTouched(false)
  }, [vehicleId, customerId])

  useEffect(() => {
    if (step < 3 || !vehicleId || !customerId || depositTouched) return
    const vp = selectedVehicle?.price ?? 0
    if (suggestedDeposit) {
      setDepositId(suggestedDeposit.id)
      setTotalPrice(Math.max(1, vp - suggestedDeposit.amount))
    } else {
      setDepositId('')
      setTotalPrice(vp > 0 ? vp : 0)
    }
  }, [step, vehicleId, customerId, suggestedDeposit, selectedVehicle?.price, depositTouched])

  useEffect(() => {
    if (!depositTouched || step < 3) return
    const vp = selectedVehicle?.price ?? 0
    const trimmed = depositId.trim()
    if (!trimmed) {
      setTotalPrice(vp > 0 ? vp : 0)
      return
    }
    const dep = depositListResult?.items?.find((d) => d.id === trimmed)
    if (
      dep &&
      String(dep.vehicleId) === String(vehicleId) &&
      String(dep.customerId) === String(customerId) &&
      dep.status === 'Confirmed'
    ) {
      setTotalPrice(Math.max(1, vp - dep.amount))
    }
  }, [
    depositId,
    depositTouched,
    step,
    vehicleId,
    customerId,
    depositListResult?.items,
    selectedVehicle?.price,
  ])

  const handleDepositIdChange = (v: string) => {
    setDepositTouched(true)
    setDepositId(v)
  }

  const validateDepositForOrder = (): boolean => {
    const trimmed = depositId.trim()
    if (!trimmed) return true
    const dep = depositListResult?.items?.find((d) => d.id === trimmed)
    if (!dep) {
      toast.addToast('error', 'Không tìm thấy phiếu cọc với ID đã nhập.')
      return false
    }
    if (String(dep.vehicleId) !== String(vehicleId) || String(dep.customerId) !== String(customerId)) {
      toast.addToast('error', 'Phiếu cọc không khớp khách hàng hoặc xe đã chọn.')
      return false
    }
    if (dep.status !== 'Confirmed') {
      toast.addToast('error', 'Phiếu cọc chưa ở trạng thái đã xác nhận.')
      return false
    }
    if (dep.orderId != null && String(dep.orderId).trim() !== '') {
      toast.addToast('error', 'Phiếu cọc đã gắn với đơn hàng khác.')
      return false
    }
    return true
  }

  const handleStep4 = async () => {
    if (!customerId || !vehicleId) {
      toast.addToast('error', 'Thiếu khách hoặc xe.')
      return
    }
    if (!validateDepositForOrder()) return
    const tid = Number(totalPrice)
    if (!Number.isFinite(tid) || tid < 1) {
      toast.addToast('error', 'Tổng giá đơn không hợp lệ.')
      return
    }
    const dep = depositId.trim() === '' ? undefined : Number(depositId)
    if (depositId.trim() !== '' && !Number.isFinite(dep)) {
      toast.addToast('error', 'ID cọc không hợp lệ.')
      return
    }
    try {
      const res = await orderApi.create({
        customerId: Number(customerId),
        vehicleId: Number(vehicleId),
        totalPrice: tid,
        depositId: dep,
        paymentMethod,
        notes: notes.trim() || undefined,
      })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      toast.addToast('success', `Đơn hàng #${res.id} (${res.orderNumber}) đã tạo`)
      navigate(orders)
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'message' in e && typeof (e as { message: string }).message === 'string'
          ? (e as { message: string }).message
          : 'Không thể tạo đơn hàng'
      toast.addToast('error', msg)
    }
  }

  return (
    <div className="space-y-6">
      <nav className="text-sm text-slate-500">
        <Link to={dashboard} className="hover:text-[#1A3C6E]">Dashboard</Link>
        <span className="mx-2">/</span>
        <Link to={orders} className="hover:text-[#1A3C6E]">Đơn hàng</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-900">Tạo đơn hàng mới</span>
      </nav>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tạo đơn hàng mới</h1>
        <p className="text-sm text-slate-500">Hoàn tất các bước dưới đây để thiết lập đơn hàng cho khách hàng.</p>
      </div>
      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => {
          const s = i + 1
          const done = step > s
          const active = step === s
          return (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  done ? 'bg-[#1A3C6E] text-white' : active ? 'border-2 border-[#1A3C6E] bg-white text-[#1A3C6E]' : 'border border-slate-300 bg-slate-100 text-slate-500'
                }`}
              >
                {done ? <Check className="h-5 w-5" /> : s}
              </div>
              <span className={`hidden text-sm font-medium sm:inline ${active ? 'text-slate-900' : 'text-slate-500'}`}>
                {s}. {label}
              </span>
              {s < 4 && <ChevronRight className="h-4 w-4 text-slate-300" />}
            </div>
          )
        })}
      </div>

      {step === 1 && (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (vehicleId) setStep(2)
          }}
          className="space-y-6"
        >
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold text-slate-900">Chọn xe</h3>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Xe</label>
              <VehicleSearchSelect
                vehicles={branchVehicles ?? []}
                value={vehicleId}
                onChange={setVehicleId}
                placeholder="Tìm kiếm xe theo tên, mã xe hoặc VIN..."
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => navigate(orders)}>
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </Button>
            <Button type="submit">Tiếp theo</Button>
          </div>
        </form>
      )}

      {step === 2 && (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!customerId) {
              toast.addToast('error', 'Chọn khách hàng.')
              return
            }
            setStep(3)
          }}
          className="space-y-6"
        >
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold text-slate-900">Khách hàng</h3>
            <CustomerSearchSelect
              customers={customerRows}
              value={customerId}
              onChange={setCustomerId}
              placeholder="Tìm theo tên, SĐT hoặc email..."
            />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setStep(1)}>
              <ChevronLeft className="h-4 w-4" />
              Quay lại
            </Button>
            <Button type="submit">Tiếp theo</Button>
          </div>
        </form>
      )}

      {step === 3 && (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setStep(4)
          }}
          className="space-y-6"
        >
          <CreateOrderStepDetails
            vehicle={selectedVehicle ?? null}
            vehiclePrice={vehiclePrice}
            depositAmount={resolvedDepositAmount}
            depositsLoading={depositsLoading}
            customerSelected={Boolean(customerId)}
            totalPrice={totalPrice > 0 ? totalPrice : vehiclePrice}
            onTotalPriceChange={setTotalPrice}
            depositId={depositId}
            onDepositIdChange={handleDepositIdChange}
            paymentMethod={paymentMethod}
            onPaymentChange={setPaymentMethod}
            notes={notes}
            onNotesChange={setNotes}
            onChangeVehicle={() => setStep(1)}
          />
          <div className="flex items-center justify-between">
            <Button type="button" variant="outline" onClick={() => setStep(2)}>
              <ChevronLeft className="h-4 w-4" />
              Quay lại
            </Button>
            <div className="flex gap-4">
              <button type="button" onClick={() => navigate(orders)} className="text-sm text-slate-500 hover:text-slate-700">
                Hủy bỏ
              </button>
              <Button type="submit">
                Tiếp theo
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-4">
            <Info className="h-5 w-5 shrink-0 text-[#1A3C6E]" />
            <p className="text-sm text-slate-700">
              Đơn tạo xong ở trạng thái Pending. Dùng danh sách đơn để chuyển bước, thu tiền hoặc xác nhận bán.
            </p>
          </div>
        </form>
      )}

      {step === 4 && (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            void handleStep4()
          }}
          className="space-y-6"
        >
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold text-slate-900">Xác nhận đơn hàng</h3>
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-slate-500">Khách hàng:</span> {selectedCustomer?.name ?? customerId}
              </p>
              <p>
                <span className="text-slate-500">Xe:</span> {selectedVehicle?.brand} {selectedVehicle?.model} {selectedVehicle?.year}
              </p>
              <p>
                <span className="text-slate-500">Số tiền còn lại (đơn):</span> {formatPrice(totalPrice > 0 ? totalPrice : vehiclePrice)}
              </p>
              {depositId.trim() !== '' && (
                <p>
                  <span className="text-slate-500">ID cọc:</span> {depositId}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Button type="button" variant="outline" onClick={() => setStep(3)}>
              <ChevronLeft className="h-4 w-4" />
              Quay lại
            </Button>
            <div className="flex gap-4">
              <button type="button" onClick={() => navigate(orders)} className="text-sm text-slate-500 hover:text-slate-700">
                Hủy bỏ
              </button>
              <Button type="submit">Tạo đơn hàng</Button>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}
