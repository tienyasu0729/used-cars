/**
 * Component ô tìm kiếm có gợi ý (autocomplete dropdown)
 * Dùng cho PublicHeader và HomePage hero search
 */
import { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Search, X } from 'lucide-react'
import { useSearchSuggestions } from '@/hooks/useSearchSuggestions'
import type { SuggestionItem } from '@/types/vehicle.types'

interface SearchAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onSearch: (keyword: string) => void
  placeholder?: string
  inputClassName?: string
  iconClassName?: string
  dropdownClassName?: string
  variant?: 'dark' | 'light'
}

// Icon theo loại gợi ý
const typeIcons: Record<string, string> = {
  brand: '🚗',
  vehicle: '📋',
  year: '📅',
}

// Label nhóm theo loại gợi ý
const typeLabels: Record<string, string> = {
  brand: 'Hãng / Dòng xe',
  vehicle: 'Xe cụ thể',
  year: 'Năm sản xuất',
}

// Bôi đậm phần text khớp với từ khoá
function highlightMatch(text: string, query: string) {
  if (!query || query.length < 2) return text

  const lowerText = text.toLowerCase()
  const lowerQuery = query.toLowerCase()
  const idx = lowerText.indexOf(lowerQuery)

  if (idx === -1) return text

  const before = text.slice(0, idx)
  const match = text.slice(idx, idx + query.length)
  const after = text.slice(idx + query.length)

  return (
    <>
      {before}
      <span className="font-bold">{match}</span>
      {after}
    </>
  )
}

// Nhóm gợi ý theo type (brand → vehicle → year)
function groupSuggestions(items: SuggestionItem[]) {
  const groups: { type: string; items: SuggestionItem[] }[] = []
  const order = ['brand', 'vehicle', 'year']

  for (const type of order) {
    const filtered = items.filter((i) => i.type === type)
    if (filtered.length > 0) {
      groups.push({ type, items: filtered })
    }
  }

  return groups
}

export function SearchAutocomplete({
  value,
  onChange,
  onSearch,
  placeholder = 'Tìm xe theo hãng, đời, giá...',
  inputClassName = '',
  iconClassName = '',
  dropdownClassName = '',
  variant = 'dark',
}: SearchAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [dropdownLayout, setDropdownLayout] = useState<{
    top: number
    left: number
    width: number
  } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const { suggestions, isLoading } = useSearchSuggestions(value)

  // Tổng số gợi ý (dùng cho keyboard navigation)
  const flatItems = suggestions
  const totalItems = flatItems.length

  // Mở dropdown khi có kết quả hoặc đang loading
  useEffect(() => {
    if (value.trim().length >= 2 && (suggestions.length > 0 || isLoading)) {
      setIsOpen(true)
    } else {
      setIsOpen(false)
    }
    setActiveIndex(-1)
  }, [suggestions, isLoading, value])

  // Dropdown portal: đo vị trí ô tìm (tránh bị section z-index cao hơn đè, ví dụ Home hero + stats)
  useLayoutEffect(() => {
    if (!isOpen) {
      setDropdownLayout(null)
      return
    }
    const el = containerRef.current
    if (!el) return

    const update = () => {
      const rect = el.getBoundingClientRect()
      setDropdownLayout({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      })
    }
    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [isOpen])

  // Đóng khi click ra ngoài (kể cả panel trong portal)
  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      const t = e.target as Node
      if (containerRef.current?.contains(t)) return
      if (dropdownRef.current?.contains(t)) return
      setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // Chọn 1 gợi ý → điền vào ô tìm kiếm → submit tìm kiếm
  const selectSuggestion = useCallback(
    (item: SuggestionItem) => {
      onChange(item.text)
      setIsOpen(false)
      setActiveIndex(-1)
      onSearch(item.text)
    },
    [onChange, onSearch],
  )

  // Xử lý phím bấm: ArrowUp, ArrowDown, Enter, Escape
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || totalItems === 0) {
      if (e.key === 'Enter') {
        e.preventDefault()
        onSearch(value.trim())
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1))
        break
      case 'Enter':
        e.preventDefault()
        if (activeIndex >= 0 && activeIndex < totalItems) {
          selectSuggestion(flatItems[activeIndex])
        } else {
          onSearch(value.trim())
          setIsOpen(false)
        }
        break
      case 'Escape':
        setIsOpen(false)
        setActiveIndex(-1)
        break
    }
  }

  // Scroll item đang active vào view
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[data-suggestion-item]')
      items[activeIndex]?.scrollIntoView({ block: 'nearest' })
    }
  }, [activeIndex])

  const groups = groupSuggestions(suggestions)

  // Style theo variant (dark = header, light = hero search)
  const isDark = variant === 'dark'
  const dropdownBg = isDark ? 'bg-[#1A3C6E] border-white/20' : 'bg-white border-gray-200'
  const itemHover = isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'
  const itemActive = isDark ? 'bg-white/15' : 'bg-blue-50'
  const textColor = isDark ? 'text-white' : 'text-gray-900'
  const labelColor = isDark ? 'text-white/50' : 'text-gray-400'

  // Đếm index liên tục qua các nhóm để keyboard navigation
  let globalIdx = -1

  const dropdownPanel =
    isOpen && dropdownLayout ? (
      <div
        ref={dropdownRef}
        className={`fixed z-[200] max-h-80 overflow-y-auto rounded-lg border shadow-lg ${dropdownBg} ${dropdownClassName}`}
        style={{
          top: dropdownLayout.top,
          left: dropdownLayout.left,
          width: dropdownLayout.width,
        }}
      >
        {isLoading && suggestions.length === 0 ? (
          <div className={`flex items-center gap-2 px-4 py-3 ${textColor}`}>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" />
            <span className="text-sm opacity-70">Đang tìm...</span>
          </div>
        ) : (
          <ul ref={listRef} id="search-suggestions-list" role="listbox">
            {groups.map((group) => (
              <li key={group.type} role="presentation">
                <div className={`px-4 py-1.5 text-xs font-medium uppercase tracking-wide ${labelColor}`}>
                  {typeLabels[group.type] ?? group.type}
                </div>
                <ul role="group">
                  {group.items.map((item) => {
                    globalIdx++
                    const idx = globalIdx
                    const isActive = idx === activeIndex
                    return (
                      <li
                        key={`${item.type}-${item.text}`}
                        id={`suggestion-${idx}`}
                        role="option"
                        aria-selected={isActive}
                        data-suggestion-item
                        className={`flex cursor-pointer items-center gap-2 px-4 py-2 text-sm ${textColor} ${
                          isActive ? itemActive : itemHover
                        }`}
                        onMouseEnter={() => setActiveIndex(idx)}
                        onMouseDown={(e) => {
                          e.preventDefault()
                          selectSuggestion(item)
                        }}
                      >
                        <span className="shrink-0 text-base">{typeIcons[item.type] ?? '🔍'}</span>
                        <span>{highlightMatch(item.text, value.trim())}</span>
                      </li>
                    )
                  })}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>
    ) : null

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${iconClassName}`} />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (value.trim().length >= 2 && suggestions.length > 0) {
              setIsOpen(true)
            }
          }}
          placeholder={placeholder}
          className={`${inputClassName} ${value ? 'pr-8' : ''}`}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls="search-suggestions-list"
          aria-activedescendant={activeIndex >= 0 ? `suggestion-${activeIndex}` : undefined}
          autoComplete="off"
        />
        {value && (
          <button
            type="button"
            aria-label="Xóa tìm kiếm"
            className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 transition-colors ${
              isDark ? 'text-white/50 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }`}
            onMouseDown={(e) => {
              e.preventDefault()
              onChange('')
              setIsOpen(false)
              inputRef.current?.focus()
            }}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {typeof document !== 'undefined' && dropdownPanel ? createPortal(dropdownPanel, document.body) : null}
    </div>
  )
}
