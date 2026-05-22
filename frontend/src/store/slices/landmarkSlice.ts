// ============================================================
// store/slices/landmarkSlice.ts — Zustand store cho Landmarks
// ============================================================

import { create } from 'zustand'
import type { Landmark, LandmarkFilters, CreateLandmarkPayload, UpdateLandmarkPayload } from '../../types'
import {
  getLandmarks      as fetchLandmarks,
  getLandmarkById   as fetchLandmarkById,
  createLandmark    as createLandmarkApi,
  updateLandmark    as updateLandmarkApi,
  deleteLandmark    as deleteLandmarkApi,
} from '../../services/landmarkService'

// ── State shape ───────────────────────────────────────────────────

interface LandmarkState {
  // Danh sách (trang Home & Admin list)
  landmarks:       Landmark[]
  isListLoading:   boolean
  listError:       string | null
  activeFilters:   LandmarkFilters

  // Chi tiết (trang LandmarkDetail & Admin edit)
  currentLandmark: Landmark | null
  isDetailLoading: boolean
  detailError:     string | null

  // Mutation loading (create / update / delete)
  isMutating:      boolean
  mutateError:     string | null

  // Actions
  fetchAll:    (filters?: LandmarkFilters) => Promise<void>
  fetchById:   (id: number) => Promise<void>
  create:      (payload: CreateLandmarkPayload) => Promise<Landmark>
  update:      (id: number, payload: UpdateLandmarkPayload) => Promise<Landmark>
  remove:      (id: number) => Promise<void>
  setFilters:  (filters: LandmarkFilters) => void
  clearCurrent:() => void
  clearErrors: () => void
}

// ── Store ─────────────────────────────────────────────────────────

export const useLandmarkStore = create<LandmarkState>()((set, get) => ({
  landmarks:       [],
  isListLoading:   false,
  listError:       null,
  activeFilters:   {},

  currentLandmark: null,
  isDetailLoading: false,
  detailError:     null,

  isMutating:      false,
  mutateError:     null,

  // ── fetchAll ──────────────────────────────────────────────────
  fetchAll: async (filters) => {
    const resolvedFilters = filters ?? get().activeFilters
    set({ isListLoading: true, listError: null, activeFilters: resolvedFilters })
    try {
      const data = await fetchLandmarks(resolvedFilters)
      set({ landmarks: data, isListLoading: false })
    } catch (err: unknown) {
      set({
        isListLoading: false,
        listError: extractMessage(err, 'Không thể tải danh sách địa điểm.'),
      })
    }
  },

  // ── fetchById ─────────────────────────────────────────────────
  fetchById: async (id) => {
    set({ isDetailLoading: true, detailError: null, currentLandmark: null })
    try {
      const data = await fetchLandmarkById(id)
      set({ currentLandmark: data, isDetailLoading: false })
    } catch (err: unknown) {
      set({
        isDetailLoading: false,
        detailError: extractMessage(err, 'Không thể tải thông tin địa điểm.'),
      })
    }
  },

  // ── create ────────────────────────────────────────────────────
  create: async (payload) => {
    set({ isMutating: true, mutateError: null })
    try {
      const created = await createLandmarkApi(payload)
      // Thêm vào đầu danh sách để user thấy ngay
      set((state) => ({
        landmarks: [created, ...state.landmarks],
        isMutating: false,
      }))
      return created
    } catch (err: unknown) {
      set({
        isMutating: false,
        mutateError: extractMessage(err, 'Tạo địa điểm thất bại.'),
      })
      throw err
    }
  },

  // ── update ────────────────────────────────────────────────────
  update: async (id, payload) => {
    set({ isMutating: true, mutateError: null })
    try {
      const updated = await updateLandmarkApi(id, payload)
      // Cập nhật item trong list
      set((state) => ({
        landmarks: state.landmarks.map((lm) => (lm.id === id ? updated : lm)),
        currentLandmark: state.currentLandmark?.id === id ? updated : state.currentLandmark,
        isMutating: false,
      }))
      return updated
    } catch (err: unknown) {
      set({
        isMutating: false,
        mutateError: extractMessage(err, 'Cập nhật địa điểm thất bại.'),
      })
      throw err
    }
  },

  // ── remove ────────────────────────────────────────────────────
  remove: async (id) => {
    set({ isMutating: true, mutateError: null })
    try {
      await deleteLandmarkApi(id)
      set((state) => ({
        landmarks: state.landmarks.filter((lm) => lm.id !== id),
        currentLandmark: state.currentLandmark?.id === id ? null : state.currentLandmark,
        isMutating: false,
      }))
    } catch (err: unknown) {
      set({
        isMutating: false,
        mutateError: extractMessage(err, 'Xóa địa điểm thất bại.'),
      })
      throw err
    }
  },

  // ── setFilters ────────────────────────────────────────────────
  setFilters: (filters) => set({ activeFilters: filters }),

  // ── clearCurrent ──────────────────────────────────────────────
  clearCurrent: () => set({ currentLandmark: null, detailError: null }),

  // ── clearErrors ───────────────────────────────────────────────
  clearErrors: () => set({ listError: null, detailError: null, mutateError: null }),
}))

// ── Selector helpers ─────────────────────────────────────────────

export const useLandmarks        = () => useLandmarkStore((s) => s.landmarks)
export const useCurrentLandmark  = () => useLandmarkStore((s) => s.currentLandmark)
export const useIsListLoading    = () => useLandmarkStore((s) => s.isListLoading)
export const useIsDetailLoading  = () => useLandmarkStore((s) => s.isDetailLoading)
export const useIsMutating       = () => useLandmarkStore((s) => s.isMutating)
export const useActiveFilters    = () => useLandmarkStore((s) => s.activeFilters)

// ── Utility ──────────────────────────────────────────────────────

function extractMessage(err: unknown, fallback: string): string {
  return (
    (err as { response?: { data?: { message?: string } } })
      ?.response?.data?.message ?? fallback
  )
}
