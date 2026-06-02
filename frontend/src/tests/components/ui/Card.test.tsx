import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Card, { CardHeader, CardBody, CardFooter, CardDivider } from '@/components/ui/Card'

describe('Card component', () => {
  it('renders basic card with children', () => {
    render(<Card>Card Content</Card>)
    const card = screen.getByText('Card Content')
    expect(card).toBeDefined()
    expect(card.className).toContain('bg-surface-container-lowest')
  })

  it('applies interactive styles when interactive prop is true', () => {
    render(<Card interactive>Interactive Card</Card>)
    const card = screen.getByText('Interactive Card')
    expect(card.className).toContain('cursor-pointer')
    expect(card.className).toContain('hover:-translate-y-1')
  })
})

describe('Card sub-components', () => {
  it('renders header, body, and footer', () => {
    render(
      <Card>
        <CardHeader>Header Text</CardHeader>
        <CardDivider />
        <CardBody>Body Text</CardBody>
        <CardFooter>Footer Text</CardFooter>
      </Card>
    )

    expect(screen.getByText('Header Text')).toBeDefined()
    expect(screen.getByText('Body Text')).toBeDefined()
    expect(screen.getByText('Footer Text')).toBeDefined()
    
    // Check divider existence via hr tag
    const divider = document.querySelector('hr')
    expect(divider).toBeDefined()
  })
})
