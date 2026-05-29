import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import TopNavBar from '../../components/layouts/TopNavBar'
import Footer from '../../components/layouts/Footer'
import { postsService } from '../../services/posts.service'
import { commentsService } from '../../services/comments.service'
import { ratingsService } from '../../services/ratings.service'
import { useAuthStore } from '../../store/authStore'
import type { Comment } from '../../types'

// ── Comment card ───────────────────────────────────────────────────────────
function CommentCard({ comment }: { comment: Comment }) {
  const user = comment.user
  const initials = user?.userName?.slice(0, 2).toUpperCase() ?? '??'

  return (
    <div className="bg-surface-container-lowest p-6 rounded-xl border border-surface-container-low shadow-ambient flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.userName} className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-primary font-bold text-label-md">
              {initials}
            </div>
          )}
          <div>
            <p className="font-label-md text-label-md text-on-surface">{user?.userName ?? 'Người dùng'}</p>
            <p className="font-caption text-caption text-on-surface-variant">
              {new Date(comment.createdAt).toLocaleDateString('vi-VN')}
            </p>
          </div>
        </div>
      </div>
      <p className="text-on-surface-variant leading-relaxed text-body-md">{comment.content}</p>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function LandmarkDetail() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const { isAuthenticated } = useAuthStore()
  const [commentText, setCommentText] = useState('')
  const [userRating, setUserRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)

  const { data: post, isLoading, isError } = useQuery({
    queryKey: ['post', id],
    queryFn: () => postsService.fetchPostById(id!),
    enabled: !!id,
  })

  const addComment = useMutation({
    mutationFn: (content: string) => commentsService.create(id!, content),
    onSuccess: () => {
      setCommentText('')
      queryClient.invalidateQueries({ queryKey: ['post', id] })
    },
  })

  const ratePost = useMutation({
    mutationFn: (score: number) => ratingsService.upsert(id!, score),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post', id] })
    },
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 rounded-full border-4 border-primary-fixed border-t-primary animate-spin" />
      </div>
    )
  }

  if (isError || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background flex-col gap-4">
        <p className="text-on-surface-variant">Không tìm thấy bài viết.</p>
        <Link to="/" className="text-primary hover:underline">Về trang chủ</Link>
      </div>
    )
  }

  const comments: Comment[] = (post as any).comments ?? []
  const avgRating = post.avgRating
  const ratingCount = post.ratingCount ?? 0
  const images = post.imageUrl ? [post.imageUrl] : []

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col">
      <TopNavBar />

      <main className="flex-1 pt-24 pb-section-gap container-page flex flex-col gap-8">

        {/* ── Image Mosaic / Single image ─────────────────────────── */}
        {images.length > 0 && (
          <section className="h-[400px] md:h-[480px] rounded-xl overflow-hidden card-shadow">
            <img src={images[0]} alt={post.title} className="w-full h-full object-cover" />
          </section>
        )}

        {/* ── Core Info Panel ────────────────────────────────────── */}
        <section className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 flex flex-col gap-6 bg-surface-container-lowest p-6 md:p-8 rounded-xl card-shadow border border-surface-container-low">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-start flex-wrap gap-2">
                <h1 className="font-display text-display-lg text-on-surface">{post.title}</h1>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full font-caption text-caption">
                  {post.status}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-on-surface-variant font-body-md text-body-md">
                {post.location && (
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[20px]">location_on</span>
                    {post.location.locationName}
                  </span>
                )}
                {avgRating !== null && avgRating !== undefined && (
                  <span className="flex items-center gap-1 text-primary">
                    <span className="material-symbols-outlined text-[20px] icon-fill">star</span>
                    {avgRating.toFixed(1)} ({ratingCount.toLocaleString()} đánh giá)
                  </span>
                )}
                {post.author && (
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[20px]">person</span>
                    {post.author.userName}
                  </span>
                )}
              </div>
            </div>

            <p className="font-sans text-body-lg text-on-surface-variant leading-relaxed whitespace-pre-line">
              {post.content}
            </p>
          </div>

          {/* Action panel */}
          <div className="w-full md:w-[340px] shrink-0">
            <div className="bg-surface-container-lowest p-6 rounded-xl card-shadow border border-surface-container-low flex flex-col gap-6 sticky top-24">
              <div>
                <h3 className="font-display text-headline-md text-on-surface mb-1">Đánh giá bài viết này</h3>
                {isAuthenticated ? (
                  <div className="flex gap-1 mt-3">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => { setUserRating(star); ratePost.mutate(star) }}
                        style={{ color: '#6b3700' }}
                      >
                        <span
                          className="material-symbols-outlined text-[28px]"
                          style={{ fontVariationSettings: star <= (hoverRating || userRating) ? "'FILL' 1" : "'FILL' 0" }}
                        >
                          star
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="font-body-md text-body-md text-on-surface-variant mt-2">
                    <Link to="/login" className="text-primary hover:underline">Đăng nhập</Link> để đánh giá bài viết.
                  </p>
                )}
              </div>

              <div className="border-t border-surface-variant pt-4 text-body-md text-on-surface-variant">
                <div className="flex justify-between">
                  <span>Giờ mở cửa</span>
                  <span className="text-on-surface font-medium">{lm?.hours ?? '08:00 SA - 18:00 CH (Hàng ngày)'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Thời điểm tốt nhất</span>
                  <span className="text-on-surface font-medium">{lm?.bestTime ?? 'Quanh năm'}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Community Feed ─────────────────────────────────────── */}
        <section className="flex flex-col gap-6">
          <h2 className="font-display text-headline-lg text-on-surface">Cộng đồng bình luận</h2>

          {/* Comment input */}
          {isAuthenticated && (
            <div className="bg-surface-container-lowest p-4 md:p-6 rounded-xl border border-surface-container-low card-shadow flex flex-col gap-3">
              <textarea
                rows={3}
                placeholder="Viết bình luận của bạn..."
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                className="w-full bg-surface-bright border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-colors resize-none"
              />
              <div className="flex justify-end">
                <button
                  onClick={() => commentText.trim() && addComment.mutate(commentText.trim())}
                  disabled={addComment.isPending || !commentText.trim()}
                  className="px-6 py-2.5 bg-primary text-on-primary rounded-full font-label-md text-label-md hover:bg-primary-container transition-all disabled:opacity-60"
                >
                  {addComment.isPending ? 'Đang gửi...' : 'Gửi bình luận'}
                </button>
              </div>
            </div>
          )}

          {!isAuthenticated && (
            <p className="font-body-md text-body-md text-on-surface-variant">
              <Link to="/login" className="text-primary hover:underline">Đăng nhập</Link> để bình luận.
            </p>
          )}

          {/* Comment list */}
          <div className="flex flex-col gap-6">
            {comments.length === 0 ? (
              <p className="text-on-surface-variant font-body-md text-body-md">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
            ) : (
              comments.map(c => <CommentCard key={c.commentId} comment={c} />)
            )}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  )
}
