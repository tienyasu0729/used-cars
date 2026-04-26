import { useState, useRef, useEffect } from 'react'
import { Search, ChevronDown } from 'lucide-react'
import { formatPriceNumber } from '@/utils/format'
import type { DepositListItem } from '@/services/deposit.service'

interface DepositSearchSelectProps {
  deposits: DepositListItem[]
  value: string
  onChange: (id: string) => void
  placeholder?: string
  disabled?: boolean
}

function getDepositLabel(d: DepositListItem) {
  const vehicle = d.vehicleTitle ?? `Xe #${d.vehicleId}`
  const customer = d.customerName ?? `KH #${d.customerId}`
  return `${vehicle} — ${customer} — ${formatPriceNumber(d.amount)} ₫`
}

function toSearchStr(s: string) {
  return String(s).toLowerCase().trim().replace(/\s+/g, ' ')
}

function matchDeposit(d: DepositListItem, q: string) {
  const s = toSearchStr(q)
  if (!s) return true
  const title = d.vehicleTitle ? toSearchStr(d.vehicleTitle) : ''
  const name = d.customerName ? toSearchStr(d.customerName) : ''
  const txnRef = d.gatewayTxnRef ? toSearchStr(d.gatewayTxnRef) : ''
  return (
    title.includes(s) ||
    name.includes(s) ||
    String(d.id).includes(s) ||
    String(d.vehicleId).includes(s) ||
    String(d.amount).includes(s) ||
    txnRef.includes(s)
  )
}

export function DepositSearchSelect({
  deposits,
  value,
  onChange,
  placeholder = 'Tìm theo tên xe, tên khách, mã cọc hoặc mã giao dịch...',
  disabled,
}: DepositSearchSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const selected = deposits.find((d) => String(d.id) === value)
  const displayText = selected ? getDepositLabel(selected) : ''
  const filtered = query.trim() ? deposits.filter((d) => matchDeposit(d, query.trim())) : deposits

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

  const handleSelect = (d: DepositListItem) => {
    onChange(String(d.id))
    setQuery('')
    setIsOpen(false)
  }

  const inputValue = isOpen ? query : value ? displayText : ''
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
          onFocus={() => { if (!disabled) setIsOpen(true) }}
          placeholder={showPlaceholder ? placeholder : undefined}
          readOnly={!isOpen}
          className="absolute inset-0 w-full cursor-pointer bg-transparent pl-10 pr-10 outline-none"
          autoComplete="off"
        />
        <span className="invisible flex-1" aria-hidden>
          {inputValue || placeholder}
        </span>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 shrink-0 text-slate-400" />
      </div>
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-20 mt-1 max-h-60 overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
          {filtered.length === 0 ? (
            <p className="px-3 py-4 text-center text-sm text-slate-500">Không tìm thấy phiếu cọc</p>
          ) : (
            filtered.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => handleSelect(d)}
                className={`w-full px-3 py-2.5 text-left text-sm hover:bg-slate-50 ${String(d.id) === value ? 'bg-blue-50 text-[#1A3C6E]' : 'text-slate-700'}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{d.vehicleTitle ?? `Xe #${d.vehicleId}`}</span>
                  <span className="ml-2 text-xs font-semibold text-[#1A3C6E]">{formatPriceNumber(d.amount)} ₫</span>
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span>KH: {d.customerName ?? `#${d.customerId}`}</span>
                  <span>·</span>
                  <span>Cọc #{d.id}</span>
                  {d.depositDate && (
                    <>
                      <span>·</span>
                      <span>{d.depositDate}</span>
                    </>
                  )}
                  {d.gatewayTxnRef && (
                    <>
                      <span>·</span>
                      <span className="font-mono text-slate-400" title={d.gatewayTxnRef}>
                        GD: {d.gatewayTxnRef.length > 16 ? d.gatewayTxnRef.slice(0, 16) + '…' : d.gatewayTxnRef}
                      </span>
                    </>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
