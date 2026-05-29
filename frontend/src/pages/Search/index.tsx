import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import TopNavBar from '../../components/layouts/TopNavBar'
import Footer from '../../components/layouts/Footer'
import { postsService } from '../../services/posts.service'
import { locationsService } from '../../services/locations.service'
import { savedPostsService } from '../../services/saved-posts.service'
import { useAuthStore } from '../../store/authStore'
import type { Post } from '../../types'

const DEFAULT_IMG = 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600&q=80'
const PAGE_SIZE = 12

function PostCard({ post, isSaved, onToggle }: {
  post: Post
  isSaved: boolean
  onToggle: (postId: string, e: React.MouseEvent) => void
}) {
  const avgRating = post.avgRating ?? null
  const ratingCount = post._count?.ratings ?? 0

  return (
    <Link
      to={`/landmarks/${post.postId}`}
      className="bg-surface-container-lowest rounded-xl overflow-hidden card-shadow group block"
    >
      <div className="h-52 relative overflow-hidden">
        <img
          src={post.imageUrl ?? DEFAULT_IMG}
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <button
          onClick={e => onToggle(post.postId, e)}
          className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:scale-110 active:scale-90 transition-transform"
          aria-label={isSaved ? 'Bỏ lưu' : 'Lưu'}
        >
          <span
            className="material-symbols-outlined text-[20px] text-secondary"
            style={{ fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0" }}
          >
            favorite
          </span>
        </button>
      </div>
      <div className="p-4">
        {post.location && (
          <div className="flex items-center gap-1 text-on-surface-variant mb-1">
            <span className="material-symbols-outlined text-[14px]">location_on</span>
            <span className="font-caption text-caption">{post.location.locationName}</span>
          </div>
        )}
        <h3 className="font-display text-body-lg font-semibold text-on-surface mb-2 line-clamp-2">
          {post.title}
        </h3>
        {avgRating !== null ? (
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] icon-fill" style={{ color: '#ffb77d' }}>star</span>
            <span className="font-label-md text-label-md">{avgRating.toFixed(1)}</span>
            <span className="font-caption text-caption text-outline ml-1">({ratingCount})</span>
          </div>
        ) : (
          <span className="font-caption text-caption text-outline">Chưa có đánh giá</span>
        )}
      </div>
    </Link>
  )
}

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { isAuthenticated } = useAuthStore()

  const [inputValue, setInputValue] = useState(searchParams.get('q') ?? '')
  const [locationId, setLocationId] = useState(searchParams.get('locationId') ?? '')
  const [page, setPage] = useState(1)

  const q = searchParams.get('q') ?? ''

  useEffect(() => {
    setInputValue(q)
    setPage(1)
  }, [q])

  const { data: postsResponse, isLoading } = useQuery({
    queryKey: ['search', q, locationId, page],
    queryFn: () => postsService.fetchPosts({
      search: q || undefined,
      locationId: locationId || undefined,
      page,
      limit: PAGE_SIZE,
    }),
  })

  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: locationsService.fetchLocations,
  })

  const { data: savedPosts = [] } = useQuery({
    queryKey: ['saved-posts'],
    queryFn: savedPostsService.fetchMySavedPosts,
    enabled: isAuthenticated,
  })

  const posts = postsResponse?.data ?? []
  const total = postsResponse?.total ?? 0
  const totalPages = Math.ceil(total / PAGE_SIZE)
  const savedIds = new Set(savedPosts.map(s => s.postId))

  const handleSearch = () => {
    const params: Record<string, string> = {}
    if (inputValue.trim()) params.q = inputValue.trim()
    if (locationId) params.locationId = locationId
    setSearchParams(params)
    setPage(1)
  }

  const handleToggleSave = async (postId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) return
    try { await savedPostsService.toggle(postId) } catch { /* silent */ }
  }

  return (
    <div className="bg-background min-h-screen flex flex-col">
      <TopNavBar />

      <main className="flex-1 pt-24 pb-16">
        <div className="container-page">

          {/* Search bar */}
          <div className="py-8">
            <h1 className="font-display text-headline-md text-on-surface mb-6">
              {q ? `Kết quả cho "${q}"` : 'Tìm kiếm địa điểm'}
            </h1>

            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 flex items-center bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 gap-3 focus-within:border-secondary transition-colors">
                <span className="material-symbols-outlined text-outline">search</span>
                <input
                  type="text"
                  placeholder="Tên địa điểm, trải nghiệm..."
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  className="flex-1 bg-transparent outline-none font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/60"
                />
              </div>

              <select
                value={locationId}
                onChange={e => { setLocationId(e.target.value); setPage(1) }}
                className="bg-surface-container-lowest border border-outline-variant rounded-xl py-3 px-4 text-on-surface font-body-md text-body-md focus:ring-1 focus:ring-secondary focus:outline-none min-w-[180px]"
              >
                <option value="">Tất cả địa điểm</option>
                {locations.map(loc => (
                  <option key={loc.locationId} value={loc.locationId}>{loc.locationName}</option>
                ))}
              </select>

              <button
                onClick={handleSearch}
                className="bg-primary text-on-primary px-8 py-3 rounded-xl font-label-md text-label-md hover:bg-primary-container active:scale-95 transition-all"
              >
                Tìm kiếm
              </button>
            </div>
          </div>

          {/* Results count */}
          {!isLoading && (
            <p className="font-body-md text-body-md text-on-surface-variant mb-6">
              {total > 0 ? `Tìm thấy ${total} kết quả` : 'Không tìm thấy kết quả nào'}
            </p>
          )}

          {/* Grid */}
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 rounded-full border-4 border-primary-fixed border-t-primary animate-spin" />
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center py-20 gap-4 text-on-surface-variant">
              <span className="material-symbols-outlined text-[64px] opacity-30">search_off</span>
              <p className="font-body-lg text-body-lg">Không tìm thấy địa điểm phù hợp.</p>
              <p className="font-body-md text-body-md opacity-70">Thử thay đổi từ khóa hoặc bỏ bộ lọc.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter">
              {posts.map(post => (
                <PostCard
                  key={post.postId}
                  post={post}
                  isSaved={savedIds.has(post.postId)}
                  onToggle={handleToggleSave}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-outline-variant hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={[
                    'w-10 h-10 rounded-lg font-label-md text-label-md transition-colors',
                    p === page
                      ? 'bg-primary text-on-primary'
                      : 'border border-outline-variant hover:bg-surface-container text-on-surface',
                  ].join(' ')}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-outline-variant hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  )
}
