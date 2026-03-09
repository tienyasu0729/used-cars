import { API_CONFIG } from '@/config/apiConfig'
import { mockResponse } from './mockService'
import { httpClient } from './baseApi'

export interface InspectionTask {
  id: string
  carId: string
  carName: string
  showroomName: string
  showroomAddress: string
  lat?: number
  lng?: number
  appointmentTime: string
  status: 'waiting' | 'in_progress' | 'completed'
}

export interface InspectionGroup {
  id: string
  name: string
  items: { id: string; label: string; critical?: boolean }[]
}

export interface InspectionResult {
  itemId: string
  pass: boolean
  media?: string[]
}

export const inspectorApi = {
  async getInspectionTasks() {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(async () => {
        const { mockInspectionTasks } = await import('@/mock/mockInspector')
        return [...mockInspectionTasks]
      })
    }
    const res = await httpClient.get<InspectionTask[]>('/inspector/tasks')
    return res.data
  },

  async getTaskById(carId: string) {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(async () => {
        const { mockInspectionTasks } = await import('@/mock/mockInspector')
        return mockInspectionTasks.find((t) => t.carId === carId)
      })
    }
    const res = await httpClient.get<InspectionTask>(`/inspector/tasks/${carId}`)
    return res.data
  },

  async getShowroomImages(carId: string) {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(async () => {
        const { mockShowroomImages } = await import('@/mock/mockInspector')
        return mockShowroomImages[carId] ?? ['/img1.jpg', '/img2.jpg']
      })
    }
    const res = await httpClient.get<string[]>(`/inspector/cars/${carId}/images`)
    return res.data
  },

  async verifyImageMatch(carId: string, imageIndex: number, match: boolean) {
    if (API_CONFIG.USE_MOCK) return mockResponse({ success: true, flagged: !match })
    const res = await httpClient.post<{ success: boolean; flagged: boolean }>(
      `/inspector/cars/${carId}/verify-image`,
      { imageIndex, match }
    )
    return res.data
  },

  async submitInspectionChecklist(carId: string, results: InspectionResult[]) {
    if (API_CONFIG.USE_MOCK) return mockResponse({ success: true })
    await httpClient.post(`/inspector/cars/${carId}/checklist`, { results })
    return { success: true }
  },

  async getInspectionChecklist() {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(async () => {
        const { mockInspectionChecklist } = await import('@/mock/mockInspector')
        return [...mockInspectionChecklist]
      })
    }
    const res = await httpClient.get('/inspector/checklist')
    return res.data
  },

  async certifyVehicle(carId: string) {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(async () => {
        const { mockInspectionTasks } = await import('@/mock/mockInspector')
        const t = mockInspectionTasks.find((x) => x.carId === carId)
        if (t) t.status = 'completed'
        return { success: true }
      })
    }
    await httpClient.post(`/inspector/cars/${carId}/certify`)
    return { success: true }
  },

  async rejectCertification(carId: string, reason: string) {
    if (API_CONFIG.USE_MOCK) return mockResponse({ success: true })
    await httpClient.post(`/inspector/cars/${carId}/reject-certification`, { reason })
    return { success: true }
  },

  async uploadInspectionMedia(carId: string, file: File, itemId?: string) {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse({
        success: true,
        url: URL.createObjectURL(file),
        mediaId: `insp-${Date.now()}`,
      })
    }
    const form = new FormData()
    form.append('file', file)
    if (itemId) form.append('itemId', itemId)
    const res = await httpClient.post<{ success: boolean; url: string; mediaId: string }>(
      `/inspector/cars/${carId}/media`,
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
    return res.data
  },
}
