import api from './api'
import type { User } from '../types'

interface UpdateProfilePayload {
  userName?: string
  avatar?: string
  currentPassword?: string
  newPassword?: string
}

export const usersService = {
  async fetchAll(params?: { page?: number; limit?: number }): Promise<{ data: User[]; total: number; page: number; limit: number }> {
    const { data } = await api.get<{ data: User[]; total: number; page: number; limit: number }>('/users', { params })
    return data
  },

  async updateRole(userId: string, role: 'RegisteredUser' | 'Editor'): Promise<User> {
    const { data } = await api.patch<User>(`/users/${userId}/role`, { role })
    return data
  },

  async getMe(): Promise<User> {
    const { data } = await api.get<User>('/users/me')
    return data
  },

  async updateMe(payload: UpdateProfilePayload): Promise<User> {
    const { data } = await api.patch<User>('/users/me', payload)
    return data
  },
}
