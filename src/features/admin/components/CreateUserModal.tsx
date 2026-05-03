import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal, Input, Button } from '@/components/ui'

const ROLES_REQUIRE_BRANCH = ['SalesStaff', 'BranchManager'] as const
const VN_PHONE_REGEX = /^0\d{9}$/

function requiresBranch(role: string) {
  return (ROLES_REQUIRE_BRANCH as readonly string[]).includes(role)
}

const schema = z.object({
  name: z.string().trim().min(2, 'Tối thiểu 2 ký tự'),
  email: z.string().trim().min(1, 'Email không được để trống').email('Email không hợp lệ'),
  phone: z
    .string()
    .trim()
    .min(1, 'Số điện thoại không được để trống')
    .max(20, 'Số điện thoại tối đa 20 ký tự')
    .refine((value) => VN_PHONE_REGEX.test(value.replace(/\s/g, '')), 'Số điện thoại phải đúng 10 chữ số và bắt đầu bằng 0'),
  password: z.string().min(8, 'Mật khẩu từ 8 ký tự'),
  role: z.string().min(1, 'Bắt buộc'),
  branchId: z.string().optional(),
}).superRefine((data, ctx) => {
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
]

interface CreateUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    name: string
    email: string
    phone: string
    password: string
    role: string
    branchId?: number | null
  }) => Promise<void>
  branches: { id: string; name: string }[]
}

export function CreateUserModal({ isOpen, onClose, onSubmit, branches }: CreateUserModalProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      role: 'Customer',
      branchId: '',
    },
  })

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit({
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone.replace(/\s/g, '').trim(),
      password: data.password,
      role: data.role,
      branchId: data.branchId?.trim() ? Number(data.branchId) : null,
    })
    form.reset()
    onClose()
  })

  const handleClose = () => {
    form.reset()
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Tạo tài khoản"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>Hủy</Button>
          <Button variant="primary" type="button" onClick={() => handleSubmit()} loading={form.formState.isSubmitting}>
            Tạo
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Họ tên" {...form.register('name')} error={form.formState.errors.name?.message} required />
        <Input label="Email" type="email" {...form.register('email')} error={form.formState.errors.email?.message} required />
        <Input label="Mật khẩu" type="password" {...form.register('password')} error={form.formState.errors.password?.message} required />
        <Input label="Số điện thoại" {...form.register('phone')} error={form.formState.errors.phone?.message} required />
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Vai trò <span className="text-red-500">*</span></label>
          <select {...form.register('role')} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
            {ROLE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Chi nhánh {requiresBranch(form.watch('role')) ? <span className="text-red-500">*</span> : null}
            <span className="text-slate-500"> (bắt buộc với NV / Quản lý)</span>
          </label>
          <select {...form.register('branchId')} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option value="">-- Không --</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          {form.formState.errors.branchId ? <p className="mt-1 text-xs text-red-600">{form.formState.errors.branchId.message}</p> : null}
        </div>
      </form>
    </Modal>
  )
}
