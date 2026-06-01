import { describe, it, expect, vi } from 'vitest'
import { screen, render, fireEvent } from '../../test-utils'
import ReviewCard from '@/components/landmarks/ReviewCard'

describe('ReviewCard component', () => {
  const props = {
    id: 1,
    author: 'John Doe',
    date: '2023-01-01',
    rating: 4,
    text: 'Great experience!'
  }

  it('renders review details', () => {
    render(<ReviewCard {...props} />)
    expect(screen.getByText('John Doe')).toBeDefined()
    expect(screen.getByText('2023-01-01')).toBeDefined()
    expect(screen.getByText('Great experience!')).toBeDefined()
    // Avatar initials JD
    expect(screen.getByText('JO')).toBeDefined() // Author slices 0, 2
  })

  it('handles like click', () => {
    const handleLike = vi.fn()
    render(<ReviewCard {...props} onLike={handleLike} />)
    
    // Find the thumb_up button
    const likeBtn = screen.getAllByRole('button')[0] // First button is like
    fireEvent.click(likeBtn)
    
    expect(handleLike).toHaveBeenCalledWith(1, true)
  })

  it('renders photos and opens lightbox', () => {
    render(<ReviewCard {...props} photos={['photo1.jpg']} />)
    
    const photoBtn = screen.getByRole('button', { name: /Ảnh đánh giá 1/i })
    fireEvent.click(photoBtn)
    
    const lightboxImg = screen.getByAltText('Photo') as HTMLImageElement
    expect(lightboxImg.src).toContain('photo1.jpg')
  })
})
