import { useState } from 'react'
import { StaffChatLayout } from '@/features/staff/components/StaffChatLayout'
import { useStaffConversations, useChatMessages, useInvalidateChatConversations } from '@/hooks/useChats'
import { sendChatMessage } from '@/services/chat.service'
import { useToastStore } from '@/store/toastStore'

// Trang chat của Manager — dùng chung API /api/v1/chat/conversations (endpoint không phân tách role)
// Manager thấy toàn bộ hội thoại thuộc chi nhánh mình thông qua backend filter
export function ManagerChatPage() {
  const [selectedId, setSelectedId] = useState<string | undefined>()
  const { data: conversations = [], isLoading, refetch } = useStaffConversations()
  const { data: messages = [], refetchMessages } = useChatMessages(selectedId, 5000)
  const invalidateConv = useInvalidateChatConversations()
  const toast = useToastStore()

  const handleSendMessage = async (content: string) => {
    if (!selectedId) return
    const cid = parseInt(selectedId, 10)
    if (!Number.isFinite(cid)) return
    try {
      await sendChatMessage(cid, content)
      await refetchMessages()
      await invalidateConv()
      await refetch()
    } catch {
      toast.addToast('error', 'Không gửi được tin nhắn.')
    }
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
        conversations={conversations}
        messages={messages}
        selectedId={selectedId}
        onSelectConversation={setSelectedId}
        onSendMessage={handleSendMessage}
        onTransferSuccess={() => setSelectedId(undefined)}
      />
    </div>
  )
}
