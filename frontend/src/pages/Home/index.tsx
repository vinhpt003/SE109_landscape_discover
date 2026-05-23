import { Link } from 'react-router-dom'
import TopNavBar from '../../components/layouts/TopNavBar'
import Footer from '../../components/layouts/Footer'

// ── Mock data ──────────────────────────────────────────────────────────────
const FEATURED = {
  id: 'navagio',
  name: 'Bãi biển Navagio, Zakynthos',
  rating: 4.9,
  reviewCount: 342,
  image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1400&q=80',
}

const TRENDING = [
  {
    id: '1',
    name: 'Hoàng Thành Huế',
    region: 'Miền Trung',
    rating: 4.8,
    reviews: 120,
    image: 'https://images.unsplash.com/photo-1557750255-c76072a7aad1?w=600&q=80',
    description: 'Di tích lịch sử kinh đô triều Nguyễn, công trình kiến trúc đồ sộ giữa lòng Huế.',
  },
  {
    id: '2',
    name: 'Vịnh Hạ Long',
    region: 'Miền Bắc',
    rating: 4.9,
    reviews: 845,
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600&q=80',
    description: 'Kỳ quan thiên nhiên thế giới với hàng nghìn đảo đá vôi phủ rừng xanh.',
  },
  {
    id: '3',
    name: 'Phố cổ Hội An',
    region: 'Miền Trung',
    rating: 4.7,
    reviews: 630,
    image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600&q=80',
    description: 'Đô thị cổ giao thương thế kỷ 15–19, được UNESCO công nhận Di sản Thế giới.',
  },
  {
    id: '4',
    name: 'Mũi Né',
    region: 'Miền Nam',
    rating: 4.5,
    reviews: 290,
    image: 'https://images.unsplash.com/photo-1585016058010-a285b9756fde?w=600&q=80',
    description: 'Đồi cát trắng, cát đỏ hùng vĩ giữa nắng biển miền Nam rực rỡ.',
  },
]

// ── Subcomponents ──────────────────────────────────────────────────────────
function LandmarkCard({ id, name, region, rating, reviews, image, description }: typeof TRENDING[0]) {
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
            {TRENDING.map(item => (
              <LandmarkCard key={item.id} {...item} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
