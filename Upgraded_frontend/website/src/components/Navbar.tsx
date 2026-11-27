import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { BackendStatus } from './BackendStatus'
import { Menu, X } from './icons'
import { preloadPage, type PageKey } from '../routes/preload'

interface NavItem {
  to: string
  label: string
  preload: PageKey
}

const NAV_ITEMS: NavItem[] = [
  { to: '/analyze', label: 'Analyze', preload: 'analyze' },
  { to: '/classify', label: 'Role check', preload: 'classify' },
  { to: '/advisor', label: 'Advisor', preload: 'advisor' },
  { to: '/about', label: 'About', preload: 'about' },
]

const navClass = ({ isActive }: { isActive: boolean }) =>
  `relative rounded-lg px-2.5 py-2 text-sm transition-colors ${
    isActive ? 'bg-surface-2 text-ink' : 'text-muted hover:text-ink'
  }`

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-canvas/95 backdrop-blur-sm">
      <nav className="shell flex h-16 items-center justify-between gap-4" aria-label="Primary">
        <Link to="/" className="flex min-w-0 items-center gap-2.5" onClick={closeMenu}>
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] bg-cyan font-display text-sm font-bold text-[#061021]"
            aria-hidden="true"
          >
            R
          </span>
          <span className="truncate font-display text-[15px] font-bold tracking-[-0.02em] text-ink">
            Resume Analyser
          </span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={navClass}
                onMouseEnter={() => preloadPage(item.preload)}
                onFocus={() => preloadPage(item.preload)}
                onPointerDown={() => preloadPage(item.preload)}
              >
                {({ isActive }) => (
                  <>
                    {item.label}
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none absolute inset-x-2 -bottom-[3px] h-[2px] origin-center rounded-full bg-cyan transition-transform duration-300 ease-out ${
                        isActive ? 'scale-x-100' : 'scale-x-0'
                      }`}
                    />
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          <BackendStatus />
          <Link
            to="/analyze"
            className="btn btn-primary min-h-[38px] px-3.5 py-1.5 text-sm"
            onMouseEnter={() => preloadPage('analyze')}
            onFocus={() => preloadPage('analyze')}
            onPointerDown={() => preloadPage('analyze')}
          >
            Analyze a resume
          </Link>
        </div>

        <button
          type="button"
          className="btn btn-quiet -mr-2 min-h-0 p-2 md:hidden"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {menuOpen && (
        <div id="mobile-nav" className="border-t border-line bg-canvas md:hidden">
          <div className="shell flex flex-col gap-1 py-4">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={closeMenu}
                onPointerDown={() => preloadPage(item.preload)}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2.5 text-base transition-colors ${
                    isActive ? 'bg-surface-2 text-ink' : 'text-ink-soft hover:bg-surface-2'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <Link
              to="/analyze"
              onClick={closeMenu}
              onPointerDown={() => preloadPage('analyze')}
              className="btn btn-primary mt-3 w-full"
            >
              Analyze a resume
            </Link>
            <div className="mt-3 px-1">
              <BackendStatus />
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
