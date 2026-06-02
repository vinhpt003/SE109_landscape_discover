import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import NotificationBell from '../notifications/NotificationBell'

export default function AdminTopBar() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)

  const { user, logout } = useAuthStore()

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = searchValue.trim()
    navigate(q ? `/admin/landmarks?q=${encodeURIComponent(q)}` : '/admin/landmarks')
  }

  const initials = user?.userName
    ? user.userName.slice(0, 2).toUpperCase()
    : 'AD'

  return (
    <header className="bg-surface-bright fixed top-0 right-0 w-[calc(100%-16rem)] h-16 flex items-center justify-between px-8 z-10 shadow-ambient border-b border-outline-variant/40 transition-all duration-200">

      {/* Search */}
      <form
        onSubmit={handleSearchSubmit}
        className="flex items-center bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 w-80 focus-within:border-secondary transition-colors"
      >
        <button type="submit" aria-label="Tìm kiếm" className="flex items-center text-outline hover:text-primary transition-colors">
          <span className="material-symbols-outlined text-[20px]">search</span>
        </button>
        <input
          type="text"
          placeholder="Tìm kiếm địa danh..."
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
          className="bg-transparent border-none focus:ring-0 w-full font-body-md text-body-md text-on-surface placeholder:text-outline-variant ml-2 outline-none"
        />
      </form>

      {/* Right actions */}
      <div className="flex items-center gap-4">
        {/* Quick Add */}
        <button
          onClick={() => navigate('/admin/landmarks/new')}
          className="text-primary font-label-md text-label-md flex items-center gap-2 hover:bg-surface-container-low px-3 py-2 rounded-lg transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Quick Add
        </button>

        {/* Separator */}
        <div className="h-6 w-px bg-outline-variant" />

        {/* Icon buttons */}
        <div className="flex items-center gap-1">
          <NotificationBell />

          {/* Avatar + dropdown */}
          <div className="relative ml-1" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="w-8 h-8 rounded-full bg-secondary-container overflow-hidden border border-outline-variant flex items-center justify-center text-on-secondary-container font-bold text-caption hover:opacity-80 transition-opacity"
              aria-label="Tài khoản"
            >
              {user?.avatar ? (
                <img src={user.avatar} alt={user.userName} className="w-full h-full object-cover" />
              ) : (
                <span>{initials}</span>
              )}
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-surface-container-lowest rounded-lg shadow-float border border-outline-variant overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-surface-container">
                  <p className="font-label-md text-label-md text-on-surface truncate">
                    {user?.userName ?? 'Admin'}
                  </p>
                  <p className="font-caption text-caption text-outline truncate">
                    {user?.email ?? ''}
                  </p>
                </div>
                <div className="py-1">
                  <button
                    disabled
                    className="w-full flex items-center gap-3 px-4 py-2 text-on-surface-variant/40 cursor-not-allowed font-label-md text-label-md"
                  >
                    <span className="material-symbols-outlined text-[18px]">settings</span>
                    Cài đặt tài khoản
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-error hover:bg-error-container transition-colors font-label-md text-label-md"
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
