/**
 * useSavedVehicles — Tier 3.1: optimistic save/unsave, redirect login khi chưa auth
 */
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { interactionService } from '@/services/interaction.service'
import { vehicleService } from '@/services/vehicle.service'
import { useAuthStore } from '@/store/authStore'
import type { SavedVehicleItem } from '@/types/interaction.types'
import type { Vehicle, VehicleImage } from '@/types/vehicle.types'

function savedItemToVehicle(s: SavedVehicleItem): Vehicle {
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
    status: s.status,
    category_id: 0,
    subcategory_id: 0,
    branch_id: 0,
    images,
  }
}

export interface UseSavedVehiclesReturn {
  /** Danh sách dạng Vehicle (tương thích SavedVehicleGrid / VehicleCard) */
  savedVehicles: Vehicle[]
  /** Bản gốc từ API (có savedAt) — dùng cho thống kê dashboard */
  savedRecords: SavedVehicleItem[]
  /** Alias cho code cũ dùng `data` */
  data: Vehicle[] | undefined
  savedIds: Set<number>
  isLoading: boolean
  error: string | null
  saveVehicle: (vehicleId: number) => Promise<void>
  unsaveVehicle: (vehicleId: number) => Promise<void>
  removeVehicle: (vehicleId: number) => Promise<void>
  refreshSaved: () => void
  refetch: () => void
}

export function useSavedVehicles(): UseSavedVehiclesReturn {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { isAuthenticated } = useAuthStore()
  const [items, setItems] = useState<SavedVehicleItem[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSaved = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([])
      setVehicles([])
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const list = await interactionService.getSavedVehicles()
      setItems(list)
      const enriched = await Promise.allSettled(
        list.map(async (item) => vehicleService.getVehicleById(item.vehicleId)),
      )
      setVehicles(
        enriched.map((result, index) =>
          result.status === 'fulfilled' ? result.value : savedItemToVehicle(list[index]),
        ),
      )
    } catch {
      setError('Lỗi tải danh sách xe yêu thích')
      setItems([])
      setVehicles([])
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    void fetchSaved()
  }, [fetchSaved])

  const savedVehicles = useMemo(() => vehicles, [vehicles])

  const savedIds = useMemo(() => new Set(items.map((i) => i.vehicleId)), [items])

  const saveVehicle = useCallback(
    async (vehicleId: number) => {
      if (!isAuthenticated) {
        navigate('/login')
        return
      }
      try {
        await interactionService.saveVehicle(vehicleId)
        await fetchSaved()
        void queryClient.invalidateQueries({ queryKey: ['customer-stats'] })
      } catch (err: unknown) {
        const code = (err as { errorCode?: string })?.errorCode
        if (code === 'VEHICLE_ALREADY_SAVED') {
          await fetchSaved()
        } else {
          console.warn('[useSavedVehicles] saveVehicle:', err)
        }
      }
    },
    [isAuthenticated, navigate, fetchSaved, queryClient]
  )

  const unsaveVehicle = useCallback(
    async (vehicleId: number) => {
      if (!isAuthenticated) return
      const backup = [...items]
      const vehicleBackup = [...vehicles]
      setItems((prev) => prev.filter((p) => p.vehicleId !== vehicleId))
      setVehicles((prev) => prev.filter((vehicle) => vehicle.id !== vehicleId))
      try {
        await interactionService.unsaveVehicle(vehicleId)
        void queryClient.invalidateQueries({ queryKey: ['customer-stats'] })
      } catch (err: unknown) {
        setItems(backup)
        setVehicles(vehicleBackup)
        const code = (err as { errorCode?: string })?.errorCode
        if (code === 'VEHICLE_NOT_SAVED') {
          setItems((prev) => prev.filter((p) => p.vehicleId !== vehicleId))
          setVehicles((prev) => prev.filter((vehicle) => vehicle.id !== vehicleId))
        } else {
          console.warn('[useSavedVehicles] unsaveVehicle:', err)
        }
      }
    },
    [isAuthenticated, items, vehicles, queryClient]
  )

  return {
    savedVehicles,
    savedRecords: items,
    data: savedVehicles,
    savedIds,
    isLoading,
    error,
    saveVehicle,
    unsaveVehicle,
    removeVehicle: unsaveVehicle,
    refreshSaved: fetchSaved,
    refetch: fetchSaved,
  }
}
