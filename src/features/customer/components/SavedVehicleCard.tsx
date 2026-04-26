import { Link } from 'react-router-dom'
import type { Vehicle } from '@/types'
import type { Branch } from '@/types'
import { formatPrice } from '@/utils/format'
import { Heart, MapPin } from 'lucide-react'

interface SavedVehicleCardProps {
  vehicle: Vehicle
  branch?: Branch | null
  listingStatus?: string
}

export function SavedVehicleCard({ vehicle, branch, listingStatus }: SavedVehicleCardProps) {
  const isSold = vehicle.status === 'Sold'
  const district = branch?.district ?? branch?.name?.replace('Chi Nhánh ', '').replace(', Đà Nẵng', '') ?? 'Đà Nẵng'

  return (
    <Link
      to={`/vehicles/${vehicle.id}`}
      className={`group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md ${isSold ? 'opacity-75' : ''}`}
    >
      <div className="relative h-48 w-full overflow-hidden">
        {isSold && (
          <div className="absolute inset-0 z-[5] flex items-center justify-center bg-black/40">
            <span className="rotate-[-12deg] border-2 border-white px-4 py-2 text-lg font-black uppercase tracking-widest text-white">
              ĐÃ BÁN
            </span>
          </div>
        )}
        <button
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-red-500 shadow-sm transition-colors hover:bg-red-50"
          onClick={(e) => e.preventDefault()}
        >
          <Heart className="h-5 w-5 fill-current" />
        </button>
        {!isSold && (
          <span className="absolute left-3 top-3 z-10 rounded bg-green-500 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
            Đang bán
          </span>
        )}
        <img
          src={vehicle.images?.[0] || 'https://placehold.co/400x192'}
          alt=""
          className={`h-full w-full object-cover transition-transform duration-500 ${!isSold ? 'group-hover:scale-110' : ''}`}
        />
      </div>
      <div className="p-4">
        <p className="mb-1 text-xs font-medium text-slate-500">
          {vehicle.brand} {vehicle.model} {vehicle.trim || ''} {vehicle.year}
        </p>
        <h3 className="mb-2 truncate text-lg font-bold">
          {vehicle.brand} {vehicle.model} {vehicle.trim || ''}
        </h3>
        <p className={`mb-4 text-xl font-bold ${isSold ? 'text-slate-500 line-through' : 'text-[#1A3C6E]'}`}>
          {formatPrice(vehicle.price).replace(' VNĐ', ' ₫')}
        </p>
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <div className="flex items-center gap-1 text-slate-500">
            <MapPin className="h-4 w-4" />
            <span className="text-xs">{district}, Đà Nẵng</span>
          </div>
          <span className="text-xs text-slate-400">{listingStatus ?? '-'}</span>
        </div>
      </div>
    </Link>
  )
}
