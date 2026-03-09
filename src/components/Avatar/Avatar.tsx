interface AvatarProps {
  src?: string
  alt?: string
  name?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' }

export function Avatar({ src, alt, name, size = 'md', className = '' }: AvatarProps) {
  const initials = name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div
      className={`rounded-full overflow-hidden flex items-center justify-center bg-gray-200 text-gray-600 font-medium ${sizes[size]} ${className}`}
    >
      {src ? (
        <img src={src} alt={alt ?? name} className="w-full h-full object-cover" />
      ) : (
        initials ?? '?'
      )}
    </div>
  )
}
