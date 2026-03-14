import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

interface ProtectedRouteProps {
  children: React.ReactNode
  roles?: string[]
}

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { user, token } = useAuthStore()
  const location = useLocation()

  if (!user || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (roles && roles.length > 0) {
    const roleMap: Record<string, string> = {
      staff: 'SalesStaff',
      customer: 'Customer',
      admin: 'Admin',
      manager: 'BranchManager',
    }
    const allowed = roles.some((r) => roleMap[r] === user.role || r === user.role)
    if (!allowed) {
      return <Navigate to="/" replace />
    }
  }

  return <>{children}</>
}
