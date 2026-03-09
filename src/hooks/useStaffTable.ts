import { useState, useMemo } from 'react'
import { usePagination } from './usePagination'
import type { StaffManageItem } from '@/mock/mockStaff'

const PAGE_SIZE = 5

export function useStaffTable(initialList: StaffManageItem[]) {
  const [staffList, setStaffList] = useState<StaffManageItem[]>(initialList)
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = useMemo(
    () =>
      staffList.filter(
        (s) =>
          !searchQuery ||
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.email.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [staffList, searchQuery]
  )

  const pagination = usePagination({
    items: filtered,
    pageSize: PAGE_SIZE,
  })

  return {
    staffList,
    setStaffList,
    searchQuery,
    setSearchQuery,
    filtered,
    pagination,
  }
}
