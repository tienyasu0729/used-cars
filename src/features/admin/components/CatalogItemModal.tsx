import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal, Input, Button } from '@/components/ui'

type CatalogTab = 'brands' | 'models' | 'colors' | 'fuelTypes' | 'transmissions'

interface CatalogItemModalProps {
  tab: CatalogTab
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: Record<string, unknown>) => Promise<void>
  editItem?: Record<string, unknown> | null
  brands?: { id: string; name: string }[]
}

const brandSchema = z.object({ name: z.string().min(1), slug: z.string().min(1), status: z.enum(['active', 'inactive']) })
const modelSchema = z.object({ name: z.string().min(1), brandId: z.string().min(1), status: z.enum(['active', 'inactive']) })
const colorSchema = z.object({ name: z.string().min(1), hex: z.string().min(1), status: z.enum(['active', 'inactive']) })
const fuelSchema = z.object({ name: z.string().min(1), status: z.enum(['active', 'inactive']) })
const transmissionSchema = z.object({ name: z.string().min(1), status: z.enum(['active', 'inactive']) })

export function CatalogItemModal({
  tab,
  isOpen,
  onClose,
  onSubmit,
  editItem,
  brands = [],
}: CatalogItemModalProps) {
  const isEdit = !!editItem
  const schema = tab === 'brands' ? brandSchema : tab === 'models' ? modelSchema : tab === 'colors' ? colorSchema : tab === 'transmissions' ? transmissionSchema : fuelSchema

  const form = useForm<Record<string, unknown>>({
    resolver: zodResolver(schema) as never,
    defaultValues: { name: '', slug: '', brandId: '', hex: '#000000', status: 'active' },
  })

  useEffect(() => {
    if (isOpen && editItem) {
      form.reset({
        name: String(editItem.name ?? ''),
        slug: 'slug' in editItem ? String(editItem.slug ?? '') : '',
        brandId: 'brandId' in editItem ? String(editItem.brandId ?? '') : '',
        hex: 'hex' in editItem ? String(editItem.hex ?? '#000000') : '',
        status: (editItem.status as string) ?? 'active',
      })
    } else if (isOpen) {
      form.reset({ name: '', slug: '', brandId: '', hex: '#000000', status: 'active' })
    }
  }, [isOpen, editItem])

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit(data as Record<string, unknown>)
    form.reset()
    onClose()
  })

  const title = isEdit ? 'Chỉnh sửa' : 'Thêm mới'
  const labels: Record<CatalogTab, string> = {
    brands: 'Hãng xe',
    models: 'Dòng xe',
    colors: 'Màu xe',
    fuelTypes: 'Loại nhiên liệu',
    transmissions: 'Hộp số',
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${title} ${labels[tab]}`}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button variant="primary" onClick={handleSubmit} loading={form.formState.isSubmitting}>
            {isEdit ? 'Cập nhật' : 'Thêm'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Tên" {...form.register('name')} error={form.formState.errors.name?.message} required />
        {tab === 'brands' && (
          <Input label="Slug" {...form.register('slug')} error={form.formState.errors.slug?.message} required />
        )}
        {tab === 'models' && (
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Hãng xe</label>
            <select {...form.register('brandId')} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
              <option value="">-- Chọn --</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        )}
        {tab === 'colors' && (
          <Input label="Mã màu (hex)" {...form.register('hex')} placeholder="#000000" error={form.formState.errors.hex?.message} required />
        )}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Trạng thái</label>
          <select {...form.register('status')} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option value="active">Hoạt động</option>
            <option value="inactive">Ẩn</option>
          </select>
        </div>
      </form>
    </Modal>
  )
}
