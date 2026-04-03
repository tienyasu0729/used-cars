import { QueryProvider } from '@/app/providers/QueryProvider'
import { AppRouter } from '@/app/router/AppRouter'
import { AccountRevokedBlockingModal } from '@/components/auth/AccountRevokedBlockingModal'
import { ToastContainer } from '@/components/ui/Toast'

export default function App() {
  return (
    <QueryProvider>
      <AppRouter />
      <ToastContainer />
      <AccountRevokedBlockingModal />
    </QueryProvider>
  )
}
