import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import AdminSideNav from '../../../components/layouts/AdminSideNav'
import AdminTopBar from '../../../components/layouts/AdminTopBar'
import { locationsService } from '../../../services/locations.service'
import type { Region } from '../../../types'

// ── Region badge ────────────────────────────────────────────────────────────
const REGION_STYLE: Record<Region, string> = {
  North:   'bg-tertiary-fixed text-on-tertiary-fixed-variant',
  Central: 'bg-secondary-container text-on-secondary-container',
  South:   'bg-error-container text-on-error-container',
}

const REGION_LABEL: Record<Region, string> = {
  North:   'Miền Bắc',
  Central: 'Miền Trung',
  South:   'Miền Nam',
}

function RegionBadge({ region }: { region: Region | null | undefined }) {
  if (!region) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-caption text-caption font-semibold bg-surface-variant text-on-surface-variant">
        Chưa phân vùng
      </span>
    )
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-caption text-caption font-semibold ${REGION_STYLE[region]}`}>
      {REGION_LABEL[region]}
    </span>
  )
}

// ── Page ────────────────────────────────────────────────────────────────────
export default function AdminLocations() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [regionFilter, setRegionFilter] = useState<Region | ''>('')

  const { data: locations = [], isLoading } = useQuery({
    queryKey: ['admin-locations'],
    queryFn: () => locationsService.fetchLocations(),
  })

  const filtered = locations.filter(loc => {
    const matchSearch =
      loc.locationName.toLowerCase().includes(search.toLowerCase()) ||
      (loc.description ?? '').toLowerCase().includes(search.toLowerCase())
    const matchRegion = !regionFilter || loc.region === regionFilter
    return matchSearch && matchRegion
  })

  // Stats
  const northCount   = locations.filter(l => l.region === 'North').length
  const centralCount = locations.filter(l => l.region === 'Central').length
  const southCount   = locations.filter(l => l.region === 'South').length

  return (
    <div className="bg-surface min-h-screen flex">
      <AdminSideNav />

      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <AdminTopBar />

        <main className="flex-1 pt-24 px-margin-desktop pb-margin-desktop bg-background overflow-y-auto">
          <div className="max-w-container-max mx-auto">

            {/* Page header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h1 className="font-display text-headline-lg text-on-surface">Quản lý địa điểm</h1>
                <p className="font-sans text-body-md text-on-surface-variant mt-1">
                  Xem danh sách và thêm các địa điểm du lịch.
                </p>
              </div>
              <button
                onClick={() => navigate('/admin/locations/new')}
                className="bg-primary text-on-primary px-6 py-3 rounded-lg font-label-md text-label-md flex items-center gap-2 shadow-float hover:-translate-y-0.5 transition-transform"
              >
                <span className="material-symbols-outlined">add</span>
                Thêm địa điểm mới
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-surface-bright rounded-xl border border-outline-variant p-4 text-center">
                <p className="font-display text-headline-md text-on-surface">{locations.length}</p>
                <p className="font-body-md text-body-md text-on-surface-variant">Tổng số</p>
              </div>
              <div className="bg-surface-bright rounded-xl border border-outline-variant p-4 text-center">
                <p className="font-display text-headline-md text-on-surface">{northCount}</p>
                <p className="font-body-md text-body-md text-on-surface-variant">Miền Bắc</p>
              </div>
              <div className="bg-surface-bright rounded-xl border border-outline-variant p-4 text-center">
                <p className="font-display text-headline-md text-on-surface">{centralCount}</p>
                <p className="font-body-md text-body-md text-on-surface-variant">Miền Trung</p>
              </div>
              <div className="bg-surface-bright rounded-xl border border-outline-variant p-4 text-center">
                <p className="font-display text-headline-md text-on-surface">{southCount}</p>
                <p className="font-body-md text-body-md text-on-surface-variant">Miền Nam</p>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-surface-bright p-4 rounded-xl border border-outline-variant mb-6 flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên hoặc mô tả..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2.5 pl-10 pr-4 text-on-surface font-body-md text-body-md focus:ring-1 focus:ring-secondary focus:border-secondary focus:outline-none transition-all"
                />
              </div>

              <select
                value={regionFilter}
                onChange={e => setRegionFilter(e.target.value as Region | '')}
                className="bg-surface-container-low border border-outline-variant rounded-lg py-2.5 px-4 text-on-surface font-body-md text-body-md focus:ring-1 focus:ring-secondary focus:outline-none"
              >
                <option value="">Tất cả vùng miền</option>
                <option value="North">Miền Bắc</option>
                <option value="Central">Miền Trung</option>
                <option value="South">Miền Nam</option>
              </select>
            </div>

            {/* Table */}
            <div className="bg-surface-bright rounded-xl border border-outline-variant overflow-hidden card-shadow">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[720px]">
                  <thead className="bg-surface-container border-b border-outline-variant text-on-surface-variant font-label-md text-label-md">
                    <tr>
                      <th className="py-4 px-6">Tên địa điểm</th>
                      <th className="py-4 px-6">Mô tả</th>
                      <th className="py-4 px-6">Tọa độ</th>
                      <th className="py-4 px-6">Vùng miền</th>
                    </tr>
                  </thead>

                  <tbody className="font-body-md text-body-md text-on-surface divide-y divide-surface-variant">
                    {isLoading && (
                      <tr>
                        <td colSpan={4} className="py-16 text-center">
                          <div className="w-8 h-8 rounded-full border-4 border-primary-fixed border-t-primary animate-spin mx-auto" />
                        </td>
                      </tr>
                    )}

                    {!isLoading && filtered.map(loc => (
                      <tr
                        key={loc.locationId}
                        className="transition-colors hover:bg-surface-container-low"
                      >
                        <td className="py-4 px-6 font-label-md text-label-md">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-primary-fixed flex items-center justify-center shrink-0">
                              <span className="material-symbols-outlined text-primary text-[20px]">location_on</span>
                            </div>
                            {loc.locationName}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-on-surface-variant max-w-[240px] truncate">
                          {loc.description ?? '—'}
                        </td>
                        <td className="py-4 px-6 text-on-surface-variant font-mono text-caption">
                          {loc.coordinates ?? '—'}
                        </td>
                        <td className="py-4 px-6">
                          <RegionBadge region={loc.region} />
                        </td>
                      </tr>
                    ))}

                    {!isLoading && filtered.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-16 text-center text-on-surface-variant font-body-md text-body-md">
                          <span className="material-symbols-outlined text-[48px] block mb-3 opacity-40">location_off</span>
                          Không tìm thấy địa điểm nào phù hợp.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="bg-surface-bright border-t border-outline-variant py-3 px-6 flex items-center justify-between">
                <span className="font-body-md text-body-md text-on-surface-variant">
                  Hiển thị {filtered.length} trong tổng số {locations.length} địa điểm
                </span>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}
