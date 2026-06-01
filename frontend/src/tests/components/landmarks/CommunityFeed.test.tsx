import { describe, it, expect, vi } from 'vitest'
import { screen, render, fireEvent } from '../../test-utils'
import CommunityFeed from '@/components/landmarks/CommunityFeed'

describe('CommunityFeed component', () => {
  const mockReviews = [
    { id: 1, author: 'User1', date: '2023-01-01', rating: 5, text: 'Great!' },
    { id: 2, author: 'User2', date: '2023-01-02', rating: 4, text: 'Nice place', photos: ['photo.jpg'] }
  ]

  it('renders correctly with no reviews', () => {
    render(<CommunityFeed landmarkId={1} />)
    expect(screen.getByText('Chưa có đánh giá nào')).toBeDefined()
    expect(screen.getByRole('button', { name: /Viết đánh giá đầu tiên/i })).toBeDefined()
  })

  it('renders reviews and average rating', () => {
    render(<CommunityFeed landmarkId={1} reviews={mockReviews} totalReviews={2} averageRating={4.5} />)
    
    // Check score
    expect(screen.getByText('4.5')).toBeDefined()
    expect(screen.getAllByText('2 đánh giá').length).toBeGreaterThan(0)

    // Check reviews rendered
    expect(screen.getByText('User1')).toBeDefined()
    expect(screen.getByText('User2')).toBeDefined()
  })

  it('filters by tab', () => {
    render(<CommunityFeed landmarkId={1} reviews={mockReviews} />)
    
    // Click "Có ảnh"
    fireEvent.click(screen.getByText('Có ảnh'))
    
    // User1 has no photos, User2 does
    expect(screen.queryByText('User1')).toBeNull()
    expect(screen.getByText('User2')).toBeDefined()
  })

  it('calls event handlers on button clicks', () => {
    const onWriteReview = vi.fn()
    const onPostPhoto = vi.fn()
    const onRate = vi.fn()

    render(<CommunityFeed 
      landmarkId={1} 
      reviews={mockReviews} 
      onWriteReview={onWriteReview}
      onPostPhoto={onPostPhoto}
      onRate={onRate}
    />)

    fireEvent.click(screen.getByText('Viết đánh giá'))
    expect(onWriteReview).toHaveBeenCalled()

    fireEvent.click(screen.getByText('Đăng ảnh'))
    expect(onPostPhoto).toHaveBeenCalled()

    fireEvent.click(screen.getByText('Đánh giá điểm này'))
    expect(onRate).toHaveBeenCalled()
  })
})
