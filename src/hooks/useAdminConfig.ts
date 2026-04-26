import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchAdminConfig, putAdminConfig, type ConfigEntry } from '@/services/adminConfig.service'

export function useAdminConfig() {
  return useQuery<ConfigEntry[]>({
    queryKey: ['admin-config'],
    queryFn: fetchAdminConfig,
    staleTime: 60_000,
  })
}

export function usePutAdminConfig() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (items: { key: string; value: string }[]) => putAdminConfig(items),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-config'] }),
  })
}

export function configListToMap(entries: ConfigEntry[] | undefined): Record<string, string> {
  const m: Record<string, string> = {}
  if (!entries) return m
  for (const e of entries) {
    m[e.key] = e.value ?? ''
  }
  return m
}
