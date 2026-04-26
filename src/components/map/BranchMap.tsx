// Component hiển thị bản đồ GoongMap với marker cho từng chi nhánh
// Dùng @goongmaps/goong-js trực tiếp (vanilla JS) thay vì goong-map-react (không tương thích React 19)
import { useRef, useEffect, useMemo } from 'react'
import goongjs from '@goongmaps/goong-js'

const GOONG_MAPTILES_KEY = import.meta.env.VITE_GOONG_MAPTILES_KEY || ''

const DEFAULT_LAT = 16.0544
const DEFAULT_LNG = 108.2022
const DEFAULT_ZOOM = 12

// Chỉ cần các field mà BranchMap thực sự sử dụng — tương thích cả Branch lẫn AdminBranch
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
  return branches.map((b) => `${b.id}:${b.lat}:${b.lng}`).join('|')
}

export function BranchMap({ branches, zoom }: BranchMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<goongjs.Map | null>(null)

  // Chỉ tạo key mới khi dữ liệu thực sự thay đổi (id, lat, lng)
  const branchKey = useMemo(() => buildBranchKey(branches), [branches])
  // Lưu branches vào ref để useEffect truy cập mà không phụ thuộc vào reference
  const branchesRef = useRef(branches)
  branchesRef.current = branches

  useEffect(() => {
    if (!mapContainerRef.current || !GOONG_MAPTILES_KEY) return

    const currentBranches = branchesRef.current

    // Xoá map cũ nếu có (khi data thực sự thay đổi)
    if (mapRef.current) {
      mapRef.current.remove()
      mapRef.current = null
    }

    goongjs.accessToken = GOONG_MAPTILES_KEY

    // Tính center từ danh sách chi nhánh
    let centerLat = DEFAULT_LAT
    let centerLng = DEFAULT_LNG
    if (currentBranches.length > 0) {
      centerLat = currentBranches.reduce((s, b) => s + b.lat, 0) / currentBranches.length
      centerLng = currentBranches.reduce((s, b) => s + b.lng, 0) / currentBranches.length
    }

    const map = new goongjs.Map({
      container: mapContainerRef.current,
      style: 'https://tiles.goong.io/assets/goong_map_web.json',
      center: [centerLng, centerLat],
      zoom: zoom ?? DEFAULT_ZOOM,
    })

    mapRef.current = map

    // Resize map khi tiles đã load xong (tránh bị xám do container chưa có kích thước chính xác)
    map.on('load', () => map.resize())

    // Tự resize khi container thay đổi kích thước (responsive, tab switch, lazy load)
    const ro = new ResizeObserver(() => {
      if (mapRef.current) mapRef.current.resize()
    })
    ro.observe(mapContainerRef.current)

    // Thêm marker + popup cho từng chi nhánh
    currentBranches.forEach((branch) => {
      const el = document.createElement('div')
      el.style.cssText = 'width:28px;height:28px;cursor:pointer;'
      el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ef4444" stroke="#b91c1c" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/></svg>`

      const popup = new goongjs.Popup({ offset: 25 }).setHTML(
        `<div style="min-width:180px;padding:4px">
          <p style="font-weight:700;font-size:14px;color:#0f172a;margin:0">${branch.name}</p>
          <p style="font-size:12px;color:#475569;margin:4px 0 0">${branch.address}</p>
          ${branch.phone ? `<p style="font-size:12px;color:#64748b;margin:4px 0 0">SĐT: ${branch.phone}</p>` : ''}
        </div>`,
      )

      new goongjs.Marker({ element: el })
        .setLngLat([branch.lng, branch.lat])
        .setPopup(popup)
        .addTo(map)
    })

    // Nếu có nhiều chi nhánh -> fitBounds để hiển thị tất cả
    if (currentBranches.length >= 2) {
      const bounds = new goongjs.LngLatBounds()
      currentBranches.forEach((b) => bounds.extend([b.lng, b.lat]))
      map.fitBounds(bounds, { padding: 60, maxZoom: 14 })
    }

    return () => {
      ro.disconnect()
      map.remove()
      mapRef.current = null
    }
    // branchKey thay đổi khi dữ liệu (id/lat/lng) thực sự khác, không phải khi reference mảng khác
  }, [branchKey, zoom])

  if (!GOONG_MAPTILES_KEY) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-100 text-sm text-slate-500">
        Chưa cấu hình GoongMap API Key
      </div>
    )
  }

  return <div ref={mapContainerRef} className="h-full w-full" />
}
