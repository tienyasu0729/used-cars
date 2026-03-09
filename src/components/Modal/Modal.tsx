interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg' }

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} aria-hidden />
      <div className={`relative bg-white rounded-lg shadow-xl ${sizeClasses[size]} w-full mx-4 p-6 max-h-[90vh] overflow-y-auto`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        {children}
      </div>
    </div>
  )
}
