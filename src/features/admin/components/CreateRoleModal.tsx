import { useState, useMemo, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal, Input, Button } from '@/components/ui'
import type { AdminPermissionRow } from '@/types/admin.types'

const schema = z.object({
  name: z.string().min(2, 'Tối thiểu 2 ký tự'),
})

type FormData = z.infer<typeof schema>

export interface CreateRoleSubmitPayload {
  name: string
  permissionIds: number[]
}

interface CreateRoleModalProps {
  isOpen: boolean
  onClose: () => void
  permissionsCatalog: AdminPermissionRow[]
  onSubmit: (data: CreateRoleSubmitPayload) => Promise<void>
}

export function CreateRoleModal({ isOpen, onClose, permissionsCatalog, onSubmit }: CreateRoleModalProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '' },
  })
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [permError, setPermError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      form.reset({ name: '' })
      setSelected(new Set())
      setPermError(null)
    }
  }, [isOpen, form])

  const byModule = useMemo(() => {
    const m = new Map<string, AdminPermissionRow[]>()
    for (const p of permissionsCatalog) {
      const k = p.module
      if (!m.has(k)) m.set(k, [])
      m.get(k)!.push(p)
    }
    return m
  }, [permissionsCatalog])

  const toggle = (id: number) => {
    setPermError(null)
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const canSubmit = selected.size > 0 && permissionsCatalog.length > 0

  const handleSubmit = form.handleSubmit(async (data) => {
    if (selected.size === 0) {
      setPermError('Vui lòng chọn ít nhất một quyền.')
      return
    }
    await onSubmit({ name: data.name.trim(), permissionIds: [...selected] })
    form.reset()
    setSelected(new Set())
    setPermError(null)
    onClose()
  })

  const handleClose = () => {
    form.reset()
    setSelected(new Set())
    setPermError(null)
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
          <Button
            variant="primary"
            type="button"
            onClick={() => handleSubmit()}
            loading={form.formState.isSubmitting}
            disabled={!canSubmit}
          >
            Tạo vai trò
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Tên vai trò" {...form.register('name')} error={form.formState.errors.name?.message} required />
        <p className="text-xs text-slate-500">Bắt buộc chọn ít nhất một quyền từ danh sách bên dưới.</p>
        {permError ? <p className="text-sm text-red-600">{permError}</p> : null}
        <div
          className={`max-h-72 overflow-y-auto rounded-lg border p-2 text-sm ${
            permError ? 'border-red-300' : 'border-slate-200'
          }`}
        >
          {permissionsCatalog.length === 0 ? (
            <p className="py-4 text-center text-slate-500">Đang tải quyền...</p>
          ) : (
            [...byModule.entries()].map(([mod, rows]) => (
              <div key={mod} className="mb-3">
                <p className="mb-1 font-semibold text-slate-800">{mod}</p>
                <ul className="space-y-1 pl-2">
                  {rows.map((p) => {
                    const label = `${p.module}.${p.action}`
                    return (
                      <li key={p.id}>
                        <label className="flex cursor-pointer items-start gap-2 rounded px-1 py-0.5 hover:bg-slate-50">
                          <input
                            type="checkbox"
                            checked={selected.has(p.id)}
                            onChange={() => toggle(p.id)}
                            className="mt-1 rounded"
                          />
                          <span>
                            <span className="font-mono text-xs text-slate-800">{label}</span>
                            {p.description ? <span className="ml-2 text-xs text-slate-500">{p.description}</span> : null}
                          </span>
                        </label>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))
          )}
        </div>
      </form>
    </Modal>
  )
}
