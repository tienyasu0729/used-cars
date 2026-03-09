import type { Showroom } from '@/types'
import { API_CONFIG } from '@/config/apiConfig'
import { mockResponse } from './mockService'
import { httpClient } from './baseApi'
import { mockShowrooms } from '@/mock/mockShowrooms'

export const showroomsApi = {
  async getShowrooms(): Promise<Showroom[]> {
    if (API_CONFIG.USE_MOCK) return mockResponse([...mockShowrooms])
    const res = await httpClient.get<Showroom[]>('/showrooms')
    return res.data
  },

  async getShowroomById(id: string): Promise<Showroom | undefined> {
    if (API_CONFIG.USE_MOCK) return mockResponse(mockShowrooms.find((s) => s.id === id))
    const res = await httpClient.get<Showroom>(`/showrooms/${id}`)
    return res.data
  },

  async updateShowroom(id: string, data: Partial<Showroom>): Promise<Showroom | undefined> {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(() => {
        const idx = mockShowrooms.findIndex((s) => s.id === id)
        if (idx === -1) return Promise.resolve(undefined)
        mockShowrooms[idx] = { ...mockShowrooms[idx], ...data }
        return Promise.resolve(mockShowrooms[idx])
      })
    }
    const res = await httpClient.patch<Showroom>(`/showrooms/${id}`, data)
    return res.data
  },
}
