import api from './api'
import type { Comment, CommentWithPost } from '../types'

export const commentsService = {
  async fetchByPost(postId: string): Promise<Comment[]> {
    const { data } = await api.get<Comment[]>('/comments', { params: { postId } })
    return data
  },

  async fetchAll(params?: { postId?: string; userId?: string; page?: number; limit?: number }): Promise<CommentWithPost[]> {
    const { data } = await api.get<CommentWithPost[]>('/comments', { params })
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
