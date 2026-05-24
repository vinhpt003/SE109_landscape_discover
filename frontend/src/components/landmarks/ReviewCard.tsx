import { useState } from 'react'

// ── Types ──────────────────────────────────────────────────────────────────
export interface ReviewCardProps {
  id: string | number
  author: string
  /** 2-letter initials shown if no avatarUrl */
  initials?: string
  /** Full URL to avatar image */
  avatarUrl?: string
  date: string
  rating: number
  text: string
  /** Array of photo URLs */
  photos?: string[]
  likeCount?: number
  commentCount?: number
  /** Whether current user has already liked */
  initialLiked?: boolean
  onLike?: (id: string | number, liked: boolean) => void
  onComment?: (id: string | number) => void
}

// ── StarRating ─────────────────────────────────────────────────────────────
function StarRating({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="flex" style={{ color: '#6b3700' }}>
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          className="material-symbols-outlined text-[18px] leading-none"
          style={{
            fontVariationSettings: i < Math.round(value) ? "'FILL' 1" : "'FILL' 0",
          }}
        >
          star
        </span>
      ))}
    </div>
  )
}

// ── Avatar ─────────────────────────────────────────────────────────────────
function Avatar({ initials, avatarUrl, author }: { initials?: string; avatarUrl?: string; author: string }) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={author}
        className="w-10 h-10 rounded-full object-cover border border-outline-variant"
      />
    )
  }
  return (
    <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-primary font-bold text-label-md shrink-0">
      {initials ?? author.slice(0, 2).toUpperCase()}
    </div>
  )
}

// ── Component ──────────────────────────────────────────────────────────────
export default function ReviewCard({
  id,
  author,
  initials,
  avatarUrl,
  date,
  rating,
  text,
  photos = [],
  likeCount = 0,
  commentCount,
  initialLiked = false,
  onLike,
  onComment,
}: ReviewCardProps) {
  const [liked, setLiked] = useState(initialLiked)
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)

  const handleLike = () => {
    const next = !liked
    setLiked(next)
    onLike?.(id, next)
  }

  const displayLikeCount = likeCount + (liked && !initialLiked ? 1 : !liked && initialLiked ? -1 : 0)

  return (
    <>
      <div className="bg-surface-container-lowest p-6 rounded-xl border border-surface-container-low shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col gap-4 transition-all duration-200 hover:shadow-[0_4px_15px_rgba(0,0,0,0.06)]">

        {/* ── Header: avatar + name + stars ─────────────────────── */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar initials={initials} avatarUrl={avatarUrl} author={author} />
            <div>
              <p className="font-label-md text-label-md text-on-surface">{author}</p>
              <p className="font-caption text-caption text-on-surface-variant">{date}</p>
            </div>
          </div>
          <StarRating value={rating} />
        </div>

        {/* ── Review text ────────────────────────────────────────── */}
        <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
          {text}
        </p>

        {/* ── Photo grid ─────────────────────────────────────────── */}
        {photos.length > 0 && (
          <div
            className={[
              'grid gap-2 rounded-lg overflow-hidden',
              photos.length === 1
                ? 'grid-cols-1 h-[220px]'
                : photos.length === 2
                ? 'grid-cols-2 h-[180px]'
                : 'grid-cols-3 h-[160px]',
            ].join(' ')}
          >
            {photos.slice(0, 3).map((src, i) => (
              <button
                key={i}
                onClick={() => setLightboxSrc(src)}
                className="relative overflow-hidden group w-full h-full focus:outline-none"
              >
                <img
                  src={src}
                  alt={`Ảnh đánh giá ${i + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* +N overlay when more than 3 */}
                {i === 2 && photos.length > 3 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">+{photos.length - 3}</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* ── Actions ────────────────────────────────────────────── */}
        <div className="flex items-center gap-6 pt-2 border-t border-surface-variant/30">
          <button
            onClick={handleLike}
            className={[
              'flex items-center gap-1.5 font-label-md text-label-md transition-all duration-200',
              liked
                ? 'text-primary'
                : 'text-on-surface-variant hover:text-primary',
            ].join(' ')}
          >
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: liked ? "'FILL' 1" : "'FILL' 0" }}
            >
              thumb_up
            </span>
            <span>{displayLikeCount > 0 ? displayLikeCount : ''}</span>
          </button>

          <button
            onClick={() => onComment?.(id)}
            className="flex items-center gap-1.5 text-on-surface-variant hover:text-primary font-label-md text-label-md transition-colors duration-200"
          >
            <span className="material-symbols-outlined text-[20px]">mode_comment</span>
            <span>{commentCount != null ? commentCount : 'Bình luận'}</span>
          </button>
        </div>
      </div>

      {/* ── Lightbox ───────────────────────────────────────────── */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxSrc(null)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-colors"
            onClick={() => setLightboxSrc(null)}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
          <img
            src={lightboxSrc}
            alt="Photo"
            className="max-w-full max-h-[90vh] rounded-xl object-contain shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}
