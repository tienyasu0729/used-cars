import { useState, useMemo } from 'react'
import { Search, Filter, Pencil, Eye, Trash2, LockOpen } from 'lucide-react'
import { useUsers } from '@/hooks/useUsers'
import { useBranchesAdmin } from '@/hooks/useBranchesAdmin'
import { useUpdateUser } from '@/hooks/useAdminMutations'
import { EditUserModal } from '@/features/admin/components/EditUserModal'
import { Button } from '@/components/ui'
import type { AdminUser } from '@/mock/mockAdminData'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const ROLE_LABELS: Record<string, string> = {
  Customer: 'KHÁCH HÀNG',
  SalesStaff: 'TƯ VẤN BÁN HÀNG',
  BranchManager: 'QUẢN LÝ',
  Admin: 'ADMIN',
}

const ROLE_CLASS: Record<string, string> = {
  Customer: 'bg-slate-200 text-slate-700',
  SalesStaff: 'bg-blue-100 text-blue-700',
  BranchManager: 'bg-purple-100 text-purple-700',
  Admin: 'bg-orange-100 text-orange-700',
}

export function AdminUsersPage() {
  const { data: users, isLoading } = useUsers()
  const { data: branches } = useBranchesAdmin()
  const updateUser = useUpdateUser()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [branchFilter, setBranchFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryTab, setCategoryTab] = useState('all')
  const [editUser, setEditUser] = useState<AdminUser | null>(null)
  const [page, setPage] = useState(1)

  const perPage = 4
  const branchOptions = branches ?? []

  const counts = useMemo(() => {
    const list = users ?? []
    return {
      all: list.length,
      customer: list.filter((u: AdminUser) => u.role === 'Customer').length,
      staff: list.filter((u: AdminUser) => ['SalesStaff', 'Admin'].includes(u.role)).length,
      manager: list.filter((u: AdminUser) => u.role === 'BranchManager').length,
    }
  }, [users])

  const filtered = useMemo(() => {
    let list = users ?? []
    if (categoryTab === 'customer') list = list.filter((u: AdminUser) => u.role === 'Customer')
    else if (categoryTab === 'staff') list = list.filter((u: AdminUser) => ['SalesStaff', 'Admin'].includes(u.role))
    else if (categoryTab === 'manager') list = list.filter((u: AdminUser) => u.role === 'BranchManager')
    if (search.trim()) {
      const q = search.toLowerCase().trim()
      list = list.filter((u: AdminUser) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
    }
    if (roleFilter) list = list.filter((u: AdminUser) => u.role === roleFilter)
    if (branchFilter) list = list.filter((u: AdminUser) => u.branchId === branchFilter)
    if (statusFilter) list = list.filter((u: AdminUser) => u.status === statusFilter)
    return list
  }, [users, categoryTab, search, roleFilter, branchFilter, statusFilter])

  const totalPages = Math.ceil(filtered.length / perPage) || 1
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  const handleSave = async (id: string, data: { name: string; email: string; phone: string; role: string; branchId?: string; status: 'active' | 'inactive' }) => {
    await updateUser.mutateAsync({
      id,
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role,
        branchId: data.branchId || undefined,
        branchName: data.branchId ? branchOptions.find((b: { id: string; name: string }) => b.id === data.branchId)?.name : undefined,
        status: data.status,
      },
    })
  }

  const handleToggleStatus = async (u: AdminUser) => {
    await updateUser.mutateAsync({ id: u.id, data: { status: u.status === 'active' ? 'inactive' : 'active' } })
  }

  const formatDate = (d: string) => {
    try {
      const [y, m, day] = d.split('-')
      return `${day}/${m}/${y}`
    } catch {
      return d
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Quản Lý Người Dùng</h2>
        <Button variant="primary">+ Tạo Tài Khoản</Button>
      </div>
      <div className="flex gap-2 border-b border-slate-200">
        {[
          { key: 'all', label: 'Tất Cả', count: counts.all },
          { key: 'customer', label: 'Khách Hàng', count: counts.customer },
          { key: 'staff', label: 'Nhân Viên', count: counts.staff },
          { key: 'manager', label: 'Quản Lý', count: counts.manager },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => { setCategoryTab(t.key); setPage(1) }}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              categoryTab === t.key ? 'border-[#1A3C6E] text-[#1A3C6E]' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[240px] flex-1">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-tight text-slate-500">Tìm kiếm</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                placeholder="Tìm theo tên hoặc email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-3 text-sm focus:border-[#1A3C6E] focus:ring-1 focus:ring-[#1A3C6E]"
              />
            </div>
          </div>
          <div className="w-40">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-tight text-slate-500">Vai trò</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
            >
              <option value="">Tất cả vai trò</option>
              <option value="Customer">Customer</option>
              <option value="SalesStaff">SalesStaff</option>
              <option value="BranchManager">BranchManager</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <div className="w-40">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-tight text-slate-500">Chi nhánh</label>
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
            >
              <option value="">Tất cả chi nhánh</option>
              {branchOptions.map((b: { id: string; name: string }) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div className="w-40">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-tight text-slate-500">Trạng thái</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Đã khóa</option>
            </select>
          </div>
          <Button variant="primary" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Lọc dữ liệu
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center text-slate-500">Đang tải...</div>
        ) : (
          <table className="w-full min-w-[800px] text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Người dùng</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Liên hệ</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Vai trò</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Chi nhánh</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Ngày tham gia</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Trạng thái</th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.map((u: AdminUser) => (
                <tr key={u.id} className="transition-colors hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1A3C6E]/20 text-sm font-bold text-[#1A3C6E]">
                        {u.name[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{u.name}</p>
                        <p className="text-xs text-slate-500">#{u.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-slate-600">{u.email}</p>
                    <p className="text-xs text-slate-500">{u.phone}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_CLASS[u.role] ?? 'bg-slate-200 text-slate-700'}`}>
                      {ROLE_LABELS[u.role] ?? u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{u.branchName ?? '-'}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${u.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                      <span className={`h-2 w-2 rounded-full ${u.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`} />
                      {u.status === 'active' ? 'Đang hoạt động' : 'Đã khóa'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button className="rounded p-1.5 text-slate-500 hover:bg-[#1A3C6E]/10 hover:text-[#1A3C6E]" title="Sửa" onClick={() => setEditUser(u)}>
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700" title="Xem">
                        <Eye className="h-4 w-4" />
                      </button>
                      {u.status === 'active' ? (
                        <button className="rounded p-1.5 text-slate-500 hover:bg-red-600/10 hover:text-red-600" title="Xóa">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      ) : (
                        <button onClick={() => handleToggleStatus(u)} className="rounded p-1.5 text-slate-500 hover:bg-emerald-500/10 hover:text-emerald-500" title="Mở khóa">
                          <LockOpen className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!isLoading && filtered.length === 0 && (
          <div className="py-12 text-center text-slate-500">Không tìm thấy người dùng</div>
        )}
      </div>
      {!isLoading && filtered.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Hiển thị {(page - 1) * perPage + 1} - {Math.min(page * perPage, filtered.length)} của {filtered.length} người dùng
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50">
              <ChevronLeft className="h-5 w-5" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)} className={`h-9 min-w-[36px] rounded-lg px-3 text-sm font-medium ${page === p ? 'bg-[#1A3C6E] text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
      <EditUserModal
        user={editUser}
        isOpen={!!editUser}
        onClose={() => setEditUser(null)}
        onSave={handleSave}
        onDeactivate={async (id) => { await updateUser.mutateAsync({ id, data: { status: 'inactive' } }) }}
        branches={branchOptions.map((b: { id: string; name: string }) => ({ id: b.id, name: b.name }))}
      />
    </div>
  )
}
