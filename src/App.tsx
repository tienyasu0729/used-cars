import '@goongmaps/goong-js/dist/goong-js.css'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AppRouter } from '@/app/router/AppRouter'
import { QueryProvider } from '@/app/providers/QueryProvider'
import { getRuntimeEnv } from '@/config/runtimeEnv'

const googleClientId = getRuntimeEnv('VITE_GOOGLE_CLIENT_ID') ?? ''

function App() {
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <QueryProvider>
        <AppRouter />
      </QueryProvider>
    </GoogleOAuthProvider>
  )
}

export default App
