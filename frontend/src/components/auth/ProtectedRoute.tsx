import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import type { Role } from '../../types'

interface ProtectedRouteProps {
  /** If provided, user must have one of these roles. Otherwise, any authenticated user is allowed. */
  roles?: Role[]
  /** Where to redirect unauthenticated users. Defaults to /login. */
  redirectTo?: string
}

export default function ProtectedRoute({ roles, redirectTo = '/login' }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
