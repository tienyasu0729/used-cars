import { useQuery } from '@tanstack/react-query'
import { interactionService } from '@/services/interaction.service'
import type { ViewedVehicleItem } from '@/types/interaction.types'
import type { Vehicle, VehicleImage } from '@/types/vehicle.types'

function viewedToVehicle(v: ViewedVehicleItem): Vehicle {
  const images: VehicleImage[] = v.primaryImageUrl
    ? [{ id: 0, url: v.primaryImageUrl, sortOrder: 0, primaryImage: true }]
    : []
  return {
    id: v.vehicleId,
    listing_id: v.listingId,
    title: v.title,
    price: v.price,
    year: new Date().getFullYear(),
    fuel: '—',
    transmission: '—',
    status: 'Available',
    category_id: 0,
    subcategory_id: 0,
    branch_id: 0,
    images,
  }
}

export function useRecentlyViewed(limit = 8) {
  return useQuery({
    queryKey: ['recently-viewed', limit],
    queryFn: async () => {
      const list = await interactionService.getRecentlyViewed()
      return list.slice(0, limit).map(viewedToVehicle)
    },
    staleTime: 60_000,
  })
}
