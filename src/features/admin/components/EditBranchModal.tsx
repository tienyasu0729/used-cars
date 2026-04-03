import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal, Input, Button } from '@/components/ui'
import type { AdminBranch } from '@/types/admin.types'

const schema = z.object({
  name: z.string().min(1, 'Bắt buộc'),
  address: z.string().min(1, 'Bắt buộc'),
  phone: z.string().max(20).optional().or(z.literal('')),
  status: z.enum(['active', 'inactive']),
})

type FormData = z.infer<typeof schema>

interface EditBranchModalProps {
  branch: AdminBranch | null
  isOpen: boolean
  onClose: () => void
  onSave: (id: string, data: FormData) => Promise<void>
}

export function EditBranchModal({ branch, isOpen, onClose, onSave }: EditBranchModalProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    values: branch
      ? {
          name: branch.name,
          address: branch.address,
          phone: branch.phone ?? '',
          status: branch.status,
        }
      : undefined,
  })

  const onSubmit = form.handleSubmit(async (data) => {
    if (!branch) return
    await onSave(branch.id, data)
    onClose()
  })

  if (!branch) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Sửa chi nhánh"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button variant="primary" type="button" onClick={() => onSubmit()} loading={form.formState.isSubmitting}>
            Lưu
          </Button>
        </div>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Input label="Tên" {...form.register('name')} error={form.formState.errors.name?.message} required />
        <Input label="Địa chỉ" {...form.register('address')} error={form.formState.errors.address?.message} required />
        <Input label="Điện thoại" {...form.register('phone')} error={form.formState.errors.phone?.message} />
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Trạng thái</label>
          <select {...form.register('status')} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option value="active">Hoạt động</option>
            <option value="inactive">Tạm đóng</option>
          </select>
        </div>
        <p className="text-xs text-slate-500">Quản lý chi nhánh gán qua hồ sơ user (BranchManager), không sửa tại đây.</p>
      </form>
    </Modal>
  )
}
