import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAdminNotifications } from '@/hooks/useAdminNotifications'
import { Button } from '@/components/ui'
import { Megaphone, Mail, Trash2, Send, Pencil } from 'lucide-react'
import { AdminAnnouncementFormModal } from '@/features/admin/components/AdminAnnouncementFormModal'
import {
  adminAnnouncementsListKey,
  deleteAdminAnnouncement,
  publishAdminAnnouncement,
  type AdminAnnouncementRow,
} from '@/services/adminAnnouncements.service'

export function AdminNotificationsPage() {
  const { data: rows, isLoading } = useAdminNotifications()
  const qc = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<AdminAnnouncementRow | null>(null)

  const delMut = useMutation({
    mutationFn: (id: number) => deleteAdminAnnouncement(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: [...adminAnnouncementsListKey] })
    },
  })

  const pubMut = useMutation({
    mutationFn: (id: number) => publishAdminAnnouncement(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: [...adminAnnouncementsListKey] })
    },
  })

  const openCreate = () => {
    setEditing(null)
    setModalOpen(true)
  }

  const openEdit = (r: AdminAnnouncementRow) => {
    setEditing(r)
    setModalOpen(true)
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Quản Lý Thông Báo</h2>
        <Button variant="primary" type="button" onClick={openCreate}>
          Tạo mới
        </Button>
      </div>
      <div className="space-y-4">
        {isLoading && <p className="text-slate-500">Đang tải…</p>}
        {(rows ?? []).map((n) => (
          <div
            key={n.id}
            className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#1A3C6E]/10">
              {n.notifKind === 'announcement' ? (
                <Megaphone className="h-6 w-6 text-[#1A3C6E]" />
              ) : (
                <Mail className="h-6 w-6 text-[#1A3C6E]" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-slate-900">{n.title}</p>
              <p className="text-sm text-slate-500">
                {n.notifKind === 'announcement' ? 'Thông báo' : 'Email'} · {n.audience} ·{' '}
                {n.published ? 'Đã phát hành' : 'Bản nháp'} · {new Date(n.createdAt).toLocaleString('vi-VN')}
              </p>
              {n.emailLastError && (
                <p className="mt-1 text-xs text-red-600">Email: {n.emailLastError}</p>
              )}
              {n.emailSentAt && !n.emailLastError && (
                <p className="mt-1 text-xs text-emerald-600">Đã gửi email lúc {new Date(n.emailSentAt).toLocaleString('vi-VN')}</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {!n.published && (
                <Button variant="outline" size="sm" type="button" disabled={pubMut.isPending} onClick={() => pubMut.mutate(n.id)}>
                  <Send className="mr-1 h-4 w-4" />
                  Phát hành
                </Button>
              )}
              <Button variant="ghost" size="sm" type="button" onClick={() => openEdit(n)}>
                <Pencil className="mr-1 h-4 w-4" />
                Sửa
              </Button>
              <Button variant="ghost" size="sm" type="button" disabled={delMut.isPending} onClick={() => delMut.mutate(n.id)}>
                <Trash2 className="mr-1 h-4 w-4 text-red-600" />
                Xóa
              </Button>
            </div>
          </div>
        ))}
      </div>
      {(!rows || rows.length === 0) && !isLoading && (
        <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center text-slate-500">
          Chưa có thông báo nào
        </div>
      )}
      <AdminAnnouncementFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initial={editing}
      />
    </div>
  )
}
