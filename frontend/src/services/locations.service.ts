import api from './api'
import type { Location } from '../types'

export const locationsService = {
  async fetchLocations(): Promise<Location[]> {
    const { data } = await api.get<Location[]>('/locations')
    return data
  },

  async fetchLocationById(id: string): Promise<Location> {
    const { data } = await api.get<Location>(`/locations/${id}`)
    return data
  },
}
