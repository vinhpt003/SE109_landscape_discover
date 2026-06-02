import { describe, it, expect } from 'vitest'
import { screen, render } from '../../test-utils'
import AdminSideNav from '@/components/layouts/AdminSideNav'

describe('AdminSideNav component', () => {
  it('renders the brand name and nav items', () => {
    render(<AdminSideNav />)
    
    // Check Brand
    expect(screen.getByText('TravelAdmin')).toBeDefined()
    
    // Check nav links
    expect(screen.getByText('Dashboard')).toBeDefined()
    expect(screen.getByText('Bài viết')).toBeDefined()
    expect(screen.getByText('Bình luận')).toBeDefined()
    expect(screen.getByText('Người dùng')).toBeDefined()
  })

  it('renders the add landmark button', () => {
    render(<AdminSideNav />)
    const btn = screen.getByRole('button', { name: /Add Landmark/i })
    expect(btn).toBeDefined()
  })
})
