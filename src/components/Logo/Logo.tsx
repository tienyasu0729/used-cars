import logoImg from '@/img/logo.jpg'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = { sm: 'w-10 h-10', md: 'w-12 h-12', lg: 'w-16 h-16' }

export function Logo({ size = 'sm', className = '' }: LogoProps) {
  return (
    <img
      src={logoImg}
      alt="SCUDN"
      className={`object-contain ${sizes[size]} ${className}`}
    />
  )
}
