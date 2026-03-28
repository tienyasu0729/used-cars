import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useManagerVehicle } from '@/hooks/useManagerVehicles'
import { useVehicle } from '@/hooks/useVehicles'
import { Input, Button } from '@/components/ui'

const schema = z.object({
  price: z.number().min(1),
  mileage: z.number().min(0),
  status: z.enum(['Available', 'Reserved', 'Sold']),
})

type FormData = z.infer<typeof schema>

function toFormStatus(s: string): FormData['status'] {
  return s === 'Available' || s === 'Reserved' || s === 'Sold' ? s : 'Available'
}

export function ManagerEditVehiclePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: vehicle, isLoading } = useVehicle(id)
  const { updateVehicle } = useManagerVehicle()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: vehicle
      ? {
          price: vehicle.price,
          mileage: vehicle.mileage ?? 0,
          status: toFormStatus(vehicle.status),
        }
      : undefined,
  })

  const onSubmit = (data: FormData) => {
    console.log(data)
    navigate('/manager/vehicles')
  }

  if (isLoading || !vehicle) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1A3C6E] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Chỉnh sửa xe</h1>
        <p className="mt-1 text-slate-500">
          {vehicle.brand} {vehicle.model} {vehicle.year}
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Giá (VNĐ)</label>
              <Input
                type="number"
                {...register('price', { valueAsNumber: true })}
                className="font-bold text-[#E8612A]"
              />
              {errors.price && (
                <p className="text-xs text-red-500">{errors.price.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Số km đã đi</label>
              <Input type="number" {...register('mileage', { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Trạng thái</label>
              <select
                {...register('status')}
                className="w-full rounded-lg border-slate-200 bg-white px-4 py-3 focus:ring-[#1A3C6E]"
              >
                <option value="Available">Đang Bán</option>
                <option value="Reserved">Đã Đặt Cọc</option>
                <option value="Sold">Đã Bán</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/manager/vehicles')}>
            Hủy
          </Button>
          <Button type="submit" className="bg-[#1A3C6E]">
            Lưu thay đổi
          </Button>
        </div>
      </form>
    </div>
  )
}
