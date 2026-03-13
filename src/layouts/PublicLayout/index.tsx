import { Outlet } from 'react-router-dom'
import { ScrollToTop } from '@/components/common/ScrollToTop'
import { PublicHeader } from './PublicHeader'
import { PublicFooter } from './PublicFooter'
import { FloatingChatWidget } from './FloatingChatWidget'

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <PublicHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <PublicFooter />
      <FloatingChatWidget />
    </div>
  )
}
