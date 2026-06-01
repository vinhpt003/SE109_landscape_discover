import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Toaster from '@/components/ui/Toaster'
import type { ToastItem } from '@/hooks/useToast'

describe('Toaster component', () => {
  const mockToasts: ToastItem[] = [
    { id: 1, type: 'success', message: 'Task completed successfully' },
    { id: 2, type: 'error', message: 'Task failed' }
  ]

  it('renders null when there are no toasts', () => {
    const { container } = render(<Toaster toasts={[]} onDismiss={() => {}} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders toasts correctly', () => {
    render(<Toaster toasts={mockToasts} onDismiss={() => {}} />)
    
    expect(screen.getByText('Task completed successfully')).toBeDefined()
    expect(screen.getByText('Task failed')).toBeDefined()
  })

  it('calls onDismiss when close button is clicked', () => {
    const handleDismiss = vi.fn()
    render(<Toaster toasts={[mockToasts[0]]} onDismiss={handleDismiss} />)
    
    const closeBtn = screen.getByRole('button', { name: 'Đóng' })
    fireEvent.click(closeBtn)
    
    expect(handleDismiss).toHaveBeenCalledWith(1)
  })
})
