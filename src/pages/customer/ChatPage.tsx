import { useEffect, useRef, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { ChatLayout } from '@/features/customer/components/ChatLayout'
import { useConversations, useChatMessages, useInvalidateChatConversations } from '@/hooks/useChats'
import { deleteChatConversation, sendChatMessage } from '@/services/chat.service'
import { useToastStore } from '@/store/toastStore'
import { buildVehicleAttachmentMessagePayload, VEHICLE_ATTACHMENT_MESSAGE_TYPE } from '@/utils/chatAttachment'

export function ChatPage() {
  type ConsultVehicleDraft = {
    vehicleId: number
    title: string
    priceText?: string
    imageUrl?: string
  }

  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation() as { state?: { chatParticipantName?: string; consultVehicle?: ConsultVehicleDraft } }
  const [selectedId, setSelectedId] = useState<string | undefined>(() => searchParams.get('cid') ?? undefined)
  const [attachedVehicle, setAttachedVehicle] = useState<ConsultVehicleDraft | null>(
    location.state?.consultVehicle ?? null,
  )
  const pendingCid = useRef<string | null>(searchParams.get('cid'))
  const pendingListRefetchCount = useRef(0)
  const { data: conversations = [], isLoading, refetch } = useConversations()
  const { data: messages = [], refetchMessages } = useChatMessages(selectedId, 5000)
  const invalidateConv = useInvalidateChatConversations()
  const toast = useToastStore()

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

  const handleSendMessage = async (content: string) => {
    if (!selectedId) return
    const cid = parseInt(selectedId, 10)
    if (!Number.isFinite(cid)) return
    const payload = attachedVehicle
      ? `Xe đính kèm: ${attachedVehicle.title} (Mã: ${attachedVehicle.vehicleId})\n${attachedVehicle.priceText ? `Giá: ${attachedVehicle.priceText}\n` : ''}\nNội dung: ${content}`
      : content
    try {
      if (attachedVehicle) {
        await sendChatMessage(
          cid,
          buildVehicleAttachmentMessagePayload(attachedVehicle, content),
          VEHICLE_ATTACHMENT_MESSAGE_TYPE,
        )
      } else {
        await sendChatMessage(cid, payload, 'text')
      }
      await refetchMessages()
      await invalidateConv()
      await refetch()
      if (attachedVehicle) {
        setAttachedVehicle(null)
      }
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
      <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center rounded-xl border border-slate-200 bg-white">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#1A3C6E] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Chat</h1>
          <p className="mt-1 text-slate-500">Trao đổi với tư vấn viên showroom</p>
        </div>
      </div>
      <ChatLayout
        conversations={conversations}
        messages={messages}
        selectedId={selectedId}
        onSelectConversation={setSelectedId}
        onSendMessage={handleSendMessage}
        onDeleteConversation={handleDeleteConversation}
        composerAttachment={
          attachedVehicle
            ? {
                vehicleId: attachedVehicle.vehicleId,
                title: attachedVehicle.title,
                price: attachedVehicle.priceText,
                imageUrl: attachedVehicle.imageUrl,
                onClear: () => setAttachedVehicle(null),
              }
            : null
        }
      />
    </div>
  )
}
