import { useState, useRef } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import AdminSideNav from '../../../components/layouts/AdminSideNav'
import AdminTopBar from '../../../components/layouts/AdminTopBar'

// ── Types ──────────────────────────────────────────────────────────────────
interface FormData {
  name: string
  significance: string
  description: string
  region: string
  hours: string
  verified: boolean
}

// ── Media Thumbnail ────────────────────────────────────────────────────────
function MediaThumb({
  src,
  label,
  onDelete,
}: {
  src: string
  label?: string
  onDelete: () => void
}) {
  return (
    <div className="group relative rounded-lg overflow-hidden border border-outline-variant bg-surface-container aspect-video">
      <img src={src} alt="" className="w-full h-full object-cover" />
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <button
          type="button"
          onClick={onDelete}
          className="w-10 h-10 rounded-full bg-white text-error flex items-center justify-center hover:bg-error-container transition-colors shadow-float"
        >
          <span className="material-symbols-outlined">delete</span>
        </button>
      </div>
      {label && (
        <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-white font-caption text-[10px]">
          {label}
        </div>
      )}
    </div>
  )
}

// ── Toggle switch ──────────────────────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
        checked ? 'bg-primary' : 'bg-outline-variant'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function EditLandmark() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isNew = !id || id === 'new'
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState<FormData>({
    name: isNew ? '' : 'Hoàng Thành Huế',
    significance: isNew ? '' : 'Công trình thế kỷ 19 đại diện cho đỉnh cao kiến trúc kinh đô triều Nguyễn.',
    description: isNew ? '' : 'Hoàng Thành Huế đứng như minh chứng cho tài năng kiến trúc thời kỳ hoàng kim. Đặt trên vùng đất lịch sử, nơi đây cung cấp tầm nhìn toàn cảnh tuyệt đẹp.',
    region: isNew ? '' : 'Miền Trung',
    hours: isNew ? '' : '08:00 SA - 18:00 CH (Hàng ngày)',
    verified: !isNew,
  })

  const [photos, setPhotos] = useState(
    isNew
      ? []
      : [
          { id: '1', url: 'https://images.unsplash.com/photo-1557750255-c76072a7aad1?w=400&q=70', label: 'Ảnh bìa chính' },
          { id: '2', url: 'https://images.unsplash.com/photo-1557750221-5350ef7e7d35?w=400&q=70' },
          { id: '3', url: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=400&q=70' },
        ]
  )

  const update = (field: keyof FormData, value: string | boolean) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const removePhoto = (pid: string) => setPhotos(prev => prev.filter(p => p.id !== pid))

  // ── Toolbar button ───────────────────────────────────────────────────────
  const ToolbarBtn = ({ icon, title }: { icon: string; title: string }) => (
    <button
      type="button"
      title={title}
      className="p-1.5 rounded hover:bg-surface-variant text-on-surface-variant transition-colors"
    >
      <span className="material-symbols-outlined text-[20px]">{icon}</span>
    </button>
  )

  return (
    <div className="bg-surface min-h-screen flex">
      <AdminSideNav />

      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <AdminTopBar />

        <main className="flex-1 pt-24 px-margin-desktop pb-16 bg-surface-bright overflow-y-auto">
          <div className="max-w-container-max mx-auto space-y-8">

            {/* Header + actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <Link
                  to="/admin/landmarks"
                  className="inline-flex items-center gap-1 text-outline hover:text-primary font-label-md text-label-md mb-2 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  Quay lại danh sách
                </Link>
                <h2 className="font-display text-headline-lg text-on-background">
                  {isNew ? 'Thêm danh lam mới' : `Chỉnh sửa: ${form.name}`}
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/admin/landmarks')}
                  className="px-6 py-2.5 rounded-lg border border-outline-variant text-on-surface-variant font-label-md text-label-md hover:bg-surface-container-low transition-colors bg-surface-container-lowest"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  className="px-6 py-2.5 rounded-lg border border-primary text-primary font-label-md text-label-md hover:bg-primary-fixed transition-colors bg-surface-container-lowest"
                >
                  Lưu nháp
                </button>
                <button
                  type="button"
                  className="px-6 py-2.5 rounded-lg bg-[#f05a28] text-white font-label-md text-label-md hover:opacity-90 transition-opacity shadow-float"
                >
                  Xuất bản
                </button>
              </div>
            </div>

            {/* Form grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">

              {/* ── Left: main info ──────────────────────────────── */}
              <div className="lg:col-span-2 flex flex-col gap-gutter">
                <div className="bg-surface-container-lowest rounded-xl p-8 ambient-shadow border border-surface-variant">
                  <h3 className="font-display text-headline-md text-on-background mb-6">Thông tin cơ bản</h3>

                  <div className="space-y-6">
                    {/* Name */}
                    <div>
                      <label className="block font-label-md text-label-md text-on-surface-variant mb-2">
                        Tên danh lam *
                      </label>
                      <input
                        type="text"
                        placeholder="Nhập tên danh lam"
                        value={form.name}
                        onChange={e => update('name', e.target.value)}
                        className="w-full bg-surface-bright border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-colors"
                      />
                    </div>

                    {/* Significance */}
                    <div>
                      <label className="block font-label-md text-label-md text-on-surface-variant mb-2">
                        Ý nghĩa lịch sử / văn hóa
                      </label>
                      <input
                        type="text"
                        placeholder="Tóm tắt giá trị quan trọng"
                        value={form.significance}
                        onChange={e => update('significance', e.target.value)}
                        className="w-full bg-surface-bright border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-colors"
                      />
                    </div>

                    {/* Description rich-text mock */}
                    <div>
                      <label className="block font-label-md text-label-md text-on-surface-variant mb-2">
                        Mô tả chi tiết
                      </label>
                      <div className="border border-outline-variant rounded-lg overflow-hidden bg-surface-bright">
                        {/* Toolbar */}
                        <div className="flex items-center gap-1 border-b border-outline-variant bg-surface-container-low px-4 py-2 flex-wrap">
                          <ToolbarBtn icon="format_bold" title="In đậm" />
                          <ToolbarBtn icon="format_italic" title="In nghiêng" />
                          <ToolbarBtn icon="format_underlined" title="Gạch dưới" />
                          <div className="w-px h-5 bg-outline-variant mx-1" />
                          <ToolbarBtn icon="format_list_bulleted" title="Danh sách" />
                          <ToolbarBtn icon="format_list_numbered" title="Danh sách số" />
                          <div className="w-px h-5 bg-outline-variant mx-1" />
                          <ToolbarBtn icon="link" title="Chèn liên kết" />
                        </div>
                        <textarea
                          rows={8}
                          placeholder="Viết mô tả đầy đủ..."
                          value={form.description}
                          onChange={e => update('description', e.target.value)}
                          className="w-full border-none bg-transparent p-4 font-body-md text-body-md focus:ring-0 resize-y"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Right: meta info ─────────────────────────────── */}
              <div className="lg:col-span-1 flex flex-col gap-gutter">
                <div className="bg-surface-container-lowest rounded-xl p-8 ambient-shadow border border-surface-variant">
                  <h3 className="font-display text-headline-md text-on-background mb-6">Phân loại</h3>

                  <div className="space-y-6">
                    {/* Region */}
                    <div>
                      <label className="block font-label-md text-label-md text-on-surface-variant mb-2">
                        Vùng / Địa điểm
                      </label>
                      <div className="relative">
                        <select
                          value={form.region}
                          onChange={e => update('region', e.target.value)}
                          className="w-full bg-surface-bright border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md appearance-none focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-colors text-on-surface"
                        >
                          <option value="">-- Chọn vùng --</option>
                          <option value="Miền Bắc">Miền Bắc</option>
                          <option value="Miền Trung">Miền Trung</option>
                          <option value="Miền Nam">Miền Nam</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-on-surface-variant">
                          <span className="material-symbols-outlined">expand_more</span>
                        </div>
                      </div>
                    </div>

                    {/* Hours */}
                    <div>
                      <label className="block font-label-md text-label-md text-on-surface-variant mb-2">
                        Giờ mở cửa
                      </label>
                      <input
                        type="text"
                        placeholder="VD: 8:00 SA - 6:00 CH"
                        value={form.hours}
                        onChange={e => update('hours', e.target.value)}
                        className="w-full bg-surface-bright border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-colors"
                      />
                      <p className="font-caption text-caption text-outline mt-2">
                        Ghi chú biến động theo mùa trong phần mô tả.
                      </p>
                    </div>

                    <hr className="border-outline-variant border-dashed" />

                    {/* Verified toggle */}
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <label className="block font-label-md text-label-md text-on-background mb-1">
                          Đã xác minh
                        </label>
                        <p className="font-caption text-caption text-outline">
                          Hiển thị huy hiệu tin cậy cho người dùng.
                        </p>
                      </div>
                      <Toggle checked={form.verified} onChange={v => update('verified', v)} />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Full width: Media ─────────────────────────────── */}
              <div className="lg:col-span-3">
                <div className="bg-surface-container-lowest rounded-xl p-8 ambient-shadow border border-surface-variant">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-display text-headline-md text-on-background">Quản lý hình ảnh</h3>
                    <span className="bg-surface-container-high text-on-surface font-caption text-caption px-3 py-1 rounded-full">
                      {photos.length} ảnh
                    </span>
                  </div>

                  {/* Dropzone */}
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="w-full border-2 border-dashed border-outline-variant rounded-xl bg-surface-bright hover:bg-surface-container transition-colors flex flex-col items-center justify-center py-12 px-6 text-center mb-8 cursor-pointer"
                  >
                    <div className="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center mb-4 text-primary">
                      <span className="material-symbols-outlined text-[32px]">cloud_upload</span>
                    </div>
                    <p className="font-label-md text-label-md text-on-background mb-1">
                      Nhấn để tải lên hoặc kéo thả ảnh
                    </p>
                    <p className="font-body-md text-body-md text-outline">
                      SVG, PNG, JPG hoặc GIF (Tối đa 800×400px)
                    </p>
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" />

                  {/* Thumbnails */}
                  {photos.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {photos.map(p => (
                        <MediaThumb key={p.id} src={p.url} label={(p as any).label} onDelete={() => removePhoto(p.id)} />
                      ))}

                      {/* Add more */}
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="rounded-lg border border-dashed border-outline-variant bg-surface-bright flex flex-col items-center justify-center aspect-video hover:border-secondary hover:text-secondary text-outline transition-colors"
                      >
                        <span className="material-symbols-outlined mb-1">add_photo_alternate</span>
                        <span className="font-caption text-caption">Thêm ảnh</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
