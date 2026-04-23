import { useState, useRef, useEffect } from 'react'
import { Search, ChevronDown } from 'lucide-react'

interface Customer {
  id: string
  name: string
  phone?: string
  email?: string
}

interface CustomerSearchSelectProps {
  customers: Customer[]
  value: string
  onChange: (id: string) => void
  placeholder?: string
  disabled?: boolean
  error?: string
}

export function CustomerSearchSelect({ customers, value, onChange, placeholder = 'Nhập tên hoặc SĐT để tìm...', disabled, error }: CustomerSearchSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const selected = customers.find((c) => c.id === value)
  const displayText = selected ? `${selected.name} - ${selected.phone || selected.email || ''}` : ''
  const filtered = query.trim()
    ? customers.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          (c.phone?.includes(query) ?? false) ||
          (c.email?.toLowerCase().includes(query.toLowerCase()) ?? false)
      )
    : customers

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

  const handleSelect = (c: Customer) => {
    onChange(c.id)
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
        className={`relative flex h-[38px] cursor-pointer items-center rounded-lg border border-slate-200 bg-white text-sm ${disabled ? 'cursor-not-allowed bg-slate-50' : ''}`}
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
          className="h-full w-full min-w-0 flex-1 cursor-pointer truncate bg-transparent pl-10 pr-10 text-sm outline-none"
          autoComplete="off"
        />
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 shrink-0 text-slate-400" />
      </div>
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-20 mt-1 max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
          {filtered.length === 0 ? (
            <p className="px-3 py-4 text-center text-sm text-slate-500">Không tìm thấy khách hàng</p>
          ) : (
            filtered.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => handleSelect(c)}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-slate-50 ${c.id === value ? 'bg-blue-50 text-[#1A3C6E]' : 'text-slate-700'}`}
              >
                {c.name} - {c.phone || c.email || ''}
              </button>
            ))
          )}
        </div>
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
