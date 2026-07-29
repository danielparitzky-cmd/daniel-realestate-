import { useMemo, useRef, useState } from 'react'
import { useCreateNeighborhood, useNeighborhoods } from '../../lib/queries/neighborhoods'
import { PlusIcon, SearchIcon } from '../../components/icons'
import { cn } from '../../lib/cn'

/**
 * בחירת שכונה מתוך הרשימה, עם יצירה תוך כדי הקלדה.
 * neighborhoods היא reference סגור — נבנית מהשימוש, לא מוזנת מראש.
 */
export function NeighborhoodPicker({
  city,
  value,
  onChange,
}: {
  city: string
  value: string | null
  onChange: (id: string | null) => void
}) {
  const { data: neighborhoods } = useNeighborhoods()
  const createNeighborhood = useCreateNeighborhood()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const blurTimer = useRef<number | undefined>(undefined)

  const selected = neighborhoods?.find((n) => n.id === value) ?? null
  const trimmedCity = city.trim()
  const trimmedQuery = query.trim()

  const matches = useMemo(() => {
    if (!neighborhoods) return []
    const q = trimmedQuery.toLowerCase()
    return neighborhoods
      .filter((n) => {
        // כשיש עיר בטופס, מציגים קודם את השכונות שלה
        if (trimmedCity && n.city.trim().toLowerCase() !== trimmedCity.toLowerCase()) return false
        return !q || n.name.toLowerCase().includes(q)
      })
      .slice(0, 8)
  }, [neighborhoods, trimmedQuery, trimmedCity])

  const exactExists = matches.some((n) => n.name.trim().toLowerCase() === trimmedQuery.toLowerCase())
  const canCreate = trimmedQuery.length > 0 && trimmedCity.length > 0 && !exactExists

  async function create() {
    const created = await createNeighborhood.mutateAsync({ city: trimmedCity, name: trimmedQuery })
    onChange(created.id)
    setQuery('')
    setOpen(false)
  }

  if (selected) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-brand-50 px-3.5 py-2.5 ring-1 ring-brand-200">
        <span className="flex-1 truncate text-sm font-semibold text-slate-800">
          {selected.name}
          <span className="font-normal text-slate-500"> · {selected.city}</span>
        </span>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-100"
        >
          החלף
        </button>
      </div>
    )
  }

  return (
    <div
      className="relative"
      onBlur={() => {
        blurTimer.current = window.setTimeout(() => setOpen(false), 120)
      }}
      onFocus={() => {
        window.clearTimeout(blurTimer.current)
        setOpen(true)
      }}
    >
      <SearchIcon className="pointer-events-none absolute inset-y-0 start-3 my-auto size-4.5 text-slate-400" />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={trimmedCity ? `שכונה ב${trimmedCity}…` : 'מלא קודם עיר'}
        disabled={!trimmedCity}
        className="w-full rounded-xl bg-white py-3 pe-3.5 ps-10 text-base text-slate-800 ring-1 ring-brand-200 placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500 focus:outline-none disabled:bg-slate-50 disabled:text-slate-400 sm:py-2.5 sm:text-sm"
      />

      {open && trimmedCity && (matches.length > 0 || canCreate) && (
        <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 shadow-lg ring-1 ring-brand-200">
          {matches.map((n) => (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => {
                  onChange(n.id)
                  setQuery('')
                  setOpen(false)
                }}
                className="flex w-full items-baseline gap-2 px-3.5 py-2 text-start text-sm hover:bg-brand-50"
              >
                <span className="font-semibold text-slate-800">{n.name}</span>
                <span className="text-xs text-slate-500">{n.city}</span>
              </button>
            </li>
          ))}

          {canCreate && (
            <li className={cn(matches.length > 0 && 'border-t border-brand-100')}>
              <button
                type="button"
                onClick={() => void create()}
                disabled={createNeighborhood.isPending}
                className="flex w-full items-center gap-2 px-3.5 py-2 text-start text-sm font-semibold text-brand-700 hover:bg-brand-50 disabled:opacity-50"
              >
                <PlusIcon className="size-4" />
                צור שכונה "{trimmedQuery}" ב{trimmedCity}
              </button>
            </li>
          )}
        </ul>
      )}

      {createNeighborhood.error && (
        <p className="mt-1 text-xs font-medium text-red-600">
          לא הצלחתי ליצור שכונה: {createNeighborhood.error.message}
        </p>
      )}
    </div>
  )
}
