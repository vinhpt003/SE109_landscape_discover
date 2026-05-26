import api from './api'
import type { User } from '../types'

interface UpdateProfilePayload {
  userName?: string
  avatar?: string
  currentPassword?: string
  newPassword?: string
}

export const usersService = {
  async getMe(): Promise<User> {
    const { data } = await api.get<User>('/users/me')
    return data
  },

  async updateMe(payload: UpdateProfilePayload): Promise<User> {
    const { data } = await api.patch<User>('/users/me', payload)
    return data
  },
}
