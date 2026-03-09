import { useState, useMemo } from 'react'

interface UsePaginationOptions<T> {
  items: T[]
  pageSize: number
  windowSize?: number
}

export function usePagination<T>({ items, pageSize, windowSize = 5 }: UsePaginationOptions<T>) {
  const [page, setPage] = useState(1)

  const totalItems = items.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const safePage = Math.min(Math.max(1, page), totalPages)

  const paginated = useMemo(() => {
    const start = (safePage - 1) * pageSize
    return items.slice(start, start + pageSize)
  }, [items, safePage, pageSize])

  const pageNumbers = useMemo(() => {
    const half = Math.floor(windowSize / 2)
    let start = Math.max(1, safePage - half)
    let end = Math.min(totalPages, start + windowSize - 1)
    if (end - start + 1 < windowSize) start = Math.max(1, end - windowSize + 1)
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }, [safePage, totalPages, windowSize])

  const rangeStart = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1
  const rangeEnd = Math.min(safePage * pageSize, totalItems)
  const rangeText = `Đang ${rangeStart}-${rangeEnd} / ${totalItems}`

  return {
    page: safePage,
    setPage,
    paginated,
    totalPages,
    totalItems,
    pageNumbers,
    rangeText,
  }
}
