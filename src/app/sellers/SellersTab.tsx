import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCreateSeller, useSellers } from '../../lib/queries/sellers'
import { useProperties } from '../../lib/queries/properties'
import { SearchBox } from '../../components/SearchBox'
import { PersonQuickAdd } from '../../components/PersonQuickAdd'
import { EmptyState } from '../../components/ui/Card'
import { QueryState } from '../../components/ui/QueryState'
import { ChevronIcon } from '../../components/icons'

export default function SellersTab() {
  const { data: sellers, isPending, isPaused, error, refetch } = useSellers()
  const { data: properties } = useProperties()
  const createSeller = useCreateSeller()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const propertyCount = useMemo(() => {
    const counts = new Map<string, number>()
    for (const p of properties ?? []) {
      if (p.seller_id) counts.set(p.seller_id, (counts.get(p.seller_id) ?? 0) + 1)
    }
    return counts
  }, [properties])

  const filtered = useMemo(() => {
    if (!sellers) return []
    const q = search.trim().toLowerCase()
    if (!q) return sellers
    return sellers.filter((s) =>
      [s.full_name, s.phone].filter(Boolean).some((f) => f!.toLowerCase().includes(q)),
    )
  }, [sellers, search])

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-slate-800">מוכרים</h1>
        {sellers && sellers.length > 0 && (
          <span className="rounded-full bg-brand-200/50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
            {filtered.length}
            {filtered.length !== sellers.length && ` מתוך ${sellers.length}`}
          </span>
        )}
        <div className="ms-auto">
          <PersonQuickAdd
            title="מוכר חדש"
            namePlaceholder="שם המוכר"
            submitLabel="הוסף מוכר"
            submitting={createSeller.isPending}
            error={createSeller.error?.message}
            onSubmit={(values) =>
              createSeller.mutate(values, {
                onSuccess: (created) => void navigate(`/sellers/${created.id}`),
              })
            }
          />
        </div>
      </div>

      <SearchBox
        value={search}
        onChange={setSearch}
        placeholder="חיפוש לפי שם או טלפון…"
        className="mb-5"
      />

      <QueryState
        isPending={isPending}
        isPaused={isPaused}
        error={error}
        hasData={sellers != null}
        onRetry={() => void refetch()}
        loadingLabel="טוען מוכרים…"
      />

      {sellers && sellers.length === 0 && (
        <EmptyState
          title="אין עדיין מוכרים"
          description="הוסף מוכר, ותוכל לשייך לו נכסים — או ליצור נכס חדש ישירות מתוכו."
        />
      )}

      {sellers && sellers.length > 0 && filtered.length === 0 && (
        <EmptyState title="אין מוכר שמתאים לחיפוש" description={`לא נמצאה התאמה ל"${search}".`} />
      )}

      {filtered.length > 0 && (
        <ul className="space-y-2">
          {filtered.map((seller) => {
            const count = propertyCount.get(seller.id) ?? 0
            return (
              <li key={seller.id}>
                <Link
                  to={`/sellers/${seller.id}`}
                  className="group flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-brand-200/60 transition-all hover:-translate-y-0.5 hover:shadow-md hover:ring-brand-300"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-slate-800">{seller.full_name}</p>
                    <p className="ltr-nums mt-0.5 truncate text-sm text-slate-500">
                      {seller.phone || '—'}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {count === 0 ? 'ללא נכסים' : count === 1 ? 'נכס אחד' : `${count} נכסים`}
                    </p>
                  </div>
                  <ChevronIcon className="size-5 shrink-0 text-brand-300 transition-transform group-hover:-translate-x-0.5 group-hover:text-brand-500" />
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
