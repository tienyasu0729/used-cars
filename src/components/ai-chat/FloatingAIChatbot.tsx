import { type ReactNode, useEffect, useRef, useState } from 'react'
import { X, Send, ChevronDown, RotateCcw } from 'lucide-react'
import chatbotIcon from '@/assets/chatbot.svg'
import { useAIChat, type AIChatMessage, type HealthStatus } from '@/hooks/useAIChat'

const NAVY = '#1A3C6E'
const ORANGE = '#E8612A'

const QUICK_PROMPTS = [
  'Xe SUV nào dưới 1 tỷ?',
  'So sánh Toyota và Honda',
  'Xe nào tiết kiệm xăng nhất?',
  'Có bao nhiêu xe đang bán?',
]

const HEALTH_LABEL: Record<HealthStatus, { text: string; color: string }> = {
  connecting: { text: 'Đang kết nối...', color: '#f59e0b' },
  ready: { text: 'Sẵn sàng', color: '#10b981' },
  loading_model: { text: 'Model đang tải...', color: '#f59e0b' },
  error: { text: 'Mất kết nối', color: '#ef4444' },
}

interface FloatingAIChatbotProps {
  onOpenChange?: (isOpen: boolean) => void
  forceClose?: boolean
}

export function FloatingAIChatbot({ onOpenChange, forceClose }: FloatingAIChatbotProps) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')

  const {
    messages,
    isTyping,
    healthStatus,
    error,
    sendMessage,
    createNewSession,
  } = useAIChat()

  const panelRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (forceClose) setOpen(false)
  }, [forceClose])

  useEffect(() => {
    onOpenChange?.(open)
  }, [open, onOpenChange])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

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

  const handleSend = (text?: string) => {
    const content = (text ?? input).trim()
    if (!content || isTyping) return
    setInput('')
    sendMessage(content)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const showQuickPrompts = messages.length === 1 && messages[0].role === 'bot'
  const health = HEALTH_LABEL[healthStatus]

  return (
    <>
      {/* ── Floating trigger button ── */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="fixed bottom-24 right-6 z-[100] flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
        style={{
          background: `linear-gradient(135deg, ${NAVY} 0%, #0f2549 100%)`,
        }}
        title="Chat với AI"
        aria-label={open ? 'Đóng AI chat' : 'Mở AI chat'}
      >
        <span
          className="absolute inset-0 rounded-full transition-opacity duration-200"
          style={{ opacity: open ? 1 : 0, background: 'rgba(0,0,0,0.15)' }}
        />
        <span className="relative flex items-center justify-center">
          {open ? (
            <ChevronDown className="h-6 w-6 text-white" />
          ) : (
            <img
              src={chatbotIcon}
              alt="AI Chatbot"
              className="h-9 w-9 rounded-full object-cover"
            />
          )}
        </span>
      </button>

      {/* ── Chat panel ── */}
      <div
        ref={panelRef}
        className="fixed bottom-[7.5rem] right-6 z-[100] flex w-[min(calc(100vw-1.5rem),420px)] flex-col overflow-hidden rounded-2xl shadow-2xl transition-all duration-200 ease-out"
        style={{
          height: 'min(540px, calc(100vh - 10rem))',
          maxHeight: 'min(540px, calc(100vh - 10rem))',
          opacity: open ? 1 : 0,
          transform: open ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.97)',
          pointerEvents: open ? 'auto' : 'none',
          background: '#fff',
          border: '1px solid rgba(26,60,110,0.12)',
          boxShadow: '0 20px 60px rgba(26,60,110,0.18), 0 4px 16px rgba(0,0,0,0.08)',
        }}
      >
        {/* ── Header ── */}
        <div
          className="flex shrink-0 items-center justify-between px-4 py-3"
          style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #0f2549 100%)` }}
        >
          <div className="flex items-center gap-2.5">
            <img
              src={chatbotIcon}
              alt="AI Bot"
              className="h-8 w-8 shrink-0 rounded-full border-2 border-white/20 object-cover"
            />
            <div>
              <p className="text-sm font-semibold leading-tight text-white">
                Trợ Lý AI SCUDN
              </p>
              <span
                className="inline-flex items-center gap-1 text-[10px]"
                style={{ color: health.color }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    background: health.color,
                    animation: healthStatus === 'ready' ? 'none' : 'pulse 2s infinite',
                  }}
                />
                {health.text}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={createNewSession}
              className="rounded-lg p-1.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Phiên mới"
              title="Tạo phiên chat mới"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
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

        {/* ── Messages area ── */}
        <div
          className="min-h-0 flex-1 overflow-y-auto p-4"
          style={{ background: '#f8f9fc' }}
        >
          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}

          {/* Quick prompts */}
          {showQuickPrompts && (
            <div className="mt-1 flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.map((text) => (
                <button
                  key={text}
                  type="button"
                  onClick={() => handleSend(text)}
                  className="cursor-pointer rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors hover:bg-[rgba(26,60,110,0.08)]"
                  style={{
                    border: '1px solid rgba(26,60,110,0.2)',
                    color: NAVY,
                    background: 'rgba(26,60,110,0.04)',
                  }}
                >
                  {text}
                </button>
              ))}
            </div>
          )}

          {/* Typing indicator */}
          {isTyping && (
            <div className="mb-3 flex items-end gap-2">
              <img
                src={chatbotIcon}
                alt=""
                className="mr-0 h-6 w-6 shrink-0 rounded-full object-cover"
              />
              <div
                className="inline-flex items-center gap-1 rounded-r-2xl rounded-tl-2xl px-4 py-3"
                style={{ background: '#e8edf5' }}
              >
                <span className="typing-dot h-2 w-2 rounded-full bg-slate-400" style={{ animationDelay: '0ms' }} />
                <span className="typing-dot h-2 w-2 rounded-full bg-slate-400" style={{ animationDelay: '200ms' }} />
                <span className="typing-dot h-2 w-2 rounded-full bg-slate-400" style={{ animationDelay: '400ms' }} />
              </div>
            </div>
          )}

          {/* Error banner */}
          {error && !isTyping && (
            <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-center text-xs text-red-600">
              {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Input bar ── */}
        <div
          className="flex gap-2 px-3 py-2.5"
          style={{ borderTop: '1px solid rgba(26,60,110,0.08)' }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Hỏi tôi bất cứ điều gì..."
            disabled={isTyping}
            className="flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50"
            style={{
              borderColor: 'rgba(26,60,110,0.15)',
              // @ts-expect-error css vars
              '--tw-ring-color': `${NAVY}40`,
            }}
          />
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white transition-opacity disabled:opacity-40"
            style={{ background: ORANGE }}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Animations ── */}
      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
        .typing-dot {
          animation: typingBounce 1.4s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </>
  )
}

// ── Inline markdown parser ───────────────────────────────────────
// Handles **bold**, *italic*, and line breaks without a heavy library.

function parseInlineMarkdown(text: string): ReactNode[] {
  const tokens: ReactNode[] = []
  // Split by line first to handle newlines
  const lines = text.split('\n')

  lines.forEach((line, lineIdx) => {
    if (lineIdx > 0) tokens.push(<br key={`br-${lineIdx}`} />)

    const regex = /(\*\*(.+?)\*\*|\*(.+?)\*)/g
    let lastIndex = 0
    let match: RegExpExecArray | null

    while ((match = regex.exec(line)) !== null) {
      // Text before this match
      if (match.index > lastIndex) {
        tokens.push(line.slice(lastIndex, match.index))
      }

      if (match[2]) {
        // **bold**
        tokens.push(
          <strong key={`b-${lineIdx}-${match.index}`} className="font-semibold">
            {match[2]}
          </strong>,
        )
      } else if (match[3]) {
        // *italic*
        tokens.push(
          <em key={`i-${lineIdx}-${match.index}`}>{match[3]}</em>,
        )
      }

      lastIndex = match.index + match[0].length
    }

    // Remaining text after last match
    if (lastIndex < line.length) {
      tokens.push(line.slice(lastIndex))
    }
  })

  return tokens
}

// ── Message bubble sub-component ─────────────────────────────────

function MessageBubble({ msg }: { msg: AIChatMessage }) {
  return (
    <div className={`mb-3 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      {msg.role === 'bot' && (
        <img
          src={chatbotIcon}
          alt=""
          className="mr-2 mt-1 h-6 w-6 shrink-0 rounded-full object-cover"
        />
      )}
      <div style={{ maxWidth: '85%' }}>
        <div
          className={`px-4 py-3 text-sm leading-relaxed ${
            msg.role === 'user'
              ? 'rounded-l-2xl rounded-tr-2xl text-white'
              : 'rounded-r-2xl rounded-tl-2xl text-slate-700'
          }`}
          style={{
            background:
              msg.role === 'user'
                ? `linear-gradient(135deg, ${NAVY} 0%, #0f2549 100%)`
                : '#e8edf5',
          }}
        >
          {msg.role === 'bot' ? parseInlineMarkdown(msg.content) : msg.content}
        </div>

        {/* Timestamp for bot messages */}
        {msg.role === 'bot' && msg.sentAt && (
          <div className="mt-1 pl-1">
            <span className="text-[10px] text-slate-400">
              {new Date(msg.sentAt).toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
