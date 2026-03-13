import { Link } from 'react-router-dom'

import logoImg from '@/assets/logo/logo.png'

interface BrandLogoProps {
  variant?: 'light' | 'dark'
  linkTo?: string | null
  className?: string
  logoHeight?: number
}

export function BrandLogo({ variant = 'dark', linkTo = '/', className = '', logoHeight = 32 }: BrandLogoProps) {
  const dnColor = variant === 'light' ? 'text-slate-900' : 'text-white'

  const content = (
    <div className={`flex items-center gap-3 ${className}`}>
      <img
        src={logoImg}
        alt=""
        className="h-auto w-auto object-contain"
        style={{ height: logoHeight }}
        aria-hidden
      />
      <span className="text-xl font-bold tracking-tight">
        <span className="text-[#E8612A]">SCU</span>
        <span className={dnColor}>DN</span>
      </span>
    </div>
  )

  if (linkTo) {
    return (
      <Link
        to={linkTo}
        className="flex shrink-0 cursor-pointer items-center"
        aria-label="Go to homepage"
      >
        {content}
      </Link>
    )
  }

  return <div className="flex shrink-0 items-center">{content}</div>
}
