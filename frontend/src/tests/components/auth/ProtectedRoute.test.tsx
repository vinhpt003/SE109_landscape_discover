import { describe, it, expect, vi } from 'vitest'
import { screen, render } from '@testing-library/react'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import * as authStore from '@/store/authStore'
import { Route, Routes, MemoryRouter } from 'react-router-dom'

vi.mock('@/store/authStore', () => ({
  useAuthStore: vi.fn()
}))

describe('ProtectedRoute component', () => {
  const renderWithRoutes = (ui: React.ReactNode) => {
    return render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/" element={<div>Home Page</div>} />
          <Route path="/login" element={<div>Login Page</div>} />
          <Route element={ui}>
            <Route path="/protected" element={<div>Protected Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )
  }

  it('redirects to login if not authenticated', () => {
    vi.mocked(authStore.useAuthStore).mockReturnValue({
      isAuthenticated: false,
      user: null
    } as any)

    renderWithRoutes(<ProtectedRoute />)
    expect(screen.getByText('Login Page')).toBeDefined()
  })

  it('renders outlet if authenticated and no role restriction', () => {
    vi.mocked(authStore.useAuthStore).mockReturnValue({
      isAuthenticated: true,
      user: { role: 'User' }
    } as any)

    renderWithRoutes(<ProtectedRoute />)
    expect(screen.getByText('Protected Content')).toBeDefined()
  })

  it('redirects to home if authenticated but lacks required role', () => {
    vi.mocked(authStore.useAuthStore).mockReturnValue({
      isAuthenticated: true,
      user: { role: 'User' }
    } as any)

    renderWithRoutes(<ProtectedRoute roles={['Admin', 'Editor']} />)
    expect(screen.getByText('Home Page')).toBeDefined()
  })

  it('renders outlet if authenticated and has required role', () => {
    vi.mocked(authStore.useAuthStore).mockReturnValue({
      isAuthenticated: true,
      user: { role: 'Admin' }
    } as any)

    renderWithRoutes(<ProtectedRoute roles={['Admin', 'Editor']} />)
    expect(screen.getByText('Protected Content')).toBeDefined()
  })
})
