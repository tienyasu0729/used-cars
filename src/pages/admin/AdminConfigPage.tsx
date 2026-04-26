import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui'
import { ConfigPaymentTab } from '@/features/admin/components/config/ConfigPaymentTab'
import { ConfigNotificationTab } from '@/features/admin/components/config/ConfigNotificationTab'
import { useAdminConfig, usePutAdminConfig, configListToMap } from '@/hooks/useAdminConfig'
import { useToastStore } from '@/store/toastStore'

type TabId = 'payment' | 'notification' | 'general'

const TABS: { id: TabId; label: string }[] = [
  { id: 'payment', label: 'Thanh Toán' },
  { id: 'notification', label: 'Thông Báo' },
  { id: 'general', label: 'Tổng Quát' },
]

export function AdminConfigPage() {
  const toast = useToastStore()
  const [tab, setTab] = useState<TabId>('payment')
  const { data, isLoading } = useAdminConfig()
  const putCfg = usePutAdminConfig()
  const [siteTitle, setSiteTitle] = useState('')
  const [supportEmail, setSupportEmail] = useState('')
  const [maintenance, setMaintenance] = useState(false)

  useEffect(() => {
    if (!data) return
    const m = configListToMap(data)
    setSiteTitle(m.site_title ?? '')
    setSupportEmail(m.support_email ?? '')
    setMaintenance(String(m.maintenance_mode).toLowerCase() === 'true')
  }, [data])

  const saveGeneral = async () => {
    try {
      await putCfg.mutateAsync([
        { key: 'site_title', value: siteTitle },
        { key: 'support_email', value: supportEmail },
        { key: 'maintenance_mode', value: maintenance ? 'true' : 'false' },
      ])
      toast.addToast('success', 'Đã lưu.')
    } catch {
      toast.addToast('error', 'Không lưu được.')
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link to="/admin/dashboard" className="hover:text-[#1A3C6E]">Admin</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-slate-700">Cấu hình hệ thống</span>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Cấu Hình Hệ Thống</h2>
        <p className="mt-1 text-slate-500">Đọc/ghi SystemConfigs qua API</p>
      </div>
      <div className="flex gap-2 border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.id ? 'border-[#1A3C6E] text-[#1A3C6E]' : 'border-transparent text-slate-500 hover:text-slate-700'
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
          {isLoading ? (
            <div className="py-8 text-center text-slate-500">Đang tải...</div>
          ) : (
            <>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Tên website</label>
                <input
                  type="text"
                  value={siteTitle}
                  onChange={(e) => setSiteTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Email hỗ trợ</label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={maintenance} onChange={(e) => setMaintenance(e.target.checked)} className="rounded" />
                <span className="text-sm text-slate-600">Chế độ bảo trì</span>
              </label>
              <Button variant="primary" onClick={saveGeneral} loading={putCfg.isPending}>Lưu</Button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
