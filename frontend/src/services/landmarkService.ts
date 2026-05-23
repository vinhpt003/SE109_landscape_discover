// ============================================================
// services/landmarkService.ts
// Tất cả API calls liên quan đến Landmark
// Backend endpoints: /landmarks (NestJS controller)
// ============================================================

import httpClient from './httpClient'
import type {
  Landmark,
  CreateLandmarkPayload,
  UpdateLandmarkPayload,
  LandmarkFilters,
} from '../types'

// ── GET /landmarks ────────────────────────────────────────────────
// Hỗ trợ query params: ?search=...&region=...&province=...
export async function getLandmarks(
  filters: LandmarkFilters = {},
): Promise<Landmark[]> {
  const params: Record<string, string> = {}

  if (filters.search?.trim())   params.search   = filters.search.trim()
  if (filters.region)           params.region   = filters.region
  if (filters.province?.trim()) params.province = filters.province.trim()

  const { data } = await httpClient.get<Landmark[]>('/landmarks', { params })
  return data
}

// ── GET /landmarks/:id ────────────────────────────────────────────
export async function getLandmarkById(id: number): Promise<Landmark> {
  const { data } = await httpClient.get<Landmark>(`/landmarks/${id}`)
  return data
}

// ── POST /landmarks ───────────────────────────────────────────────
// Yêu cầu JWT Admin (Bearer token tự động được gắn qua httpClient interceptor)
export async function createLandmark(
  payload: CreateLandmarkPayload,
): Promise<Landmark> {
  const { data } = await httpClient.post<Landmark>('/landmarks', payload)
  return data
}

// ── PATCH /landmarks/:id ──────────────────────────────────────────
export async function updateLandmark(
  id: number,
  payload: UpdateLandmarkPayload,
): Promise<Landmark> {
  const { data } = await httpClient.patch<Landmark>(`/landmarks/${id}`, payload)
  return data
}

// ── DELETE /landmarks/:id ─────────────────────────────────────────
export async function deleteLandmark(id: number): Promise<void> {
  await httpClient.delete(`/landmarks/${id}`)
}
