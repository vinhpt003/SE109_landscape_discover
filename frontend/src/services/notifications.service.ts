import api from './api'
import type { NotificationsPaginated, Notification } from '../types'

interface FetchParams {
  unreadOnly?: boolean
  page?: number
  limit?: number
}

export const notificationsService = {
  async fetchMine(params?: FetchParams): Promise<NotificationsPaginated> {
    const { data } = await api.get<NotificationsPaginated>('/notifications/me', { params })
    return data
  },

  async markRead(id: string): Promise<Notification> {
    const { data } = await api.patch<Notification>(`/notifications/${id}/read`)
    return data
  },

  async markAllRead(): Promise<{ count: number }> {
    const { data } = await api.post<{ count: number }>('/notifications/read-all')
    return data
  },
}
