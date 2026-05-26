import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import TopNavBar from '../../components/layouts/TopNavBar'
import Footer from '../../components/layouts/Footer'
import { getLandmarks } from '../../services/landmarkService'
import type { Landmark } from '../../types'
import { REGION_LABEL } from '../../constants'

// Use backend data: fetch landmarks and derive featured/trending lists
const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1400&q=80'

// ── Subcomponents ──────────────────────────────────────────────────────────
function LandmarkCard({ lm }: { lm: Landmark }) {
  const id = lm.id
  const name = lm.title
  const region = REGION_LABEL[lm.region]
  const rating = lm.reviews?.length ? (lm.reviews.reduce((s, r) => s + r.rating, 0) / lm.reviews.length).toFixed(1) : '—'
  const reviews = lm.reviews?.length ?? 0
  const image = lm.images?.[0]?.url ?? PLACEHOLDER_IMAGE
  const description = lm.description
  return (
    <Link
      to={`/landmarks/${id}`}
      className="bg-surface-container-lowest rounded-lg overflow-hidden card-shadow group cursor-pointer block"
    >
      {/* Image */}
      <div className="relative h-48 w-full overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <button
          className="absolute top-4 right-4 h-8 w-8 bg-surface-container-lowest/80 backdrop-blur-sm rounded-full flex items-center justify-center text-on-surface-variant hover:text-error transition-colors"
          onClick={e => e.preventDefault()}
        >
          <span className="material-symbols-outlined text-[20px]">favorite</span>
        </button>
      </div>

      {/* Info */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-label-md text-label-md text-on-surface">{name}</h3>
          <span className="bg-surface-container text-on-surface-variant font-caption text-caption px-2 py-1 rounded-md shrink-0 ml-2">
            {region}
          </span>
        </div>
        <div className="flex items-center gap-1 mb-3">
          <span className="material-symbols-outlined text-[16px] icon-fill" style={{ color: '#ffb77d' }}>star</span>
          <span className="font-caption text-caption font-semibold">{rating}</span>
          <span className="font-caption text-caption text-on-surface-variant">({reviews} đánh giá)</span>
        </div>
        <p className="font-body-md text-body-md text-on-surface-variant text-sm line-clamp-2">{description}</p>
      </div>
    </Link>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function Home() {
  const [landmarks, setLandmarks] = useState<Landmark[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    let mounted = true
    getLandmarks()
      .then(data => {
        if (mounted) setLandmarks(data)
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => { mounted = false }
  }, [])

  const FEATURED = landmarks[0] ? {
    id: landmarks[0].id,
    name: landmarks[0].title,
    rating: landmarks[0].reviews?.length ? (landmarks[0].reviews.reduce((s, r) => s + r.rating, 0) / landmarks[0].reviews.length) : 0,
    reviewCount: landmarks[0].reviews?.length ?? 0,
    image: landmarks[0].images?.[0]?.url ?? PLACEHOLDER_IMAGE,
  } : { id: '0', name: 'Đang tải...', rating: 0, reviewCount: 0, image: PLACEHOLDER_IMAGE }

  const TRENDING = landmarks.slice(0, 12)
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
          <div className="relative w-full h-[50vh] md:h-[60vh] rounded-xl overflow-hidden card-shadow">
            <img
              src={FEATURED.image}
              alt={FEATURED.name}
              className="w-full h-full object-cover"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#2e3132]/80 via-transparent to-transparent" />

            {/* Text on image */}
            <div className="absolute bottom-0 left-0 p-8 w-full">
              <span className="bg-secondary-container text-on-secondary-container font-caption text-caption px-3 py-1 rounded-full mb-3 inline-block font-semibold">
                Nổi bật
              </span>
              <h2 className="font-display text-headline-lg text-white mb-2">{FEATURED.name}</h2>
              <div className="flex items-center gap-2 text-white/90">
                <span className="material-symbols-outlined text-[18px] icon-fill" style={{ color: '#ffb77d' }}>star</span>
                <span className="font-label-md text-label-md">{FEATURED.rating}</span>
                <span className="font-body-md text-body-md opacity-80">({FEATURED.reviewCount} đánh giá)</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Trending Grid ─────────────────────────────────────── */}
        <section className="container-page">
          <div className="flex justify-between items-end mb-8 border-b border-surface-variant pb-4">
            <h2 className="font-display text-headline-md text-on-surface">Điểm đến nổi bật</h2>
            <button className="font-label-md text-label-md text-secondary flex items-center gap-1 hover:text-secondary-fixed-dim transition-colors">
              Xem tất cả
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter">
            {/** Render landmarks fetched from backend */}
            {TRENDING.map(lm => (
              <LandmarkCard key={lm.id} lm={lm} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
