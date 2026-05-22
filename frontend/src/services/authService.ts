// ============================================================
// services/authService.ts
// Auth API calls — chỉ có Login (backend Release 1 chỉ hỗ trợ Admin login)
// Backend endpoint: POST /auth/login
// ============================================================

import httpClient from './httpClient'
import { TOKEN_KEY, USER_KEY } from '../constants'
import type { LoginPayload, AuthResponse, User } from '../types'

// ── POST /auth/login ──────────────────────────────────────────────
export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await httpClient.post<AuthResponse>('/auth/login', payload)

  // Lưu token & user vào localStorage để dùng lại sau khi reload
  localStorage.setItem(TOKEN_KEY, data.access_token)
  localStorage.setItem(USER_KEY, JSON.stringify(data.user))

  return data
}

// ── Logout (client-side) ──────────────────────────────────────────
// Backend Release 1 chưa có blacklist token, nên chỉ xóa local storage.
export function logout(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

// ── Register (placeholder — chưa có backend endpoint) ────────────
// Để sẵn cho Release 2 khi backend bổ sung /auth/register
export async function register(_payload: {
  email: string
  password: string
  fullName: string
}): Promise<never> {
  throw new Error('Tính năng đăng ký sẽ ra mắt ở phiên bản tiếp theo.')
}

// ── Helpers ───────────────────────────────────────────────────────

/** Lấy token hiện tại từ localStorage (dùng cho SSR-free logic) */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

/** Lấy user hiện tại từ localStorage */
export function getStoredUser(): User | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

/** Kiểm tra có đang đăng nhập không (dựa trên token còn trong storage) */
export function isAuthenticated(): boolean {
  return Boolean(getToken())
}
