import api from './api'
import type { Comment } from '../types'

export const commentsService = {
  async fetchByPost(postId: string): Promise<Comment[]> {
    const { data } = await api.get<Comment[]>('/comments', { params: { postId } })
    return data
  },

  async create(postId: string, content: string): Promise<Comment> {
    const { data } = await api.post<Comment>('/comments', { postId, content })
    return data
  },

  async remove(commentId: string): Promise<void> {
    await api.delete(`/comments/${commentId}`)
  },
}
