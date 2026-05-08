import { useEffect, useMemo, useState } from 'react'
import { getVehicleDisplayImageCandidates } from '@/utils/vehicleImage'

interface FallbackImageProps {
  sources: Array<string | null | undefined>
  fallback?: string
  alt: string
  className?: string
}

export function FallbackImage({
  sources,
  fallback = 'https://placehold.co/160x112?text=No+Image',
  alt,
  className,
}: FallbackImageProps) {
  const candidates = useMemo(
    () => getVehicleDisplayImageCandidates(sources, fallback),
    [fallback, sources],
  )
  const [index, setIndex] = useState(0)

  useEffect(() => {
    setIndex(0)
  }, [candidates])

  return (
    <img
      src={candidates[Math.min(index, candidates.length - 1)]}
      alt={alt}
      className={className}
      onError={() => {
        setIndex((prev) => (prev < candidates.length - 1 ? prev + 1 : prev))
      }}
    />
  )
}
