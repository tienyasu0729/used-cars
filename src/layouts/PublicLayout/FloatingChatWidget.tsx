import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { MessageCircle, X, Send, Plus, ChevronDown, Search } from 'lucide-react'
import { ChatLayout } from '@/features/customer/components/ChatLayout'
import { useBranches } from '@/hooks/useBranches'
import { useBranchTeam } from '@/hooks/useBranches'
import { CHAT_CONVERSATIONS_POLL_MS, useChatMessages, useConversations } from '@/hooks/useChats'
import { useStaffCustomerOptions } from '@/hooks/useStaffCustomerOptions'
import { customerExtrasApiEnabled } from '@/config/dataSource'
import { createChatConversation, listManagerChatContacts, sendChatMessage } from '@/services/chat.service'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'
import { isCustomerRole } from '@/utils/userRole'
// Brand tokens
const NAVY = '#1A3C6E'
const ORANGE = '#E8612A'

function roleKey(role: string | undefined | null): string {
  return String(role ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
}

function isInternalChatRole(role: string | undefined | null): boolean {
  const r = roleKey(role)
  return r === 'salesstaff' || r === 'branchmanager' || r === 'admin'
}

function floatingChatSubtitle(role: string | undefined, customer: boolean): string {
  if (customer) return 'Hội thoại của bạn'
  const r = roleKey(role)
  if (r === 'salesstaff') return 'Tin nhắn từ khách hàng'
  if (r === 'branchmanager') return 'Khách hàng & đồng nghiệp (liên chi nhánh)'
  if (r === 'admin') return 'Chat nội bộ & khách hàng'
  return 'Hội thoại'
}

function fullChatDashboardPath(role: string | undefined): string | null {
  const r = roleKey(role)
  if (r === 'salesstaff') return '/staff/chat'
  if (r === 'branchmanager') return '/manager/chat'
  return null
}

export function FloatingChatWidget() {
  const [open, setOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | undefined>()
  const [guestInput, setGuestInput] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [staffCustomerModalOpen, setStaffCustomerModalOpen] = useState(false)
  const [staffCustomerSearch, setStaffCustomerSearch] = useState('')
  const [branchId, setBranchId] = useState<string | undefined>(undefined)

  const panelRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isCustomer = isAuthenticated && isCustomerRole(user?.role)
  const internalStaff = isAuthenticated && isInternalChatRole(user?.role)
  const chatApiOk = customerExtrasApiEnabled()
  const canUseFloatingChat = isAuthenticated && chatApiOk

  const listPollEnabled = canUseFloatingChat
  const { data: conversations = [], isLoading, refetch } = useConversations({
    queryEnabled: listPollEnabled,
    pollIntervalMs: listPollEnabled ? CHAT_CONVERSATIONS_POLL_MS : 0,
  })
  const messagesQueryEnabled = open && canUseFloatingChat
  const { data: messages = [], refetchMessages } = useChatMessages(selectedId, CHAT_CONVERSATIONS_POLL_MS, {
    queryEnabled: messagesQueryEnabled,
  })
  const toast = useToastStore()

  const { data: branches } = useBranches()
  const firstBranchId = branches?.[0]?.id
  const effectiveBranch = branchId ?? firstBranchId
  const teamBranchId = isCustomer ? effectiveBranch : undefined
  const { data: team = [] } = useBranchTeam(teamBranchId)

  const { data: staffCustomerOptions = [], isLoading: staffCustomersLoading } = useStaffCustomerOptions(
    staffCustomerModalOpen && internalStaff,
  )

  const isBranchManagerUi = roleKey(user?.role) === 'branchmanager'
  const { data: managerColleagues = [], isLoading: managerColleaguesLoading } = useQuery({
    queryKey: ['chat', 'manager-contact-options'],
    queryFn: listManagerChatContacts,
    enabled: staffCustomerModalOpen && internalStaff && isBranchManagerUi,
  })

  const totalUnread = useMemo(
    () => conversations.reduce((s, c) => s + (c.unreadCount ?? 0), 0),
    [conversations],
  )

  const filteredStaffCustomers = useMemo(() => {
    const q = staffCustomerSearch.trim().toLowerCase()
    if (!q) return staffCustomerOptions
    return staffCustomerOptions.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.phone ?? '').toLowerCase().includes(q) ||
        (c.email ?? '').toLowerCase().includes(q),
    )
  }, [staffCustomerOptions, staffCustomerSearch])

  const filteredManagerColleagues = useMemo(() => {
    const q = staffCustomerSearch.trim().toLowerCase()
    if (!q) return managerColleagues
    return managerColleagues.filter(
      (m) => m.name.toLowerCase().includes(q) || m.role.toLowerCase().includes(q),
    )
  }, [managerColleagues, staffCustomerSearch])

  // Auto-select first conversation when opening
  useEffect(() => {
    if (!open || !canUseFloatingChat) return
    if (!selectedId && conversations.length > 0) {
      setSelectedId(conversations[0].id)
    }
  }, [open, canUseFloatingChat, selectedId, conversations])

  // Click-outside to close (exclude the trigger button itself)
  useEffect(() => {
    if (!open) return
    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Node
      if (
        panelRef.current &&
        !panelRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [open])

  const handleSendMessage = async (content: string) => {
    if (!selectedId) return
    const cid = parseInt(selectedId, 10)
    if (!Number.isFinite(cid)) return
    try {
      await sendChatMessage(cid, content)
      void refetchMessages()
      void refetch()
    } catch {
      toast.addToast('error', 'Không gửi được tin nhắn.')
    }
  }

  const startChatWith = async (participantUserId: number) => {
    try {
      const cid = await createChatConversation(participantUserId)
      setModalOpen(false)
      setStaffCustomerModalOpen(false)
      setSelectedId(String(cid))
      await refetch()
    } catch {
      toast.addToast('error', 'Không tạo được hội thoại.')
    }
  }

  return (
    <>
      {/* ── Trigger Button ── */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-[100] flex h-14 w-14 items-center justify-center rounded-full text-white shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
        style={{ background: `linear-gradient(135deg, ${ORANGE} 0%, #c94e1f 100%)` }}
        title="Tư Vấn Ngay"
        aria-label={open ? 'Đóng chat' : 'Mở chat tư vấn'}
      >
        <span
          className="absolute inset-0 rounded-full transition-opacity duration-200"
          style={{ opacity: open ? 1 : 0, background: 'rgba(0,0,0,0.15)' }}
        />
        <span className="relative flex items-center justify-center">
          {open ? (
            <ChevronDown className="h-6 w-6" />
          ) : (
            <>
              <MessageCircle className="h-6 w-6" />
              {totalUnread > 0 && (
                <span
                  className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"
                  title={`${totalUnread} hội thoại chưa đọc`}
                  aria-label={`${totalUnread} hội thoại chưa đọc`}
                />
              )}
            </>
          )}
        </span>
      </button>

      {/* ── Chat Panel ── */}
      <div
        className="fixed bottom-20 right-6 z-[100] flex w-[min(calc(100vw-1.5rem),560px)] flex-col overflow-hidden rounded-2xl shadow-2xl transition-all duration-200 ease-out"
        style={{
          height: 'min(600px, calc(100vh - 5.5rem))',
          maxHeight: 'min(600px, calc(100vh - 5.5rem))',
          opacity: open ? 1 : 0,
          transform: open ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.97)',
          pointerEvents: open ? 'auto' : 'none',
          background: '#fff',
          border: `1px solid rgba(26,60,110,0.12)`,
          boxShadow: '0 20px 60px rgba(26,60,110,0.18), 0 4px 16px rgba(0,0,0,0.08)',
        }}
        ref={panelRef}
      >
        {/* ── Header ── */}
        <div
          className="flex shrink-0 items-center justify-between px-4 py-3"
          style={{
            background: `linear-gradient(135deg, ${NAVY} 0%, #0f2549 100%)`,
          }}
        >
          <div className="flex items-center gap-2.5">
            {/* Brand logo mark */}
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white text-xs font-bold"
              style={{ background: ORANGE }}
            >
              SC
            </div>
            <div>
              <p className="text-sm font-semibold text-white leading-tight">
                Tư Vấn SCUDN
                {canUseFloatingChat && totalUnread > 0 && (
                  <span
                    className="ml-2 inline-block h-2 w-2 shrink-0 rounded-full bg-red-500 align-middle"
                    title={`${totalUnread} chưa đọc`}
                    aria-label={`${totalUnread} hội thoại chưa đọc`}
                  />
                )}
              </p>
              <p className="text-[10px] text-white/60">
                {floatingChatSubtitle(user?.role, isCustomer)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-0.5">
            {canUseFloatingChat && (isCustomer || internalStaff) && (
              <button
                type="button"
                onClick={() => {
                  if (isCustomer) setModalOpen(true)
                  else {
                    setStaffCustomerSearch('')
                    setStaffCustomerModalOpen(true)
                  }
                }}
                className="rounded-lg p-1.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                title={
                  isCustomer
                    ? 'Chọn tư vấn viên'
                    : isBranchManagerUi
                      ? 'Khách hàng hoặc đồng nghiệp'
                      : 'Chat với khách hàng'
                }
              >
                <Plus className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-1.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Đóng"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {canUseFloatingChat ? (
            isLoading ? (
              <div className="flex h-full items-center justify-center">
                <div
                  className="h-9 w-9 animate-spin rounded-full border-[3px] border-t-transparent"
                  style={{ borderColor: `rgba(26,60,110,0.15)`, borderTopColor: NAVY }}
                />
              </div>
            ) : (
              <ChatLayout
                compact
                showListFilter={internalStaff}
                conversations={conversations}
                messages={messages}
                selectedId={selectedId}
                onSelectConversation={setSelectedId}
                onSendMessage={handleSendMessage}
              />
            )
          ) : (
            /* ── Guest / Non-customer view ── */
            <div className="flex h-full flex-col">
              {/* Agent header */}
              <div
                className="flex items-center gap-3 px-4 py-3"
                style={{ borderBottom: '1px solid rgba(26,60,110,0.08)' }}
              >
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ background: NAVY }}
                >
                  TV
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: NAVY }}>
                    Tư Vấn Viên SCUDN
                  </p>
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Đang trực tuyến
                  </span>
                </div>
              </div>

              {/* Messages area */}
              <div className="min-h-0 flex-1 overflow-y-auto p-4" style={{ background: '#f8f9fc' }}>
                <div
                  className="rounded-r-2xl rounded-tl-2xl px-4 py-3 text-sm text-slate-700"
                  style={{ background: '#e8edf5', maxWidth: '85%' }}
                >
                  Xin chào! Tôi có thể giúp gì cho bạn hôm nay? 👋
                </div>

                {/* Quick chips */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {['Xem xe đang bán', 'Chính sách đặt cọc', 'Liên hệ chi nhánh'].map((text) => (
                    <span
                      key={text}
                      className="cursor-default rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors"
                      style={{
                        border: `1px solid rgba(26,60,110,0.2)`,
                        color: NAVY,
                        background: 'rgba(26,60,110,0.04)',
                      }}
                    >
                      {text}
                    </span>
                  ))}
                </div>

                {!isAuthenticated && (
                  <p className="mt-4 text-xs text-slate-500">
                    <Link
                      to="/login"
                      className="font-semibold underline underline-offset-2 transition-colors hover:opacity-70"
                      style={{ color: NAVY }}
                    >
                      Đăng nhập
                    </Link>{' '}
                    để chat trực tiếp với tư vấn viên.
                  </p>
                )}
              </div>

              {/* Input bar */}
              <div
                className="flex gap-2 px-3 py-2.5"
                style={{ borderTop: '1px solid rgba(26,60,110,0.08)' }}
              >
                <input
                  type="text"
                  value={guestInput}
                  onChange={(e) => setGuestInput(e.target.value)}
                  placeholder={
                    isAuthenticated
                      ? 'Đăng nhập bằng tài khoản có quyền chat để nhắn trực tiếp…'
                      : 'Nhập tin nhắn...'
                  }
                  disabled={!isAuthenticated || !canUseFloatingChat}
                  className="flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                  style={{
                    borderColor: 'rgba(26,60,110,0.15)',
                    // @ts-expect-error css vars
                    '--tw-ring-color': `${NAVY}40`,
                  }}
                />
                <button
                  type="button"
                  disabled
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white disabled:opacity-40"
                  style={{ background: ORANGE }}
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── New Chat Modal ── */}
        {modalOpen && isCustomer && (
          <div className="absolute inset-0 z-10 flex items-center justify-center p-3"
            style={{ background: 'rgba(15,37,73,0.45)', backdropFilter: 'blur(4px)' }}
          >
            <div className="max-h-[85%] w-full max-w-sm overflow-y-auto rounded-2xl bg-white p-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold" style={{ color: NAVY }}>
                  Chọn nhân viên tư vấn
                </h2>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-0.5 text-[11px] text-slate-400">Chọn chi nhánh rồi chọn người để bắt đầu.</p>

              <label className="mt-3 block text-xs font-semibold" style={{ color: NAVY }}>
                Chi nhánh
              </label>
              <select
                className="mt-1 w-full rounded-lg border px-2 py-2 text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: 'rgba(26,60,110,0.15)', color: NAVY }}
                value={effectiveBranch ?? ''}
                onChange={(e) => setBranchId(e.target.value || undefined)}
              >
                {(branches ?? []).map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>

              <ul className="mt-3 max-h-44 space-y-1 overflow-y-auto">
                {team.length === 0 ? (
                  <li className="py-4 text-center text-xs text-slate-400">Chưa có danh sách nhân sự.</li>
                ) : (
                  team.map((m) => (
                    <li key={m.userId}>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-slate-50"
                        style={{ border: '1px solid rgba(26,60,110,0.08)' }}
                        onClick={() => startChatWith(m.userId)}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                            style={{ background: NAVY }}
                          >
                            {m.name[0]?.toUpperCase() ?? '?'}
                          </div>
                          <span className="font-medium text-slate-800">{m.name}</span>
                        </div>
                        <span className="text-[10px] font-medium text-slate-400">{m.role}</span>
                      </button>
                    </li>
                  ))
                )}
              </ul>

              <button
                type="button"
                className="mt-3 w-full rounded-xl py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100"
                onClick={() => setModalOpen(false)}
              >
                Huỷ
              </button>
            </div>
          </div>
        )}

        {/* ── NV / QL / Admin: chọn khách hàng để mở hội thoại ── */}
        {staffCustomerModalOpen && internalStaff && (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center p-3"
            style={{ background: 'rgba(15,37,73,0.45)', backdropFilter: 'blur(4px)' }}
          >
            <div className="max-h-[85%] w-full max-w-sm overflow-y-auto rounded-2xl bg-white p-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold" style={{ color: NAVY }}>
                  {roleKey(user?.role) === 'admin'
                    ? 'Chọn khách hàng'
                    : roleKey(user?.role) === 'branchmanager'
                      ? 'Hỗ trợ khách hàng'
                      : 'Chat với khách hàng'}
                </h2>
                <button
                  type="button"
                  onClick={() => setStaffCustomerModalOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-0.5 text-[11px] text-slate-500">
                {roleKey(user?.role) === 'admin'
                  ? 'Danh sách khách đã đăng ký trên hệ thống. Chọn người để mở hoặc tiếp tục hội thoại.'
                  : roleKey(user?.role) === 'branchmanager'
                    ? 'Chọn đồng nghiệp (cùng hoặc khác chi nhánh, tài khoản đang hoạt động) hoặc khách hàng.'
                    : 'Chọn khách hàng để bắt đầu hoặc tiếp tục trao đổi.'}
              </p>

              <div className="relative mt-3">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  className="w-full rounded-lg border py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2"
                  style={{ borderColor: 'rgba(26,60,110,0.15)' }}
                  placeholder="Tìm theo tên, SĐT, email, chi nhánh…"
                  value={staffCustomerSearch}
                  onChange={(e) => setStaffCustomerSearch(e.target.value)}
                />
              </div>

              {isBranchManagerUi && (
                <>
                  <p className="mt-3 text-[11px] font-semibold text-slate-600">Đồng nghiệp (nội bộ & liên chi nhánh)</p>
                  <ul className="mt-1 max-h-36 space-y-1 overflow-y-auto">
                    {managerColleaguesLoading ? (
                      <li className="py-3 text-center text-xs text-slate-400">Đang tải…</li>
                    ) : filteredManagerColleagues.length === 0 ? (
                      <li className="py-2 text-center text-xs text-slate-400">Không có đồng nghiệp phù hợp.</li>
                    ) : (
                      filteredManagerColleagues.map((m) => (
                        <li key={m.userId}>
                          <button
                            type="button"
                            className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-slate-50"
                            style={{ border: '1px solid rgba(26,60,110,0.08)' }}
                            onClick={() => void startChatWith(m.userId)}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                                style={{ background: NAVY }}
                              >
                                {m.name[0]?.toUpperCase() ?? '?'}
                              </div>
                              <span className="font-medium text-slate-800">{m.name}</span>
                            </div>
                            <span className="max-w-[45%] truncate text-[10px] font-medium text-slate-400">{m.role}</span>
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                  <p className="mt-3 text-[11px] font-semibold text-slate-600">Khách hàng</p>
                </>
              )}

              <ul className="mt-3 max-h-52 space-y-1 overflow-y-auto">
                {staffCustomersLoading ? (
                  <li className="py-6 text-center text-xs text-slate-400">Đang tải danh sách…</li>
                ) : filteredStaffCustomers.length === 0 ? (
                  <li className="py-4 text-center text-xs text-slate-400">Không có khách phù hợp.</li>
                ) : (
                  filteredStaffCustomers.map((m) => (
                    <li key={m.id}>
                      <button
                        type="button"
                        className="flex w-full flex-col items-start rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-slate-50"
                        style={{ border: '1px solid rgba(26,60,110,0.08)' }}
                        onClick={() => {
                          const uid = parseInt(m.id, 10)
                          if (!Number.isFinite(uid)) return
                          void startChatWith(uid)
                        }}
                      >
                        <div className="flex w-full items-center gap-2">
                          <div
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                            style={{ background: NAVY }}
                          >
                            {m.name[0]?.toUpperCase() ?? '?'}
                          </div>
                          <span className="min-w-0 flex-1 font-medium text-slate-800">{m.name}</span>
                        </div>
                        {(m.phone || m.email) && (
                          <span className="mt-0.5 pl-9 text-[11px] text-slate-500">{m.phone ?? m.email}</span>
                        )}
                      </button>
                    </li>
                  ))
                )}
              </ul>

              {fullChatDashboardPath(user?.role) && (
                <Link
                  to={fullChatDashboardPath(user?.role)!}
                  className="mt-3 block rounded-lg py-2 text-center text-xs font-semibold transition-colors hover:underline"
                  style={{ color: NAVY }}
                  onClick={() => {
                    setStaffCustomerModalOpen(false)
                    setOpen(false)
                  }}
                >
                  Mở trang chat đầy đủ
                </Link>
              )}

              <button
                type="button"
                className="mt-1 w-full rounded-xl py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100"
                onClick={() => setStaffCustomerModalOpen(false)}
              >
                Huỷ
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
