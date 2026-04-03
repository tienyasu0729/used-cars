import { useState, useMemo, useEffect } from 'react'
import { Search } from 'lucide-react'
import { useRoles } from '@/hooks/useRoles'
import { useAdminPermissions } from '@/hooks/useAdminPermissions'
import { useCreateRole, useUpdateRole, useDeleteRole } from '@/hooks/useAdminMutations'
import type { AdminPermissionRow, AdminRole } from '@/types/admin.types'
import { CreateRoleModal } from '@/features/admin/components/CreateRoleModal'
import { Button, Modal } from '@/components/ui'
import { useToastStore } from '@/store/toastStore'

function keysToIds(keys: string[], catalog: AdminPermissionRow[]): Set<number> {
  const want = new Set(keys)
  const ids = new Set<number>()
  for (const p of catalog) {
    if (want.has(`${p.module}.${p.action}`)) ids.add(p.id)
  }
  return ids
}

function apiErr(e: unknown, fallback: string) {
  const ax = e as { response?: { data?: { message?: string; errorCode?: string } } }
  return ax.response?.data?.message || fallback
}

export function AdminRolesPage() {
  const toast = useToastStore()
  const { data: roles, isLoading } = useRoles()
  const { data: permissionsCatalog = [], isLoading: permLoading } = useAdminPermissions()
  const createRole = useCreateRole()
  const updateRole = useUpdateRole()
  const deleteRole = useDeleteRole()

  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [draftIds, setDraftIds] = useState<Set<number>>(new Set())
  const [confirmDelete, setConfirmDelete] = useState<AdminRole | null>(null)

  useEffect(() => {
    if (!selectedRoleId && roles?.length) {
      setSelectedRoleId(roles[0].id)
    }
  }, [roles, selectedRoleId])

  const selectedRole = roles?.find((r) => r.id === selectedRoleId) ?? null

  useEffect(() => {
    if (!selectedRole || !permissionsCatalog.length) {
      setDraftIds(new Set())
      return
    }
    setDraftIds(keysToIds(selectedRole.permissionKeys, permissionsCatalog))
  }, [selectedRole?.id, selectedRole?.permissionKeys, permissionsCatalog])

  const displayRoles = search.trim()
    ? roles?.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()))
    : roles

  const byModule = useMemo(() => {
    const m = new Map<string, AdminPermissionRow[]>()
    for (const p of permissionsCatalog) {
      if (!m.has(p.module)) m.set(p.module, [])
      m.get(p.module)!.push(p)
    }
    return m
  }, [permissionsCatalog])

  const togglePerm = (id: number) => {
    if (selectedRole?.systemRole) return
    setDraftIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSave = async () => {
    if (!selectedRole || selectedRole.systemRole) return
    try {
      await updateRole.mutateAsync({
        id: selectedRole.id,
        name: selectedRole.name,
        permissionIds: [...draftIds],
      })
      toast.addToast('success', 'Đã cập nhật vai trò.')
    } catch (e) {
      toast.addToast('error', apiErr(e, 'Không lưu được.'))
    }
  }

  const handleCreate = async (data: { name: string; permissionIds: number[] }) => {
    try {
      const r = await createRole.mutateAsync(data)
      toast.addToast('success', 'Đã tạo vai trò.')
      if (r?.id != null) setSelectedRoleId(String(r.id))
    } catch (e) {
      toast.addToast('error', apiErr(e, 'Không tạo được vai trò.'))
      throw e
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    try {
      await deleteRole.mutateAsync(confirmDelete.id)
      toast.addToast('success', 'Đã xóa vai trò.')
      setConfirmDelete(null)
      setSelectedRoleId(null)
    } catch (e) {
      toast.addToast('error', apiErr(e, 'Không xóa được (có thể ROLE_IN_USE).'))
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-slate-900">Quản lý vai trò</h2>
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">Cấu hình</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm vai trò..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-48 rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm focus:border-[#1A3C6E] focus:ring-1 focus:ring-[#1A3C6E]"
            />
          </div>
          <Button variant="primary" onClick={() => setCreateOpen(true)}>+ Tạo vai trò</Button>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-500">Vai trò</h4>
          {isLoading ? (
            <div className="py-8 text-center text-slate-500">Đang tải...</div>
          ) : (
            <ul className="space-y-1">
              {displayRoles?.map((r) => (
                <li
                  key={r.id}
                  onClick={() => setSelectedRoleId(r.id)}
                  className={`cursor-pointer rounded-lg p-4 transition-colors ${selectedRoleId === r.id ? 'bg-[#1A3C6E] text-white' : 'hover:bg-slate-50'}`}
                >
                  <p className="font-semibold">{r.name}</p>
                  <p className={`text-sm ${selectedRoleId === r.id ? 'text-white/80' : 'text-slate-500'}`}>
                    {r.systemRole ? 'Vai trò hệ thống' : 'Vai trò tùy chỉnh'}
                  </p>
                  <p className={`mt-1 text-xs ${selectedRoleId === r.id ? 'text-white/70' : 'text-slate-400'}`}>{r.userCount} người dùng</p>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          {!selectedRole ? (
            <p className="text-slate-500">Chọn một vai trò.</p>
          ) : (
            <>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="text-lg font-semibold text-slate-900">{selectedRole.name}</h4>
                  <p className="mt-1 text-sm text-slate-500">
                    {selectedRole.systemRole
                      ? 'Vai trò hệ thống: chỉ xem quyền, không sửa/xóa qua giao diện này.'
                      : 'Chọn permission (theo API permissionIds).'}
                  </p>
                </div>
                <div className="flex gap-2">
                  {!selectedRole.systemRole && (
                    <>
                      <Button variant="outline" size="sm" onClick={() => setDraftIds(keysToIds(selectedRole.permissionKeys, permissionsCatalog))}>
                        Hoàn tác
                      </Button>
                      <Button variant="primary" size="sm" onClick={handleSave} disabled={permLoading}>
                        Lưu
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => setConfirmDelete(selectedRole)}>
                        Xóa
                      </Button>
                    </>
                  )}
                </div>
              </div>
              <div className="max-h-[480px] overflow-y-auto rounded-lg border border-slate-200 p-3 text-sm">
                {permLoading ? (
                  <p className="py-6 text-center text-slate-500">Đang tải danh sách quyền...</p>
                ) : (
                  [...byModule.entries()].map(([mod, rows]) => (
                    <div key={mod} className="mb-4">
                      <p className="mb-2 font-semibold text-slate-800">{mod}</p>
                      <ul className="space-y-1 pl-2">
                        {rows.map((p) => (
                          <li key={p.id}>
                            <label className={`flex items-start gap-2 rounded px-1 py-0.5 ${selectedRole.systemRole ? '' : 'cursor-pointer hover:bg-slate-50'}`}>
                              <input
                                type="checkbox"
                                disabled={selectedRole.systemRole}
                                checked={draftIds.has(p.id)}
                                onChange={() => togglePerm(p.id)}
                                className="mt-1 rounded"
                              />
                              <span>
                                <span className="font-mono text-xs">{p.module}.{p.action}</span>
                                {p.description ? <span className="ml-2 text-xs text-slate-500">{p.description}</span> : null}
                              </span>
                            </label>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
      <CreateRoleModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        permissionsCatalog={permissionsCatalog}
        onSubmit={handleCreate}
      />
      <Modal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Xóa vai trò?"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>Hủy</Button>
            <Button variant="danger" onClick={handleDelete}>Xóa</Button>
          </div>
        }
      >
        <p className="text-sm text-slate-600">
          Xóa vai trò <strong>{confirmDelete?.name}</strong>? Nếu còn user gán vai trò này, API trả lỗi ROLE_IN_USE.
        </p>
      </Modal>
    </div>
  )
}
