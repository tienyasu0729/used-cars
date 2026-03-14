import { Link } from 'react-router-dom'
import { MapPin, Heart, GitCompare, Gauge, Calendar, Fuel, Cog } from 'lucide-react'
import type { Vehicle } from '@/types'
import { formatPrice, formatMileage } from '@/utils/format'
import { VehicleStatusBadge } from '@/components/ui'
import { Button } from '@/components/ui'
import { useBranches } from '@/hooks/useBranches'
import { useCompareStore } from '@/store/compareStore'

interface VehicleCardProps {
  vehicle: Vehicle
  compact?: boolean
  showNewBadge?: boolean
}

export function VehicleCard({ vehicle, compact, showNewBadge }: VehicleCardProps) {
  const { data: branches } = useBranches()
  const { addVehicle, removeVehicle, vehicles } = useCompareStore()
  const branch = branches?.find((b) => b.id === vehicle.branchId)
  const isSaved = false
  const isComparing = vehicles.some((v) => v.id === vehicle.id)

  return (
    <div className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-xl">
      <Link to={`/vehicles/${vehicle.id}`} className="block">
        <div className="relative h-48 overflow-hidden bg-slate-200">
          <img
            src={vehicle.images[0] || 'https://placehold.co/600x400'}
            alt={vehicle.brand + ' ' + vehicle.model}
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
          <button
            className="absolute right-3 top-3 rounded-full bg-white/80 p-1.5 text-slate-900 transition-colors hover:bg-white"
            onClick={(e) => e.preventDefault()}
          >
            <Heart className={`h-5 w-5 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
          </button>
        </div>
      </Link>
      <div className={compact ? 'p-4' : 'p-5'}>
        <Link to={`/vehicles/${vehicle.id}`}>
          <h3 className="mb-1 font-bold text-gray-900 line-clamp-1 hover:text-[#1A3C6E]">
            {vehicle.brand} {vehicle.model} {vehicle.trim || ''} {vehicle.year}
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
              {vehicle.fuelType === 'Gasoline' ? 'Xăng' : vehicle.fuelType === 'Diesel' ? 'Dầu' : vehicle.fuelType === 'Electric' ? 'Điện' : 'Hybrid'}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <Cog className="mb-0.5 h-5 w-5 text-slate-400" />
            <span className="text-[10px] font-medium text-slate-500">
              {vehicle.transmission === 'Automatic' ? 'Tự động' : 'Số sàn'}
            </span>
          </div>
        </div>
        {branch && !compact && (
          <div className="mb-5 flex items-center gap-2 text-xs text-slate-500">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="truncate">{branch.name}</span>
          </div>
        )}
        <div className={`flex gap-2 ${compact ? 'mt-2' : ''}`}>
          <Link to={`/vehicles/${vehicle.id}`} className="flex-1">
            <button className="w-full rounded-lg border-2 border-[#1A3C6E]/10 py-2.5 font-bold text-[#1A3C6E] transition-all hover:bg-[#1A3C6E] hover:text-white">
              Xem chi tiết
            </button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => (isComparing ? removeVehicle(vehicle.id) : addVehicle(vehicle))}
          >
            <GitCompare className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
