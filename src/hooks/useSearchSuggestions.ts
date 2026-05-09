/**
 * Hook gợi ý tìm kiếm — debounce 300ms, gọi API khi >= 2 ký tự
 */
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { vehicleService } from '@/services/vehicle.service'
import type { SuggestionItem } from '@/types/vehicle.types'

export function useSearchSuggestions(query: string) {
  // B1: Debounce — chờ 300ms sau khi người dùng ngừng gõ mới gửi request
  const [debouncedQuery, setDebouncedQuery] = useState('')

  useEffect(() => {
    const trimmed = query.trim()

    // Nếu dưới 2 ký tự thì reset ngay, không cần chờ
    if (trimmed.length < 2) {
      setDebouncedQuery('')
      return
    }

    const timer = setTimeout(() => {
      setDebouncedQuery(trimmed)
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  // B2: Gọi API qua react-query, chỉ khi debouncedQuery >= 2 ký tự
  const { data, isLoading } = useQuery<SuggestionItem[]>({
    queryKey: ['vehicle-suggestions', debouncedQuery],
    queryFn: () => vehicleService.getSuggestions(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    staleTime: 30_000,
  })

  const suggestions = debouncedQuery.length >= 2 ? (data ?? []) : []

  return { suggestions, isLoading: isLoading && debouncedQuery.length >= 2 }
}
