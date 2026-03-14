import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui'
import { ConfigPaymentTab } from '@/features/admin/components/config/ConfigPaymentTab'
import { ConfigNotificationTab } from '@/features/admin/components/config/ConfigNotificationTab'

type TabId = 'payment' | 'notification' | 'general'

const TABS: { id: TabId; label: string }[] = [
  { id: 'payment', label: 'Thanh Toán' },
  { id: 'notification', label: 'Thông Báo' },
  { id: 'general', label: 'Tổng Quát' },
]

export function AdminConfigPage() {
  const [tab, setTab] = useState<TabId>('payment')

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link to="/admin/dashboard" className="hover:text-[#1A3C6E]">Admin</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-slate-700">Cấu hình hệ thống</span>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Cấu Hình Hệ Thống</h2>
          <p className="mt-1 text-slate-500">Thiết lập các thông số vận hành cho toàn bộ website BanXeOTo Da Nang</p>
        </div>
        <Button variant="primary" size="sm">Lưu Thay Đổi</Button>
      </div>
      <div className="flex gap-2 border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.id
                ? 'border-[#1A3C6E] text-[#1A3C6E]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'payment' && <ConfigPaymentTab />}
      {tab === 'notification' && <ConfigNotificationTab />}
      {tab === 'general' && (
        <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Tên công ty</label>
            <input
              type="text"
              defaultValue="BanXeOTo Đà Nẵng"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-[#1A3C6E] focus:ring-1 focus:ring-[#1A3C6E]"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Email hỗ trợ</label>
            <input
              type="email"
              defaultValue="support@banxeoto.vn"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-[#1A3C6E] focus:ring-1 focus:ring-[#1A3C6E]"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Cài đặt thông báo</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm text-slate-600">Gửi email xác nhận đặt lịch</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm text-slate-600">Gửi thông báo khi có xe mới</span>
              </label>
            </div>
          </div>
          <Button variant="primary">Lưu cấu hình</Button>
        </div>
      )}
    </div>
  )
}
