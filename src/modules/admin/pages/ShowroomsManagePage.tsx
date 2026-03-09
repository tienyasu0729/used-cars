import { useState, useRef, useMemo } from 'react'
import { Search, Plus, Filter, Star, MoreVertical } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { Button, Card, Avatar, Badge, Modal, Input, PaginationBar } from '@/components'
import { adminApi } from '@/api/adminApi'
import { usePagination } from '@/hooks/usePagination'
import { useQuery, useMutation } from '@tanstack/react-query'
import type { ShowroomManage } from '@/api/adminApi'

const statusTabs = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'active', label: 'Active' },
  { key: 'blocked', label: 'Blocked' },
] as const

const PAGE_SIZE = 10

export function ShowroomsManagePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<(typeof statusTabs)[number]['key']>('all')
  const [statusFilter, setStatusFilter] = useState('')
  const [trustScoreFilter, setTrustScoreFilter] = useState('')
  const [dateRange, setDateRange] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [showBulkConfirmModal, setShowBulkConfirmModal] = useState(false)
  const [bulkActionType, setBulkActionType] = useState<'approve' | 'block' | null>(null)
  const [selectedShowroom, setSelectedShowroom] = useState<ShowroomManage | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [addForm, setAddForm] = useState({
    name: '',
    contact: '',
    email: '',
    location: '',
    address: '',
  })
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)

  const queryClient = useQueryClient()
  const createShowroomMutation = useMutation({
    mutationFn: (data: { name: string; contact: string; email: string; location: string; address: string }) =>
      adminApi.createShowroom(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-showrooms'] })
      closeAddModal()
    },
  })
  const { data: showrooms = [] } = useQuery({
    queryKey: ['admin-showrooms'],
    queryFn: () => adminApi.getShowrooms(),
  })

  const openApproveModal = (sr: ShowroomManage) => {
    setSelectedShowroom(sr)
    setShowApproveModal(true)
  }

  const openBlockModal = (sr: ShowroomManage) => {
    setSelectedShowroom(sr)
    setShowBlockModal(true)
  }

  const handleApproveConfirm = async () => {
    if (!selectedShowroom) return
    setActionLoading(true)
    try {
      await adminApi.approveShowroom(selectedShowroom.id)
      queryClient.invalidateQueries({ queryKey: ['admin-showrooms'] })
      setShowApproveModal(false)
      setSelectedShowroom(null)
    } finally {
      setActionLoading(false)
    }
  }

  const handleBlockConfirm = async () => {
    if (!selectedShowroom) return
    setActionLoading(true)
    try {
      await adminApi.blockShowroom(selectedShowroom.id)
      queryClient.invalidateQueries({ queryKey: ['admin-showrooms'] })
      setShowBlockModal(false)
      setSelectedShowroom(null)
      setSelectedIds(new Set())
    } finally {
      setActionLoading(false)
    }
  }

  const openBulkConfirmModal = (type: 'approve' | 'block') => {
    setBulkActionType(type)
    setShowBulkConfirmModal(true)
  }

  const handleBulkApprove = async () => {
    setActionLoading(true)
    try {
      for (const id of selectedIds) await adminApi.approveShowroom(id)
      queryClient.invalidateQueries({ queryKey: ['admin-showrooms'] })
      setSelectedIds(new Set())
      setShowBulkConfirmModal(false)
      setBulkActionType(null)
    } finally {
      setActionLoading(false)
    }
  }

  const handleBulkBlock = async () => {
    setActionLoading(true)
    try {
      for (const id of selectedIds) await adminApi.blockShowroom(id)
      queryClient.invalidateQueries({ queryKey: ['admin-showrooms'] })
      setSelectedIds(new Set())
      setShowBulkConfirmModal(false)
      setBulkActionType(null)
    } finally {
      setActionLoading(false)
    }
  }

  const confirmBulkAction = () => {
    if (bulkActionType === 'approve') handleBulkApprove()
    else if (bulkActionType === 'block') handleBulkBlock()
  }

  const filtered = useMemo(
    () =>
      showrooms.filter((s) => {
        const matchSearch =
          !searchQuery ||
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.location.toLowerCase().includes(searchQuery.toLowerCase())
        const matchTab =
          activeTab === 'all' ||
          (activeTab === 'active' && s.status === 'active') ||
          (activeTab === 'pending' && s.status === 'pending') ||
          (activeTab === 'blocked' && s.status === 'blocked')
        const matchStatus = !statusFilter || s.status === statusFilter
        return matchSearch && matchTab && matchStatus
      }),
    [showrooms, searchQuery, activeTab, statusFilter]
  )

  const { page, setPage, paginated, totalPages, pageNumbers, rangeText } = usePagination({
    items: filtered,
    pageSize: PAGE_SIZE,
  })

  const tabCounts = {
    all: showrooms.length,
    pending: showrooms.filter((s) => s.status === 'pending').length,
    active: showrooms.filter((s) => s.status === 'active').length,
    blocked: showrooms.filter((s) => s.status === 'blocked').length,
  }

  const activeFilterCount = [statusFilter, trustScoreFilter, dateRange].filter(Boolean).length

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === paginated.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(paginated.map((s) => s.id)))
  }

  const statusVariant = (s: string) => (s === 'active' ? 'success' : s === 'pending' ? 'warning' : 'error')
  const statusLabel = (s: string) => (s === 'active' ? 'Active' : s === 'pending' ? 'Pending' : 'Blocked')

  const closeAddModal = () => {
    setShowAddModal(false)
    setAddForm({ name: '', contact: '', email: '', location: '', address: '' })
    setLogoPreview(null)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#FF6600]">Showroom Management</h1>
        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2 inline" />
          Add Showroom
        </Button>
      </div>

      <div className="flex gap-6 border-b border-gray-200 mb-4">
        {statusTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`pb-3 font-medium text-sm ${
              activeTab === tab.key ? 'text-[#FF6600] border-b-2 border-[#FF6600]' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label} ({tabCounts[tab.key]})
          </button>
        ))}
      </div>

      <Card className="p-4 mb-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative inline-block">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2 inline" />
              Filters
            </Button>
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF6600] text-white text-xs rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="blocked">Blocked</option>
          </select>
          <select
            value={trustScoreFilter}
            onChange={(e) => setTrustScoreFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">Trust Score</option>
            <option value="4">4+</option>
            <option value="3">3+</option>
          </select>
          <input
            type="text"
            placeholder="Nov 1, 2023 - Nov 30, 2023"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-48"
          />
          <div className="relative flex-1 min-w-[200px] flex justify-end">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-xs pl-4 pr-10 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>
      </Card>

      {selectedIds.size > 0 && (
        <Card className="p-4 mb-4 bg-orange-50 border-orange-200">
          <div className="flex items-center justify-between">
            <span className="font-medium">{selectedIds.size} showroom được chọn</span>
            <div className="flex gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => openBulkConfirmModal('approve')}
                disabled={actionLoading}
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2 inline" /> : null}
                Duyệt đã chọn
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => openBulkConfirmModal('block')}
                disabled={actionLoading}
              >
                Khóa đã chọn
              </Button>
            </div>
          </div>
        </Card>
      )}

      <Card className="overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#FF6600] text-white">
            <tr>
              <th className="w-10 px-4 py-3">
                <input type="checkbox" checked={selectedIds.size === paginated.length && paginated.length > 0} onChange={toggleSelectAll} />
              </th>
              <th className="text-left px-4 py-3 font-medium">Logo</th>
              <th className="text-left px-4 py-3 font-medium">Showroom Name</th>
              <th className="text-left px-4 py-3 font-medium">Contact</th>
              <th className="text-left px-4 py-3 font-medium">Location</th>
              <th className="text-left px-4 py-3 font-medium">Total Cars</th>
              <th className="text-left px-4 py-3 font-medium">Trust Score</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                  Không tìm thấy dữ liệu phù hợp
                </td>
              </tr>
            ) : (
              paginated.map((sr) => (
              <tr key={sr.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <input type="checkbox" checked={selectedIds.has(sr.id)} onChange={() => toggleSelect(sr.id)} />
                </td>
                <td className="px-4 py-3">
                  <Avatar name={sr.name} size="sm" src={sr.logo} />
                </td>
                <td className="px-4 py-3 font-medium">{sr.name}</td>
                <td className="px-4 py-3 text-gray-600">{sr.contact}</td>
                <td className="px-4 py-3 text-gray-600">{sr.location}</td>
                <td className="px-4 py-3">{sr.totalCars}</td>
                <td className="px-4 py-3">
                  {sr.trustScore > 0 ? (
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      {sr.trustScore}
                    </span>
                  ) : (
                    '-'
                  )}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={statusVariant(sr.status)}>{statusLabel(sr.status)}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setOpenMenuId(openMenuId === sr.id ? null : sr.id)}
                      className="p-1 text-gray-500 hover:text-gray-700"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {openMenuId === sr.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} aria-hidden />
                        <div className="absolute right-0 top-full mt-1 z-20 bg-white border rounded-lg shadow-lg py-1 min-w-[160px]">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedShowroom(sr)
                              setShowDetailModal(true)
                              setOpenMenuId(null)
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                          >
                            View Details
                          </button>
                          {sr.status === 'pending' && (
                            <button
                              type="button"
                              onClick={() => openApproveModal(sr)}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                            >
                              Approve
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => openBlockModal(sr)}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 text-red-600"
                          >
                            Block Permanently
                          </button>
                        </div>
                      </>
                    )}
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
        align="between"
      />

      <Modal open={showAddModal} onClose={closeAddModal} title="Add Showroom" size="lg">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            createShowroomMutation.mutate(addForm)
          }}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
            <div className="flex items-center gap-4">
              {logoPreview && (
                <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-200">
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                </div>
              )}
              <div>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) setLogoPreview(URL.createObjectURL(file))
                  }}
                />
                <Button type="button" variant="outline" size="sm" onClick={() => logoInputRef.current?.click()}>
                  Chọn ảnh
                </Button>
              </div>
            </div>
          </div>
          <Input
            label="Tên showroom"
            placeholder="VD: CarHub Motors"
            value={addForm.name}
            onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Số điện thoại"
              placeholder="+84 912 345 678"
              value={addForm.contact}
              onChange={(e) => setAddForm((f) => ({ ...f, contact: e.target.value }))}
            />
            <Input
              label="Email"
              type="email"
              placeholder="contact@showroom.vn"
              value={addForm.email}
              onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))}
            />
          </div>
          <Input
            label="Tỉnh/Thành phố"
            placeholder="VD: Hà Nội"
            value={addForm.location}
            onChange={(e) => setAddForm((f) => ({ ...f, location: e.target.value }))}
          />
          <Input
            label="Địa chỉ chi tiết"
            placeholder="Số nhà, đường, quận..."
            value={addForm.address}
            onChange={(e) => setAddForm((f) => ({ ...f, address: e.target.value }))}
          />
          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={closeAddModal} disabled={createShowroomMutation.isPending}>
              Hủy
            </Button>
            <Button type="submit" variant="primary" disabled={createShowroomMutation.isPending}>
              {createShowroomMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2 inline" /> : null}
              Thêm Showroom
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={showApproveModal} onClose={() => setShowApproveModal(false)} title="Xác nhận duyệt showroom">
        <p className="text-gray-600 mb-4">
          Bạn có chắc chắn muốn duyệt showroom {selectedShowroom?.name}?
        </p>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setShowApproveModal(false)} disabled={actionLoading}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleApproveConfirm} disabled={actionLoading}>
            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2 inline" /> : null}
            Xác nhận
          </Button>
        </div>
      </Modal>

      <Modal open={showBlockModal} onClose={() => setShowBlockModal(false)} title="Xác nhận khóa showroom">
        <p className="text-gray-600 mb-4">
          Bạn có chắc chắn muốn khóa showroom {selectedShowroom?.name} vĩnh viễn?
        </p>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setShowBlockModal(false)} disabled={actionLoading}>
            Hủy
          </Button>
          <Button variant="danger" onClick={handleBlockConfirm} disabled={actionLoading}>
            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2 inline" /> : null}
            Xác nhận khóa
          </Button>
        </div>
      </Modal>

      <Modal open={showBulkConfirmModal} onClose={() => { setShowBulkConfirmModal(false); setBulkActionType(null) }} title="Xác nhận thao tác hàng loạt">
        <p className="text-gray-600 mb-4">
          Bạn có chắc chắn muốn thực hiện thao tác này cho {selectedIds.size} showroom đã chọn?
        </p>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => { setShowBulkConfirmModal(false); setBulkActionType(null) }} disabled={actionLoading}>
            Hủy
          </Button>
          <Button
            variant={bulkActionType === 'block' ? 'danger' : 'primary'}
            onClick={confirmBulkAction}
            disabled={actionLoading}
          >
            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2 inline" /> : null}
            Xác nhận
          </Button>
        </div>
      </Modal>

      <Modal open={showDetailModal} onClose={() => setShowDetailModal(false)} title="Chi tiết & Xem tài liệu pháp lý">
        {selectedShowroom && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Showroom: {selectedShowroom.name}</p>
            <p className="text-sm text-gray-600">Contact: {selectedShowroom.contact}</p>
            <p className="text-sm text-gray-600">Location: {selectedShowroom.location}</p>
            <p className="text-sm text-gray-600">Total Cars: {selectedShowroom.totalCars}</p>
            <p className="text-sm text-gray-500 italic">Tài liệu pháp lý sẽ hiển thị tại đây khi có API.</p>
            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => setShowDetailModal(false)}>
                Đóng
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
