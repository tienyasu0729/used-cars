import { useAdminNotifications } from '@/hooks/useAdminNotifications'
import { Button } from '@/components/ui'
import { Megaphone, Mail } from 'lucide-react'

export function AdminNotificationsPage() {
  const { data: notifications } = useAdminNotifications()

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Quản Lý Thông Báo</h2>
        <div className="flex gap-2">
          <Button variant="outline">Thông báo hệ thống</Button>
          <Button variant="primary">Email thông báo</Button>
        </div>
      </div>
      <div className="space-y-4">
        {notifications?.map((n: { id: string; title: string; type: string; createdAt: string }) => (
          <div
            key={n.id}
            className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#1A3C6E]/10">
              {n.type === 'announcement' ? (
                <Megaphone className="h-6 w-6 text-[#1A3C6E]" />
              ) : (
                <Mail className="h-6 w-6 text-[#1A3C6E]" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium text-slate-900">{n.title}</p>
              <p className="text-sm text-slate-500">
                {n.type === 'announcement' ? 'Thông báo hệ thống' : 'Email'} · {new Date(n.createdAt).toLocaleString('vi-VN')}
              </p>
            </div>
            <Button variant="ghost" size="sm">Chỉnh sửa</Button>
          </div>
        ))}
      </div>
      {(!notifications || notifications.length === 0) && (
        <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center text-slate-500">
          Chưa có thông báo nào
        </div>
      )}
    </div>
  )
}
