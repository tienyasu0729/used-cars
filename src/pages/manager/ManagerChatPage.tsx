import { useState, useEffect, useRef, useMemo } from 'react'
import { useSearchParams, useLocation } from 'react-router-dom'
import { StaffChatLayout } from '@/features/staff/components/StaffChatLayout'
import { useStaffConversations, useChatMessages, useInvalidateChatConversations } from '@/hooks/useChats'
import { deleteChatConversation, sendChatMessage } from '@/services/chat.service'
import { useToastStore } from '@/store/toastStore'
import { getChatParticipantName } from '@/utils/chatParticipantStorage'

// Trang chat của Manager — dùng chung API /api/v1/chat/conversations (endpoint không phân tách role)
// Manager thấy toàn bộ hội thoại thuộc chi nhánh mình thông qua backend filter
// Hỗ trợ query param ?cid=<conversationId> để mở thẳng cuộc trò chuyện
export function ManagerChatPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation() as { state?: { chatParticipantName?: string } }
  const [selectedId, setSelectedId] = useState<string | undefined>(() => searchParams.get('cid') ?? undefined)
  const participantFallbackName = useMemo(() => {
    const fromState =
      typeof location.state?.chatParticipantName === 'string'
        ? location.state.chatParticipantName
        : undefined
    const fromStorage = getChatParticipantName(selectedId)
    return fromStorage ?? fromState
  }, [location.state, selectedId])
  const pendingCid = useRef<string | null>(searchParams.get('cid'))
  const pendingListRefetchCount = useRef(0)
  const { data: conversations = [], isLoading, refetch } = useStaffConversations()

  // Khi URL có ?cid=xxx → chọn conversation đó, refetch list mới nhất, rồi xóa param
  useEffect(() => {
    const cid = searchParams.get('cid')
    if (cid) {
      pendingCid.current = cid
      setSelectedId(cid)
      refetch().then(() => {
        setSearchParams({}, { replace: true, state: location.state })
      })
    }
  }, [searchParams, setSearchParams, refetch, location.state])

  // Sau khi conversations load xong, nếu vẫn còn cid đang chờ → đảm bảo nó được chọn
  useEffect(() => {
    if (pendingCid.current && conversations.length > 0) {
      const found = conversations.some((c) => c.id === pendingCid.current)
      if (found) {
        setSelectedId(pendingCid.current)
        pendingCid.current = null
        pendingListRefetchCount.current = 0
      } else if (!isLoading && pendingListRefetchCount.current < 2) {
        pendingListRefetchCount.current += 1
        void refetch()
      }
    }
  }, [conversations, isLoading, refetch])

  const {
    data: messages = [],
    refetchMessages,
    isLoading: messagesLoading,
    isFetched: messagesFetched,
  } = useChatMessages(selectedId, 5000)
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

  const handleDeleteConversation = async (id: string) => {
    const cid = parseInt(id, 10)
    if (!Number.isFinite(cid)) return
    try {
      await deleteChatConversation(cid)
      if (selectedId === id) setSelectedId(undefined)
      await refetch()
    } catch {
      toast.addToast('error', 'Không xóa được hội thoại.')
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
        messagesLoading={messagesLoading}
        messagesFetched={messagesFetched}
        participantFallbackName={participantFallbackName}
        selectedId={selectedId}
        onSelectConversation={setSelectedId}
        onSendMessage={handleSendMessage}
        onDeleteConversation={handleDeleteConversation}
        onTransferSuccess={() => setSelectedId(undefined)}
      />
    </div>
  )
}
