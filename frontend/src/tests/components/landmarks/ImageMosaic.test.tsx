import { describe, it, expect, vi } from 'vitest'
import { screen, render, fireEvent } from '../../test-utils'
import ImageMosaic from '@/components/landmarks/ImageMosaic'

describe('ImageMosaic component', () => {
  const images = ['img1.jpg', 'img2.jpg', 'img3.jpg', 'img4.jpg', 'img5.jpg']

  it('renders correctly with up to 4 images', () => {
    render(<ImageMosaic images={images} alt="Test" />)
    
    const imgs = screen.getAllByRole('img')
    expect(imgs.length).toBe(4) // Max 4 rendered
    
    expect(imgs[0].getAttribute('src')).toBe('img1.jpg')
    expect(imgs[1].getAttribute('src')).toBe('img2.jpg')
    
    // "Xem tất cả 5 ảnh" button should be present
    expect(screen.getByRole('button', { name: /Xem tất cả 5 ảnh/i })).toBeDefined()
  })

  it('opens lightbox on image click', () => {
    render(<ImageMosaic images={images} alt="Test" />)
    
    // Click first image button
    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[0])
    
    // Lightbox image should appear
    const lightboxImg = screen.getByAltText('Lightbox') as HTMLImageElement
    expect(lightboxImg).toBeDefined()
    expect(lightboxImg.src).toContain('img1.jpg')
  })

  it('calls onShowAll when button is clicked', () => {
    const handleShowAll = vi.fn()
    render(<ImageMosaic images={images} onShowAll={handleShowAll} />)
    
    fireEvent.click(screen.getByRole('button', { name: /Xem tất cả/i }))
    expect(handleShowAll).toHaveBeenCalled()
  })
})
