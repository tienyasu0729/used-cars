import { useState } from 'react'
import { StaffChatLayout } from '@/features/staff/components/StaffChatLayout'
import { useStaffConversations } from '@/hooks/useChats'
import { useChatMessages } from '@/hooks/useChats'
import type { ChatMessage } from '@/types'

export function StaffChatPage() {
  const [selectedId, setSelectedId] = useState<string | undefined>()
  const [localMessages, setLocalMessages] = useState<Record<string, ChatMessage[]>>({})
  const { data: conversations, isLoading } = useStaffConversations()
  const { data: messages = [] } = useChatMessages(selectedId)

  const mergedMessages = selectedId
    ? [...messages, ...(localMessages[selectedId] ?? [])].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
    : []

  const handleSendMessage = (content: string) => {
    if (!selectedId) return
    const newMsg: ChatMessage = {
      id: `m_${Date.now()}`,
      conversationId: selectedId,
      senderId: 'staff',
      senderType: 'staff',
      content,
      createdAt: new Date().toISOString(),
    }
    setLocalMessages((prev) => ({
      ...prev,
      [selectedId]: [...(prev[selectedId] ?? []), newMsg],
    }))
  }

  if (isLoading) {
    return (
      <div className="flex h-[600px] items-center justify-center rounded-xl border border-slate-200 bg-white">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#1A3C6E] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="h-full">
      <StaffChatLayout
        conversations={conversations ?? []}
        messages={mergedMessages}
        selectedId={selectedId}
        onSelectConversation={setSelectedId}
        onSendMessage={handleSendMessage}
      />
    </div>
  )
}
