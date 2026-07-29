import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { cn } from '../lib/cn'
import { LogoutIcon } from '../components/icons'
import { TABS } from './tabs'

function Logo() {
  return (
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
  )
}

export default function AppShell() {
  const { signOut } = useAuth()
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  return (
    <div className="min-h-dvh bg-brand-100">
      {/* pt של safe-area: כשמותקן במסך הבית התוכן נמתח מתחת לשעון ולמגרעת,
          ובלי זה ההדר יושב מתחת לפס הסטטוס. בדפדפן רגיל הערך 0 ואין שינוי. */}
      <header className="sticky top-0 z-20 border-b border-brand-200/70 bg-white/85 pt-[env(safe-area-inset-top)] backdrop-blur">
        <div className="mx-auto flex h-14 max-w-4xl items-center gap-3 px-4">
          <Link
            to="/"
            className="-ms-2 flex h-11 items-center gap-2 px-2 font-bold text-slate-800 sm:ms-0 sm:h-auto sm:px-0"
          >
            <Logo />
            <span className="hidden sm:inline">ניהול נדל"ן</span>
          </Link>

          {/* ארבעת הטאבים לא נכנסים ברוחב טלפון — במובייל הם בסרגל התחתון */}
          {!isHome && (
            <nav className="hidden flex-1 items-center gap-1 sm:flex">
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
            className="ms-auto flex size-11 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-brand-100 hover:text-brand-700 sm:size-9"
          >
            <LogoutIcon className="size-5" />
            <span className="sr-only">התנתקות</span>
          </button>
        </div>
      </header>

      {/* pb מפנה מקום לסרגל התחתון כדי שהתוכן האחרון לא יסתתר מאחוריו */}
      <main className="mx-auto max-w-4xl px-4 py-6 pb-28 sm:pb-6">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-brand-200/70 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden">
        <ul className="mx-auto flex max-w-4xl">
          {TABS.map(({ to, label, Icon }) => (
            <li key={to} className="flex-1">
              <NavLink
                to={to}
                className={({ isActive }) =>
                  cn(
                    'flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors',
                    isActive ? 'text-brand-600' : 'text-slate-400',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cn(
                        'flex size-9 items-center justify-center rounded-xl transition-colors',
                        isActive && 'bg-brand-100',
                      )}
                    >
                      <Icon className="size-5.5" />
                    </span>
                    {label}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
