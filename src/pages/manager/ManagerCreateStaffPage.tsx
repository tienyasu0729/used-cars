import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, Link } from 'react-router-dom'
import { UserPlus, ShieldCheck } from 'lucide-react'
import { Input, Button } from '@/components/ui'

const schema = z.object({
  name: z.string().min(2, 'Tối thiểu 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().min(10, 'Số điện thoại không hợp lệ'),
  role: z.string().min(1, 'Bắt buộc'),
  startDate: z.string().min(1, 'Bắt buộc'),
  notes: z.string().optional(),
  confirmTerms: z.boolean().refine((v) => v, 'Cần xác nhận điều khoản'),
})

type FormData = z.infer<typeof schema>

const ROLE_OPTIONS = [
  { value: 'sales', label: 'Sales Staff (Nhân viên kinh doanh)' },
  { value: 'technician', label: 'Technician (Kỹ thuật viên)' },
  { value: 'manager', label: 'Branch Manager (Quản lý chi nhánh)' },
  { value: 'admin', label: 'Admin' },
]

export function ManagerCreateStaffPage() {
  const navigate = useNavigate()
  const [autoPassword, setAutoPassword] = useState(true)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      role: 'sales',
      startDate: '2023-10-27',
      confirmTerms: true,
    },
  })

  const onSubmit = (data: FormData) => {
    console.log({ ...data, autoPassword })
    navigate('/manager/staff')
  }

  return (
    <div className="mx-auto max-w-[960px] space-y-8">
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Link to="/manager/dashboard" className="text-sm font-medium text-slate-500 hover:underline">
          Quản lý
        </Link>
        <span className="text-slate-400">/</span>
        <Link to="/manager/staff" className="text-sm font-medium text-slate-500 hover:underline">
          Nhân viên
        </Link>
        <span className="text-slate-400">/</span>
        <span className="text-sm font-semibold text-[#1A3C6E]">Thêm Nhân Viên</span>
      </div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold leading-tight text-slate-900">
          Thêm Nhân Viên Mới
        </h1>
        <p className="mt-2 text-base text-slate-600">
          Tạo tài khoản truy cập hệ thống cho nhân viên mới tại chi nhánh Đà Nẵng.
        </p>
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 p-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-slate-700">Họ và tên nhân viên</span>
              <Input {...register('name')} placeholder="Nguyễn Văn A" />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-slate-700">Địa chỉ Email</span>
              <Input {...register('email')} type="email" placeholder="example@banxeoto.vn" />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-slate-700">Số điện thoại</span>
              <Input {...register('phone')} type="tel" placeholder="0905 XXX XXX" />
              {errors.phone && (
                <p className="text-xs text-red-500">{errors.phone.message}</p>
              )}
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-slate-700">Vai trò</span>
              <select
                {...register('role')}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-[#1A3C6E] focus:outline-none focus:ring-1 focus:ring-[#1A3C6E]"
              >
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 md:col-span-2">
              <span className="text-sm font-semibold text-slate-700">Ngày bắt đầu làm việc</span>
              <Input {...register('startDate')} type="date" />
              {errors.startDate && (
                <p className="text-xs text-red-500">{errors.startDate.message}</p>
              )}
            </label>
          </div>
          <hr className="border-slate-200" />
          <div className="flex flex-col gap-4">
            <h3 className="text-base font-bold text-slate-900">Bảo mật tài khoản</h3>
            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col">
                <span className="font-medium text-slate-900">Tự động tạo mật khẩu</span>
                <span className="text-xs text-slate-500">
                  Mật khẩu mạnh sẽ được gửi qua email cho nhân viên.
                </span>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={autoPassword}
                  onChange={(e) => setAutoPassword(e.target.checked)}
                />
                <div className="h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all peer-checked:bg-[#1A3C6E] peer-checked:after:translate-x-full peer-checked:after:border-white" />
              </label>
            </div>
          </div>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-slate-700">Ghi chú (Tùy chọn)</span>
            <textarea
              {...register('notes')}
              rows={3}
              placeholder="Thông tin bổ sung về nhân sự..."
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-[#1A3C6E] focus:outline-none focus:ring-1 focus:ring-[#1A3C6E]"
            />
          </label>
          <div className="flex items-start gap-3 pt-2">
            <input
              {...register('confirmTerms')}
              type="checkbox"
              className="mt-1 h-5 w-5 rounded border-slate-300 text-[#1A3C6E] focus:ring-[#1A3C6E]"
              id="confirm-terms"
            />
            <label
              htmlFor="confirm-terms"
              className="cursor-pointer text-sm leading-relaxed text-slate-600"
            >
              Tôi xác nhận việc tạo tài khoản này và hệ thống sẽ gửi một email chào mừng chứa thông
              tin đăng nhập đến địa chỉ email đã cung cấp.
            </label>
          </div>
          {errors.confirmTerms && (
            <p className="text-xs text-red-500">{errors.confirmTerms.message}</p>
          )}
          <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row">
            <Button
              type="submit"
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#1A3C6E] py-3.5 font-bold text-white shadow-md hover:bg-[#1A3C6E]/90"
            >
              <UserPlus className="h-5 w-5" />
              Tạo Tài Khoản
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="flex-1 rounded-lg bg-slate-100 py-3.5 font-bold text-slate-700 hover:bg-slate-200"
              onClick={() => navigate('/manager/staff')}
            >
              Hủy bỏ
            </Button>
          </div>
        </form>
      </div>
      <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
        <ShieldCheck className="h-4 w-4" />
        <span>Mọi thao tác thay đổi nhân sự đều được lưu vào nhật ký hệ thống.</span>
      </div>
    </div>
  )
}
