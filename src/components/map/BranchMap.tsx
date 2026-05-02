import { useEffect, useMemo, useRef, useState } from 'react'
import goongjs from '@goongmaps/goong-js'

const GOONG_MAPTILES_KEY = import.meta.env.VITE_GOONG_MAPTILES_KEY || ''

const DEFAULT_LAT = 16.0544
const DEFAULT_LNG = 108.2022
const DEFAULT_ZOOM = 12

type GoongMapInstance = InstanceType<typeof goongjs.Map>

export interface BranchMapItem {
  id: string | number
  name: string
  address: string
  phone?: string
  lat: number
  lng: number
}

interface BranchMapProps {
  branches: BranchMapItem[]
  zoom?: number
}

function buildBranchKey(branches: BranchMapItem[]): string {
  return branches.map((branch) => `${branch.id}:${branch.lat}:${branch.lng}`).join('|')
}

export function BranchMap({ branches, zoom }: BranchMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<GoongMapInstance | null>(null)
  const [mapError, setMapError] = useState<{ key: string; message: string } | null>(null)
  const [containerVisible, setContainerVisible] = useState(false)

  const branchKey = useMemo(() => buildBranchKey(branches), [branches])
  const branchesRef = useRef(branches)

  useEffect(() => {
    branchesRef.current = branches
  }, [branches])

  const activeMapError = mapError?.key === branchKey ? mapError.message : null

  useEffect(() => {
    const container = mapContainerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((entry) => entry.isIntersecting)
        setContainerVisible(visible)
      },
      { threshold: 0.05 },
    )

    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const container = mapContainerRef.current
    if (!container || !GOONG_MAPTILES_KEY || !containerVisible) return
    if (container.clientWidth <= 0 || container.clientHeight <= 0) return

    const currentBranches = branchesRef.current

    if (mapRef.current) {
      mapRef.current.remove()
      mapRef.current = null
    }

    goongjs.accessToken = GOONG_MAPTILES_KEY

    let centerLat = DEFAULT_LAT
    let centerLng = DEFAULT_LNG
    if (currentBranches.length > 0) {
      centerLat = currentBranches.reduce((sum, branch) => sum + branch.lat, 0) / currentBranches.length
      centerLng = currentBranches.reduce((sum, branch) => sum + branch.lng, 0) / currentBranches.length
    }

    const map = new goongjs.Map({
      container,
      style: 'https://tiles.goong.io/assets/goong_map_web.json',
      center: [centerLng, centerLat],
      zoom: zoom ?? DEFAULT_ZOOM,
    })

    mapRef.current = map

    const loadTimeout = window.setTimeout(() => {
      if (mapRef.current === map) {
        setMapError({
          key: branchKey,
          message: 'Bản đồ tải quá lâu. Bạn có thể dùng danh sách chi nhánh bên dưới.',
        })
      }
    }, 8000)

    map.on('load', () => {
      window.clearTimeout(loadTimeout)
      setMapError((current) => (current?.key === branchKey ? null : current))
      map.resize()
    })

    map.on('error', () => {
      setMapError({
        key: branchKey,
        message: 'Không thể hiển thị bản đồ lúc này.',
      })
    })

    const resizeObserver = new ResizeObserver(() => {
      mapRef.current?.resize()
    })
    resizeObserver.observe(container)

    currentBranches.forEach((branch) => {
      const markerElement = document.createElement('div')
      markerElement.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:6px;transform:translateY(-8px);cursor:pointer;'
      markerElement.innerHTML = `
        <div style="max-width:180px;padding:4px 10px;border-radius:999px;background:rgba(15,23,42,0.88);color:#fff;font-size:12px;font-weight:700;line-height:1.2;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;box-shadow:0 8px 24px rgba(15,23,42,0.22);">
          ${branch.name}
        </div>
        <div style="width:28px;height:28px;">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ef4444" stroke="#b91c1c" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/></svg>
        </div>
      `

      const popup = new goongjs.Popup({ offset: 25 }).setHTML(
        `<div style="min-width:180px;padding:4px">
          <p style="font-weight:700;font-size:14px;color:#0f172a;margin:0">${branch.name}</p>
          <p style="font-size:12px;color:#475569;margin:4px 0 0">${branch.address}</p>
          ${branch.phone ? `<p style="font-size:12px;color:#64748b;margin:4px 0 0">SĐT: ${branch.phone}</p>` : ''}
        </div>`,
      )

      new goongjs.Marker({ element: markerElement })
        .setLngLat([branch.lng, branch.lat])
        .setPopup(popup)
        .addTo(map)
    })

    if (currentBranches.length >= 2) {
      const bounds = new goongjs.LngLatBounds()
      currentBranches.forEach((branch) => bounds.extend([branch.lng, branch.lat]))
      map.fitBounds(bounds, { padding: 60, maxZoom: 14 })
    }

    return () => {
      window.clearTimeout(loadTimeout)
      resizeObserver.disconnect()
      map.remove()
      mapRef.current = null
    }
  }, [branchKey, containerVisible, zoom])

  const mapFallback = (
    <div className="flex h-full w-full flex-col justify-center gap-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
      <p className="font-semibold text-slate-800">{activeMapError ?? 'Chưa thể hiển thị bản đồ Goong.'}</p>
      <div className="space-y-2">
        {branches.map((branch) => (
          <div key={branch.id} className="rounded-lg border border-slate-200 bg-white p-3">
            <p className="font-medium text-slate-900">{branch.name}</p>
            <p className="mt-1 text-slate-600">{branch.address}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {branch.phone ? <span className="text-xs text-slate-500">SĐT: {branch.phone}</span> : null}
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${branch.lat},${branch.lng}`)}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-[#1A3C6E] hover:underline"
              >
                Mở trên Google Maps
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  if (!GOONG_MAPTILES_KEY) {
    return mapFallback
  }

  if (activeMapError) {
    return mapFallback
  }

  return <div ref={mapContainerRef} className="h-full w-full min-h-[280px]" />
}
