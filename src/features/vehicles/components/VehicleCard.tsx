/**
 * VehicleCard — Card xe dùng trong listing
 *
 * Hỗ trợ cả Vehicle type cũ (mock) và Vehicle type mới (API)
 * Hiển thị: ảnh, listing_id, title, giá VNĐ, km, badge status, save button
 */
import { Link } from 'react-router-dom'
import { MapPin, GitCompare, Gauge, Calendar, Fuel, Cog } from 'lucide-react'
import { formatPrice, formatMileage } from '@/utils/format'
import { externalImageDisplayUrl } from '@/utils/externalImageDisplayUrl'
import { VehicleStatusBadge } from '@/components/ui'
import { Button } from '@/components/ui'
import { useCompareVehicles } from '@/hooks/useCompareVehicles'
import { useToastStore } from '@/store/toastStore'
import { SaveButton } from '@/components/vehicles/SaveButton'
import type { Vehicle as ApiVehicle, VehicleImage } from '@/types/vehicle.types'

interface VehicleCardProps {
  vehicle: ApiVehicle
  compact?: boolean
  showNewBadge?: boolean
  showSaveButton?: boolean
  /** Đồng bộ tim đỏ sau F5 — lấy từ GET /users/me/saved-vehicles */
  initialSaved?: boolean
}

// Lấy URL ảnh chính hoặc ảnh đầu tiên
function getPrimaryImage(images?: VehicleImage[]): string {
  if (!images || images.length === 0) return 'https://placehold.co/600x400?text=No+Image'
  const primary = images.find((img) => img.primaryImage)
  const raw = primary?.url ?? images[0]?.url
  return raw ? externalImageDisplayUrl(raw) : 'https://placehold.co/600x400?text=No+Image'
}

export function VehicleCard({
  vehicle,
  compact,
  showNewBadge,
  showSaveButton = true,
  initialSaved,
}: VehicleCardProps) {
  const { addToCompare, removeFromCompare, compareList } = useCompareVehicles()
  const toast = useToastStore()
  const isComparing = compareList.includes(vehicle.id)

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isComparing) {
      removeFromCompare(vehicle.id)
      toast.addToast('info', 'Đã bỏ xe khỏi danh sách so sánh')
    } else {
      addToCompare(vehicle)
    }
  }

  // Lấy thumbnail (ảnh chính hoặc ảnh đầu tiên)
  const thumbnail = getPrimaryImage(vehicle.images)

  return (
    <div className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-xl">
      <Link to={`/vehicles/${vehicle.id}`} className="block">
        <div className="relative h-48 overflow-hidden bg-slate-200">
          <img
            src={thumbnail}
            alt={vehicle.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute left-3 top-3 flex flex-col gap-2">
            {showNewBadge && (
              <span className="rounded bg-[#1A3C6E] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                Mới về
              </span>
            )}
            <VehicleStatusBadge status={vehicle.status} />
          </div>

          {/* Listing ID badge */}
          {vehicle.listing_id && (
            <span className="absolute bottom-2 left-2 rounded bg-black/50 px-2 py-0.5 text-[10px] font-mono text-white/90">
              {vehicle.listing_id}
            </span>
          )}

          {/* Save button */}
          {showSaveButton && (
            <div className="absolute right-3 top-3">
              <SaveButton vehicleId={vehicle.id} initialSaved={initialSaved} />
            </div>
          )}
        </div>
      </Link>

      <div className={compact ? 'p-4' : 'p-5'}>
        <Link to={`/vehicles/${vehicle.id}`}>
          <h3 className="mb-1 font-bold text-gray-900 line-clamp-1 hover:text-[#1A3C6E]">
            {vehicle.title}
          </h3>
        </Link>
        <p className="mb-3 text-lg font-extrabold text-[#E8612A]">{formatPrice(vehicle.price)}</p>

        <div className={`grid grid-cols-2 sm:grid-cols-4 gap-2 border-y border-slate-100 py-3 ${compact ? 'mb-3' : 'mb-5'}`}>
          <div className="flex flex-col items-center">
            <Gauge className="mb-0.5 h-5 w-5 text-slate-400" />
            <span className="text-[10px] font-medium text-slate-500">{formatMileage(vehicle.mileage)}</span>
          </div>
          <div className="flex flex-col items-center">
            <Calendar className="mb-0.5 h-5 w-5 text-slate-400" />
            <span className="text-[10px] font-medium text-slate-500">{vehicle.year}</span>
          </div>
          <div className="flex flex-col items-center">
            <Fuel className="mb-0.5 h-5 w-5 text-slate-400" />
            <span className="text-[10px] font-medium text-slate-500">
              {vehicle.fuel || '—'}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <Cog className="mb-0.5 h-5 w-5 text-slate-400" />
            <span className="text-[10px] font-medium text-slate-500">
              {vehicle.transmission || '—'}
            </span>
          </div>
        </div>

        <div className={`flex gap-2 ${compact ? 'mt-2' : ''}`}>
          <Link to={`/vehicles/${vehicle.id}`} className="flex-1">
            <button className="w-full rounded-lg border-2 border-[#1A3C6E]/10 py-2.5 font-bold text-[#1A3C6E] transition-all hover:bg-[#1A3C6E] hover:text-white">
              Xem chi tiết
            </button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCompare}
            title={isComparing ? 'Đang chọn so sánh — nhấn để bỏ' : 'Thêm vào so sánh (2–3 xe)'}
            aria-pressed={isComparing}
            className={
              isComparing
                ? 'border-2 border-amber-500 bg-amber-100 text-amber-900 shadow-md ring-2 ring-amber-400/60 hover:bg-amber-200'
                : 'border-[#1A3C6E] hover:bg-blue-50'
            }
          >
            <GitCompare className={`h-4 w-4 ${isComparing ? 'text-amber-800' : ''}`} />
          </Button>
        </div>
      </div>
    </div>
  )
}
