import { useCallback, useEffect, useRef, useState } from 'react'
import { installmentService, type InstallmentApplicationDTO, type InstallmentApplicationPayload } from '@/services/installment.service'
import type { FullInstallmentData } from '@/features/installment/installmentSchema'
import { ddMmYyyyToIso } from '@/utils/dateDdMmYyyy'

const STORAGE_KEY = 'installment_draft'

function normalizeInstallmentDates(formData: Partial<FullInstallmentData>): Partial<FullInstallmentData> {
  const normalized = { ...formData }
  if (typeof normalized.dob === 'string') normalized.dob = ddMmYyyyToIso(normalized.dob) ?? normalized.dob
  if (typeof normalized.identityIssuedDate === 'string') normalized.identityIssuedDate = ddMmYyyyToIso(normalized.identityIssuedDate) ?? normalized.identityIssuedDate
  if (typeof normalized.signedDate === 'string') normalized.signedDate = ddMmYyyyToIso(normalized.signedDate) ?? normalized.signedDate
  return normalized
}

export function useInstallmentDraft(vehicleId: number) {
  const [applicationId, setApplicationId] = useState<number | null>(null)
  const [application, setApplication] = useState<InstallmentApplicationDTO | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isSubmittedRef = useRef(false)

  useEffect(() => {
    let cancelled = false
    async function loadDraft() {
      try {
        const apps = await installmentService.getMyApplications()
        const draft = apps.find((a) => a.vehicleId === vehicleId && a.status === 'DRAFT')
        if (draft && !cancelled) {
          setApplicationId(draft.id)
          setApplication(draft)
        }
      } catch {
        // no-op
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    loadDraft()
    return () => { cancelled = true }
  }, [vehicleId])

  const saveDraft = useCallback((formData: Partial<FullInstallmentData>) => {
    if (isLoading || isSubmittedRef.current) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setIsSaving(true)
      setError(null)
      try {
        const normalized = normalizeInstallmentDates(formData)
        const payload: InstallmentApplicationPayload = {
          vehicleId,
          ...normalized,
          dob: normalized.dob || undefined,
          status: 'DRAFT',
        }
        if (applicationId) {
          const updated = await installmentService.update(applicationId, payload)
          setApplication(updated)
        } else {
          const created = await installmentService.create(payload)
          setApplicationId(created.id)
          setApplication(created)
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Loi luu ban nhap'
        setError(msg)
      } finally {
        setIsSaving(false)
      }
    }, 2000)
  }, [vehicleId, applicationId, isLoading])

  const submitApplication = useCallback(async (formData: FullInstallmentData) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
      debounceRef.current = null
    }
    isSubmittedRef.current = true
    setIsSaving(true)
    setError(null)
    try {
      const normalized = normalizeInstallmentDates(formData)
      const payload: InstallmentApplicationPayload = {
        vehicleId,
        ...normalized,
        dob: normalized.dob || undefined,
        status: 'PENDING_DOCUMENT',
      }
      const result = applicationId
        ? await installmentService.update(applicationId, payload)
        : await installmentService.create(payload)
      setApplication(result)
      setApplicationId(result.id)
      localStorage.removeItem(`${STORAGE_KEY}_step_${vehicleId}`)
      return result
    } catch (e: unknown) {
      isSubmittedRef.current = false
      const msg = e instanceof Error ? e.message : 'Loi gui ho so'
      setError(msg)
      throw e
    } finally {
      setIsSaving(false)
    }
  }, [vehicleId, applicationId])

  const saveStep = useCallback((step: number) => {
    localStorage.setItem(`${STORAGE_KEY}_step_${vehicleId}`, String(step))
  }, [vehicleId])

  const loadStep = useCallback((): number => {
    const s = localStorage.getItem(`${STORAGE_KEY}_step_${vehicleId}`)
    return s ? parseInt(s, 10) : 1
  }, [vehicleId])

  return {
    applicationId,
    application,
    isSaving,
    isLoading,
    error,
    saveDraft,
    submitApplication,
    saveStep,
    loadStep,
  }
}
