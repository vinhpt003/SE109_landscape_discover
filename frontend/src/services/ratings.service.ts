import api from './api'
import type { Rating, RatingSummary } from '../types'

export const ratingsService = {
  async upsert(postId: string, score: number): Promise<Rating> {
    const { data } = await api.post<Rating>('/ratings', { postId, score })
    return data
  },

  async getSummary(postId: string): Promise<RatingSummary> {
    const { data } = await api.get<RatingSummary>(`/ratings/summary/${postId}`)
    return data
  },
}
