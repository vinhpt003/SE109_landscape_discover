import api from './api'
import type { AuthResponse } from '../types'

export const authService = {
  async login(identifier: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', { identifier, password })
    return data
  },

  async register(userName: string, email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/register', { userName, email, password })
    return data
  },
}
