import { useState } from 'react'
import ReviewCard, { type ReviewCardProps } from './ReviewCard'

// ── Types ──────────────────────────────────────────────────────────────────
export interface CommunityFeedProps {
  landmarkId: string | number
  reviews?: ReviewCardProps[]
  /** Total review count for summary display */
  totalReviews?: number
  /** Average rating */
  averageRating?: number
  onWriteReview?: () => void
  onPostPhoto?: () => void
  onRate?: () => void
  /** Load more callback */
  onLoadMore?: () => void
  hasMore?: boolean
  isLoading?: boolean
}

// ── Rating distribution bar ────────────────────────────────────────────────
function RatingBar({ stars, count, total }: { stars: number; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex items-center gap-2 group">
      <span className="font-caption text-caption text-on-surface-variant w-4 text-right">{stars}</span>
      <span
        className="material-symbols-outlined text-[14px]"
        style={{ fontVariationSettings: "'FILL' 1", color: '#ffb77d' }}
      >
        star
      </span>
      <div className="flex-1 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
        <div
          className="h-full bg-tertiary-fixed-dim rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="font-caption text-caption text-on-surface-variant w-8">{pct}%</span>
    </div>
  )
}

// ── Component ──────────────────────────────────────────────────────────────
export default function CommunityFeed({
  reviews = [],
  totalReviews = 0,
  averageRating,
  onWriteReview,
  onPostPhoto,
  onRate,
  onLoadMore,
  hasMore = false,
  isLoading = false,
}: CommunityFeedProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'photos' | 'reviews'>('all')

  // Fake rating distribution based on average
  const dist = averageRating
    ? [
        { stars: 5, count: Math.round(totalReviews * 0.55) },
        { stars: 4, count: Math.round(totalReviews * 0.25) },
        { stars: 3, count: Math.round(totalReviews * 0.12) },
        { stars: 2, count: Math.round(totalReviews * 0.05) },
        { stars: 1, count: Math.round(totalReviews * 0.03) },
      ]
    : []

  const filteredReviews = reviews.filter(r => {
    if (activeTab === 'photos') return (r.photos?.length ?? 0) > 0
    return true
  })

  return (
    <section className="flex flex-col gap-6">
      {/* ── Section header ──────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h2 className="font-headline-lg text-headline-lg text-on-surface">
          Cộng đồng chia sẻ
        </h2>
        {totalReviews > 0 && (
          <span className="font-caption text-caption text-on-surface-variant bg-surface-container px-3 py-1 rounded-full">
            {totalReviews.toLocaleString()} đánh giá
          </span>
        )}
      </div>

      {/* ── Rating summary (if data available) ──────────────────── */}
      {averageRating != null && totalReviews > 0 && (
        <div className="bg-surface-container-lowest rounded-xl border border-surface-container-low p-6 shadow-[0_4px_15px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row gap-6">
          {/* Big score */}
          <div className="flex flex-col items-center justify-center sm:min-w-[120px] gap-1">
            <span className="font-display text-[48px] leading-none font-bold text-on-surface">
              {averageRating.toFixed(1)}
            </span>
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className="material-symbols-outlined text-[18px]"
                  style={{
                    fontVariationSettings: i < Math.round(averageRating) ? "'FILL' 1" : "'FILL' 0",
                    color: '#ffb77d',
                  }}
                >
                  star
                </span>
              ))}
            </div>
            <span className="font-caption text-caption text-on-surface-variant">
              {totalReviews.toLocaleString()} đánh giá
            </span>
          </div>

          {/* Distribution bars */}
          <div className="flex-1 flex flex-col justify-center gap-2">
            {dist.map(({ stars, count }) => (
              <RatingBar key={stars} stars={stars} count={count} total={totalReviews} />
            ))}
          </div>
        </div>
      )}

      {/* ── Action bar ──────────────────────────────────────────── */}
      <div className="bg-surface-container-lowest p-4 md:p-6 rounded-xl border border-surface-container-low flex flex-wrap items-center gap-3 shadow-[0_4px_15px_rgba(0,0,0,0.02)]">
        <button
          onClick={onWriteReview}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-on-primary rounded-full font-label-md text-label-md hover:bg-primary-container hover:text-on-primary-container transition-all duration-200 active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">edit_note</span>
          Viết đánh giá
        </button>

        <button
          onClick={onPostPhoto}
          className="flex items-center gap-2 px-6 py-2.5 bg-secondary-container text-on-secondary-container rounded-full font-label-md text-label-md hover:bg-secondary-fixed transition-all duration-200 active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">add_a_photo</span>
          Đăng ảnh
        </button>

        <button
          onClick={onRate}
          className="flex items-center gap-2 px-6 py-2.5 border border-outline-variant text-on-surface-variant rounded-full font-label-md text-label-md hover:bg-surface-container-low transition-all duration-200 active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">star</span>
          Đánh giá điểm này
        </button>
      </div>

      {/* ── Tab filter ──────────────────────────────────────────── */}
      {reviews.length > 0 && (
        <div className="flex items-center gap-1 border-b border-outline-variant pb-0">
          {(
            [
              { key: 'all',     label: 'Tất cả' },
              { key: 'reviews', label: 'Đánh giá' },
              { key: 'photos',  label: 'Có ảnh' },
            ] as const
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={[
                'px-4 py-2.5 font-label-md text-label-md border-b-2 transition-all duration-200 -mb-px',
                activeTab === key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* ── Review list ─────────────────────────────────────────── */}
      {filteredReviews.length > 0 ? (
        <div className="flex flex-col gap-6">
          {filteredReviews.map(review => (
            <ReviewCard key={review.id} {...review} />
          ))}

          {/* Load more */}
          {hasMore && (
            <div className="flex justify-center pt-2">
              <button
                onClick={onLoadMore}
                disabled={isLoading}
                className="flex items-center gap-2 px-8 py-3 border border-outline-variant text-on-surface-variant rounded-full font-label-md text-label-md hover:bg-surface-container-low transition-all duration-200 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                    Đang tải...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">expand_more</span>
                    Xem thêm đánh giá
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-16 text-center gap-4 bg-surface-container-lowest rounded-xl border border-surface-container-low">
          <div className="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-[32px]">rate_review</span>
          </div>
          <div>
            <p className="font-label-md text-label-md text-on-surface mb-1">
              Chưa có đánh giá nào
            </p>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Hãy là người đầu tiên chia sẻ trải nghiệm của bạn!
            </p>
          </div>
          <button
            onClick={onWriteReview}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-on-primary rounded-full font-label-md text-label-md hover:bg-primary-container transition-all duration-200"
          >
            <span className="material-symbols-outlined text-[18px]">edit_note</span>
            Viết đánh giá đầu tiên
          </button>
        </div>
      )}
    </section>
  )
}
