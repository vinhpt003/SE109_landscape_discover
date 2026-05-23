// ============================================================
// types/index.ts — Shared TypeScript interfaces
// Mirrors the Prisma schema in backend/prisma/schema.prisma
// ============================================================

// ── Enums (mirrors Prisma enums) ─────────────────────────────────

export type Region = 'MIEN_BAC' | 'MIEN_TRUNG' | 'MIEN_NAM'

export type Status = 'PENDING' | 'PUBLISHED' | 'ARCHIVED'

export type MediaType = 'IMAGE' | 'VIDEO'

export type Role = 'USER' | 'ADMIN'

// ── Media ────────────────────────────────────────────────────────

export interface Media {
  id: number
  url: string
  type: MediaType
  landmarkId: number
}

// ── Landmark ─────────────────────────────────────────────────────

export interface Landmark {
  id: number
  title: string
  description: string
  content: string
  region: Region
  province: string
  status: Status
  createdAt: string   // ISO date string from JSON serialization
  updatedAt: string
  images: Media[]
  reviews?: Review[]
}

// Payload gửi lên khi tạo / cập nhật
export interface CreateLandmarkPayload {
  title: string
  description: string
  content: string
  region: Region
  province: string
  status?: Status
}

export type UpdateLandmarkPayload = Partial<CreateLandmarkPayload>

// Query params cho GET /landmarks
export interface LandmarkFilters {
  search?: string
  region?: Region
  province?: string
}

// ── User ─────────────────────────────────────────────────────────

export interface User {
  id: number
  email: string
  fullName: string
  role: Role
}

// ── Review ───────────────────────────────────────────────────────

export interface Review {
  id: number
  rating: number        // 1–5
  comment: string
  usefulVotes: number
  createdAt: string
  userId: number
  user?: User
  landmarkId: number
}

// ── Auth ─────────────────────────────────────────────────────────

export interface LoginPayload {
  email: string
  password: string
}

export interface AuthResponse {
  access_token: string
  user: User
}

// ── API wrapper ──────────────────────────────────────────────────

export interface ApiError {
  message: string
  statusCode: number
}
