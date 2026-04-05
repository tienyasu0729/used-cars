import { useState } from 'react'
import { Search, Plus, Image, Smile, Send, UserPlus, Star } from 'lucide-react'
import type { ChatConversation, ChatMessage } from '@/types'

interface StaffChatLayoutProps {
  conversations: ChatConversation[]
  messages: ChatMessage[]
  selectedId: string | undefined
  onSelectConversation: (id: string) => void
  onSendMessage?: (content: string) => void
}

function formatMessageTime(s: string) {
  const d = new Date(s)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 86400000) return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  if (diff < 172800000) return 'Hôm qua'
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
}

export function StaffChatLayout({
  conversations,
  messages,
  selectedId,
  onSelectConversation,
  onSendMessage,
}: StaffChatLayoutProps) {
  const [input, setInput] = useState('')
  const [filter, setFilter] = useState<'all' | 'unread' | 'received'>('all')
  const [search, setSearch] = useState('')
  const selected = conversations.find((c) => c.id === selectedId)

  const filtered = conversations.filter((c) => {
    if (search && !c.participantName.toLowerCase().includes(search.toLowerCase())) return false
    if (filter === 'unread' && c.unreadCount === 0) return false
    return true
  })

  const handleSend = () => {
    if (input.trim() && onSendMessage) {
      onSendMessage(input.trim())
      setInput('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const today = new Date().toLocaleDateString('vi-VN')
  const groupedMessages = messages.reduce<{ date: string; items: ChatMessage[] }[]>((acc, m) => {
    const date = new Date(m.createdAt).toLocaleDateString('vi-VN')
    const label = date === today ? 'Hôm nay' : date
    const last = acc[acc.length - 1]
    if (last?.date === label) {
      last.items.push(m)
    } else {
      acc.push({ date: label, items: [m] })
    }
    return acc
  }, [])

  return (
    <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex w-80 flex-shrink-0 flex-col border-r border-slate-200">
        <div className="border-b border-slate-200 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm hội thoại..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm focus:border-[#1A3C6E] focus:outline-none"
            />
          </div>
          <div className="mt-3 flex gap-1">
            {(['all', 'unread', 'received'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                  filter === f ? 'bg-[#1A3C6E] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f === 'all' ? 'Tất cả' : f === 'unread' ? 'Chưa đọc' : 'Tiếp nhận'}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelectConversation(c.id)}
              className={`flex w-full items-start gap-3 border-b border-slate-100 p-4 text-left transition-colors hover:bg-slate-50 ${
                selectedId === c.id ? 'bg-blue-50' : ''
              }`}
            >
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-sm font-semibold text-slate-600">
                {c.participantAvatar ? (
                  <img src={c.participantAvatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  c.participantName.slice(0, 2).toUpperCase()
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-semibold text-slate-900">{c.participantName}</p>
                  {c.isNewCustomer && (
                    <span className="shrink-0 rounded bg-[#E8612A]/20 px-1.5 py-0.5 text-[10px] font-bold text-[#E8612A]">
                      KHÁCH HÀNG MỚI
                    </span>
                  )}
                </div>
                {c.vehicleInfo && (
                  <p className="truncate text-xs text-slate-500">{c.vehicleInfo}</p>
                )}
                <p className="mt-0.5 line-clamp-2 text-xs text-slate-600">{c.lastMessage}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="text-xs text-slate-400">{formatMessageTime(c.lastMessageAt)}</span>
                {c.unreadCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1A3C6E] text-[10px] font-bold text-white">
                    {c.unreadCount}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-1 flex-col">
        {selected ? (
          <>
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-sm font-semibold text-slate-600">
                    {selected.participantName.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900">{selected.participantName}</p>
                    {selected.isNewCustomer && (
                      <span className="rounded bg-[#E8612A]/20 px-2 py-0.5 text-xs font-bold text-[#E8612A]">
                        KHÁCH HÀNG MỚI
                      </span>
                    )}
                  </div>
                  {selected.vehicleInfo && selected.vehiclePrice && (
                    <p className="text-sm text-slate-500">
                      Đang hỏi về: {selected.vehicleInfo} - {selected.vehiclePrice}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  <UserPlus className="h-4 w-4" />
                  Giao cho đồng nghiệp
                </button>
                <button className="flex items-center gap-2 rounded-lg bg-[#1A3C6E] px-4 py-2 text-sm font-medium text-white hover:bg-[#152d52]">
                  <Star className="h-4 w-4" />
                  Tiếp nhận ngay
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6">
              {groupedMessages.map((group) => (
                <div key={group.date} className="mb-6">
                  <p className="mb-4 text-center text-xs font-medium text-slate-400">{group.date}</p>
                  <div className="space-y-4">
                    {group.items.map((m) => (
                      <div
                        key={m.id}
                        className={`flex ${m.senderType === 'self' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex max-w-[75%] gap-2 ${m.senderType === 'self' ? 'flex-row-reverse' : ''}`}>
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-300 text-xs font-medium text-slate-600">
                            {m.senderType === 'self' ? 'NV' : selected?.participantName.slice(0, 2).toUpperCase()}
                          </div>
                          <div
                            className={`rounded-2xl px-4 py-2.5 ${
                              m.senderType === 'self'
                                ? 'rounded-tr-sm bg-[#1A3C6E] text-white'
                                : 'rounded-tl-sm bg-slate-200 text-slate-900'
                            }`}
                          >
                            <p className="text-sm leading-relaxed">{m.content}</p>
                            <p className={`mt-1 text-[10px] ${m.senderType === 'self' ? 'text-blue-200' : 'text-slate-500'}`}>
                              {new Date(m.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                              {m.senderType === 'self' && ' • Đã xem'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-200 bg-white p-4">
              <div className="flex items-end gap-2">
                <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
                  <Plus className="h-5 w-5" />
                </button>
                <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
                  <Image className="h-5 w-5" />
                </button>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Nhập tin nhắn của bạn..."
                  rows={2}
                  className="min-h-[44px] flex-1 resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-[#1A3C6E] focus:outline-none"
                />
                <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
                  <Smile className="h-5 w-5" />
                </button>
                <button
                  onClick={handleSend}
                  className="rounded-full bg-[#1A3C6E] p-3 text-white hover:bg-[#152d52]"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
              <p className="mt-2 text-center text-[10px] text-slate-400">
                Enter để gửi • Shift + Enter xuống dòng
              </p>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center bg-slate-50/50 text-slate-500">
            <p className="font-medium">Chọn một hội thoại để xem</p>
            <p className="mt-1 text-sm">Danh sách khách hàng đang chờ tư vấn</p>
          </div>
        )}
      </div>
    </div>
  )
}
