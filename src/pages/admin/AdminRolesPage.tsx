import { useState, useEffect, useRef } from 'react'
import { Search } from 'lucide-react'
import { useRoles } from '@/hooks/useRoles'
import { useCreateRole, useUpdateRole } from '@/hooks/useAdminMutations'
import type { AdminRole, RolePermission } from '@/mock/mockAdminData'
import { CreateRoleModal } from '@/features/admin/components/CreateRoleModal'
import { FEATURE_MODULES, PERM_COLS, DEFAULT_PERMISSION } from '@/features/admin/constants/rolePermissions'
import { Button } from '@/components/ui'

const AUTO_SAVE_DEBOUNCE_MS = 500

export function AdminRolesPage() {
  const { data: roles, isLoading } = useRoles()
  const createRole = useCreateRole()
  const updateRole = useUpdateRole()
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>('r3')
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [permissions, setPermissions] = useState<Record<string, RolePermission>>({})
  const [autoSave, setAutoSave] = useState(false)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const selectedRole = roles?.find((r: AdminRole) => r.id === selectedRoleId) ?? roles?.[0]
  const displayRoles = search.trim()
    ? roles?.filter((r: AdminRole) => r.name.toLowerCase().includes(search.toLowerCase()))
    : roles

  const currentPerms = selectedRole
    ? { ...selectedRole.permissions, ...(Object.keys(permissions).length ? permissions : {}) }
    : ({} as Record<string, RolePermission>)

  const handlePermChange = (moduleKey: string, perm: keyof RolePermission, value: boolean) => {
    setPermissions((prev) => ({
      ...prev,
      [moduleKey]: {
        ...(prev[moduleKey] ?? selectedRole?.permissions[moduleKey] ?? { ...DEFAULT_PERMISSION }),
        [perm]: value,
      },
    }))
  }

  const performSave = async () => {
    if (!selectedRoleId || !selectedRole) return
    const merged = { ...selectedRole.permissions, ...permissions }
    await updateRole.mutateAsync({ id: selectedRoleId, permissions: merged })
    setPermissions({})
  }

  useEffect(() => {
    if (!autoSave || !selectedRoleId || !selectedRole || Object.keys(permissions).length === 0) return
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(async () => {
      const merged = { ...selectedRole.permissions, ...permissions }
      await updateRole.mutateAsync({ id: selectedRoleId, permissions: merged })
      setPermissions({})
      saveTimeoutRef.current = null
    }, AUTO_SAVE_DEBOUNCE_MS)
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
  }, [permissions, autoSave, selectedRoleId, selectedRole, updateRole])

  const handleSave = async () => {
    await performSave()
  }

  const handleCreate = async (data: { name: string; description?: string; permissions: Record<string, RolePermission> }) => {
    const newRole = await createRole.mutateAsync({ name: data.name, description: data.description, permissions: data.permissions })
    if (newRole?.id) setSelectedRoleId(newRole.id)
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-slate-900">Role Management</h2>
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">CONFIGURATION</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search roles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-48 rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm focus:border-[#1A3C6E] focus:ring-1 focus:ring-[#1A3C6E]"
            />
          </div>
          <Button variant="primary" onClick={() => setCreateOpen(true)}>+ Create Role</Button>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-500">Available Roles</h4>
          {isLoading ? (
            <div className="py-8 text-center text-slate-500">Đang tải...</div>
          ) : (
            <ul className="space-y-1">
              {displayRoles?.map((r: AdminRole) => (
                <li
                  key={r.id}
                  onClick={() => { setSelectedRoleId(r.id); setPermissions({}) }}
                  className={`cursor-pointer rounded-lg p-4 transition-colors ${selectedRoleId === r.id ? 'bg-[#1A3C6E] text-white' : 'hover:bg-slate-50'}`}
                >
                  <p className="font-semibold">{r.name}</p>
                  <p className={`text-sm ${selectedRoleId === r.id ? 'text-white/80' : 'text-slate-500'}`}>{r.description}</p>
                  <p className={`mt-1 text-xs ${selectedRoleId === r.id ? 'text-white/70' : 'text-slate-400'}`}>{r.userCount} users</p>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold text-slate-900">Permission Matrix: {selectedRole?.name ?? ''} Role</h4>
              <p className="mt-1 text-sm text-slate-500">Define what this role can see and do across the system modules.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPermissions({})}>Discard</Button>
              <Button variant="primary" size="sm" onClick={handleSave}>Save Changes</Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Feature Module</th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-slate-500">View</th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-slate-500">Create</th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-slate-500">Edit</th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-slate-500">Delete</th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-slate-500">Approve</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {FEATURE_MODULES.map((m) => {
                  const p = currentPerms[m.key] ?? { ...DEFAULT_PERMISSION }
                  return (
                    <tr key={m.key} className="transition-colors hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <m.icon className="h-4 w-4 text-slate-400" />
                          <div>
                            <p className="font-medium text-slate-900">{m.label}</p>
                            <p className="text-xs text-slate-500">{m.desc}</p>
                          </div>
                        </div>
                      </td>
                      {PERM_COLS.map((col) => (
                        <td key={col} className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={p[col]}
                            onChange={(e) => handlePermChange(m.key, col, e.target.checked)}
                            className="rounded"
                          />
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4">
            <p className="text-xs text-slate-500">Last modified by SuperAdmin on Oct 24, 2023</p>
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" checked={autoSave} onChange={(e) => setAutoSave(e.target.checked)} className="rounded" />
              <span className="text-sm text-slate-600">Auto-save changes</span>
            </label>
          </div>
        </div>
      </div>
      <CreateRoleModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
      />
    </div>
  )
}
