import { useEffect, useState } from 'react'
import { vehicleService } from '@/services/vehicle.service'

const FALLBACK_FUEL = ['Xăng', 'Dầu', 'Điện', 'Hybrid']
const FALLBACK_TRANSMISSION = ['Số tự động', 'Số sàn']

export function useVehicleRegistryLabels() {
  const [fuelOptions, setFuelOptions] = useState<string[]>(FALLBACK_FUEL)
  const [transmissionOptions, setTransmissionOptions] = useState<string[]>(FALLBACK_TRANSMISSION)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [fuels, trans] = await Promise.all([
          vehicleService.getCatalogFuelTypesActive(),
          vehicleService.getCatalogTransmissionsActive(),
        ])
        if (cancelled) return
        if (fuels.length > 0) setFuelOptions(fuels)
        if (trans.length > 0) setTransmissionOptions(trans)
      } catch {
        if (!cancelled) {
          setFuelOptions(FALLBACK_FUEL)
          setTransmissionOptions(FALLBACK_TRANSMISSION)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return { fuelOptions, transmissionOptions }
}
