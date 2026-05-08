import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { MessageCircle, User } from 'lucide-react'
import { Modal } from '@/components/ui'
import { VehicleStatusBadge } from '@/components/ui'
import { MaintenanceHistoryPanel } from './MaintenanceHistoryPanel'
import { formatPrice, formatMileage } from '@/utils/format'
import { depositApi } from '@/services/deposit.service'
import { orderApi } from '@/services/orderApi'
import { createChatConversation } from '@/services/chat.service'
import { rememberChatParticipantName } from '@/utils/chatParticipantStorage'
import { useToastStore } from '@/store/toastStore'
import type { Vehicle } from '@/types/vehicle.types'

interface VehicleDetailModalProps {
  vehicle: Vehicle | null
  isOpen: boolean
  onClose: () => void
  onHide?: (id: string) => void
}

// Lấy thông tin khách hàng liên quan đến xe (cọc hoặc đơn hàng)
function useVehicleCustomerInfo(vehicleId: number | undefined, vehicleStatus: string | undefined) {
  const isReserved = vehicleStatus === 'Reserved'
  const isSold = vehicleStatus === 'Sold'
  const shouldFetch = !!vehicleId && (isReserved || isSold)

  // B1: Lấy danh sách cọc — chỉ fetch khi xe đã đặt cọc
  const { data: depositData } = useQuery({
    queryKey: ['deposits-for-vehicle', vehicleId],
    queryFn: async () => {
      const result = await depositApi.list({ size: 200 })
      return result.items
    },
    enabled: shouldFetch && isReserved,
    staleTime: 1000 * 60,
  })

  // B2: Lấy danh sách đơn hàng — chỉ fetch khi xe đã bán
  const { data: orderData } = useQuery({
    queryKey: ['orders-for-vehicle', vehicleId],
    queryFn: async () => {
      const result = await orderApi.list({ size: 200 })
      return result.items
    },
    enabled: shouldFetch && isSold,
    staleTime: 1000 * 60,
  })

  // B3: Lọc theo vehicleId, lấy bản ghi mới nhất
  if (isReserved && depositData) {
    const deposit = depositData.find(
      (d) => String(d.vehicleId) === String(vehicleId) && (d.status === 'Confirmed' || d.status === 'Pending'),
    )
    if (deposit) {
      return {
        customerId: deposit.customerId,
        customerName: deposit.customerName ?? `Khách #${deposit.customerId}`,
        type: 'deposit' as const,
        amount: deposit.amount,
      }
    }
  }

  if (isSold && orderData) {
    const order = orderData.find(
      (o) => String(o.vehicleId) === String(vehicleId) && o.status !== 'Cancelled',
    )
    if (order) {
      return {
        customerId: order.customerId,
        customerName: order.customerName ?? `Khách #${order.customerId}`,
        type: 'order' as const,
        amount: order.price,
      }
    }
  }

  return null
}

export function VehicleDetailModal({
  vehicle,
  isOpen,
  onClose,
  onHide,
}: VehicleDetailModalProps) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const toast = useToastStore()
  const qc = useQueryClient()
  const [chatLoading, setChatLoading] = useState(false)

  const customerInfo = useVehicleCustomerInfo(
    vehicle?.id,
    vehicle?.status,
  )

  if (!vehicle) return null

  const img0 = vehicle.images?.[0]
  const cover = typeof img0 === 'string' ? img0 : img0?.url

  // Xác định đường dẫn chat dựa theo role (manager hoặc staff)
  const chatBasePath = pathname.startsWith('/manager') ? '/manager/chat' : '/staff/chat'
  const detailHref = pathname.startsWith('/manager') ? `/vehicles/${vehicle.id}?view=manager` : `/vehicles/${vehicle.id}`

  // B1: Gọi API tạo (hoặc lấy lại) hội thoại với khách
  // B2: Xóa cache conversations cũ để trang chat fetch lại list mới nhất
  // B3: Đóng modal, chuyển đến trang chat kèm ?cid= để mở luôn khung nhắn tin
  const handleOpenChat = async () => {
    if (!customerInfo?.customerId) return
    setChatLoading(true)
    try {
      const conversationId = await createChatConversation(Number(customerInfo.customerId))
      rememberChatParticipantName(conversationId, customerInfo.customerName)
      await qc.invalidateQueries({ queryKey: ['chat', 'conversations'] })
      onClose()
      navigate(`${chatBasePath}?cid=${conversationId}`, {
        state: { chatParticipantName: customerInfo.customerName },
      })
    } catch {
      toast.addToast('error', 'Không thể mở cuộc trò chuyện.')
    } finally {
      setChatLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={vehicle.title || `${vehicle.brand ?? ''} ${vehicle.model ?? ''}`.trim()}
      footer={
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium"
          >
            Đóng
          </button>
          <Link
            to={`/manager/vehicles/${vehicle.id}/edit`}
            onClick={onClose}
            className="rounded-lg bg-[#1A3C6E] px-4 py-2 text-sm font-medium text-white"
          >
            Chỉnh sửa
          </Link>
          <Link
            to={detailHref}
            onClick={onClose}
            className="rounded-lg border border-[#1A3C6E] px-4 py-2 text-sm font-medium text-[#1A3C6E]"
          >
            Xem chi tiết
          </Link>
          {onHide && (
            <button
              onClick={() => {
                onHide(String(vehicle.id))
                onClose()
              }}
              className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600"
            >
              Ẩn xe
            </button>
          )}
        </div>
      }
    >
      <div className="space-y-4">
        {cover && <img src={cover} alt="" className="h-40 w-full rounded-lg object-cover" />}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-slate-500">Giá</p>
            <p className="font-bold text-[#E8612A]">{formatPrice(vehicle.price)}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Trạng thái</p>
            <VehicleStatusBadge status={vehicle.status} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Năm</p>
            <p className="font-medium">{vehicle.year}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Số km</p>
            <p className="font-medium">{formatMileage(vehicle.mileage)}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Mã tin</p>
            <p className="font-mono text-sm">{vehicle.listing_id ?? '-'}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Nhiên liệu / Hộp số</p>
            <p className="font-medium">
              {vehicle.fuel} / {vehicle.transmission}
            </p>
          </div>
        </div>

        {/* Thông tin khách hàng — hiện khi xe đã đặt cọc hoặc đã bán */}
        {customerInfo && (
          <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase text-slate-600">
              <User className="h-4 w-4" />
              {customerInfo.type === 'deposit' ? 'Khách đặt cọc' : 'Người mua'}
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900">{customerInfo.customerName}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {customerInfo.type === 'deposit' ? 'Số tiền cọc: ' : 'Giá trị đơn: '}
                  <span className="font-bold text-[#1A3C6E]">{formatPrice(customerInfo.amount)}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenChat}
                disabled={chatLoading}
                className="flex items-center gap-1.5 rounded-lg bg-[#1A3C6E] px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-[#152d52] disabled:opacity-50"
                title="Nhắn tin cho khách hàng"
              >
                <MessageCircle className="h-4 w-4" />
                Nhắn tin
              </button>
            </div>
          </div>
        )}

        {/* Sprint 4 — Lịch sử bảo dưỡng */}
        <MaintenanceHistoryPanel vehicleId={vehicle.id} />
      </div>
    </Modal>
  )
}
