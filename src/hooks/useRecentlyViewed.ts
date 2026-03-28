/**
 * useRecentlyViewed — Tier 3.1: luôn gửi X-Guest-Id qua interactionService
 */
import { useState, useEffect, useMemo } from 'react'
import { interactionService } from '@/services/interaction.service'
import type { ViewedVehicleItem } from '@/types/interaction.types'
import type { Vehicle, VehicleImage } from '@/types/vehicle.types'

function viewedItemToVehicle(s: ViewedVehicleItem): Vehicle {
  const images: VehicleImage[] = s.primaryImageUrl
    ? [{ id: 0, url: s.primaryImageUrl, sortOrder: 0, primaryImage: true }]
    : []
  return {
    id: s.vehicleId,
    listing_id: s.listingId,
    title: s.title,
    price: s.price,
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

export interface UseRecentlyViewedReturn {
  recentVehicles: Vehicle[]
  isLoading: boolean
}

export function useRecentlyViewed(): UseRecentlyViewedReturn {
  const [items, setItems] = useState<ViewedVehicleItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setIsLoading(true)
      const list = await interactionService.getRecentlyViewed()
      if (!cancelled) {
        setItems(list)
        setIsLoading(false)
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [])

  const recentVehicles = useMemo(() => items.map(viewedItemToVehicle), [items])

  return { recentVehicles, isLoading }
}
