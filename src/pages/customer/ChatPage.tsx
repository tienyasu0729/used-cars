import { useState } from 'react'
import { ChatLayout } from '@/features/customer/components/ChatLayout'
import { useBranches } from '@/hooks/useBranches'
import { useBranchTeam } from '@/hooks/useBranches'
import { useConversations, useChatMessages, useInvalidateChatConversations } from '@/hooks/useChats'
import { createChatConversation, deleteChatConversation, sendChatMessage } from '@/services/chat.service'
import { useToastStore } from '@/store/toastStore'
import { Button } from '@/components/ui'

export function ChatPage() {
  const [selectedId, setSelectedId] = useState<string | undefined>()
  const [modalOpen, setModalOpen] = useState(false)
  const [branchId, setBranchId] = useState<string | undefined>(undefined)
  const { data: conversations = [], isLoading, refetch } = useConversations()
  const { data: messages = [], refetchMessages } = useChatMessages(selectedId, 5000)
  const invalidateConv = useInvalidateChatConversations()
  const toast = useToastStore()

  const { data: branches } = useBranches()
  const firstBranchId = branches?.[0]?.id
  const effectiveBranch = branchId ?? firstBranchId
  const { data: team = [] } = useBranchTeam(effectiveBranch)

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

  const startChatWith = async (participantUserId: number) => {
    try {
      const cid = await createChatConversation(participantUserId)
      setModalOpen(false)
      setSelectedId(String(cid))
      await refetch()
    } catch {
      toast.addToast('error', 'Không tạo được hội thoại.')
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
        <Button type="button" variant="outline" onClick={() => setModalOpen(true)}>
          Chat mới
        </Button>
      </div>
      <ChatLayout
        conversations={conversations}
        messages={messages}
        selectedId={selectedId}
        onSelectConversation={setSelectedId}
        onSendMessage={handleSendMessage}
        onDeleteConversation={handleDeleteConversation}
      />

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900">Chọn nhân viên tư vấn</h2>
            <p className="mt-1 text-sm text-slate-500">Chọn chi nhánh rồi chọn người để bắt đầu chat.</p>
            <label className="mt-4 block text-sm font-medium text-slate-700">Chi nhánh</label>
            <select
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={effectiveBranch ?? ''}
              onChange={(e) => setBranchId(e.target.value || undefined)}
            >
              {(branches ?? []).map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <ul className="mt-4 space-y-2">
              {team.length === 0 ? (
                <li className="text-sm text-slate-500">Chưa có danh sách nhân sự.</li>
              ) : (
                team.map((m) => (
                  <li key={m.userId}>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-left text-sm hover:bg-slate-50"
                      onClick={() => startChatWith(m.userId)}
                    >
                      <span className="font-medium text-slate-900">{m.name}</span>
                      <span className="text-xs text-slate-500">{m.role}</span>
                    </button>
                  </li>
                ))
              )}
            </ul>
            <Button type="button" variant="ghost" className="mt-6 w-full" onClick={() => setModalOpen(false)}>
              Đóng
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
