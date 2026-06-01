import { describe, it, expect, vi } from 'vitest'
import { screen, render, fireEvent, waitFor } from '../../test-utils'
import LandmarkCard from '@/components/landmarks/LandmarkCard'
import * as authStore from '@/store/authStore'
import { savedPostsService } from '@/services/saved-posts.service'

vi.mock('@/store/authStore', () => ({
  useAuthStore: vi.fn()
}))

vi.mock('@/services/saved-posts.service', () => ({
  savedPostsService: {
    toggle: vi.fn()
  }
}))

describe('LandmarkCard component', () => {
  const props = {
    id: 1,
    name: 'Beautiful Place',
    region: 'Miền Bắc',
    rating: 4.8,
    reviewCount: 150,
    image: 'test.jpg',
    description: 'A very beautiful place.'
  }

  it('renders correctly', () => {
    vi.mocked(authStore.useAuthStore).mockReturnValue(true as any) // isAuthenticated

    render(<LandmarkCard {...props} />)
    
    expect(screen.getByText('Beautiful Place')).toBeDefined()
    expect(screen.getAllByText('Miền Bắc').length).toBeGreaterThan(0)
    expect(screen.getByText('A very beautiful place.')).toBeDefined()
    expect(screen.getByText('4.8')).toBeDefined()
    expect(screen.getByText('(150 đánh giá)')).toBeDefined()
  })

  it('toggles favorite when authenticated', async () => {
    vi.mocked(authStore.useAuthStore).mockReturnValue(true as any) // isAuthenticated
    vi.mocked(savedPostsService.toggle).mockResolvedValue({ saved: true } as any)

    render(<LandmarkCard {...props} initialSaved={false} />)
    
    const favBtn = screen.getByLabelText('Thêm yêu thích')
    fireEvent.click(favBtn)
    
    await waitFor(() => {
      expect(savedPostsService.toggle).toHaveBeenCalledWith('1')
    })
  })

  it('shows verified and featured badges', () => {
    vi.mocked(authStore.useAuthStore).mockReturnValue(true as any)
    
    render(<LandmarkCard {...props} isVerified isFeatured />)
    expect(screen.getByText('Nổi bật')).toBeDefined()
    expect(screen.getByText('Đã xác minh')).toBeDefined()
  })
})
