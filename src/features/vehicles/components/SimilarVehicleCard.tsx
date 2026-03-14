import { Link } from 'react-router-dom'
import { Gauge, MapPin } from 'lucide-react'
import type { Vehicle } from '@/types'
import { formatPrice, formatMileageShort } from '@/utils/format'
import { useBranches } from '@/hooks/useBranches'

interface SimilarVehicleCardProps {
  vehicle: Vehicle
  showNewBadge?: boolean
}

export function SimilarVehicleCard({ vehicle, showNewBadge }: SimilarVehicleCardProps) {
  const { data: branches } = useBranches()
  const branch = branches?.find((b) => b.id === vehicle.branchId)

  return (
    <Link
      to={`/vehicles/${vehicle.id}`}
      className="group block overflow-hidden rounded-xl border border-[#1A3C6E]/10 bg-white shadow-sm transition-transform hover:-translate-y-1"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-200">
        <img
          src={vehicle.images?.[0] || 'https://placehold.co/600x400'}
          alt={`${vehicle.brand} ${vehicle.model}`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {showNewBadge && (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase text-[#1A3C6E]">
            Xe mới về
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="line-clamp-1 font-bold text-slate-900">{vehicle.brand} {vehicle.model} {vehicle.trim || ''} {vehicle.year}</h3>
        <p className="mt-1 font-bold text-[#1A3C6E]">{formatPrice(vehicle.price)}</p>
        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Gauge className="h-4 w-4" />
            {formatMileageShort(vehicle.mileage)}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {branch?.district ?? 'Đà Nẵng'}
          </span>
        </div>
      </div>
    </Link>
  )
}
