import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Input, Textarea, Select } from '@/components/ui/Input'

describe('Input component', () => {
  it('renders input with label and hint', () => {
    render(<Input label="Username" hint="Enter your username" />)
    expect(screen.getByLabelText('Username')).toBeDefined()
    expect(screen.getByText('Enter your username')).toBeDefined()
  })

  it('renders input with error state', () => {
    render(<Input label="Email" error="Invalid email address" />)
    const input = screen.getByLabelText('Email')
    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(screen.getByText('Invalid email address')).toBeDefined()
  })

  it('renders input with leading and trailing icons', () => {
    render(<Input leadingIcon="search" trailingIcon="clear" />)
    expect(screen.getByText('search')).toBeDefined()
    expect(screen.getByText('clear')).toBeDefined()
  })
})

describe('Textarea component', () => {
  it('renders textarea with specific rows', () => {
    render(<Textarea label="Message" rows={6} />)
    const textarea = screen.getByLabelText('Message') as HTMLTextAreaElement
    expect(textarea.rows).toBe(6)
  })
})

describe('Select component', () => {
  it('renders select with options', () => {
    render(
      <Select label="Options">
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
      </Select>
    )
    
    const select = screen.getByLabelText('Options') as HTMLSelectElement
    expect(select).toBeDefined()
    expect(screen.getByText('Option 1')).toBeDefined()
  })
})
