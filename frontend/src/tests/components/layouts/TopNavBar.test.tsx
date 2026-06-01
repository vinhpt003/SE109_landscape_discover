import { describe, it, expect, vi } from 'vitest'
import { screen, render } from '../../test-utils'
import TopNavBar from '@/components/layouts/TopNavBar'
import * as authStore from '@/store/authStore'

vi.mock('@/store/authStore', () => ({
  useAuthStore: vi.fn()
}))

vi.mock('@/components/notifications/NotificationBell', () => ({
  default: () => <div data-testid="mock-notification-bell" />
}))

describe('TopNavBar component', () => {
  it('renders login/register for unauthenticated users', () => {
    vi.mocked(authStore.useAuthStore).mockReturnValue({
      isAuthenticated: false,
      user: null,
      logout: vi.fn()
    } as any)

    render(<TopNavBar />)
    
    expect(screen.getByText('WanderShare')).toBeDefined()
    
    // Desktop links
    const loginLinks = screen.getAllByText('Login')
    expect(loginLinks.length).toBeGreaterThan(0)
    const registerLinks = screen.getAllByText('Register')
    expect(registerLinks.length).toBeGreaterThan(0)
  })

  it('renders user menu for authenticated users', () => {
    vi.mocked(authStore.useAuthStore).mockReturnValue({
      isAuthenticated: true,
      user: { userName: 'TestUser', email: 'test@example.com', role: 'User' },
      logout: vi.fn()
    } as any)

    render(<TopNavBar />)
    
    expect(screen.getByTestId('mock-notification-bell')).toBeDefined()
    expect(screen.getByRole('button', { name: 'Tài khoản' })).toBeDefined()
    expect(screen.getByText('Đã lưu')).toBeDefined()
    
    // "Bài viết của tôi" should NOT be visible to regular user in desktop nav
    const myPostsLinks = screen.queryAllByText('Bài viết của tôi')
    expect(myPostsLinks).toHaveLength(0)
  })

  it('renders editor specific links for editors', () => {
    vi.mocked(authStore.useAuthStore).mockReturnValue({
      isAuthenticated: true,
      user: { userName: 'Editor', email: 'editor@example.com', role: 'Editor' },
      logout: vi.fn()
    } as any)

    render(<TopNavBar />)
    expect(screen.getAllByText('Bài viết của tôi').length).toBeGreaterThan(0)
  })
})
