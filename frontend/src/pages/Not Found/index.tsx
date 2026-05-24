import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-margin-mobile text-center gap-6">
      <div className="w-20 h-20 rounded-full bg-primary-fixed flex items-center justify-center">
        <span className="material-symbols-outlined text-primary text-[40px]">travel_explore</span>
      </div>
      <div>
        <h1 className="font-display text-display-lg text-primary mb-2">404</h1>
        <h2 className="font-display text-headline-md text-on-background mb-3">Trang không tìm thấy</h2>
        <p className="font-sans text-body-lg text-on-surface-variant max-w-md mx-auto">
          Có vẻ như bạn đã đi lạc vào vùng đất chưa được khám phá. Hãy quay về trang chủ!
        </p>
      </div>
      <Link
        to="/"
        className="bg-primary text-on-primary px-8 py-3 rounded-lg font-label-md text-label-md hover:bg-primary-container transition-colors shadow-float"
      >
        Về trang chủ
      </Link>
    </div>
  )
}
