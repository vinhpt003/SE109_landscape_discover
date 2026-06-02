import api from './api'
import type { DashboardStats } from '../types'

export const statsService = {
  async fetchDashboard(): Promise<DashboardStats> {
    const { data } = await api.get<DashboardStats>('/stats/dashboard')
    return data
  },
}
