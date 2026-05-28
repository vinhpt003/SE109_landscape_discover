import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import AdminSideNav from '../../../components/layouts/AdminSideNav'
import AdminTopBar from '../../../components/layouts/AdminTopBar'
import { postsService } from '../../../services/posts.service'
import type { Post, PostStatus } from '../../../types'

// ── Badge ──────────────────────────────────────────────────────────────────
const STATUS_STYLE: Record<PostStatus, string> = {
  Publish:  'bg-secondary-container text-on-secondary-container',
  Draft:    'bg-surface-variant text-on-surface-variant',
  Pending:  'bg-tertiary-fixed text-on-tertiary-fixed-variant',
  Rejected: 'bg-error-container text-on-error-container',
}

const STATUS_LABEL: Record<PostStatus, string> = {
  Publish:  'Đã xuất bản',
  Draft:    'Nháp',
  Pending:  'Chờ duyệt',
  Rejected: 'Từ chối',
}

function StatusBadge({ status }: { status: PostStatus }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-caption text-caption font-semibold ${STATUS_STYLE[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function AdminLandmarks() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<PostStatus | ''>('')

  const { data: postsResponse, isLoading } = useQuery({
    queryKey: ['admin-posts', statusFilter],
    queryFn: () => postsService.fetchPosts(statusFilter ? { status: statusFilter as PostStatus, limit: 200 } : { limit: 200 }),
  })
  const posts = postsResponse?.data ?? []

  const deleteMutation = useMutation({
    mutationFn: (postId: string) => postsService.deletePost(postId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-posts'] }),
  })

  const approveMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: PostStatus }) =>
      postsService.updatePostStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-posts'] }),
  })

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const filtered = posts.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || p.status === statusFilter
    return matchSearch && matchStatus
  })

  const toggleAll = () => {
    setSelected(prev => prev.size === filtered.length ? new Set() : new Set(filtered.map(p => p.postId)))
  }

  const handleDelete = (post: Post) => {
    if (!window.confirm(`Xóa bài viết "${post.title}"?`)) return
    deleteMutation.mutate(post.postId)
  }

  return (
    <div className="bg-surface min-h-screen flex">
      <AdminSideNav />

      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <AdminTopBar />

        <main className="flex-1 pt-24 px-margin-desktop pb-margin-desktop bg-background overflow-y-auto">
          <div className="max-w-container-max mx-auto">

            {/* Page header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h1 className="font-display text-headline-lg text-on-surface">Quản lý bài viết</h1>
                <p className="font-sans text-body-md text-on-surface-variant mt-1">
                  Xem, chỉnh sửa và duyệt nội dung bài viết.
                </p>
              </div>
              <button
                onClick={() => navigate('/admin/landmarks/new')}
                className="bg-primary text-on-primary px-6 py-3 rounded-lg font-label-md text-label-md flex items-center gap-2 shadow-float hover:-translate-y-0.5 transition-transform"
              >
                <span className="material-symbols-outlined">add</span>
                Thêm bài viết mới
              </button>
            </div>

            {/* Filters */}
            <div className="bg-surface-bright p-4 rounded-xl border border-outline-variant mb-6 flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tiêu đề..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2.5 pl-10 pr-4 text-on-surface font-body-md text-body-md focus:ring-1 focus:ring-secondary focus:border-secondary focus:outline-none transition-all"
                />
              </div>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as PostStatus | '')}
                className="bg-surface-container-low border border-outline-variant rounded-lg py-2.5 px-4 text-on-surface font-body-md text-body-md focus:ring-1 focus:ring-secondary focus:outline-none"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="Publish">Đã xuất bản</option>
                <option value="Pending">Chờ duyệt</option>
                <option value="Draft">Nháp</option>
                <option value="Rejected">Từ chối</option>
              </select>
            </div>

            {/* Table */}
            <div className="bg-surface-bright rounded-xl border border-outline-variant overflow-hidden card-shadow">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[860px]">
                  <thead className="bg-surface-container border-b border-outline-variant text-on-surface-variant font-label-md text-label-md">
                    <tr>
                      <th className="py-4 px-6 w-14">
                        <input
                          type="checkbox"
                          checked={selected.size === filtered.length && filtered.length > 0}
                          onChange={toggleAll}
                          className="w-4 h-4 rounded border-outline text-primary focus:ring-primary"
                        />
                      </th>
                      <th className="py-4 px-6">Ảnh</th>
                      <th className="py-4 px-6">Tiêu đề</th>
                      <th className="py-4 px-6">Địa điểm</th>
                      <th className="py-4 px-6">Tác giả</th>
                      <th className="py-4 px-6">Trạng thái</th>
                      <th className="py-4 px-6 text-right">Hành động</th>
                    </tr>
                  </thead>

                  <tbody className="font-body-md text-body-md text-on-surface divide-y divide-surface-variant">
                    {isLoading && (
                      <tr>
                        <td colSpan={7} className="py-16 text-center">
                          <div className="w-8 h-8 rounded-full border-4 border-primary-fixed border-t-primary animate-spin mx-auto" />
                        </td>
                      </tr>
                    )}

                    {!isLoading && filtered.map(post => (
                      <tr key={post.postId} className="hover:bg-surface-container-low transition-colors group">
                        <td className="py-4 px-6">
                          <input
                            type="checkbox"
                            checked={selected.has(post.postId)}
                            onChange={() => toggleSelect(post.postId)}
                            className="w-4 h-4 rounded border-outline text-primary focus:ring-primary"
                          />
                        </td>
                        <td className="py-4 px-6">
                          <div className="w-12 h-12 rounded-lg overflow-hidden border border-outline-variant bg-surface-container">
                            {post.imageUrl
                              ? <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center">
                                  <span className="material-symbols-outlined text-outline">image</span>
                                </div>
                            }
                          </div>
                        </td>
                        <td className="py-4 px-6 font-label-md text-label-md">
                          <Link to={`/landmarks/${post.postId}`} className="hover:text-primary transition-colors">
                            {post.title}
                          </Link>
                        </td>
                        <td className="py-4 px-6 text-on-surface-variant">
                          {post.location?.locationName ?? '—'}
                        </td>
                        <td className="py-4 px-6 text-on-surface-variant">
                          {post.author?.userName ?? '—'}
                        </td>
                        <td className="py-4 px-6">
                          <StatusBadge status={post.status} />
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {post.status === 'Pending' && (
                              <>
                                <button
                                  onClick={() => approveMutation.mutate({ id: post.postId, status: 'Publish' })}
                                  className="p-2 text-on-surface-variant hover:text-secondary rounded-full hover:bg-surface-container transition-colors"
                                  title="Duyệt"
                                >
                                  <span className="material-symbols-outlined">check_circle</span>
                                </button>
                                <button
                                  onClick={() => approveMutation.mutate({ id: post.postId, status: 'Rejected' })}
                                  className="p-2 text-on-surface-variant hover:text-error rounded-full hover:bg-error-container transition-colors"
                                  title="Từ chối"
                                >
                                  <span className="material-symbols-outlined">cancel</span>
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => navigate(`/admin/landmarks/${post.postId}/edit`)}
                              className="p-2 text-on-surface-variant hover:text-primary rounded-full hover:bg-surface-container transition-colors"
                              title="Chỉnh sửa"
                            >
                              <span className="material-symbols-outlined">edit</span>
                            </button>
                            <button
                              onClick={() => handleDelete(post)}
                              disabled={deleteMutation.isPending}
                              className="p-2 text-on-surface-variant hover:text-error rounded-full hover:bg-error-container transition-colors"
                              title="Xóa"
                            >
                              <span className="material-symbols-outlined">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {!isLoading && filtered.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-16 text-center text-on-surface-variant font-body-md text-body-md">
                          <span className="material-symbols-outlined text-[48px] block mb-3 opacity-40">search_off</span>
                          Không tìm thấy bài viết nào phù hợp.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="bg-surface-bright border-t border-outline-variant py-3 px-6 flex items-center justify-between">
                <span className="font-body-md text-body-md text-on-surface-variant">
                  Hiển thị {filtered.length} trong tổng số {postsResponse?.total ?? posts.length} bài viết
                </span>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}
