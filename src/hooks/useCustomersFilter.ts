import { useMemo } from 'react'
import type { CustomerManage } from '@/api/adminApi'

export function useCustomersFilter(
  customers: CustomerManage[],
  searchQuery: string,
  activeTab: 'all' | 'active' | 'blocked',
  statusFilter: string
) {
  const filtered = useMemo(
    () =>
      customers.filter((c) => {
        const matchSearch =
          !searchQuery ||
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.email.toLowerCase().includes(searchQuery.toLowerCase())
        const matchTab =
          activeTab === 'all' ||
          (activeTab === 'active' && c.status === 'active') ||
          (activeTab === 'blocked' && c.status === 'blocked')
        const matchStatus = !statusFilter || c.status === statusFilter
        return matchSearch && matchTab && matchStatus
      }),
    [customers, searchQuery, activeTab, statusFilter]
  )

  const tabCounts = useMemo(
    () => ({
      all: customers.length,
      active: customers.filter((c) => c.status === 'active').length,
      blocked: customers.filter((c) => c.status === 'blocked').length,
    }),
    [customers]
  )

  return { filtered, tabCounts }
}
