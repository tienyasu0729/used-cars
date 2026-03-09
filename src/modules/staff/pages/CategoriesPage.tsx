import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, Button, Modal, Input } from '@/components'
import { staffApi } from '@/api/staffApi'
import type { CategoryNode } from '@/api/staffApi'
import { Plus, ChevronRight, ChevronDown, Pencil, Trash2 } from 'lucide-react'

function CategoryTree({ node, level = 0 }: { node: CategoryNode; level?: number }) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = node.children && node.children.length > 0

  return (
    <div>
      <div
        className="flex items-center gap-2 py-2 hover:bg-gray-50 rounded px-2 -mx-2"
        style={{ paddingLeft: `${level * 20}px` }}
      >
        {hasChildren ? (
          <button type="button" onClick={() => setExpanded((e) => !e)} className="p-0.5">
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        ) : (
          <span className="w-5" />
        )}
        <span className="flex-1 font-medium">{node.name}</span>
        <span className="text-xs text-gray-400">{node.type}</span>
        <Button variant="ghost" size="sm">
          <Pencil className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <Trash2 className="w-4 h-4 text-red-500" />
        </Button>
      </div>
      {expanded && hasChildren && node.children!.map((child) => (
        <CategoryTree key={child.id} node={child} level={level + 1} />
      ))}
    </div>
  )
}

export function CategoriesPage() {
  const [showAddModal, setShowAddModal] = useState(false)
  const [addForm, setAddForm] = useState({ name: '', type: 'model' as 'brand' | 'model' | 'vehicleType' })

  const { data: categories = [] } = useQuery({
    queryKey: ['staff-categories'],
    queryFn: () => staffApi.getCategories(),
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#FF6600] mb-6">Quản lý Danh mục Xe</h1>

      <div className="mb-6">
        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm danh mục
        </Button>
      </div>

      <Card className="p-6">
        {categories.map((node) => (
          <CategoryTree key={node.id} node={node} />
        ))}
      </Card>

      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Thêm danh mục" size="md">
        <div className="space-y-4">
          <Input label="Tên" value={addForm.name} onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Loại</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              value={addForm.type}
              onChange={(e) => setAddForm((f) => ({ ...f, type: e.target.value as typeof addForm.type }))}
            >
              <option value="brand">Brand</option>
              <option value="model">Model</option>
              <option value="vehicleType">Vehicle Type</option>
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>Hủy</Button>
            <Button variant="primary">Thêm</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
