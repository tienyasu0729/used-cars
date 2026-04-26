import { useState, useMemo, useEffect, useRef } from 'react'

function AdminUserAvatar({ name, avatarUrl }: { name: string; avatarUrl?: string | null }) {
  const [imgFailed, setImgFailed] = useState(false)
  useEffect(() => {
    setImgFailed(false)
  }, [avatarUrl])
  const showImg = Boolean(avatarUrl?.trim()) && !imgFailed
  const initial = (name?.trim()?.[0] ?? '?').toUpperCase()
  return (
    <div
      className={`relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-bold ${
        showImg ? 'bg-slate-200' : 'bg-[#1A3C6E]/20 text-[#1A3C6E]'
      }`}
    >
      {showImg ? (
        <img
          src={avatarUrl!.trim()}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <span>{initial}</span>
      )}
    </div>
  )
}
import { Search, Filter, Pencil, Eye, Trash2, LockOpen, KeyRound } from 'lucide-react'
import { useUsers } from '@/hooks/useUsers'
import { useBranchesAdmin } from '@/hooks/useBranchesAdmin'
import {
  useUpdateUser,
  useCreateUser,
  usePatchUserStatus,
  useDeleteUser,
  useResetUserPassword,
} from '@/hooks/useAdminMutations'
import { EditUserModal } from '@/features/admin/components/EditUserModal'
import { CreateUserModal } from '@/features/admin/components/CreateUserModal'
import { ResetPasswordResultModal } from '@/features/admin/components/ResetPasswordResultModal'
import { Modal, Button, Pagination } from '@/components/ui'
import type { AdminUser } from '@/types/admin.types'
import { useToastStore } from '@/store/toastStore'

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

function apiErr(e: unknown, fallback: string) {
  const ax = e as { response?: { data?: { message?: string } } }
  return ax.response?.data?.message || fallback
}

export function AdminUsersPage() {
  const toast = useToastStore()
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [searchDraft, setSearchDraft] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    searchDebounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchDraft)
      searchDebounceRef.current = null
    }, 350)
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    }
  }, [searchDraft])

  const { data: usersRaw = [], isLoading, refetch } = useUsers({
    role: roleFilter,
    status: statusFilter,
    search: debouncedSearch,
  })
  const { data: branches } = useBranchesAdmin()
  const updateUser = useUpdateUser()
  const createUser = useCreateUser()
  const patchStatus = usePatchUserStatus()
  const deleteUser = useDeleteUser()
  const resetPassword = useResetUserPassword()

  const [branchFilter, setBranchFilter] = useState('')
  const [categoryTab, setCategoryTab] = useState('all')
  const [editUser, setEditUser] = useState<AdminUser | null>(null)
  const [viewUser, setViewUser] = useState<AdminUser | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<AdminUser | null>(null)
  const [resetFor, setResetFor] = useState<AdminUser | null>(null)
  const [resetTemp, setResetTemp] = useState<string | null>(null)
  const [confirmResetPassword, setConfirmResetPassword] = useState<AdminUser | null>(null)
  const [page, setPage] = useState(1)

  const [pageSize, setPageSize] = useState(12)
  const branchOptions = branches ?? []

  const filteredByTab = useMemo(() => {
    let list = usersRaw
    if (categoryTab === 'customer') list = list.filter((u) => u.role === 'Customer')
    else if (categoryTab === 'staff') list = list.filter((u) => u.role === 'SalesStaff')
    else if (categoryTab === 'manager') list = list.filter((u) => u.role === 'BranchManager')
    return list
  }, [usersRaw, categoryTab])

  const counts = useMemo(() => {
    const list = usersRaw
    return {
      all: list.length,
      customer: list.filter((u) => u.role === 'Customer').length,
      staff: list.filter((u) => u.role === 'SalesStaff').length,
      manager: list.filter((u) => u.role === 'BranchManager').length,
    }
  }, [usersRaw])

  const filtered = useMemo(() => {
    let list = filteredByTab
    if (branchFilter) list = list.filter((u) => u.branchId === branchFilter)
    return list
  }, [filteredByTab, branchFilter])

  const totalPages = Math.ceil(filtered.length / pageSize) || 1
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  useEffect(() => {
    setPage(1)
  }, [roleFilter, statusFilter, debouncedSearch, branchFilter, categoryTab])

  /** Vai trò hợp lệ với bộ lọc theo tab — tránh để Admin trong tab Nhân viên (chỉ SalesStaff). */
  const roleFilterAllowedForTab = useMemo(() => {
    if (categoryTab === 'all') return new Set(['Customer', 'SalesStaff', 'BranchManager', 'Admin'] as const)
    if (categoryTab === 'customer') return new Set(['Customer'] as const)
    if (categoryTab === 'staff') return new Set(['SalesStaff'] as const)
    if (categoryTab === 'manager') return new Set(['BranchManager'] as const)
    return new Set<string>()
  }, [categoryTab])

  useEffect(() => {
    if (roleFilter && !roleFilterAllowedForTab.has(roleFilter)) {
      setRoleFilter('')
    }
  }, [categoryTab, roleFilter, roleFilterAllowedForTab])

  const roleSelectOptions = useMemo(() => {
    const all = [
      { value: '', label: 'Tất cả vai trò' },
      { value: 'Customer', label: 'Customer' },
      { value: 'SalesStaff', label: 'SalesStaff' },
      { value: 'BranchManager', label: 'BranchManager' },
      { value: 'Admin', label: 'Admin' },
    ] as const
    if (categoryTab === 'all') return [...all]
    return all.filter((o) => o.value === '' || roleFilterAllowedForTab.has(o.value))
  }, [categoryTab, roleFilterAllowedForTab])

  const handleRefreshList = () => {
    void refetch()
  }

  const handleSave = async (id: string, data: {
    name: string
    email: string
    phone: string
    role: string
    branchId?: string
    status: 'active' | 'inactive' | 'locked'
  }) => {
    try {
      await updateUser.mutateAsync({
        id,
        body: {
          name: data.name,
          phone: data.phone.trim() === '' ? null : data.phone.trim(),
          role: data.role,
          branchId: data.branchId?.trim() ? Number(data.branchId) : null,
          status: data.status,
        },
      })
      toast.addToast('success', 'Đã cập nhật người dùng.')
    } catch (e) {
      toast.addToast('error', apiErr(e, 'Không cập nhật được.'))
      throw e
    }
  }

  const handleDeactivate = async (id: string) => {
    try {
      await patchStatus.mutateAsync({ id, status: 'inactive' })
      toast.addToast('success', 'Đã vô hiệu hóa.')
    } catch (e) {
      toast.addToast('error', apiErr(e, 'Thao tác thất bại.'))
      throw e
    }
  }

  const handleToggleStatus = async (u: AdminUser) => {
    try {
      await patchStatus.mutateAsync({ id: u.id, status: 'active' })
      toast.addToast('success', 'Đã kích hoạt lại.')
    } catch (e) {
      toast.addToast('error', apiErr(e, 'Thao tác thất bại.'))
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    try {
      await deleteUser.mutateAsync(confirmDelete.id)
      toast.addToast('success', 'Đã xóa người dùng (soft delete).')
      setConfirmDelete(null)
    } catch (e) {
      toast.addToast('error', apiErr(e, 'Không xóa được.'))
    }
  }

  const executeResetPassword = async () => {
    if (!confirmResetPassword) return
    try {
      const r = await resetPassword.mutateAsync(confirmResetPassword.id)
      setResetFor(confirmResetPassword)
      setResetTemp(r.temporaryPassword)
      setConfirmResetPassword(null)
      toast.addToast('success', 'Đã tạo mật khẩu tạm. Người dùng phải đặt mật khẩu mới khi đăng nhập.')
    } catch (e) {
      toast.addToast('error', apiErr(e, 'Không reset được mật khẩu.'))
    }
  }

  const formatDate = (d: string) => {
    try {
      const [y, m, day] = d.split('-')
      return `${day}/${m}/${y}`
    } catch {
      return d
    }
  }

  const statusLabel = (u: AdminUser) => {
    if (u.status === 'active') return { text: 'Đang hoạt động', dot: 'bg-green-500', color: 'text-green-600' }
    if (u.status === 'locked') return { text: 'Đã khóa', dot: 'bg-amber-500', color: 'text-amber-600' }
    return { text: 'Vô hiệu', dot: 'bg-red-500', color: 'text-red-600' }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Quản Lý Người Dùng</h2>
        <Button variant="primary" onClick={() => setCreateOpen(true)}>+ Tạo Tài Khoản</Button>
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
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
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
              {roleSelectOptions.map((o) => (
                <option key={o.value || 'all'} value={o.value}>{o.label}</option>
              ))}
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
              {branchOptions.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div className="w-44">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-tight text-slate-500">Trạng thái</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Vô hiệu</option>
              <option value="locked">Khóa</option>
            </select>
          </div>
          <Button variant="outline" size="sm" type="button" onClick={handleRefreshList} title="Tải lại danh sách từ server">
            <Filter className="mr-2 h-4 w-4" />
            Làm mới
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
              {paginated.map((u) => {
                const st = statusLabel(u)
                return (
                  <tr key={u.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <AdminUserAvatar name={u.name} avatarUrl={u.avatarUrl} />
                        <div>
                          <p className="font-semibold text-slate-900">{u.name}</p>
                          <p className="text-xs text-slate-500">#{u.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-600">{u.email}</p>
                      <p className="text-xs text-slate-500">{u.phone || '—'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_CLASS[u.role] ?? 'bg-slate-200 text-slate-700'}`}>
                        {ROLE_LABELS[u.role] ?? u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{u.branchName ?? '-'}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${st.color}`}>
                        <span className={`h-2 w-2 rounded-full ${st.dot}`} />
                        {st.text}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap justify-end gap-1">
                        <button type="button" className="rounded p-1.5 text-slate-500 hover:bg-[#1A3C6E]/10 hover:text-[#1A3C6E]" title="Sửa" onClick={() => { setViewUser(null); setEditUser(u) }}>
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                          title="Xem"
                          onClick={() => { setEditUser(null); setViewUser(u) }}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className="rounded p-1.5 text-slate-500 hover:bg-amber-500/10 hover:text-amber-700"
                          title="Đặt lại mật khẩu"
                          onClick={() => setConfirmResetPassword(u)}
                        >
                          <KeyRound className="h-4 w-4" />
                        </button>
                        {u.status === 'active' ? (
                          <button
                            type="button"
                            className="rounded p-1.5 text-slate-500 hover:bg-red-600/10 hover:text-red-600"
                            title="Xóa"
                            onClick={() => setConfirmDelete(u)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        ) : (
                          <button type="button" onClick={() => handleToggleStatus(u)} className="rounded p-1.5 text-slate-500 hover:bg-emerald-500/10 hover:text-emerald-500" title="Kích hoạt lại">
                            <LockOpen className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
        {!isLoading && filtered.length === 0 && (
          <div className="py-12 text-center text-slate-500">Không tìm thấy người dùng</div>
        )}
      </div>
      <Pagination page={page} totalPages={totalPages} total={filtered.length} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1) }} label="người dùng" />
      <EditUserModal
        user={editUser}
        isOpen={!!editUser}
        onClose={() => setEditUser(null)}
        onSave={handleSave}
        onDeactivate={handleDeactivate}
        branches={branchOptions.map((b) => ({ id: b.id, name: b.name }))}
      />
      <EditUserModal
        user={viewUser}
        isOpen={!!viewUser}
        readOnly
        onClose={() => setViewUser(null)}
        branches={branchOptions.map((b) => ({ id: b.id, name: b.name }))}
      />
      <CreateUserModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        branches={branchOptions.map((b) => ({ id: b.id, name: b.name }))}
        onSubmit={async (body) => {
          try {
            await createUser.mutateAsync(body)
            toast.addToast('success', 'Đã tạo tài khoản.')
          } catch (e) {
            toast.addToast('error', apiErr(e, 'Không tạo được tài khoản.'))
            throw e
          }
        }}
      />
      <Modal
        isOpen={!!confirmResetPassword}
        onClose={() => setConfirmResetPassword(null)}
        title="Đặt lại mật khẩu?"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmResetPassword(null)}>Hủy</Button>
            <Button variant="primary" loading={resetPassword.isPending} onClick={() => void executeResetPassword()}>
              Đặt lại
            </Button>
          </div>
        }
      >
        <p className="text-sm text-slate-600">
          Tạo mật khẩu tạm mới cho <strong>{confirmResetPassword?.name}</strong> ({confirmResetPassword?.email})? Sau khi
          đăng nhập bằng mật khẩu tạm, họ bắt buộc phải đặt mật khẩu mới trước khi vào hệ thống.
        </p>
      </Modal>
      <Modal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Xóa người dùng?"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>Hủy</Button>
            <Button variant="danger" onClick={handleDelete}>Xóa</Button>
          </div>
        }
      >
        <p className="text-sm text-slate-600">
          Người dùng <strong>{confirmDelete?.name}</strong> sẽ bị đánh dấu xóa mềm và gỡ khỏi phân công. Tiếp tục?
        </p>
      </Modal>
      <ResetPasswordResultModal
        isOpen={!!resetTemp && !!resetFor}
        onClose={() => { setResetTemp(null); setResetFor(null) }}
        userName={resetFor?.name ?? ''}
        temporaryPassword={resetTemp ?? ''}
      />
    </div>
  )
}
