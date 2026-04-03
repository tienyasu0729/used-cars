import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui'
import {
  adminAnnouncementsListKey,
  createAdminAnnouncement,
  updateAdminAnnouncement,
  type AdminAnnouncementRow,
  type CreateAnnouncementBody,
} from '@/services/adminAnnouncements.service'

function parseIds(raw: string): number[] {
  return raw
    .split(/[,;\s]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => Number(s))
    .filter((n) => Number.isFinite(n) && n > 0)
}

interface AdminAnnouncementFormModalProps {
  open: boolean
  onClose: () => void
  initial: AdminAnnouncementRow | null
}

export function AdminAnnouncementFormModal({ open, onClose, initial }: AdminAnnouncementFormModalProps) {
  const qc = useQueryClient()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [notifKind, setNotifKind] = useState<'announcement' | 'email'>('announcement')
  const [audience, setAudience] = useState<CreateAnnouncementBody['audience']>('ALL_CUSTOMERS')
  const [targetsRaw, setTargetsRaw] = useState('')
  const [sendEmail, setSendEmail] = useState(false)
  const [published, setPublished] = useState(false)

  useEffect(() => {
    if (!open) return
    if (initial) {
      setTitle(initial.title)
      setBody(initial.body)
      setNotifKind(initial.notifKind === 'email' ? 'email' : 'announcement')
      setAudience(initial.audience as CreateAnnouncementBody['audience'])
      setTargetsRaw((initial.targetUserIds ?? []).join(', '))
      setSendEmail(initial.sendEmail)
      setPublished(initial.published)
    } else {
      setTitle('')
      setBody('')
      setNotifKind('announcement')
      setAudience('ALL_CUSTOMERS')
      setTargetsRaw('')
      setSendEmail(false)
      setPublished(false)
    }
  }, [open, initial])

  const parsedSpecificIds = audience === 'SPECIFIC_USERS' ? parseIds(targetsRaw) : []
  const canSubmit =
    title.trim().length > 0 &&
    body.trim().length > 0 &&
    (audience !== 'SPECIFIC_USERS' || parsedSpecificIds.length > 0)

  const bodyPayload = (): CreateAnnouncementBody => {
    const base: CreateAnnouncementBody = {
      title: title.trim(),
      body: body.trim(),
      notifKind,
      audience,
      sendEmail,
      published,
    }
    if (audience === 'SPECIFIC_USERS') {
      base.targetUserIds = parsedSpecificIds
    }
    return base
  }

  const saveMut = useMutation({
    mutationFn: async () => {
      const b = bodyPayload()
      if (initial) {
        await updateAdminAnnouncement(initial.id, b)
      } else {
        await createAdminAnnouncement(b)
      }
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: [...adminAnnouncementsListKey] })
      onClose()
    },
  })

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal>
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-slate-900">{initial ? 'Sửa thông báo' : 'Tạo thông báo'}</h3>
        <div className="mt-4 space-y-3">
          <label className="block text-sm font-medium text-slate-700">
            Tiêu đề <span className="text-red-500">*</span>
            <input
              required
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Nội dung <span className="text-red-500">*</span>
            <textarea
              required
              className="mt-1 min-h-[120px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Loại
            <select
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={notifKind}
              onChange={(e) => setNotifKind(e.target.value as 'announcement' | 'email')}
            >
              <option value="announcement">Thông báo in-app</option>
              <option value="email">Kênh email</option>
            </select>
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Đối tượng
            <select
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={audience}
              onChange={(e) => setAudience(e.target.value as CreateAnnouncementBody['audience'])}
            >
              <option value="ALL_CUSTOMERS">Tất cả khách hàng</option>
              <option value="STAFF_AND_MANAGERS">Nhân viên & quản lý</option>
              <option value="SPECIFIC_USERS">Danh sách user id</option>
            </select>
          </label>
          {audience === 'SPECIFIC_USERS' && (
            <label className="block text-sm font-medium text-slate-700">
              User IDs (cách nhau bởi dấu phẩy) <span className="text-red-500">*</span>
              <input
                required
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={targetsRaw}
                onChange={(e) => setTargetsRaw(e.target.value)}
                placeholder="1, 2, 3"
              />
            </label>
          )}
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} />
            Gửi email (SMTP)
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
            Phát hành ngay (tạo inbox + email theo cấu hình)
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" type="button" onClick={onClose}>
            Hủy
          </Button>
          <Button
            variant="primary"
            type="button"
            disabled={saveMut.isPending || !canSubmit}
            onClick={() => saveMut.mutate()}
          >
            Lưu
          </Button>
        </div>
      </div>
    </div>
  )
}
