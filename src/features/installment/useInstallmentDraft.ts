import { useState, useEffect, useCallback, useRef } from 'react'
import { installmentService, type InstallmentApplicationDTO, type InstallmentApplicationPayload } from '@/services/installment.service'
import type { FullInstallmentData } from '@/features/installment/installmentSchema'

const STORAGE_KEY = 'installment_draft'

interface DraftState {
  vehicleId: number
  formData: Partial<FullInstallmentData>
  currentStep: number
  applicationId: number | null
}

export function useInstallmentDraft(vehicleId: number) {
  const [applicationId, setApplicationId] = useState<number | null>(null)
  const [application, setApplication] = useState<InstallmentApplicationDTO | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load existing DRAFT from API on mount
  useEffect(() => {
    let cancelled = false
    async function loadDraft() {
      try {
        const apps = await installmentService.getMyApplications()
        const draft = apps.find(
          (a) => a.vehicleId === vehicleId && a.status === 'DRAFT',
        )
        if (draft && !cancelled) {
          setApplicationId(draft.id)
          setApplication(draft)
        }
      } catch {
        // No existing draft — that's ok
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    loadDraft()
    return () => { cancelled = true }
  }, [vehicleId])

  const saveDraft = useCallback(
    (formData: Partial<FullInstallmentData>) => {
      if (isLoading) return
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(async () => {
        setIsSaving(true)
        setError(null)
        try {
          const payload: InstallmentApplicationPayload = {
            vehicleId,
            ...formData,
            dob: formData.dob || undefined,
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
          const msg = e instanceof Error ? e.message : 'Lỗi lưu bản nháp'
          setError(msg)
        } finally {
          setIsSaving(false)
        }
      }, 2000)
    },
    [vehicleId, applicationId, isLoading],
  )

  // Submit final application (change status to PENDING_DOCUMENT)
  const submitApplication = useCallback(
    async (formData: FullInstallmentData) => {
      setIsSaving(true)
      setError(null)
      try {
        const payload: InstallmentApplicationPayload = {
          vehicleId,
          ...formData,
          dob: formData.dob || undefined,
          status: 'PENDING_DOCUMENT',
        }
        let result: InstallmentApplicationDTO
        if (applicationId) {
          result = await installmentService.update(applicationId, payload)
        } else {
          result = await installmentService.create(payload)
        }
        setApplication(result)
        setApplicationId(result.id)
        // Clear local draft
        localStorage.removeItem(`${STORAGE_KEY}_step_${vehicleId}`)
        return result
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Lỗi gửi hồ sơ'
        setError(msg)
        throw e
      } finally {
        setIsSaving(false)
      }
    },
    [vehicleId, applicationId],
  )

  // Persist current step locally (survives page refresh)
  const saveStep = useCallback(
    (step: number) => {
      localStorage.setItem(`${STORAGE_KEY}_step_${vehicleId}`, String(step))
    },
    [vehicleId],
  )

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
