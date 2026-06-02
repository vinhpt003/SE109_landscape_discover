import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import AdminSideNav from '../../../components/layouts/AdminSideNav'
import AdminTopBar from '../../../components/layouts/AdminTopBar'
import { locationsService } from '../../../services/locations.service'
import type { Region } from '../../../types'

// ── Page ────────────────────────────────────────────────────────────────────
export default function EditLocation() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { id } = useParams<{ id: string }>()
  const isNew = !id

  const [form, setForm] = useState<{
    locationName: string
    description: string
    coordinates: string
    region: Region | ''
  }>({
    locationName: '',
    description: '',
    coordinates: '',
    region: '',
  })
  const [error, setError] = useState('')

  const { data: existing } = useQuery({
    queryKey: ['location', id],
    queryFn: () => locationsService.fetchLocationById(id!),
    enabled: !isNew && !!id,
  })

  useEffect(() => {
    if (existing) {
      setForm({
        locationName: existing.locationName,
        description: existing.description ?? '',
        coordinates: existing.coordinates ?? '',
        region: existing.region ?? '',
      })
    }
  }, [existing])

  const invalidateLists = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-locations'] })
    queryClient.invalidateQueries({ queryKey: ['locations'] })
    if (id) queryClient.invalidateQueries({ queryKey: ['location', id] })
  }

  const payload = () => ({
    locationName: form.locationName,
    description: form.description || undefined,
    coordinates: form.coordinates || undefined,
    region: (form.region as Region) || undefined,
  })

  const createMutation = useMutation({
    mutationFn: () => locationsService.createLocation(payload()),
    onSuccess: () => {
      invalidateLists()
      navigate('/admin/locations')
    },
    onError: (err: any) => setError(err?.response?.data?.message ?? 'Có lỗi xảy ra'),
  })

  const updateMutation = useMutation({
    mutationFn: () => locationsService.updateLocation(id!, payload()),
    onSuccess: () => {
      invalidateLists()
      navigate('/admin/locations')
    },
    onError: (err: any) => setError(err?.response?.data?.message ?? 'Có lỗi xảy ra'),
  })

  const validate = (): boolean => {
    setError('')
    if (!form.locationName.trim()) {
      setError('Tên địa điểm không được để trống')
      return false
    }
    return true
  }

  const handleSave = () => {
    if (!validate()) return
    if (isNew) createMutation.mutate()
    else updateMutation.mutate()
  }

  const update = (field: keyof typeof form, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const isSaving = createMutation.isPending || updateMutation.isPending

  return (
    <div className="bg-surface min-h-screen flex">
      <AdminSideNav />

      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <AdminTopBar />

        <main className="flex-1 pt-24 px-margin-desktop pb-16 bg-surface-bright overflow-y-auto">
          <div className="max-w-container-max mx-auto space-y-8">

            {/* Header + actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <Link
                  to="/admin/locations"
                  className="inline-flex items-center gap-1 text-outline hover:text-primary font-label-md text-label-md mb-2 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  Quay lại danh sách
                </Link>
                <h2 className="font-display text-headline-lg text-on-background">
                  {isNew ? 'Thêm địa điểm mới' : 'Chỉnh sửa địa điểm'}
                </h2>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => navigate('/admin/locations')}
                  className="px-5 py-2.5 rounded-lg border border-outline-variant text-on-surface-variant font-label-md text-label-md hover:bg-surface-container-low transition-colors bg-surface-container-lowest"
                >
                  Hủy bỏ
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:opacity-90 transition-opacity shadow-float disabled:opacity-60"
                >
                  {isSaving ? 'Đang lưu...' : isNew ? 'Tạo địa điểm' : 'Lưu thay đổi'}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-error-container text-on-error-container px-4 py-3 rounded-lg font-body-md text-body-md">
                {error}
              </div>
            )}

            {/* Form grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">

              {/* ── Left: main info ──────────────────────────────── */}
              <div className="lg:col-span-2 flex flex-col gap-gutter">
                <div className="bg-surface-container-lowest rounded-xl p-8 ambient-shadow border border-surface-variant">
                  <h3 className="font-display text-headline-md text-on-background mb-6">Thông tin địa điểm</h3>

                  <div className="space-y-6">
                    <div>
                      <label className="block font-label-md text-label-md text-on-surface-variant mb-2">
                        Tên địa điểm *
                      </label>
                      <input
                        type="text"
                        placeholder="Nhập tên địa điểm (vd: Vịnh Hạ Long)"
                        value={form.locationName}
                        onChange={e => update('locationName', e.target.value)}
                        className="w-full bg-surface-bright border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block font-label-md text-label-md text-on-surface-variant mb-2">
                        Mô tả
                      </label>
                      <textarea
                        rows={5}
                        placeholder="Mô tả chi tiết về địa điểm này..."
                        value={form.description}
                        onChange={e => update('description', e.target.value)}
                        className="w-full bg-surface-bright border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-colors resize-y"
                      />
                    </div>

                    <div>
                      <label className="block font-label-md text-label-md text-on-surface-variant mb-2">
                        Tọa độ
                      </label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">my_location</span>
                        <input
                          type="text"
                          placeholder="vd: 20.9101, 107.1839"
                          value={form.coordinates}
                          onChange={e => update('coordinates', e.target.value)}
                          className="w-full bg-surface-bright border border-outline-variant rounded-lg pl-10 pr-4 py-3 font-body-md text-body-md focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-colors font-mono"
                        />
                      </div>
                      <p className="font-caption text-caption text-outline mt-1.5">
                        Nhập tọa độ dạng "vĩ độ, kinh độ" (latitude, longitude).
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Right: meta ──────────────────────────────────── */}
              <div className="lg:col-span-1 flex flex-col gap-gutter">
                <div className="bg-surface-container-lowest rounded-xl p-8 ambient-shadow border border-surface-variant">
                  <h3 className="font-display text-headline-md text-on-background mb-6">Phân loại</h3>

                  <div className="space-y-6">
                    <div>
                      <label className="block font-label-md text-label-md text-on-surface-variant mb-2">
                        Vùng miền
                      </label>
                      <div className="relative">
                        <select
                          value={form.region}
                          onChange={e => update('region', e.target.value)}
                          className="w-full bg-surface-bright border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md appearance-none focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-colors text-on-surface"
                        >
                          <option value="">-- Chọn vùng miền --</option>
                          <option value="North">Miền Bắc</option>
                          <option value="Central">Miền Trung</option>
                          <option value="South">Miền Nam</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-on-surface-variant">
                          <span className="material-symbols-outlined">expand_more</span>
                        </div>
                      </div>
                    </div>

                    <hr className="border-outline-variant border-dashed" />

                    <div className="bg-tertiary-fixed/30 rounded-lg p-4 border border-tertiary-fixed">
                      <p className="font-caption text-caption text-on-surface-variant">
                        <span className="material-symbols-outlined text-[14px] align-middle mr-1">info</span>
                        Địa điểm sẽ được sử dụng để phân loại các bài viết. Editor có thể chọn địa điểm khi tạo bài mới.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
