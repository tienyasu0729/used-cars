import { useCallback, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { ScrollToTop } from '@/components/common/ScrollToTop'
import { FloatingAIChatbot } from '@/components/ai-chat/FloatingAIChatbot'
import { PublicHeader } from './PublicHeader'
import { PublicFooter } from './PublicFooter'
import { FloatingChatWidget } from './FloatingChatWidget'

const aiChatbotEnabled = import.meta.env.VITE_AI_CHATBOT_ENABLED === 'true'

// Layout này quản lý 2 nút floating: Chat tư vấn + AI Chatbot
// Chỉ cho phép 1 panel mở tại 1 thời điểm
export function PublicLayout() {
  const [chatOpen, setChatOpen] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)

  const handleChatOpenChange = useCallback((isOpen: boolean) => {
    setChatOpen(isOpen)
  }, [])

  const handleAiOpenChange = useCallback((isOpen: boolean) => {
    setAiOpen(isOpen)
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <PublicHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <PublicFooter />
      <FloatingChatWidget
        onOpenChange={handleChatOpenChange}
        forceClose={aiOpen}
      />
      {aiChatbotEnabled && (
        <FloatingAIChatbot
          onOpenChange={handleAiOpenChange}
          forceClose={chatOpen}
        />
      )}
    </div>
  )
}
