import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AdminSideNav from '../../../components/layouts/AdminSideNav'
import AdminTopBar from '../../../components/layouts/AdminTopBar'

// ── Types ──────────────────────────────────────────────────────────────────
type StatusType = 'Published' | 'Draft' | 'Needs Verification'

interface Landmark {
  id: string
  code: string
  name: string
  region: string
  rating: number | null
  status: StatusType
  thumbnail?: string
}

// ── Mock data ──────────────────────────────────────────────────────────────
const MOCK_LANDMARKS: Landmark[] = [
  { id: '1', code: '#LND-001', name: 'Hoàng Thành Huế',    region: 'Miền Trung', rating: 4.8, status: 'Published',
    thumbnail: 'https://images.unsplash.com/photo-1557750255-c76072a7aad1?w=200&q=70' },
  { id: '2', code: '#LND-002', name: 'Vịnh Hạ Long',      region: 'Miền Bắc',   rating: 4.9, status: 'Published',
    thumbnail: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=200&q=70' },
  { id: '3', code: '#LND-003', name: 'Phố cổ Hội An',     region: 'Miền Trung', rating: null, status: 'Draft',
    thumbnail: undefined },
  { id: '4', code: '#LND-004', name: 'Mũi Né',            region: 'Miền Nam',   rating: 4.5, status: 'Needs Verification',
    thumbnail: 'https://images.unsplash.com/photo-1585016058010-a285b9756fde?w=200&q=70' },
]

// ── Badge component ────────────────────────────────────────────────────────
const STATUS_STYLE: Record<StatusType, string> = {
  'Published':         'bg-secondary-container text-on-secondary-container',
  'Draft':             'bg-surface-variant text-on-surface-variant',
  'Needs Verification':'bg-tertiary-fixed text-on-tertiary-fixed-variant',
}

const STATUS_LABEL: Record<StatusType, string> = {
  'Published':         'Đã xuất bản',
  'Draft':             'Nháp',
  'Needs Verification':'Cần kiểm duyệt',
}

function StatusBadge({ status }: { status: StatusType }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-caption text-caption font-semibold ${STATUS_STYLE[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function AdminLandmarks() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')
  const [regionFilter, setRegionFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    setSelected(prev => prev.size === filtered.length ? new Set() : new Set(filtered.map(l => l.id)))
  }

  const filtered = MOCK_LANDMARKS.filter(l => {
    const matchSearch = l.name.toLowerCase().includes(search.toLowerCase())
    const matchRegion = !regionFilter || l.region === regionFilter
    const matchStatus = !statusFilter || l.status === statusFilter
    return matchSearch && matchRegion && matchStatus
  })

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
                <h1 className="font-display text-headline-lg text-on-surface">Quản lý danh lam</h1>
                <p className="font-sans text-body-md text-on-surface-variant mt-1">
                  Xem, chỉnh sửa và tổ chức nội dung điểm đến.
                </p>
              </div>
              <button
                onClick={() => navigate('/admin/landmarks/new')}
                className="bg-primary text-on-primary px-6 py-3 rounded-lg font-label-md text-label-md flex items-center gap-2 shadow-float hover:-translate-y-0.5 transition-transform"
              >
                <span className="material-symbols-outlined">add</span>
                Thêm danh lam mới
              </button>
            </div>

            {/* Filters */}
            <div className="bg-surface-bright p-4 rounded-xl border border-outline-variant mb-6 flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-grow">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên danh lam..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2.5 pl-10 pr-4 text-on-surface font-body-md text-body-md focus:ring-1 focus:ring-secondary focus:border-secondary focus:outline-none transition-all"
                />
              </div>

              <div className="flex gap-3 flex-wrap">
                <select
                  value={regionFilter}
                  onChange={e => setRegionFilter(e.target.value)}
                  className="bg-surface-container-low border border-outline-variant rounded-lg py-2.5 px-4 text-on-surface font-body-md text-body-md focus:ring-1 focus:ring-secondary focus:outline-none"
                >
                  <option value="">Tất cả vùng</option>
                  <option value="Miền Bắc">Miền Bắc</option>
                  <option value="Miền Trung">Miền Trung</option>
                  <option value="Miền Nam">Miền Nam</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="bg-surface-container-low border border-outline-variant rounded-lg py-2.5 px-4 text-on-surface font-body-md text-body-md focus:ring-1 focus:ring-secondary focus:outline-none"
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="Published">Đã xuất bản</option>
                  <option value="Draft">Nháp</option>
                  <option value="Needs Verification">Cần kiểm duyệt</option>
                </select>

                <button className="bg-surface-container text-on-surface px-4 py-2.5 rounded-lg border border-outline-variant font-label-md text-label-md hover:bg-surface-container-high transition-colors flex items-center gap-2">
                  <span className="material-symbols-outlined">filter_list</span>
                  Lọc
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="bg-surface-bright rounded-xl border border-outline-variant overflow-hidden card-shadow">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[860px]">
                  <thead className="bg-surface-container border-b border-outline-variant text-on-surface-variant font-label-md text-label-md">
                    <tr>
                      <th className="py-4 px-6 w-14">
                        <input
                          type="checkbox"
                          checked={selected.size === filtered.length && filtered.length > 0}
                          onChange={toggleAll}
                          className="w-4 h-4 rounded border-outline text-primary focus:ring-primary"
                        />
                      </th>
                      <th className="py-4 px-6">Mã</th>
                      <th className="py-4 px-6">Ảnh</th>
                      <th className="py-4 px-6">Tên danh lam</th>
                      <th className="py-4 px-6">Vùng</th>
                      <th className="py-4 px-6">Đánh giá TB</th>
                      <th className="py-4 px-6">Trạng thái</th>
                      <th className="py-4 px-6 text-right">Hành động</th>
                    </tr>
                  </thead>

                  <tbody className="font-body-md text-body-md text-on-surface divide-y divide-surface-variant">
                    {filtered.map(lm => (
                      <tr key={lm.id} className="hover:bg-surface-container-low transition-colors group">
                        {/* Checkbox */}
                        <td className="py-4 px-6">
                          <input
                            type="checkbox"
                            checked={selected.has(lm.id)}
                            onChange={() => toggleSelect(lm.id)}
                            className="w-4 h-4 rounded border-outline text-primary focus:ring-primary"
                          />
                        </td>
                        {/* Code */}
                        <td className="py-4 px-6 text-on-surface-variant font-caption text-caption">{lm.code}</td>
                        {/* Thumbnail */}
                        <td className="py-4 px-6">
                          <div className="w-12 h-12 rounded-lg overflow-hidden border border-outline-variant bg-surface-container">
                            {lm.thumbnail
                              ? <img src={lm.thumbnail} alt={lm.name} className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center">
                                  <span className="material-symbols-outlined text-outline">image</span>
                                </div>
                            }
                          </div>
                        </td>
                        {/* Name */}
                        <td className="py-4 px-6 font-label-md text-label-md">
                          <Link to={`/landmarks/${lm.id}`} className="hover:text-primary transition-colors">
                            {lm.name}
                          </Link>
                        </td>
                        {/* Region */}
                        <td className="py-4 px-6 text-on-surface-variant">{lm.region}</td>
                        {/* Rating */}
                        <td className="py-4 px-6">
                          {lm.rating !== null ? (
                            <div className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[16px] icon-fill" style={{ color: '#ffb77d' }}>star</span>
                              <span>{lm.rating}</span>
                            </div>
                          ) : (
                            <span className="text-on-surface-variant italic font-caption text-caption">Chưa có</span>
                          )}
                        </td>
                        {/* Status */}
                        <td className="py-4 px-6">
                          <StatusBadge status={lm.status} />
                        </td>
                        {/* Actions — show on hover */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => navigate(`/admin/landmarks/${lm.id}/edit`)}
                              className="p-2 text-on-surface-variant hover:text-primary rounded-full hover:bg-surface-container transition-colors"
                              title="Chỉnh sửa"
                            >
                              <span className="material-symbols-outlined">edit</span>
                            </button>
                            <button
                              className="p-2 text-on-surface-variant hover:text-error rounded-full hover:bg-error-container transition-colors"
                              title="Xóa"
                            >
                              <span className="material-symbols-outlined">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={8} className="py-16 text-center text-on-surface-variant font-body-md text-body-md">
                          <span className="material-symbols-outlined text-[48px] block mb-3 opacity-40">search_off</span>
                          Không tìm thấy danh lam nào phù hợp.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="bg-surface-bright border-t border-outline-variant py-3 px-6 flex items-center justify-between">
                <span className="font-body-md text-body-md text-on-surface-variant">
                  Hiển thị 1–{filtered.length} trong tổng số {MOCK_LANDMARKS.length} mục
                </span>
                <div className="flex items-center gap-1">
                  <button className="p-1 rounded hover:bg-surface-container-low text-outline disabled:opacity-40" disabled>
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  <button className="w-8 h-8 rounded bg-primary text-on-primary font-label-md text-label-md flex items-center justify-center">1</button>
                  <button className="w-8 h-8 rounded hover:bg-surface-container text-on-surface-variant font-label-md text-label-md flex items-center justify-center">2</button>
                  <span className="px-2 text-outline">...</span>
                  <button className="p-1 rounded hover:bg-surface-container-low text-on-surface-variant">
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}
