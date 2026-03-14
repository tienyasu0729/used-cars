import { useState } from 'react'
import { Paperclip, Info, MessageCircle, Eye, Reply, ArrowLeft } from 'lucide-react'
import { mockConsultations, type MockConsultation } from '@/mock'
import { useToastStore } from '@/store/toastStore'
import { Button } from '@/components/ui'

const QUICK_REPLIES = [
  'Gửi bảng giá chi tiết',
  'Hẹn lịch lái thử',
  'Tư vấn trả góp 0%',
  'Thông báo xe có sẵn',
]

function formatTimeAgo(s: string) {
  const d = new Date(s)
  const now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 60000)
  if (diff < 60) return `${diff} phút`
  if (diff < 1440) return `${Math.floor(diff / 60)} giờ`
  return `${Math.floor(diff / 1440)} ngày`
}

function formatDateTime(s: string) {
  const d = new Date(s)
  return `${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}`
}

function maskPhone(phone: string) {
  if (!phone || phone.length < 4) return '*** *** ***'
  return phone.slice(0, 4) + ' XXX ' + phone.slice(-3)
}

function getPriorityClass(p: string) {
  if (p === 'high') return 'bg-red-100 text-red-600'
  if (p === 'medium') return 'bg-amber-100 text-amber-600'
  return 'bg-slate-100 text-slate-600'
}

function getPriorityLabel(p: string) {
  if (p === 'high') return 'Ưu tiên cao'
  if (p === 'medium') return 'Trung bình'
  return 'Thấp'
}

function RequestCard({
  c,
  isActive,
  onClick,
}: {
  c: MockConsultation
  isActive: boolean
  onClick: () => void
}) {
  const excerpt = c.message.length > 45 ? c.message.slice(0, 45) + '...' : c.message
  return (
    <button
      onClick={onClick}
      className={`flex w-full gap-3 p-4 text-left transition-colors ${
        isActive ? 'border-l-4 border-[#1A3C6E] bg-[#1A3C6E]/5 hover:bg-[#1A3C6E]/10' : 'hover:bg-slate-50'
      }`}
    >
      <div className="size-12 shrink-0 overflow-hidden rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600">
        {c.customerName.slice(0, 2).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex justify-between items-start mb-0.5">
          <h3 className="text-sm font-bold text-slate-900 truncate">{c.customerName}</h3>
          <span className="text-[10px] text-slate-400 shrink-0">{formatTimeAgo(c.createdAt)}</span>
        </div>
        <p className={`text-xs font-medium mb-1 ${isActive ? 'text-[#1A3C6E]' : 'text-slate-700'}`}>{c.summary}</p>
        <p className="text-xs text-slate-500 truncate italic">&quot;{excerpt}&quot;</p>
        <div className="mt-2 flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getPriorityClass(c.priority)}`}>
            {getPriorityLabel(c.priority)}
          </span>
        </div>
      </div>
    </button>
  )
}

function DetailPanel({
  selected,
  onResolved,
  onSendReply,
  onBack,
}: {
  selected: MockConsultation
  onResolved: () => void
  onSendReply: (text: string) => void
  onBack?: () => void
}) {
  const [reply, setReply] = useState('')
  const handleQuickReply = (text: string) => setReply((r) => (r ? r + '\n' + text : text))
  const handleSend = () => {
    if (!reply.trim()) return
    onSendReply(reply)
    setReply('')
  }
  return (
    <div className="flex flex-1 flex-col overflow-y-auto bg-[#F6F7F8] p-6">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <div className="flex justify-between items-center rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            {onBack && (
              <button onClick={onBack} className="md:hidden p-2 -ml-2 rounded-lg hover:bg-slate-100"><ArrowLeft className="h-5 w-5" /></button>
            )}
            <div className="rounded-lg bg-[#1A3C6E]/10 p-2 text-[#1A3C6E]">
              <Info className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Chi tiết yêu cầu</h2>
              <p className="text-xs text-slate-500 mt-1">ID: #{selected.id}</p>
            </div>
          </div>
          <Button className="bg-green-600 hover:bg-green-700 text-white border-0" onClick={onResolved}>
            Đánh Dấu Đã Giải Quyết
          </Button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Info className="h-5 w-5 text-slate-400" /> Thông tin khách hàng
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Họ và tên</p>
                  <p className="text-sm font-semibold text-slate-800">{selected.customerName}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Số điện thoại</p>
                  <p className="text-sm font-semibold text-[#1A3C6E] underline">{maskPhone(selected.customerPhone)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Email</p>
                  <p className="text-sm font-semibold text-slate-800">{selected.customerEmail}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Khu vực</p>
                  <p className="text-sm font-semibold text-slate-800">{selected.region}</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-slate-400" /> Nội dung yêu cầu
              </h3>
              <div className="rounded-lg border-l-4 border-slate-300 bg-slate-50 p-4">
                <p className="text-sm leading-relaxed text-slate-700">{selected.message}</p>
                <p className="text-[10px] text-slate-400 mt-3 text-right">Gửi lúc {formatDateTime(selected.createdAt)}</p>
              </div>
            </div>
          </div>
          {selected.viewedCars && selected.viewedCars.length > 0 && (
            <div className="space-y-6">
              <div className="rounded-xl border border-slate-200 bg-white p-5 h-full">
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Eye className="h-5 w-5 text-slate-400" /> Xe đã xem ({selected.viewedCars.length})
                </h3>
                <div className="space-y-4">
                  {selected.viewedCars.map((v) => (
                    <div key={v.vehicleId} className="flex items-center gap-3">
                      <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-slate-100" />
                      <div>
                        <p className="text-xs font-bold text-slate-800">{v.vehicleName}</p>
                        <p className="text-[10px] text-slate-500">Xem {v.viewCount} lần • {v.lastViewed}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="rounded-xl border border-[#1A3C6E]/20 bg-white p-6 shadow-lg">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Reply className="h-5 w-5 text-[#1A3C6E]" /> Phản hồi nhanh
          </h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {QUICK_REPLIES.map((q) => (
              <button
                key={q}
                onClick={() => handleQuickReply(q)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-[#1A3C6E]/5 hover:border-[#1A3C6E]/30 transition-all"
              >
                {q}
              </button>
            ))}
          </div>
          <div className="relative">
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Nhập nội dung phản hồi cho khách hàng..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm focus:ring-[#1A3C6E] focus:border-[#1A3C6E] placeholder:text-slate-400"
              rows={5}
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <button className="p-2 text-slate-400 hover:text-[#1A3C6E] transition-colors">
                <Paperclip className="h-5 w-5" />
              </button>
              <Button onClick={handleSend}>Gửi Phản Hồi</Button>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-4 text-[11px] text-slate-400 italic">
            <span>Tự động gửi SMS thông báo khi phản hồi</span>
            <span>Lưu vào lịch sử chăm sóc</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function StaffConsultationsPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'processing' | 'resolved'>('pending')
  const [selected, setSelected] = useState<MockConsultation | null>(null)
  const [consultations, setConsultations] = useState(mockConsultations)
  const toast = useToastStore()

  const filtered = consultations.filter((c) => c.status === activeTab)
  const pendingCount = consultations.filter((c) => c.status === 'pending').length

  const handleMarkResolved = (c: MockConsultation) => {
    setConsultations((prev) => prev.map((x) => (x.id === c.id ? { ...x, status: 'resolved' as const } : x)))
    setSelected(null)
    toast.addToast('success', 'Đã đánh dấu giải quyết')
  }

  const handleSendReply = () => toast.addToast('success', 'Đã gửi phản hồi')

  return (
    <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <section className={`w-full md:w-[400px] shrink-0 flex flex-col border-r border-slate-200 bg-white ${selected ? 'hidden md:flex' : ''}`}>
        <div className="border-b border-slate-100 p-4">
          <h1 className="text-lg font-bold text-slate-900 mb-4">Danh sách yêu cầu</h1>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {(['pending', 'processing', 'resolved'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap ${
                  activeTab === tab ? 'bg-[#1A3C6E] text-white' : 'bg-slate-100 text-slate-600 hover:border-slate-300'
                }`}
              >
                {tab === 'pending' && `Chưa Phản Hồi (${pendingCount})`}
                {tab === 'processing' && 'Đang Xử Lý'}
                {tab === 'resolved' && 'Đã Giải Quyết'}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filtered.map((c) => (
            <RequestCard key={c.id} c={c} isActive={selected?.id === c.id} onClick={() => setSelected(c)} />
          ))}
        </div>
      </section>
      <section className={`flex flex-1 flex-col overflow-hidden ${!selected ? 'hidden md:flex' : ''}`}>
        {selected ? (
          <DetailPanel selected={selected} onResolved={() => handleMarkResolved(selected)} onSendReply={handleSendReply} onBack={() => setSelected(null)} />
        ) : (
          <div className="flex flex-1 items-center justify-center bg-[#F6F7F8] text-slate-500">
            <p className="font-medium">Chọn một yêu cầu để xem chi tiết</p>
          </div>
        )}
      </section>
    </div>
  )
}
