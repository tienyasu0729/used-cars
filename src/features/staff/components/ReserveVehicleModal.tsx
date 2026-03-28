import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Vehicle } from '@/types/vehicle.types'
import { Modal, Button } from '@/components/ui'

const schema = z.object({
  customerId: z.string().min(1, 'Chọn khách hàng'),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface ReserveVehicleModalProps {
  vehicle: Vehicle | null
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: FormData) => void | Promise<void>
  customers: { id: string; name: string }[]
}

export function ReserveVehicleModal({
  vehicle,
  isOpen,
  onClose,
  onSubmit,
  customers,
}: ReserveVehicleModalProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { customerId: '', notes: '' },
  })

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit(data)
    form.reset()
    onClose()
  })

  if (!vehicle) return null

  const im0 = vehicle.images?.[0]
  const thumb = typeof im0 === 'string' ? im0 : im0?.url

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Đặt chỗ xe">
      <div className="mb-4 flex gap-3">
        <img
          src={thumb || 'https://placehold.co/96x64'}
          alt=""
          className="h-16 w-24 rounded object-cover"
        />
        <div>
          <p className="font-bold text-slate-900">
            {vehicle.brand} {vehicle.model}
          </p>
          <p className="text-sm text-slate-500">Năm {vehicle.year}</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Khách hàng</label>
          <select
            {...form.register('customerId')}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="">-- Chọn --</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {form.formState.errors.customerId && (
            <p className="mt-1 text-xs text-red-600">{form.formState.errors.customerId.message}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Ghi chú đặt chỗ</label>
          <textarea
            {...form.register('notes')}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            rows={2}
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit">Xác nhận đặt chỗ</Button>
        </div>
      </form>
    </Modal>
  )
}
