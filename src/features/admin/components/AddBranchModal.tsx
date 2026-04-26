import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal, Input, Button } from '@/components/ui'

const schema = z.object({
  name: z.string().min(5, 'Tối thiểu 5 ký tự'),
  address: z.string().min(5, 'Bắt buộc'),
  phone: z.string().min(10, 'Số điện thoại không hợp lệ'),
  manager: z.string().min(2, 'Bắt buộc'),
  workingHours: z.string().min(1, 'Bắt buộc'),
})

type FormData = z.infer<typeof schema>

interface AddBranchModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: FormData) => Promise<void>
}

export function AddBranchModal({ isOpen, onClose, onSubmit }: AddBranchModalProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      address: '',
      phone: '',
      manager: '',
      workingHours: '08:00 - 18:00',
    },
  })

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit(data)
    form.reset({ workingHours: '08:00 - 18:00' })
    onClose()
  })

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Thêm chi nhánh mới"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button variant="primary" onClick={handleSubmit} loading={form.formState.isSubmitting}>
            Tạo chi nhánh
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Tên chi nhánh" {...form.register('name')} error={form.formState.errors.name?.message} required />
        <Input label="Địa chỉ" {...form.register('address')} error={form.formState.errors.address?.message} required />
        <Input label="Số điện thoại" {...form.register('phone')} error={form.formState.errors.phone?.message} required />
        <Input label="Quản lý" {...form.register('manager')} error={form.formState.errors.manager?.message} required />
        <Input label="Giờ làm việc" {...form.register('workingHours')} placeholder="08:00 - 18:00" error={form.formState.errors.workingHours?.message} required />
      </form>
    </Modal>
  )
}
