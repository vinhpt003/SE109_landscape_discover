import { describe, it, expect, vi } from 'vitest'
import { screen, render, fireEvent, waitFor } from '../../test-utils'
import NotificationBell from '@/components/notifications/NotificationBell'
import * as authStore from '@/store/authStore'
import { notificationsService } from '@/services/notifications.service'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

vi.mock('@/store/authStore', () => ({
  useAuthStore: vi.fn()
}))

vi.mock('@/services/notifications.service', () => ({
  notificationsService: {
    fetchMine: vi.fn(),
    markRead: vi.fn(),
    markAllRead: vi.fn()
  }
}))

const queryClient = new QueryClient()

describe('NotificationBell component', () => {
  it('returns null if not authenticated', () => {
    vi.mocked(authStore.useAuthStore).mockReturnValue({ isAuthenticated: false } as any)
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <NotificationBell />
      </QueryClientProvider>
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders bell and opens dropdown on click', async () => {
    vi.mocked(authStore.useAuthStore).mockReturnValue({ isAuthenticated: true, user: { role: 'User' } } as any)
    vi.mocked(notificationsService.fetchMine).mockResolvedValue({
      data: [{ notificationId: '1', message: 'Test Notif', read: false, type: 'NewComment', createdAt: new Date().toISOString() }],
      unreadCount: 1
    } as any)

    render(
      <QueryClientProvider client={queryClient}>
        <NotificationBell />
      </QueryClientProvider>
    )

    // The bell icon should be present
    const bellBtn = screen.getByLabelText('Thông báo')
    expect(bellBtn).toBeDefined()

    fireEvent.click(bellBtn)

    await waitFor(() => {
      expect(screen.getByText('Test Notif')).toBeDefined()
    })
  })
})
