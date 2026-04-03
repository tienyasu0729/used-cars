import { useState, useMemo, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ChevronRight,
  Search,
  LayoutGrid,
  List,
  Filter,
  MapPin,
  Phone,
  MoreVertical,
  BarChart3,
  Settings,
  ChevronDown,
} from 'lucide-react'
import { useBranchesAdmin } from '@/hooks/useBranchesAdmin'
import { useUpdateBranch, useDeleteBranch } from '@/hooks/useAdminMutations'
import { EditBranchModal } from '@/features/admin/components/EditBranchModal'
import { Button, Modal } from '@/components/ui'
import type { AdminBranch } from '@/types/admin.types'
import { useToastStore } from '@/store/toastStore'

function apiErr(e: unknown, fallback: string) {
  const ax = e as { response?: { data?: { message?: string } } }
  return ax.response?.data?.message || fallback
}

export function AdminBranchesPage() {
  const toast = useToastStore()
  const { data: branches, isLoading } = useBranchesAdmin()
  const updateBranch = useUpdateBranch()
  const deleteBranch = useDeleteBranch()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false)
  const [visibleCount, setVisibleCount] = useState(4)
  const statusDropdownRef = useRef<HTMLDivElement>(null)
  const [editBranch, setEditBranch] = useState<AdminBranch | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<AdminBranch | null>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target as Node)) {
        setStatusDropdownOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const filtered = useMemo(() => {
    let list = branches ?? []
    if (search.trim()) {
      const q = search.toLowerCase().trim()
      list = list.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.address.toLowerCase().includes(q) ||
          (b.managerName || '').toLowerCase().includes(q)
      )
    }
    if (statusFilter === 'active') list = list.filter((b) => b.status === 'active')
    else if (statusFilter === 'inactive') list = list.filter((b) => b.status === 'inactive')
    return list
  }, [branches, search, statusFilter])

  const displayed = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  const handleSaveBranch = async (
    id: string,
    data: { name: string; address: string; phone: string; status: 'active' | 'inactive' }
  ) => {
    try {
      await updateBranch.mutateAsync({
        id,
        body: {
          name: data.name,
          address: data.address,
          phone: data.phone.trim() === '' ? null : data.phone.trim(),
          status: data.status,
        },
      })
      toast.addToast('success', 'Đã cập nhật chi nhánh.')
    } catch (e) {
      toast.addToast('error', apiErr(e, 'Không lưu được.'))
      throw e
    }
  }

  const handleDeleteBranch = async () => {
    if (!confirmDelete) return
    try {
      await deleteBranch.mutateAsync(confirmDelete.id)
      toast.addToast('success', 'Đã xóa chi nhánh (soft delete).')
      setConfirmDelete(null)
    } catch (e) {
      toast.addToast('error', apiErr(e, 'Không xóa được.'))
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link to="/admin/dashboard" className="hover:text-[#1A3C6E]">Admin</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-slate-700">Chi nhánh</span>
      </div>
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Quản Lý Chi Nhánh</h2>
          <p className="mt-1 text-slate-500">Quản lý và theo dõi tất cả chi nhánh tại Đà Nẵng</p>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${viewMode === 'grid' ? 'bg-[#1A3C6E] text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
            >
              <LayoutGrid className="h-4 w-4" />
              Lưới
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${viewMode === 'list' ? 'bg-[#1A3C6E] text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
            >
              <List className="h-4 w-4" />
              Danh sách
            </button>
            <div className="relative" ref={statusDropdownRef}>
              <button
                type="button"
                onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                {statusFilter === 'all' ? 'Tất cả trạng thái' : statusFilter === 'active' ? 'Hoạt động' : 'Tạm đóng'}
                <ChevronDown className="h-4 w-4" />
              </button>
              {statusDropdownOpen && (
                <div className="absolute left-0 top-full z-10 mt-1 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                  <button type="button" onClick={() => { setStatusFilter('all'); setStatusDropdownOpen(false) }} className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50">Tất cả trạng thái</button>
                  <button type="button" onClick={() => { setStatusFilter('active'); setStatusDropdownOpen(false) }} className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50">Hoạt động</button>
                  <button type="button" onClick={() => { setStatusFilter('inactive'); setStatusDropdownOpen(false) }} className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50">Tạm đóng</button>
                </div>
              )}
            </div>
            <button type="button" className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50">
              <Filter className="h-4 w-4" />
            </button>
          </div>
          <Link to="/admin/branches/new">
            <Button variant="primary">+ Thêm Chi Nhánh</Button>
          </Link>
        </div>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Tìm chi nhánh, địa điểm hoặc quản lý..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-4 text-sm focus:border-[#1A3C6E] focus:ring-1 focus:ring-[#1A3C6E]"
        />
      </div>
      {isLoading ? (
        <div className="flex h-48 items-center justify-center text-slate-500">Đang tải...</div>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {displayed.map((b) => (
            <div key={b.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="relative h-40 bg-slate-200">
                {b.imageUrl ? (
                  <img src={b.imageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center bg-slate-100 text-slate-400">
                    <span className="text-sm">Không có ảnh</span>
                  </div>
                )}
                <span className={`absolute left-3 top-3 rounded-full px-2 py-1 text-xs font-bold ${b.status === 'active' ? 'bg-green-500 text-white' : 'bg-slate-400 text-white'}`}>
                  {b.status === 'active' ? 'ACTIVE' : 'CLOSED'}
                </span>
                <button type="button" className="absolute right-3 top-3 rounded-lg bg-white/90 p-1.5 text-slate-600 hover:bg-white">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-slate-900">{b.name}</h3>
                <p className="mt-1 text-xs text-slate-500">Quản lý: {b.managerName || '—'}</p>
                <div className="mt-2 flex items-start gap-2 text-sm text-slate-600">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{b.address}</span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                  <Phone className="h-4 w-4 shrink-0" />
                  <span>{b.phone || '—'}</span>
                </div>
                <div className="mt-4 flex gap-4 text-xs">
                  <div>
                    <span className="font-semibold uppercase text-slate-500">Xe</span>
                    <p className="font-bold text-slate-900">{b.vehicleCount}</p>
                  </div>
                  <div>
                    <span className="font-semibold uppercase text-slate-500">Nhân viên</span>
                    <p className="font-bold text-slate-900">{b.staffCount}</p>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="primary" size="sm" className="flex-1" type="button" onClick={() => setEditBranch(b)}>
                    Sửa chi nhánh
                  </Button>
                  <Button variant="outline" size="sm" type="button" onClick={() => setConfirmDelete(b)}>
                    Xóa
                  </Button>
                  <button type="button" className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50">
                    {b.status === 'active' ? <BarChart3 className="h-4 w-4" /> : <Settings className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Chi nhánh</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Quản lý</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Địa chỉ</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Trạng thái</th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayed.map((b) => (
                <tr key={b.id} className="transition-colors hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-16 overflow-hidden rounded-lg bg-slate-200">
                        {b.imageUrl && <img src={b.imageUrl} alt="" className="h-full w-full object-cover" />}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{b.name}</p>
                        <p className="text-xs text-slate-500">{b.vehicleCount} xe · {b.staffCount} NV</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{b.managerName || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{b.address}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${b.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                      {b.status === 'active' ? 'Hoạt động' : 'Tạm đóng'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="primary" size="sm" type="button" onClick={() => setEditBranch(b)}>Sửa</Button>
                      <Button variant="outline" size="sm" type="button" onClick={() => setConfirmDelete(b)}>Xóa</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!isLoading && filtered.length === 0 && (
        <div className="py-12 text-center text-slate-500">Không có chi nhánh nào</div>
      )}
      {hasMore && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((c) => c + 4)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-6 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Tải thêm chi nhánh
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      )}
      <div className="fixed bottom-8 right-8">
        <button type="button" className="flex items-center gap-2 rounded-lg bg-[#1A3C6E] px-4 py-3 text-sm font-medium text-white shadow-lg hover:bg-blue-800">
          <MapPin className="h-4 w-4" />
          Hiển thị trên bản đồ
        </button>
      </div>
      <EditBranchModal
        branch={editBranch}
        isOpen={!!editBranch}
        onClose={() => setEditBranch(null)}
        onSave={handleSaveBranch}
      />
      <Modal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Xóa chi nhánh?"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>Hủy</Button>
            <Button variant="danger" onClick={handleDeleteBranch}>Xóa</Button>
          </div>
        }
      >
        <p className="text-sm text-slate-600">
          Chi nhánh <strong>{confirmDelete?.name}</strong> sẽ bị đánh dấu xóa mềm. Tiếp tục?
        </p>
      </Modal>
    </div>
  )
}
