import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, Button, Modal, Input } from '@/components'
import { staffApi } from '@/api/staffApi'
import { Plus, Pencil, Trash2 } from 'lucide-react'

export function BannersPage() {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ title: '', link: '' })

  const { data: banners = [] } = useQuery({
    queryKey: ['staff-banners'],
    queryFn: () => staffApi.getBanners(),
  })

  const handleEdit = (b: { id: string; title: string; link?: string }) => {
    setEditingId(b.id)
    setForm({ title: b.title, link: b.link ?? '' })
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#FF6600] mb-6">Quản lý Banner</h1>

      <div className="mb-6">
        <Button variant="primary">
          <Plus className="w-4 h-4 mr-2" />
          Thêm banner
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((b) => (
          <Card key={b.id} className="overflow-hidden">
            <div className="aspect-[3/1] bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-sm">Banner image</span>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900">{b.title}</h3>
              <p className="text-sm text-gray-500 truncate">{b.link || '—'}</p>
              <div className="flex gap-2 mt-3">
                <Button variant="outline" size="sm" onClick={() => handleEdit(b)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={!!editingId} onClose={() => setEditingId(null)} title="Chỉnh sửa banner" size="lg">
        <div className="space-y-4">
          <Input label="Tiêu đề" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          <Input label="Link đích" value={form.link} onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))} />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setEditingId(null)}>Hủy</Button>
            <Button variant="primary">Cập nhật</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
