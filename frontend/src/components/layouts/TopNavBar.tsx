import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import NotificationBell from '../notifications/NotificationBell'

const REGIONS = [
  { slug: 'north', label: 'Bắc' },
  { slug: 'central', label: 'Trung' },
  { slug: 'south', label: 'Nam' },
] as const

export default function TopNavBar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const activeRegion = searchParams.get('region')

  const { isAuthenticated, user, logout } = useAuthStore()

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
    setUserMenuOpen(false)
    setMenuOpen(false)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = searchValue.trim()
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : '/search')
    setMenuOpen(false)
  }

  const navLinkClass = (region: string) =>
    `px-3 py-2 rounded-lg transition-all scale-95 active:scale-90 duration-200 font-label-md text-label-md ` +
    (activeRegion === region
      ? 'text-secondary border-b-2 border-secondary'
      : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low')

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-surface/90 backdrop-blur-nav shadow-ambient">
      <div className="container-page flex items-center justify-between h-20">

        {/* ── Logo + Search ──────────────────────────────────────── */}
        <div className="flex items-center gap-gutter">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary text-[18px]">landscape</span>
            </div>
            <span className="font-headline-md text-headline-md font-bold text-primary hidden sm:inline">
              WanderShare
            </span>
          </Link>

          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex items-center bg-surface-bright border border-outline-variant rounded-full px-4 py-2 focus-within:border-secondary transition-colors w-64 lg:w-96"
          >
            <button type="submit" aria-label="Tìm kiếm" className="flex items-center text-on-surface-variant mr-2 hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </button>
            <input
              type="text"
              placeholder="Tìm kiếm địa danh, từ khóa..."
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              className="bg-transparent border-none focus:ring-0 outline-none w-full text-body-md font-body-md text-on-surface placeholder:text-on-surface-variant/60"
            />
          </form>
        </div>

        {/* ── Region nav — desktop ───────────────────────────────── */}
        <nav className="hidden md:flex items-center gap-1 font-label-md text-label-md">
          {REGIONS.map(({ slug, label }) => (
            <Link
              key={slug}
              to={activeRegion === slug ? '/' : `/?region=${slug}`}
              className={navLinkClass(slug)}
            >
              {label}
            </Link>
          ))}
          {isAuthenticated && (
            <Link
              to="/saved"
              className="px-3 py-2 rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-all"
            >
              Đã lưu
            </Link>
          )}
          {isAuthenticated && user && (user.role === 'Editor' || user.role === 'Admin') && (
            <Link
              to="/my-posts"
              className="px-3 py-2 rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-all"
            >
              Bài viết của tôi
            </Link>
          )}
        </nav>

        {/* ── Actions ───────────────────────────────────────────── */}
        <div className="flex items-center gap-base font-label-md text-label-md">
          {isAuthenticated && <NotificationBell />}
          {isAuthenticated && user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(v => !v)}
                className="flex items-center gap-2 focus-visible:outline-none"
                aria-label="Tài khoản"
              >
                <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-primary-fixed shadow-sm hover:border-primary transition-colors">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.userName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-primary flex items-center justify-center">
                      <span className="text-on-primary text-sm font-bold uppercase">
                        {user.userName[0]}
                      </span>
                    </div>
                  )}
                </div>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-surface-container-lowest rounded-lg shadow-float border border-outline-variant overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-surface-container">
                    <p className="font-label-md text-label-md text-on-surface truncate">{user.userName}</p>
                    <p className="font-caption text-caption text-outline truncate">{user.email}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-colors font-label-md text-label-md"
                    >
                      <span className="material-symbols-outlined text-[18px]">account_circle</span>
                      Trang cá nhân
                    </Link>
                    <Link
                      to="/saved"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-colors font-label-md text-label-md"
                    >
                      <span className="material-symbols-outlined text-[18px]">favorite</span>
                      Bài viết đã lưu
                    </Link>
                    {(user.role === 'Editor' || user.role === 'Admin') && (
                      <Link
                        to="/my-posts"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-colors font-label-md text-label-md"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit_note</span>
                        Bài viết của tôi
                      </Link>
                    )}
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
          ) : (
            <>
              <Link
                to="/login"
                className="hidden md:inline text-on-surface-variant hover:text-primary transition-colors px-4 py-2 rounded-lg"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="hidden md:inline bg-primary text-on-primary px-5 py-2 rounded-lg hover:bg-primary-container transition-colors shadow-float"
              >
                Register
              </Link>
            </>
          )}

          {/* Hamburger — mobile */}
          <button
            className="md:hidden text-on-surface-variant p-2"
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined">
              {menuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* ── Mobile dropdown ───────────────────────────────────────── */}
      {menuOpen && (
        <div className="md:hidden bg-surface-container-lowest border-t border-outline-variant px-4 py-4 flex flex-col gap-3">
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center bg-surface-container-low border border-outline-variant rounded-full px-4 py-2"
          >
            <button type="submit" aria-label="Tìm kiếm" className="flex items-center text-on-surface-variant mr-2 hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </button>
            <input
              type="text"
              placeholder="Tìm kiếm địa danh..."
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              className="bg-transparent border-none focus:ring-0 outline-none w-full text-body-md font-body-md"
            />
          </form>
          <div className="flex gap-2">
            {REGIONS.map(({ slug, label }) => (
              <Link
                key={slug}
                to={activeRegion === slug ? '/' : `/?region=${slug}`}
                onClick={() => setMenuOpen(false)}
                className={[
                  'flex-1 text-center py-2 rounded-lg transition-colors font-label-md text-label-md',
                  activeRegion === slug
                    ? 'text-secondary bg-surface-container'
                    : 'text-on-surface-variant hover:text-primary hover:bg-surface-container',
                ].join(' ')}
              >
                {label}
              </Link>
            ))}
          </div>

          {isAuthenticated && user ? (
            <div className="flex flex-col gap-2 pt-2 border-t border-outline-variant">
              <div className="flex items-center gap-3 px-1">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-primary flex items-center justify-center shrink-0">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.userName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-on-primary text-xs font-bold uppercase">{user.userName[0]}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-label-md text-label-md text-on-surface truncate">{user.userName}</p>
                  <p className="font-caption text-caption text-outline truncate">{user.email}</p>
                </div>
              </div>
              <Link
                to="/profile"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 py-2 px-1 text-on-surface-variant hover:text-primary font-label-md text-label-md"
              >
                <span className="material-symbols-outlined text-[18px]">account_circle</span>
                Trang cá nhân
              </Link>
              <Link
                to="/saved"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 py-2 px-1 text-on-surface-variant hover:text-primary font-label-md text-label-md"
              >
                <span className="material-symbols-outlined text-[18px]">favorite</span>
                Bài viết đã lưu
              </Link>
              {(user.role === 'Editor' || user.role === 'Admin') && (
                <Link
                  to="/my-posts"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 py-2 px-1 text-on-surface-variant hover:text-primary font-label-md text-label-md"
                >
                  <span className="material-symbols-outlined text-[18px]">edit_note</span>
                  Bài viết của tôi
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 py-2 px-1 text-error font-label-md text-label-md text-left"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                Đăng xuất
              </button>
            </div>
          ) : (
            <div className="flex gap-3 pt-2 border-t border-outline-variant">
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="flex-1 text-center py-2 text-primary border border-primary rounded-lg font-label-md text-label-md hover:bg-primary-fixed transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="flex-1 text-center py-2 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary-container transition-colors"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
