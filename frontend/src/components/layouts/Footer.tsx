import { Link } from 'react-router-dom'

// ── Component ──────────────────────────────────────────────────────────────
export default function Footer() {
  const links = [
    { label: 'Discover',        to: '/',          primary: true },
    { label: 'About Us',        to: '/about',     primary: false },
    { label: 'Privacy Policy',  to: '/privacy',   primary: false },
    { label: 'Terms of Service',to: '/terms',     primary: false },
    { label: 'Contact',         to: '/contact',   primary: false },
  ]

  return (
    <footer className="w-full bg-surface-container mt-section-gap">
      <div className="container-page py-16 flex flex-col md:flex-row justify-between items-center gap-base">

        {/* Brand */}
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary text-[18px]">landscape</span>
            </div>
            <span className="font-headline-md text-headline-md font-bold text-primary">
              WanderShare
            </span>
          </div>
          <p className="text-caption font-caption text-on-surface-variant text-center md:text-left">
            © 2024 WanderShare Travel Community. All rights reserved.
          </p>
        </div>

        {/* Nav links */}
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {links.map(({ label, to, primary }) => (
            <Link
              key={label}
              to={to}
              className={
                `font-label-md text-label-md opacity-80 hover:opacity-100 transition-opacity hover:text-secondary transition-colors ` +
                (primary ? 'text-primary font-bold' : 'text-on-surface-variant')
              }
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}
