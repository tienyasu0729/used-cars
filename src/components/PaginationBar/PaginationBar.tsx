interface PaginationBarProps {
  rangeText: string
  page: number
  totalPages: number
  pageNumbers: number[]
  onPageChange: (page: number) => void
  align?: 'left' | 'right' | 'between'
}

export function PaginationBar({
  rangeText,
  page,
  totalPages,
  pageNumbers,
  onPageChange,
  align = 'between',
}: PaginationBarProps) {
  const alignClass = align === 'right' ? 'justify-end' : align === 'left' ? 'justify-start' : 'justify-between'

  return (
    <div className={`flex items-center gap-2 mt-4 ${alignClass}`}>
      <span className="text-sm text-gray-500">{rangeText}</span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-100"
        >
          &lt;
        </button>
        {pageNumbers.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onPageChange(n)}
            className={`px-3 py-1 rounded-lg ${page === n ? 'bg-[#FF6600] text-white' : 'border hover:bg-gray-100'}`}
          >
            {n}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-100"
        >
          &gt;
        </button>
      </div>
    </div>
  )
}
