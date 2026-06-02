import { describe, it, expect, vi } from 'vitest'
import { screen, render, fireEvent, waitFor } from '../../test-utils'
import ImageUploader from '@/components/forms/ImageUploader'
import { uploadsService } from '@/services/uploads.service'

vi.mock('@/services/uploads.service', () => ({
  uploadsService: {
    uploadImage: vi.fn(),
    deleteImage: vi.fn()
  }
}))

describe('ImageUploader component', () => {
  it('renders default state correctly', () => {
    render(<ImageUploader value={null} onChange={() => {}} />)
    expect(screen.getByText('Bấm để chọn ảnh')).toBeDefined()
  })

  it('renders image preview when value is provided', () => {
    render(<ImageUploader value="preview.jpg" onChange={() => {}} />)
    const img = screen.getByAltText('Preview') as HTMLImageElement
    expect(img.src).toContain('preview.jpg')
    expect(screen.getByRole('button', { name: /Đổi/i })).toBeDefined()
    expect(screen.getByRole('button', { name: /Xóa/i })).toBeDefined()
  })

  it('calls onChange with null when delete is clicked', async () => {
    const handleChange = vi.fn()
    vi.mocked(uploadsService.deleteImage).mockResolvedValue(undefined)
    
    render(<ImageUploader value="preview.jpg" publicId="pub123" onChange={handleChange} />)
    
    fireEvent.click(screen.getByRole('button', { name: /Xóa/i }))
    
    await waitFor(() => {
      expect(uploadsService.deleteImage).toHaveBeenCalledWith('pub123')
      expect(handleChange).toHaveBeenCalledWith({ url: null, publicId: null })
    })
  })
})
