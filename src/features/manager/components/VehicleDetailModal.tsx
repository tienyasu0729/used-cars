import { Link } from 'react-router-dom'
import { Modal } from '@/components/ui'
import { VehicleStatusBadge } from '@/components/ui'
import { MaintenanceHistoryPanel } from './MaintenanceHistoryPanel'
import { formatPrice, formatMileage } from '@/utils/format'
import type { Vehicle } from '@/types/vehicle.types'

interface VehicleDetailModalProps {
  vehicle: Vehicle | null
  isOpen: boolean
  onClose: () => void
  onHide?: (id: string) => void
}

export function VehicleDetailModal({
  vehicle,
  isOpen,
  onClose,
  onHide,
}: VehicleDetailModalProps) {
  if (!vehicle) return null

  const img0 = vehicle.images?.[0]
  const cover = typeof img0 === 'string' ? img0 : img0?.url

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
            to={`/vehicles/${vehicle.id}`}
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
        {/* Sprint 4 — Lịch sử bảo dưỡng */}
        <MaintenanceHistoryPanel vehicleId={vehicle.id} />
      </div>
    </Modal>
  )
}
