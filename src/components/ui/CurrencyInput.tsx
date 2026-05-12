import { useState, useEffect, useCallback } from 'react'

interface CurrencyInputProps {
  label?: string
  value: number
  onChange: (value: number) => void
  error?: string
  readOnly?: boolean
  className?: string
}

function formatDisplay(n: number): string {
  if (!n && n !== 0) return ''
  return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(n)
}

function parseRaw(s: string): number {
  const cleaned = s.replace(/\./g, '').replace(/\s/g, '')
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : 0
}

export function CurrencyInput({ label, value, onChange, error, readOnly, className }: CurrencyInputProps) {
  const [display, setDisplay] = useState(() => formatDisplay(value))

  useEffect(() => {
    const current = parseRaw(display)
    if (current !== value) {
      setDisplay(formatDisplay(value))
    }
  }, [value])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '')
    const num = Number(raw)
    if (!Number.isFinite(num)) return
    setDisplay(raw ? formatDisplay(num) : '')
    onChange(num)
  }, [onChange])

  return (
    <div className={className}>
      {label && <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>}
      <input
        type="text"
        inputMode="numeric"
        value={display}
        onChange={handleChange}
        readOnly={readOnly}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#1A3C6E] focus:outline-none focus:ring-1 focus:ring-[#1A3C6E]"
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}
