/**
 * SaveButton — Tier 3.1: optimistic toggle, chưa login → /login
 */
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { interactionService } from '@/services/interaction.service'
import { useAuthStore } from '@/store/authStore'

interface SaveButtonProps {
  vehicleId: number
  className?: string
  initialSaved?: boolean
}

export function SaveButton({ vehicleId, className = '', initialSaved }: SaveButtonProps) {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [isSaved, setIsSaved] = useState(initialSaved ?? false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (initialSaved !== undefined) setIsSaved(initialSaved)
  }, [initialSaved])

  const handleClick = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      if (!isAuthenticated) {
        navigate('/login')
        return
      }

      if (isLoading) return
      setIsLoading(true)

      const prevState = isSaved
      setIsSaved(!isSaved)

      try {
        if (prevState) {
          await interactionService.unsaveVehicle(vehicleId)
        } else {
          await interactionService.saveVehicle(vehicleId)
        }
      } catch (err: unknown) {
        const code = (err as { errorCode?: string })?.errorCode
        if (code === 'VEHICLE_ALREADY_SAVED') {
          setIsSaved(true)
        } else if (code === 'VEHICLE_NOT_SAVED') {
          setIsSaved(false)
        } else {
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
      type="button"
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
