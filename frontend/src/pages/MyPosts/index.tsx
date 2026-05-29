import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import TopNavBar from '../../components/layouts/TopNavBar'
import Footer from '../../components/layouts/Footer'
import { postsService } from '../../services/posts.service'
import { useToast } from '../../hooks/useToast'
import Toaster from '../../components/ui/Toaster'
import type { Post, PostStatus } from '../../types'

const TABS: { value: PostStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'Publish', label: 'Đã đăng' },
  { value: 'Pending', label: 'Chờ duyệt' },
  { value: 'Rejected', label: 'Bị từ chối' },
  { value: 'Draft', label: 'Nháp' },
]

const STATUS_STYLE: Record<PostStatus, { bg: string; text: string; label: string }> = {
  Publish:  { bg: 'bg-success-container',   text: 'text-on-success-container',   label: 'Đã đăng' },
  Pending:  { bg: 'bg-tertiary-fixed',      text: 'text-on-tertiary-fixed',      label: 'Chờ duyệt' },
  Rejected: { bg: 'bg-error-container',     text: 'text-on-error-container',     label: 'Bị từ chối' },
  Draft:    { bg: 'bg-surface-container',   text: 'text-on-surface-variant',     label: 'Nháp' },
}

function StatusBadge({ status }: { status: PostStatus }) {
  const s = STATUS_STYLE[status]
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-caption text-caption font-semibold ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  )
}

function PostRow({ post, onDelete }: { post: Post; onDelete: (id: string) => void }) {
  const navigate = useNavigate()
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-surface-container p-5 flex flex-col md:flex-row gap-4 hover:shadow-float transition-shadow">
      <div className="md:w-48 h-32 rounded-lg overflow-hidden bg-surface-container shrink-0">
        {post.imageUrl ? (
          <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[40px] opacity-40">image</span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-start gap-3 justify-between flex-wrap">
          <h3 className="font-label-md text-label-md text-on-surface flex-1 line-clamp-2">
            {post.title}
          </h3>
          <StatusBadge status={post.status} />
        </div>

        <p className="font-body-md text-body-md text-on-surface-variant mt-2 line-clamp-2">
          {post.content}
        </p>

        <div className="flex items-center gap-4 mt-3 font-caption text-caption text-outline">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">location_on</span>
            {post.location?.locationName ?? '—'}
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">chat</span>
            {post._count?.comments ?? 0}
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">star</span>
            {post._count?.ratings ?? 0}
          </span>
          <span className="ml-auto">
            {new Date(post.updatedAt).toLocaleDateString('vi-VN')}
          </span>
        </div>

        <div className="flex items-center gap-2 mt-4">
          {post.status === 'Publish' && (
            <Link
              to={`/landmarks/${post.postId}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container-low font-label-md text-label-md transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">visibility</span>
              Xem
            </Link>
          )}
          <button
            onClick={() => navigate(`/my-posts/${post.postId}/edit`)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-primary text-primary hover:bg-primary-fixed font-label-md text-label-md transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">edit</span>
            Chỉnh sửa
          </button>
          <button
            onClick={() => onDelete(post.postId)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-error text-error hover:bg-error-container font-label-md text-label-md transition-colors ml-auto"
          >
            <span className="material-symbols-outlined text-[16px]">delete</span>
            Xóa
          </button>
        </div>
      </div>
    </div>
  )
}

export default function MyPosts() {
  const [tab, setTab] = useState<PostStatus | 'all'>('all')
  const qc = useQueryClient()
  const { toasts, toast, dismiss } = useToast()

  const { data, isLoading } = useQuery({
    queryKey: ['my-posts', tab],
    queryFn: () => postsService.fetchMyPosts({
      status: tab === 'all' ? undefined : tab,
      limit: 50,
    }),
  })

  const deleteMut = useMutation({
    mutationFn: (id: string) => postsService.deletePost(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-posts'] })
      toast('Đã xóa bài viết', 'success')
    },
    onError: () => toast('Xóa thất bại', 'error'),
  })

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn chắc chắn muốn xóa bài viết này?')) {
      deleteMut.mutate(id)
    }
  }

  const posts = data?.data ?? []

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopNavBar />

      <main className="flex-1 pt-28 pb-16 container-page">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-display-sm text-on-background">Bài viết của tôi</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Quản lý các bài viết bạn đã đăng và đang chờ duyệt
            </p>
          </div>
          <Link
            to="/my-posts/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md shadow-float transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Viết bài mới
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-outline-variant">
          {TABS.map(t => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`px-4 py-2 font-label-md text-label-md transition-colors border-b-2 -mb-px ${
                tab === t.value
                  ? 'text-primary border-primary'
                  : 'text-on-surface-variant border-transparent hover:text-primary'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* List */}
        {isLoading ? (
          <div className="text-center py-16 text-on-surface-variant">Đang tải...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-[64px] text-outline-variant">article</span>
            <p className="font-body-md text-body-md text-on-surface-variant mt-3">
              {tab === 'all'
                ? 'Bạn chưa có bài viết nào.'
                : `Không có bài viết nào ở trạng thái "${TABS.find(t => t.value === tab)?.label}".`}
            </p>
            <Link
              to="/my-posts/new"
              className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Viết bài đầu tiên
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {posts.map(p => (
              <PostRow key={p.postId} post={p} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </main>

      <Footer />
      <Toaster toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}
