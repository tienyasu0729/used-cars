import { useState } from 'react'
import type { ChatConversation, ChatMessage } from '@/types'
import { Send } from 'lucide-react'

interface ChatLayoutProps {
  conversations: ChatConversation[]
  messages: ChatMessage[]
  selectedId: string | undefined
  onSelectConversation: (id: string) => void
  onSendMessage?: (content: string) => void
}

export function ChatLayout({
  conversations,
  messages,
  selectedId,
  onSelectConversation,
  onSendMessage,
}: ChatLayoutProps) {
  const [input, setInput] = useState('')
  const selected = conversations.find((c) => c.id === selectedId)

  const handleSend = () => {
    if (input.trim() && onSendMessage) {
      onSendMessage(input.trim())
      setInput('')
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-12rem)] overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex w-72 flex-shrink-0 flex-col border-r border-slate-200">
        <div className="border-b border-slate-200 p-3">
          <input
            type="text"
            placeholder="Tìm hội thoại..."
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#1A3C6E] focus:outline-none"
          />
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto">
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelectConversation(c.id)}
              className={`flex w-full items-center gap-3 border-b border-slate-100 p-4 text-left transition-colors hover:bg-slate-50 ${
                selectedId === c.id ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1A3C6E]/10 text-[#1A3C6E]">
                {c.participantName[0]}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-slate-900">{c.participantName}</p>
                <p className="truncate text-xs text-slate-500">{c.lastMessage}</p>
              </div>
              {c.unreadCount > 0 && (
                <span className="rounded-full bg-[#E8612A] px-2 py-0.5 text-xs text-white">
                  {c.unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-1 flex-col">
        {selected ? (
          <>
            <div className="flex items-center gap-3 border-b border-slate-200 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1A3C6E]/10 text-[#1A3C6E]">
                {selected.participantName[0]}
              </div>
              <div>
                <p className="font-semibold text-slate-900">{selected.participantName}</p>
                <p className="text-xs text-slate-500">{selected.participantRole}</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.senderType === 'self' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      m.senderType === 'self'
                        ? 'rounded-tr-sm bg-[#1A3C6E] text-white'
                        : 'rounded-tl-sm bg-slate-100 text-slate-900'
                    }`}
                  >
                    <p className="text-sm">{m.content}</p>
                    <p className="mt-1 text-[10px] opacity-70">
                      {new Date(m.createdAt).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 border-t border-slate-200 p-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Nhập tin nhắn..."
                className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-[#1A3C6E] focus:outline-none"
              />
              <button
                onClick={handleSend}
                className="rounded-lg bg-[#1A3C6E] p-2 text-white hover:bg-blue-800"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-slate-500">
            Chọn một hội thoại để xem
          </div>
        )}
      </div>
    </div>
  )
}
