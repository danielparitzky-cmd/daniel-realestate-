import { SearchIcon } from './icons'
import { cn } from '../lib/cn'

/**
 * חיפוש type-ahead. מסנן על דאטה שכבר נטען — בלי קריאת שרת לכל תו,
 * ולכן התוצאות מתעדכנות תוך כדי הקלדה בלי שום השהיה.
 */
export function SearchBox({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string
  onChange: (next: string) => void
  placeholder?: string
  className?: string
}) {
  return (
    <div className={cn('relative', className)}>
      <SearchIcon className="pointer-events-none absolute inset-y-0 start-3 my-auto size-4.5 text-slate-400" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl bg-white py-2.5 pe-3.5 ps-10 text-sm text-slate-800 ring-1 ring-brand-200 placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500 focus:outline-none"
      />
    </div>
  )
}
