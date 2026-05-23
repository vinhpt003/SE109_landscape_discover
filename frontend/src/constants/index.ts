// ============================================================
// constants/index.ts — App-wide constants
// ============================================================

import type { Region, Status } from '../types'

// ── API ──────────────────────────────────────────────────────────

export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'

export const APP_NAME: string =
  import.meta.env.VITE_APP_NAME ?? 'Landscape Discover'

// ── Auth ─────────────────────────────────────────────────────────

/** Key dùng để lưu JWT token trong localStorage */
export const TOKEN_KEY = 'ld_access_token'

/** Key dùng để lưu thông tin user trong localStorage */
export const USER_KEY = 'ld_user'

// ── Regions ──────────────────────────────────────────────────────

export interface RegionOption {
  value: Region
  label: string
  shortLabel: string
}

export const REGIONS: RegionOption[] = [
  { value: 'MIEN_BAC',   label: 'Miền Bắc',   shortLabel: 'Bắc'   },
  { value: 'MIEN_TRUNG', label: 'Miền Trung',  shortLabel: 'Trung' },
  { value: 'MIEN_NAM',   label: 'Miền Nam',    shortLabel: 'Nam'   },
]

export const REGION_LABEL: Record<Region, string> = {
  MIEN_BAC:   'Miền Bắc',
  MIEN_TRUNG: 'Miền Trung',
  MIEN_NAM:   'Miền Nam',
}

// ── Statuses ─────────────────────────────────────────────────────

export interface StatusOption {
  value: Status
  label: string
}

export const STATUSES: StatusOption[] = [
  { value: 'PUBLISHED', label: 'Đã xuất bản'  },
  { value: 'PENDING',   label: 'Chờ duyệt'    },
  { value: 'ARCHIVED',  label: 'Đã lưu trữ'   },
]

export const STATUS_LABEL: Record<Status, string> = {
  PUBLISHED: 'Đã xuất bản',
  PENDING:   'Chờ duyệt',
  ARCHIVED:  'Đã lưu trữ',
}

// ── Pagination ───────────────────────────────────────────────────

export const DEFAULT_PAGE_SIZE = 12

// ── Route paths ──────────────────────────────────────────────────

export const ROUTES = {
  HOME:               '/',
  LANDMARK_DETAIL:    (id: number | string) => `/landmarks/${id}`,
  LOGIN:              '/login',
  REGISTER:           '/register',

  ADMIN:              '/admin',
  ADMIN_LANDMARKS:    '/admin/landmarks',
  ADMIN_LANDMARK_NEW: '/admin/landmarks/new',
  ADMIN_LANDMARK_EDIT:(id: number | string) => `/admin/landmarks/${id}/edit`,
} as const
