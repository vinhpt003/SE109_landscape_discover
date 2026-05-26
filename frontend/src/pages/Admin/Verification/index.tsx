import { useState, useEffect } from 'react'
import AdminSideNav from '../../../components/layouts/AdminSideNav'
import AdminTopBar from '../../../components/layouts/AdminTopBar'
import { getLandmarks } from '../../../services/landmarkService'
import type { Landmark, Review } from '../../../types'

// ── Types ──────────────────────────────────────────────────────────────────
type ItemType = 'review' | 'landmark' | 'photo'
type ItemStatus = 'pending' | 'approved' | 'rejected'

interface VerificationItem {
  id: string
  type: ItemType
  title: string
  submittedBy: string
  submittedAt: string
  status: ItemStatus
  preview?: string
  content?: string
  rating?: number
  landmark?: string
}

// We'll derive verification items from backend when possible.
const FALLBACK_SUGGESTION = {
  id: 'sugg-1',
  type: 'landmark' as const,
  title: 'Đề xuất địa điểm: Cầu Vàng Đà Nẵng',
  submittedBy: 'Người dùng',
  submittedAt: new Date().toLocaleString(),
  status: 'pending' as const,
  content: 'Cầu Vàng nằm trên đỉnh Bà Nà Hills...',
}

// ── Constants ──────────────────────────────────────────────────────────────
const TYPE_CONFIG: Record<ItemType, { label: string; icon: string; color: string }> = {
  review:   { label: 'Đánh giá',   icon: 'rate_review',    color: 'bg-primary-fixed text-primary' },
  photo:    { label: 'Hình ảnh',   icon: 'photo_library',  color: 'bg-[#e6f4ea] text-[#137333]' },
  landmark: { label: 'Địa điểm',   icon: 'add_location',   color: 'bg-tertiary-fixed text-on-tertiary-fixed-variant' },
}

const STATUS_CONFIG: Record<ItemStatus, { label: string; class: string }> = {
  pending:  { label: 'Chờ duyệt',   class: 'bg-tertiary-fixed text-on-tertiary-fixed-variant' },
  approved: { label: 'Đã duyệt',    class: 'bg-secondary-container text-on-secondary-container' },
  rejected: { label: 'Từ chối',     class: 'bg-error-container text-on-error-container' },
}

// ── Sub-components ─────────────────────────────────────────────────────────
function StarRow({ count }: { count: number }) {
  return (
    <div className="flex">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className="material-symbols-outlined text-[14px]"
          style={{
            fontVariationSettings: i < count ? "'FILL' 1" : "'FILL' 0",
            color: '#ffb77d',
          }}
        >
          star
        </span>
      ))}
    </div>
  )
}

function ItemCard({
  item,
  onApprove,
  onReject,
}: {
  item: VerificationItem
  onApprove: (id: string) => void
  onReject: (id: string) => void
}) {
  const typeCfg = TYPE_CONFIG[item.type]
  const statusCfg = STATUS_CONFIG[item.status]

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-surface-container p-6 flex flex-col gap-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_15px_rgba(0,0,0,0.07)] transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full ${typeCfg.color} flex items-center justify-center shrink-0`}>
            <span className="material-symbols-outlined text-[18px]">{typeCfg.icon}</span>
          </div>
          <div>
            <p className="font-label-md text-label-md text-on-surface">{item.title}</p>
            <p className="font-caption text-caption text-on-surface-variant flex items-center gap-1 mt-0.5">
              <span className="material-symbols-outlined text-[12px]">person</span>
              {item.submittedBy} · {item.submittedAt}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`font-caption text-caption font-semibold px-2.5 py-0.5 rounded-full ${typeCfg.color}`}>
            {typeCfg.label}
          </span>
          <span className={`font-caption text-caption font-semibold px-2.5 py-0.5 rounded-full ${statusCfg.class}`}>
            {statusCfg.label}
          </span>
        </div>
      </div>

      {/* Content preview */}
      {item.landmark && (
        <p className="font-caption text-caption text-outline flex items-center gap-1">
          <span className="material-symbols-outlined text-[13px]">location_on</span>
          {item.landmark}
        </p>
      )}
      {item.rating && <StarRow count={item.rating} />}
      {item.content && (
        <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed line-clamp-3 bg-surface-container-low rounded-lg px-4 py-3">
          {item.content}
        </p>
      )}
      {item.preview && (
        <div className="h-40 rounded-lg overflow-hidden border border-outline-variant">
          <img src={item.preview} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Actions */}
      {item.status === 'pending' && (
        <div className="flex gap-3 pt-2 border-t border-surface-container">
          <button
            onClick={() => onApprove(item.id)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-secondary-container text-on-secondary-container rounded-lg font-label-md text-label-md hover:bg-secondary-fixed transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            Duyệt
          </button>
          <button
            onClick={() => onReject(item.id)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-error-container text-on-error-container rounded-lg font-label-md text-label-md hover:opacity-80 transition-opacity"
          >
            <span className="material-symbols-outlined text-[18px]">cancel</span>
            Từ chối
          </button>
        </div>
      )}
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function AdminVerification() {
  const [items, setItems] = useState<VerificationItem[]>([])
  const [activeTab, setActiveTab] = useState<ItemStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<ItemType | ''>('')

  useEffect(() => {
    let mounted = true
    getLandmarks()
      .then((lands: Landmark[]) => {
        if (!mounted) return
        const fromReviews: VerificationItem[] = []
        const fromPhotos: VerificationItem[] = []

        lands.forEach(l => {
          (l.reviews ?? []).forEach((r: Review) => {
            fromReviews.push({
              id: `rev-${r.id}`,
              type: 'review',
              title: `Đánh giá về ${l.title}`,
              submittedBy: r.user?.fullName ?? 'Người dùng',
              submittedAt: new Date(r.createdAt).toLocaleString(),
              status: 'pending',
              rating: r.rating,
              landmark: l.title,
              content: r.comment,
            })
          })

          (l.images ?? []).forEach((m, i) => {
            fromPhotos.push({
              id: `img-${l.id}-${i}`,
              type: 'photo',
              title: `Ảnh tải lên: ${l.title}`,
              submittedBy: 'Người dùng',
              submittedAt: new Date(l.createdAt).toLocaleString(),
              status: 'pending',
              landmark: l.title,
              preview: m.url,
            })
          })
        })

        const combined = [...fromReviews, ...fromPhotos, FALLBACK_SUGGESTION]
        setItems(combined)
      })
      .catch(() => {
        setItems([FALLBACK_SUGGESTION])
      })

    return () => { mounted = false }
  }, [])

  const handleApprove = (id: string) =>
    setItems(prev => prev.map(i => (i.id === id ? { ...i, status: 'approved' } : i)))

  const handleReject = (id: string) =>
    setItems(prev => prev.map(i => (i.id === id ? { ...i, status: 'rejected' } : i)))

  const filtered = items.filter(i => {
    const matchTab = activeTab === 'all' || i.status === activeTab
    const matchType = !typeFilter || i.type === typeFilter
    return matchTab && matchType
  })

  const pendingCount = items.filter(i => i.status === 'pending').length

  const tabs: { key: ItemStatus | 'all'; label: string }[] = [
    { key: 'all',      label: `Tất cả (${items.length})` },
    { key: 'pending',  label: `Chờ duyệt (${pendingCount})` },
    { key: 'approved', label: 'Đã duyệt' },
    { key: 'rejected', label: 'Từ chối' },
  ]

  return (
    <div className="bg-surface min-h-screen flex">
      <AdminSideNav />

      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <AdminTopBar />

        <main className="flex-1 pt-24 px-margin-desktop pb-margin-desktop bg-surface-bright overflow-y-auto">
          <div className="max-w-container-max mx-auto space-y-8">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-headline-lg text-on-background">
                  Kiểm duyệt nội dung
                </h2>
                <p className="font-sans text-body-md text-on-surface-variant mt-1">
                  Xem xét và phê duyệt đánh giá, hình ảnh và địa điểm do người dùng gửi.
                </p>
              </div>
              {pendingCount > 0 && (
                <div className="flex items-center gap-2 bg-tertiary-fixed text-on-tertiary-fixed-variant px-4 py-2 rounded-full font-label-md text-label-md">
                  <span className="material-symbols-outlined text-[18px]">pending_actions</span>
                  {pendingCount} mục cần xử lý
                </div>
              )}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Tabs */}
              <div className="flex items-center gap-1 border-b border-outline-variant flex-1">
                {tabs.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={[
                      'px-4 py-2.5 font-label-md text-label-md border-b-2 -mb-px transition-all duration-200 whitespace-nowrap',
                      activeTab === key
                        ? 'border-primary text-primary'
                        : 'border-transparent text-on-surface-variant hover:text-on-surface',
                    ].join(' ')}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Type filter */}
              <div className="relative shrink-0">
                <select
                  value={typeFilter}
                  onChange={e => setTypeFilter(e.target.value as ItemType | '')}
                  className="appearance-none bg-surface-container-low border border-outline-variant rounded-lg py-2.5 pl-4 pr-10 font-body-md text-body-md text-on-surface focus:outline-none focus:border-secondary"
                >
                  <option value="">Tất cả loại</option>
                  <option value="review">Đánh giá</option>
                  <option value="photo">Hình ảnh</option>
                  <option value="landmark">Địa điểm</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[20px]">
                  expand_more
                </span>
              </div>
            </div>

            {/* Grid */}
            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-gutter">
                {filtered.map(item => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onApprove={handleApprove}
                    onReject={handleReject}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                <div className="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[32px]">verified_user</span>
                </div>
                <div>
                  <p className="font-label-md text-label-md text-on-surface mb-1">Không có mục nào</p>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Không tìm thấy nội dung phù hợp với bộ lọc hiện tại.
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
