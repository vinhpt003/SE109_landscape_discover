import api from './api'
import type { Location, Region } from '../types'

export interface CreateLocationPayload {
  locationName: string
  description?: string
  coordinates?: string
  region?: Region
}

export const locationsService = {
  async fetchLocations(): Promise<Location[]> {
    const { data } = await api.get<Location[]>('/locations')
    return data
  },

  async fetchLocationById(id: string): Promise<Location> {
    const { data } = await api.get<Location>(`/locations/${id}`)
    return data
  },

  async createLocation(payload: CreateLocationPayload): Promise<Location> {
    const { data } = await api.post<Location>('/locations', payload)
    return data
  },
}
