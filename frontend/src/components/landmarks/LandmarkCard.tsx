import { useState } from 'react'
import { Link } from 'react-router-dom'

// ── Types ──────────────────────────────────────────────────────────────────
export interface LandmarkCardProps {
  id: string | number
  name: string
  region: string
  rating: number
  reviewCount: number
  image: string
  description: string
  isFeatured?: boolean
  /** Optional: show verified badge */
  isVerified?: boolean
  /** Callback when favorite toggled */
  onFavoriteToggle?: (id: string | number, value: boolean) => void
  /** External className override */
  className?: string
}

// ── Region color map ───────────────────────────────────────────────────────
const REGION_STYLE: Record<string, { bg: string; text: string }> = {
  'Miền Bắc': { bg: 'bg-primary-fixed',    text: 'text-on-primary-fixed' },
  'north':    { bg: 'bg-primary-fixed',    text: 'text-on-primary-fixed' },
  'Miền Trung': { bg: 'bg-surface-container-high', text: 'text-on-surface-variant' },
  'central':  { bg: 'bg-surface-container-high', text: 'text-on-surface-variant' },
  'Miền Nam': { bg: 'bg-tertiary-fixed',   text: 'text-on-tertiary-fixed' },
  'south':    { bg: 'bg-tertiary-fixed',   text: 'text-on-tertiary-fixed' },
}

// ── Component ──────────────────────────────────────────────────────────────
export default function LandmarkCard({
  id,
  name,
  region,
  rating,
  reviewCount,
  image,
  description,
  isFeatured = false,
  isVerified = false,
  onFavoriteToggle,
  className = '',
}: LandmarkCardProps) {
  const [favorited, setFavorited] = useState(false)

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const next = !favorited
    setFavorited(next)
    onFavoriteToggle?.(id, next)
  }

  const regionStyle = REGION_STYLE[region] ?? { bg: 'bg-surface-container', text: 'text-on-surface-variant' }

  return (
    <Link
      to={`/landmarks/${id}`}
      className={[
        'bg-surface-container-lowest rounded-xl overflow-hidden group cursor-pointer block',
        'border border-surface-container transition-all duration-300',
        'hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(0,0,0,0.08)]',
        'shadow-[0_4px_15px_rgba(0,0,0,0.04)]',
        className,
      ].join(' ')}
    >
      {/* ── Image ──────────────────────────────────────────────── */}
      <div className="relative h-48 w-full overflow-hidden">
        <img
          src={image}
          alt={name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Gradient overlay for badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

        {/* Top badges row */}
        <div className="absolute top-3 left-3 flex gap-2">
          {isFeatured && (
            <span className="bg-secondary-container text-on-secondary-container font-caption text-caption px-2.5 py-0.5 rounded-full font-semibold">
              Nổi bật
            </span>
          )}
          {isVerified && (
            <span className="bg-surface-container-lowest/90 backdrop-blur-sm text-secondary font-caption text-caption px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              Đã xác minh
            </span>
          )}
        </div>

        {/* Favorite button */}
        <button
          onClick={handleFavorite}
          aria-label={favorited ? 'Bỏ yêu thích' : 'Thêm yêu thích'}
          className={[
            'absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center',
            'bg-surface-container-lowest/80 backdrop-blur-sm transition-all duration-200',
            'hover:scale-110 active:scale-95',
            favorited ? 'text-error' : 'text-on-surface-variant hover:text-error',
          ].join(' ')}
        >
          <span
            className="material-symbols-outlined text-[18px]"
            style={{ fontVariationSettings: favorited ? "'FILL' 1" : "'FILL' 0" }}
          >
            favorite
          </span>
        </button>
      </div>

      {/* ── Info ────────────────────────────────────────────────── */}
      <div className="p-5">
        {/* Name + Region */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-label-md text-label-md text-on-surface leading-snug line-clamp-2 flex-1">
            {name}
          </h3>
          <span
            className={[
              'shrink-0 font-caption text-caption px-2 py-1 rounded-md font-semibold',
              regionStyle.bg,
              regionStyle.text,
            ].join(' ')}
          >
            {region}
          </span>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-3">
          <span
            className="material-symbols-outlined text-[16px]"
            style={{ fontVariationSettings: "'FILL' 1", color: '#ffb77d' }}
          >
            star
          </span>
          <span className="font-caption text-caption font-semibold text-on-surface">
            {rating.toFixed(1)}
          </span>
          <span className="font-caption text-caption text-on-surface-variant">
            ({reviewCount.toLocaleString()} đánh giá)
          </span>
        </div>

        {/* Description */}
        <p className="font-body-md text-body-md text-on-surface-variant text-sm line-clamp-2 leading-relaxed">
          {description}
        </p>

        {/* Footer CTA */}
        <div className="mt-4 pt-3 border-t border-surface-container flex items-center justify-between">
          <span className="font-caption text-caption text-outline flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">location_on</span>
            {region}
          </span>
          <span className="font-label-md text-label-md text-primary flex items-center gap-0.5 group-hover:gap-1.5 transition-all">
            Xem chi tiết
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </span>
        </div>
      </div>
    </Link>
  )
}
