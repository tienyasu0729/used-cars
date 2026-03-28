/**
 * useRecentlyViewed — Hook xe đã xem gần đây
 *
 * Lấy từ GET /vehicles/recently-viewed
 * - Đã đăng nhập: dùng JWT (interceptor tự gắn)
 * - Chưa đăng nhập: dùng header X-Guest-Id (tạo UUID lưu localStorage)
 * Không throw lỗi, chỉ trả mảng rỗng nếu fail
 */
import { useState, useEffect } from 'react'
import { vehicleService } from '@/services/vehicle.service'
import { useAuthStore } from '@/store/authStore'
import type { Vehicle } from '@/types/vehicle.types'

const GUEST_ID_KEY = 'guest_id'

// Lấy hoặc tạo guest_id cho user chưa đăng nhập
function getOrCreateGuestId(): string {
  let guestId = localStorage.getItem(GUEST_ID_KEY)
  if (!guestId) {
    guestId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `guest_${Date.now()}_${Math.random().toString(36).slice(2)}`
    localStorage.setItem(GUEST_ID_KEY, guestId)
  }
  return guestId
}

interface UseRecentlyViewedReturn {
  recentVehicles: Vehicle[]
  isLoading: boolean
}

export function useRecentlyViewed(): UseRecentlyViewedReturn {
  const { isAuthenticated } = useAuthStore()
  const [recentVehicles, setRecentVehicles] = useState<Vehicle[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRecent = async () => {
      setIsLoading(true)
      try {
        // Nếu đã đăng nhập: JWT sẽ tự gắn qua interceptor
        // Nếu chưa: gửi kèm guest_id
        const guestId = isAuthenticated ? undefined : getOrCreateGuestId()
        const vehicles = await vehicleService.getRecentlyViewed(guestId)
        setRecentVehicles(vehicles)
      } catch {
        // Không throw lỗi, chỉ trả mảng rỗng
        setRecentVehicles([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecent()
  }, [isAuthenticated])

  return { recentVehicles, isLoading }
}
