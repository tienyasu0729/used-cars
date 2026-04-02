import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal, Input, Button } from '@/components/ui'
import { FEATURE_MODULES, PERM_COLS, DEFAULT_PERMISSION } from '../constants/rolePermissions'
import type { RolePermission } from '@/types/admin.types'

const schema = z.object({
  name: z.string().min(2, 'Tối thiểu 2 ký tự'),
  description: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export interface CreateRolePayload {
  name: string
  description?: string
  permissions: Record<string, RolePermission>
}

interface CreateRoleModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateRolePayload) => Promise<void>
}

export function CreateRoleModal({ isOpen, onClose, onSubmit }: CreateRoleModalProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '' },
  })
  const [permissions, setPermissions] = useState<Record<string, RolePermission>>(() => {
    const p: Record<string, RolePermission> = {}
    FEATURE_MODULES.forEach((m) => { p[m.key] = { ...DEFAULT_PERMISSION } })
    return p
  })

  const handlePermChange = (moduleKey: string, perm: keyof RolePermission, value: boolean) => {
    setPermissions((prev) => ({
      ...prev,
      [moduleKey]: { ...(prev[moduleKey] ?? { ...DEFAULT_PERMISSION }), [perm]: value },
    }))
  }

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit({ ...data, permissions })
    form.reset()
    setPermissions(() => {
      const p: Record<string, RolePermission> = {}
      FEATURE_MODULES.forEach((m) => { p[m.key] = { ...DEFAULT_PERMISSION } })
      return p
    })
    onClose()
  })

  const handleClose = () => {
    form.reset()
    setPermissions(() => {
      const p: Record<string, RolePermission> = {}
      FEATURE_MODULES.forEach((m) => { p[m.key] = { ...DEFAULT_PERMISSION } })
      return p
    })
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Tạo vai trò mới"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>Hủy</Button>
          <Button variant="primary" onClick={handleSubmit} loading={form.formState.isSubmitting}>
            Tạo vai trò
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Tên vai trò" {...form.register('name')} error={form.formState.errors.name?.message} required />
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Mô tả</label>
          <textarea {...form.register('description')} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" rows={2} />
        </div>
        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Quyền hạn</p>
          <div className="max-h-64 overflow-y-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-slate-50">
                <tr className="border-b border-slate-200">
                  <th className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-500">Module</th>
                  <th className="px-2 py-2 text-center text-xs font-bold uppercase tracking-wider text-slate-500">View</th>
                  <th className="px-2 py-2 text-center text-xs font-bold uppercase tracking-wider text-slate-500">Create</th>
                  <th className="px-2 py-2 text-center text-xs font-bold uppercase tracking-wider text-slate-500">Edit</th>
                  <th className="px-2 py-2 text-center text-xs font-bold uppercase tracking-wider text-slate-500">Delete</th>
                  <th className="px-2 py-2 text-center text-xs font-bold uppercase tracking-wider text-slate-500">Approve</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {FEATURE_MODULES.map((m) => {
                  const p = permissions[m.key] ?? { ...DEFAULT_PERMISSION }
                  return (
                    <tr key={m.key} className="hover:bg-slate-50">
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <m.icon className="h-4 w-4 text-slate-400" />
                          <div>
                            <p className="font-medium text-slate-900">{m.label}</p>
                            <p className="text-xs text-slate-500">{m.desc}</p>
                          </div>
                        </div>
                      </td>
                      {PERM_COLS.map((col) => (
                        <td key={col} className="px-2 py-2 text-center">
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
        </div>
      </form>
    </Modal>
  )
}
