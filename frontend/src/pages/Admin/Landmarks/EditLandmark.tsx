import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import AdminSideNav from '../../../components/layouts/AdminSideNav'
import AdminTopBar from '../../../components/layouts/AdminTopBar'
import { postsService } from '../../../services/posts.service'
import { locationsService } from '../../../services/locations.service'
import { useAuthStore } from '../../../store/authStore'

// ── Toolbar button ─────────────────────────────────────────────────────────
function ToolbarBtn({ icon, title }: { icon: string; title: string }) {
  return (
    <button
      type="button"
      title={title}
      className="p-1.5 rounded hover:bg-surface-variant text-on-surface-variant transition-colors"
    >
      <span className="material-symbols-outlined text-[20px]">{icon}</span>
    </button>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function EditLandmark() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const isNew = !id || id === 'new'

  const [form, setForm] = useState({
    title: '',
    content: '',
    imageUrl: '',
    locationId: '',
    publish: false,
  })
  const [error, setError] = useState('')

  // Load locations for dropdown
  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: () => locationsService.fetchLocations(),
  })

  // Load post for edit mode
  const { data: existingPost } = useQuery({
    queryKey: ['post', id],
    queryFn: () => postsService.fetchPostById(id!),
    enabled: !isNew && !!id,
  })

  useEffect(() => {
    if (existingPost) {
      setForm({
        title: existingPost.title,
        content: existingPost.content,
        imageUrl: existingPost.imageUrl ?? '',
        locationId: existingPost.locationId,
        publish: existingPost.status === 'Publish',
      })
    }
  }, [existingPost])

  const createMutation = useMutation({
    mutationFn: (payload: { locationId: string; title: string; content: string; imageUrl?: string }) =>
      postsService.createPost(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] })
      navigate('/admin/landmarks')
    },
    onError: (err: any) => setError(err?.response?.data?.message ?? 'Có lỗi xảy ra'),
  })

  const updateMutation = useMutation({
    mutationFn: (payload: { title?: string; content?: string; imageUrl?: string }) =>
      postsService.updatePost(id!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] })
      queryClient.invalidateQueries({ queryKey: ['post', id] })
      navigate('/admin/landmarks')
    },
    onError: (err: any) => setError(err?.response?.data?.message ?? 'Có lỗi xảy ra'),
  })

  const handleSubmit = () => {
    setError('')
    if (!form.title.trim()) { setError('Tiêu đề không được để trống'); return }
    if (!form.content.trim()) { setError('Nội dung không được để trống'); return }
    if (!form.locationId) { setError('Vui lòng chọn địa điểm'); return }

    if (isNew) {
      createMutation.mutate({
        locationId: form.locationId,
        title: form.title,
        content: form.content,
        imageUrl: form.imageUrl || undefined,
      })
    } else {
      updateMutation.mutate({
        title: form.title,
        content: form.content,
        imageUrl: form.imageUrl || undefined,
      })
    }
  }

  const update = (field: keyof typeof form, value: string | boolean) =>
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
                  to="/admin/landmarks"
                  className="inline-flex items-center gap-1 text-outline hover:text-primary font-label-md text-label-md mb-2 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  Quay lại danh sách
                </Link>
                <h2 className="font-display text-headline-lg text-on-background">
                  {isNew ? 'Thêm bài viết mới' : `Chỉnh sửa: ${form.title || '...'}`}
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/admin/landmarks')}
                  className="px-6 py-2.5 rounded-lg border border-outline-variant text-on-surface-variant font-label-md text-label-md hover:bg-surface-container-low transition-colors bg-surface-container-lowest"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-lg border border-primary text-primary font-label-md text-label-md hover:bg-primary-fixed transition-colors bg-surface-container-lowest disabled:opacity-60"
                >
                  {isSaving ? 'Đang lưu...' : 'Lưu nháp'}
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-lg bg-[#f05a28] text-white font-label-md text-label-md hover:opacity-90 transition-opacity shadow-float disabled:opacity-60"
                >
                  Gửi duyệt
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
                  <h3 className="font-display text-headline-md text-on-background mb-6">Thông tin bài viết</h3>

                  <div className="space-y-6">
                    <div>
                      <label className="block font-label-md text-label-md text-on-surface-variant mb-2">
                        Tiêu đề *
                      </label>
                      <input
                        type="text"
                        placeholder="Nhập tiêu đề bài viết"
                        value={form.title}
                        onChange={e => update('title', e.target.value)}
                        className="w-full bg-surface-bright border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block font-label-md text-label-md text-on-surface-variant mb-2">
                        Nội dung *
                      </label>
                      <div className="border border-outline-variant rounded-lg overflow-hidden bg-surface-bright">
                        <div className="flex items-center gap-1 border-b border-outline-variant bg-surface-container-low px-4 py-2 flex-wrap">
                          <ToolbarBtn icon="format_bold" title="In đậm" />
                          <ToolbarBtn icon="format_italic" title="In nghiêng" />
                          <ToolbarBtn icon="format_underlined" title="Gạch dưới" />
                          <div className="w-px h-5 bg-outline-variant mx-1" />
                          <ToolbarBtn icon="format_list_bulleted" title="Danh sách" />
                          <ToolbarBtn icon="format_list_numbered" title="Danh sách số" />
                        </div>
                        <textarea
                          rows={8}
                          placeholder="Viết nội dung đầy đủ..."
                          value={form.content}
                          onChange={e => update('content', e.target.value)}
                          className="w-full border-none bg-transparent p-4 font-body-md text-body-md focus:ring-0 resize-y"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-label-md text-label-md text-on-surface-variant mb-2">
                        URL ảnh bìa
                      </label>
                      <input
                        type="url"
                        placeholder="https://..."
                        value={form.imageUrl}
                        onChange={e => update('imageUrl', e.target.value)}
                        className="w-full bg-surface-bright border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-colors"
                      />
                      {form.imageUrl && (
                        <img src={form.imageUrl} alt="Preview" className="mt-3 rounded-lg h-40 object-cover w-full" />
                      )}
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
                        Địa điểm *
                      </label>
                      <div className="relative">
                        <select
                          value={form.locationId}
                          onChange={e => update('locationId', e.target.value)}
                          className="w-full bg-surface-bright border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md appearance-none focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-colors text-on-surface"
                        >
                          <option value="">-- Chọn địa điểm --</option>
                          {locations.map(loc => (
                            <option key={loc.locationId} value={loc.locationId}>
                              {loc.locationName}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-on-surface-variant">
                          <span className="material-symbols-outlined">expand_more</span>
                        </div>
                      </div>
                      {locations.length === 0 && (
                        <p className="font-caption text-caption text-outline mt-2">
                          Chưa có địa điểm nào. Admin cần tạo địa điểm trước.
                        </p>
                      )}
                    </div>

                    <hr className="border-outline-variant border-dashed" />

                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <label className="block font-label-md text-label-md text-on-background mb-1">
                          Tác giả
                        </label>
                        <p className="font-caption text-caption text-outline">{user?.userName ?? '—'}</p>
                      </div>
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
