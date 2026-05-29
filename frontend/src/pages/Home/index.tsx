import { useState, useMemo } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import TopNavBar from '../../components/layouts/TopNavBar'
import Footer from '../../components/layouts/Footer'
import { postsService } from '../../services/posts.service'
import { savedPostsService } from '../../services/saved-posts.service'
import { useAuthStore } from '../../store/authStore'
import type { Post, SavedPost } from '../../types'

const DEFAULT_IMG = 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600&q=80'

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins} phút trước`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} giờ trước`
  return `${Math.floor(hrs / 24)} ngày trước`
}

// ── Saved Trip Card ─────────────────────────────────────────────────────────
function SavedTripCard({
  savedPost,
  isSaved,
  onToggle,
}: {
  savedPost: SavedPost
  isSaved: boolean
  onToggle: (postId: string, e: React.MouseEvent) => void
}) {
  const post = savedPost.post
  if (!post) return null
  return (
    <Link
      to={`/landmarks/${post.postId}`}
      className="min-w-[280px] md:min-w-[320px] bg-surface-container-lowest rounded-xl overflow-hidden card-shadow snap-start shrink-0 block"
    >
      <div className="h-48 relative">
        <img
          src={post.imageUrl ?? DEFAULT_IMG}
          alt={post.title}
          className="w-full h-full object-cover"
        />
        <button
          onClick={e => onToggle(post.postId, e)}
          className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-secondary shadow-sm hover:scale-110 active:scale-90 transition-transform"
          aria-label="Bỏ lưu"
        >
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0" }}
          >
            favorite
          </span>
        </button>
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-display text-body-lg font-semibold text-on-surface line-clamp-2 flex-1 mr-2">
            {post.title}
          </h3>
          {post.avgRating !== null && post.avgRating !== undefined && (
            <div className="flex items-center gap-1 shrink-0">
              <span
                className="material-symbols-outlined text-[16px] icon-fill"
                style={{ color: '#ffb77d' }}
              >
                star
              </span>
              <span className="font-label-md text-label-md text-on-surface">
                {post.avgRating.toFixed(1)}
              </span>
            </div>
          )}
        </div>
        <p className="font-body-md text-body-md text-on-surface-variant text-sm">
          {post.location?.locationName ?? 'Việt Nam'}
        </p>
      </div>
    </Link>
  )
}

// ── Destination Card ────────────────────────────────────────────────────────
function DestinationCard({
  post,
  isSaved,
  onToggle,
}: {
  post: Post
  isSaved: boolean
  onToggle: (postId: string, e: React.MouseEvent) => void
}) {
  const ratingCount = post._count?.ratings ?? post.ratingCount ?? 0

  return (
    <Link
      to={`/landmarks/${post.postId}`}
      className="bg-surface-container-lowest rounded-xl overflow-hidden card-shadow group block"
    >
      <div className="h-64 relative overflow-hidden">
        <img
          src={post.imageUrl ?? DEFAULT_IMG}
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <span className="absolute top-4 left-4 bg-secondary text-on-secondary font-caption text-caption px-3 py-1 rounded-full uppercase tracking-wider">
          Đã duyệt
        </span>
      </div>
      <div className="p-5">
        {post.location && (
          <div className="flex items-center gap-1 text-on-surface-variant mb-2">
            <span className="material-symbols-outlined text-[16px]">location_on</span>
            <span className="font-caption text-caption">{post.location.locationName}</span>
          </div>
        )}
        <h3 className="font-display text-body-lg font-semibold text-on-surface mb-2 line-clamp-1">
          {post.title}
        </h3>
        <div className="flex items-center gap-1 mb-4">
          {post.avgRating !== null && post.avgRating !== undefined ? (
            <>
              <span
                className="material-symbols-outlined text-[16px] icon-fill"
                style={{ color: '#ffb77d' }}
              >
                star
              </span>
              <span className="font-label-md text-label-md text-on-surface">
                {post.avgRating.toFixed(1)}
              </span>
              <span className="font-caption text-caption text-outline ml-1">
                ({ratingCount} đánh giá)
              </span>
            </>
          ) : (
            <span className="font-caption text-caption text-outline">Chưa có đánh giá</span>
          )}
        </div>
        <button
          onClick={e => onToggle(post.postId, e)}
          className={[
            'w-full border-2 font-label-md text-label-md py-2 rounded-lg transition-all active:scale-95',
            isSaved
              ? 'bg-secondary text-on-secondary border-secondary'
              : 'border-secondary text-secondary hover:bg-secondary hover:text-on-secondary',
          ].join(' ')}
        >
          {isSaved ? '✓ Đã lưu' : 'Lưu địa điểm'}
        </button>
      </div>
    </Link>
  )
}

// ── Feed Card ───────────────────────────────────────────────────────────────
function FeedCard({ post }: { post: Post }) {
  const commentCount = post._count?.comments ?? 0

  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 card-shadow mb-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-container shrink-0">
            {post.author?.avatar ? (
              <img
                src={post.author.avatar}
                alt={post.author.userName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary">
                <span className="text-on-primary text-base font-bold uppercase">
                  {post.author?.userName?.[0] ?? '?'}
                </span>
              </div>
            )}
          </div>
          <div>
            <h4 className="font-display text-body-md font-semibold text-on-surface">
              {post.author?.userName ?? 'Ẩn danh'}
            </h4>
            <p className="font-caption text-caption text-outline">
              {timeAgo(post.createdAt)}
              {post.location ? ` • ${post.location.locationName}` : ''}
            </p>
          </div>
        </div>
        {post.avgRating !== null && post.avgRating !== undefined && (
          <div className="flex items-center gap-1 shrink-0">
            <span
              className="material-symbols-outlined text-[16px] icon-fill"
              style={{ color: '#ffb77d' }}
            >
              star
            </span>
            <span className="font-label-md text-label-md text-tertiary">
              {post.avgRating.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      <Link to={`/landmarks/${post.postId}`} className="block group">
        <h3 className="font-display text-body-md font-semibold text-on-surface mb-2 group-hover:text-primary transition-colors line-clamp-1">
          {post.title}
        </h3>
        <p className="font-body-md text-body-md text-on-surface-variant mb-4 line-clamp-3">
          {post.content}
        </p>
        {post.imageUrl && (
          <div className="h-48 rounded-lg overflow-hidden mb-4">
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        )}
      </Link>

      <div className="flex gap-6 border-t border-surface-container pt-4">
        <Link
          to={`/landmarks/${post.postId}`}
          className="flex items-center gap-2 font-label-md text-label-md text-on-surface-variant hover:text-secondary transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
          <span>{commentCount}</span>
        </Link>
      </div>
    </div>
  )
}

// ── Mobile Bottom Nav ───────────────────────────────────────────────────────
function MobileBottomNav() {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-container-lowest shadow-[0_-4px_15px_rgba(0,0,0,0.06)] z-50 flex justify-around items-center py-3 border-t border-outline-variant">
      <Link to="/" className="flex flex-col items-center gap-1 text-primary">
        <span className="material-symbols-outlined icon-fill">explore</span>
        <span className="text-[10px] font-bold font-label-md">Khám phá</span>
      </Link>
      <Link to="/saved" className="flex flex-col items-center gap-1 text-on-surface-variant">
        <span className="material-symbols-outlined">favorite</span>
        <span className="text-[10px] font-medium font-label-md">Đã lưu</span>
      </Link>
      <button className="flex flex-col items-center gap-1 text-on-surface-variant">
        <span className="material-symbols-outlined">groups</span>
        <span className="text-[10px] font-medium font-label-md">Cộng đồng</span>
      </button>
      <button className="flex flex-col items-center gap-1 text-on-surface-variant">
        <span className="material-symbols-outlined">person</span>
        <span className="text-[10px] font-medium font-label-md">Hồ sơ</span>
      </button>
    </div>
  )
}

// ── Registered User Home ────────────────────────────────────────────────────
function RegisteredUserHome({
  userName,
  posts,
  savedPosts,
  isLoadingPosts,
  onToggleSave,
  savedPostIds,
  searchQuery,
  onSearch,
}: {
  userName: string
  posts: Post[]
  savedPosts: SavedPost[]
  isLoadingPosts: boolean
  onToggleSave: (postId: string, e: React.MouseEvent) => void
  savedPostIds: Set<string>
  searchQuery: string
  onSearch: (q: string) => void
}) {
  const [searchInput, setSearchInput] = useState(searchQuery)

  const handleSearch = () => onSearch(searchInput.trim())

  const explorePosts = posts.slice(0, 8)
  const feedPosts = posts.slice(0, 5)

  return (
    <main className="flex-1 pt-24 pb-24 md:pb-16">
      <div className="container-page">

        {/* ── Personalized Hero ──────────────────────────────────── */}
        <section className="py-12 md:py-20 flex flex-col items-center text-center">
          <h1 className="font-display text-headline-lg-mobile md:text-display-lg mb-8 text-on-surface">
            Chào mừng trở lại,{' '}
            <span className="text-secondary">{userName}</span>!{' '}
            <br className="hidden md:block" />
            <span className="text-primary">Chuyến phiêu lưu tiếp theo của bạn là đâu?</span>
          </h1>
          <div className="w-full max-w-3xl bg-surface-container-lowest p-4 rounded-xl card-shadow flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex items-center bg-surface-container-low px-4 py-3 rounded-lg border border-transparent focus-within:border-secondary transition-colors">
              <span className="material-symbols-outlined text-outline mr-3">search</span>
              <input
                type="text"
                placeholder="Tìm kiếm địa điểm, trải nghiệm..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                className="bg-transparent border-none focus:ring-0 outline-none w-full font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/60"
              />
            </div>
            <button
              onClick={handleSearch}
              className="bg-primary text-on-primary px-8 py-3 rounded-lg font-label-md text-label-md hover:bg-primary-container active:scale-95 transition-all"
            >
              Khám phá
            </button>
          </div>
        </section>

        {/* ── Saved & Planned Trips ────────────────────────────── */}
        <section className="mb-section-gap">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="font-display text-headline-md text-on-surface">Chuyến đi đã lưu</h2>
              <p className="text-body-md text-on-surface-variant">Tiếp tục từ nơi bạn đã dừng</p>
            </div>
            <Link to="/saved" className="text-secondary font-label-md text-label-md hover:underline">
              Xem tất cả
            </Link>
          </div>

          {savedPosts.length === 0 ? (
            <div className="py-12 flex flex-col items-center gap-3 bg-surface-container-lowest rounded-xl border border-surface-container">
              <span className="material-symbols-outlined text-5xl text-outline-variant">
                favorite_border
              </span>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Bạn chưa lưu địa điểm nào.
              </p>
              <p className="font-caption text-caption text-outline">
                Nhấn icon ♥ trên bài viết để lưu!
              </p>
            </div>
          ) : (
            <div className="flex gap-gutter overflow-x-auto pb-4 hide-scrollbar snap-x">
              {savedPosts.map(sp => (
                <SavedTripCard
                  key={sp.postId}
                  savedPost={sp}
                  isSaved={savedPostIds.has(sp.postId)}
                  onToggle={onToggleSave}
                />
              ))}
            </div>
          )}
        </section>

        {/* ── Explore Destinations ─────────────────────────────── */}
        <section className="mb-section-gap">
          <h2 className="font-display text-headline-md text-on-surface mb-8">Khám phá địa điểm</h2>

          {isLoadingPosts ? (
            <div className="flex justify-center py-16">
              <div className="w-10 h-10 rounded-full border-4 border-primary-fixed border-t-primary animate-spin" />
            </div>
          ) : explorePosts.length === 0 ? (
            <p className="text-center py-8 text-on-surface-variant font-body-md">
              {searchQuery
                ? `Không tìm thấy kết quả cho "${searchQuery}".`
                : 'Chưa có địa điểm nào được xuất bản.'}
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
              {explorePosts.map(post => (
                <DestinationCard
                  key={post.postId}
                  post={post}
                  isSaved={savedPostIds.has(post.postId)}
                  onToggle={onToggleSave}
                />
              ))}
            </div>
          )}
        </section>

        {/* ── Community Feed ───────────────────────────────────── */}
        <section className="mb-section-gap max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <h2 className="font-display text-headline-md text-on-surface">Cộng đồng chia sẻ</h2>
            <Link
              to="/saved"
              className="bg-surface-container-lowest border border-outline-variant px-5 py-2 rounded-full font-label-md text-label-md text-on-surface-variant flex items-center gap-2 hover:bg-surface-container-low transition-all"
            >
              <span className="material-symbols-outlined text-secondary text-[18px]">favorite</span>
              Bài đã lưu
            </Link>
          </div>

          {feedPosts.length > 0
            ? feedPosts.map(post => <FeedCard key={post.postId} post={post} />)
            : !isLoadingPosts && (
              <p className="text-center py-8 text-on-surface-variant font-body-md">
                Chưa có bài chia sẻ nào.
              </p>
            )}
        </section>
      </div>
    </main>
  )
}

// ── Guest Home — PostCard ───────────────────────────────────────────────────
function PostCard({ post }: { post: Post }) {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const [saved, setSaved] = useState(false)
  const [toggling, setToggling] = useState(false)

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) { navigate('/login'); return }
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

  const avgRating = post.avgRating ?? null
  const ratingCount = post._count?.ratings ?? 0

  return (
    <Link
      to={`/landmarks/${post.postId}`}
      className="bg-surface-container-lowest rounded-lg overflow-hidden card-shadow group cursor-pointer block"
    >
      <div className="relative h-48 w-full overflow-hidden">
        <img
          src={post.imageUrl ?? DEFAULT_IMG}
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
            <span
              className="material-symbols-outlined text-[16px] icon-fill"
              style={{ color: '#ffb77d' }}
            >
              star
            </span>
            <span className="font-caption text-caption font-semibold">{avgRating.toFixed(1)}</span>
            <span className="font-caption text-caption text-on-surface-variant">
              ({ratingCount} đánh giá)
            </span>
          </div>
        )}
        <p className="font-body-md text-body-md text-on-surface-variant text-sm line-clamp-2">
          {post.content}
        </p>
      </div>
    </Link>
  )
}

// ── Main Page ───────────────────────────────────────────────────────────────
export default function Home() {
  const { isAuthenticated, user } = useAuthStore()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const { data: postsResponse, isLoading, isError } = useQuery({
    queryKey: ['posts', 'Publish', searchQuery],
    queryFn: () => postsService.fetchPosts({ status: 'Publish', search: searchQuery || undefined }),
  })
  const posts = postsResponse?.data ?? []

  const { data: savedPosts = [] } = useQuery({
    queryKey: ['saved-posts'],
    queryFn: savedPostsService.fetchMySavedPosts,
    enabled: isAuthenticated,
  })

  const savedPostIds = useMemo(
    () => new Set(savedPosts.map(sp => sp.postId)),
    [savedPosts],
  )

  const handleToggleSave = async (postId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) { navigate('/login'); return }
    try {
      await savedPostsService.toggle(postId)
      queryClient.invalidateQueries({ queryKey: ['saved-posts'] })
    } catch {
      // silent
    }
  }

  if (isAuthenticated && user?.role === 'Admin') {
    return <Navigate to="/admin" replace />
  }

  const featured = posts[0]
  const trending = posts.slice(0, 8)

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col">
      <TopNavBar />

      {isAuthenticated && user ? (
        <>
          <RegisteredUserHome
            userName={user.userName}
            posts={posts}
            savedPosts={savedPosts}
            isLoadingPosts={isLoading}
            onToggleSave={handleToggleSave}
            savedPostIds={savedPostIds}
            searchQuery={searchQuery}
            onSearch={setSearchQuery}
          />
          <footer className="w-full py-8 bg-surface-container-low border-t border-outline-variant pb-24 md:pb-8">
            <div className="container-page flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex flex-col items-center md:items-start gap-2">
                <span className="font-display font-bold text-lg text-primary">WanderShare</span>
                <p className="font-caption text-caption text-on-surface-variant">
                  © 2024 WanderShare. Mọi quyền được bảo lưu.
                </p>
              </div>
              <div className="flex gap-8">
                {['Điều khoản', 'Chính sách', 'Trợ giúp', 'Giới thiệu'].map(label => (
                  <span
                    key={label}
                    className="font-caption text-caption text-on-surface-variant hover:text-secondary transition-colors cursor-pointer"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </footer>
          <MobileBottomNav />
        </>
      ) : (
        <>
          <main className="flex-1 pt-24 pb-16">

            {/* ── Hero Section ─────────────────────────────────── */}
            <section className="container-page mb-section-gap pt-8">
              <h1 className="font-display text-headline-lg-mobile md:text-display-lg text-primary mb-2">
                Khám phá cho bạn
              </h1>
              <p className="font-sans text-body-lg text-on-surface-variant mb-8">
                Những điểm đến tuyệt vời được tuyển chọn phù hợp với phong cách du lịch của bạn.
              </p>

              {featured ? (
                <Link
                  to={`/landmarks/${featured.postId}`}
                  className="relative w-full h-[50vh] md:h-[60vh] rounded-xl overflow-hidden card-shadow block"
                >
                  <img
                    src={featured.imageUrl ?? DEFAULT_IMG}
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
                      <p className="text-white/80 font-body-md text-body-md">
                        {featured.location.locationName}
                      </p>
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

            {/* ── Trending Grid ─────────────────────────────────── */}
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
                <p className="text-center py-16 text-on-surface-variant">
                  Không thể tải dữ liệu. Vui lòng thử lại.
                </p>
              )}
              {!isLoading && !isError && trending.length === 0 && (
                <p className="text-center py-16 text-on-surface-variant">
                  Chưa có bài viết nào được xuất bản.
                </p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter">
                {/** Render landmarks fetched from backend */}
                {TRENDING.map(lm => (
                  <LandmarkCard key={lm.id} lm={lm} />
                ))}
              </div>
            </section>
          </main>

          {/* ── Trending Grid ─────────────────────────────────── */}
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
              <p className="text-center py-16 text-on-surface-variant">
                Không thể tải dữ liệu. Vui lòng thử lại.
              </p>
            )}
            {!isLoading && !isError && trending.length === 0 && (
              <p className="text-center py-16 text-on-surface-variant">
                Chưa có bài viết nào được xuất bản.
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter">
              {trending.map(post => (
                <PostCard key={post.postId} post={post} />
              ))}
            </div>
          </section>
        </main>
      <Footer />
    </>
  )
}
    </div >
  )
}
