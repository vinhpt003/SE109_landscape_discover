import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Avatar, { AvatarGroup } from '@/components/ui/Avatar'

describe('Avatar component', () => {
  it('renders initials when no image src is provided', () => {
    render(<Avatar name="John Doe" />)
    expect(screen.getByText('JD')).toBeDefined()
  })

  it('renders provided initials', () => {
    render(<Avatar initials="XD" />)
    expect(screen.getByText('XD')).toBeDefined()
  })

  it('renders an image when src is provided', () => {
    render(<Avatar src="https://example.com/avatar.jpg" name="Jane" />)
    const img = screen.getByRole('img', { name: 'Jane' }) as HTMLImageElement
    expect(img.src).toBe('https://example.com/avatar.jpg')
  })

  it('renders status dot when status is provided', () => {
    render(<Avatar name="User" status="online" />)
    const statusDot = screen.getByLabelText('online')
    expect(statusDot).toBeDefined()
    expect(statusDot.className).toContain('bg-secondary')
  })
})

describe('AvatarGroup component', () => {
  it('renders a group of avatars up to max', () => {
    const items = [
      { name: 'A B' }, { name: 'C D' }, { name: 'E F' }, { name: 'G H' }, { name: 'I J' }
    ]
    render(<AvatarGroup items={items} max={3} />)
    
    // Should render 3 avatars and 1 overflow indicator
    expect(screen.getByText('AB')).toBeDefined()
    expect(screen.getByText('CD')).toBeDefined()
    expect(screen.getByText('EF')).toBeDefined()
    expect(screen.getByText('+2')).toBeDefined() // 5 - 3 = 2
  })
})
