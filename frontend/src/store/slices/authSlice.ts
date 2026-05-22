// ============================================================
// store/slices/authSlice.ts — Zustand store cho Auth
// Dự án dùng Zustand (package.json: "zustand": "^4.5.0")
// ============================================================

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '../../types'
import {
  login as loginApi,
  logout as logoutApi,
  getStoredUser,
  getToken,
} from '../../services/authService'
import type { LoginPayload } from '../../types'

// ── State shape ───────────────────────────────────────────────────

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null

  // Actions
  login: (payload: LoginPayload) => Promise<void>
  logout: () => void
  clearError: () => void
}

// ── Store ─────────────────────────────────────────────────────────
// `persist` giúp hydrate lại state từ localStorage khi reload trang

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state — đọc từ localStorage nếu có
      user:      getStoredUser(),
      token:     getToken(),
      isLoading: false,
      error:     null,

      // ── login ─────────────────────────────────────────────────
      login: async (payload) => {
        set({ isLoading: true, error: null })
        try {
          const response = await loginApi(payload)
          set({
            user:      response.user,
            token:     response.access_token,
            isLoading: false,
            error:     null,
          })
        } catch (err: unknown) {
          const message =
            (err as { response?: { data?: { message?: string } } })
              ?.response?.data?.message ??
            'Đăng nhập thất bại. Vui lòng thử lại.'
          set({ isLoading: false, error: message, user: null, token: null })
          throw err   // re-throw để component có thể bắt nếu cần
        }
      },

      // ── logout ────────────────────────────────────────────────
      logout: () => {
        logoutApi()
        set({ user: null, token: null, error: null })
      },

      // ── clearError ────────────────────────────────────────────
      clearError: () => set({ error: null }),
    }),
    {
      name: 'ld-auth',          // key trong localStorage
      partialize: (state) => ({ // chỉ persist user & token
        user:  state.user,
        token: state.token,
      }),
    },
  ),
)

// ── Selector helpers (tránh re-render thừa) ──────────────────────

export const useCurrentUser  = () => useAuthStore((s) => s.user)
export const useIsLoggedIn   = () => useAuthStore((s) => Boolean(s.token))
export const useIsAdmin      = () => useAuthStore((s) => s.user?.role === 'ADMIN')
export const useAuthLoading  = () => useAuthStore((s) => s.isLoading)
export const useAuthError    = () => useAuthStore((s) => s.error)
