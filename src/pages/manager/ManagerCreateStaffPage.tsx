import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { UserPlus, ShieldCheck, Eye, EyeOff } from 'lucide-react'
import { Input, Button } from '@/components/ui'
import { PasswordStrength } from '@/components/auth/PasswordStrength'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'
import { managerStaffService } from '@/services/managerStaff.service'
import { PROFILE_NAME_REGEX_U } from '@/utils/profileValidation'
import {
  ACCOUNT_PASSWORD_MIN_LENGTH,
  ACCOUNT_PASSWORD_MAX_LENGTH,
  ACCOUNT_PASSWORD_RANGE_MESSAGE,
  ACCOUNT_PASSWORD_PLACEHOLDER,
  PASSWORD_CONFIRM_MISMATCH_MESSAGE,
} from '@/lib/auth/passwordRules'

// Regex giống RegisterForm/backend: 10–20 chữ số, bắt đầu bằng 0
const VN_PHONE_REGEX = /^0\d{9,19}$/

const schema = z
  .object({
    name: z
      .string()
      .min(2, 'Họ tên tối thiểu 2 ký tự.')
      .max(100, 'Họ tên tối đa 100 ký tự.')
      .refine((v) => PROFILE_NAME_REGEX_U.test(v.trim()), {
        message: 'Họ tên chỉ chứa chữ cái, số, khoảng trắng, dấu chấm, gạch nối.',
      }),
    email: z
      .string()
      .min(1, 'Email không được để trống.')
      .email('Email không hợp lệ.')
      .max(255, 'Email tối đa 255 ký tự.'),
    phone: z
      .string()
      .min(1, 'Số điện thoại không được để trống.')
      .max(20, 'Số điện thoại tối đa 20 ký tự.')
      .refine((v) => VN_PHONE_REGEX.test(v.replace(/\s/g, '')), {
        message: 'Số điện thoại bắt đầu bằng 0, 10–20 chữ số.',
      }),
    startDate: z.string().min(1, 'Ngày bắt đầu là bắt buộc.'),
    notes: z.string().optional(),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
    confirmTerms: z.boolean().refine((v) => v, 'Cần xác nhận điều khoản.'),
    autoPassword: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.autoPassword) return
    const p = (data.password ?? '').trim()
    if (!p) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['password'], message: 'Mật khẩu không được để trống.' })
      return
    }
    if (p.length < ACCOUNT_PASSWORD_MIN_LENGTH || p.length > ACCOUNT_PASSWORD_MAX_LENGTH) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['password'], message: ACCOUNT_PASSWORD_RANGE_MESSAGE })
      return
    }
    const c = (data.confirmPassword ?? '').trim()
    if (!c) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['confirmPassword'], message: 'Vui lòng xác nhận mật khẩu.' })
    } else if (p !== c) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['confirmPassword'], message: PASSWORD_CONFIRM_MISMATCH_MESSAGE })
    }
  })

type FormData = z.infer<typeof schema>

function generateTempPassword(): string {
  const rnd = Math.random().toString(36).slice(2, 10)
  return `Bx${rnd}1a`
}

export function ManagerCreateStaffPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const addToast = useToastStore((s) => s.addToast)
  const user = useAuthStore((s) => s.user)
  const [autoPassword, setAutoPassword] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      startDate: new Date().toISOString().slice(0, 10),
      confirmTerms: true,
      password: '',
      confirmPassword: '',
      autoPassword: true,
    },
  })

  const passwordValue = watch('password') ?? ''

  const createMutation = useMutation({
    mutationFn: managerStaffService.create,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['branch-staff'] })
    },
  })

  const onSubmit = async (data: FormData) => {
    const branchId = user?.branchId
    if (typeof branchId !== 'number') {
      addToast(
        'error',
        'Tài khoản chưa gắn chi nhánh (branchId). Đăng nhập lại bằng manager có StaffAssignment hoặc làm manager chi nhánh trong DB.',
      )
      return
    }

    const password = autoPassword ? generateTempPassword() : (data.password ?? '').trim()

    try {
      await createMutation.mutateAsync({
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone.replace(/\s/g, '').trim(),
        password,
        branchId,
      })
      if (autoPassword) {
        addToast(
          'success',
          `Đã tạo nhân viên. Mật khẩu tạm: ${password} — hãy gửi cho nhân viên (hệ thống chưa gửi email tự động).`,
        )
      } else {
        addToast('success', 'Đã tạo nhân viên.')
      }
      navigate('/manager/staff')
    } catch (e: unknown) {
      const err = e as { message?: string }
      addToast('error', err.message ?? 'Không tạo được nhân viên. Kiểm tra email/số điện thoại đã tồn tại chưa.')
    }
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
              <Input {...register('name')} placeholder="Nguyễn Văn A" autoComplete="name" />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-slate-700">Địa chỉ Email</span>
              <Input {...register('email')} type="email" placeholder="example@banxeoto.vn" autoComplete="email" />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-slate-700">Số điện thoại</span>
              <Input {...register('phone')} type="tel" placeholder="0905123456" autoComplete="tel" />
              {errors.phone && (
                <p className="text-xs text-red-500">{errors.phone.message}</p>
              )}
            </label>
            <div className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 md:col-span-2">
              <span className="text-sm font-semibold text-slate-700">Vai trò được tạo</span>
              <p className="text-sm text-slate-900">Nhân viên bán hàng (SalesStaff)</p>
            </div>
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
                  Mật khẩu tạm hiển thị sau khi tạo — hãy gửi cho nhân viên (chưa gửi email tự động).
                </span>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={autoPassword}
                  onChange={(e) => {
                    setAutoPassword(e.target.checked)
                    setValue('autoPassword', e.target.checked)
                    if (e.target.checked) {
                      setValue('password', '')
                      setValue('confirmPassword', '')
                    }
                  }}
                />
                <div className="h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all peer-checked:bg-[#1A3C6E] peer-checked:after:translate-x-full peer-checked:after:border-white" />
              </label>
            </div>
            {!autoPassword && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-slate-700">Mật khẩu</span>
                  <div className="relative">
                    <Input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder={ACCOUNT_PASSWORD_PLACEHOLDER}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      tabIndex={-1}
                      aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <PasswordStrength password={passwordValue} />
                  {errors.password && (
                    <p className="text-xs text-red-500">{errors.password.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-slate-700">Xác nhận mật khẩu</span>
                  <div className="relative">
                    <Input
                      {...register('confirmPassword')}
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Nhập lại mật khẩu"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      tabIndex={-1}
                      aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>
            )}
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
              disabled={createMutation.isPending}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#1A3C6E] py-3.5 font-bold text-white shadow-md hover:bg-[#1A3C6E]/90 disabled:opacity-60"
            >
              <UserPlus className="h-5 w-5" />
              {createMutation.isPending ? 'Đang tạo…' : 'Tạo Tài Khoản'}
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
