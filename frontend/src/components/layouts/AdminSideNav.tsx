import { NavLink, useNavigate } from 'react-router-dom'

// ── Nav items config ───────────────────────────────────────────────────────
const navItems = [
  { label: 'Dashboard',          to: '/admin',            icon: 'dashboard' },
  { label: 'Manage Landmarks',   to: '/admin/landmarks',  icon: 'landscape' },
  { label: 'Content Verification', to: '/admin/verification', icon: 'verified_user' },
  { label: 'User Management',    to: '/admin/users',      icon: 'group' },
  { label: 'Site Settings',      to: '/admin/settings',   icon: 'settings' },
]

// ── Component ──────────────────────────────────────────────────────────────
export default function AdminSideNav() {
  const navigate = useNavigate()

  return (
    <aside className="bg-surface-container h-screen w-64 fixed left-0 top-0 flex flex-col py-8 px-4 z-20 shadow-sm">

      {/* Brand */}
      <div className="flex items-center gap-3 mb-10 px-4">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary font-headline-md">
          TA
        </div>
        <div>
          <h1 className="text-headline-md font-headline-md text-primary">TravelAdmin</h1>
          <p className="font-caption text-caption text-on-surface-variant">Platform Management</p>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 flex flex-col gap-1">
        {navItems.map(({ label, to, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/admin'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors active:scale-95 transition-transform font-label-md text-label-md ` +
              (isActive
                ? 'bg-surface-container-highest text-primary font-bold border-r-4 border-primary'
                : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-highest')
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {icon}
                </span>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* CTA bottom */}
      <div className="mt-auto pt-6 border-t border-surface-container-high">
        <button
          onClick={() => navigate('/admin/landmarks/new')}
          className="w-full bg-primary text-on-primary py-3 px-4 rounded-lg font-label-md text-label-md flex items-center justify-center gap-2 hover:bg-primary-container transition-colors shadow-float"
        >
          <span className="material-symbols-outlined">add_circle</span>
          Add Landmark
        </button>
      </div>
    </aside>
  )
}
