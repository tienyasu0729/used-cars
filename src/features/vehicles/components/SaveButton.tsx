/**
 * SaveButton — Nút trái tim lưu xe yêu thích
 *
 * - Chưa login → redirect /login
 * - Đã login → gọi save/unsave API, optimistic update icon
 * - Handle VEHICLE_ALREADY_SAVED / VEHICLE_NOT_SAVED gracefully
 */
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { vehicleService } from '@/services/vehicle.service'
import { useAuthStore } from '@/store/authStore'

interface SaveButtonProps {
  vehicleId: number
  className?: string
  /** Nếu true = đã check bên ngoài là saved */
  initialSaved?: boolean
}

export function SaveButton({ vehicleId, className = '', initialSaved }: SaveButtonProps) {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [isSaved, setIsSaved] = useState(initialSaved ?? false)
  const [isLoading, setIsLoading] = useState(false)

  // Sync từ prop bên ngoài
  useEffect(() => {
    if (initialSaved !== undefined) setIsSaved(initialSaved)
  }, [initialSaved])

  const handleClick = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      // Chưa đăng nhập → redirect login
      if (!isAuthenticated) {
        navigate('/login')
        return
      }

      if (isLoading) return
      setIsLoading(true)

      // Optimistic update
      const prevState = isSaved
      setIsSaved(!isSaved)

      try {
        if (prevState) {
          await vehicleService.unsaveVehicle(vehicleId)
        } else {
          await vehicleService.saveVehicle(vehicleId)
        }
      } catch (err: unknown) {
        const code = (err as { errorCode?: string })?.errorCode
        if (code === 'VEHICLE_ALREADY_SAVED') {
          setIsSaved(true)
        } else if (code === 'VEHICLE_NOT_SAVED') {
          setIsSaved(false)
        } else {
          // Rollback nếu lỗi khác
          setIsSaved(prevState)
          console.warn('[SaveButton] Lỗi save/unsave:', err)
        }
      } finally {
        setIsLoading(false)
      }
    },
    [vehicleId, isSaved, isAuthenticated, isLoading, navigate]
  )

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`rounded-full bg-white/80 p-1.5 transition-colors hover:bg-white ${className}`}
      title={isSaved ? 'Bỏ lưu xe' : 'Lưu xe yêu thích'}
    >
      <Heart
        className={`h-5 w-5 transition-colors ${
          isSaved ? 'fill-red-500 text-red-500' : 'text-slate-600'
        }`}
      />
    </button>
  )
}
