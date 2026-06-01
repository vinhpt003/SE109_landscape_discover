import { describe, it, expect, vi } from 'vitest'
import { screen, render, fireEvent } from '../../test-utils'
import AdminTopBar from '@/components/layouts/AdminTopBar'
import * as authStore from '@/store/authStore'

// Mock the auth store
vi.mock('@/store/authStore', () => ({
  useAuthStore: vi.fn()
}))

// Mock NotificationBell since it's tested separately
vi.mock('@/components/notifications/NotificationBell', () => ({
  default: () => <div data-testid="mock-notification-bell" />
}))

describe('AdminTopBar component', () => {
  const mockLogout = vi.fn()

  it('renders correctly with an authenticated admin user', () => {
    vi.mocked(authStore.useAuthStore).mockReturnValue({
      user: { userName: 'AdminUser', email: 'admin@example.com', role: 'Admin' },
      logout: mockLogout,
      isAuthenticated: true
    } as any)

    render(<AdminTopBar />)

    // Check search input
    expect(screen.getByPlaceholderText('Search...')).toBeDefined()

    // Check Quick Add button
    expect(screen.getByRole('button', { name: /Quick Add/i })).toBeDefined()

    // Check mock notification bell
    expect(screen.getByTestId('mock-notification-bell')).toBeDefined()

    // Check avatar initials
    expect(screen.getByText('AD')).toBeDefined() // 'AdminUser' sliced to AD
  })

  it('toggles user menu on avatar click', () => {
    vi.mocked(authStore.useAuthStore).mockReturnValue({
      user: { userName: 'AdminUser', email: 'admin@test.com' },
      logout: mockLogout,
      isAuthenticated: true
    } as any)

    render(<AdminTopBar />)
    
    const avatarBtn = screen.getByRole('button', { name: 'Tài khoản' })
    fireEvent.click(avatarBtn)
    
    // Check if menu is open
    expect(screen.getByText('admin@test.com')).toBeDefined()
    
    // Click logout
    const logoutBtn = screen.getByText('Đăng xuất')
    fireEvent.click(logoutBtn)
    expect(mockLogout).toHaveBeenCalled()
  })
})
