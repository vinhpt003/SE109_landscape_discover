import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import TopNavBar from '../../components/layouts/TopNavBar'
import Footer from '../../components/layouts/Footer'
import { getLandmarkById } from '../../services/landmarkService'
import type { Landmark, Review } from '../../types'

// UI review shape mapped from backend Review
type UiReview = {
  id: number | string
  author: string
  initials: string
  date: string
  rating: number
  text: string
  photos: string[]
  likes: number
}

// ── Star rating component ──────────────────────────────────────────────────
function StarRating({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="flex" style={{ color: '#6b3700' }}>
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          className="material-symbols-outlined text-[18px]"
          style={{ fontVariationSettings: i < value ? "'FILL' 1" : "'FILL' 0" }}
        >
          star
        </span>
      ))}
    </div>
  )
}

// ── Review card ────────────────────────────────────────────────────────────
function ReviewCard({ review }: { review: UiReview }) {
  const [liked, setLiked] = useState(false)

  return (
    <div className="bg-surface-container-lowest p-6 rounded-xl border border-surface-container-low shadow-ambient flex flex-col gap-4">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-primary font-bold text-label-md">
            {review.initials}
          </div>
          <div>
            <p className="font-label-md text-label-md text-on-surface">{review.author}</p>
            <p className="font-caption text-caption text-on-surface-variant">{review.date}</p>
          </div>
        </div>
        <StarRating value={review.rating} />
      </div>

      {/* Text */}
      <p className="text-on-surface-variant leading-relaxed text-body-md">{review.text}</p>

      {/* Photos grid */}
      {review.photos.length > 0 && (
        <div className="grid grid-cols-2 gap-2 rounded-lg overflow-hidden h-[180px]">
          {review.photos.map((src, i) => (
            <img key={i} src={src} alt={`Ảnh ${i + 1}`} className="w-full h-full object-cover" />
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-6 pt-2 border-t border-surface-variant/30">
        <button
          onClick={() => setLiked(v => !v)}
          className={`flex items-center gap-1.5 font-label-md text-label-md transition-colors ${liked ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}
        >
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: liked ? "'FILL' 1" : "'FILL' 0" }}>
            thumb_up
          </span>
          <span>{review.likes + (liked ? 1 : 0)}</span>
        </button>
        <button className="flex items-center gap-1.5 text-on-surface-variant hover:text-primary font-label-md text-label-md transition-colors">
          <span className="material-symbols-outlined text-[20px]">mode_comment</span>
          <span>Bình luận</span>
        </button>
      </div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function LandmarkDetail() {
  const { id } = useParams()
  const [lm, setLm] = useState<Landmark | null>(null)
  const [reviews, setReviews] = useState<UiReview[]>([])

  useEffect(() => {
    if (!id) return
    const nid = Number(id)
    getLandmarkById(nid)
      .then(data => {
        setLm(data)
        const mapped: UiReview[] = (data.reviews ?? []).map((r: Review) => {
          const author = r.user?.fullName ?? 'Người dùng'
          const initials = author.split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase()
          return {
            id: r.id,
            author,
            initials,
            date: new Date(r.createdAt).toLocaleDateString(),
            rating: r.rating,
            text: r.comment,
            photos: [],
            likes: r.usefulVotes ?? 0,
          }
        })
        setReviews(mapped)
      })
      .catch(() => {})
  }, [id])

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col">
      <TopNavBar />

      <main className="flex-1 pt-24 pb-section-gap container-page flex flex-col gap-8">

        {/* ── Image Mosaic ───────────────────────────────────────── */}
        <section className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-4 h-[400px] md:h-[560px] rounded-xl overflow-hidden card-shadow">
          {/* Main large image */}
          <div className="col-span-1 md:col-span-2 row-span-2 relative">
            <img src={lm?.images?.[0]?.url ?? ''} alt={lm?.title ?? ''} className="w-full h-full object-cover" />
          </div>
          {/* Small top-right */}
          <div className="col-span-1 row-span-1 relative hidden md:block">
            <img src={lm.images[1]} alt="" className="w-full h-full object-cover" />
          </div>
          {/* Small bottom-right */}
          <div className="col-span-1 row-span-1 relative hidden md:block">
            <img src={lm.images[2]} alt="" className="w-full h-full object-cover" />
          </div>
          {/* Wide bottom */}
          <div className="col-span-1 md:col-span-2 row-span-1 relative hidden md:block">
            <img src={lm.images[3]} alt="" className="w-full h-full object-cover" />
          </div>
        </section>

        {/* ── Core Info Panel ────────────────────────────────────── */}
        <section className="flex flex-col md:flex-row gap-8">
          {/* Main info */}
          <div className="flex-1 flex flex-col gap-6 bg-surface-container-lowest p-6 md:p-8 rounded-xl card-shadow border border-surface-container-low">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-start flex-wrap gap-2">
                <h1 className="font-display text-display-lg text-on-surface">{lm?.title ?? '—'}</h1>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full font-caption text-caption">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  {lm?.status ?? '—'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-on-surface-variant font-body-md text-body-md">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[20px]">location_on</span>
                  {lm?.province ?? '—'}
                </span>
                <span className="flex items-center gap-1 text-primary">
                  <span className="material-symbols-outlined text-[20px] icon-fill">star</span>
                  {lm ? (lm.reviews?.length ? (lm.reviews.reduce((s, r) => s + r.rating, 0) / lm.reviews.length).toFixed(1) : '—') : '—'} ({lm?.reviews?.length ?? 0} đánh giá)
                </span>
              </div>
            </div>
            
            <p className="font-sans text-body-lg text-on-surface-variant leading-relaxed">
              {lm?.description ?? '—'}
            </p>

            <div className="border-t border-surface-variant pt-6">
                <h2 className="font-display text-headline-md text-on-surface mb-3">
                Ý nghĩa lịch sử & văn hóa
              </h2>
              <p className="font-sans text-body-md text-on-surface-variant leading-relaxed">
                {lm?.content ?? '—'}
              </p>
            </div>
          </div>

          {/* Action panel */}
          <div className="w-full md:w-[340px] shrink-0">
            <div className="bg-surface-container-lowest p-6 rounded-xl card-shadow border border-surface-container-low flex flex-col gap-6 sticky top-24">
              <div>
                <h3 className="font-display text-headline-md text-on-surface mb-1">Lên kế hoạch tham quan</h3>
                <p className="font-sans text-body-md text-on-surface-variant">
                  Tham gia cộng đồng đang lên kế hoạch đến đây.
                </p>
              </div>

              <button className="w-full bg-[#ea580c] text-white font-label-md text-label-md py-3 px-6 rounded-lg hover:bg-[#c2410c] transition-colors card-shadow">
                Tham gia nhóm
              </button>
              <button className="w-full bg-secondary-container text-on-secondary-container font-label-md text-label-md py-3 px-6 rounded-lg hover:bg-secondary-fixed transition-colors">
                Đăng bài đến điểm đến này
              </button>

              <div className="border-t border-surface-variant pt-4 flex flex-col gap-3 font-body-md text-body-md text-on-surface-variant">
                <div className="flex justify-between">
                  <span>Giờ mở cửa</span>
                  <span className="text-on-surface font-medium">{lm.hours}</span>
                </div>
                <div className="flex justify-between">
                  <span>Thời điểm tốt nhất</span>
                  <span className="text-on-surface font-medium">{lm.bestTime}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Community Feed ─────────────────────────────────────── */}
        <section className="flex flex-col gap-6">
          <h2 className="font-display text-headline-lg text-on-surface">Cộng đồng chia sẻ</h2>

          {/* Action bar */}
          <div className="bg-surface-container-lowest p-4 md:p-6 rounded-xl border border-surface-container-low flex flex-wrap items-center gap-4 card-shadow">
            <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-on-primary rounded-full font-label-md text-label-md hover:bg-primary-container hover:text-on-primary-container transition-all">
              <span className="material-symbols-outlined text-[20px]">edit_note</span>
              Viết đánh giá
            </button>
            <button className="flex items-center gap-2 px-6 py-2.5 bg-secondary-container text-on-secondary-container rounded-full font-label-md text-label-md hover:bg-secondary-fixed transition-all">
              <span className="material-symbols-outlined text-[20px]">add_a_photo</span>
              Đăng ảnh
            </button>
            <button className="flex items-center gap-2 px-6 py-2.5 border border-outline-variant text-on-surface-variant rounded-full font-label-md text-label-md hover:bg-surface-container-low transition-all">
              <span className="material-symbols-outlined text-[20px]">star</span>
              Đánh giá điểm này
            </button>
          </div>

          {/* Review list */}
          <div className="flex flex-col gap-6">
            {reviews.map(review => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  )
}
