type Variant = 'success' | 'error' | 'warning' | 'default' | 'primary'

interface BadgeProps {
  children: React.ReactNode
  variant?: Variant
  className?: string
}

const variants: Record<Variant, string> = {
  success: 'bg-green-100 text-green-800',
  error: 'bg-red-100 text-red-800',
  warning: 'bg-yellow-100 text-yellow-800',
  default: 'bg-gray-100 text-gray-800',
  primary: 'bg-[#FF6600]/10 text-[#FF6600]',
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
