import { QueryProvider } from '@/app/providers/QueryProvider'
import { AppRouter } from '@/app/router/AppRouter'
import { ToastContainer } from '@/components/ui/Toast'

export default function App() {
  return (
    <QueryProvider>
      <AppRouter />
      <ToastContainer />
    </QueryProvider>
  )
}
