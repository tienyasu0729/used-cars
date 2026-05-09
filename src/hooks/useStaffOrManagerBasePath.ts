import { useLocation } from 'react-router-dom'

export function useStaffOrManagerBasePath() {
  const { pathname } = useLocation()
  if (pathname.startsWith('/manager')) {
    return { base: '/manager', dashboard: '/manager/dashboard', orders: '/manager/orders', deposits: '/manager/deposits' }
  }
  return { base: '/staff', dashboard: '/staff/dashboard', orders: '/staff/orders', deposits: '/staff/deposits' }
}
