import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// ── Component ──────────────────────────────────────────────────────────────
export default function AdminTopBar() {
  const navigate = useNavigate()
  const [hasNotification] = useState(true) // demo: có notification chưa đọc

  return (
    <header className="bg-surface-bright fixed top-0 right-0 w-[calc(100%-16rem)] h-16 flex items-center justify-between px-8 z-10 shadow-ambient border-b border-outline-variant/40 transition-all duration-200">

      {/* Search */}
      <div className="flex items-center bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 w-80 focus-within:border-secondary transition-colors">
        <span className="material-symbols-outlined text-outline text-[20px]">search</span>
        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent border-none focus:ring-0 w-full font-body-md text-body-md text-on-surface placeholder:text-outline-variant ml-2 outline-none"
        />
      </div>

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
          {/* Notifications */}
          <button className="relative text-on-surface-variant hover:bg-surface-container-low p-2 rounded-full transition-colors">
            <span className="material-symbols-outlined">notifications</span>
            {hasNotification && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full" />
            )}
          </button>

          {/* Help */}
          <button className="text-on-surface-variant hover:bg-surface-container-low p-2 rounded-full transition-colors">
            <span className="material-symbols-outlined">help</span>
          </button>

          {/* Avatar */}
          <button className="w-8 h-8 rounded-full bg-secondary-container ml-1 overflow-hidden border border-outline-variant flex items-center justify-center text-on-secondary-container font-bold text-caption">
            AD
          </button>
        </div>
      </div>
    </header>
  )
}
