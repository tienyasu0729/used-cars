import { Link } from 'react-router-dom'
import { Modal } from '@/components/ui'
import { VehicleStatusBadge } from '@/components/ui'
import { formatPrice, formatMileage } from '@/utils/format'
import type { Vehicle } from '@/types'

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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${vehicle.brand} ${vehicle.model}`}
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
                onHide(vehicle.id)
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
        {vehicle.images?.[0] && (
          <img
            src={vehicle.images[0]}
            alt=""
            className="h-40 w-full rounded-lg object-cover"
          />
        )}
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
            <p className="text-xs font-medium text-slate-500">Biển số</p>
            <p className="font-mono text-sm">{vehicle.plateNumber ?? '-'}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Nhiên liệu / Hộp số</p>
            <p className="font-medium">{vehicle.fuelType} / {vehicle.transmission}</p>
          </div>
        </div>
      </div>
    </Modal>
  )
}
