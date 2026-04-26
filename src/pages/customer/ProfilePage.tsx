import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'
import { Button, Input, ConfirmDialog } from '@/components/ui'
import { Lock } from 'lucide-react'
import { getProfile, updateProfile, normalizeVNPhoneForApi } from '@/services/user.service'
import { isoDateToDdMmYyyy, ddMmYyyyToIso, isValidDdMmYyyyOrEmpty } from '@/utils/dateDdMmYyyy'
import { formatDateInputDdMmYyyy } from '@/utils/dateInputMask'
import {
  PROFILE_NAME_REGEX_U,
  PROFILE_ADDRESS_MAX_LEN,
  profileAddressNoIllegalControlChars,
} from '@/utils/profileValidation'
import type { ApiErrorResponse } from '@/types/auth.types'

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Họ tên từ 2 đến 100 ký tự')
    .max(100, 'Họ tên từ 2 đến 100 ký tự')
    .regex(
      PROFILE_NAME_REGEX_U,
      "Họ tên chỉ gồm chữ cái (có dấu), số, khoảng trắng và các ký tự . ' -",
    ),
  phone: z
    .string()
    .optional()
    .refine((s) => {
      if (s == null || s.trim() === '') return true
      const n = normalizeVNPhoneForApi(s)
      return n != null && /^0\d{9}$/.test(n)
    }, 'Số điện thoại không hợp lệ (10 số bắt đầu 0, hoặc +84 và 9 chữ số)'),
  dateOfBirth: z.string().optional().refine(isValidDdMmYyyyOrEmpty, 'Ngày sinh: dd/mm/yyyy hợp lệ hoặc để trống'),
  address: z
    .string()
    .optional()
    .refine(
      (s) => !s?.trim() || s.trim().length <= PROFILE_ADDRESS_MAX_LEN,
      `Địa chỉ tối đa ${PROFILE_ADDRESS_MAX_LEN} ký tự`,
    )
    .refine(
      (s) => !s?.trim() || profileAddressNoIllegalControlChars(s.trim()),
      'Địa chỉ không được chứa ký tự điều khiển',
    ),
  gender: z.enum(['male', 'female', 'other']).optional(),
})

type FormData = z.infer<typeof schema>

function getDashboardPath(pathname: string): string {
  if (pathname.startsWith('/admin')) return '/admin/dashboard'
  if (pathname.startsWith('/staff')) return '/staff/dashboard'
  if (pathname.startsWith('/manager')) return '/manager/dashboard'
  return '/dashboard'
}

export function ProfilePage() {
  const { pathname } = useLocation()
  const { user, patchUser } = useAuthStore()
  const addToast = useToastStore((s) => s.addToast)

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      phone: '',
      dateOfBirth: '',
      address: '',
      gender: 'male',
    },
  })

  useEffect(() => {
    let alive = true
    getProfile()
      .then((p) => {
        if (!alive) return
        patchUser(p)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [patchUser])

  useEffect(() => {
    if (!user) return
    reset({
      name: user.name,
      phone: user.phone ?? '',
      dateOfBirth: isoDateToDdMmYyyy(user.dateOfBirth),
      address: user.address ?? '',
      gender: user.gender ?? 'male',
    })
  }, [user, reset])

  // State cho popup xác nhận trước khi lưu
  const [showConfirm, setShowConfirm] = useState(false)
  const [pendingData, setPendingData] = useState<FormData | null>(null)

  // Khi ấn "Lưu thay đổi" → validate form trước, nếu hợp lệ thì hiện popup xác nhận
  const onSave = handleSubmit((data: FormData) => {
    setPendingData(data)
    setShowConfirm(true)
  })

  // Khi user xác nhận trong popup → gọi API cập nhật
  const onConfirmSave = async () => {
    if (!user || !pendingData) return
    const data = pendingData
    const phoneNorm = data.phone?.trim() ? normalizeVNPhoneForApi(data.phone) : null
    try {
      const iso = ddMmYyyyToIso(data.dateOfBirth)
      const p = await updateProfile({
        name: data.name,
        phone: phoneNorm,
        address: data.address?.trim() ? data.address.trim() : null,
        dateOfBirth: iso ?? null,
        gender: data.gender ?? null,
      })
      patchUser(p)
      addToast('success', 'Thông tin cá nhân đã cập nhật')
    } catch (err) {
      const api = err as ApiErrorResponse
      if (api?.errorCode === 'VALIDATION_FAILED' && api.errors?.length) {
        addToast('error', api.errors.map((e) => e.message).join(' '))
      } else {
        addToast('error', api?.message || 'Không lưu được. Vui lòng thử lại.')
      }
    } finally {
      setShowConfirm(false)
      setPendingData(null)
    }
  }

  const onCancel = () => {
    if (!user) return
    reset({
      name: user.name,
      phone: user.phone ?? '',
      dateOfBirth: isoDateToDdMmYyyy(user.dateOfBirth),
      address: user.address ?? '',
      gender: user.gender ?? 'male',
    })
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
          <form onSubmit={onSave} className="space-y-5 p-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Họ và tên</label>
                <Input {...register('name')} error={errors.name?.message} placeholder="Nhập họ tên" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Email</label>
                <Input
                  value={user?.email ?? ''}
                  readOnly
                  disabled
                  className="cursor-not-allowed bg-slate-50 text-slate-600"
                  title="Email đăng nhập không đổi tại đây"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Số điện thoại</label>
                <Input type="tel" {...register('phone')} error={errors.phone?.message} placeholder="0xxxxxxxxx hoặc +84" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Ngày sinh</label>
                <Controller
                  name="dateOfBirth"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="text"
                      inputMode="numeric"
                      autoComplete="bday"
                      placeholder="dd/mm/yyyy"
                      onChange={(e) => field.onChange(formatDateInputDdMmYyyy(e.target.value))}
                      error={errors.dateOfBirth?.message}
                    />
                  )}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-semibold text-slate-700">Giới tính</label>
                <div className="flex gap-4 pt-1.5">
                  {(['male', 'female', 'other'] as const).map((g) => (
                    <label key={g} className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        {...register('gender')}
                        value={g}
                        className="text-[#1A3C6E] focus:ring-[#1A3C6E]"
                      />
                      <span className="text-sm text-slate-600">
                        {g === 'male' ? 'Nam' : g === 'female' ? 'Nữ' : 'Khác'}
                      </span>
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
                onClick={onCancel}
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
                  <Lock className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Mật khẩu</p>
                  <p className="text-xs text-slate-500">Đặt mật khẩu mạnh và đổi định kỳ.</p>
                </div>
              </div>
              <Link
                to={
                  pathname.startsWith('/admin')
                    ? '/admin/security'
                    : pathname.startsWith('/staff')
                      ? '/staff/security'
                      : pathname.startsWith('/manager')
                        ? '/manager/security'
                        : '/dashboard/security'
                }
                className="text-sm font-semibold text-[#1A3C6E] hover:underline"
              >
                Đổi mật khẩu
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Popup xác nhận trước khi lưu thay đổi hồ sơ */}
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => { setShowConfirm(false); setPendingData(null) }}
        onConfirm={onConfirmSave}
        title="Xác nhận cập nhật hồ sơ"
        message="Bạn có chắc chắn muốn lưu thay đổi thông tin cá nhân không?"
        confirmLabel="Lưu thay đổi"
        cancelLabel="Hủy bỏ"
        confirmVariant="primary"
      />
    </div>
  )
}
