import { useMemo, useState } from 'react'
import { Button } from './ui/Button'
import { PlusIcon, SearchIcon } from './icons'
import type { ReactNode } from 'react'

export type PickerItem = {
  id: string
  primary: string
  secondary?: string | null
  trailing?: ReactNode
}

/**
 * בחירה מתוך רשימה סגורה — גוללים או מקלידים שם, ולוחצים.
 * אין כאן יצירה של ישות חדשה בטעות: רק מה שכבר קיים ברשימה ניתן לבחירה.
 */
export function EntityPicker({
  triggerLabel,
  searchPlaceholder,
  items,
  emptyText,
  onSelect,
  pending,
}: {
  triggerLabel: string
  searchPlaceholder: string
  items: PickerItem[]
  emptyText: string
  onSelect: (id: string) => void
  pending?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((i) =>
      [i.primary, i.secondary].filter(Boolean).some((f) => f!.toLowerCase().includes(q)),
    )
  }, [items, query])

  if (!open) {
    return (
      <Button size="sm" variant="secondary" onClick={() => setOpen(true)} disabled={pending}>
        <PlusIcon className="size-4" />
        {triggerLabel}
      </Button>
    )
  }

  return (
    <div className="rounded-xl bg-brand-50 p-3 ring-1 ring-brand-200">
      <div className="relative mb-2">
        <SearchIcon className="pointer-events-none absolute inset-y-0 start-3 my-auto size-4.5 text-slate-400" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full rounded-lg bg-white py-2 pe-3 ps-10 text-sm text-slate-800 ring-1 ring-brand-200 placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500 focus:outline-none"
        />
      </div>

      {items.length === 0 ? (
        <p className="px-1 py-3 text-center text-sm text-slate-500">{emptyText}</p>
      ) : filtered.length === 0 ? (
        <p className="px-1 py-3 text-center text-sm text-slate-500">אין התאמה ל"{query}"</p>
      ) : (
        <ul className="max-h-64 overflow-auto rounded-lg bg-white ring-1 ring-brand-200">
          {filtered.map((item) => (
            <li key={item.id} className="border-b border-brand-100 last:border-0">
              <button
                type="button"
                onClick={() => {
                  onSelect(item.id)
                  setQuery('')
                  setOpen(false)
                }}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-start text-sm hover:bg-brand-50"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-slate-800">{item.primary}</span>
                  {item.secondary && (
                    <span className="block truncate text-xs text-slate-500">{item.secondary}</span>
                  )}
                </span>
                {item.trailing}
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={() => {
          setOpen(false)
          setQuery('')
        }}
        className="mt-2 w-full rounded-lg py-1.5 text-xs font-semibold text-slate-500 hover:bg-white"
      >
        סגור
      </button>
    </div>
  )
}
