import type { Car } from '@/types'
import placeholderCar from '@/img/placeholder-car.jpg'

const PLACEHOLDER = placeholderCar

interface CarImageProps {
  car: Car
  index?: number
  className?: string
  aspectRatio?: '4/3' | 'video' | 'square' | 'fill'
}

export function CarImage({ car, index = 0, className = '', aspectRatio = '4/3' }: CarImageProps) {
  const src = car.images?.[index] ?? PLACEHOLDER
  const aspectClass =
    aspectRatio === 'fill'
      ? ''
      : aspectRatio === 'video'
        ? 'aspect-video'
        : aspectRatio === 'square'
          ? 'aspect-square'
          : 'aspect-[4/3]'

  return (
    <div className={`bg-gray-200 overflow-hidden ${aspectClass} ${className}`.trim()}>
      <img
        src={src}
        alt={car.name}
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover"
        onError={(e) => {
          const target = e.currentTarget
          if (target.src !== PLACEHOLDER) {
            target.src = PLACEHOLDER
          }
        }}
      />
    </div>
  )
}
