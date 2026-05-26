import api from './api'
import type { SavedPost } from '../types'

export const savedPostsService = {
  async fetchMySavedPosts(): Promise<SavedPost[]> {
    const { data } = await api.get<SavedPost[]>('/saved-posts/me')
    return data
  },

  async toggle(postId: string): Promise<{ saved: boolean }> {
    const { data } = await api.post<{ saved: boolean }>('/saved-posts', { postId })
    return data
  },
}
