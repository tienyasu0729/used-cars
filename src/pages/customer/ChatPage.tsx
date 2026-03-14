import { useState } from 'react'
import { ChatLayout } from '@/features/customer/components/ChatLayout'
import { useConversations } from '@/hooks/useChats'
import { useChatMessages } from '@/hooks/useChats'

export function ChatPage() {
  const [selectedId, setSelectedId] = useState<string | undefined>()
  const { data: conversations, isLoading } = useConversations()
  const { data: messages } = useChatMessages(selectedId)

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center rounded-xl border border-slate-200 bg-white">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#1A3C6E] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Chat</h1>
        <p className="mt-1 text-slate-500">Lịch sử chat với nhân viên tư vấn</p>
      </div>
      <ChatLayout
        conversations={conversations ?? []}
        messages={messages ?? []}
        selectedId={selectedId}
        onSelectConversation={setSelectedId}
      />
    </div>
  )
}
