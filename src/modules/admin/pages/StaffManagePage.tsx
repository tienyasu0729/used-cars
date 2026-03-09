import { useState, useCallback } from 'react'
import { Plus, Search } from 'lucide-react'
import { Button, Card, Input, Avatar, Badge, Modal, PaginationBar } from '@/components'
import { adminApi } from '@/api/adminApi'
import { useStaffTable } from '@/hooks/useStaffTable'
import { Loader2 } from 'lucide-react'
import { mockStaffList, type StaffManageItem } from '@/mock/mockStaff'

export function StaffManagePage() {
  const { setStaffList, searchQuery, setSearchQuery, pagination } = useStaffTable(mockStaffList)
  const { page, setPage, paginated, totalPages, pageNumbers, rangeText } = pagination

  const [showAddModal, setShowAddModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<StaffManageItem | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [addForm, setAddForm] = useState({ name: '', email: '', role: 'Staff' })
  const [addLoading, setAddLoading] = useState(false)

  const openDeleteModal = useCallback((staff: StaffManageItem) => {
    setSelectedStaff(staff)
    setShowDeleteModal(true)
  }, [])

  const openConfirmModal = useCallback((staff: StaffManageItem) => {
    setSelectedStaff(staff)
    setShowConfirmModal(true)
  }, [])

  const handleConfirm = async () => {
    if (!selectedStaff) return
    try {
      await adminApi.confirmStaff(selectedStaff.id)
      setStaffList((prev) =>
        prev.map((s) => (s.id === selectedStaff.id ? { ...s, status: 'active' } : s))
      )
      setShowConfirmModal(false)
      setSelectedStaff(null)
    } catch {
      setShowConfirmModal(false)
      setSelectedStaff(null)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!selectedStaff) return
    setDeleteLoading(true)
    try {
      await adminApi.deleteStaff(selectedStaff.id)
      setStaffList((prev) => prev.filter((s) => s.id !== selectedStaff.id))
      setShowDeleteModal(false)
      setSelectedStaff(null)
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddLoading(true)
    try {
      setStaffList((prev) => [...prev, { id: String(Date.now()), ...addForm, status: 'pending' }])
      setAddForm({ name: '', email: '', role: 'Staff' })
      setShowAddModal(false)
    } finally {
      setAddLoading(false)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#FF6600]">Staff Management</h1>
        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2 inline" />
          Add Staff
        </Button>
      </div>

      <Card className="p-4 mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search staff..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
      </Card>

      <Card className="overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#FF6600] text-white">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Name</th>
              <th className="text-left px-4 py-3 font-medium">Email</th>
              <th className="text-left px-4 py-3 font-medium">Role</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Actions</th>
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
              paginated.map((staff) => (
              <tr key={staff.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={staff.name} size="sm" />
                    <span className="font-medium">{staff.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{staff.email}</td>
                <td className="px-4 py-3">{staff.role}</td>
                <td className="px-4 py-3">
                  <Badge variant={staff.status === 'active' ? 'success' : 'warning'}>
                    {staff.status}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {staff.status === 'pending' && (
                      <Button variant="primary" size="sm" onClick={() => openConfirmModal(staff)}>
                        Confirm
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => openDeleteModal(staff)}>
                      Delete
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

      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Add Staff Account">
        <form className="space-y-4" onSubmit={handleAddSubmit}>
          <Input
            label="Full Name"
            placeholder="Enter full name"
            value={addForm.name}
            onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Input
            label="Email"
            type="email"
            placeholder="Enter email"
            value={addForm.email}
            onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))}
          />
          <Input
            label="Role"
            placeholder="Staff"
            value={addForm.role}
            onChange={(e) => setAddForm((f) => ({ ...f, role: e.target.value }))}
          />
          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} disabled={addLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={addLoading}>
              {addLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2 inline" /> : null}
              Add Staff
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={showConfirmModal} onClose={() => setShowConfirmModal(false)} title="Confirm Staff Account">
        <p className="text-gray-600 mb-4">
          Bạn có chắc muốn xác nhận tài khoản {selectedStaff?.name}?
        </p>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setShowConfirmModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirm}>
            Confirm
          </Button>
        </div>
      </Modal>

      <Modal open={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Confirmation">
        <p className="text-gray-600 mb-4">
          Bạn có chắc muốn xóa tài khoản {selectedStaff?.name}? Hành động này không thể hoàn tác.
        </p>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={deleteLoading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm} disabled={deleteLoading}>
            {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2 inline" /> : null}
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  )
}
