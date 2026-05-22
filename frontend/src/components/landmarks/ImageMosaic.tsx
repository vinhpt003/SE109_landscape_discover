import { useState } from 'react'

// ── Types ──────────────────────────────────────────────────────────────────
export interface ImageMosaicProps {
  /** Array of image URLs — displays up to 4; first is always the hero */
  images: string[]
  /** Alt text prefix (e.g. landmark name) */
  alt?: string
  /** Height class applied to the grid container */
  heightClass?: string
  /** Called when user clicks "Show all photos" */
  onShowAll?: () => void
}

// ── Component ──────────────────────────────────────────────────────────────
export default function ImageMosaic({
  images,
  alt = 'Danh lam',
  heightClass = 'h-[400px] md:h-[560px]',
  onShowAll,
}: ImageMosaicProps) {
  const [lightbox, setLightbox] = useState<string | null>(null)

  // Pad / slice to exactly 4 images
  const slots = [...images, ...Array(4).fill('')].slice(0, 4)
  const [hero, topRight, bottomRight, bottomLeft] = slots

  const openLightbox = (src: string, e: React.MouseEvent) => {
    if (!src) return
    e.stopPropagation()
    setLightbox(src)
  }

  return (
    <>
      {/* ── Grid ───────────────────────────────────────────────── */}
      <div className={`grid grid-cols-4 grid-rows-2 gap-2 rounded-xl overflow-hidden shadow-[0_4px_15px_rgba(0,0,0,0.08)] ${heightClass} relative`}>

        {/* Hero — col-span-2, row-span-2 */}
        <button
          onClick={e => openLightbox(hero, e)}
          className="col-span-2 row-span-2 relative overflow-hidden group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {hero ? (
            <>
              <img
                src={hero}
                alt={`${alt} — ảnh 1`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </>
          ) : (
            <PlaceholderSlot />
          )}
        </button>

        {/* Top-right — col-span-1, row-span-1 */}
        <button
          onClick={e => openLightbox(topRight, e)}
          className="col-span-1 row-span-1 relative overflow-hidden group hidden md:block focus:outline-none"
        >
          {topRight ? (
            <>
              <img
                src={topRight}
                alt={`${alt} — ảnh 2`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </>
          ) : (
            <PlaceholderSlot />
          )}
        </button>

        {/* Bottom-right — col-span-1, row-span-1 */}
        <button
          onClick={e => openLightbox(bottomRight, e)}
          className="col-span-1 row-span-1 relative overflow-hidden group hidden md:block focus:outline-none"
        >
          {bottomRight ? (
            <>
              <img
                src={bottomRight}
                alt={`${alt} — ảnh 3`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </>
          ) : (
            <PlaceholderSlot />
          )}
        </button>

        {/* Bottom wide — col-span-2, row-span-1 */}
        <button
          onClick={e => openLightbox(bottomLeft, e)}
          className="col-span-2 row-span-1 relative overflow-hidden group hidden md:block focus:outline-none"
        >
          {bottomLeft ? (
            <>
              <img
                src={bottomLeft}
                alt={`${alt} — ảnh 4`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </>
          ) : (
            <PlaceholderSlot />
          )}
        </button>

        {/* "Show all photos" button — bottom-right overlay */}
        {images.length > 0 && (
          <button
            onClick={onShowAll}
            className={[
              'absolute bottom-4 right-4',
              'bg-surface-container-lowest/90 backdrop-blur-sm',
              'text-on-surface font-label-md text-label-md',
              'px-4 py-2 rounded-lg border border-outline-variant',
              'flex items-center gap-2 hover:bg-surface-container-lowest',
              'transition-all duration-200 shadow-[0_2px_8px_rgba(0,0,0,0.12)]',
              'hidden md:flex',
            ].join(' ')}
          >
            <span className="material-symbols-outlined text-[18px]">photo_library</span>
            Xem tất cả {images.length} ảnh
          </button>
        )}
      </div>

      {/* ── Lightbox ───────────────────────────────────────────── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-colors"
            onClick={() => setLightbox(null)}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
          <img
            src={lightbox}
            alt="Lightbox"
            className="max-w-full max-h-[90vh] rounded-xl object-contain shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}

// ── Placeholder slot ───────────────────────────────────────────────────────
function PlaceholderSlot() {
  return (
    <div className="w-full h-full bg-surface-container-high flex items-center justify-center">
      <span className="material-symbols-outlined text-outline text-[32px]">image</span>
    </div>
  )
}
