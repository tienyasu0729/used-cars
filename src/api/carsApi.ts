import type { Car } from '@/types'
import { mockCars } from '@/mock/mockCars'
import { API_CONFIG } from '@/config/apiConfig'
import { mockResponse } from './mockService'
import { httpClient } from './baseApi'

export const carsApi = {
  async getCars(): Promise<Car[]> {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse([...mockCars])
    }
    const res = await httpClient.get<Car[]>('/cars')
    return res.data
  },

  async getCarById(id: string): Promise<Car | undefined> {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(mockCars.find((c) => c.id === id))
    }
    const res = await httpClient.get<Car>(`/cars/${id}`)
    return res.data
  },

  async createCarListing(data: Omit<Car, 'id' | 'views'>): Promise<Car> {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(() => {
        const newCar: Car = { ...data, id: `car-${Date.now()}`, views: 0 }
        mockCars.push(newCar)
        return Promise.resolve(newCar)
      })
    }
    const res = await httpClient.post<Car>('/cars', data)
    return res.data
  },

  async updateCar(id: string, data: Partial<Car>): Promise<Car | undefined> {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(() => {
        const idx = mockCars.findIndex((c) => c.id === id)
        if (idx === -1) return Promise.resolve(undefined)
        mockCars[idx] = { ...mockCars[idx], ...data }
        return Promise.resolve(mockCars[idx])
      })
    }
    const res = await httpClient.patch<Car>(`/cars/${id}`, data)
    return res.data
  },

  async deleteCar(id: string): Promise<boolean> {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(() => {
        const idx = mockCars.findIndex((c) => c.id === id)
        if (idx === -1) return Promise.resolve(false)
        mockCars.splice(idx, 1)
        return Promise.resolve(true)
      })
    }
    await httpClient.delete(`/cars/${id}`)
    return true
  },
}
