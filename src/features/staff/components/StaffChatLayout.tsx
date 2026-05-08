import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Search, Plus, Image, Smile, Send, UserPlus, Star, X, Trash2 } from 'lucide-react'
import type { ChatConversation, ChatMessage } from '@/types'
import {
  TRANSFER_GROUP_OTHER_BRANCH_MANAGER,
  TRANSFER_GROUP_SAME_BRANCH_SALES,
  fetchTransferCandidates,
  transferChatConversation,
  type ChatTransferCandidate,
} from '@/services/chat.service'
import { respondToConsultation } from '@/services/consultation.service'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'
import { resolveUploadPublicUrl } from '@/utils/mediaUrl'

interface StaffChatLayoutProps {
  conversations: ChatConversation[]
  messages: ChatMessage[]
  messagesLoading?: boolean
  messagesFetched?: boolean
  participantFallbackName?: string
  selectedId: string | undefined
  onSelectConversation: (id: string) => void
  onSendMessage?: (content: string) => void
  onDeleteConversation?: (id: string) => void
  onTransferSuccess?: () => void
}

function formatMessageTime(s: string) {
  const d = new Date(s)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 86400000) return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  if (diff < 172800000) return 'Hôm qua'
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
}

function roleKey(role: string | undefined | null): string {
  return String(role ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
}

function AvatarCircle({
  name,
  avatarUrl,
  className,
}: {
  name?: string | null
  avatarUrl?: string | null
  className?: string
}) {
  const src = resolveUploadPublicUrl(avatarUrl ?? undefined)

  return (
    <div className={className}>
      {src ? (
        <img src={src} alt={name ?? 'Avatar người dùng'} className="h-full w-full object-cover" />
      ) : (
        (name?.slice(0, 2).toUpperCase() || 'U')
      )}
    </div>
  )
}

export function StaffChatLayout({
  conversations,
  messages,
  messagesLoading = false,
  messagesFetched = false,
  participantFallbackName,
  selectedId,
  onSelectConversation,
  onSendMessage,
  onDeleteConversation,
  onTransferSuccess,
}: StaffChatLayoutProps) {
  const [input, setInput] = useState('')
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [search, setSearch] = useState('')
  const [transferOpen, setTransferOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const qc = useQueryClient()
  const toast = useToastStore()
  const user = useAuthStore((s) => s.user)

  const selected = conversations.find((c) => c.id === selectedId)
  const displayName =
    participantFallbackName?.trim() ||
    selected?.participantName?.trim() ||
    'Khách hàng'
  const showConversationPanel = Boolean(
    selectedId &&
      (selected != null ||
        messages.length > 0 ||
        messagesLoading ||
        messagesFetched),
  )
  const convNumeric = selectedId ? parseInt(selectedId, 10) : NaN

  const transferCandidatesQuery = useQuery({
    queryKey: ['chat', 'transfer-candidates', convNumeric],
    queryFn: () => fetchTransferCandidates(convNumeric),
    enabled: transferOpen && Number.isFinite(convNumeric) && roleKey(user?.role) === 'branchmanager',
  })

  const canClaimConsultation =
    selected != null &&
    typeof selected.consultationId === 'number' &&
    Number.isFinite(selected.consultationId) &&
    String(selected.consultationStatus ?? '').toLowerCase() === 'pending'

  const claimConsultationMutation = useMutation({
    mutationFn: async () => {
      const id = selected?.consultationId
      if (id == null || !Number.isFinite(id)) throw new Error('Không có phiếu tư vấn để tiếp nhận.')
      await respondToConsultation(id)
    },
    onSuccess: async () => {
      toast.addToast('success', 'Bạn đã tiếp nhận phiếu tư vấn. Khách hàng sẽ nhận thông báo.')
      await qc.invalidateQueries({ queryKey: ['chat', 'conversations'] })
      if (selectedId) {
        await qc.invalidateQueries({ queryKey: ['chat', 'messages', selectedId] })
      }
    },
    onError: (err: unknown) => {
      const m =
        err && typeof err === 'object' && 'message' in err ? String((err as { message: string }).message) : ''
      toast.addToast(
        'error',
        m || 'Không tiếp nhận được (phiếu đã được NV khác lấy hoặc không còn ở trạng thái chờ).',
      )
    },
  })

  const transferMutation = useMutation({
    mutationFn: (targetUserId: number) => transferChatConversation(convNumeric, targetUserId),
    onSuccess: async () => {
      toast.addToast('success', 'Đã chuyển cuộc trò chuyện cho đồng nghiệp.')
      setTransferOpen(false)
      // Sau chuyển giao, user hiện tại bị xóa khỏi participant — invalidate messages sẽ gọi GET và nhận 403.
      const convIdStr = selectedId
      onTransferSuccess?.()
      await qc.invalidateQueries({ queryKey: ['chat', 'conversations'] })
      if (convIdStr) {
        qc.removeQueries({ queryKey: ['chat', 'messages', convIdStr] })
      }
    },
    onError: () => {
      toast.addToast('error', 'Không chuyển giao được. Kiểm tra quyền hoặc thử lại.')
    },
  })

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

  const isManager = roleKey(user?.role) === 'branchmanager'
  const transferIntro =
    'Chỉ quản lý chi nhánh chuyển giao được: tới tư vấn viên cùng cửa hàng hoặc tới quản lý một chi nhánh khác (không chuyển từ NV lên QL).'

  const transferLists = useMemo(() => {
    const data = transferCandidatesQuery.data ?? []
    const otherManagers = data.filter((c) => c.transferGroup === TRANSFER_GROUP_OTHER_BRANCH_MANAGER)
    const sameBranchSales = data.filter(
      (c) => c.transferGroup === TRANSFER_GROUP_SAME_BRANCH_SALES || c.transferGroup == null,
    )
    return { sameBranchSales, otherManagers }
  }, [transferCandidatesQuery.data])

  const renderTransferRow = (c: ChatTransferCandidate) => (
    <li key={c.userId}>
      <button
        type="button"
        disabled={transferMutation.isPending}
        onClick={() => transferMutation.mutate(c.userId)}
        className="flex w-full flex-col items-start rounded-xl border border-slate-100 px-3 py-2.5 text-left text-sm transition-colors hover:bg-slate-50 disabled:opacity-50"
      >
        <span className="font-semibold text-slate-900">{c.name}</span>
        <span className="text-xs text-slate-500">{c.roleLabel}</span>
      </button>
    </li>
  )

  return (
    <div className="relative flex h-[calc(100vh-8rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
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
            {(['all', 'unread'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                  filter === f ? 'bg-[#1A3C6E] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f === 'all' ? 'Tất cả' : 'Chưa đọc'}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.map((c) => (
            <div
              key={c.id}
              className={`group/conv relative flex w-full items-start border-b border-slate-100 transition-colors hover:bg-slate-50 ${
                selectedId === c.id ? 'bg-blue-50' : ''
              }`}
            >
              <button
                type="button"
                onClick={() => onSelectConversation(c.id)}
                className="flex min-w-0 flex-1 items-start gap-3 p-4 text-left"
              >
                <AvatarCircle
                  name={c.participantName}
                  avatarUrl={c.participantAvatar}
                  className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-sm font-semibold text-slate-600"
                />
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
              {onDeleteConversation && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setDeleteTarget({ id: c.id, name: c.participantName })
                  }}
                  title="Xóa hội thoại"
                  className="mr-2 mt-4 shrink-0 rounded p-1.5 text-slate-400 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-500 group-hover/conv:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-1 flex-col">
        {showConversationPanel ? (
          <>
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <AvatarCircle
                    name={displayName}
                    avatarUrl={selected?.participantAvatar}
                    className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-sm font-semibold text-slate-600"
                  />
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900">{displayName}</p>
                    {selected?.isNewCustomer && (
                      <span className="rounded bg-[#E8612A]/20 px-2 py-0.5 text-xs font-bold text-[#E8612A]">
                        KHÁCH HÀNG MỚI
                      </span>
                    )}
                  </div>
                  {selected?.vehicleInfo && selected?.vehiclePrice && (
                    <p className="text-sm text-slate-500">
                      Đang hỏi về: {selected?.vehicleInfo} - {selected?.vehiclePrice}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {isManager && selected && (
                  <button
                    type="button"
                    onClick={() => setTransferOpen(true)}
                    className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <UserPlus className="h-4 w-4" />
                    Giao cho đồng nghiệp
                  </button>
                )}
                {canClaimConsultation && (
                  <button
                    type="button"
                    disabled={claimConsultationMutation.isPending || transferMutation.isPending}
                    onClick={() => claimConsultationMutation.mutate()}
                    className="flex items-center gap-2 rounded-lg bg-[#1A3C6E] px-4 py-2 text-sm font-medium text-white hover:bg-[#152d52] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Star className="h-4 w-4" />
                    {claimConsultationMutation.isPending ? 'Đang xử lý…' : 'Tiếp nhận ngay'}
                  </button>
                )}
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
                          <AvatarCircle
                            name={m.senderType === 'self' ? user?.name : displayName}
                            avatarUrl={m.senderType === 'self' ? user?.avatarUrl : selected?.participantAvatar}
                            className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-300 text-xs font-medium text-slate-600"
                          />
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
        ) : selectedId ? (
          <div className="flex flex-1 flex-col items-center justify-center bg-slate-50/50 text-slate-500">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#1A3C6E] border-t-transparent" />
            <p className="mt-3 font-medium">Đang tải cuộc trò chuyện…</p>
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center bg-slate-50/50 text-slate-500">
            <p className="font-medium">Chọn một hội thoại để xem</p>
            <p className="mt-1 text-sm">Danh sách khách hàng đang chờ tư vấn</p>
          </div>
        )}
      </div>

      {transferOpen && isManager && selected && Number.isFinite(convNumeric) && (
        <div
          className="absolute inset-0 z-30 flex items-center justify-center p-4"
          style={{ background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)' }}
        >
          <div className="max-h-[min(480px,80vh)] w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <div>
                <h2 className="text-sm font-bold text-[#1A3C6E]">Chọn người nhận chuyển giao</h2>
                <p className="mt-0.5 text-[11px] text-slate-500">{transferIntro}</p>
              </div>
              <button
                type="button"
                onClick={() => setTransferOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="Đóng"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[min(420px,70vh)] overflow-y-auto p-3">
              {transferCandidatesQuery.isLoading ? (
                <p className="py-8 text-center text-sm text-slate-500">Đang tải danh sách…</p>
              ) : transferCandidatesQuery.isError ? (
                <p className="py-6 text-center text-sm text-red-600">
                  Không tải được danh sách. Hội thoại có thể không phải khách hàng hoặc bạn không có quyền.
                </p>
              ) : (transferCandidatesQuery.data?.length ?? 0) === 0 ? (
                <p className="py-6 text-center text-sm text-slate-500">Không có đồng nghiệp khả dụng để chuyển.</p>
              ) : (
                <div className="space-y-5">
                  <section>
                    <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[#1A3C6E]">
                      Tư vấn viên · cùng chi nhánh
                    </h3>
                    {transferLists.sameBranchSales.length === 0 ? (
                      <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                        Không có tư vấn viên khác trong đội.
                      </p>
                    ) : (
                      <ul className="space-y-1">{transferLists.sameBranchSales.map(renderTransferRow)}</ul>
                    )}
                  </section>
                  <section>
                    <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[#1A3C6E]">
                      Quản lý chi nhánh · cửa hàng khác
                    </h3>
                    {transferLists.otherManagers.length === 0 ? (
                      <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-950/90">
                        Hiện không có quản lý chi nhánh nào ở <strong>chi nhánh khác</strong> để chọn (cần ít nhất 2
                        chi nhánh có quản lý active trong hệ thống). Nếu vẫn thiếu sau khi đã tạo chi nhánh thứ hai, hãy
                        kiểm tra user quản lý đã gắn đúng role và trạng thái hoạt động.
                      </p>
                    ) : (
                      <ul className="space-y-1">{transferLists.otherManagers.map(renderTransferRow)}</ul>
                    )}
                  </section>
                </div>
              )}
            </div>
            <div className="border-t border-slate-100 px-3 py-2">
              <button
                type="button"
                className="w-full rounded-lg py-2 text-sm font-medium text-slate-500 hover:bg-slate-50"
                onClick={() => setTransferOpen(false)}
              >
                Huỷ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog xác nhận xóa hội thoại */}
      {onDeleteConversation && (
        <ConfirmDialog
          isOpen={deleteTarget !== null}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => {
            if (deleteTarget) {
              onDeleteConversation(deleteTarget.id)
              setDeleteTarget(null)
            }
          }}
          title="Xóa hội thoại"
          message={
            <>
              Bạn có chắc muốn xóa hội thoại với <strong>{deleteTarget?.name}</strong>?
              <br />
              <span className="text-xs text-slate-400">
                Hội thoại sẽ tự hiện lại nếu đối phương gửi tin nhắn mới.
              </span>
            </>
          }
          confirmLabel="Xóa"
          cancelLabel="Hủy"
          confirmVariant="danger"
        />
      )}
    </div>
  )
}
