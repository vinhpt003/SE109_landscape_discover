import api from './api'

export interface UploadResult {
  url: string
  publicId: string
  width: number
  height: number
  bytes: number
  format: string
}

export const uploadsService = {
  async uploadImage(file: File): Promise<UploadResult> {
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await api.post<UploadResult>('/uploads/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  async deleteImage(publicId: string): Promise<void> {
    await api.delete('/uploads', { params: { publicId } })
  },
}
