import { useMemo, useState, type CSSProperties } from 'react'
import type { ChatConversation, ChatMessage } from '@/types'
import { formatChatSidebarTime } from '@/utils/format'
import { Send, ChevronLeft, ChevronRight } from 'lucide-react'

const NAVY = '#1A3C6E'
const ORANGE = '#E8612A'

interface ChatLayoutProps {
  conversations: ChatConversation[]
  messages: ChatMessage[]
  selectedId: string | undefined
  onSelectConversation: (id: string) => void
  onSendMessage?: (content: string) => void
  /** Sidebar + thread gọn (widget nổi) */
  compact?: boolean
  showListFilter?: boolean
}

export function ChatLayout({
  conversations,
  messages,
  selectedId,
  onSelectConversation,
  onSendMessage,
  compact = false,
  showListFilter,
}: ChatLayoutProps) {
  const [input, setInput] = useState('')
  const [search, setSearch] = useState('')
  const [listFilter, setListFilter] = useState<'all' | 'unread'>('all')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const filterBar = showListFilter ?? compact
  const selected = conversations.find((c) => c.id === selectedId)

  const filteredConversations = useMemo(() => {
    let list = conversations
    const q = search.trim().toLowerCase()
    if (q) list = list.filter((c) => c.participantName.toLowerCase().includes(q))
    if (listFilter === 'unread') list = list.filter((c) => c.unreadCount > 0)
    return list
  }, [conversations, search, listFilter])

  const handleSend = () => {
    if (input.trim() && onSendMessage) {
      onSendMessage(input.trim())
      setInput('')
    }
  }

  const outerClass = compact
    ? 'flex h-full min-h-0 flex-1 overflow-hidden bg-white'
    : 'flex min-h-[calc(100vh-12rem)] overflow-hidden rounded-xl border border-slate-200 bg-white'

  const sidebarWidth = sidebarCollapsed
    ? (compact ? '44px' : '56px')
    : (compact ? '188px' : '288px')

  return (
    <div className={outerClass}>

      {/* ══ SIDEBAR ══ */}
      <div
        className="group/sidebar relative flex shrink-0 flex-col transition-all duration-300 ease-in-out"
        style={{ width: sidebarWidth }}
      >
        {/* Content area — clipped */}
        <div className="flex h-full flex-col overflow-hidden border-r border-slate-200">

          {/* Search + filter */}
          <div
            className="shrink-0 overflow-hidden border-b border-slate-200 transition-all duration-300"
            style={{
              opacity: sidebarCollapsed ? 0 : 1,
              maxHeight: sidebarCollapsed ? '0px' : '120px',
              padding: sidebarCollapsed ? '0' : compact ? '0.5rem' : '0.75rem',
            }}
          >
            <div className={compact ? 'space-y-2' : ''}>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={compact ? 'Tìm theo tên' : 'Tìm hội thoại...'}
                className="w-full rounded-lg border px-2 py-1.5 text-xs focus:outline-none focus:ring-1"
                style={{ borderColor: 'rgba(26,60,110,0.2)' } as CSSProperties}
              />
              {filterBar && (
                <select
                  value={listFilter}
                  onChange={(e) => setListFilter(e.target.value as 'all' | 'unread')}
                  className="w-full rounded-lg border bg-white px-2 py-1.5 text-xs text-slate-700 focus:outline-none"
                  style={{ borderColor: 'rgba(26,60,110,0.2)' }}
                >
                  <option value="all">Tất cả</option>
                  <option value="unread">Chưa đọc</option>
                </select>
              )}
            </div>
          </div>

          {/* Conversation list */}
          <div className="min-h-0 flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <p className="p-3 text-center text-xs text-slate-500">
                {!sidebarCollapsed && (conversations.length === 0 ? 'Chưa có hội thoại' : 'Không khớp')}
              </p>
            ) : (
              filteredConversations.map((c) => {
                const isSelected = selectedId === c.id
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onSelectConversation(c.id)}
                    title={sidebarCollapsed ? c.participantName : undefined}
                    className="flex w-full items-center border-b border-slate-100 text-left transition-colors hover:bg-slate-50"
                    style={{
                      gap: sidebarCollapsed ? '0' : compact ? '0.5rem' : '0.75rem',
                      padding: sidebarCollapsed ? '0.5rem 0' : compact ? '0.625rem' : '1rem',
                      justifyContent: sidebarCollapsed ? 'center' : undefined,
                      background: isSelected ? 'rgba(26,60,110,0.06)' : undefined,
                    }}
                  >
                    {/* Avatar */}
                    <div
                      className="relative shrink-0 flex items-center justify-center rounded-full font-medium"
                      style={{
                        width: compact ? '2.25rem' : '2.5rem',
                        height: compact ? '2.25rem' : '2.5rem',
                        fontSize: compact ? '0.875rem' : '1rem',
                        background: isSelected ? NAVY : 'rgba(26,60,110,0.1)',
                        color: isSelected ? '#fff' : NAVY,
                      }}
                    >
                      {c.participantName[0]?.toUpperCase() ?? '?'}
                      {/* Unread badge on avatar when collapsed */}
                      {sidebarCollapsed && c.unreadCount > 0 && (
                        <span
                          className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full text-[8px] font-bold text-white"
                          style={{ background: ORANGE }}
                        >
                          {c.unreadCount > 9 ? '9+' : c.unreadCount}
                        </span>
                      )}
                    </div>

                    {/* Text info — hidden when collapsed */}
                    {!sidebarCollapsed && (
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-1">
                          <p className="truncate text-xs font-semibold text-slate-900">{c.participantName}</p>
                          {compact && (
                            <span className="shrink-0 text-[10px] leading-tight text-slate-400">
                              {formatChatSidebarTime(c.lastMessageAt)}
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 flex items-end justify-between gap-1">
                          <p className="truncate text-[11px] text-slate-500">{c.lastMessage || '—'}</p>
                          {c.unreadCount > 0 && (
                            <span
                              className="shrink-0 rounded-full font-medium text-white"
                              style={{
                                background: ORANGE,
                                fontSize: '10px',
                                lineHeight: '1rem',
                                minWidth: '1.125rem',
                                padding: '0 0.25rem',
                              }}
                            >
                              {c.unreadCount > 99 ? '99+' : c.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* ── Divider handle toggle — elegant, hover-only ── */}
        <button
          type="button"
          onClick={() => setSidebarCollapsed((v) => !v)}
          title={sidebarCollapsed ? 'Mở rộng danh sách' : 'Thu hẹp danh sách'}
          aria-label={sidebarCollapsed ? 'Mở rộng' : 'Thu hẹp'}
          className="absolute -right-2.5 top-1/2 z-20 flex h-10 w-5 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white opacity-0 shadow-sm transition-all duration-200 group-hover/sidebar:opacity-100 hover:scale-110 hover:border-slate-300 hover:shadow-md"
        >
          {sidebarCollapsed
            ? <ChevronRight className="h-3 w-3 text-slate-400" />
            : <ChevronLeft className="h-3 w-3 text-slate-400" />
          }
        </button>
      </div>

      {/* ══ MAIN CHAT AREA ══ */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {selected ? (
          <>
            {/* Conversation header */}
            <div
              className="flex shrink-0 items-center gap-3 border-b border-slate-200"
              style={{ padding: compact ? '0.5rem 0.75rem' : '1rem' }}
            >
              <div
                className="flex shrink-0 items-center justify-center rounded-full font-medium"
                style={{
                  width: compact ? '2.25rem' : '2.5rem',
                  height: compact ? '2.25rem' : '2.5rem',
                  fontSize: compact ? '0.875rem' : '1rem',
                  background: 'rgba(26,60,110,0.1)',
                  color: NAVY,
                }}
              >
                {selected.participantName[0]?.toUpperCase() ?? '?'}
              </div>
              <div className="min-w-0">
                <p className={`font-semibold text-slate-900 ${compact ? 'text-sm' : ''}`}>
                  {selected.participantName}
                </p>
                <p className="text-xs text-slate-400">{selected.participantRole}</p>
              </div>
            </div>

            {/* Messages */}
            <div
              className="min-h-0 flex-1 space-y-3 overflow-y-auto"
              style={{ padding: compact ? '0.75rem' : '1rem', background: '#f8f9fc' }}
            >
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.senderType === 'self' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className="max-w-[85%] rounded-2xl text-sm"
                    style={{
                      padding: compact ? '0.5rem 0.75rem' : '0.5rem 1rem',
                      ...(m.senderType === 'self'
                        ? { background: NAVY, color: '#fff', borderBottomRightRadius: '0.25rem' }
                        : { background: '#e8edf5', color: '#1e293b', borderBottomLeftRadius: '0.25rem' }),
                    }}
                  >
                    <p>{m.content}</p>
                    <p className="mt-1 text-[10px] opacity-60">
                      {new Date(m.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input bar */}
            <div
              className="flex shrink-0 gap-2 border-t border-slate-200"
              style={{ padding: compact ? '0.5rem' : '1rem' }}
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Nhập tin nhắn..."
                className="flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: 'rgba(26,60,110,0.15)' } as CSSProperties}
              />
              <button
                type="button"
                onClick={handleSend}
                className="flex shrink-0 items-center justify-center rounded-lg text-white transition-opacity hover:opacity-80"
                style={{
                  background: NAVY,
                  width: compact ? '2.25rem' : '2.5rem',
                  height: compact ? '2.25rem' : '2.5rem',
                }}
              >
                <Send className={compact ? 'h-4 w-4' : 'h-5 w-5'} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center px-4 text-center text-sm text-slate-400">
            {compact ? 'Chọn cuộc trò chuyện' : 'Chọn một hội thoại để xem'}
          </div>
        )}
      </div>
    </div>
  )
}
