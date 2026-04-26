import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal, Input, Button } from '@/components/ui'

const schema = z.object({
  name: z.string().min(2, 'Tối thiểu 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().max(20),
  password: z.string().min(8, 'Mật khẩu từ 8 ký tự'),
  role: z.string().min(1, 'Bắt buộc'),
  branchId: z.string().optional(),
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
    phone?: string
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
      name: data.name,
      email: data.email,
      phone: data.phone?.trim() || undefined,
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
          <label className="mb-1 block text-sm font-medium text-slate-700">Chi nhánh (bắt buộc với NV / Quản lý)</label>
          <select {...form.register('branchId')} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option value="">-- Không --</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      </form>
    </Modal>
  )
}
