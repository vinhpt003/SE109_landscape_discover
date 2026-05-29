import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import AdminSideNav from '../../../components/layouts/AdminSideNav'
import AdminTopBar from '../../../components/layouts/AdminTopBar'
import { commentsService } from '../../../services/comments.service'
import type { CommentWithPost } from '../../../types'

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins} phút trước`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} giờ trước`
  return `${Math.floor(hrs / 24)} ngày trước`
}

export default function AdminComments() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const LIMIT = 30

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['admin-comments', page],
    queryFn: () => commentsService.fetchAll({ page, limit: LIMIT }),
  })

  const deleteMutation = useMutation({
    mutationFn: (commentId: string) => commentsService.remove(commentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-comments'] }),
  })

  const filtered = comments.filter(c =>
    !search ||
    c.content.toLowerCase().includes(search.toLowerCase()) ||
    c.user?.userName.toLowerCase().includes(search.toLowerCase()),
  )

  const handleDelete = (comment: CommentWithPost) => {
    if (!window.confirm('Xóa bình luận này?')) return
    deleteMutation.mutate(comment.commentId)
  }

  return (
    <div className="bg-surface min-h-screen flex">
      <AdminSideNav />

      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <AdminTopBar />

        <main className="flex-1 pt-24 px-margin-desktop pb-margin-desktop bg-background overflow-y-auto">
          <div className="max-w-container-max mx-auto">

            {/* Page header */}
            <div className="mb-8">
              <h1 className="font-display text-headline-lg text-on-surface">Kiểm duyệt bình luận</h1>
              <p className="font-sans text-body-md text-on-surface-variant mt-1">
                Xem và xóa các bình luận vi phạm.
              </p>
            </div>

            {/* Search */}
            <div className="bg-surface-bright p-4 rounded-xl border border-outline-variant mb-6">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
                <input
                  type="text"
                  placeholder="Tìm theo nội dung hoặc tên người dùng..."
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1) }}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2.5 pl-10 pr-4 text-on-surface font-body-md text-body-md focus:ring-1 focus:ring-secondary focus:border-secondary focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* List */}
            <div className="bg-surface-bright rounded-xl border border-outline-variant overflow-hidden card-shadow">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[760px]">
                  <thead className="bg-surface-container border-b border-outline-variant text-on-surface-variant font-label-md text-label-md">
                    <tr>
                      <th className="py-4 px-6">Người bình luận</th>
                      <th className="py-4 px-6">Nội dung</th>
                      <th className="py-4 px-6">Bài viết</th>
                      <th className="py-4 px-6">Thời gian</th>
                      <th className="py-4 px-6 text-right">Hành động</th>
                    </tr>
                  </thead>

                  <tbody className="font-body-md text-body-md text-on-surface divide-y divide-surface-variant">
                    {isLoading && (
                      <tr>
                        <td colSpan={5} className="py-16 text-center">
                          <div className="w-8 h-8 rounded-full border-4 border-primary-fixed border-t-primary animate-spin mx-auto" />
                        </td>
                      </tr>
                    )}

                    {!isLoading && filtered.map(comment => (
                      <tr key={comment.commentId} className="hover:bg-surface-container-low transition-colors group">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                              {comment.user?.avatar
                                ? <img src={comment.user.avatar} alt={comment.user.userName} className="w-full h-full rounded-full object-cover" />
                                : <span className="text-on-primary text-xs font-bold uppercase">{comment.user?.userName?.[0] ?? '?'}</span>
                              }
                            </div>
                            <span className="font-label-md text-label-md">{comment.user?.userName ?? 'Ẩn danh'}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 max-w-xs">
                          <p className="line-clamp-2 text-on-surface-variant">{comment.content}</p>
                        </td>
                        <td className="py-4 px-6">
                          {comment.post ? (
                            <Link
                              to={`/landmarks/${comment.post.postId}`}
                              className="text-secondary hover:underline line-clamp-1"
                            >
                              {comment.post.title}
                            </Link>
                          ) : '—'}
                        </td>
                        <td className="py-4 px-6 text-on-surface-variant whitespace-nowrap">
                          {timeAgo(comment.createdAt)}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => handleDelete(comment)}
                            disabled={deleteMutation.isPending}
                            className="p-2 text-on-surface-variant hover:text-error rounded-full hover:bg-error-container transition-colors opacity-0 group-hover:opacity-100"
                            title="Xóa bình luận"
                          >
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}

                    {!isLoading && filtered.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-16 text-center text-on-surface-variant font-body-md text-body-md">
                          <span className="material-symbols-outlined text-[48px] block mb-3 opacity-40">chat_bubble</span>
                          Không có bình luận nào.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="bg-surface-bright border-t border-outline-variant py-3 px-6 flex items-center justify-between">
                <span className="font-body-md text-body-md text-on-surface-variant">
                  Hiển thị {filtered.length} bình luận
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  <span className="font-label-md text-label-md text-on-surface px-2">Trang {page}</span>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={comments.length < LIMIT}
                    className="p-2 rounded-lg hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}
