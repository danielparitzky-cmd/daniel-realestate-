import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { cn } from '../lib/cn'
import { LogoutIcon } from '../components/icons'
import { TABS } from './tabs'

export default function AppShell() {
  const { signOut } = useAuth()
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  return (
    <div className="min-h-dvh bg-brand-100">
      <header className="sticky top-0 z-20 border-b border-brand-200/70 bg-white/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-4xl items-center gap-3 px-4">
          <Link to="/" className="flex items-center gap-2 font-bold text-slate-800">
            <span className="flex size-8 items-center justify-center rounded-xl bg-brand-500 text-white">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.9}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4.5"
                aria-hidden
              >
                <path d="M3 10.5 12 3l9 7.5" />
                <path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" />
              </svg>
            </span>
            <span className="hidden sm:inline">ניהול נדל"ן</span>
          </Link>

          {!isHome && (
            <nav className="flex flex-1 items-center gap-1 overflow-x-auto">
              {TABS.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      'shrink-0 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors',
                      isActive
                        ? 'bg-brand-500 text-white'
                        : 'text-slate-600 hover:bg-brand-100 hover:text-brand-700',
                    )
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>
          )}

          <button
            onClick={() => void signOut()}
            title="התנתקות"
            className="ms-auto flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-brand-100 hover:text-brand-700"
          >
            <LogoutIcon className="size-5" />
            <span className="sr-only">התנתקות</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
