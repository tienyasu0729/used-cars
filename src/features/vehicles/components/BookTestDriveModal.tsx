import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal } from '@/components/ui'
import { Input, Select } from '@/components/ui'
import { Button } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'
import { bookingApi } from '@/services/bookingApi'

const schema = z.object({
  name: z.string().min(2, 'Họ tên tối thiểu 2 ký tự'),
  phone: z.string().regex(/^0\d{9}$|^\+84\d{9}$/, 'SĐT không hợp lệ'),
  date: z.string().min(1, 'Vui lòng chọn ngày'),
  timeSlot: z.string().min(1, 'Vui lòng chọn khung giờ'),
  note: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
]

interface BookTestDriveModalProps {
  isOpen: boolean
  onClose: () => void
  vehicleId: string
  branchId: string
  vehicleName?: string
}

export function BookTestDriveModal({
  isOpen,
  onClose,
  vehicleId,
  branchId,
  vehicleName,
}: BookTestDriveModalProps) {
  const { user } = useAuthStore()
  const addToast = useToastStore((s) => s.addToast)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name ?? '',
      phone: user?.phone ?? '',
    },
  })

  const onSubmit = async (data: FormData) => {
    try {
      const res = await bookingApi.createBooking({
        vehicleId,
        branchId,
        date: data.date,
        timeSlot: data.timeSlot,
        note: data.note,
      })
      if (res.data.success) {
        addToast('success', 'Đặt lịch lái thử thành công! Kiểm tra email để xem chi tiết.')
        reset()
        onClose()
      }
    } catch {
      addToast('error', 'Không thể đặt lịch. Vui lòng thử lại.')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Đặt Lịch Lái Thử">
      {vehicleName && (
        <p className="mb-4 text-sm text-slate-500">Xe: {vehicleName}</p>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Họ tên"
          {...register('name')}
          error={errors.name?.message}
        />
        <Input
          label="Số điện thoại"
          type="tel"
          {...register('phone')}
          error={errors.phone?.message}
        />
        <Input
          label="Ngày muốn lái"
          type="date"
          {...register('date')}
          error={errors.date?.message}
        />
        <Select
          label="Khung giờ"
          options={timeSlots.map((t) => ({ value: t, label: t }))}
          placeholder="Chọn giờ"
          error={errors.timeSlot?.message}
          {...register('timeSlot')}
        />
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Ghi chú</label>
          <textarea
            {...register('note')}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#1A3C6E] focus:outline-none"
            rows={3}
            placeholder="Ghi chú thêm..."
          />
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" loading={isSubmitting}>
            Xác Nhận Đặt Lịch
          </Button>
        </div>
      </form>
    </Modal>
  )
}
