import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'outline' | 'ghost' | 'danger' | 'dark' | 'gray'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  children: React.ReactNode
}

const variants: Record<Variant, string> = {
  primary: 'bg-[#FF6600] text-white hover:bg-[#e55c00] border-transparent',
  outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100',
  danger: 'bg-red-500 text-white hover:bg-red-600 border-transparent',
  dark: 'bg-black text-white border border-black hover:bg-gray-800 hover:border-gray-800',
  gray: 'bg-gray-500 text-white border border-gray-500 hover:bg-gray-600 hover:border-gray-600',
}

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`rounded-lg font-medium transition-colors ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
