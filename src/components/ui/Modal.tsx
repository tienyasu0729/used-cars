import { useEffect } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  footer?: React.ReactNode
  layerClassName?: string
  panelClassName?: string
  bodyClassName?: string
  viewportClassName?: string
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  layerClassName = 'z-50',
  panelClassName = '',
  bodyClassName = '',
  viewportClassName = '',
}: ModalProps) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className={`fixed inset-0 ${layerClassName}`}>
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative z-10 flex h-full w-full items-start justify-center overflow-hidden px-4 pb-12 pt-[72px] sm:px-6 sm:pb-14 sm:pt-20 ${viewportClassName}`.trim()}>
        <div className={`mt-0 max-h-[calc(100vh-8.5rem)] w-full max-w-lg rounded-xl bg-white p-6 shadow-xl sm:max-h-[calc(100vh-9.5rem)] ${panelClassName}`.trim()}>
          <div className="mb-4 flex items-center justify-between">
            {title && <h2 className="text-lg font-semibold text-gray-900">{title}</h2>}
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-gray-500 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className={bodyClassName}>{children}</div>
          {footer && <div className="mt-4 flex flex-wrap justify-end gap-2">{footer}</div>}
        </div>
      </div>
    </div>
  )
}
