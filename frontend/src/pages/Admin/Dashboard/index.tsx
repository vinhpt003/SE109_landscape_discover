import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import AdminSideNav from '../../../components/layouts/AdminSideNav'
import AdminTopBar from '../../../components/layouts/AdminTopBar'
import { notificationsService } from '../../../services/notifications.service'
import type { NotificationType } from '../../../types'

const NOTI_ICON: Record<NotificationType, { icon: string; iconBg: string; iconColor: string }> = {
  PostPending:  { icon: 'pending',       iconBg: 'bg-tertiary-fixed',          iconColor: 'text-tertiary' },
  PostApproved: { icon: 'check_circle',  iconBg: 'bg-[#e6f4ea]',               iconColor: 'text-secondary' },
  PostRejected: { icon: 'cancel',        iconBg: 'bg-error-container',         iconColor: 'text-error' },
  NewComment:   { icon: 'chat',          iconBg: 'bg-primary-fixed',           iconColor: 'text-primary' },
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'vừa xong'
  if (min < 60) return `${min} phút trước`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr} giờ trước`
  const day = Math.floor(hr / 24)
  if (day < 7) return `${day} ngày trước`
  return new Date(iso).toLocaleDateString('vi-VN')
}

// ── Mock data ──────────────────────────────────────────────────────────────
const KPI_CARDS = [
  {
    icon: 'landscape',
    iconBg: 'bg-primary-fixed',
    iconColor: 'text-primary',
    label: 'Tổng số danh lam',
    value: '1,482',
    badge: { text: '12%', type: 'positive' },
  },
  {
    icon: 'rate_review',
    iconBg: 'bg-[#fff0e6]',
    iconColor: 'text-[#e35d5b]',
    label: 'Đánh giá chờ duyệt',
    value: '56',
    badge: { text: 'Cần xử lý', type: 'warning' },
  },
  {
    icon: 'group',
    iconBg: 'bg-[#e0f2f1]',
    iconColor: 'text-secondary',
    label: 'Người dùng hoạt động (30 ngày)',
    value: '12,405',
    badge: { text: '4.3%', type: 'positive' },
  },
]

const CHART_BARS = [
  { label: 'Bắc',    height: '80%', color: '#004581', value: 400 },
  { label: 'Trung',  height: '45%', color: '#006a64', value: 225 },
  { label: 'Nam',    height: '60%', color: '#e35d5b', value: 300 },
  { label: 'Đảo',   height: '30%', color: '#075fac', value: 150 },
]

// ── Component ──────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { data: notiData } = useQuery({
    queryKey: ['notifications', 'me'],
    queryFn: () => notificationsService.fetchMine({ limit: 8 }),
  })
  const activities = notiData?.data ?? []

  return (
    <div className="bg-surface min-h-screen flex">
      <AdminSideNav />

      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <AdminTopBar />

        <main className="flex-1 pt-24 px-margin-desktop pb-margin-desktop bg-surface-bright overflow-y-auto">
          <div className="max-w-container-max mx-auto space-y-8">

            {/* Page header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-display-lg text-on-background">Tổng quan</h2>
                <p className="font-sans text-body-lg text-on-surface-variant mt-2">
                  Chào mừng trở lại trung tâm quản trị WanderShare.
                </p>
              </div>
              <p className="font-caption text-caption text-on-surface-variant">Cập nhật: vừa xong</p>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {KPI_CARDS.map((card, i) => (
                <div
                  key={i}
                  className="bg-surface-container-lowest rounded-xl p-6 card-shadow hover:-translate-y-1 transition-all duration-300 border border-surface-container"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`w-12 h-12 rounded-full ${card.iconBg} flex items-center justify-center ${card.iconColor}`}>
                      <span className="material-symbols-outlined">{card.icon}</span>
                    </div>
                    {card.badge.type === 'positive' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#e6f4ea] text-[#137333]">
                        <span className="material-symbols-outlined text-[14px] mr-1">trending_up</span>
                        {card.badge.text}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#fce8e6] text-[#c5221f]">
                        <span className="material-symbols-outlined text-[14px] mr-1">priority_high</span>
                        {card.badge.text}
                      </span>
                    )}
                  </div>
                  <h3 className="font-label-md text-label-md text-on-surface-variant mb-1">{card.label}</h3>
                  <p className="font-display text-headline-lg text-on-surface">{card.value}</p>
                </div>
              ))}
            </div>

            {/* Chart + Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Bar chart */}
              <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl p-6 card-shadow border border-surface-container">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-display text-headline-md text-on-surface">Danh lam theo vùng</h3>
                  <button className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors">
                    <span className="material-symbols-outlined">more_vert</span>
                  </button>
                </div>

                <div className="h-64 w-full flex items-end justify-around gap-4 pb-4 border-b border-surface-container-highest relative pl-8">
                  {/* Y-axis */}
                  <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-on-surface-variant pb-4">
                    <span>500</span>
                    <span>250</span>
                    <span>0</span>
                  </div>
                  {CHART_BARS.map(bar => (
                    <div
                      key={bar.label}
                      className="relative w-16 rounded-t-md hover:opacity-90 transition-opacity group flex items-end justify-center"
                      style={{ height: bar.height, backgroundColor: bar.color }}
                    >
                      <span className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-inverse-surface text-inverse-on-surface px-2 py-1 rounded text-xs transition-opacity whitespace-nowrap">
                        {bar.value}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-around mt-4 font-caption text-caption text-on-surface-variant pl-8">
                  {CHART_BARS.map(b => <span key={b.label}>{b.label}</span>)}
                </div>
              </div>

              {/* Activity feed */}
              <div className="bg-surface-container-lowest rounded-xl p-6 card-shadow border border-surface-container flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-display text-headline-md text-on-surface">Hoạt động gần đây</h3>
                  <Link to="/admin" className="text-primary hover:text-primary-container font-label-md text-label-md text-sm">
                    Xem tất cả
                  </Link>
                </div>

                <div className="space-y-6 flex-1 overflow-y-auto">
                  {activities.length === 0 && (
                    <div className="text-center py-8 text-on-surface-variant">
                      <span className="material-symbols-outlined text-[40px] opacity-40">notifications_off</span>
                      <p className="font-body-md text-sm mt-2">Chưa có hoạt động nào</p>
                    </div>
                  )}
                  {activities.map(n => {
                    const meta = NOTI_ICON[n.type]
                    const link =
                      n.type === 'PostPending' && n.postId
                        ? `/admin/landmarks?status=Pending&focus=${n.postId}`
                        : n.postId
                          ? `/landmarks/${n.postId}`
                          : '#'
                    return (
                      <Link
                        key={n.notificationId}
                        to={link}
                        className={`flex gap-4 items-start hover:bg-surface-container-low rounded-lg p-2 -mx-2 transition-colors ${
                          !n.read ? 'bg-primary-fixed/20' : ''
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full ${meta.iconBg} flex items-center justify-center ${meta.iconColor} shrink-0 mt-1`}>
                          <span className="material-symbols-outlined text-[16px]">{meta.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-body-md text-sm text-on-surface line-clamp-2">{n.message}</p>
                          <p className="font-caption text-caption text-on-surface-variant mt-1">
                            {formatRelative(n.createdAt)}
                          </p>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}
