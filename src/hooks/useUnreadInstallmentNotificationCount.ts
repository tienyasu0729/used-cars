import { useMemo } from 'react'
import { useNotifications } from '@/hooks/useNotifications'

interface Options {
  dashboardPrefix: '/staff' | '/manager'
}

function containsInstallmentKeyword(value: string): boolean {
  const text = value.toLowerCase()
  return (
    text.includes('trả góp') ||
    text.includes('tra gop') ||
    text.includes('hồ sơ vay') ||
    text.includes('ho so vay') ||
    text.includes('thẩm định') ||
    text.includes('tham dinh') ||
    text.includes('installment')
  )
}

export function useUnreadInstallmentNotificationCount(options: Options): number {
  const { data: notifications = [] } = useNotifications()
  const { dashboardPrefix } = options

  return useMemo(
    () =>
      notifications.filter((n) => {
        if (n.read) return false
        const link = (n.link ?? '').toLowerCase()
        const isInstallmentByLink =
          link.startsWith(`${dashboardPrefix}/installments`) ||
          link.includes('/installments/applications/')
        const isInstallmentByType = n.type.toLowerCase() === 'installment'
        const isInstallmentByText =
          containsInstallmentKeyword(n.title ?? '') || containsInstallmentKeyword(n.body ?? '')
        return isInstallmentByType || isInstallmentByLink || isInstallmentByText
      }).length,
    [dashboardPrefix, notifications],
  )
}
