import { API_CONFIG } from '@/config/apiConfig'
import { mockResponse } from './mockService'
import { httpClient } from './baseApi'

export interface CarType {
  id: string
  name: string
}

export interface CarBrand {
  id: string
  name: string
  types: CarType[]
}

export const categoriesApi = {
  async getCarCategories(): Promise<CarBrand[]> {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(async () => {
        const { mockCarCategories } = await import('@/mock/mockCategory')
        return [...mockCarCategories]
      })
    }
    const res = await httpClient.get<CarBrand[]>('/api/categories')
    return res.data
  },

  async createCategory(data: Omit<CarBrand, 'id'>) {
    if (API_CONFIG.USE_MOCK) return mockResponse({ success: true, id: `cat-${Date.now()}` })
    const res = await httpClient.post<{ success: boolean; id: string }>('/api/categories', data)
    return res.data
  },

  async updateCategory(id: string, data: Partial<CarBrand>) {
    if (API_CONFIG.USE_MOCK) return mockResponse({ success: true })
    await httpClient.patch(`/api/categories/${id}`, data)
    return { success: true }
  },

  async deleteCategory(id: string) {
    if (API_CONFIG.USE_MOCK) return mockResponse({ success: true })
    await httpClient.delete(`/api/categories/${id}`)
    return { success: true }
  },
}
