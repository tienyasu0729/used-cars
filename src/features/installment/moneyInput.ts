import { formatPriceNumber } from '@/utils/format'

export function parseMoneyInput(raw: string): number {
  const normalized = raw.replace(/[^\d]/g, '')
  if (!normalized) return 0
  return Number(normalized)
}

export function formatMoneyInput(value: number | string | undefined | null): string {
  if (value == null) return ''
  const numeric = typeof value === 'number' ? value : parseMoneyInput(String(value))
  if (!Number.isFinite(numeric) || numeric <= 0) return numeric === 0 ? '0' : ''
  return formatPriceNumber(numeric)
}
