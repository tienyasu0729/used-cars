import { useState, useRef, useEffect } from 'react'
import { Search, ChevronDown } from 'lucide-react'
import { formatPriceNumber } from '@/utils/format'

interface Vehicle {
  id: string
  brand: string
  model: string
  year: number
  price: number
  code?: string
  plateNumber?: string
  [key: string]: unknown
}

interface VehicleSearchSelectProps {
  vehicles: Vehicle[]
  value: string
  onChange: (id: string) => void
  placeholder?: string
  disabled?: boolean
  error?: string
}

function getVehicleLabel(v: Vehicle) {
  return `${v.brand} ${v.model} ${v.year} - ${formatPriceNumber(v.price)}`
}

function toSearchStr(s: string) {
  return String(s).toLowerCase().trim().replace(/\s+/g, ' ')
}

function matchVehicle(v: Vehicle, q: string) {
  const raw = q.trim()
  const s = toSearchStr(raw)
  if (!s) return true
  const vcode = v.code != null ? toSearchStr(String(v.code)) : ''
  const codeMatch = vcode !== '' && vcode.includes(s)
  return (
    codeMatch ||
    v.id.toLowerCase().includes(s) ||
    v.brand.toLowerCase().includes(s) ||
    v.model.toLowerCase().includes(s) ||
    String(v.year).includes(raw) ||
    (v.plateNumber != null && toSearchStr(String(v.plateNumber)).includes(s))
  )
}

export function VehicleSearchSelect({ vehicles, value, onChange, placeholder = 'Tìm theo tên xe hoặc mã xe...', disabled, error }: VehicleSearchSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const selected = vehicles.find((v) => v.id === value)
  const displayText = selected ? getVehicleLabel(selected) : ''
  const filtered = query.trim() ? vehicles.filter((v) => matchVehicle(v, query.trim())) : vehicles

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener('click', fn)
    return () => document.removeEventListener('click', fn)
  }, [])

  useEffect(() => {
    if (isOpen) inputRef.current?.focus()
  }, [isOpen])

  const handleSelect = (v: Vehicle) => {
    onChange(v.id)
    setQuery('')
    setIsOpen(false)
  }

  const handleFocus = () => {
    if (!disabled) setIsOpen(true)
  }

  const inputValue = isOpen ? query : (value ? displayText : '')
  const showPlaceholder = !value && !query && !isOpen

  return (
    <div ref={containerRef} className="relative">
      <div
        role="combobox"
        aria-expanded={isOpen}
        onMouseDown={(e) => {
          if (!disabled) {
            e.preventDefault()
            setIsOpen(true)
            setTimeout(() => inputRef.current?.focus(), 0)
          }
        }}
        className={`flex min-h-[38px] cursor-pointer items-center rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-10 text-sm ${disabled ? 'cursor-not-allowed bg-slate-50' : ''}`}
      >
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 shrink-0 text-slate-400" />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleFocus}
          placeholder={showPlaceholder ? placeholder : undefined}
          readOnly={!isOpen}
          className="absolute inset-0 w-full cursor-pointer bg-transparent pl-10 pr-10 outline-none"
          autoComplete="off"
        />
        <span className="invisible flex-1" aria-hidden>{inputValue || placeholder}</span>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 shrink-0 text-slate-400" />
      </div>
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-20 mt-1 max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
          {filtered.length === 0 ? (
            <p className="px-3 py-4 text-center text-sm text-slate-500">Không tìm thấy xe</p>
          ) : (
            filtered.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => handleSelect(v)}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-slate-50 ${v.id === value ? 'bg-blue-50 text-[#1A3C6E]' : 'text-slate-700'}`}
              >
                {v.code && <span className="mr-2 rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">{v.code}</span>}
                {getVehicleLabel(v)}
              </button>
            ))
          )}
        </div>
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
