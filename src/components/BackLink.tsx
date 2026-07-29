import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ChevronIcon } from './icons'

/** קישור חזרה בגובה מגע מלא — במובייל זה הכפתור שנלחץ הכי הרבה. */
export function BackLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="-ms-2 inline-flex h-11 items-center gap-1 px-2 text-sm font-semibold text-brand-600 hover:text-brand-700 sm:-ms-1 sm:h-8"
    >
      <ChevronIcon className="size-4 rotate-180" />
      {children}
    </Link>
  )
}
