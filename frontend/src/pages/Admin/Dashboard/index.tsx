import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import AdminSideNav from '../../../components/layouts/AdminSideNav'
import AdminTopBar from '../../../components/layouts/AdminTopBar'
import { getLandmarks } from '../../../services/landmarkService'
import httpClient from '../../../services/httpClient'
import type { Landmark } from '../../../types'
import { REGION_LABEL } from '../../../constants'

// We'll derive KPI/chart/activity data from backend endpoints
// Fallbacks are used when backend data is not available.
const DEFAULT_BAR_COLORS = ['#004581', '#006a64', '#e35d5b', '#075fac']

// ── Component ──────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [kpiCards, setKpiCards] = useState<any[]>([])
  const [chartBars, setChartBars] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])

  useEffect(() => {
    let mounted = true
    Promise.all([getLandmarks(), httpClient.get('/users').then(r => r.data).catch(() => [])])
      .then(([lands, users]) => {
        if (!mounted) return

        const total = lands.length
        const pending = lands.filter((l: Landmark) => l.status === 'PENDING').length
        const activeUsers = users.length ?? 0

        setKpiCards([
          { icon: 'landscape', iconBg: 'bg-primary-fixed', iconColor: 'text-primary', label: 'Tổng số danh lam', value: total.toLocaleString(), badge: { text: '', type: 'neutral' } },
          { icon: 'rate_review', iconBg: 'bg-[#fff0e6]', iconColor: 'text-[#e35d5b]', label: 'Danh lam chờ duyệt', value: pending.toString(), badge: { text: 'Cần xử lý', type: 'warning' } },
          { icon: 'group', iconBg: 'bg-[#e0f2f1]', iconColor: 'text-secondary', label: 'Người dùng', value: activeUsers.toLocaleString(), badge: { text: '', type: 'neutral' } },
        ])

        // Chart by region
        const regions = ['MIEN_BAC', 'MIEN_TRUNG', 'MIEN_NAM']
        const counts = regions.map(r => lands.filter((l: Landmark) => l.region === r).length)
        const max = Math.max(...counts, 1)
        const bars = regions.map((r, i) => ({ label: REGION_LABEL[r as keyof typeof REGION_LABEL], height: `${Math.round((counts[i] / max) * 100)}%`, color: DEFAULT_BAR_COLORS[i] ?? '#999', value: counts[i] }))
        setChartBars(bars)

        // Activities: derive simple recent items from landmarks
        const acts = lands.slice(0, 6).map((l: Landmark, i: number) => ({
          icon: 'add_location',
          iconBg: 'bg-primary-fixed',
          iconColor: 'text-primary',
          text: <><span className="font-semibold">{l.title}</span> đã được thêm.</>,
          time: new Date(l.createdAt).toLocaleString(),
        }))
        setActivities(acts)
      })
      .catch(() => {})
    return () => { mounted = false }
  }, [])
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
              {kpiCards.map((card, i) => (
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
                  {chartBars.map(bar => (
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
                  {chartBars.map(b => <span key={b.label}>{b.label}</span>)}
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
                  {activities.map((act, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <div className={`w-8 h-8 rounded-full ${act.iconBg} flex items-center justify-center ${act.iconColor} shrink-0 mt-1`}>
                        <span className="material-symbols-outlined text-[16px]">{act.icon}</span>
                      </div>
                      <div>
                        <p className="font-body-md text-sm text-on-surface">{act.text}</p>
                        <p className="font-caption text-caption text-on-surface-variant mt-1">{act.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}
