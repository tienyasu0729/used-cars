import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal, Input, Button } from '@/components/ui'
import type { AdminUser } from '@/mock/mockAdminData'

const schema = z.object({
  name: z.string().min(2, 'Tối thiểu 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().min(10, 'Số điện thoại không hợp lệ'),
  role: z.string().min(1, 'Bắt buộc'),
  branchId: z.string().optional(),
  status: z.enum(['active', 'inactive']),
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
    values: user
      ? {
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          branchId: user.branchId ?? '',
          status: user.status,
        }
      : undefined,
  })

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
            <Button variant="primary" type="button" onClick={() => onFormSubmit()} loading={form.formState.isSubmitting}>
              Lưu thay đổi
            </Button>
          </div>
        </div>
      }
    >
      <form onSubmit={onFormSubmit} className="space-y-4">
        <Input label="Họ tên" {...form.register('name')} error={form.formState.errors.name?.message} required />
        <Input label="Email" type="email" {...form.register('email')} error={form.formState.errors.email?.message} required />
        <Input label="Số điện thoại" {...form.register('phone')} error={form.formState.errors.phone?.message} required />
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Vai trò</label>
          <select {...form.register('role')} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
            {ROLE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Chi nhánh</label>
          <select {...form.register('branchId')} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option value="">-- Không --</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Trạng thái</label>
          <select {...form.register('status')} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option value="active">Hoạt động</option>
            <option value="inactive">Vô hiệu</option>
          </select>
        </div>
      </form>
    </Modal>
  )
}
