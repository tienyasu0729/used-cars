import { useState } from 'react'
import { Card, Button, Input } from '@/components'
import { staffApi } from '@/api/staffApi'
import { useMutation } from '@tanstack/react-query'

export function NotificationsPage() {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [target, setTarget] = useState<'all' | 'showroom' | 'customer'>('all')

  const sendMutation = useMutation({
    mutationFn: () => staffApi.sendNotification({ title, message, target }),
  })

  const handleSend = () => {
    if (title.trim() && message.trim()) sendMutation.mutate()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#FF6600] mb-6">Push Notifications</h1>

      <Card className="p-6 max-w-xl">
        <Input label="Tiêu đề" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nhập tiêu đề..." />
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung</label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-lg min-h-[100px]"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Nhập nội dung..."
          />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Đối tượng</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            value={target}
            onChange={(e) => setTarget(e.target.value as typeof target)}
          >
            <option value="all">Tất cả người dùng</option>
            <option value="showroom">Showroom</option>
            <option value="customer">Khách hàng</option>
          </select>
        </div>
        <div className="mt-6">
          <Button variant="primary" onClick={handleSend} disabled={sendMutation.isPending}>
            Gửi thông báo
          </Button>
        </div>
      </Card>
    </div>
  )
}
