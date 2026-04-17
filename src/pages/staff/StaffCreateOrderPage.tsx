import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronRight, ChevronLeft, Check, Info, FileText, ShoppingCart } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useInventory } from '@/hooks/useInventory'
import { useStaffOrManagerBasePath } from '@/hooks/useStaffOrManagerBasePath'
import { useStaffCustomerOptions } from '@/hooks/useStaffCustomerOptions'
import { orderApi } from '@/services/orderApi'
import { depositApi } from '@/services/deposit.service'
import { paymentApi, paymentInitErrorMessage } from '@/services/paymentApi'
import { useToastStore } from '@/store/toastStore'
import { Button } from '@/components/ui'
import { formatPrice } from '@/utils/format'
import { CreateOrderStepDetails } from '@/features/staff/components/CreateOrderStepDetails'
import { VehicleSearchSelect } from '@/features/staff/components/VehicleSearchSelect'
import { CustomerSearchSelect } from '@/features/staff/components/CustomerSearchSelect'
import { DepositSearchSelect } from '@/features/staff/components/DepositSearchSelect'
import { OrderPaymentLinkModal } from '@/features/staff/components/OrderPaymentLinkModal'

const STEPS = ['Loại đơn', 'Thông tin', 'Chi tiết', 'Xác nhận']

type OrderMode = 'deposit' | 'direct'

export function StaffCreateOrderPage() {
  const { dashboard, orders } = useStaffOrManagerBasePath()
  const navigate = useNavigate()
  const toast = useToastStore()
  const queryClient = useQueryClient()

  // B1: State chung
  const [step, setStep] = useState(1)
  const [orderMode, setOrderMode] = useState<OrderMode | null>(null)

  // B2: State cho luong deposit
  const [selectedDepositId, setSelectedDepositId] = useState('')

  // B3: State cho luong direct
  const [vehicleId, setVehicleId] = useState('')
  const [customerId, setCustomerId] = useState('')

  // B4: State chung cho buoc 3 & 4
  const [totalPrice, setTotalPrice] = useState(0)
  const [depositAmount, setDepositAmount] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // B5: State cho modal thanh toan online
  const [paymentModal, setPaymentModal] = useState<{
    orderNumber: string
    orderId: number
    paymentUrl: string
    gateway: 'vnpay' | 'zalopay'
    customerEmail?: string
  } | null>(null)

  // Load du lieu
  const { data: inventory, available } = useInventory()
  const { data: customerRows = [] } = useStaffCustomerOptions()
  const branchVehicles = (available?.length ? available : inventory) ?? []

  // Fetch deposits Confirmed chua co orderId
  const { data: depositListResult, isLoading: depositsLoading } = useQuery({
    queryKey: ['deposits', 'confirmed-for-order'],
    queryFn: () => depositApi.list({ status: 'Confirmed', size: 500 }),
    enabled: orderMode === 'deposit' && step >= 2,
  })

  const availableDeposits = useMemo(() => {
    const items = depositListResult?.items ?? []
    return items.filter(
      (d) => d.status === 'Confirmed' && !(d.orderId != null && String(d.orderId).trim() !== ''),
    )
  }, [depositListResult?.items])

  // Tim deposit da chon
  const selectedDeposit = useMemo(
    () => availableDeposits.find((d) => String(d.id) === selectedDepositId),
    [availableDeposits, selectedDepositId],
  )

  // Tim xe da chon (cho ca 2 luong)
  const allVehicles = inventory ?? []
  const resolvedVehicleId = orderMode === 'deposit' ? selectedDeposit?.vehicleId ?? '' : vehicleId
  const selectedVehicle = allVehicles.find((v) => String(v.id) === String(resolvedVehicleId)) ??
    branchVehicles.find((v) => String(v.id) === String(resolvedVehicleId))
  const vehiclePrice = selectedVehicle?.price ?? 0

  // Tim khach da chon
  const resolvedCustomerId = orderMode === 'deposit' ? selectedDeposit?.customerId ?? '' : customerId
  const selectedCustomer = customerRows.find((c) => c.id === String(resolvedCustomerId))

  // Khi chon deposit -> tinh totalPrice
  useEffect(() => {
    if (orderMode !== 'deposit' || !selectedDeposit) return
    const depAmt = selectedDeposit.amount ?? 0
    setDepositAmount(depAmt)
    const vp = vehiclePrice > 0 ? vehiclePrice : 0
    setTotalPrice(Math.max(1, vp - depAmt))
  }, [orderMode, selectedDeposit, vehiclePrice])

  // Khi chon xe direct -> tinh totalPrice
  useEffect(() => {
    if (orderMode !== 'direct') return
    setDepositAmount(0)
    setTotalPrice(vehiclePrice > 0 ? vehiclePrice : 0)
  }, [orderMode, vehiclePrice])

  // Reset khi doi mode
  useEffect(() => {
    setSelectedDepositId('')
    setVehicleId('')
    setCustomerId('')
    setTotalPrice(0)
    setDepositAmount(0)
    setPaymentMethod('cash')
    setNotes('')
  }, [orderMode])

  // Xu ly submit tao don hang
  const handleCreateOrder = async () => {
    const cId = Number(resolvedCustomerId)
    const vId = Number(resolvedVehicleId)
    if (!cId || !vId) {
      toast.addToast('error', 'Thiếu thông tin khách hàng hoặc xe.')
      return
    }
    const tp = Number(totalPrice)
    if (!Number.isFinite(tp) || tp < 1) {
      toast.addToast('error', 'Tổng giá đơn không hợp lệ.')
      return
    }

    setSubmitting(true)
    try {
      const depId = orderMode === 'deposit' && selectedDepositId
        ? Number(selectedDepositId)
        : undefined
      // Backend tinh: remainingAmount = totalPrice - depositAmount
      // tp la so tien con lai (da tru coc), nen totalPrice gui len = tp + depositAmount
      const orderTotalPrice = orderMode === 'deposit' && depositAmount > 0
        ? tp + depositAmount
        : tp
      const res = await orderApi.create({
        customerId: cId,
        vehicleId: vId,
        totalPrice: orderTotalPrice,
        depositId: depId,
        paymentMethod,
        notes: notes.trim() || undefined,
      })

      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['deposits'] })

      // Neu thanh toan online -> tao link
      if (paymentMethod === 'vnpay' || paymentMethod === 'zalopay') {
        try {
          const paymentUrl = paymentMethod === 'vnpay'
            ? await paymentApi.createVnpay(res.id, tp)
            : await paymentApi.createZaloPay(res.id, tp)

          setPaymentModal({
            orderNumber: res.orderNumber,
            orderId: res.id,
            paymentUrl,
            gateway: paymentMethod,
            customerEmail: selectedCustomer?.email,
          })
        } catch (payErr) {
          toast.addToast('error', paymentInitErrorMessage(payErr))
          toast.addToast('success', `Đơn hàng #${res.orderNumber} đã tạo. Tạo link thanh toán thất bại — ghi nhận thủ công.`)
          navigate(orders)
        }
      } else {
        toast.addToast('success', `Đơn hàng #${res.id} (${res.orderNumber}) đã tạo`)
        navigate(orders)
      }
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'message' in e && typeof (e as { message: string }).message === 'string'
          ? (e as { message: string }).message
          : 'Không thể tạo đơn hàng'
      toast.addToast('error', msg)
    } finally {
      setSubmitting(false)
    }
  }

  // Modal thanh toan: khi dong -> navigate ve danh sach
  const handleClosePaymentModal = () => {
    setPaymentModal(null)
    navigate(orders)
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
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

      {/* Stepper */}
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

      {/* ===== BUOC 1: Chon loai don ===== */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => { setOrderMode('deposit'); setStep(2) }}
              className={`group flex flex-col items-center gap-3 rounded-xl border-2 p-6 text-center transition-all hover:border-[#1A3C6E] hover:shadow-md ${
                orderMode === 'deposit' ? 'border-[#1A3C6E] bg-blue-50/30' : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1A3C6E]/10 text-[#1A3C6E] group-hover:bg-[#1A3C6E]/20">
                <FileText className="h-7 w-7" />
              </div>
              <div>
                <p className="text-base font-bold text-slate-900">Từ đặt cọc</p>
                <p className="mt-1 text-sm text-slate-500">
                  Khách đã đặt cọc xe, nay chốt đơn bán. Tự động điền xe và khách từ phiếu cọc.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => { setOrderMode('direct'); setStep(2) }}
              className={`group flex flex-col items-center gap-3 rounded-xl border-2 p-6 text-center transition-all hover:border-[#1A3C6E] hover:shadow-md ${
                orderMode === 'direct' ? 'border-[#1A3C6E] bg-blue-50/30' : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-orange-600 group-hover:bg-orange-200">
                <ShoppingCart className="h-7 w-7" />
              </div>
              <div>
                <p className="text-base font-bold text-slate-900">Bán trực tiếp</p>
                <p className="mt-1 text-sm text-slate-500">
                  Khách mua thẳng không qua cọc. Chọn xe đang bán, rồi chọn khách hàng.
                </p>
              </div>
            </button>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => navigate(orders)}>
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </Button>
          </div>
        </div>
      )}

      {/* ===== BUOC 2A: Chon Deposit Confirmed ===== */}
      {step === 2 && orderMode === 'deposit' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold text-slate-900">Chọn phiếu cọc đã xác nhận</h3>
            {depositsLoading ? (
              <p className="py-4 text-center text-sm text-slate-500">Đang tải danh sách cọc...</p>
            ) : availableDeposits.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-sm text-slate-500">Không có phiếu cọc nào đã xác nhận.</p>
                <button
                  type="button"
                  onClick={() => { setOrderMode('direct'); }}
                  className="mt-3 text-sm font-medium text-[#1A3C6E] hover:underline"
                >
                  Chuyển sang bán trực tiếp →
                </button>
              </div>
            ) : (
              <DepositSearchSelect
                deposits={availableDeposits}
                value={selectedDepositId}
                onChange={setSelectedDepositId}
                placeholder="Tìm theo tên xe, tên khách hoặc mã cọc..."
              />
            )}
            {selectedDeposit && (
              <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50/40 p-4">
                <p className="text-sm font-semibold text-slate-900">
                  {selectedDeposit.vehicleTitle ?? `Xe #${selectedDeposit.vehicleId}`}
                </p>
                <div className="mt-1 space-y-0.5 text-xs text-slate-600">
                  <p>Khách: {selectedDeposit.customerName ?? `#${selectedDeposit.customerId}`}</p>
                  <p>Tiền cọc: {formatPrice(selectedDeposit.amount)}</p>
                  {vehiclePrice > 0 && <p>Giá xe: {formatPrice(vehiclePrice)}</p>}
                  <p>Ngày cọc: {selectedDeposit.depositDate}</p>
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setStep(1)}>
              <ChevronLeft className="h-4 w-4" />
              Quay lại
            </Button>
            <Button
              type="button"
              disabled={!selectedDepositId}
              onClick={() => { if (selectedDepositId) setStep(3) }}
            >
              Tiếp theo
            </Button>
          </div>
        </div>
      )}

      {/* ===== BUOC 2B: Chon Xe + Khach (ban truc tiep) ===== */}
      {step === 2 && orderMode === 'direct' && (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!vehicleId) { toast.addToast('error', 'Chọn xe.'); return }
            if (!customerId) { toast.addToast('error', 'Chọn khách hàng.'); return }
            setStep(3)
          }}
          className="space-y-6"
        >
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold text-slate-900">Chọn xe</h3>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Xe</label>
              <VehicleSearchSelect
                vehicles={branchVehicles}
                value={vehicleId}
                onChange={setVehicleId}
                placeholder="Tìm kiếm xe theo tên, mã xe hoặc VIN..."
              />
            </div>
          </div>
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

      {/* ===== BUOC 3: Chi tiet don hang ===== */}
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
            depositAmount={orderMode === 'deposit' ? depositAmount : null}
            depositsLoading={false}
            customerSelected={Boolean(resolvedCustomerId)}
            totalPrice={totalPrice > 0 ? totalPrice : vehiclePrice}
            onTotalPriceChange={setTotalPrice}
            depositId={orderMode === 'deposit' ? selectedDepositId : ''}
            onDepositIdChange={() => {}}
            paymentMethod={paymentMethod}
            onPaymentChange={setPaymentMethod}
            notes={notes}
            onNotesChange={setNotes}
            onChangeVehicle={() => setStep(2)}
            orderMode={orderMode ?? 'direct'}
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

      {/* ===== BUOC 4: Xac nhan & Tao don ===== */}
      {step === 4 && (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            void handleCreateOrder()
          }}
          className="space-y-6"
        >
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold text-slate-900">Xác nhận đơn hàng</h3>
            <div className="space-y-3 text-sm">
              {orderMode === 'deposit' && (
                <div className="rounded-lg bg-blue-50 p-3">
                  <p className="text-xs font-semibold uppercase text-blue-700">Đơn từ đặt cọc</p>
                  <p className="text-slate-700">Phiếu cọc #{selectedDepositId} — Đã cọc: {formatPrice(depositAmount)}</p>
                </div>
              )}
              <p>
                <span className="text-slate-500">Khách hàng:</span>{' '}
                {selectedCustomer?.name ?? `#${resolvedCustomerId}`}
              </p>
              <p>
                <span className="text-slate-500">Xe:</span>{' '}
                {selectedVehicle
                  ? `${selectedVehicle.brand} ${selectedVehicle.model} ${selectedVehicle.year}`
                  : orderMode === 'deposit' && selectedDeposit
                    ? selectedDeposit.vehicleTitle ?? `Xe #${resolvedVehicleId}`
                    : `Xe #${resolvedVehicleId}`}
              </p>
              {vehiclePrice > 0 && (
                <p>
                  <span className="text-slate-500">Giá niêm yết:</span> {formatPrice(vehiclePrice)}
                </p>
              )}
              {orderMode === 'deposit' && depositAmount > 0 && (
                <p>
                  <span className="text-slate-500">Đã cọc:</span> {formatPrice(depositAmount)}
                </p>
              )}
              <p>
                <span className="text-slate-500">Tổng giá đơn (còn lại):</span>{' '}
                <span className="font-semibold text-slate-900">{formatPrice(totalPrice > 0 ? totalPrice : vehiclePrice)}</span>
              </p>
              <p>
                <span className="text-slate-500">Phương thức:</span>{' '}
                {paymentMethod === 'vnpay' ? 'VNPay' : paymentMethod === 'zalopay' ? 'ZaloPay' : 'Tiền mặt'}
              </p>
              {notes.trim() && (
                <p>
                  <span className="text-slate-500">Ghi chú:</span> {notes}
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
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Đang tạo...' : 'Tạo đơn hàng'}
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* Modal thanh toan online */}
      {paymentModal && (
        <OrderPaymentLinkModal
          orderNumber={paymentModal.orderNumber}
          orderId={paymentModal.orderId}
          paymentUrl={paymentModal.paymentUrl}
          gateway={paymentModal.gateway}
          customerEmail={paymentModal.customerEmail}
          onClose={handleClosePaymentModal}
        />
      )}
    </div>
  )
}
