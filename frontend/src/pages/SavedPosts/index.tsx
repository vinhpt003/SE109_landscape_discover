import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import TopNavBar from '../../components/layouts/TopNavBar'
import Footer from '../../components/layouts/Footer'
import { savedPostsService } from '../../services/saved-posts.service'
import type { Post } from '../../types'

function SavedPostCard({ post, onUnsave }: { post: Post; onUnsave: () => void }) {
  const [toggling, setToggling] = useState(false)
  const avgRating = post.avgRating ?? null
  const ratingCount = post._count?.ratings ?? 0

  const handleUnsave = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (toggling) return
    setToggling(true)
    try {
      await savedPostsService.toggle(post.postId)
      onUnsave()
    } catch {
      // silent
    } finally {
      setToggling(false)
    }
  }

  return (
    <Link
      to={`/landmarks/${post.postId}`}
      className="bg-surface-container-lowest rounded-lg overflow-hidden card-shadow group cursor-pointer block"
    >
      <div className="relative h-48 w-full overflow-hidden">
        <img
          src={post.imageUrl ?? 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600&q=80'}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <button
          onClick={handleUnsave}
          disabled={toggling}
          aria-label="Bỏ lưu"
          className="absolute top-4 right-4 h-8 w-8 bg-surface-container-lowest/80 backdrop-blur-sm rounded-full flex items-center justify-center text-error transition-colors disabled:opacity-60 hover:scale-110 active:scale-95"
        >
          <span
            className="material-symbols-outlined text-[20px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            favorite
          </span>
        </button>
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-label-md text-label-md text-on-surface">{post.title}</h3>
          {post.location && (
            <span className="bg-surface-container text-on-surface-variant font-caption text-caption px-2 py-1 rounded-md shrink-0 ml-2">
              {post.location.locationName}
            </span>
          )}
        </div>
        {avgRating !== null && (
          <div className="flex items-center gap-1 mb-3">
            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1", color: '#ffb77d' }}>star</span>
            <span className="font-caption text-caption font-semibold">{avgRating.toFixed(1)}</span>
            <span className="font-caption text-caption text-on-surface-variant">({ratingCount} đánh giá)</span>
          </div>
        )}
        <p className="font-body-md text-body-md text-on-surface-variant text-sm line-clamp-2">{post.content}</p>
      </div>
    </Link>
  )
}

export default function SavedPosts() {
  const queryClient = useQueryClient()

  const { data: savedList = [], isLoading, isError } = useQuery({
    queryKey: ['saved-posts'],
    queryFn: savedPostsService.fetchMySavedPosts,
  })

  const handleUnsave = (postId: string) => {
    queryClient.setQueryData<typeof savedList>(['saved-posts'], prev =>
      (prev ?? []).filter(s => s.postId !== postId)
    )
  }

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col">
      <TopNavBar />

      <main className="flex-1 pt-24 pb-16">
        <section className="container-page">
          <div className="flex justify-between items-end mb-8 border-b border-surface-variant pb-4">
            <div>
              <h1 className="font-display text-headline-lg text-on-surface">Bài viết đã lưu</h1>
              {!isLoading && !isError && (
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                  {savedList.length} địa điểm
                </p>
              )}
            </div>
          </div>

          {isLoading && (
            <div className="flex justify-center py-16">
              <div className="w-10 h-10 rounded-full border-4 border-primary-fixed border-t-primary animate-spin" />
            </div>
          )}

          {isError && (
            <p className="text-center py-16 text-on-surface-variant">Không thể tải dữ liệu. Vui lòng thử lại.</p>
          )}

          {!isLoading && !isError && savedList.length === 0 && (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-4 block">favorite_border</span>
              <p className="font-body-md text-body-md text-on-surface-variant mb-4">Bạn chưa lưu địa điểm nào.</p>
              <Link
                to="/"
                className="inline-block bg-primary text-on-primary px-6 py-2 rounded-lg font-label-md text-label-md hover:bg-primary-container transition-colors"
              >
                Khám phá ngay
              </Link>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter">
            {savedList.map(s =>
              s.post ? (
                <SavedPostCard
                  key={s.postId}
                  post={s.post}
                  onUnsave={() => handleUnsave(s.postId)}
                />
              ) : null
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
