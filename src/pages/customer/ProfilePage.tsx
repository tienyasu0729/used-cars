import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'
import { mockProfileExtras } from '@/mock/mockProfile'
import { Button, Input } from '@/components/ui'
import { Mail, Lock } from 'lucide-react'

const schema = z.object({
  name: z.string().min(2, 'Họ tên tối thiểu 2 ký tự'),
  phone: z.string().regex(/^0\d{9}$|^\+84\d{9}$/, 'SĐT 10 số'),
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
})

type FormData = z.infer<typeof schema>

function getDashboardPath(pathname: string): string {
  if (pathname.startsWith('/staff')) return '/staff/dashboard'
  if (pathname.startsWith('/manager')) return '/manager/dashboard'
  return '/dashboard'
}

function maskEmail(email: string): string {
  if (!email || email.length < 5) return email
  const [local, domain] = email.split('@')
  if (!domain) return email
  const visible = Math.min(3, Math.floor(local.length / 2))
  return local.slice(0, visible) + '***' + local.slice(-visible) + '@' + domain
}

export function ProfilePage() {
  const { pathname } = useLocation()
  const { user } = useAuthStore()
  const addToast = useToastStore((s) => s.addToast)
  const extras = user?.id ? mockProfileExtras[user.id] : null

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name ?? '',
      phone: user?.phone ?? '',
      dateOfBirth: extras?.dateOfBirth ?? '',
      address: extras?.address ?? '',
      gender: extras?.gender ?? 'male',
    },
  })

  const onSave = (data: FormData) => {
    addToast('success', 'Thông tin cá nhân đã cập nhật')
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <nav className="flex items-center gap-2 text-sm text-slate-500">
        <Link to={getDashboardPath(pathname)} className="transition-colors hover:text-[#1A3C6E]">
          Bảng điều khiển
        </Link>
        <span>/</span>
        <span className="font-medium text-slate-900">Hồ sơ cá nhân</span>
      </nav>

      <section className="space-y-5">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-lg font-bold text-slate-900">Chỉnh sửa hồ sơ</h2>
            <p className="mt-0.5 text-sm text-slate-500">Quản lý thông tin cá nhân để bảo mật tài khoản tốt hơn</p>
          </div>
          <form onSubmit={handleSubmit(onSave)} className="space-y-5 p-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Họ và tên</label>
                <Input {...register('name')} error={errors.name?.message} placeholder="Nhập họ tên" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Số điện thoại</label>
                <Input type="tel" {...register('phone')} error={errors.phone?.message} placeholder="Nhập số điện thoại" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Ngày sinh</label>
                <Input type="date" {...register('dateOfBirth')} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Giới tính</label>
                <div className="flex gap-4 pt-1.5">
                  {(['male', 'female', 'other'] as const).map((g) => (
                      <label key={g} className="flex cursor-pointer items-center gap-2">
                      <input type="radio" {...register('gender')} value={g} className="text-[#1A3C6E] focus:ring-[#1A3C6E]" />
                      <span className="text-sm text-slate-600">{g === 'male' ? 'Nam' : g === 'female' ? 'Nữ' : 'Khác'}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Địa chỉ hiện tại</label>
              <Input {...register('address')} placeholder="Nhập địa chỉ của bạn" />
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
              <button
                type="button"
                className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Hủy bỏ
              </button>
              <Button
                type="submit"
                variant="primary"
                loading={isSubmitting}
                className="rounded-lg bg-[#1A3C6E] px-5 py-2 text-sm font-semibold shadow-lg shadow-[#1A3C6E]/20"
              >
                Lưu thay đổi
              </Button>
            </div>
          </form>
        </div>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-lg font-bold text-slate-900">Bảo mật & Tài khoản</h2>
          </div>
          <div className="divide-y divide-slate-100">
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Email</p>
                  <p className="text-xs text-slate-500">{user?.email ? maskEmail(user.email) : '-'}</p>
                </div>
              </div>
              <Link to="/forgot-password" className="text-sm font-semibold text-[#1A3C6E] hover:underline">
                Thay đổi
              </Link>
            </div>
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Mật khẩu</p>
                  <p className="text-xs text-slate-500">Cập nhật lần cuối: {extras?.passwordUpdatedAt ?? 'Chưa cập nhật'}</p>
                </div>
              </div>
              <Link to={pathname.startsWith('/staff') ? '/staff/security' : pathname.startsWith('/manager') ? '/manager/security' : '/dashboard/security'} className="text-sm font-semibold text-[#1A3C6E] hover:underline">
                Đổi mật khẩu
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
