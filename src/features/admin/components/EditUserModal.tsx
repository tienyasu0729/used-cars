import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal, Input, Button } from '@/components/ui'
import type { AdminUser } from '@/types/admin.types'

const ROLES_NO_BRANCH = ['Customer', 'Admin'] as const
const ROLES_REQUIRE_BRANCH = ['SalesStaff', 'BranchManager'] as const

function requiresBranch(role: string) {
  return (ROLES_REQUIRE_BRANCH as readonly string[]).includes(role)
}

const baseSchema = z.object({
  name: z.string().min(2, 'Tối thiểu 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().max(20, 'Tối đa 20 ký tự'),
  role: z.string().min(1, 'Bắt buộc'),
  branchId: z.string().optional(),
  status: z.enum(['active', 'inactive', 'locked']),
})

const schema = baseSchema.superRefine((data, ctx) => {
  if (requiresBranch(data.role) && !data.branchId?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Vui lòng chọn chi nhánh cho vai trò này.',
      path: ['branchId'],
    })
  }
})

type FormData = z.infer<typeof schema>

const ROLE_OPTIONS = [
  { value: 'Customer', label: 'Khách hàng' },
  { value: 'SalesStaff', label: 'Nhân viên bán hàng' },
  { value: 'BranchManager', label: 'Quản lý chi nhánh' },
  { value: 'Admin', label: 'Admin' },
]

interface EditUserModalProps {
  user: AdminUser | null
  isOpen: boolean
  onClose: () => void
  onSave: (id: string, data: FormData) => Promise<void>
  onDeactivate: (id: string) => Promise<void>
  branches: { id: string; name: string }[]
}

export function EditUserModal({
  user,
  isOpen,
  onClose,
  onSave,
  onDeactivate,
  branches,
}: EditUserModalProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    values: user
      ? {
          name: user.name,
          email: user.email,
          phone: user.phone ?? '',
          role: user.role,
          branchId:
            ROLES_NO_BRANCH.includes(user.role as (typeof ROLES_NO_BRANCH)[number])
              ? ''
              : (user.branchId ?? ''),
          status: user.status,
        }
      : undefined,
  })

  const role = form.watch('role')
  const branchId = form.watch('branchId')

  useEffect(() => {
    if (!user || !isOpen) return
    if (role === 'Customer' || role === 'Admin') {
      form.setValue('branchId', '', { shouldValidate: true, shouldDirty: true })
    }
  }, [role, user, isOpen, form])

  useEffect(() => {
    if (isOpen && user) void form.trigger()
  }, [isOpen, user?.id, form])

  const needsBranch = requiresBranch(role)
  const branchMissing = needsBranch && !String(branchId ?? '').trim()

  const branchSelectClass = needsBranch
    ? branchMissing
      ? 'w-full rounded-lg border-2 border-amber-500 bg-amber-50/40 px-3 py-2 text-sm shadow-[0_0_0_3px_rgba(245,158,11,0.25)] outline-none transition-[box-shadow,border-color] animate-pulse'
      : 'w-full rounded-lg border-2 border-emerald-500/70 bg-white px-3 py-2 text-sm shadow-[0_0_0_2px_rgba(16,185,129,0.2)] outline-none transition-[box-shadow,border-color]'
    : 'w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm text-slate-500'

  const branchErr = form.formState.errors.branchId?.message
  const canSave = form.formState.isValid && !form.formState.isSubmitting

  const onFormSubmit = form.handleSubmit(async (data) => {
    if (!user) return
    await onSave(user.id, data)
    form.reset()
    onClose()
  })

  const handleDeactivate = async () => {
    if (!user) return
    await onDeactivate(user.id)
    onClose()
  }

  if (!user) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chỉnh sửa người dùng"
      footer={
        <div className="flex w-full justify-between">
          <Button variant="danger" onClick={handleDeactivate} disabled={user.status === 'inactive'}>
            Vô hiệu hóa
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Hủy</Button>
            <Button
              variant="primary"
              type="button"
              onClick={() => onFormSubmit()}
              loading={form.formState.isSubmitting}
              disabled={!canSave}
            >
              Lưu thay đổi
            </Button>
          </div>
        </div>
      }
    >
      <form onSubmit={onFormSubmit} className="space-y-4">
        <Input label="Họ tên" {...form.register('name')} error={form.formState.errors.name?.message} required />
        <Input label="Email" type="email" {...form.register('email')} error={form.formState.errors.email?.message} required disabled readOnly className="bg-slate-50" />
        <p className="text-xs text-slate-500">Email không đổi qua API quản trị.</p>
        <Input label="Số điện thoại" {...form.register('phone')} error={form.formState.errors.phone?.message} />
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Vai trò</label>
          <select {...form.register('role')} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
            {ROLE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Chi nhánh
            {needsBranch ? <span className="ml-1 text-amber-700">*</span> : null}
          </label>
          <select
            {...form.register('branchId')}
            disabled={!needsBranch}
            className={branchSelectClass}
            aria-invalid={branchMissing ? true : undefined}
            aria-required={needsBranch}
          >
            <option value="">{needsBranch ? '-- Chọn chi nhánh --' : '-- Không --'}</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          {needsBranch && (
            <p className={`mt-1 text-xs ${branchMissing ? 'font-medium text-amber-800' : 'text-emerald-700'}`}>
              {branchMissing
                ? 'Bắt buộc chọn chi nhánh cho nhân viên bán hàng hoặc quản lý chi nhánh.'
                : 'Đã chọn chi nhánh — có thể lưu.'}
            </p>
          )}
          {!needsBranch && (
            <p className="mt-1 text-xs text-slate-500">Khách hàng và Admin không gắn chi nhánh trên hệ thống.</p>
          )}
          {branchErr ? <p className="mt-1 text-xs text-red-600">{branchErr}</p> : null}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Trạng thái</label>
          <select {...form.register('status')} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option value="active">Hoạt động</option>
            <option value="inactive">Vô hiệu</option>
            <option value="locked">Khóa (suspended)</option>
          </select>
        </div>
      </form>
    </Modal>
  )
}
