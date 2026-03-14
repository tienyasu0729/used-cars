import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '@/store/authStore'
import { Button, Input } from '@/components/ui'
import { useToastStore } from '@/store/toastStore'

const schema = z.object({
  name: z.string().min(2, 'Họ tên tối thiểu 2 ký tự'),
  phone: z.string().regex(/^0\d{9}$|^\+84\d{9}$/, 'SĐT 10 số, bắt đầu 0 hoặc +84'),
})

type FormData = z.infer<typeof schema>

export function ProfilePage() {
  const { user } = useAuthStore()
  const addToast = useToastStore((s) => s.addToast)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name ?? '',
      phone: user?.phone ?? '',
    },
  })

  const onSave = (data: FormData) => {
    addToast('success', 'Thông tin cá nhân đã cập nhật')
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <h1 className="text-2xl font-bold text-slate-900">Thông Tin Cá Nhân</h1>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex flex-col items-center">
              <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-[#1A3C6E]/10 text-4xl font-bold text-[#1A3C6E]">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <p className="mt-4 text-lg font-semibold text-slate-900">{user?.name}</p>
              <p className="text-sm text-slate-500">{user?.email}</p>
              <p className="text-sm text-slate-500">{user?.phone}</p>
            </div>
          </div>
        </div>
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSave)} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
            <Input
              label="Họ và tên"
              {...register('name')}
              error={errors.name?.message}
            />
            <Input
              label="Số điện thoại"
              type="tel"
              {...register('phone')}
              error={errors.phone?.message}
            />
            <Button type="submit" loading={isSubmitting}>
              Lưu Thay Đổi
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
