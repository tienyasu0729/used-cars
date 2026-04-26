import '@goongmaps/goong-js/dist/goong-js.css'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { QueryProvider } from '@/app/providers/QueryProvider'
import { AppRouter } from '@/app/router/AppRouter'
import { AccountRevokedBlockingModal } from '@/components/auth/AccountRevokedBlockingModal'
import { ToastContainer } from '@/components/ui/Toast'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

export default function App() {
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <QueryProvider>
        <AppRouter />
        <ToastContainer />
        <AccountRevokedBlockingModal />
      </QueryProvider>
    </GoogleOAuthProvider>
  )
}
