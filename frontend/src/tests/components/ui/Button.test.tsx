import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Button, { PrimaryButton, IconButton } from '@/components/ui/Button'

describe('Button component', () => {
  it('renders correctly with default props', () => {
    render(<Button>Click me</Button>)
    const button = screen.getByRole('button', { name: 'Click me' })
    expect(button).toBeDefined()
    expect(button.tagName).toBe('BUTTON')
    // Default variant is primary
    expect(button.className).toContain('bg-primary')
  })

  it('renders different variants and sizes', () => {
    render(<Button variant="danger" size="lg">Danger</Button>)
    const button = screen.getByRole('button', { name: 'Danger' })
    expect(button.className).toContain('bg-error')
    expect(button.className).toContain('px-8')
  })

  it('handles click events', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Clickable</Button>)
    fireEvent.click(screen.getByRole('button', { name: 'Clickable' }))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)
    const button = screen.getByRole('button', { name: 'Disabled' }) as HTMLButtonElement
    expect(button.disabled).toBe(true)
    expect(button.className).toContain('opacity-50')
  })

  it('shows loading spinner and disables button when loading is true', () => {
    render(<Button loading>Loading...</Button>)
    const button = screen.getByRole('button') as HTMLButtonElement
    expect(button.disabled).toBe(true)
    // Check if the spinner is rendered
    const spinner = button.querySelector('.animate-spin')
    expect(spinner).toBeDefined()
  })

  it('renders leading and trailing icons', () => {
    render(<Button leadingIcon="star" trailingIcon="arrow_forward">With Icons</Button>)
    const icons = screen.getAllByText(/star|arrow_forward/)
    expect(icons).toHaveLength(2)
  })
})

describe('Named Button exports', () => {
  it('PrimaryButton renders with primary variant', () => {
    render(<PrimaryButton>Primary</PrimaryButton>)
    const button = screen.getByRole('button', { name: 'Primary' })
    expect(button.className).toContain('bg-primary')
  })

  it('IconButton renders correctly', () => {
    render(<IconButton icon="close" label="Close button" />)
    const button = screen.getByRole('button', { name: 'Close button' })
    expect(button).toBeDefined()
    expect(button.querySelector('.material-symbols-outlined')?.textContent).toBe('close')
  })
})
