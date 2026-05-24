import api from './api'
import type { Post, PostStatus } from '../types'

interface PostsParams {
  search?: string
  locationId?: string
  status?: PostStatus
}

export const postsService = {
  async fetchPosts(params?: PostsParams): Promise<Post[]> {
    const { data } = await api.get<Post[]>('/posts', { params })
    return data
  },

  async fetchPostById(id: string): Promise<Post> {
    const { data } = await api.get<Post>(`/posts/${id}`)
    return data
  },

  async createPost(payload: { locationId: string; title: string; content: string; imageUrl?: string }): Promise<Post> {
    const { data } = await api.post<Post>('/posts', payload)
    return data
  },

  async updatePost(id: string, payload: Partial<{ title: string; content: string; imageUrl: string }>): Promise<Post> {
    const { data } = await api.patch<Post>(`/posts/${id}`, payload)
    return data
  },

  async updatePostStatus(id: string, status: PostStatus): Promise<Post> {
    const { data } = await api.patch<Post>(`/posts/${id}/status`, { status })
    return data
  },

  async deletePost(id: string): Promise<void> {
    await api.delete(`/posts/${id}`)
  },
}
