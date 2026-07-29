import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useBuyers, useCreateBuyer } from '../../lib/queries/buyers'
import { useInterests } from '../../lib/queries/interest'
import { SearchBox } from '../../components/SearchBox'
import { PersonQuickAdd } from '../../components/PersonQuickAdd'
import { BuyerStatusBadge } from '../../components/StatusDot'
import { EmptyState } from '../../components/ui/Card'
import { QueryState } from '../../components/ui/QueryState'
import { ChevronIcon } from '../../components/icons'
import { formatDate } from '../../lib/format'

export default function BuyersTab() {
  const { data: buyers, isPending, isPaused, error, refetch } = useBuyers()
  const { data: interests } = useInterests()
  const createBuyer = useCreateBuyer()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const wishlistCount = useMemo(() => {
    const counts = new Map<string, number>()
    for (const row of interests ?? []) {
      counts.set(row.buyer_id, (counts.get(row.buyer_id) ?? 0) + 1)
    }
    return counts
  }, [interests])

  const filtered = useMemo(() => {
    if (!buyers) return []
    const q = search.trim().toLowerCase()
    if (!q) return buyers
    return buyers.filter((b) =>
      [b.full_name, b.phone].filter(Boolean).some((f) => f!.toLowerCase().includes(q)),
    )
  }, [buyers, search])

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-slate-800">לקוחות</h1>
        {buyers && buyers.length > 0 && (
          <span className="rounded-full bg-brand-200/50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
            {filtered.length}
            {filtered.length !== buyers.length && ` מתוך ${buyers.length}`}
          </span>
        )}
        <div className="ms-auto">
          <PersonQuickAdd
            title="לקוח חדש"
            namePlaceholder="שם הלקוח"
            submitLabel="הוסף לקוח"
            submitting={createBuyer.isPending}
            error={createBuyer.error?.message}
            onSubmit={(values) =>
              createBuyer.mutate(values, {
                onSuccess: (created) => void navigate(`/buyers/${created.id}`),
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
        hasData={buyers != null}
        onRetry={() => void refetch()}
        loadingLabel="טוען לקוחות…"
      />

      {buyers && buyers.length === 0 && (
        <EmptyState
          title="אין עדיין לקוחות"
          description="הוסף לקוח, ותוכל לרשום לו עדכונים, לשייך נכסים ולקבוע מתי לחזור אליו."
        />
      )}

      {buyers && buyers.length > 0 && filtered.length === 0 && (
        <EmptyState title="אין לקוח שמתאים לחיפוש" description={`לא נמצאה התאמה ל"${search}".`} />
      )}

      {filtered.length > 0 && (
        <ul className="space-y-2">
          {filtered.map((buyer) => {
            const count = wishlistCount.get(buyer.id) ?? 0
            return (
              <li key={buyer.id}>
                <Link
                  to={`/buyers/${buyer.id}`}
                  className="group flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-brand-200/60 transition-all hover:-translate-y-0.5 hover:shadow-md hover:ring-brand-300"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-slate-800">{buyer.full_name}</p>
                    <p className="ltr-nums mt-0.5 truncate text-sm text-slate-500">
                      {buyer.phone || '—'}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <BuyerStatusBadge status={buyer.status} />
                      {count > 0 && (
                        <span className="text-xs text-slate-500">{count} נכסים בווישליסט</span>
                      )}
                      {buyer.callback_date && (
                        <span
                          className={`text-xs font-semibold ${
                            buyer.callback_done ? 'text-green-700' : 'text-red-600'
                          }`}
                        >
                          {buyer.callback_done ? 'חזרת ' : 'לחזור '}
                          {formatDate(buyer.callback_date)}
                        </span>
                      )}
                    </div>
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
