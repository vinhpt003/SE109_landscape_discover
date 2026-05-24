import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

// ── Types ──────────────────────────────────────────────────────────────────
interface TopNavBarProps {
  /** region đang active (để highlight nav item) */
  activeRegion?: 'north' | 'central' | 'south'
}

// ── Component ──────────────────────────────────────────────────────────────
export default function TopNavBar({ activeRegion }: TopNavBarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')

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
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary text-[18px]">landscape</span>
            </div>
            <span className="font-headline-md text-headline-md font-bold text-primary hidden sm:inline">
              WanderShare
            </span>
          </Link>

          {/* Search bar — ẩn trên mobile */}
          <div className="hidden md:flex items-center bg-surface-bright border border-outline-variant rounded-full px-4 py-2 focus-within:border-secondary transition-colors w-64 lg:w-96">
            <span className="material-symbols-outlined text-on-surface-variant mr-2 text-[20px]">search</span>
            <input
              type="text"
              placeholder="Search landmarks or keywords..."
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              className="bg-transparent border-none focus:ring-0 outline-none w-full text-body-md font-body-md text-on-surface placeholder:text-on-surface-variant/60"
            />
          </div>
        </div>

        {/* ── Region nav — desktop ───────────────────────────────── */}
        <nav className="hidden md:flex items-center gap-1 font-label-md text-label-md">
          <NavLink to="/?region=north" className={navLinkClass('north')}>North</NavLink>
          <NavLink to="/?region=central" className={navLinkClass('central')}>Central</NavLink>
          <NavLink to="/?region=south" className={navLinkClass('south')}>South</NavLink>
        </nav>

        {/* ── Actions ───────────────────────────────────────────── */}
        <div className="flex items-center gap-base font-label-md text-label-md">
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
          {/* Search mobile */}
          <div className="flex items-center bg-surface-container-low border border-outline-variant rounded-full px-4 py-2">
            <span className="material-symbols-outlined text-on-surface-variant mr-2 text-[20px]">search</span>
            <input
              type="text"
              placeholder="Search..."
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              className="bg-transparent border-none focus:ring-0 outline-none w-full text-body-md font-body-md"
            />
          </div>
          {/* Region links */}
          <div className="flex gap-2">
            {['North', 'Central', 'South'].map(r => (
              <NavLink
                key={r}
                to={`/?region=${r.toLowerCase()}`}
                onClick={() => setMenuOpen(false)}
                className="flex-1 text-center py-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors font-label-md text-label-md"
              >
                {r}
              </NavLink>
            ))}
          </div>
          {/* Auth buttons */}
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
        </div>
      )}
    </header>
  )
}
