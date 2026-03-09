import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Button, Card, Badge, Modal, Input, PaginationBar } from '@/components'
import { adminApi } from '@/api/adminApi'
import { usePagination } from '@/hooks/usePagination'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { formatVnd } from '@/utils/formatters'
import type { SubscriptionPackage } from '@/api/adminApi'
import { Loader2 } from 'lucide-react'

const PAGE_SIZE = 5

export function SubscriptionPackagesPage() {
  const [showModal, setShowModal] = useState(false)
  const [editingPackage, setEditingPackage] = useState<SubscriptionPackage | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<SubscriptionPackage | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({ name: '', price: '', duration: '' })

  const queryClient = useQueryClient()
  const { data: packages = [] } = useQuery({
    queryKey: ['admin-subscription-packages'],
    queryFn: () => adminApi.getSubscriptionPackages(),
  })

  const { page, setPage, paginated, totalPages, pageNumbers, rangeText } = usePagination({
    items: packages,
    pageSize: PAGE_SIZE,
  })

  useEffect(() => {
    if (editingPackage) {
      setForm({
        name: editingPackage.name,
        price: editingPackage.price.toString(),
        duration: editingPackage.duration,
      })
    } else {
      setForm({ name: '', price: '', duration: '' })
    }
  }, [editingPackage])

  const openAdd = () => {
    setEditingPackage(null)
    setForm({ name: '', price: '', duration: '' })
    setShowModal(true)
  }

  const openEdit = (pkg: SubscriptionPackage) => {
    setEditingPackage(pkg)
    setShowModal(true)
  }

  const openDeleteModal = (pkg: SubscriptionPackage) => {
    setSelectedPackage(pkg)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedPackage) return
    setDeleteLoading(true)
    try {
      await adminApi.deleteSubscriptionPackage(selectedPackage.id)
      queryClient.invalidateQueries({ queryKey: ['admin-subscription-packages'] })
      setShowDeleteModal(false)
      setSelectedPackage(null)
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
      if (editingPackage) {
        await adminApi.updateSubscriptionPackage(editingPackage.id, {
          name: form.name,
          price: parseInt(form.price, 10) || 0,
          duration: form.duration,
        })
      } else {
        await adminApi.createSubscriptionPackage({
          name: form.name,
          price: parseInt(form.price, 10) || 0,
          duration: form.duration,
          status: 'active',
        })
      }
      queryClient.invalidateQueries({ queryKey: ['admin-subscription-packages'] })
      setShowModal(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#FF6600]">Gói dịch vụ</h1>
        <Button variant="primary" onClick={openAdd}>
          <Plus className="w-4 h-4 mr-2 inline" />
          Thêm gói
        </Button>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#FF6600] text-white">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Tên gói</th>
              <th className="text-left px-4 py-3 font-medium">Giá</th>
              <th className="text-left px-4 py-3 font-medium">Thời hạn</th>
              <th className="text-left px-4 py-3 font-medium">Trạng thái</th>
              <th className="text-left px-4 py-3 font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                  Không tìm thấy dữ liệu phù hợp
                </td>
              </tr>
            ) : (
              paginated.map((pkg) => (
              <tr key={pkg.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{pkg.name}</td>
                <td className="px-4 py-3">{formatVnd(pkg.price)}</td>
                <td className="px-4 py-3 text-gray-600">{pkg.duration}</td>
                <td className="px-4 py-3">
                  <Badge variant={pkg.status === 'active' ? 'success' : 'error'}>
                    {pkg.status === 'active' ? 'Hoạt động' : 'Tắt'}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(pkg)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => openDeleteModal(pkg)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      <PaginationBar
        rangeText={rangeText}
        page={page}
        totalPages={totalPages}
        pageNumbers={pageNumbers}
        onPageChange={setPage}
        align="right"
      />

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingPackage ? 'Sửa gói' : 'Thêm gói'}
      >
        <form className="space-y-4" onSubmit={handleFormSubmit}>
          <Input
            label="Tên gói"
            placeholder="VD: Featured Listing"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Input
            label="Giá (VND)"
            type="number"
            placeholder="500000"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
          />
          <Input
            label="Thời hạn"
            placeholder="VD: 30 ngày"
            value={form.duration}
            onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
          />
          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => setShowModal(false)} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2 inline" /> : null}
              Lưu
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Xóa gói">
        <p className="text-gray-600 mb-4">
          Bạn có chắc muốn xóa gói {selectedPackage?.name}?
        </p>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={deleteLoading}>
            Hủy
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm} disabled={deleteLoading}>
            {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2 inline" /> : null}
            Xóa
          </Button>
        </div>
      </Modal>
    </div>
  )
}
