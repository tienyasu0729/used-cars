import { useQuery } from '@tanstack/react-query'
import type { ManagerAppointment } from '@/types/managerAppointment.types'
import { customerDisplayLabel } from '@/lib/customerDisplay'
import { useAuthStore } from '@/store/authStore'
import { bookingService } from '@/services/booking.service'
import { vehicleService } from '@/services/vehicle.service'
import { externalImageDisplayUrl } from '@/utils/externalImageDisplayUrl'

export function useAppointments() {
  const { user } = useAuthStore()
  const branchId = typeof user?.branchId === 'number' ? user.branchId : 1

  return useQuery({
    queryKey: ['manager-appointments', branchId],
    queryFn: async (): Promise<ManagerAppointment[]> => {
      try {
        const res = await bookingService.getStaffBookings({ branchId, size: 50, status: 'all' })
        const uniqueVehicleIds = [...new Set(res.items.map((b) => b.vehicleId))]
        const vehicleEntries = await Promise.allSettled(
          uniqueVehicleIds.map(async (vehicleId) => {
            const vehicle = await vehicleService.getManagerVehicleById(vehicleId)
            const firstImage = vehicle.images?.[0]
            return {
              vehicleId,
              thumbnailUrl: externalImageDisplayUrl(typeof firstImage === 'string' ? firstImage : firstImage?.url),
            }
          }),
        )
        const vehicleThumbById = new Map<number, string>()
        for (const entry of vehicleEntries) {
          if (entry.status !== 'fulfilled' || !entry.value.thumbnailUrl) continue
          vehicleThumbById.set(entry.value.vehicleId, entry.value.thumbnailUrl)
        }

        return res.items.map((b) => {
          const nameFromApi = b.customerName?.trim()
          return {
            id: String(b.id),
            customerId: b.customerId,
            customerName: nameFromApi || customerDisplayLabel(b.customerId),
            vehicleId: b.vehicleId,
            vehicleListingId: b.vehicleListingId,
            vehicleName: b.vehicleTitle?.trim() || `Xe #${b.vehicleId}`,
            thumbnailUrl: vehicleThumbById.get(b.vehicleId),
            timeSlot: b.timeSlot,
            date: b.bookingDate,
            type: 'test_drive' as const,
            status: b.status,
            staffId: b.staffId ?? undefined,
            staffName:
              b.staffName?.trim()
              || (b.staffId != null ? `Nhân viên #${b.staffId}` : 'Chưa phân công'),
            phone: b.customerPhone?.trim() || undefined,
            notes: b.note || '',
            branchName: b.branchName?.trim() || undefined,
            createdAt: b.createdAt,
          }
        })
      } catch (err) {
        console.error('Failed to load appointments', err)
        return []
      }
    },
    staleTime: 1000 * 60 * 2,
  })
}
