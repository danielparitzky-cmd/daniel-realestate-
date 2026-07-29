import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

/**
 * כפתור אייקון עם שטח מגע של 44px במובייל.
 * האייקון עצמו נשאר קטן — רק אזור הלחיצה גדל, כדי שלא יפספסו אותו באצבע.
 */
export function IconButton({
  label,
  tone = 'neutral',
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string
  tone?: 'neutral' | 'danger'
  children: ReactNode
}) {
  return (
    <button
      {...rest}
      type="button"
      title={label}
      className={cn(
        'inline-flex size-11 shrink-0 items-center justify-center rounded-lg transition-colors sm:size-9',
        tone === 'danger'
          ? 'text-slate-400 hover:bg-white hover:text-red-600'
          : 'text-slate-500 hover:bg-brand-50 hover:text-brand-700',
        className,
      )}
    >
      {children}
      <span className="sr-only">{label}</span>
    </button>
  )
}
