import { useState, useCallback } from 'react'
import { Search, Upload, Eye, Ban } from 'lucide-react'
import { Button, Card, Avatar, Badge, Modal, PaginationBar } from '@/components'
import { adminApi } from '@/api/adminApi'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { usePagination } from '@/hooks/usePagination'
import { useCustomersFilter } from '@/hooks/useCustomersFilter'
import type { CustomerManage } from '@/api/adminApi'
import { Loader2 } from 'lucide-react'

const PAGE_SIZE = 9
const STATUS_TABS = [
  { key: 'all', label: 'Tất Cả' },
  { key: 'active', label: 'Hoạt Động' },
  { key: 'blocked', label: 'Bị Khóa' },
] as const

export function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'blocked'>('all')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showBanModal, setShowBanModal] = useState(false)
  const [showBulkBanModal, setShowBulkBanModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerManage | null>(null)
  const [banReason, setBanReason] = useState('')
  const [banLoading, setBanLoading] = useState(false)
  const [bulkBanLoading, setBulkBanLoading] = useState(false)

  const queryClient = useQueryClient()
  const { data: customers = [] } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: () => adminApi.getCustomers(),
  })

  const { filtered, tabCounts } = useCustomersFilter(customers, searchQuery, activeTab, statusFilter)

  const { page, setPage, paginated, totalPages, pageNumbers, rangeText } = usePagination({
    items: filtered,
    pageSize: PAGE_SIZE,
  })

  const openBanModal = (c: CustomerManage) => {
    setSelectedCustomer(c)
    setBanReason('')
    setShowBanModal(true)
  }

  const openDetailModal = (c: CustomerManage) => {
    setSelectedCustomer(c)
    setShowDetailModal(true)
  }

  const handleBanConfirm = async () => {
    if (!selectedCustomer) return
    setBanLoading(true)
    try {
      await adminApi.banCustomer(selectedCustomer.id, banReason)
      queryClient.invalidateQueries({ queryKey: ['admin-customers'] })
      setShowBanModal(false)
      setSelectedCustomer(null)
    } finally {
      setBanLoading(false)
    }
  }

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (prev.size === paginated.length) return new Set<string>()
      return new Set(paginated.map((c) => c.id))
    })
  }, [paginated])

  const handleBulkBanConfirm = async () => {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return
    setBulkBanLoading(true)
    try {
      await adminApi.bulkBanCustomers(ids)
      queryClient.invalidateQueries({ queryKey: ['admin-customers'] })
      setSelectedIds(new Set())
      setShowBulkBanModal(false)
    } finally {
      setBulkBanLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#FF6600] mb-6">Quản lý khách hàng</h1>

      <Card className="p-4 mb-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm khách hàng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">Lọc theo Trạng Thái</option>
            <option value="active">Hoạt động</option>
            <option value="blocked">Bị khóa</option>
          </select>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">Lọc theo Ngày</option>
            <option value="7">7 ngày qua</option>
            <option value="30">30 ngày qua</option>
          </select>
          <Button variant="primary">
            <Upload className="w-4 h-4 mr-2 inline" />
            Xuất Dữ Liệu
          </Button>
        </div>
      </Card>

      {selectedIds.size > 0 && (
        <Card className="p-4 mb-4 bg-orange-50 border-orange-200">
          <div className="flex items-center justify-between">
            <span className="font-medium">{selectedIds.size} khách hàng được chọn</span>
            <div className="flex gap-2">
              <Button
                variant="danger"
                size="sm"
                onClick={() => setShowBulkBanModal(true)}
                disabled={bulkBanLoading}
              >
                {bulkBanLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2 inline" /> : null}
                Khóa đã chọn
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="flex gap-6 border-b border-gray-200 mb-4">
        {STATUS_TABS.map((tab) => (
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

      <Card className="overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#FF6600] text-white">
            <tr>
              <th className="w-10 px-4 py-3">
                <input type="checkbox" checked={selectedIds.size === paginated.length && paginated.length > 0} onChange={toggleSelectAll} />
              </th>
              <th className="text-left px-4 py-3 font-medium">Avatar</th>
              <th className="text-left px-4 py-3 font-medium">Họ Tên</th>
              <th className="text-left px-4 py-3 font-medium">Email</th>
              <th className="text-left px-4 py-3 font-medium">Số Điện Thoại</th>
              <th className="text-left px-4 py-3 font-medium">Ngày Đăng Ký</th>
              <th className="text-left px-4 py-3 font-medium">Số Giao Dịch</th>
              <th className="text-left px-4 py-3 font-medium">Trạng Thái</th>
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
              paginated.map((c) => (
                <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selectedIds.has(c.id)} onChange={() => toggleSelect(c.id)} />
                  </td>
                  <td className="px-4 py-3">
                    <Avatar name={c.name} size="sm" />
                  </td>
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-gray-600">{c.email}</td>
                  <td className="px-4 py-3 text-gray-600">{c.phone}</td>
                  <td className="px-4 py-3 text-gray-600">{c.registeredAt}</td>
                  <td className="px-4 py-3">{c.transactionCount}</td>
                  <td className="px-4 py-3">
                    <Badge variant={c.status === 'active' ? 'success' : 'error'}>
                      {c.status === 'active' ? 'Hoạt Động' : 'Bị Khóa'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openDetailModal(c)}
                        className="p-1 text-gray-500 hover:text-gray-700"
                        aria-label="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {c.status === 'active' && (
                        <button
                          type="button"
                          onClick={() => openBanModal(c)}
                          className="p-1 text-gray-500 hover:text-red-600"
                          aria-label="Khóa"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
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
        align="right"
      />

      <Modal open={showBulkBanModal} onClose={() => setShowBulkBanModal(false)} title="Khóa hàng loạt">
        <p className="text-gray-600 mb-4">
          Bạn có chắc chắn muốn khóa {selectedIds.size} khách hàng đã chọn?
        </p>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setShowBulkBanModal(false)} disabled={bulkBanLoading}>
            Hủy
          </Button>
          <Button variant="danger" onClick={handleBulkBanConfirm} disabled={bulkBanLoading}>
            {bulkBanLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2 inline" /> : null}
            Xác nhận
          </Button>
        </div>
      </Modal>

      <Modal open={showBanModal} onClose={() => setShowBanModal(false)} title="Khóa tài khoản khách hàng">
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">Lý do khóa</label>
          <textarea
            value={banReason}
            onChange={(e) => setBanReason(e.target.value)}
            placeholder="Nhập lý do khóa tài khoản..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] outline-none"
          />
          <div className="flex gap-2 justify-end pt-4">
            <Button variant="outline" onClick={() => setShowBanModal(false)} disabled={banLoading}>
              Hủy
            </Button>
            <Button variant="danger" onClick={handleBanConfirm} disabled={banLoading || !banReason.trim()}>
              {banLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2 inline" /> : null}
              Xác nhận khóa
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={showDetailModal} onClose={() => setShowDetailModal(false)} title="Chi tiết khách hàng">
        {selectedCustomer && (
          <div className="space-y-3">
            <p className="text-sm"><span className="font-medium">Họ tên:</span> {selectedCustomer.name}</p>
            <p className="text-sm"><span className="font-medium">Email:</span> {selectedCustomer.email}</p>
            <p className="text-sm"><span className="font-medium">Số điện thoại:</span> {selectedCustomer.phone}</p>
            <p className="text-sm"><span className="font-medium">Tổng giao dịch:</span> {selectedCustomer.transactionCount}</p>
            <p className="text-sm"><span className="font-medium">Ngày đăng ký:</span> {selectedCustomer.registeredAt}</p>
            <p className="text-sm text-gray-500 italic">Lịch sử mua và lịch hẹn sẽ hiển thị khi có API.</p>
            <div className="flex justify-end pt-4">
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
