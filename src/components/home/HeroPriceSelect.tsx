import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown } from 'lucide-react'

export type HeroPriceOption = { label: string; minPrice: string; maxPrice: string }

type Props = {
  options: HeroPriceOption[]
  valueIndex: number
  onChangeIndex: (i: number) => void
}

export function HeroPriceSelect({ options, valueIndex, onChangeIndex }: Props) {
  const [open, setOpen] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLUListElement>(null)
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 })

  const updatePos = useCallback(() => {
    const el = btnRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    setPos({ top: r.bottom + 6, left: r.left, width: r.width })
  }, [])

  useLayoutEffect(() => {
    if (!open) return
    updatePos()
    window.addEventListener('scroll', updatePos, true)
    window.addEventListener('resize', updatePos)
    return () => {
      window.removeEventListener('scroll', updatePos, true)
      window.removeEventListener('resize', updatePos)
    }
  }, [open, updatePos])

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node
      if (btnRef.current?.contains(t)) return
      if (menuRef.current?.contains(t)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const selected = options[valueIndex] ?? options[0]

  const menu = open ? (
    <ul
      ref={menuRef}
      role="listbox"
      style={{
        position: 'fixed',
        top: pos.top,
        left: pos.left,
        width: pos.width,
        zIndex: 9999,
      }}
      className="max-h-[min(70vh,320px)] overflow-y-auto rounded-xl border border-slate-200/90 bg-white py-1 shadow-xl ring-1 ring-slate-900/5"
    >
      {options.map((opt, i) => (
        <li key={opt.label + i} role="presentation">
          <button
            type="button"
            role="option"
            aria-selected={i === valueIndex}
            className={`w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-slate-50 ${
              i === valueIndex ? 'bg-[#1A3C6E]/10 font-semibold text-[#1A3C6E]' : 'text-slate-700'
            }`}
            onClick={() => {
              onChangeIndex(i)
              setOpen(false)
            }}
          >
            {opt.label}
          </button>
        </li>
      ))}
    </ul>
  ) : null

  return (
    <div className="relative min-w-0 flex-1">
      <button
        ref={btnRef}
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200/90 bg-slate-50/95 px-4 py-3 text-left text-sm font-medium text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]/20"
      >
        <span className="min-w-0 truncate">{selected.label}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>
      {typeof document !== 'undefined' && menu ? createPortal(menu, document.body) : null}
    </div>
  )
}
