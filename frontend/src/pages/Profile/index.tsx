import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { usersService } from '../../services/users.service'
import { useToast } from '../../hooks/useToast'
import TopNavBar from '../../components/layouts/TopNavBar'
import Footer from '../../components/layouts/Footer'
import Toaster from '../../components/ui/Toaster'
import ImageUploader from '../../components/forms/ImageUploader'

export default function Profile() {
  const navigate = useNavigate()
  const { user, login, token } = useAuthStore()
  const { toasts, toast, dismiss } = useToast()

  const [userName, setUserName] = useState(user?.userName ?? '')
  const [avatar, setAvatar] = useState<string | null>(user?.avatar ?? null)
  const [avatarPublicId, setAvatarPublicId] = useState<string | null>(null)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [saving, setSaving] = useState(false)

  if (!user) {
    navigate('/login')
    return null
  }

  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : '—'

  const handleCancel = () => {
    setUserName(user.userName)
    setAvatar(user.avatar)
    setAvatarPublicId(null)
    setCurrentPassword('')
    setNewPassword('')
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userName.trim()) {
      toast('Tên hiển thị không được để trống', 'error')
      return
    }
    if (newPassword && !currentPassword) {
      toast('Vui lòng nhập mật khẩu hiện tại', 'error')
      return
    }
    if (newPassword && newPassword.length < 6) {
      toast('Mật khẩu mới phải có ít nhất 6 ký tự', 'error')
      return
    }

    setSaving(true)
    try {
      const payload: {
        userName: string
        avatar?: string | null
        avatarPublicId?: string | null
        currentPassword?: string
        newPassword?: string
      } = { userName: userName.trim() }

      if (avatar !== user.avatar) {
        payload.avatar = avatar
        payload.avatarPublicId = avatarPublicId
      }
      if (newPassword) {
        payload.currentPassword = currentPassword
        payload.newPassword = newPassword
      }

      const updated = await usersService.updateMe(payload)
      login(updated, token!)
      setAvatarPublicId(null)
      toast('Đã lưu thay đổi thành công!', 'success')
      setCurrentPassword('')
      setNewPassword('')
    } catch (err: any) {
      toast(err?.response?.data?.message ?? 'Lưu thất bại, thử lại sau', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background font-body-md text-on-surface flex flex-col">
      <Toaster toasts={toasts} onDismiss={dismiss} />
      <TopNavBar />

      <main className="flex-1 pt-28 pb-section-gap max-w-container-max mx-auto w-full px-margin-mobile md:px-margin-desktop">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter items-start">

          {/* ── Left: Profile summary ──────────────────────────────── */}
          <aside className="md:col-span-4 space-y-6">
            <div className="bg-surface-container-lowest rounded-[16px] shadow-level-1 p-8 text-center">
              {/* Avatar */}
              <div className="relative inline-block mb-6">
                {avatar ? (
                  <img
                    src={avatar}
                    alt={user.userName}
                    className="w-24 h-24 rounded-full border-2 border-white shadow-md object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full border-2 border-white shadow-md bg-primary flex items-center justify-center">
                    <span className="text-on-primary text-4xl font-bold uppercase">
                      {user.userName[0]}
                    </span>
                  </div>
                )}
              </div>

              <h2 className="font-headline-md text-headline-md text-on-surface mb-1">
                {user.userName}
              </h2>
              <p className="text-on-surface-variant font-body-md mb-4">{user.email}</p>

              <div className="flex flex-col items-center gap-3">
                <span className="bg-tertiary-fixed text-on-tertiary-fixed px-4 py-1.5 rounded-full font-label-md text-label-md">
                  {user.role}
                </span>
                <div className="flex items-center gap-1.5 text-outline text-caption font-caption">
                  <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                  Tham gia: {joinedDate}
                </div>
              </div>
            </div>
          </aside>

          {/* ── Right: Edit form ───────────────────────────────────── */}
          <section className="md:col-span-8">
            <div className="bg-surface-container-lowest rounded-[16px] shadow-level-1 p-8 md:p-10">
              <h1 className="font-headline-md text-headline-md text-on-surface mb-8">
                Cài đặt trang cá nhân
              </h1>

              <form className="space-y-8" onSubmit={handleSave}>

                {/* Avatar */}
                <div className="space-y-2">
                  <label className="block font-label-md text-label-md text-on-surface-variant">
                    Ảnh đại diện
                  </label>
                  <ImageUploader
                    variant="avatar"
                    value={avatar}
                    publicId={avatarPublicId}
                    onChange={({ url, publicId }) => {
                      setAvatar(url)
                      setAvatarPublicId(publicId)
                    }}
                  />
                </div>

                <hr className="border-surface-container-high" />

                {/* Personal Information */}
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label
                        htmlFor="userName"
                        className="block font-label-md text-label-md text-on-surface-variant"
                      >
                        Tên hiển thị
                      </label>
                      <input
                        id="userName"
                        type="text"
                        value={userName}
                        onChange={e => setUserName(e.target.value)}
                        className="w-full bg-surface-bright border border-outline-variant rounded-lg py-3 px-4 focus:ring-2 focus:ring-secondary focus:border-secondary transition-all outline-none text-on-surface"
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="email"
                        className="block font-label-md text-label-md text-on-surface-variant"
                      >
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={user.email}
                        disabled
                        className="w-full bg-surface-container border border-outline-variant rounded-lg py-3 px-4 text-outline cursor-not-allowed outline-none"
                      />
                    </div>
                  </div>
                </div>

                <hr className="border-surface-container-high" />

                {/* Security Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-primary">
                    <span className="material-symbols-outlined">security</span>
                    <h3 className="font-headline-md text-[20px] font-semibold">Bảo mật</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label
                        htmlFor="currentPassword"
                        className="block font-label-md text-label-md text-on-surface-variant"
                      >
                        Mật khẩu hiện tại
                      </label>
                      <input
                        id="currentPassword"
                        type="password"
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-surface-bright border border-outline-variant rounded-lg py-3 px-4 focus:ring-2 focus:ring-secondary focus:border-secondary transition-all outline-none text-on-surface"
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="newPassword"
                        className="block font-label-md text-label-md text-on-surface-variant"
                      >
                        Mật khẩu mới
                      </label>
                      <input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-surface-bright border border-outline-variant rounded-lg py-3 px-4 focus:ring-2 focus:ring-secondary focus:border-secondary transition-all outline-none text-on-surface"
                      />
                    </div>
                  </div>

                  <p className="text-caption font-caption text-outline">
                    Để trống nếu không muốn đổi mật khẩu.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row justify-end items-center gap-4 pt-6">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="w-full sm:w-auto px-8 py-3 border-2 border-secondary text-secondary font-label-md text-label-md rounded-lg hover:bg-secondary/5 active:scale-95 transition-all"
                  >
                    Huỷ
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full sm:w-auto px-8 py-3 bg-primary text-on-primary font-label-md text-label-md rounded-lg shadow-level-1 hover:shadow-level-2 hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <span className="flex items-center gap-2 justify-center">
                        <span className="material-symbols-outlined animate-spin text-[18px]">
                          progress_activity
                        </span>
                        Đang lưu...
                      </span>
                    ) : (
                      'Lưu thay đổi'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  )
}
