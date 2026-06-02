import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import TopNavBar from '../../components/layouts/TopNavBar'
import Footer from '../../components/layouts/Footer'
import { postsService } from '../../services/posts.service'
import { locationsService } from '../../services/locations.service'
import { useAuthStore } from '../../store/authStore'
import { useToast } from '../../hooks/useToast'
import Toaster from '../../components/ui/Toaster'
import ImageUploader from '../../components/forms/ImageUploader'

const STATUS_LABEL: Record<string, string> = {
  Draft: 'Nháp',
  Pending: 'Chờ duyệt',
  Publish: 'Đã đăng',
  Rejected: 'Bị từ chối',
}

export default function EditMyPost() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const qc = useQueryClient()
  const { user } = useAuthStore()
  const { toasts, toast, dismiss } = useToast()
  const isNew = !id || id === 'new'

  const [form, setForm] = useState<{
    title: string
    content: string
    imageUrl: string | null
    imagePublicId: string | null
    locationId: string
  }>({
    title: '',
    content: '',
    imageUrl: null,
    imagePublicId: null,
    locationId: '',
  })
  const [error, setError] = useState('')

  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: () => locationsService.fetchLocations(),
  })

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
        imageUrl: existingPost.imageUrl ?? null,
        imagePublicId: existingPost.imagePublicId ?? null,
        locationId: existingPost.locationId,
      })
    }
  }, [existingPost])

  const createMut = useMutation({
    mutationFn: (publish: boolean) =>
      postsService.createPost({
        locationId: form.locationId,
        title: form.title,
        content: form.content,
        imageUrl: form.imageUrl ?? undefined,
        imagePublicId: form.imagePublicId ?? undefined,
        status: publish ? 'Pending' : 'Draft',
      }),
    onSuccess: (_data, publish) => {
      qc.invalidateQueries({ queryKey: ['my-posts'] })
      toast(publish ? 'Đã gửi bài chờ duyệt' : 'Đã lưu nháp', 'success')
      setTimeout(() => navigate('/my-posts'), 800)
    },
    onError: (err: any) => setError(err?.response?.data?.message ?? 'Có lỗi xảy ra'),
  })

  const updateMut = useMutation({
    mutationFn: () =>
      postsService.updatePost(id!, {
        title: form.title,
        content: form.content,
        imageUrl: form.imageUrl,
        imagePublicId: form.imagePublicId,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-posts'] })
      qc.invalidateQueries({ queryKey: ['post', id] })
      toast('Đã lưu thay đổi', 'success')
      setTimeout(() => navigate('/my-posts'), 800)
    },
    onError: (err: any) => setError(err?.response?.data?.message ?? 'Có lỗi xảy ra'),
  })

  const validate = (): boolean => {
    if (!form.title.trim()) { setError('Tiêu đề không được để trống'); return false }
    if (!form.content.trim()) { setError('Nội dung không được để trống'); return false }
    if (!form.locationId) { setError('Vui lòng chọn địa điểm'); return false }
    setError('')
    return true
  }

  const handleSaveDraft = () => {
    if (!validate()) return
    if (isNew) createMut.mutate(false)
    else updateMut.mutate()
  }

  const handleSubmit = () => {
    if (!validate()) return
    if (isNew) createMut.mutate(true)
    else updateMut.mutate()
  }

  const update = (field: keyof typeof form, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const isSaving = createMut.isPending || updateMut.isPending
  const currentStatus = existingPost?.status

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopNavBar />

      <main className="flex-1 pt-28 pb-16 container-page">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <Link
              to="/my-posts"
              className="inline-flex items-center gap-1 text-outline hover:text-primary font-label-md text-label-md mb-2 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Quay lại bài viết của tôi
            </Link>
            <h1 className="font-display text-headline-lg text-on-background">
              {isNew ? 'Viết bài mới' : `Chỉnh sửa: ${form.title || '...'}`}
            </h1>
            {!isNew && currentStatus && (
              <p className="font-caption text-caption text-on-surface-variant mt-1">
                Trạng thái hiện tại: <span className="font-semibold">{STATUS_LABEL[currentStatus]}</span>
                {currentStatus === 'Rejected' && (
                  <span className="ml-2 text-error">— Chỉnh sửa rồi lưu lại để gửi duyệt</span>
                )}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => navigate('/my-posts')}
              className="px-5 py-2.5 rounded-lg border border-outline-variant text-on-surface-variant font-label-md text-label-md hover:bg-surface-container-low transition-colors"
            >
              Hủy
            </button>
            {isNew && (
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-lg border border-primary text-primary font-label-md text-label-md hover:bg-primary-fixed transition-colors disabled:opacity-60"
              >
                Lưu nháp
              </button>
            )}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-colors shadow-float disabled:opacity-60"
            >
              {isSaving ? 'Đang lưu...' : isNew ? 'Gửi duyệt' : 'Lưu thay đổi'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-error-container text-on-error-container px-4 py-3 rounded-lg font-body-md text-body-md mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
          <div className="lg:col-span-2 flex flex-col gap-gutter">
            <div className="bg-surface-container-lowest rounded-xl p-6 md:p-8 border border-surface-container">
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
                  <textarea
                    rows={10}
                    placeholder="Chia sẻ trải nghiệm của bạn về địa điểm này..."
                    value={form.content}
                    onChange={e => update('content', e.target.value)}
                    className="w-full bg-surface-bright border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-colors resize-y"
                  />
                </div>

                <div>
                  <ImageUploader
                    label="Ảnh bìa"
                    value={form.imageUrl}
                    publicId={form.imagePublicId}
                    onChange={({ url, publicId }) =>
                      setForm(prev => ({ ...prev, imageUrl: url, imagePublicId: publicId }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 flex flex-col gap-gutter">
            <div className="bg-surface-container-lowest rounded-xl p-6 md:p-8 border border-surface-container">
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
                          {loc.region === 'North' ? ' — Miền Bắc'
                            : loc.region === 'Central' ? ' — Miền Trung'
                            : loc.region === 'South' ? ' — Miền Nam' : ''}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-on-surface-variant">
                      <span className="material-symbols-outlined">expand_more</span>
                    </div>
                  </div>
                  {locations.length === 0 && (
                    <p className="font-caption text-caption text-outline mt-2">
                      Chưa có địa điểm nào. Liên hệ Admin để tạo địa điểm.
                    </p>
                  )}
                </div>

                <hr className="border-outline-variant border-dashed" />

                <div>
                  <label className="block font-label-md text-label-md text-on-background mb-1">
                    Tác giả
                  </label>
                  <p className="font-caption text-caption text-outline">{user?.userName ?? '—'}</p>
                </div>

                {isNew && (
                  <div className="bg-tertiary-fixed/30 rounded-lg p-4 border border-tertiary-fixed">
                    <p className="font-caption text-caption text-on-surface-variant">
                      <span className="material-symbols-outlined text-[14px] align-middle mr-1">info</span>
                      Bài viết sẽ ở trạng thái <strong>Chờ duyệt</strong> cho đến khi Admin phê duyệt.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <Toaster toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}
