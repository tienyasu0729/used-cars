import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui'
import { notificationTriggers } from '@/mock/mockConfigData'

export function ConfigNotificationTab() {
  const [channel, setChannel] = useState<'email' | 'sms'>('email')
  const [selectedId, setSelectedId] = useState(notificationTriggers[0].id)
  const [editMode, setEditMode] = useState<'rich' | 'source'>('rich')

  const selected = notificationTriggers.find((t) => t.id === selectedId) ?? notificationTriggers[0]

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <button
          onClick={() => setChannel('email')}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${channel === 'email' ? 'bg-[#1A3C6E] text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
        >
          Mẫu Email
        </button>
        <button
          onClick={() => setChannel('sms')}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${channel === 'sms' ? 'bg-[#1A3C6E] text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
        >
          Mẫu SMS
        </button>
      </div>
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="font-semibold text-slate-900">Trình kích hoạt sự kiện</h4>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
              {notificationTriggers.length} mục
            </span>
          </div>
          <div className="space-y-1">
            {notificationTriggers.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedId(t.id)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition-colors ${
                  selectedId === t.id ? 'bg-[#1A3C6E]/10 text-[#1A3C6E]' : 'hover:bg-slate-50'
                }`}
              >
                <div>
                  <p className="text-sm font-medium">{t.title}</p>
                  <p className="text-xs text-slate-500">{t.description}</p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0" />
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h4 className="mb-4 font-semibold text-slate-900">Chỉnh sửa: {selected.title}</h4>
          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setEditMode('rich')}
              className={`rounded px-3 py-1.5 text-sm ${editMode === 'rich' ? 'bg-[#1A3C6E] text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              Rich Text
            </button>
            <button
              onClick={() => setEditMode('source')}
              className={`rounded px-3 py-1.5 text-sm ${editMode === 'source' ? 'bg-[#1A3C6E] text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              Source Code
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">Tiêu đề email</label>
              <input
                type="text"
                defaultValue={selected.subject}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-[#1A3C6E] focus:ring-1 focus:ring-[#1A3C6E]"
              />
            </div>
            <div>
              <div className="mb-2 flex gap-1">
                <button className="rounded border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50">B</button>
                <button className="rounded border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50">I</button>
                <button className="rounded border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50">U</button>
                <button className="rounded border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50">•</button>
                <button className="rounded border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50">1.</button>
                <button className="ml-2 rounded border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50">
                  + Chèn biến
                </button>
              </div>
              <label className="mb-1 block text-sm font-medium text-slate-600">Nội dung tin nhắn</label>
              <textarea
                defaultValue={selected.content}
                rows={10}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm focus:border-[#1A3C6E] focus:ring-1 focus:ring-[#1A3C6E]"
              />
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-slate-600">Biến có sẵn</p>
              <div className="flex flex-wrap gap-2">
                {selected.variables.map((v) => (
                  <span
                    key={v}
                    className="rounded bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700"
                  >
                    {v}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-6 flex items-center gap-4">
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" defaultChecked={selected.active} className="rounded" />
              <span className="text-sm text-slate-600">Trình kích hoạt bật</span>
            </label>
            <Button variant="outline" size="sm">Gửi thử</Button>
            <Button variant="primary" size="sm">Lưu mẫu</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
