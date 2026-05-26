import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import TopNavBar from '../../components/layouts/TopNavBar'
import Footer from '../../components/layouts/Footer'
import { postsService } from '../../services/posts.service'
import { savedPostsService } from '../../services/saved-posts.service'
import { useAuthStore } from '../../store/authStore'
import type { Post } from '../../types'

// ── Subcomponent ───────────────────────────────────────────────────────────
function PostCard({ post }: { post: Post }) {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const [saved, setSaved] = useState(false)
  const [toggling, setToggling] = useState(false)

  const avgRating = post.avgRating ?? (post._count?.ratings ? null : null)
  const ratingCount = post._count?.ratings ?? 0

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (toggling) return
    setToggling(true)
    try {
      const result = await savedPostsService.toggle(post.postId)
      setSaved(result.saved)
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
          onClick={handleFavorite}
          disabled={toggling}
          aria-label={saved ? 'Bỏ yêu thích' : 'Thêm yêu thích'}
          className={[
            'absolute top-4 right-4 h-8 w-8 bg-surface-container-lowest/80 backdrop-blur-sm rounded-full',
            'flex items-center justify-center transition-colors disabled:opacity-60',
            saved ? 'text-error' : 'text-on-surface-variant hover:text-error',
          ].join(' ')}
        >
          <span
            className="material-symbols-outlined text-[20px]"
            style={{ fontVariationSettings: saved ? "'FILL' 1" : "'FILL' 0" }}
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
        {avgRating !== null && avgRating !== undefined && (
          <div className="flex items-center gap-1 mb-3">
            <span className="material-symbols-outlined text-[16px] icon-fill" style={{ color: '#ffb77d' }}>star</span>
            <span className="font-caption text-caption font-semibold">{avgRating.toFixed(1)}</span>
            <span className="font-caption text-caption text-on-surface-variant">({ratingCount} đánh giá)</span>
          </div>
        )}
        <p className="font-body-md text-body-md text-on-surface-variant text-sm line-clamp-2">{post.content}</p>
      </div>
    </Link>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function Home() {
  const { data: posts = [], isLoading, isError } = useQuery({
    queryKey: ['posts', 'Publish'],
    queryFn: () => postsService.fetchPosts({ status: 'Publish' }),
  })

  const featured = posts[0]
  const trending = posts.slice(0, 8)

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col">
      <TopNavBar />

      <main className="flex-1 pt-24 pb-16">

        {/* ── Hero Section ───────────────────────────────────────── */}
        <section className="container-page mb-section-gap pt-8">
          <h1 className="font-display text-headline-lg-mobile md:text-display-lg text-primary mb-2">
            Khám phá cho bạn
          </h1>
          <p className="font-sans text-body-lg text-on-surface-variant mb-8">
            Những điểm đến tuyệt vời được tuyển chọn phù hợp với phong cách du lịch của bạn.
          </p>

          {/* Featured hero card */}
          {featured ? (
            <Link
              to={`/landmarks/${featured.postId}`}
              className="relative w-full h-[50vh] md:h-[60vh] rounded-xl overflow-hidden card-shadow block"
            >
              <img
                src={featured.imageUrl ?? 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1400&q=80'}
                alt={featured.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2e3132]/80 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 p-8 w-full">
                <span className="bg-secondary-container text-on-secondary-container font-caption text-caption px-3 py-1 rounded-full mb-3 inline-block font-semibold">
                  Nổi bật
                </span>
                <h2 className="font-display text-headline-lg text-white mb-2">{featured.title}</h2>
                {featured.location && (
                  <p className="text-white/80 font-body-md text-body-md">{featured.location.locationName}</p>
                )}
              </div>
            </Link>
          ) : (
            <div className="relative w-full h-[50vh] md:h-[60vh] rounded-xl overflow-hidden card-shadow bg-surface-container flex items-center justify-center">
              {isLoading ? (
                <div className="w-10 h-10 rounded-full border-4 border-primary-fixed border-t-primary animate-spin" />
              ) : (
                <p className="text-on-surface-variant">Chưa có bài viết nào</p>
              )}
            </div>
          )}
        </section>

        {/* ── Trending Grid ─────────────────────────────────────── */}
        <section className="container-page">
          <div className="flex justify-between items-end mb-8 border-b border-surface-variant pb-4">
            <h2 className="font-display text-headline-md text-on-surface">Điểm đến nổi bật</h2>
          </div>

          {isLoading && (
            <div className="flex justify-center py-16">
              <div className="w-10 h-10 rounded-full border-4 border-primary-fixed border-t-primary animate-spin" />
            </div>
          )}

          {isError && (
            <p className="text-center py-16 text-on-surface-variant">Không thể tải dữ liệu. Vui lòng thử lại.</p>
          )}

          {!isLoading && !isError && trending.length === 0 && (
            <p className="text-center py-16 text-on-surface-variant">Chưa có bài viết nào được xuất bản.</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter">
            {trending.map(post => (
              <PostCard key={post.postId} post={post} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
