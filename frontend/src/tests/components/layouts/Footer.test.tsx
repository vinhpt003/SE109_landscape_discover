import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import Footer from '@/components/layouts/Footer'

describe('Footer Component', () => {
  it('renders the brand name WanderShare', () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    )
    
    // Check if the brand name is present
    const brandElement = screen.getByText('WanderShare')
    expect(brandElement).toBeTruthy()
  })

  it('renders navigation links', () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    )

    // Check if some links are present
    expect(screen.getByText('Discover')).toBeTruthy()
    expect(screen.getByText('About Us')).toBeTruthy()
    expect(screen.getByText('Privacy Policy')).toBeTruthy()
  })
})
