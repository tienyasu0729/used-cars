import { useQuery } from '@tanstack/react-query'
import type { ManagerAppointment } from '@/types/managerAppointment.types'
import { customerDisplayLabel } from '@/lib/customerDisplay'
import { useAuthStore } from '@/store/authStore'
import { bookingService } from '@/services/booking.service'

export function useAppointments() {
  const { user } = useAuthStore()
  const branchId = typeof user?.branchId === 'number' ? user.branchId : 1

  return useQuery({
    queryKey: ['manager-appointments', branchId],
    queryFn: async (): Promise<ManagerAppointment[]> => {
      try {
        const res = await bookingService.getStaffBookings({ branchId, size: 50, status: 'all' })
        
        return res.items.map((b) => ({
          id: String(b.id),
          customerName: customerDisplayLabel(b.customerId),
          vehicleName: b.vehicleTitle?.trim() || `Xe #${b.vehicleId}`,
          timeSlot: b.timeSlot,
          date: b.bookingDate,
          type: 'test_drive',
          status: b.status,
          staffName: b.staffId != null ? `Nhân viên #${b.staffId}` : 'Chưa phân công',
          phone: '',
          notes: b.note || '',
        }))
      } catch (err) {
        console.error('Failed to load appointments', err)
        return []
      }
    },
    staleTime: 1000 * 60 * 2,
  })
}
